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
  const isLanding = pathname === '/' || pathname === '';
  const isCatalog = pathname === '/catalog' || pathname === '/catalog/';

  useEffect(() => {
    if (!isErrorPage && !isLanding && !isCatalog && externalId === null) {
      redirectToError('not-found');
    }
  }, [isErrorPage, isLanding, isCatalog, externalId]);

  if (isErrorPage) return { page: 'error' };
  if (externalId !== null) return { page: 'species', externalId };
  if (isLanding) return { page: 'landing' };
  if (isCatalog) return { page: 'catalog' };
  return { page: 'not-found' };
}
