export type AppRoute =
  | { page: 'landing' }
  | { page: 'catalog' }
  | { page: 'compare' }
  | { page: 'error' }
  | { page: 'login' }
  | { page: 'profile' }
  | { page: 'contributions' }
  | { page: 'collections'; collectionId: string | null }
  | { page: 'editorial-collection'; slug: string }
  | { page: 'species'; externalId: string }
  | { page: 'not-found' };
