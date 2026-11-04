import { displayValue, rankLabel } from '../../utils/species-detail-formatters';
import type { SpeciesClassificationSectionProps } from './types';
import { Lineage, LineageItem, Section, SectionTitle } from './styles';

export function SpeciesClassificationSection({ species }: SpeciesClassificationSectionProps) {
  if (species.lineage.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionTitle>Classificação taxonômica</SectionTitle>
      <Lineage>
        {species.lineage.map((entry) => {
          const isCurrent = entry.id === species.documentId;
          const details = [
            entry.authorship,
            entry.status && `status: ${entry.status}`,
            entry.extinct === true && 'extinta',
          ].filter(Boolean);

          return (
            <LineageItem
              key={entry.id}
              $isCurrent={isCurrent}
              aria-current={isCurrent ? 'true' : undefined}
            >
              <small>{rankLabel(entry.rank)}</small>
              <strong>{displayValue(entry.name)}</strong>
              {details.length > 0 && <span>{details.join(' · ')}</span>}
            </LineageItem>
          );
        })}
      </Lineage>
    </Section>
  );
}
