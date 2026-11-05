import { useQuery } from '@tanstack/react-query';
import { getEditorialCollections } from '../../api/editorial-collections';
import { EditorialCollectionCard } from '../EditorialCollectionCard';
import {
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
        <EmptyState role="status">Carregando coleções…</EmptyState>
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
