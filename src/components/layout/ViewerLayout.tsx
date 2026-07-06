import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Viewport } from '../viewport/Viewport';
import { supabase } from '../../lib/supabase';
import { useEditorStore } from '../../store/useEditorStore';

export function ViewerLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;
      
      try {
        setLoading(true);
        if (!supabase) {
          setError('Supabase is not configured. Please set up your environment variables.');
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('data')
          .eq('id', projectId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data && data.data) {
          // Load project data into the store
          useEditorStore.getState().loadProject(data.data);
          // Ensure we are in preview mode
          useEditorStore.setState({ isPreviewMode: true });
        } else {
          setError('Project not found or contains no data.');
        }
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message || 'Failed to load project.');
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
    
    // Cleanup to exit preview mode when unmounting (optional)
    return () => {
      useEditorStore.setState({ isPreviewMode: false });
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono">Loading AR Experience...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-red-500 p-8">
        <h2 className="text-2xl font-bold mb-4">Error Loading Experience</h2>
        <p className="bg-red-900/30 p-4 rounded font-mono text-sm max-w-lg text-center border border-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <Viewport />
    </div>
  );
}
