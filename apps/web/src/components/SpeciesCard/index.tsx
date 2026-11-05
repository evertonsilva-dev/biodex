import { useSpeciesCard } from "../../hooks/useSpeciesCard";
import type { SpeciesCardProps } from "./types";
import {
  Card,
  CardDetailsLink,
  Artwork,
  ArtworkImage,
  ArtworkFallback,
  ArtworkMeta,
  ArtLabel,
  CardFooter,
  ImageCredit,
  Name,
  Taxonomy,
  SpecimenInfo,
  SideLabel,
} from "./styles";

export function SpeciesCard({ species, preview = false }: SpeciesCardProps) {
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
  const primaryTaxon = species.taxon?.taxonomy?.find(({ rank }) =>
    ["order", "class", "family"].includes(rank.toLowerCase()),
  );
  const classification = [species.kingdom?.name, primaryTaxon?.name]
    .filter(Boolean)
    .join(" · ");
  const documentCode = species.documentId.slice(-8).toUpperCase();

  return (
    <Card $kingdomColor={kingdomColor} $preview={preview}>
      <Artwork
        ref={artworkRef}
        $kingdomColor={kingdomColor}
        $hasImage={Boolean(image && !imageFailed)}
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
        <ArtworkMeta>
          <ArtLabel>{primaryTaxon?.name ?? "BIODIVERSIDADE"}</ArtLabel>
          <ArtLabel>{documentCode}</ArtLabel>
        </ArtworkMeta>
        <SideLabel title={species.commonName}>{species.commonName}</SideLabel>
        <SpecimenInfo>
          <Taxonomy
            aria-label={`Classificação taxonômica: ${classification || taxonomy}`}
          >
            {classification || taxonomy}
          </Taxonomy>
          <CardFooter>
            <Name>{species.scientificName}</Name>
            {/* <CardTag>ESPÉCIE</CardTag> */}
          </CardFooter>
          {imageCredit && !imageFailed && (
            <ImageCredit
              href={imageCredit.referenceUrl}
              target="_blank"
              rel="noreferrer"
              title={`${imageCredit.attribution} · ${imageCredit.license} · ${imageCredit.source}`}
            >
              {imageCredit.isRepresentative
                ? `Imagem representativa: ${representativeRankLabel} ${representativeTaxonName ?? species.scientificName}`
                : "Imagem da espécie"}
              : {imageCredit.attribution} · {imageCredit.license} ·{" "}
              {imageCredit.source}
            </ImageCredit>
          )}
        </SpecimenInfo>
      </Artwork>
      {!preview && (
        <CardDetailsLink
          $kingdomColor={kingdomColor}
          href={`/species/${encodeURIComponent(species.documentId)}${window.location.search}`}
          aria-label={`Ver detalhes de ${species.commonName} (${species.scientificName})`}
          title={`Ver detalhes de ${species.commonName}`}
        />
      )}
    </Card>
  );
}
