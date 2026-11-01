import type { QueryResultRow } from 'pg';

export interface CatalogDatabase {
  query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    bindings?: unknown[],
  ): Promise<{ rows: Row[] }>;
}

export interface CatalogRequestContext {
  query: Record<string, unknown>;
  params: Record<string, string>;
  body: unknown;
  throw(status: number, message: string): never;
}

export type CatalogHandler = (context: CatalogRequestContext) => Promise<void>;

export interface CatalogController {
  species: CatalogHandler;
  speciesDetails: CatalogHandler;
  speciesEnrichment: CatalogHandler;
  kingdoms: CatalogHandler;
  facets: CatalogHandler;
  image: CatalogHandler;
}

export interface CatalogHttpController {
  species: import('express').RequestHandler;
  speciesDetails: import('express').RequestHandler;
  speciesEnrichment: import('express').RequestHandler;
  kingdoms: import('express').RequestHandler;
  facets: import('express').RequestHandler;
  image: import('express').RequestHandler;
}

export interface CatalogRuntime {
  db: CatalogDatabase;
  log: {
    error(message: string): void;
    warn(message: string): void;
  };
}
