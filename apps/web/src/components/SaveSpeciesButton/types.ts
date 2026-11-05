import type { Species, SpeciesDetail } from '../../types/species';

export interface SaveSpeciesButtonProps {
  species: Species | SpeciesDetail;
  variant?: 'card' | 'detail';
}
