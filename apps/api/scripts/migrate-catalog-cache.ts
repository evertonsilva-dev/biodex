import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';
import { CATALOG_CACHE_SCHEMA_SQL } from '../src/database/catalog-cache-schema.js';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(scriptDirectory, '..', '.env') });

function getConnectionOptions(): pg.PoolConfig {
  if (process.env.DATABASE_CLIENT !== 'postgres') {
    throw new Error('Set DATABASE_CLIENT=postgres in apps/api/.env.');
  }

  const direct = process.env.DATABASE_URL_UNPOOLED;
  const configuredUrl = process.env.DATABASE_URL;
  if (direct) {
    if (!configuredUrl) {
      throw new Error('DATABASE_URL must also be set to validate the Neon target.');
    }
    const directUrl = new URL(direct);
    const configured = new URL(configuredUrl);
    const normalizedConfiguredHost = configured.hostname.replace(/-pooler(?=\.|$)/, '');
    if (
      !directUrl.hostname.endsWith('.neon.tech')
      || directUrl.hostname.includes('-pooler')
      || normalizedConfiguredHost !== directUrl.hostname
      || configured.pathname !== directUrl.pathname
      || configured.username !== directUrl.username
    ) {
      throw new Error('DATABASE_URL_UNPOOLED and DATABASE_URL must target the same Neon database.');
    }
    directUrl.searchParams.delete('sslmode');
    return {
      connectionString: directUrl.toString(),
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 15000,
    };
  }

  if (configuredUrl) {
    const configured = new URL(configuredUrl);
    if (configured.hostname.endsWith('.neon.tech')) {
      throw new Error('Use DATABASE_URL_UNPOOLED for migrations against Neon.');
    }
    return { connectionString: configuredUrl, max: 1, connectionTimeoutMillis: 15000 };
  }

  return {
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: Number(process.env.DATABASE_PORT || 5432),
    database: process.env.DATABASE_NAME || 'biodex',
    user: process.env.DATABASE_USERNAME || 'biodex',
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    max: 1,
    connectionTimeoutMillis: 15000,
  };
}

async function main(): Promise<void> {
  const pool = new pg.Pool(getConnectionOptions());
  try {
    const client = await pool.connect();
    let transactionOpen = false;
    try {
      await client.query('BEGIN');
      transactionOpen = true;
      await client.query(CATALOG_CACHE_SCHEMA_SQL);
      await client.query('COMMIT');
      transactionOpen = false;
      console.log('Catalogue cache schema is up to date.');
    } catch (error) {
      if (transactionOpen) {
        await client.query('ROLLBACK');
      }
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(`Catalogue cache migration failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
