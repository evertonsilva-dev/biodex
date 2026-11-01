export type AppErrorType = 'not-found' | 'catalog' | 'species';

export function redirectToError(type: AppErrorType) {
  if (window.location.pathname === '/error') {
    return;
  }
  const returnTo = `${window.location.pathname}${window.location.search}`;
  const params = new URLSearchParams({ type, returnTo });
  window.location.replace(`/error?${params}`);
}
