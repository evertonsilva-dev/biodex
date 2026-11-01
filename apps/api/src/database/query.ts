import type { Pool, QueryResult, QueryResultRow } from 'pg';
import type { CatalogDatabase } from '../http/catalog.types.js';

interface DatabaseClient extends CatalogDatabase {
  query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    bindings?: unknown[],
  ): Promise<QueryResult<Row>>;
}

export function createDatabaseClient(pool: Pool): DatabaseClient {
  return {
    query(sql, bindings = []) {
      return pool.query(sql, bindings);
    },
  };
}
