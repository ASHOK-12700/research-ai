import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';
import { CommandPalette } from '../search/CommandPalette';
import { DragAndDropUploadModal } from '../upload/DragAndDropUploadModal';
import { RightEvidenceDrawer } from './RightEvidenceDrawer';
import { ToastContainer } from '../ui/ToastContainer';
import { ResearchAICopilot } from '../ui/ResearchAICopilot';
import { useToast } from '../../hooks/useToast';
import type { SourceReference } from '../../types';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [papersRefreshToken, setPapersRefreshToken] = useState(0);

  // Global Evidence Drawer State
  const [activeEvidence, setActiveEvidence] = useState<SourceReference | null>(null);

  const { toasts, addToast, removeToast } = useToast();

  const handleOpenEvidence = (source: SourceReference) => {
    setActiveEvidence(source);
  };

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenUpload={() => setUploadOpen(true)}
      />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onOpenSearch={() => setSearchOpen(true)}
          onOpenUpload={() => setUploadOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[var(--bg-primary)] scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent">
            <Outlet context={{ onOpenUpload: () => setUploadOpen(true), onOpenEvidence: handleOpenEvidence, addToast, papersRefreshToken }} />
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <DragAndDropUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onPaperUploaded={(paper) => {
          setPapersRefreshToken((value) => value + 1);
          addToast({
            type: 'success',
            title: 'Paper Added',
            message: `"${paper.title}" processed & added to library.`
          });
        }}
      />

      <RightEvidenceDrawer
        source={activeEvidence}
        onClose={() => setActiveEvidence(null)}
        onCopySnippet={() => {
          addToast({
            type: 'success',
            title: 'Snippet Copied',
            message: 'Evidence snippet copied to clipboard.'
          });
        }}
      />

      <ResearchAICopilot />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
