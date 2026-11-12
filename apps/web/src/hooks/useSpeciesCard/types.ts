import type { RefObject } from 'react';
import type { SpeciesImagePhoto } from '../../api/species-image';

export interface UseSpeciesCardResult {
  artworkRef: RefObject<HTMLDivElement>;
  kingdomColor: string;
  image?: string;
  imageCredit: SpeciesImagePhoto | null;
  representativeTaxonName?: string | null;
  representativeRankLabel: string;
  imageFailed: boolean;
  imageAlt: string;
  taxonomy: string;
  imageQueryError: boolean;
  imageQueryPending: boolean;
  onImageError(): void;
}

export interface UseSpeciesCardOptions {
  includeGallery?: boolean;
}
