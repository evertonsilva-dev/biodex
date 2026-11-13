import { apiRequest } from './client';

export type ProfessionalRegistrationStatus =
  | 'not_submitted'
  | 'pending'
  | 'active'
  | 'rejected';

export interface UserProfile {
  birthDate: string | null;
  profession: string | null;
  cpfLastFour: string | null;
  professionalCouncil: string | null;
  professionalRegistrationNumber: string | null;
  professionalRegistrationStatus: ProfessionalRegistrationStatus;
  registrationVerifiedAt: string | null;
}

export interface UserProfileInput {
  cpf?: string;
  birthDate: string;
  profession: string;
  professionalCouncil: string;
  professionalRegistrationNumber: string;
}

interface ApiResponse<T> {
  data: T;
}

export async function getUserProfile(
  accessToken: string,
  signal?: AbortSignal,
): Promise<UserProfile> {
  const response = await apiRequest<ApiResponse<UserProfile>>('/contributions/profile', {
    accessToken,
    signal,
  });
  return response.data;
}

export async function updateUserProfile(
  accessToken: string,
  input: UserProfileInput,
): Promise<UserProfile> {
  const response = await apiRequest<ApiResponse<UserProfile>>('/contributions/profile', {
    accessToken,
    method: 'PUT',
    body: input,
  });
  return response.data;
}
