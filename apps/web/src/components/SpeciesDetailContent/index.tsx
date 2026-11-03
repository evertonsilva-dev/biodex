import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/image-gallery.css";
import { SpeciesMediaSidebar } from "../SpeciesMediaSidebar";
import { SpeciesSupplementalData } from "../SpeciesSupplementalData";
import { SpeciesClassificationSection } from "../SpeciesClassificationSection";
import { SpeciesEcologySection } from "../SpeciesEcologySection";
import { SpeciesNamesSection } from "../SpeciesNamesSection";
import { SpeciesSourceSection } from "../SpeciesSourceSection";
import { SketchfabModels } from "../SketchfabModels";
import { useSpeciesDetails } from "../../hooks/useSpeciesDetails";
import { rankLabel } from "../../utils/species-detail-formatters";
import type { SpeciesDetailContentProps } from "./types";
import {
  Artwork,
  ArtworkColumn,
  Authorship,
  BackLink,
  Badge,
  Badges,
  CommonName,
  Content,
  Eyebrow,
  Footer,
  GalleryFrame,
  Hero,
  HeroInfo,
  MainColumn,
  RepresentativeNote,
  SidebarColumn,
  ScientificName,
} from "./styles";

export function SpeciesDetailContent({ species }: SpeciesDetailContentProps) {
  const {
    selectedImageIndex,
    setSelectedImageIndex,
    selectedPhoto,
    visiblePhotos,
    galleryItems,
    galleryKey,
    imageCredit,
    enrichmentQuery,
    hasMediaSidebar,
    onImageError,
  } = useSpeciesDetails(species);
  const dataset = species.dataset;

  return (
    <>
      <BackLink href={`/catalog${window.location.search}`}>
        ← Voltar ao catálogo
      </BackLink>
      <Hero $hasImage={Boolean(selectedPhoto)}>
        {selectedPhoto && (
          <ArtworkColumn>
            <Artwork>
              <GalleryFrame>
                <ImageGallery
                  key={galleryKey}
                  additionalClass="species-detail-gallery"
                  items={galleryItems}
                  startIndex={Math.min(
                    selectedImageIndex,
                    visiblePhotos.length - 1,
                  )}
                  showNav={visiblePhotos.length > 1}
                  showThumbnails={visiblePhotos.length > 1}
                  showFullscreenButton={visiblePhotos.length > 1}
                  showPlayButton={false}
                  showIndex={visiblePhotos.length > 1}
                  infinite={false}
                  lazyLoad
                  onSlide={setSelectedImageIndex}
                  onImageError={onImageError}
                />
              </GalleryFrame>
            </Artwork>
          </ArtworkColumn>
        )}
        <HeroInfo>
          <Eyebrow>
            {species.kingdom?.name ?? "Biodiversidade"} · ficha da espécie
          </Eyebrow>
          <CommonName>{species.commonName}</CommonName>
          <ScientificName>{species.scientificName}</ScientificName>
          {species.authorship && <Authorship>{species.authorship}</Authorship>}
          <Badges>
            {species.extinct === true && <Badge>Extinta</Badge>}
            {species.kingdom?.isVirus && <Badge>Vírus</Badge>}
          </Badges>
          {imageCredit?.isRepresentative && (
            <RepresentativeNote>
              Imagem representativa de{" "}
              {rankLabel(imageCredit.representativeRank ?? null)}{" "}
              {imageCredit.representativeTaxonName}. Não é uma imagem específica
              desta espécie.
            </RepresentativeNote>
          )}
          {imageCredit && (
            <RepresentativeNote>
              Imagem: {imageCredit.attribution} · {imageCredit.license} ·{" "}
              {imageCredit.source}
              {" · "}
              <a
                href={imageCredit.referenceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Fonte da imagem
              </a>
            </RepresentativeNote>
          )}
        </HeroInfo>
      </Hero>

      <Content $hasSidebar={hasMediaSidebar}>
        <SidebarColumn aria-label="Mapa e áudio da espécie">
          <SpeciesMediaSidebar enrichment={enrichmentQuery.data?.data} />
        </SidebarColumn>
        <MainColumn $hasSidebar={hasMediaSidebar}>
          <SpeciesClassificationSection species={species} />
          <SpeciesEcologySection species={species} />
          <SpeciesSupplementalData enrichment={enrichmentQuery.data?.data} />
          <SketchfabModels species={species} />
          <SpeciesNamesSection species={species} />
          <SpeciesSourceSection dataset={dataset} />
        </MainColumn>
      </Content>
      <Footer>
        BIODEX · Dados taxonômicos fornecidos pelo Catalogue of Life.
      </Footer>
    </>
  );
}
