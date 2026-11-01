import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';
import { z } from 'zod';
import { CATALOG_CACHE_SCHEMA_SQL } from '../src/database/catalog-cache-schema.js';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(scriptDirectory, '..', '.env') });

const API_URL = 'https://paleobiodb.org/data1.2/taxa/list.json';
const DATASET_ID = 'PBDB:Dinosauria';
const DATA_SOURCE = 'Paleobiology Database';
const TAXON_PREFIX = 'pbdb:';
const BATCH_SIZE = 500;

const pbdbIdSchema = z.union([z.string(), z.number()]).transform(String);
const pbdbRecordSchema = z.object({
  oid: pbdbIdSchema,
  nam: z.string(),
  rnk: z.union([z.string(), z.number()]),
  par: pbdbIdSchema.nullable().optional(),
  att: z.string().nullable().optional(),
  ext: z.string().nullable().optional(),
  ref: z.string().nullable().optional(),
});
const pbdbResponseSchema = z.object({
  records: z.array(pbdbRecordSchema),
});

type PBDBRecord = z.infer<typeof pbdbRecordSchema>;
type PBDBNormalizedRecord = Omit<PBDBRecord, 'rnk'> & { rnk: string };
type PBDBTaxonRow = {
  externalId: string;
  sourceId: string;
  parentExternalId: string | null;
  status: string | null;
  scientificName: string;
  authorship: string | null;
  rank: string;
  extinct: string | null;
  kingdom: string | null;
  phylum: string | null;
  taxonClass: string | null;
  taxonOrder: string | null;
  family: string | null;
  genus: string | null;
  taxGroup: string | null;
  isCatalogSpecies: boolean;
  sourceReference: string | null;
};

function externalId(id: string): string;
function externalId(id: string | null | undefined): string | null;
function externalId(id: string | null | undefined): string | null {
  return id ? `${TAXON_PREFIX}${id}` : null;
}

function normalizeRank(rank: string | number): string {
  if (typeof rank === 'string') {
    return rank.trim().toLowerCase();
  }
  if (rank === 5) {
    return 'genus';
  }
  throw new Error(`Unsupported PBDB rank value: ${String(rank)}.`);
}

async function fetchRecords(parameters: Record<string, string>): Promise<PBDBRecord[]> {
  const url = new URL(API_URL);
  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Biodex/1.0 (biodiversity catalog)' },
    signal: AbortSignal.timeout(90000),
  });
  if (!response.ok) {
    throw new Error(`PBDB responded with status ${response.status}.`);
  }
  const result: unknown = await response.json();
  return pbdbResponseSchema.parse(result).records;
}

function addRecords(target: Map<string, PBDBRecord>, records: PBDBRecord[]): void {
  for (const record of records) {
    if (!record.oid || !record.nam || !record.rnk) {
      throw new Error('PBDB returned a taxon without an identifier, name, or rank.');
    }
    const existing = target.get(record.oid);
    if (!existing || typeof record.rnk === 'string') {
      target.set(record.oid, record);
    }
  }
}

