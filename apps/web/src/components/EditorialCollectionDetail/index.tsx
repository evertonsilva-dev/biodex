import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { getSpeciesByIds } from '../../api/species';
import { useEditorialCollection } from '../../hooks/useEditorialCollection';
import { SpeciesCard } from '../SpeciesCard';
import { TopBar } from '../TopBar';

const Page = styled.main`
  width: min(1200px, calc(100% - 3rem));
  min-height: 100vh;
  margin: 0 auto;
  padding: 2rem 0 5rem;
  color: ${({ theme }) => theme.colors.ink};

  @media (max-width: 600px) {
    width: min(100% - 2rem, 1200px);
    padding-top: 1.25rem;
  }
`;

const Heading = styled.section`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 4.5rem 0 2.5rem;

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.ink};
    font-family: ${({ theme }) => theme.fonts.highlightTitle};
    font-size: clamp(2.8rem, 6vw, 5rem);
    font-weight: 400;
    letter-spacing: -0.075em;
    line-height: 0.96;
  }

  @media (max-width: 700px) {
    display: block;
    padding: 3rem 0 2rem;
  }
`;

const Eyebrow = styled.p`
  margin: 0 0 0.8rem;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const Description = styled.p`
  max-width: 34rem;
  margin: 0.75rem 0 0;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.65;
`;

const CollectionCount = styled.p`
  flex: 0 0 auto;
  margin: 0 0 0.35rem;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  @media (max-width: 700px) {
    margin-top: 1.25rem;
  }
`;

const Introduction = styled.section`
  max-width: 780px;
  margin: 0 0 3.5rem;
  padding-top: 1.4rem;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.highlightTitle};
  font-size: clamp(1.3rem, 2.4vw, 1.8rem);
  line-height: 1.55;
`;

const SpeciesSection = styled.section`
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
`;

const SpeciesSectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 600px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.4rem;
  }
`;

const SpeciesHeading = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.highlightTitle};
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 400;
  letter-spacing: -0.055em;
`;

const SpeciesCount = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
`;

const SpeciesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 1rem;
`;

const Status = styled.p`
  margin: 1.5rem 0;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.6;
`;

interface EditorialCollectionDetailProps {
  slug: string;
}

export function EditorialCollectionDetail({ slug }: EditorialCollectionDetailProps) {
  const collectionQuery = useEditorialCollection(slug);
  const collection = collectionQuery.data;
  const speciesQuery = useQuery({
    queryKey: ['editorial-collection-species', collection?.id],
    queryFn: ({ signal }) => {
      if (!collection) throw new Error('A coleção editorial não foi carregada.');
      return getSpeciesByIds(collection.speciesIds, signal);
    },
    enabled: Boolean(collection?.speciesIds.length),
  });
  const species = useMemo(() => {
    if (!collection) return [];
    const speciesById = new Map(
      (speciesQuery.data?.data ?? []).map((item) => [item.documentId, item]),
    );
    return collection.speciesIds
      .map((id) => speciesById.get(id))
      .filter((item) => item !== undefined);
  }, [collection, speciesQuery.data]);

  return (
    <Page>
      <TopBar label="COLEÇÃO EDITORIAL" />

      {collectionQuery.isPending && (
        <Status role="status">Carregando coleção…</Status>
      )}

      {(collectionQuery.isError || (!collectionQuery.isPending && !collection)) && (
        <Status role="alert">Não foi possível encontrar esta coleção editorial.</Status>
      )}

      {collection && (
        <>
          <Heading>
            <div>
              <Eyebrow>
                Coleção {String(collection.order).padStart(2, '0')} · Seleção Biodex
              </Eyebrow>
              <h1>{collection.title}</h1>
              <Description>{collection.description}</Description>
            </div>
            <CollectionCount>
              {collection.speciesIds.length}{' '}
              {collection.speciesIds.length === 1 ? 'carta' : 'cartas'}
            </CollectionCount>
          </Heading>

          <Introduction>{collection.introduction}</Introduction>

          <SpeciesSection>
            <SpeciesSectionHeader>
              <SpeciesHeading>Cartas selecionadas</SpeciesHeading>
              <SpeciesCount>
                {species.length} de {collection.speciesIds.length} espécies
              </SpeciesCount>
            </SpeciesSectionHeader>

            {speciesQuery.isPending && collection.speciesIds.length > 0 && (
              <Status role="status">Carregando espécies…</Status>
            )}

            {speciesQuery.isError && (
              <Status role="alert">
                Não foi possível carregar as espécies desta coleção.
              </Status>
            )}

            {speciesQuery.data && species.length === 0 && (
              <Status>Esta coleção ainda não tem cartas publicadas.</Status>
            )}

            {collection.speciesIds.length === 0 && (
              <Status>Esta coleção ainda não tem cartas publicadas.</Status>
            )}

            {species.length > 0 && (
              <SpeciesGrid aria-label="Cartas selecionadas">
                {species.map((item) => (
                  <SpeciesCard key={item.documentId} species={item} />
                ))}
              </SpeciesGrid>
            )}
          </SpeciesSection>
        </>
      )}
    </Page>
  );
}
