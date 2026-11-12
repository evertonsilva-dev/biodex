import { useState } from 'react';
import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import { Check, Share2 } from 'lucide-react';
import { getSpeciesEnrichment } from '../../api/species-enrichment';
import {
  getSpeciesComparisonHref,
  MIN_COMPARISON_SPECIES,
  MAX_COMPARISON_SPECIES,
  useSpeciesComparison,
  useSpeciesComparisonSpecies,
} from '../../hooks/useSpeciesComparison';
import { useSpeciesMediaSidebar } from '../../hooks/useSpeciesMediaSidebar';
import { useSpeciesCard } from '../../hooks/useSpeciesCard';
import type { Species, SpeciesEnrichmentResponse } from '../../types/species';
import { PageNavigation } from '../PageNavigation';
import { SoundAudioPlayer } from '../SoundAudioPlayer';
import { SpeciesComparisonBar } from '../SpeciesComparisonBar';
import { TopBar } from '../TopBar';
import {
  ActionLink,
  CompareGrid,
  DataSection,
  DataSectionTitle,
  EmptyActions,
  EmptyState,
  EnrichmentNotice,
  Fact,
  FactList,
  Hero,
  HeroAside,
  HeroEyebrow,
  HeroTitle,
  Image,
  ImageAttribution,
  ImageFallback,
  ImageFrame,
  Intro,
  MissingValue,
  Notice,
  Page,
  RetryButton,
  ShareActions,
  ShareButton,
  ShareStatus,
  SourceGroup,
  SourceLink,
  SourceLinks,
  SourceTitle,
  SoundItem,
  SoundList,
  SpeciesCard,
  SpeciesHeader,
  SpeciesKingdom,
  SpeciesName,
  SpeciesNameLink,
  SpeciesScientificName,
} from './styles';

const externalSources = ['iNaturalist', 'GBIF', 'PBDB'];

