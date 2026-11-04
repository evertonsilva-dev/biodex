import { SpeciesCard } from '../SpeciesCard';
import { SpeciesCardSkeleton } from '../SpeciesCardSkeleton';
import { Skeleton } from '../Skeleton';
import type { CatalogResultsProps } from './types';
import { Grid, Notice, PageButton, Pagination, ResultCount, Results, ResultsToolbar, SortLabel, SortSelect } from './styles';

export function CatalogResults({
  data,
  isPending,
  isError,
  isRetrying,
  page,
  sort,
  onRetry,
  onPageChange,
  onSortChange,
}: CatalogResultsProps) {
  return (
    <Results>
      <ResultsToolbar>
        <ResultCount>
          {data
            ? <><strong>{data.meta.pagination.total.toLocaleString('pt-BR')}</strong> espécies encontradas</>
            : isPending
              ? <><Skeleton $width="3rem" $height="0.85rem" /> <Skeleton $width="12rem" $height="0.85rem" /></>
              : null}
        </ResultCount>
        <SortLabel>
          Ordenar por
          <SortSelect value={sort} onChange={(event) => onSortChange(
            event.target.value as CatalogResultsProps['sort'],
          )}>
            <option value="relevance">Relevância</option>
            <option value="scientific">Nome científico</option>
            <option value="common">Nome popular</option>
          </SortSelect>
        </SortLabel>
      </ResultsToolbar>
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
