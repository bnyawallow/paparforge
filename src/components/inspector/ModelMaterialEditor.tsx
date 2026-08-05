import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SceneObject } from '../../types';
import { MediaAssetPicker } from './InspectorPanel';
import { useEditorStore } from '../../store/useEditorStore';
import { downsampleTexture } from '../../lib/textureOptimizer';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';
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
  Eye, 
  EyeOff, 
  ChevronRight, 
  X, 
  Search, 
  HelpCircle, 
  Layers, 
  Settings, 
  Cpu, 
  SlidersHorizontal 
} from 'lucide-react';

interface ModelMaterialEditorProps {
  obj: SceneObject;
  handlePropertyChange: (key: string, value: any) => void;
  handleMultiplePropertiesChange?: (updates: Record<string, any>) => void;
}

// Curated Spline-like Material Presets
interface MaterialPreset {
  id: string;
  name: string;
  collection: 'Metals' | 'Glass & Gems' | 'Toon & Pop' | 'Abstract & Glow' | 'Stone & Organic';
  description: string;
  previewStyle: React.CSSProperties;
  properties: {
    color?: string;
    roughness?: number;
    metalness?: number;
    opacity?: number;
    emissiveColor?: string;
    emissiveIntensity?: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
    transmission?: number;
    thickness?: number;
    ior?: number;
    flatShading?: boolean;
    wireframe?: boolean;
    shaderType?: 'standard' | 'physical' | 'toon' | 'basic' | 'normal';
    textureUrl?: string;
    normalMapUrl?: string;
    roughnessMapUrl?: string;
    metalnessMapUrl?: string;
    displacementMapUrl?: string;
  };
}

