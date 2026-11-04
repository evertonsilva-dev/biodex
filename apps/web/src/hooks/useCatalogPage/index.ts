import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCatalogFacetOptions, getSpecies } from '../../api/species';
import { getEnvironmentValues } from '../../utils/environment-label';
import type {
  CatalogFacetOption,
  TaxonomyFacetField,
} from '../../types/species';
import type { CatalogFilters, CatalogUrlState } from './types';

const SEARCH_DEBOUNCE_MS = 400;
export const MIN_SEARCH_LENGTH = 3;
const taxonomyOrder: TaxonomyFacetField[] = [
  'kingdom',
  'phylum',
  'class',
  'order',
  'family',
  'genus',
];

function readCatalogUrl(): CatalogUrlState {
  const params = new URLSearchParams(window.location.search);
  const filters: CatalogFilters = {
    kingdom: params.get('kingdom') ?? '',
    phylum: params.get('phylum') ?? '',
    class: params.get('class') ?? '',
    order: params.get('order') ?? '',
    family: params.get('family') ?? '',
    genus: params.get('genus') ?? '',
    habitat: [...new Set(params.getAll('habitat').flatMap(getEnvironmentValues))],
    source: params.get('source') ?? '',
    extinct: params.get('extinct') === 'true' || params.get('extinct') === 'false'
      ? params.get('extinct') ?? ''
      : '',
  };
  const ancestors: TaxonomyFacetField[] = ['kingdom', 'phylum', 'class', 'order', 'family'];
  for (let index = 0; index < ancestors.length; index += 1) {
    if (!filters[ancestors[index]]) {
      for (const descendant of taxonomyOrder.slice(index + 1)) {
        filters[descendant] = '';
      }
      break;
    }
  }
  const requestedPage = Number(params.get('page'));
  const requestedSort = params.get('sort');

  return {
    search: params.get('search') ?? '',
    filters,
    page: Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 1_000_000
      ? requestedPage
      : 1,
    sort: requestedSort === 'scientific' || requestedSort === 'common'
      ? requestedSort
      : 'relevance',
  };
}

function writeCatalogUrl(state: CatalogUrlState, mode: 'push' | 'replace'): void {
  const url = new URL(window.location.href);
  const values: Record<string, string> = {
    search: state.search.trim(),
    kingdom: state.filters.kingdom,
    phylum: state.filters.phylum,
    class: state.filters.class,
    order: state.filters.order,
    family: state.filters.family,
    genus: state.filters.genus,
    source: state.filters.source,
    extinct: state.filters.extinct,
    page: state.page > 1 ? String(state.page) : '',
    sort: state.sort === 'relevance' ? '' : state.sort,
  };
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  url.searchParams.delete('habitat');
  for (const habitat of state.filters.habitat) {
    url.searchParams.append('habitat', habitat);
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', nextUrl);
  }
}

function resetDescendants(
  filters: CatalogFilters,
  field: TaxonomyFacetField,
  value: string,
): CatalogFilters {
  const updated = { ...filters, [field]: value };
  const fieldIndex = taxonomyOrder.indexOf(field);
  for (const descendant of taxonomyOrder.slice(fieldIndex + 1)) {
    updated[descendant] = '';
  }
  return updated;
}

export function optionsWithSelected(
  options: CatalogFacetOption[],
  selected: string | string[],
): CatalogFacetOption[] {
  const selectedValues = Array.isArray(selected) ? selected : [selected];
  const missingOptions = selectedValues
    .filter((value) => value && !options.some((option) => option.value === value))
    .map((value) => ({ value, label: value }));
  return [...missingOptions, ...options];
}

