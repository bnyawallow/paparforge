/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EditorLayout } from './components/layout/EditorLayout';
import { ViewerLayout } from './components/layout/ViewerLayout';
import { Login } from './components/auth/Login';
import { AdminDashboard } from './components/auth/AdminDashboard';
import { ProjectManagerView } from './components/dashboard/ProjectManagerView';
import { GlobalLoadingOverlay } from './components/ui/GlobalLoadingOverlay';
import { useAuthStore } from './store/useAuthStore';
import { useEditorStore } from './store/useEditorStore';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

import { ErrorBoundary } from './components/viewport/ErrorBoundary';

function WorkspaceRoute() {
  const isProjectOpen = useEditorStore(state => state.isProjectOpen);

  if (!isProjectOpen) {
    return <ProjectManagerView />;
  }

  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#121215] text-white p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Editor Workspace Encountered an Issue</h2>
          <p className="text-sm text-gray-400 max-w-md mb-6">
            An unexpected error occurred during rendering. Your project data is saved in memory.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
              Recover Editor
            </button>
            <button
              onClick={() => useEditorStore.getState().closeProject()}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Return to Project Manager
            </button>
          </div>
        </div>
      )}
    >
      <EditorLayout />
    </ErrorBoundary>
  );
}

export default function App() {
  const { isAuthenticated, logout, setAuth } = useAuthStore();
  const syncProjectsWithServer = useEditorStore(state => state.syncProjectsWithServer);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => {
          if (res.status === 401) {
            logout();
          } else if (res.ok) {
            res.json().then(data => {
              if (data.user) {
                setAuth(token, data.user);
              }
            }).catch(() => {});
          }
        }).catch(() => {});
      }

      syncProjectsWithServer();
    }
  }, [isAuthenticated, syncProjectsWithServer, logout, setAuth]);

  return (
    <Router>
      <GlobalLoadingOverlay />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <WorkspaceRoute />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/papar/:projectId" element={<ViewerLayout />} />
        <Route path="/viewer/:projectId" element={<ViewerLayout />} />
      </Routes>
    </Router>
  );
}
