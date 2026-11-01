import type { CatalogRuntime } from '../../http/catalog.types.js';
import { z } from 'zod';

interface NaturalistTaxon {
  id: number;
  name: string;
  is_active: boolean;
  rank: string;
  preferred_common_name?: string | null;
  wikipedia_url?: string | null;
  wikipedia_summary?: string | null;
  observations_count?: number;
  conservation_status?: {
    status?: string;
    status_name?: string;
    authority?: string | null;
    url?: string | null;
  } | null;
}

interface NaturalistResponse {
  results?: NaturalistTaxon[];
}

interface GbifMatch {
  usageKey?: number;
  rank?: string;
  scientificName?: string;
}

interface GbifOccurrence {
  speciesKey?: number;
  species?: string;
  scientificName?: string;
  key: string | number;
  media?: Array<{
    identifier?: string;
    license?: string;
    format?: string;
    creator?: string;
    type?: string;
    references?: string;
  }>;
}

interface GbifOccurrenceResponse {
  count?: number | null;
  results?: GbifOccurrence[];
  facets?: Array<{
    field: string;
    counts?: Array<{ name: string; count: number }>;
  }>;
}

interface PbdbRecord {
  tna?: string;
  oei?: string;
  lei?: string;
  eag?: number;
  lag?: number;
  stp?: string;
  cc2?: string;
  ref?: string;
}

interface PbdbResponse {
  records?: PbdbRecord[];
}

interface EnrichmentSpecies {
  external_id: string;
  scientific_name: string;
  source_id: string | null;
  extinct: boolean | string | null;
  kingdom: string | null;
  is_virus: boolean;
  data_source: string;
}

interface EnrichmentPayload {
  scientificName: string;
  inaturalist: Awaited<ReturnType<typeof fetchInaturalist>> | null;
  gbif: Awaited<ReturnType<typeof fetchGbif>> | null;
  pbdb: Awaited<ReturnType<typeof fetchPbdb>> | null;
  viralzoneUrl: string | null;
  errors: string[];
}

const CACHE_TTL_DAYS = 30;
const PARTIAL_CACHE_TTL_HOURS = 12;
const MAX_SOUNDS = 8;
const MAX_PBDB_OCCURRENCES = 100;
const enrichmentPayloadSchema = z.object({
  scientificName: z.string(),
  inaturalist: z.object({
    taxonUrl: z.string(),
    commonName: z.string().nullable(),
    summary: z.string().nullable(),
    summaryUrl: z.string().nullable(),
    observations: z.number().nullable(),
    conservation: z.object({
      status: z.string(),
      label: z.string(),
      authority: z.string().nullable(),
      url: z.string().nullable(),
    }).nullable(),
  }).nullable(),
  gbif: z.object({
    taxonKey: z.number(),
    taxonUrl: z.string(),
    occurrenceCount: z.number().nullable(),
    countries: z.array(z.object({ code: z.string(), records: z.number() })),
    sounds: z.array(z.object({
      url: z.string(),
      source: z.string(),
      scientificName: z.string().nullable(),
      creator: z.string().nullable(),
      license: z.string(),
      referenceUrl: z.string().nullable(),
      gbifRecordUrl: z.string(),
    })),
    sourceErrors: z.array(z.string()),
  }).nullable(),
  pbdb: z.object({
    taxonUrl: z.string(),
    occurrenceSampleCount: z.number(),
    intervals: z.array(z.string()),
    oldestAgeMa: z.number().nullable(),
    youngestAgeMa: z.number().nullable(),
    localities: z.array(z.object({ label: z.string(), records: z.number() })),
    references: z.array(z.string()),
  }).nullable(),
  viralzoneUrl: z.string().nullable(),
  errors: z.array(z.string()),
});
const CC_LICENSES = new Map([
  ['zero', 'CC0'],
  ['cc0', 'CC0'],
  ['cc-by', 'CC BY'],
  ['cc-by-sa', 'CC BY-SA'],
  ['cc-by-nc', 'CC BY-NC'],
  ['cc-by-nc-sa', 'CC BY-NC-SA'],
  ['cc-by-nd', 'CC BY-ND'],
  ['cc-by-nc-nd', 'CC BY-NC-ND'],
]);

export class SupplementalDataUnavailableError extends Error {}

