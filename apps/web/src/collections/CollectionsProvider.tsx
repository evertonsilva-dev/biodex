import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getSpeciesByIds } from '../api/species';
import {
  createUserCollection,
  deleteUserCollection,
  getUserCollections,
  importUserCollections,
  updateUserCollection,
} from '../api/user-collections';
import { useAuth } from '../auth/AuthProvider';
import type { UserCollectionRecord } from '../api/user-collections';
import type { CollectionsContextValue, SpeciesCollection } from './types';
import type { Species } from '../types/species';

const STORAGE_KEY = 'biodex:collections:v1';
const SPECIES_BATCH_SIZE = 100;
const CollectionsContext = createContext<CollectionsContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSpecies(value: unknown): value is Species {
  return isRecord(value)
    && (typeof value.id === 'string' || typeof value.id === 'number')
    && typeof value.documentId === 'string'
    && typeof value.commonName === 'string'
    && typeof value.scientificName === 'string';
}

function isSpeciesCollection(value: unknown): value is SpeciesCollection {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && Array.isArray(value.species)
    && value.species.every(isSpecies)
    && (value.speciesIds === undefined
      || (Array.isArray(value.speciesIds)
        && value.speciesIds.every((id) => typeof id === 'string')));
}

function readCollections(): SpeciesCollection[] {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  const parsed: unknown = JSON.parse(saved);
  if (!Array.isArray(parsed) || !parsed.every(isSpeciesCollection)) {
    throw new Error('O armazenamento local das coleções do Biodex está inválido.');
  }
  return parsed;
}

function persistCollections(collections: SpeciesCollection[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
}

function speciesIdsOf(collection: SpeciesCollection): string[] {
  return collection.speciesIds
    ?? collection.species.map((species) => species.documentId);
}

function collectionRecord(collection: SpeciesCollection): UserCollectionRecord {
  return {
    id: collection.id,
    name: collection.name,
    speciesIds: speciesIdsOf(collection),
  };
}

function errorMessage(reason: unknown): string {
  return reason instanceof Error
    ? reason.message
    : 'Não foi possível sincronizar suas coleções.';
}

async function hydrateCollections(
  records: UserCollectionRecord[],
  cachedSpecies: Species[],
): Promise<SpeciesCollection[]> {
  const speciesById = new Map(
    cachedSpecies.map((species) => [species.documentId, species]),
  );
  const missingIds = [
    ...new Set(
      records.flatMap((collection) => collection.speciesIds)
        .filter((id) => !speciesById.has(id)),
    ),
  ];

  for (let index = 0; index < missingIds.length; index += SPECIES_BATCH_SIZE) {
    const batch = missingIds.slice(index, index + SPECIES_BATCH_SIZE);
    const result = await getSpeciesByIds(batch);
    for (const species of result.data) {
      speciesById.set(species.documentId, species);
    }
  }

  return records.map((collection) => ({
    ...collection,
    species: collection.speciesIds
      .map((id) => speciesById.get(id))
      .filter((species): species is Species => species !== undefined),
  }));
}

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const { getAccessToken, status, user } = useAuth();
  const [collections, setCollections] = useState(readCollections);
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (status === 'loading') {
      setIsLoading(true);
      return () => {
        cancelled = true;
      };
    }

    if (status !== 'authenticated' || !user) {
      setCollections(readCollections());
      setIsLoading(false);
      setSyncError(null);
      return () => {
        cancelled = true;
      };
    }

    setCollections([]);
    setIsLoading(true);
    setSyncError(null);

    void (async () => {
      let localCollections: SpeciesCollection[] = [];
      try {
        localCollections = readCollections();
        const token = await getAccessToken();
        const localRecords = localCollections.map(collectionRecord);
        if (localRecords.length > 0) {
          await importUserCollections(token, localRecords);
        }

        const records = await getUserCollections(token);
        const cachedSpecies = localCollections.flatMap(
          (collection) => collection.species,
        );
        const hydrated = await hydrateCollections(records, cachedSpecies);

        if (cancelled) return;
        if (localCollections.length > 0) {
          window.localStorage.removeItem(STORAGE_KEY);
        }
        setCollections(hydrated);
      } catch (reason) {
        if (cancelled) return;
        setCollections(localCollections);
        setSyncError(errorMessage(reason));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getAccessToken, status, user?.id]);

  const createCollection = useCallback(async (name: string, species?: Species) => {
    const trimmed = name.trim();
    const initialSpecies = species ? [species] : [];
    if (status === 'authenticated') {
      const token = await getAccessToken();
      const created = await createUserCollection(
        token,
        trimmed,
        initialSpecies.map((item) => item.documentId),
      );
      const collection: SpeciesCollection = {
        ...created,
        species: initialSpecies,
      };
      setCollections((current) => [...current, collection]);
      return collection;
    }

    const collection: SpeciesCollection = {
      id: crypto.randomUUID(),
      name: trimmed,
      species: initialSpecies,
    };
    const next = [...collections, collection];
    persistCollections(next);
    setCollections(next);
    return collection;
  }, [collections, getAccessToken, status]);

  const renameCollection = useCallback(async (id: string, name: string) => {
    const current = collections.find((collection) => collection.id === id);
    if (!current) return;
    const updated = { ...current, name: name.trim() };

    if (status === 'authenticated') {
      const token = await getAccessToken();
      await updateUserCollection(token, collectionRecord(updated));
    } else {
      persistCollections(
        collections.map((collection) => collection.id === id ? updated : collection),
      );
    }
    setCollections((items) =>
      items.map((collection) => collection.id === id ? updated : collection),
    );
  }, [collections, getAccessToken, status]);

  const deleteCollection = useCallback(async (id: string) => {
    if (status === 'authenticated') {
      const token = await getAccessToken();
      await deleteUserCollection(token, id);
    }
    const next = collections.filter((collection) => collection.id !== id);
    if (status !== 'authenticated') persistCollections(next);
    setCollections(next);
  }, [collections, getAccessToken, status]);

  const toggleSpecies = useCallback(async (
    collectionId: string,
    species: Species,
  ) => {
    const current = collections.find((collection) => collection.id === collectionId);
    if (!current) return;

    const currentIds = speciesIdsOf(current);
    const exists = currentIds.includes(species.documentId);
    const speciesIds = exists
      ? currentIds.filter((id) => id !== species.documentId)
      : [...currentIds, species.documentId];
    const speciesById = new Map(
      current.species.map((item) => [item.documentId, item]),
    );
    if (exists) speciesById.delete(species.documentId);
    else speciesById.set(species.documentId, species);
    const updated: SpeciesCollection = {
      ...current,
      speciesIds,
      species: speciesIds
        .map((id) => speciesById.get(id))
        .filter((item): item is Species => item !== undefined),
    };

    if (status === 'authenticated') {
      const token = await getAccessToken();
      await updateUserCollection(token, collectionRecord(updated));
    } else {
      persistCollections(
        collections.map((collection) =>
          collection.id === collectionId ? updated : collection,
        ),
      );
    }
    setCollections((items) =>
      items.map((collection) =>
        collection.id === collectionId ? updated : collection,
      ),
    );
  }, [collections, getAccessToken, status]);

  const value = useMemo(
    () => ({
      collections,
      isLoading,
      syncError,
      createCollection,
      renameCollection,
      deleteCollection,
      toggleSpecies,
    }),
    [
      collections,
      isLoading,
      syncError,
      createCollection,
      renameCollection,
      deleteCollection,
      toggleSpecies,
    ],
  );

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) throw new Error('useCollections deve ser usado dentro de CollectionsProvider.');
  return context;
}
