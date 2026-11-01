import type { CatalogDatabase } from '../http/catalog.types.js';

const REQUIRED_CATALOG_TABLES = [
  'public.col_taxon_usage',
  'public.col_vernacular_name',
  'public.col_name_relation',
  'public.col_kingdom',
  'public.col_catalog_import',
  'public.col_species_image_cache',
  'public.col_species_enrichment_cache',
];

export async function isCatalogReady(db: CatalogDatabase): Promise<boolean> {
  const result = await db.query<{ ready: boolean }>(`
    SELECT count(*) = ${REQUIRED_CATALOG_TABLES.length} AS ready
    FROM unnest($1::text[]) AS required(table_name)
    WHERE to_regclass(required.table_name) IS NOT NULL
  `, [REQUIRED_CATALOG_TABLES]);
  return result.rows[0]?.ready === true;
}
