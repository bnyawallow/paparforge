export type Vector3Data = [number, number, number];

export interface SceneObject {
  id: string;
  name: string;
  type: 'group' | 'box' | 'plane' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'model' | 'text' | 'button' | 'youtube' | 'imageTarget' | 'image' | 'video' | 'audio' | 'light' | 'hudCanvas' | 'hudText' | 'hudButton' | 'hudImage' | 'hudEmbed' | 'hotspot';
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
  themeFontFamily?: string;
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeBackgroundColor?: string;
  themeTextColor?: string;
  themeBorderColor?: string;
  themeBorderRadius?: number;
  themePadding?: number;
  themeGap?: number;
  themeBlur?: number;
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
  collapsedHierarchyIds?: Record<string, boolean>;
}

export interface HistorySnapshot {
  objects: Record<string, SceneObject>;
  rootObjects: string[];
  selectedObjectId: string | null;
  selectedObjectIds: string[];
}

export interface ProjectVersion {
  id: string;
  name: string;
  timestamp: number;
  snapshot: {
    objects: Record<string, SceneObject>;
    rootObjects: string[];
    settings: ProjectSettings;
    assets: Asset[];
  };
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
  transformGizmoEnabled: boolean;

  assets: Asset[];
  isPreviewMode: boolean;
  
  // Custom script & behavior state
  editingScriptObjectId: string | null;
  toasts: { id: string; message: string }[];
  arVideoPlaying: { title: string; url: string } | null;
  activeHotspotCard: { title: string; description: string; icon?: string; mediaUrl?: string; buttonText?: string; buttonUrl?: string; color?: string } | null;
  setActiveHotspotCard: (card: { title: string; description: string; icon?: string; mediaUrl?: string; buttonText?: string; buttonUrl?: string; color?: string } | null) => void;
  copiedObjectData: { rootId: string; objects: Record<string, SceneObject> } | null;
  
  // Auto-save state
  lastSavedTime: number | null;
  hasUnsavedChanges: boolean;

  // Versioning state & actions
  versions: ProjectVersion[];
  createVersionSnapshot: (name?: string) => void;
  restoreVersionSnapshot: (versionId: string) => void;
  deleteVersionSnapshot: (versionId: string) => void;

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
  hudDebugGridEnabled: boolean;
  setHudDebugGridEnabled: (enabled: boolean) => void;

  cameraType: 'perspective' | 'orthographic';
  setCameraType: (type: 'perspective' | 'orthographic') => void;
  wireframeEnabled: boolean;
  setWireframeEnabled: (enabled: boolean) => void;
  editorTheme: 'dark' | 'light';
  toggleEditorTheme: () => void;
  
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
  setTransformGizmoEnabled: (enabled: boolean) => void;
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
