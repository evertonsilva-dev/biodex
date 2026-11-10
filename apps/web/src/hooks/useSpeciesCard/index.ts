import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiOrigin } from '../../api/client';
import { getSpeciesImage } from '../../api/species-image';
import type { Species } from '../../types/species';
import type { UseSpeciesCardResult } from './types';

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

export function useSpeciesCard(species: Species): UseSpeciesCardResult {
  const artworkRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const kingdomColor = species.kingdom?.color || '#64748b';
  const editorialImage = species.image?.url
    ? new URL(
        species.image.url,
        apiOrigin,
      ).toString()
    : undefined;
  const imageQuery = useQuery({
    queryKey: ['species-image', species.id, 'hierarchical-v3'],
    queryFn: ({ signal }) => getSpeciesImage(species.id, species.scientificName, signal),
    enabled: isNearViewport && !editorialImage,
    staleTime: (query) => query.state.data?.url
      ? 30 * 24 * 60 * 60 * 1000
      : 5 * 60 * 1000,
    gcTime: 60 * 24 * 60 * 60 * 1000,
    retry: false,
  });
  const image = editorialImage || imageQuery.data?.url;
  const imageCredit = editorialImage ? null : imageQuery.data ?? null;
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

  useEffect(() => setImageFailed(false), [image]);

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
    onImageError: () => setImageFailed(true),
  };
}
