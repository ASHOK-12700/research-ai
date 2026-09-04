import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  Plus,
  ArrowRight,
  MoreVertical,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { projectService } from '../services/projectService';
import type { ResearchProject } from '../types';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'papers' | 'alphabetical'>('recent');

  // Create Project Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = () => {
    setLoading(true);
    projectService.getProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    await projectService.createProject({
      title: newTitle,
      topic: newTopic || 'General AI Research',
      description: newDesc
    });
    setSubmitting(false);
    setCreateModalOpen(false);
    setNewTitle('');
    setNewTopic('');
    setNewDesc('');
    fetchProjects();
  };

  const filteredProjects = projects
    .filter((p) => {
      if (filter === 'active' && p.status !== 'active') return false;
      if (filter === 'archived' && p.status !== 'archived') return false;
      if (search.trim()) {
        return (
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.topic.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'papers') return b.paperCount - a.paperCount;
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      return 0; // recent default
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 font-heading flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            My Research Workspace
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Organize your literature into focused, intelligent research projects.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          + New Research Project
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#121520] border border-white/10">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title or topic..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Status Filters */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-white/10 text-xs font-medium">
            {(['all', 'active', 'archived'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors cursor-pointer ${
                  filter === f ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none"
            >
              <option value="recent">Recently updated</option>
              <option value="papers">Most papers</option>
              <option value="alphabetical">A – Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-zinc-900/50" />
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-4">
            <FileText className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-zinc-300">No projects found</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto">
              Create your first research project to start uploading papers and identifying literature gaps.
            </p>
            <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
              + Create Research Project
            </Button>
          </div>
        ) : (
          filteredProjects.map((proj) => (
            <Card key={proj.id} hoverEffect className="flex flex-col justify-between space-y-4 group">
              <div>
                {/* Top Badges */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={proj.status === 'active' ? 'indigo' : 'default'}>
                    {proj.topic}
                  </Badge>
                  <button className="text-zinc-500 hover:text-zinc-300 p-1 rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Title & Desc */}
                <h3 className="font-bold text-lg text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {proj.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-3">
                  {proj.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {proj.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-300 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress & Bottom Bar */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 font-mono mb-1">
                    <span>Synthesis Progress</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <div className="flex items-center gap-3 font-mono">
                    <span>📄 {proj.paperCount} papers</span>
                    <span>💡 {proj.gapCount} gaps</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/projects/${proj.id}`)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Open
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Research Project"
        subtitle="Group related literature papers and synthesize domain insights."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Research Title *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. AI-Based Medical Image Detection"
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Research Topic / Field
            </label>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g. Deep Learning / Medical Imaging"
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Project Description
            </label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Summary of research scope, objectives, and targeted paper analysis..."
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
