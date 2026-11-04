import type { TaxonomyFacetField } from '../../types/species';
import type { CatalogFilterPanelProps } from './types';
import { ClearButton, FilterControl, Notice, PageButton, Select, Sidebar, SidebarTitle } from './styles';

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
  hasError,
  isRetrying,
  onTaxonomyChange,
  onExtinctionChange,
  onAdditionalFilterChange,
  onClearFilters,
  onRetry,
}: CatalogFilterPanelProps) {
  const hasFilters = Object.values(filters).some(Boolean);
  return (
    <Sidebar aria-label="Filtros do catálogo">
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
            <Select
              value={filters[field]}
              onChange={(event) => onTaxonomyChange(field, event.target.value)}
            >
              <option value="">{emptyLabel}</option>
              {options[field].map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </FilterControl>
        ))}
      <FilterControl>
        Estado de extinção
        <Select
          value={filters.extinct}
          onChange={(event) => onExtinctionChange(event.target.value)}
        >
          <option value="">Todas</option>
          <option value="false">Viventes</option>
          <option value="true">Extintas</option>
        </Select>
      </FilterControl>
      <FilterControl>
        Ambiente
        <Select
          value={filters.habitat}
          onChange={(event) => onAdditionalFilterChange('habitat', event.target.value)}
        >
          <option value="">Todos</option>
          {options.habitat.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
      </FilterControl>
      <FilterControl>
        Fonte do registro
        <Select
          value={filters.source}
          onChange={(event) => onAdditionalFilterChange('source', event.target.value)}
        >
          <option value="">Todas</option>
          {options.source.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
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
  );
}
