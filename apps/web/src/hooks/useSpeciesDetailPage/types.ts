import type { SpeciesDetail } from '../../types/species';

export interface SpeciesDetailPageState {
  species?: SpeciesDetail;
  isLoading: boolean;
  hasError: boolean;
}
