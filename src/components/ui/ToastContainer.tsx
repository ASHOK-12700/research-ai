import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import type { ToastMessage } from '../../hooks/useToast';

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-[#181c2b] dark:bg-[#181c2b] light:bg-white border border-white/10 shadow-xl rounded-xl"
          >
            {icons[toast.type]}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-zinc-100">{toast.title}</h4>
              {toast.message && <p className="text-xs text-zinc-400 mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
