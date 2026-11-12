import { ArrowLeftRight, Check } from 'lucide-react';
import type { Species } from '../../types/species';
import { useSpeciesComparison } from '../../hooks/useSpeciesComparison';
import { Button } from './styles';

interface SpeciesComparisonButtonProps {
  species: Pick<Species, 'documentId' | 'commonName' | 'scientificName'>;
}

export function SpeciesComparisonButton({
  species,
}: SpeciesComparisonButtonProps) {
  const { selectedIds, toggleSpecies } = useSpeciesComparison();
  const isSelected = selectedIds.includes(species.documentId);
  const action = isSelected ? 'Remover' : 'Adicionar';
  const label = `${action} ${species.commonName} (${species.scientificName}) ${isSelected ? 'da' : 'à'} comparação`;
  const Icon = isSelected ? Check : ArrowLeftRight;

  return (
    <Button
      type="button"
      $selected={isSelected}
      aria-label={label}
      title={label}
      aria-pressed={isSelected}
      onClick={() => toggleSpecies(species.documentId)}
    >
      <Icon
        size={19}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </Button>
  );
}
