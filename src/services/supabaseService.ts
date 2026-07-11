import { supabase } from '../lib/supabase';

export interface ProjectData {
  objects: Record<string, any>;
  rootObjects: string[];
  settings: any;
  assets: any[];
}

export class SupabaseService {
  /**
   * Check if Supabase is fully configured and connected.
   */
  static isConfigured(): boolean {
    return !!supabase;
  }

  /**
   * Persists project configuration (including assets and objects with transform matrices/asset URLs) to Supabase.
   */
  static async saveProject(projectId: string, projectName: string, projectData: ProjectData): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.from('projects').upsert([
      {
        id: projectId,
        name: projectName,
        data: projectData,
        updated_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Supabase saveProject error:', error);
      throw error;
    }
  }

  /**
   * Fetches project configuration from Supabase.
   */
  static async loadProject(projectId: string): Promise<ProjectData | null> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('projects')
      .select('data')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Supabase loadProject error:', error);
      throw error;
    }

    return data?.data as ProjectData || null;
  }

  /**
   * Deletes a project and optionally cleans up its referenced assets from Supabase storage.
   */
  static async deleteProject(projectId: string, projectName: string, assetUrls: string[] = []): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    // 1. Delete from database
    const { error: dbError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (dbError) {
      // Fallback: Try deleting by name if id matches or doesn't work (for backwards compatibility)
      const { error: dbErrorByName } = await supabase
        .from('projects')
        .delete()
        .eq('name', projectName);
      
      if (dbErrorByName) {
        console.error('Supabase deleteProject error:', dbErrorByName);
        throw dbErrorByName;
      }
    }

    // 2. Clean up assets from storage if provided
    if (assetUrls.length > 0) {
      const pathsToRemove: string[] = [];
      assetUrls.forEach((url) => {
        if (url && url.includes('/storage/v1/object/public/assets/')) {
          const path = url.split('/storage/v1/object/public/assets/')[1];
          if (path) pathsToRemove.push(path);
        }
      });

      if (pathsToRemove.length > 0) {
        try {
          const { error: storageError } = await supabase.storage
            .from('assets')
            .remove(pathsToRemove);
          if (storageError) {
            console.warn('Supabase storage asset cleanup warning:', storageError);
          }
        } catch (err) {
          console.error('Supabase storage asset cleanup error:', err);
        }
      }
    }
  }

  /**
   * Uploads an asset file to Supabase storage.
   */
  static async uploadAsset(file: File, projectName: string): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const sanitizedProjectName = projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'default-project';
    const filePath = `${sanitizedProjectName}/${Date.now()}_${file.name}`;
    
    const { error } = await supabase.storage
      .from('assets')
      .upload(filePath, file);

    if (error) {
      console.error('Supabase uploadAsset error:', error);
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    if (!publicData?.publicUrl) {
      throw new Error('Failed to generate public URL for uploaded asset.');
    }

    return publicData.publicUrl;
  }

  /**
   * Publishes the compiled HTML to the local backend and registers the configuration in Supabase.
   */
  static async publishProject(
    projectId: string,
    projectName: string,
    projectData: ProjectData,
    htmlContent: string
  ): Promise<{ url: string; publishedProjectId: string }> {
    // 1. Persist the project configuration to Supabase first for re-publishing/persistence
    if (supabase) {
      await this.saveProject(projectId, projectName, projectData);
    }

    // 2. Try posting to local Express server if active
    let finalPath = `/papar/${projectId}`;
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, html: htmlContent })
      });

      if (response.ok) {
        const { url: publishedPath } = await response.json();
        finalPath = publishedPath;
      } else {
        console.warn('Backend publish endpoint returned non-OK status, falling back to client-side path');
      }
    } catch (err) {
      console.warn('Backend publish endpoint unavailable, falling back to client-side path:', err);
    }

    const url = `${window.location.origin}${finalPath}`;
    return {
      url,
      publishedProjectId: projectId
    };
  }
}
