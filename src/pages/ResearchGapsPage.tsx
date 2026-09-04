import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Lightbulb,
  AlertCircle,
  Compass,
  Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
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

  const limitations = gaps.filter((g) => g.category === 'limitation');
  const underexplored = gaps.filter((g) => g.category === 'underexplored');
  const directions = gaps.filter((g) => g.category === 'direction');

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
            Identify recurring literature limitations, unexplored research areas, and promising directions for future publication.
          </p>
        </div>
      </div>

      {/* Section 1: Recurring Limitations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100 font-heading flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            1. Recurring Limitations Across Literature
          </h2>
          <span className="text-xs text-zinc-500 font-mono">Synthesized from {limitations.length} categories</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {limitations.map((gap) => (
            <Card key={gap.id} hoverEffect className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded">
                    Limitation
                  </span>
                  <span className="text-xs font-mono text-indigo-400 font-bold">
                    {gap.paperCount} Papers
                  </span>
                </div>
                <h3 className="font-bold text-base text-zinc-100 leading-snug">{gap.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{gap.description}</p>
              </div>

              {/* Supporting Evidence Card */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase font-semibold block">
                  Supporting Paper References:
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

      {/* Section 2: Underexplored Areas */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100 font-heading flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            2. Underexplored Research Areas
          </h2>
        </div>

        <div className="space-y-4">
          {underexplored.map((gap) => (
            <Card key={gap.id} glow hoverEffect className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="sky">Underexplored Domain</Badge>
                {gap.isAiSuggested && (
                  <span className="text-xs text-indigo-400 font-mono flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Discovered Gap
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-zinc-100">{gap.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{gap.description}</p>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono">
                  Supported by {gap.supportingPapers.length} key paper snippets
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onOpenEvidence({
                      paperId: gap.supportingPapers[0].paperId,
                      paperTitle: gap.supportingPapers[0].paperTitle,
                      page: gap.supportingPapers[0].page,
                      section: 'Underexplored',
                      snippet: gap.supportingPapers[0].snippet
                    })
                  }
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  View Evidence Snippet &rarr;
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 3: Potential Research Directions */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100 font-heading flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            3. Potential Research Directions
          </h2>
          <span className="text-xs text-zinc-500 font-mono">Suggested Future Work</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {directions.map((gap) => (
            <Card key={gap.id} hoverEffect className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="emerald">Potential Direction</Badge>
                <span className="text-[10px] text-zinc-500 font-mono">Based on uploaded literature</span>
              </div>
              <h3 className="font-bold text-base text-zinc-100">{gap.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{gap.description}</p>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                <span className="font-semibold">AI-generated potential direction</span>
                <button
                  onClick={() =>
                    onOpenEvidence({
                      paperId: gap.supportingPapers[0].paperId,
                      paperTitle: gap.supportingPapers[0].paperTitle,
                      page: gap.supportingPapers[0].page,
                      section: 'Future Work',
                      snippet: gap.supportingPapers[0].snippet
                    })
                  }
                  className="underline hover:text-white cursor-pointer font-mono text-[11px]"
                >
                  Inspect Basis &rarr;
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
