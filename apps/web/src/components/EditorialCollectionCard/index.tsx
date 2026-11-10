import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { getSpeciesByIds } from '../../api/species';
import type { EditorialCollection } from '../../collections/types';
import { SpeciesCard } from '../SpeciesCard';

const PREVIEW_CARD_LIMIT = 4;

const Card = styled.article`
  min-width: 0;
  color: ${({ theme }) => theme.colors.ink};

  &:hover h3 a {
    color: ${({ theme }) => theme.colors.green};
  }
`;

const DeckStage = styled.div`
  position: relative;
  height: 300px;
  margin: 0 -0.5rem 1rem;
  overflow: hidden;
  background: radial-gradient(
    ellipse at 50% 68%,
    ${({ theme }) => `${theme.colors.green}18`},
    transparent 68%
  );

  &:hover > div,
  &:focus-within > div {
    transform: translate(calc(-50% + var(--deck-spread-x)), -50%) rotate(0);
  }

  @media (max-width: 600px) {
    height: 280px;
  }
`;

const DeckCard = styled.div<{
  $x: number;
  $y: number;
  $rotation: number;
  $z: number;
  $spreadX: number;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: ${({ $z }) => $z};
  --deck-spread-x: ${({ $spreadX }) => `${$spreadX}px`};
  width: 147px;
  height: 210px;
  transform: translate(
      calc(-50% + ${({ $x }) => $x}px),
      calc(-50% + ${({ $y }) => $y}px)
    )
    rotate(${({ $rotation }) => $rotation}deg);
  filter: drop-shadow(0 8px 9px #202b2633);
  transition:
    transform 480ms cubic-bezier(0.2, 0.75, 0.25, 1),
    filter 220ms ease;
  will-change: transform;

  .deck-card-face {
    width: 300px;
    height: 429px;
    transform: scale(0.49);
    transform-origin: top left;
    pointer-events: none;
  }

  @media (hover: hover) {
    &:hover {
      filter: drop-shadow(0 12px 12px #202b2640);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const CollectionNumber = styled.p`
  margin: 0 0 0.45rem;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const Title = styled.h3`
  margin: 0 0 0.45rem;
  font-family: ${({ theme }) => theme.fonts.highlightTitle};
  font-size: 1.65rem;
  font-weight: 400;
  letter-spacing: -0.045em;

  a {
    color: ${({ theme }) => theme.colors.ink};
    text-decoration: none;
    transition: color 160ms ease;
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 4px;
  }
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.88rem;
  line-height: 1.65;
`;

const CollectionMeta = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.9rem;
  border-top: 1px solid ${({ theme }) => theme.colors.line};

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.72rem;
  }
`;

const CollectionLink = styled.a`
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }
`;

const EmptyDeck = styled.div`
  display: grid;
  height: 100%;
  place-items: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
`;

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function deckPosition(collectionId: string, speciesId: string, index: number) {
  const seed = hash(`${collectionId}:${speciesId}`);
  return {
    x: (seed % 49) - 24,
    y: ((seed >>> 7) % 25) - 12,
    rotation: ((seed >>> 14) % 25) - 12,
    z: index + 1,
  };
}

interface EditorialCollectionCardProps {
  collection: EditorialCollection;
}

export function EditorialCollectionCard({ collection }: EditorialCollectionCardProps) {
  const previewIds = collection.speciesIds.slice(0, PREVIEW_CARD_LIMIT);
  const collectionHref = `/collections/editorial/${encodeURIComponent(collection.slug)}`;
  const speciesQuery = useQuery({
    queryKey: ['editorial-collection-preview', collection.id, previewIds],
    queryFn: ({ signal }) => getSpeciesByIds(previewIds, signal),
    enabled: previewIds.length > 0,
  });
  const previewSpecies = useMemo(() => {
    const speciesById = new Map(
      (speciesQuery.data?.data ?? []).map((species) => [species.documentId, species]),
    );
    return previewIds
      .map((id) => speciesById.get(id))
      .filter((species) => species !== undefined);
  }, [previewIds, speciesQuery.data]);

  return (
    <Card>
      <CollectionNumber>
        {String(collection.order).padStart(2, '0')} /{' '}
        {collection.steps.length > 0 ? 'TRILHA DE DESCOBERTA' : 'COLEÇÃO EDITORIAL'}
      </CollectionNumber>
      <DeckStage
        role="group"
        aria-label={`Prévia das cartas da coleção ${collection.title}`}
      >
        {speciesQuery.isPending && previewIds.length > 0 && (
          <EmptyDeck role="status">Preparando as cartas…</EmptyDeck>
        )}
        {speciesQuery.isError && (
          <EmptyDeck role="status">Prévia das cartas indisponível</EmptyDeck>
        )}
        {!speciesQuery.isPending && !speciesQuery.isError && previewSpecies.length === 0 && (
          <EmptyDeck>Esta coleção ainda não tem cartas</EmptyDeck>
        )}
        {previewSpecies.map((species, index) => {
          const position = deckPosition(collection.id, species.documentId, index);
          return (
            <DeckCard
              key={species.documentId}
              $x={position.x}
              $y={position.y}
              $rotation={position.rotation}
              $z={position.z}
              $spreadX={(index - (previewSpecies.length - 1) / 2) * 34}
            >
              <div className="deck-card-face">
                <SpeciesCard species={species} preview />
              </div>
            </DeckCard>
          );
        })}
      </DeckStage>
      <Title>
        <a href={collectionHref}>{collection.title}</a>
      </Title>
      <Description>{collection.description}</Description>
      <CollectionMeta>
        <span>
          {collection.steps.length > 0
            ? `${collection.steps.length} passos`
            : `${collection.speciesIds.length} cartas selecionadas`}
        </span>
        <CollectionLink href={collectionHref}>
          {collection.steps.length > 0 ? 'Começar trilha' : 'Abrir coleção'}
          {' '}<span aria-hidden="true">↗</span>
        </CollectionLink>
      </CollectionMeta>
    </Card>
  );
}
