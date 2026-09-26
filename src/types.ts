export type Vector3Data = [number, number, number];

export interface StateData {
  id: string;
  name: string;
  position: Vector3Data;
  rotation: Vector3Data;
  scale: Vector3Data;
  properties?: Record<string, any>;
}

export interface ActionData {
  id: string;
  type: 
    | 'transition' 
    | 'playSound' 
    | 'pauseSound'
    | 'stopSound'
    | 'setSoundVolume'
    | 'openUrl' 
    | 'toast' 
    | 'playAnimation' 
    | 'pauseAnimation' 
    | 'stopAnimation'
    | 'show' 
    | 'hide' 
    | 'toggleVisibility'
    | 'setColor'
    | 'setOpacity'
    | 'fadeIn'
    | 'fadeOut'
    | 'loadScene' 
    | 'playModelAnimation' 
    | 'pauseModelAnimation'
    | 'stopModelAnimation'
    | 'seekModelAnimation'
    | 'toggleAnimationPlayPause'
    | 'setAnimationSpeed'
    | 'youtubePlay'
    | 'youtubePause'
    | 'youtubeTogglePlay'
    | 'youtubeTogglePlayPause'
    | 'youtubeStop'
    | 'youtubeMute'
    | 'youtubeUnmute'
    | 'youtubeSetVolume'
    | 'youtubeSetQuality'
    | 'youtubeSetDisplayMode'
    | 'youtubeOpenOverlay'
    | 'youtubeCloseOverlay'
    | 'youtubeToggleOverlay'
    | 'youtubeSeekTo'
    | 'playVideo'
    | 'pauseVideo'
    | 'stopVideo'
    | 'setVideoVolume'
    | 'setVideoMuted'
    | 'seekVideo'
    | 'setTextureUrl'
    | 'setTextureOptions'
    | 'centerTexture'
    | 'toggleHideOverlap'
    | 'setHideOverlap'
    | 'triggerHaptic'
    | 'copyToClipboard'
    | 'takeScreenshot';
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
  volumeValue?: number; // 0 - 100 for youtubeSetVolume, setSoundVolume, setVideoVolume
  qualityValue?: string; // e.g. '1080p', '720p', '480p', '360p', '240p', 'auto'
  youtubeDisplayMode?: '3d' | '2d';
  textureUrl?: string;
  centerTextureValue?: boolean;
  hideOverlapValue?: boolean;
  alphaCutoffValue?: number;
  textureRepeatX?: number;
  textureRepeatY?: number;
  textureOffsetX?: number;
  textureOffsetY?: number;
  textureRotation?: number;
  colorValue?: string;
  opacityValue?: number;
  seekTime?: number;
  clipboardText?: string;
  hapticDuration?: number;
  screenshotWatermark?: string;
  screenshotIncludeTimestamp?: boolean;
  screenshotSound?: boolean;
  screenshotFlash?: boolean;
  screenshotDirectDownload?: boolean;
  screenshotDirectShare?: boolean;
  screenshotWatermarkPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export interface EventData {
  id: string;
  name: string;
  trigger: 
    // AR Target & Tracking Triggers
    | 'onImageTargetFound'
    | 'onImageTargetLost'
    | 'onFaceTargetFound'
    | 'onFaceTargetLost'
    | 'onSurfaceFound'
    | 'onSurfaceLost'
    | 'onSurfacePlaced'
    | 'onTargetFound'
    | 'onTargetLost'
    | 'onARSessionStart'
    | 'onARSessionEnd'
    // Standard Interaction & Pointer Triggers
    | 'start' 
    | 'onTap' 
    | 'onDoubleTap'
    | 'onLongPress'
    | 'onPointerDown' 
    | 'onPointerUp' 
    | 'onHoverEnter' 
    | 'onHoverExit' 
    | 'onPointerMove' 
    | 'onScroll' 
    | 'onKeyDown' 
    | 'onKeyUp' 
    | 'onProximityEnter' 
    | 'onProximityExit'
    // Media & Animation Triggers
    | 'onMediaPlay'
    | 'onMediaPause'
    | 'onMediaEnd'
    | 'onAnimationStart'
    | 'onAnimationComplete'
    | 'onVisible'
    | 'onHidden';
  triggerKey?: string;
  proximityDistance?: number;
  actions: ActionData[];
}

export interface SceneObject {
  id: string;
  name: string;
  type: 'group' | 'empty' | 'box' | 'plane' | 'circle' | 'ring' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'pyramid' | 'tetrahedron' | 'capsule' | 'dodecahedron' | 'octahedron' | 'icosahedron' | 'knot' | 'tube' | 'prism' | 'helix' | 'star' | 'dome' | 'model' | 'text' | 'button' | 'youtube' | 'imageTarget' | 'image' | 'video' | 'audio' | 'light' | 'camera' | 'web3dScene' | 'hudCanvas' | 'hudText' | 'hudButton' | 'hudImage' | 'hudEmbed' | 'hotspot' | 'icon' | 'icon2d';
  position: Vector3Data;
  rotation: Vector3Data; // Euler angles in degrees
  scale: Vector3Data;
  pivot?: Vector3Data; // Relative offset pivot point [x, y, z]
  visible: boolean;
  locked?: boolean;
  children: string[]; // IDs of child objects
  parentId: string | null;
  tags?: string[];
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
  thumbnail?: string;
  previewUrl?: string;
  sourceUrl?: string;
}

export interface ProjectSettings {
  projectName: string;
  imageTargetName: string | null;
  trackingMode?: 'image' | 'face' | 'surface' | 'world' | 'none';
  targetMode?: 'single' | 'multi';
  surfaceOrientation?: 'horizontal' | 'vertical' | 'any';
  surfaceType?: 'floor' | 'table' | 'wall' | 'any';
  surfacePlacementMethod?: 'tap' | 'reticle' | 'instant';
  surfaceReticleStyle?: 'modern_ring' | 'cyber_brackets' | 'minimal_dot' | 'crosshair';
  surfaceShowGrid?: boolean;
  surfaceGridSize?: number;
  surfaceAnchorHeight?: number;
  faceAnchor?: 'head' | 'nose' | 'forehead' | 'chin' | 'leftEye' | 'rightEye' | 'mouth';
  showFaceMesh?: boolean;
  showFaceOccluder?: boolean;
  faceMeshType?: 'sparkar' | 'robbieTemplate' | 'robbieFeminine' | 'robbieMasculine' | 'robbieTrackingMap' | 'robbieMask' | 'robbieMaskA' | 'robbieMaskB' | 'robbieStaticMesh' | 'trackingMap' | 'wireframe' | 'default' | 'custom';
  faceMeshTextureUrl?: string;
  faceOccluderType?: 'sparkarRealistic' | 'robbieRealistic' | 'default' | 'none';
  faceOccluderModelUrl?: string;
  showTrackerTextureInApp?: boolean;
  showTargetTextureOverlay3D?: boolean;
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
  isPublishDisabled?: boolean;
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
  depthSensingEnabled?: boolean;
  depthOcclusionMode?: 'auto' | 'webxr' | 'screenSpace';
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
  | 'educational'
  | 'face_filter_mask'
  | 'surface_placement';

export interface TransformCalloutState {
  active: boolean;
  objectId: string;
  objectName: string;
  mode: 'translate' | 'rotate' | 'scale';
  space?: 'local' | 'world';
  axis?: string;
  selectedCount?: number;
  x: number;
  y: number;
  z: number;
  deltaX?: number;
  deltaY?: number;
  deltaZ?: number;
  unit: string;
  isSnapped?: boolean;
  snapLabel?: string;
  timestamp?: number;
}

export interface GlobalLoadingState {
  active: boolean;
  title?: string;
  detail?: string;
  progress?: number;
  type?: 'project' | 'asset' | 'sync' | 'template';
  canDismiss?: boolean;
}

export interface EditorState {
  objects: Record<string, SceneObject>;
  rootObjects: string[];
  selectedObjectId: string | null;
  selectedObjectIds: string[];
  isMultiSelectMode: boolean;
  setMultiSelectMode: (enabled: boolean) => void;
  toggleMultiSelectMode: () => void;
  isBoxSelectToolActive?: boolean;
  setBoxSelectToolActive?: (enabled: boolean) => void;
  toggleBoxSelectTool?: () => void;
  deleteSelection: () => void;
  lastSelectedTargetId?: string | null;
  setLastSelectedTargetId?: (id: string | null) => void;
  selectedObjectRef: any | null;
  settings: ProjectSettings;
  transformMode: 'translate' | 'rotate' | 'scale';
  transformSpace: 'local' | 'world';
  transformGizmoEnabled: boolean;
  activeTransformAxis: string | null;
  setActiveTransformAxis: (axis: string | null) => void;
  lockedAxes: { x: boolean; y: boolean; z: boolean };
  toggleLockAxis: (axis: 'x' | 'y' | 'z') => void;
  setLockAxis: (axis: 'x' | 'y' | 'z', locked: boolean) => void;
  unlockAllAxes: () => void;
  transformApplyMode: 'all' | 'activeStateOnly';
  setTransformApplyMode: (mode: 'all' | 'activeStateOnly') => void;

