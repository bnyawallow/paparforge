export type Vector3Data = [number, number, number];

export interface StateData {
  id: string;
  name: string;
  position: Vector3Data;
  rotation: Vector3Data;
  scale: Vector3Data;
}

export interface ActionData {
  id: string;
  type: 'transition' | 'playSound' | 'openUrl' | 'toast' | 'playAnimation' | 'pauseAnimation' | 'show' | 'hide' | 'loadScene' | 'playModelAnimation' | 'pauseModelAnimation';
  targetId?: string; // which object it targets (if empty, assumes self)
  transitionTargetStateId?: string; // for 'transition' action
  transitionDuration?: number; // in seconds
  transitionEasing?: string; // e.g. 'linear', 'ease-in', etc.
  name?: string; // Custom name for the action
  soundUrl?: string;
  url?: string;
  toastMessage?: string;
  targetSceneId?: string; // for 'loadScene' action
  animationClipName?: string; // for playing specific animation clip/track
}

export interface EventData {
  id: string;
  name: string;
  trigger: 
    | 'start' 
    | 'onTap' 
    | 'onPointerDown' 
    | 'onPointerUp' 
    | 'onHoverEnter' 
    | 'onHoverExit' 
    | 'onPointerMove' 
    | 'onScroll' 
    | 'onKeyDown' 
    | 'onKeyUp' 
    | 'onProximityEnter' 
    | 'onProximityExit';
  triggerKey?: string;
  proximityDistance?: number;
  actions: ActionData[];
}

export interface SceneObject {
  id: string;
  name: string;
  type: 'group' | 'box' | 'plane' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'pyramid' | 'capsule' | 'dodecahedron' | 'octahedron' | 'icosahedron' | 'knot' | 'model' | 'text' | 'button' | 'youtube' | 'imageTarget' | 'image' | 'video' | 'audio' | 'light' | 'hudCanvas' | 'hudText' | 'hudButton' | 'hudImage' | 'hudEmbed' | 'hotspot' | 'icon' | 'icon2d';
  position: Vector3Data;
  rotation: Vector3Data; // Euler angles in degrees
  scale: Vector3Data;
  visible: boolean;
  locked?: boolean;
  children: string[]; // IDs of child objects
  parentId: string | null;
  properties: Record<string, any>;
  states?: StateData[];
  events?: EventData[];
}

export type AssetType = 'model' | 'image' | 'video' | 'script' | 'audio' ;

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

export type TemplateType = 
  | 'empty' 
  | 'product_showcase' 
  | 'billboard_poster' 
  | 'automobile_showroom' 
  | 'fast_food_beverage' 
  | 'luxury_fashion' 
  | 'real_estate' 
  | 'business_card' 
  | 'educational';

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
  transformApplyMode: 'all' | 'activeStateOnly';
  setTransformApplyMode: (mode: 'all' | 'activeStateOnly') => void;

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
  replaceTargetObjectId: string | null;
  setReplaceTargetObjectId: (id: string | null) => void;
  replaceObjectAsset: (targetObjectId: string, newAsset: {
    type: string;
    name?: string;
    url?: string;
    properties?: Record<string, any>;
    iconType?: string;
    iconName?: string;
    textureUrl?: string;
    videoUrl?: string;
    soundUrl?: string;
  }) => void;
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
  collisionDebuggerEnabled: boolean;
  setCollisionDebuggerEnabled: (enabled: boolean) => void;
  editorTheme: 'dark' | 'light';
  toggleEditorTheme: () => void;
  
  // Multiple Scenes state
  activeSceneId: string;
  scenes: Record<string, { id: string; name: string; objects: Record<string, SceneObject>; rootObjects: string[] }>;
  createScene: (name: string) => void;
  loadScene: (sceneId: string) => void;
  deleteScene: (sceneId: string) => void;
  renameScene: (sceneId: string, newName: string) => void;

  // Multi-project state
  currentProjectId: string;
  isProjectOpen: boolean;
  projectsList: { id: string; name: string; createdAt: number; updatedAt: number; thumbnail?: string }[];
  
  // History tracking state
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  
  // Actions
  loadProject: (projectId: string) => void;
  openProject: (projectId: string) => void;
  closeProject: () => void;
  createProject: (name: string, templateType: TemplateType) => string;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => void;
  saveCurrentProject: () => void;
  updateProjectThumbnail: (projectId: string, thumbnailDataUrl: string) => void;
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
  duplicateSelection: () => void;
  alignSelectedObjects: (axis: 'x' | 'y' | 'z', type: 'min' | 'center' | 'max') => void;
  distributeSelectedObjects: (axis: 'x' | 'y' | 'z') => void;
  centerGroupPivot: (groupId: string) => void;
  copyObject: (id: string) => void;
  pasteObject: () => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, name: string) => void;
  setPreviewMode: (preview: boolean) => void;
  
  // Script & behavior actions
  activeStateId: string | null;
  setActiveStateId: (id: string | null) => void;
  copiedStates: StateData[] | null;
  copyObjectStates: (objectId: string) => void;
  copySingleState: (state: StateData) => void;
  pasteObjectStates: (targetObjectId: string) => void;
  setEditingScriptObjectId: (id: string | null) => void;
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
  setARVideoPlaying: (video: { title: string; url: string } | null) => void;
  
  // Transitions state
  activeTransitions: Record<string, { targetStateId: string; duration: number; easing: string; triggerTime: number; fromPos: Vector3Data; fromRot: Vector3Data; fromScl: Vector3Data }>;
  triggerStateTransition: (objectId: string, targetStateId: string, duration: number, easing: string) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
}
