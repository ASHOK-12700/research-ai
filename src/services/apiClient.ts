const DEFAULT_API_BASE_URL =
  typeof window !== 'undefined' ? window.location.origin : '';

export const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || DEFAULT_API_BASE_URL
).replace(/\/$/, '');

export function buildApiUrl(path: string): string {
  const normalizedPath = `/${path.replace(/^\/+/, '')}`;
  const baseHasApiPrefix = /\/api$/i.test(API_BASE_URL);
  const pathHasApiPrefix = /^\/api(?:\/|$)/i.test(normalizedPath);
  const apiPath = pathHasApiPrefix ? normalizedPath : `/api${normalizedPath}`;
  const relativePath = baseHasApiPrefix ? apiPath.replace(/^\/api/i, '') || '/' : apiPath;
  return `${API_BASE_URL}${relativePath}`;
}
