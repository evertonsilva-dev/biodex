export const CATALOG_CACHE_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS col_species_image_cache (
    scientific_name_key text PRIMARY KEY,
    image_url text,
    source text,
    attribution text,
    license text,
    reference_url text,
    is_representative boolean NOT NULL DEFAULT false,
    representative_rank text,
    representative_taxon_name text,
    fallback_version integer NOT NULL DEFAULT 0,
    gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
    gallery_version integer NOT NULL DEFAULT 0,
    fetched_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
  );
  ALTER TABLE col_species_image_cache
    ADD COLUMN IF NOT EXISTS is_representative boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS representative_rank text,
    ADD COLUMN IF NOT EXISTS representative_taxon_name text,
    ADD COLUMN IF NOT EXISTS fallback_version integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS gallery_version integer NOT NULL DEFAULT 0;
  CREATE TABLE IF NOT EXISTS col_species_enrichment_cache (
    external_id text PRIMARY KEY,
    payload jsonb NOT NULL,
    fetched_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
  );
`;
