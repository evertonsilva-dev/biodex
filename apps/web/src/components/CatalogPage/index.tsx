

import { useCatalogPage, optionsWithSelected, MIN_SEARCH_LENGTH } from '../../hooks/useCatalogPage';
import type { TaxonomyFacetField } from '../../types/species';
import { CatalogFilterPanel } from '../CatalogFilterPanel';
import { CatalogResults } from '../CatalogResults';
import { TopBar } from '../TopBar';
import {
  Page,
  Hero,
  Eyebrow,
  Headline,
  Intro,
  SearchBar,
  CatalogLayout,
  Search,
  SearchHint,
  Footer,
} from './styles';

export function CatalogPage() {
  const {
    filters, search, page, sort, kingdomOptionsQuery, phylumOptionsQuery, classOptionsQuery,
    orderOptionsQuery, familyOptionsQuery, genusOptionsQuery, habitatOptionsQuery,
    sourceOptionsQuery, facetQueries, speciesQuery,
    retryCatalog, isRetryingCatalog, updateTaxonomyFilter, updateExtinctionFilter,
    updateAdditionalFilter, updateSearch, updatePage, updateSort, clearFilters,
  } = useCatalogPage();

  return (
    <Page>
        <TopBar label="UM ATLAS VISUAL DA VIDA" />

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
          <Search
            type="search"
            placeholder="Nome popular, científico ou sinônimo"
            aria-label="Buscar espécies por nome popular, científico ou sinônimo"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
          />
          {search.trim().length > 0 && search.trim().length < MIN_SEARCH_LENGTH && (
            <SearchHint>Pesquise por nome popular, científico ou sinônimo. Mínimo de {MIN_SEARCH_LENGTH} caracteres.</SearchHint>
          )}
        </SearchBar>

        <CatalogLayout>
          <CatalogFilterPanel
            filters={filters}
            options={{
              kingdom: optionsWithSelected(kingdomOptionsQuery.data?.data ?? [], filters.kingdom),
              phylum: optionsWithSelected(phylumOptionsQuery.data?.data ?? [], filters.phylum),
              class: optionsWithSelected(classOptionsQuery.data?.data ?? [], filters.class),
              order: optionsWithSelected(orderOptionsQuery.data?.data ?? [], filters.order),
              family: optionsWithSelected(familyOptionsQuery.data?.data ?? [], filters.family),
              genus: optionsWithSelected(genusOptionsQuery.data?.data ?? [], filters.genus),
              habitat: optionsWithSelected(habitatOptionsQuery.data?.data ?? [], filters.habitat),
              source: optionsWithSelected(sourceOptionsQuery.data?.data ?? [], filters.source),
            }}
            hasError={facetQueries.some((query) => query.isError)}
            isRetrying={isRetryingCatalog}
            onTaxonomyChange={(field: TaxonomyFacetField, value) => updateTaxonomyFilter(field, value)}
            onExtinctionChange={updateExtinctionFilter}
            onAdditionalFilterChange={updateAdditionalFilter}
            onClearFilters={clearFilters}
            onRetry={retryCatalog}
          />
          <CatalogResults
            data={speciesQuery.data}
            isPending={speciesQuery.isPending}
            isError={speciesQuery.isError}
            isRetrying={isRetryingCatalog}
            page={page}
            sort={sort}
            onRetry={retryCatalog}
            onPageChange={updatePage}
            onSortChange={updateSort}
          />
        </CatalogLayout>

        <Footer>BIODEX · Um projeto para explorar e celebrar a biodiversidade.</Footer>
    </Page>
  );
}
