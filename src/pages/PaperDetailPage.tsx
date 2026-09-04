import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  MessageSquareQuote,
  GitCompare,
  Bookmark,
  Layers,
  ArrowLeft,
  Share2,
  Heart
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { paperService } from '../services/paperService';
import type { Paper, SourceReference } from '../types';

export const PaperDetailPage: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();
  const { onOpenEvidence } = useOutletContext<{
    onOpenEvidence: (source: SourceReference) => void;
  }>();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [related, setRelated] = useState<{ paper: Paper; similarity: number; reason: string }[]>([]);
  const [activeSection, setActiveSection] = useState<string>('sec-1');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (!paperId) return;

    setLoading(true);
    setSummaryError(null);
    setSummary(null);
    Promise.all([
      paperService.getPaperById(paperId),
      paperService.getRelatedPapers(paperId)
    ])
      .then(([pData, rData]) => {
        setPaper(pData);
        setRelated(rData);
        if (pData?.sections && pData.sections[0]) {
          setActiveSection(pData.sections[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [paperId]);

  const handleGenerateSummary = async () => {
    if (!paperId) return;

    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const data = await paperService.generatePaperSummary(paperId);
      setSummary({
        paper_title: data.paper_title,
        authors: data.authors.join(', '),
        abstract_overview: data.abstract_overview,
        research_problem: data.research_problem,
        objectives: data.objectives,
        methodology: data.methodology,
        dataset_data_used: data.dataset_data_used,
        proposed_approach_model: data.proposed_approach_model,
        key_results: data.key_results,
        evaluation_metrics: data.evaluation_metrics,
        main_contributions: data.main_contributions,
        limitations: data.limitations,
        future_work: data.future_work,
        key_takeaways: data.key_takeaways,
      });
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : 'Unable to generate the summary right now.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const summarySections = [
    { key: 'paper_title', label: 'Paper Title' },
    { key: 'authors', label: 'Authors' },
    { key: 'abstract_overview', label: 'Abstract / Overview' },
    { key: 'research_problem', label: 'Research Problem' },
    { key: 'objectives', label: 'Objectives' },
    { key: 'methodology', label: 'Methodology' },
    { key: 'dataset_data_used', label: 'Dataset / Data Used' },
    { key: 'proposed_approach_model', label: 'Proposed Approach / Model' },
    { key: 'key_results', label: 'Key Results' },
    { key: 'evaluation_metrics', label: 'Evaluation Metrics' },
    { key: 'main_contributions', label: 'Main Contributions' },
    { key: 'limitations', label: 'Limitations' },
    { key: 'future_work', label: 'Future Work' },
    { key: 'key_takeaways', label: 'Key Takeaways' }
  ] as const;

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <div className="h-24 bg-zinc-900/60 rounded-2xl animate-pulse" />
        <div className="h-96 bg-zinc-900/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-300">Paper Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/papers')}>
          Back to Literature Library
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Premium Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/papers')}
          className="flex items-center gap-2 text-sm text-[#7d8599] hover:text-[#f0f2f7] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </button>

        {/* Paper Title & Metadata Section */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="indigo">{paper.journal}</Badge>
                <Badge variant="indigo" className="font-mono text-xs">
                  {paper.similarityScore}% Match
                </Badge>
                <span className="text-xs font-mono text-[#7d8599]">
                  {paper.citationsCount.toLocaleString()} citations
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#f0f2f7] tracking-tight font-heading leading-tight">
                {paper.title}
              </h1>
              <p className="text-base text-[#b4b9c7] mt-3 font-mono">
                {paper.authors.join(', ')} <span className="text-[#7d8599]">({paper.year})</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 shrink-0">
              <button className="p-2.5 rounded-lg bg-[#0f131a] border border-white/15 hover:border-indigo-500/50 text-[#b4b9c7] hover:text-indigo-300 transition-all hover:bg-indigo-500/5">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-lg bg-[#0f131a] border border-white/15 hover:border-indigo-500/50 text-[#b4b9c7] hover:text-indigo-300 transition-all hover:bg-indigo-500/5">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
              icon={<Sparkles className="w-5 h-5" />}
            >
              {summaryLoading ? 'Generating Summary...' : 'Generate AI Summary'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/ask')}
              icon={<MessageSquareQuote className="w-5 h-5" />}
            >
              Ask Paper
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/compare')}
              icon={<GitCompare className="w-5 h-5" />}
            >
              Compare
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card className="sticky top-20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              Table of Contents
            </h3>
            <div className="space-y-1">
              {paper.sections?.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    const el = document.getElementById(sec.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    activeSection === sec.id
                      ? 'bg-indigo-600/20 text-indigo-300 font-bold border-l-2 border-indigo-500'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{sec.title}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">p.{sec.pageNumber}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <Card className="space-y-6 p-6 sm:p-8">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-zinc-100 font-heading">Extracted Manuscript Content</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Parsed structure and mathematical equations from raw PDF.</p>
            </div>

            <div className="space-y-8">
              {paper.sections?.map((sec) => (
                <div key={sec.id} id={sec.id} className="space-y-2 scroll-mt-24">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <h3 className="text-base font-bold text-indigo-400 font-heading">{sec.title}</h3>
                    <span className="text-[10px] font-mono text-zinc-500">Page {sec.pageNumber}</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed font-sans">{sec.content}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card glow className="space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5 font-heading">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Insights Panel
              </h3>
            </div>

            {summaryLoading && (
              <div className="space-y-2">
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                </div>
                <p className="text-[11px] text-zinc-400">Generating structured summary…</p>
              </div>
            )}

            {!summaryLoading && summaryError && (
              <div className="space-y-2">
                <p className="text-xs text-rose-300">{summaryError}</p>
                <Button variant="outline" size="sm" onClick={handleGenerateSummary}>
                  Retry
                </Button>
              </div>
            )}

            {!summaryLoading && !summaryError && summary && (
              <div className="space-y-3 text-xs">
                {summarySections.map((section) => (
                  <div key={section.key} className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">{section.label}</span>
                    <p className="text-zinc-300 leading-relaxed">{summary[section.key] || 'Not specified'}</p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    onOpenEvidence({
                      paperId: paper.id,
                      paperTitle: paper.title,
                      page: 1,
                      section: 'Abstract',
                      snippet: summary.abstract_overview || 'Summary available.'
                    })
                  }
                  className="text-[10px] text-indigo-400 hover:underline pt-1 block cursor-pointer"
                >
                  View summary evidence →
                </button>
              </div>
            )}

            {!summaryLoading && !summaryError && !summary && (
              <p className="text-xs text-zinc-500">Summary pending extraction. Click “Generate AI Summary” to create a structured overview.</p>
            )}
          </Card>

          {related.length > 0 && (
            <Card className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                Related Literature
              </h3>
              <div className="space-y-2">
                {related.map(({ paper: rp, similarity, reason }) => (
                  <div
                    key={rp.id}
                    onClick={() => navigate(`/papers/${rp.id}`)}
                    className="p-2.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-400 truncate max-w-[120px]">{rp.journal}</span>
                      <span className="text-indigo-400 font-bold">{similarity}% match</span>
                    </div>
                    <h4 className="text-xs font-semibold text-zinc-200 line-clamp-1">{rp.title}</h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{reason}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
