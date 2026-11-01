import { useEffect } from 'react';
import { redirectToError } from '../../utils/errors';
import type { AppRoute } from './types';

export function useAppRoute(): AppRoute {
  const pathname = window.location.pathname;
  const match = pathname.match(/^\/species\/([^/]+)\/?$/);
  let externalId: string | null = null;
  if (match) {
    try {
      externalId = decodeURIComponent(match[1]);
    } catch {
      externalId = null;
    }
  }
  const isErrorPage = pathname === '/error';
  const isCatalog = pathname === '/' || pathname === '';

  useEffect(() => {
    if (!isErrorPage && !isCatalog && externalId === null) {
      redirectToError('not-found');
    }
  }, [isErrorPage, isCatalog, externalId]);

  if (isErrorPage) return { page: 'error' };
  if (externalId !== null) return { page: 'species', externalId };
  if (isCatalog) return { page: 'catalog' };
  return { page: 'not-found' };
}
