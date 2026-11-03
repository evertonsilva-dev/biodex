import type { SpeciesSupplementalDataProps } from './types';
import { EnrichmentGroup, EnrichmentText, EnrichmentTitle, Fact, FactGrid, Section, SectionTitle, SourceLink } from './styles';

function formatCount(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function conservationStatusLabel(
  status: string,
  label: string,
  authority: string | null,
): string {
  const iucnLabels: Record<string, string> = {
    EX: "Extinta",
    EW: "Extinta na natureza",
    CR: "Criticamente ameaçada",
    EN: "Em perigo",
    VU: "Vulnerável",
    NT: "Quase ameaçada",
    LC: "Pouco preocupante",
    DD: "Dados insuficientes",
    NE: "Não avaliada",
  };
  if (authority?.toLocaleLowerCase("pt-BR").includes("iucn")) {
    return iucnLabels[status.toUpperCase()] ?? label;
  }
  return label;
}

export function SpeciesSupplementalData({
  enrichment,
}: SpeciesSupplementalDataProps) {
  const inaturalist = enrichment?.inaturalist;
  const gbif = enrichment?.gbif;
  const pbdb = enrichment?.pbdb;
  const hasInaturalistData = Boolean(
    inaturalist
      && (inaturalist.commonName
        || inaturalist.summary
        || inaturalist.conservation
        || (inaturalist.observations !== null && inaturalist.observations !== undefined)),
  );
  const hasGbifData = Boolean(
    gbif && ((gbif.occurrenceCount ?? 0) > 0 || gbif.countries.length > 0),
  );
  const hasPbdbData = Boolean(
    pbdb && (pbdb.occurrenceSampleCount > 0
      || pbdb.intervals.length > 0
      || pbdb.oldestAgeMa !== null
      || pbdb.youngestAgeMa !== null
      || pbdb.localities.length > 0
      || pbdb.references.length > 0),
  );
  const hasViralzoneData = Boolean(enrichment?.viralzoneUrl);

  if (!hasInaturalistData && !hasGbifData && !hasPbdbData && !hasViralzoneData) {
    return null;
  }

  return (
    <Section>
      <SectionTitle>Mais informações e registros externos</SectionTitle>
      {hasInaturalistData && inaturalist && (
        <EnrichmentGroup>
          <EnrichmentTitle>Resumo e observações</EnrichmentTitle>
          {inaturalist.commonName && (
            <EnrichmentText>
              Nome comum no iNaturalist: <strong>{inaturalist.commonName}</strong>
            </EnrichmentText>
          )}
          {inaturalist.summary && (
            <>
              <EnrichmentText>{inaturalist.summary}</EnrichmentText>
              {inaturalist.summaryUrl && (
                <EnrichmentText>
                  Resumo da Wikipédia disponibilizado pelo iNaturalist.
                </EnrichmentText>
              )}
            </>
          )}
          {inaturalist.conservation && (
            <FactGrid>
              <Fact>
                <dt>Estado de conservação</dt>
                <dd>
                  {conservationStatusLabel(
                    inaturalist.conservation.status,
                    inaturalist.conservation.label,
                    inaturalist.conservation.authority,
                  )}
                  {inaturalist.conservation.authority
                    ? ` · ${inaturalist.conservation.authority}`
                    : ""}
                  {inaturalist.conservation.url && (
                    <>
                      {" · "}
                      <a
                        href={inaturalist.conservation.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver avaliação
                      </a>
                    </>
                  )}
                </dd>
              </Fact>
              {inaturalist.observations !== null && (
                <Fact>
                  <dt>Observações no iNaturalist</dt>
                  <dd>{formatCount(inaturalist.observations)}</dd>
                </Fact>
              )}
            </FactGrid>
          )}
          {inaturalist.summaryUrl && (
            <SourceLink
              href={inaturalist.summaryUrl}
              target="_blank"
              rel="noreferrer"
            >
              Fonte do resumo
            </SourceLink>
          )}
          <SourceLink
            href={inaturalist.taxonUrl}
            target="_blank"
            rel="noreferrer"
          >
            Ver espécie no iNaturalist
          </SourceLink>
        </EnrichmentGroup>
      )}

      {hasGbifData && gbif && (
        <EnrichmentGroup>
          <EnrichmentTitle>Registros de biodiversidade no GBIF</EnrichmentTitle>
          {gbif.occurrenceCount !== null && (
            <EnrichmentText>
              {formatCount(gbif.occurrenceCount)} registros de ocorrência
              disponíveis.
            </EnrichmentText>
          )}
          {gbif.countries.length > 0 && (
            <EnrichmentText>
              Países com mais registros:{" "}
              {gbif.countries
                .map((country) => `${country.code} (${formatCount(country.records)})`)
                .join(", ")}.
            </EnrichmentText>
          )}
          <SourceLink href={gbif.taxonUrl} target="_blank" rel="noreferrer">
            Ver registros no GBIF
          </SourceLink>
        </EnrichmentGroup>
      )}

      {hasPbdbData && pbdb && (
        <EnrichmentGroup>
          <EnrichmentTitle>Registro fóssil na PBDB</EnrichmentTitle>
          {pbdb.intervals.length > 0 && (
            <EnrichmentText>
              Intervalos geológicos registrados: {pbdb.intervals.join(", ")}.
            </EnrichmentText>
          )}
          {pbdb.oldestAgeMa !== null && pbdb.youngestAgeMa !== null && (
            <EnrichmentText>
              Idade estimada dos registros:{" "}
              {new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
                pbdb.oldestAgeMa,
              )}{" "}
              a{" "}
              {new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
                pbdb.youngestAgeMa,
              )}{" "}
              milhões de anos.
            </EnrichmentText>
          )}
          {pbdb.localities.length > 0 && (
            <EnrichmentText>
              Localidades encontradas:{" "}
              {pbdb.localities.map((locality) => locality.label).join("; ")}.
            </EnrichmentText>
          )}
          <EnrichmentText>
            {pbdb.occurrenceSampleCount} ocorrências consultadas (amostra de até
            100 registros).
          </EnrichmentText>
          {pbdb.references.map((reference, index) => (
            <EnrichmentText key={`${index}-${reference}`}>{reference}</EnrichmentText>
          ))}
          <SourceLink href={pbdb.taxonUrl} target="_blank" rel="noreferrer">
            Ver táxon na PBDB
          </SourceLink>
        </EnrichmentGroup>
      )}

      {enrichment?.viralzoneUrl && (
        <EnrichmentGroup>
          <EnrichmentTitle>Informações sobre vírus</EnrichmentTitle>
          <EnrichmentText>
            A ViralZone mantém fichas curatoriais para diversos grupos virais.
            A consulta é aberta na fonte; ainda não há uma integração automática
            do conteúdo.
          </EnrichmentText>
          <SourceLink
            href={enrichment.viralzoneUrl}
            target="_blank"
            rel="noreferrer"
          >
            Acessar ViralZone
          </SourceLink>
        </EnrichmentGroup>
      )}

    </Section>
  );
}
