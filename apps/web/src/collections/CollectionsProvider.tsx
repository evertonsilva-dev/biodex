import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { CollectionsContextValue, SpeciesCollection } from './types';
import type { Species } from '../types/species';

const STORAGE_KEY = 'biodex:collections:v1';
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

function readCollections(): SpeciesCollection[] {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  const parsed: unknown = JSON.parse(saved);
  if (!Array.isArray(parsed) || !parsed.every((item) =>
    isRecord(item)
    && typeof item.id === 'string'
    && typeof item.name === 'string'
    && Array.isArray(item.species)
    && item.species.every(isSpecies),
  )) {
    throw new Error('O armazenamento local das coleções do Biodex está inválido.');
  }
  return parsed;
}

function persistCollections(collections: SpeciesCollection[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
}

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState(readCollections);

  const commit = useCallback((next: SpeciesCollection[]) => {
    persistCollections(next);
    setCollections(next);
  }, []);

  const createCollection = useCallback((name: string, species?: Species) => {
    const collection: SpeciesCollection = {
      id: crypto.randomUUID(),
      name: name.trim(),
      species: species ? [species] : [],
    };
    commit([...collections, collection]);
    return collection;
  }, [collections, commit]);

  const renameCollection = useCallback((id: string, name: string) => {
    commit(collections.map((collection) => (
      collection.id === id ? { ...collection, name: name.trim() } : collection
    )));
  }, [collections, commit]);

  const deleteCollection = useCallback((id: string) => {
    commit(collections.filter((collection) => collection.id !== id));
  }, [collections, commit]);

  const toggleSpecies = useCallback((collectionId: string, species: Species) => {
    commit(collections.map((collection) => {
      if (collection.id !== collectionId) return collection;
      const exists = collection.species.some((item) => item.documentId === species.documentId);
      return {
        ...collection,
        species: exists
          ? collection.species.filter((item) => item.documentId !== species.documentId)
          : [...collection.species, species],
      };
    }));
  }, [collections, commit]);

  return (
    <CollectionsContext.Provider value={{
      collections,
      createCollection,
      renameCollection,
      deleteCollection,
      toggleSpecies,
    }}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) throw new Error('useCollections deve ser usado dentro de CollectionsProvider.');
  return context;
}
