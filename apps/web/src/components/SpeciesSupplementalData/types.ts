import type { SpeciesEnrichment } from '../../types/species';

export interface SpeciesSupplementalDataProps {
  enrichment: SpeciesEnrichment | undefined;
  isLoading: boolean;
  hasError: boolean;
  onRetry(): void;
}
