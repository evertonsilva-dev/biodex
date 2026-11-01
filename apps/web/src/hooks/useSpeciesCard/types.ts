import type { RefObject } from 'react';
import type { Species } from '../../types/species';
import type { SpeciesImageResult } from '../../api/species-image';

export interface UseSpeciesCardResult {
  artworkRef: RefObject<HTMLDivElement>;
  kingdomColor: string;
  image?: string;
  imageCredit: SpeciesImageResult | null;
  representativeTaxonName?: string | null;
  representativeRankLabel: string;
  imageFailed: boolean;
  imageAlt: string;
  taxonomy: string;
  imageQueryError: boolean;
  onImageError(): void;
}

export interface UseSpeciesCardOptions {
  species: Species;
}
