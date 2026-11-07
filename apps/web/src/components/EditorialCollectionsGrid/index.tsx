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

  return (
    <Section id="colecoes" aria-labelledby="editorial-collections-heading">
      <div>
        <SectionIntro>UM PERCURSO POR VEZ</SectionIntro>
        <Heading id="editorial-collections-heading">Coleções editoriais</Heading>
      </div>

      {collectionsQuery.isPending && (
        <Grid role="status" aria-label="Carregando coleções editoriais">
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
          Não foi possível carregar as coleções editoriais.
          <button type="button" onClick={() => void collectionsQuery.refetch()}>
            Tentar novamente
          </button>
        </ErrorState>
      )}

      {collectionsQuery.data?.length === 0 && (
        <EmptyState>Nenhuma coleção editorial publicada no momento.</EmptyState>
      )}

      {collectionsQuery.data && collectionsQuery.data.length > 0 && (
        <Grid>
          {collectionsQuery.data.map((collection) => (
            <EditorialCollectionCard key={collection.id} collection={collection} />
          ))}
        </Grid>
      )}
    </Section>
  );
}
