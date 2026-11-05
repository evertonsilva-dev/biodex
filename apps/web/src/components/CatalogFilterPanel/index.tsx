import { useId, useState } from 'react';
import type { TaxonomyFacetField } from '../../types/species';
import { BiodexMultiSelect, BiodexSelect } from '../BiodexSelect';
import type { CatalogFilterPanelProps } from './types';
import {
  ActiveFilterCount,
  ClearButton,
  FilterControl,
  FilterDisclosure,
  FilterHint,
  FilterSummary,
  Notice,
  PageButton,
  Sidebar,
  SidebarTitle,
} from './styles';

const taxonomyFields: Array<{
  field: TaxonomyFacetField;
  label: string;
  emptyLabel: string;
  parent?: TaxonomyFacetField;
}> = [
  { field: 'kingdom', label: 'Reino', emptyLabel: 'Todos' },
  { field: 'phylum', label: 'Filo', emptyLabel: 'Todos', parent: 'kingdom' },
  { field: 'class', label: 'Classe', emptyLabel: 'Todas', parent: 'phylum' },
  { field: 'order', label: 'Ordem', emptyLabel: 'Todas', parent: 'class' },
  { field: 'family', label: 'Família', emptyLabel: 'Todas', parent: 'order' },
  { field: 'genus', label: 'Gênero', emptyLabel: 'Todos', parent: 'family' },
];

export function CatalogFilterPanel({
  filters,
  options,
  selectedCount,
  hasError,
  isRetrying,
  onTaxonomyChange,
  onExtinctionChange,
  onHabitatChange,
  onSourceChange,
  onClearFilters,
  onRetry,
}: CatalogFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const filtersId = useId();
  const hasFilters = Object.values(filters).some((value) => (
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  ));
  return (
    <FilterDisclosure>
      <FilterSummary
        type="button"
        $expanded={isExpanded}
        aria-expanded={isExpanded}
        aria-controls={filtersId}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        Filtros
        <ActiveFilterCount>
          {selectedCount ? `${selectedCount} ativo${selectedCount === 1 ? '' : 's'}` : 'Nenhum ativo'}
        </ActiveFilterCount>
      </FilterSummary>
      <Sidebar id={filtersId} $expanded={isExpanded} aria-label="Filtros do catálogo">
        <SidebarTitle>
          Filtros
          {hasFilters && (
            <ClearButton type="button" onClick={onClearFilters}>
              Limpar filtros
            </ClearButton>
          )}
        </SidebarTitle>
        {taxonomyFields
          .filter(({ parent }) => !parent || Boolean(filters[parent]))
          .map(({ field, label, emptyLabel }) => (
            <FilterControl key={field}>
              {label}
              <BiodexSelect
                id={`${filtersId}-${field}`}
                label={label}
                options={options[field]}
                value={filters[field]}
                placeholder={emptyLabel}
                onChange={(value) => onTaxonomyChange(field, value)}
              />
            </FilterControl>
          ))}
        <FilterControl>
          Estado de extinção
          <BiodexSelect
            id={`${filtersId}-extinct`}
            label="Estado de extinção"
            options={[
              { value: 'false', label: 'Viventes' },
              { value: 'true', label: 'Extintas' },
            ]}
            value={filters.extinct}
            placeholder="Todas"
            onChange={onExtinctionChange}
          />
        </FilterControl>
        <FilterControl>
          Ambiente
          <BiodexMultiSelect
            id={`${filtersId}-habitat`}
            label="Ambiente"
            options={options.habitat}
            value={filters.habitat}
            aria-describedby="habitat-filter-hint"
            placeholder="Selecione um ou mais ambientes"
            onChange={onHabitatChange}
          />
          <FilterHint id="habitat-filter-hint">
            Você pode combinar diferentes ambientes.
          </FilterHint>
        </FilterControl>
        <FilterControl>
          Fonte do registro
          <BiodexSelect
            id={`${filtersId}-source`}
            label="Fonte do registro"
            options={options.source}
            value={filters.source}
            placeholder="Todas"
            onChange={onSourceChange}
          />
        </FilterControl>
        {hasError && (
          <Notice $error role="alert">
            Não foi possível carregar as opções dos filtros.
            <PageButton type="button" onClick={onRetry} disabled={isRetrying}>
              {isRetrying ? 'Tentando novamente…' : 'Tente novamente'}
            </PageButton>
          </Notice>
        )}
      </Sidebar>
    </FilterDisclosure>
  );
}
