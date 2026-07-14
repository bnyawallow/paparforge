export type Vector3Data = [number, number, number];

export interface SceneObject {
  id: string;
  name: string;
  type: 'group' | 'box' | 'plane' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'model' | 'text' | 'button' | 'youtube' | 'imageTarget' | 'image' | 'video' | 'audio' | 'light' | 'overlay2d' | 'overlayText' | 'overlayButton' | 'overlayImage';
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
  shadowIntensity?: number;
  shadowSoftness?: number;
  shadowResolution?: number;
  publishedProjectId?: string;
  publishedProjectUrl?: string;
  ambientSoundUrl?: string;
  lightingPreset?: 'studio' | 'daylight' | 'sunset';
  bloomEnabled?: boolean;
  bloomIntensity?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  hdrEnvironmentEnabled?: boolean;
  hdrEnvironmentType?: 'preset' | 'custom';
  hdrPreset?: 'studio' | 'apartment' | 'lobby' | 'city' | 'forest' | 'sunset' | 'warehouse' | 'park';
  hdrEnvironmentUrl?: string;
  hdrBackgroundEnabled?: boolean;
}

export interface HistorySnapshot {
  objects: Record<string, SceneObject>;
  rootObjects: string[];
  selectedObjectId: string | null;
  selectedObjectIds: string[];
}

export interface EditorState {
  objects: Record<string, SceneObject>;
  rootObjects: string[];
  selectedObjectId: string | null;
  selectedObjectIds: string[];
  selectedObjectRef: any | null;
  settings: ProjectSettings;
  transformMode: 'translate' | 'rotate' | 'scale';
  transformSpace: 'local' | 'world';

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
  
  isAssetBrowserOpen: boolean;
  setIsAssetBrowserOpen: (open: boolean) => void;
  overlayGridEnabled: boolean;
  overlayGridSize: number;
  setOverlayGridEnabled: (enabled: boolean) => void;
  setOverlayGridSize: (size: number) => void;

  cameraType: 'perspective' | 'orthographic';
  setCameraType: (type: 'perspective' | 'orthographic') => void;
  wireframeEnabled: boolean;
  setWireframeEnabled: (enabled: boolean) => void;
  
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
  selectObject: (id: string | null, multi?: boolean) => void;
  groupSelection: () => void;
  ungroupObject: (id: string) => void;
  updateSettings: (updates: Partial<ProjectSettings>) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  setTransformSpace: (space: 'local' | 'world') => void;
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
