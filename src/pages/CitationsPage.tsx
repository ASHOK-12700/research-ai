import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BookOpenCheck,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { citationService } from '../services/citationService';
import type { Citation, CitationStyle } from '../types';

export const CitationsPage: React.FC = () => {
  const { addToast } = useOutletContext<{
    addToast: (toast: { type: 'success' | 'info'; title: string; message?: string }) => void;
  }>();

  const [citations, setCitations] = useState<Citation[]>([]);
  const [activeStyle, setActiveStyle] = useState<CitationStyle>('APA');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    citationService.getCitations().then((data) => {
      setCitations(data);
      setLoading(false);
    });
  }, []);

  const styles: CitationStyle[] = ['APA', 'IEEE', 'MLA', 'Chicago', 'BibTeX'];

  const handleCopy = async (citation: Citation) => {3
    const formatted = await citationService.formatCitationText(citation, activeStyle);
    navigator.clipboard.writeText(formatted);
    setCopiedId(citation.id);
    addToast({
      type: 'success',
      title: 'Citation Copied',
      message: `Copied ${activeStyle} format to clipboard.`
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAll = async () => {
    const bibtexStr = await citationService.exportAllBibtex();
    const blob = new Blob([bibtexStr], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'research_ai_references.bib';
    link.click();
    addToast({
      type: 'success',
      title: 'BibTeX Exported',
      message: 'Exported references as .bib file.'
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 font-heading flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-indigo-400" />
            Citation Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Format, copy, and export standard academic references for your manuscript.
          </p>
        </div>

        <Button
          onClick={handleExportAll}
          variant="primary"
          icon={<Download className="w-4 h-4" />}
        >
          Export All BibTeX (.bib)
        </Button>
      </div>

      {/* Citation Format Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#121520] border border-white/10 overflow-x-auto">
        {styles.map((style) => (
          <button
            key={style}
            onClick={() => setActiveStyle(style)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
              activeStyle === style
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            {style} Format
          </button>
        ))}
      </div>

      {/* Citations List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-zinc-900/50" />
          ))
        ) : (
          citations.map((cit) => (
            <Card key={cit.id} hoverEffect className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="indigo">{activeStyle}</Badge>
                  <span className="text-xs font-semibold text-zinc-300">{cit.paperTitle}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(cit)}
                  icon={copiedId === cit.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedId === cit.id ? 'Copied' : 'Copy'}
                </Button>
              </div>

              {/* Formatted Citation Block */}
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-zinc-200 font-mono leading-relaxed select-all">
                {activeStyle === 'BibTeX' ? (
                  <pre className="whitespace-pre-wrap">{cit.bibtex}</pre>
                ) : (
                  <span>
                    {cit.authors.join(', ')} ({cit.year}). {cit.paperTitle}. <em>{cit.journal}</em>
                    {cit.volume ? `, ${cit.volume}` : ''}
                    {cit.pages ? `, pp. ${cit.pages}` : ''}. DOI: {cit.doi || 'N/A'}
                  </span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
