import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRoutes from './server/routes/api';
import { initPostgres, checkDatabaseHealth } from './server/db/postgres';
import { runMigrationsAndSeed } from './server/db/migrations/migrate';
import { checkEnvironmentOrWarn, validateEnvironment } from './server/config/env';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Render & Reverse Proxy compatibility
  app.set('trust proxy', 1);

  // Validate all 8 Environment Variables at startup
  checkEnvironmentOrWarn();

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

  // Health Check Endpoint (always returns 200 so container probes succeed)
  app.get('/api/health', async (req, res) => {
    const dbHealth = await checkDatabaseHealth();
    const envStatus = validateEnvironment();
    const isHealthy = dbHealth.connected;

    return res.status(200).json({
      status: isHealthy ? 'ok' : 'ready',
      database: dbHealth.connected ? 'connected' : 'fallback_store',
      discord: envStatus.discord,
      fivem: envStatus.fivem
    });
  });

  // Mount API routes FIRST
  app.use('/api', apiRoutes);

  // Vite middleware for development vs Static file server for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
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
