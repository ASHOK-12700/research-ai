const DEFAULT_API_BASE_URL =
  typeof window !== 'undefined' ? window.location.origin : '';

export const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || DEFAULT_API_BASE_URL
).replace(/\/$/, '');

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