const SPLINE_MATERIAL_PRESETS: MaterialPreset[] = [
  // Curated metals
  {
    id: 'gold_polished',
    name: 'Polished Gold',
    collection: 'Metals',
    description: 'Highly reflective, premium luxury gold finish.',
    previewStyle: { background: 'radial-gradient(circle at 35% 35%, #fff9e6 0%, #ffd700 45%, #b89200 80%, #6e5000 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.15)' },
    properties: { color: '#ffd700', roughness: 0.08, metalness: 1.0, clearcoat: 0.6, clearcoatRoughness: 0.05, shaderType: 'standard' }
  },
  {
    id: 'chrome_plate',
    name: 'Chrome Plate',
    collection: 'Metals',
    description: 'Mirror-like specular reflection finish.',
    previewStyle: { background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #eceff1 40%, #b0bec5 75%, #37474f 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.15)' },
    properties: { color: '#e5e9f0', roughness: 0.02, metalness: 1.0, clearcoat: 0.8, clearcoatRoughness: 0.02, shaderType: 'standard' }
  },
  {
    id: 'brass_satin',
    name: 'Satin Brass',
    collection: 'Metals',
    description: 'Soft brushed warm brass finish.',
    previewStyle: { background: 'radial-gradient(circle at 35% 35%, #fffbee 0%, #d4af37 50%, #997b15 85%, #594300 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.15)' },
    properties: { color: '#d4af37', roughness: 0.22, metalness: 0.9, clearcoat: 0.1, shaderType: 'standard' }
  },
  {
    id: 'copper_polished',
    name: 'Polished Copper',
    collection: 'Metals',
    description: 'Vibrant, warm raw copper gloss look.',
    previewStyle: { background: 'radial-gradient(circle at 35% 35%, #ffebdf 0%, #b87333 45%, #854a14 80%, #4a2200 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.15)' },
    properties: { color: '#b87333', roughness: 0.15, metalness: 0.95, clearcoat: 0.3, shaderType: 'standard' }
  },
  {
    id: 'steel_brushed',
    name: 'Brushed Steel',
    collection: 'Metals',
    description: 'Standard industrial micro-brushed steel.',
    previewStyle: { background: 'radial-gradient(circle at 35% 35%, #eef1f6 0%, #a1a8b3 50%, #636d7a 85%, #2d3540 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.15)' },
    properties: { color: '#a1a8b3', roughness: 0.32, metalness: 0.88, shaderType: 'standard' }
  },
  {
    id: 'anodized_blue',
    name: 'Anodized Blue',
    collection: 'Metals',
    description: 'Satin chemically-treated metallic blue.',
    previewStyle: { background: 'radial-gradient(circle at 35% 35%, #e0f7fa 0%, #0097a7 45%, #006064 85%, #002224 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.15)' },
    properties: { color: '#0984e3', roughness: 0.2, metalness: 0.9, shaderType: 'standard' }
  },
  {
    id: 'titanium_grey',
    name: 'Titanium Grey',
    collection: 'Metals',
    description: 'Dense matte grey high-strength titanium look.',
    previewStyle: { background: 'radial-gradient(circle at 35% 35%, #eceff1 0%, #78909c 50%, #455a64 85%, #1a2327 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.15)' },
    properties: { color: '#5e6472', roughness: 0.25, metalness: 0.95, shaderType: 'standard' }
  },
  {
    id: 'iron_rusty',
    name: 'Rusty Iron Plate',
    collection: 'Metals',
    description: 'Heavily oxidized dark iron rust crust.',
    previewStyle: { background: 'radial-gradient(circle at 35% 35%, #8d6e63 0%, #4e342e 50%, #3e2723 85%, #1b0a00 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.15)' },
    properties: { color: '#4a2c11', roughness: 0.75, metalness: 0.85, shaderType: 'standard' }
  },

  // Glass & Gems
  {
    id: 'glass_clear',
    name: 'Clear Glass',
    collection: 'Glass & Gems',
    description: 'Hyper-pure realistic refractive solid glass.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95) 0%, rgba(224,242,241,0.3) 35%, rgba(128,203,196,0.1) 70%, rgba(0,77,64,0.2) 100%)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: 'inset -1px -1px 4px rgba(0,0,0,0.2)' },
    properties: { color: '#ffffff', roughness: 0.02, metalness: 0.05, transmission: 0.95, ior: 1.5, thickness: 1.5, shaderType: 'physical', opacity: 0.3 }
  },
  {
    id: 'glass_frosted',
    name: 'Frosted Glass',
    collection: 'Glass & Gems',
    description: 'Etched sandblasted glass with soft blur.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(240,244,248,0.4) 40%, rgba(176,190,197,0.2) 80%, rgba(55,71,79,0.3) 100%)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: 'inset -1px -1px 4px rgba(0,0,0,0.15)' },
    properties: { color: '#ffffff', roughness: 0.38, metalness: 0.0, transmission: 0.85, ior: 1.45, thickness: 0.8, shaderType: 'physical', opacity: 0.45 }
  },
  {
    id: 'ruby_gem',
    name: 'Ruby Gemstone',
    collection: 'Glass & Gems',
    description: 'Deep crimson crystal with slight internal glow.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #ff8a80 0%, #ff1744 45%, #b20027 85%, #4a000c 100%)', boxShadow: 'inset -2px -2px 8px rgba(0,0,0,0.6), 0 0 8px rgba(255,23,68,0.4)' },
    properties: { color: '#ff3f34', roughness: 0.05, metalness: 0.1, transmission: 0.9, ior: 1.77, emissiveColor: '#300000', emissiveIntensity: 0.5, shaderType: 'physical', opacity: 0.7 }
  },
  {
    id: 'emerald_jade',
    name: 'Emerald Jade',
    collection: 'Glass & Gems',
    description: 'Precious translucent deep green jade.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, rgba(224,250,230,0.9) 0%, rgba(46,213,115,0.45) 45%, rgba(11,105,43,0.3) 85%, rgba(1,36,12,0.6) 100%)', border: '1px solid rgba(46,213,115,0.25)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.5)' },
    properties: { color: '#2ed573', roughness: 0.15, metalness: 0.0, transmission: 0.85, ior: 1.6, thickness: 1.0, shaderType: 'physical', opacity: 0.65 }
  },
  {
    id: 'sapphire_prism',
    name: 'Sapphire Prism',
    collection: 'Glass & Gems',
    description: 'Pure sky-blue refraction gem.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #90caf9 0%, #2979ff 45%, #0645ad 85%, #001f5c 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.2)' },
    properties: { color: '#3867d6', roughness: 0.04, metalness: 0.05, transmission: 0.92, ior: 1.76, shaderType: 'physical', opacity: 0.55 }
  },
  {
    id: 'obsidian_smoked',
    name: 'Smoked Obsidian',
    collection: 'Glass & Gems',
    description: 'Semi-opaque dark volcanic glass.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #78909c 0%, #263238 50%, #10171a 85%, #000000 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.6)' },
    properties: { color: '#1e272e', roughness: 0.1, metalness: 0.0, transmission: 0.6, ior: 1.5, shaderType: 'physical', opacity: 0.8 }
  },
  {
    id: 'pearl_iridescent',
    name: 'Iridescent Pearl',
    collection: 'Glass & Gems',
    description: 'Lustrous pearlescent clearcoat shell.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #fff 0%, #ffe5ec 25%, #d1c4e9 60%, #b2ebf2 85%, #e1bee7 100%)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.15)' },
    properties: { color: '#ffe5ec', roughness: 0.15, metalness: 0.2, clearcoat: 1.0, clearcoatRoughness: 0.1, transmission: 0.1, shaderType: 'standard' }
  },

  // Toon & Pop
  {
    id: 'toon_pink',
    name: 'Cel Anime Pink',
    collection: 'Toon & Pop',
    description: 'Sharp anime outlines on pastel pink.',
    previewStyle: { background: 'linear-gradient(135deg, #ff9ff3 0%, #ff9ff3 55%, #fd79a8 55%, #fd79a8 100%)', border: '1.5px solid #222' },
    properties: { color: '#fd79a8', roughness: 0.8, metalness: 0.0, shaderType: 'toon', flatShading: true }
  },
  {
    id: 'toon_sky',
    name: 'Cel Cyber Sky',
    collection: 'Toon & Pop',
    description: 'Stylized comic sky blue cartoon shade.',
    previewStyle: { background: 'linear-gradient(135deg, #81ecec 0%, #81ecec 55%, #00cec9 55%, #00cec9 100%)', border: '1.5px solid #222' },
    properties: { color: '#0984e3', roughness: 0.7, metalness: 0.0, shaderType: 'toon', flatShading: true }
  },
  {
    id: 'toon_lemon',
    name: 'Comic Lemon',
    collection: 'Toon & Pop',
    description: 'Vibrant pop-art cartoon yellow look.',
    previewStyle: { background: 'linear-gradient(135deg, #ffeaa7 0%, #ffeaa7 55%, #fdcb6e 55%, #fdcb6e 100%)', border: '1.5px solid #222' },
    properties: { color: '#feca57', roughness: 0.6, metalness: 0.0, shaderType: 'toon', flatShading: true }
  },
  {
    id: 'clay_matte',
    name: 'Soft Matte Clay',
    collection: 'Toon & Pop',
    description: 'Unlit powdery-matte green sculpting clay.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #a8f5cc 0%, #2ecc71 60%, #176033 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.3)' },
    properties: { color: '#26de81', roughness: 0.95, metalness: 0.0, shaderType: 'standard' }
  },
  {
    id: 'lavender_pastel',
    name: 'Pastel Lavender',
    collection: 'Toon & Pop',
    description: 'Chalky lavender toy plastic look.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #f3ebfc 0%, #d8bbf7 60%, #7033b0 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.3)' },
    properties: { color: '#dec4fc', roughness: 0.8, metalness: 0.0, shaderType: 'standard' }
  },

  // Abstract & Glow
  {
    id: 'glow_magenta',
    name: 'Cyber Glow',
    collection: 'Abstract & Glow',
    description: 'Bioluminescent intense magenta glow.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #ff79c6 0%, #bd93f9 40%, #ff5555 75%, #0d020d 100%)', border: '1px solid rgba(255,0,255,0.25)', boxShadow: '0 0 10px rgba(255,0,127,0.5), inset -2px -2px 6px rgba(0,0,0,0.8)' },
    properties: { color: '#0d020d', roughness: 0.2, metalness: 0.1, emissiveColor: '#ff007f', emissiveIntensity: 3.5, shaderType: 'standard' }
  },
  {
    id: 'matrix_holo',
    name: 'Hologram Grid',
    collection: 'Abstract & Glow',
    description: 'Cyber unlit green grid laser shell.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #e8f5e9 0%, #2e7d32 45%, #1b5e20 80%, #001102 100%)', border: '1px solid rgba(0,255,0,0.3)', boxShadow: '0 0 8px rgba(0,255,0,0.35), inset -2px -2px 6px rgba(0,0,0,0.8)' },
    properties: { color: '#051b05', roughness: 0.4, metalness: 0.2, emissiveColor: '#00ff66', emissiveIntensity: 2.0, opacity: 0.5, wireframe: true, shaderType: 'basic' }
  },
  {
    id: 'glow_sun',
    name: 'Solar Corona',
    collection: 'Abstract & Glow',
    description: 'Hyper-intense blinding solar glow core.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #fffde7 0%, #fbc02d 40%, #f57f17 75%, #1a0500 100%)', boxShadow: '0 0 12px rgba(255,165,0,0.65), inset -2px -2px 6px rgba(0,0,0,0.8)' },
    properties: { color: '#2a1a00', roughness: 0.3, metalness: 0.1, emissiveColor: '#ffa500', emissiveIntensity: 5.0, shaderType: 'standard' }
  },
  {
    id: 'alien_lume',
    name: 'Biolume Core',
    collection: 'Abstract & Glow',
    description: 'Glowing turquoise deep-sea alien texture.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #e0f2f1 0%, #009688 45%, #004d40 80%, #001a10 100%)', boxShadow: '0 0 8px rgba(16,172,132,0.4), inset -2px -2px 6px rgba(0,0,0,0.8)' },
    properties: { color: '#021a10', roughness: 0.22, metalness: 0.4, emissiveColor: '#10ac84', emissiveIntensity: 3.0, shaderType: 'standard' }
  },

  // Stone & Organic
  {
    id: 'stone_marble',
    name: 'Carrara Marble',
    collection: 'Stone & Organic',
    description: 'Classic glossy polished white marble.',
    previewStyle: { background: 'linear-gradient(120deg, rgba(210,210,210,0.15) 25%, transparent 25%), radial-gradient(circle at 30% 30%, #ffffff 0%, #f5f5f5 55%, #cccccc 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.2)' },
    properties: { color: '#fafafa', roughness: 0.12, metalness: 0.05, clearcoat: 0.4, shaderType: 'standard' }
  },
  {
    id: 'stone_obsidian',
    name: 'Midnight Obsidian',
    collection: 'Stone & Organic',
    description: 'Polished jet-black shiny lava glass.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #455a64 0%, #1a2327 50%, #05070a 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.7)' },
    properties: { color: '#0a0b10', roughness: 0.06, metalness: 0.85, shaderType: 'standard' }
  },
  {
    id: 'stone_sandstone',
    name: 'Desert Sandstone',
    collection: 'Stone & Organic',
    description: 'Raw, porous dry desert sandstone grain.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #fbe9e7 0%, #ff8a65 50%, #8d2400 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.35)' },
    properties: { color: '#e2a76f', roughness: 0.9, metalness: 0.0, shaderType: 'standard' }
  },
  {
    id: 'porcelain_white',
    name: 'Glossy Porcelain',
    collection: 'Stone & Organic',
    description: 'Sleek premium fired porcelain enamel.',
    previewStyle: { background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #fafafa 45%, #e0e0e0 80%, #9e9e9e 100%)', boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.15)' },
    properties: { color: '#ffffff', roughness: 0.04, metalness: 0.0, clearcoat: 1.0, shaderType: 'standard' }
  },
  {
    id: 'mesh_carbon',
    name: 'Carbon Fiber',
    collection: 'Stone & Organic',
    description: 'Patterned black high-tech structural grid.',
    previewStyle: { background: 'repeating-linear-gradient(45deg, #111 0px, #111 2px, #222 2px, #222 4px), radial-gradient(circle at 30% 30%, #37474f 0%, #212121 70%, #050505 100%)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.6)' },
    properties: { color: '#2c3e50', roughness: 0.4, metalness: 0.75, shaderType: 'standard' }
  }
];

