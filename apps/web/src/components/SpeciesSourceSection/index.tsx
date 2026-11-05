import { formatLocalDate } from '../../utils/species-detail-formatters';
import type { SpeciesSourceSectionProps } from './types';
import { Fact, FactGrid, Section, SectionTitle, SourceGroupTitle } from './styles';

function externalHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
}

export function SpeciesSourceSection({
  dataset,
  dataSource,
  sourceId,
  sourceReference,
}: SpeciesSourceSectionProps) {
  const hasTaxonSource = Boolean(dataSource || sourceId || sourceReference);
  if (!hasTaxonSource && !dataset) {
    return null;
  }

  const referenceUrl = sourceReference ? externalHttpUrl(sourceReference) : null;
  const normalizedDoi = dataset?.doi?.trim().replace(/^https?:\/\/doi\.org\//i, '');
  const doiUrl = normalizedDoi
    ? `https://doi.org/${encodeURI(normalizedDoi)}`
    : null;

  return (
    <Section>
      <SectionTitle>Procedência dos dados</SectionTitle>
      {hasTaxonSource && (
        <>
          <SourceGroupTitle>Origem do táxon</SourceGroupTitle>
          <FactGrid>
            {dataSource && (
              <Fact>
                <dt>Base de origem</dt>
                <dd>{dataSource}</dd>
              </Fact>
            )}
            {sourceId && (
              <Fact>
                <dt>Identificador na fonte</dt>
                <dd>{sourceId}</dd>
              </Fact>
            )}
            {sourceReference && (
              <Fact>
                <dt>Referência do registro</dt>
                <dd>
                  {referenceUrl ? (
                    <a href={referenceUrl} target="_blank" rel="noreferrer">
                      {sourceReference}
                    </a>
                  ) : sourceReference}
                </dd>
              </Fact>
            )}
          </FactGrid>
        </>
      )}
      {dataset && (
        <>
          <SourceGroupTitle>Edição do catálogo importada</SourceGroupTitle>
          <FactGrid>
            <Fact>
              <dt>Catálogo</dt>
              <dd>{dataset.title}</dd>
            </Fact>
            {dataset.datasetId && (
              <Fact>
                <dt>Identificador da edição</dt>
                <dd>{dataset.datasetId}</dd>
              </Fact>
            )}
            {dataset.version && (
              <Fact>
                <dt>Versão</dt>
                <dd>{dataset.version}</dd>
              </Fact>
            )}
            {dataset.issued && (
              <Fact>
                <dt>Publicação da edição</dt>
                <dd>{formatLocalDate(dataset.issued)}</dd>
              </Fact>
            )}
            {dataset.importedAt && (
              <Fact>
                <dt>Importado em</dt>
                <dd>{formatLocalDate(dataset.importedAt, true)}</dd>
              </Fact>
            )}
            {dataset.doi && (
              <Fact>
                <dt>DOI da edição</dt>
                <dd>
                  {doiUrl ? (
                    <a href={doiUrl} target="_blank" rel="noreferrer">
                      {dataset.doi}
                    </a>
                  ) : dataset.doi}
                </dd>
              </Fact>
            )}
          </FactGrid>
        </>
      )}
    </Section>
  );
}
