import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, FolderKanban, BookOpenCheck, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { paperService } from '../../services/paperService';
import { projectService } from '../../services/projectService';
import type { Paper } from '../../types';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null; // Toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load user's data when palette opens
  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      Promise.all([
        paperService.getPapers().catch(() => []),
        projectService.getProjects().catch(() => [])
      ]).then(([loadedPapers, loadedProjects]) => {
        setPapers(loadedPapers || []);
        setProjects(loadedProjects || []);
        setLoading(false);
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const filteredPapers = papers.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.authors.some((a) => a.toLowerCase().includes(query.toLowerCase())) ||
    (p.tags && p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())))
  );

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.topic.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-xl bg-[#121522] dark:bg-[#121522] light:bg-white border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Input Header */}
          <div className="flex items-center px-4 border-b border-white/10">
            <Search className="w-5 h-5 text-indigo-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search papers, projects, authors..."
              className="w-full px-3 py-4 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none"
              autoFocus
            />
            <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-4">
            {/* Quick Actions - only shown when not authenticated or when no query */}
            {query === '' && (
              <div>
                <div className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Quick Navigation</div>
                <div className="space-y-1 mt-1">
                  {[
                    { title: 'Overview Dashboard', path: '/dashboard', icon: FolderKanban },
                    { title: 'Ask Your Papers', path: '/ask', icon: Search },
                    { title: 'Compare Papers', path: '/compare', icon: FileText },
                    { title: 'Research Gaps', path: '/research-gaps', icon: BookOpenCheck },
                    { title: 'Citations', path: '/citations', icon: BookOpenCheck }
                  ].map((nav) => (
                    <button
                      key={nav.path}
                      onClick={() => handleSelect(nav.path)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <nav.icon className="w-4 h-4 text-indigo-400" />
                        <span>{nav.title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && query !== '' && (
              <div className="p-8 text-center text-sm text-zinc-500">
                Loading results...
              </div>
            )}

            {/* Projects Results */}
            {!loading && filteredProjects.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Projects</div>
                <div className="space-y-1 mt-1">
                  {filteredProjects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => handleSelect(`/projects/${proj.id}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <FolderKanban className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="truncate">{proj.title}</span>
                      </div>
                      <span className="text-xs text-zinc-500 shrink-0">{proj.paperCount} papers</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Papers Results */}
            {!loading && filteredPapers.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Papers</div>
                <div className="space-y-1 mt-1">
                  {filteredPapers.map((paper) => (
                    <button
                      key={paper.id}
                      onClick={() => handleSelect(`/papers/${paper.id}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-medium text-zinc-200 truncate">{paper.title}</div>
                          <div className="text-xs text-zinc-500 truncate">
                            {paper.authors?.slice(0, 2).join(', ') || 'Unknown authors'} ({paper.year})
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && query !== '' && filteredPapers.length === 0 && filteredProjects.length === 0 && (
              <div className="p-8 text-center text-sm text-zinc-500">
                {!user ? (
                  <div className="space-y-2">
                    <p>Please log in to search your papers and projects.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>No papers or projects found matching "{query}"</p>
                    <p className="text-xs text-zinc-600">Try uploading papers or creating a project.</p>
                  </div>
                )}
              </div>
            )}

            {/* Authentication Prompt */}
            {!user && query === '' && (
              <div className="p-4 text-center text-xs text-zinc-500 border-t border-white/10 mt-4">
                <p>Log in to search your research papers and projects</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