export function useCatalogPage() {
  const [catalogState, setCatalogState] = useState(readCatalogUrl);
  const { search, filters, page } = catalogState;
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const handlePopState = () => {
      const nextState = readCatalogUrl();
      setCatalogState(nextState);
      setDebouncedSearch(nextState.search.trim());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const searchTerm = debouncedSearch.length >= MIN_SEARCH_LENGTH ? debouncedSearch : '';
  const kingdomOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'kingdom', filters],
    queryFn: ({ signal }) => getCatalogFacetOptions('kingdom', filters, signal),
  });
  const phylumOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'phylum', filters],
    queryFn: ({ signal }) => getCatalogFacetOptions('phylum', filters, signal),
    enabled: Boolean(filters.kingdom),
  });
  const classOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'class', filters],
    queryFn: ({ signal }) => getCatalogFacetOptions('class', filters, signal),
    enabled: Boolean(filters.phylum),
  });
  const orderOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'order', filters],
    queryFn: ({ signal }) => getCatalogFacetOptions('order', filters, signal),
    enabled: Boolean(filters.class),
  });
  const familyOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'family', filters],
    queryFn: ({ signal }) => getCatalogFacetOptions('family', filters, signal),
    enabled: Boolean(filters.order),
  });
  const genusOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'genus', filters],
    queryFn: ({ signal }) => getCatalogFacetOptions('genus', filters, signal),
    enabled: Boolean(filters.family),
  });
  const habitatOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'habitat', filters],
    queryFn: ({ signal }) => getCatalogFacetOptions('habitat', filters, signal),
  });
  const sourceOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'source', filters],
    queryFn: ({ signal }) => getCatalogFacetOptions('source', filters, signal),
  });
  const facetQueries = [
    kingdomOptionsQuery,
    phylumOptionsQuery,
    classOptionsQuery,
    orderOptionsQuery,
    familyOptionsQuery,
    genusOptionsQuery,
    habitatOptionsQuery,
    sourceOptionsQuery,
  ];
  const speciesQuery = useQuery({
    queryKey: ['species', searchTerm, filters, page, catalogState.sort],
    queryFn: ({ signal }) => getSpecies({
      ...filters,
      search: searchTerm,
      page,
      sort: catalogState.sort,
    }, signal),
  });

  const retryCatalog = () => {
    if (speciesQuery.isError) void speciesQuery.refetch();
    for (const query of facetQueries) {
      if (query.isError) void query.refetch();
    }
  };
  const isRetryingCatalog = speciesQuery.isFetching || facetQueries.some((query) => query.isFetching);
  const navigateToCatalogState = (nextState: CatalogUrlState, mode: 'push' | 'replace') => {
    writeCatalogUrl(nextState, mode);
    setCatalogState(nextState);
  };
  const updateTaxonomyFilter = (field: TaxonomyFacetField, value: string) => {
    navigateToCatalogState({
      ...catalogState,
      filters: resetDescendants(filters, field, value),
      page: 1,
    }, 'push');
  };
  const updateExtinctionFilter = (value: string) => {
    navigateToCatalogState({
      ...catalogState,
      filters: { ...filters, extinct: value },
      page: 1,
    }, 'push');
  };
  const updateHabitatFilter = (habitat: string[]) => {
    navigateToCatalogState({
      ...catalogState,
      filters: { ...filters, habitat },
      page: 1,
    }, 'push');
  };
  const updateSourceFilter = (source: string) => {
    navigateToCatalogState({
      ...catalogState,
      filters: { ...filters, source },
      page: 1,
    }, 'push');
  };
  const updateSearch = (value: string) => {
    navigateToCatalogState({ ...catalogState, search: value, page: 1 }, 'replace');
  };
  const updatePage = (nextPage: number) => {
    navigateToCatalogState({ ...catalogState, page: nextPage }, 'push');
  };
  const updateSort = (sort: CatalogUrlState['sort']) => {
    navigateToCatalogState({ ...catalogState, sort, page: 1 }, 'push');
  };
  const clearFilters = () => {
    navigateToCatalogState({
      ...catalogState,
      filters: {
        kingdom: '',
        phylum: '',
        class: '',
        order: '',
        family: '',
        genus: '',
        habitat: [],
        source: '',
        extinct: '',
      },
      page: 1,
    }, 'push');
  };
  const clearCatalog = () => {
    navigateToCatalogState({
      search: '',
      filters: {
        kingdom: '',
        phylum: '',
        class: '',
        order: '',
        family: '',
        genus: '',
        habitat: [],
        source: '',
        extinct: '',
      },
      page: 1,
      sort: catalogState.sort,
    }, 'push');
  };

  return {
    catalogState,
    filters,
    search,
    page,
    sort: catalogState.sort,
    searchTerm,
    kingdomOptionsQuery,
    phylumOptionsQuery,
    classOptionsQuery,
    orderOptionsQuery,
    familyOptionsQuery,
    genusOptionsQuery,
    habitatOptionsQuery,
    sourceOptionsQuery,
    facetQueries,
    speciesQuery,
    retryCatalog,
    isRetryingCatalog,
    updateTaxonomyFilter,
    updateExtinctionFilter,
    updateHabitatFilter,
    updateSourceFilter,
    updateSearch,
    updatePage,
    updateSort,
    clearFilters,
    clearCatalog,
  };
}
