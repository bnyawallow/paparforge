import React, { useState } from 'react';
import { SceneObject } from '../../types';
import { MediaAssetPicker } from './InspectorPanel';
import { useEditorStore } from '../../store/useEditorStore';
import { downsampleTexture } from '../../lib/textureOptimizer';
import { 
  Palette, 
  Sparkles, 
  Sliders, 
  Trash2, 
  Zap, 
  Compass, 
  Droplet, 
  Check, 
  ImageIcon, 
  RefreshCw, 
  Flame, 
  FileText 
} from 'lucide-react';

interface ModelMaterialEditorProps {
  obj: SceneObject;
  handlePropertyChange: (key: string, value: any) => void;
}

// Material Preset Definitions
interface MaterialPreset {
  name: string;
  category: string;
  icon: string;
  properties: {
    color?: string;
    roughness?: number;
    metalness?: number;
    opacity?: number;
    emissiveColor?: string;
    emissiveIntensity?: number;
  };
}

const MODEL_MATERIAL_PRESETS: MaterialPreset[] = [
  {
    name: 'Polished Gold',
    category: 'Metal',
    icon: '✨',
    properties: { color: '#ffd700', roughness: 0.15, metalness: 0.95 }
  },
  {
    name: 'Chrome Finish',
    category: 'Metal',
    icon: '💿',
    properties: { color: '#e5e5e5', roughness: 0.05, metalness: 1.0 }
  },
  {
    name: 'Rustic Copper',
    category: 'Metal',
    icon: '🧱',
    properties: { color: '#d35400', roughness: 0.4, metalness: 0.8 }
  },
  {
    name: 'Frosted Glass',
    category: 'Glass',
    icon: '💎',
    properties: { color: '#ffffff', roughness: 0.25, metalness: 0.0, opacity: 0.4 }
  },
  {
    name: 'Matte Plastic',
    category: 'Basic',
    icon: '🔴',
    properties: { color: '#3498db', roughness: 0.8, metalness: 0.1 }
  },
  {
    name: 'Cyber Neon Glow',
    category: 'Effect',
    icon: '🔥',
    properties: { color: '#111111', roughness: 0.3, metalness: 0.2, emissiveColor: '#ff00ff', emissiveIntensity: 2.0 }
  },
  {
    name: 'Carbon Fiber',
    category: 'Basic',
    icon: '🏁',
    properties: { color: '#1C1C1C', roughness: 0.5, metalness: 0.7 }
  },
  {
    name: 'Obsidian Gem',
    category: 'Glass',
    icon: '🔮',
    properties: { color: '#121212', roughness: 0.1, metalness: 0.9, opacity: 0.85 }
  }
];