  assets: Asset[];
  isPreviewMode: boolean;
  liveInteractionsInDesign: boolean;
  setLiveInteractionsInDesign: (enabled: boolean) => void;
  toggleLiveInteractionsInDesign: () => void;
  isDraggableDragging: boolean;
  setIsDraggableDragging: (dragging: boolean) => void;
  
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
  surfaceSnapEnabled: boolean;
  setSurfaceSnapEnabled: (enabled: boolean) => void;
  toggleSurfaceSnap: () => void;
  gridSnapEnabled: boolean;
  gridSnapIncrement: number; // in meters (units)
  rotationSnapEnabled: boolean;
  rotationSnapIncrement: number; // in degrees
  scaleSnapEnabled: boolean;
  scaleSnapIncrement: number; // multiplier increment
  scaleGridVisualEnabled: boolean;
  setGridSnapEnabled: (enabled: boolean) => void;
  setGridSnapIncrement: (increment: number) => void;
  setRotationSnapEnabled: (enabled: boolean) => void;
  setRotationSnapIncrement: (increment: number) => void;
  setScaleSnapEnabled: (enabled: boolean) => void;
  setScaleSnapIncrement: (increment: number) => void;
  setScaleGridVisualEnabled: (enabled: boolean) => void;
  snapSelectedToGround: () => void;
  snapSelectedToGrid: () => void;
  centerSelectedOnTarget: () => void;
  snapObjectToGround: (id: string) => void;
  snapObjectToGrid: (id: string) => void;
  centerObjectOnTarget: (id: string) => void;
  
