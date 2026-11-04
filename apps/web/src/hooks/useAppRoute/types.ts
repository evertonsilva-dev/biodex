export type AppRoute =
  | { page: 'landing' }
  | { page: 'catalog' }
  | { page: 'error' }
  | { page: 'species'; externalId: string }
  | { page: 'not-found' };
