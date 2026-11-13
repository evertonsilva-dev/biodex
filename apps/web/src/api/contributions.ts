import { apiRequest } from './client';
import type { EditorialTrailStep } from '../collections/types';
import type { SpeciesImagePhoto } from './species-image';

export type AccountRole = 'user' | 'curator' | 'admin' | 'root';
export type AssignableAccountRole = Exclude<AccountRole, 'root'>;
export type PhotoSuggestionStatus = 'pending' | 'approved' | 'rejected';
export type ProfessionalRegistrationStatus =
  | 'not_submitted'
  | 'pending'
  | 'active'
  | 'rejected';

export interface ContributionAccount {
  userId: string;
  role: AccountRole;
}

export interface ManagedUser {
  id: string;
  name: string | null;
  email: string | null;
  role: AccountRole;
  createdAt: string | null;
  lastSeenAt: string | null;
  profession: string | null;
  professionalCouncil: string | null;
  professionalRegistrationNumber: string | null;
  professionalRegistrationStatus: ProfessionalRegistrationStatus;
  registrationVerifiedAt: string | null;
}

export interface ManagedEditorialContent {
  id: string;
  slug: string;
  title: string;
  description: string;
  introduction: string;
  featuredImageUrl: string | null;
  speciesIds: string[];
  steps: EditorialTrailStep[];
  order: number;
  ownerId: string | null;
}

export interface EditorialContentInput {
  title: string;
  description: string;
  introduction: string;
  featuredImageUrl: string | null;
  speciesIds: string[];
  steps: EditorialTrailStep[];
}

export interface PhotoSuggestion {
  id: string;
  speciesId: string;
  scientificName: string | null;
  photo: SpeciesImagePhoto;
  status: PhotoSuggestionStatus;
  submittedBy: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  data: T;
}

async function getData<T>(path: string, accessToken: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<T>>(path, { accessToken, signal });
  return response.data;
}

async function sendData<T>(
  path: string,
  accessToken: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown,
) {
  const response = await apiRequest<ApiResponse<T>>(path, {
    accessToken,
    method,
    body,
  });
  return response.data;
}

export function getContributionAccount(accessToken: string, signal?: AbortSignal) {
  return getData<ContributionAccount>('/contributions/me', accessToken, signal);
}

export function getManagedUsers(accessToken: string, signal?: AbortSignal) {
  return getData<ManagedUser[]>('/contributions/users', accessToken, signal);
}

export function assignUserRole(
  accessToken: string,
  userId: string,
  role: AssignableAccountRole,
) {
  return sendData<{ userId: string; role: AssignableAccountRole }>(
    `/contributions/users/${encodeURIComponent(userId)}/role`,
    accessToken,
    'PUT',
    { role },
  );
}

export function reviewProfessionalRegistration(
  accessToken: string,
  userId: string,
  status: Extract<ProfessionalRegistrationStatus, 'active' | 'rejected'>,
) {
  return sendData<{ userId: string; status: typeof status }>(
    `/contributions/users/${encodeURIComponent(userId)}/professional-registration`,
    accessToken,
    'PUT',
    { status },
  );
}

export function getManagedEditorialContent(accessToken: string, signal?: AbortSignal) {
  return getData<ManagedEditorialContent[]>(
    '/contributions/editorial-content',
    accessToken,
    signal,
  );
}

export function createEditorialContent(
  accessToken: string,
  input: EditorialContentInput,
) {
  return sendData<ManagedEditorialContent>(
    '/contributions/editorial-content',
    accessToken,
    'POST',
    input,
  );
}

export function updateEditorialContent(
  accessToken: string,
  id: string,
  input: EditorialContentInput,
) {
  return sendData<ManagedEditorialContent>(
    `/contributions/editorial-content/${encodeURIComponent(id)}`,
    accessToken,
    'PUT',
    input,
  );
}

export function deleteEditorialContent(accessToken: string, id: string) {
  return sendData<{ deleted: boolean }>(
    `/contributions/editorial-content/${encodeURIComponent(id)}`,
    accessToken,
    'DELETE',
  );
}

export function getMyPhotoSuggestions(accessToken: string, signal?: AbortSignal) {
  return getData<PhotoSuggestion[]>('/contributions/photo-suggestions', accessToken, signal);
}

export function getMyPhotoSuggestionForSpecies(
  accessToken: string,
  speciesId: string,
  signal?: AbortSignal,
) {
  return getData<PhotoSuggestion | null>(
    `/contributions/photo-suggestions/species/${encodeURIComponent(speciesId)}`,
    accessToken,
    signal,
  );
}

export function getPendingPhotoSuggestions(accessToken: string, signal?: AbortSignal) {
  return getData<PhotoSuggestion[]>(
    '/contributions/photo-suggestions/pending',
    accessToken,
    signal,
  );
}

export function submitPhotoSuggestion(
  accessToken: string,
  speciesId: string,
  photoUrl: string,
) {
  return sendData<PhotoSuggestion>(
    '/contributions/photo-suggestions',
    accessToken,
    'POST',
    { speciesId, photoUrl },
  );
}

export function reviewPhotoSuggestion(
  accessToken: string,
  id: string,
  decision: Exclude<PhotoSuggestionStatus, 'pending'>,
) {
  return sendData<PhotoSuggestion>(
    `/contributions/photo-suggestions/${encodeURIComponent(id)}/review`,
    accessToken,
    'POST',
    { decision },
  );
}
