import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRoutes from './server/routes/api';
import { initPostgres, checkDatabaseHealth } from './server/db/postgres';
import { runMigrationsAndSeed } from './server/db/migrations/migrate';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Render & Reverse Proxy compatibility
  app.set('trust proxy', 1);

  // Initialize PostgreSQL & run migrations/seeding
  try {
    const dbInit = await initPostgres();
    if (dbInit.connected) {
      await runMigrationsAndSeed();
    } else {
      console.warn('[Prime RP Server] Warning: PostgreSQL not connected yet:', dbInit.error);
    }
  } catch (err: any) {
    console.error('[Prime RP Server] Error initializing PostgreSQL:', err.message);
  }

  // Basic Middlewares
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(cookieParser());

  // Real Database & Application Health Check
  app.get('/api/health', async (req, res) => {
    const dbHealth = await checkDatabaseHealth();
    const isHealthy = dbHealth.connected;
    return res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'degraded',
      database: dbHealth.connected ? 'connected' : 'disconnected',
      latencyMs: dbHealth.latencyMs,
      error: dbHealth.error,
      timestamp: new Date().toISOString(),
      platform: 'Prime RP'
    });
  });

  // Mount API routes FIRST
  app.use('/api', apiRoutes);

  // Vite middleware for development vs Static file server for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Prime RP Server] Running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Prime RP Server] Fatal startup error:', err);
  process.exit(1);
});
