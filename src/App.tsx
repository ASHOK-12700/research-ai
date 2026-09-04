import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthRedirect } from './components/auth/AuthRedirect';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { PapersPage } from './pages/PapersPage';
import { PaperDetailPage } from './pages/PaperDetailPage';
import { SummaryPage } from './pages/SummaryPage';
import { AskPapersPage } from './pages/AskPapersPage';
import { ComparePage } from './pages/ComparePage';
import { ResearchGapsPage } from './pages/ResearchGapsPage';
import { CitationsPage } from './pages/CitationsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
          <Route path="/signup" element={<AuthRedirect><SignupPage /></AuthRedirect>} />
          <Route path="/forgot-password" element={<AuthRedirect><ForgotPasswordPage /></AuthRedirect>} />
          <Route path="/reset-password" element={<AuthRedirect><ResetPasswordPage /></AuthRedirect>} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/papers" element={<PapersPage />} />
            <Route path="/papers/:paperId" element={<PaperDetailPage />} />
            <Route path="/papers/:paperId/summary" element={<SummaryPage />} />
            <Route path="/ask" element={<AskPapersPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/research-gaps" element={<ResearchGapsPage />} />
            <Route path="/citations" element={<CitationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
