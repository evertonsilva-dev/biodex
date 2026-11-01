import { useSpeciesCard } from '../../hooks/useSpeciesCard';
import type { SpeciesCardProps } from './types';
import {
  Card,
  CardDetailsLink,
  Artwork,
  ArtworkImage,
  ArtworkFallback,
  ImageCredit,
  CardBody,
  KingdomLabel,
  Name,
  ScientificName,
  Taxonomy,
  Description,
} from './styles';

export function SpeciesCard({ species }: SpeciesCardProps) {
  const {
    artworkRef,
    kingdomColor,
    image,
    imageCredit,
    imageFailed,
    imageAlt,
    taxonomy,
    imageQueryError,
    onImageError,
    representativeTaxonName,
    representativeRankLabel,
  } = useSpeciesCard(species);

  return (
    <Card $kingdomColor={kingdomColor}>
      <Artwork
        ref={artworkRef}
        $kingdomColor={kingdomColor}
      >
        {image && !imageFailed ? (
          <ArtworkImage
            src={image}
            alt={imageAlt}
            loading="lazy"
            onError={onImageError}
          />
        ) : (
          <ArtworkFallback>
            <span aria-hidden="true">✳</span>
            {imageQueryError && <small>Não foi possível buscar a imagem</small>}
          </ArtworkFallback>
        )}
        {imageCredit && !imageFailed && (
          <ImageCredit
            href={imageCredit.referenceUrl}
            target="_blank"
            rel="noreferrer"
            title={`${imageCredit.attribution} · ${imageCredit.license} · ${imageCredit.source}`}
          >
            {imageCredit.isRepresentative
              ? `Imagem representativa: ${representativeRankLabel} ${representativeTaxonName ?? species.scientificName}`
              : 'Imagem da espécie'}
            : {imageCredit.attribution} · {imageCredit.license} · {imageCredit.source}
          </ImageCredit>
        )}
      </Artwork>
      <CardBody>
        <KingdomLabel $kingdomColor={kingdomColor}>
          <span aria-hidden="true">●</span>
          {species.kingdom?.name ?? 'Reino não informado'}
        </KingdomLabel>
        <Name>{species.commonName}</Name>
        <ScientificName>{species.scientificName}</ScientificName>
        {taxonomy && <Taxonomy aria-label={`Classificação taxonômica: ${taxonomy}`}>{taxonomy}</Taxonomy>}
        {species.description && <Description>{species.description}</Description>}
      </CardBody>
      <CardDetailsLink
        $kingdomColor={kingdomColor}
        href={`/species/${encodeURIComponent(species.documentId)}${window.location.search}`}
        aria-label={`Ver detalhes de ${species.commonName} (${species.scientificName})`}
        title={`Ver detalhes de ${species.commonName}`}
      />
    </Card>
  );
}
