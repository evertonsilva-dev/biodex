import type { Species } from '../types/species';

export interface SpeciesCollection {
  id: string;
  name: string;
  species: Species[];
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
  createCollection: (name: string, species?: Species) => SpeciesCollection;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  toggleSpecies: (collectionId: string, species: Species) => void;
}
