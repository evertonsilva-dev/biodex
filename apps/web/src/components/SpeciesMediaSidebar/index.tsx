import { useSpeciesMediaSidebar } from '../../hooks/useSpeciesMediaSidebar';
import { SpeciesOccurrenceMap } from '../SpeciesOccurrenceMap';
import { SoundAudioPlayer } from '../SoundAudioPlayer';
import { Skeleton } from '../Skeleton';
import type { SpeciesMediaSidebarProps } from './types';
import { Empty, EnrichmentText, RetryButton, Section, SectionTitle, SkeletonMap, SkeletonMapCaption, SoundItem, SoundList, SourceLink } from './styles';

export function SpeciesMediaSidebar({
  enrichment,
  isLoading,
  onRetry,
}: SpeciesMediaSidebarProps) {
  const { registerAudioPlayer, handleAudioPlaybackStart } = useSpeciesMediaSidebar();

  const gbif = enrichment?.gbif;
  const hasGbif = gbif !== null && gbif !== undefined;
  const hasMap = hasGbif && (gbif.occurrenceCount ?? 0) > 0;
  const hasSounds = hasGbif && gbif.sounds.length > 0;
  const hasGbifErrors = Boolean(
    enrichment?.errors.includes('GBIF') || gbif?.sourceErrors.length,
  );
  if (!hasMap && !hasSounds && !hasGbifErrors && !isLoading) {
    return null;
  }

  return (
    <>
      {hasMap && gbif ? (
        <Section>
          <SectionTitle>Mapa de registros conhecidos</SectionTitle>
          <EnrichmentText>
            As áreas destacadas indicam ocorrências registradas no GBIF; não
            representam limites de endemismo nem uma distribuição completa.
          </EnrichmentText>
          <SpeciesOccurrenceMap
            taxonKey={gbif.taxonKey}
            occurrenceCount={gbif.occurrenceCount}
          />
        </Section>
      ) : !gbif && isLoading ? (
        <Section role="status" aria-label="Carregando mapa e vocalizações">
          <SectionTitle>Mapa e vocalizações</SectionTitle>
          <SkeletonMap>
            <Skeleton $height="100%" $radius="10px" />
          </SkeletonMap>
          <SkeletonMapCaption>
            <Skeleton $width="78%" $height="0.8rem" />
            <Skeleton $width="58%" $height="0.8rem" />
          </SkeletonMapCaption>
        </Section>
      ) : null}
      {hasGbifErrors && !isLoading && (
        <Section>
          <SectionTitle>Mapa e vocalizações indisponíveis</SectionTitle>
          <Empty role="status">
            O GBIF não respondeu à consulta. Tente novamente para buscar os
            registros mais recentes.
          </Empty>
          <RetryButton type="button" onClick={onRetry}>
            Tentar novamente
          </RetryButton>
        </Section>
      )}
      {hasSounds && gbif && (
        <Section>
          <SectionTitle>Vocalizações e sons</SectionTitle>
          <SoundList>
            {gbif.sounds.map((sound) => (
              <SoundItem key={sound.url}>
                <SoundAudioPlayer
                  url={sound.url}
                  label={`gravação de ${sound.scientificName ?? enrichment.scientificName}`}
                  registerPlayer={registerAudioPlayer}
                  onPlaybackStart={handleAudioPlaybackStart}
                />
                <EnrichmentText>
                  {sound.scientificName &&
                    sound.scientificName !== enrichment.scientificName
                    ? `Identificação do registro: ${sound.scientificName}. `
                    : ""}
                  {sound.creator ? `Por ${sound.creator}. ` : ""}Licença: {sound.license}.
                </EnrichmentText>
                <div>
                  <SourceLink
                    href={sound.gbifRecordUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Registro GBIF
                  </SourceLink>
                  {sound.referenceUrl && (
                    <>
                      {" · "}
                      <SourceLink
                        href={sound.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Gravação na fonte
                      </SourceLink>
                    </>
                  )}
                </div>
              </SoundItem>
            ))}
          </SoundList>
        </Section>
      )}
    </>
  );
}
