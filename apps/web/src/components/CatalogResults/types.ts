import type { SpeciesResponse } from '../../types/species';

export interface CatalogResultsProps {
  data?: SpeciesResponse;
  isPending: boolean;
  isError: boolean;
  isRetrying: boolean;
  page: number;
  sort: 'relevance' | 'scientific' | 'common';
  onRetry(): void;
  onPageChange(nextPage: number): void;
  onSortChange(sort: 'relevance' | 'scientific' | 'common'): void;
}
