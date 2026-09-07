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
import { CondensationBackground } from '../../shaders/condensation/CondensationBackground';
import { useToast } from '../../hooks/useToast';
import type { SourceReference } from '../../types';
import '../../shaders/threeui.css';
import '../../shaders/condensation/glass-effects.css';

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
    <div className="dashboard-shell relative flex h-screen overflow-hidden bg-[var(--bg-primary)] font-sans text-[var(--text-primary)]">
      {/* Full-screen Condensation Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <CondensationBackground
          speed={1.00}
          dropAmount={1.00}
          opacity={1.00}
        />
      </div>

      {/* Content with relative positioning to stack above background */}
      <div className="relative z-10 flex h-full w-full">
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
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[rgba(11,13,20,0.32)] backdrop-blur-[1px]">
          <Header
            onOpenSearch={() => setSearchOpen(true)}
            onOpenUpload={() => setUploadOpen(true)}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          <main className="scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent flex-1 overflow-y-auto bg-[rgba(11,13,20,0.24)] p-4 sm:p-6 md:p-8">
              <Outlet context={{ onOpenUpload: () => setUploadOpen(true), onOpenEvidence: handleOpenEvidence, addToast, papersRefreshToken }} />
          </main>
        </div>
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
