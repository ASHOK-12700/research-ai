import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  FileText,
  MessageSquareQuote,
  GitCompare,
  Lightbulb,
  BookOpenCheck,
  Clock,
  Edit,
  Upload,
  Sparkles,
  BarChart2,
  ArrowLeft
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ResearchTimeline } from '../components/timeline/ResearchTimeline';
import { projectService } from '../services/projectService';
import { paperService } from '../services/paperService';
import type { ResearchProject, Paper } from '../types';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { onOpenUpload, papersRefreshToken } = useOutletContext<{
    onOpenUpload: () => void;
    papersRefreshToken: number;
  }>();

  const [project, setProject] = useState<ResearchProject | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      Promise.all([
        projectService.getProjectById(projectId),
        paperService.getPapers(projectId)
      ]).then(([projData, paperData]) => {
        setProject(projData);
        setPapers(paperData);
        setLoading(false);
      });
    }
  }, [projectId, papersRefreshToken]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <div className="h-28 bg-zinc-900/60 rounded-2xl animate-pulse" />
        <div className="h-96 bg-zinc-900/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-300">Project Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'papers', label: 'Papers', count: papers.length, icon: <FileText className="w-4 h-4" /> },
    { id: 'ask', label: 'Ask', icon: <MessageSquareQuote className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'gaps', label: 'Research Gaps', count: project.gapCount, icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'citations', label: 'Citations', icon: <BookOpenCheck className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> }
  ];

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
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-sm text-[#7d8599] hover:text-[#f0f2f7] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </button>

        {/* Project Title Card */}
        <Card className="space-y-6 p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="indigo">{project.topic}</Badge>
            {project.tags.slice(0, 3).map((t, i) => (
              <span key={i} className="text-xs text-[#7d8599] font-mono bg-white/5 px-2.5 py-1 rounded-md border border-white/10 hover:border-indigo-500/30 transition-colors">
                #{t}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-[#f0f2f7] tracking-tight font-heading leading-tight">
              {project.title}
            </h1>
            <p className="text-base text-[#b4b9c7] leading-relaxed max-w-3xl">
              {project.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="secondary"
              size="md"
              icon={<Edit className="w-5 h-5" />}
            >
              Edit Project
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onOpenUpload}
              icon={<Upload className="w-5 h-5" />}
            >
              Upload Paper
            </Button>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="border-b border-white/10">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#f0f2f7] border-indigo-500'
                    : 'text-[#7d8599] border-transparent hover:text-[#b4b9c7] hover:border-indigo-500/30'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className="text-xs bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Contents with Animations */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Executive Summary */}
          <Card className="space-y-4 p-8 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 border border-indigo-500/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#f0f2f7] mb-3 font-heading">
                  AI Generated Research Executive Summary
                </h3>
                <p className="text-sm text-[#b4b9c7] leading-relaxed">
                  This workspace contains <strong className="text-[#f0f2f7]">{papers.length || project.paperCount} paper{(papers.length || project.paperCount) === 1 ? '' : 's'}</strong>. Generate paper summaries and use Ask Papers to build an evidence-backed synthesis from the extracted sections.
                </p>
              </div>
            </div>
          </Card>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Analyzed Papers', value: `${papers.length || project.paperCount}`, sub: '100% Extracted' },
              { label: 'Literature Time Horizon', value: papers.length ? `${Math.min(...papers.map((paper) => paper.year))} – ${Math.max(...papers.map((paper) => paper.year))}` : 'No data', sub: papers.length ? 'From uploaded metadata' : 'Upload papers to calculate' },
              { label: 'Dominant Methodology', value: papers.length ? 'See extracted sections' : 'No data', sub: 'Derived from uploaded papers' },
              { label: 'Primary Dataset', value: papers.length ? 'See extracted sections' : 'No data', sub: 'Derived from uploaded papers' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="space-y-2 h-full">
                  <span className="text-xs text-[#7d8599] font-medium">{stat.label}</span>
                  <div className="text-2xl font-bold text-[#f0f2f7] font-heading">{stat.value}</div>
                  <span className="text-xs text-indigo-400 font-mono">{stat.sub}</span>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Methodology & Findings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Methodology Distribution */}
            <Card className="space-y-4 p-6">
              <h3 className="text-base font-bold text-[#f0f2f7] flex items-center gap-2 font-heading">
                <BarChart2 className="w-5 h-5 text-sky-400" />
                Methodology Distribution
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Shifted-Window Transformers', percentage: 45, count: '5 Papers' },
                  { name: 'Residual CNN Architectures', percentage: 30, count: '3 Papers' },
                  { name: 'Mobile Inverted Bottlenecks', percentage: 15, count: '2 Papers' },
                  { name: 'Multimodal LLM Prompt Scaffolds', percentage: 10, count: '1 Paper' }
                ].map((m, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-[#b4b9c7] font-medium">{m.name}</span>
                      <span className="text-xs font-mono text-[#7d8599]">{m.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#121820] rounded-full h-2 overflow-hidden border border-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.percentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-2 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Key Findings */}
            <Card className="space-y-4 p-6">
              <h3 className="text-base font-bold text-[#f0f2f7] flex items-center gap-2 font-heading">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                Evidence-Based Key Findings
              </h3>
              <div className="space-y-3">
                {papers.slice(0, 3).map((paper) => (
                  <div key={paper.id} className="p-3 rounded-lg bg-[#0f131a] border border-white/10 hover:border-indigo-500/30 transition-colors space-y-1.5">
                    <h4 className="text-xs font-bold text-[#f0f2f7]">{paper.title}</h4>
                    <p className="text-xs text-[#b4b9c7] italic">"{paper.sections?.[0]?.content?.slice(0, 300) || 'No extracted evidence available.'}"</p>
                  </div>
                ))}
                {!papers.length && <p className="text-sm text-zinc-400">Upload papers to derive findings.</p>}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers.map((paper, idx) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="space-y-3 h-full hover:border-indigo-500/50 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="indigo">{paper.journal}</Badge>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{paper.similarityScore}%</span>
                </div>
                <h3
                  onClick={() => navigate(`/papers/${paper.id}`)}
                  className="font-bold text-sm text-[#f0f2f7] hover:text-indigo-400 cursor-pointer line-clamp-2 transition-colors"
                >
                  {paper.title}
                </h3>
                <p className="text-xs text-[#7d8599] line-clamp-2">{paper.abstract}</p>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[#7d8599] font-mono">{paper.authors[0]} ({paper.year})</span>
                  <button
                    onClick={() => navigate(`/papers/${paper.id}`)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                  >
                    Open →
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
          </div>
        </motion.div>
      )}

      {/* Other Tabs */}
      {activeTab === 'ask' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-[#f0f2f7] font-heading">Ask Your Papers</h3>
            <p className="text-sm text-[#b4b9c7] max-w-md mx-auto">
              Query across all {papers.length} papers in this project with citations.
            </p>
            <Button variant="primary" onClick={() => navigate('/ask')}>
              Launch AI Chat Assistant
            </Button>
          </Card>
        </motion.div>
      )}

      {activeTab === 'compare' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-[#f0f2f7] font-heading">Compare Papers</h3>
            <p className="text-sm text-[#b4b9c7] max-w-md mx-auto">
              Compare methodologies, datasets, models, metrics, and limitations across papers.
            </p>
            <Button variant="primary" onClick={() => navigate('/compare')}>
              Open Comparison Matrix
            </Button>
          </Card>
        </motion.div>
      )}

      {activeTab === 'gaps' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-[#f0f2f7] font-heading">Research Gaps ({project.gapCount})</h3>
            <p className="text-sm text-[#b4b9c7] max-w-md mx-auto">
              Explore unaddressed bottlenecks and AI-suggested future directions.
            </p>
            <Button variant="primary" onClick={() => navigate('/research-gaps')}>
              Open Research Gap Explorer
            </Button>
          </Card>
        </motion.div>
      )}

      {activeTab === 'citations' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-[#f0f2f7] font-heading">Export References</h3>
            <p className="text-sm text-[#b4b9c7] max-w-md mx-auto">
              Export APA, IEEE, MLA, Chicago, or BibTeX references for all papers in this project.
            </p>
            <Button variant="primary" onClick={() => navigate('/citations')}>
              Open Citation Manager
            </Button>
          </Card>
        </motion.div>
      )}

      {activeTab === 'timeline' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <ResearchTimeline papers={papers} />
        </motion.div>
      )}
    </div>
  );
};
