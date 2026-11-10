type TaxonomyLevel = 'phylum' | 'class' | 'order' | 'family' | 'genus';

export const IMAGE_CACHE_VERSION = 'v5';
export const IMAGE_CACHE_TTL_DAYS = 180;
export const EMPTY_IMAGE_CACHE_TTL_DAYS = 14;

export interface SpeciesImage {
  url: string;
  fullscreenUrl?: string;
  source: string;
  attribution: string;
  license: string;
  referenceUrl: string;
  isRepresentative?: boolean;
  representativeRank?: string | null;
  representativeTaxonName?: string | null;
}

interface ProviderPhoto {
  id: string | number;
  license_code?: string | null;
  url?: string | null;
  medium_url?: string | null;
  attribution?: string | null;
}

interface ProviderTaxon {
  id: number;
  name: string;
  is_active: boolean;
  rank: string;
  default_photo?: ProviderPhoto | null;
}

interface InaturalistTaxaResponse {
  results?: ProviderTaxon[];
}

interface InaturalistObservation {
  photos?: ProviderPhoto[];
}

interface InaturalistObservationsResponse {
  results?: InaturalistObservation[];
}

interface GbifSpeciesMatch {
  rank?: string;
  status?: string;
  canonicalName?: string;
  speciesKey?: number;
  usageKey?: number;
}

interface GbifOccurrence {
  key: string | number;
  species?: string;
  license?: string;
  media?: Array<{
    type?: string;
    identifier?: string;
    license?: string;
    creator?: string;
    rightsHolder?: string;
    references?: string;
  }>;
}

interface GbifOccurrencesResponse {
  results?: GbifOccurrence[];
}

interface CommonsImageInfo {
  mime?: string;
  thumburl?: string;
  url?: string;
  descriptionurl?: string;
  extmetadata?: Record<string, { value?: string } | undefined>;
}

interface CommonsPage {
  index: number;
  title: string;
  imageinfo?: CommonsImageInfo[];
}

interface CommonsResponse {
  query?: { pages?: Record<string, CommonsPage> };
}

export interface TaxonImageRow {
  genus: string | null;
  family: string | null;
  taxon_order: string | null;
  taxon_class: string | null;
  phylum: string | null;
  kingdom: string | null;
  is_virus: boolean;
}

const IMAGE_LICENSES = new Map([
  ['zero', 'CC0'],
  ['cc0', 'CC0'],
  ['cc-by', 'CC BY'],
  ['cc-by-sa', 'CC BY-SA'],
  ['cc-by-nc', 'CC BY-NC'],
  ['cc-by-nc-sa', 'CC BY-NC-SA'],
  ['cc-by-nd', 'CC BY-ND'],
  ['cc-by-nc-nd', 'CC BY-NC-ND'],
]);

export function normalizeTaxonName(value: string): string {
  return value
    .trim()
    .replace(/^[×x]\s*/i, '')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en');
}

function canonicalTaxonName(value: string): string {
  const withoutAuthorship = value.trim().replace(/^\s*[×x]\s*/, '').replace(/\s*\([^)]*\).*$/, '');
  return withoutAuthorship.split(/\s+/).slice(0, 2).join(' ').toLocaleLowerCase('en');
}

function canonicalScientificName(value: string): string {
  const withoutAuthorship = value.trim().replace(/^\s*[×x]\s*/, '').replace(/\s*\([^)]*\).*$/, '');
  return withoutAuthorship.split(/\s+/).slice(0, 2).join(' ');
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[_\W]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en');
}

