import { displayValue } from '../../utils/species-detail-formatters';
import type { SpeciesEcologySectionProps } from './types';
import { Fact, FactGrid, Section, SectionTitle } from './styles';

export function SpeciesEcologySection({ species }: SpeciesEcologySectionProps) {
  const facts = [
    { label: 'Ambiente', value: species.habitat },
    { label: 'Extinta', value: species.extinct },
    { label: 'Grupo taxonômico', value: species.taxGroup },
    { label: 'Nome científico', value: species.scientificName },
    { label: 'Autoria', value: species.authorship },
    { label: 'Registro mesclado', value: species.isMerged },
    {
      label: `Identificador do ${species.dataSource === 'Paleobiology Database' ? 'PBDB' : 'Catalogue of Life'}`,
      value: species.documentId,
    },
    { label: 'Identificador da fonte', value: species.sourceId },
    { label: 'Referência taxonômica', value: species.sourceReference },
    { label: 'Táxon parental', value: species.parentExternalId },
  ].filter(({ value }) => value !== null && value !== undefined && value !== '');

  if (facts.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionTitle>Ecologia e dados taxonômicos</SectionTitle>
      <FactGrid>
        {facts.map(({ label, value }) => (
          <Fact key={label}>
            <dt>{label}</dt>
            <dd>{label === 'Nome científico'
              ? <em>{String(value)}</em>
              : displayValue(value)}</dd>
          </Fact>
        ))}
      </FactGrid>
    </Section>
  );
}
