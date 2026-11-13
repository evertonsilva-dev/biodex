import { z } from 'zod';

const openAlexAuthorSchema = z.object({
  author: z.object({
    display_name: z.string().nullable().optional(),
  }).nullable().optional(),
}).passthrough();

const openAlexWorkSchema = z.object({
  id: z.string().optional(),
  doi: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  publication_year: z.number().int().nullable().optional(),
  authorships: z.array(openAlexAuthorSchema).optional().default([]),
  primary_location: z.object({
    landing_page_url: z.string().nullable().optional(),
    source: z.object({
      display_name: z.string().nullable().optional(),
    }).nullable().optional(),
  }).nullable().optional(),
  open_access: z.object({
    is_oa: z.boolean().optional(),
    oa_url: z.string().nullable().optional(),
  }).nullable().optional(),
}).passthrough();

const openAlexResponseSchema = z.object({
  results: z.array(openAlexWorkSchema),
});

const scientificArticleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  authors: z.array(z.string()),
  authorCount: z.number().int().nonnegative(),
  year: z.number().int().positive().nullable(),
  journal: z.string().nullable(),
  doi: z.string().nullable(),
  url: z.string().url(),
  openAccessUrl: z.string().url().nullable(),
  isOpenAccess: z.boolean(),
});

export type ScientificArticle = z.infer<typeof scientificArticleSchema>;

const cachedArticlesSchema = z.array(scientificArticleSchema);
const MAX_SEARCH_NAMES = 6;
const MAX_RESULTS = 5;

function safeHttpsUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizedDoi(value: string | null | undefined): string | null {
  if (!value) return null;
  const doi = value.trim().replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '');
  return /^10\.\d{4,9}\/\S+$/i.test(doi) ? doi : null;
}

function articleFromWork(
  work: z.infer<typeof openAlexWorkSchema>,
): ScientificArticle | null {
  const title = work.title?.trim();
  const doi = normalizedDoi(work.doi);
  const doiUrl = doi ? `https://doi.org/${doi}` : null;
  const openAccessUrl = safeHttpsUrl(work.open_access?.oa_url);
  const landingPageUrl = safeHttpsUrl(work.primary_location?.landing_page_url);
  const openAlexUrl = safeHttpsUrl(work.id);
  const url = openAccessUrl ?? doiUrl ?? landingPageUrl ?? openAlexUrl;

  if (!title || !url) return null;

  const authors = work.authorships
    .map(({ author }) => author?.display_name?.trim() ?? '')
    .filter(Boolean)
    .slice(0, 3);

  return {
    id: openAlexUrl ?? doiUrl ?? url,
    title,
    authors,
    authorCount: work.authorships.length,
    year: work.publication_year && work.publication_year > 0
      ? work.publication_year
      : null,
    journal: work.primary_location?.source?.display_name?.trim() || null,
    doi,
    url,
    openAccessUrl,
    isOpenAccess: work.open_access?.is_oa ?? false,
  };
}

function buildSearchQuery(names: string[]): string {
  const phrases = [...new Set(names
    .map((name) => name
      .replace(/[\u0000-\u001f"\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter((name) => name.length >= 3))]
    .slice(0, MAX_SEARCH_NAMES)
    .map((name) => `"${name}"`);

  return phrases.join(' OR ');
}

export function parseCachedScientificArticles(value: unknown): ScientificArticle[] {
  const result = cachedArticlesSchema.safeParse(value);
  if (!result.success) {
    throw new Error('Scientific article cache contains invalid data.');
  }
  return result.data;
}

export async function searchOpenAlexArticles(
  names: string[],
  apiKey?: string,
): Promise<ScientificArticle[]> {
  const searchQuery = buildSearchQuery(names);
  if (!searchQuery) return [];

  const params = new URLSearchParams({
    'search.title_and_abstract': searchQuery,
    per_page: '25',
    select: 'id,doi,title,publication_year,authorships,primary_location,open_access',
  });
  if (apiKey?.trim()) {
    params.set('api_key', apiKey.trim());
  }

  const response = await fetch(`https://api.openalex.org/works?${params}`, {
    headers: { 'User-Agent': 'Biodex/1.0 (biodiversity catalog)' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`OpenAlex responded with status ${response.status}.`);
  }

  const payload = openAlexResponseSchema.parse(await response.json());
  const articles: ScientificArticle[] = [];
  const seen = new Set<string>();

  for (const work of payload.results) {
    const article = articleFromWork(work);
    if (!article) continue;

    const key = article.doi?.toLocaleLowerCase('en') ?? article.id;
    if (seen.has(key)) continue;
    seen.add(key);
    articles.push(article);

    if (articles.length === MAX_RESULTS) break;
  }

  return articles;
}