function htmlText(value: unknown): string {
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

function parseCreativeCommonsLicense(value: unknown): string | null {
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
  return IMAGE_LICENSES.get(code) ?? (/^cc (?:by|by-sa|by-nc|by-nc-sa|by-nd|by-nc-nd)(?:\s|$)/i.test(value)
    ? value.trim().replace(/\s+/g, ' ')
    : /^public domain$/i.test(value.trim())
      ? 'Public domain'
      : null);
}

function parseHttpsUrl(value: unknown): string | null {
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

function fullResolutionImageUrl(image: Pick<SpeciesImage, 'url' | 'source'> & Partial<SpeciesImage>): string {
  if (typeof image.fullscreenUrl === 'string') {
    return parseHttpsUrl(image.fullscreenUrl) || image.url;
  }
  if (image.source === 'iNaturalist') {
    return parseHttpsUrl(
      image.url.replace(/\/(?:square|thumb|small|medium)\./, '/original.'),
    ) || image.url;
  }
  if (image.source === 'Wikimedia Commons') {
    const match = image.url.match(
      /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/thumb\/(.+)\/[^/]+$/,
    );
    return match
      ? parseHttpsUrl(`${match[1]}/${match[2]}`) || image.url
      : image.url;
  }
  return image.url;
}

function parseCachedImageGallery(value: unknown): SpeciesImage[] {
  let parsed: unknown = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value) as unknown;
    } catch {
      throw new Error('Cached image gallery contains invalid JSON.');
    }
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Cached image gallery must be a JSON array.');
  }
  return parsed.map((value): SpeciesImage => {
    if (
      typeof value !== 'object'
      || value === null
      || !('url' in value)
      || typeof value.url !== 'string'
      || !('source' in value)
      || typeof value.source !== 'string'
      || !('attribution' in value)
      || typeof value.attribution !== 'string'
      || !('license' in value)
      || typeof value.license !== 'string'
      || !('referenceUrl' in value)
      || typeof value.referenceUrl !== 'string'
    ) {
      throw new Error('Cached image gallery contains an invalid image.');
    }
    const image: SpeciesImage = {
      url: value.url,
      source: value.source,
      attribution: value.attribution,
      license: value.license,
      referenceUrl: value.referenceUrl,
      ...(typeof value.fullscreenUrl === 'string' ? { fullscreenUrl: value.fullscreenUrl } : {}),
      ...(typeof value.isRepresentative === 'boolean' ? { isRepresentative: value.isRepresentative } : {}),
      ...(typeof value.representativeRank === 'string' || value.representativeRank === null
        ? { representativeRank: value.representativeRank }
        : {}),
      ...(typeof value.representativeTaxonName === 'string' || value.representativeTaxonName === null
        ? { representativeTaxonName: value.representativeTaxonName }
        : {}),
    };
    return {
      ...image,
      fullscreenUrl: fullResolutionImageUrl(image),
    };
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Biodex/1.0 (biodiversity catalog)' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`Image provider responded with status ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

async function findInaturalistImage(scientificName: string): Promise<SpeciesImage | null> {
  const candidateNames = [...new Set([scientificName.trim(), canonicalScientificName(scientificName)])];

  for (const candidateName of candidateNames) {
    const params = new URLSearchParams({ q: candidateName, per_page: '10' });
    const result = await fetchJson<InaturalistTaxaResponse>(`https://api.inaturalist.org/v1/taxa/autocomplete?${params}`);
    const taxon = result.results?.find((candidate) =>
      candidate.is_active &&
      candidate.rank === 'species' &&
      canonicalTaxonName(candidate.name) === canonicalTaxonName(scientificName),
    );
    const photo = taxon?.default_photo;
    const license = parseCreativeCommonsLicense(photo?.license_code);
    const imageUrl = parseHttpsUrl(photo?.medium_url || photo?.url);

    if (photo && license && imageUrl) {
      return {
        url: imageUrl,
        fullscreenUrl: parseHttpsUrl(
          photo.url?.replace(/\/(?:square|thumb|small|medium)\./, '/original.'),
        ) || imageUrl,
        source: 'iNaturalist',
        attribution: photo.attribution || 'iNaturalist contributor',
        license,
        referenceUrl: `https://www.inaturalist.org/photos/${photo.id}`,
      };
    }
  }

  return null;
}

async function findInaturalistImages(taxonName: string, rank: string, limit = 8): Promise<SpeciesImage[]> {
  const taxonParams = new URLSearchParams({ q: taxonName, per_page: '10' });
  const taxonResult = await fetchJson<InaturalistTaxaResponse>(`https://api.inaturalist.org/v1/taxa/autocomplete?${taxonParams}`);
  const taxon = taxonResult.results?.find((candidate) =>
    candidate.is_active &&
    candidate.rank === rank &&
    canonicalTaxonName(candidate.name) === canonicalTaxonName(taxonName),
  );
  if (!taxon) {
    return [];
  }

  const observationParams = new URLSearchParams({
    taxon_id: String(taxon.id),
    photos: 'true',
    photo_license: 'cc0,cc-by,cc-by-sa,cc-by-nc,cc-by-nc-sa,cc-by-nd,cc-by-nc-nd',
    per_page: String(Math.min(limit * 2, 20)),
    order: 'desc',
    order_by: 'votes',
  });
  const observations = await fetchJson<InaturalistObservationsResponse>(
    `https://api.inaturalist.org/v1/observations?${observationParams}`,
  );
  const images = [];
  const seenUrls = new Set();
  for (const observation of observations.results || []) {
    for (const photo of observation.photos || []) {
      const license = parseCreativeCommonsLicense(photo.license_code);
      const imageUrl = parseHttpsUrl(photo.url?.replace('/square.', '/medium.'));
      if (!license || !imageUrl || seenUrls.has(imageUrl)) {
        continue;
      }

      seenUrls.add(imageUrl);
      images.push({
        url: imageUrl,
        fullscreenUrl: parseHttpsUrl(
          photo.url?.replace(/\/(?:square|thumb|small|medium)\./, '/original.'),
        ) || imageUrl,
        source: 'iNaturalist',
        attribution: photo.attribution || 'iNaturalist contributor',
        license,
        referenceUrl: `https://www.inaturalist.org/photos/${photo.id}`,
        isRepresentative: rank !== 'species',
        representativeRank: rank === 'species' ? null : rank,
        representativeTaxonName: rank === 'species' ? null : taxonName,
      });
      if (images.length >= limit) {
        return images;
      }
    }
  }
  return images;
}

async function findInaturalistRepresentative(searchName: string, rank: string): Promise<SpeciesImage | null> {
  const params = new URLSearchParams({ q: searchName, per_page: '10' });
  const result = await fetchJson<InaturalistTaxaResponse>(`https://api.inaturalist.org/v1/taxa/autocomplete?${params}`);
  const taxon = result.results?.find((candidate) =>
    candidate.is_active &&
    candidate.rank === rank &&
    canonicalTaxonName(candidate.name) === canonicalTaxonName(searchName),
  );
  const photo = taxon?.default_photo;
  const license = parseCreativeCommonsLicense(photo?.license_code);
  const imageUrl = parseHttpsUrl(photo?.medium_url || photo?.url);

  if (!photo || !license || !imageUrl) {
    return null;
  }

  return {
    url: imageUrl,
    fullscreenUrl: parseHttpsUrl(
      photo.url?.replace(/\/(?:square|thumb|small|medium)\./, '/original.'),
    ) || imageUrl,
    source: 'iNaturalist',
    attribution: photo.attribution || 'iNaturalist contributor',
    license,
    referenceUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,
    isRepresentative: true,
    representativeRank: rank,
    representativeTaxonName: searchName,
  };
}

async function findGbifImages(
  scientificName: string,
  limit = 8,
  taxon?: TaxonImageRow | null,
): Promise<SpeciesImage[]> {
  const matchParams = new URLSearchParams({ name: scientificName, strict: 'true' });
  const taxonomyParameters: Array<[string, string | null | undefined]> = [
    ['kingdom', taxon?.kingdom],
    ['phylum', taxon?.phylum],
    ['class', taxon?.taxon_class],
    ['order', taxon?.taxon_order],
    ['family', taxon?.family],
    ['genus', taxon?.genus],
  ];
  for (const [parameter, value] of taxonomyParameters) {
    if (value !== null && value !== undefined && value.length > 0) {
      matchParams.set(parameter, value);
    }
  }
  const match = await fetchJson<GbifSpeciesMatch>(`https://api.gbif.org/v1/species/match?${matchParams}`);
  const canonicalName = match.canonicalName ?? '';
  if (
    match.rank !== 'SPECIES' ||
    match.status !== 'ACCEPTED' ||
    canonicalTaxonName(canonicalName) !== canonicalTaxonName(scientificName)
  ) {
    return [];
  }

  const occurrenceParams = new URLSearchParams({
    taxonKey: String(match.speciesKey || match.usageKey),
    mediaType: 'StillImage',
    limit: '20',
  });
  const occurrences = await fetchJson<GbifOccurrencesResponse>(`https://api.gbif.org/v1/occurrence/search?${occurrenceParams}`);

  const images = [];
  const seenUrls = new Set();
  for (const occurrence of occurrences.results || []) {
    if (normalizeTaxonName(occurrence.species || '') !== normalizeTaxonName(canonicalName)) {
      continue;
    }
    for (const media of occurrence.media || []) {
      const license = parseCreativeCommonsLicense(media.license || occurrence.license);
      const imageUrl = parseHttpsUrl(media.identifier);
      if (media.type === 'StillImage' && license && imageUrl && !seenUrls.has(imageUrl)) {
        seenUrls.add(imageUrl);
        images.push({
          url: imageUrl,
          fullscreenUrl: imageUrl,
          source: 'GBIF',
          attribution: media.creator || media.rightsHolder || 'GBIF contributor',
          license,
          referenceUrl: parseHttpsUrl(media.references) || `https://www.gbif.org/occurrence/${occurrence.key}`,
        });
        if (images.length >= limit) {
          return images;
        }
      }
    }
  }

  return images;
}

async function findGbifImage(
  scientificName: string,
  taxon?: TaxonImageRow | null,
): Promise<SpeciesImage | null> {
  return (await findGbifImages(scientificName, 1, taxon))[0] ?? null;
}

function matchesCommonsName(page: CommonsPage, imageInfo: CommonsImageInfo, name: string): boolean {
  const canonicalName = normalizeSearchText(canonicalTaxonName(name));
  const metadata = imageInfo.extmetadata || {};
  const exactFields = [
    page.title,
    htmlText(metadata.ObjectName?.value),
    htmlText(metadata.ImageDescription?.value),
  ].map(normalizeSearchText);
  return exactFields.some((value) => value.includes(canonicalName));
}

function commonsImageRelevance(
  page: CommonsPage,
  imageInfo: CommonsImageInfo,
  name: string,
): number | null {
  const canonicalName = normalizeSearchText(canonicalTaxonName(name));
  const metadata = imageInfo.extmetadata || {};
  const title = normalizeSearchText(page.title);
  const objectName = normalizeSearchText(htmlText(metadata.ObjectName?.value));
  const description = normalizeSearchText(htmlText(metadata.ImageDescription?.value));
  const identifiedFields = [title, objectName, description];
  if (!identifiedFields.some((field) => field.includes(canonicalName))) {
    return null;
  }

  const mediaDescription = identifiedFields.join(' ');
  const nonPhotographicMedia = /\b(?:skull|skeleton|fossil|bones?|illustration|diagram|drawing|painting|map|distribution|logo|icon|statue|sculpture|figurine|toy|plush|taxidermy|stamp|coin)\b/;
  if (nonPhotographicMedia.test(mediaDescription)) {
    return null;
  }

  return (title.includes(canonicalName) ? 100 : 0)
    + (objectName.includes(canonicalName) ? 80 : 0)
    + (description.includes(canonicalName) ? 60 : 0);
}

interface CommonsImageOptions {
  exactName?: string;
  representative?: boolean;
  rank?: string | null;
  keywords?: string[];
  limit?: number;
}

function findCommonsImage(
  searchName: string,
  options?: CommonsImageOptions & { limit?: 1 },
): Promise<SpeciesImage | null>;
function findCommonsImage(
  searchName: string,
  options: CommonsImageOptions & { limit: number },
): Promise<SpeciesImage[]>;
async function findCommonsImage(
  searchName: string,
  { exactName, representative = false, rank = null, keywords = [], limit = 1 }: CommonsImageOptions = {},
): Promise<SpeciesImage | SpeciesImage[] | null> {
  const searchTerms = exactName
    ? [`"${canonicalScientificName(searchName)}"`, `"${canonicalScientificName(searchName)}" photo`]
    : keywords.map((keyword) => keyword ? `"${searchName}" ${keyword}` : `"${searchName}"`);

  const candidates: Array<{ image: SpeciesImage; relevance: number; index: number }> = [];
  const seenUrls = new Set();
  let candidateIndex = 0;
  for (const searchTerm of searchTerms) {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: searchTerm,
      gsrnamespace: '6',
      gsrlimit: '10',
      prop: 'imageinfo',
      iiprop: 'url|extmetadata|mime',
      iiurlwidth: '640',
      format: 'json',
      origin: '*',
    });
    const result = await fetchJson<CommonsResponse>(`https://commons.wikimedia.org/w/api.php?${params}`);
    const pages = Object.values(result.query?.pages || {}).sort((left, right) => left.index - right.index);

    for (const page of pages) {
      const imageInfo = page.imageinfo?.[0];
      if (
        !imageInfo
        || !imageInfo.mime?.startsWith('image/')
        || imageInfo.mime === 'image/svg+xml'
      ) {
        continue;
      }

      const imageUrl = parseHttpsUrl(imageInfo.thumburl || imageInfo.url);
      const fullscreenUrl = parseHttpsUrl(imageInfo.url);
      const descriptionUrl = parseHttpsUrl(imageInfo.descriptionurl);
      const metadata = imageInfo.extmetadata || {};
      const license = parseCreativeCommonsLicense(metadata.LicenseShortName?.value);
      if (!imageUrl || !descriptionUrl || !license) {
        continue;
      }

      const relevanceName = exactName || searchName;
      if (!matchesCommonsName(page, imageInfo, relevanceName)) {
        continue;
      }
      const relevance = commonsImageRelevance(page, imageInfo, relevanceName);
      if (relevance === null) {
        continue;
      }

      const attribution = htmlText(metadata.Artist?.value)
        || htmlText(metadata.Credit?.value)
        || 'Wikimedia Commons contributor';
      if (seenUrls.has(imageUrl)) {
        continue;
      }
      seenUrls.add(imageUrl);
      candidates.push({
        image: {
          url: imageUrl,
          fullscreenUrl: fullscreenUrl || imageUrl,
          source: 'Wikimedia Commons',
          attribution,
          license,
          referenceUrl: descriptionUrl,
          isRepresentative: representative,
          representativeRank: rank,
          representativeTaxonName: representative ? searchName : null,
        },
        relevance,
        index: candidateIndex,
      });
      candidateIndex += 1;
    }
  }

  const images = candidates
    .sort((left, right) => right.relevance - left.relevance || left.index - right.index)
    .slice(0, limit)
    .map(({ image }) => image);
  return limit === 1 ? images[0] ?? null : images;
}

