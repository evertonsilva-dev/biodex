import { displayValue, rankLabel } from '../../utils/species-detail-formatters';
import type { SpeciesNamesSectionProps } from './types';
import { DataTable, Empty, Section, SectionTitle, TableWrap } from './styles';

export function SpeciesNamesSection({ species }: SpeciesNamesSectionProps) {
  return (
    <>
      <Section>
        <SectionTitle>Nomes populares e vernaculares</SectionTitle>
        {species.vernacularNames.length > 0 ? (
          <TableWrap>
            <DataTable>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Idioma</th>
                  <th>Preferido</th>
                  <th>País / área</th>
                  <th>Observações</th>
                  <th>ID da fonte</th>
                </tr>
              </thead>
              <tbody>
                {species.vernacularNames.map((name, index) => (
                  <tr key={`${name.sourceId ?? 'name'}-${name.name}-${name.language}-${index}`}>
                    <td>{displayValue(name.name)}{name.transliteration ? ` (${name.transliteration})` : ''}</td>
                    <td>{displayValue(name.language)}</td>
                    <td>{displayValue(name.preferred)}</td>
                    <td>{[name.country, name.area].filter(Boolean).join(' · ') || '—'}</td>
                    <td>{displayValue(name.remarks)}</td>
                    <td>{displayValue(name.sourceId)}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </TableWrap>
        ) : (
          <Empty>Não há nomes vernaculares registrados para esta espécie na edição importada.</Empty>
        )}
      </Section>
      <Section>
        <SectionTitle>Nomes relacionados e sinônimos</SectionTitle>
        {species.relatedNames.length > 0 ? (
          <TableWrap>
            <DataTable>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Relação</th>
                  <th>Direção</th>
                  <th>Status</th>
                  <th>Referência</th>
                  <th>Observações / origem</th>
                  <th>Identificadores</th>
                </tr>
              </thead>
              <tbody>
                {species.relatedNames.map((name) => (
                  <tr key={name.id}>
                    <td>
                      <em>{displayValue(name.scientificName)}</em>
                      {name.authorship ? ` ${name.authorship}` : ''}
                      {name.rank ? <div>{rankLabel(name.rank)}</div> : null}
                    </td>
                    <td>{displayValue(name.relationType)}</td>
                    <td>{name.direction === 'outgoing' ? 'Parte deste registro' : 'Apontado para este registro'}</td>
                    <td>{displayValue(name.status)}</td>
                    <td>{[name.referenceId, name.page].filter(Boolean).join(' · ') || '—'}</td>
                    <td>
                      {[name.remarks, name.relationSourceId && `fonte: ${name.relationSourceId}`]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </td>
                    <td>{[name.externalId, name.sourceId].filter(Boolean).join(' · ')}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </TableWrap>
        ) : (
          <Empty>O catálogo não relaciona outros nomes a este registro.</Empty>
        )}
      </Section>
    </>
  );
}
