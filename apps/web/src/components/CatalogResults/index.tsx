import { SpeciesCard } from '../SpeciesCard';
import { SpeciesCardSkeleton } from '../SpeciesCardSkeleton';
import { Skeleton } from '../Skeleton';
import { BiodexSelect } from '../BiodexSelect';
import type { CatalogResultsProps } from './types';
import {
  ActiveFilterChip,
  ActiveFilters,
  ClearAllButton,
  EmptyActions,
  Grid,
  Notice,
  PageButton,
  Pagination,
  ResultCount,
  Results,
  ResultsToolbar,
  SortLabel,
} from './styles';

export function CatalogResults({
  data,
  activeFilters,
  isPending,
  isError,
  isRetrying,
  page,
  sort,
  onRetry,
  onClearAll,
  onPageChange,
  onSortChange,
}: CatalogResultsProps) {
  return (
    <Results>
      <ResultsToolbar>
        <ResultCount aria-live="polite">
          {data
            ? <><strong>{data.meta.pagination.total.toLocaleString('pt-BR')}</strong> espécies encontradas</>
            : isPending
              ? <><Skeleton $width="3rem" $height="0.85rem" /> <Skeleton $width="12rem" $height="0.85rem" /></>
              : null}
        </ResultCount>
        <SortLabel>
          Ordenar por
          <BiodexSelect
            label="Ordenar por"
            options={[
              { value: 'relevance', label: 'Relevância' },
              { value: 'scientific', label: 'Nome científico' },
              { value: 'common', label: 'Nome popular' },
            ]}
            value={sort}
            placeholder="Relevância"
            isClearable={false}
            onChange={(value) => {
              if (value === 'relevance' || value === 'scientific' || value === 'common') {
                onSortChange(value satisfies CatalogResultsProps['sort']);
              }
            }}
          />
        </SortLabel>
      </ResultsToolbar>
      {activeFilters.length > 0 && (
        <ActiveFilters aria-label="Filtros ativos">
          {activeFilters.map((filter) => (
            <ActiveFilterChip
              key={filter.id}
              type="button"
              aria-label={`Remover ${filter.label}`}
              onClick={filter.onRemove}
            >
              {filter.label}
            </ActiveFilterChip>
          ))}
          <ClearAllButton type="button" onClick={onClearAll}>
            Limpar tudo
          </ClearAllButton>
        </ActiveFilters>
      )}
      {isPending && !data && (
        <Grid role="status" aria-label="Carregando espécies do catálogo">
          {Array.from({ length: 8 }, (_, index) => (
            <SpeciesCardSkeleton key={index} />
          ))}
        </Grid>
      )}
      {isError && (
        <Notice $error role="alert">
          Não foi possível carregar as espécies. Verifique a conexão PostgreSQL da API e importe o catálogo.
          <PageButton type="button" onClick={onRetry} disabled={isRetrying}>
            {isRetrying ? 'Tentando novamente…' : 'Tente novamente'}
          </PageButton>
        </Notice>
      )}
      {data && data.data.length === 0 && (
        <Notice>
          Não encontramos espécies com essa busca e combinação de filtros. Tente outro termo ou ajuste os filtros.
          <EmptyActions>
            <PageButton type="button" onClick={onClearAll}>
              Limpar busca e filtros
            </PageButton>
          </EmptyActions>
        </Notice>
      )}
      {data && data.data.length > 0 && (
        <Grid aria-label="Cartas de espécies">
          {data.data.map((species) => (
            <SpeciesCard key={species.documentId} species={species} />
          ))}
        </Grid>
      )}
      {data && data.meta.pagination.pageCount > 1 && (
        <Pagination aria-label="Paginação das cartas">
          <PageButton disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Anterior
          </PageButton>
          <span>
            Página {page.toLocaleString('pt-BR')} de {data.meta.pagination.pageCount.toLocaleString('pt-BR')}
          </span>
          <PageButton
            disabled={page >= data.meta.pagination.pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
          </PageButton>
        </Pagination>
      )}
    </Results>
  );
}
