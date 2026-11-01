import type { SpeciesImagePhoto } from '../../api/species-image';

export interface SpeciesDetailPhoto {
  url: string;
  fullscreenUrl: string;
  alt: string;
  credit: SpeciesImagePhoto | null;
}
