import { createWriteStream } from 'node:fs';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import dotenv from 'dotenv';
import pg from 'pg';
import { to as copyTo } from 'pg-copy-streams';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const apiDirectory = resolve(scriptDirectory, '..');
dotenv.config({ path: resolve(apiDirectory, '.env') });

const TAXON_COLUMNS = [
  'external_id',
  'source_id',
  'parent_external_id',
  'status',
  'scientific_name',
  'authorship',
  'rank',
  'extinct',
  'environment',
  'kingdom',
  'phylum',
  'taxon_class',
  'taxon_order',
  'family',
  'genus',
  'tax_group',
  'is_merged',
  'is_virus',
  'data_source',
  'is_catalog_species',
  'source_reference',
];

const VERNACULAR_COLUMNS = [
  'taxon_external_id',
  'source_id',
  'name',
  'transliteration',
  'language',
  'preferred',
  'country',
  'area',
  'remarks',
];

const RELATION_COLUMNS = [
  'name_external_id',
  'related_name_external_id',
  'source_id',
  'relation_type',
  'reference_id',
  'page',
  'remarks',
];

const WELL_KNOWN_SPECIES = [
  'Panthera leo',
  'Panthera tigris',
  'Panthera pardus',
  'Canis lupus',
  'Canis latrans',
  'Homo sapiens',
  'Loxodonta africana',
  'Elephas maximus',
  'Balaenoptera musculus',
  'Delphinus delphis',
  'Ailuropoda melanoleuca',
  'Aquila chrysaetos',
  'Falco peregrinus',
  'Chelonia mydas',
  'Crocodylus niloticus',
  'Rana temporaria',
  'Danio rerio',
  'Octopus vulgaris',
  'Apis mellifera',
  'Danaus plexippus',
  'Drosophila melanogaster',
  'Arabidopsis thaliana',
  'Quercus robur',
  'Sequoia sempervirens',
  'Oryza sativa',
  'Zea mays',
  'Triticum aestivum',
  'Solanum lycopersicum',
  'Coffea arabica',
  'Rosa canina',
  'Cannabis sativa',
  'Saccharomyces cerevisiae',
  'Agaricus bisporus',
  'Amanita muscaria',
  'Chlamydomonas reinhardtii',
];

function getArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function parsePositiveInteger(value: string | undefined, name: string, fallback: number, maximum: number): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new Error(`${name} must be an integer between 1 and ${maximum}.`);
  }
  return parsed;
}

function requiredValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
}

function getConnectionOptions() {
  if (process.env.DATABASE_CLIENT !== 'postgres') {
    throw new Error('Set DATABASE_CLIENT=postgres in apps/api/.env.');
  }
  return {
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: Number(process.env.DATABASE_PORT || 5432),
    database: process.env.DATABASE_NAME || 'biodex',
    user: process.env.DATABASE_USERNAME || 'biodex',
    password: requiredValue(process.env.DATABASE_PASSWORD, 'DATABASE_PASSWORD'),
    ssl: process.env.DATABASE_SSL === 'true',
  };
}

async function exportCsv(client: pg.PoolClient, query: string, filePath: string): Promise<number> {
  const copyStream = client.query(copyTo(
    `COPY (${query}) TO STDOUT WITH (FORMAT CSV, HEADER TRUE)`,
  ));
  await pipeline(copyStream, createWriteStream(filePath));
  return (await stat(filePath)).size;
}

