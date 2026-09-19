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

  // Basic Middlewares with hardened payload limits (mitigate DoS)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // 1. Liveness Probe: Tests if the process is responsive
  app.get('/api/health/live', (req, res) => {
    return res.status(200).json({
      status: 'live',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // 2. Readiness Probe: Tests if dependencies & configurations are ready
  // In production: FAIL-CLOSED (503) if database is disconnected or critical security env vars are missing
  app.get('/api/health/ready', async (req, res) => {
    const dbHealth = await checkDatabaseHealth();
    const envStatus = validateEnvironment();
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
      const isReady = dbHealth.connected && envStatus.isProductionReady;
      if (!isReady) {
        return res.status(503).json({
          status: 'not_ready',
          ready: false,
          environment: 'production',
          database: dbHealth.connected ? 'connected' : 'unavailable',
          configuration: envStatus.isProductionReady ? 'ready' : 'incomplete_critical_vars',
          missingCritical: envStatus.missingCritical
        });
      }

      return res.status(200).json({
        status: 'ready',
        ready: true,
        environment: 'production',
        database: 'connected',
        configuration: 'ready'
      });
    }

    // Development / preview environment: allows fallback in dev mode
    return res.status(200).json({
      status: 'ready',
      ready: true,
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth.connected ? 'connected' : 'fallback_store',
      configuration: envStatus.isProductionReady ? 'ready' : 'development_mode',
      discordOAuth: envStatus.critical.discordOAuth,
      ownerConfigured: envStatus.critical.ownerId === 'configured'
    });
  });

  // 3. Consolidated Health Check Endpoint (safe from secret leaks, fail-closed in production)
  app.get('/api/health', async (req, res) => {
    const dbHealth = await checkDatabaseHealth();
    const envStatus = validateEnvironment();
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd && (!dbHealth.connected || !envStatus.isProductionReady)) {
      return res.status(503).json({
        status: 'unhealthy',
        database: dbHealth.connected ? 'connected' : 'disconnected',
        isProductionReady: false
      });
    }

    return res.status(200).json({
      status: 'ok',
      database: dbHealth.connected ? 'connected' : 'fallback_store',
      isProductionReady: envStatus.isProductionReady,
      environment: isProd ? 'production' : (process.env.NODE_ENV || 'development')
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
