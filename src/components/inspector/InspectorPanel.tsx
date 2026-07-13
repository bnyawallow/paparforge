import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { fileToDataUrl } from '../../lib/fileUtils';
import { SupabaseService } from '../../services/supabaseService';
import { Upload } from 'lucide-react';

const MEDIA_PRESETS: Record<string, Array<{ name: string; url: string }>> = {
  model: [
    { name: 'Astronaut 🚀', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
    { name: 'Toy Retro Car 🚗', url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb' },
    { name: 'Expressive Robot 🤖', url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb' },
    { name: 'Bronze Vase 🏺', url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/VaseBronze/glTF-Binary/VaseBronze.glb' },
    { name: 'Vintage Lantern 🏮', url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Lantern/glTF-Binary/Lantern.glb' },
    { name: 'E-Comm Sneaker 👟', url: 'https://modelviewer.dev/shared-assets/models/MaterialsVariantsShoe.glb' },
  ],
  image: [
    { name: 'Magazine Cover 📖', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop' },
    { name: 'Abstract Art 🎨', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
    { name: 'Contour Map 🗺️', url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop' },
    { name: 'Blueprint Grid 📐', url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600&auto=format&fit=crop' },
  ],
  audio: [
    { name: 'Cyber Click 🎵', url: '/sounds/cyber_click.wav' },
    { name: 'Success Chime ✨', url: '/sounds/success_chime.wav' },
    { name: 'Robot Beep 🤖', url: '/sounds/robot_beep.wav' },
    { name: 'Forest Ambient 🌲', url: '/sounds/forest_ambient.wav' },
  ],
  video: [
    { name: 'Abstract Tunnel 🌀', url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05c5c839d39e7fa17b4474775836a0c&profile_id=139&oauth2_token_id=57447761' },
    { name: 'Nature Forest 🌲', url: 'https://player.vimeo.com/external/435674703.sd.mp4?s=6f4188cbcd97ec1994e66699319e0094038a306f&profile_id=139&oauth2_token_id=57447761' },
    { name: 'Tech Matrix 💻', url: 'https://player.vimeo.com/external/430810795.sd.mp4?s=d740c83a15af820c7cc61899532551e18cc8ef24&profile_id=139&oauth2_token_id=57447761' }
  ]
};

interface MediaAssetPickerProps {
  value: string;
  onChange: (url: string) => void;
  type: 'model' | 'image' | 'video' | 'audio';
  accept: string;
  placeholder?: string;
  label?: string;
}

function MediaAssetPicker({ value, onChange, type, accept, placeholder = "Paste URL or Select...", label }: MediaAssetPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { assets, addAsset, settings } = useEditorStore();
  const projectName = settings?.projectName || 'AR Experience';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      let fileUrl = '';
      if (SupabaseService.isConfigured()) {
        fileUrl = await SupabaseService.uploadAsset(file, projectName);
      } else {
        fileUrl = await fileToDataUrl(file);
      }
      
      onChange(fileUrl);

      const newAsset = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: type,
        url: fileUrl
      };
      addAsset(newAsset);
    } catch (err) {
      console.error("Asset upload failed:", err);
      try {
        const fallbackUrl = await fileToDataUrl(file);
        onChange(fallbackUrl);
        const newAsset = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          type: type,
          url: fallbackUrl
        };
        addAsset(newAsset);
      } catch (fallbackErr) {
        console.error("DataURL fallback failed:", fallbackErr);
      }
    } finally {
      setUploading(false);
    }
  };

  const matchingStudioAssets = assets.filter(a => a.type === type);
  const presetsList = MEDIA_PRESETS[type] || [];

  return (
    <div className="flex flex-col gap-1 w-full relative" ref={dropdownRef}>
      {label && <label className="text-[10px] text-[#666] font-medium">{label}</label>}
      <div className="flex gap-1.5 items-center">
        <input 
          type="text" 
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-[#0A0A0A] text-[10px] font-mono p-2 rounded flex-1 border border-[#222] focus:border-blue-500 text-white outline-none min-w-0"
        />

        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1 px-2.5 py-2 bg-[#1C1C1C] hover:bg-[#262626] border border-[#2C2C2C] rounded text-[10px] text-gray-300 font-bold font-sans transition-colors cursor-pointer shrink-0"
          title="Select from Asset Studio or Presets"
        >
          <Folder size={11} className="text-blue-400" />
          <span>Pick</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-2.5 py-2 bg-[#1C1C1C] hover:bg-[#262626] border border-[#2C2C2C] disabled:opacity-50 rounded text-[10px] font-bold font-mono transition-colors text-white cursor-pointer shrink-0"
        >
          {uploading ? (
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Upload size={11} className="text-gray-400" />
          )}
          <span>{uploading ? "..." : "Upload"}</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />
      </div>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-[#141414] border border-[#2A2A2A] rounded-md shadow-2xl z-50 flex flex-col max-h-60 overflow-hidden font-sans">
          
          <div className="flex-1 overflow-y-auto p-1 border-b border-[#222]">
            <div className="px-2 py-1 text-[9px] font-bold text-blue-400 uppercase tracking-wider">Asset Studio (My Uploads)</div>
            {matchingStudioAssets.length === 0 ? (
              <div className="px-2 py-1.5 text-[10px] text-[#666] italic">No uploads yet. Upload a file above!</div>
            ) : (
              matchingStudioAssets.map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    onChange(asset.url);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#222] rounded text-[10px] text-white flex items-center justify-between group transition-colors"
                >
                  <span className="truncate flex-1 pr-2 text-left">{asset.name}</span>
                  <span className="text-[8px] bg-[#222] group-hover:bg-[#333] px-1 py-0.5 rounded text-gray-500 font-mono">My Asset</span>
                </button>
              ))
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-1 max-h-40">
            <div className="px-2 py-1 text-[9px] font-bold text-green-400 uppercase tracking-wider">Asset Presets Library</div>
            {presetsList.map(preset => (
              <button
                key={preset.url}
                type="button"
                onClick={() => {
                  onChange(preset.url);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-[#222] rounded text-[10px] text-white flex items-center justify-between transition-colors"
              >
                <span className="truncate">{preset.name}</span>
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
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
  ChevronDown,
  Lightbulb,
  Folder,
  FolderMinus,
  MousePointerClick
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

const MATERIAL_LIBRARY: Array<{
  id: string;
  name: string;
  category: string;
  description: string;
  previewUrl: string;
  properties: Record<string, any>;
}> = [
  {
    id: 'gold',
    name: '🏆 Polished Gold',
    category: 'Metals',
    description: 'Highly reflective, rich gold metallic finish.',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#ffd700',
      roughness: 0.08,
      metalness: 1.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.05,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      transmission: 0,
      flatShading: false,
    }
  },
  {
    id: 'copper',
    name: '🪙 Polished Copper',
    category: 'Metals',
    description: 'Shiny warm copper metallic finish.',
    previewUrl: 'https://images.unsplash.com/photo-1605557626697-2e87166a88f9?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#b87333',
      roughness: 0.12,
      metalness: 1.0,
      clearcoat: 0.4,
      clearcoatRoughness: 0.08,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      transmission: 0,
      flatShading: false,
    }
  },
  {
    id: 'chrome',
    name: '🪞 Chrome Mirror',
    category: 'Metals',
    description: 'Perfect mirror-like metallic reflection.',
    previewUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#ffffff',
      roughness: 0.01,
      metalness: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      transmission: 0,
      flatShading: false,
    }
  },
  {
    id: 'brushed_steel',
    name: '⚙️ Brushed Steel',
    category: 'Metals',
    description: 'Anisotropic brushed industrial steel look.',
    previewUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#a1a1aa',
      roughness: 0.35,
      metalness: 0.95,
      clearcoat: 0,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      transmission: 0,
      flatShading: false,
    }
  },
  {
    id: 'rusty_iron',
    name: '🏚️ Rusty Iron',
    category: 'Metals',
    description: 'Rough, oxidized dark rusty iron plate.',
    previewUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#451a03',
      roughness: 0.85,
      metalness: 0.3,
      clearcoat: 0,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      transmission: 0,
      flatShading: false,
    }
  },
  {
    id: 'glass',
    name: '💎 Pure Glass',
    category: 'Glass & Gems',
    description: 'Physical transmissive clear solid glass.',
    previewUrl: 'https://images.unsplash.com/photo-1598432439360-504c32e93cc3?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#ffffff',
      roughness: 0.05,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transmission: 1.0,
      thickness: 1.5,
      ior: 1.52,
      opacity: 1.0,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      flatShading: false,
    }
  },
  {
    id: 'frozen_glass',
    name: '❄️ Frost Glass',
    category: 'Glass & Gems',
    description: 'Rough translucent frosted glass pane.',
    previewUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#e0f2fe',
      roughness: 0.45,
      metalness: 0.0,
      clearcoat: 0.2,
      clearcoatRoughness: 0.2,
      transmission: 0.85,
      thickness: 1.0,
      ior: 1.45,
      opacity: 0.9,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      flatShading: false,
    }
  },
  {
    id: 'ruby',
    name: '❤️ Ruby Crystal',
    category: 'Glass & Gems',
    description: 'Translucent rich red polished gemstone.',
    previewUrl: 'https://images.unsplash.com/photo-1551376347-075b0121a65b?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#dc2626',
      roughness: 0.04,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      transmission: 0.92,
      thickness: 2.0,
      ior: 1.76,
      opacity: 1.0,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      flatShading: false,
    }
  },
  {
    id: 'emerald',
    name: '💚 Emerald Gem',
    category: 'Glass & Gems',
    description: 'Translucent glowing deep green precious gem.',
    previewUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#059669',
      roughness: 0.06,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      transmission: 0.9,
      thickness: 2.0,
      ior: 1.57,
      opacity: 1.0,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      flatShading: false,
    }
  },
  {
    id: 'polished_marble',
    name: '🏺 Polished Marble',
    category: 'Stone & Ceramic',
    description: 'Ultra-glossy white ceramic marble material.',
    previewUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#fafaf9',
      roughness: 0.05,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      transmission: 0,
      flatShading: false,
    }
  },
  {
    id: 'obsidian',
    name: '🌋 Dark Obsidian',
    category: 'Stone & Ceramic',
    description: 'Glossy pitch-black volcanic glass rock.',
    previewUrl: 'https://images.unsplash.com/photo-1611085583191-a3b1a30a8a0a?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#0c0a09',
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 0.9,
      clearcoatRoughness: 0.05,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      transmission: 0,
      flatShading: false,
    }
  },
  {
    id: 'matte_ceramic',
    name: '☕ Matte Ceramic',
    category: 'Stone & Ceramic',
    description: 'Soft matte earthenware porous ceramic body.',
    previewUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#f5f5f4',
      roughness: 0.6,
      metalness: 0.0,
      clearcoat: 0,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      transmission: 0,
      flatShading: false,
    }
  },
  {
    id: 'carbon_fiber',
    name: '🏁 Carbon Fiber',
    category: 'Sci-Fi',
    description: 'Specular black checkered weave composites.',
    previewUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#18181b',
      roughness: 0.25,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      transmission: 0,
      flatShading: false,
    }
  },
  {
    id: 'pink_neon',
    name: '💖 Pink Neon Glow',
    category: 'Sci-Fi',
    description: 'Deep emissive electric magenta glowing body.',
    previewUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#ec4899',
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0,
      emissiveColor: '#ec4899',
      emissiveIntensity: 2.5,
      transmission: 0,
      flatShading: false,
    }
  },
  {
    id: 'cyan_glow',
    name: '🌐 Cyber Cyan Glow',
    category: 'Sci-Fi',
    description: 'Bright cybernetic neon light source.',
    previewUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#06b6d4',
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 0,
      emissiveColor: '#06b6d4',
      emissiveIntensity: 3.0,
      transmission: 0,
      flatShading: false,
    }
  },
  {
    id: 'hologram',
    name: '📡 Ghost Hologram',
    category: 'Sci-Fi',
    description: 'Wireframe blue transparent hologram shell.',
    previewUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=120&q=80',
    properties: {
      color: '#06b6d4',
      roughness: 0.2,
      metalness: 0.2,
      opacity: 0.45,
      wireframe: true,
      emissiveColor: '#06b6d4',
      emissiveIntensity: 1.5,
      transmission: 0,
      flatShading: false,
    }
  }
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
  { value: '/sounds/cyber_click.wav', label: '🎵 Cyber Click' },
  { value: '/sounds/success_chime.wav', label: '✨ Success Chime' },
  { value: '/sounds/robot_beep.wav', label: '🤖 Robot Beep' },
  { value: '/sounds/forest_ambient.wav', label: '🌲 Forest Ambient' },
];

function InspectorSection({ title, defaultOpen = true, children, rightElement }: { title: React.ReactNode, defaultOpen?: boolean, children: React.ReactNode, rightElement?: React.ReactNode }) {
  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden border-t border-[#222] pt-4 first:border-0 first:pt-0" open={defaultOpen}>
      <summary className="cursor-pointer list-none flex items-center justify-between select-none mb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#888] uppercase tracking-wider">
          {title}
        </div>
        <div className="flex items-center gap-2">
          {rightElement}
          <ChevronDown className="w-3 h-3 text-[#555] transition-transform group-open:-rotate-180" />
        </div>
      </summary>
      <div className="flex flex-col gap-3 animate-in slide-in-from-top-1 fade-in duration-200">
        {children}
      </div>
    </details>
  );
}

export function InspectorPanel({ width }: { width?: number }) {
  const { 
    objects, 
    selectedObjectId, selectedObjectIds, 
    selectObject,
    updateObject, 
    removeObject, 
    addObject,
    ungroupObject,
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

  const [activePanelTab, setActivePanelTab] = useState<'inspector' | 'lighting'>('inspector');
  const [materialTab, setMaterialTab] = useState<'presets' | 'base' | 'specular' | 'emissive' | 'transmission' | 'textures'>('presets');
  const [fontSearch, setFontSearch] = useState('');
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);

  const handleAddLightObject = (lightType: 'point' | 'spot' | 'directional') => {
    const id = Math.random().toString(36).substring(2, 9);
    const lightNames = {
      point: 'Point Light',
      spot: 'Spot Light',
      directional: 'Directional Light'
    };
    
    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    const newObj = {
      id,
      name: `${lightNames[lightType]} ${Object.values(objects).filter(o => o.type === 'light').length + 1}`,
      type: 'light' as const,
      position: [0, 2, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      visible: true,
      children: [],
      parentId: parentId || null,
      properties: {
        lightType,
        color: lightType === 'directional' ? '#ffffff' : '#ffedd5',
        intensity: lightType === 'directional' ? 2.0 : 3.0,
        distance: 12.0,
        decay: 1.5,
        angle: 0.78
      }
    };

    addObject(newObj, parentId || undefined);
    selectObject(id);
  };

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
      soundPreset: '/sounds/success_chime.wav',
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

  const obj = selectedObjectId ? objects[selectedObjectId] : null;

  const handleVectorChange = (prop: 'position' | 'rotation' | 'scale', index: number, value: string) => {
    if (!obj) return;
    const numValue = parseFloat(value) || 0;

    if (selectedObjectIds && selectedObjectIds.length > 0) {
      selectedObjectIds.forEach(id => {
        if (objects[id]) {
           const o = objects[id];
           const v = [...o[prop]] as Vector3Data;
           v[index] = numValue;
           updateObject(id, { [prop]: v });
        }
      });
    } else {
      const newVec = [...obj[prop]] as Vector3Data;
      newVec[index] = numValue;
      updateObject(selectedObjectId!, { [prop]: newVec });
    }
  };

  const handlePropertyChange = (key: string, value: any) => {
    if (!obj) return;
    if (selectedObjectIds && selectedObjectIds.length > 0) {
      selectedObjectIds.forEach(id => {
        if (objects[id]) {
          updateObject(id, {
            properties: { ...objects[id].properties, [key]: value }
          });
        }
      });
    } else {
      updateObject(selectedObjectId!, {
        properties: { ...obj.properties, [key]: value }
      });
    }
  };

  const handleMultiplePropertiesChange = (updates: Record<string, any>) => {
    if (!obj) return;
    if (selectedObjectIds && selectedObjectIds.length > 0) {
      selectedObjectIds.forEach(id => {
        if (objects[id]) {
          updateObject(id, {
            properties: { ...objects[id].properties, ...updates }
          });
        }
      });
    } else {
      updateObject(selectedObjectId!, {
        properties: { ...obj.properties, ...updates }
      });
    }
  };

  const handleDelete = () => {
    if (selectedObjectIds && selectedObjectIds.length > 0) {
      selectedObjectIds.forEach(id => removeObject(id));
    } else if (selectedObjectId) {
      removeObject(selectedObjectId);
    }
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
      handlePropertyChange('soundUrl', '/sounds/cyber_click.wav');
      handlePropertyChange('soundName', 'Cyber Click');
    }
  };

  const renderLightingPanel = () => {
    const ambientColor = settings.ambientColor || '#ffffff';
    const ambientIntensity = settings.ambientIntensity ?? 0.5;
    const directionalColor = settings.directionalColor || '#ffffff';
    const directionalIntensity = settings.directionalIntensity ?? 1.0;
    const shadowsEnabled = settings.shadowsEnabled ?? true;

    const dynamicLights = Object.values(objects).filter(o => o.type === 'light');

    return (
      <div className="p-4 flex flex-col gap-5">
        <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#222]">
          <h3 className="text-[11px] font-bold text-white flex items-center gap-1.5 mb-1">
            <Sparkles size={12} className="text-yellow-400 animate-pulse" />
            Lighting Studio
          </h3>
          <p className="text-[9px] text-[#888] leading-relaxed">
            Configure global ambient environment illumination, primary direct sunlight, and spawn dynamic 3D light objects with custom colors, distance limits, and intensities.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Add Dynamic Light</span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleAddLightObject('point')}
              className="flex flex-col items-center justify-center py-2 px-1 bg-[#1A1A1A] hover:bg-[#222] hover:border-yellow-500/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
              title="Add a dynamic point light casting glow in all directions"
            >
              <Lightbulb size={14} className="text-yellow-400 group-hover:scale-110 transition-transform duration-100" />
              <span className="text-[8px] font-bold text-gray-400 group-hover:text-white mt-1">Point Light</span>
            </button>

            <button
              onClick={() => handleAddLightObject('spot')}
              className="flex flex-col items-center justify-center py-2 px-1 bg-[#1A1A1A] hover:bg-[#222] hover:border-blue-500/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
              title="Add a spotlight casting focused light cones"
            >
              <Zap size={14} className="text-blue-400 group-hover:scale-110 transition-transform duration-100" />
              <span className="text-[8px] font-bold text-gray-400 group-hover:text-white mt-1">Spot Light</span>
            </button>

            <button
              onClick={() => handleAddLightObject('directional')}
              className="flex flex-col items-center justify-center py-2 px-1 bg-[#1A1A1A] hover:bg-[#222] hover:border-amber-500/40 border border-[#262626] rounded-lg transition-all group cursor-pointer"
              title="Add directional parallel key light sources"
            >
              <Sun size={14} className="text-amber-400 group-hover:scale-110 transition-transform duration-100" />
              <span className="text-[8px] font-bold text-gray-400 group-hover:text-white mt-1">Sun Light</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 border-t border-[#222] pt-4">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Global Atmosphere</span>
          
          <div className="bg-[#1A1A1A]/40 border border-[#222] p-3 rounded-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-300">Ambient Color</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full uppercase font-bold tracking-wider">Global</span>
            </div>
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
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#666]">Ambient Intensity</span>
                <span className="text-yellow-400 font-mono">{ambientIntensity.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="4.0" 
                step="0.05" 
                value={ambientIntensity} 
                onChange={(e) => updateSettings({ ambientIntensity: parseFloat(e.target.value) })}
                className="accent-yellow-500 w-full h-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-[#1A1A1A]/40 border border-[#222] p-3 rounded-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-300">Direct Key Sunlight</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full uppercase font-bold tracking-wider">Global</span>
            </div>
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
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#666]">Sunlight Intensity</span>
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
            <div className="flex items-center justify-between text-[10px] border-t border-black/20 pt-2">
              <span className="text-[#666]">Render Shadow Maps</span>
              <input 
                type="checkbox" 
                checked={shadowsEnabled}
                onChange={(e) => updateSettings({ shadowsEnabled: e.target.checked })}
                className="accent-blue-500 cursor-pointer w-3.5 h-3.5"
              />
            </div>
          </div>

          <div className="bg-[#1A1A1A]/40 border border-[#222] p-3 rounded-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-300">Ambient Soundtrack</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-full uppercase font-bold tracking-wider">Audio</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-[#666]">Sound URL (MP3/WAV)</label>
              <input 
                type="text" 
                placeholder="https://.../ambient.mp3"
                value={settings.ambientSoundUrl || ''}
                onChange={(e) => updateSettings({ ambientSoundUrl: e.target.value })}
                className="bg-[#0A0A0A] text-[10px] p-2 rounded border border-[#222] outline-none font-mono text-white focus:border-green-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 border-t border-[#222] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Active Scene Lights</span>
            <span className="text-[9px] font-mono text-gray-400">{dynamicLights.length} in scene</span>
          </div>

          {dynamicLights.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-[#222] rounded-lg bg-[#111]/30">
              <Lightbulb size={18} className="text-[#333] mx-auto mb-1.5" />
              <p className="text-[9px] text-[#555] max-w-[180px] mx-auto leading-relaxed">
                No custom light objects placed yet. Tap any button above to light up your scene!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {dynamicLights.map(light => {
                const lightType = light.properties.lightType || 'point';
                const lColor = light.properties.color || '#ffedd5';
                const lIntensity = light.properties.intensity ?? 3.0;
                const lDistance = light.properties.distance ?? 12.0;
                const lAngle = light.properties.angle ?? Math.PI / 4;

                const isLightSelected = selectedObjectId === light.id;

                return (
                  <div 
                    key={light.id} 
                    className={cn(
                      "bg-[#1A1A1A]/60 border rounded-lg p-3 flex flex-col gap-2.5 transition-all",
                      isLightSelected ? "border-blue-500/50 bg-[#1A1A1A]" : "border-[#222]"
                    )}
                  >
                    <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <button 
                          onClick={() => selectObject(light.id)}
                          className={cn(
                            "text-[10px] font-bold hover:text-white text-left transition-colors truncate block max-w-[100px]",
                            isLightSelected ? "text-blue-400" : "text-gray-300"
                          )}
                        >
                          {light.name}
                        </button>
                        <span className="text-[8px] px-1 bg-black/40 text-gray-500 rounded font-mono capitalize">
                          {lightType}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => selectObject(isLightSelected ? null : light.id)}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-colors",
                            isLightSelected ? "bg-blue-500/20 text-blue-400" : "text-gray-500 hover:text-white hover:bg-black/40"
                          )}
                        >
                          Focus
                        </button>
                        <button
                          onClick={() => removeObject(light.id)}
                          className="p-1 rounded text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] text-[#666] font-medium uppercase tracking-wider">Illumination Color</label>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="color" 
                            value={lColor}
                            onChange={(e) => updateObject(light.id, {
                              properties: { ...light.properties, color: e.target.value }
                            })}
                            className="w-6 h-6 rounded cursor-pointer bg-[#0A0A0A] border border-[#222]"
                          />
                          <input 
                            type="text" 
                            value={lColor}
                            onChange={(e) => updateObject(light.id, {
                              properties: { ...light.properties, color: e.target.value }
                            })}
                            className="bg-[#0A0A0A] text-[9px] p-1 rounded flex-1 border border-[#222] outline-none font-mono text-white focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[9px]">
                          <span className="text-[#666]">Luminous Intensity</span>
                          <span className="text-yellow-400 font-mono">{lIntensity.toFixed(1)} lm</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          step="0.1" 
                          value={lIntensity} 
                          onChange={(e) => updateObject(light.id, {
                            properties: { ...light.properties, intensity: parseFloat(e.target.value) }
                          })}
                          className="accent-yellow-500 w-full h-1 cursor-pointer"
                        />
                      </div>

                      {lightType !== 'directional' && (
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-[#666]">Max Range Distance</span>
                            <span className="text-gray-400 font-mono">{lDistance.toFixed(1)}m</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="30" 
                            step="0.5" 
                            value={lDistance} 
                            onChange={(e) => updateObject(light.id, {
                              properties: { ...light.properties, distance: parseFloat(e.target.value) }
                            })}
                            className="accent-blue-500 w-full h-1 cursor-pointer"
                          />
                        </div>
                      )}

                      {lightType === 'spot' && (
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-[#666]">Beam Spread Angle</span>
                            <span className="text-gray-400 font-mono">{Math.round((lAngle * 180) / Math.PI)}°</span>
                          </div>
                          <input 
                            type="range" 
                            min="0.1" 
                            max="1.5" 
                            step="0.05" 
                            value={lAngle} 
                            onChange={(e) => updateObject(light.id, {
                              properties: { ...light.properties, angle: parseFloat(e.target.value) }
                            })}
                            className="accent-blue-500 w-full h-1 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <aside 
      style={{ width: width ? `${width}px` : '288px' }}
      className="border-l border-[#2A2A2A] bg-[#141414] flex flex-col shrink-0 overflow-hidden"
    >
      {/* Tab Switcher */}
      <div className="flex border-b border-[#2A2A2A] shrink-0 bg-[#0F0F0F]">
        <button
          onClick={() => setActivePanelTab('inspector')}
          className={cn(
            "flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5",
            activePanelTab === 'inspector' 
              ? "text-blue-400 border-blue-500 bg-[#141414]" 
              : "text-[#666] border-transparent hover:text-white hover:bg-white/5"
          )}
        >
          <Sliders size={11} />
          Inspector
        </button>
        <button
          onClick={() => setActivePanelTab('lighting')}
          className={cn(
            "flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5",
            activePanelTab === 'lighting' 
              ? "text-yellow-400 border-yellow-500 bg-[#141414]" 
              : "text-[#666] border-transparent hover:text-white hover:bg-white/5"
          )}
        >
          <Lightbulb size={11} className={activePanelTab === 'lighting' ? "text-yellow-400" : "text-[#666]"} />
          Lighting
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activePanelTab === 'lighting' ? (
          renderLightingPanel()
        ) : (
          !selectedObjectId || !objects[selectedObjectId] ? (
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
                        value={settings.ambientColor || '#ffffff'}
                        onChange={(e) => updateSettings({ ambientColor: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer bg-[#0A0A0A] border border-[#222]"
                      />
                      <input 
                        type="text" 
                        value={settings.ambientColor || '#ffffff'}
                        onChange={(e) => updateSettings({ ambientColor: e.target.value })}
                        className="bg-[#0A0A0A] text-[10px] p-1.5 rounded flex-1 border border-[#222] outline-none font-mono text-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#666]">Ambient Intensity</span>
                      <span className="text-yellow-400 font-mono">{(settings.ambientIntensity ?? 0.5).toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="2.0" 
                      step="0.05" 
                      value={settings.ambientIntensity ?? 0.5} 
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
                        value={settings.directionalColor || '#ffffff'}
                        onChange={(e) => updateSettings({ directionalColor: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer bg-[#0A0A0A] border border-[#222]"
                      />
                      <input 
                        type="text" 
                        value={settings.directionalColor || '#ffffff'}
                        onChange={(e) => updateSettings({ directionalColor: e.target.value })}
                        className="bg-[#0A0A0A] text-[10px] p-1.5 rounded flex-1 border border-[#222] outline-none font-mono text-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#666]">Key Light Intensity</span>
                      <span className="text-blue-400 font-mono">{(settings.directionalIntensity ?? 1.0).toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="4.0" 
                      step="0.05" 
                      value={settings.directionalIntensity ?? 1.0} 
                      onChange={(e) => updateSettings({ directionalIntensity: parseFloat(e.target.value) })}
                      className="accent-blue-500 w-full h-1 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] border-t border-black/20 pt-2.5">
                    <span className="text-[#666]">Enable Real-Time Shadows</span>
                    <input 
                      type="checkbox" 
                      checked={settings.shadowsEnabled ?? true}
                      onChange={(e) => updateSettings({ shadowsEnabled: e.target.checked })}
                      className="accent-blue-500 cursor-pointer w-3.5 h-3.5"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#222] pt-4 text-center">
                <p className="text-[9px] text-gray-500 font-medium leading-relaxed max-w-[220px] mx-auto">
                  Select any entity in the Scene Hierarchy tree or double-click in the Viewport to configure specific material, behavioral, or physical parameters.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-[#2A2A2A] flex items-center justify-between shrink-0 bg-[#161616]">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Object Inspector</span>
                {obj!.type !== 'imageTarget' && (
                  <button 
                    onClick={handleDelete} 
                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete Object"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <div className="p-4 flex flex-col gap-6">
                {/* Entity Name & Type */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-[#1A1A1A] p-3 rounded border border-[#2A2A2A]">
            <div className="w-9 h-9 bg-black/40 rounded flex items-center justify-center border border-[#333] text-blue-400 font-mono text-base font-bold shrink-0">
              {obj.type === 'imageTarget' ? '🖼️' : obj.type === 'model' ? '📦' : obj.type === 'group' ? <Folder size={18} /> : '◈'}
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
          {obj.type === 'group' && (
            <button
              onClick={() => ungroupObject(selectedObjectId)}
              className="flex items-center justify-center gap-1.5 p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              <FolderMinus size={12} />
              Ungroup Objects
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
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

          {/* Ignore Clicks Toggle Panel */}
          <div className="flex items-center justify-between bg-[#1A1A1A]/50 p-2.5 px-3 rounded border border-[#2A2A2A] text-xs">
            <span className="text-[#888] font-medium flex items-center gap-1.5 select-none" title="Ignore pointer events on this object (raycast pass-through)">
              <MousePointerClick size={12} className={obj.properties.ignoreClicks ? "text-[#555]" : "text-blue-400"} />
              <span className="text-[11px]">Receive Tap Events</span>
            </span>
            <button
              onClick={() => handlePropertyChange('ignoreClicks', !obj.properties.ignoreClicks)}
              className={cn(
                "w-8 h-4 rounded-full transition-colors relative",
                !obj.properties.ignoreClicks ? "bg-blue-600" : "bg-[#333]"
              )}
            >
              <div className={cn(
                "w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all",
                !obj.properties.ignoreClicks ? "left-[18px]" : "left-0.5"
              )} />
            </button>
          </div>
        </div>

        {/* Transform Component */}
        <InspectorSection 
          title="Transform" 
          rightElement={obj.locked && <span className="text-[9px] font-mono text-red-400/80 uppercase">Locked</span>}
        >
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
        </InspectorSection>

        {/* AR Properties / Interactivity Panel */}
        <InspectorSection 
          title={
            <>
              <Sparkles size={11} className="text-orange-400 animate-pulse" />
              AR Interactivity Traits
            </>
          }
          defaultOpen={false}
        >
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

            {obj.properties.behavior === 'spin' && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#666] font-medium flex items-center gap-1">
                  <Zap size={10} className="text-blue-400" />
                  Spin Axis
                </label>
                <select
                  value={obj.properties.spinAxis || 'z'}
                  onChange={(e) => handlePropertyChange('spinAxis', e.target.value)}
                  className="bg-[#0A0A0A] text-[11px] p-2 rounded border border-[#222] text-white focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="x">X Axis</option>
                  <option value="y">Y Axis</option>
                  <option value="z">Z Axis</option>
                </select>
              </div>
            )}

            {/* 2. Interactive Audio Trigger */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#666] font-medium flex items-center gap-1">
                  <Volume2 size={10} className="text-pink-400" />
                  Audio click Response
                </span>
                {obj.properties.soundUrl && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => playPreviewSound(obj.properties.soundUrl)}
                      className="flex items-center gap-1 px-1.5 py-0.5 bg-pink-600/10 hover:bg-pink-600/20 text-pink-400 border border-pink-500/20 rounded text-[8px] uppercase font-bold transition-colors"
                      title="Play Preview Sound"
                    >
                      <Play size={8} className="fill-pink-400/20" />
                      <span>Test Play</span>
                    </button>
                    <button
                      onClick={() => {
                        handlePropertyChange('soundUrl', undefined);
                        handlePropertyChange('soundName', undefined);
                      }}
                      className="text-[#666] hover:text-red-400 transition-colors p-0.5 rounded hover:bg-black/25"
                      title="Remove Sound"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                )}
              </div>
              <MediaAssetPicker 
                value={obj.properties.soundUrl || ''}
                onChange={(url) => {
                  handlePropertyChange('soundUrl', url);
                  handlePropertyChange('soundName', url.substring(url.lastIndexOf('/') + 1));
                }}
                type="audio"
                accept="audio/*"
                placeholder="Select SFX or Paste URL..."
              />
            </div>
          </div>
        </InspectorSection>

        {/* No-Code Event Triggers & Actions */}
        {obj.type !== 'imageTarget' && (
          <InspectorSection
            title={
              <>
                <Zap size={11} className="text-blue-400 fill-blue-500/20" />
                No-Code Events
              </>
            }
            defaultOpen={false}
            rightElement={
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddBehavior();
                }}
                className="text-[9px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/15 transition-all"
              >
                <Plus size={10} /> Add Event
              </button>
            }
          >
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
                          <option value="onTargetFound">👁 MindAR Target Found</option>
                          <option value="onTargetLost">🙈 MindAR Target Lost</option>
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
                          <option value="transform">📐 Set Transform (Pos/Rot/Scale)</option>
                          <option value="material">🎨 Set Material (Color/Texture)</option>
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

                      {b.action === 'openUrl' && (
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

                      {b.action === 'playVideo' && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">Video Panel Source URL</label>
                          <input
                            type="text"
                            value={b.url ?? ''}
                            onChange={(e) => handleUpdateBehavior(b.id, { url: e.target.value })}
                            placeholder="Select below or paste custom URL..."
                            className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none font-mono"
                          />
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleUpdateBehavior(b.id, { url: e.target.value });
                            }}
                            className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none"
                          >
                            <option value="">(Choose from Video Assets)</option>
                            {useEditorStore.getState().assets.filter(a => a.type === 'video').map(a => (
                              <option key={a.id} value={a.url}>{a.name}</option>
                            ))}
                          </select>
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
                            <optgroup label="Presets">
                              {SOUND_OPTIONS.filter(opt => opt.value !== '').map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Custom Audio Assets">
                              {useEditorStore.getState().assets.filter(a => a.type === 'audio').map(a => (
                                <option key={a.id} value={a.url}>{a.name}</option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                      )}

                      {b.action === 'transform' && (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">Transform Property</label>
                            <select
                              value={b.propertyName ?? 'position'}
                              onChange={(e) => handleUpdateBehavior(b.id, { propertyName: e.target.value })}
                              className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none"
                            >
                              <option value="position">Position (x,y,z)</option>
                              <option value="rotation">Rotation (x,y,z)</option>
                              <option value="scale">Scale (x,y,z)</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">Value</label>
                            <input
                              type="text"
                              value={b.propertyValue ?? '0,0,0'}
                              onChange={(e) => handleUpdateBehavior(b.id, { propertyValue: e.target.value })}
                              placeholder="0,0,0"
                              className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none font-mono"
                            />
                          </div>
                        </>
                      )}

                      {b.action === 'material' && (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">Material Property</label>
                            <select
                              value={b.propertyName ?? 'color'}
                              onChange={(e) => handleUpdateBehavior(b.id, { propertyName: e.target.value })}
                              className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none"
                            >
                              <option value="color">Color (Hex/Name)</option>
                              <option value="texture">Texture URL</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] text-[#666] font-mono uppercase tracking-wider">Value</label>
                            <input
                              type="text"
                              value={b.propertyValue ?? ''}
                              onChange={(e) => handleUpdateBehavior(b.id, { propertyValue: e.target.value })}
                              placeholder={b.propertyName === 'texture' ? 'https://...' : '#ffffff'}
                              className="bg-black/50 text-[10px] text-white border border-[#2B2B2B] rounded p-1.5 focus:border-blue-500 outline-none font-mono"
                            />
                          </div>
                        </>
                      )}

                      {(b.action === 'toggleVisibility' || b.action === 'spin' || b.action === 'transform' || b.action === 'material') && (
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
          </InspectorSection>
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
        <InspectorSection title="Entity Parameters">
          
          <div className="flex flex-col gap-4">
            {/* --- 1. PRIMITIVES SECTION --- */}
            {['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane'].includes(obj.type) && (
              <div className="bg-[#141414]/80 border border-[#222] rounded-xl p-3 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#222] pb-2">
                  <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders size={12} className="text-blue-400" />
                    Material Studio
                  </span>
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">
                    PHYSICAL SHADER
                  </span>
                </div>

                {/* Material Editor Sub-tabs */}
                <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-thin scrollbar-thumb-[#222]">
                  {[
                    { id: 'presets', label: 'Presets' },
                    { id: 'base', label: 'Base' },
                    { id: 'specular', label: 'Reflection' },
                    { id: 'emissive', label: 'Glow' },
                    { id: 'transmission', label: 'Glass' },
                    { id: 'textures', label: 'Maps' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setMaterialTab(tab.id as any)}
                      className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all shrink-0 ${
                        materialTab === tab.id
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 font-extrabold'
                          : 'bg-black/30 text-gray-500 hover:text-white border border-transparent'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Sub-tab content */}
                
                {/* 1. PRESETS TAB */}
                {materialTab === 'presets' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col bg-black/20 p-2 border border-[#222] rounded-lg">
                      <span className="text-[10px] text-gray-400 leading-relaxed font-sans">
                        Attach a high-fidelity material style to this object instantly. You can customize any applied properties in the other tabs!
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {MATERIAL_LIBRARY.map(preset => {
                        const isCurrentlyApplied = 
                          obj.properties.color === preset.properties.color &&
                          (obj.properties.roughness ?? 0.5) === preset.properties.roughness &&
                          (obj.properties.metalness ?? 0.1) === preset.properties.metalness &&
                          (obj.properties.transmission ?? 0) === (preset.properties.transmission ?? 0);

                        return (
                          <button
                            key={preset.id}
                            onClick={() => {
                              // Build atomic batch updates
                              const updates: Record<string, any> = { ...preset.properties };
                              
                              // Reset maps that aren't defined in the preset to clear previous maps
                              const mapKeys = [
                                'textureUrl', 'normalMapUrl', 'roughnessMapUrl', 
                                'metalnessMapUrl', 'displacementMapUrl'
                              ];
                              mapKeys.forEach(key => {
                                if (!(key in updates)) {
                                  updates[key] = '';
                                }
                              });
                              
                              handleMultiplePropertiesChange(updates);
                            }}
                            className={`p-1.5 rounded-lg border text-left flex items-start gap-2 transition-all duration-200 group ${
                              isCurrentlyApplied 
                                ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10' 
                                : 'bg-[#18181b]/50 border-[#222] hover:border-gray-500 hover:bg-black/30'
                            }`}
                          >
                            {/* Material Preview Image */}
                            <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 border border-white/10 relative bg-[#111]">
                              <img 
                                src={preset.previewUrl} 
                                alt={preset.name} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-200" />
                            </div>

                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <span className="text-[9px] font-extrabold text-white truncate leading-tight group-hover:text-blue-300 transition-colors">
                                {preset.name}
                              </span>
                              <span className="text-[7.5px] text-gray-500 line-clamp-2 leading-tight select-none">
                                {preset.description}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. BASE PROPERTIES TAB */}
                {materialTab === 'base' && (
                  <div className="flex flex-col gap-3.5">
                    {/* Base Color */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-[#888] font-bold uppercase tracking-wider">Base Color</label>
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
                    </div>

                    {/* Opacity */}
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

                    {/* Basic Toggles */}
                    <div className="flex flex-col gap-2 mt-1 border-t border-[#222] pt-2">
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
                        <span className="text-[#666]">Double-Sided Render</span>
                        <input 
                          type="checkbox" 
                          checked={obj.properties.doubleSided ?? false}
                          onChange={(e) => handlePropertyChange('doubleSided', e.target.checked)}
                          className="accent-blue-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#666]">Low-Poly Flat Shading</span>
                        <input 
                          type="checkbox" 
                          checked={obj.properties.flatShading ?? false}
                          onChange={(e) => handlePropertyChange('flatShading', e.target.checked)}
                          className="accent-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. REFLECTION / SPECULAR TAB */}
                {materialTab === 'specular' && (
                  <div className="flex flex-col gap-3.5">
                    {/* Roughness */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#888] font-bold uppercase tracking-wider text-[9px]">Roughness</span>
                        <span className="text-gray-400 font-mono">{(obj.properties.roughness ?? 0.5).toFixed(2)}</span>
                      </div>
                      <p className="text-[8px] text-gray-500 leading-normal mb-1">
                        How rough the surface is. 0.0 is mirror shiny, 1.0 is completely matte.
                      </p>
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

                    {/* Metalness */}
                    <div className="flex flex-col gap-1 border-t border-[#222] pt-2.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#888] font-bold uppercase tracking-wider text-[9px]">Metalness</span>
                        <span className="text-gray-400 font-mono">{(obj.properties.metalness ?? 0.1).toFixed(2)}</span>
                      </div>
                      <p className="text-[8px] text-gray-500 leading-normal mb-1">
                        How metal-like the material is. Gold, brass, copper are 1.0. Ceramics, plastic are 0.0.
                      </p>
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

                    {/* Clearcoat */}
                    <div className="flex flex-col gap-1 border-t border-[#222] pt-2.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#888] font-bold uppercase tracking-wider text-[9px]">Clearcoat Overlay</span>
                        <span className="text-gray-400 font-mono">{(obj.properties.clearcoat ?? 0.0).toFixed(2)}</span>
                      </div>
                      <p className="text-[8px] text-gray-500 leading-normal mb-1">
                        Adds a secondary glossy coating over the material, like car paint glaze or polished wood finish.
                      </p>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={obj.properties.clearcoat ?? 0.0} 
                        onChange={(e) => handlePropertyChange('clearcoat', parseFloat(e.target.value))}
                        className="accent-blue-500 w-full h-1 cursor-pointer"
                      />
                    </div>

                    {/* Clearcoat Roughness */}
                    { (obj.properties.clearcoat ?? 0) > 0 && (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#666]">Clearcoat Roughness</span>
                          <span className="text-gray-400 font-mono">{(obj.properties.clearcoatRoughness ?? 0.1).toFixed(2)}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01" 
                          value={obj.properties.clearcoatRoughness ?? 0.1} 
                          onChange={(e) => handlePropertyChange('clearcoatRoughness', parseFloat(e.target.value))}
                          className="accent-blue-500 w-full h-1 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 4. GLOW / EMISSIVE TAB */}
                {materialTab === 'emissive' && (
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#888] font-bold uppercase tracking-wider text-[9px]">Self-Emissive Glow</span>
                      <input 
                        type="checkbox" 
                        checked={!!obj.properties.emissiveIntensity && obj.properties.emissiveColor !== '#000000'}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handlePropertyChange('emissiveColor', obj.properties.color || '#3b82f6');
                            handlePropertyChange('emissiveIntensity', 1.5);
                          } else {
                            handlePropertyChange('emissiveColor', '#000000');
                            handlePropertyChange('emissiveIntensity', 0);
                          }
                        }}
                        className="accent-blue-500 cursor-pointer"
                      />
                    </div>

                    <p className="text-[8px] text-gray-500 leading-normal">
                      Makes the object glow with light energy. Perfect for neon signs, sci-fi computer cores, or lasers.
                    </p>

                    <div className="flex flex-col gap-3 border-t border-[#222] pt-3">
                      {/* Emissive Color */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-[#666]">Glow Color</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={obj.properties.emissiveColor || '#000000'}
                            onChange={(e) => handlePropertyChange('emissiveColor', e.target.value)}
                            className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 outline-none animate-none"
                          />
                          <input 
                            type="text" 
                            value={obj.properties.emissiveColor || '#000000'}
                            onChange={(e) => handlePropertyChange('emissiveColor', e.target.value)}
                            className="bg-[#0A0A0A] text-[9px] p-2 rounded flex-1 border border-[#222] outline-none font-mono text-white focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Emissive Intensity */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#666]">Glow Intensity</span>
                          <span className="text-gray-400 font-mono">{(obj.properties.emissiveIntensity ?? 0.0).toFixed(1)}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          step="0.1" 
                          value={obj.properties.emissiveIntensity ?? 0.0} 
                          onChange={(e) => handlePropertyChange('emissiveIntensity', parseFloat(e.target.value))}
                          className="accent-blue-500 w-full h-1 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. GLASS / TRANSMISSION TAB */}
                {materialTab === 'transmission' && (
                  <div className="flex flex-col gap-3.5">
                    <div className="flex flex-col bg-blue-500/5 border border-blue-500/10 rounded-lg p-2.5">
                      <span className="text-[10px] text-blue-400 font-bold uppercase mb-1">Physical Glass Engine</span>
                      <p className="text-[8px] text-gray-400 leading-relaxed">
                        Transmission lets light pass through objects for hyper-realistic glass refraction. Best when metalness is 0.0 and roughness is close to 0.0!
                      </p>
                    </div>

                    {/* Transmission slider */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#888] font-bold uppercase tracking-wider text-[9px]">Transmission (Transparency)</span>
                        <span className="text-gray-400 font-mono">{(obj.properties.transmission ?? 0.0).toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={obj.properties.transmission ?? 0.0} 
                        onChange={(e) => handlePropertyChange('transmission', parseFloat(e.target.value))}
                        className="accent-blue-500 w-full h-1 cursor-pointer"
                      />
                    </div>

                    {/* Thickness slider */}
                    <div className="flex flex-col gap-1 border-t border-[#222] pt-2.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#888] font-bold uppercase tracking-wider text-[9px]">Glass Thickness</span>
                        <span className="text-gray-400 font-mono">{(obj.properties.thickness ?? 0.0).toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="0.1" 
                        value={obj.properties.thickness ?? 0.0} 
                        onChange={(e) => handlePropertyChange('thickness', parseFloat(e.target.value))}
                        className="accent-blue-500 w-full h-1 cursor-pointer"
                      />
                    </div>

                    {/* Index of Refraction (IOR) */}
                    <div className="flex flex-col gap-1 border-t border-[#222] pt-2.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#888] font-bold uppercase tracking-wider text-[9px]">Index of Refraction (IOR)</span>
                        <span className="text-gray-400 font-mono">{(obj.properties.ior ?? 1.5).toFixed(2)}</span>
                      </div>
                      <p className="text-[7.5px] text-gray-500 leading-normal mb-1">
                        Water: 1.33 • Glass: 1.52 • Ruby: 1.76 • Diamond: 2.42
                      </p>
                      <input 
                        type="range" 
                        min="1" 
                        max="2.5" 
                        step="0.01" 
                        value={obj.properties.ior ?? 1.5} 
                        onChange={(e) => handlePropertyChange('ior', parseFloat(e.target.value))}
                        className="accent-blue-500 w-full h-1 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* 6. TEXTURES & MAPS TAB */}
                {materialTab === 'textures' && (
                  <div className="flex flex-col gap-4">
                    <p className="text-[8px] text-gray-500 leading-normal">
                      Map textures directly onto material channels. High-contrast images can act as roughness/metalness guides or surface normal dimples!
                    </p>

                    {/* Texture Map */}
                    <div className="flex flex-col gap-1">
                      <MediaAssetPicker 
                        value={obj.properties.textureUrl || ''}
                        onChange={(url) => handlePropertyChange('textureUrl', url)}
                        type="image"
                        accept="image/*"
                        placeholder="Select Image Asset..."
                        label="Texture Base Map"
                      />
                    </div>

                    {/* Normal Map */}
                    <div className="flex flex-col gap-1 border-t border-[#222] pt-2.5">
                      <MediaAssetPicker 
                        value={obj.properties.normalMapUrl || ''}
                        onChange={(url) => handlePropertyChange('normalMapUrl', url)}
                        type="image"
                        accept="image/*"
                        placeholder="Select Normal Map (Purple shape)..."
                        label="Normal Surface Bump Map"
                      />
                      {obj.properties.normalMapUrl && (
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-400">Normal Scale Intensity: {obj.properties.normalScale ?? 1}</span>
                          </div>
                          <input 
                            type="range" 
                            min="-2" 
                            max="2" 
                            step="0.1" 
                            value={obj.properties.normalScale ?? 1}
                            onChange={(e) => handlePropertyChange('normalScale', parseFloat(e.target.value))}
                            className="accent-blue-500 w-full h-1 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Roughness Map */}
                    <div className="flex flex-col gap-1 border-t border-[#222] pt-2.5">
                      <MediaAssetPicker 
                        value={obj.properties.roughnessMapUrl || ''}
                        onChange={(url) => handlePropertyChange('roughnessMapUrl', url)}
                        type="image"
                        accept="image/*"
                        placeholder="Select Roughness Grayscale Map..."
                        label="Roughness Channel Guide Map"
                      />
                    </div>

                    {/* Metalness Map */}
                    <div className="flex flex-col gap-1 border-t border-[#222] pt-2.5">
                      <MediaAssetPicker 
                        value={obj.properties.metalnessMapUrl || ''}
                        onChange={(url) => handlePropertyChange('metalnessMapUrl', url)}
                        type="image"
                        accept="image/*"
                        placeholder="Select Metalness Grayscale Map..."
                        label="Metalness Channel Guide Map"
                      />
                    </div>

                    {/* Displacement Map */}
                    <div className="flex flex-col gap-1 border-t border-[#222] pt-2.5">
                      <MediaAssetPicker 
                        value={obj.properties.displacementMapUrl || ''}
                        onChange={(url) => handlePropertyChange('displacementMapUrl', url)}
                        type="image"
                        accept="image/*"
                        placeholder="Select Displacement Map..."
                        label="Displacement (Height) Map"
                      />
                      {obj.properties.displacementMapUrl && (
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-400">Height Displacement Scale: {obj.properties.displacementScale ?? 0.05}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="0.5" 
                            step="0.01" 
                            value={obj.properties.displacementScale ?? 0.05}
                            onChange={(e) => handlePropertyChange('displacementScale', parseFloat(e.target.value))}
                            className="accent-blue-500 w-full h-1 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Texture Repeat Coordinates */}
                    {(obj.properties.textureUrl || obj.properties.normalMapUrl || obj.properties.roughnessMapUrl || obj.properties.metalnessMapUrl || obj.properties.displacementMapUrl) && (
                      <div className="bg-[#1A1A1A]/30 border border-[#222] rounded-lg p-2.5 mt-2 flex flex-col gap-2.5">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Map Wrapping & Repeat</span>
                        <div className="grid grid-cols-2 gap-2">
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
                      </div>
                    )}
                  </div>
                )}
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
                  <MediaAssetPicker 
                    value={obj.properties.textureUrl || ''}
                    onChange={(url) => handlePropertyChange('textureUrl', url)}
                    type="image"
                    accept="image/*"
                    placeholder="Paste Image URL (PNG/JPG)..."
                    label="Image URL Source"
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

                <div className="flex items-center justify-between text-xs mt-1 border-t border-[#222] pt-2.5">
                  <span className="text-[#666]">Wireframe Mode</span>
                  <input 
                    type="checkbox" 
                    checked={obj.properties.wireframe ?? false}
                    onChange={(e) => handlePropertyChange('wireframe', e.target.checked)}
                    className="accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* --- 4. VIDEO SCREEN SECTION --- */}
            {obj.type === 'video' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <MediaAssetPicker 
                    value={obj.properties.videoUrl || ''}
                    onChange={(url) => handlePropertyChange('videoUrl', url)}
                    type="video"
                    accept="video/mp4"
                    placeholder="Paste MP4 Video Link..."
                    label="MP4 Video Source Link"
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

                <div className="flex items-center justify-between text-xs mt-1 border-t border-[#222] pt-2.5">
                  <span className="text-[#666]">Wireframe Mode</span>
                  <input 
                    type="checkbox" 
                    checked={obj.properties.wireframe ?? false}
                    onChange={(e) => handlePropertyChange('wireframe', e.target.checked)}
                    className="accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* --- 5. SPATIAL SOUND EMITTER SECTION --- */}
            {obj.type === 'audio' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <MediaAssetPicker 
                    value={obj.properties.soundUrl || ''}
                    onChange={(url) => handlePropertyChange('soundUrl', url)}
                    type="audio"
                    accept="audio/*"
                    placeholder="Paste Sound Link (WAV/MP3)..."
                    label="Sound Track URL (WAV/MP3)"
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
                  <MediaAssetPicker 
                    value={obj.properties.url || ''}
                    onChange={(url) => handlePropertyChange('url', url)}
                    type="model"
                    accept=".gltf,.glb"
                    placeholder="Paste Model Link (.gltf / .glb)..."
                    label="Model Asset URL (.gltf / .glb)"
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

                <div className="flex items-center justify-between text-xs mt-1 border-t border-[#222] pt-2.5">
                  <span className="text-[#666]">Wireframe Mode</span>
                  <input 
                    type="checkbox" 
                    checked={obj.properties.wireframe ?? false}
                    onChange={(e) => handlePropertyChange('wireframe', e.target.checked)}
                    className="accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* --- 9. AR IMAGE TARGET MARKER CONFIG --- */}
            {obj.type === 'imageTarget' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <MediaAssetPicker 
                    value={obj.properties.textureUrl || ''}
                    onChange={(url) => handlePropertyChange('textureUrl', url)}
                    type="image"
                    accept="image/*"
                    placeholder="Paste Marker Image URL..."
                    label="AR target Marker Image"
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
                
                {/* Advanced MindAR Tracking Settings */}
                <div className="flex flex-col gap-2 border-t border-[#222] pt-3">
                  <span className="text-[9px] font-bold text-[#888] uppercase tracking-wider">Advanced Tracking Settings</span>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-[#666]">Filter Min CF (Jitter Reduction)</label>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={obj.properties.filterMinCF ?? 0.0001}
                      onChange={(e) => handlePropertyChange('filterMinCF', parseFloat(e.target.value))}
                      className="bg-[#0A0A0A] text-[9px] font-mono p-1.5 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-[#666]">Filter Beta (Speed vs Accuracy)</label>
                    <input 
                      type="number" 
                      step="0.001"
                      value={obj.properties.filterBeta ?? 0.001}
                      onChange={(e) => handlePropertyChange('filterBeta', parseFloat(e.target.value))}
                      className="bg-[#0A0A0A] text-[9px] font-mono p-1.5 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-[#666]">Miss Tolerance (Frames before lost)</label>
                    <input 
                      type="number" 
                      step="1"
                      value={obj.properties.missTolerance ?? 5}
                      onChange={(e) => handlePropertyChange('missTolerance', parseInt(e.target.value, 10))}
                      className="bg-[#0A0A0A] text-[9px] font-mono p-1.5 rounded w-full border border-[#222] focus:border-blue-500 text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </InspectorSection>
      </div>

        {/* Quick Add Interactions section */}
        {obj.type !== 'imageTarget' && (!obj.properties.behavior || !obj.properties.soundUrl) && (
          <div className="flex flex-col gap-2.5 border-t border-[#222] pt-4 p-4">
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
            </>
          )
        )}
      </div>
    </aside>
  );
}
