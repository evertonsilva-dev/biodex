import pg from 'pg';
import type { ApiEnvironment } from '../config/env.js';

export function createPool(config: Pick<
  ApiEnvironment,
  | 'databasePoolMax'
  | 'databaseUrl'
  | 'databaseHost'
  | 'databasePort'
  | 'databaseName'
  | 'databaseUsername'
  | 'databasePassword'
  | 'databaseSsl'
>) {
  const options = {
    max: config.databasePoolMax,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  };

  if (config.databaseUrl) {
    return new pg.Pool({ ...options, connectionString: config.databaseUrl });
  }

  return new pg.Pool({
    ...options,
    host: config.databaseHost,
    port: config.databasePort,
    database: config.databaseName,
    user: config.databaseUsername,
    password: config.databasePassword,
    ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
  });
}
