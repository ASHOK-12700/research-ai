import type { ResearchGap } from '../types';
import { paperService } from './paperService';

export const researchGapService = {
  async getGaps(): Promise<ResearchGap[]> {
    const papers = await paperService.getPapers();
    return papers.flatMap((paper): ResearchGap[] => {
      const paperGaps = paper.analysis?.researchGaps || [];
      if (paperGaps.length === 0) {
        return [{
          id: `${paper.id}-insufficient-evidence`,
          title: `Insufficient evidence in ${paper.title}`,
          category: 'underexplored' as const,
          paperCount: 1,
          description: 'Insufficient evidence in this paper to identify a research gap.',
          supportingPapers: [{
            paperId: paper.id,
            paperTitle: paper.title,
            page: 0,
            snippet: 'Insufficient evidence in this paper to identify a research gap.'
          }],
          sourceSection: undefined,
          isAiSuggested: false
        }];
      }

      return paperGaps.map((gap) => ({
        id: gap.id,
        title: `${gap.title} in ${paper.title}`,
        category: gap.category === 'direction' ? 'direction' as const : 'limitation' as const,
        paperCount: 1,
        description: gap.description,
        supportingPapers: [{
          paperId: paper.id,
          paperTitle: paper.title,
          page: gap.page || 0,
          snippet: gap.description.slice(0, 300)
        }],
        sourceSection: gap.sourceSection || undefined,
        isAiSuggested: false
      }));
    });
  },

  async getGapsByCategory(category: 'limitation' | 'underexplored' | 'direction'): Promise<ResearchGap[]> {
    const gaps = await this.getGaps();
    return gaps.filter((gap) => gap.category === category);
  }
};
