const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:1337/api').replace(/\/$/, '');

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`A API respondeu com status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}
