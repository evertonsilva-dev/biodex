export type AppRoute =
  | { page: 'landing' }
  | { page: 'catalog' }
  | { page: 'error' }
  | { page: 'collections'; collectionId: string | null }
  | { page: 'species'; externalId: string }
  | { page: 'not-found' };
