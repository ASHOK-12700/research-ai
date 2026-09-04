import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Grid,
  List,
  Plus,
  ArrowRight,
  SlidersHorizontal,
  Calendar,
  BookOpen
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { paperService } from '../services/paperService';
import type { Paper } from '../types';

export const PapersPage: React.FC = () => {
  const navigate = useNavigate();
  const { onOpenUpload, papersRefreshToken } = useOutletContext<{ onOpenUpload: () => void; papersRefreshToken: number }>();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => {
    let active = true;

    const loadPapers = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await paperService.getPapers();
        if (!active) return;
        setPapers(data);
      } catch (loadError) {
        if (!active) return;
        setPapers([]);
        setError(loadError instanceof Error ? loadError.message : 'Unable to load papers right now.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPapers();
    return () => {
      active = false;
    };
  }, [papersRefreshToken]);

  const filteredPapers = papers.filter((p) => {
    if (selectedTopic !== 'all' && !p.tags.includes(selectedTopic)) return false;
    if (selectedYear !== 'all' && p.year.toString() !== selectedYear) return false;
    if (search.trim()) {
      return (
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.authors.some((a) => a.toLowerCase().includes(search.toLowerCase())) ||
        p.journal.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f2f7] tracking-tight font-heading flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-400" />
            Research Library
          </h1>
          <p className="text-lg text-[#b4b9c7]">
            Browse, search, and analyze your collection of research papers
          </p>
        </div>
        <Button
          onClick={onOpenUpload}
          variant="primary"
          size="md"
          icon={<Plus className="w-5 h-5" />}
        >
          Upload New Paper
        </Button>
      </motion.div>

      {/* Premium Controls - Enhanced */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input - Premium */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-[#7d8599]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, authors, journal..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#0f131a] border border-white/15 hover:border-white/20 focus:border-indigo-500/50 rounded-lg text-sm text-[#f0f2f7] placeholder-[#7d8599] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Filters & View - Premium */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap items-center">
              <SlidersHorizontal className="w-4 h-4 text-[#7d8599]" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-[#0f131a] border border-white/15 rounded-lg px-3 py-2 text-sm text-[#f0f2f7] focus:outline-none focus:border-indigo-500/50 transition-all"
              >
                <option value="all">All Topics</option>
                <option value="CNN">CNN</option>
                <option value="Transformers">Transformers</option>
                <option value="Edge AI">Edge AI</option>
                <option value="LLM">LLM</option>
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-[#0f131a] border border-white/15 rounded-lg px-3 py-2 text-sm text-[#f0f2f7] focus:outline-none focus:border-indigo-500/50 transition-all"
              >
                <option value="all">All Years</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2016">2016</option>
              </select>
            </div>

            {/* View Toggle - Premium */}
            <div className="flex items-center bg-[#0f131a]/50 p-1 rounded-lg border border-white/15">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-[#7d8599] hover:text-[#f0f2f7]'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-[#7d8599] hover:text-[#f0f2f7]'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Result Count */}
            <div className="text-sm text-[#7d8599] font-mono">
              {filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      {loading ? (
        <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : ''}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${viewMode === 'grid' ? 'h-80' : 'h-20'} bg-[#0f131a] rounded-lg border border-white/10 animate-pulse`}
            />
          ))}
        </div>
      ) : error ? (
        <div className="py-20 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <FileText className="w-10 h-10 text-red-400 mx-auto" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#f0f2f7]">Unable to load library</h3>
            <p className="text-sm text-[#b4b9c7]">{error}</p>
          </div>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <FileText className="w-10 h-10 text-indigo-400 mx-auto" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#f0f2f7]">No papers found</h3>
            <p className="text-sm text-[#b4b9c7]">Try adjusting your filters or search query</p>
          </div>
          <Button
            variant="secondary"
            onClick={onOpenUpload}
            icon={<Plus className="w-4 h-4" />}
          >
            Upload Your First Paper
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPapers.map((paper, idx) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/papers/${paper.id}`)}
              className="cursor-pointer group"
            >
              <Card className="flex flex-col justify-between h-full">
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 group-hover:border-indigo-500/50 transition-all">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <Badge variant="indigo" className="text-xs">
                      {paper.similarityScore}% Match
                    </Badge>
                  </div>

                  {/* Title & Abstract */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-[#f0f2f7] group-hover:text-indigo-300 transition-colors line-clamp-3 leading-snug">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-[#b4b9c7] line-clamp-3 leading-relaxed">
                      {paper.abstract}
                    </p>
                  </div>

                  {/* Tags */}
                  {paper.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {paper.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-1 text-[10px] rounded-full bg-indigo-500/15 text-indigo-300 font-mono border border-indigo-500/20">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-[#7d8599]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="font-mono">{paper.year}</span>
                    </div>
                    <span className="truncate text-[11px]">{paper.journal}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPapers.map((paper, idx) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => navigate(`/papers/${paper.id}`)}
              className="cursor-pointer group"
            >
              <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[#7d8599] mb-1.5">
                      <span className="font-mono font-semibold text-[#b4b9c7]">{paper.year}</span>
                      <span>•</span>
                      <span className="truncate">{paper.journal}</span>
                    </div>
                    <h3 className="font-bold text-base text-[#f0f2f7] group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-[#7d8599] mt-1 line-clamp-1">
                      {paper.authors.slice(0, 2).join(', ')} {paper.authors.length > 2 ? '+' + (paper.authors.length - 2) + ' more' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="indigo" className="text-xs whitespace-nowrap">
                    {paper.similarityScore}% Match
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
