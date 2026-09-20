import { supabase } from './supabaseClient';
import type { Paper } from '../types';
import { buildApiUrl } from './apiClient';

type BackendPaperSection = {
  id?: string | null;
  title: string;
  content: string;
  page_start: number;
  page_end: number;
};

type BackendPaperMetadata = {
  title?: string | null;
  authors?: string[];
  subject?: string | null;
  keywords?: string[];
  creation_date?: string | null;
};

type BackendPaper = {
  id: string;
  filename: string;
  title: string;
  pages: number;
  metadata: BackendPaperMetadata;
  sections: BackendPaperSection[];
  uploaded_at: string;
  project_id?: string | null;
  file_size_bytes?: number | null;
  status: 'processed';
};

const backendHeaders = {
  Accept: 'application/json'
};

function mapBackendPaperToFrontendPaper(paper: BackendPaper): Paper {
  const authors = paper.metadata.authors && paper.metadata.authors.length > 0
    ? paper.metadata.authors
    : ['Unknown Author'];

  const tags = [
    ...(paper.metadata.keywords || []),
    ...(paper.project_id ? ['Uploaded'] : ['PDF Extracted'])
  ];

  const abstractSection = paper.sections.find((section) => /^abstract$/i.test(section.title));

  return {
    id: paper.id,
    title: paper.title,
    authors,
    year: 0,
    journal: paper.metadata.subject || '',
    projectId: paper.project_id ?? undefined,
    projectTitle: paper.project_id ? 'Research Project' : undefined,
    tags: tags.length > 0 ? tags : ['Uploaded', 'PDF Analysis'],
    summaryStatus: 'pending',
    similarityScore: 0,
    similarityReason: 'Uploaded and extracted locally by the backend.',
    abstract: abstractSection?.content || '',
    fileSize: paper.file_size_bytes ? `${(paper.file_size_bytes / (1024 * 1024)).toFixed(2)} MB` : undefined,
    uploadDate: paper.uploaded_at.split('T')[0],
    citationsCount: 0,
    sections: paper.sections.map((section, index) => ({
      id: section.id || `${paper.id}-sec-${index + 1}`,
      title: section.title,
      content: section.content,
      pageNumber: section.page_start,
      pageEnd: section.page_end
    })),
    extractedSummary: {
      abstract_overview: abstractSection?.content,
      research_problem: paper.sections.find((section) => /problem|introduction|motivation/i.test(section.title))?.content,
      objectives: paper.sections.find((section) => /objective|goal|aim/i.test(section.title))?.content,
      methodology: paper.sections.find((section) => /method|approach|experiment|material/i.test(section.title))?.content,
      dataset_data_used: paper.sections.find((section) => /dataset|data|corpus|benchmark/i.test(section.title))?.content,
      proposed_approach_model: paper.sections.find((section) => /model|algorithm|architecture|approach/i.test(section.title))?.content,
      key_results: paper.sections.find((section) => /result|finding|evaluation/i.test(section.title))?.content,
      limitations: paper.sections.find((section) => /limitation|threat/i.test(section.title))?.content,
      future_work: paper.sections.find((section) => /future|conclusion|discussion/i.test(section.title))?.content
    }
  };
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!supabase) {
    return {};
  }

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
    ...backendHeaders,
  };
}

async function fetchBackendPapers(projectId?: string): Promise<Paper[]> {
  const url = projectId ? buildApiUrl(`/api/papers?project_id=${encodeURIComponent(projectId)}`) : buildApiUrl('/api/papers');
  const response = await fetch(url, { headers: await getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Failed to fetch papers: ${response.status}`);
  }

  const data = (await response.json()) as BackendPaper[];
  return data.map(mapBackendPaperToFrontendPaper);
}

type StructuredSummaryResponse = {
  paper_title: string;
  authors: string[];
  abstract_overview: string;
  research_problem: string;
  objectives: string;
  methodology: string;
  dataset_data_used: string;
  proposed_approach_model: string;
  key_results: string;
  evaluation_metrics: string;
  main_contributions: string;
  limitations: string;
  future_work: string;
  key_takeaways: string;
};

export const paperService = {
  async getPapers(projectId?: string): Promise<Paper[]> {
    try {
      return await fetchBackendPapers(projectId);
    } catch {
      return [];
    }
  },

  async getPaperById(id: string): Promise<Paper | null> {
    try {
      const response = await fetch(buildApiUrl(`/api/papers/${encodeURIComponent(id)}`), { headers: await getAuthHeaders() });
      if (response.ok) {
        const paper = (await response.json()) as BackendPaper;
        return mapBackendPaperToFrontendPaper(paper);
      }

      if (response.status === 404) {
        return null;
      }

      throw new Error(`Paper lookup failed with status ${response.status}`);
    } catch {
      return null;
    }
  },

  async uploadPaper(
    file: File,
    projectId?: string,
    onProgress?: (progress: number) => void
  ): Promise<Paper> {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) {
      formData.append('project_id', projectId);
    }

    const response = await fetch(buildApiUrl('/api/papers/upload'), {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Upload failed with status ${response.status}`);
    }

    for (const progress of [20, 45, 70, 90, 100]) {
      if (onProgress) onProgress(progress);
      if (progress < 100) {
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
    }

    const backendPaper = (await response.json()) as BackendPaper;
    return mapBackendPaperToFrontendPaper(backendPaper);
  },

  async getRelatedPapers(paperId: string): Promise<{ paper: Paper; similarity: number; reason: string }[]> {
    try {
      const allPapers = await fetchBackendPapers();
      const target = allPapers.find((paper) => paper.id === paperId);
      if (!target) return [];

      return allPapers
        .filter((paper) => paper.id !== paperId)
        .map((paper) => ({
          paper,
          similarity: paper.similarityScore,
          reason: paper.similarityReason || 'Similarity is not available until paper analysis is generated.'
        }))
        .slice(0, 3);
    } catch {
      return [];
    }
  },

  async generatePaperSummary(paperId: string): Promise<StructuredSummaryResponse> {
    const response = await fetch(buildApiUrl(`/api/papers/${encodeURIComponent(paperId)}/summarize`), {
      method: 'POST',
      headers: {
        ...(await getAuthHeaders()),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let detail = 'Summary generation failed.';
      const responseText = await response.text();

      try {
        const parsed = JSON.parse(responseText) as { detail?: unknown };
        if (typeof parsed.detail === 'string' && parsed.detail.trim()) {
          detail = parsed.detail;
        }
      } catch {
        if (responseText.trim()) {
          detail = responseText;
        }
      }

      throw new Error(detail);
    }

    return (await response.json()) as StructuredSummaryResponse;
  }
};
