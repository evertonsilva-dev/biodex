import {
  getSpeciesComparisonHref,
  MIN_COMPARISON_SPECIES,
  useSpeciesComparison,
  useSpeciesComparisonSpecies,
} from '../../hooks/useSpeciesComparison';
import {
  Actions,
  Bar,
  ClearButton,
  CompareLink,
  CompareUnavailable,
  Heading,
  SelectionList,
  SpeciesChip,
  SpeciesName,
  SpeciesScientificName,
  Status,
  RemoveButton,
} from './styles';

interface SpeciesComparisonBarProps {
  accentColor?: string;
}

export function SpeciesComparisonBar({ accentColor }: SpeciesComparisonBarProps) {
  const {
    selectedIds,
    notice,
    removeSpecies,
    clearSelection,
  } = useSpeciesComparison();
  const speciesQuery = useSpeciesComparisonSpecies(selectedIds);

  if (selectedIds.length === 0) return null;

  const speciesById = new Map(
    (speciesQuery.data?.data ?? []).map((species) => [species.documentId, species]),
  );

  return (
    <Bar $accentColor={accentColor} aria-label="Espécies selecionadas para comparação">
      <Heading>
        <strong>Comparação · {selectedIds.length}/3</strong>
      </Heading>
      <SelectionList>
        {selectedIds.map((id, index) => {
          const species = speciesById.get(id);
          const fallbackName = speciesQuery.isPending
            ? `Carregando espécie ${index + 1}…`
            : `Espécie ${index + 1}`;
          const name = species?.commonName ?? fallbackName;

          return (
            <SpeciesChip key={id}>
              <div>
                <SpeciesName>{name}</SpeciesName>
                {species?.scientificName && (
                  <SpeciesScientificName>{species.scientificName}</SpeciesScientificName>
                )}
              </div>
              <RemoveButton
                type="button"
                aria-label={`Remover ${species?.commonName ?? `espécie ${index + 1}`} da comparação`}
                onClick={() => removeSpecies(id)}
              >
                <span aria-hidden="true">×</span>
              </RemoveButton>
            </SpeciesChip>
          );
        })}
      </SelectionList>
      <Actions>
        <ClearButton type="button" onClick={clearSelection}>
          Limpar seleção
        </ClearButton>
        {selectedIds.length >= MIN_COMPARISON_SPECIES ? (
          <CompareLink href={getSpeciesComparisonHref(selectedIds)}>
            Comparar agora
          </CompareLink>
        ) : (
          <CompareUnavailable aria-disabled="true">
            Selecione mais uma espécie
          </CompareUnavailable>
        )}
      </Actions>
      <Status role="status" aria-live="polite">
        {notice || (speciesQuery.isError && !speciesQuery.data
          ? 'Não foi possível carregar os nomes das espécies selecionadas. Você ainda pode selecionar mais espécies ou remover itens.'
          : '')}
      </Status>
    </Bar>
  );
}
