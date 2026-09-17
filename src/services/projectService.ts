export interface ProjectData {
  objects: Record<string, any>;
  rootObjects: string[];
  settings: any;
  assets: any[];
  scenes?: Record<string, any>;
  activeSceneId?: string;
}

export class ProjectService {
  private static getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  static isUserLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private static getPendingSyncs(): Record<string, { name: string; data: ProjectData; timestamp: number }> {
    try {
      const stored = localStorage.getItem('ar_forge_pending_syncs');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private static markPendingSync(id: string, name: string, projectData: ProjectData): void {
    try {
      const syncs = this.getPendingSyncs();
      syncs[id] = { name, data: projectData, timestamp: Date.now() };
      localStorage.setItem('ar_forge_pending_syncs', JSON.stringify(syncs));
    } catch (e) {
      console.warn('Failed to save pending sync to localStorage:', e);
    }
  }

  private static clearPendingSync(id: string): void {
    try {
      const syncs = this.getPendingSyncs();
      if (syncs[id]) {
        delete syncs[id];
        localStorage.setItem('ar_forge_pending_syncs', JSON.stringify(syncs));
      }
    } catch (e) {
      console.warn('Failed to clear pending sync in localStorage:', e);
    }
  }

  /**
   * Syncs any pending projects that failed to save during previous attempts
   */
  static async syncPendingProjects(): Promise<void> {
    if (!this.isUserLoggedIn()) return;
    
    const syncs = this.getPendingSyncs();
    const ids = Object.keys(syncs);
    if (ids.length === 0) return;

    console.log(`Found ${ids.length} pending projects to sync with server. Retrying...`);
    for (const id of ids) {
      const item = syncs[id];
      const success = await this.saveProject(id, item.name, item.data, 2, 500);
      if (success) {
        console.log(`Successfully synced pending project ${id} to server.`);
        this.clearPendingSync(id);
      }
    }
  }

  /**
   * Fetches the user's projects from the server.
   */
  static async listProjects(): Promise<any[]> {
    if (!this.isUserLoggedIn()) return [];
    
    try {
      const response = await fetch('/api/projects', {
        headers: this.getHeaders()
      });
      if (response.status === 401) {
        const { useAuthStore } = await import('../store/useAuthStore');
        useAuthStore.getState().logout();
        return [];
      }
      if (!response.ok) {
        throw new Error('Failed to fetch projects from server');
      }
      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.warn('ProjectService.listProjects server connection offline or failed, falling back to local list:', error);
      return [];
    }
  }

  /**
   * Fetches a specific project by ID.
   */
  static async loadProject(id: string): Promise<any | null> {
    if (!this.isUserLoggedIn()) return null;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        headers: this.getHeaders()
      });
      if (response.status === 401) {
        const { useAuthStore } = await import('../store/useAuthStore');
        useAuthStore.getState().logout();
        return null;
      }
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to load project from server');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(`ProjectService.loadProject(${id}) server connection offline or failed, falling back to local project state:`, error);
      return null;
    }
  }

  /**
   * Saves a project on the server with automatic retry logic.
   */
  static async saveProject(id: string, name: string, projectData: ProjectData, retries = 3, delay = 1000): Promise<boolean> {
    if (!this.isUserLoggedIn()) return false;

    let lastError: any = null;
    let isUnauthorized = false;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ id, name, data: projectData })
        });
        if (response.status === 401) {
          isUnauthorized = true;
          const { useAuthStore } = await import('../store/useAuthStore');
          useAuthStore.getState().logout();
          this.clearPendingSync(id);
          return false;
        }
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        // Successfully saved!
        this.clearPendingSync(id);
        return true;
      } catch (error) {
        lastError = error;
        if (isUnauthorized) return false;
        if (attempt < retries) {
          console.warn(`saveProject attempt ${attempt} failed. Retrying in ${delay}ms...`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }

    if (!isUnauthorized) {
      console.warn(`ProjectService.saveProject(${id}) could not sync to server. Project is safely stored locally and queued for background synchronization.`, lastError);
      this.markPendingSync(id, name, projectData);
    }
    return false;
  }

  /**
   * Deletes a project on the server.
   */
  static async deleteProject(id: string): Promise<boolean> {
    if (!this.isUserLoggedIn()) return false;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (response.status === 401) {
        const { useAuthStore } = await import('../store/useAuthStore');
        useAuthStore.getState().logout();
        return false;
      }
      if (!response.ok) {
        throw new Error('Failed to delete project on server');
      }
      return true;
    } catch (error) {
      console.warn(`ProjectService.deleteProject(${id}) server offline or failed, falling back to local storage:`, error);
      return false;
    }
  }

  /**
   * Performs full synchronization of local projects with the server projects.
   */
  static async syncLocalAndServerProjects(): Promise<void> {
    if (!this.isUserLoggedIn()) return;

    try {
      // First process any pending syncs that were queued offline
      try {
        await this.syncPendingProjects();
      } catch (e) {
        console.warn('Error syncing pending projects:', e);
      }

      // 1. Get projects list from local storage
      const localListStr = localStorage.getItem('ar_forge_project_list');
      const localProjects = localListStr ? JSON.parse(localListStr) : [];

      // 2. Get projects list from server
      const serverProjects = await this.listProjects();

      // Create maps for comparison
      const localMap = new Map(localProjects.map((p: any) => [p.id, p]));
      const serverMap = new Map(serverProjects.map((p: any) => [p.id, p]));

      // 3. For any local project not on the server, or updated more recently, upload to the server
      for (const localProj of localProjects) {
        const serverProj = serverMap.get(localProj.id);
        const shouldSave = !serverProj || (localProj.updatedAt && new Date(localProj.updatedAt).getTime() > new Date(serverProj.updated_at).getTime());

        if (shouldSave) {
          // Fetch full project data from local storage
          const localDataStr = localStorage.getItem(`ar_forge_project_${localProj.id}`);
          if (localDataStr) {
            const localData = JSON.parse(localDataStr);
            await this.saveProject(localProj.id, localProj.name, localData);
          }
        }
      }

      // 4. For any server project not in local storage or newer, download to local storage
      const updatedLocalList = [...localProjects];
      let changed = false;

      for (const serverProj of serverProjects) {
        const localProj = localMap.get(serverProj.id);
        const shouldDownload = !localProj || (serverProj.updated_at && new Date(serverProj.updated_at).getTime() > new Date((localProj as any).updatedAt || 0).getTime());

        if (shouldDownload) {
          const fullServerData = await this.loadProject(serverProj.id);
          if (fullServerData) {
            // Save to local storage
            localStorage.setItem(`ar_forge_project_${serverProj.id}`, JSON.stringify(fullServerData.data));
            
            // Update or add in local list
            const localMeta = {
              id: serverProj.id,
              name: serverProj.name,
              createdAt: serverProj.created_at ? new Date(serverProj.created_at).getTime() : Date.now(),
              updatedAt: serverProj.updated_at ? new Date(serverProj.updated_at).getTime() : Date.now()
            };

            const index = updatedLocalList.findIndex((p: any) => p.id === serverProj.id);
            if (index >= 0) {
              updatedLocalList[index] = localMeta;
            } else {
              updatedLocalList.push(localMeta);
            }
            changed = true;
          }
        }
      }

      // 5. If changed, write back updated local project list to trigger UI update
      if (changed) {
        localStorage.setItem('ar_forge_project_list', JSON.stringify(updatedLocalList));
      }
    } catch (error) {
      console.warn('Error synchronizing projects with server:', error);
    }
  }
}
