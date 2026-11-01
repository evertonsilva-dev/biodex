import type { CatalogFacetField, CatalogFacetOption } from '../../types/species';
import type { CatalogFilters } from '../../hooks/useCatalogPage/types';

export interface CatalogFilterPanelProps {
  filters: CatalogFilters;
  options: Record<CatalogFacetField, CatalogFacetOption[]>;
  hasError: boolean;
  isRetrying: boolean;
  onTaxonomyChange(field: CatalogFacetField, value: string): void;
  onExtinctionChange(checked: boolean): void;
  onRetry(): void;
}
