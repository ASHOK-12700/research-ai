import React from 'react';
import { Upload, Sparkles, GitCompare, Lightbulb, BookOpenCheck } from 'lucide-react';
import type { TimelineEvent } from '../../types';

export interface ActivityTimelineProps {
  events: TimelineEvent[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events }) => {
  const categoryIcons = {
    upload: <Upload className="w-3.5 h-3.5 text-sky-400" />,
    summary: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
    comparison: <GitCompare className="w-3.5 h-3.5 text-amber-400" />,
    gap: <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />,
    citation: <BookOpenCheck className="w-3.5 h-3.5 text-indigo-400" />
  };

  return (
    <div className="relative border-l border-white/10 ml-3 pl-5 space-y-4">
      {events.map((evt) => (
        <div key={evt.id} className="relative flex items-start gap-3 group">
          {/* Dot Icon */}
          <div className="absolute -left-[27px] top-0.5 p-1 rounded-full bg-[#121520] border border-white/20 group-hover:border-indigo-500 transition-colors">
            {categoryIcons[evt.category]}
          </div>

          <div className="flex-1 bg-zinc-900/60 dark:bg-zinc-900/60 p-3 rounded-xl border border-white/5 hover:border-white/15 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">{evt.title}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{evt.date}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-normal">{evt.description}</p>
            {evt.paperTitle && (
              <span className="inline-block mt-1.5 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                📄 {evt.paperTitle}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