  isAssetBrowserOpen: boolean;
  assetBrowserTab?: string;
  setIsAssetBrowserOpen: (open: boolean) => void;
  openAssetBrowser: (tab?: string) => void;
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
  cameraOrbitLocked: boolean;
  setCameraOrbitLocked: (locked: boolean) => void;
  toggleCameraOrbitLock: () => void;
  wireframeEnabled: boolean;
  setWireframeEnabled: (enabled: boolean) => void;
  selectedModelWireframeEnabled: boolean;
  setSelectedModelWireframeEnabled: (enabled: boolean) => void;
  visualizationMode: 'standard' | 'selectedWireframe' | 'fullWireframe';
  setVisualizationMode: (mode: 'standard' | 'selectedWireframe' | 'fullWireframe') => void;
  collisionDebuggerEnabled: boolean;
  setCollisionDebuggerEnabled: (enabled: boolean) => void;

  // Vehicle Physics & Driving Simulation State
  isDrivingActive: boolean;
  activeDrivingVehicleId: string | null;
  vehicleDrivingTelemetry: {
    speed: number;
    rpm: number;
    gear: string;
    isColliding: boolean;
    headlights: boolean;
    obstacleName?: string;
  };
  setDrivingActive: (active: boolean, vehicleId?: string | null) => void;
  toggleDrivingActive: (vehicleId?: string | null) => void;
  setVehicleDrivingTelemetry: (telemetry: Partial<{
    speed: number;
    rpm: number;
    gear: string;
    isColliding: boolean;
    headlights: boolean;
    obstacleName?: string;
  }>) => void;
  editorTheme: 'dark' | 'light';
  toggleEditorTheme: () => void;
  
  // UI Optimizer & Device Viewport Resolution state
  targetDprScale: number | 'auto';
  setTargetDprScale: (scale: number | 'auto') => void;
  shadowQualityPreset: 'off' | 'low' | 'med' | 'high' | 'ultra';
  setShadowQualityPreset: (preset: 'off' | 'low' | 'med' | 'high' | 'ultra') => void;
  uiDensityMode: 'compact' | 'balanced' | 'touch';
  setUiDensityMode: (mode: 'compact' | 'balanced' | 'touch') => void;
  deviceSimulationPreset: string | null;
  setDeviceSimulationPreset: (preset: string | null) => void;
  isUIOptimizerOpen: boolean;
  setIsUIOptimizerOpen: (open: boolean) => void;
  isOnboardingModalOpen: boolean;
  setIsOnboardingModalOpen: (open: boolean) => void;

