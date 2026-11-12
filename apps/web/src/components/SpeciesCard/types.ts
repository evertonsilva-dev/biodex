import type { Species } from '../../types/species';

export interface SpeciesCardProps {
  species: Species;
  preview?: boolean;
  comparisonSelectionMode?: boolean;
  comparisonSelected?: boolean;
  comparisonDisabled?: boolean;
  onComparisonToggle?(): void;
}
