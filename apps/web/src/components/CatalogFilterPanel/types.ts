import type { CatalogFacetField, CatalogFacetOption, TaxonomyFacetField } from '../../types/species';
import type { CatalogFilters } from '../../hooks/useCatalogPage/types';

export interface CatalogFilterPanelProps {
  filters: CatalogFilters;
  options: Record<CatalogFacetField, CatalogFacetOption[]>;
  hasError: boolean;
  isRetrying: boolean;
  onTaxonomyChange(field: TaxonomyFacetField, value: string): void;
  onExtinctionChange(value: string): void;
  onAdditionalFilterChange(field: 'habitat' | 'source', value: string): void;
  onClearFilters(): void;
  onRetry(): void;
}
