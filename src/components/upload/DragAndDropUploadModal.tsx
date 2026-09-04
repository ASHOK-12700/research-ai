import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { paperService } from '../../services/paperService';
import type { Paper } from '../../types';

export interface DragAndDropUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaperUploaded?: (paper: Paper) => void;
  projectId?: string;
}

export const DragAndDropUploadModal: React.FC<DragAndDropUploadModalProps> = ({
  isOpen,
  onClose,
  onPaperUploaded,
  projectId
}) => {
  const navigate = useNavigate();
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setStatus('idle');
    setProgress(0);
    setFileName('');
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF research paper file.');
      return;
    }

    setFileName(file.name);
    setStatus('uploading');
    setProgress(15);

    try {
      setStatus('processing');

      const paper = await paperService.uploadPaper(file, projectId, (p) => {
        setProgress(p);
      });

      setStatus('completed');
      if (onPaperUploaded) onPaperUploaded(paper);
    } catch {
      setStatus('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Upload Research Paper"
      maxWidth="md"
    >
      <div className="space-y-6">
        <p className="text-sm text-[var(--text-secondary)]">
          Add PDF research papers to your library. We'll automatically extract sections, citations, and generate AI insights.
        </p>

        <AnimatePresence mode="wait">
          {/* Idle - Dropzone */}
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  isDragOver
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 scale-105'
                    : 'border-[var(--border-default)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                <motion.div
                  animate={{ y: isDragOver ? -4 : 0 }}
                  className="w-16 h-16 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--border-accent)] flex items-center justify-center text-[var(--accent-primary)] mb-4 shadow-lg shadow-[var(--accent-primary)]/10"
                >
                  <UploadCloud className="w-8 h-8" />
                </motion.div>
                <h4 className="text-base font-bold text-[var(--text-primary)]">
                  Drag your PDF here
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  or click to browse · Up to 50MB · Single file per upload
                </p>
                <Button variant="primary" size="sm" className="mt-5">
                  Select File
                </Button>
              </div>
            </motion.div>
          )}

          {/* Uploading / Processing */}
          {(status === 'uploading' || status === 'processing') && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-5"
            >
              <div className="p-5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-accent)] space-y-4">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="p-2.5 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--border-accent)] shrink-0 text-[var(--accent-primary)] mt-1"
                  >
                    <FileText className="w-5 h-5" />
                  </motion.div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-[var(--text-primary)] text-sm truncate">{fileName}</h5>
                    <div className="flex items-center gap-2 mt-1.5">
                      <motion.span
                        animate={{ opacity: [0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-primary)] font-medium"
                      >
                        <Sparkles className="w-3 h-3" />
                        {status === 'uploading' ? 'Uploading...' : 'Processing PDF...'}
                      </motion.span>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-[var(--accent-primary)] font-bold">{progress}%</span>
                </div>

                {/* Premium Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                    <motion.div
                      initial={{ width: '15%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-primary)]/90 to-[var(--accent-primary)] rounded-full shadow-lg shadow-[var(--accent-primary)]/25"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                    <span>{status === 'uploading' ? 'Uploading' : 'Analyzing'}</span>
                    <span>{Math.min(progress, 100)}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {status === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-5"
            >
              <div className="p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-start gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 shrink-0 text-emerald-400 mt-1"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </motion.div>
                  <div className="flex-1">
                    <h5 className="font-bold text-[var(--text-primary)] text-sm">Paper Processed Successfully</h5>
                    <p className="text-xs text-emerald-500 mt-1 font-mono truncate">{fileName}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  ✓ PDF sections extracted · ✓ Citations extracted · ✓ AI insights generated
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Upload Another
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    handleReset();
                    navigate('/papers');
                  }}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="flex-1"
                >
                  View Library
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="p-5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-bold text-[var(--text-primary)] text-sm">Upload Failed</h5>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    We couldn't process this file. Please ensure it's a valid PDF and try again.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};
