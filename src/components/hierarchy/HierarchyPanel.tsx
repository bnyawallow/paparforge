import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useMarkerValidation } from '../../hooks/useMarkerValidation';
import { DEFAULT_ART_POSTER_TEXTURE } from '../../lib/arTargetTexture';
import { v4 as uuidv4 } from 'uuid';
import { 
  ChevronRight, 
  ChevronDown, 
  Box, 
  Image as ImageIcon, 
  Smile,
  Link2, 
  Type, 
  Youtube,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  FolderMinus,
  FolderPlus,
  Folder,
  Plus,
  Circle,
  Play,
  Disc,
  Volume2,
  Lightbulb,
  MousePointer,
  Video,
  Globe,
  Sparkles, Zap,
  LayoutGrid,
  Layers,
  ArrowRight,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Columns,
  Rows,
  AlertTriangle,
  Radio,
  Maximize,
  AlignCenter,
  Check,
  AlignLeft,
  Search,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SceneObject } from '../../types';
import { PREBUILT_TEMPLATES, instantiateTemplate } from '../../utils/prebuiltTemplates';
import { useTheme } from '../../lib/theme';
import { useScrollMemory } from '../../lib/scrollMemory';

export function HierarchyPanel({ width, onClose, hideHeader = false }: { width?: number; onClose?: () => void; hideHeader?: boolean }) {
  const t = useTheme();
  const hierarchyScroll = useScrollMemory<HTMLDivElement>('hierarchy_tree_scroll');
  const { 
    objects, 
    rootObjects, 
    selectedObjectId, selectedObjectIds, 
    selectObject, 
    isMultiSelectMode,
    setMultiSelectMode,
    toggleMultiSelectMode,
    deleteSelection,
    groupSelection,
    duplicateSelection,
    ungroupObject,
    moveObject, 
    updateObject,
    addObject,
    duplicateObject,
    removeObject,
    isPreviewMode,
    settings,
    updateSettings,
    scenes,
    activeSceneId,
    loadScene,
    openCreateSceneModal,
    openRenameSceneModal,
    openDeleteSceneModal
  } = useEditorStore();
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);
  const pointerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent, targetId: string) => {
    if (objects[targetId]?.type === 'imageTarget') return; // Image targets are non-selectable
    isLongPressTriggeredRef.current = false;
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setMultiSelectMode(true);
      selectObject(targetId, true);
      useEditorStore.getState().addToast('Multi-select mode activated');
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 30, 40]);
        }
      } catch (_) {}
    }, 450);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (longPressTimerRef.current) {
      const dx = Math.abs(e.clientX - pointerStartPosRef.current.x);
      const dy = Math.abs(e.clientY - pointerStartPosRef.current.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'library'>('hierarchy');
  const [filterType, setFilterType] = useState<'All' | '2D HUD' | '3D Scene'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const handleAddTarget = (type: 'image' | 'face') => {
    if (isPreviewMode) return;
    const targetId = uuidv4();
    const isFace = type === 'face';
    const newTarget: SceneObject = {
      id: targetId,
      name: 'AR Target',
      type: 'imageTarget',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: true,
      children: [],
      parentId: null,
      properties: {
        targetType: type,
        physicalWidth: isFace ? undefined : 0.1,
        textureUrl: isFace ? undefined : DEFAULT_ART_POSTER_TEXTURE
      }
    };
    addObject(newTarget);
    updateSettings({ trackingMode: type });
    selectObject(targetId);
    useEditorStore.getState().addToast(`Added AR Target (${isFace ? 'Face' : 'Image'}) to scene`);
  };
  const { conflictedTargetIds, switchToMultiTargetMode } = useMarkerValidation();
  const [isSceneDropdownOpen, setIsSceneDropdownOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
    objectId: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClose = () => {
      setContextMenu(null);
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const handleAddObject = (type: SceneObject['type']) => {
    if (isPreviewMode) return;
    const newObj: SceneObject = {
      id: uuidv4(),
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: null,
      properties: {}
    };

    if (type === 'box') {
      newObj.properties = { color: '#ffffff', roughness: 0.5, metalness: 0.1, opacity: 1.0, wireframe: false, textureUrl: '', textureRepeatX: 1, textureRepeatY: 1 };
    } else if (type === 'sphere') {
      newObj.properties = { color: '#ffffff', roughness: 0.4, metalness: 0.1, opacity: 1.0, wireframe: false, textureUrl: '', textureRepeatX: 1, textureRepeatY: 1 };
    } else if (type === 'plane') {
      newObj.properties = { color: '#666666', roughness: 0.8, metalness: 0.0, opacity: 1.0, wireframe: false, textureUrl: '', hideOverlap: false, alphaCutoff: 0.5, centerTexture: true, textureRepeatX: 1, textureRepeatY: 1, doubleSided: true };
    } else if (type === 'circle') {
      newObj.properties = { color: '#ec4899', roughness: 0.5, metalness: 0.1, opacity: 1.0, wireframe: false, radius: 0.5, segments: 64, textureUrl: '', hideOverlap: false, alphaCutoff: 0.5, centerTexture: true, textureRepeatX: 1, textureRepeatY: 1, doubleSided: true };
    } else if (type === 'cylinder') {
      newObj.properties = { color: '#ffffff', roughness: 0.5, metalness: 0.2, opacity: 1.0, wireframe: false, textureUrl: '', textureRepeatX: 1, textureRepeatY: 1 };
    } else if (type === 'cone') {
      newObj.properties = { color: '#ffffff', roughness: 0.5, metalness: 0.2, opacity: 1.0, wireframe: false, textureUrl: '', textureRepeatX: 1, textureRepeatY: 1 };
    } else if (type === 'torus') {
      newObj.properties = { color: '#3b82f6', roughness: 0.3, metalness: 0.4, opacity: 1.0, wireframe: false, textureUrl: '', textureRepeatX: 1, textureRepeatY: 1 };
    } else if (type === 'text') {
      newObj.properties = { text: 'Hello AR', color: '#ffffff', fontSize: 0.25, outlineColor: '#000000', outlineWidth: 0.01, outlineOpacity: 1.0, maxWidth: 4.0, textAlign: 'center' };
    } else if (type === 'image') {
      newObj.properties = { textureUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', opacity: 1.0, doubleSided: true };
    } else if (type === 'video') {
      newObj.properties = { videoUrl: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05c5c839d39e7fa17b4474775836a0c&profile_id=139&oauth2_token_id=57447761', playing: true, loop: true, muted: true, volume: 0.5 };
      newObj.position = [0, 0, 0.05];
      newObj.rotation = [Math.PI / 2, 0, 0];
      newObj.scale = [1.6, 0.9, 1];
    } else if (type === 'audio') {
      newObj.properties = { soundUrl: '/sounds/forest_ambient.wav', autoplay: true, playing: true, loop: true, volume: 0.5 };
    } else if (type === 'light') {
      newObj.properties = { lightType: 'point', color: '#ffedd5', intensity: 3.0, distance: 12.0, decay: 1.5, angle: 0.78, castShadow: true };
      newObj.position = [0, 2, 1];
    } else if (type === 'camera') {
      newObj.properties = { fov: 60, near: 0.1, far: 1000, cameraType: 'perspective', active: true, showPreview: true, aspectRatio: '16:9' };
      newObj.position = [0, 1.5, 3];
      newObj.rotation = [-15, 0, 0];
    } else if (type === 'web3dScene') {
      newObj.properties = { url: 'https://threejs.org/examples/webgl_geometry_shapes.html', width: 1.6, height: 0.9, displayMode: '3d', transparentBg: false, interactive: true, title: 'External Web 3D Scene' };
      newObj.position = [0, 0, 0.05];
      newObj.rotation = [Math.PI / 2, 0, 0];
      newObj.scale = [1, 1, 1];
    } else if (type === 'button') {
      newObj.properties = { text: 'Click Me', color: '#3b82f6', textColor: '#ffffff', url: 'https://example.com' };
      newObj.scale = [1, 0.3, 0.05];
    } else if (type === 'youtube') {
      newObj.properties = { videoId: 'dQw4w9WgXcQ', resolution: '240p' };
      newObj.position = [0, 0, 0.05];
      newObj.rotation = [0, 0, 0];
      newObj.scale = [1.6, 0.9, 1];
    } else if (type === 'hudCanvas') {
      newObj.properties = { 
        backgroundColor: '#000000', 
        opacity: 0.0, 
        alignment: 'center', 
        width: 100, 
        widthType: '%', 
        height: 100, 
        heightType: '%', 
        offsetX: 0, 
        offsetY: 0,
        layoutMode: 'column',
        layoutPadding: 16,
        layoutGap: 8,
        layoutAlignItems: 'center',
        layoutJustifyContent: 'center',
        layoutWrap: 'nowrap'
      };
    } else if (type === 'hudText') {
      newObj.properties = { text: 'HUD Text', color: '#ffffff', fontSize: 24, top: 0, left: 0, alignment: 'center', width: 200, widthType: 'px', height: 40, heightType: 'px', offsetX: 0, offsetY: 0 };
    } else if (type === 'hudButton') {
      newObj.properties = { text: 'Click Me', color: '#3b82f6', textColor: '#ffffff', url: '', top: 0, left: 0, paddingX: 16, paddingY: 8, borderRadius: 8, alignment: 'center', width: 120, widthType: 'px', height: 40, heightType: 'px', offsetX: 0, offsetY: 0 };
    } else if (type === 'hudImage') {
      newObj.properties = { textureUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', top: 0, left: 0, width: 200, widthType: 'px', height: 200, heightType: 'px', opacity: 1.0, alignment: 'center', offsetX: 0, offsetY: 0 };
    } else if (type === 'hudEmbed') {
      newObj.properties = { url: 'https://wikipedia.org', top: 0, left: 0, width: 400, widthType: 'px', height: 300, heightType: 'px', opacity: 1.0, alignment: 'center', borderRadius: 12, borderEnabled: true, borderColor: '#2563eb', offsetX: 0, offsetY: 0 };
    } else if (type === 'hotspot') {
      newObj.properties = {
        title: 'Interactive Hotspot',
        description: 'Tap to view details and specs about this AR feature.',
        icon: 'Sparkles',
        beaconColor: '#06b6d4',
        action: 'show_card',
        cardButtonText: 'Learn More',
        cardButtonUrl: 'https://example.com',
      };
      newObj.position = [0, 0.5, 0];
    }

    const is2DOverlay = ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(type);
    let parentId = null;
    
    if (is2DOverlay) {
      if (selectedObjectId && objects[selectedObjectId]) {
        const selectedType = objects[selectedObjectId].type;
        if (selectedType === 'hudCanvas') {
          parentId = selectedObjectId;
        } else if (['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(selectedType)) {
          parentId = objects[selectedObjectId].parentId;
        }
      }
      
      if (!parentId) {
        const activeOverlay2d = Object.values(objects).find(o => o.type === 'hudCanvas' && !o.parentId);
        if (activeOverlay2d) parentId = activeOverlay2d.id;
      }
    } else {
      if (selectedObjectId && objects[selectedObjectId] && objects[selectedObjectId].type !== 'hudCanvas' && !['hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(objects[selectedObjectId].type)) {
        parentId = selectedObjectId;
      } else {
        const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
        if (imageTarget) parentId = imageTarget.id;
      }
    }

    newObj.parentId = parentId;
    addObject(newObj, parentId || undefined);
  };

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId) {
      if (draggedId.startsWith('template:')) {
        const templateId = draggedId.replace('template:', '');
        instantiateTemplate(templateId, targetId);
      } else if (draggedId !== targetId) {
        moveObject(draggedId, targetId);
      }
    }
  };



  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const finishEditing = () => {
    if (editingId && editValue.trim() !== '') {
      updateObject(editingId, { name: editValue.trim() });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleCollapseAll = () => {
    const newCollapsed: Record<string, boolean> = {};
    Object.keys(objects).forEach(id => {
      if (objects[id].children.length > 0) {
        newCollapsed[id] = true;
      }
    });
    updateSettings({ collapsedHierarchyIds: newCollapsed });
  };

  const handleExpandAll = () => {
    const newCollapsed: Record<string, boolean> = {};
    Object.keys(objects).forEach(id => {
      if (objects[id].children.length > 0) {
        newCollapsed[id] = false;
      }
    });
    updateSettings({ collapsedHierarchyIds: newCollapsed });
  };

  const toggleLockRecursive = (itemId: string, newLockedState: boolean) => {
    updateObject(itemId, { locked: newLockedState });
    const childIds = Object.values(objects)
      .filter((o: any) => o.parentId === itemId)
      .map((o: any) => o.id);
    childIds.forEach(childId => {
      toggleLockRecursive(childId, newLockedState);
    });
  };

  const toggleVisibilityRecursive = (itemId: string, newVisibleState: boolean) => {
    updateObject(itemId, { visible: newVisibleState });
    const childIds = Object.values(objects)
      .filter((o: any) => o.parentId === itemId)
      .map((o: any) => o.id);
    childIds.forEach(childId => {
      toggleVisibilityRecursive(childId, newVisibleState);
    });
  };

  const renderSubObjectNode = (modelId: string, node: any, depth: number): React.ReactNode => {
    if (!node) return null;

    const indexPath = node.id;
    const modelObj = objects[modelId];
    if (!modelObj) return null;

    const isSubObjectSelected = modelObj.properties?.selectedSubObjectPath === indexPath;
    const subCollapsedKey = `${modelId}-${indexPath}`;
    const isSubCollapsed = settings.collapsedHierarchyIds
      ? (settings.collapsedHierarchyIds[subCollapsedKey] ?? true)
      : true;
    const hasSubChildren = node.children && node.children.length > 0;

    const overridenVisibility = modelObj.properties?.subObjectOverrides?.[indexPath]?.visible !== undefined
      ? modelObj.properties.subObjectOverrides[indexPath].visible
      : node.visible;

    const toggleSubCollapse = (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentCollapsed = settings.collapsedHierarchyIds || {};
      const nextCollapsedState = !(currentCollapsed[subCollapsedKey] ?? true);
      updateSettings({
        collapsedHierarchyIds: {
          ...currentCollapsed,
          [subCollapsedKey]: nextCollapsedState
        }
      });
    };

    const handleSubObjectClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      selectObject(modelId);
      updateObject(modelId, {
        properties: {
          ...modelObj.properties,
          selectedSubObjectPath: indexPath
        }
      });
    };

    const toggleSubVisibility = (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentOverrides = modelObj.properties?.subObjectOverrides || {};
      const isCurrentlyVisible = overridenVisibility !== false;
      
      updateObject(modelId, {
        properties: {
          ...modelObj.properties,
          subObjectOverrides: {
            ...currentOverrides,
            [indexPath]: {
              ...currentOverrides[indexPath],
              visible: !isCurrentlyVisible
            }
          }
        }
      });
    };

    return (
      <div key={`${modelId}-${indexPath}`}>
        <div
          className={cn(
            "flex items-center gap-1.5 p-1 cursor-pointer text-[10px] font-mono select-none border-l-2 group transition-colors",
            isSubObjectSelected ? "bg-blue-950/40 border-blue-400 text-blue-200 font-medium" : "border-transparent text-gray-500 hover:bg-[#1A1A1A] hover:text-[#CCC]"
          )}
          style={{ paddingLeft: `${depth * 10 + 12}px` }}
          onClick={handleSubObjectClick}
        >
          {/* Collapse button */}
          <div
            className="w-4 h-4 flex items-center justify-center hover:bg-[#2A2A2A] rounded transition-colors text-gray-600 hover:text-gray-400"
            onClick={toggleSubCollapse}
          >
            {hasSubChildren && (isSubCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />)}
          </div>

          <Circle size={8} className={cn("shrink-0", isSubObjectSelected ? "text-blue-400" : "text-gray-600")} />

          <span className="truncate flex-1 min-w-0 pr-1 italic select-none">
            {node.name}
          </span>

          {node.materialName && (
            <span className="text-[8px] bg-neutral-800/80 text-neutral-400 px-1 py-0.5 rounded mr-1 font-sans shrink-0 max-w-[80px] truncate border border-neutral-700/30" title={`Material: ${node.materialName}`}>
              {node.materialName}
            </span>
          )}

          {/* Visibility Toggle */}
          <div className="flex items-center shrink-0 max-md:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
            <button
              onClick={toggleSubVisibility}
              className={cn(
                "p-1 md:p-0.5 rounded hover:bg-[#2A2A2A] transition-colors",
                overridenVisibility === false ? "text-orange-400" : "text-gray-400 md:text-[#555] hover:text-white"
              )}
              title={overridenVisibility !== false ? "Hide sub-object" : "Show sub-object"}
            >
              {overridenVisibility !== false ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>
          </div>

          {/* Static indicator if hidden on desktop */}
          {overridenVisibility === false && (
            <div className="hidden md:block shrink-0 group-hover:hidden ml-auto">
              <EyeOff size={9} className="text-orange-400/80 mr-0.5" />
            </div>
          )}
        </div>

        {hasSubChildren && !isSubCollapsed && (
          <div className="flex flex-col">
            {node.children.map((child: any) => renderSubObjectNode(modelId, child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const applyHUDLayoutPreset = (presetName: 'center' | 'row-spaced' | 'top-left' | 'fill', targetId: string) => {
    const obj = objects[targetId];
    if (!obj) return;

    const isCanvas = obj.type === 'hudCanvas';
    const targetCanvasId = isCanvas ? targetId : obj.parentId;
    if (!targetCanvasId) return;

    const canvasObj = objects[targetCanvasId];
    if (!canvasObj) return;

    if (presetName === 'center') {
      updateObject(targetCanvasId, {
        properties: {
          ...canvasObj.properties,
          layoutMode: 'column',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'center'
        }
      });
      useEditorStore.getState().addToast("HUD Container aligned to Center Column!");
    } else if (presetName === 'row-spaced') {
      updateObject(targetCanvasId, {
        properties: {
          ...canvasObj.properties,
          layoutMode: 'row',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'space-between'
        }
      });
      useEditorStore.getState().addToast("HUD Container aligned to Row Space-Between!");
    } else if (presetName === 'top-left') {
      updateObject(targetCanvasId, {
        properties: {
          ...canvasObj.properties,
          layoutMode: 'column',
          layoutAlignItems: 'flex-start',
          layoutJustifyContent: 'flex-start'
        }
      });
      useEditorStore.getState().addToast("HUD Container aligned to Top-Left Stack!");
    } else if (presetName === 'fill') {
      updateObject(targetCanvasId, {
        properties: {
          ...canvasObj.properties,
          layoutAlignItems: 'stretch'
        }
      });

      if (!isCanvas) {
        updateObject(targetId, {
          properties: {
            ...obj.properties,
            width: 100,
            widthType: '%',
            height: 100,
            heightType: '%'
          }
        });
        useEditorStore.getState().addToast("Child element updated to fill parent container (100% width/height)!");
      } else {
        useEditorStore.getState().addToast("HUD Container set to stretch child items!");
      }
    }
  };

  const checkMatchesSearch = (id: string, query: string): boolean => {
    const obj = objects[id];
    if (!obj) return false;
    const lowerQuery = query.toLowerCase();
    const nameMatch = obj.name.toLowerCase().includes(lowerQuery);
    const typeMatch = obj.type.toLowerCase().includes(lowerQuery);
    if (nameMatch || typeMatch) return true;
    return obj.children.some(childId => checkMatchesSearch(childId, query));
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return <span>{text}</span>;
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    return (
      <span>
        {before}
        <span className={cn(
          "px-0.5 rounded font-semibold", 
          t.isLight ? "bg-amber-100 text-amber-950" : "bg-yellow-500/25 text-yellow-300 border border-yellow-500/10"
        )}>
          {match}
        </span>
        {after}
      </span>
    );
  };

  const renderItem = (id: string, depth = 0) => {
    const obj = objects[id];
    if (!obj) return null;

    if (searchQuery && !checkMatchesSearch(id, searchQuery)) {
      return null;
    }

    const isSelected = selectedObjectIds.includes(id);
    const isDragOver = dragOverId === id;
    const hasChildren = obj.children.length > 0;
    const isCollapsed = searchQuery ? false : (settings.collapsedHierarchyIds 
      ? (settings.collapsedHierarchyIds[id] ?? false)
      : false);

    const isFaceTarget = obj.type === 'imageTarget' && (obj.properties?.targetType === 'face' || (settings.trackingMode === 'face' && !obj.properties?.targetType));

    let Icon = Box;
    if (obj.type === 'imageTarget') Icon = isFaceTarget ? Smile : ImageIcon;
    else if (obj.type === 'group') Icon = Folder;
    else if (obj.type === 'youtube') Icon = Youtube;
    else if (obj.type === 'button') Icon = Link2;
    else if (obj.type === 'text') Icon = Type;
    else if (obj.type === 'hudCanvas') Icon = FolderPlus;
    else if (obj.type === 'hudText') Icon = Type;
    else if (obj.type === 'hudButton') Icon = Link2;
    else if (obj.type === 'hudImage') Icon = ImageIcon;
    else if (obj.type === 'hudEmbed') Icon = Globe;

    const toggleCollapse = (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentCollapsed = settings.collapsedHierarchyIds || {};
      const nextCollapsedState = !(currentCollapsed[id] ?? false);
      updateSettings({
        collapsedHierarchyIds: {
          ...currentCollapsed,
          [id]: nextCollapsedState
        }
      });
    };

    return (
      <div key={id}>
        <div 
          className={cn(
            "flex items-center gap-1.5 p-1.5 min-h-[34px] cursor-pointer text-[11px] font-mono select-none border-l-2 group transition-colors",
            isSelected 
              ? (t.isLight ? "bg-blue-50 border-blue-500 text-blue-600 font-bold" : "bg-blue-900/30 border-blue-500 text-white font-medium")
              : `border-transparent ${t.isLight ? 'text-gray-600 hover:bg-gray-100 hover:text-black' : 'text-[#999] hover:bg-[#1A1A1A] hover:text-[#CCC]'}`,
            isDragOver && (t.isLight ? "bg-blue-50 border-blue-400" : "bg-[#2A2A2A] border-blue-400")
          )}
          style={{ paddingLeft: `${depth * 10 + 6}px` }}
          onClick={(e) => {
            if (isLongPressTriggeredRef.current) {
              isLongPressTriggeredRef.current = false;
              return;
            }
            if (obj.type === 'imageTarget') return;
            const isMulti = isMultiSelectMode;
            selectObject(id, isMulti);
          }}
          onPointerDown={(e) => handlePointerDown(e, id)}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onDoubleClick={() => startEditing(id, obj.name)}
          draggable={obj.type !== 'imageTarget'}
          onDragStart={(e) => handleDragStart(e, id)}
          onDragOver={(e) => handleDragOver(e, id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, id)}
          onContextMenu={(e) => {
            if (isPreviewMode) return;
            const isCanvas = obj.type === 'hudCanvas';
            const isChildOfCanvas = obj.parentId && objects[obj.parentId]?.type === 'hudCanvas';
            if (isCanvas || isChildOfCanvas) {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                visible: true,
                objectId: id
              });
            }
          }}
        >
          {/* Multi-Select Checkbox Indicator */}
          {isMultiSelectMode && (
            <div 
              className={cn(
                "w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border transition-all mr-0.5",
                isSelected 
                  ? "bg-blue-600 border-blue-500 text-white shadow-xs" 
                  : (t.isLight ? "border-gray-300 bg-white" : "border-white/20 bg-black/40")
              )}
            >
              {isSelected && <Check size={10} strokeWidth={3} />}
            </div>
          )}

          {/* Chevron Collapse Arrow */}
          <div 
            className="w-4 h-4 flex items-center justify-center hover:bg-[#2A2A2A] rounded transition-colors text-[#555] hover:text-[#AAA] shrink-0"
            onClick={toggleCollapse}
          >
            {hasChildren && (isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />)}
          </div>
          
          <Icon 
            size={13} 
            className={cn(
              "shrink-0", 
              isSelected 
                ? "text-[#FFD93D]" 
                : isFaceTarget 
                  ? "text-purple-400 font-bold" 
                  : obj.type === 'imageTarget' 
                    ? "text-blue-400 font-bold" 
                    : "text-[#777] group-hover:text-white"
            )} 
          />
          
          {editingId === id ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={finishEditing}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-black text-white border border-blue-500 rounded px-1 py-0.5 outline-none font-mono text-[10px]"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex-1 min-w-0 flex items-center pr-1 overflow-hidden">
              <span className={cn("truncate", obj.locked && "opacity-60 italic")}>
                {highlightText(obj.name, searchQuery)}
              </span>
              {conflictedTargetIds.includes(id) && (
                <span 
                  className="ml-1.5 px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 animate-pulse shrink-0"
                  title="AR Tracking Marker Conflict Detected! Click to inspect."
                >
                  <AlertTriangle size={10} />
                  <span className="text-[8px] font-bold uppercase tracking-wider hidden sm:inline">Conflict</span>
                </span>
              )}
              {obj.events && obj.events.length > 0 && (() => {
                const behaviors = obj.events || [];
                let hasAudio = false;
                let hasVisibility = false;
                let hasAnimation = false;
                let hasInteraction = false;

                behaviors.forEach((b: any) => {
                  const act = b.action;
                  if (act === 'playSound') {
                    hasAudio = true;
                  } else if (act === 'toggleVisibility' || act === 'setVisibility') {
                    hasVisibility = true;
                  } else if (['playModelAnimation', 'pauseModelAnimation', 'spin', 'startBehavior', 'scaleUp', 'scaleDown', 'transform'].includes(act)) {
                    hasAnimation = true;
                  } else {
                    hasInteraction = true;
                  }
                });

                let iconColorClass = "text-yellow-400 fill-yellow-400/20";
                let iconTitle = "Contains No-Code Actions";

                if (hasAudio && hasVisibility) {
                  iconColorClass = "text-purple-400 fill-purple-400/20";
                  iconTitle = "Contains Audio & Visibility Actions";
                } else if (hasVisibility) {
                  iconColorClass = "text-blue-400 fill-blue-400/20";
                  iconTitle = "Contains Visibility Actions";
                } else if (hasAudio) {
                  iconColorClass = "text-green-400 fill-green-400/20";
                  iconTitle = "Contains Audio Actions";
                } else if (hasAnimation) {
                  iconColorClass = "text-emerald-400 fill-emerald-400/20";
                  iconTitle = "Contains Animation Actions";
                } else if (hasInteraction) {
                  iconColorClass = "text-cyan-400 fill-cyan-400/20";
                  iconTitle = "Contains Interaction Actions";
                }

                return (
                  <div title={iconTitle} className="ml-1.5 shrink-0">
                    <Zap size={10} className={cn("fill-current", iconColorClass)} />
                  </div>
                );
              })()}
            </div>
          )}

          {/* Action Overlay: Lock & Eye & Operations */}
          <div className="flex items-center gap-0.5 md:gap-1 shrink-0 max-md:opacity-100 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ml-auto">
            {/* Lock Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLockRecursive(id, !obj.locked);
              }}
              className={cn(
                "p-1.5 md:p-1 rounded-md active:scale-90 transition-all flex items-center justify-center cursor-pointer",
                obj.locked 
                  ? "text-red-400 bg-red-950/40 md:bg-transparent" 
                  : "text-gray-400 md:text-[#666] hover:text-white"
              )}
              title={obj.locked ? "Unlock object transforms and children" : "Lock object transforms and children"}
            >
              {obj.locked ? <Lock size={12} className="md:w-3 md:h-3" /> : <Unlock size={12} className="md:w-3 md:h-3" />}
            </button>

            {/* Visibility Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibilityRecursive(id, !obj.visible);
              }}
              className={cn(
                "p-1.5 md:p-1 rounded-md active:scale-90 transition-all flex items-center justify-center cursor-pointer",
                !obj.visible 
                  ? "text-orange-400 bg-orange-950/40 md:bg-transparent" 
                  : "text-gray-400 md:text-[#666] hover:text-white"
              )}
              title={obj.visible ? "Hide object and children" : "Show object and children"}
            >
              {obj.visible ? <EyeOff size={12} className="md:w-3 md:h-3" /> : <Eye size={12} className="md:w-3 md:h-3" />}
            </button>

            {/* Duplicate Action Button */}
            {obj.type !== 'imageTarget' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateObject(id);
                }}
                className="p-1.5 md:p-1 rounded-md active:scale-90 transition-all text-gray-400 md:text-[#666] hover:text-white flex items-center justify-center cursor-pointer"
                title="Duplicate object"
              >
                <Copy size={12} className="md:w-3 md:h-3" />
              </button>
            )}

            {/* Delete Action Button */}
            {(obj.type !== 'imageTarget' || Object.values(objects).filter((o: any) => o.type === 'imageTarget').length > 1) ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeObject(id);
                }}
                className="p-1.5 md:p-1 rounded-md active:scale-90 transition-all text-gray-400 md:text-[#666] hover:text-red-400 flex items-center justify-center cursor-pointer"
                title="Delete object"
              >
                <Trash2 size={12} className="md:w-3 md:h-3" />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useEditorStore.getState().addToast('Scene must contain at least one AR Target');
                }}
                className="p-1.5 md:p-1 rounded-md transition-all text-[#333] hover:text-amber-400 cursor-not-allowed flex items-center justify-center"
                title="Scene must contain at least one AR Target"
              >
                <Trash2 size={12} className="md:w-3 md:h-3" />
              </button>
            )}
          </div>

          {/* Static state icons when not hovered on desktop */}
          <div className="hidden md:flex items-center gap-1 shrink-0 group-hover:hidden ml-auto">
            {obj.locked && <Lock size={10} className="text-red-400/80 mr-0.5" />}
            {!obj.visible && <EyeOff size={10} className="text-orange-400/80 mr-0.5" />}
          </div>
        </div>

        {hasChildren && !isCollapsed && obj.type !== 'imageTarget' && (
          <div className="flex flex-col">
            {obj.children.map(childId => renderItem(childId, depth + 1))}
          </div>
        )}

        {obj.type === 'imageTarget' && !isCollapsed && (
          <div className="flex flex-col">
            {obj.children.map(childId => renderItem(childId, depth + 1))}
            
            {/* Always visible Add Asset button as child of AR Target */}
            <div 
              style={{ paddingLeft: `${(depth + 1) * 12 + 16}px` }}
              className="pr-2 my-1.5"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectObject(id);
                  useEditorStore.getState().openAssetBrowser();
                  if (onClose) onClose();
                }}
                className={cn(
                  "w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-dashed transition-all cursor-pointer font-bold text-[11px] active:scale-98 shadow-sm",
                  t.isLight 
                    ? "bg-blue-50/90 hover:bg-blue-100 border-blue-400 text-blue-700" 
                    : "bg-blue-950/40 hover:bg-blue-900/50 border-blue-500/60 hover:border-blue-400 text-blue-300 hover:text-white shadow-blue-950/30"
                )}
                title="Add 3D model, image, video, text or UI asset to this AR Target"
              >
                <Plus size={13} className="shrink-0 stroke-[3]" />
                <span>+ Add Asset to Target</span>
              </button>
            </div>
          </div>
        )}

        {/* Render sub-meshes for all 3D objects including imported models */}
        {['model', 'box', 'plane', 'circle', 'sphere', 'cylinder', 'cone', 'torus', 'pyramid', 'capsule', 'dodecahedron', 'octahedron', 'icosahedron', 'knot', 'button', 'youtube', 'web3dScene', 'image', 'video'].includes(obj.type) && !isCollapsed && (
          <div className="flex flex-col border-l border-neutral-800/40 ml-3.5 my-0.5">
            {(() => {
              const subTree = obj.properties?.discoveredSubObjects || {
                id: '0',
                name: `${obj.name} Mesh`,
                type: 'Mesh',
                visible: obj.visible !== false,
                materialName: obj.properties?.materialName || `${obj.name} Material`
              };
              if (subTree.children && subTree.children.length > 0) {
                return subTree.children.map((child: any) => renderSubObjectNode(id, child, depth + 1));
              }
              return renderSubObjectNode(id, subTree, depth + 1);
            })()}
          </div>
        )}
      </div>
    );
  };

  const countMatches = (id: string): number => {
    let count = 0;
    const obj = objects[id];
    if (!obj) return 0;
    const lowerQuery = searchQuery.toLowerCase();
    const matches = obj.name.toLowerCase().includes(lowerQuery) || obj.type.toLowerCase().includes(lowerQuery);
    if (matches) count++;
    if (obj.children) {
      obj.children.forEach(childId => {
        count += countMatches(childId);
      });
    }
    return count;
  };

  const totalMatches = searchQuery ? rootObjects.reduce((acc, id) => acc + countMatches(id), 0) : 0;

  return (
    <aside 
      style={{ width: width ? `${width}px` : '100%' }}
      className={cn(
        "border-r flex flex-col shrink-0 relative z-30 animate-in fade-in transition-colors duration-200 h-full w-full",
        t.bgPanel,
        t.border
      )}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hierarchy Toolbar (Header) */}
        {!hideHeader ? (
          <div className={cn("p-3 border-b flex justify-between items-center shrink-0 transition-colors duration-200", t.bgPanelHeader, t.border)}>
            <span className={cn("text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5", t.textHeading)}>
              <Layers size={11} className="text-blue-400" />
              <span>Scene Hierarchy</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  toggleMultiSelectMode();
                }}
                className={cn(
                  "p-1 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer",
                  isMultiSelectMode 
                    ? "bg-blue-600/25 text-blue-400 border border-blue-500/40 px-1.5 ring-1 ring-blue-500/30" 
                    : cn(t.isLight ? "hover:bg-gray-200 text-gray-500 hover:text-black px-1.5" : "hover:bg-[#222] text-[#666] hover:text-white px-1.5")
                )}
                title="Toggle multi-selection mode (select multiple without holding Shift)"
              >
                <MousePointer size={10} />
                <span>{isMultiSelectMode ? 'Multi (ON)' : 'Multi'}</span>
              </button>
              <button 
                onClick={handleCollapseAll}
                className={cn("p-1 rounded transition-colors", t.isLight ? "hover:bg-gray-200 text-gray-500 hover:text-black" : "hover:bg-[#222] text-[#666] hover:text-white")}
                title="Collapse All Nodes"
              >
                <FolderMinus size={13} />
              </button>
              <button 
                onClick={handleExpandAll}
                className={cn("p-1 rounded transition-colors", t.isLight ? "hover:bg-gray-200 text-gray-500 hover:text-black" : "hover:bg-[#222] text-[#666] hover:text-white")}
                title="Expand All Nodes"
              >
                <FolderPlus size={13} />
              </button>
              {onClose && (
                <button 
                  onClick={onClose}
                  className={cn("p-1 rounded transition-colors ml-0.5", t.isLight ? "hover:bg-gray-200 text-gray-500 hover:text-black" : "hover:bg-[#222] text-[#666] hover:text-white")}
                  title="Close / Collapse Panel"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Compact toolbar for mobile drawer */
          <div className={cn("px-3 py-1.5 border-b flex justify-between items-center shrink-0 transition-colors duration-200", t.bgPanelHeader, t.border)}>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
              <span>{rootObjects.length} root target{rootObjects.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  toggleMultiSelectMode();
                }}
                className={cn(
                  "p-1 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer",
                  isMultiSelectMode 
                    ? "bg-blue-600/25 text-blue-400 border border-blue-500/40 px-1.5 ring-1 ring-blue-500/30" 
                    : cn(t.isLight ? "hover:bg-gray-200 text-gray-500 hover:text-black px-1.5" : "hover:bg-[#222] text-[#666] hover:text-white px-1.5")
                )}
                title="Toggle multi-selection mode"
              >
                <MousePointer size={10} />
                <span>{isMultiSelectMode ? 'Multi (ON)' : 'Multi'}</span>
              </button>
              <button 
                onClick={handleCollapseAll}
                className={cn("p-1 rounded transition-colors", t.isLight ? "hover:bg-gray-200 text-gray-500 hover:text-black" : "hover:bg-[#222] text-[#666] hover:text-white")}
                title="Collapse All Nodes"
              >
                <FolderMinus size={13} />
              </button>
              <button 
                onClick={handleExpandAll}
                className={cn("p-1 rounded transition-colors", t.isLight ? "hover:bg-gray-200 text-gray-500 hover:text-black" : "hover:bg-[#222] text-[#666] hover:text-white")}
                title="Expand All Nodes"
              >
                <FolderPlus size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Scene Selector */}
        <div className={cn("px-2 py-1.5 border-b flex items-center justify-between gap-1.5 shrink-0 transition-colors duration-200", t.bgPanelHeader, t.border)}>
          <div className="flex-1 flex items-center gap-1.5 min-w-0 relative">
            <Layers size={11} className={cn("shrink-0", t.textMuted)} />
            
            <div className="relative flex-1 min-w-0">
              <button
                onClick={() => setIsSceneDropdownOpen(!isSceneDropdownOpen)}
                className={cn(
                  "w-full flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium outline-none cursor-pointer transition-all border",
                  t.bgInput,
                  "hover:opacity-90"
                )}
                title="Select Active Scene"
              >
                <span className="truncate">{scenes[activeSceneId]?.name || 'Select Scene'}</span>
                <ChevronDown size={10} className={cn("shrink-0 transition-transform text-gray-400", isSceneDropdownOpen ? "rotate-180" : "")} />
              </button>
              
              {isSceneDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsSceneDropdownOpen(false)} 
                  />
                  <div 
                    className={cn(
                      "absolute left-0 right-0 mt-1 rounded border shadow-lg z-50 py-1 max-h-48 overflow-y-auto backdrop-blur-md",
                      t.bgDropdown
                    )}
                  >
                    {scenes && Object.values(scenes).map(scene => {
                      const isSelected = scene.id === activeSceneId;
                      return (
                        <button
                          key={scene.id}
                          onClick={() => {
                            loadScene(scene.id);
                            setIsSceneDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-2 py-1 text-[10px] flex items-center justify-between transition-colors cursor-pointer",
                            isSelected 
                              ? (t.isLight ? "bg-blue-50 text-blue-600 font-semibold" : "bg-blue-600/20 text-blue-400 font-semibold")
                              : t.bgItemHover
                          )}
                        >
                          <span className="truncate">{scene.name}</span>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openCreateSceneModal();
              }}
              className={cn("p-1.5 md:p-1 rounded-md transition-all cursor-pointer border outline-none active:scale-95 flex items-center justify-center", t.bgInput, "hover:opacity-90")}
              title="Create New Scene"
            >
              <Plus size={13} className="md:w-3 md:h-3" />
            </button>
            {activeSceneId && scenes && Object.keys(scenes).length > 0 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const currentName = scenes[activeSceneId]?.name || 'Scene';
                    openRenameSceneModal(activeSceneId, currentName);
                  }}
                  className={cn("p-1.5 md:p-1 rounded-md transition-all cursor-pointer border outline-none active:scale-95 flex items-center justify-center", t.bgInput, "hover:opacity-90")}
                  title="Rename Scene"
                >
                  <Type size={13} className="md:w-3 md:h-3" />
                </button>
                {Object.keys(scenes).length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      openDeleteSceneModal(activeSceneId);
                    }}
                    className={cn(
                      "p-1.5 md:p-1 rounded-md transition-all cursor-pointer border outline-none active:scale-95 flex items-center justify-center",
                      t.isLight 
                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                        : "bg-red-950/20 text-red-400 border-red-900/30 hover:bg-red-950/40"
                    )}
                    title="Delete Scene"
                  >
                    <Trash2 size={13} className="md:w-3 md:h-3" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className={cn("p-2 border-b flex gap-1.5 shrink-0 transition-colors duration-200 relative items-center", t.bgPanelHeader, t.border)}>
          <Search size={12} className={cn("absolute left-4", t.isLight ? "text-gray-400" : "text-gray-500")} />
          <input
            type="text"
            placeholder="Search hierarchy..."
            className={cn("flex-1 rounded pl-6 py-1 text-[10px] outline-none focus:border-blue-500 font-mono transition-colors duration-200", searchQuery ? "pr-14" : "pr-6", t.bgInput)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchQuery('');
            }}
          />
          {searchQuery && (
            <>
              <div className="absolute right-8 flex items-center pointer-events-none select-none">
                <span className={cn(
                  "px-1 py-0.5 rounded-[3px] text-[8px] font-bold font-mono leading-none scale-90",
                  totalMatches > 0 
                    ? (t.isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/15 text-blue-400 border border-blue-500/10")
                    : "bg-red-500/15 text-red-400 border border-red-500/10"
                )}>
                  {totalMatches}
                </span>
              </div>
              <button 
                onClick={() => setSearchQuery('')}
                className={cn("absolute right-3.5 p-0.5 rounded-full hover:bg-gray-500/20", t.isLight ? "text-gray-500" : "text-gray-400")}
              >
                <X size={10} />
              </button>
            </>
          )}
        </div>

        {/* Prominent Quick Add Asset Button */}
        {!isPreviewMode && (
          <div className={cn("p-2 border-b flex gap-1.5 shrink-0 transition-colors duration-200", t.isLight ? "bg-blue-50/60 border-blue-100" : "bg-[#141418] border-[#222228]")}>
            <button
              onClick={() => {
                useEditorStore.getState().openAssetBrowser();
                if (onClose) onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer border border-blue-400/30"
              title="Open 3D Asset, Media & UI Library"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>+ Add Asset to Scene</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 font-mono uppercase tracking-wider ml-auto font-semibold">Library</span>
            </button>
          </div>
        )}

        {/* Selection context actions (Group / Ungroup) */}
        {(!isPreviewMode && (selectedObjectIds.length > 1 || (selectedObjectId && (objects[selectedObjectId]?.type === 'group' || objects[selectedObjectId]?.type === 'hudCanvas')))) && (
          <div className={cn("p-2 border-b flex gap-1.5 shrink-0 animate-in fade-in slide-in-from-top-1 duration-100 transition-colors duration-200", t.isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#1a1a1a] border-[#2A2A2A]')}>
            {selectedObjectIds.length > 1 && (
              <button
                onClick={() => groupSelection()}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-600/25 hover:bg-blue-600/35 border border-blue-500/35 text-blue-300 rounded text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                title="Group selected elements together"
              >
                <Folder size={11} className="shrink-0" />
                <span>Group ({selectedObjectIds.length})</span>
              </button>
            )}
            {selectedObjectId && (objects[selectedObjectId]?.type === 'group' || objects[selectedObjectId]?.type === 'hudCanvas') && (
              <button
                onClick={() => ungroupObject(selectedObjectId)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-amber-600/25 hover:bg-amber-600/35 border border-amber-500/35 text-amber-300 rounded text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                title="Dissolve group back to individual entities"
              >
                <FolderMinus size={11} className="shrink-0" />
                <span>Ungroup</span>
              </button>
            )}
          </div>
        )}

        {/* 2D HUD Layout Quick Actions */}
        {!isPreviewMode && selectedObjectId && (() => {
          const selObj = objects[selectedObjectId];
          if (!selObj) return null;
          const isCanvas = selObj.type === 'hudCanvas';
          const isCanvasChild = selObj.parentId && objects[selObj.parentId]?.type === 'hudCanvas';
          if (!isCanvas && !isCanvasChild) return null;

          return (
            <div className={cn("p-2 border-b flex flex-col gap-1.5 shrink-0 animate-in fade-in slide-in-from-top-1 duration-100 transition-colors duration-200", t.isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#131313] border-[#2A2A2A]')}>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 select-none">
                <LayoutGrid size={11} />
                <span>HUD Alignment & Fill Actions</span>
              </span>
              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <button
                  onClick={() => applyHUDLayoutPreset('center', selectedObjectId)}
                  className={cn("border border-transparent py-1 px-1.5 rounded text-left transition-all flex items-center gap-1.5 cursor-pointer", t.isLight ? "bg-white hover:bg-cyan-50 text-gray-700 hover:text-cyan-600 hover:border-cyan-200" : "bg-[#1C1C1C] hover:bg-cyan-600/10 hover:text-cyan-300 hover:border-cyan-500/25 text-gray-300")}
                  title="Align items in a centered column"
                >
                  <AlignCenter size={10} className="text-cyan-400" />
                  <span>Center Col</span>
                </button>
                <button
                  onClick={() => applyHUDLayoutPreset('row-spaced', selectedObjectId)}
                  className={cn("border border-transparent py-1 px-1.5 rounded text-left transition-all flex items-center gap-1.5 cursor-pointer", t.isLight ? "bg-white hover:bg-cyan-50 text-gray-700 hover:text-cyan-600 hover:border-cyan-200" : "bg-[#1C1C1C] hover:bg-cyan-600/10 hover:text-cyan-300 hover:border-cyan-500/25 text-gray-300")}
                  title="Align items horizontally and space them out"
                >
                  <Columns size={10} className="text-cyan-400" />
                  <span>Row Spaced</span>
                </button>
                <button
                  onClick={() => applyHUDLayoutPreset('top-left', selectedObjectId)}
                  className="bg-[#1C1C1C] hover:bg-cyan-600/10 hover:text-cyan-300 border border-transparent hover:border-cyan-500/25 py-1 px-1.5 rounded text-left transition-all flex items-center gap-1.5 cursor-pointer text-gray-300"
                  title="Align items in top-left vertical stack"
                >
                  <AlignLeft size={10} className="text-cyan-400" />
                  <span>Top-Left Stack</span>
                </button>
                <button
                  onClick={() => applyHUDLayoutPreset('fill', selectedObjectId)}
                  className="bg-[#1C1C1C] hover:bg-cyan-600/10 hover:text-cyan-300 border border-transparent hover:border-cyan-500/25 py-1 px-1.5 rounded text-left transition-all flex items-center gap-1.5 cursor-pointer text-gray-300"
                  title={isCanvas ? "Stretch items horizontally to fill container width" : "Make child stretch to fill 100% width and height"}
                >
                  <Maximize size={10} className="text-cyan-400" />
                  <span>Fill / Stretch</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Hierarchy List */}
        <div 
          ref={hierarchyScroll.ref}
          onScroll={hierarchyScroll.onScroll}
          className="flex-1 overflow-y-auto min-h-0 py-1"
        >
          {rootObjects.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-[10px] italic">
              No objects in scene
            </div>
          ) : searchQuery && !rootObjects.some(id => checkMatchesSearch(id, searchQuery)) ? (
            <div className="p-6 text-center flex flex-col items-center gap-2">
              <span className="text-gray-500 text-[10px] italic">No matches found for "{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer transition-colors shadow-sm shadow-blue-600/15"
              >
                Clear Search
              </button>
            </div>
          ) : (
            rootObjects
              .filter(id => objects[id] !== undefined)
              .map(id => renderItem(id))
          )}
        </div>

        {/* Multi-Select Action Presets & Batch Operations */}
        {selectedObjectIds.length > 1 && (
          <div className="p-2.5 border-t border-[#2A2A2A] bg-[#111114] flex flex-col gap-2 shrink-0 max-h-56 overflow-y-auto animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <Sparkles size={11} />
                <span>Selected ({selectedObjectIds.length})</span>
              </span>
              <button 
                onClick={() => selectObject(null)}
                className="text-[9px] text-gray-400 hover:text-white uppercase font-bold px-1 py-0.5 rounded cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Quick Batch Actions: Group, Clone, Delete */}
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => groupSelection()}
                className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-[10px] font-semibold border border-white/10 transition-all cursor-pointer active:scale-95"
                title="Group Selected Objects"
              >
                <FolderPlus size={11} className="text-amber-400" />
                <span>Group</span>
              </button>
              <button
                onClick={() => duplicateSelection()}
                className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-[10px] font-semibold border border-white/10 transition-all cursor-pointer active:scale-95"
                title="Duplicate Selected Objects"
              >
                <Copy size={11} className="text-cyan-400" />
                <span>Clone</span>
              </button>
              <button
                onClick={() => deleteSelection()}
                className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-red-600/15 hover:bg-red-600/25 text-red-400 hover:text-red-300 text-[10px] font-semibold border border-red-500/30 transition-all cursor-pointer active:scale-95"
                title="Delete Selected Objects"
              >
                <Trash2 size={11} />
                <span>Delete</span>
              </button>
            </div>

            {/* Behaviors Grid */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] text-[#666] font-bold uppercase tracking-wider">Animation Presets</span>
              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <button
                  onClick={() => {
                    selectedObjectIds.forEach(id => {
                      const obj = objects[id];
                      if (obj) {
                        updateObject(id, { properties: { ...obj.properties, behavior: 'spin' } });
                      }
                    });
                    useEditorStore.getState().addToast("Applied 'Spin' preset to selected objects");
                  }}
                  className="bg-[#1C1C1C] hover:bg-blue-600/10 hover:text-blue-300 border border-transparent hover:border-blue-500/25 py-1 px-1.5 rounded text-left transition-all"
                >
                  🌀 Spin Loop
                </button>
                <button
                  onClick={() => {
                    selectedObjectIds.forEach(id => {
                      const obj = objects[id];
                      if (obj) {
                        updateObject(id, { properties: { ...obj.properties, behavior: 'hover' } });
                      }
                    });
                    useEditorStore.getState().addToast("Applied 'Float' preset to selected objects");
                  }}
                  className="bg-[#1C1C1C] hover:bg-blue-600/10 hover:text-blue-300 border border-transparent hover:border-blue-500/25 py-1 px-1.5 rounded text-left transition-all"
                >
                  🎈 Float/Bob
                </button>
                <button
                  onClick={() => {
                    selectedObjectIds.forEach(id => {
                      const obj = objects[id];
                      if (obj) {
                        updateObject(id, { properties: { ...obj.properties, behavior: 'pulse' } });
                      }
                    });
                    useEditorStore.getState().addToast("Applied 'Pulse Scale' preset to selected objects");
                  }}
                  className="bg-[#1C1C1C] hover:bg-blue-600/10 hover:text-blue-300 border border-transparent hover:border-blue-500/25 py-1 px-1.5 rounded text-left transition-all"
                >
                  💓 Pulse Scale
                </button>
                <button
                  onClick={() => {
                    selectedObjectIds.forEach(id => {
                      const obj = objects[id];
                      if (obj) {
                        updateObject(id, { properties: { ...obj.properties, behavior: 'bounce' } });
                      }
                    });
                    useEditorStore.getState().addToast("Applied 'Bounce' preset to selected objects");
                  }}
                  className="bg-[#1C1C1C] hover:bg-blue-600/10 hover:text-blue-300 border border-transparent hover:border-blue-500/25 py-1 px-1.5 rounded text-left transition-all"
                >
                  🦘 Bounce Loop
                </button>
                <button
                  onClick={() => {
                    selectedObjectIds.forEach(id => {
                      const obj = objects[id];
                      if (obj) {
                        updateObject(id, { properties: { ...obj.properties, behavior: 'fade-in' } });
                      }
                    });
                    useEditorStore.getState().addToast("Applied 'Fade In' preset to selected objects");
                  }}
                  className="bg-[#1C1C1C] hover:bg-blue-600/10 hover:text-blue-300 border border-transparent hover:border-blue-500/25 py-1 px-1.5 rounded text-left transition-all"
                >
                  ✨ Fade In
                </button>
                <button
                  onClick={() => {
                    selectedObjectIds.forEach(id => {
                      const obj = objects[id];
                      if (obj) {
                        updateObject(id, { properties: { ...obj.properties, behavior: 'shake' } });
                      }
                    });
                    useEditorStore.getState().addToast("Applied 'Shake' preset to selected objects");
                  }}
                  className="bg-[#1C1C1C] hover:bg-blue-600/10 hover:text-blue-300 border border-transparent hover:border-blue-500/25 py-1 px-1.5 rounded text-left transition-all"
                >
                  📳 Shake Loop
                </button>
              </div>
            </div>

            {/* Quick Properties Block */}
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[8px] text-[#666] font-bold uppercase tracking-wider">Sound & Interaction Presets</span>
              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <button
                  onClick={() => {
                    selectedObjectIds.forEach(id => {
                      const obj = objects[id];
                      if (obj) {
                        updateObject(id, { properties: { ...obj.properties, behavior: 'play-sound', interactionSoundUrl: '/sounds/cyber_click.wav', interactionSoundVolume: 0.5 } });
                      }
                    });
                    useEditorStore.getState().addToast("Applied 'Cyber Sound' on-tap interaction to selected objects");
                  }}
                  className="bg-[#1C1C1C] hover:bg-blue-600/10 hover:text-blue-300 border border-transparent hover:border-blue-500/25 py-1 px-1.5 rounded text-left transition-all"
                >
                  🔊 Cyber Sound
                </button>
                <button
                  onClick={() => {
                    selectedObjectIds.forEach(id => {
                      const obj = objects[id];
                      if (obj) {
                        updateObject(id, { properties: { ...obj.properties, behavior: 'play-sound', interactionSoundUrl: '/sounds/success.wav', interactionSoundVolume: 0.5 } });
                      }
                    });
                    useEditorStore.getState().addToast("Applied 'Success Sound' on-tap interaction to selected objects");
                  }}
                  className="bg-[#1C1C1C] hover:bg-blue-600/10 hover:text-blue-300 border border-transparent hover:border-blue-500/25 py-1 px-1.5 rounded text-left transition-all"
                >
                  🎉 Success SFX
                </button>
                <button
                  onClick={() => {
                    selectedObjectIds.forEach(id => {
                      const obj = objects[id];
                      if (obj) {
                        updateObject(id, { properties: { ...obj.properties, behavior: '', interactionSoundUrl: undefined } });
                      }
                    });
                    useEditorStore.getState().addToast("Cleared presets on selected objects");
                  }}
                  className="bg-[#1C1C1C] text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/25 py-1 px-1.5 rounded text-left transition-all col-span-2"
                >
                  🚫 Clear All Presets
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Target Action Footer */}
        {(() => {
          const currentTrackingMode = settings.trackingMode || 'image';
          const isFaceTracking = currentTrackingMode === 'face' || Object.values(objects).some((o: any) => o?.type === 'imageTarget' && o?.properties?.targetType === 'face');
          const isSingleTargetMode = (settings.targetMode || 'single') === 'single';
          const targetCount = Object.values(objects).filter((o: any) => o && o.type === 'imageTarget').length;

          // Determine if adding target is disabled and why
          let isAddTargetDisabled = isPreviewMode;
          let disabledReason = '';

          if (isFaceTracking) {
            if (targetCount >= 1) {
              isAddTargetDisabled = true;
              disabledReason = 'Scenes with face tracking can only have a single face target.';
            }
          } else {
            if (isSingleTargetMode && targetCount >= 1) {
              isAddTargetDisabled = true;
              disabledReason = 'Single image target scene (default). Change to Multi-Target in Scene Settings to enable Add Image Target.';
            }
          }

          return (
            <div className="p-2 border-t border-[#2A2A2A] bg-[#181818] shrink-0 relative flex flex-col gap-1.5">
              {/* If in Multi-Target mode and image tracking, button directly adds Image Target */}
              {!isFaceTracking && !isSingleTargetMode ? (
                <button
                  onClick={() => {
                    if (isPreviewMode) return;
                    handleAddTarget('image');
                  }}
                  disabled={isPreviewMode}
                  className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all select-none bg-gradient-to-r from-blue-600/30 to-purple-600/30 hover:from-blue-600/50 hover:to-purple-600/50 border border-blue-500/40 hover:border-blue-400 text-white cursor-pointer shadow-sm"
                  title="Add a new Image Target to the scene"
                >
                  <div className="flex items-center gap-1.5">
                    <Plus size={14} className="text-blue-400 stroke-[3]" />
                    <span>Add Image Target</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-normal border border-blue-500/30">
                    Multi-Target
                  </span>
                </button>
              ) : (
                /* Disabled or Single Mode state */
                <button
                  onClick={() => {
                    if (isAddTargetDisabled) {
                      useEditorStore.getState().addToast(disabledReason);
                      return;
                    }
                    if (isFaceTracking) {
                      handleAddTarget('face');
                    } else {
                      handleAddTarget('image');
                    }
                  }}
                  disabled={isAddTargetDisabled}
                  className={cn(
                    "w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all select-none",
                    isAddTargetDisabled
                      ? "bg-[#222224] border border-[#333336] text-gray-500 opacity-60 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600/30 to-purple-600/30 hover:from-blue-600/50 hover:to-purple-600/50 border border-blue-500/40 hover:border-blue-400 text-white cursor-pointer shadow-sm"
                  )}
                  title={isAddTargetDisabled ? disabledReason : "Add target to scene"}
                >
                  <div className="flex items-center gap-1.5">
                    {isAddTargetDisabled ? (
                      <Lock size={13} className="text-gray-500" />
                    ) : (
                      <Plus size={14} className="text-blue-400 stroke-[3]" />
                    )}
                    <span>{isFaceTracking ? 'Add Face Target' : 'Add Image Target'}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 font-normal border border-white/5">
                    {isFaceTracking ? 'Face (1/1 Max)' : 'Single (1/1)'}
                  </span>
                </button>
              )}

              {/* Mode Status Footer & Toggle Link */}
              {!isPreviewMode && (
                <div className="flex items-center justify-between px-1 text-[10px]">
                  {isFaceTracking ? (
                    <span className="flex items-center gap-1 text-purple-400/90 font-medium">
                      <Smile size={10} className="text-purple-400" />
                      <span>Face Tracking Scene (1 Target Max)</span>
                    </span>
                  ) : isSingleTargetMode && targetCount >= 1 ? (
                    <>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Lock size={10} className="text-amber-500/70" />
                        <span>Single Target Scene</span>
                      </span>
                      <button
                        onClick={() => switchToMultiTargetMode()}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 cursor-pointer transition-colors"
                        title="Switch project to Multi-Target Mode to enable adding image targets"
                      >
                        Enable Multi-Target
                      </button>
                    </>
                  ) : (
                    <span className="flex items-center gap-1 text-blue-400/90 font-medium">
                      <Layers size={10} className="text-blue-400" />
                      <span>Multi-Target Image Scene ({targetCount} target{targetCount !== 1 ? 's' : ''})</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Floating Context Menu for HUD Alignment */}
      {contextMenu && contextMenu.visible && (
        <div 
          className="fixed bg-[#161616] border border-[#333] rounded-md shadow-2xl z-[9999] w-52 py-1 flex flex-col gap-0.5"
          style={{ 
            top: `${contextMenu.y}px`, 
            left: `${contextMenu.x}px` 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1 text-[8px] font-bold text-cyan-400 uppercase tracking-wider border-b border-white/5 mb-1 flex items-center gap-1">
            <LayoutGrid size={10} />
            <span>HUD Layout Presets</span>
          </div>
          
          <button
            onClick={() => {
              applyHUDLayoutPreset('center', contextMenu.objectId);
              setContextMenu(null);
            }}
            className="px-2.5 py-1.5 text-[10px] text-gray-300 hover:text-white hover:bg-cyan-600/20 text-left flex items-center gap-2 transition-colors cursor-pointer w-full bg-transparent border-0"
          >
            <AlignCenter size={11} className="text-cyan-400 shrink-0" />
            <span>Align: Center Column</span>
          </button>

          <button
            onClick={() => {
              applyHUDLayoutPreset('row-spaced', contextMenu.objectId);
              setContextMenu(null);
            }}
            className="px-2.5 py-1.5 text-[10px] text-gray-300 hover:text-white hover:bg-cyan-600/20 text-left flex items-center gap-2 transition-colors cursor-pointer w-full bg-transparent border-0"
          >
            <Columns size={11} className="text-cyan-400 shrink-0" />
            <span>Align: Row Space-Between</span>
          </button>

          <button
            onClick={() => {
              applyHUDLayoutPreset('top-left', contextMenu.objectId);
              setContextMenu(null);
            }}
            className="px-2.5 py-1.5 text-[10px] text-gray-300 hover:text-white hover:bg-cyan-600/20 text-left flex items-center gap-2 transition-colors cursor-pointer w-full bg-transparent border-0"
          >
            <AlignLeft size={11} className="text-cyan-400 shrink-0" />
            <span>Align: Top-Left Stack</span>
          </button>

          <button
            onClick={() => {
              applyHUDLayoutPreset('fill', contextMenu.objectId);
              setContextMenu(null);
            }}
            className="px-2.5 py-1.5 text-[10px] text-gray-300 hover:text-white hover:bg-cyan-600/20 text-left flex items-center gap-2 transition-colors cursor-pointer w-full bg-transparent border-0 border-t border-white/5 mt-0.5 pt-1.5"
          >
            <Maximize size={11} className="text-cyan-400 shrink-0" />
            <span>Fill / Stretch Container</span>
          </button>

          <button
            onClick={() => {
              const targetObj = objects[contextMenu.objectId];
              if (targetObj) {
                const canvasId = targetObj.type === 'hudCanvas' ? contextMenu.objectId : targetObj.parentId;
                if (canvasId && objects[canvasId]) {
                  const canvasObj = objects[canvasId];
                  const currentMode = canvasObj.properties.layoutMode || 'column';
                  const nextMode = currentMode === 'row' ? 'column' : 'row';
                  updateObject(canvasId, {
                    properties: {
                      ...canvasObj.properties,
                      layoutMode: nextMode
                    }
                  });
                  useEditorStore.getState().addToast(`Toggled layout direction to ${nextMode}!`);
                }
              }
              setContextMenu(null);
            }}
            className="px-2.5 py-1.5 text-[10px] text-gray-300 hover:text-white hover:bg-[#222] text-left flex items-center gap-2 transition-colors cursor-pointer w-full bg-transparent border-0 border-t border-white/5 mt-0.5 pt-1.5"
          >
            <Rows size={11} className="text-gray-400 shrink-0" />
            <span>Toggle Row/Col Direction</span>
          </button>
        </div>
      )}
    </aside>
  );
}