function canonicalTaxonName(value: string): string {
  return value
    .trim()
    .replace(/^[×x]\s*/i, '')
    .replace(/\s*\([^)]*\).*$/, '')
    .split(/\s+/)
    .slice(0, 2)
    .join(' ')
    .toLocaleLowerCase('en');
}

function httpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function licenseName(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLocaleLowerCase('en');
  const match = normalized.match(/(?:creativecommons\.org\/licenses\/|creativecommons\.org\/publicdomain\/)([^/]+)/);
  const code = match
    ? normalized.includes('/licenses/')
      ? `cc-${match[1]}`
      : match[1]
    : normalized;
  return CC_LICENSES.get(code) ??
    (/^public domain$/i.test(value.trim()) ? 'Public domain' : null);
}

function plainText(value: unknown): string {
  return typeof value === 'string'
    ? value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/\s+/g, ' ')
        .trim()
    : '';
}

async function fetchJson<T>(url: string, timeout = 10000): Promise<T> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Biodex/1.0 (biodiversity catalog)' },
    signal: AbortSignal.timeout(timeout),
  });
  if (!response.ok) {
    throw new Error(`Provider responded with status ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

async function fetchInaturalist(scientificName: string) {
  const params = new URLSearchParams({ q: scientificName, per_page: '10' });
  const result = await fetchJson<NaturalistResponse>(
    `https://api.inaturalist.org/v1/taxa/autocomplete?${params}`,
  );
  const taxon = result.results?.find((candidate) =>
    candidate.is_active &&
    candidate.rank === 'species' &&
    canonicalTaxonName(candidate.name) === canonicalTaxonName(scientificName),
  );
  if (!taxon) {
    return null;
  }
  const detailResult = await fetchJson<NaturalistResponse>(
    `https://api.inaturalist.org/v1/taxa/${taxon.id}`,
  );
  const detailedTaxon = detailResult.results?.[0];
  if (!detailedTaxon) {
    throw new Error('iNaturalist did not return taxon details.');
  }

  const wikipediaUrl = httpsUrl(
    typeof detailedTaxon.wikipedia_url === 'string'
      ? detailedTaxon.wikipedia_url.replace(/^http:/i, 'https:')
      : null,
  );
  const conservation = {
    ...(taxon.conservation_status || {}),
    ...(detailedTaxon.conservation_status || {}),
  };
  const rawStatusUrl = conservation.url || taxon.conservation_status?.url;
  const statusUrl = httpsUrl(
    typeof rawStatusUrl === 'string'
      ? rawStatusUrl.replace(/^http:/i, 'https:')
      : null,
  );

  return {
    taxonUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,
    commonName: detailedTaxon.preferred_common_name || taxon.preferred_common_name || null,
    summary: plainText(detailedTaxon.wikipedia_summary) || null,
    summaryUrl: wikipediaUrl,
    observations: Number.isFinite(detailedTaxon.observations_count)
      ? detailedTaxon.observations_count
      : null,
    conservation: conservation?.status
      ? {
          status: conservation.status,
          label: conservation.status_name || conservation.status,
          authority: conservation.authority || null,
          url: statusUrl,
        }
      : null,
  };
}

