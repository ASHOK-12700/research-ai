import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GitCompare,
  Check,
  Plus,
  Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { paperService } from '../services/paperService';
import type { Paper, SourceReference } from '../types';

export const ComparePage: React.FC = () => {
  const { onOpenEvidence } = useOutletContext<{
    onOpenEvidence: (source: SourceReference) => void;
  }>();

  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paperService.getPapers().then((data) => {
      setAllPapers(data);
      if (data.length >= 2) {
        setSelectedIds([data[0].id, data[1].id, data[2]?.id].filter(Boolean) as string[]);
      }
      setLoading(false);
    });
  }, []);

  const selectedPapers = allPapers.filter((p) => selectedIds.includes(p.id));

  const togglePaper = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) return; // keep at least 1
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      if (selectedIds.length >= 4) alert('You can compare up to 4 papers simultaneously.');
      else setSelectedIds([...selectedIds, id]);
    }
  };

  const rows = [
    { label: 'Research Problem', key: 'problem' },
    { label: 'Proposed Methodology', key: 'methodology' },
    { label: 'Dataset & Samples', key: 'dataset' },
    { label: 'Algorithms / Architecture', key: 'algorithms' },
    { label: 'Best Reported Result', key: 'keyResults' },
    { label: 'Primary Limitations', key: 'limitations' },
    { label: 'Future Work', key: 'futureWork' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-7xl mx-auto pb-16"
    >
      {/* Premium Header */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-[#f0f2f7] font-heading flex items-center gap-4 tracking-tight">
          <div className="p-3 rounded-lg bg-amber-600/20 border border-amber-500/30">
            <GitCompare className="w-8 h-8 text-amber-400" />
          </div>
          Paper Comparison
        </h1>
        <p className="text-base text-[#b4b9c7] max-w-2xl">
          Compare methodologies, datasets, models, metrics, and limitations side-by-side.
        </p>
      </div>

      {/* Paper Selection Card */}
      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7d8599]">
            Select Papers ({selectedPapers.length} of 4)
          </span>
          <span className="text-xs font-mono text-indigo-400">Up to 4 papers</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allPapers.map((paper, idx) => {
            const isSelected = selectedIds.includes(paper.id);
            return (
              <motion.button
                key={paper.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                onClick={() => togglePaper(paper.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-[#0f131a] text-[#b4b9c7] border-white/10 hover:border-indigo-500/30'
                }`}
              >
                {isSelected ? <Check className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4" />}
                <span className="line-clamp-1">{paper.title.substring(0, 40)}</span>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* Comparison Matrix */}
      {loading ? (
        <Card className="h-96 bg-white/5 animate-pulse" />
      ) : selectedPapers.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <p className="text-[#7d8599]">Select at least 2 papers above to display the comparison matrix.</p>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#0f131a] border-b border-white/10">
                    <th className="p-5 w-56 text-xs font-bold uppercase tracking-wider text-[#7d8599] sticky left-0 bg-[#0f131a] z-10 border-r border-white/10">
                      Feature
                    </th>
                    {selectedPapers.map((paper) => (
                      <th key={paper.id} className="p-5 text-sm font-bold text-[#f0f2f7] min-w-[260px] border-r border-white/10">
                        <div className="space-y-2">
                          <span className="text-xs text-indigo-400 font-mono block">{paper.journal} ({paper.year})</span>
                          <div className="line-clamp-2 text-sm">{paper.title}</div>
                          <span className="text-xs text-[#7d8599] font-mono block">{paper.authors[0]}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rows.map((row) => (
                    <tr key={row.key} className="hover:bg-white/5 transition-colors">
                      <td className="p-5 font-bold text-[#f0f2f7] sticky left-0 bg-[#0a0e15] border-r border-white/10 text-sm">
                        {row.label}
                      </td>
                      {selectedPapers.map((paper) => {
                        const summary = paper.summary;
                        let content = summary ? (summary as any)[row.key] : 'N/A';
                        if (Array.isArray(content)) content = content.join(' • ');

                        return (
                          <td key={paper.id} className="p-5 text-sm text-[#b4b9c7] leading-relaxed border-r border-white/10 align-top hover:bg-white/5 transition-colors">
                            <p className="line-clamp-6">{content || 'Not specified'}</p>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Comparative Insights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#f0f2f7] font-heading">Comparative Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Highest Accuracy',
              desc: 'Swin-MedNet reports the highest segmentation accuracy (89.4% DSC) among selected papers.',
              paperId: 'paper-2',
              paperTitle: 'An Attention-Free Swin Transformer for Medical Image Segmentation',
              page: 6
            },
            {
              title: 'Smallest Parameters',
              desc: 'MobileNetV4 achieves ultra-low latency with only 3.8ms on NPU hardware.',
              paperId: 'paper-3',
              paperTitle: 'MobileNetV4: Ultra-Efficient Neural Networks for Edge Devices',
              page: 7
            },
            {
              title: 'Universal Limitation',
              desc: 'All papers cite limited multi-site clinical validation and small dataset sizes as bottlenecks.',
              paperId: 'paper-1',
              paperTitle: 'Deep Residual Learning for Image Recognition',
              page: 8
            }
          ].map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
            >
              <Card className="space-y-3 h-full hover:border-indigo-500/50 transition-colors">
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase">Insight #{idx + 1}</span>
                <h4 className="font-bold text-base text-[#f0f2f7]">{insight.title}</h4>
                <p className="text-sm text-[#b4b9c7] leading-relaxed">{insight.desc}</p>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-indigo-400 font-mono">
                  <span>p.{insight.page}</span>
                  <button
                    onClick={() =>
                      onOpenEvidence({
                        paperId: insight.paperId,
                        paperTitle: insight.paperTitle,
                        page: insight.page,
                        section: 'Results',
                        snippet: insight.desc
                      })
                    }
                    className="hover:text-indigo-300 transition-colors"
                  >
                    View →
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
