import type { Citation, CitationStyle } from '../types';
import { formatCitation } from '../utils/citationFormatter';
import { paperService } from './paperService';

function paperToCitation(paper: Awaited<ReturnType<typeof paperService.getPapers>>[number]): Citation {
  const authorKey = paper.authors.join(' and ').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_').toLowerCase();
  return {
    id: `citation-${paper.id}`,
    paperId: paper.id,
    paperTitle: paper.title,
    authors: paper.authors,
    year: paper.year,
    journal: paper.journal,
    bibtex: `@article{${authorKey || 'paper'}${paper.year},\n  title = {${paper.title}},\n  author = {${paper.authors.join(' and ')}},\n  year = {${paper.year}},\n  journal = {${paper.journal}}\n}`
  };
}

export const citationService = {
  async getCitations(): Promise<Citation[]> {
    const papers = await paperService.getPapers();
    return papers.map(paperToCitation);
  },

  async formatCitationText(citation: Citation, style: CitationStyle): Promise<string> {
    return formatCitation(citation, style);
  },

  async exportAllBibtex(): Promise<string> {
    const citations = await this.getCitations();
    return citations.map((citation) => citation.bibtex).join('\n\n');
  }
};
