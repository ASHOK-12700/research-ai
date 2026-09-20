import { buildApiUrl } from './apiClient';
import { getSupabaseAuthToken } from './authToken';

export interface Evidence {
  paper_id: string;
  paper_title: string;
  page_number?: number | null;
  section?: string | null;
  snippet: string;
  relevance_score?: number;
}

export interface RAGAnswer {
  answer: string;
  evidence: Evidence[];
  query: string;
  reasoning_depth: string;
}

export interface RAGRequestParams {
  query: string;
  folder_id?: string | null;
  temperature?: number;
  reasoning_depth?: string;
}

export const ragService = {
  async queryPapers(params: RAGRequestParams): Promise<RAGAnswer> {
    const url = buildApiUrl('/api/chat/message');
    const token = await getSupabaseAuthToken();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      },
      body: JSON.stringify({
        query: params.query,
        folder_id: params.folder_id,
        temperature: params.temperature ?? 0.2,
        reasoning_depth: params.reasoning_depth ?? 'Standard Analysis',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '' }));
      const detail = typeof error.detail === 'string' ? error.detail : '';
      throw new Error(
        response.status === 404 || response.status >= 500
          ? 'Ask Papers service is unavailable. Please try again.'
          : detail || 'Ask Papers request failed. Please try again.'
      );
    }

    return response.json();
  },
};
