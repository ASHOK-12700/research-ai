import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Cpu,
  Database,
  BarChart,
  Target,
  ChevronDown
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { paperService } from '../services/paperService';
import type { Paper, SourceReference } from '../types';

export const SummaryPage: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();
  const { onOpenEvidence } = useOutletContext<{
    onOpenEvidence: (source: SourceReference) => void;
  }>();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paperId) {
      paperService.getPaperById(paperId).then((data) => {
        setPaper(data);
        setLoading(false);
      });
    }
  }, [paperId]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4">
        <div className="h-24 bg-zinc-900/60 rounded-2xl animate-pulse" />
        <div className="h-96 bg-zinc-900/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!paper || !paper.summary) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-300">Summary Not Available</h2>
        <Button variant="primary" onClick={() => navigate('/papers')}>
          Back to Literature Library
        </Button>
      </div>
    );
  }

  const { summary } = paper;

  const sections = [
    {
      title: 'Research Problem',
      icon: Target,
      color: 'text-indigo-400',
      content: summary.problem,
      page: 1,
      sectionName: 'Abstract'
    },
    {
      title: 'Proposed Approach',
      icon: Lightbulb,
      color: 'text-amber-400',
      content: summary.approach,
      page: 2,
      sectionName: 'Introduction'
    },
    {
      title: 'Methodology',
      icon: Cpu,
      color: 'text-purple-400',
      content: summary.methodology,
      page: 3,
      sectionName: 'Methodology'
    },
    {
      title: 'Dataset & Setup',
      icon: Database,
      color: 'text-sky-400',
      content: summary.dataset,
      page: 4,
      sectionName: 'Dataset'
    },
    {
      title: 'Algorithms & Architectures',
      icon: Cpu,
      color: 'text-emerald-400',
      content: summary.algorithms.join(', '),
      page: 5,
      sectionName: 'Models'
    },
    {
      title: 'Key Results & Performance',
      icon: BarChart,
      color: 'text-indigo-400',
      list: summary.keyResults,
      page: 6,
      sectionName: 'Results'
    },
    {
      title: 'Limitations & Bottlenecks',
      icon: AlertCircle,
      color: 'text-rose-400',
      list: summary.limitations,
      page: 8,
      sectionName: 'Discussion'
    },
    {
      title: 'Future Research Directions',
      icon: CheckCircle,
      color: 'text-emerald-400',
      list: summary.futureWork,
      page: 9,
      sectionName: 'Conclusion'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(`/papers/${paper.id}`)}
          className="flex items-center gap-2 text-sm text-[#7d8599] hover:text-[#f0f2f7] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Paper Reader
        </button>

        {/* Title Card */}
        <Card className="space-y-4 p-8">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono font-bold">
            <Sparkles className="w-4 h-4" />
            <span className="uppercase tracking-wider">AI Structured Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f2f7] tracking-tight font-heading leading-tight">
            {paper.title}
          </h1>
          <p className="text-sm text-[#b4b9c7] font-mono">
            {paper.authors.join(', ')} <span className="text-[#7d8599]">({paper.year})</span> • {paper.journal}
          </p>
        </Card>
      </motion.div>

      {/* Structured Summary Sections */}
      <div className="space-y-4">
        {sections.map((sec, idx) => (
          <SummaryCard key={idx} section={sec} index={idx} paper={paper} onOpenEvidence={onOpenEvidence} />
        ))}
      </div>
    </div>
  );
};

// Premium Summary Section Card Component
const SummaryCard: React.FC<{
  section: any;
  index: number;
  paper: any;
  onOpenEvidence: any;
}> = ({ section, index, paper, onOpenEvidence }) => {
  const [isExpanded, setIsExpanded] = useState(index < 3); // First 3 expanded by default

  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 hover:bg-white/2 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 rounded-lg bg-indigo-600/20 border border-indigo-500/30 shrink-0">
                <Icon className={`w-5 h-5 ${section.color}`} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#f0f2f7] font-heading">{section.title}</h3>
                <p className="text-xs text-[#7d8599] mt-1">
                  {section.content
                    ? section.content.substring(0, 80) + (section.content.length > 80 ? '...' : '')
                    : section.list?.[0]?.substring(0, 80) + (section.list[0]?.length > 80 ? '...' : '')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-4">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-[#7d8599]"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 pt-0 border-t border-white/10 space-y-4">
            {section.content && (
              <p className="text-sm text-[#b4b9c7] leading-relaxed">{section.content}</p>
            )}

            {section.list && (
              <ul className="space-y-2">
                {section.list.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-indigo-400 font-bold text-lg leading-none mt-0.5">•</span>
                    <span className="text-sm text-[#b4b9c7] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() =>
                onOpenEvidence({
                  paperId: paper.id,
                  paperTitle: paper.title,
                  page: section.page,
                  section: section.sectionName,
                  snippet: Array.isArray(section.list) ? section.list.join('. ') : section.content || ''
                })
              }
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 mt-2"
            >
              View Evidence in Paper →
            </button>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};
