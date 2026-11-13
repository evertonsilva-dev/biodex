import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiOrigin } from '../../api/client';
import { getSpeciesImage } from '../../api/species-image';
import type { Species } from '../../types/species';
import type { UseSpeciesCardOptions, UseSpeciesCardResult } from './types';

const representativeRankLabels: Record<string, string> = {
  genus: 'gênero',
  family: 'família',
  order: 'ordem',
  class: 'classe',
  phylum: 'filo',
  kingdom: 'reino',
};

const rankLabels: Record<string, string> = {
  phylum: 'Filo',
  subphylum: 'Subfilo',
  class: 'Classe',
  subclass: 'Subclasse',
  order: 'Ordem',
  suborder: 'Subordem',
  family: 'Família',
  subfamily: 'Subfamília',
  genus: 'Gênero',
};

export function useSpeciesCard(
  species: Species,
  { includeGallery = false }: UseSpeciesCardOptions = {},
): UseSpeciesCardResult {
  const artworkRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [failedImageUrls, setFailedImageUrls] = useState<string[]>([]);
  const kingdomColor = species.kingdom?.color || '#64748b';
  const editorialImage = species.image?.url
    ? new URL(
        species.image.url,
        apiOrigin,
      ).toString()
    : undefined;
  const imageQuery = useQuery({
    queryKey: ['species-image', species.id, includeGallery ? 'detail-gallery-v2' : 'hierarchical-v3'],
    queryFn: ({ signal }) => getSpeciesImage(species.id, species.scientificName, signal, includeGallery),
    enabled: isNearViewport && (!editorialImage || includeGallery),
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 24 * 60 * 60 * 1000,
    retry: false,
  });
  const apiImages = imageQuery.data?.images?.length
    ? imageQuery.data.images
    : imageQuery.data
      ? [imageQuery.data]
      : [];
  const selectedApiImage = apiImages.find(
    ({ isBestPhoto, url }) => isBestPhoto && !failedImageUrls.includes(url),
  ) ?? apiImages.find(({ url }) => !failedImageUrls.includes(url));
  const useEditorialImage = Boolean(
    !selectedApiImage?.isBestPhoto
      && editorialImage
      && !failedImageUrls.includes(editorialImage),
  );
  const image = useEditorialImage ? editorialImage : selectedApiImage?.url;
  const imageCredit = useEditorialImage ? null : selectedApiImage ?? null;
  const imageFailed = !image && failedImageUrls.length > 0;
  const representativeRankLabel = imageCredit?.representativeRank
    ? representativeRankLabels[imageCredit.representativeRank] ?? 'grupo taxonômico'
    : 'grupo taxonômico';
  const imageAlt = imageCredit?.isRepresentative
    ? `Imagem representativa: ${representativeRankLabel} ${imageCredit.representativeTaxonName ?? species.scientificName}`
    : species.image?.alternativeText ?? species.commonName;

  useEffect(() => {
    const element = artworkRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setFailedImageUrls([]);
  }, [species.documentId]);

  const onImageError = () => {
    if (!image) return;
    setFailedImageUrls((current) => (
      current.includes(image) ? current : [...current, image]
    ));
  };

  const taxonomy = [
    ...(species.kingdom ? [species.kingdom.name] : []),
    ...(species.taxon?.taxonomy ?? []).map(
      ({ rank, name }) => `${rankLabels[rank] ?? rank}: ${name}`,
    ),
  ].join(' / ');

  return {
    artworkRef,
    kingdomColor,
    image,
    imageCredit,
    representativeTaxonName: imageCredit?.representativeTaxonName,
    representativeRankLabel,
    imageFailed,
    imageAlt,
    taxonomy,
    imageQueryError: imageQuery.isError,
    imageQueryPending: imageQuery.isPending,
    onImageError,
  };
}
