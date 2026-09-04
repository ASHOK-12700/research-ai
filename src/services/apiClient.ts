const DEFAULT_API_BASE_URL = 'http://localhost:8000';

export const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_API_BASE_URL
).replace(/\/$/, '');

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
