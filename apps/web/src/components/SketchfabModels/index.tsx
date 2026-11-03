import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchSketchfabModels } from '../../api/sketchfab';
import type { SpeciesDetail } from '../../types/species';
import {
  Empty,
  RetryButton,
  Section,
  SectionTitle,
} from '../SpeciesDetailPage/styles';
import {
  Attribution,
  EmbedFrame,
  ModelChoice,
  ModelChoices,
  ModelDetails,
  ModelHeading,
  ModelMatch,
  ModelNote,
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

  return (
    <Section>
      <SectionTitle>Modelos 3D no Sketchfab</SectionTitle>
      <ModelNote>
        Resultados que mencionam o nome científico aparecem primeiro; quando
        não há correspondências, a busca tenta o nome comum. Os modelos são
        enviados por terceiros; confira a identificação e a licença na fonte.
      </ModelNote>

      {modelsQuery.isPending && (
        <Empty role="status">Buscando modelos para {species.scientificName}…</Empty>
      )}

      {modelsQuery.isError && (
        <>
          <Empty role="alert">
            Não foi possível consultar o Sketchfab agora. Os demais dados da
            espécie continuam disponíveis.
          </Empty>
          <RetryButton type="button" onClick={() => void modelsQuery.refetch()}>
            Tentar novamente
          </RetryButton>
        </>
      )}

      {modelsQuery.isSuccess && modelsQuery.data.length === 0 && (
        <Empty>
          Nenhum modelo correspondente foi encontrado para{" "}
          {species.scientificName}.
        </Empty>
      )}

      {modelsQuery.data && modelsQuery.data.length > 0 && (
        <>
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
        </>
      )}
    </Section>
  );
}
