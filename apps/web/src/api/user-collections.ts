import { apiRequest } from './client';

export interface UserCollectionRecord {
  id: string;
  name: string;
  speciesIds: string[];
}

interface ApiResponse<T> {
  data: T;
}

function collectionPath(id: string) {
  return `/collections/${encodeURIComponent(id)}`;
}

export async function getUserCollections(
  accessToken: string,
  signal?: AbortSignal,
) {
  const response = await apiRequest<ApiResponse<UserCollectionRecord[]>>(
    '/collections',
    { accessToken, signal },
  );
  return response.data;
}

export async function createUserCollection(
  accessToken: string,
  name: string,
  speciesIds: string[],
) {
  const response = await apiRequest<ApiResponse<UserCollectionRecord>>(
    '/collections',
    { method: 'POST', accessToken, body: { name, speciesIds } },
  );
  return response.data;
}

export async function importUserCollections(
  accessToken: string,
  collections: UserCollectionRecord[],
) {
  await apiRequest<ApiResponse<{ imported: boolean }>>(
    '/collections/import',
    { method: 'POST', accessToken, body: { collections } },
  );
}

export async function updateUserCollection(
  accessToken: string,
  collection: UserCollectionRecord,
) {
  const response = await apiRequest<ApiResponse<UserCollectionRecord>>(
    collectionPath(collection.id),
    {
      method: 'PUT',
      accessToken,
      body: { name: collection.name, speciesIds: collection.speciesIds },
    },
  );
  return response.data;
}

export async function deleteUserCollection(
  accessToken: string,
  id: string,
) {
  await apiRequest<ApiResponse<{ deleted: boolean }>>(
    collectionPath(id),
    { method: 'DELETE', accessToken },
  );
}
