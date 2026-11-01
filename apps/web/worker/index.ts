import { httpServerHandler } from 'cloudflare:node';
import { env } from 'cloudflare:workers';
import pg, { type QueryResultRow } from 'pg';
import createCatalogController from '../../api/src/catalog/controllers/catalog.js';
import { isCatalogReady } from '../../api/src/database/catalog-readiness.js';
import { createApp } from '../../api/src/app.js';
import type { CatalogDatabase } from '../../api/src/http/catalog.types.js';

const database: CatalogDatabase = {
  async query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    bindings: unknown[] = [],
  ) {
    const client = new pg.Client({
      connectionString: env.HYPERDRIVE.connectionString,
    });

    await client.connect();
    try {
      return await client.query<Row>(sql, bindings);
    } finally {
      await client.end();
    }
  },
};

const runtime = {
  db: database,
  log: {
    error: (message: string) => console.error(message),
    warn: (message: string) => console.warn(message),
  },
};

const corsOrigins = (env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = createApp({
  catalog: createCatalogController({ runtime }),
  healthCheck: () => isCatalogReady(database),
  config: { corsOrigins },
});

app.listen(3000);

export default httpServerHandler({ port: 3000 });
