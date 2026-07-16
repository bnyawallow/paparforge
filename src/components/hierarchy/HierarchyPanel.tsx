import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { v4 as uuidv4 } from 'uuid';
import { 
  ChevronRight, 
  ChevronDown, 
  Box, 
  Image as ImageIcon, 
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
  ArrowDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SceneObject } from '../../types';
import { PREBUILT_TEMPLATES, instantiateTemplate } from '../../utils/prebuiltTemplates';

export function HierarchyPanel({ width }: { width?: number }) {
  const { 
    objects, 
    rootObjects, 
    selectedObjectId, selectedObjectIds, 
    selectObject, 
    groupSelection,
    ungroupObject,
    moveObject, 
    updateObject,
    addObject,
    duplicateObject,
    removeObject,
    isPreviewMode
  } = useEditorStore();
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'library'>('hierarchy');
  const [filterType, setFilterType] = useState<'All' | '2D HUD' | '3D Scene'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      newObj.properties = { color: '#666666', roughness: 0.8, metalness: 0.0, opacity: 1.0, wireframe: false, textureUrl: '', textureRepeatX: 1, textureRepeatY: 1, doubleSided: true };
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
      newObj.scale = [1.6, 0.9, 1];
    } else if (type === 'audio') {
      newObj.properties = { soundUrl: '/sounds/forest_ambient.wav', autoplay: false, playing: false, loop: true, volume: 0.5 };
    } else if (type === 'light') {
      newObj.properties = { lightType: 'point', color: '#ffedd5', intensity: 3.0, distance: 12.0, decay: 1.5, angle: 0.78 };
      newObj.position = [0, 2, 0];
    } else if (type === 'button') {
      newObj.properties = { text: 'Click Me', color: '#3b82f6', textColor: '#ffffff', url: 'https://example.com' };
      newObj.scale = [1, 0.3, 0.05];
    } else if (type === 'youtube') {
      newObj.properties = { videoId: 'dQw4w9WgXcQ' };
      newObj.scale = [1.6, 0.9, 1];
    } else if (type === 'overlay2d') {
      newObj.properties = { backgroundColor: '#000000', opacity: 0.0, alignment: 'none', width: 100, widthType: '%', height: 100, heightType: '%' };
    } else if (type === 'overlayText') {
      newObj.properties = { text: 'Overlay Text', color: '#ffffff', fontSize: 24, top: 20, left: 20, alignment: 'none', width: 200, widthType: 'px', height: 40, heightType: 'px' };
    } else if (type === 'overlayButton') {
      newObj.properties = { text: 'Click Me', color: '#3b82f6', textColor: '#ffffff', url: '', top: 20, left: 20, paddingX: 16, paddingY: 8, borderRadius: 8, alignment: 'none', width: 120, widthType: 'px', height: 40, heightType: 'px' };
    } else if (type === 'overlayImage') {
      newObj.properties = { textureUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', top: 20, left: 20, width: 200, widthType: 'px', height: 200, heightType: 'px', opacity: 1.0, alignment: 'none' };
    } else if (type === 'overlayEmbed') {
      newObj.properties = { url: 'https://wikipedia.org', top: 20, left: 20, width: 400, widthType: 'px', height: 300, heightType: 'px', opacity: 1.0, alignment: 'none', borderRadius: 12, borderEnabled: true, borderColor: '#2563eb' };
    }

    const is2DOverlay = ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(type);
    const is2DUIElement = ['overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(type);
    let parentId = null;
    
    if (is2DUIElement) {
      if (selectedObjectId && objects[selectedObjectId] && ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(objects[selectedObjectId].type)) {
        parentId = selectedObjectId;
      } else {
        const activeOverlay2d = Object.values(objects).find(o => o.type === 'overlay2d');
        if (activeOverlay2d) parentId = activeOverlay2d.id;
      }
    } else if (!is2DOverlay) {
      parentId = selectedObjectId;
      if (!parentId) {
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
    setCollapsedIds(newCollapsed);
  };

  const handleExpandAll = () => {
    setCollapsedIds({});
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
    const isSubCollapsed = !!collapsedIds[`${modelId}-${indexPath}`];
    const hasSubChildren = node.children && node.children.length > 0;

    const overridenVisibility = modelObj.properties?.subObjectOverrides?.[indexPath]?.visible !== undefined
      ? modelObj.properties.subObjectOverrides[indexPath].visible
      : node.visible;

    const toggleSubCollapse = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCollapsedIds(prev => ({ ...prev, [`${modelId}-${indexPath}`]: !prev[`${modelId}-${indexPath}`] }));
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

          {/* Visibility Toggle */}
          <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
            <button
              onClick={toggleSubVisibility}
              className={cn(
                "p-0.5 rounded hover:bg-[#2A2A2A] transition-colors",
                overridenVisibility === false ? "text-orange-400" : "text-[#555] hover:text-white"
              )}
              title={overridenVisibility !== false ? "Hide sub-object" : "Show sub-object"}
            >
              {overridenVisibility !== false ? <EyeOff size={10} /> : <Eye size={10} />}
            </button>
          </div>

          {/* Static indicator if hidden */}
          {overridenVisibility === false && (
            <div className="shrink-0 group-hover:hidden ml-auto">
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

  const renderItem = (id: string, depth = 0) => {
    const obj = objects[id];
    if (!obj) return null;

    const isSelected = selectedObjectIds.includes(id);
    const isDragOver = dragOverId === id;
    const hasChildren = obj.children.length > 0;
    const isCollapsed = !!collapsedIds[id];

    let Icon = Box;
    if (obj.type === 'imageTarget') Icon = ImageIcon;
    else if (obj.type === 'group') Icon = Folder;
    else if (obj.type === 'youtube') Icon = Youtube;
    else if (obj.type === 'button') Icon = Link2;
    else if (obj.type === 'text') Icon = Type;
    else if (obj.type === 'overlay2d') Icon = FolderPlus;
    else if (obj.type === 'overlayText') Icon = Type;
    else if (obj.type === 'overlayButton') Icon = Link2;
    else if (obj.type === 'overlayImage') Icon = ImageIcon;
    else if (obj.type === 'overlayEmbed') Icon = Globe;

    const toggleCollapse = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCollapsedIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
      <div key={id}>
        <div 
          className={cn(
            "flex items-center gap-1.5 p-1.5 cursor-pointer text-[11px] font-mono select-none border-l-2 group",
            isSelected ? "bg-blue-900/30 border-blue-500 text-white font-medium" : "border-transparent text-[#999] hover:bg-[#1A1A1A] hover:text-[#CCC]",
            isDragOver && "bg-[#2A2A2A] border-blue-400"
          )}
          style={{ paddingLeft: `${depth * 10 + 6}px` }}
          onClick={(e) => {
            const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
            selectObject(id, isMulti);
          }}
          onDoubleClick={() => startEditing(id, obj.name)}
          draggable={obj.type !== 'imageTarget'}
          onDragStart={(e) => handleDragStart(e, id)}
          onDragOver={(e) => handleDragOver(e, id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, id)}
        >
          {/* Chevron Collapse Arrow */}
          <div 
            className="w-4 h-4 flex items-center justify-center hover:bg-[#2A2A2A] rounded transition-colors text-[#555] hover:text-[#AAA]"
            onClick={toggleCollapse}
          >
            {hasChildren && (isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />)}
          </div>
          
          <Icon size={13} className={cn("shrink-0", isSelected ? "text-[#FFD93D]" : "text-[#777] group-hover:text-white")} />
          
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
                {obj.name}
              </span>
              {obj.properties.visualBehaviors && obj.properties.visualBehaviors.length > 0 && (
                <div title="Contains No-Code Actions" className="ml-1.5 shrink-0">
                  <Zap size={10} className="text-yellow-400 fill-yellow-400/20" />
                </div>
              )}
            </div>
          )}

          {/* Action Overlay: Lock & Eye */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ml-auto">
            {/* Lock Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLockRecursive(id, !obj.locked);
              }}
              className={cn(
                "p-1 rounded hover:bg-[#2A2A2A] transition-colors",
                obj.locked ? "text-red-400 opacity-100" : "text-[#555] hover:text-white"
              )}
              title={obj.locked ? "Unlock object transforms and children" : "Lock object transforms and children"}
            >
              {obj.locked ? <Lock size={11} /> : <Unlock size={11} />}
            </button>

            {/* Visibility Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibilityRecursive(id, !obj.visible);
              }}
              className={cn(
                "p-1 rounded hover:bg-[#2A2A2A] transition-colors",
                !obj.visible ? "text-orange-400 opacity-100" : "text-[#555] hover:text-white"
              )}
              title={obj.visible ? "Hide object and children" : "Show object and children"}
            >
              {obj.visible ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>

            {/* Duplicate Action Button */}
            {obj.type !== 'imageTarget' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateObject(id);
                }}
                className="p-1 rounded hover:bg-[#2A2A2A] transition-colors text-[#555] hover:text-white"
                title="Duplicate object"
              >
                <Copy size={11} />
              </button>
            )}

            {/* Delete Action Button */}
            {obj.type !== 'imageTarget' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeObject(id);
                }}
                className="p-1 rounded hover:bg-[#2A2A2A] transition-colors text-[#555] hover:text-red-400"
                title="Delete object"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>

          {/* Static state icons when not hovered but active (locked or hidden) */}
          <div className="flex items-center gap-1 shrink-0 group-hover:hidden ml-auto">
            {obj.locked && <Lock size={10} className="text-red-400/80 mr-0.5" />}
            {!obj.visible && <EyeOff size={10} className="text-orange-400/80 mr-0.5" />}
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="flex flex-col">
            {obj.children.map(childId => renderItem(childId, depth + 1))}
          </div>
        )}

        {obj.type === 'model' && obj.properties?.discoveredSubObjects && !isCollapsed && (
          <div className="flex flex-col border-l border-neutral-800/40 ml-3.5 my-0.5">
            {obj.properties.discoveredSubObjects.children?.map((child: any) => 
              renderSubObjectNode(id, child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside 
      style={{ width: width ? `${width}px` : '240px' }}
      className="border-r border-[#2A2A2A] flex flex-col bg-[#141414] shrink-0 relative z-30 animate-in fade-in"
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hierarchy Toolbar (Header) */}
        <div className="p-3 border-b border-[#2A2A2A] flex justify-between items-center bg-[#111] shrink-0">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#E5E5E5] flex items-center gap-1.5">
            <Layers size={11} className="text-blue-400" />
            <span>Scene Hierarchy</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleCollapseAll}
              className="p-1 hover:bg-[#222] rounded text-[#666] hover:text-white transition-colors"
              title="Collapse All Nodes"
            >
              <FolderMinus size={13} />
            </button>
            <button 
              onClick={handleExpandAll}
              className="p-1 hover:bg-[#222] rounded text-[#666] hover:text-white transition-colors"
              title="Expand All Nodes"
            >
              <FolderPlus size={13} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-2 border-b border-[#2A2A2A] bg-[#111] flex gap-1.5 shrink-0">
          <input
            type="text"
            placeholder="Search hierarchy..."
            className="flex-1 bg-black/40 border border-[#2A2A2A] rounded px-2 py-1 text-[10px] text-white outline-none focus:border-blue-500 font-mono"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Selection context actions (Group / Ungroup) */}
        {(!isPreviewMode && (selectedObjectIds.length > 1 || (selectedObjectId && (objects[selectedObjectId]?.type === 'group' || (objects[selectedObjectId]?.type === 'overlay2d' && objects[selectedObjectId]?.name === 'HUD Group'))))) && (
          <div className="p-2 border-b border-[#2A2A2A] bg-[#1a1a1a] flex gap-1.5 shrink-0 animate-in fade-in slide-in-from-top-1 duration-100">
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
            {selectedObjectId && (objects[selectedObjectId]?.type === 'group' || (objects[selectedObjectId]?.type === 'overlay2d' && objects[selectedObjectId]?.name === 'HUD Group')) && (
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

        {/* Hierarchy List */}
        <div className="flex-1 overflow-y-auto min-h-0 py-1">
          {rootObjects.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-[10px] italic">
              No objects in scene
            </div>
          ) : (
            rootObjects
              .filter(id => {
                const obj = objects[id];
                if (!obj) return false;
                if (searchQuery) {
                  return obj.name.toLowerCase().includes(searchQuery.toLowerCase());
                }
                return true;
              })
              .map(id => renderItem(id))
          )}
        </div>

        {/* Add Component Action Sub-header */}
        <div className="p-2 border-t border-[#2A2A2A] bg-[#181818] shrink-0 relative">
          <button
            onClick={() => useEditorStore.getState().setIsAssetBrowserOpen(true)}
            disabled={isPreviewMode}
            className="flex items-center justify-between w-full px-2.5 py-1.5 bg-[#222] hover:bg-[#2A2A2A] active:bg-[#1E1E1E] border border-[#2B2B2B] hover:border-[#3C3C3C] disabled:opacity-20 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-[#E5E5E5] transition-all cursor-pointer shadow-sm select-none"
            title={isPreviewMode ? "Creator disabled in Live Preview" : "Insert 3D Mesh, Media or Interaction element"}
          >
            <span className="flex items-center gap-1.5">
              <Plus size={14} className="text-blue-500 stroke-[3]" />
              <span>Add Asset</span>
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
