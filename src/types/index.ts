export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  institution: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  topic: string;
  description: string;
  paperCount: number;
  gapCount: number;
  updatedAt: string;
  status: 'active' | 'archived' | 'draft';
  tags: string[];
  progress: number; // 0 to 100
}

export interface PaperSection {
  id: string;
  title: string;
  content: string;
  pageNumber: number;
}

export interface PaperSummary {
  id: string;
  paperId: string;
  problem: string;
  approach: string;
  methodology: string;
  dataset: string;
  algorithms: string[];
  keyResults: string[];
  limitations: string[];
  futureWork: string[];
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  projectId?: string;
  projectTitle?: string;
  tags: string[];
  summaryStatus: 'completed' | 'processing' | 'pending' | 'failed';
  similarityScore: number; // Percentage 0 - 100
  similarityReason?: string;
  abstract: string;
  fileSize?: string;
  uploadDate: string;
  citationsCount: number;
  sections?: PaperSection[];
  summary?: PaperSummary;
}

export interface SourceReference {
  paperId: string;
  paperTitle: string;
  page: number;
  section: string;
  snippet: string;
}

export interface Citation {
  id: string;
  paperId: string;
  paperTitle: string;
  authors: string[];
  year: number;
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  bibtex: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: SourceReference[];
}

export interface ResearchGap {
  id: string;
  title: string;
  category: 'limitation' | 'underexplored' | 'direction';
  paperCount: number;
  description: string;
  supportingPapers: {
    paperId: string;
    paperTitle: string;
    page: number;
    snippet: string;
  }[];
  isAiSuggested?: boolean;
}

export interface ResearchInsight {
  id: string;
  title: string;
  description: string;
  paperCount: number;
  generatedAt: string;
  category: 'methodology' | 'dataset' | 'trend' | 'limitation';
}

export interface TimelineEvent {
  id: string;
  date: string;
  year: number;
  title: string;
  description: string;
  category: 'upload' | 'summary' | 'comparison' | 'gap' | 'citation';
  paperId?: string;
  paperTitle?: string;
}

export interface ComparisonMatrixItem {
  feature: string;
  key: keyof PaperSummary | 'metrics' | 'bestResult';
  values: Record<string, string>; // paperId -> content string
}

export type CitationStyle = 'APA' | 'IEEE' | 'MLA' | 'Chicago' | 'BibTeX';
