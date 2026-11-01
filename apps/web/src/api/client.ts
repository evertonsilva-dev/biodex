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

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`A API respondeu com status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}
