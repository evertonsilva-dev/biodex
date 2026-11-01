import type { SpeciesResponse } from '../../types/species';

export interface CatalogResultsProps {
  data?: SpeciesResponse;
  isPending: boolean;
  isError: boolean;
  isRetrying: boolean;
  page: number;
  onRetry(): void;
  onPageChange(nextPage: number): void;
}