function parseGbifAudio(occurrences: GbifOccurrence[], speciesKey: number) {
  const sounds = [];
  const seen = new Set();
  for (const occurrence of occurrences) {
    if (occurrence.speciesKey !== speciesKey) {
      continue;
    }
    for (const media of occurrence.media || []) {
      const url = httpsUrl(media.identifier);
      const license = licenseName(media.license);
      const format = typeof media.format === 'string' ? media.format : '';
      const creator = typeof media.creator === 'string' ? media.creator.trim() : '';
      if (
        media.type !== 'Sound' ||
        !url ||
        !license ||
        (!creator && license !== 'CC0' && license !== 'Public domain') ||
        (!format.toLocaleLowerCase('en').startsWith('audio/') &&
          !/\.(?:mp3|m4a|wav|ogg|oga)(?:$|[?#])/i.test(url)) ||
        seen.has(url)
      ) {
        continue;
      }

      seen.add(url);
      sounds.push({
        url,
        source: 'GBIF',
        scientificName: occurrence.scientificName || null,
        creator: creator || null,
        license,
        referenceUrl: httpsUrl(media.references),
        gbifRecordUrl: `https://www.gbif.org/occurrence/${occurrence.key}`,
      });
      if (sounds.length >= MAX_SOUNDS) {
        return sounds;
      }
    }
  }
  return sounds;
}

async function fetchGbif(scientificName: string, includeSounds: boolean) {
  const matchParams = new URLSearchParams({
    name: scientificName,
    strict: 'true',
  });
  const match = await fetchJson<GbifMatch>(
    `https://api.gbif.org/v1/species/match?${matchParams}`,
  );
  if (
    !match.usageKey ||
    match.rank?.toLocaleLowerCase('en') !== 'species' ||
    canonicalTaxonName(match.scientificName || '') !== canonicalTaxonName(scientificName)
  ) {
    return null;
  }
  const speciesKey = match.usageKey;
  if (speciesKey === undefined) return null;

  const occurrenceParams = new URLSearchParams({
    taxonKey: String(speciesKey),
    limit: '1',
    facet: 'country',
    facetLimit: '8',
  });
  const occurrenceTasks = [
    fetchJson<GbifOccurrenceResponse>(`https://api.gbif.org/v1/occurrence/search?${occurrenceParams}`),
  ];
  if (includeSounds) {
    const soundParams = new URLSearchParams({
      taxonKey: String(speciesKey),
      mediaType: 'Sound',
      limit: '100',
    });
    occurrenceTasks.push(
      fetchJson<GbifOccurrenceResponse>(`https://api.gbif.org/v1/occurrence/search?${soundParams}`),
    );
  }

  const results = await Promise.allSettled(occurrenceTasks);
  const occurrenceResult = results[0];
  const soundResult = includeSounds ? results[1] : null;
  const countries = occurrenceResult.status === 'fulfilled'
    ? occurrenceResult.value.facets?.find((facet) => facet.field === 'COUNTRY')?.counts
        ?.slice(0, 5)
        .map((item) => ({ code: item.name, records: item.count })) || []
    : [];
  const sounds = soundResult?.status === 'fulfilled'
    ? parseGbifAudio(soundResult.value.results || [], speciesKey)
    : [];
  const sourceErrors = [];
  if (occurrenceResult.status === 'rejected') {
    sourceErrors.push(`falha ao consultar ocorrências (${occurrenceResult.reason.message})`);
  }
  if (soundResult?.status === 'rejected') {
    sourceErrors.push(`falha ao consultar gravações (${soundResult.reason.message})`);
  }

  return {
    taxonKey: speciesKey,
    taxonUrl: `https://www.gbif.org/species/${speciesKey}`,
    occurrenceCount: occurrenceResult.status === 'fulfilled'
      ? occurrenceResult.value.count
      : null,
    countries,
    sounds,
    sourceErrors,
  };
}

async function fetchPbdb(scientificName: string, sourceId: string | null) {
  const params = new URLSearchParams({
    base_name: scientificName,
    show: 'time,loc,ref',
    limit: String(MAX_PBDB_OCCURRENCES),
  });
  const result = await fetchJson<PbdbResponse>(
    `https://paleobiodb.org/data1.2/occs/list.json?${params}`,
    20000,
  );
  const expectedName = canonicalTaxonName(scientificName);
  const records = (result.records || []).filter((record) =>
    canonicalTaxonName(record.tna || '') === expectedName,
  );
  if (records.length === 0) {
    return null;
  }

  const intervals = [...new Set(
    records.flatMap((record) => [record.oei, record.lei]).filter(Boolean),
  )].slice(0, 8);
  const ages = records
    .flatMap((record) => [record.eag, record.lag])
    .filter((age): age is number => typeof age === 'number' && Number.isFinite(age));
  const localityCounts = new Map();
  for (const record of records) {
    if (!record.cc2 && !record.stp) {
      continue;
    }
    const label = [record.stp, record.cc2].filter(Boolean).join(', ');
    localityCounts.set(label, (localityCounts.get(label) || 0) + 1);
  }
  const localities = [...localityCounts.entries()]
    .map(([label, count]) => ({ label, records: count }))
    .sort((left, right) => right.records - left.records)
    .slice(0, 8);
  const taxonNumber = typeof sourceId === 'string'
    ? sourceId.replace(/^txn:/, '')
    : null;

  return {
    taxonUrl: taxonNumber
      ? `https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=${encodeURIComponent(taxonNumber)}`
      : 'https://paleobiodb.org/',
    occurrenceSampleCount: records.length,
    intervals,
    oldestAgeMa: ages.length > 0 ? Math.max(...ages) : null,
    youngestAgeMa: ages.length > 0 ? Math.min(...ages) : null,
    localities,
    references: [...new Set(records.map((record) => record.ref).filter(Boolean))].slice(0, 3),
  };
}

function parsePayload(value: unknown): EnrichmentPayload {
  let payload: unknown = value;
  if (typeof value === 'string') {
    try {
      payload = JSON.parse(value) as unknown;
    } catch {
      throw new Error('Species enrichment cache contains invalid JSON.');
    }
  }
  const result = enrichmentPayloadSchema.safeParse(payload);
  if (!result.success) {
    throw new Error('Species enrichment cache contains invalid data.');
  }
  return result.data;
}

async function loadSpeciesEnrichment(
  runtime: CatalogRuntime,
  species: EnrichmentSpecies,
): Promise<EnrichmentPayload> {
  const cacheResult = await runtime.db.query(`
    SELECT payload, expires_at > now() AS is_fresh
    FROM col_species_enrichment_cache
    WHERE external_id = $1
  `, [species.external_id]);
  if (cacheResult.rows[0]?.is_fresh) {
    return parsePayload(cacheResult.rows[0].payload);
  }

  const requests: Promise<void>[] = [];
  const failures: string[] = [];
  const payload: EnrichmentPayload = {
    scientificName: species.scientific_name,
    inaturalist: null,
    gbif: null,
    pbdb: null,
    viralzoneUrl: null,
    errors: [],
  };
  const isVirus = species.is_virus === true;
  const isAnimal = String(species.kingdom || '').toLocaleLowerCase('en') === 'animalia';
  const isExtinct = String(species.extinct).toLocaleLowerCase('en') === 'true';
  const isFossilSource = species.data_source === 'Paleobiology Database';
  const providersAttempted = Number(!isVirus) * 2 +
    Number(!isVirus && (isExtinct || isFossilSource));

  if (!isVirus) {
    requests.push(
      fetchInaturalist(species.scientific_name)
        .then((data) => { payload.inaturalist = data; })
        .catch((error) => {
          runtime.log.warn(`iNaturalist enrichment failed for "${species.scientific_name}": ${error.message}`);
          failures.push('iNaturalist');
        }),
    );
  } else {
    payload.viralzoneUrl = 'https://viralzone.expasy.org/';
  }

  if (!isVirus) {
    requests.push(
      fetchGbif(species.scientific_name, isAnimal && !isExtinct)
        .then((data) => {
          payload.gbif = data;
          if (data?.sourceErrors?.length) {
            runtime.log.warn(
              `Some GBIF data is unavailable for "${species.scientific_name}": ${data.sourceErrors.join('; ')}`,
            );
            failures.push('GBIF');
          }
        })
        .catch((error) => {
          runtime.log.warn(`GBIF enrichment failed for "${species.scientific_name}": ${error.message}`);
          failures.push('GBIF');
        }),
    );
  }

  if (isExtinct || isFossilSource) {
    requests.push(
      fetchPbdb(species.scientific_name, species.source_id)
        .then((data) => { payload.pbdb = data; })
        .catch((error) => {
          runtime.log.warn(`PBDB enrichment failed for "${species.scientific_name}": ${error.message}`);
          failures.push('PBDB');
        }),
    );
  }
  await Promise.all(requests);

  if (providersAttempted > 0 && failures.length >= providersAttempted) {
    throw new SupplementalDataUnavailableError(
      `All species enrichment sources failed: ${failures.join(', ')}.`,
    );
  }
  payload.errors = [...new Set(failures)];

  const cacheTtl = failures.length > 0
    ? `${PARTIAL_CACHE_TTL_HOURS} hours`
    : `${CACHE_TTL_DAYS} days`;
  await runtime.db.query(`
    INSERT INTO col_species_enrichment_cache (external_id, payload, expires_at)
    VALUES ($1, $2::jsonb, now() + $3::interval)
    ON CONFLICT (external_id) DO UPDATE SET
      payload = EXCLUDED.payload,
      fetched_at = now(),
      expires_at = EXCLUDED.expires_at
  `, [species.external_id, JSON.stringify(payload), cacheTtl]);
  return payload;
}

export { loadSpeciesEnrichment };
