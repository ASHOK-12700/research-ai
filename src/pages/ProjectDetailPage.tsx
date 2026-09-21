import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  FileText,
  MessageSquareQuote,
  GitCompare,
  Lightbulb,
  Clock,
  Edit,
  Upload,
  Sparkles,
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
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      Promise.all([
        projectService.getProjectById(projectId),
        paperService.getPapers(projectId),
        paperService.getPapers()
      ]).then(([projData, paperData, libraryData]) => {
        setProject(projData);
        setPapers(paperData);
        setAllPapers(libraryData);
        setLoading(false);
      }).catch((error) => {
        setActionError(error instanceof Error ? error.message : 'Unable to load this project.');
        setLoading(false);
      });
    }
  }, [projectId, papersRefreshToken]);

  const refreshProject = async () => {
    if (!projectId) return;
    const [nextProject, projectPapers, libraryPapers] = await Promise.all([
      projectService.getProjectById(projectId),
      paperService.getPapers(projectId),
      paperService.getPapers()
    ]);
    setProject(nextProject);
    setPapers(projectPapers);
    setAllPapers(libraryPapers);
  };

  const openEdit = () => {
    if (!project) return;
    setEditTitle(project.title);
    setEditTopic(project.topic);
    setEditDescription(project.description);
    setEditOpen(true);
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !editTitle.trim()) return;
    try {
      await projectService.updateProject(projectId, { title: editTitle.trim(), topic: editTopic.trim(), description: editDescription.trim() });
      setEditOpen(false);
      await refreshProject();
    } catch (error) { setActionError(error instanceof Error ? error.message : 'Unable to update project.'); }
  };

  const deleteCurrentProject = async () => {
    if (!projectId || !window.confirm('Delete this project? Uploaded papers will remain in your library.')) return;
    try { await projectService.deleteProject(projectId); navigate('/projects'); }
    catch (error) { setActionError(error instanceof Error ? error.message : 'Unable to delete project.'); }
  };

  const addPaper = async () => {
    if (!projectId || !selectedPaperId) return;
    try { await projectService.addPaper(projectId, selectedPaperId); setSelectedPaperId(''); await refreshProject(); }
    catch (error) { setActionError(error instanceof Error ? error.message : 'Unable to add paper.'); }
  };

  const removePaper = async (paperId: string) => {
    if (!projectId) return;
    try { await projectService.removePaper(projectId, paperId); await refreshProject(); }
    catch (error) { setActionError(error instanceof Error ? error.message : 'Unable to remove paper.'); }
  };

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
              onClick={openEdit}
            >
              Edit Project
            </Button>
            <Button variant="outline" size="md" onClick={deleteCurrentProject}>Delete Project</Button>
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

      {actionError && <Card className="border-red-500/30 bg-red-500/10"><p className="text-sm text-red-300">{actionError}</p></Card>}

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Associated papers', value: `${papers.length}`, sub: 'Selected from your library' },
              { label: 'Project status', value: project.status, sub: 'Owned by your account' },
              { label: 'Last updated', value: project.updatedAt, sub: 'Project metadata' }
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
                <p className="text-xs text-[#7d8599] line-clamp-2">{paper.analysis?.abstract.content || 'Not available in this paper.'}</p>
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

          <Card className="space-y-4 p-6">
            <h3 className="text-base font-bold text-[#f0f2f7] font-heading">Associate existing papers</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={selectedPaperId} onChange={(event) => setSelectedPaperId(event.target.value)} className="research-select flex-1 px-3 py-2 text-sm">
                <option value="">Select a paper from your library</option>
                {allPapers.filter((paper) => !papers.some((current) => current.id === paper.id)).map((paper) => <option key={paper.id} value={paper.id}>{paper.title}</option>)}
              </select>
              <Button onClick={addPaper} disabled={!selectedPaperId}>Add paper</Button>
            </div>
            {papers.length === 0 ? <p className="text-sm text-zinc-400">No papers are associated with this project yet.</p> : <div className="space-y-2"><h4 className="text-sm font-semibold text-[#f0f2f7]">Associated papers</h4>{papers.map((paper) => <div key={paper.id} className="flex items-center justify-between gap-3 border-b border-white/10 py-2"><button onClick={() => navigate(`/papers/${paper.id}`)} className="truncate text-left text-sm text-indigo-300 hover:underline">{paper.title}</button><Button variant="ghost" size="xs" onClick={() => removePaper(paper.id)}>Remove</Button></div>)}</div>}
          </Card>
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

      {activeTab === 'timeline' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <ResearchTimeline papers={papers} />
        </motion.div>
      )}

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Edit research project</h2>
            <form onSubmit={saveEdit} className="space-y-4">
              <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} required className="research-input w-full px-3 py-2 text-sm" placeholder="Project title" />
              <input value={editTopic} onChange={(event) => setEditTopic(event.target.value)} className="research-input w-full px-3 py-2 text-sm" placeholder="Research topic" />
              <textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={4} className="research-textarea w-full px-3 py-2 text-sm" placeholder="Description or objective" />
              <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button type="submit">Save changes</Button></div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
