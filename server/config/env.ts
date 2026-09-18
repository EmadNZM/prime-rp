import dotenv from 'dotenv';
dotenv.config();

// Environment Configuration & Strict Validation
// Validates all required server-side environment variables without exposing secrets.

export interface EnvironmentStatus {
  isValid: boolean;
  missingVariables: string[];
  database: 'configured' | 'missing';
  discord: 'configured' | 'missing';
  fivem: 'configured' | 'missing';
}

export const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'DISCORD_REDIRECT_URI',
  'DISCORD_GUILD_ID',
  'DISCORD_BOT_TOKEN',
  'FIVEM_SERVER_IP',
  'FIVEM_SERVER_PORT'
] as const;

export function getMissingEnvironmentVariables(): string[] {
  const missing: string[] = [];
  for (const key of REQUIRED_ENV_VARS) {
    const val = process.env[key];
    if (!val || val.trim() === '') {
      missing.push(key);
    }
  }
  return missing;
}

export function validateEnvironment(): EnvironmentStatus {
  const missing = getMissingEnvironmentVariables();

  const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');
  const hasDiscord = Boolean(
    process.env.DISCORD_CLIENT_ID &&
    process.env.DISCORD_CLIENT_SECRET &&
    process.env.DISCORD_REDIRECT_URI &&
    process.env.DISCORD_GUILD_ID &&
    process.env.DISCORD_BOT_TOKEN
  );
  const hasFiveM = Boolean(
    process.env.FIVEM_SERVER_IP &&
    process.env.FIVEM_SERVER_PORT
  );

  return {
    isValid: missing.length === 0,
    missingVariables: missing,
    database: hasDb ? 'configured' : 'missing',
    discord: hasDiscord ? 'configured' : 'missing',
    fivem: hasFiveM ? 'configured' : 'missing'
  };
}

export function checkEnvironmentOrWarn(): void {
  const missing = getMissingEnvironmentVariables();
  if (missing.length > 0) {
    console.warn('====================================================');
    console.warn('[Environment Warning] Missing required environment variables:');
    missing.forEach((v) => console.warn(`  - ${v}`));
    console.warn('Please provide them in Google AI Studio or .env configuration.');
    console.warn('====================================================');
  } else {
    console.log('[Environment] All 8 required environment variables detected and validated.');
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
  get FIVEM_SERVER_IP(): string {
    return (process.env.FIVEM_SERVER_IP || '').trim();
  },
  get FIVEM_SERVER_PORT(): number {
    const port = Number(process.env.FIVEM_SERVER_PORT);
    return !isNaN(port) && port > 0 ? port : 0;
  }
};
