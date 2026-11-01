export type AppRoute =
  | { page: 'catalog' }
  | { page: 'error' }
  | { page: 'species'; externalId: string }
  | { page: 'not-found' };