async function prepareOutputDirectory(requestedOutput: string | undefined): Promise<string> {
  const outputDirectory = requestedOutput
    ? (isAbsolute(requestedOutput) ? requestedOutput : resolve(apiDirectory, requestedOutput))
    : resolve(apiDirectory, '.tmp', `neon-demo-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`);
  await mkdir(outputDirectory, { recursive: true });
  const existingEntries = await readdir(outputDirectory);
  if (existingEntries.length > 0) {
    const validEntries = existingEntries.filter((entry) => ![
      'col_taxon_usage.csv',
      'col_vernacular_name.csv',
      'col_name_relation.csv',
      'col_kingdom.csv',
      'manifest.json',
    ].includes(entry));
    if (validEntries.length > 0) {
      throw new Error(`Output directory is not empty: ${outputDirectory}`);
    }
  }
  return outputDirectory;
}

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: npm run export:neon-demo -- [--per-kingdom 250 | --total-species 200000] [--output path]');
    return;
  }

  const requestedTotal = getArgument('--total-species');
  const perKingdomValue = getArgument('--per-kingdom');
  if (requestedTotal && perKingdomValue) {
    throw new Error('Use either --total-species or --per-kingdom, not both.');
  }
  const totalSpecies = requestedTotal
    ? parsePositiveInteger(requestedTotal, '--total-species', 200000, 2500000)
    : null;
  const perKingdom = parsePositiveInteger(
    perKingdomValue,
    '--per-kingdom',
    250,
    5000,
  );
  const connection = getConnectionOptions();
  const outputDirectory = await prepareOutputDirectory(getArgument('--output'));
  const pool = new pg.Pool(connection);
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TEMP TABLE biodex_demo_species_seed (
        external_id text PRIMARY KEY
      ) ON COMMIT PRESERVE ROWS;
      CREATE TEMP TABLE biodex_demo_taxon_ids (
        external_id text PRIMARY KEY
      ) ON COMMIT PRESERVE ROWS;
    `);
    const pbdbCountResult = await client.query(`
      SELECT count(*)::int AS species_count
      FROM col_taxon_usage
      WHERE data_source = 'Paleobiology Database'
        AND status = 'accepted'
        AND rank = 'species'
        AND is_catalog_species = true
    `);
    const pbdbSpeciesCount = Number(pbdbCountResult.rows[0].species_count);
    const catalogSpeciesTarget = totalSpecies === null
      ? null
      : Math.max(1, totalSpecies - pbdbSpeciesCount);
    await client.query(`
      WITH kingdom_counts AS (
        SELECT COALESCE(kingdom, '') AS kingdom_key, count(*)::int AS species_count
        FROM col_taxon_usage
        WHERE data_source = 'Catalogue of Life'
          AND status = 'accepted'
          AND rank = 'species'
          AND is_catalog_species = true
        GROUP BY COALESCE(kingdom, '')
      ),
      total_count AS (
        SELECT sum(species_count)::numeric AS species_count
        FROM kingdom_counts
      ),
      ranked_species AS (
        SELECT
          taxon.external_id,
          COALESCE(taxon.kingdom, '') AS kingdom_key,
          row_number() OVER (
            PARTITION BY COALESCE(taxon.kingdom, '')
            ORDER BY
              CASE
                WHEN lower(taxon.scientific_name) = ANY($2::text[]) THEN 0
                WHEN EXISTS (
                  SELECT 1 FROM col_vernacular_name name
                  WHERE name.taxon_external_id = taxon.external_id
                    AND lower(name.language) = 'por'
                ) THEN 1
                WHEN EXISTS (
                  SELECT 1 FROM col_vernacular_name name
                  WHERE name.taxon_external_id = taxon.external_id
                    AND lower(name.language) = 'eng'
                ) THEN 2
                ELSE 3
              END,
              md5(taxon.external_id)
          ) AS kingdom_rank
        FROM col_taxon_usage taxon
        WHERE taxon.data_source = 'Catalogue of Life'
          AND taxon.status = 'accepted'
          AND taxon.rank = 'species'
          AND taxon.is_catalog_species = true
      )
      INSERT INTO biodex_demo_species_seed (external_id)
      SELECT ranked.external_id
      FROM ranked_species ranked
      JOIN kingdom_counts kingdom USING (kingdom_key)
      CROSS JOIN total_count total
      WHERE ranked.kingdom_rank <= CASE
        WHEN $1::integer IS NULL THEN $3
        ELSE LEAST(
          kingdom.species_count,
          GREATEST(
            25,
            CEIL($1::numeric * kingdom.species_count / total.species_count)::integer
          )
        )
      END
      ON CONFLICT DO NOTHING;
    `, [
      catalogSpeciesTarget,
      WELL_KNOWN_SPECIES.map((name) => name.toLowerCase()),
      perKingdom,
    ]);
    await client.query(`
      INSERT INTO biodex_demo_species_seed (external_id)
      SELECT external_id
      FROM col_taxon_usage
      WHERE data_source = 'Paleobiology Database'
        AND status = 'accepted'
        AND rank = 'species'
        AND is_catalog_species = true
      ON CONFLICT DO NOTHING;
    `);

    await client.query(`
      WITH RECURSIVE selected_taxa (external_id) AS (
        SELECT external_id FROM biodex_demo_species_seed
        UNION
        SELECT parent.external_id
        FROM selected_taxa selected
        JOIN col_taxon_usage child ON child.external_id = selected.external_id
        JOIN col_taxon_usage parent ON parent.external_id = child.parent_external_id
      )
      INSERT INTO biodex_demo_taxon_ids (external_id)
      SELECT external_id FROM selected_taxa
      ON CONFLICT DO NOTHING;
    `);

    const sourceCounts = await client.query(`
      SELECT data_source, kingdom, count(*)::int AS species_count
      FROM col_taxon_usage
      WHERE external_id IN (SELECT external_id FROM biodex_demo_species_seed)
        AND status = 'accepted'
        AND rank = 'species'
      GROUP BY data_source, kingdom
      ORDER BY data_source, kingdom
    `);
    const counts = await client.query(`
      SELECT
        (SELECT count(*)::int FROM biodex_demo_species_seed) AS selected_species,
        (SELECT count(*)::int FROM biodex_demo_taxon_ids) AS selected_taxa,
        (SELECT count(*)::int
         FROM col_vernacular_name name
         WHERE name.taxon_external_id IN (SELECT external_id FROM biodex_demo_taxon_ids)
           AND lower(name.language) IN ('por', 'eng')) AS vernacular_names,
        (SELECT count(*)::int
         FROM col_name_relation relation
         WHERE relation.name_external_id IN (SELECT external_id FROM biodex_demo_taxon_ids)
           AND relation.related_name_external_id IN (SELECT external_id FROM biodex_demo_taxon_ids))
           AS name_relations,
        (SELECT COALESCE(sum(pg_column_size(taxon)), 0)::bigint
         FROM col_taxon_usage taxon
         WHERE taxon.external_id IN (SELECT external_id FROM biodex_demo_taxon_ids))
           AS estimated_taxon_bytes,
        (SELECT COALESCE(sum(pg_column_size(name)), 0)::bigint
         FROM col_vernacular_name name
         WHERE name.taxon_external_id IN (SELECT external_id FROM biodex_demo_taxon_ids)
           AND lower(name.language) IN ('por', 'eng')) AS estimated_name_bytes
    `);
    const countsRow = counts.rows[0];
    const estimatedBytes = Number(countsRow.estimated_taxon_bytes) + Number(countsRow.estimated_name_bytes);
    if (estimatedBytes > 700 * 1024 ** 2) {
      throw new Error(`The estimated catalog data exceeds the 700 MiB safety target (${estimatedBytes} bytes).`);
    }

    const queries: Array<[string, string]> = [
      ['col_taxon_usage.csv', `SELECT ${TAXON_COLUMNS.map((column) => `"${column}"`).join(', ')}
        FROM col_taxon_usage
        WHERE external_id IN (SELECT external_id FROM biodex_demo_taxon_ids)
        ORDER BY external_id`],
      ['col_vernacular_name.csv', `SELECT ${VERNACULAR_COLUMNS.map((column) => `"${column}"`).join(', ')}
        FROM (
          SELECT name.*,
            row_number() OVER (
              PARTITION BY name.taxon_external_id
              ORDER BY CASE lower(name.language) WHEN 'por' THEN 0 ELSE 1 END,
                CASE lower(name.preferred) WHEN 'true' THEN 0 ELSE 1 END,
                name.name
            ) AS name_rank
          FROM col_vernacular_name name
          WHERE name.taxon_external_id IN (SELECT external_id FROM biodex_demo_taxon_ids)
            AND lower(name.language) IN ('por', 'eng')
        ) selected_names
        WHERE name_rank <= 5
        ORDER BY taxon_external_id, language, name`],
      ['col_name_relation.csv', `SELECT ${RELATION_COLUMNS.map((column) => `"${column}"`).join(', ')}
        FROM col_name_relation
        WHERE name_external_id IN (SELECT external_id FROM biodex_demo_taxon_ids)
          AND related_name_external_id IN (SELECT external_id FROM biodex_demo_taxon_ids)
        ORDER BY name_external_id, related_name_external_id`],
      ['col_kingdom.csv', `SELECT
          kingdom.name, kingdom.slug, kingdom.color, kingdom.is_virus,
          count(taxon.external_id) FILTER (
            WHERE taxon.status = 'accepted' AND taxon.rank = 'species'
              AND taxon.is_catalog_species = true
          ) AS accepted_species_count
        FROM col_kingdom kingdom
        JOIN (SELECT DISTINCT kingdom FROM col_taxon_usage
              WHERE external_id IN (SELECT external_id FROM biodex_demo_taxon_ids)) included
          ON included.kingdom = kingdom.name
        LEFT JOIN col_taxon_usage taxon ON taxon.kingdom = kingdom.name
          AND taxon.external_id IN (SELECT external_id FROM biodex_demo_taxon_ids)
        GROUP BY kingdom.name, kingdom.slug, kingdom.color, kingdom.is_virus
        ORDER BY kingdom.name`],
    ];

    const exportedFiles: Record<string, number> = {};
    for (const [fileName, query] of queries) {
      console.log(`Exporting ${fileName}...`);
      exportedFiles[fileName] = await exportCsv(client, query, join(outputDirectory, fileName));
    }

    const manifest = {
      generatedAt: new Date().toISOString(),
      scope: {
        requestedTotalSpecies: totalSpecies,
        colSpeciesTarget: catalogSpeciesTarget,
        colSpeciesPerKingdom: totalSpecies === null ? perKingdom : null,
        pbdbSpeciesIncluded: pbdbSpeciesCount,
        includesAllImportedPbdbDinosaurSpecies: true,
        keepsAncestors: true,
        vernacularLanguages: ['por', 'eng'],
        maximumVernacularNamesPerTaxon: 5,
        wellKnownSpeciesSeeds: WELL_KNOWN_SPECIES,
      },
      counts: {
        selectedSpecies: Number(countsRow.selected_species),
        selectedTaxaWithAncestors: Number(countsRow.selected_taxa),
        vernacularNamesBeforeLimit: Number(countsRow.vernacular_names),
        nameRelations: Number(countsRow.name_relations),
        estimatedTaxonAndNameBytes: estimatedBytes,
        bySourceAndKingdom: sourceCounts.rows,
      },
      exportedFiles: {
        ...exportedFiles,
      },
      notes: [
        'The source database was not modified; only temporary tables were created in the source session.',
        'The export contains catalog CSV files only; schema management remains separate from data export.',
        'The final Neon database size must be checked after catalog import.',
      ],
    };
    await writeFile(
      join(outputDirectory, 'manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
      'utf8',
    );

    console.log(JSON.stringify({
      outputDirectory,
      counts: manifest.counts,
      exportedFileBytes: manifest.exportedFiles,
      estimatedBytes,
    }, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(`Neon demo export failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
