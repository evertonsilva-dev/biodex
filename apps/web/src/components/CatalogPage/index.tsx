

import { useCatalogPage, optionsWithSelected, MIN_SEARCH_LENGTH } from '../../hooks/useCatalogPage';
import type { CatalogFacetField } from '../../types/species';
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
    filters, search, page, kingdomOptionsQuery, phylumOptionsQuery, classOptionsQuery,
    orderOptionsQuery, familyOptionsQuery, genusOptionsQuery, facetQueries, speciesQuery,
    retryCatalog, isRetryingCatalog, updateTaxonomyFilter, updateExtinctionFilter,
    updateSearch, updatePage,
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
            placeholder="Buscar por nome popular ou científico"
            aria-label="Buscar espécies"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
          />
          {search.trim().length > 0 && search.trim().length < MIN_SEARCH_LENGTH && (
            <SearchHint>Digite pelo menos {MIN_SEARCH_LENGTH} caracteres para pesquisar.</SearchHint>
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
            }}
            hasError={facetQueries.some((query) => query.isError)}
            isRetrying={isRetryingCatalog}
            onTaxonomyChange={(field: CatalogFacetField, value) => updateTaxonomyFilter(field, value)}
            onExtinctionChange={updateExtinctionFilter}
            onRetry={retryCatalog}
          />
          <CatalogResults
            data={speciesQuery.data}
            isPending={speciesQuery.isPending}
            isError={speciesQuery.isError}
            isRetrying={isRetryingCatalog}
            page={page}
            onRetry={retryCatalog}
            onPageChange={updatePage}
          />
        </CatalogLayout>

        <Footer>BIODEX · Um projeto para explorar e celebrar a biodiversidade.</Footer>
    </Page>
  );
}
