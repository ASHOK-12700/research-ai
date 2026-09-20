import { buildApiUrl } from './apiClient';
import { getAuthHeaders } from './authToken';
import type { ResearchFolder } from '../types';

type BackendFolder = {
  id: string;
  name: string;
  description: string;
  paper_ids: string[];
  paper_count: number;
  created_at: string;
  updated_at: string;
};

const mapFolder = (folder: BackendFolder): ResearchFolder => ({
  id: folder.id,
  name: folder.name,
  description: folder.description,
  paperIds: folder.paper_ids || [],
  paperCount: folder.paper_count || 0,
  createdAt: folder.created_at,
  updatedAt: folder.updated_at,
});

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: await getAuthHeaders({ 'Content-Type': 'application/json', ...(init.headers || {}) as Record<string, string> }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { detail?: string };
    throw new Error(body.detail || `Folder request failed with status ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const folderService = {
  async getFolders(): Promise<ResearchFolder[]> {
    const data = await request<{ folders: BackendFolder[]; total: number }>('/folders/');
    return data.folders.map(mapFolder);
  },
  async getFolder(id: string): Promise<ResearchFolder> {
    return mapFolder(await request<BackendFolder>(`/folders/${encodeURIComponent(id)}`));
  },
  async createFolder(data: { name: string; description: string; paperIds: string[] }): Promise<ResearchFolder> {
    return mapFolder(await request<BackendFolder>('/folders/', { method: 'POST', body: JSON.stringify({ name: data.name, description: data.description, paper_ids: data.paperIds }) }));
  },
  async addPapers(id: string, paperIds: string[]): Promise<ResearchFolder> {
    return mapFolder(await request<BackendFolder>(`/folders/${encodeURIComponent(id)}/papers`, { method: 'POST', body: JSON.stringify({ paper_ids: paperIds }) }));
  },
  async removePaper(id: string, paperId: string): Promise<ResearchFolder> {
    return mapFolder(await request<BackendFolder>(`/folders/${encodeURIComponent(id)}/papers/${encodeURIComponent(paperId)}`, { method: 'DELETE' }));
  },
};