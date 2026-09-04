import type { Citation, CitationStyle } from '../types';

export function formatCitation(citation: Citation, style: CitationStyle): string {
  const authorStr = citation.authors.join(', ');
  
  switch (style) {
    case 'APA':
      return `${authorStr} (${citation.year}). ${citation.paperTitle}. ${citation.journal}${citation.volume ? `, ${citation.volume}` : ''}${citation.pages ? `, ${citation.pages}` : ''}. https://doi.org/${citation.doi || ''}`;
    
    case 'IEEE':
      return `${authorStr}, "${citation.paperTitle}," ${citation.journal}${citation.volume ? `, vol. ${citation.volume}` : ''}${citation.pages ? `, pp. ${citation.pages}` : ''}, ${citation.year}.`;
    
    case 'MLA':
      return `${authorStr}. "${citation.paperTitle}." ${citation.journal}, vol. ${citation.volume || '1'}, ${citation.year}, pp. ${citation.pages || '1-10'}.`;
    
    case 'Chicago':
      return `${authorStr}. "${citation.paperTitle}." ${citation.journal} ${citation.volume || ''} (${citation.year}): ${citation.pages || ''}.`;
    
    case 'BibTeX':
      return citation.bibtex;
    
    default:
      return `${authorStr} (${citation.year}). ${citation.paperTitle}.`;
  }
}
