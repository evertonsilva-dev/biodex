import { createApp } from './app.js';
import { env } from './config/env.js';
import { createDatabaseClient } from './database/query.js';
import { createPool } from './database/pool.js';
import { isCatalogReady } from './database/catalog-readiness.js';
import createCatalogController from './catalog/controllers/catalog.js';

const pool = createPool(env);
const runtime = {
  db: createDatabaseClient(pool),
  log: {
    error: (message: string) => console.error(message),
    warn: (message: string) => console.warn(message),
  },
};

const app = createApp({
  catalog: createCatalogController({ runtime }),
  healthCheck: () => isCatalogReady(runtime.db),
  config: env,
});
const server = app.listen(env.port, env.host, () => {
  console.log(`Biodex API listening on http://${env.host}:${env.port}`);
});

let shuttingDown = false;
function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down Biodex API.`);
  server.close(async (error?: Error) => {
    if (error) {
      console.error(`Could not close the HTTP server: ${error.message}`);
      process.exitCode = 1;
    }
    try {
      await pool.end();
    } catch (poolError) {
      console.error(`Could not close the PostgreSQL pool: ${String(poolError)}`);
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
