import React from 'react';
import { Sparkles, Calendar, Layers } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Paper } from '../../types';

export interface TimelineMilestone {
  year: number;
  title: string;
  methodology: string;
  description: string;
  keyPapers: string[];
}

export const ResearchTimeline: React.FC<{ papers: Paper[] }> = ({ papers }) => {
  const milestones = papers.map((paper) => ({ year: paper.year, title: paper.title, methodology: paper.sections?.find((section) => /method|approach|model/i.test(section.title))?.title || 'Extracted sections', description: paper.abstract, keyPapers: [paper.title] }));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Literature Evolution Timeline
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Visualizing how dominant methodologies and architectures evolved across your uploaded collection.
          </p>
        </div>
      </div>

      <div className="relative border-l-2 border-indigo-500/30 ml-4 pl-6 space-y-8">
        {milestones.map((m) => (
          <div key={m.year} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-[#0c0e16] group-hover:scale-125 transition-transform" />

            <Card className="hover:border-indigo-500/40">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {m.year}
                  </span>
                  <h4 className="text-base font-bold text-zinc-100">{m.title}</h4>
                </div>
                <span className="text-xs text-purple-400 font-mono font-medium">{m.methodology}</span>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-3">{m.description}</p>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Representative Literature:</span>
                <div className="flex flex-wrap gap-1">
                  {m.keyPapers.map((kp, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[11px]">
                      {kp}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        ))}
        {!milestones.length && <p className="text-sm text-zinc-400">Upload papers to build a timeline from your collection.</p>}
      </div>
    </div>
  );
};
