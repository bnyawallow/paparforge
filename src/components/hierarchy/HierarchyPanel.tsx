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
  Plus,
  Circle,
  Play,
  Disc,
  Volume2,
  Lightbulb,
  MousePointer,
  Video
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SceneObject } from '../../types';

export function HierarchyPanel() {
  const { 
    objects, 
    rootObjects, 
    selectedObjectId, 
    selectObject, 
    moveObject, 
    updateObject,
    addObject,
    duplicateObject,
    isPreviewMode
  } = useEditorStore();
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
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
      newObj.properties = { soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-84.wav', autoplay: false, playing: false, loop: true, volume: 0.5 };
    } else if (type === 'light') {
      newObj.properties = { lightType: 'point', color: '#ffedd5', intensity: 3.0, distance: 12.0, decay: 1.5, angle: 0.78 };
      newObj.position = [0, 2, 0];
    } else if (type === 'button') {
      newObj.properties = { text: 'Click Me', color: '#3b82f6', textColor: '#ffffff', url: 'https://example.com' };
      newObj.scale = [1, 0.3, 0.05];
    } else if (type === 'youtube') {
      newObj.properties = { videoId: 'dQw4w9WgXcQ' };
      newObj.scale = [1.6, 0.9, 1];
    }

    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    newObj.parentId = parentId || null;
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
    if (draggedId && draggedId !== targetId) {
      moveObject(draggedId, targetId);
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

  const renderItem = (id: string, depth = 0) => {
    const obj = objects[id];
    if (!obj) return null;

    const isSelected = selectedObjectId === id;
    const isDragOver = dragOverId === id;
    const hasChildren = obj.children.length > 0;
    const isCollapsed = !!collapsedIds[id];

    let Icon = Box;
    if (obj.type === 'imageTarget') Icon = ImageIcon;
    else if (obj.type === 'youtube') Icon = Youtube;
    else if (obj.type === 'button') Icon = Link2;
    else if (obj.type === 'text') Icon = Type;

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
          onClick={() => selectObject(id)}
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
            <span className={cn("truncate flex-1 min-w-0 pr-1", obj.locked && "opacity-60 italic")}>
              {obj.name}
            </span>
          )}

          {/* Action Overlay: Lock & Eye */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ml-auto">
            {/* Lock Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateObject(id, { locked: !obj.locked });
              }}
              className={cn(
                "p-1 rounded hover:bg-[#2A2A2A] transition-colors",
                obj.locked ? "text-red-400 opacity-100" : "text-[#555] hover:text-white"
              )}
              title={obj.locked ? "Unlock object transforms" : "Lock object transforms"}
            >
              {obj.locked ? <Lock size={11} /> : <Unlock size={11} />}
            </button>

            {/* Visibility Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateObject(id, { visible: !obj.visible });
              }}
              className={cn(
                "p-1 rounded hover:bg-[#2A2A2A] transition-colors",
                !obj.visible ? "text-orange-400 opacity-100" : "text-[#555] hover:text-white"
              )}
              title={obj.visible ? "Hide object" : "Show object"}
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
      </div>
    );
  };

  return (
    <aside className="w-60 border-r border-[#2A2A2A] flex flex-col bg-[#141414] shrink-0">
      <div className="p-3 border-b border-[#2A2A2A] flex justify-between items-center bg-[#111] shrink-0">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#666]">Hierarchy</span>
        <div className="flex items-center gap-2">
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

      {/* Add Component Action Sub-header */}
      <div className="p-2 border-b border-[#2A2A2A] bg-[#181818] shrink-0 relative">
        <button
          onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
          disabled={isPreviewMode}
          className="flex items-center justify-between w-full px-2.5 py-1.5 bg-[#222] hover:bg-[#2A2A2A] active:bg-[#1E1E1E] border border-[#2B2B2B] hover:border-[#3C3C3C] disabled:opacity-20 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-[#E5E5E5] transition-all cursor-pointer shadow-sm select-none"
          title={isPreviewMode ? "Creator disabled in Live Preview" : "Insert 3D Mesh, Media or Interaction element"}
        >
          <span className="flex items-center gap-1.5">
            <Plus size={14} className="text-blue-500 stroke-[3]" />
            <span>Add Component</span>
          </span>
          <ChevronDown size={11} className={`text-[#666] transition-transform duration-150 ${isAddDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isAddDropdownOpen && !isPreviewMode && (
          <>
            {/* Backdrop handler to close popover */}
            <div className="fixed inset-0 z-40" onClick={() => setIsAddDropdownOpen(false)} />
            <div className="absolute top-11 left-2 w-[280px] bg-[#121212]/95 border border-[#262626] rounded-xl shadow-2xl p-3 z-50 flex flex-col gap-3.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 select-none">
              
              {/* Popover Header */}
              <div className="flex items-center justify-between border-b border-[#222] pb-1.5">
                <span className="text-[9px] uppercase font-black tracking-wider text-[#666]">Asset Library</span>
                <span className="text-[8px] font-mono text-blue-400 bg-blue-500/15 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold uppercase">14 Nodes</span>
              </div>

              {/* Group 1: 3D Primitives */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500/60 rounded-full"></span>
                  3D Geometries
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => { handleAddObject('box'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-[#3b82f6]/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add cube with standard/textured materials"
                  >
                    <Box size={13} className="text-blue-400 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Cube</span>
                  </button>

                  <button
                    onClick={() => { handleAddObject('sphere'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-[#6366f1]/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add sphere geometry"
                  >
                    <Circle size={13} className="text-indigo-400 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Sphere</span>
                  </button>

                  <button
                    onClick={() => { handleAddObject('cylinder'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-[#14b8a6]/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add cylinder geometry"
                  >
                    <Box size={13} className="text-teal-400 rotate-45 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Cylinder</span>
                  </button>

                  <button
                    onClick={() => { handleAddObject('cone'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-[#06b6d4]/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add cone geometry"
                  >
                    <Play size={12} className="text-cyan-400 -rotate-90 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Cone</span>
                  </button>

                  <button
                    onClick={() => { handleAddObject('torus'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-[#d946ef]/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add torus (donut) geometry"
                  >
                    <Disc size={13} className="text-fuchsia-400 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Torus</span>
                  </button>

                  <button
                    onClick={() => { handleAddObject('plane'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-[#8b5cf6]/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add plane billboard"
                  >
                    <Box size={13} className="text-violet-400 scale-y-[0.35] group-hover:scale-y-[0.4] group-hover:scale-x-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Plane</span>
                  </button>
                </div>
              </div>

              {/* Group 2: Multimedia */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-fuchsia-500/60 rounded-full"></span>
                  Multimedia HUD
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => { handleAddObject('text'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-pink-500/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add 3D billboard text Node"
                  >
                    <Type size={13} className="text-pink-400 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">3D Text</span>
                  </button>

                  <button
                    onClick={() => { handleAddObject('image'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-emerald-500/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add flat textured image billboard"
                  >
                    <ImageIcon size={13} className="text-emerald-400 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Image</span>
                  </button>

                  <button
                    onClick={() => { handleAddObject('video'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-orange-500/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add 3D plane with running video texture"
                  >
                    <Video size={13} className="text-orange-400 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Video</span>
                  </button>

                  <button
                    onClick={() => { handleAddObject('audio'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-rose-500/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add ambient sound emitter Node"
                  >
                    <Volume2 size={13} className="text-rose-400 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Audio</span>
                  </button>

                  <button
                    onClick={() => { handleAddObject('youtube'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-red-500/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add virtual curved YouTube video display"
                  >
                    <Youtube size={13} className="text-red-500 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">YouTube</span>
                  </button>
                </div>
              </div>

              {/* Group 3: Logic & Interaction */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-yellow-500/60 rounded-full"></span>
                  Interaction & Logic
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => { handleAddObject('button'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-amber-500/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add clickable AR button with custom links"
                  >
                    <MousePointer size={13} className="text-amber-400 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Button</span>
                  </button>

                  <button
                    onClick={() => { handleAddObject('light'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-yellow-500/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add custom light source (point, spot, directional)"
                  >
                    <Lightbulb size={13} className="text-yellow-400 group-hover:scale-110 transition-transform duration-100 animate-pulse" style={{ animationDuration: '3s' }} />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Light</span>
                  </button>

                  <button
                    onClick={() => { handleAddObject('group'); setIsAddDropdownOpen(false); }}
                    className="flex flex-col items-center justify-center py-1.5 px-0.5 bg-[#1A1A1A] hover:bg-[#222] hover:border-gray-500/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
                    title="Add logic folder to group other entities"
                  >
                    <FolderPlus size={13} className="text-gray-400 group-hover:scale-110 transition-transform duration-100" />
                    <span className="text-[8px] font-semibold text-gray-400 group-hover:text-white mt-1">Group</span>
                  </button>
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-1">
        {rootObjects.map(id => renderItem(id))}
      </div>
    </aside>
  );
}
