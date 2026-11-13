import { apiGet } from './client';
import type { SpeciesArticlesResponse } from '../types/species';

export function getSpeciesArticles(
  externalId: string,
  signal?: AbortSignal,
) {
  return apiGet<SpeciesArticlesResponse>(
    `/catalog/species/${encodeURIComponent(externalId)}/articles`,
    signal,
  );
}
