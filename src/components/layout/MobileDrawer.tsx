import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  FolderKanban,
  FileText,
  GitCompare,
  MessageSquareQuote,
  Lightbulb,
  BookOpenCheck,
  Settings,
  Sparkles
} from 'lucide-react';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Research', icon: FolderKanban, path: '/projects' },
    { label: 'Papers', icon: FileText, path: '/papers' },
    { label: 'Compare', icon: GitCompare, path: '/compare' },
    { label: 'Ask Papers', icon: MessageSquareQuote, path: '/ask' },
    { label: 'Research Gaps', icon: Lightbulb, path: '/research-gaps' },
    { label: 'Citations', icon: BookOpenCheck, path: '/citations' },
    { label: 'Settings', icon: Settings, path: '/settings' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-72 max-w-[80vw] h-full bg-[#0e111a] border-r border-white/10 p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-lg text-white font-heading">ResearchAI</span>
                </div>
                <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                  AR
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Dr. Alex Rivera</div>
                  <div className="text-[10px] text-zinc-500">Senior AI Researcher</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
