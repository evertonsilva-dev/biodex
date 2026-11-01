import type { CatalogFacetField } from '../../types/species';
import type { CatalogFilterPanelProps } from './types';
import { CheckboxControl, FilterControl, Notice, PageButton, Select, Sidebar, SidebarTitle } from './styles';

const taxonomyFields: Array<{
  field: CatalogFacetField;
  label: string;
  emptyLabel: string;
  parent?: CatalogFacetField;
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
  onRetry,
}: CatalogFilterPanelProps) {
  return (
    <Sidebar aria-label="Filtros do catálogo">
      <SidebarTitle>Filtros</SidebarTitle>
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
      <CheckboxControl>
        <input
          type="checkbox"
          checked={filters.extinct === 'true'}
          onChange={(event) => onExtinctionChange(event.target.checked)}
        />
        Mostrar espécies extintas
      </CheckboxControl>
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