export function ModelMaterialEditor({ obj, handlePropertyChange }: ModelMaterialEditorProps) {
  const { addToast } = useEditorStore();
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [optimizing, setOptimizing] = useState<Record<string, boolean>>({});

  const discoveredMaterials: string[] = obj.properties.discoveredMaterials || [];
  const materialOverrides = obj.properties.materialOverrides || {};

  // Initialize selected material once available
  React.useEffect(() => {
    if (discoveredMaterials.length > 0 && !selectedMaterial) {
      setSelectedMaterial(discoveredMaterials[0]);
    }
  }, [discoveredMaterials, selectedMaterial]);

  if (discoveredMaterials.length === 0) {
    return (
      <div className="bg-[#1A1A1A]/30 border border-[#222] p-4 rounded-xl text-center flex flex-col items-center gap-2">
        <RefreshCw size={18} className="text-blue-400 animate-spin" />
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Analyzing 3D Mesh...</span>
        <span className="text-[8.5px] text-gray-500 max-w-[200px] leading-relaxed">
          Retrieving unique materials from your model structure. This may take a brief moment as the model resolves in the 3D viewport.
        </span>
      </div>
    );
  }

  const currentOverride = materialOverrides[selectedMaterial] || {};
  const hasOverride = materialOverrides[selectedMaterial] !== undefined;

  const handleUpdateOverride = (key: string, value: any) => {
    const updatedOverrides = {
      ...materialOverrides,
      [selectedMaterial]: {
        ...currentOverride,
        [key]: value
      }
    };
    handlePropertyChange('materialOverrides', updatedOverrides);
  };

  const handleApplyPreset = (preset: MaterialPreset) => {
    const updatedOverrides = {
      ...materialOverrides,
      [selectedMaterial]: {
        ...currentOverride,
        ...preset.properties
      }
    };
    handlePropertyChange('materialOverrides', updatedOverrides);
    addToast(`Applied ${preset.name} preset to material "${selectedMaterial}"`);
  };

  const handleResetMaterial = () => {
    const updatedOverrides = { ...materialOverrides };
    delete updatedOverrides[selectedMaterial];
    handlePropertyChange('materialOverrides', updatedOverrides);
    addToast(`Cleared overrides for "${selectedMaterial}"`);
  };

  const handleOptimizeMap = async (mapField: string, label: string) => {
    const url = currentOverride[mapField];
    if (!url) return;

    setOptimizing(prev => ({ ...prev, [mapField]: true }));
    try {
      const result = await downsampleTexture(url, 1024);
      handleUpdateOverride(mapField, result.url);
      addToast(`Optimized ${label} texture to 1024px!`);
    } catch (err: any) {
      console.error(err);
      addToast(`Optimization failed: ${err.message || 'CORS or format issue'}`);
    } finally {
      setOptimizing(prev => ({ ...prev, [mapField]: false }));
    }
  };

  // Extract variables with proper default fallback values
  const color = currentOverride.color || '#ffffff';
  const roughness = currentOverride.roughness !== undefined ? currentOverride.roughness : 0.5;
  const metalness = currentOverride.metalness !== undefined ? currentOverride.metalness : 0.0;
  const opacity = currentOverride.opacity !== undefined ? currentOverride.opacity : 1.0;
  const emissiveColor = currentOverride.emissiveColor || '#000000';
  const emissiveIntensity = currentOverride.emissiveIntensity !== undefined ? currentOverride.emissiveIntensity : 0.0;

  const textureUrl = currentOverride.textureUrl || '';
  const normalMapUrl = currentOverride.normalMapUrl || '';
  const roughnessMapUrl = currentOverride.roughnessMapUrl || '';
  const metalnessMapUrl = currentOverride.metalnessMapUrl || '';
  const displacementMapUrl = currentOverride.displacementMapUrl || '';

  return (
    <div className="bg-[#141414]/80 border border-[#222] rounded-xl p-3 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/20 pb-2">
        <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
          <Palette size={12} className="text-blue-400" />
          Model Materials
        </span>
        <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full font-bold uppercase tracking-wider">
          {discoveredMaterials.length} Found
        </span>
      </div>

      {/* Selector dropdown and override status */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Select Material to Override</label>
        <div className="flex gap-2">
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="flex-1 bg-black/60 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none font-mono"
          >
            {discoveredMaterials.map(mat => {
              const isOverridden = materialOverrides[mat] !== undefined;
              return (
                <option key={mat} value={mat}>
                  {mat} {isOverridden ? '🌟 (Modified)' : ''}
                </option>
              );
            })}
          </select>

          {hasOverride && (
            <button
              onClick={handleResetMaterial}
              className="px-2 bg-red-950/40 hover:bg-red-900/30 border border-red-500/20 rounded text-red-400 text-[10px] font-bold hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset material overrides to default GLTF settings"
            >
              <Trash2 size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Library for this specific material */}
      <div className="flex flex-col gap-2 bg-black/20 border border-[#222] rounded-lg p-2.5">
        <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1">
          <Sparkles size={10} className="text-amber-400 animate-pulse" />
          Quick Preset Material Library
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {MODEL_MATERIAL_PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset)}
              className="py-1 px-1.5 bg-[#1C1C1C] hover:bg-[#262626] border border-[#2A2A2A] rounded text-[8px] font-medium text-gray-300 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
              title={`Apply ${preset.name}`}
            >
              <span className="text-xs leading-none">{preset.icon}</span>
              <span className="truncate w-full text-[7.5px] leading-tight">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Material Override Controls */}
      <div className="flex flex-col gap-3.5 mt-1 border-t border-[#222] pt-3">
        {/* Base Color Picker */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-gray-300">Override Color</span>
            <span className="text-[8px] text-gray-500">Solid base diffuse color</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <input 
              type="text" 
              value={color}
              onChange={(e) => handleUpdateOverride('color', e.target.value)}
              className="w-16 bg-[#0A0A0A] text-[9px] font-mono text-center p-1 border border-[#222] text-white rounded outline-none"
            />
            <input 
              type="color" 
              value={color}
              onChange={(e) => handleUpdateOverride('color', e.target.value)}
              className="w-6 h-6 rounded border border-white/10 cursor-pointer bg-transparent"
            />
          </div>
        </div>

        {/* Roughness Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-400">Roughness (Surface Finish)</span>
            <span className="text-blue-400 font-mono">{roughness.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-gray-600">Glossy</span>
            <input 
              type="range" 
              min="0.0" 
              max="1.0" 
              step="0.05" 
              value={roughness} 
              onChange={(e) => handleUpdateOverride('roughness', parseFloat(e.target.value))}
              className="accent-blue-500 flex-1 h-1 cursor-pointer"
            />
            <span className="text-[8px] text-gray-600">Matte</span>
          </div>
        </div>

        {/* Metalness Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-400">Metalness (Reflectivity)</span>
            <span className="text-blue-400 font-mono">{metalness.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-gray-600">Dielectric</span>
            <input 
              type="range" 
              min="0.0" 
              max="1.0" 
              step="0.05" 
              value={metalness} 
              onChange={(e) => handleUpdateOverride('metalness', parseFloat(e.target.value))}
              className="accent-blue-500 flex-1 h-1 cursor-pointer"
            />
            <span className="text-[8px] text-gray-600">Metallic</span>
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-400">Material Opacity (Transparency)</span>
            <span className="text-blue-400 font-mono">{opacity.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-gray-600">Invisible</span>
            <input 
              type="range" 
              min="0.0" 
              max="1.0" 
              step="0.05" 
              value={opacity} 
              onChange={(e) => handleUpdateOverride('opacity', parseFloat(e.target.value))}
              className="accent-blue-500 flex-1 h-1 cursor-pointer"
            />
            <span className="text-[8px] text-gray-600">Opaque</span>
          </div>
        </div>

        {/* Glow (Emissive) Controls */}
        <div className="bg-black/35 border border-[#222] rounded-lg p-2.5 flex flex-col gap-3">
          <span className="text-[9.5px] font-bold text-orange-400 flex items-center gap-1">
            <Flame size={10} />
            Self-Emissive Glow
          </span>

          <div className="flex items-center justify-between">
            <span className="text-[9px] text-gray-400">Glow Color</span>
            <div className="flex items-center gap-1.5">
              <input 
                type="text" 
                value={emissiveColor}
                onChange={(e) => handleUpdateOverride('emissiveColor', e.target.value)}
                className="w-16 bg-[#0A0A0A] text-[9px] font-mono text-center p-1 border border-[#222] text-white rounded outline-none"
              />
              <input 
                type="color" 
                value={emissiveColor}
                onChange={(e) => handleUpdateOverride('emissiveColor', e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[9px]">
              <span className="text-gray-400">Glow Intensity</span>
              <span className="text-orange-400 font-mono">{emissiveIntensity.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0.0" 
              max="10.0" 
              step="0.1" 
              value={emissiveIntensity} 
              onChange={(e) => handleUpdateOverride('emissiveIntensity', parseFloat(e.target.value))}
              className="accent-orange-500 w-full h-1 cursor-pointer"
            />
          </div>
        </div>

        {/* Texture Map Sliders */}
        <div className="flex flex-col gap-3.5 border-t border-[#222] pt-3">
          <span className="text-[9.5px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
            <ImageIcon size={10} className="text-blue-400" />
            Texture Overrides
          </span>

          {/* Map Slots */}
          {[
            { key: 'textureUrl', label: 'Base Diffuse Map', placeholder: 'Upload Base color texture map...' },
            { key: 'normalMapUrl', label: 'Normal Surface Map', placeholder: 'Upload Normal bump map...' },
            { key: 'roughnessMapUrl', label: 'Roughness Map', placeholder: 'Upload Roughness spec map...' },
            { key: 'metalnessMapUrl', label: 'Metalness Map', placeholder: 'Upload Metalness spec map...' },
            { key: 'displacementMapUrl', label: 'Height Displacement Map', placeholder: 'Upload Displacement height map...' }
          ].map(slot => {
            const hasSlotValue = !!currentOverride[slot.key];
            const isOptimizingSlot = optimizing[slot.key] || false;

            return (
              <div key={slot.key} className="bg-black/15 border border-white/5 rounded p-2 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-gray-400">{slot.label}</span>
                  {hasSlotValue && (
                    <button
                      disabled={isOptimizingSlot}
                      onClick={() => handleOptimizeMap(slot.key, slot.label)}
                      className="text-[7.5px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase hover:bg-blue-500/20 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {isOptimizingSlot ? (
                        <RefreshCw size={8} className="animate-spin" />
                      ) : (
                        <Zap size={8} className="text-yellow-400" />
                      )}
                      <span>Optimize Map</span>
                    </button>
                  )}
                </div>

                <MediaAssetPicker
                  type="image"
                  accept="image/*"
                  value={currentOverride[slot.key] || ''}
                  onChange={(url) => handleUpdateOverride(slot.key, url)}
                  placeholder={slot.placeholder}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
