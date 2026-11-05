import { apiGet } from './client';
import type { EditorialCollection } from '../collections/types';

interface EditorialCollectionsResponse {
  data: EditorialCollection[];
}

interface EditorialCollectionResponse {
  data: EditorialCollection;
}

export async function getEditorialCollections(signal?: AbortSignal) {
  const response = await apiGet<EditorialCollectionsResponse>('/editorial-collections', signal);
  return response.data;
}

export async function getEditorialCollection(slug: string, signal?: AbortSignal) {
  const response = await apiGet<EditorialCollectionResponse>(
    `/editorial-collections/${encodeURIComponent(slug)}`,
    signal,
  );
  return response.data;
}
