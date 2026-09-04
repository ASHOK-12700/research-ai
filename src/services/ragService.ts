import { buildApiUrl } from './apiClient';

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
  temperature?: number;
  reasoning_depth?: string;
}

export const ragService = {
  async queryPapers(params: RAGRequestParams): Promise<RAGAnswer> {
    const url = buildApiUrl('/ask/query');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || ''}`,
      },
      body: JSON.stringify({
        query: params.query,
        temperature: params.temperature ?? 0.2,
        reasoning_depth: params.reasoning_depth ?? 'Standard Analysis',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to query papers' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },
};
