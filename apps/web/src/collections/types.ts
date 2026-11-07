import type { Species } from '../types/species';

export interface SpeciesCollection {
  id: string;
  name: string;
  species: Species[];
  speciesIds?: string[];
}

export interface EditorialCollection {
  id: string;
  slug: string;
  title: string;
  description: string;
  introduction: string;
  featuredImageUrl: string | null;
  speciesIds: string[];
  order: number;
}

export interface CollectionsContextValue {
  collections: SpeciesCollection[];
  isLoading: boolean;
  syncError: string | null;
  createCollection: (name: string, species?: Species) => Promise<SpeciesCollection>;
  renameCollection: (id: string, name: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  toggleSpecies: (collectionId: string, species: Species) => Promise<void>;
}
