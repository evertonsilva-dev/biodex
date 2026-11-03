const sketchfabSearchUrl = 'https://api.sketchfab.com/v3/search';

export interface SketchfabModel {
  uid: string;
  name: string;
  modelPageUrl: string;
  thumbnailUrl: string | null;
  creator: string;
  license: string;
  matchLabel: string;
}

interface SearchModel extends SketchfabModel {
  description: string;
  tags: string[];
}

interface RankedSearchModel extends SearchModel {
  score: number;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : null;
}

function sketchfabPageUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'sketchfab.com'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function sketchfabThumbnailUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'media.sketchfab.com'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function parseModel(value: unknown): SearchModel | null {
  const model = asRecord(value);
  const user = asRecord(model?.user);
  const license = asRecord(model?.license);
  const thumbnails = asRecord(model?.thumbnails);
  const images = Array.isArray(thumbnails?.images) ? thumbnails.images : [];
  const tags = Array.isArray(model?.tags)
    ? model.tags
      .map(asRecord)
      .flatMap((tag) => typeof tag?.name === 'string' ? [tag.name] : [])
    : [];
  const thumbnailUrl = images
    .map(asRecord)
    .map((image) => sketchfabThumbnailUrl(image?.url))
    .find((url): url is string => url !== null) ?? null;

  if (
    typeof model?.uid !== 'string'
    || !/^[a-f\d]{32}$/i.test(model.uid)
    || typeof model.name !== 'string'
  ) {
    return null;
  }

  const modelPageUrl = sketchfabPageUrl(model.viewerUrl);
  if (!modelPageUrl) return null;

  return {
    uid: model.uid,
    name: model.name,
    modelPageUrl,
    thumbnailUrl,
    creator: typeof user?.displayName === 'string'
      ? user.displayName
      : 'Autor não informado',
    license: typeof license?.label === 'string'
      ? license.label
      : 'Licença não informada',
    matchLabel: '',
    description: typeof model.description === 'string' ? model.description : '',
    tags,
  };
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function scientificNameCore(scientificName: string): string {
  const withoutAuthorship = scientificName.replace(/\s*\([^)]*\).*$/, '');
  return normalizeText(withoutAuthorship).split(' ').slice(0, 2).join(' ');
}

function containsAllWords(text: string, words: string[]): boolean {
  const normalized = ` ${normalizeText(text)} `;
  return words.every((word) => normalized.includes(` ${word} `));
}

function rankModel(
  model: SearchModel,
  scientificName: string,
  commonName: string,
): RankedSearchModel | null {
  const scientificCore = scientificNameCore(scientificName);
  const scientificWords = scientificCore.split(' ').filter(Boolean);
  if (scientificWords.length < 2) return null;

  const title = normalizeText(model.name);
  const description = normalizeText(model.description);
  const tags = model.tags.map(normalizeText);
  const metadataFields = [title, description, tags.join(' ')];
  const scientificPhrase = ` ${scientificCore} `;
  let score = 0;
  let matchLabel = '';

  if (` ${title} `.includes(scientificPhrase)) {
    score = 500;
    matchLabel = 'Nome científico no título';
  } else if (containsAllWords(title, scientificWords)) {
    score = 450;
    matchLabel = 'Nome científico no título';
  } else if (` ${description} `.includes(scientificPhrase)) {
    score = 400;
    matchLabel = 'Nome científico na descrição';
  } else if (containsAllWords(description, scientificWords)) {
    score = 350;
    matchLabel = 'Nome científico na descrição';
  } else if (tags.some((tag) => ` ${tag} `.includes(scientificPhrase))) {
    score = 300;
    matchLabel = 'Nome científico nas tags';
  } else if (containsAllWords(tags.join(' '), scientificWords)) {
    score = 250;
    matchLabel = 'Nome científico nos metadados';
  }

  if (score === 0) {
    const commonWords = normalizeText(commonName).split(' ').filter(Boolean);
    if (commonWords.length === 0) return null;
    if (containsAllWords(title, commonWords)) {
      score = 150;
    } else if (metadataFields.slice(1).some((field) => containsAllWords(field, commonWords))) {
      score = 100;
    }
    if (score > 0) matchLabel = 'Nome comum · conferir identificação';
  }

  return score > 0 ? { ...model, matchLabel, score } : null;
}

async function fetchModels(query: string, signal?: AbortSignal): Promise<SearchModel[]> {
  const url = new URL(sketchfabSearchUrl);
  url.searchParams.set('type', 'models');
  url.searchParams.set('q', query);
  url.searchParams.set('count', '24');

  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`A busca no Sketchfab respondeu com status ${response.status}.`);
  }

  const payload = asRecord(await response.json());
  if (!Array.isArray(payload?.results)) {
    throw new Error('A resposta da busca do Sketchfab não é válida.');
  }

  return payload.results.flatMap((result) => {
    const model = parseModel(result);
    return model ? [model] : [];
  });
}

export async function searchSketchfabModels(
  scientificName: string,
  commonName: string,
  signal?: AbortSignal,
): Promise<SketchfabModel[]> {
  const scientificQuery = scientificName.trim();
  if (!scientificQuery) {
    throw new Error('O nome científico é necessário para buscar modelos.');
  }

  const primaryResults = await fetchModels(scientificQuery, signal);
  let rankedModels = primaryResults
    .flatMap((model) => {
      const ranked = rankModel(model, scientificQuery, commonName);
      return ranked ? [ranked] : [];
    });

  const hasScientificMatches = rankedModels.some(
    (model) => !model.matchLabel.startsWith('Nome comum'),
  );
  if (
    !hasScientificMatches
    && commonName.trim()
    && normalizeText(commonName) !== normalizeText(scientificQuery)
  ) {
    const fallbackResults = await fetchModels(commonName.trim(), signal);
    rankedModels = [
      ...rankedModels,
      ...fallbackResults
      .flatMap((model) => {
        const ranked = rankModel(model, scientificQuery, commonName);
        return ranked ? [ranked] : [];
      }),
    ];
  }

  const uniqueModels = new Map<string, RankedSearchModel>();
  for (const model of rankedModels) {
    const current = uniqueModels.get(model.uid);
    if (!current || model.score > current.score) {
      uniqueModels.set(model.uid, model);
    }
  }

  return [...uniqueModels.values()]
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
    .slice(0, 5)
    .map(({ description: _description, tags: _tags, score: _score, ...model }) => model);
}