async function loadTaxonomy() {
  const query = {
    name: 'Dinosauria',
    show: 'attr,extant,status,ref',
    limit: 'all',
  };
  const speciesRecords = await fetchRecords({
    ...query,
    rel: 'all_children',
    taxon_status: 'accepted',
    pres: 'regular',
    extant: 'no',
  });
  const acceptedSpeciesIds = new Set(
    speciesRecords
      .filter((record) => normalizeRank(record.rnk) === 'species')
      .map((record) => record.oid),
  );
  const acceptedRecords = await fetchRecords({
    ...query,
    rel: 'all_children',
    taxon_status: 'accepted',
  });
  const ancestorRecords = await fetchRecords({
    ...query,
    rel: 'all_parents',
    taxon_status: 'accepted',
  });

  if (acceptedSpeciesIds.size === 0 || !speciesRecords.some((record) => record.nam === 'Tyrannosaurus rex')) {
    throw new Error('PBDB did not return the expected accepted dinosaur species.');
  }

  const records = new Map<string, PBDBRecord>();
  const acceptedTaxonIds = new Set([
    ...acceptedRecords.map((record) => record.oid),
    ...ancestorRecords.map((record) => record.oid),
  ]);
  addRecords(records, acceptedRecords);
  addRecords(records, ancestorRecords);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const missingParents = [
      ...new Set(
        [...records.values()]
          .map((record) => record.par)
          .filter((parentId): parentId is string => Boolean(parentId && !records.has(parentId))),
      ),
    ];
    if (missingParents.length === 0) {
      break;
    }
    const parentRecords = [];
    for (let index = 0; index < missingParents.length; index += 250) {
      parentRecords.push(...await fetchRecords({
        id: missingParents.slice(index, index + 250).join(','),
        show: 'attr,extant,status,ref',
        limit: 'all',
      }));
    }
    if (parentRecords.length === 0) {
      throw new Error(`PBDB could not resolve ${missingParents.length} parent taxa.`);
    }
    addRecords(records, parentRecords);
  }

  const unresolvedParents = [...records.values()].filter(
    (record) => record.par && !records.has(record.par),
  );
  if (unresolvedParents.length > 0) {
    throw new Error(`PBDB taxonomy has ${unresolvedParents.length} unresolved parent taxa.`);
  }
  if (![...records.values()].some((record) => record.nam === 'Dinosauria')) {
    throw new Error('PBDB taxonomy does not contain the Dinosauria node.');
  }

  const normalizedRecords = [...records.values()].map((record) => ({
    ...record,
    rnk: normalizeRank(record.rnk),
  }));
  const byId = new Map<string, PBDBNormalizedRecord>(
    normalizedRecords.map((record) => [record.oid, record]),
  );

  const rows: PBDBTaxonRow[] = normalizedRecords.map((record) => {
    const classification = new Map<string, string>();
    const path = new Set();
    let current: PBDBNormalizedRecord | null = record;
    let isDinosaur = false;
    while (current) {
      if (path.has(current.oid)) {
        throw new Error(`PBDB taxonomy contains a parent cycle at ${current.oid}.`);
      }
      path.add(current.oid);
      if (current.nam === 'Dinosauria') {
        isDinosaur = true;
      }
      if (
        ['kingdom', 'phylum', 'class', 'order', 'family', 'genus'].includes(current.rnk) &&
        !classification.has(current.rnk)
      ) {
        classification.set(current.rnk, current.nam);
      }
      current = current.par ? byId.get(current.par) ?? null : null;
    }

    return {
      externalId: externalId(record.oid),
      sourceId: record.oid,
      parentExternalId: externalId(record.par),
      status: acceptedTaxonIds.has(record.oid) ? 'accepted' : null,
      scientificName: record.nam,
      authorship: record.att || null,
      rank: record.rnk,
      extinct: record.ext === '0' ? 'true' : record.ext === '1' ? 'false' : null,
      kingdom: classification.get('kingdom') || (isDinosaur ? 'Animalia' : null),
      phylum: classification.get('phylum') || null,
      taxonClass: classification.get('class') || null,
      taxonOrder: classification.get('order') || null,
      family: classification.get('family') || null,
      genus: classification.get('genus') || null,
      taxGroup: isDinosaur ? 'Dinosauria' : null,
      isCatalogSpecies: acceptedSpeciesIds.has(record.oid),
      sourceReference: record.ref || null,
    };
  });

  const targetSpeciesCount = rows.filter((row) => row.isCatalogSpecies).length;
  if (targetSpeciesCount !== acceptedSpeciesIds.size) {
    throw new Error('PBDB species identifiers do not match the imported taxonomy.');
  }
  return { rows, targetSpeciesCount };
}

