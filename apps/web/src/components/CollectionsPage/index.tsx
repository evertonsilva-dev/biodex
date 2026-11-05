import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Share2, Trash2 } from "lucide-react";
import { getSpeciesByIds } from "../../api/species";
import { useCollections } from "../../collections/CollectionsProvider";
import { SpeciesCard } from "../SpeciesCard";
import { CollectionMenu } from "./CollectionMenu";
import { ConfirmDelete } from "./ConfirmDelete";
import { TopBar } from "../TopBar";
import type { CollectionsPageProps } from "./types";
import {
  Action,
  CollectionCard,
  CollectionGrid,
  CollectionIconActions,
  CollectionIconButton,
  CreateForm,
  DeckCard,
  DeckLink,
  DeckStage,
  ErrorMessage,
  Eyebrow,
  EmptyDeck,
  Heading,
  InlineForm,
  Notice,
  Page,
  SpeciesGrid,
} from "./styles";

const MAX_SHARED_SPECIES = 100;
const PREVIEW_CARD_LIMIT = 4;

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

export function CollectionsPage({ collectionId }: CollectionsPageProps) {
  const { collections, createCollection, renameCollection, deleteCollection } =
    useCollections();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const collection = collections.find((item) => item.id === collectionId);
  const isShared = collectionId === "shared";
  const sharedName =
    new URLSearchParams(window.location.search).get("name")?.trim() ||
    "Coleção compartilhada";
  const requestedSharedIds = useMemo(
    () => [
      ...new Set(
        new URLSearchParams(window.location.search)
          .getAll("species")
          .filter(Boolean),
      ),
    ],
    [],
  );
  const sharedIds = requestedSharedIds.slice(0, MAX_SHARED_SPECIES);
  const tooManySharedSpecies = requestedSharedIds.length > MAX_SHARED_SPECIES;
  const sharedSpeciesQuery = useQuery({
    queryKey: ["shared-collection", sharedIds],
    queryFn: ({ signal }) => getSpeciesByIds(sharedIds, signal),
    enabled: isShared && !tooManySharedSpecies && sharedIds.length > 0,
  });
  const sharedSpecies = useMemo(() => {
    const speciesById = new Map(
      (sharedSpeciesQuery.data?.data ?? []).map((species) => [
        species.documentId,
        species,
      ]),
    );
    return sharedIds
      .map((id) => speciesById.get(id))
      .filter((species) => species !== undefined);
  }, [sharedIds, sharedSpeciesQuery.data]);

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const created = createCollection(trimmed);
      window.location.href = `/collections/${encodeURIComponent(created.id)}`;
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível criar a coleção.",
      );
    }
  }

  function submitRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!collection || !name.trim()) return;
    try {
      renameCollection(collection.id, name);
      setName("");
      setError("");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível renomear a coleção.",
      );
    }
  }

  async function share() {
    if (!collection) return;
    if (collection.species.length > MAX_SHARED_SPECIES) {
      setError(`O compartilhamento aceita até ${MAX_SHARED_SPECIES} espécies.`);
      return;
    }
    const url = new URL("/collections/shared", window.location.origin);
    url.searchParams.set("name", collection.name);
    for (const species of collection.species)
      url.searchParams.append("species", species.documentId);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setError("");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? `Não foi possível copiar o link: ${reason.message}`
          : "Não foi possível copiar o link. Verifique a permissão da área de transferência.",
      );
    }
  }

  if (isShared) {
    return (
      <Page>
        <TopBar label="COLEÇÃO COMPARTILHADA" />
        <Heading>
          <div>
            <Eyebrow>Uma seleção do Biodex</Eyebrow>
            <h1>{sharedName}</h1>
            <p>Uma seleção de espécies compartilhada pela comunidade Biodex.</p>
          </div>
        </Heading>
        {tooManySharedSpecies && (
          <ErrorMessage role="alert">
            Este link excede o limite de {MAX_SHARED_SPECIES} espécies.
          </ErrorMessage>
        )}
        {sharedIds.length === 0 && (
          <Notice>Este link ainda não contém espécies.</Notice>
        )}
        {!tooManySharedSpecies &&
          sharedIds.length > 0 &&
          sharedSpeciesQuery.isPending && (
            <Notice>Carregando espécies compartilhadas…</Notice>
          )}
        {sharedSpeciesQuery.isError && (
          <ErrorMessage role="alert">
            Não foi possível carregar as espécies. Tente novamente mais tarde.
          </ErrorMessage>
        )}
        {!tooManySharedSpecies &&
          !sharedSpeciesQuery.isPending &&
          !sharedSpeciesQuery.isError &&
          sharedSpecies.length === 0 &&
          sharedIds.length > 0 && (
            <Notice>
              As espécies deste link não estão disponíveis no catálogo.
            </Notice>
          )}
        <SpeciesGrid>
          {sharedSpecies.map((species) => (
            <SpeciesCard key={species.documentId} species={species} />
          ))}
        </SpeciesGrid>
      </Page>
    );
  }

  if (collectionId && !collection) {
    return (
      <Page>
        <TopBar label="COLEÇÕES DE ESPÉCIES" />
        <Heading>
          <div>
            <Eyebrow>Suas descobertas</Eyebrow>
            <h1>Coleção não encontrada</h1>
            <p>Esta coleção não existe neste navegador.</p>
          </div>
        </Heading>
        <Action as="a" href="/collections">
          Voltar às coleções
        </Action>
      </Page>
    );
  }

  if (collection) {
    return (
      <Page>
        <TopBar label="COLEÇÃO DE ESPÉCIES" />
        <Heading>
          <div>
            <Eyebrow>Sua biblioteca pessoal</Eyebrow>
            <h1>{collection.name}</h1>
            <p>
              {collection.species.length}{" "}
              {collection.species.length === 1
                ? "espécie salva"
                : "espécies salvas"}{" "}
              nesta coleção.
            </p>
            <CollectionIconActions>
              <CollectionIconButton
                type="button"
                aria-label={copied ? "Link copiado" : "Compartilhar coleção"}
                title={copied ? "Link copiado" : "Compartilhar coleção"}
                onClick={() => void share()}
                disabled={collection.species.length === 0}
              >
                {copied ? (
                  <Check size={18} aria-hidden="true" />
                ) : (
                  <Share2 size={18} aria-hidden="true" />
                )}
              </CollectionIconButton>
              <CollectionIconButton
                type="button"
                aria-label="Excluir coleção"
                title="Excluir coleção"
                $danger
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={18} aria-hidden="true" />
              </CollectionIconButton>
            </CollectionIconActions>
          </div>
        </Heading>
        <InlineForm onSubmit={submitRename}>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Renomear coleção"
            aria-label="Novo nome da coleção"
            maxLength={60}
          />
          <Action type="submit" disabled={!name.trim()}>
            Renomear
          </Action>
        </InlineForm>
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
        {showDeleteConfirm && (
          <ConfirmDelete
            name={collection.name}
            onConfirm={() => {
              setShowDeleteConfirm(false);
              try {
                deleteCollection(collection.id);
                window.location.href = "/collections";
              } catch (reason) {
                setError(
                  reason instanceof Error
                    ? reason.message
                    : "Não foi possível excluir a coleção.",
                );
              }
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
        {collection.species.length === 0 ? (
          <Notice>
            Salve espécies nesta coleção usando o botão “＋ Coleção” nas cartas.
          </Notice>
        ) : (
          <SpeciesGrid>
            {collection.species.map((species) => (
              <SpeciesCard key={species.documentId} species={species} />
            ))}
          </SpeciesGrid>
        )}
      </Page>
    );
  }

  return (
    <Page>
      <TopBar label="COLEÇÕES DE ESPÉCIES" />
      <Heading>
        <div>
          <Eyebrow>Organize suas descobertas</Eyebrow>
          <h1>Suas coleções</h1>
          <p>
            Guarde espécies em seleções temáticas e compartilhe suas descobertas
            com um link.
          </p>
        </div>
      </Heading>
      <CreateForm onSubmit={submitCreate}>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Fauna da Mata Atlântica"
          aria-label="Nome da coleção"
          maxLength={60}
        />
        <Action type="submit" disabled={!name.trim()}>
          Criar coleção
        </Action>
      </CreateForm>
      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
      {collections.length === 0 ? (
        <Notice>
          Você ainda não criou coleções. Também pode salvar uma espécie
          diretamente pela carta no catálogo.
        </Notice>
      ) : (
        <CollectionGrid>
          {collections.map((item) => (
            <CollectionCard key={item.id}>
              <header>
                <div>
                  <h2>{item.name}</h2>
                  <p>
                    {item.species.length}{" "}
                    {item.species.length === 1 ? "espécie" : "espécies"}
                  </p>
                </div>
                <CollectionMenu
                  name={item.name}
                  onDelete={() => {
                    try {
                      deleteCollection(item.id);
                    } catch (reason) {
                      setError(
                        reason instanceof Error
                          ? reason.message
                          : "Não foi possível excluir a coleção.",
                      );
                    }
                  }}
                />
              </header>
              <DeckStage
                role="group"
                aria-label={`Prévia da coleção ${item.name}`}
              >
                {item.species.length === 0 ? (
                  <EmptyDeck>Adicione espécies para formar seu deck</EmptyDeck>
                ) : (
                  item.species
                    .slice(0, PREVIEW_CARD_LIMIT)
                    .map((species, index) => {
                      const position = deckPosition(
                        item.id,
                        species.documentId,
                        index,
                      );
                      return (
                        <DeckCard
                          key={species.documentId}
                          $x={position.x}
                          $y={position.y}
                          $rotation={position.rotation}
                          $z={position.z}
                          $spreadX={
                            (index -
                              (Math.min(
                                item.species.length,
                                PREVIEW_CARD_LIMIT,
                              ) -
                                1) /
                                2) *
                            34
                          }
                        >
                          <div className="deck-card-face">
                            <SpeciesCard species={species} preview />
                          </div>
                          <DeckLink
                            href={`/collections/${encodeURIComponent(item.id)}`}
                            aria-label={`Abrir coleção ${item.name}`}
                            title={`Abrir coleção ${item.name}`}
                          />
                        </DeckCard>
                      );
                    })
                )}
              </DeckStage>
            </CollectionCard>
          ))}
        </CollectionGrid>
      )}
    </Page>
  );
}
