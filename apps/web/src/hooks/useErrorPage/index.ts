import type { ErrorType } from '../../components/ErrorPage/types';
import type { ErrorPageState } from './types';

const errorTypes = new Set<ErrorType>(['not-found', 'catalog', 'species', 'unexpected']);

function getErrorType(value: string | null): ErrorType {
  return value && errorTypes.has(value as ErrorType) ? value as ErrorType : 'unexpected';
}

function getReturnTo(value: string | null): string {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export function useErrorPage(type?: ErrorType): ErrorPageState {
  const params = new URLSearchParams(window.location.search);
  return {
    errorType: type ?? getErrorType(params.get('type')),
    returnTo: getReturnTo(params.get('returnTo')),
  };
}
