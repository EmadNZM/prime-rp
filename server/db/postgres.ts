import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;
let isConnected = false;
let lastError: string | null = null;

export function getPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL || '';
  if (!connectionString) {
    return {
      connectionString: '',
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 1000
    };
  }

  // Parse connection string to cleanly handle SSL requirements (e.g. Aiven / Render)
  try {
    const url = new URL(connectionString);
    // Delete sslmode from query string so pg does not treat it with verify-full
    url.searchParams.delete('sslmode');
    
    return {
      connectionString: url.toString(),
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    };
  } catch (err) {
    return {
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    };
  }
}

export function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!pool) {
    const config = getPoolConfig();
    pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('[PostgreSQL] Unexpected client error on idle client:', err.message);
      isConnected = false;
      lastError = err.message;
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  if (!process.env.DATABASE_URL) {
    return {
      rows: [],
      rowCount: 0,
      command: '',
      oid: 0,
      fields: []
    } as any;
  }
  try {
    const p = getPool();
    if (!p) {
      return {
        rows: [],
        rowCount: 0,
        command: '',
        oid: 0,
        fields: []
      } as any;
    }
    return await p.query<T>(text, params);
  } catch (err: any) {
    console.warn('[PostgreSQL] Query failed, returning empty result:', err.message);
    isConnected = false;
    lastError = err.message;
    return {
      rows: [],
      rowCount: 0,
      command: '',
      oid: 0,
      fields: []
    } as any;
  }
}

export async function initPostgres(): Promise<{ connected: boolean; error?: string }> {
  try {
    if (!process.env.DATABASE_URL) {
      const msg = 'DATABASE_URL is not set in environment';
      console.warn(`[PostgreSQL] ${msg}`);
      isConnected = false;
      lastError = msg;
      return { connected: false, error: msg };
    }

    const p = getPool();
    const result = await p.query('SELECT NOW() AS current_time');
    isConnected = true;
    lastError = null;
    console.log(`[PostgreSQL] Connected successfully to database at ${result.rows[0].current_time}`);
    return { connected: true };
  } catch (err: any) {
    isConnected = false;
    lastError = err.message;
    console.error('[PostgreSQL] Database connection failed:', err.message);
    return { connected: false, error: err.message };
  }
}

export function isPostgresConnected(): boolean {
  return isConnected;
}

export function getPostgresLastError(): string | null {
  return lastError;
}

export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  if (!process.env.DATABASE_URL) {
    return { connected: false, error: 'DATABASE_URL not configured' };
  }

  const start = Date.now();
  try {
    await query('SELECT 1');
    const latencyMs = Date.now() - start;
    isConnected = true;
    lastError = null;
    return { connected: true, latencyMs };
  } catch (err: any) {
    isConnected = false;
    lastError = err.message;
    return { connected: false, error: err.message };
  }
}
