import type { ErrorType } from '../../components/ErrorPage/types';

export interface ErrorPageState {
  errorType: ErrorType;
  returnTo: string;
}
