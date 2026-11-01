import { SpeciesCard } from '../SpeciesCard';
import { SpeciesCardSkeleton } from '../SpeciesCardSkeleton';
import { Skeleton } from '../Skeleton';
import type { CatalogResultsProps } from './types';
import { Grid, Notice, PageButton, Pagination, ResultCount, Results } from './styles';

export function CatalogResults({
  data,
  isPending,
  isError,
  isRetrying,
  page,
  onRetry,
  onPageChange,
}: CatalogResultsProps) {
  return (
    <Results>
      <ResultCount>
        {data
          ? <><strong>{data.meta.pagination.total.toLocaleString('pt-BR')}</strong> espécies aceitas no catálogo</>
          : isPending
            ? <><Skeleton $width="3rem" $height="0.85rem" /> <Skeleton $width="12rem" $height="0.85rem" /></>
            : null}
      </ResultCount>
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
          Não há espécies para este filtro. Confira os filtros ou importe o catálogo do Catalogue of Life.
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
