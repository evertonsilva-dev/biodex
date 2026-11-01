import { displayValue } from '../../utils/species-detail-formatters';
import type { SpeciesEcologySectionProps } from './types';
import { Fact, FactGrid, Section, SectionTitle } from './styles';

export function SpeciesEcologySection({ species }: SpeciesEcologySectionProps) {
  return (
    <Section>
      <SectionTitle>Ecologia e dados taxonômicos</SectionTitle>
      <FactGrid>
        <Fact>
          <dt>Ambiente</dt>
          <dd>{displayValue(species.habitat)}</dd>
        </Fact>
        <Fact>
          <dt>Extinta</dt>
          <dd>{displayValue(species.extinct)}</dd>
        </Fact>
        <Fact>
          <dt>Grupo taxonômico</dt>
          <dd>{displayValue(species.taxGroup)}</dd>
        </Fact>
        <Fact>
          <dt>Nome científico</dt>
          <dd><em>{species.scientificName}</em></dd>
        </Fact>
        <Fact>
          <dt>Autoria</dt>
          <dd>{displayValue(species.authorship)}</dd>
        </Fact>
        <Fact>
          <dt>Registro mesclado</dt>
          <dd>{displayValue(species.isMerged)}</dd>
        </Fact>
        <Fact>
          <dt>Identificador do {species.dataSource === 'Paleobiology Database' ? 'PBDB' : 'Catalogue of Life'}</dt>
          <dd>{species.documentId}</dd>
        </Fact>
        <Fact>
          <dt>Identificador da fonte</dt>
          <dd>{displayValue(species.sourceId)}</dd>
        </Fact>
        {species.sourceReference && (
          <Fact>
            <dt>Referência taxonômica</dt>
            <dd>{species.sourceReference}</dd>
          </Fact>
        )}
        <Fact>
          <dt>Táxon parental</dt>
          <dd>{displayValue(species.parentExternalId)}</dd>
        </Fact>
      </FactGrid>
    </Section>
  );
}
