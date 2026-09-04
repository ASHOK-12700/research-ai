import type { ResearchGap } from '../types';
import { mockResearchGaps } from '../data/mockGaps';

export const researchGapService = {
  async getGaps(): Promise<ResearchGap[]> {
    await new Promise((res) => setTimeout(res, 200));
    return [...mockResearchGaps];
  },

  async getGapsByCategory(category: 'limitation' | 'underexplored' | 'direction'): Promise<ResearchGap[]> {
    await new Promise((res) => setTimeout(res, 150));
    return mockResearchGaps.filter((g) => g.category === category);
  }
};
