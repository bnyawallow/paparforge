/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EditorLayout } from './components/layout/EditorLayout';
import { ViewerLayout } from './components/layout/ViewerLayout';
import { Login } from './components/auth/Login';
import { AdminDashboard } from './components/auth/AdminDashboard';
import { ProjectManagerView } from './components/dashboard/ProjectManagerView';
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

function WorkspaceRoute() {
  const isProjectOpen = useEditorStore(state => state.isProjectOpen);

  if (!isProjectOpen) {
    return <ProjectManagerView />;
  }

  return <EditorLayout />;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
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
      </Routes>
    </Router>
  );
}
