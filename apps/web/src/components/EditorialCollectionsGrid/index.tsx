import { useQuery } from '@tanstack/react-query';
import { getEditorialCollections } from '../../api/editorial-collections';
import { Skeleton } from '../Skeleton';
import { EditorialCollectionCard } from '../EditorialCollectionCard';
import {
  CardSkeleton,
  CardSkeletonFooter,
  DeckCardSkeleton,
  DeckSkeleton,
  EmptyState,
  ErrorState,
  Grid,
  Heading,
  Section,
  SectionIntro,
} from './styles';

export function EditorialCollectionsGrid() {
  const collectionsQuery = useQuery({
    queryKey: ['editorial-collections'],
    queryFn: ({ signal }) => getEditorialCollections(signal),
  });
  const editorialCollections = collectionsQuery.data ?? [];
  const trails = editorialCollections.filter((collection) => collection.steps.length > 0);
  const collections = editorialCollections.filter((collection) => collection.steps.length === 0);

  return (
    <>
      <Section id="trilhas" aria-labelledby="discovery-trails-heading">
        <div>
          <SectionIntro>UM PERCURSO POR VEZ</SectionIntro>
          <Heading id="discovery-trails-heading">Trilhas de descoberta</Heading>
        </div>

        {collectionsQuery.isPending && (
          <Grid role="status" aria-label="Carregando trilhas de descoberta">
            {[0, 1, 2].map((index) => (
              <CardSkeleton key={index} aria-hidden="true">
                <Skeleton $width="8rem" $height="0.62rem" $radius="999px" />
                <DeckSkeleton>
                  {[-1, 0, 1].map((layer) => (
                    <DeckCardSkeleton
                      key={layer}
                      $offset={layer * 17}
                      $rotation={layer * 8}
                      $layer={layer + 2}
                    >
                      <Skeleton $height="100%" $radius="inherit" $tone="forest" />
                    </DeckCardSkeleton>
                  ))}
                </DeckSkeleton>
                <Skeleton $width="76%" $height="1.55rem" $radius="4px" />
                <Skeleton $height="0.75rem" />
                <Skeleton $width="82%" $height="0.75rem" />
                <CardSkeletonFooter>
                  <Skeleton $width="7rem" $height="0.62rem" />
                  <Skeleton $width="5.2rem" $height="0.62rem" />
                </CardSkeletonFooter>
              </CardSkeleton>
            ))}
          </Grid>
        )}

        {collectionsQuery.isError && (
          <ErrorState role="alert">
            Não foi possível carregar o conteúdo editorial.
            <button type="button" onClick={() => void collectionsQuery.refetch()}>
              Tentar novamente
            </button>
          </ErrorState>
        )}

        {collectionsQuery.data && trails.length === 0 && (
          <EmptyState>
            {collections.length === 0
              ? 'Nenhum conteúdo editorial publicado no momento.'
              : 'Novas trilhas de descoberta em breve.'}
          </EmptyState>
        )}

        {trails.length > 0 && (
          <Grid>
            {trails.map((collection) => (
              <EditorialCollectionCard key={collection.id} collection={collection} />
            ))}
          </Grid>
        )}
      </Section>

      {collections.length > 0 && (
        <Section id="colecoes" aria-labelledby="editorial-collections-heading">
          <div>
            <SectionIntro>SELEÇÕES CURADAS</SectionIntro>
            <Heading id="editorial-collections-heading">Coleções editoriais</Heading>
          </div>
          <Grid>
            {collections.map((collection) => (
              <EditorialCollectionCard key={collection.id} collection={collection} />
            ))}
          </Grid>
        </Section>
      )}
    </>
  );
}
