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
import { projectService } from '../services/projectService';
import { paperService } from '../services/paperService';
import type { ResearchProject } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { onOpenUpload } = useOutletContext<{ onOpenUpload: () => void }>();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [paperCount, setPaperCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [projectData, paperData] = await Promise.all([
          projectService.getProjects(),
          paperService.getPapers(),
        ]);
        setProjects(projectData);
        setPaperCount(paperData.length);
      } catch {
        setProjects([]);
        setPaperCount(0);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  const stats = [
    { label: 'Research Projects', value: projects.length, icon: FolderKanban, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Papers Analyzed', value: paperCount, icon: FileText, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Research Gaps', value: 0, icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Citations Generated', value: 0, icon: BookOpenCheck, color: 'text-purple-400', bg: 'bg-purple-500/10' }
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
            Welcome back.
          </h1>
          <p className="text-lg text-[#b4b9c7] max-w-2xl">
            Continue exploring your research literature and upload more papers whenever you are ready.
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

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#f0f2f7] font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Your research workspace
            </h2>
            <p className="text-sm text-[#7d8599]">The dashboard reflects your uploaded papers and active projects.</p>
          </div>

          {projects.length === 0 && paperCount === 0 ? (
            <Card variant="glass" className="dashboard-glass p-8 text-center">
              <p className="text-[#b4b9c7]">No papers or projects are available yet. Upload a PDF to begin your research library.</p>
            </Card>
          ) : (
            <Card variant="glass" className="dashboard-glass p-6">
              <p className="text-sm text-[#b4b9c7]">
                {paperCount} uploaded paper{paperCount === 1 ? '' : 's'} and {projects.length} project{projects.length === 1 ? '' : 's'} currently visible in your account.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
