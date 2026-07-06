import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  Trash2, 
  Play, 
  VolumeX, 
  PlusCircle, 
  Sparkles, 
  RotateCw, 
  Check, 
  Video, 
  Volume2, 
  Zap,
  HelpCircle,
  Lock,
  Unlock,
  Code,
  Plus,
  ExternalLink,
  Eye,
  EyeOff,
  Magnet,
  Sun,
  Sliders,
  Search,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Vector3Data } from '../../types';

const FONT_LIBRARY = [
  { name: 'Default (Inter)', url: '' },
  { name: 'Roboto', url: 'https://unpkg.com/@fontsource/roboto/files/roboto-latin-400-normal.woff' },
  { name: 'Open Sans', url: 'https://unpkg.com/@fontsource/open-sans/files/open-sans-latin-400-normal.woff' },
  { name: 'Montserrat', url: 'https://unpkg.com/@fontsource/montserrat/files/montserrat-latin-400-normal.woff' },
  { name: 'Playfair Display', url: 'https://unpkg.com/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff' },
  { name: 'Oswald', url: 'https://unpkg.com/@fontsource/oswald/files/oswald-latin-400-normal.woff' },
  { name: 'Space Grotesk', url: 'https://unpkg.com/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff' },
  { name: 'JetBrains Mono', url: 'https://unpkg.com/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff' },
  { name: 'Caveat', url: 'https://unpkg.com/@fontsource/caveat/files/caveat-latin-400-normal.woff' },
  { name: 'Pacifico', url: 'https://unpkg.com/@fontsource/pacifico/files/pacifico-latin-400-normal.woff' },
  { name: 'Bebas Neue', url: 'https://unpkg.com/@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff' },
  { name: 'Cinzel', url: 'https://unpkg.com/@fontsource/cinzel/files/cinzel-latin-400-normal.woff' },
  { name: 'Orbitron', url: 'https://unpkg.com/@fontsource/orbitron/files/orbitron-latin-400-normal.woff' },
  { name: 'Bangers', url: 'https://unpkg.com/@fontsource/bangers/files/bangers-latin-400-normal.woff' },
  { name: 'Righteous', url: 'https://unpkg.com/@fontsource/righteous/files/righteous-latin-400-normal.woff' },
  { name: 'Lobster', url: 'https://unpkg.com/@fontsource/lobster/files/lobster-latin-400-normal.woff' },
];

// Preset lists for easy dropdown matching
const BEHAVIOR_OPTIONS = [
  { value: '', label: 'None (Static)' },
  { value: 'spin', label: '🔄 Continuous Spin' },
  { value: 'hover', label: '🎈 Gentle Float' },
  { value: 'pulse', label: '💓 Rhythmic Pulse' },
];

