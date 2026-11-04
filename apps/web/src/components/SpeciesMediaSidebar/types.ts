import type { SpeciesEnrichment } from '../../types/species';

export interface SpeciesMediaSidebarProps {
  enrichment: SpeciesEnrichment | undefined;
  hasError: boolean;
  isFetching: boolean;
  onRefresh(): void;
}
