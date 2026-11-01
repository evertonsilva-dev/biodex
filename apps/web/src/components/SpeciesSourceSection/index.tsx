import { displayValue, formatLocalDate } from '../../utils/species-detail-formatters';
import type { SpeciesSourceSectionProps } from './types';
import { Empty, Fact, FactGrid, Section, SectionTitle } from './styles';

export function SpeciesSourceSection({ dataset }: SpeciesSourceSectionProps) {
  const doiUrl = dataset?.doi
    ? `https://doi.org/${dataset.doi.replace(/^https?:\/\/doi\.org\//i, '')}`
    : null;

  return (
    <Section>
      <SectionTitle>Fonte dos dados</SectionTitle>
      {dataset ? (
        <FactGrid>
          <Fact>
            <dt>Base</dt>
            <dd>{dataset.title}</dd>
          </Fact>
          <Fact>
            <dt>Versão</dt>
            <dd>{displayValue(dataset.version)}</dd>
          </Fact>
          <Fact>
            <dt>Publicação</dt>
            <dd>{formatLocalDate(dataset.issued)}</dd>
          </Fact>
          <Fact>
            <dt>Importado em</dt>
            <dd>{formatLocalDate(dataset.importedAt, true)}</dd>
          </Fact>
          <Fact>
            <dt>Identificador da edição</dt>
            <dd>{dataset.datasetId}</dd>
          </Fact>
          <Fact>
            <dt>DOI</dt>
            <dd>
              {doiUrl ? (
                <a href={doiUrl} target="_blank" rel="noreferrer">{dataset.doi}</a>
              ) : 'Não informado'}
            </dd>
          </Fact>
        </FactGrid>
      ) : (
        <Empty>Os metadados da edição importada não estão disponíveis.</Empty>
      )}
    </Section>
  );
}
