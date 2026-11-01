export type ErrorType = 'not-found' | 'catalog' | 'species' | 'unexpected';

export interface ErrorPageProps {
  type?: ErrorType;
}
