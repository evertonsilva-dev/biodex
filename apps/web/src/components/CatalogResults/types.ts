import type { SpeciesResponse } from '../../types/species';

export interface CatalogActiveFilter {
  id: string;
  label: string;
  onRemove(): void;
}

export interface CatalogResultsProps {
  data?: SpeciesResponse;
  activeFilters: CatalogActiveFilter[];
  isPending: boolean;
  isError: boolean;
  isRetrying: boolean;
  page: number;
  sort: 'relevance' | 'scientific' | 'common';
  onRetry(): void;
  onClearAll(): void;
  onPageChange(nextPage: number): void;
  onSortChange(sort: 'relevance' | 'scientific' | 'common'): void;
}
