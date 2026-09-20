import type { ResearchGap } from '../types';
import { paperService } from './paperService';

export const researchGapService = {
  async getGaps(): Promise<ResearchGap[]> {
    const papers = await paperService.getPapers();
    const gaps: ResearchGap[] = [];
    papers.forEach((paper) => {
      const limitations = paper.sections?.filter((section) => /limitation|future work|discussion/i.test(section.title)) || [];
      limitations.forEach((section, index) => {
        const description = section.content.trim();
        if (!description) return;
        gaps.push({
          id: `${paper.id}-gap-${index}`,
          title: `${section.title} in ${paper.title}`,
          category: /future work/i.test(section.title) ? 'direction' : 'limitation',
          paperCount: 1,
          description,
          supportingPapers: [{ paperId: paper.id, paperTitle: paper.title, page: section.pageNumber, snippet: description.slice(0, 300) }],
          isAiSuggested: false,
        });
      });
    });
    return gaps;
  },

  async getGapsByCategory(category: 'limitation' | 'underexplored' | 'direction'): Promise<ResearchGap[]> {
    const gaps = await this.getGaps();
    return gaps.filter((gap) => gap.category === category);
  }
};