async function insertRows(client: pg.PoolClient, rows: PBDBTaxonRow[]): Promise<void> {
  const columns = [
    'external_id', 'source_id', 'parent_external_id', 'status', 'scientific_name',
    'authorship', 'rank', 'extinct', 'environment', 'kingdom', 'phylum',
    'taxon_class', 'taxon_order', 'family', 'genus', 'tax_group', 'is_merged',
    'is_virus', 'data_source', 'is_catalog_species', 'source_reference',
  ];
  for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
    const batch = rows.slice(offset, offset + BATCH_SIZE);
    const values: unknown[] = [];
    const placeholders = batch.map((row, rowIndex) => {
      const base = rowIndex * columns.length;
      values.push(
        row.externalId, row.sourceId, row.parentExternalId, row.status,
        row.scientificName, row.authorship, row.rank, row.extinct, null,
        row.kingdom, row.phylum, row.taxonClass, row.taxonOrder, row.family,
        row.genus, row.taxGroup, null, false, DATA_SOURCE, row.isCatalogSpecies,
        row.sourceReference,
      );
      return `(${columns.map((_, columnIndex) => `$${base + columnIndex + 1}`).join(', ')})`;
    });
    await client.query(
      `INSERT INTO col_taxon_usage (${columns.join(', ')})
       VALUES ${placeholders.join(', ')}`,
      values,
    );
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const { rows, targetSpeciesCount } = await loadTaxonomy();
  const counts = {
    taxonUsageRows: rows.length,
    acceptedTaxaRows: rows.length,
    acceptedSpeciesRows: rows.filter((row) => row.rank === 'species').length,
    importedDinosaurSpecies: targetSpeciesCount,
  };

  if (dryRun) {
    console.log(JSON.stringify({ dataset: DATASET_ID, dryRun: true, ...counts }, null, 2));
    return;
  }
  if (process.env.DATABASE_CLIENT !== 'postgres') {
    throw new Error('Set DATABASE_CLIENT=postgres in apps/api/.env before importing PBDB.');
  }

  const { Pool } = pg;
  const pool = new Pool({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: Number(process.env.DATABASE_PORT || 5432),
    database: process.env.DATABASE_NAME || 'biodex',
    user: process.env.DATABASE_USERNAME || 'biodex',
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === 'true',
  });
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS col_taxon_usage (
        external_id text PRIMARY KEY,
        source_id text,
        parent_external_id text,
        status text,
        scientific_name text,
        authorship text,
        rank text,
        extinct text,
        environment text,
        kingdom text,
        phylum text,
        taxon_class text,
        taxon_order text,
        family text,
        genus text,
        tax_group text,
        is_merged text,
        is_virus boolean NOT NULL DEFAULT false,
        data_source text NOT NULL DEFAULT 'Catalogue of Life',
        is_catalog_species boolean NOT NULL DEFAULT true,
        source_reference text
      );
      ALTER TABLE col_taxon_usage
        ADD COLUMN IF NOT EXISTS data_source text NOT NULL DEFAULT 'Catalogue of Life',
        ADD COLUMN IF NOT EXISTS is_catalog_species boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS source_reference text;
      CREATE TABLE IF NOT EXISTS col_vernacular_name (
        id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        taxon_external_id text,
        source_id text,
        name text,
        transliteration text,
        language text,
        preferred text,
        country text,
        area text,
        remarks text
      );
      CREATE TABLE IF NOT EXISTS col_name_relation (
        id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        name_external_id text,
        related_name_external_id text,
        source_id text,
        relation_type text,
        reference_id text,
        page text,
        remarks text
      );
      CREATE TABLE IF NOT EXISTS col_kingdom (
        name text PRIMARY KEY,
        slug text NOT NULL,
        color text NOT NULL,
        is_virus boolean NOT NULL,
        accepted_species_count bigint NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS col_catalog_import (
        dataset_id text PRIMARY KEY,
        title text NOT NULL,
        doi text,
        version text,
        issued text,
        archive_name text NOT NULL,
        imported_at timestamptz NOT NULL DEFAULT now(),
        taxon_usage_rows bigint NOT NULL,
        accepted_taxa_rows bigint NOT NULL,
        accepted_species_rows bigint NOT NULL,
        non_viral_species_rows bigint NOT NULL,
        vernacular_name_rows bigint NOT NULL,
        name_relation_rows bigint NOT NULL
      );
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS col_taxon_usage_parent_idx
        ON col_taxon_usage (parent_external_id);
      CREATE INDEX IF NOT EXISTS col_taxon_usage_kingdom_rank_idx
        ON col_taxon_usage (kingdom, status, rank, is_virus, scientific_name, external_id);
      CREATE INDEX IF NOT EXISTS col_taxon_usage_species_scientific_name_idx
        ON col_taxon_usage (scientific_name, external_id)
        WHERE status = 'accepted' AND rank = 'species';
      CREATE INDEX IF NOT EXISTS col_taxon_usage_scientific_name_trgm_idx
        ON col_taxon_usage USING gin (scientific_name gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS col_taxon_usage_tax_group_trgm_idx
        ON col_taxon_usage USING gin (tax_group gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS col_taxon_usage_catalog_species_idx
        ON col_taxon_usage (data_source, is_catalog_species, status, rank);
      CREATE INDEX IF NOT EXISTS col_vernacular_name_taxon_language_idx
        ON col_vernacular_name (taxon_external_id, language);
      CREATE INDEX IF NOT EXISTS col_vernacular_name_name_trgm_idx
        ON col_vernacular_name USING gin (name gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS col_name_relation_name_idx
        ON col_name_relation (name_external_id, relation_type);
      CREATE INDEX IF NOT EXISTS col_name_relation_related_name_idx
        ON col_name_relation (related_name_external_id);
    `);
    await client.query(CATALOG_CACHE_SCHEMA_SQL);

    await client.query('BEGIN');
    try {
      await client.query(`
        DELETE FROM col_vernacular_name
        WHERE taxon_external_id IN (
          SELECT external_id FROM col_taxon_usage WHERE data_source = $1
        )
      `, [DATA_SOURCE]);
      await client.query('DELETE FROM col_taxon_usage WHERE data_source = $1', [DATA_SOURCE]);
      await insertRows(client, rows);
      await client.query(`
        DELETE FROM col_species_enrichment_cache
        WHERE external_id LIKE 'pbdb:%';
        TRUNCATE TABLE col_species_image_cache;
      `);
      await client.query(`
        INSERT INTO col_kingdom (name, slug, color, is_virus, accepted_species_count)
        SELECT
          kingdom,
          trim(both '-' FROM regexp_replace(lower(kingdom), '[^a-z0-9]+', '-', 'g')),
          CASE
            WHEN lower(kingdom) = 'animalia' THEN '#c94c4c'
            WHEN lower(kingdom) = 'plantae' THEN '#3e8b57'
            WHEN lower(kingdom) = 'fungi' THEN '#8b5e3c'
            WHEN lower(kingdom) = 'chromista' THEN '#d19a2e'
            WHEN lower(kingdom) = 'protozoa' THEN '#7a63a8'
            WHEN lower(kingdom) LIKE '%virae' THEN '#64748b'
            ELSE '#557b68'
          END,
          lower(kingdom) LIKE '%virae',
          count(*) FILTER (
            WHERE status = 'accepted' AND rank = 'species' AND is_catalog_species
          )
        FROM col_taxon_usage
        WHERE kingdom IS NOT NULL AND kingdom <> ''
        GROUP BY kingdom
        ON CONFLICT (name) DO UPDATE SET
          slug = EXCLUDED.slug,
          color = EXCLUDED.color,
          is_virus = EXCLUDED.is_virus,
          accepted_species_count = EXCLUDED.accepted_species_count;
      `);
      await client.query(`
        INSERT INTO col_catalog_import (
          dataset_id, title, doi, version, issued, archive_name, imported_at,
          taxon_usage_rows, accepted_taxa_rows, accepted_species_rows,
          non_viral_species_rows, vernacular_name_rows, name_relation_rows
        )
        VALUES ($1, $2, NULL, $3, NULL, $4, now(), $5, $6, $7, $8, 0, 0)
        ON CONFLICT (dataset_id) DO UPDATE SET
          title = EXCLUDED.title,
          version = EXCLUDED.version,
          archive_name = EXCLUDED.archive_name,
          imported_at = EXCLUDED.imported_at,
          taxon_usage_rows = EXCLUDED.taxon_usage_rows,
          accepted_taxa_rows = EXCLUDED.accepted_taxa_rows,
          accepted_species_rows = EXCLUDED.accepted_species_rows,
          non_viral_species_rows = EXCLUDED.non_viral_species_rows,
          vernacular_name_rows = EXCLUDED.vernacular_name_rows,
          name_relation_rows = EXCLUDED.name_relation_rows;
      `, [
        DATASET_ID,
        'Paleobiology Database - Dinosauria',
        new Date().toISOString().slice(0, 10),
        'Paleobiology Database API',
        counts.taxonUsageRows,
        counts.acceptedTaxaRows,
        counts.acceptedSpeciesRows,
        targetSpeciesCount,
      ]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    await client.query('ANALYZE col_taxon_usage');
    await client.query('ANALYZE col_kingdom');
    console.log(JSON.stringify({
      dataset: DATASET_ID,
      ...counts,
      kingdoms: (await client.query(
        'SELECT name, accepted_species_count FROM col_kingdom ORDER BY name',
      )).rows,
    }, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(`PBDB import failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
