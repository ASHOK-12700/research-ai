import React, { useState } from 'react';
import { Search, Moon, Sun, Bell, Plus, Menu, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';

export interface HeaderProps {
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenUpload,
  onOpenMobileMenu
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Paper processing completed', desc: 'Swin-MedNet segmentation paper analyzed', time: '10 mins ago', read: false },
    { id: '2', title: 'Research Gap Discovered', desc: '4 medical imaging papers flagged small sample sizes', time: '1 hour ago', read: false },
    { id: '3', title: 'Summary Generated', desc: 'MobileNetV4 summary available', time: '3 hours ago', read: true }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="dashboard-header sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-[rgba(10,14,21,0.44)] backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-sm">
      {/* Left: Mobile Menu & Search Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all duration-200"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar Trigger - Premium Styling */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-4 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--border-accent)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200 shadow-sm w-48 sm:w-64 md:w-80 group"
        >
          <Search className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] shrink-0 transition-colors" />
          <span className="truncate text-xs sm:text-sm">Search papers, projects, gaps...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-mono font-semibold text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded border border-[var(--border-subtle)] ml-auto shrink-0">
            <span>Ctrl</span> K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          onClick={onOpenUpload}
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          className="hidden sm:flex"
        >
          Upload Paper
        </Button>

        {/* Theme Toggle - Premium */}
        <button
          onClick={toggleTheme}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
        </button>

        {/* Notifications Popover - Premium */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute right-0 mt-2 w-96 bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-[var(--border-default)] rounded-xl shadow-2xl shadow-[rgba(15,23,42,0.18)] p-4 z-50"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[var(--accent-primary)] hover:opacity-85 transition-colors flex items-center gap-1 font-medium"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n, idx) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-3 rounded-lg text-xs transition-all duration-200 cursor-pointer hover:bg-[var(--bg-hover)] ${
                          n.read
                            ? 'bg-transparent text-[var(--text-muted)]'
                            : 'bg-[var(--accent-primary)]/10 text-[var(--text-primary)] border border-[var(--border-accent)]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-1.5">{n.desc}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