function formatCount(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatAge(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
}

function displayText(value: string | null | undefined): string {
  return value?.trim() || 'Sem informação disponível';
}

function SpeciesComparisonCard({
  species,
  enrichmentQuery,
}: {
  species: Species;
  enrichmentQuery: UseQueryResult<SpeciesEnrichmentResponse, Error>;
}) {
  const { registerAudioPlayer, handleAudioPlaybackStart } = useSpeciesMediaSidebar();
  const {
    artworkRef,
    image,
    imageFailed,
    imageAlt,
    imageCredit,
    imageQueryError,
    imageQueryPending,
    onImageError,
  } = useSpeciesCard(species, { includeGallery: true });
  const enrichment = enrichmentQuery.data?.data;
  const taxonomy = species.taxon?.taxonomy?.map(({ name }) => name).filter(Boolean).join(' · ')
    || species.taxon?.name;
  const conservation = species.extinct === true
    ? 'Extinta'
    : species.extinct === false
      ? 'Vivente'
      : 'Sem informação disponível';
  const inaturalist = enrichment?.inaturalist;
  const gbif = enrichment?.gbif;
  const pbdb = enrichment?.pbdb;
  const canQuerySounds = species.kingdom?.name.toLocaleLowerCase('en') === 'animalia'
    && species.extinct !== true;
  const failedSources = new Set(enrichment?.errors ?? []);
  if (gbif?.sourceErrors.length) failedSources.add('GBIF');
  const knownFailedSources = [...failedSources].filter((source) => externalSources.includes(source));
  const hasUnknownSourceFailure = failedSources.size > knownFailedSources.length;
  const partialFailure = knownFailedSources.length > 0 || hasUnknownSourceFailure;
  const ageRange = pbdb?.oldestAgeMa !== null && pbdb?.oldestAgeMa !== undefined
    && pbdb.youngestAgeMa !== null && pbdb.youngestAgeMa !== undefined
    ? `${formatAge(pbdb.oldestAgeMa)}–${formatAge(pbdb.youngestAgeMa)} milhões de anos`
    : pbdb?.oldestAgeMa !== null && pbdb?.oldestAgeMa !== undefined
      ? `Registro mais antigo: ${formatAge(pbdb.oldestAgeMa)} milhões de anos`
      : pbdb?.youngestAgeMa !== null && pbdb?.youngestAgeMa !== undefined
        ? `Registro mais recente: ${formatAge(pbdb.youngestAgeMa)} milhões de anos`
        : null;
  const countrySummary = gbif?.countries.length
    ? gbif.countries
      .slice(0, 5)
      .map(({ code, records }) => `${code} (${formatCount(records)})`)
      .join(', ')
      + (gbif.countries.length > 5 ? ` e mais ${gbif.countries.length - 5}` : '')
    : null;

  return (
    <SpeciesCard>
      <ImageFrame ref={artworkRef} $hasImage={Boolean(image && !imageFailed)}>
        {image && !imageFailed ? (
          <Image
            src={image}
            alt={imageAlt}
            loading="lazy"
            onError={onImageError}
          />
        ) : (
          <ImageFallback>
            <span aria-hidden="true">✳</span>
            <small>
              {imageQueryError
                ? 'Não foi possível carregar a imagem.'
                : imageQueryPending
                  ? 'Buscando imagem da espécie…'
                  : 'Imagem não disponível para esta espécie.'}
            </small>
          </ImageFallback>
        )}
        <SpeciesHeader>
          <SpeciesKingdom>{displayText(species.kingdom?.name)}</SpeciesKingdom>
          <SpeciesName>
            <SpeciesNameLink
              href={`/species/${encodeURIComponent(species.documentId)}${window.location.search}`}
            >
              {displayText(species.commonName)}
            </SpeciesNameLink>
          </SpeciesName>
          <SpeciesScientificName>{displayText(species.scientificName)}</SpeciesScientificName>
        </SpeciesHeader>
      </ImageFrame>
      {imageCredit && !imageFailed && (
        <ImageAttribution
          href={imageCredit.referenceUrl}
          target="_blank"
          rel="noreferrer"
          title={`${imageCredit.attribution} · ${imageCredit.license} · ${imageCredit.source}`}
        >
          {imageCredit.isRepresentative
            ? `Imagem representativa: ${imageCredit.representativeRank ?? 'grupo taxonômico'} ${imageCredit.representativeTaxonName ?? species.scientificName}`
            : 'Imagem da espécie'}
          : {imageCredit.attribution} · {imageCredit.license} · {imageCredit.source}
        </ImageAttribution>
      )}

      <DataSection>
        <DataSectionTitle>Ficha da espécie</DataSectionTitle>
        <FactList>
          <Fact>
            <dt>Classificação</dt>
            <dd>{displayText(taxonomy)}</dd>
          </Fact>
          <Fact>
            <dt>Habitat</dt>
            <dd>{displayText(species.habitat)}</dd>
          </Fact>
          <Fact>
            <dt>Situação</dt>
            <dd>{conservation}</dd>
          </Fact>
          <Fact>
            <dt>Status de conservação</dt>
            <dd>{displayText(species.conservationStatus)}</dd>
          </Fact>
          <Fact>
            <dt>Descrição</dt>
            <dd>{displayText(species.description)}</dd>
          </Fact>
        </FactList>
      </DataSection>

      <DataSection>
        <DataSectionTitle>Dados externos</DataSectionTitle>
        {enrichmentQuery.isPending && !enrichment && (
          <EnrichmentNotice role="status">Consultando fontes externas…</EnrichmentNotice>
        )}
        {enrichmentQuery.isError && !enrichment && (
          <EnrichmentNotice $error role="alert">
            Não foi possível carregar os dados externos desta espécie.
            <RetryButton
              type="button"
              onClick={() => { void enrichmentQuery.refetch(); }}
            >
              Tentar novamente
            </RetryButton>
          </EnrichmentNotice>
        )}
        {enrichmentQuery.isError && enrichment && (
          <EnrichmentNotice $error role="alert">
            Não foi possível atualizar as fontes externas; os dados disponíveis em cache continuam visíveis.
          </EnrichmentNotice>
        )}
        {partialFailure && (
          <EnrichmentNotice $error role="alert">
            Algumas fontes não responderam
            {knownFailedSources.length > 0 ? ` (${knownFailedSources.join(', ')})` : ''}.
            Os valores ausentes não representam zero.
          </EnrichmentNotice>
        )}
        {enrichment && (
          <>
            <SourceGroup>
              <SourceTitle>iNaturalist</SourceTitle>
              {inaturalist ? (
                <FactList>
                  <Fact>
                    <dt>Observações</dt>
                    <dd>
                      {inaturalist.observations === null
                        ? 'Não informado'
                        : formatCount(inaturalist.observations)}
                    </dd>
                  </Fact>
                  <Fact>
                    <dt>Avaliação de conservação</dt>
                    <dd>
                      {inaturalist.conservation
                        ? `${inaturalist.conservation.label}${inaturalist.conservation.authority
                          ? ` · ${inaturalist.conservation.authority}`
                          : ''}`
                        : 'Não informada'}
                    </dd>
                  </Fact>
                  {inaturalist.summary && (
                    <Fact>
                      <dt>Resumo naturalista</dt>
                      <dd>{inaturalist.summary}</dd>
                    </Fact>
                  )}
                </FactList>
              ) : (
                <MissingValue>Esta fonte não trouxe dados para a espécie.</MissingValue>
              )}
              {inaturalist?.conservation?.url && (
                <SourceLinks>
                  <SourceLink href={inaturalist.conservation.url} target="_blank" rel="noreferrer">
                    Ver avaliação
                  </SourceLink>
                </SourceLinks>
              )}
              {inaturalist?.summaryUrl && (
                <SourceLinks>
                  <SourceLink href={inaturalist.summaryUrl} target="_blank" rel="noreferrer">
                    Fonte do resumo
                  </SourceLink>
                </SourceLinks>
              )}
              {inaturalist?.taxonUrl && (
                <SourceLinks>
                  <SourceLink href={inaturalist.taxonUrl} target="_blank" rel="noreferrer">
                    Abrir no iNaturalist
                  </SourceLink>
                </SourceLinks>
              )}
            </SourceGroup>

            <SourceGroup>
              <SourceTitle>GBIF</SourceTitle>
              {gbif ? (
                <FactList>
                  <Fact>
                    <dt>Registros de ocorrência</dt>
                    <dd>
                      {gbif.occurrenceCount === null
                        ? 'Não informado'
                        : formatCount(gbif.occurrenceCount)}
                    </dd>
                  </Fact>
                  <Fact>
                    <dt>Países com registros</dt>
                    <dd>{countrySummary ?? 'Não informado'}</dd>
                  </Fact>
                </FactList>
              ) : (
                <MissingValue>Esta fonte não trouxe dados para a espécie.</MissingValue>
              )}
              {gbif && (
                <>
                  <SourceTitle>Vocalizações e sons</SourceTitle>
                  {gbif.sounds.length > 0 ? (
                    <SoundList
                      role="list"
                      aria-label={`Gravações de ${species.scientificName}`}
                    >
                      {gbif.sounds.map((sound) => (
                        <SoundItem key={sound.gbifRecordUrl} role="listitem">
                          <SoundAudioPlayer
                            url={sound.url}
                            label={`gravação de ${sound.scientificName ?? enrichment.scientificName}`}
                            registerPlayer={registerAudioPlayer}
                            onPlaybackStart={handleAudioPlaybackStart}
                          />
                          <p>
                            {sound.scientificName
                              && sound.scientificName !== enrichment.scientificName
                              ? `Identificação do registro: ${sound.scientificName}. `
                              : ''}
                            {sound.creator ? `Por ${sound.creator}. ` : ''}
                            Licença: {sound.license}.
                          </p>
                          <SourceLinks>
                            <SourceLink href={sound.gbifRecordUrl} target="_blank" rel="noreferrer">
                              Registro GBIF
                            </SourceLink>
                            {sound.referenceUrl && (
                              <SourceLink href={sound.referenceUrl} target="_blank" rel="noreferrer">
                                Gravação na fonte
                              </SourceLink>
                            )}
                          </SourceLinks>
                        </SoundItem>
                      ))}
                    </SoundList>
                  ) : (
                    <MissingValue>
                      {!canQuerySounds
                        ? 'A consulta por gravações sonoras está disponível apenas para espécies animais viventes.'
                        : gbif.sourceErrors.length > 0
                          ? 'A consulta ao GBIF falhou parcialmente; não foi possível confirmar se há gravações sonoras.'
                          : 'Nenhuma gravação sonora foi encontrada nos dados consultados do GBIF para esta espécie.'}
                    </MissingValue>
                  )}
                </>
              )}
              {gbif?.taxonUrl && (
                <SourceLinks>
                  <SourceLink href={gbif.taxonUrl} target="_blank" rel="noreferrer">
                    Abrir no GBIF
                  </SourceLink>
                </SourceLinks>
              )}
            </SourceGroup>

            <SourceGroup>
              <SourceTitle>PBDB · registro fóssil</SourceTitle>
              {pbdb ? (
                <FactList>
                  <Fact>
                    <dt>Ocorrências consultadas</dt>
                    <dd>{formatCount(pbdb.occurrenceSampleCount)}</dd>
                  </Fact>
                  <Fact>
                    <dt>Intervalos geológicos</dt>
                    <dd>{pbdb.intervals.length > 0 ? pbdb.intervals.join(', ') : 'Não informado'}</dd>
                  </Fact>
                  <Fact>
                    <dt>Idade dos registros</dt>
                    <dd>{ageRange ?? 'Não informada'}</dd>
                  </Fact>
                </FactList>
              ) : (
                <MissingValue>Esta fonte não trouxe dados para a espécie.</MissingValue>
              )}
              {pbdb?.taxonUrl && (
                <SourceLinks>
                  <SourceLink href={pbdb.taxonUrl} target="_blank" rel="noreferrer">
                    Abrir na PBDB
                  </SourceLink>
                </SourceLinks>
              )}
            </SourceGroup>

            {enrichment.viralzoneUrl && (
              <SourceLinks>
                <SourceLink href={enrichment.viralzoneUrl} target="_blank" rel="noreferrer">
                  Abrir ficha da ViralZone
                </SourceLink>
              </SourceLinks>
            )}
          </>
        )}
      </DataSection>
    </SpeciesCard>
  );
}

export function SpeciesComparisonPage() {
  const { selectedIds } = useSpeciesComparison();
  const hasMinimumSelection = selectedIds.length >= MIN_COMPARISON_SPECIES;
  const speciesQuery = useSpeciesComparisonSpecies(hasMinimumSelection ? selectedIds : []);
  const [shareStatus, setShareStatus] = useState('');
  const speciesById = new Map(
    (speciesQuery.data?.data ?? []).map((species) => [species.documentId, species]),
  );
  const species: Species[] = [];
  for (const id of selectedIds) {
    const item = speciesById.get(id);
    if (item) species.push(item);
  }
  const missingCount = selectedIds.length - species.length;
  const enrichmentQueries = useQueries({
    queries: hasMinimumSelection ? species.map((item) => ({
      queryKey: ['species-enrichment', item.documentId],
      queryFn: ({ signal }) => getSpeciesEnrichment(item.documentId, signal),
      staleTime: 60 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: false,
    })) : [],
  });
  const comparisonHref = getSpeciesComparisonHref(selectedIds);
  const linkCopied = shareStatus === 'copied';
  const copyComparisonLink = async () => {
    const shareUrl = new URL(comparisonHref, window.location.origin).toString();
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API is unavailable.');
      }
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('copied');
    } catch {
      setShareStatus('error');
    }
  };

  return (
    <Page>
      <TopBar label="COMPARADOR DE ESPÉCIES" />
      <PageNavigation
        items={[
          { label: 'Catálogo', href: `/catalog${window.location.search}` },
          { label: 'Comparador' },
        ]}
        backHref={`/catalog${window.location.search}`}
        backLabel="Voltar ao catálogo"
      />

      <Hero>
        <div>
          <HeroEyebrow>Uma nova perspectiva sobre a biodiversidade</HeroEyebrow>
          <HeroTitle>Espécies, lado a lado.</HeroTitle>
        </div>
        <HeroAside>
          <Intro>
            Compare características do catálogo e registros de fontes externas. Selecione de{' '}
            {MIN_COMPARISON_SPECIES} a {MAX_COMPARISON_SPECIES} espécies; a seleção fica na URL
            para você compartilhar.
          </Intro>
          {hasMinimumSelection && (
            <ShareActions>
              <ShareButton
                type="button"
                aria-label={linkCopied ? 'Link copiado' : 'Copiar link da comparação'}
                title={linkCopied ? 'Link copiado' : 'Copiar link da comparação'}
                onClick={() => { void copyComparisonLink(); }}
              >
                {linkCopied
                  ? <Check size={18} aria-hidden="true" />
                  : <Share2 size={18} aria-hidden="true" />}
              </ShareButton>
              {shareStatus === 'copied' && (
                <ShareStatus role="status">Link copiado para a área de transferência.</ShareStatus>
              )}
              {shareStatus === 'error' && (
                <ShareStatus role="status">
                  Não foi possível copiar automaticamente. Copie a URL da barra de endereço.
                </ShareStatus>
              )}
            </ShareActions>
          )}
        </HeroAside>
      </Hero>
      <SpeciesComparisonBar />

      {!hasMinimumSelection && (
        <EmptyState>
          <h2>
            {selectedIds.length === 0
              ? 'Escolha espécies para começar'
              : 'Adicione mais uma espécie'}
          </h2>
          <p>
            A comparação exige pelo menos {MIN_COMPARISON_SPECIES} espécies. Adicione espécies pelo
            catálogo ou pela ficha; você pode selecionar até {MAX_COMPARISON_SPECIES}.
          </p>
          <EmptyActions>
            <ActionLink href={`/catalog${window.location.search}`}>Explorar o catálogo</ActionLink>
          </EmptyActions>
        </EmptyState>
      )}

      {hasMinimumSelection && speciesQuery.isPending && !speciesQuery.data && (
        <Notice role="status">Carregando as espécies selecionadas…</Notice>
      )}

      {hasMinimumSelection && speciesQuery.isError && !speciesQuery.data && (
        <Notice $error role="alert">
          Não foi possível carregar as espécies selecionadas. Verifique a conexão e tente novamente.
          <RetryButton type="button" onClick={() => { void speciesQuery.refetch(); }}>
            Tentar novamente
          </RetryButton>
        </Notice>
      )}

      {hasMinimumSelection && speciesQuery.data && speciesQuery.isError && (
        <Notice $error role="alert">
          Não foi possível atualizar os dados do catálogo. As informações disponíveis em cache continuam visíveis.
        </Notice>
      )}

      {hasMinimumSelection && missingCount > 0 && speciesQuery.data && (
        <Notice role="status">
          {missingCount === 1
            ? 'Uma espécie selecionada não está mais disponível no catálogo.'
            : `${missingCount} espécies selecionadas não estão mais disponíveis no catálogo.`}
        </Notice>
      )}

      {hasMinimumSelection && speciesQuery.data && species.length === 0 && (
        <Notice role="status">
          Nenhuma das espécies selecionadas está disponível. Volte ao catálogo para escolher outros registros.
          <EmptyActions>
            <ActionLink href="/catalog">Voltar ao catálogo</ActionLink>
          </EmptyActions>
        </Notice>
      )}

      {hasMinimumSelection && speciesQuery.data && species.length === 1 && (
        <Notice role="status">
          Apenas uma espécie selecionada continua disponível no catálogo. Escolha outra para
          comparar os dados lado a lado.
          <EmptyActions>
            <ActionLink href={`/catalog${window.location.search}`}>Escolher outra espécie</ActionLink>
          </EmptyActions>
        </Notice>
      )}

      {species.length >= MIN_COMPARISON_SPECIES && (
        <CompareGrid $columns={species.length} aria-label="Comparação de espécies">
          {species.map((item, index) => (
            <SpeciesComparisonCard
              key={item.documentId}
              species={item}
              enrichmentQuery={enrichmentQueries[index]}
            />
          ))}
        </CompareGrid>
      )}
    </Page>
  );
}
