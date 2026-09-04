import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SourceReference } from '../../types';
import { Button } from '../ui/Button';

export interface RightEvidenceDrawerProps {
  source: SourceReference | null;
  onClose: () => void;
  onCopySnippet?: (text: string) => void;
}

export const RightEvidenceDrawer: React.FC<RightEvidenceDrawerProps> = ({
  source,
  onClose,
  onCopySnippet
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  if (!source) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(source.snippet);
    setCopied(true);
    if (onCopySnippet) onCopySnippet(source.snippet);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToPaper = () => {
    onClose();
    navigate(`/papers/${source.paperId}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="w-screen max-w-md bg-[#121522] dark:bg-[#121522] light:bg-white border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl z-10"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Source Citation & Evidence</span>
                </div>
                <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Paper Reference Badge Card */}
              <div className="mt-5 p-4 rounded-xl bg-zinc-900/90 dark:bg-zinc-900/90 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Page {source.page} • Section: {source.section}</span>
                </div>
                <h3 className="font-bold text-base text-zinc-100 leading-snug">{source.paperTitle}</h3>
              </div>

              {/* Exact Snippet Quote */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Extracted Source Evidence</h4>
                <div className="relative p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-sm text-zinc-200 leading-relaxed font-sans italic">
                  "{source.snippet}"
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                className="flex-1"
              >
                {copied ? 'Copied' : 'Copy Snippet'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleGoToPaper}
                icon={<ExternalLink className="w-4 h-4" />}
                className="flex-1"
              >
                Open Paper
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
