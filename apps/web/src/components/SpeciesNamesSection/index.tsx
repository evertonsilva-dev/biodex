import { displayValue, rankLabel } from '../../utils/species-detail-formatters';
import type { SpeciesNamesSectionProps } from './types';
import { DataTable, Section, SectionTitle, TableWrap } from './styles';

export function SpeciesNamesSection({ species }: SpeciesNamesSectionProps) {
  const hasVernacularNames = species.vernacularNames.length > 0;
  const hasRelatedNames = species.relatedNames.length > 0;
  if (!hasVernacularNames && !hasRelatedNames) {
    return null;
  }

  return (
    <>
      {hasVernacularNames && (
        <Section>
          <SectionTitle>Nomes populares e vernaculares</SectionTitle>
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
                    <td data-label="Nome">{displayValue(name.name)}{name.transliteration ? ` (${name.transliteration})` : ''}</td>
                    <td data-label="Idioma">{displayValue(name.language)}</td>
                    <td data-label="Preferido">{displayValue(name.preferred)}</td>
                    <td data-label="País / área">{[name.country, name.area].filter(Boolean).join(' · ') || '—'}</td>
                    <td data-label="Observações">{displayValue(name.remarks)}</td>
                    <td data-label="ID da fonte">{displayValue(name.sourceId)}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </TableWrap>
        </Section>
      )}
      {hasRelatedNames && (
        <Section>
          <SectionTitle>Nomes relacionados e sinônimos</SectionTitle>
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
                    <td data-label="Nome">
                      <em>{displayValue(name.scientificName)}</em>
                      {name.authorship ? ` ${name.authorship}` : ''}
                      {name.rank ? <div>{rankLabel(name.rank)}</div> : null}
                    </td>
                    <td data-label="Relação">{displayValue(name.relationType)}</td>
                    <td data-label="Direção">{name.direction === 'outgoing' ? 'Parte deste registro' : 'Apontado para este registro'}</td>
                    <td data-label="Status">{displayValue(name.status)}</td>
                    <td data-label="Referência">{[name.referenceId, name.page].filter(Boolean).join(' · ') || '—'}</td>
                    <td data-label="Observações / origem">
                      {[name.remarks, name.relationSourceId && `fonte: ${name.relationSourceId}`]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </td>
                    <td data-label="Identificadores">{[name.externalId, name.sourceId].filter(Boolean).join(' · ')}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </TableWrap>
        </Section>
      )}
    </>
  );
}
