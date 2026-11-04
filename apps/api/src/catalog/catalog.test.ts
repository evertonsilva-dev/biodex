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

  constructor(
    private readonly ready: boolean,
    private readonly speciesRows: QueryResultRow[] = [],
  ) {}

  async query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    bindings: unknown[] = [],
  ): Promise<{ rows: Row[] }> {
    this.queries.push({ sql, bindings });
    const rows: QueryResultRow[] = sql.includes('unnest(')
      ? [{ ready: this.ready }]
      : sql.includes('count(*)::text AS total')
        ? [{ total: '0' }]
        : sql.includes('COALESCE(common_name.name')
          ? this.speciesRows
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
  assert.match(listQuery.sql, /ORDER BY CASE[\s\S]*lower\(t\.scientific_name\)/);
  assert.match(listQuery.sql, /lower\(matched_name\.name\)/);
  assert.match(listQuery.sql, /synonym\.scientific_name ILIKE/);
  assert.match(listQuery.sql, /LIMIT \$9 OFFSET \$10/);
  assert.deepEqual(listQuery.bindings, [
    'animalia',
    '%Panthera leo%',
    '%Panthera leo%',
    '%Panthera leo%',
    '%Panthera leo%',
    '%Panthera leo%',
    'Panthera leo',
    'Panthera leo%',
    24,
    24,
  ]);
});

test('catalog species can be sorted by common name', async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({ runtime: createRuntime(database) });

  await controller.species(createContext({ sort: 'common' }));

  assert.match(database.queries[2].sql, /ORDER BY common_name NULLS LAST, t\.scientific_name/);
});

test('catalog species reject unsupported sort values', async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({ runtime: createRuntime(database) });

  await assert.rejects(
    controller.species(createContext({ sort: 'random' })),
    (error: unknown) => error instanceof HttpError && error.status === 400,
  );
});

test('catalog extinction filter distinguishes living species from unknown status', async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({ runtime: createRuntime(database) });

  await controller.species(createContext({ extinct: 'false' }));

  assert.match(database.queries[1].sql, /lower\(t\.extinct\) = \$1/);
  assert.doesNotMatch(database.queries[1].sql, /coalesce\(lower\(t\.extinct\)/);
  assert.deepEqual(database.queries[1].bindings, ['false']);
});

test('catalog filters can combine habitat and data source', async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({ runtime: createRuntime(database) });

  await controller.species(createContext({
    habitat: 'Forest',
    source: 'Catalogue of Life',
  }));

  assert.match(database.queries[1].sql, /t\.environment = \$1/);
  assert.match(database.queries[1].sql, /t\.data_source = \$2/);
  assert.deepEqual(database.queries[1].bindings, ['Forest', 'Catalogue of Life']);
});

test('habitat facets respect selected source, taxonomy, and extinction filters', async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({ runtime: createRuntime(database) });

  await controller.facets(createContext({
    field: 'habitat',
    kingdom: 'animalia',
    source: 'Paleobiology Database',
    extinct: 'true',
  }));

  assert.match(database.queries[1].sql, /t\.data_source = \$3/);
  assert.match(database.queries[1].sql, /lower\(t\.extinct\) = \$2/);
  assert.deepEqual(database.queries[1].bindings, [
    'animalia',
    'true',
    'Paleobiology Database',
  ]);
});

test('catalog species expose their source taxon identifier', async () => {
  const database = new CapturingDatabase(true, [{
    external_id: 'col:123',
    source_id: 'source:456',
    scientific_name: 'Test species',
    common_name: 'Test',
  }]);
  const controller = createCatalogController({ runtime: createRuntime(database) });
  const context = createContext({});

  await controller.species(context);

  const response = context.body as { data: Array<{ sourceId: string }> };
  assert.equal(response.data[0].sourceId, 'source:456');
  assert.match(database.queries[2].sql, /t\.external_id, t\.source_id/);
});

test('catalog routes report incomplete schema as unavailable', async () => {
  const database = new CapturingDatabase(false);
  const controller = createCatalogController({ runtime: createRuntime(database) });

  await assert.rejects(
    controller.kingdoms(createContext({})),
    (error: unknown) => error instanceof HttpError && error.status === 503,
  );
});
