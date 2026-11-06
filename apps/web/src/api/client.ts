const apiBaseUrl = (
  import.meta.env.MODE === 'cloudflare'
    ? '/api'
    : import.meta.env.VITE_API_URL ?? (
      import.meta.env.DEV
        ? 'http://localhost:1337/api'
        : '/api'
    )
).replace(/\/$/, '');
export const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin;

interface ApiErrorResponse {
  error?: {
    message?: unknown;
  };
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  accessToken?: string;
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' });
  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  if (!response.ok) {
    const result = await response.json() as ApiErrorResponse;
    const message = result.error?.message;
    throw new Error(
      typeof message === 'string'
        ? message
        : `A API respondeu com status ${response.status}.`,
    );
  }

  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>(path, { signal });
}
