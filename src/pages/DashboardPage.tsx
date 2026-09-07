import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  FileText,
  Lightbulb,
  BookOpenCheck,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ActivityTimeline } from '../components/timeline/ActivityTimeline';
import { useStatsCounter } from '../hooks/useStatsCounter';
import { projectService } from '../services/projectService';
import { mockResearchInsights, mockTimelineEvents } from '../data/mockInsights';
import type { ResearchProject } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { onOpenUpload } = useOutletContext<{ onOpenUpload: () => void }>();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const projectCount = useStatsCounter(4);
  const paperCount = useStatsCounter(41);
  const gapCount = useStatsCounter(16);
  const citationCount = useStatsCounter(128);

  const stats = [
    { label: 'Research Projects', value: projectCount, icon: FolderKanban, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Papers Analyzed', value: paperCount, icon: FileText, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Research Gaps', value: gapCount, icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Citations Generated', value: citationCount, icon: BookOpenCheck, color: 'text-purple-400', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16">
      {/* Premium Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f2f7] tracking-tight font-heading">
            Welcome back, Researcher.
          </h1>
          <p className="text-lg text-[#b4b9c7] max-w-2xl">
            Continue exploring your research literature and uncover key cross-paper insights powered by advanced AI analysis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onOpenUpload}
            variant="primary"
            size="md"
            icon={<FileText className="w-5 h-5" />}
          >
            Upload New Paper
          </Button>
          <Button
            onClick={() => navigate('/projects')}
            variant="secondary"
            size="md"
            icon={<Plus className="w-5 h-5" />}
          >
            New Research Project
          </Button>
        </div>
      </motion.div>

      {/* Premium Stats Grid */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#7d8599] mb-4">Research Metrics</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((st, idx) => {
            const Icon = st.icon;
            return (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
              >
                <Card variant="glass" className="dashboard-glass group relative overflow-hidden">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#b4b9c7]">{st.label}</span>
                      <div className={`p-2.5 rounded-lg ${st.bg}`}>
                        <Icon className={`w-4 h-4 ${st.color}`} />
                      </div>
                    </div>
                    <div className="font-heading font-bold text-3xl text-[#f0f2f7] font-mono">
                      {st.value}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Research Projects - Premium Layout */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#f0f2f7] font-heading flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-400" />
              Recent Research Projects
            </h2>
            <p className="text-sm text-[#7d8599]">Continue where you left off</p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-40 bg-[#0f131a] rounded-lg border border-white/10 animate-pulse"
                />
              ))
            : projects.slice(0, 4).map((proj, idx) => (
                <motion.div
                  key={proj.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  className="cursor-pointer group"
                >
                  <Card variant="glass" className="dashboard-glass flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="indigo">{proj.topic}</Badge>
                        <span className="text-[10px] text-[#7d8599] flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> {proj.updatedAt}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold text-base text-[#f0f2f7] group-hover:text-indigo-300 transition-colors line-clamp-2">
                          {proj.title}
                        </h3>
                        <p className="text-xs text-[#b4b9c7] line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-[#7d8599] font-mono">
                        <span>📄 {proj.paperCount}</span>
                        <span>💡 {proj.gapCount}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </motion.div>
              ))}
        </div>
      </div>

      {/* Activity & Insights - Premium Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Timeline */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#f0f2f7] font-heading flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-400" />
              Activity
            </h2>
            <p className="text-sm text-[#7d8599]">Recent changes</p>
          </div>
          <Card variant="glass" className="dashboard-glass h-full min-h-96">
            <ActivityTimeline events={mockTimelineEvents} />
          </Card>
        </div>

        {/* Research Insights - Premium */}
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#f0f2f7] font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              AI Research Insights
            </h2>
            <p className="text-sm text-[#7d8599]">Cross-paper intelligence from your literature</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {mockResearchInsights.slice(0, 4).map((ins, idx) => (
              <motion.div
                key={ins.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card variant="glass" className="dashboard-glass h-full flex flex-col justify-between group relative overflow-hidden">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 text-[10px] uppercase font-mono font-bold text-indigo-300 bg-indigo-500/20 rounded-full">
                        {ins.category}
                      </span>
                      <span className="text-[10px] text-[#7d8599] font-mono">{ins.generatedAt}</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-[#f0f2f7] leading-snug group-hover:text-indigo-300 transition-colors">
                        {ins.title}
                      </h4>
                      <p className="text-xs text-[#b4b9c7] leading-relaxed line-clamp-2">
                        {ins.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/10 mt-4">
                    <button
                      onClick={() => navigate('/research-gaps')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2 transition-colors"
                    >
                      Explore gaps
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-indigo-500/0 transition-all duration-300 pointer-events-none" />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
