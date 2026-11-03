import { useEffect, useState, type SyntheticEvent } from 'react';
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
  const [enrichmentRefresh, setEnrichmentRefresh] = useState({
    speciesId: species.documentId,
    revision: 0,
  });
  const enrichmentRefreshRevision = enrichmentRefresh.speciesId === species.documentId
    ? enrichmentRefresh.revision
    : 0;
  const imageQuery = useQuery({
    queryKey: ['species-image', species.scientificName, 'detail-gallery-v1'],
    queryFn: ({ signal }) => getSpeciesImage(species.scientificName, signal, true),
    staleTime: (query) => query.state.data?.url
      ? 30 * 24 * 60 * 60 * 1000
      : 5 * 60 * 1000,
    gcTime: 60 * 24 * 60 * 60 * 1000,
    retry: false,
  });
  const enrichmentQuery = useQuery({
    queryKey: ['species-enrichment', species.documentId, enrichmentRefreshRevision],
    queryFn: ({ signal }) => getSpeciesEnrichment(
      species.documentId,
      signal,
      enrichmentRefreshRevision > 0,
    ),
    staleTime: 24 * 60 * 60 * 1000,
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
  const photos: SpeciesDetailPhoto[] = [
    ...(editorialImage
      ? [{
          url: editorialImage,
          fullscreenUrl: editorialImage,
          alt: species.image?.alternativeText ?? species.commonName,
          credit: null,
        }]
      : []),
    ...apiImages.map((photo: SpeciesImagePhoto) => ({
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
  const hasGbifErrors = enrichmentQuery.data?.data.errors.includes('GBIF') ?? false;
  const hasMediaSidebar = enrichmentQuery.isLoading
    || hasGbifErrors
    || (gbifEnrichment !== null
      && gbifEnrichment !== undefined
      && (gbifEnrichment.sourceErrors.length > 0
        || (gbifEnrichment.occurrenceCount ?? 0) > 0
        || gbifEnrichment.sounds.length > 0));
  const retryEnrichment = () => {
    setEnrichmentRefresh((current) => ({
      speciesId: species.documentId,
      revision: current.speciesId === species.documentId
        ? current.revision + 1
        : 1,
    }));
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
    retryEnrichment,
    hasMediaSidebar,
    onImageError,
  };
}
