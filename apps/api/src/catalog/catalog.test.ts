import assert from "node:assert/strict";
import { test } from "node:test";
import type { QueryResultRow } from "pg";
import createCatalogController from "./controllers/catalog.js";
import { HttpError } from "../http/errors.js";
import type {
  CatalogDatabase,
  CatalogRequestContext,
  CatalogRuntime,
} from "../http/catalog.types.js";

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
    const rows: QueryResultRow[] = sql.includes("unnest(")
      ? [{ ready: this.ready }]
      : sql.includes("count(*)::text AS total")
        ? [{ total: "0" }]
        : sql.includes("COALESCE(common_name.name")
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

test("kingdom facets only include accepted species in the active catalog", async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });

  await controller.facets(createContext({ field: "kingdom" }));

  assert.match(database.queries[1].sql, /t\.is_catalog_species = true/);
});

test("taxonomy facets use the same catalog-species restriction as the list", async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });

  await controller.facets(
    createContext({ field: "phylum", kingdom: "animalia" }),
  );

  assert.match(database.queries[1].sql, /t\.is_catalog_species = true/);
});

test("species searches use explicit PostgreSQL placeholders and ordered bindings", async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });

  await controller.species(
    createContext({
      page: "2",
      pageSize: "24",
      kingdom: "animalia",
      search: "Panthera leo",
    }),
  );

  const listQuery = database.queries[2];
  assert.match(listQuery.sql, /k\.slug = \$1/);
  assert.match(
    listQuery.sql,
    /ORDER BY CASE[\s\S]*lower\(t\.scientific_name\)/,
  );
  assert.match(listQuery.sql, /lower\(matched_name\.name\)/);
  assert.match(listQuery.sql, /synonym\.scientific_name ILIKE/);
  assert.match(listQuery.sql, /LIMIT \$9 OFFSET \$10/);
  assert.deepEqual(listQuery.bindings, [
    "animalia",
    "%Panthera leo%",
    "%Panthera leo%",
    "%Panthera leo%",
    "%Panthera leo%",
    "%Panthera leo%",
    "Panthera leo",
    "Panthera leo%",
    24,
    24,
  ]);
});

test("catalog species can be sorted by common name", async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });

  await controller.species(createContext({ sort: "common" }));

  assert.match(
    database.queries[2].sql,
    /ORDER BY common_name NULLS LAST, t\.scientific_name/,
  );
});

test("catalog species reject unsupported sort values", async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });

  await assert.rejects(
    controller.species(createContext({ sort: "random" })),
    (error: unknown) => error instanceof HttpError && error.status === 400,
  );
});

test("catalog suggestions require at least three characters", async () => {
  const controller = createCatalogController({
    runtime: createRuntime(new CapturingDatabase(true)),
  });

  await assert.rejects(
    controller.suggestions(createContext({ q: "ab" })),
    (error: unknown) => error instanceof HttpError && error.status === 400,
  );
});

test("catalog suggestions escape the prefix, dedupe labels, and cap results", async () => {
  const database = new CapturingDatabase(true);
  const baseQuery = database.query.bind(database);
  database.query = (async (sql: string, bindings: unknown[] = []) => {
    if (!sql.includes("s.matched_name")) return baseQuery(sql, bindings);
    database.queries.push({ sql, bindings });
    const rows = Array.from({ length: 12 }, (_, index) => ({
      external_id: `id-${index}`,
      scientific_name: `Genus species${index}`,
      matched_name:
        index === 1 ? "Onça" : `Onça ${index === 0 ? "" : index}`.trim(),
      kind: "common",
      kingdom_slug: "animalia",
      color: "#c0392b",
    }));
    return { rows };
  }) as typeof database.query;
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });
  const context = createContext({ q: "50%_on" });

  await controller.suggestions(context);

  const suggestionQuery = database.queries.find((query) =>
    query.sql.includes("s.matched_name"),
  );
  assert.match(suggestionQuery?.sql ?? "", /col_name_relation/);
  assert.match(suggestionQuery?.sql ?? "", /col_vernacular_name/);
  assert.deepEqual(suggestionQuery?.bindings, ["50\\%\\_on%"]);
  const data = (context.body as { data: Array<{ label: string }> }).data;
  assert.equal(data.length, 8);
  assert.equal(
    new Set(data.map((item) => item.label.toLowerCase())).size,
    data.length,
  );
});

test("catalog extinction filter distinguishes living species from unknown status", async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });

  await controller.species(createContext({ extinct: "false" }));

  assert.match(database.queries[1].sql, /lower\(t\.extinct\) = \$1/);
  assert.doesNotMatch(database.queries[1].sql, /coalesce\(lower\(t\.extinct\)/);
  assert.deepEqual(database.queries[1].bindings, ["false"]);
});

test("catalog filters can combine multiple habitats and data source", async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });

  await controller.species(
    createContext({
      habitat: ["Forest", "Freshwater"],
      source: "Catalogue of Life",
    }),
  );

  assert.match(database.queries[1].sql, /regexp_split_to_array/);
  assert.match(database.queries[1].sql, /= ANY\(\$1::text\[\]\)/);
  assert.match(database.queries[1].sql, /t\.data_source = \$2/);
  assert.deepEqual(database.queries[1].bindings, [
    ["Forest", "Freshwater"],
    "Catalogue of Life",
  ]);
});

test("catalog species can be fetched by a bounded list of identifiers", async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });

  await controller.species(createContext({ ids: ["col:1", "col:2"] }));

  assert.match(
    database.queries[1].sql,
    /t\.external_id = ANY\(\$1::text\[\]\)/,
  );
  assert.deepEqual(database.queries[1].bindings, [["col:1", "col:2"]]);
});

test("catalog species reject too many shared-collection identifiers", async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });

  await assert.rejects(
    controller.species(
      createContext({
        ids: Array.from({ length: 101 }, (_, index) => `col:${index}`),
      }),
    ),
    (error: unknown) => error instanceof HttpError && error.status === 400,
  );
});

test("source facets respect selected habitats, taxonomy, and extinction filters", async () => {
  const database = new CapturingDatabase(true);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });

  await controller.facets(
    createContext({
      field: "source",
      kingdom: "animalia",
      habitat: ["Forest", "Freshwater"],
      extinct: "true",
    }),
  );

  assert.match(database.queries[1].sql, /regexp_split_to_array/);
  assert.match(database.queries[1].sql, /= ANY\(\$3::text\[\]\)/);
  assert.match(database.queries[1].sql, /WHEN 'fresh water' THEN 'freshwater'/);
  assert.match(database.queries[1].sql, /lower\(t\.extinct\) = \$2/);
  assert.deepEqual(database.queries[1].bindings, [
    "animalia",
    "true",
    ["Forest", "Freshwater"],
  ]);
});

test("catalog species expose their source taxon identifier", async () => {
  const database = new CapturingDatabase(true, [
    {
      external_id: "col:123",
      source_id: "source:456",
      scientific_name: "Test species",
      common_name: "Test",
    },
  ]);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });
  const context = createContext({});

  await controller.species(context);

  const response = context.body as { data: Array<{ sourceId: string }> };
  assert.equal(response.data[0].sourceId, "source:456");
  assert.match(database.queries[2].sql, /t\.external_id, t\.source_id/);
});

test("catalog routes report incomplete schema as unavailable", async () => {
  const database = new CapturingDatabase(false);
  const controller = createCatalogController({
    runtime: createRuntime(database),
  });

  await assert.rejects(
    controller.kingdoms(createContext({})),
    (error: unknown) => error instanceof HttpError && error.status === 503,
  );
});
