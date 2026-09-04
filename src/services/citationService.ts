import type { Citation, CitationStyle } from '../types';
import { mockCitations } from '../data/mockCitations';
import { formatCitation } from '../utils/citationFormatter';

export const citationService = {
  async getCitations(): Promise<Citation[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...mockCitations];
  },

  async formatCitationText(citation: Citation, style: CitationStyle): Promise<string> {
    return formatCitation(citation, style);
  },

  async exportAllBibtex(): Promise<string> {
    return mockCitations.map((c) => c.bibtex).join('\n\n');
  }
};
