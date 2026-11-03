import {
  loadSpeciesEnrichment,
  SupplementalDataUnavailableError,
} from '../utils/species-enrichment.js';
import {
  collectSpeciesImages,
  EMPTY_IMAGE_CACHE_TTL_DAYS,
  findCommonsImage,
  findCommonsRepresentative,
  findGbifImage,
  findInaturalistImage,
  fullResolutionImageUrl,
  IMAGE_CACHE_TTL_DAYS,
  IMAGE_CACHE_VERSION,
  normalizeTaxonName,
  parseCachedImageGallery,
} from '../services/images.js';
import type { SpeciesImage, TaxonImageRow } from '../services/images.js';
import type { CatalogController, CatalogRequestContext, CatalogRuntime } from '../../http/catalog.types.js';
import type { QueryResultRow } from 'pg';
import { isCatalogReady } from '../../database/catalog-readiness.js';

interface CatalogFilters {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  extinct?: boolean;
}

type TaxonomyLevel = 'phylum' | 'class' | 'order' | 'family' | 'genus';
type CatalogQuery = Record<string, unknown>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isTaxonomyLevel(value: string): value is TaxonomyLevel {
  return Object.hasOwn(FACET_COLUMNS, value);
}

const MAX_PAGE_SIZE = 100;
const MAX_SEARCH_LENGTH = 100;
const MAX_FILTER_LENGTH = 200;

const FACET_COLUMNS: Record<TaxonomyLevel, string> = {
  phylum: 't.phylum',
  class: 't.taxon_class',
  order: 't.taxon_order',
  family: 't.family',
  genus: 't.genus',
};
const TAXONOMY_LEVELS: TaxonomyLevel[] = ['phylum', 'class', 'order', 'family', 'genus'];

