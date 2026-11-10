import { apiGet } from './client';

export interface SpeciesImagePhoto {
  url: string;
  fullscreenUrl?: string;
  source: string;
  attribution: string;
  license: string;
  referenceUrl: string;
  isRepresentative?: boolean;
  representativeRank?: string | null;
  representativeTaxonName?: string | null;
}

export interface SpeciesImageResult extends SpeciesImagePhoto {
  images?: SpeciesImagePhoto[];
}

interface SpeciesImageResponse {
  data: SpeciesImageResult | null;
}

export async function getSpeciesImage(
  taxonId: string | number,
  scientificName: string,
  signal?: AbortSignal,
  includeGallery = false,
): Promise<SpeciesImageResult | null> {
  const params = new URLSearchParams({
    taxonId: String(taxonId),
    scientificName,
  });
  if (includeGallery) {
    params.set('gallery', 'true');
  }
  const result = await apiGet<SpeciesImageResponse>(`/catalog/image?${params}`, signal);
  return result.data;
}
