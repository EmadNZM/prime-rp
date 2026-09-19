import dotenv from 'dotenv';
dotenv.config();

// Environment Configuration & Strict Security Validation
// Validates all required server-side environment variables without exposing secrets.

export interface EnvironmentStatus {
  isProductionReady: boolean;
  missingCritical: string[];
  missingOptional: string[];
  critical: {
    database: 'configured' | 'missing';
    discordOAuth: 'configured' | 'missing';
    discordBot: 'configured' | 'missing';
    ownerId: 'configured' | 'missing';
    sessionSecret: 'configured' | 'missing';
  };
  optional: {
    fivem: 'configured' | 'missing';
    payments: 'configured' | 'missing';
  };
}

export const CRITICAL_SECURITY_ENV_VARS = [
  'DATABASE_URL',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'DISCORD_REDIRECT_URI',
  'DISCORD_GUILD_ID',
  'DISCORD_BOT_TOKEN',
  'OWNER_DISCORD_ID',
  'SESSION_SECRET'
] as const;

export const OPTIONAL_INTEGRATION_ENV_VARS = [
  'FIVEM_SERVER_IP',
  'FIVEM_SERVER_PORT'
] as const;

export function getMissingCriticalVariables(): string[] {
  const missing: string[] = [];
  for (const key of CRITICAL_SECURITY_ENV_VARS) {
    const val = process.env[key];
    if (!val || val.trim() === '') {
      missing.push(key);
    }
  }
  return missing;
}

export function getMissingOptionalVariables(): string[] {
  const missing: string[] = [];
  for (const key of OPTIONAL_INTEGRATION_ENV_VARS) {
    const val = process.env[key];
    if (!val || val.trim() === '') {
      missing.push(key);
    }
  }
  return missing;
}

export function validateEnvironment(): EnvironmentStatus {
  const missingCritical = getMissingCriticalVariables();
  const missingOptional = getMissingOptionalVariables();

  const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');
  const hasDiscordOAuth = Boolean(
    process.env.DISCORD_CLIENT_ID?.trim() &&
    process.env.DISCORD_CLIENT_SECRET?.trim() &&
    process.env.DISCORD_REDIRECT_URI?.trim()
  );
  const hasDiscordBot = Boolean(
    process.env.DISCORD_GUILD_ID?.trim() &&
    process.env.DISCORD_BOT_TOKEN?.trim()
  );
  const hasOwnerId = Boolean(process.env.OWNER_DISCORD_ID && process.env.OWNER_DISCORD_ID.trim() !== '');
  const hasSessionSecret = Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim() !== '');

  const hasFiveM = Boolean(
    process.env.FIVEM_SERVER_IP?.trim() &&
    process.env.FIVEM_SERVER_PORT?.trim()
  );
  const hasPayments = Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() ||
    process.env.PAYPAL_CLIENT_ID?.trim() ||
    process.env.TEBEX_SECRET_KEY?.trim()
  );

  return {
    isProductionReady: missingCritical.length === 0,
    missingCritical,
    missingOptional,
    critical: {
      database: hasDb ? 'configured' : 'missing',
      discordOAuth: hasDiscordOAuth ? 'configured' : 'missing',
      discordBot: hasDiscordBot ? 'configured' : 'missing',
      ownerId: hasOwnerId ? 'configured' : 'missing',
      sessionSecret: hasSessionSecret ? 'configured' : 'missing'
    },
    optional: {
      fivem: hasFiveM ? 'configured' : 'missing',
      payments: hasPayments ? 'configured' : 'missing'
    }
  };
}

export function checkEnvironmentOrWarn(): void {
  const isProd = process.env.NODE_ENV === 'production';
  const missingCritical = getMissingCriticalVariables();
  const missingOptional = getMissingOptionalVariables();

  if (missingCritical.length > 0) {
    console.warn('====================================================');
    console.warn(`[Security Alert] Missing CRITICAL configuration (${isProd ? 'PRODUCTION BLOCKER' : 'Development'}):`);
    missingCritical.forEach((v) => console.warn(`  - [CRITICAL] ${v}`));
    console.warn('Missing critical configuration will prevent the service from reaching "ready" state in production.');
    console.warn('====================================================');
  } else {
    console.log('[Environment] All critical production security variables configured.');
  }

  if (missingOptional.length > 0) {
    console.log('[Environment] Optional integrations unconfigured (FiveM/Payments will run in disabled/mock status):');
    missingOptional.forEach((v) => console.log(`  - [OPTIONAL] ${v}`));
  }
}

export const env = {
  get DATABASE_URL(): string {
    return process.env.DATABASE_URL || '';
  },
  get DISCORD_CLIENT_ID(): string {
    return process.env.DISCORD_CLIENT_ID || '';
  },
  get DISCORD_CLIENT_SECRET(): string {
    return process.env.DISCORD_CLIENT_SECRET || '';
  },
  get DISCORD_REDIRECT_URI(): string {
    return process.env.DISCORD_REDIRECT_URI || '';
  },
  get DISCORD_GUILD_ID(): string {
    return process.env.DISCORD_GUILD_ID || '';
  },
  get DISCORD_BOT_TOKEN(): string {
    return process.env.DISCORD_BOT_TOKEN || '';
  },
  get OWNER_DISCORD_ID(): string {
    return (process.env.OWNER_DISCORD_ID || '').trim();
  },
  get SESSION_SECRET(): string {
    return (process.env.SESSION_SECRET || '').trim();
  },
  get FIVEM_SERVER_IP(): string {
    return (process.env.FIVEM_SERVER_IP || '').trim();
  },
  get FIVEM_SERVER_PORT(): number {
    const port = Number(process.env.FIVEM_SERVER_PORT);
    return !isNaN(port) && port > 0 ? port : 0;
  }
};
