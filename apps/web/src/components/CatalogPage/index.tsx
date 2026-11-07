

import { useCatalogPage, optionsWithSelected, MIN_SEARCH_LENGTH } from '../../hooks/useCatalogPage';
import type { TaxonomyFacetField } from '../../types/species';
import { CatalogFilterPanel } from '../CatalogFilterPanel';
import { CatalogSearch } from '../CatalogSearch';
import { CatalogResults } from '../CatalogResults';
import type { CatalogActiveFilter } from '../CatalogResults/types';
import { TopBar } from '../TopBar';
import { PageNavigation } from '../PageNavigation';
import type { BiodexSelectOption } from '../BiodexSelect';
import { getEnvironmentLabel, getEnvironmentOptions } from '../../utils/environment-label';
import {
  Page,
  Hero,
  Eyebrow,
  Headline,
  Intro,
  SearchBar,
  CatalogLayout,
  SearchHint,
  Footer,
} from './styles';

export function CatalogPage() {
  const {
    filters, search, page, sort, kingdomOptionsQuery, phylumOptionsQuery, classOptionsQuery,
    orderOptionsQuery, familyOptionsQuery, genusOptionsQuery, habitatOptionsQuery,
    sourceOptionsQuery, facetQueries, speciesQuery,
    retryCatalog, isRetryingCatalog, updateTaxonomyFilter, updateExtinctionFilter,
    updateHabitatFilter, updateSourceFilter, updateSearch, updatePage, updateSort,
    clearFilters, clearCatalog,
  } = useCatalogPage();
  const activeFilters: CatalogActiveFilter[] = [];
  const addTaxonomyFilter = (
    field: TaxonomyFacetField,
    label: string,
    options: BiodexSelectOption[],
  ) => {
    const value = filters[field];
    if (value) {
      const optionLabel = options.find((option) => option.value === value)?.label ?? value;
      activeFilters.push({
        id: field,
        label: `${label}: ${optionLabel}`,
        onRemove: () => updateTaxonomyFilter(field, ''),
      });
    }
  };
  if (search.trim()) {
    activeFilters.push({
      id: 'search',
      label: `Busca: ${search.trim()}`,
      onRemove: () => updateSearch(''),
    });
  }
  addTaxonomyFilter('kingdom', 'Reino', kingdomOptionsQuery.data?.data ?? []);
  addTaxonomyFilter('phylum', 'Filo', phylumOptionsQuery.data?.data ?? []);
  addTaxonomyFilter('class', 'Classe', classOptionsQuery.data?.data ?? []);
  addTaxonomyFilter('order', 'Ordem', orderOptionsQuery.data?.data ?? []);
  addTaxonomyFilter('family', 'Família', familyOptionsQuery.data?.data ?? []);
  addTaxonomyFilter('genus', 'Gênero', genusOptionsQuery.data?.data ?? []);
  if (filters.extinct) {
    activeFilters.push({
      id: 'extinct',
      label: `Extinção: ${filters.extinct === 'true' ? 'Extintas' : 'Viventes'}`,
      onRemove: () => updateExtinctionFilter(''),
    });
  }
  for (const habitat of filters.habitat) {
    activeFilters.push({
      id: `habitat-${habitat}`,
      label: `Ambiente: ${getEnvironmentLabel(habitat)}`,
      onRemove: () => updateHabitatFilter(filters.habitat.filter((value) => value !== habitat)),
    });
  }
  if (filters.source) {
    const label = sourceOptionsQuery.data?.data.find((option) => option.value === filters.source)?.label
      ?? filters.source;
    activeFilters.push({
      id: 'source',
      label: `Fonte: ${label}`,
      onRemove: () => updateSourceFilter(''),
    });
  }

  return (
    <Page>
        <TopBar label="UM ATLAS VISUAL DA VIDA" />
        <PageNavigation
          items={[{ label: "Catálogo" }]}
          backHref="/"
          backLabel="Voltar ao início"
        />

        <Hero>
          <div>
            <Eyebrow>Pequenas cartas, um planeta inteiro</Eyebrow>
            <Headline>Conheça a vida <span>de perto.</span></Headline>
          </div>
          <Intro>
            Uma coleção visual da biodiversidade: explore espécies, suas classificações e os reinos que
            compartilham este planeta.
          </Intro>
        </Hero>

        <SearchBar aria-label="Busca no catálogo">
          <CatalogSearch value={search} minLength={MIN_SEARCH_LENGTH} onChange={updateSearch} />
          {search.trim().length > 0 && search.trim().length < MIN_SEARCH_LENGTH && (
            <SearchHint>Pesquise por nome popular, científico ou sinônimo. Mínimo de {MIN_SEARCH_LENGTH} caracteres.</SearchHint>
          )}
        </SearchBar>

        <CatalogLayout>
          <CatalogFilterPanel
            filters={filters}
            selectedCount={Object.values(filters).reduce((count, value) => (
              count + (Array.isArray(value) ? value.length : Number(Boolean(value)))
            ), 0)}
            options={{
              kingdom: optionsWithSelected(kingdomOptionsQuery.data?.data ?? [], filters.kingdom),
              phylum: optionsWithSelected(phylumOptionsQuery.data?.data ?? [], filters.phylum),
              class: optionsWithSelected(classOptionsQuery.data?.data ?? [], filters.class),
              order: optionsWithSelected(orderOptionsQuery.data?.data ?? [], filters.order),
              family: optionsWithSelected(familyOptionsQuery.data?.data ?? [], filters.family),
              genus: optionsWithSelected(genusOptionsQuery.data?.data ?? [], filters.genus),
              habitat: optionsWithSelected(
                getEnvironmentOptions(habitatOptionsQuery.data?.data ?? []),
                filters.habitat,
              ).map((option) => ({ ...option, label: getEnvironmentLabel(option.value) })),
              source: optionsWithSelected(sourceOptionsQuery.data?.data ?? [], filters.source),
            }}
            hasError={facetQueries.some((query) => query.isError)}
            isRetrying={isRetryingCatalog}
            onTaxonomyChange={(field: TaxonomyFacetField, value) => updateTaxonomyFilter(field, value)}
            onExtinctionChange={updateExtinctionFilter}
            onHabitatChange={updateHabitatFilter}
            onSourceChange={updateSourceFilter}
            onClearFilters={clearFilters}
            onRetry={retryCatalog}
          />
          <CatalogResults
            data={speciesQuery.data}
            activeFilters={activeFilters}
            isPending={speciesQuery.isPending}
            isError={speciesQuery.isError}
            isRetrying={isRetryingCatalog}
            page={page}
            sort={sort}
            onRetry={retryCatalog}
            onClearAll={clearCatalog}
            onPageChange={updatePage}
            onSortChange={updateSort}
          />
        </CatalogLayout>

        <Footer>BIODEX · Um projeto para explorar e celebrar a biodiversidade.</Footer>
    </Page>
  );
}
