export type Vector3Data = [number, number, number];

export interface SceneObject {
  id: string;
  name: string;
  type: 'group' | 'box' | 'plane' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'model' | 'text' | 'button' | 'youtube' | 'imageTarget' | 'image' | 'video' | 'audio' | 'light';
  position: Vector3Data;
  rotation: Vector3Data; // Euler angles in degrees
  scale: Vector3Data;
  visible: boolean;
  locked?: boolean;
  children: string[]; // IDs of child objects
  parentId: string | null;
  properties: Record<string, any>;
}

export type AssetType = 'model' | 'image' | 'video' | 'script' | 'audio' | 'behavior';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
}

export interface ProjectSettings {
  projectName: string;
  imageTargetName: string | null;
  ambientColor?: string;
  ambientIntensity?: number;
  directionalColor?: string;
  directionalIntensity?: number;
  directionalPosition?: [number, number, number];
  shadowsEnabled?: boolean;
  publishedProjectId?: string;
  publishedProjectUrl?: string;
}

export interface HistorySnapshot {
  objects: Record<string, SceneObject>;
  rootObjects: string[];
  selectedObjectId: string | null;
}

export interface EditorState {
  objects: Record<string, SceneObject>;
  rootObjects: string[];
  selectedObjectId: string | null;
  selectedObjectRef: any | null;
  settings: ProjectSettings;
  transformMode: 'translate' | 'rotate' | 'scale';
  assets: Asset[];
  isPreviewMode: boolean;
  
  // Custom script & behavior state
  editingScriptObjectId: string | null;
  toasts: { id: string; message: string }[];
  arVideoPlaying: { title: string; url: string } | null;
  copiedObjectData: { rootId: string; objects: Record<string, SceneObject> } | null;
  
  // Auto-save state
  lastSavedTime: number | null;
  hasUnsavedChanges: boolean;

  // Grid and Transform Snapping
  gridSnapEnabled: boolean;
  gridSnapIncrement: number; // in meters (units)
  rotationSnapEnabled: boolean;
  rotationSnapIncrement: number; // in degrees
  setGridSnapEnabled: (enabled: boolean) => void;
  setGridSnapIncrement: (increment: number) => void;
  setRotationSnapEnabled: (enabled: boolean) => void;
  setRotationSnapIncrement: (increment: number) => void;
  
  // Multi-project state
  currentProjectId: string;
  projectsList: { id: string; name: string; createdAt: number; updatedAt: number }[];
  
  // History tracking state
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  
  // Actions
  loadProject: (projectId: string) => void;
  createProject: (name: string, templateType: 'empty' | 'business_card' | 'product_showcase' | 'educational') => string;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => void;
  saveCurrentProject: () => void;
  renameProject: (projectId: string, newName: string) => void;
  importProject: (projectJson: string) => string | null;

  addObject: (obj: SceneObject, parentId?: string) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  selectObject: (id: string | null) => void;
  updateSettings: (updates: Partial<ProjectSettings>) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  moveObject: (draggedId: string, targetId: string) => void;
  duplicateObject: (id: string) => void;
  copyObject: (id: string) => void;
  pasteObject: () => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, name: string) => void;
  setPreviewMode: (preview: boolean) => void;
  
  // Script & behavior actions
  setEditingScriptObjectId: (id: string | null) => void;
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
  setARVideoPlaying: (video: { title: string; url: string } | null) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
}
