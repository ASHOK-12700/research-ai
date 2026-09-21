import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Premium Backdrop with sophisticated blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[rgba(4,12,16,0.68)] backdrop-blur-md"
          />

          {/* Premium Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className={cn(
              'relative w-full bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-[var(--shadow-xl)] overflow-hidden z-10 backdrop-blur-md',
              maxWidths[maxWidth]
            )}
          >
            {/* Header with premium styling */}
            <div className="relative z-10 flex items-start justify-between p-8 border-b border-[var(--border-subtle)]">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-[var(--text-primary)] font-heading tracking-tight">{title}</h3>
                {subtitle && <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all duration-200 flex-shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="relative z-10 p-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