  // Global Loading State for Projects & Assets
  globalLoading: GlobalLoadingState | null;
  setGlobalLoading: (loading: GlobalLoadingState | null) => void;
  
  // Multiple Scenes state
  activeSceneId: string;
  scenes: Record<string, { 
    id: string; 
    name: string; 
    objects: Record<string, SceneObject>; 
    rootObjects: string[];
    cameraPosition?: [number, number, number];
    cameraTarget?: [number, number, number];
    targetType?: 'image' | 'face' | 'surface' | 'world';
  }>;
  updateSceneCamera: (sceneId: string, position: [number, number, number], target: [number, number, number]) => void;
  createScene: (name: string, trackingMode?: 'image' | 'face' | 'surface' | 'world', targetMode?: 'single' | 'multi', physicalWidth?: number) => void;
  loadScene: (sceneId: string) => void;
  clearScene: () => void;
  deleteScene: (sceneId: string) => void;
  renameScene: (sceneId: string, newName: string) => void;
  sceneModalState: {
    type: 'create' | 'rename' | 'delete' | null;
    value?: string;
    sceneId?: string;
    trackingMode?: 'image' | 'face' | 'surface' | 'world';
    targetMode?: 'single' | 'multi';
    physicalWidth?: number;
  };
  setSceneModalState: (state: {
    type: 'create' | 'rename' | 'delete' | null;
    value?: string;
    sceneId?: string;
    targetMode?: 'single' | 'multi';
    physicalWidth?: number;
  }) => void;
  openCreateSceneModal: () => void;
  openRenameSceneModal: (sceneId: string, currentName: string) => void;
  openDeleteSceneModal: (sceneId: string) => void;
  closeSceneModal: () => void;

  // Mobile AR Live Test & QR Code modal state
  isQRCodeModalOpen: boolean;
  qrCodeModalProject: { id: string; name: string } | null;
  openQRCodeModal: (project?: { id: string; name: string }) => void;
  closeQRCodeModal: () => void;

  // Active transform callout feedback for 3D & mobile HUD
  activeTransformCallout: TransformCalloutState | null;
  setActiveTransformCallout: (callout: TransformCalloutState | null) => void;

  // Multi-project state
  currentProjectId: string;
  isProjectOpen: boolean;
  projectsList: { 
    id: string; 
    name: string; 
    createdAt: number; 
    updatedAt: number; 
    thumbnail?: string;
    publishedProjectId?: string;
    publishedProjectUrl?: string;
    isPublishDisabled?: boolean;
  }[];
  
  // History tracking state
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  
  // Actions
  loadProject: (projectId: string) => void;
  openProject: (projectId: string) => void;
  closeProject: () => void;
  createProject: (name: string, templateType: string, customTemplateData?: any, trackingOptions?: { trackingMode?: 'image' | 'face'; targetMode?: 'single' | 'multi' } | any) => string;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => void;
  saveCurrentProject: () => void;
  updateProjectThumbnail: (projectId: string, thumbnailDataUrl: string) => void;
  renameProject: (projectId: string, newName: string) => void;
  togglePublishStatus: (projectId: string, enabled: boolean) => Promise<boolean>;
  importProject: (projectJson: string) => string | null;
  syncProjectsWithServer: () => Promise<void>;

  addObject: (obj: SceneObject, parentId?: string) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  selectObject: (id: string | null, multi?: boolean) => void;
  selectObjects: (ids: string[]) => void;
  groupSelection: () => void;
  ungroupObject: (id: string) => void;
  ungroupSelection: () => void;
  mobileMeshOptimizationEnabled: boolean;
  setMobileMeshOptimizationEnabled: (enabled: boolean) => void;
  optimizeAllSceneMeshesForMobile: () => { count: number; drawCallsSaved: number; memorySavedMb: number };
  batchConsolidateSceneForMobile: () => { 
    consolidatedMaterials: number; 
    optimizedMeshes: number; 
    prunedObjects: number; 
    memorySavedMb: number; 
    drawCallsSaved: number 
  };
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;
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
  previewSnapshotObjects?: Record<string, SceneObject> | null;
  
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
  
  // Template actions
  applyTemplate: (templateType: TemplateType) => void;

  // History actions
  undo: () => void;
  redo: () => void;
}
