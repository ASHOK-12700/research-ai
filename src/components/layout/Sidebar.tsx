import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  GitCompare,
  MessageSquareQuote,
  Lightbulb,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Research', icon: FolderKanban, path: '/projects' },
    { label: 'Folders', icon: FolderKanban, path: '/folders' },
    { label: 'Papers', icon: FileText, path: '/papers' },
    { label: 'Compare', icon: GitCompare, path: '/compare' },
    { label: 'Ask Papers', icon: MessageSquareQuote, path: '/ask' },
    { label: 'Research Gaps', icon: Lightbulb, path: '/research-gaps' },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    const { error } = await signOut();
    if (!error) {
      navigate('/login', { replace: true });
    } else {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className={cn(
        'dashboard-sidebar relative flex flex-col h-screen bg-[rgba(10,21,28,0.82)] border-r border-[var(--border-subtle)] transition-all duration-300 z-30 select-none shrink-0 shadow-lg backdrop-blur-xl',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header - Premium */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/35 backdrop-blur-sm">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--accent-primary)] text-white shrink-0 shadow-md shadow-[var(--accent-primary)]/25 transition-all duration-300">
            <Sparkles className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-lg text-[var(--text-primary)] tracking-[-0.03em] font-heading flex items-center gap-1">
                Research<span className="text-[var(--accent-primary)]">AI</span>
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium truncate">
                Advanced Research Workspace
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={onToggle}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-none">
        <div className={cn('px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]', collapsed && 'text-center')}>
          {collapsed ? '◆' : 'WORKSPACE'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[0.65rem] text-sm font-semibold transition-all duration-200 group',
                  isActive
                    ? 'bg-[var(--accent-primary)]/14 text-[var(--accent-tertiary)] border border-[var(--border-accent)] shadow-sm shadow-[var(--accent-primary)]/10'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-200" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section - Premium */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-2 bg-[var(--bg-surface)]/35">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
              isActive 
                ? 'bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] border border-[var(--border-accent)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            )
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <a
          href="/help"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
          title={collapsed ? 'Help & Support' : undefined}
        >
          <HelpCircle className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Help</span>}
        </a>

        {/* Logout Button - Danger state */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-red-300 hover:bg-red-500/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>}
        </button>

        {/* User Card - Premium styling */}
        <div className={cn('mt-3 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-3 px-2', collapsed && 'justify-center')}>
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-md shadow-[var(--accent-primary)]/20">
            A
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate min-w-0">
              <span className="text-xs font-semibold text-[var(--text-primary)] truncate">Researcher</span>
              <span className="text-[10px] text-[var(--text-muted)] truncate">Active</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
