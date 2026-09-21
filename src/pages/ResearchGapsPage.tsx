import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { researchGapService } from '../services/researchGapService';
import type { ResearchGap, SourceReference } from '../types';

export const ResearchGapsPage: React.FC = () => {
  const { onOpenEvidence } = useOutletContext<{
    onOpenEvidence: (source: SourceReference) => void;
  }>();

  const [gaps, setGaps] = useState<ResearchGap[]>([]);

  useEffect(() => {
    researchGapService.getGaps().then((data) => {
      setGaps(data);
    });
  }, []);

  const groupedGaps = gaps.reduce<Record<string, ResearchGap[]>>((groups, gap) => {
    const paperTitle = gap.supportingPapers[0]?.paperTitle || 'Paper';
    (groups[paperTitle] ||= []).push(gap);
    return groups;
  }, {});

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/20 via-[#141724] to-[#121520] p-6 sm:p-8 rounded-2xl border border-amber-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="amber" className="font-mono">Visual Analysis Dashboard</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-heading flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-amber-400" />
            Research Gap Explorer
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Review evidence-backed gaps for each uploaded paper. Gaps are never merged across papers.
          </p>
        </div>
      </div>

      {Object.keys(groupedGaps).length === 0 ? (
        <Card className="py-16 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-[var(--text-muted)]" />
          <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">No paper-specific gaps available</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">ResearchAI needs limitations, unresolved problems, evaluation gaps, or future-work evidence in an uploaded paper.</p>
        </Card>
      ) : Object.entries(groupedGaps).map(([paperTitle, paperGaps]) => (
      <div key={paperTitle} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100 font-heading flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            {paperTitle}
          </h2>
          <span className="text-xs text-zinc-500 font-mono">{paperGaps.length} evidence-backed gap{paperGaps.length === 1 ? '' : 's'}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paperGaps.map((gap) => (
            <Card key={gap.id} hoverEffect className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded">
                    {gap.category === 'direction' ? 'Future direction' : 'Limitation'}
                  </span>
                  <span className="text-xs font-mono text-indigo-400 font-bold">
                    {gap.category === 'direction' ? 'Future direction' : 'Paper-specific gap'}
                  </span>
                </div>
                <h3 className="font-bold text-base text-zinc-100 leading-snug">{gap.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{gap.description}</p>
              </div>

              {/* Supporting Evidence Card */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase font-semibold block">
                  Evidence source{gap.sourceSection ? `: ${gap.sourceSection}` : ''}
                </span>
                {gap.supportingPapers.map((sp, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      onOpenEvidence({
                        paperId: sp.paperId,
                        paperTitle: sp.paperTitle,
                        page: sp.page,
                        section: 'Limitations',
                        snippet: sp.snippet
                      })
                    }
                    className="p-2 rounded bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 cursor-pointer text-xs text-zinc-300 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate max-w-[200px] text-[11px]">{sp.paperTitle}</span>
                    <span className="text-[10px] text-indigo-400 font-mono shrink-0 group-hover:underline">
                      p.{sp.page} &rarr;
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
      ))}
    </div>
  );
};