const SOUND_OPTIONS = [
  { value: '', label: 'No sound attached' },
  { value: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav', label: '🎵 Cyber Click' },
  { value: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav', label: '✨ Success Chime' },
  { value: 'https://assets.mixkit.co/active_storage/sfx/1601/1601-84.wav', label: '🤖 Robot Beep' },
  { value: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-84.wav', label: '🌲 Forest Ambient' },
];

export function InspectorPanel() {
  const { 
    objects, 
    selectedObjectId, 
    updateObject, 
    removeObject, 
    editingScriptObjectId, 
    setEditingScriptObjectId,
    gridSnapEnabled,
    gridSnapIncrement,
    rotationSnapEnabled,
    rotationSnapIncrement,
    setGridSnapEnabled,
    setGridSnapIncrement,
    setRotationSnapEnabled,
    setRotationSnapIncrement,
    settings,
    updateSettings
  } = useEditorStore();

  const [fontSearch, setFontSearch] = useState('');
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);

  const handleAddBehavior = () => {
    if (!selectedObjectId || !objects[selectedObjectId]) return;
    const obj = objects[selectedObjectId];
    const behaviors = obj.properties.visualBehaviors || [];
    const newBehavior = {
      id: Math.random().toString(36).substring(2, 9),
      trigger: 'onTap',
      action: 'toast',
      toastMessage: 'Triggered Event Action!',
      url: 'https://',
      soundPreset: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav',
      targetObjectId: '',
      proximityDistance: 2.0
    };
    updateObject(selectedObjectId, {
      properties: {
        ...obj.properties,
        visualBehaviors: [...behaviors, newBehavior]
      }
    });
  };

  const handleUpdateBehavior = (id: string, updates: any) => {
    if (!selectedObjectId || !objects[selectedObjectId]) return;
    const obj = objects[selectedObjectId];
    const behaviors = obj.properties.visualBehaviors || [];
    const updated = behaviors.map((b: any) => b.id === id ? { ...b, ...updates } : b);
    updateObject(selectedObjectId, {
      properties: {
        ...obj.properties,
        visualBehaviors: updated
      }
    });
  };

  const handleRemoveBehavior = (id: string) => {
    if (!selectedObjectId || !objects[selectedObjectId]) return;
    const obj = objects[selectedObjectId];
    const behaviors = obj.properties.visualBehaviors || [];
    const updated = behaviors.filter((b: any) => b.id !== id);
    updateObject(selectedObjectId, {
      properties: {
        ...obj.properties,
        visualBehaviors: updated
      }
    });
  };

  if (!selectedObjectId || !objects[selectedObjectId]) {
    const ambientColor = settings.ambientColor || '#ffffff';
    const ambientIntensity = settings.ambientIntensity ?? 0.5;
    const directionalColor = settings.directionalColor || '#ffffff';
    const directionalIntensity = settings.directionalIntensity ?? 1.0;
    const shadowsEnabled = settings.shadowsEnabled ?? true;

    return (
      <aside className="w-72 border-l border-[#2A2A2A] bg-[#141414] flex flex-col shrink-0 overflow-y-auto">
        <div className="p-3 border-b border-[#2A2A2A] flex items-center justify-between shrink-0">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#666]">Scene Settings</span>
          <Sun size={14} className="text-yellow-500/80 animate-pulse" />
        </div>

        <div className="p-4 flex flex-col gap-6">
          {/* Project Details section */}
          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Project Configuration</span>
            
            <div className="flex flex-col gap-1 bg-[#1A1A1A] p-3 rounded border border-[#2A2A2A]">
              <label className="text-[9px] text-[#888] font-semibold uppercase tracking-wider">Active Experience Name</label>
              <input 
                type="text" 
                value={settings.projectName || 'My AR Experience'}
                onChange={(e) => updateSettings({ projectName: e.target.value })}
                className="bg-black/40 text-[11px] p-2 rounded w-full border border-[#2A2A2A] text-white focus:border-blue-500 font-medium outline-none mt-1"
                placeholder="Name your experience..."
              />
            </div>
          </div>

          {/* Global Ambient Lighting */}
          <div className="flex flex-col gap-3 border-t border-[#222] pt-4">
            <div className="flex items-center gap-1.5">
              <Sun size={12} className="text-yellow-400" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Ambient Environment Light</span>
            </div>

            <div className="flex flex-col gap-3 bg-[#1A1A1A]/50 border border-[#222] p-3 rounded-lg">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-[#666] font-medium">Ambient Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={ambientColor}
                    onChange={(e) => updateSettings({ ambientColor: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer bg-[#0A0A0A] border border-[#222]"
                  />
                  <input 
                    type="text" 
                    value={ambientColor}
                    onChange={(e) => updateSettings({ ambientColor: e.target.value })}
                    className="bg-[#0A0A0A] text-[10px] p-1.5 rounded flex-1 border border-[#222] outline-none font-mono text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#666]">Ambient Intensity</span>
                  <span className="text-yellow-400 font-mono">{ambientIntensity.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.0" 
                  max="2.0" 
                  step="0.05" 
                  value={ambientIntensity} 
                  onChange={(e) => updateSettings({ ambientIntensity: parseFloat(e.target.value) })}
                  className="accent-yellow-500 w-full h-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Key Directional Lighting */}
          <div className="flex flex-col gap-3 border-t border-[#222] pt-4">
            <div className="flex items-center gap-1.5">
              <Sliders size={12} className="text-blue-400" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Direct Key Spotlight</span>
            </div>

            <div className="flex flex-col gap-3 bg-[#1A1A1A]/50 border border-[#222] p-3 rounded-lg">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-[#666] font-medium">Sunlight Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={directionalColor}
                    onChange={(e) => updateSettings({ directionalColor: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer bg-[#0A0A0A] border border-[#222]"
                  />
                  <input 
                    type="text" 
                    value={directionalColor}
                    onChange={(e) => updateSettings({ directionalColor: e.target.value })}
                    className="bg-[#0A0A0A] text-[10px] p-1.5 rounded flex-1 border border-[#222] outline-none font-mono text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#666]">Key Light Intensity</span>
                  <span className="text-blue-400 font-mono">{directionalIntensity.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.0" 
                  max="4.0" 
                  step="0.05" 
                  value={directionalIntensity} 
                  onChange={(e) => updateSettings({ directionalIntensity: parseFloat(e.target.value) })}
                  className="accent-blue-500 w-full h-1 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] border-t border-black/20 pt-2.5">
                <span className="text-[#666]">Enable Real-Time Shadows</span>
                <input 
                  type="checkbox" 
                  checked={shadowsEnabled}
                  onChange={(e) => updateSettings({ shadowsEnabled: e.target.checked })}
                  className="accent-blue-500 cursor-pointer w-3.5 h-3.5"
                />
              </div>
            </div>
          </div>

          {/* Helpful interactive reminder */}
          <div className="border-t border-[#222] pt-4 text-center">
            <p className="text-[9px] text-gray-500 font-medium leading-relaxed max-w-[220px] mx-auto">
              Select any entity in the Scene Hierarchy tree or double-click in the Viewport to configure specific material, behavioral, or physical parameters.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const obj = objects[selectedObjectId];

  const handleVectorChange = (prop: 'position' | 'rotation' | 'scale', index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newVec = [...obj[prop]] as Vector3Data;
    newVec[index] = numValue;
    updateObject(selectedObjectId, { [prop]: newVec });
  };

  const handlePropertyChange = (key: string, value: any) => {
    updateObject(selectedObjectId, {
      properties: { ...obj.properties, [key]: value }
    });
  };

  const handleDelete = () => {
    removeObject(selectedObjectId);
  };

  const playPreviewSound = (url: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Audio playback preview failed', err));
  };

  const addInteractiveTrait = (type: 'behavior' | 'sound') => {
    if (type === 'behavior') {
      handlePropertyChange('behavior', 'spin');
    } else if (type === 'sound') {
      handlePropertyChange('soundUrl', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
      handlePropertyChange('soundName', 'Cyber Click');
    }
  };

  return (
    <aside className="w-72 border-l border-[#2A2A2A] bg-[#141414] flex flex-col shrink-0 overflow-y-auto">
      <div className="p-3 border-b border-[#2A2A2A] flex items-center justify-between shrink-0">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#666]">Inspector</span>
        {obj.type !== 'imageTarget' && (
          <button 
            onClick={handleDelete} 
            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-colors"
            title="Delete Object"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-6">
        {/* Entity Name & Type */}
        <div className="flex items-center gap-3 bg-[#1A1A1A] p-3 rounded border border-[#2A2A2A]">
          <div className="w-9 h-9 bg-black/40 rounded flex items-center justify-center border border-[#333] text-blue-400 font-mono text-base font-bold">
            {obj.type === 'imageTarget' ? '🖼️' : obj.type === 'model' ? '📦' : '◈'}
          </div>
          <div className="flex-1 min-w-0">
            <input 
              type="text" 
              value={obj.name}
              onChange={(e) => updateObject(selectedObjectId, { name: e.target.value })}
              className="bg-transparent text-xs font-bold text-white border-b border-transparent hover:border-[#333] focus:border-blue-500 outline-none w-full py-0.5"
            />
            <div className="text-[9px] text-[#666] font-mono capitalize tracking-wider mt-0.5">{obj.type} Object</div>
          </div>
        </div>

        {/* Lock / Unlock Toggle Panel */}
        <div className="flex items-center justify-between bg-[#1A1A1A]/50 p-2.5 px-3 rounded border border-[#2A2A2A] text-xs">
          <span className="text-[#888] font-medium flex items-center gap-1.5 select-none">
            {obj.locked ? (
              <>
                <Lock size={12} className="text-red-400 animate-pulse" />
                <span className="text-red-400 font-semibold text-[11px]">Transform Locked</span>
              </>
            ) : (
              <>
                <Unlock size={12} className="text-[#666]" />
                <span className="text-[11px]">Transform Unlocked</span>
              </>
            )}
          </span>
          <button
            onClick={() => updateObject(selectedObjectId, { locked: !obj.locked })}
            className={cn(
              "px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all tracking-wider border",
              obj.locked 
                ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400" 
                : "bg-[#222] border-[#333] hover:border-[#444] text-[#888] hover:text-white"
            )}
            title={obj.locked ? "Unlock transforms" : "Lock transforms to prevent accidental movement"}
          >
            {obj.locked ? "Unlock" : "Lock"}
          </button>
        </div>

        {/* Transform Component */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Transform</span>
            {obj.locked && (
              <span className="text-[9px] font-mono text-red-400/80 uppercase">Locked</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
            <span className="text-[#666] flex items-center">POS</span>
            <input type="number" step="0.1" disabled={obj.locked} value={obj.position[0]} onChange={(e) => handleVectorChange('position', 0, e.target.value)} className="bg-[#0A0A0A] p-1.5 rounded border border-[#222] text-center text-red-400 outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />
            <input type="number" step="0.1" disabled={obj.locked} value={obj.position[1]} onChange={(e) => handleVectorChange('position', 1, e.target.value)} className="bg-[#0A0A0A] p-1.5 rounded border border-[#222] text-center text-green-400 outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />
            <input type="number" step="0.1" disabled={obj.locked} value={obj.position[2]} onChange={(e) => handleVectorChange('position', 2, e.target.value)} className="bg-[#0A0A0A] p-1.5 rounded border border-[#222] text-center text-blue-400 outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />

            <span className="text-[#666] flex items-center">ROT</span>
            <input type="number" step="1" disabled={obj.locked} value={obj.rotation[0]} onChange={(e) => handleVectorChange('rotation', 0, e.target.value)} className="bg-[#0A0A0A] p-1.5 rounded border border-[#222] text-center text-white outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />
            <input type="number" step="1" disabled={obj.locked} value={obj.rotation[1]} onChange={(e) => handleVectorChange('rotation', 1, e.target.value)} className="bg-[#0A0A0A] p-1.5 rounded border border-[#222] text-center text-white outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />
            <input type="number" step="1" disabled={obj.locked} value={obj.rotation[2]} onChange={(e) => handleVectorChange('rotation', 2, e.target.value)} className="bg-[#0A0A0A] p-1.5 rounded border border-[#222] text-center text-white outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />

            <span className="text-[#666] flex items-center">SCL</span>
            <input type="number" step="0.1" disabled={obj.locked} value={obj.scale[0]} onChange={(e) => handleVectorChange('scale', 0, e.target.value)} className="bg-[#0A0A0A] p-1.5 rounded border border-[#222] text-center text-white outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />
            <input type="number" step="0.1" disabled={obj.locked} value={obj.scale[1]} onChange={(e) => handleVectorChange('scale', 1, e.target.value)} className="bg-[#0A0A0A] p-1.5 rounded border border-[#222] text-center text-white outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />
            <input type="number" step="0.1" disabled={obj.locked} value={obj.scale[2]} onChange={(e) => handleVectorChange('scale', 2, e.target.value)} className="bg-[#0A0A0A] p-1.5 rounded border border-[#222] text-center text-white outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed" />
          </div>

          {/* Snapping Configurations */}
          <div className="mt-2 bg-[#1A1A1A]/30 border border-[#222] rounded p-3 flex flex-col gap-3">
            {/* Grid Translation Snapping */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#AAA] font-semibold flex items-center gap-1.5">
                  <Magnet size={11} className={gridSnapEnabled ? "text-blue-400" : "text-[#555]"} />
                  Grid snapping
                </span>
                <button
                  onClick={() => setGridSnapEnabled(!gridSnapEnabled)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all",
                    gridSnapEnabled ? "bg-blue-600 text-white" : "bg-[#222] text-[#666] hover:text-white"
                  )}
                >
                  {gridSnapEnabled ? "ON" : "OFF"}
                </button>
              </div>
              
              {gridSnapEnabled && (
                <div className="flex items-center gap-1 mt-1">
                  {[0.05, 0.1, 0.25, 0.5, 1.0].map((inc) => (
                    <button
                      key={inc}
                      onClick={() => setGridSnapIncrement(inc)}
                      className={cn(
                        "flex-1 py-1 text-[9px] font-mono rounded transition-all border",
                        gridSnapIncrement === inc
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 font-bold"
                          : "bg-[#0C0C0C] border-transparent text-[#666] hover:text-white"
                      )}
                    >
                      {inc}m
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rotation Snapping */}
            <div className="flex flex-col gap-1.5 border-t border-[#222]/50 pt-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#AAA] font-semibold flex items-center gap-1.5">
                  <RotateCw size={11} className={rotationSnapEnabled ? "text-emerald-400" : "text-[#555]"} />
                  Rotation snapping
                </span>
                <button
                  onClick={() => setRotationSnapEnabled(!rotationSnapEnabled)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all",
                    rotationSnapEnabled ? "bg-emerald-600 text-white" : "bg-[#222] text-[#666] hover:text-white"
                  )}
                >
                  {rotationSnapEnabled ? "ON" : "OFF"}
                </button>
              </div>
              
              {rotationSnapEnabled && (
                <div className="flex items-center gap-1 mt-1">
                  {[5, 15, 30, 45, 90].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => setRotationSnapIncrement(deg)}
                      className={cn(
                        "flex-1 py-1 text-[9px] font-mono rounded transition-all border",
                        rotationSnapIncrement === deg
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-[#0C0C0C] border-transparent text-[#666] hover:text-white"
                      )}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AR Properties / Interactivity Panel */}
        <div className="flex flex-col gap-3 border-t border-[#222] pt-4">
          <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} className="text-orange-400 animate-pulse" />
            AR Interactivity Traits
          </span>

          <div className="flex flex-col gap-4">
            {/* 1. Behavior Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#666] font-medium flex items-center gap-1">
                <Zap size={10} className="text-orange-400" />
                Live Behavior Rule
              </label>
              <select
                value={obj.properties.behavior || ''}
                onChange={(e) => handlePropertyChange('behavior', e.target.value)}
                className="bg-[#0A0A0A] text-[11px] p-2 rounded border border-[#222] text-white focus:border-blue-500 outline-none cursor-pointer"
              >
                {BEHAVIOR_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#141414]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Interactive Audio Trigger */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#666] font-medium flex items-center gap-1">
                <Volume2 size={10} className="text-pink-400" />
                Audio click Response
              </label>
              <div className="flex gap-1">
                <select
                  value={obj.properties.soundUrl || ''}
                  onChange={(e) => {
                    const selectedOpt = SOUND_OPTIONS.find(o => o.value === e.target.value);
                    handlePropertyChange('soundUrl', e.target.value);
                    handlePropertyChange('soundName', selectedOpt ? selectedOpt.label.replace(/^[^\s]+\s/, '') : '');
                  }}
                  className="bg-[#0A0A0A] text-[11px] p-2 rounded border border-[#222] text-white focus:border-blue-500 outline-none cursor-pointer flex-1 min-w-0"
                >
                  {SOUND_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#141414]">
                      {opt.label}
                    </option>
                  ))}
                </select>

                {obj.properties.soundUrl && (
                  <button
                    onClick={() => playPreviewSound(obj.properties.soundUrl)}
                    className="p-2 bg-pink-600/10 hover:bg-pink-600/20 text-pink-400 border border-pink-500/20 rounded transition-colors"
                    title="Play Preview Sound"
                  >
                    <Play size={12} className="fill-pink-400/20" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* No-Code Event Triggers & Actions */}
        {obj.type !== 'imageTarget' && (
          <div className="flex flex-col gap-3 border-t border-[#222] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={11} className="text-blue-400 fill-blue-500/20" />
                No-Code Events
              </span>
              <button
                onClick={handleAddBehavior}
                className="text-[9px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/15 transition-all"
              >
                <Plus size={10} /> Add Event
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {(obj.properties.visualBehaviors || []).length === 0 ? (
                <div className="border border-[#222] border-dashed rounded p-3 text-center text-[9px] text-[#555]">
                  No custom trigger-actions configured for this object yet.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {(obj.properties.visualBehaviors || []).map((b: any) => (
                    <div key={b.id} className="bg-[#181818] border border-[#262626] rounded-lg p-2.5 flex flex-col gap-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-blue-400 font-mono uppercase tracking-wider flex items-center gap-1">
                          ⚡ Rule
                        </span>
                        <button 
                          onClick={() => handleRemoveBehavior(b.id)}
                          className="text-[#555] hover:text-red-400 transition-colors p-1 rounded hover:bg-black/25"
                          title="Remove Rule"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">Trigger</label>
                        <select
                          value={b.trigger}
                          onChange={(e) => handleUpdateBehavior(b.id, { trigger: e.target.value })}
                          className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none"
                        >
                          <option value="onTap">👆 On Tap (Mouse Click)</option>
                          <option value="onProximity">📐 On Proximity (Distance)</option>
                          <option value="onStart">🚀 On Start / Loaded</option>
                        </select>
                      </div>

                      {b.trigger === 'onProximity' && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">Distance (meters)</label>
                          <input
                            type="number"
                            step="0.5"
                            min="0.1"
                            value={b.proximityDistance ?? 2.0}
                            onChange={(e) => handleUpdateBehavior(b.id, { proximityDistance: parseFloat(e.target.value) || 2.0 })}
                            className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none font-mono"
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">Action</label>
                        <select
                          value={b.action}
                          onChange={(e) => handleUpdateBehavior(b.id, { action: e.target.value })}
                          className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none"
                        >
                          <option value="toast">💬 Show HUD Toast</option>
                          <option value="openUrl">🌐 Open Web URL</option>
                          <option value="playSound">🔊 Play Audio Preset</option>
                          <option value="playVideo">🎬 Play Video Panel</option>
                          <option value="toggleVisibility">👁 Toggle Visibility</option>
                          <option value="spin">🔄 Make Spin Animation</option>
                        </select>
                      </div>

                      {b.action === 'toast' && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">Message</label>
                          <input
                            type="text"
                            value={b.toastMessage ?? ''}
                            onChange={(e) => handleUpdateBehavior(b.id, { toastMessage: e.target.value })}
                            placeholder="e.g. Success!"
                            className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none"
                          />
                        </div>
                      )}

                      {(b.action === 'openUrl' || b.action === 'playVideo') && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">URL Link</label>
                          <input
                            type="text"
                            value={b.url ?? ''}
                            onChange={(e) => handleUpdateBehavior(b.id, { url: e.target.value })}
                            placeholder="https://..."
                            className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none font-mono"
                          />
                        </div>
                      )}

                      {b.action === 'playSound' && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">Audio Sound</label>
                          <select
                            value={b.soundPreset}
                            onChange={(e) => handleUpdateBehavior(b.id, { soundPreset: e.target.value })}
                            className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none"
                          >
                            {SOUND_OPTIONS.filter(opt => opt.value !== '').map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {(b.action === 'toggleVisibility' || b.action === 'spin') && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">Target Object</label>
                          <select
                            value={b.targetObjectId ?? ''}
                            onChange={(e) => handleUpdateBehavior(b.id, { targetObjectId: e.target.value })}
                            className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none"
                          >
                            <option value="">Current Object (Self)</option>
                            {Object.values(objects).filter((o: any) => o.id !== selectedObjectId).map((o: any) => (
                              <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Code Script Editor Section */}
        {obj.type !== 'imageTarget' && (
          <div className="flex flex-col gap-3 border-t border-[#222] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider flex items-center gap-1.5">
                <Code size={11} className="text-pink-400" />
                Custom Scripting
              </span>
              <input 
                type="checkbox" 
                checked={obj.properties.scriptEnabled ?? true}
                onChange={(e) => handlePropertyChange('scriptEnabled', e.target.checked)}
                className="accent-pink-500 w-3.5 h-3.5 rounded cursor-pointer"
                title="Toggle script logic running"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <p className="text-[9px] text-[#666] leading-relaxed">
                Attach Custom JS/TS logic to run dynamic interactive behaviors and event updates in Live Preview.
              </p>

              <button
                onClick={() => setEditingScriptObjectId(editingScriptObjectId === selectedObjectId ? null : selectedObjectId)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-[10px] font-bold transition-all border",
                  editingScriptObjectId === selectedObjectId 
                    ? "bg-pink-600/10 hover:bg-pink-600/20 text-pink-400 border-pink-500/30"
                    : "bg-pink-600 hover:bg-pink-500 text-white border-transparent active:scale-95 shadow-md"
                )}
              >
                <Code size={12} />
                {editingScriptObjectId === selectedObjectId ? "Close Script Editor" : "✏️ Write Custom Script"}
              </button>

              {obj.properties.scriptCode && (
                <div className="bg-black/50 border border-[#222] rounded p-2 text-[9px] font-mono text-[#555] max-h-20 overflow-hidden line-clamp-3 select-none leading-relaxed">
                  {obj.properties.scriptCode}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Core Geometry & Media Specific Custom UI */}
        <div className="flex flex-col gap-4 border-t border-[#222] pt-4">
          <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Entity Parameters</span>
          
          <div className="flex flex-col gap-4">
            {/* --- 1. PRIMITIVES SECTION --- */}
            {['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane'].includes(obj.type) && (
              <div className="flex flex-col gap-4.5">
                {/* Color Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#666] font-medium">Material Base Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={obj.properties.color || '#ffffff'}
                      onChange={(e) => handlePropertyChange('color', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 outline-none animate-none"
                    />
                    <input 
                      type="text" 
                      value={obj.properties.color || '#ffffff'}
                      onChange={(e) => handlePropertyChange('color', e.target.value)}
                      className="bg-[#0A0A0A] text-[10px] p-2 rounded flex-1 border border-[#222] outline-none font-mono text-white focus:border-blue-500"
                    />
                  </div>
                  {/* Preset swatches for quick material choices */}
                  <div className="flex gap-1.5 mt-1">
                    {['#ffffff', '#ff3366', '#33ccff', '#33ffaa', '#ffcc33', '#8b5cf6'].map(preset => (
                      <button 
                        key={preset}
                        onClick={() => handlePropertyChange('color', preset)}
                        className="w-4 h-4 rounded-full border border-black/20 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                        style={{ backgroundColor: preset }}
                      />
                    ))}
                  </div>
                </div>

                {/* Texture Mapping Panel */}
                <div className="bg-[#1A1A1A]/30 border border-[#222] rounded-lg p-2.5 flex flex-col gap-2.5">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Texture Mapping</span>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-[#666] font-medium">Texture URL / Image Source</label>
                    <input 
                      type="text" 
                      placeholder="Paste Image URL (PNG/JPG)..."
                      value={obj.properties.textureUrl || ''}
                      onChange={(e) => handlePropertyChange('textureUrl', e.target.value)}
                      className="bg-[#0A0A0A] text-[10px] font-mono p-1.5 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                    />
                  </div>
                  {obj.properties.textureUrl && (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-[#666]">Repeat X: {obj.properties.textureRepeatX ?? 1}</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          step="1"
                          value={obj.properties.textureRepeatX ?? 1}
                          onChange={(e) => handlePropertyChange('textureRepeatX', parseInt(e.target.value))}
                          className="accent-blue-500 w-full h-1 cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-[#666]">Repeat Y: {obj.properties.textureRepeatY ?? 1}</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          step="1"
                          value={obj.properties.textureRepeatY ?? 1}
                          onChange={(e) => handlePropertyChange('textureRepeatY', parseInt(e.target.value))}
                          className="accent-blue-500 w-full h-1 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Material Sliders */}
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#666]">Roughness</span>
                      <span className="text-gray-400 font-mono">{(obj.properties.roughness ?? 0.5).toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={obj.properties.roughness ?? 0.5} 
                      onChange={(e) => handlePropertyChange('roughness', parseFloat(e.target.value))}
                      className="accent-blue-500 w-full h-1 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#666]">Metalness</span>
                      <span className="text-gray-400 font-mono">{(obj.properties.metalness ?? 0.1).toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={obj.properties.metalness ?? 0.1} 
                      onChange={(e) => handlePropertyChange('metalness', parseFloat(e.target.value))}
                      className="accent-blue-500 w-full h-1 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#666]">Opacity</span>
                      <span className="text-gray-400 font-mono">{(obj.properties.opacity ?? 1.0).toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={obj.properties.opacity ?? 1.0} 
                      onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                      className="accent-blue-500 w-full h-1 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Material Switches */}
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#666]">Wireframe Mode</span>
                    <input 
                      type="checkbox" 
                      checked={obj.properties.wireframe ?? false}
                      onChange={(e) => handlePropertyChange('wireframe', e.target.checked)}
                      className="accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#666]">Double-Sided Geometry</span>
                    <input 
                      type="checkbox" 
                      checked={obj.properties.doubleSided ?? false}
                      onChange={(e) => handlePropertyChange('doubleSided', e.target.checked)}
                      className="accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- 2. 3D TEXT SECTION --- */}
            {obj.type === 'text' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Text Content</label>
                  <textarea 
                    value={obj.properties.text || ''}
                    onChange={(e) => handlePropertyChange('text', e.target.value)}
                    className="bg-[#0A0A0A] text-[10px] p-2 rounded w-full border border-[#222] text-white focus:border-blue-500 outline-none h-16 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Font Family</label>
                  <div className="relative">
                    <div 
                      className="bg-[#0A0A0A] text-[10px] p-2 rounded w-full border border-[#222] text-white cursor-pointer flex justify-between items-center hover:border-blue-500"
                      onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                    >
                      <span>
                        {FONT_LIBRARY.find(f => f.url === (obj.properties.fontUrl || ''))?.name || 'Default (Inter)'}
                      </span>
                      <ChevronDown size={12} className="text-gray-500" />
                    </div>
                    
                    {isFontDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsFontDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#141414] border border-[#333] rounded-md shadow-xl z-50 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-[#222] flex items-center gap-2 bg-[#0A0A0A]">
                          <Search size={12} className="text-gray-500" />
                          <input 
                            type="text" 
                            placeholder="Search fonts..." 
                            value={fontSearch}
                            onChange={(e) => setFontSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-[10px] text-white w-full"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto p-1 flex flex-col">
                          {FONT_LIBRARY.filter(f => f.name.toLowerCase().includes(fontSearch.toLowerCase())).map((font) => (
                            <div 
                              key={font.name}
                              className={`p-2 text-[10px] cursor-pointer rounded hover:bg-blue-500/20 ${(obj.properties.fontUrl || '') === font.url ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'}`}
                              onClick={() => {
                                handlePropertyChange('fontUrl', font.url);
                                setIsFontDropdownOpen(false);
                                setFontSearch('');
                              }}
                            >
                              {font.name}
                            </div>
                          ))}
                          {FONT_LIBRARY.filter(f => f.name.toLowerCase().includes(fontSearch.toLowerCase())).length === 0 && (
                            <div className="p-2 text-[10px] text-gray-500 text-center">No fonts found</div>
                          )}
                        </div>
                      </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#666] font-medium">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={obj.properties.color || '#ffffff'}
                      onChange={(e) => handlePropertyChange('color', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 outline-none"
                    />
                    <input 
                      type="text" 
                      value={obj.properties.color || '#ffffff'}
                      onChange={(e) => handlePropertyChange('color', e.target.value)}
                      className="bg-[#0A0A0A] text-[10px] p-2 rounded flex-1 border border-[#222] outline-none font-mono text-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#666]">Font Size</span>
                    <span className="text-gray-400 font-mono">{(obj.properties.fontSize ?? 0.25).toFixed(2)}m</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.05" 
                    max="2" 
                    step="0.01" 
                    value={obj.properties.fontSize ?? 0.25} 
                    onChange={(e) => handlePropertyChange('fontSize', parseFloat(e.target.value))}
                    className="accent-blue-500 w-full h-1 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#666]">Max Width (m)</span>
                    <span className="text-gray-400 font-mono">{obj.properties.maxWidth ?? 4.0}m</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="10" 
                    step="0.1" 
                    value={obj.properties.maxWidth ?? 4.0} 
                    onChange={(e) => handlePropertyChange('maxWidth', parseFloat(e.target.value))}
                    className="accent-blue-500 w-full h-1 cursor-pointer"
                  />
                </div>

                {/* Text Outline config */}
                <div className="bg-[#1A1A1A]/30 border border-[#222] rounded-lg p-2.5 flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Outline Shadow</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={obj.properties.outlineColor || '#000000'}
                      onChange={(e) => handlePropertyChange('outlineColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 outline-none"
                    />
                    <span className="text-[9px] text-[#666]">Stroke Color</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[8px]">
                      <span className="text-[#666]">Thickness</span>
                      <span className="text-gray-400 font-mono">{(obj.properties.outlineWidth ?? 0.01).toFixed(3)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="0.08" 
                      step="0.001" 
                      value={obj.properties.outlineWidth ?? 0.01} 
                      onChange={(e) => handlePropertyChange('outlineWidth', parseFloat(e.target.value))}
                      className="accent-blue-500 w-full h-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- 3. PHOTO BILLBOARD (IMAGE) SECTION --- */}
            {obj.type === 'image' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Image URL Source</label>
                  <input 
                    type="text" 
                    value={obj.properties.textureUrl || ''}
                    onChange={(e) => handlePropertyChange('textureUrl', e.target.value)}
                    className="bg-[#0A0A0A] text-[10px] font-mono p-2 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#666]">Opacity</span>
                    <span className="text-gray-400 font-mono">{(obj.properties.opacity ?? 1.0).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={obj.properties.opacity ?? 1.0} 
                    onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                    className="accent-blue-500 w-full h-1 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* --- 4. VIDEO SCREEN SECTION --- */}
            {obj.type === 'video' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">MP4 Video Source Link</label>
                  <input 
                    type="text" 
                    value={obj.properties.videoUrl || ''}
                    onChange={(e) => handlePropertyChange('videoUrl', e.target.value)}
                    placeholder="https://..."
                    className="bg-[#0A0A0A] text-[10px] font-mono p-2 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-[#888] font-semibold">Playing State</span>
                  <button
                    onClick={() => handlePropertyChange('playing', !(obj.properties.playing ?? true))}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                      (obj.properties.playing ?? true)
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : 'bg-[#222] text-[#888] border border-[#333]'
                    }`}
                  >
                    {(obj.properties.playing ?? true) ? 'Playing' : 'Paused'}
                  </button>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#666]">Audio Volume</span>
                    <span className="text-gray-400 font-mono">{Math.round((obj.properties.volume ?? 0.5) * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={obj.properties.volume ?? 0.5} 
                    onChange={(e) => handlePropertyChange('volume', parseFloat(e.target.value))}
                    className="accent-blue-500 w-full h-1 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-1.5 border-t border-[#222] pt-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#666]">Muted</span>
                    <input 
                      type="checkbox" 
                      checked={obj.properties.muted ?? true}
                      onChange={(e) => handlePropertyChange('muted', e.target.checked)}
                      className="accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#666]">Looping</span>
                    <input 
                      type="checkbox" 
                      checked={obj.properties.loop ?? true}
                      onChange={(e) => handlePropertyChange('loop', e.target.checked)}
                      className="accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- 5. SPATIAL SOUND EMITTER SECTION --- */}
            {obj.type === 'audio' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Sound Track URL (WAV/MP3)</label>
                  <input 
                    type="text" 
                    value={obj.properties.soundUrl || ''}
                    onChange={(e) => handlePropertyChange('soundUrl', e.target.value)}
                    placeholder="https://..."
                    className="bg-[#0A0A0A] text-[10px] font-mono p-2 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-[#888] font-semibold">Sound Active</span>
                  <button
                    onClick={() => handlePropertyChange('playing', !(obj.properties.playing ?? false))}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                      (obj.properties.playing ?? false)
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-[#222] text-[#888] border border-[#333]'
                    }`}
                  >
                    {(obj.properties.playing ?? false) ? 'Active Playing' : 'Muted'}
                  </button>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#666]">Sound Volume</span>
                    <span className="text-gray-400 font-mono">{Math.round((obj.properties.volume ?? 0.5) * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={obj.properties.volume ?? 0.5} 
                    onChange={(e) => handlePropertyChange('volume', parseFloat(e.target.value))}
                    className="accent-blue-500 w-full h-1 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-1.5 border-t border-[#222] pt-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#666]">Autoplay</span>
                    <input 
                      type="checkbox" 
                      checked={obj.properties.autoplay ?? false}
                      onChange={(e) => handlePropertyChange('autoplay', e.target.checked)}
                      className="accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#666]">Looping</span>
                    <input 
                      type="checkbox" 
                      checked={obj.properties.loop ?? true}
                      onChange={(e) => handlePropertyChange('loop', e.target.checked)}
                      className="accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- 6. DYNAMIC LIGHTS SECTION --- */}
            {obj.type === 'light' && (
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Light Source Node Type</label>
                  <select
                    value={obj.properties.lightType || 'point'}
                    onChange={(e) => handlePropertyChange('lightType', e.target.value)}
                    className="bg-[#0A0A0A] text-[11px] p-2 rounded border border-[#222] text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="point">💡 Point Light (Omnidirectional)</option>
                    <option value="spot">🔦 Spot Light (Focused Cone)</option>
                    <option value="directional">☀️ Directional Light (Sunlight)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#666] font-medium">Illumination Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={obj.properties.color || '#ffedd5'}
                      onChange={(e) => handlePropertyChange('color', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 outline-none"
                    />
                    <input 
                      type="text" 
                      value={obj.properties.color || '#ffedd5'}
                      onChange={(e) => handlePropertyChange('color', e.target.value)}
                      className="bg-[#0A0A0A] text-[10px] p-2 rounded flex-1 border border-[#222] outline-none font-mono text-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#666]">Luminous Intensity</span>
                    <span className="text-yellow-400 font-mono">{(obj.properties.intensity ?? 3.0).toFixed(1)} lumens</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.1" 
                    value={obj.properties.intensity ?? 3.0} 
                    onChange={(e) => handlePropertyChange('intensity', parseFloat(e.target.value))}
                    className="accent-yellow-500 w-full h-1 cursor-pointer"
                  />
                </div>

                {obj.properties.lightType !== 'directional' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#666]">Max Range Distance</span>
                      <span className="text-gray-400 font-mono">{(obj.properties.distance ?? 12.0).toFixed(1)}m</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="30" 
                      step="0.5" 
                      value={obj.properties.distance ?? 12.0} 
                      onChange={(e) => handlePropertyChange('distance', parseFloat(e.target.value))}
                      className="accent-blue-500 w-full h-1 cursor-pointer"
                    />
                  </div>
                )}

                {obj.properties.lightType === 'spot' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#666]">Beam Spread Angle</span>
                      <span className="text-gray-400 font-mono">{Math.round(((obj.properties.angle ?? Math.PI / 4) * 180) / Math.PI)}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="1.5" 
                      step="0.05" 
                      value={obj.properties.angle ?? Math.PI / 4} 
                      onChange={(e) => handlePropertyChange('angle', parseFloat(e.target.value))}
                      className="accent-blue-500 w-full h-1 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* --- 7. BUTTON INTERACTION SECTION --- */}
            {obj.type === 'button' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Button Representation</label>
                  <select
                    value={obj.properties.buttonStyle || '3d_push'}
                    onChange={(e) => handlePropertyChange('buttonStyle', e.target.value)}
                    className="bg-[#0A0A0A] text-[10px] p-2 rounded border border-[#222] text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="3d_push">🔘 Physical 3D Push Button</option>
                    <option value="glass_panel">✨ Glassmorphic UI Panel</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Button Label Text</label>
                  <input 
                    type="text" 
                    value={obj.properties.text || ''}
                    onChange={(e) => handlePropertyChange('text', e.target.value)}
                    className="bg-[#0A0A0A] text-[10px] p-2 rounded w-full border border-[#222] text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Button Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={obj.properties.color || '#3b82f6'}
                      onChange={(e) => handlePropertyChange('color', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-[#0A0A0A] border border-[#222]"
                    />
                    <input 
                      type="text" 
                      value={obj.properties.color || '#3b82f6'}
                      onChange={(e) => handlePropertyChange('color', e.target.value)}
                      className="bg-[#0A0A0A] text-[10px] p-2 rounded flex-1 border border-[#222] outline-none font-mono text-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={obj.properties.textColor || '#ffffff'}
                      onChange={(e) => handlePropertyChange('textColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-[#0A0A0A] border border-[#222]"
                    />
                    <input 
                      type="text" 
                      value={obj.properties.textColor || '#ffffff'}
                      onChange={(e) => handlePropertyChange('textColor', e.target.value)}
                      className="bg-[#0A0A0A] text-[10px] p-2 rounded flex-1 border border-[#222] outline-none font-mono text-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Tap Link URL redirect</label>
                  <input 
                    type="text" 
                    value={obj.properties.url || ''}
                    onChange={(e) => handlePropertyChange('url', e.target.value)}
                    placeholder="https://..."
                    className="bg-[#0A0A0A] text-[10px] font-mono p-2 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* --- 8. YOUTUBE VIDEO LOADER --- */}
            {obj.type === 'youtube' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">YouTube Video ID</label>
                  <input 
                    type="text" 
                    value={obj.properties.videoId || ''}
                    onChange={(e) => handlePropertyChange('videoId', e.target.value)}
                    placeholder="e.g. dQw4w9WgXcQ"
                    className="bg-[#0A0A0A] text-[10px] font-mono p-2 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                  />
                  <span className="text-[8px] text-[#555]">Pass the unique identifier at the end of the YouTube video link.</span>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-[#666] font-medium">Autoplay</label>
                    <input 
                      type="checkbox" 
                      checked={obj.properties.autoplay || false}
                      onChange={(e) => handlePropertyChange('autoplay', e.target.checked)}
                      className="accent-blue-500 cursor-pointer w-3.5 h-3.5"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-[#666] font-medium">Loop Video</label>
                    <input 
                      type="checkbox" 
                      checked={obj.properties.loop || false}
                      onChange={(e) => handlePropertyChange('loop', e.target.checked)}
                      className="accent-blue-500 cursor-pointer w-3.5 h-3.5"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-[#666] font-medium">Mute Audio</label>
                    <input 
                      type="checkbox" 
                      checked={obj.properties.mute || false}
                      onChange={(e) => handlePropertyChange('mute', e.target.checked)}
                      className="accent-blue-500 cursor-pointer w-3.5 h-3.5"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-[#666] font-medium">Show Player Controls</label>
                    <input 
                      type="checkbox" 
                      checked={obj.properties.controls !== false}
                      onChange={(e) => handlePropertyChange('controls', e.target.checked)}
                      className="accent-blue-500 cursor-pointer w-3.5 h-3.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- 8.5. GLTF / GLB MODEL ANIMATION ENGINE --- */}
            {obj.type === 'model' && (
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Model Asset URL (.gltf / .glb)</label>
                  <input 
                    type="text" 
                    value={obj.properties.url || ''}
                    onChange={(e) => handlePropertyChange('url', e.target.value)}
                    placeholder="https://..."
                    className="bg-[#0A0A0A] text-[10px] font-mono p-2 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                  />
                </div>

                {obj.properties.discoveredAnimations && obj.properties.discoveredAnimations.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[#666] font-medium">Select Keyframe Clip</label>
                    <select
                      value={obj.properties.activeAnimation || ''}
                      onChange={(e) => handlePropertyChange('activeAnimation', e.target.value)}
                      className="bg-[#0A0A0A] text-[10px] p-2 rounded border border-[#222] text-white focus:border-blue-500 outline-none cursor-pointer"
                    >
                      {obj.properties.discoveredAnimations.map((name: string) => (
                        <option key={name} value={name}>
                          🎬 {name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="bg-[#0A0A0A] p-2 rounded border border-[#222] text-center text-[9px] text-[#666] font-mono leading-relaxed">
                    ⚠️ No embedded animations found in this asset
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] mt-1 border-t border-black/10 pt-2.5">
                  <span className="text-[#888] font-semibold">Animation State</span>
                  <button
                    onClick={() => handlePropertyChange('animationPlaying', obj.properties.animationPlaying === false ? true : false)}
                    className={`px-3 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                      obj.properties.animationPlaying !== false
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-[#222] text-[#888] border border-[#333]'
                    }`}
                  >
                    {obj.properties.animationPlaying !== false ? 'Playing' : 'Paused'}
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-black/10 pt-2.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#666]">Playback Speed</span>
                    <span className="text-gray-400 font-mono">{(obj.properties.animationSpeed ?? 1.0).toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="3.0" 
                    step="0.1" 
                    value={obj.properties.animationSpeed ?? 1.0} 
                    onChange={(e) => handlePropertyChange('animationSpeed', parseFloat(e.target.value))}
                    className="accent-blue-500 w-full h-1 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* --- 9. AR IMAGE TARGET MARKER CONFIG --- */}
            {obj.type === 'imageTarget' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">AR target Marker Image</label>
                  <input 
                    type="text" 
                    value={obj.properties.textureUrl || ''}
                    onChange={(e) => handlePropertyChange('textureUrl', e.target.value)}
                    className="bg-[#0A0A0A] text-[10px] font-mono p-2 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                  />
                  <span className="text-[8px] text-[#555]">This acts as the physical 2D visual blueprint the mobile camera scans to overlay content.</span>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#666] font-medium">Target Physical Width (meters)</label>
                  <input 
                    type="number" 
                    step="0.05"
                    value={obj.properties.physicalWidth || 1}
                    onChange={(e) => handlePropertyChange('physicalWidth', parseFloat(e.target.value) || 1)}
                    className="bg-[#0A0A0A] text-[10px] font-mono p-2 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Add Interactions section */}
        {obj.type !== 'imageTarget' && (!obj.properties.behavior || !obj.properties.soundUrl) && (
          <div className="flex flex-col gap-2.5 border-t border-[#222] pt-4">
            <span className="text-[9px] font-bold text-[#555] uppercase tracking-wider">Quick Interactions</span>
            <div className="flex flex-col gap-1.5">
              {!obj.properties.behavior && (
                <button
                  onClick={() => addInteractiveTrait('behavior')}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-[#1F1F1F] hover:bg-[#252525] border border-[#2A2A2A] rounded text-[10px] font-medium text-[#AAA] hover:text-white transition-colors"
                >
                  <PlusCircle size={12} className="text-blue-400" />
                  Add Spin Animation Behavior
                </button>
              )}
              {!obj.properties.soundUrl && (
                <button
                  onClick={() => addInteractiveTrait('sound')}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-[#1F1F1F] hover:bg-[#252525] border border-[#2A2A2A] rounded text-[10px] font-medium text-[#AAA] hover:text-white transition-colors"
                >
                  <PlusCircle size={12} className="text-pink-400" />
                  Add Click Audio Feedback
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
