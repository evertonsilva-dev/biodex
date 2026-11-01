import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { QueryResultRow } from 'pg';
import createCatalogController from './controllers/catalog.js';
import { HttpError } from '../http/errors.js';
import type {
  CatalogDatabase,
  CatalogRequestContext,
  CatalogRuntime,
} from '../http/catalog.types.js';

class CapturingDatabase implements CatalogDatabase {
  readonly queries: Array<{ sql: string; bindings: unknown[] }> = [];

  constructor(private readonly ready: boolean) {}

  async query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    bindings: unknown[] = [],
  ): Promise<{ rows: Row[] }> {
    this.queries.push({ sql, bindings });
    const rows: QueryResultRow[] = sql.includes('unnest(')
      ? [{ ready: this.ready }]
      : sql.includes('count(*)::text AS total')
        ? [{ total: '0' }]
        : [];
    return { rows: rows as Row[] };
  }
}

function createContext(query: Record<string, unknown>): CatalogRequestContext {
  return {
    query,
    params: {},
    body: undefined,
    throw(status, message): never {
      throw new HttpError(status, message);
    },
  };
}

function createRuntime(database: CatalogDatabase): CatalogRuntime {
  return {
    db: database,
    log: {
      error: () => undefined,
      warn: () => undefined,
    },
  };
}

test('kingdom facets only include accepted species in the active catalog', async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({ runtime: createRuntime(database) });

  await controller.facets(createContext({ field: 'kingdom' }));

  assert.match(database.queries[1].sql, /t\.is_catalog_species = true/);
});

test('taxonomy facets use the same catalog-species restriction as the list', async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({ runtime: createRuntime(database) });

  await controller.facets(createContext({ field: 'phylum', kingdom: 'animalia' }));

  assert.match(database.queries[1].sql, /t\.is_catalog_species = true/);
});

test('species searches use explicit PostgreSQL placeholders and ordered bindings', async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({ runtime: createRuntime(database) });

  await controller.species(createContext({
    page: '2',
    pageSize: '24',
    kingdom: 'animalia',
    search: 'Panthera leo',
  }));

  const listQuery = database.queries[2];
  assert.match(listQuery.sql, /k\.slug = \$1/);
  assert.match(listQuery.sql, /LIMIT \$7 OFFSET \$8/);
  assert.deepEqual(listQuery.bindings, [
    'animalia',
    '%Panthera leo%',
    '%Panthera leo%',
    '%Panthera leo%',
    '%Panthera leo%',
    '%Panthera leo%',
    24,
    24,
  ]);
});

test('catalog routes report incomplete schema as unavailable', async () => {
  const database = new CapturingDatabase(false);
  const controller = createCatalogController({ runtime: createRuntime(database) });

  await assert.rejects(
    controller.kingdoms(createContext({})),
    (error: unknown) => error instanceof HttpError && error.status === 503,
  );
});
