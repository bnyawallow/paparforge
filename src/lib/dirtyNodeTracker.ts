/**
 * Dirty Node Tracking System for 3D AR Scene Graph (inspired by pascalorg/editor architecture)
 * Tracks modified transform, geometry, and material nodes to eliminate redundant matrix recalculations,
 * optimize bounding box queries, and streamline direct-manipulation snapping in the viewport.
 */

type DirtyFlag = 'transform' | 'material' | 'geometry' | 'hierarchy' | 'all';

class DirtyNodeManager {
  private dirtyNodes = new Map<string, Set<DirtyFlag>>();
  private listeners = new Set<(dirtyIds: string[]) => void>();
  private frameRequested = false;

  public markDirty(nodeId: string, flag: DirtyFlag = 'all'): void {
    if (!this.dirtyNodes.has(nodeId)) {
      this.dirtyNodes.set(nodeId, new Set());
    }
    this.dirtyNodes.get(nodeId)!.add(flag);

    if (!this.frameRequested) {
      this.frameRequested = true;
      requestAnimationFrame(() => {
        this.frameRequested = false;
        this.notifyListeners();
      });
    }
  }

  public isDirty(nodeId: string, flag?: DirtyFlag): boolean {
    const flags = this.dirtyNodes.get(nodeId);
    if (!flags) return false;
    if (!flag || flag === 'all') return flags.size > 0;
    return flags.has(flag) || flags.has('all');
  }

  public clearDirty(nodeId: string): void {
    this.dirtyNodes.delete(nodeId);
  }

  public clearAll(): void {
    this.dirtyNodes.clear();
  }

  public getDirtyNodeIds(): string[] {
    return Array.from(this.dirtyNodes.keys());
  }

  public subscribe(callback: (dirtyIds: string[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const ids = this.getDirtyNodeIds();
    this.listeners.forEach(cb => {
      try {
        cb(ids);
      } catch (e) {
        console.error('Error in dirty node listener:', e);
      }
    });
  }
}

export const DirtyNodeTracker = new DirtyNodeManager();
