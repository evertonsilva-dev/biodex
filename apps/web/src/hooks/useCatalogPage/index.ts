import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCatalogFacetOptions, getSpecies } from '../../api/species';
import type {
  CatalogFacetField,
  CatalogFacetOption,
} from '../../types/species';
import type { CatalogFilters, CatalogUrlState } from './types';

const SEARCH_DEBOUNCE_MS = 400;
export const MIN_SEARCH_LENGTH = 3;
const taxonomyOrder: CatalogFacetField[] = [
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
    extinct: params.get('extinct') === 'true' ? 'true' : '',
  };
  const ancestors: CatalogFacetField[] = ['kingdom', 'phylum', 'class', 'order', 'family'];
  for (let index = 0; index < ancestors.length; index += 1) {
    if (!filters[ancestors[index]]) {
      for (const descendant of taxonomyOrder.slice(index + 1)) {
        filters[descendant] = '';
      }
      break;
    }
  }
  const requestedPage = Number(params.get('page'));

  return {
    search: params.get('search') ?? '',
    filters,
    page: Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 1_000_000
      ? requestedPage
      : 1,
  };
}

function writeCatalogUrl(state: CatalogUrlState, mode: 'push' | 'replace'): void {
  const url = new URL(window.location.href);
  const values: Record<string, string> = {
    search: state.search.trim(),
    ...state.filters,
    page: state.page > 1 ? String(state.page) : '',
  };
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', nextUrl);
  }
}

function resetDescendants(
  filters: CatalogFilters,
  field: CatalogFacetField,
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
  selected: string,
): CatalogFacetOption[] {
  if (selected && !options.some((option) => option.value === selected)) {
    return [{ value: selected, label: selected }, ...options];
  }
  return options;
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
    queryKey: ['catalog-facet', 'kingdom', filters.extinct],
    queryFn: ({ signal }) => getCatalogFacetOptions('kingdom', filters, signal),
  });
  const phylumOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'phylum', filters.kingdom, filters.extinct],
    queryFn: ({ signal }) => getCatalogFacetOptions('phylum', filters, signal),
    enabled: Boolean(filters.kingdom),
  });
  const classOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'class', filters.kingdom, filters.phylum, filters.extinct],
    queryFn: ({ signal }) => getCatalogFacetOptions('class', filters, signal),
    enabled: Boolean(filters.phylum),
  });
  const orderOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'order', filters.kingdom, filters.phylum, filters.class, filters.extinct],
    queryFn: ({ signal }) => getCatalogFacetOptions('order', filters, signal),
    enabled: Boolean(filters.class),
  });
  const familyOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'family', filters.kingdom, filters.phylum, filters.class, filters.order, filters.extinct],
    queryFn: ({ signal }) => getCatalogFacetOptions('family', filters, signal),
    enabled: Boolean(filters.order),
  });
  const genusOptionsQuery = useQuery({
    queryKey: ['catalog-facet', 'genus', filters.kingdom, filters.phylum, filters.class, filters.order, filters.family, filters.extinct],
    queryFn: ({ signal }) => getCatalogFacetOptions('genus', filters, signal),
    enabled: Boolean(filters.family),
  });
  const facetQueries = [
    kingdomOptionsQuery,
    phylumOptionsQuery,
    classOptionsQuery,
    orderOptionsQuery,
    familyOptionsQuery,
    genusOptionsQuery,
  ];
  const speciesQuery = useQuery({
    queryKey: ['species', searchTerm, filters, page],
    queryFn: ({ signal }) => getSpecies({ ...filters, search: searchTerm, page }, signal),
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
  const updateTaxonomyFilter = (field: CatalogFacetField, value: string) => {
    navigateToCatalogState({
      ...catalogState,
      filters: resetDescendants(filters, field, value),
      page: 1,
    }, 'push');
  };
  const updateExtinctionFilter = (checked: boolean) => {
    navigateToCatalogState({
      ...catalogState,
      filters: { ...filters, extinct: checked ? 'true' : '' },
      page: 1,
    }, 'push');
  };
  const updateSearch = (value: string) => {
    navigateToCatalogState({ ...catalogState, search: value, page: 1 }, 'replace');
  };
  const updatePage = (nextPage: number) => {
    navigateToCatalogState({ ...catalogState, page: nextPage }, 'push');
  };

  return {
    catalogState,
    filters,
    search,
    page,
    searchTerm,
    kingdomOptionsQuery,
    phylumOptionsQuery,
    classOptionsQuery,
    orderOptionsQuery,
    familyOptionsQuery,
    genusOptionsQuery,
    facetQueries,
    speciesQuery,
    retryCatalog,
    isRetryingCatalog,
    updateTaxonomyFilter,
    updateExtinctionFilter,
    updateSearch,
    updatePage,
  };
}