function parseInteger(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
  name: string,
  ctx: CatalogRequestContext,
): number {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    ctx.throw(400, `${name} must be a positive integer.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    ctx.throw(400, `${name} must be between ${minimum} and ${maximum}.`);
  }

  return parsed;
}

function parseOptionalString(
  query: CatalogQuery,
  name: string,
  maximum: number,
  ctx: CatalogRequestContext,
): string {
  const value = query[name];
  if (value === undefined) {
    return '';
  }
  if (typeof value !== 'string') {
    ctx.throw(400, `${name} must be a string.`);
  }

  const normalized = value.trim();
  if (normalized.length > maximum) {
    ctx.throw(400, `${name} must be at most ${maximum} characters.`);
  }
  return normalized;
}

function parseCatalogFilters(query: CatalogQuery, ctx: CatalogRequestContext): CatalogFilters {
  const filters: CatalogFilters = {
    kingdom: parseOptionalString(query, 'kingdom', 100, ctx),
    phylum: parseOptionalString(query, 'phylum', MAX_FILTER_LENGTH, ctx),
    class: parseOptionalString(query, 'class', MAX_FILTER_LENGTH, ctx),
    order: parseOptionalString(query, 'order', MAX_FILTER_LENGTH, ctx),
    family: parseOptionalString(query, 'family', MAX_FILTER_LENGTH, ctx),
    genus: parseOptionalString(query, 'genus', MAX_FILTER_LENGTH, ctx),
    extinct: undefined,
  };
  const extinct = parseOptionalString(query, 'extinct', 5, ctx);

  if (extinct) {
    if (extinct !== 'true' && extinct !== 'false') {
      ctx.throw(400, 'extinct must be true or false.');
    }
    filters.extinct = extinct === 'true';
  }

  const hierarchy: Array<keyof CatalogFilters> = ['kingdom', ...TAXONOMY_LEVELS];
  for (let index = 1; index < hierarchy.length; index += 1) {
    if (filters[hierarchy[index]] && !filters[hierarchy[index - 1]]) {
      ctx.throw(400, `${hierarchy[index]} requires ${hierarchy[index - 1]}.`);
    }
  }

  return filters;
}

async function ensureCatalogReady(runtime: CatalogRuntime, ctx: CatalogRequestContext): Promise<void> {
  if (!await isCatalogReady(runtime.db)) {
    ctx.throw(503, 'Catalogue schema is incomplete. Run the database migration and catalog importers first.');
  }
}

function createFilters(
  query: CatalogQuery,
  ctx: CatalogRequestContext,
): { where: string; bindings: unknown[] } {
  const filters = parseCatalogFilters(query, ctx);
  const conditions = [
    "t.status = 'accepted'",
    "t.rank = 'species'",
    't.is_catalog_species = true',
  ];
  const bindings: unknown[] = [];
  const bind = (value: unknown): string => {
    bindings.push(value);
    return `$${bindings.length}`;
  };
  if (filters.kingdom) {
    conditions.push(`k.slug = ${bind(filters.kingdom)}`);
  } else {
    conditions.push('t.is_virus = false');
  }

  for (const level of TAXONOMY_LEVELS) {
    if (filters[level]) {
      conditions.push(`${FACET_COLUMNS[level]} = ${bind(filters[level])}`);
    }
  }
  if (filters.extinct !== undefined) {
    conditions.push(`coalesce(lower(t.extinct), 'false') = ${bind(String(filters.extinct))}`);
  }

  const search = parseOptionalString(query, 'search', MAX_SEARCH_LENGTH, ctx);
  if (search && search.length < 3) {
    ctx.throw(400, `search must be at least 3 characters.`);
  }
  if (search) {
    const escapedSearch = search.replace(/[\\%_]/g, '\\$&');
    const searchPattern = `%${escapedSearch}%`;
    const scientificNameMatches = bind(searchPattern);
    const taxGroupMatches = bind(searchPattern);
    const vernacularNameMatches = bind(searchPattern);
    const relatedNameMatches = bind(searchPattern);
    const synonymNameMatches = bind(searchPattern);
    conditions.push(`t.external_id IN (
      SELECT external_id
      FROM col_taxon_usage
      WHERE scientific_name ILIKE ${scientificNameMatches} ESCAPE E'\\\\'
      UNION
      SELECT external_id
      FROM col_taxon_usage
      WHERE tax_group ILIKE ${taxGroupMatches} ESCAPE E'\\\\'
      UNION
      SELECT taxon_external_id
      FROM col_vernacular_name
      WHERE name ILIKE ${vernacularNameMatches} ESCAPE E'\\\\'
      UNION
      SELECT relation.related_name_external_id
      FROM col_name_relation relation
      JOIN col_taxon_usage synonym
        ON synonym.external_id = relation.name_external_id
      WHERE synonym.scientific_name ILIKE ${relatedNameMatches} ESCAPE E'\\\\'
      UNION
      SELECT relation.name_external_id
      FROM col_name_relation relation
      JOIN col_taxon_usage synonym
        ON synonym.external_id = relation.related_name_external_id
      WHERE synonym.scientific_name ILIKE ${synonymNameMatches} ESCAPE E'\\\\'
    )`);
  }

  return { where: conditions.join(' AND '), bindings };
}

function toSpecies(row: QueryResultRow) {
  const taxonomy = [
    ['phylum', row.phylum],
    ['class', row.taxon_class],
    ['order', row.taxon_order],
    ['family', row.family],
    ['genus', row.genus],
  ]
    .filter(([, name]) => name)
    .map(([rank, name]) => ({ rank, name }));

  return {
    id: row.external_id,
    documentId: row.external_id,
    commonName: row.common_name || row.scientific_name,
    scientificName: row.scientific_name,
    description: null,
    habitat: row.environment,
    extinct: String(row.extinct).toLowerCase() === 'true',
    conservationStatus: null,
    kingdom: row.kingdom_name
      ? {
          id: row.kingdom_slug,
          name: row.kingdom_name,
          slug: row.kingdom_slug,
          color: row.color,
          isVirus: row.is_virus,
        }
      : null,
    taxon: {
      id: row.external_id,
      name: row.scientific_name,
      scientificName: row.scientific_name,
      rank: row.rank,
      taxonomy,
    },
    image: null,
  };
}

export default function createCatalogController({ runtime }: { runtime: CatalogRuntime }): CatalogController {
  const controller: CatalogController = {
  async speciesEnrichment(ctx) {
    await ensureCatalogReady(runtime, ctx);
    const externalId = ctx.params.id;
    if (typeof externalId !== 'string' || !externalId.trim() || externalId.length > 200) {
      ctx.throw(400, 'A valid species identifier is required.');
    }
    const refresh = ctx.query.refresh;
    if (refresh !== undefined && refresh !== 'true' && refresh !== 'false') {
      ctx.throw(400, 'refresh must be true or false.');
    }

    const result = await runtime.db.query<{
      external_id: string;
      source_id: string | null;
      scientific_name: string;
      extinct: boolean | string | null;
      kingdom: string | null;
      is_virus: boolean;
      data_source: string;
    }>(`
      SELECT external_id, source_id, scientific_name, extinct, kingdom, is_virus, data_source
      FROM col_taxon_usage
      WHERE external_id = $1
        AND status = 'accepted'
        AND rank = 'species'
        AND is_catalog_species = true
      LIMIT 1
    `, [externalId]);
    const species = result.rows[0];
    if (!species) {
      ctx.throw(404, 'Species not found.');
    }

    try {
      ctx.body = {
        data: await loadSpeciesEnrichment(runtime, species, refresh === 'true'),
      };
    } catch (error) {
      if (error instanceof SupplementalDataUnavailableError) {
        runtime.log.warn(`Supplemental data sources are unavailable for "${species.scientific_name}": ${error.message}`);
        ctx.throw(502, 'Supplemental species data is temporarily unavailable.');
      }
      throw error;
    }
  },

  async species(ctx) {
    await ensureCatalogReady(runtime, ctx);
    const page = parseInteger(ctx.query.page, 1, 1, 1000000, 'page', ctx);
    const pageSize = parseInteger(ctx.query.pageSize, 48, 1, MAX_PAGE_SIZE, 'pageSize', ctx);
    const offset = (page - 1) * pageSize;
    if (!Number.isSafeInteger(offset)) {
      ctx.throw(400, 'Requested page is too large.');
    }
    const { where, bindings } = createFilters(ctx.query, ctx);
    const countResult = await runtime.db.query(
      `SELECT count(*)::text AS total
       FROM col_taxon_usage t
       LEFT JOIN col_kingdom k ON k.name = t.kingdom
       WHERE ${where}`,
      bindings,
    );
    const rowsResult = await runtime.db.query(
      `SELECT
         t.external_id, t.scientific_name, t.environment, t.extinct, t.phylum, t.taxon_class,
         t.taxon_order, t.family, t.genus, t.rank, t.kingdom,
         k.name AS kingdom_name, k.slug AS kingdom_slug, k.color, k.is_virus,
         COALESCE(common_name.name, t.scientific_name) AS common_name
       FROM col_taxon_usage t
       LEFT JOIN col_kingdom k ON k.name = t.kingdom
       LEFT JOIN LATERAL (
         SELECT name
         FROM col_vernacular_name v
         WHERE v.taxon_external_id = t.external_id
           AND NULLIF(BTRIM(v.name), '') IS NOT NULL
         ORDER BY
           CASE v.language WHEN 'por' THEN 0 WHEN 'eng' THEN 1 ELSE 2 END,
           CASE v.preferred WHEN 'true' THEN 0 ELSE 1 END,
           v.name
         LIMIT 1
       ) common_name ON true
       WHERE ${where}
       ORDER BY t.scientific_name NULLS LAST, t.external_id
       LIMIT $${bindings.length + 1} OFFSET $${bindings.length + 2}`,
      [...bindings, pageSize, offset],
    );
    const total = Number(countResult.rows[0].total);

    ctx.body = {
      data: rowsResult.rows.map(toSpecies),
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
          total,
        },
      },
    };
  },

  async speciesDetails(ctx) {
    await ensureCatalogReady(runtime, ctx);
    const externalId = ctx.params.id;
    if (typeof externalId !== 'string' || !externalId.trim() || externalId.length > 200) {
      ctx.throw(400, 'A valid species identifier is required.');
    }

    const speciesResult = await runtime.db.query(`
      SELECT
        t.external_id, t.source_id, t.parent_external_id, t.status, t.scientific_name,
        t.authorship, t.rank, t.extinct, t.environment, t.kingdom, t.phylum, t.taxon_class,
        t.taxon_order, t.family, t.genus, t.tax_group, t.is_merged, t.data_source,
        t.source_reference,
        k.name AS kingdom_name, k.slug AS kingdom_slug, k.color, k.is_virus,
        COALESCE(common_name.name, t.scientific_name) AS common_name
      FROM col_taxon_usage t
      LEFT JOIN col_kingdom k ON k.name = t.kingdom
      LEFT JOIN LATERAL (
        SELECT name
        FROM col_vernacular_name v
        WHERE v.taxon_external_id = t.external_id
          AND NULLIF(BTRIM(v.name), '') IS NOT NULL
        ORDER BY
          CASE v.language WHEN 'por' THEN 0 WHEN 'eng' THEN 1 ELSE 2 END,
          CASE v.preferred WHEN 'true' THEN 0 ELSE 1 END,
          v.name
        LIMIT 1
      ) common_name ON true
      WHERE t.external_id = $1
        AND t.status = 'accepted'
        AND t.rank = 'species'
        AND t.is_catalog_species = true
      LIMIT 1
    `, [externalId]);
    const row = speciesResult.rows[0];
    if (!row) {
      ctx.throw(404, 'Species not found.');
    }

    const [lineageResult, vernacularResult, relationsResult, sourceResult] = await Promise.all([
      runtime.db.query(`
        WITH RECURSIVE lineage AS (
          SELECT
            external_id, parent_external_id, status, scientific_name, authorship, rank,
            extinct, environment, kingdom, phylum, taxon_class, taxon_order, family, genus,
            0 AS depth, ARRAY[external_id]::text[] AS path
          FROM col_taxon_usage
          WHERE external_id = $1
          UNION ALL
          SELECT
            parent.external_id, parent.parent_external_id, parent.status, parent.scientific_name,
            parent.authorship, parent.rank, parent.extinct, parent.environment, parent.kingdom,
            parent.phylum, parent.taxon_class, parent.taxon_order, parent.family, parent.genus,
            child.depth + 1, child.path || parent.external_id
          FROM lineage child
          JOIN col_taxon_usage parent ON parent.external_id = child.parent_external_id
          WHERE child.depth < 100
            AND NOT parent.external_id = ANY(child.path)
        )
        SELECT
          external_id, parent_external_id, status, scientific_name, authorship, rank,
          extinct, environment, kingdom, phylum, taxon_class, taxon_order, family, genus
        FROM lineage
        ORDER BY depth DESC
      `, [externalId]),
      runtime.db.query(`
        SELECT name, transliteration, language, preferred, country, area, remarks, source_id
        FROM col_vernacular_name
        WHERE taxon_external_id = $1
        ORDER BY
          CASE language WHEN 'por' THEN 0 WHEN 'eng' THEN 1 ELSE 2 END,
          CASE WHEN lower(preferred) = 'true' THEN 0 ELSE 1 END,
          name
      `, [externalId]),
      runtime.db.query(`
        SELECT
          relation.id, relation.relation_type, relation.reference_id, relation.page,
          relation.remarks, relation.source_id AS relation_source_id,
          CASE WHEN relation.name_external_id = $1 THEN 'outgoing' ELSE 'incoming' END AS direction,
          related.external_id, related.source_id, related.scientific_name, related.authorship,
          related.rank, related.status
        FROM col_name_relation relation
        JOIN col_taxon_usage related
          ON related.external_id = CASE
            WHEN relation.name_external_id = $2 THEN relation.related_name_external_id
            ELSE relation.name_external_id
          END
        WHERE relation.name_external_id = $3 OR relation.related_name_external_id = $4
        ORDER BY relation.relation_type, related.scientific_name, relation.id
      `, [externalId, externalId, externalId, externalId]),
      runtime.db.query(`
        SELECT dataset_id, title, doi, version, issued, imported_at
        FROM col_catalog_import
        WHERE CASE
          WHEN $1 = 'Paleobiology Database' THEN dataset_id = 'PBDB:Dinosauria'
          ELSE dataset_id <> 'PBDB:Dinosauria'
        END
        ORDER BY imported_at DESC
        LIMIT 1
      `, [row.data_source]),
    ]);

    const species = toSpecies(row);
    const parseBoolean = (value: unknown): boolean | null => {
      if (value === null || value === undefined || value === '') {
        return null;
      }
      return String(value).toLowerCase() === 'true';
    };
    const lineage = lineageResult.rows.map((ancestor) => ({
      id: ancestor.external_id,
      parentId: ancestor.parent_external_id,
      name: ancestor.scientific_name,
      authorship: ancestor.authorship,
      rank: ancestor.rank,
      status: ancestor.status,
      extinct: parseBoolean(ancestor.extinct),
    }));

    ctx.body = {
      data: {
        ...species,
        authorship: row.authorship,
        status: row.status,
        sourceId: row.source_id,
        dataSource: row.data_source,
        sourceReference: row.source_reference,
        parentExternalId: row.parent_external_id,
        taxGroup: row.tax_group,
        isMerged: parseBoolean(row.is_merged),
        extinct: parseBoolean(row.extinct),
        lineage,
        vernacularNames: vernacularResult.rows.map((name) => ({
          name: name.name,
          transliteration: name.transliteration,
          language: name.language,
          preferred: parseBoolean(name.preferred),
          country: name.country,
          area: name.area,
          remarks: name.remarks,
          sourceId: name.source_id,
        })),
        relatedNames: relationsResult.rows.map((relation) => ({
          id: relation.id,
          externalId: relation.external_id,
          sourceId: relation.source_id,
          scientificName: relation.scientific_name,
          authorship: relation.authorship,
          rank: relation.rank,
          status: relation.status,
          relationType: relation.relation_type,
          direction: relation.direction,
          referenceId: relation.reference_id,
          page: relation.page,
          remarks: relation.remarks,
          relationSourceId: relation.relation_source_id,
        })),
        dataset: sourceResult.rows[0]
          ? {
              datasetId: sourceResult.rows[0].dataset_id,
              title: sourceResult.rows[0].title,
              doi: sourceResult.rows[0].doi,
              version: sourceResult.rows[0].version,
              issued: sourceResult.rows[0].issued,
              importedAt: sourceResult.rows[0].imported_at,
            }
          : null,
      },
    };
  },

  async kingdoms(ctx) {
    await ensureCatalogReady(runtime, ctx);
    const result = await runtime.db.query(`
      SELECT name, slug, color, is_virus, accepted_species_count
      FROM col_kingdom
      ORDER BY is_virus, name
    `);

    ctx.body = {
      data: result.rows.map((row) => ({
        id: row.slug,
        name: row.name,
        slug: row.slug,
        color: row.color,
        isVirus: row.is_virus,
        speciesCount: Number(row.accepted_species_count),
      })),
    };
  },

  async facets(ctx) {
    await ensureCatalogReady(runtime, ctx);
    const filters = parseCatalogFilters(ctx.query, ctx);
    const field = parseOptionalString(ctx.query, 'field', 20, ctx);
    const bindings: unknown[] = [];
    const bind = (value: unknown): string => {
      bindings.push(value);
      return `$${bindings.length}`;
    };

    if (field === 'kingdom') {
      const extinctCondition = filters.extinct === undefined
        ? ''
        : `AND coalesce(lower(t.extinct), 'false') = ${bind(String(filters.extinct))}`;
      const result = await runtime.db.query(`
        SELECT
          k.slug AS value,
          CASE WHEN k.is_virus THEN 'Vírus · ' || k.name ELSE k.name END AS label
        FROM col_kingdom k
        WHERE EXISTS (
          SELECT 1
          FROM col_taxon_usage t
          WHERE t.kingdom = k.name
            AND t.status = 'accepted'
            AND t.rank = 'species'
            AND t.is_catalog_species = true
            ${extinctCondition}
        )
        ORDER BY k.name
      `, bindings);
      ctx.body = { data: result.rows };
      return;
    }

    if (!isTaxonomyLevel(field)) {
      return ctx.throw(400, 'field must be kingdom, phylum, class, order, family, or genus.');
    }
    const taxonomyField: TaxonomyLevel = field;
    const fieldIndex = TAXONOMY_LEVELS.indexOf(taxonomyField);
    if (!filters.kingdom || TAXONOMY_LEVELS.slice(0, fieldIndex).some((level) => !filters[level])) {
      ctx.throw(400, `${field} requires its parent taxonomy filters.`);
    }

    const conditions = [
      "t.status = 'accepted'",
      "t.rank = 'species'",
      't.is_catalog_species = true',
    ];
    conditions.push(`k.slug = ${bind(filters.kingdom)}`);
    for (const level of TAXONOMY_LEVELS.slice(0, fieldIndex)) {
      conditions.push(`${FACET_COLUMNS[level]} = ${bind(filters[level])}`);
    }
    if (filters.extinct !== undefined) {
      conditions.push(`coalesce(lower(t.extinct), 'false') = ${bind(String(filters.extinct))}`);
    }

    const result = await runtime.db.query(`
      SELECT DISTINCT ${FACET_COLUMNS[taxonomyField]} AS value
      FROM col_taxon_usage t
      JOIN col_kingdom k ON k.name = t.kingdom
      WHERE ${conditions.join(' AND ')}
        AND ${FACET_COLUMNS[taxonomyField]} IS NOT NULL
        AND ${FACET_COLUMNS[taxonomyField]} <> ''
      ORDER BY value
    `, bindings);
    ctx.body = {
      data: result.rows.map((row) => ({ value: row.value, label: row.value })),
    };
  },

  async image(ctx) {
    await ensureCatalogReady(runtime, ctx);
    const scientificName = parseOptionalString(ctx.query, 'scientificName', 200, ctx);
    if (!scientificName) {
      ctx.throw(400, 'scientificName is required.');
    }
    const galleryParameter = parseOptionalString(ctx.query, 'gallery', 5, ctx);
    if (galleryParameter && galleryParameter !== 'true' && galleryParameter !== 'false') {
      ctx.throw(400, 'gallery must be true or false.');
    }
    const includeGallery = galleryParameter === 'true';
    const cacheKey = `${IMAGE_CACHE_VERSION}:${normalizeTaxonName(scientificName)}`;

    const cached = await runtime.db.query(`
      SELECT
        image_url, source, attribution, license, reference_url,
        is_representative, representative_rank, representative_taxon_name, fallback_version,
        gallery_images, gallery_version
      FROM col_species_image_cache
      WHERE scientific_name_key = $1
        AND expires_at > now()
        AND (image_url IS NOT NULL OR fallback_version >= $2)
    `, [cacheKey, 1]);
    const cachedRow = cached.rows[0];
    const cachedImage = cachedRow?.image_url
      ? {
          url: cachedRow.image_url,
          fullscreenUrl: fullResolutionImageUrl({
            url: cachedRow.image_url,
            source: cachedRow.source,
          }),
          source: cachedRow.source,
          attribution: cachedRow.attribution,
          license: cachedRow.license,
          referenceUrl: cachedRow.reference_url,
          isRepresentative: cachedRow.is_representative,
          representativeRank: cachedRow.representative_rank,
          representativeTaxonName: cachedRow.representative_taxon_name,
        }
      : null;
    if (
      cachedRow &&
      (!includeGallery || Number(cachedRow.gallery_version) >= 1)
    ) {
      ctx.body = {
        data: cachedImage
          ? {
              ...cachedImage,
              ...(includeGallery
                ? { images: parseCachedImageGallery(cachedRow.gallery_images) }
                : {}),
            }
          : null,
      };
      return;
    }

    let image: SpeciesImage | null = cachedImage;
    const providerErrors = [];
    let providerAttempts = 0;
    let taxon = null;
    if (!image) {
      const taxonResult = await runtime.db.query<TaxonImageRow>(`
        SELECT genus, family, taxon_order, taxon_class, phylum, kingdom, is_virus
        FROM col_taxon_usage
        WHERE status = 'accepted'
          AND rank = 'species'
          AND (
            scientific_name = $1
            OR regexp_replace(scientific_name, '^[×x]\\s*', '') = $2
          )
        LIMIT 1
      `, [scientificName, scientificName.replace(/^[×x]\s*/i, '')]);
      taxon = taxonResult.rows[0];

      const imageProviders: Array<(name: string) => Promise<SpeciesImage | null>> = [
        findInaturalistImage,
        findGbifImage,
        (name) => findCommonsImage(name, { exactName: name }),
      ];
      for (const findImage of imageProviders) {
        providerAttempts += 1;
        try {
          image = await findImage(scientificName);
          if (image) {
            break;
          }
        } catch (error) {
          providerErrors.push(error);
        }
      }

      if (!image && taxon) {
        providerAttempts += 1;
        try {
          image = await findCommonsRepresentative(taxon);
        } catch (error) {
          providerErrors.push(error);
        }
      }
    }

    if (!image && providerErrors.length === providerAttempts) {
      runtime.log.error(`All image providers failed for "${scientificName}".`);
      ctx.throw(502, 'Image providers are temporarily unavailable.');
    }
    if (!image && providerErrors.length > 0) {
      runtime.log.warn(`At least one image provider failed for "${scientificName}"; skipping negative cache.`);
      ctx.body = { data: null };
      return;
    }

    let galleryImages: SpeciesImage[] = [];
    let galleryVersion = 0;
    if (includeGallery && image) {
      try {
        const gallery = await collectSpeciesImages(scientificName, image);
        galleryImages = gallery.images;
        if (gallery.errors.length > 0) {
          runtime.log.warn(`Some image gallery providers failed for "${scientificName}".`);
        } else {
          galleryVersion = 1;
        }
      } catch (error) {
        runtime.log.warn(`Could not load additional images for "${scientificName}": ${errorMessage(error)}`);
        galleryImages = [image];
      }
    } else if (includeGallery) {
      galleryVersion = 1;
    }

    const ttlDays = image ? IMAGE_CACHE_TTL_DAYS : EMPTY_IMAGE_CACHE_TTL_DAYS;
    await runtime.db.query(`
      INSERT INTO col_species_image_cache (
        scientific_name_key, image_url, source, attribution, license, reference_url,
        is_representative, representative_rank, representative_taxon_name, fallback_version,
        gallery_images, gallery_version, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12,
        now() + ($13::int * interval '1 day'))
      ON CONFLICT (scientific_name_key) DO UPDATE SET
        image_url = EXCLUDED.image_url,
        source = EXCLUDED.source,
        attribution = EXCLUDED.attribution,
        license = EXCLUDED.license,
        reference_url = EXCLUDED.reference_url,
        is_representative = EXCLUDED.is_representative,
        representative_rank = EXCLUDED.representative_rank,
        representative_taxon_name = EXCLUDED.representative_taxon_name,
        fallback_version = EXCLUDED.fallback_version,
        gallery_images = EXCLUDED.gallery_images,
        gallery_version = EXCLUDED.gallery_version,
        fetched_at = now(),
        expires_at = EXCLUDED.expires_at
    `, [
      cacheKey,
      image?.url ?? null,
      image?.source ?? null,
      image?.attribution ?? null,
      image?.license ?? null,
      image?.referenceUrl ?? null,
      image?.isRepresentative ?? false,
      image?.representativeRank ?? null,
      image?.representativeTaxonName ?? null,
      1,
      JSON.stringify(galleryImages),
      galleryVersion,
      ttlDays,
    ]);

    ctx.body = {
      data: image
        ? { ...image, ...(includeGallery ? { images: galleryImages } : {}) }
        : null,
    };
  },
  };
  return controller;
}
