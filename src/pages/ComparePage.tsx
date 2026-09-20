import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GitCompare,
  Check,
  Plus,
  Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { paperService } from '../services/paperService';
import type { Paper } from '../types';

const NOT_AVAILABLE = 'Not available in this paper';

function extractedSection(paper: Paper, pattern: RegExp): string | undefined {
  return paper.sections?.find((section) => pattern.test(section.title))?.content;
}

function comparisonValue(paper: Paper, key: string): string {
  const summary = paper.extractedSummary;
  const values: Record<string, string | undefined> = {
    research_problem: summary?.research_problem || extractedSection(paper, /problem|introduction|motivation/i),
    objectives: summary?.objectives || extractedSection(paper, /objective|goal|aim/i),
    abstract: summary?.abstract_overview || paper.abstract,
    methodology: summary?.methodology || extractedSection(paper, /method|approach|experiment|material/i),
    algorithms: summary?.proposed_approach_model || extractedSection(paper, /algorithm|model|architecture|approach/i),
    dataset: summary?.dataset_data_used || extractedSection(paper, /dataset|data|corpus|benchmark/i),
    results: summary?.key_results || extractedSection(paper, /result|finding|evaluation/i),
    limitations: summary?.limitations || extractedSection(paper, /limitation|threat/i),
    future_work: summary?.future_work || extractedSection(paper, /future|conclusion|discussion/i),
    authors: paper.authors?.filter((author) => author && author !== 'Unknown Author').join(', '),
    year: paper.year > 0 ? String(paper.year) : undefined,
    journal: paper.journal,
    references: extractedSection(paper, /reference|bibliograph|citation/i),
    tags: paper.tags?.join(' • '),
  };
  const value = values[key];
  return value && value.trim() ? value : NOT_AVAILABLE;
}

function comparisonNote(paper: Paper): string {
  const availableSections = paper.sections?.map((section) => section.title).filter(Boolean) || [];
  return availableSections.length > 0
    ? `${paper.title}: extracted sections available include ${availableSections.join(', ')}.`
    : `${paper.title}: ${NOT_AVAILABLE}`;
}

export const ComparePage: React.FC = () => {
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paperService.getPapers().then((data) => {
      setAllPapers(data);
      setSelectedIds([]);
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
    { label: 'Research Problem', key: 'research_problem' },
    { label: 'Objective', key: 'objectives' },
    { label: 'Abstract', key: 'abstract' },
    { label: 'Methodology', key: 'methodology' },
    { label: 'Algorithms / Models', key: 'algorithms' },
    { label: 'Dataset / Data', key: 'dataset' },
    { label: 'Key Results', key: 'results' },
    { label: 'Limitations', key: 'limitations' },
    { label: 'Future Work', key: 'future_work' },
    { label: 'Authors', key: 'authors' },
    { label: 'Year', key: 'year' },
    { label: 'Journal / Venue', key: 'journal' },
    { label: 'References / Citation Information', key: 'references' },
  ] as const;

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
                          <span className="text-xs text-indigo-400 font-mono block">
                            {comparisonValue(paper, 'journal')} ({comparisonValue(paper, 'year')})
                          </span>
                          <div className="line-clamp-2 text-sm">{paper.title}</div>
                          <span className="text-xs text-[#7d8599] font-mono block">{comparisonValue(paper, 'authors')}</span>
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
                        const content = comparisonValue(paper, row.key);

                        return (
                          <td key={paper.id} className="p-5 text-sm text-[#b4b9c7] leading-relaxed border-r border-white/10 align-top hover:bg-white/5 transition-colors">
                            <p className="line-clamp-6">{content}</p>
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

      {selectedPapers.length > 0 && (
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
            <h2 className="text-2xl font-bold text-[#f0f2f7] font-heading">Comparison Notes</h2>
          </div>

          <Card className="p-4 text-sm text-[#b4b9c7] space-y-2">
            <p>Comparison notes reflect the extracted evidence available in the selected papers.</p>
            {selectedPapers.map((paper) => (
              <p key={paper.id}>{comparisonNote(paper)}</p>
            ))}
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
