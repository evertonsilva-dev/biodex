import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchSketchfabModels } from '../../api/sketchfab';
import type { SpeciesDetail } from '../../types/species';
import { Section, SectionTitle } from '../SpeciesDetailPage/styles';
import {
  Attribution,
  EmbedFrame,
  ModelChoice,
  ModelChoices,
  ModelDetails,
  ModelHeading,
  ModelMatch,
  ModelThumbnail,
} from './styles';

interface SketchfabModelsProps {
  species: SpeciesDetail;
}

export function SketchfabModels({ species }: SketchfabModelsProps) {
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const modelsQuery = useQuery({
    queryKey: ['sketchfab-models', species.scientificName, species.commonName],
    queryFn: ({ signal }) => searchSketchfabModels(
      species.scientificName,
      species.commonName,
      signal,
    ),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: false,
  });
  const selectedModel = modelsQuery.data?.find(
    (model) => model.uid === selectedUid,
  ) ?? modelsQuery.data?.[0];

  if (!modelsQuery.data?.length) {
    return null;
  }

  return (
    <Section>
      <SectionTitle>Modelos 3D no Sketchfab</SectionTitle>
      <ModelChoices aria-label="Modelos encontrados">
        {modelsQuery.data.map((model) => (
          <ModelChoice
            key={model.uid}
            type="button"
            aria-pressed={model.uid === selectedModel?.uid}
            aria-label={`Exibir ${model.name}`}
            onClick={() => setSelectedUid(model.uid)}
          >
            {model.thumbnailUrl ? (
              <ModelThumbnail src={model.thumbnailUrl} alt="" loading="lazy" />
            ) : (
              <ModelThumbnail as="span" aria-hidden="true" />
            )}
            <ModelDetails>
              <ModelHeading>{model.name}</ModelHeading>
              <ModelMatch>{model.matchLabel}</ModelMatch>
              <Attribution>{model.creator} · {model.license}</Attribution>
            </ModelDetails>
          </ModelChoice>
        ))}
      </ModelChoices>

      {selectedModel && (
        <EmbedFrame>
          <iframe
            title={`Modelo 3D ${selectedModel.name} no Sketchfab`}
            src={`https://sketchfab.com/models/${selectedModel.uid}/embed`}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <Attribution>
            Modelo:{' '}
            <a href={selectedModel.modelPageUrl} target="_blank" rel="noreferrer">
              {selectedModel.name}
            </a>
            {' · '}{selectedModel.creator}
            {' · Licença: '}{selectedModel.license}
          </Attribution>
        </EmbedFrame>
      )}
    </Section>
  );
}