async function findCommonsRepresentative(taxon: TaxonImageRow): Promise<SpeciesImage | null> {
  const isVirus = taxon.is_virus === true;
  const errors = [];
  const searchLevels = [
    { name: taxon.genus, rank: 'genus' },
    { name: taxon.family, rank: 'family' },
    { name: taxon.taxon_order, rank: 'order' },
    { name: taxon.taxon_class, rank: 'class' },
    { name: taxon.phylum, rank: 'phylum' },
    { name: taxon.kingdom, rank: 'kingdom' },
  ].filter((level): level is { name: string; rank: TaxonomyLevel | 'kingdom' } => Boolean(level.name));

  for (const level of searchLevels) {
    const keywords = isVirus
      ? ['virus virion', 'virus illustration', 'virus micrograph']
      : [''];
    for (const findImage of [
      () => findInaturalistRepresentative(level.name, level.rank),
      () => findCommonsImage(level.name, {
        representative: true,
        rank: level.rank,
        keywords,
      }),
    ]) {
      try {
        const image = await findImage();
        if (image) {
          return image;
        }
      } catch (error) {
        errors.push(error);
      }
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, 'Some representative image searches failed.');
  }
  return null;
}

async function collectSpeciesImages(
  scientificName: string,
  primaryImage: SpeciesImage,
  taxon?: TaxonImageRow | null,
): Promise<{ images: SpeciesImage[]; errors: unknown[] }> {
  const isRepresentative = primaryImage.isRepresentative === true;
  const taxonName = isRepresentative
    ? primaryImage.representativeTaxonName ?? scientificName
    : scientificName;
  const rank = isRepresentative ? primaryImage.representativeRank ?? 'species' : 'species';
  const commonsOptions = isRepresentative
    ? {
        representative: true,
        rank,
        keywords: [''],
        limit: 8,
      }
    : { exactName: scientificName, limit: 8 };
  const tasks: Array<() => Promise<SpeciesImage | SpeciesImage[] | null>> = [
    () => findInaturalistImages(taxonName, rank, 8),
    () => findCommonsImage(taxonName, commonsOptions),
  ];
  if (!isRepresentative) {
    tasks.push(() => findGbifImages(scientificName, 8, taxon));
  }

  const results = await Promise.allSettled(tasks.map((task) => task()));
  const errors = results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason);
  const collectedImages = results.flatMap((result) => {
    if (result.status !== 'fulfilled' || result.value === null) return [];
    return Array.isArray(result.value) ? result.value : [result.value];
  });
  const images = [];
  const seenUrls = new Set();
  for (const image of [primaryImage, ...collectedImages]) {
    if (image?.url && !seenUrls.has(image.url)) {
      seenUrls.add(image.url);
      images.push(image);
    }
    if (images.length >= 8) {
      break;
    }
  }

  return { images, errors };
}

export {
  collectSpeciesImages,
  findCommonsImage,
  findCommonsRepresentative,
  findGbifImage,
  findInaturalistImage,
  fullResolutionImageUrl,
  parseCachedImageGallery,
};
