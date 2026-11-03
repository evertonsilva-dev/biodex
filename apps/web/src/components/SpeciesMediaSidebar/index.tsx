import { useState } from 'react';
import { useSpeciesMediaSidebar } from '../../hooks/useSpeciesMediaSidebar';
import { SpeciesOccurrenceMap } from '../SpeciesOccurrenceMap';
import { SoundAudioPlayer } from '../SoundAudioPlayer';
import type { SpeciesMediaSidebarProps } from './types';
import { EnrichmentText, Section, SectionTitle, SoundItem, SoundList, SourceLink } from './styles';

export function SpeciesMediaSidebar({
  enrichment,
}: SpeciesMediaSidebarProps) {
  const { registerAudioPlayer, handleAudioPlaybackStart } = useSpeciesMediaSidebar();
  const [mapUnavailable, setMapUnavailable] = useState(false);

  const gbif = enrichment?.gbif;
  const hasGbif = gbif !== null && gbif !== undefined;
  const hasMap = hasGbif && (gbif.occurrenceCount ?? 0) > 0 && !mapUnavailable;
  const hasSounds = hasGbif && gbif.sounds.length > 0;
  if (!hasMap && !hasSounds) {
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
            onUnavailable={() => setMapUnavailable(true)}
          />
        </Section>
      ) : null}
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
