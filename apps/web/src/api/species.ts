import { apiGet } from './client';
import type {
  CatalogFacetField,
  CatalogFacetResponse,
  SpeciesDetailResponse,
  SpeciesResponse,
} from '../types/species';

export interface SpeciesFilters {
  search: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  habitat: string[];
  source: string;
  extinct: string;
  page: number;
  sort: 'relevance' | 'scientific' | 'common';
}

export type CatalogFacetFilters = Omit<SpeciesFilters, 'search' | 'page' | 'sort'>;

export function getSpecies(filters: SpeciesFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: '48',
    sort: filters.sort,
  });

  if (filters.search.trim()) {
    params.set('search', filters.search.trim());
  }

  if (filters.kingdom) {
    params.set('kingdom', filters.kingdom);
  }

  for (const field of ['phylum', 'class', 'order', 'family', 'genus'] as const) {
    if (filters[field]) {
      params.set(field, filters[field]);
    }
  }

  for (const habitat of filters.habitat) {
    params.append('habitat', habitat);
  }
  if (filters.source) {
    params.set('source', filters.source);
  }

  if (filters.extinct) {
    params.set('extinct', filters.extinct);
  }

  return apiGet<SpeciesResponse>(`/catalog/species?${params}`, signal);
}

export function getSpeciesDetails(externalId: string, signal?: AbortSignal) {
  return apiGet<SpeciesDetailResponse>(
    `/catalog/species/${encodeURIComponent(externalId)}`,
    signal,
  );
}

export function getCatalogFacetOptions(
  field: CatalogFacetField,
  filters: CatalogFacetFilters,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ field });
  for (const name of [
    'kingdom',
    'phylum',
    'class',
    'order',
    'family',
    'genus',
    'source',
  ] as const) {
    if (filters[name]) {
      params.set(name, filters[name]);
    }
  }
  for (const habitat of filters.habitat) {
    params.append('habitat', habitat);
  }
  if (filters.extinct) {
    params.set('extinct', filters.extinct);
  }

  return apiGet<CatalogFacetResponse>(`/catalog/facets?${params}`, signal);
}