export function ModelMaterialEditor({ obj, handlePropertyChange, handleMultiplePropertiesChange }: ModelMaterialEditorProps) {
  const t = useTheme();
  const { addToast } = useEditorStore();
  
  // Model state variables
  const isModel = obj.type === 'model';
  const discoveredMaterials: string[] = obj.properties.discoveredMaterials || [];
  const materialOverrides = obj.properties.materialOverrides || {};
  
  // Selection state (model only)
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  
  // Active flyout view
  const [activeFlyout, setActiveFlyout] = useState<'presets' | 'base' | 'specular' | 'emissive' | 'transmission' | 'textures' | null>(null);

  // Portal container reference for floating slide-out panel
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalNode(document.getElementById('inspector-flyout-portal'));
  }, []);
  
  // Performance optimizing lock states
  const [optimizing, setOptimizing] = useState<Record<string, boolean>>({});
  
  // Preset list filtering state
  const [presetSearch, setPresetSearch] = useState('');
  const [flyoutSearchQuery, setFlyoutSearchQuery] = useState('');
  const [selectedPresetCollection, setSelectedPresetCollection] = useState<string>('All');

  // Set default material selection for models
  useEffect(() => {
    if (isModel && discoveredMaterials.length > 0 && !selectedMaterial) {
      setSelectedMaterial(discoveredMaterials[0]);
    }
  }, [discoveredMaterials, selectedMaterial, isModel]);

  // Sync selectedMaterial with selectedSubObjectPath's materialName if available
  useEffect(() => {
    if (isModel && obj.properties?.selectedSubObjectPath && obj.properties?.discoveredSubObjects) {
      const findSubObjectByPath = (node: any, targetPath: string): any => {
        if (!node) return null;
        if (node.id === targetPath) return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findSubObjectByPath(child, targetPath);
            if (found) return found;
          }
        }
        return null;
      };
      const subNode = findSubObjectByPath(obj.properties.discoveredSubObjects, obj.properties.selectedSubObjectPath);
      if (subNode && subNode.materialName && discoveredMaterials.includes(subNode.materialName)) {
        setSelectedMaterial(subNode.materialName);
      }
    }
  }, [obj.properties?.selectedSubObjectPath, obj.properties?.discoveredSubObjects, discoveredMaterials, isModel]);

  // Read field helper that abstracts Models (overrides) vs Primitives (direct properties)
  const getFieldValue = (key: string, defaultValue: any) => {
    if (isModel) {
      const currentOverride = materialOverrides[selectedMaterial] || {};
      return currentOverride[key] !== undefined ? currentOverride[key] : defaultValue;
    } else {
      return obj.properties[key] !== undefined ? obj.properties[key] : defaultValue;
    }
  };

  // Write single field helper
  const handleUpdateField = (key: string, value: any) => {
    if (isModel) {
      const currentOverride = materialOverrides[selectedMaterial] || {};
      const updatedOverrides = {
        ...materialOverrides,
        [selectedMaterial]: {
          ...currentOverride,
          [key]: value
        }
      };
      handlePropertyChange('materialOverrides', updatedOverrides);
    } else {
      handlePropertyChange(key, value);
    }
  };

  // Write multiple fields helper (for presets)
  const handleUpdateMultipleFields = (updates: Record<string, any>) => {
    if (isModel) {
      const currentOverride = materialOverrides[selectedMaterial] || {};
      const updatedOverrides = {
        ...materialOverrides,
        [selectedMaterial]: {
          ...currentOverride,
          ...updates
        }
      };
      handlePropertyChange('materialOverrides', updatedOverrides);
    } else {
      if (handleMultiplePropertiesChange) {
        handleMultiplePropertiesChange(updates);
      } else {
        Object.entries(updates).forEach(([k, v]) => {
          handlePropertyChange(k, v);
        });
      }
    }
  };

  // Reset helper
  const handleResetMaterial = () => {
    if (isModel) {
      const updatedOverrides = { ...materialOverrides };
      delete updatedOverrides[selectedMaterial];
      handlePropertyChange('materialOverrides', updatedOverrides);
      addToast(`Cleared overrides for GLTF sub-mesh material "${selectedMaterial}"`);
    } else {
      // For primitives, apply a nice base grey standard preset
      const baseStandard = {
        color: '#ffffff',
        roughness: 0.5,
        metalness: 0.1,
        opacity: 1.0,
        emissiveColor: '#000000',
        emissiveIntensity: 0.0,
        clearcoat: 0.0,
        clearcoatRoughness: 0.1,
        transmission: 0.0,
        thickness: 0.0,
        ior: 1.5,
        flatShading: false,
        wireframe: false,
        shaderType: 'standard',
        textureUrl: '',
        normalMapUrl: '',
        roughnessMapUrl: '',
        metalnessMapUrl: '',
        displacementMapUrl: ''
      };
      handleUpdateMultipleFields(baseStandard);
      addToast(`Reset primitive material properties to Standard defaults`);
    }
  };

  // Apply visual preset
  const handleApplyPreset = (preset: MaterialPreset) => {
    // Build update packet
    const updates: Record<string, any> = { ...preset.properties };
    
    // Explicitly reset maps that don't exist in the applied preset to avoid mixing
    const mapFields = ['textureUrl', 'normalMapUrl', 'roughnessMapUrl', 'metalnessMapUrl', 'displacementMapUrl'];
    mapFields.forEach(field => {
      if (!(field in updates)) {
        updates[field] = '';
      }
    });

    handleUpdateMultipleFields(updates);
    addToast(`Applied Spline Preset: ${preset.name}`);
  };

  // Handle texture map downsampling
  const handleOptimizeMap = async (mapField: string, label: string) => {
    const url = getFieldValue(mapField, '');
    if (!url) return;

    setOptimizing(prev => ({ ...prev, [mapField]: true }));
    try {
      const result = await downsampleTexture(url, 1024);
      handleUpdateField(mapField, result.url);
      addToast(`Optimized ${label} texture to 1024px successfully!`);
    } catch (err: any) {
      console.error(err);
      addToast(`Optimization failed: ${err.message || 'CORS or file access issue'}`);
    } finally {
      setOptimizing(prev => ({ ...prev, [mapField]: false }));
    }
  };

  // Model Mesh loading state fallback
  if (isModel && discoveredMaterials.length === 0) {
    return (
      <div className="bg-[#1A1A1A]/30 border border-[#222] p-4 rounded-xl text-center flex flex-col items-center gap-2">
        <RefreshCw size={18} className="text-blue-400 animate-spin" />
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Analyzing 3D Mesh...</span>
        <span className="text-[8.5px] text-gray-500 max-w-[200px] leading-relaxed">
          Parsing sub-mesh hierarchies and embedded textures. Just a moment...
        </span>
      </div>
    );
  }

  // Active Override status check
  const hasActiveOverride = isModel ? (materialOverrides[selectedMaterial] !== undefined) : true;

  // Render values
  const color = getFieldValue('color', '#ffffff');
  const roughness = getFieldValue('roughness', 0.5);
  const metalness = getFieldValue('metalness', 0.1);
  const opacity = getFieldValue('opacity', 1.0);
  const emissiveColor = getFieldValue('emissiveColor', '#000000');
  const emissiveIntensity = getFieldValue('emissiveIntensity', 0.0);
  const clearcoat = getFieldValue('clearcoat', 0.0);
  const clearcoatRoughness = getFieldValue('clearcoatRoughness', 0.1);
  const transmission = getFieldValue('transmission', 0.0);
  const thickness = getFieldValue('thickness', 0.0);
  const ior = getFieldValue('ior', 1.5);
  const flatShading = getFieldValue('flatShading', false);
  const wireframe = getFieldValue('wireframe', false);
  const shaderType = getFieldValue('shaderType', 'standard');

  const textureUrl = getFieldValue('textureUrl', '');
  const normalMapUrl = getFieldValue('normalMapUrl', '');
  const roughnessMapUrl = getFieldValue('roughnessMapUrl', '');
  const metalnessMapUrl = getFieldValue('metalnessMapUrl', '');
  const displacementMapUrl = getFieldValue('displacementMapUrl', '');
  const displacementScale = getFieldValue('displacementScale', 0.05);
  const normalScale = getFieldValue('normalScale', 1.0);
  const textureRepeatX = getFieldValue('textureRepeatX', 1);
  const textureRepeatY = getFieldValue('textureRepeatY', 1);

  // Compute layers summaries
  const isGlassActive = transmission > 0;
  const isGlowActive = emissiveIntensity > 0;
  const isReflectionActive = metalness > 0 || roughness !== 0.5 || clearcoat > 0;
  const activeMapsCount = [textureUrl, normalMapUrl, roughnessMapUrl, metalnessMapUrl, displacementMapUrl].filter(Boolean).length;

  return (
    <div className="relative">
      {/* 1. Main Spline Material Studio Panel */}
      <div className={cn(
        "border rounded-xl p-3 flex flex-col gap-3.5 transition-all",
        t.isLight ? "bg-white border-gray-100" : "bg-[#141416] border-[#2A2A2B]"
      )}>
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-black/10 pb-2">
          <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
            <Palette size={12} className="text-blue-400" />
            Material Studio
          </span>
          <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full font-bold uppercase tracking-wider">
            {shaderType.toUpperCase()}
          </span>
        </div>

        {/* 1.A. Mesh Material Selection (GLTFs only) */}
        {isModel && (
          <div className="flex flex-col gap-1.5 pb-2.5 border-b border-white/5">
            <label className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Select Mesh Material Layer</label>
            <div className="flex gap-2">
              <select
                value={selectedMaterial}
                onChange={(e) => {
                  setSelectedMaterial(e.target.value);
                  setActiveFlyout(null); // Close active flyouts when changing layers
                }}
                className="flex-1 bg-black/60 text-[10.5px] text-white border border-[#2B2B2B] rounded px-2.5 py-1.5 focus:border-blue-500 outline-none font-mono"
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

              {isModel && hasActiveOverride && (
                <button
                  onClick={handleResetMaterial}
                  className="px-2.5 bg-red-950/40 hover:bg-red-900/30 border border-red-500/20 rounded-md text-red-400 text-[10px] font-bold hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset sub-mesh to default textures"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 1.B. Large Library Button */}
        <button
          onClick={() => setActiveFlyout(activeFlyout === 'presets' ? null : 'presets')}
          className={cn(
            "w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between shadow-lg cursor-pointer border",
            activeFlyout === 'presets'
              ? "bg-blue-600 border-blue-500 text-white shadow-blue-600/10"
              : "bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/15 hover:to-purple-600/15 border-blue-500/20 text-blue-400 hover:text-blue-300 hover:border-blue-500/30"
          )}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400 animate-pulse" />
            Spline Preset Library
          </span>
          <div className="flex items-center gap-0.5">
            <span className="text-[8px] bg-blue-500/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest text-blue-400 scale-90">Browse</span>
            <ChevronRight size={12} className={cn("transition-transform", activeFlyout === 'presets' && "rotate-90")} />
          </div>
        </button>

        {/* 1.C. Custom Layer Stack */}
        <div className="flex flex-col gap-1.5 mt-1">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
            <Layers size={10} className="text-gray-400" />
            Material Channels (Layers)
          </span>

          <div className="flex flex-col gap-1.5">
            {/* Layer: Base Color & Shader */}
            <div 
              onClick={() => setActiveFlyout(activeFlyout === 'base' ? null : 'base')}
              className={cn(
                "group px-2.5 py-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer",
                activeFlyout === 'base'
                  ? "bg-blue-600/10 border-blue-500/40"
                  : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/30"
              )}
            >
              <div className="flex items-center gap-2">
                <Palette size={13} className="text-blue-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-200">Base Color & Shader</span>
                  <span className="text-[8px] text-gray-500 font-mono capitalize">{shaderType} model</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded border border-white/10 shadow-sm shrink-0" style={{ backgroundColor: color }} />
                <ChevronRight size={12} className="text-gray-600 group-hover:text-gray-400" />
              </div>
            </div>

            {/* Layer: Reflection & Gloss */}
            <div 
              onClick={() => setActiveFlyout(activeFlyout === 'specular' ? null : 'specular')}
              className={cn(
                "group px-2.5 py-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer",
                activeFlyout === 'specular'
                  ? "bg-blue-600/10 border-blue-500/40"
                  : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/30"
              )}
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={13} className={cn("shrink-0", isReflectionActive ? "text-purple-400" : "text-gray-600")} />
                <div className="flex flex-col">
                  <span className={cn("text-[10px] font-bold", isReflectionActive ? "text-gray-200" : "text-gray-500")}>Reflection & Gloss</span>
                  <span className="text-[8px] text-gray-500 font-mono">Rough: {roughness.toFixed(1)} | Metal: {metalness.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateMultipleFields({
                      roughness: roughness === 0.5 ? 0.05 : 0.5,
                      metalness: metalness === 0.1 ? 0.95 : 0.1
                    });
                  }}
                  className="p-1 hover:bg-white/5 rounded"
                >
                  {isReflectionActive ? <Eye size={12} className="text-purple-400" /> : <EyeOff size={12} className="text-gray-600" />}
                </button>
                <ChevronRight size={12} className="text-gray-600 group-hover:text-gray-400" />
              </div>
            </div>

            {/* Layer: Glass & Refraction */}
            <div 
              onClick={() => setActiveFlyout(activeFlyout === 'transmission' ? null : 'transmission')}
              className={cn(
                "group px-2.5 py-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer",
                activeFlyout === 'transmission'
                  ? "bg-blue-600/10 border-blue-500/40"
                  : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/30"
              )}
            >
              <div className="flex items-center gap-2">
                <Droplet size={13} className={cn("shrink-0", isGlassActive ? "text-cyan-400 animate-pulse" : "text-gray-600")} />
                <div className="flex flex-col">
                  <span className={cn("text-[10px] font-bold", isGlassActive ? "text-gray-200" : "text-gray-500")}>Glass & Refraction</span>
                  <span className="text-[8px] text-gray-500 font-mono">Transmission: {(transmission * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateField('transmission', isGlassActive ? 0.0 : 0.9);
                    if (!isGlassActive) {
                      handleUpdateField('roughness', 0.02);
                      handleUpdateField('metalness', 0.0);
                      handleUpdateField('opacity', 0.3);
                      handleUpdateField('shaderType', 'physical');
                    }
                  }}
                  className="p-1 hover:bg-white/5 rounded"
                >
                  {isGlassActive ? <Eye size={12} className="text-cyan-400" /> : <EyeOff size={12} className="text-gray-600" />}
                </button>
                <ChevronRight size={12} className="text-gray-600 group-hover:text-gray-400" />
              </div>
            </div>

            {/* Layer: Glow & Emission */}
            <div 
              onClick={() => setActiveFlyout(activeFlyout === 'emissive' ? null : 'emissive')}
              className={cn(
                "group px-2.5 py-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer",
                activeFlyout === 'emissive'
                  ? "bg-blue-600/10 border-blue-500/40"
                  : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/30"
              )}
            >
              <div className="flex items-center gap-2">
                <Flame size={13} className={cn("shrink-0", isGlowActive ? "text-orange-400" : "text-gray-600")} />
                <div className="flex flex-col">
                  <span className={cn("text-[10px] font-bold", isGlowActive ? "text-gray-200" : "text-gray-500")}>Glow & Emission</span>
                  <span className="text-[8px] text-gray-500 font-mono">Intensity: {emissiveIntensity.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateField('emissiveIntensity', isGlowActive ? 0.0 : 2.5);
                    if (!isGlowActive && emissiveColor === '#000000') {
                      handleUpdateField('emissiveColor', color !== '#ffffff' ? color : '#00f2ff');
                    }
                  }}
                  className="p-1 hover:bg-white/5 rounded"
                >
                  {isGlowActive ? <Eye size={12} className="text-orange-400" /> : <EyeOff size={12} className="text-gray-600" />}
                </button>
                <ChevronRight size={12} className="text-gray-600 group-hover:text-gray-400" />
              </div>
            </div>

            {/* Layer: Texture Maps */}
            <div 
              onClick={() => setActiveFlyout(activeFlyout === 'textures' ? null : 'textures')}
              className={cn(
                "group px-2.5 py-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer",
                activeFlyout === 'textures'
                  ? "bg-blue-600/10 border-blue-500/40"
                  : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/30"
              )}
            >
              <div className="flex items-center gap-2">
                <ImageIcon size={13} className={cn("shrink-0", activeMapsCount > 0 ? "text-green-400" : "text-gray-600")} />
                <div className="flex flex-col">
                  <span className={cn("text-[10px] font-bold", activeMapsCount > 0 ? "text-gray-200" : "text-gray-500")}>Texture Maps</span>
                  <span className="text-[8px] text-gray-500 font-mono">{activeMapsCount} map channels active</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeMapsCount > 0) {
                      handleUpdateMultipleFields({
                        textureUrl: '',
                        normalMapUrl: '',
                        roughnessMapUrl: '',
                        metalnessMapUrl: '',
                        displacementMapUrl: ''
                      });
                    }
                  }}
                  className="p-1 hover:bg-white/5 rounded"
                  disabled={activeMapsCount === 0}
                >
                  {activeMapsCount > 0 ? <Eye size={12} className="text-green-400" /> : <EyeOff size={12} className="text-gray-600" />}
                </button>
                <ChevronRight size={12} className="text-gray-600 group-hover:text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Global Reset Option for Primitives */}
        {!isModel && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetMaterial}
              className="text-[9px] font-bold text-gray-500 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 size={10} />
              Reset Material Defaults
            </button>
          </div>
        )}
      </div>

      {/* 2. Floating Sliding Flyout Panel (Slides to the left!) */}
      {activeFlyout && portalNode && createPortal(
        <div 
          className={cn(
            "absolute right-[100%] mr-3 top-[80px] w-[310px] rounded-xl border shadow-2xl p-4 flex flex-col gap-3.5 z-50 animate-in slide-in-from-right-4 fade-in duration-200 backdrop-blur-md pointer-events-auto",
            t.isLight ? "bg-white/95 border-gray-200/80 text-gray-800 shadow-black/5" : "bg-[#141416]/95 border-[#2d2d32]/80 text-white shadow-black/80"
          )}
          style={{ minHeight: '390px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              {activeFlyout === 'presets' && <Sparkles size={13} className="text-amber-400" />}
              {activeFlyout === 'base' && <Palette size={13} className="text-blue-400" />}
              {activeFlyout === 'specular' && <SlidersHorizontal size={13} className="text-purple-400" />}
              {activeFlyout === 'transmission' && <Droplet size={13} className="text-cyan-400" />}
              {activeFlyout === 'emissive' && <Flame size={13} className="text-orange-400" />}
              {activeFlyout === 'textures' && <ImageIcon size={13} className="text-green-400" />}
              <span className="text-[11px] font-extrabold uppercase tracking-wider">
                {activeFlyout === 'presets' && 'Preset Material Assets'}
                {activeFlyout === 'base' && 'Base Color & Shading'}
                {activeFlyout === 'specular' && 'Reflection & Clearcoat'}
                {activeFlyout === 'transmission' && 'Glass Refraction'}
                {activeFlyout === 'emissive' && 'Bioluminescent Glow'}
                {activeFlyout === 'textures' && 'Texture Map Channels'}
              </span>
            </div>
            <button 
              onClick={() => setActiveFlyout(null)}
              className="p-1 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </div>

          {/* Search Filter Input at the top of Flyout Panel */}
          <div className="relative shrink-0 border-b border-white/5 pb-2">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeFlyout} collections or material properties...`}
              value={flyoutSearchQuery}
              onChange={(e) => {
                setFlyoutSearchQuery(e.target.value);
                setPresetSearch(e.target.value);
              }}
              className="w-full pl-7 pr-7 py-1.5 bg-black/50 text-[10.5px] border border-white/10 rounded-lg focus:border-blue-500 outline-none font-mono text-white placeholder-gray-500 transition-colors"
            />
            {flyoutSearchQuery && (
              <button onClick={() => { setFlyoutSearchQuery(''); setPresetSearch(''); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X size={10} />
              </button>
            )}
          </div>

          {/* Flyout Contents */}
          <div className="flex-1 overflow-y-auto pr-1 max-h-[440px] scrollbar-thin scrollbar-thumb-white/10 flex flex-col gap-3.5">
            
            {/* VIEW A: PRESETS LIBRARY */}
            {activeFlyout === 'presets' && (
              <div className="flex flex-col gap-3">
                {/* Categories Tab Selector */}
                <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1 shrink-0">
                  {['All', 'Metals', 'Glass & Gems', 'Toon & Pop', 'Abstract & Glow', 'Stone & Organic'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedPresetCollection(cat)}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest border transition-all shrink-0 cursor-pointer",
                        selectedPresetCollection === cat
                          ? "bg-blue-600/20 border-blue-500/30 text-blue-400"
                          : "bg-black/30 border-transparent text-gray-500 hover:text-white"
                      )}
                    >
                      {cat.replace('& ', '')}
                    </button>
                  ))}
                </div>

                {/* Presets Grid */}
                <div className="grid grid-cols-2 gap-2 pb-2">
                  {SPLINE_MATERIAL_PRESETS.filter(p => {
                    const query = (flyoutSearchQuery || presetSearch).toLowerCase();
                    const matchesSearch = p.name.toLowerCase().includes(query) || 
                                         p.description.toLowerCase().includes(query) ||
                                         p.collection.toLowerCase().includes(query);
                    const matchesCat = selectedPresetCollection === 'All' || p.collection === selectedPresetCollection;
                    return matchesSearch && matchesCat;
                  }).map(preset => {
                    // Check if active override matches preset color/shader
                    const isApplied = color === preset.properties.color && shaderType === (preset.properties.shaderType || 'standard');

                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('material-preset', JSON.stringify(preset.properties));
                          e.dataTransfer.setData('material-name', preset.name);
                          e.dataTransfer.setData('application/json', JSON.stringify({
                            type: 'material',
                            preset: preset.properties,
                            name: preset.name
                          }));
                        }}
                        title="Click to apply or Drag & Drop directly onto 3D Object in Viewport"
                        className={cn(
                          "p-2 rounded-xl border text-left flex flex-col gap-1.5 transition-all group cursor-grab active:cursor-grabbing",
                          isApplied 
                            ? "bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/5" 
                            : "bg-black/30 border-white/5 hover:border-gray-500 hover:bg-black/40"
                        )}
                      >
                        {/* Sphere Thumbnail */}
                        <div className="w-full h-16 rounded-lg relative overflow-hidden flex items-center justify-center border border-white/5 bg-[#111] shrink-0">
                          {/* Beautiful sphere gradient */}
                          <div 
                            style={preset.previewStyle} 
                            className="w-12 h-12 rounded-full transform group-hover:scale-110 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1 right-1 text-[6.5px] uppercase font-bold px-1.5 py-0.5 rounded-[4px] bg-black/60 text-gray-400 border border-white/5 scale-90">
                            {preset.collection.replace(' & Gems', '').replace(' & Glow', '').replace(' & Pop', '')}
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[10px] font-bold text-white truncate leading-tight group-hover:text-blue-300 transition-colors">
                            {preset.name}
                          </span>
                          <span className="text-[7.5px] text-gray-500 line-clamp-2 leading-tight">
                            {preset.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW B: BASE PROPERTIES */}
            {activeFlyout === 'base' && (
              <div className="flex flex-col gap-3.5">
                {/* Shader Models */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono">Lighting Shader Model</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'standard', name: 'Standard PBR', desc: 'Realistic surface PBR model', badge: 'border-blue-500/20 text-blue-400' },
                      { id: 'physical', name: 'Physical Glass', desc: 'Adds transparency/refraction', badge: 'border-cyan-500/20 text-cyan-400' },
                      { id: 'toon', name: 'Toon Anime 🎨', desc: 'Flat retro cell shading', badge: 'border-purple-500/20 text-purple-400' },
                      { id: 'basic', name: 'Basic Unlit', desc: 'No shadows, flat color', badge: 'border-orange-500/20 text-orange-400' },
                      { id: 'normal', name: 'Normals View', desc: 'Renders vectors directly', badge: 'border-rose-500/20 text-rose-400' }
                    ].map(s => {
                      const active = shaderType === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleUpdateField('shaderType', s.id)}
                          className={cn(
                            "p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all cursor-pointer",
                            active 
                              ? `bg-blue-600/10 border-blue-500 shadow` 
                              : "bg-black/30 border-white/5 text-gray-400 hover:border-white/10 hover:text-white"
                          )}
                        >
                          <span className="text-[10px] font-extrabold leading-tight">{s.name}</span>
                          <span className="text-[7.5px] text-gray-500 leading-snug">{s.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Diffuse color picker */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                  <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono">Solid Diffuse Base Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={color}
                      onChange={(e) => handleUpdateField('color', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 outline-none p-0"
                    />
                    <input 
                      type="text" 
                      value={color.toUpperCase()}
                      onChange={(e) => handleUpdateField('color', e.target.value)}
                      className="bg-black/40 text-[11px] font-mono p-2 rounded-md flex-1 border border-white/5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Opacity slider */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Layer Opacity (Alpha)</span>
                    <span className="text-blue-400 font-mono">{(opacity * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.0" 
                    max="1.0" 
                    step="0.05" 
                    value={opacity} 
                    onChange={(e) => handleUpdateField('opacity', parseFloat(e.target.value))}
                    className="accent-blue-500 w-full h-1 cursor-pointer"
                  />
                </div>

                {/* Switches */}
                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-[9.5px] text-gray-400">Wireframe</span>
                    <input 
                      type="checkbox" 
                      checked={wireframe}
                      onChange={(e) => handleUpdateField('wireframe', e.target.checked)}
                      className="accent-blue-500 cursor-pointer h-3 w-3"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-[9.5px] text-gray-400">Flat Shading</span>
                    <input 
                      type="checkbox" 
                      checked={flatShading}
                      onChange={(e) => handleUpdateField('flatShading', e.target.checked)}
                      className="accent-blue-500 cursor-pointer h-3 w-3"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VIEW C: REFLECTION & COAT */}
            {activeFlyout === 'specular' && (
              <div className="flex flex-col gap-4">
                {/* Roughness */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Surface Roughness</span>
                    <span className="text-blue-400 font-mono">{roughness.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-gray-600">Glossy</span>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="1.0" 
                      step="0.02" 
                      value={roughness} 
                      onChange={(e) => handleUpdateField('roughness', parseFloat(e.target.value))}
                      className="accent-blue-500 flex-1 h-1 cursor-pointer"
                    />
                    <span className="text-[8px] text-gray-600">Matte</span>
                  </div>
                </div>

                {/* Metalness */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
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
                      step="0.02" 
                      value={metalness} 
                      onChange={(e) => handleUpdateField('metalness', parseFloat(e.target.value))}
                      className="accent-blue-500 flex-1 h-1 cursor-pointer"
                    />
                    <span className="text-[8px] text-gray-600">Metallic</span>
                  </div>
                </div>

                {/* Clearcoat */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Clearcoat Shell Layer</span>
                    <span className="text-blue-400 font-mono">{clearcoat.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.0" 
                    max="1.0" 
                    step="0.05" 
                    value={clearcoat} 
                    onChange={(e) => handleUpdateField('clearcoat', parseFloat(e.target.value))}
                    className="accent-blue-500 w-full h-1 cursor-pointer"
                  />
                  <span className="text-[7.5px] text-gray-500 leading-snug">
                    Simulates a thin epoxy/lacquer reflective shell layered over the material base color.
                  </span>
                </div>

                {/* Clearcoat roughness */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Clearcoat Roughness</span>
                    <span className="text-blue-400 font-mono">{clearcoatRoughness.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.0" 
                    max="1.0" 
                    step="0.05" 
                    value={clearcoatRoughness} 
                    onChange={(e) => handleUpdateField('clearcoatRoughness', parseFloat(e.target.value))}
                    className="accent-blue-500 w-full h-1 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* VIEW D: GLASS REFRACTION */}
            {activeFlyout === 'transmission' && (
              <div className="flex flex-col gap-3.5">
                {/* Transmission Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Light Transmission (Transparency)</span>
                    <span className="text-cyan-400 font-mono">{(transmission * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.0" 
                    max="1.0" 
                    step="0.05" 
                    value={transmission} 
                    onChange={(e) => {
                      handleUpdateField('transmission', parseFloat(e.target.value));
                      if (parseFloat(e.target.value) > 0 && shaderType !== 'physical') {
                        handleUpdateField('shaderType', 'physical');
                      }
                    }}
                    className="accent-cyan-500 w-full h-1 cursor-pointer"
                  />
                  <span className="text-[7.5px] text-gray-500 leading-snug">
                    Allows light to pass through for physical volumetric glass refraction effects. Best on "Physical" shader!
                  </span>
                </div>

                {/* Thickness Slider */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Glass Volume Thickness</span>
                    <span className="text-cyan-400 font-mono">{thickness.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.0" 
                    max="10.0" 
                    step="0.1" 
                    value={thickness} 
                    onChange={(e) => handleUpdateField('thickness', parseFloat(e.target.value))}
                    className="accent-cyan-500 w-full h-1 cursor-pointer"
                  />
                </div>

                {/* Index of refraction slider */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Index of Refraction (IOR)</span>
                    <span className="text-cyan-400 font-mono">{ior.toFixed(3)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1.0" 
                    max="2.5" 
                    step="0.01" 
                    value={ior} 
                    onChange={(e) => handleUpdateField('ior', parseFloat(e.target.value))}
                    className="accent-cyan-500 w-full h-1 cursor-pointer"
                  />
                </div>

                {/* Refractive presets */}
                <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                  <span className="text-[8.5px] text-gray-500 font-bold uppercase tracking-wider font-mono">Refraction Quick Presets</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { name: '💨 Air (1.0)', val: 1.0 },
                      { name: '💧 Water (1.33)', val: 1.33 },
                      { name: '🥃 Glass (1.50)', val: 1.50 },
                      { name: '💎 Emerald (1.57)', val: 1.57 },
                      { name: '💍 Sapphire (1.76)', val: 1.76 },
                      { name: '🌟 Diamond (2.42)', val: 2.42 },
                    ].map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => handleUpdateField('ior', preset.val)}
                        className={cn(
                          "py-1 rounded text-[7.5px] font-bold border transition-all cursor-pointer text-center",
                          ior === preset.val
                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                            : "bg-black/30 border-transparent text-gray-400 hover:text-white"
                        )}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW E: GLOW & EMISSION */}
            {activeFlyout === 'emissive' && (
              <div className="flex flex-col gap-4">
                {/* Glow Color */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono">Glow (Emissive) Tint Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={emissiveColor}
                      onChange={(e) => handleUpdateField('emissiveColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 outline-none p-0"
                    />
                    <input 
                      type="text" 
                      value={emissiveColor.toUpperCase()}
                      onChange={(e) => handleUpdateField('emissiveColor', e.target.value)}
                      className="bg-black/40 text-[11px] font-mono p-2 rounded-md flex-1 border border-white/5 text-white outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Glow Intensity */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Emission Glow Intensity</span>
                    <span className="text-orange-400 font-mono">{emissiveIntensity.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.0" 
                    max="10.0" 
                    step="0.1" 
                    value={emissiveIntensity} 
                    onChange={(e) => handleUpdateField('emissiveIntensity', parseFloat(e.target.value))}
                    className="accent-orange-500 w-full h-1 cursor-pointer"
                  />
                  <span className="text-[7.5px] text-gray-500 leading-snug">
                    Sets the self-illumination amount of the surface. Looks spectacular in low-light environments or under bloom effects!
                  </span>
                </div>
              </div>
            )}

            {/* VIEW F: TEXTURE MAPS */}
            {activeFlyout === 'textures' && (
              <div className="flex flex-col gap-3.5">
                <span className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider font-mono">Active Channel Map Slots</span>
                
                {[
                  { key: 'textureUrl', label: 'Base Diffuse (Color) Map', placeholder: 'Drop diffuse map...' },
                  { key: 'normalMapUrl', label: 'Surface Normal (Bump) Map', placeholder: 'Drop bump/normal map...' },
                  { key: 'roughnessMapUrl', label: 'Specular Roughness Map', placeholder: 'Drop roughness spec map...' },
                  { key: 'metalnessMapUrl', label: 'Specular Metalness Map', placeholder: 'Drop metalness spec map...' },
                  { key: 'displacementMapUrl', label: 'Height Displacement Map', placeholder: 'Drop height/displacement...' }
                ].map(slot => {
                  const mapVal = getFieldValue(slot.key, '');
                  const hasVal = !!mapVal;
                  const isOptimizing = optimizing[slot.key] || false;

                  return (
                    <div key={slot.key} className="bg-black/20 border border-white/5 rounded-lg p-2.5 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-300">{slot.label}</span>
                        
                        {hasVal && (
                          <button
                            disabled={isOptimizing}
                            onClick={() => handleOptimizeMap(slot.key, slot.label)}
                            className="text-[7px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase hover:bg-blue-500/20 hover:text-white transition-all flex items-center gap-1 cursor-pointer scale-90"
                          >
                            {isOptimizing ? (
                              <RefreshCw size={8} className="animate-spin" />
                            ) : (
                              <Zap size={8} className="text-yellow-400" />
                            )}
                            <span>Compress to 1K</span>
                          </button>
                        )}
                      </div>

                      <MediaAssetPicker
                        type="image"
                        accept="image/*"
                        value={mapVal}
                        onChange={(url) => handleUpdateField(slot.key, url)}
                        placeholder={slot.placeholder}
                      />
                    </div>
                  );
                })}

                {/* Normal & Displacement Scales */}
                {(displacementMapUrl || normalMapUrl) && (
                  <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 mt-1 flex flex-col gap-3">
                    <span className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider font-mono">Channel Scaling</span>
                    
                    {normalMapUrl && (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px]">
                          <span className="text-gray-500">Normal Map Bump Strength</span>
                          <span className="text-green-400 font-mono">{normalScale.toFixed(2)}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="2.5" 
                          step="0.05" 
                          value={normalScale} 
                          onChange={(e) => handleUpdateField('normalScale', parseFloat(e.target.value))}
                          className="accent-green-500 w-full h-1 cursor-pointer"
                        />
                      </div>
                    )}

                    {displacementMapUrl && (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px]">
                          <span className="text-gray-500">Displacement Height scale</span>
                          <span className="text-green-400 font-mono">{displacementScale.toFixed(3)}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="0.5" 
                          step="0.01" 
                          value={displacementScale} 
                          onChange={(e) => handleUpdateField('displacementScale', parseFloat(e.target.value))}
                          className="accent-green-500 w-full h-1 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Texture Wrap & repeat */}
                {activeMapsCount > 0 && (
                  <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 mt-1 flex flex-col gap-3">
                    <span className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider font-mono">Map wrapping coordinates</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-gray-500">Repeat X: {textureRepeatX}</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          step="1"
                          value={textureRepeatX} 
                          onChange={(e) => handleUpdateField('textureRepeatX', parseInt(e.target.value))}
                          className="accent-blue-500 w-full h-1 cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-gray-500">Repeat Y: {textureRepeatY}</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          step="1"
                          value={textureRepeatY} 
                          onChange={(e) => handleUpdateField('textureRepeatY', parseInt(e.target.value))}
                          className="accent-blue-500 w-full h-1 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>,
        portalNode
      )}
    </div>
  );
}
