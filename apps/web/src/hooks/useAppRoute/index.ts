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
  const isLogin = pathname === '/login' || pathname === '/login/';
  const isProfile = pathname === '/profile' || pathname === '/profile/';
  const isLanding = pathname === '/' || pathname === '';
  const isCatalog = pathname === '/catalog' || pathname === '/catalog/';
  const editorialCollectionMatch = pathname.match(/^\/collections\/editorial\/([^/]+)\/?$/);
  let editorialCollectionSlug: string | null = null;
  if (editorialCollectionMatch?.[1]) {
    try {
      editorialCollectionSlug = decodeURIComponent(editorialCollectionMatch[1]);
    } catch {
      editorialCollectionSlug = null;
    }
  }
  const isEditorialCollection = editorialCollectionSlug !== null;
  const collectionMatch = pathname.match(/^\/collections(?:\/([^/]+))?\/?$/);
  let collectionId: string | null = null;
  if (collectionMatch?.[1]) {
    try {
      collectionId = decodeURIComponent(collectionMatch[1]);
    } catch {
      collectionId = null;
    }
  }
  const isCollections = collectionMatch !== null && (!collectionMatch[1] || collectionId !== null);

  useEffect(() => {
    if (
      !isErrorPage
      && !isLogin
      && !isProfile
      && !isLanding
      && !isCatalog
      && !isCollections
      && !isEditorialCollection
      && externalId === null
    ) {
      redirectToError('not-found');
    }
  }, [isErrorPage, isLogin, isProfile, isLanding, isCatalog, isCollections, isEditorialCollection, externalId]);

  if (isErrorPage) return { page: 'error' };
  if (isLogin) return { page: 'login' };
  if (isProfile) return { page: 'profile' };
  if (externalId !== null) return { page: 'species', externalId };
  if (editorialCollectionSlug !== null) {
    return { page: 'editorial-collection', slug: editorialCollectionSlug };
  }
  if (isLanding) return { page: 'landing' };
  if (isCatalog) return { page: 'catalog' };
  if (isCollections) return { page: 'collections', collectionId };
  return { page: 'not-found' };
}
