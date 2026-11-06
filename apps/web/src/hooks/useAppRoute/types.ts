export type AppRoute =
  | { page: 'landing' }
  | { page: 'catalog' }
  | { page: 'error' }
  | { page: 'login' }
  | { page: 'profile' }
  | { page: 'collections'; collectionId: string | null }
  | { page: 'editorial-collection'; slug: string }
  | { page: 'species'; externalId: string }
  | { page: 'not-found' };
