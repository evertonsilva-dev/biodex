import type { Species } from '../types/species';

export interface SpeciesCollection {
  id: string;
  name: string;
  species: Species[];
}

export interface CollectionsContextValue {
  collections: SpeciesCollection[];
  createCollection: (name: string, species?: Species) => SpeciesCollection;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  toggleSpecies: (collectionId: string, species: Species) => void;
}
