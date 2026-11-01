import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import dotenv from 'dotenv';
import pg from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { z } from 'zod';
import { CATALOG_CACHE_SCHEMA_SQL } from '../src/database/catalog-cache-schema.js';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const apiDirectory = resolve(scriptDirectory, '..');
dotenv.config({ path: resolve(apiDirectory, '..', '..', '.env.local') });
dotenv.config({ path: resolve(apiDirectory, '.env') });

const TABLES = [
  'col_kingdom',
  'col_taxon_usage',
  'col_vernacular_name',
  'col_name_relation',
];

const manifestSchema = z.object({
  scope: z.object({
    requestedTotalSpecies: z.literal(200000),
  }),
  counts: z.object({
    selectedSpecies: z.number().int().nonnegative(),
    vernacularNamesBeforeLimit: z.number().int().nonnegative(),
    nameRelations: z.number().int().nonnegative(),
    bySourceAndKingdom: z.array(z.object({
      data_source: z.string().nullable(),
      species_count: z.number().int().nonnegative(),
    })),
  }),
});

function quoteIdentifier(identifier: string): string {
  if (!/^[a-z_][a-z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid CSV column name: ${identifier}`);
  }
  return `"${identifier}"`;
}

async function readCsvColumns(filePath: string): Promise<string[]> {
  const input = createReadStream(filePath);
  const lines = createInterface({ input, crlfDelay: Infinity });
  const firstLine = await lines[Symbol.asyncIterator]().next();
  lines.close();
  input.destroy();
  if (firstLine.done || !firstLine.value) {
    throw new Error(`CSV file is empty: ${filePath}`);
  }
  return firstLine.value.split(',').map((column) => column.trim());
}

function getDirectConnection() {
  const direct = process.env.DATABASE_URL_UNPOOLED;
  const pooled = process.env.DATABASE_URL;
  if (!direct || !pooled) {
    throw new Error('Both DATABASE_URL and DATABASE_URL_UNPOOLED must be set in apps/api/.env.');
  }
  const directUrl = new URL(direct);
  const pooledUrl = new URL(pooled);
  const normalizedPooledHost = pooledUrl.hostname.replace(/-pooler(?=\.|$)/, '');
  if (
    !directUrl.hostname.endsWith('.neon.tech')
    || directUrl.hostname.includes('-pooler')
    || normalizedPooledHost !== directUrl.hostname
    || directUrl.pathname !== pooledUrl.pathname
    || directUrl.username !== pooledUrl.username
  ) {
    throw new Error('The pooled and direct URLs must target the same Neon database; use the direct URL for this import.');
  }
  directUrl.searchParams.delete('sslmode');
  return { connectionString: directUrl.toString(), ssl: { rejectUnauthorized: false } };
}

async function main() {
  const apply = process.argv.includes('--apply');
  const requestedOutput = process.argv.find((argument, index) => (
    process.argv[index - 1] === '--input'
  ));
  const inputDirectory = requestedOutput
    ? (isAbsolute(requestedOutput) ? requestedOutput : resolve(apiDirectory, requestedOutput))
    : resolve(apiDirectory, '.tmp', 'neon-demo-200k');
  const manifestContent: unknown = JSON.parse(await readFile(join(inputDirectory, 'manifest.json'), 'utf8'));
  const manifest = manifestSchema.parse(manifestContent);
  if (
    !Number.isSafeInteger(manifest.counts?.selectedSpecies)
    || manifest.counts.selectedSpecies < 1000
    || manifest.counts.selectedSpecies > 250000
    || manifest.scope?.requestedTotalSpecies !== 200000
  ) {
    throw new Error('The input manifest is not a validated 200,000-species export.');
  }
  const expectedPbdbSpecies = manifest.counts.bySourceAndKingdom
    .filter((entry) => entry.data_source === 'Paleobiology Database')
    .reduce((total, entry) => total + Number(entry.species_count), 0);
  const groupedSpeciesCount = manifest.counts.bySourceAndKingdom
    .reduce((total, entry) => total + entry.species_count, 0);
  if (groupedSpeciesCount !== manifest.counts.selectedSpecies) {
    throw new Error('The export manifest source totals do not match its selected species count.');
  }
  if (!Number.isSafeInteger(expectedPbdbSpecies) || expectedPbdbSpecies < 1) {
    throw new Error('The export manifest does not contain a valid PBDB species count.');
  }

  const connection = getDirectConnection();
  const pool = new pg.Pool({ ...connection, max: 1, connectionTimeoutMillis: 15000 });
  const client = await pool.connect();
  let transactionOpen = false;

  try {
    const currentCountResult = await client.query(`
      SELECT count(*)::int AS species_count
      FROM public.col_taxon_usage
      WHERE status = 'accepted' AND rank = 'species' AND is_catalog_species = true
    `);
    const currentSpecies = Number(currentCountResult.rows[0].species_count);

    const csvPaths = new Map<string, string>([
      ['col_kingdom', join(inputDirectory, 'col_kingdom.csv')],
      ['col_taxon_usage', join(inputDirectory, 'col_taxon_usage.csv')],
      ['col_vernacular_name', join(inputDirectory, 'col_vernacular_name.csv')],
      ['col_name_relation', join(inputDirectory, 'col_name_relation.csv')],
    ]);
    const columnsByTable = new Map<string, string[]>();
    for (const table of TABLES) {
      const csvPath = csvPaths.get(table);
      if (!csvPath) {
        throw new Error(`No CSV path was configured for ${table}.`);
      }
      const columns = await readCsvColumns(csvPath);
      columnsByTable.set(table, columns);
      await client.query(
        `CREATE TEMP TABLE ${quoteIdentifier(`stage_${table}`)} ON COMMIT PRESERVE ROWS AS SELECT ${columns.map(quoteIdentifier).join(', ')} FROM public.${quoteIdentifier(table)} WITH NO DATA`,
      );
      const columnList = columns.map(quoteIdentifier).join(', ');
      const copyStream = client.query(copyFrom(
        `COPY ${quoteIdentifier(`stage_${table}`)} (${columnList}) FROM STDIN WITH (FORMAT CSV, HEADER TRUE)`,
      ));
      await pipeline(createReadStream(csvPath), copyStream);
    }

    const integrity = await client.query(`
      SELECT
        (SELECT count(*)::int FROM stage_col_taxon_usage) AS taxon_rows,
        (SELECT count(DISTINCT external_id)::int FROM stage_col_taxon_usage) AS unique_taxa,
        (SELECT count(*)::int FROM stage_col_taxon_usage
         WHERE status = 'accepted' AND rank = 'species' AND is_catalog_species = true) AS species,
        (SELECT count(*)::int FROM stage_col_taxon_usage pbdb
         WHERE pbdb.data_source = 'Paleobiology Database'
           AND pbdb.status = 'accepted' AND pbdb.rank = 'species'
           AND pbdb.is_catalog_species = true) AS pbdb_species,
        (SELECT count(*)::int FROM stage_col_taxon_usage taxon
         WHERE taxon.parent_external_id IS NOT NULL
           AND NOT EXISTS (
             SELECT 1 FROM stage_col_taxon_usage parent
             WHERE parent.external_id = taxon.parent_external_id
           )) AS missing_parents,
        (SELECT count(*)::int FROM stage_col_vernacular_name name
         WHERE NOT EXISTS (
           SELECT 1 FROM stage_col_taxon_usage taxon
           WHERE taxon.external_id = name.taxon_external_id
         )) AS orphan_names,
        (SELECT count(*)::int FROM stage_col_name_relation relation
         WHERE NOT EXISTS (
           SELECT 1 FROM stage_col_taxon_usage taxon
           WHERE taxon.external_id = relation.name_external_id
         ) OR NOT EXISTS (
           SELECT 1 FROM stage_col_taxon_usage taxon
           WHERE taxon.external_id = relation.related_name_external_id
         )) AS orphan_relations,
        (SELECT count(*)::int FROM stage_col_vernacular_name) AS vernacular_names,
        (SELECT count(*)::int FROM stage_col_name_relation) AS name_relations,
        (SELECT count(*)::int FROM stage_col_kingdom) AS kingdoms
    `);
    const checked = integrity.rows[0];
    if (
      Number(checked.species) !== manifest.counts.selectedSpecies
      || Number(checked.unique_taxa) !== Number(checked.taxon_rows)
      || Number(checked.pbdb_species) !== expectedPbdbSpecies
      || Number(checked.missing_parents) !== 0
      || Number(checked.orphan_names) !== 0
      || Number(checked.orphan_relations) !== 0
      || Number(checked.vernacular_names) < 1
      || Number(checked.vernacular_names) > manifest.counts.vernacularNamesBeforeLimit
      || Number(checked.name_relations) !== manifest.counts.nameRelations
      || Number(checked.kingdoms) < 1
    ) {
      throw new Error(`Catalog staging validation failed: ${JSON.stringify(checked)}`);
    }
    console.log(JSON.stringify({
      currentSpecies,
      validatedCatalog: checked,
      inputDirectory,
    }, null, 2));
    if (!apply) {
      console.log('Validation only. Pass --apply to replace the catalog in Neon.');
      return;
    }
    if (currentSpecies >= manifest.counts.selectedSpecies) {
      throw new Error(`Refusing to replace ${currentSpecies} current species with ${manifest.counts.selectedSpecies}.`);
    }

    await client.query('BEGIN');
    transactionOpen = true;
    await client.query(CATALOG_CACHE_SCHEMA_SQL);
    await client.query(`
      TRUNCATE TABLE
        public.col_vernacular_name,
        public.col_name_relation,
        public.col_taxon_usage,
        public.col_kingdom,
        public.col_species_image_cache,
        public.col_species_enrichment_cache
    `);
    for (const table of TABLES) {
      const columns = columnsByTable.get(table);
      if (!columns) {
        throw new Error(`CSV columns were not loaded for ${table}.`);
      }
      const columnList = columns.map(quoteIdentifier).join(', ');
      await client.query(
        `INSERT INTO public.${quoteIdentifier(table)} (${columnList}) SELECT ${columnList} FROM ${quoteIdentifier(`stage_${table}`)}`,
      );
    }
    const insertedResult = await client.query(`
      SELECT
        (SELECT count(*)::int FROM public.col_taxon_usage) AS taxa,
        (SELECT count(*)::int FROM public.col_taxon_usage
         WHERE status = 'accepted' AND rank = 'species' AND is_catalog_species = true) AS species,
        (SELECT count(*)::int FROM public.col_vernacular_name) AS vernacular_names,
        (SELECT count(*)::int FROM public.col_name_relation) AS name_relations,
        (SELECT count(*)::int FROM public.col_kingdom) AS kingdoms
    `);
    const inserted = insertedResult.rows[0];
    if (
      Number(inserted.species) !== manifest.counts.selectedSpecies
      || Number(inserted.taxa) !== Number(checked.taxon_rows)
      || Number(inserted.vernacular_names) !== Number(checked.vernacular_names)
      || Number(inserted.name_relations) !== Number(checked.name_relations)
      || Number(inserted.kingdoms) !== Number(checked.kingdoms)
    ) {
      throw new Error(`Catalog replacement validation failed before commit: ${JSON.stringify(inserted)}`);
    }
    await client.query(`
      ANALYZE public.col_taxon_usage;
      ANALYZE public.col_vernacular_name;
      ANALYZE public.col_name_relation;
      ANALYZE public.col_kingdom;
    `);
    const databaseSizeResult = await client.query(`
      SELECT pg_database_size(current_database())::bigint AS bytes,
             pg_size_pretty(pg_database_size(current_database())) AS pretty
    `);
    const databaseBytes = Number(databaseSizeResult.rows[0].bytes);
    if (databaseBytes >= 900000000) {
      throw new Error(`The updated database would exceed the 900 MB safety limit (${databaseSizeResult.rows[0].pretty}).`);
    }
    await client.query('COMMIT');
    transactionOpen = false;

    const finalResult = await client.query(`
      SELECT
        (SELECT count(*)::int FROM public.col_taxon_usage
         WHERE status = 'accepted' AND rank = 'species' AND is_catalog_species = true) AS species,
        (SELECT count(*)::int FROM public.col_taxon_usage) AS taxa,
        (SELECT count(*)::int FROM public.col_vernacular_name) AS vernacular_names,
        (SELECT count(*)::int FROM public.col_name_relation) AS name_relations,
        pg_database_size(current_database())::bigint AS bytes,
        pg_size_pretty(pg_database_size(current_database())) AS size
    `);
    console.log(JSON.stringify({
      update: 'committed',
      database: finalResult.rows[0],
      preservedTables: 'Only catalog tables were replaced; every other database table was left untouched.',
    }, null, 2));
  } catch (error) {
    if (transactionOpen) {
      await client.query('ROLLBACK');
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(`Neon catalog replacement failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
