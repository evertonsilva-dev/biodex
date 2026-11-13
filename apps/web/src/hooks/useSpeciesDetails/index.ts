import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GalleryItem } from 'react-image-gallery';
import { apiOrigin } from '../../api/client';
import { getSpeciesEnrichment } from '../../api/species-enrichment';
import { getSpeciesImage, type SpeciesImagePhoto } from '../../api/species-image';
import type { SpeciesDetail } from '../../types/species';
import type { SpeciesDetailPhoto } from './types';

export function useSpeciesDetails(species: SpeciesDetail) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [failedImageUrls, setFailedImageUrls] = useState<string[]>([]);
  const forceEnrichmentRefresh = useRef(false);
  const imageQuery = useQuery({
    queryKey: ['species-image', species.id, 'detail-gallery-v2'],
    queryFn: ({ signal }) => getSpeciesImage(species.id, species.scientificName, signal, true),
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 24 * 60 * 60 * 1000,
    retry: false,
  });
  const enrichmentQuery = useQuery({
    queryKey: ['species-enrichment', species.documentId],
    queryFn: ({ signal }) => getSpeciesEnrichment(
      species.documentId,
      signal,
      forceEnrichmentRefresh.current,
    ),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 24 * 60 * 60 * 1000,
    retry: false,
  });
  const editorialImage = species.image?.url
    ? new URL(
        species.image.url,
        apiOrigin,
      ).toString()
    : undefined;
  const apiImages = imageQuery.data?.images?.length
    ? imageQuery.data.images
    : imageQuery.data
      ? [imageQuery.data]
      : [];
  const bestPhoto = apiImages.find((photo) => photo.isBestPhoto);
  const photos: SpeciesDetailPhoto[] = [
    ...(bestPhoto
      ? [{
          url: bestPhoto.url,
          fullscreenUrl: bestPhoto.fullscreenUrl ?? bestPhoto.url,
          alt: species.image?.alternativeText ?? species.commonName,
          credit: bestPhoto,
        }]
      : []),
    ...(editorialImage && editorialImage !== bestPhoto?.url
      ? [{
          url: editorialImage,
          fullscreenUrl: editorialImage,
          alt: species.image?.alternativeText ?? species.commonName,
          credit: null,
        }]
      : []),
    ...apiImages
      .filter((photo) => photo.url !== bestPhoto?.url)
      .map((photo: SpeciesImagePhoto) => ({
      url: photo.url,
      fullscreenUrl: photo.fullscreenUrl ?? photo.url,
      alt: photo.isRepresentative
        ? `Imagem representativa de ${photo.representativeRank ?? 'grupo taxonômico'} ${photo.representativeTaxonName ?? species.scientificName}`
        : (species.image?.alternativeText ?? species.commonName),
      credit: photo,
      })),
  ];
  const visiblePhotos = photos.filter((photo) => !failedImageUrls.includes(photo.url));
  const selectedPhoto = visiblePhotos[selectedImageIndex] ?? visiblePhotos[0];
  const imageCredit = selectedPhoto?.credit;
  const galleryItems: GalleryItem[] = visiblePhotos.map((photo) => ({
    original: photo.url,
    fullscreen: photo.fullscreenUrl,
    thumbnail: photo.url,
    originalAlt: photo.alt,
    thumbnailAlt: photo.alt,
    thumbnailTitle: photo.credit
      ? `${photo.credit.attribution} · ${photo.credit.license} · ${photo.credit.source}`
      : 'Imagem editorial',
    loading: 'lazy',
    thumbnailLoading: 'lazy',
  }));
  const galleryKey = galleryItems.map((item) => item.original).join('|');

  useEffect(() => {
    setSelectedImageIndex(0);
    setFailedImageUrls([]);
  }, [species.documentId]);

  const onImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const failedUrl = event.currentTarget.currentSrc || event.currentTarget.src;
    const failedIndex = visiblePhotos.findIndex((photo) => photo.url === failedUrl);
    if (failedIndex < 0) return;

    setFailedImageUrls((current) => (
      current.includes(failedUrl) ? current : [...current, failedUrl]
    ));
    setSelectedImageIndex((current) => (
      failedIndex < current
        ? current - 1
        : Math.min(current, Math.max(0, visiblePhotos.length - 2))
    ));
  };

  const gbifEnrichment = enrichmentQuery.data?.data.gbif;
  const hasEnrichmentWarning = enrichmentQuery.isError
    || Boolean(enrichmentQuery.data?.data.errors.length);
  const hasMediaSidebar = Boolean(
    hasEnrichmentWarning
      || (gbifEnrichment
        && ((gbifEnrichment.occurrenceCount ?? 0) > 0 || gbifEnrichment.sounds.length > 0)),
  );
  const refreshEnrichment = async () => {
    forceEnrichmentRefresh.current = true;
    try {
      await enrichmentQuery.refetch();
    } finally {
      forceEnrichmentRefresh.current = false;
    }
  };

  return {
    selectedImageIndex,
    setSelectedImageIndex,
    selectedPhoto,
    visiblePhotos,
    galleryItems,
    galleryKey,
    imageCredit,
    enrichmentQuery,
    hasMediaSidebar,
    refreshEnrichment,
    onImageError,
  };
}
