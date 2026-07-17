import { playCachedAudio } from '../../lib/audioManager';
import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { instantiateTemplate, PREBUILT_TEMPLATES } from '../../utils/prebuiltTemplates';
import { fileToDataUrl } from '../../lib/fileUtils';
import { v4 as uuidv4 } from 'uuid';
import { MarkerManagerModal } from '../toolbar/MarkerManagerModal';
import { 
  Image as ImageIcon, 
  Video, 
  Box, 
  FileCode, 
  Upload, 
  Trash2, X, 
  Edit2, 
  Music, 
  Zap, 
  Sparkles, 
  Layers, 
  Volume2, 
  Plus, 
  Type,
  Check, 
  Eye, 
  Info,
  Play,
  Search,
  Sun,
  Globe,
  Folder,
  LayoutGrid
} from 'lucide-react';
import { Asset, AssetType, SceneObject } from '../../types';

// Premium high-quality stable GLB presets for instant AR experience
const PRESET_MODELS = [
  {
    id: 'p-model-astronaut',
    name: 'Astronaut',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    thumbnail: '🚀',
    description: 'Classic zero-gravity space explorer',
  },
  {
    id: 'p-model-car',
    name: 'Toy Retro Car',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb',
    thumbnail: '🚗',
    description: 'Highly detailed vintage toy car',
  },
  {
    id: 'p-model-robot',
    name: 'Expressive Robot',
    type: 'model' as AssetType,
    url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    thumbnail: '🤖',
    description: 'Robot with animated face panels',
  },
  {
    id: 'p-model-vase',
    name: 'Bronze Vase',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/VaseBronze/glTF-Binary/VaseBronze.glb',
    thumbnail: '🏺',
    description: 'Ancient bronze museum artifact',
  },
  {
    id: 'p-model-lantern',
    name: 'Vintage Lantern',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Lantern/glTF-Binary/Lantern.glb',
    thumbnail: '🏮',
    description: 'Detailed classic light container',
  },
  {
    id: 'p-model-shoe',
    name: 'E-Comm Sneaker',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/MaterialsVariantsShoe.glb',
    thumbnail: '👟',
    description: 'E-commerce style athletic shoe',
  }
];

// Certified high-contrast tracking images for robust image targeting
const PRESET_MARKERS = [
  {
    id: 'p-marker-magazine',
    name: 'Magazine Cover',
    type: 'image' as AssetType,
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    description: 'High contrast text & graphics (Tracking: 95/100)',
    rating: 95,
  },
  {
    id: 'p-marker-abstract',
    name: 'Abstract Art',
    type: 'image' as AssetType,
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    description: 'Complex geometric structures (Tracking: 88/100)',
    rating: 88,
  },
  {
    id: 'p-marker-map',
    name: 'Contour Map',
    type: 'image' as AssetType,
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop',
    description: 'Topographic contour line grids (Tracking: 94/100)',
    rating: 94,
  },
  {
    id: 'p-marker-blueprint',
    name: 'Blueprint Grid',
    type: 'image' as AssetType,
    url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600&auto=format&fit=crop',
    description: 'High frequency technical details (Tracking: 91/100)',
    rating: 91,
  }
];

// SFX files for interactive triggers
const PRESET_SOUNDS = [
  // --- INTERFACE & UI ---
  {
    id: 'p-sound-click',
    name: 'Cyber Click',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
    thumbnail: '🔘',
    category: 'UI & Interface',
    description: 'Clean futuristic electronic tap feedback, perfect for buttons and menus.',
  },
  {
    id: 'p-sound-soft-tap',
    name: 'Soft UI Tap',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-84.wav',
    thumbnail: '👇',
    category: 'UI & Interface',
    description: 'Subtle high-frequency organic confirmation sound, gentle on ears.',
  },
  {
    id: 'p-sound-confirm',
    name: 'Tactile Select',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2562/2562-84.wav',
    thumbnail: '✅',
    category: 'UI & Interface',
    description: 'Double-click mechanical toggle sound for options and switches.',
  },
  
  // --- MAGICAL & FANTASY ---
  {
    id: 'p-sound-success',
    name: 'Success Ring',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav',
    thumbnail: '✨',
    category: 'Magical & Fantasy',
    description: 'Shimmering positive response chime for completions and unlocks.',
  },
  {
    id: 'p-sound-sparkle',
    name: 'Fairy Dust Sparkle',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-84.wav',
    thumbnail: '🪄',
    category: 'Magical & Fantasy',
    description: 'High-pitch ascending windchimes, great for spawn or teleports.',
  },
  {
    id: 'p-sound-shimmer',
    name: 'Mystic Dream',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-84.wav',
    thumbnail: '🔮',
    category: 'Magical & Fantasy',
    description: 'Ethereal chime wave ideal for magical interactions.',
  },

  // --- RETRO & SCI-FI ---
  {
    id: 'p-sound-beep',
    name: 'Robot Chirp',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-84.wav',
    thumbnail: '🤖',
    category: 'Sci-Fi & Retro',
    description: 'Chirpy electronic robot expression tone.',
  },
  {
    id: 'p-sound-laser',
    name: 'Neon Laser Zap',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2585/2585-84.wav',
    thumbnail: '⚡',
    category: 'Sci-Fi & Retro',
    description: 'Classic synthesized raygun laser blast.',
  },
  {
    id: 'p-sound-hologram',
    name: 'Hologram Grid Hum',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-84.wav',
    thumbnail: '🌐',
    category: 'Sci-Fi & Retro',
    description: 'Electric static telemetry and computer system initialization.',
  },
  {
    id: 'p-sound-error',
    name: 'Warning Buzzer',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-84.wav',
    thumbnail: '🚨',
    category: 'Sci-Fi & Retro',
    description: 'Short abrasive buzzer sound indicating errors or warnings.',
  },

  // --- MUSIC & BEAT LOOPS ---
  {
    id: 'p-sound-lofi',
    name: 'Chill Lo-Fi Loop',
    type: 'audio' as AssetType,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    thumbnail: '☕',
    category: 'Music & Loops',
    description: 'Relaxing jazzy hip-hop study beat, loopable and cozy.',
  },
  {
    id: 'p-sound-synthwave',
    name: 'Retro Drive Beats',
    type: 'audio' as AssetType,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail: '🕶️',
    category: 'Music & Loops',
    description: 'High energy synthesized driving track, perfect for active scenes.',
  },
  {
    id: 'p-sound-cosmic',
    name: 'Acoustic Oasis',
    type: 'audio' as AssetType,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    thumbnail: '🎸',
    category: 'Music & Loops',
    description: 'Warm acoustic melody blended with uplifting cinematic pads.',
  },

  // --- AMBIENCE & ENVIRONMENT ---
  {
    id: 'p-sound-rain',
    name: 'Heavy Storm Rain',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2433/2433-84.wav',
    thumbnail: '⛈️',
    category: 'Ambience & Environments',
    description: 'Intense background raindrops crashing on wooden deck.',
  },
  {
    id: 'p-sound-ambient',
    name: 'Nature Ambient',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2431/2431-84.wav',
    thumbnail: '🌲',
    category: 'Ambience & Environments',
    description: 'Chirping birds and gentle breeze rustling forest leaves.',
  },
  {
    id: 'p-sound-ocean',
    name: 'Soft Ocean Waves',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-84.wav',
    thumbnail: '🌊',
    category: 'Ambience & Environments',
    description: 'Slow rolling saltwater shoreline foam and breeze.',
  }
];

const LIGHTING_PRESETS = [
  {
    id: 'light-noon',
    name: '☀️ High Noon',
    category: 'Cinematic',
    description: 'Crisp, high-contrast daylight with precise neutral shadows. Ideal for showcasing 3D products.',
    settings: {
      ambientColor: '#ffffff',
      ambientIntensity: 0.45,
      directionalColor: '#ffffff',
      directionalIntensity: 1.25,
      directionalPosition: [3, 10, 4] as [number, number, number],
      shadowsEnabled: true,
      shadowIntensity: 0.75,
      shadowSoftness: 2.0,
      shadowResolution: 2048,
    }
  },
  {
    id: 'light-sunset',
    name: '🌇 Sunset Glow',
    category: 'Mood / Warm',
    description: 'Golden hour warmth with deep purple ambient fills and elongated, soft amber shadows.',
    settings: {
      ambientColor: '#4c1d95',
      ambientIntensity: 0.35,
      directionalColor: '#f59e0b',
      directionalIntensity: 1.45,
      directionalPosition: [8, 3, 2] as [number, number, number],
      shadowsEnabled: true,
      shadowIntensity: 0.65,
      shadowSoftness: 5.5,
      shadowResolution: 1024,
    }
  },
  {
    id: 'light-neon',
    name: '🌌 Cyberpunk Neon',
    category: 'Vibrant',
    description: 'Vivid synthwave aesthetics. Cool cyan fill lights combined with a hot pink key light.',
    settings: {
      ambientColor: '#083344',
      ambientIntensity: 0.45,
      directionalColor: '#ec4899',
      directionalIntensity: 1.55,
      directionalPosition: [-5, 5, 4] as [number, number, number],
      shadowsEnabled: true,
      shadowIntensity: 0.85,
      shadowSoftness: 4.0,
      shadowResolution: 1024,
    }
  },
  {
    id: 'light-moonlight',
    name: '🌕 Mystical Moonlight',
    category: 'Night / Cool',
    description: 'Dim, cool twilight setup. Soft blue ambient lighting and a cold pale white moon highlight.',
    settings: {
      ambientColor: '#1e1b4b',
      ambientIntensity: 0.25,
      directionalColor: '#e0e7ff',
      directionalIntensity: 0.65,
      directionalPosition: [4, 8, -4] as [number, number, number],
      shadowsEnabled: true,
      shadowIntensity: 0.55,
      shadowSoftness: 7.0,
      shadowResolution: 1024,
    }
  },
  {
    id: 'light-studio',
    name: '🍵 Soft Studio',
    category: 'Cinematic',
    description: 'Bright, diffused studio umbrella setup. High fill light with subtle, ultra-soft shadows.',
    settings: {
      ambientColor: '#f1f5f9',
      ambientIntensity: 0.85,
      directionalColor: '#ffffff',
      directionalIntensity: 0.45,
      directionalPosition: [0, 8, 8] as [number, number, number],
      shadowsEnabled: true,
      shadowIntensity: 0.35,
      shadowSoftness: 9.0,
      shadowResolution: 2048,
    }
  },
  {
    id: 'light-volcano',
    name: '🌋 Volcanic Ash',
    category: 'Mood / Warm',
    description: 'Dreadful volcanic landscape. Deep dark red sky glow with intense lava-orange light bursts.',
    settings: {
      ambientColor: '#450a0a',
      ambientIntensity: 0.35,
      directionalColor: '#f97316',
      directionalIntensity: 1.35,
      directionalPosition: [5, 4, 3] as [number, number, number],
      shadowsEnabled: true,
      shadowIntensity: 0.85,
      shadowSoftness: 3.5,
      shadowResolution: 1024,
    }
  },
  {
    id: 'light-matrix',
    name: '🟢 Digital Matrix',
    category: 'Vibrant',
    description: 'Chlorophyll-infused retro computing terminal glow. Dark emerald fill and bright digital lime green.',
    settings: {
      ambientColor: '#022c22',
      ambientIntensity: 0.3,
      directionalColor: '#22c55e',
      directionalIntensity: 1.25,
      directionalPosition: [3, 6, 2] as [number, number, number],
      shadowsEnabled: true,
      shadowIntensity: 0.75,
      shadowSoftness: 2.5,
      shadowResolution: 1024,
    }
  },
  {
    id: 'light-shadowless',
    name: '☁️ Overcast Day',
    category: 'Neutral',
    description: 'Soft cloud coverage. Diffuse, shadowless light for maximum shape legibility and flat tones.',
    settings: {
      ambientColor: '#e2e8f0',
      ambientIntensity: 0.95,
      directionalColor: '#ffffff',
      directionalIntensity: 0.15,
      directionalPosition: [0, 10, 0] as [number, number, number],
      shadowsEnabled: false,
      shadowIntensity: 0,
      shadowSoftness: 0,
      shadowResolution: 512,
    }
  }
];

// Interactive structural and transform behaviors
const PRESET_BEHAVIORS = [
  {
    id: 'p-behavior-spin',
    name: 'Continuous Spin',
    type: 'behavior' as AssetType,
    value: 'spin',
    thumbnail: '🔄',
    description: 'Smooth full 360-degree rotation on Y-axis',
  },
  {
    id: 'p-behavior-hover',
    name: 'Gentle Float',
    type: 'behavior' as AssetType,
    value: 'hover',
    thumbnail: '🎈',
    description: 'Levitates gently up/down on a sine wave',
  },
  {
    id: 'p-behavior-pulse',
    name: 'Rhythmic Pulse',
    type: 'behavior' as AssetType,
    value: 'pulse',
    thumbnail: '💓',
    description: 'Slightly expands and contracts scale',
  }
];

const SKETCHFAB_WEB_MODELS = [
  {
    name: 'Zero-G Astronaut 👨‍🚀',
    category: 'space',
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    creator: 'Google Poly CC',
    description: 'Astronaut in zero-gravity extravehicular mobility suit'
  },
  {
    name: 'Cyberpunk Retro Car 🚗',
    category: 'vehicles',
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb',
    creator: 'Sketchfab CC-BY',
    description: 'Highly detailed retro cyberpunk style collectible car'
  },
  {
    name: 'NASA Space Shuttle 🚀',
    category: 'space',
    url: 'https://raw.githubusercontent.com/nasa/nasa-3d-resources/master/3d-models/shuttle-gltf/shuttle.glb',
    creator: 'NASA Open Resource',
    description: 'Official NASA Space Shuttle orbiter model'
  },
  {
    name: 'Expressive Companion Robot 🤖',
    category: 'characters',
    url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    creator: 'Three.js CC-BY',
    description: 'Companion droid with animated expression screens and walking loops'
  },
  {
    name: 'Bonsai Potted Tree 🪴',
    category: 'nature',
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/VaseBronze/glTF-Binary/VaseBronze.glb',
    creator: 'Poly Pizza CC0',
    description: 'Miniature Japanese bonsai tree in decorative ceramic planter'
  },
  {
    name: 'Vintage Brass Lantern 🏮',
    category: 'interior',
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Lantern/glTF-Binary/Lantern.glb',
    creator: 'Smithsonian CC0',
    description: '19th century style brass kerosene storm lantern'
  },
  {
    name: 'E-Commerce Athletic Sneaker 👟',
    category: 'items',
    url: 'https://modelviewer.dev/shared-assets/models/MaterialsVariantsShoe.glb',
    creator: 'Khronos Group CC0',
    description: 'Photorealistic commercial running sneaker model'
  },
  {
    name: 'BoomBox Audio 📻',
    category: 'items',
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/BoomBox/glTF-Binary/BoomBox.glb',
    creator: 'Khronos Group CC0',
    description: 'Classic 1980s portable cassette radio boombox'
  },
  {
    name: 'NASA Apollo Lunar Lander 🌙',
    category: 'space',
    url: 'https://raw.githubusercontent.com/nasa/nasa-3d-resources/master/3d-models/apollo-gltf/apollo.glb',
    creator: 'NASA Open Resource',
    description: 'Historical lunar module vehicle'
  },
  {
    name: 'Curiosity Mars Rover 🚜',
    category: 'space',
    url: 'https://raw.githubusercontent.com/nasa/nasa-3d-resources/master/3d-models/curiosity-gltf/curiosity.glb',
    creator: 'NASA Open Resource',
    description: 'Mars Science Laboratory rover exploration vehicle'
  },
  {
    name: 'Bronze Museum Vase 🏺',
    category: 'interior',
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/VaseBronze/glTF-Binary/VaseBronze.glb',
    creator: 'Smithsonian CC0',
    description: 'Detailed ancient Greek replica bronze vase'
  },
  {
    name: 'Retro Wood Chair 🪑',
    category: 'interior',
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/SheenChair/glTF-Binary/SheenChair.glb',
    creator: 'Khronos Group CC0',
    description: 'Modernist wooden design accent chair with sheen fabrics'
  },
  {
    name: 'Damaged Helmet 🪖',
    category: 'items',
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    creator: 'Sketchfab CC-BY',
    description: 'Futuristic sci-fi battle-damaged helmet with detailed texture maps'
  },
  {
    name: 'Flamingo 🦩',
    category: 'animals',
    url: 'https://threejs.org/examples/models/gltf/Flamingo.glb',
    creator: 'Three.js CC-BY',
    description: 'Graceful pink flamingo in fully-animated flight cycle'
  },
  {
    name: 'Parrot 🦜',
    category: 'animals',
    url: 'https://threejs.org/examples/models/gltf/Parrot.glb',
    creator: 'Three.js CC-BY',
    description: 'Bright multi-color tropical parrot soaring loop'
  },
  {
    name: 'Stork 🦅',
    category: 'animals',
    url: 'https://threejs.org/examples/models/gltf/Stork.glb',
    creator: 'Three.js CC-BY',
    description: 'Elegant white stork soaring with flapping wings'
  }
];

type CategoryTab = 'templates' | 'uploads' | 'sketchfab' | 'models' | 'markers' | 'audio' | 'behaviors' | 'lighting' | 'layouts';

export function AssetBrowser() {
  const { 
    assets, 
    addAsset, 
    removeAsset, 
    updateAsset, 
    addObject, 
    selectedObjectId, 
    objects,
    updateObject,
    updateSettings,
    settings,
    isAssetBrowserOpen,
    setIsAssetBrowserOpen
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<CategoryTab>('templates');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateFilterTag, setTemplateFilterTag] = useState('all');
  const [selectedAudioCategory, setSelectedAudioCategory] = useState<string>('All');
  const [selectedLightingCategory, setSelectedLightingCategory] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [showMarkerManager, setShowMarkerManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [customImportUrl, setCustomImportUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  if (!isAssetBrowserOpen) return null;

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let url = '';
    const name = file.name;
    let type: AssetType = 'script';
    
    if (name.endsWith('.glb') || name.endsWith('.gltf')) type = 'model';
    else if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';

    showToast(`Uploading ${name}...`);

    try {
      const { SupabaseService } = await import('../../services/supabaseService');
      const storeState = useEditorStore.getState();
      const projectName = storeState.settings.projectName || 'default-project';

      if (SupabaseService.isConfigured()) {
        url = await SupabaseService.uploadAsset(file, projectName);
      } else {
        url = await fileToDataUrl(file);
      }

      const asset: Asset = {
        id: uuidv4(),
        name,
        type,
        url,
      };

      addAsset(asset);
      showToast(`Uploaded asset: ${name}`);
    } catch (err: any) {
      console.error('Upload failed:', err);
      showToast(`Failed to upload: ${err.message || 'Unknown error'}`);
      // Fallback to local
      url = await fileToDataUrl(file);
      const asset: Asset = {
        id: uuidv4(),
        name,
        type,
        url,
      };
      addAsset(asset);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getIcon = (type: AssetType) => {
    switch (type) {
      case 'model': return <Box size={24} className="text-blue-400" />;
      case 'image': return <ImageIcon size={24} className="text-green-400" />;
      case 'video': return <Video size={24} className="text-purple-400" />;
      case 'script': return <FileCode size={24} className="text-yellow-400" />;
      case 'audio': return <Music size={24} className="text-pink-400" />;
      case 'behavior': return <Zap size={24} className="text-orange-400" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, asset: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleUseAsset = (asset: any) => {
    if (asset.type === 'model') {
      let parentId = selectedObjectId;
      if (!parentId) {
        const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
        if (imageTarget) parentId = imageTarget.id;
      }
      
      const newObj: SceneObject = {
        id: uuidv4(),
        name: asset.name.split('.')[0],
        type: 'model',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentId || null,
        properties: {
          url: asset.url
        }
      };
      
      addObject(newObj, parentId || undefined);
      showToast(`Added 3D model "${newObj.name}" to the scene.`);
    } else if (asset.type === 'image') {
      if (selectedObjectId) {
        const selectedObj = objects[selectedObjectId];
        if (selectedObj && (selectedObj.type === 'image' || selectedObj.type === 'imageTarget')) {
           updateObject(selectedObjectId, {
             properties: {
               ...selectedObj.properties,
               textureUrl: asset.url
             }
           });
           showToast(`Applied "${asset.name}" to ${selectedObj.name}.`);
           return;
        }
      }
      
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) {
        updateObject(imageTarget.id, {
          properties: {
            ...imageTarget.properties,
            textureUrl: asset.url
          }
        });
        showToast(`Set "${asset.name}" as Active tracking marker.`);
      } else {
        const newObj: SceneObject = {
          id: uuidv4(),
          name: asset.name.split('.')[0],
          type: 'image',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          visible: true,
          children: [],
          parentId: null,
          properties: {
            textureUrl: asset.url,
            opacity: 1.0
          }
        };
        addObject(newObj);
        showToast(`Added image billboard "${newObj.name}" to the scene.`);
      }
    } else if (asset.type === 'audio') {
      // Play a quick audio preview
      // playCachedAudio(asset.url, false, 0.4);

      if (selectedObjectId && objects[selectedObjectId]) {
        updateObject(selectedObjectId, {
          properties: {
            ...objects[selectedObjectId].properties,
            soundUrl: asset.url,
            soundName: asset.name
          }
        });
        showToast(`Attached Sound "${asset.name}" to Selected Object "${objects[selectedObjectId].name}".`);
      } else {
        // Create an Audio node in the scene and attach the asset
        const newObj: any = {
          id: uuidv4(),
          name: asset.name.replace(/\.[^/.]+$/, ""), // strip extension
          type: 'audio',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          visible: true,
          children: [],
          parentId: null,
          properties: {
            soundUrl: asset.url,
            soundName: asset.name,
            autoplay: false,
            playing: false,
            loop: true,
            volume: 0.5
          }
        };
        addObject(newObj);
        showToast(`Created audio node "${newObj.name}" in the scene.`);
      }
    } else if (asset.type === 'behavior') {
      if (selectedObjectId && objects[selectedObjectId]) {
        updateObject(selectedObjectId, {
          properties: {
            ...objects[selectedObjectId].properties,
            behavior: asset.value
          }
        });
        showToast(`Applied behavior "${asset.name}" to "${objects[selectedObjectId].name}".`);
      } else {
        showToast(`Select a Scene Object first to assign the "${asset.name}" behavior!`);
      }
    }
  };

  const startEditing = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(currentName);
  };

  const finishEditing = () => {
    if (editingId && editValue.trim() !== '') {
      updateAsset(editingId, editValue.trim());
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


  const TEMPLATES = [
    // 2D HUD Screen Overlays
    { id: 't-hudCanvas', type: 'hudCanvas', name: 'HUD Canvas', icon: LayoutGrid, color: 'text-cyan-400', desc: 'Flexbox base container for 2D screen elements', tags: ['2d', 'ui', 'hud'] },
    { id: 't-hudText', type: 'hudText', name: 'HUD Text', icon: Type, color: 'text-blue-400', desc: 'Text element rendered inside screen overlays', tags: ['2d', 'ui', 'hud'] },
    { id: 't-hudButton', type: 'hudButton', name: 'HUD Button', icon: Zap, color: 'text-yellow-400', desc: 'Interactive screen button with trigger events', tags: ['2d', 'ui', 'hud'] },
    { id: 't-hudImage', type: 'hudImage', name: 'HUD Image', icon: ImageIcon, color: 'text-pink-400', desc: 'Image billboard rendered inside screen overlays', tags: ['2d', 'ui', 'hud'] },
    { id: 't-hudEmbed', type: 'hudEmbed', name: 'HUD Web Frame', icon: Globe, color: 'text-purple-400', desc: 'Embedded webpage frame inside screen overlays', tags: ['2d', 'ui', 'hud'] },

    // 3D Spatial Primitives & Media
    { id: 't-box', type: 'box', name: 'Cube', icon: Box, color: 'text-blue-400', desc: 'Standard 3D Cube', tags: ['3d', 'primitive'] },
    { id: 't-sphere', type: 'sphere', name: 'Sphere', icon: Box, color: 'text-indigo-400', desc: 'Standard 3D Sphere', tags: ['3d', 'primitive'] },
    { id: 't-plane', type: 'plane', name: 'Plane', icon: Box, color: 'text-slate-400', desc: '2D Billboard Plane', tags: ['3d', 'primitive'] },
    { id: 't-cylinder', type: 'cylinder', name: 'Cylinder', icon: Box, color: 'text-emerald-400', desc: '3D Cylinder', tags: ['3d', 'primitive'] },
    { id: 't-cone', type: 'cone', name: 'Cone', icon: Box, color: 'text-amber-400', desc: '3D Cone', tags: ['3d', 'primitive'] },
    { id: 't-torus', type: 'torus', name: 'Torus', icon: Box, color: 'text-rose-400', desc: '3D Torus (Donut)', tags: ['3d', 'primitive'] },
    { id: 't-text', type: 'text', name: '3D Text', icon: Box, color: 'text-white', desc: '3D Billboard Text', tags: ['3d', 'ui'] },
    { id: 't-image', type: 'image', name: 'Image Board', icon: ImageIcon, color: 'text-green-400', desc: 'Flat Image Billboard', tags: ['2d', 'media'] },
    { id: 't-video', type: 'video', name: 'Video Board', icon: Video, color: 'text-purple-400', desc: 'Flat Video Billboard', tags: ['2d', 'media'] },
    { id: 't-audio', type: 'audio', name: 'Sound Node', icon: Music, color: 'text-pink-400', desc: 'Ambient Sound Emitter', tags: ['audio', 'media'] },
    { id: 't-youtube', type: 'youtube', name: 'YouTube Panel', icon: Video, color: 'text-red-500', desc: 'Curved YouTube Player', tags: ['2d', 'media'] },
    { id: 't-button', type: 'button', name: 'AR Button', icon: Zap, color: 'text-blue-500', desc: 'Clickable AR Button', tags: ['3d', 'ui'] },
    { id: 't-web', type: 'web', name: 'Web View', icon: Globe, color: 'text-cyan-400', desc: 'Curved Web Browser Panel', tags: ['2d', 'ui'] },
    { id: 't-particles', type: 'particles', name: 'Particles', icon: Sparkles, color: 'text-purple-400', desc: 'Particle Emitter System', tags: ['3d', 'vfx'] },
    { id: 't-group', type: 'group', name: 'Group', icon: Folder, color: 'text-orange-400', desc: 'Empty Transform Group', tags: ['logic'] },
  ];

  const handleAddTemplate = (type: string) => {
    const newObj: any = {
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
      newObj.properties = { color: '#ffffff', roughness: 0.5, metalness: 0.1, opacity: 1.0, wireframe: false };
    } else if (type === 'sphere') {
      newObj.properties = { color: '#ffffff', roughness: 0.4, metalness: 0.1, opacity: 1.0, wireframe: false };
    } else if (type === 'plane') {
      newObj.properties = { color: '#666666', roughness: 0.8, doubleSided: true };
    } else if (type === 'cylinder') {
      newObj.properties = { color: '#ffffff', roughness: 0.5, metalness: 0.2 };
    } else if (type === 'cone') {
      newObj.properties = { color: '#ffffff', roughness: 0.5, metalness: 0.2 };
    } else if (type === 'torus') {
      newObj.properties = { color: '#3b82f6', roughness: 0.3, metalness: 0.4 };
    } else if (type === 'text') {
      newObj.properties = { text: 'Hello AR', color: '#ffffff', fontSize: 0.25, maxWidth: 4.0, textAlign: 'center' };
    } else if (type === 'image') {
      newObj.properties = { textureUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', opacity: 1.0, doubleSided: true };
    } else if (type === 'video') {
      newObj.properties = { videoUrl: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05c5c839d39e7fa17b4474775836a0c&profile_id=139&oauth2_token_id=57447761', playing: true, loop: true, muted: true, volume: 0.5 };
      newObj.scale = [1.6, 0.9, 1];
    } else if (type === 'audio') {
      newObj.properties = { soundUrl: '/sounds/forest_ambient.wav', autoplay: true, playing: true, loop: true, volume: 0.5 };
    } else if (type === 'light') {
      newObj.properties = { lightType: 'point', color: '#ffedd5', intensity: 3.0, distance: 12.0 };
      newObj.position = [0, 2, 0];
    } else if (type === 'button') {
      newObj.properties = { text: 'Click Me', color: '#3b82f6', textColor: '#ffffff', url: 'https://example.com' };
      newObj.scale = [1, 0.3, 0.05];
    } else if (type === 'youtube') {
      newObj.properties = { videoId: 'dQw4w9WgXcQ' };
    } else if (type === 'hudCanvas') {
      newObj.name = 'HUD Canvas';
    }
    useEditorStore.getState().addObject(newObj);
    showToast(`Added ${newObj.name}`);
  };

  const handleAddHUDLayout = (layoutType: string) => {
    const parentCanvasId = uuidv4();
    const batchObjects: any[] = [];

    if (layoutType === 'header-footer') {
      // 1. Parent Canvas
      batchObjects.push({
        id: parentCanvasId,
        name: 'Header-Footer Scaffold',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: null,
        properties: {
          layoutMode: 'column',
          layoutAlignItems: 'stretch',
          layoutJustifyContent: 'space-between',
          backgroundColor: '#0c0a09',
          opacity: 0.1,
          layoutPadding: 20,
          layoutGap: 16
        }
      });

      // 2. Header Canvas
      const headerId = uuidv4();
      batchObjects.push({
        id: headerId,
        name: 'HUD Header',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentCanvasId,
        properties: {
          layoutMode: 'row',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'space-between',
          backgroundColor: '#1c1917',
          opacity: 0.85,
          layoutPadding: 16,
          layoutGap: 12,
          blur: 10,
          borderRadius: 12,
          height: 70
        }
      });

      // Header Text
      batchObjects.push({
        id: uuidv4(),
        name: 'Header Title',
        type: 'hudText',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: headerId,
        properties: {
          text: '⚡ SPATIAL MONITOR v1.0',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#38bdf8'
        }
      });

      // Header Button
      batchObjects.push({
        id: uuidv4(),
        name: 'Header Action',
        type: 'hudButton',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: headerId,
        properties: {
          text: 'RESET CORE',
          color: '#ef4444',
          textColor: '#ffffff',
          borderRadius: 6,
          paddingX: 12,
          paddingY: 6
        }
      });

      // 3. Central Content Area
      const contentId = uuidv4();
      batchObjects.push({
        id: contentId,
        name: 'HUD Content View',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentCanvasId,
        properties: {
          layoutMode: 'column',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'center',
          backgroundColor: '#000000',
          opacity: 0.0,
          layoutPadding: 16,
          layoutGap: 12
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Content Description',
        type: 'hudText',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: contentId,
        properties: {
          text: 'No warnings detected. Neural linkages are green.',
          fontSize: 16,
          color: '#a8a29e',
          textAlign: 'center'
        }
      });

      // 4. Footer Canvas
      const footerId = uuidv4();
      batchObjects.push({
        id: footerId,
        name: 'HUD Footer',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentCanvasId,
        properties: {
          layoutMode: 'row',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'center',
          backgroundColor: '#1c1917',
          opacity: 0.85,
          layoutPadding: 12,
          layoutGap: 16,
          borderRadius: 12,
          height: 60
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Footer Action Button',
        type: 'hudButton',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: footerId,
        properties: {
          text: 'PROCEED TO SYSTEM DIAGNOSTIC',
          color: '#10b981',
          textColor: '#ffffff',
          borderRadius: 8,
          paddingX: 20,
          paddingY: 8
        }
      });
    } else if (layoutType === 'split-screen') {
      // Row Flex Split-Screen Parent
      batchObjects.push({
        id: parentCanvasId,
        name: 'Split-Screen Layout',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: null,
        properties: {
          layoutMode: 'row',
          layoutAlignItems: 'stretch',
          layoutJustifyContent: 'start',
          backgroundColor: '#0c0a09',
          opacity: 0.1,
          layoutPadding: 16,
          layoutGap: 16
        }
      });

      // Sidebar
      const sidebarId = uuidv4();
      batchObjects.push({
        id: sidebarId,
        name: 'Left Sidebar Pane',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentCanvasId,
        properties: {
          layoutMode: 'column',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'start',
          backgroundColor: '#1c1917',
          opacity: 0.9,
          layoutPadding: 20,
          layoutGap: 12,
          borderRadius: 16,
          width: 260
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Sidebar Header Text',
        type: 'hudText',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: sidebarId,
        properties: {
          text: '🛠️ CONTROLS',
          fontSize: 16,
          fontWeight: 'bold',
          color: '#e7e5e4'
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Nav Button 1',
        type: 'hudButton',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: sidebarId,
        properties: {
          text: 'DASHBOARD',
          color: '#3b82f6',
          textColor: '#ffffff',
          borderRadius: 6,
          paddingX: 16,
          paddingY: 8
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Nav Button 2',
        type: 'hudButton',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: sidebarId,
        properties: {
          text: 'TELEMETRY SETTINGS',
          color: '#44403c',
          textColor: '#d6d3d1',
          borderRadius: 6,
          paddingX: 16,
          paddingY: 8
        }
      });

      // Right Main Pane
      const mainPaneId = uuidv4();
      batchObjects.push({
        id: mainPaneId,
        name: 'Right Main Pane',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentCanvasId,
        properties: {
          layoutMode: 'column',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'center',
          backgroundColor: '#18181b',
          opacity: 0.6,
          layoutPadding: 24,
          layoutGap: 16,
          borderRadius: 16
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Main Title',
        type: 'hudText',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: mainPaneId,
        properties: {
          text: 'Operational Telemetry Console',
          fontSize: 22,
          fontWeight: 'bold',
          color: '#ffffff'
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Main Image',
        type: 'hudImage',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: mainPaneId,
        properties: {
          textureUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
          width: 320,
          height: 160,
          borderRadius: 8
        }
      });
    } else if (layoutType === 'centered-modal') {
      // Backdrop full-screen Canvas
      batchObjects.push({
        id: parentCanvasId,
        name: 'Backdrop Canvas Overlay',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: null,
        properties: {
          layoutMode: 'column',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'center',
          backgroundColor: '#000000',
          opacity: 0.65
        }
      });

      // Centered Dialog Card
      const dialogId = uuidv4();
      batchObjects.push({
        id: dialogId,
        name: 'Centered Modal Dialog',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentCanvasId,
        properties: {
          layoutMode: 'column',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'center',
          backgroundColor: '#1c1917',
          opacity: 0.95,
          layoutPadding: 28,
          layoutGap: 16,
          blur: 15,
          borderRadius: 16,
          width: 480,
          height: 280
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Modal Title Text',
        type: 'hudText',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: dialogId,
        properties: {
          text: '⚠️ SYSTEM OVERRIDE CONFIRMATION',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#f97316'
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Modal Body Text',
        type: 'hudText',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: dialogId,
        properties: {
          text: 'Are you sure you want to initialize neural override controls on the main grid?',
          fontSize: 14,
          color: '#d6d3d1',
          textAlign: 'center'
        }
      });

      // Actions row inside modal
      const actionsId = uuidv4();
      batchObjects.push({
        id: actionsId,
        name: 'Modal Action Bar',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: dialogId,
        properties: {
          layoutMode: 'row',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'center',
          backgroundColor: '#000000',
          opacity: 0.0,
          layoutPadding: 0,
          layoutGap: 16,
          height: 50
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Confirm Override Button',
        type: 'hudButton',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: actionsId,
        properties: {
          text: 'CONFIRM OVERRIDE',
          color: '#ea580c',
          textColor: '#ffffff',
          borderRadius: 6,
          paddingX: 16,
          paddingY: 8
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Cancel Override Button',
        type: 'hudButton',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: actionsId,
        properties: {
          text: 'ABORT ACTION',
          color: '#44403c',
          textColor: '#d6d3d1',
          borderRadius: 6,
          paddingX: 16,
          paddingY: 8
        }
      });
    } else if (layoutType === 'status-grid') {
      // Full screen parent Column layout
      batchObjects.push({
        id: parentCanvasId,
        name: 'Top/Bottom Layout Scaffold',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: null,
        properties: {
          layoutMode: 'column',
          layoutAlignItems: 'stretch',
          layoutJustifyContent: 'space-between',
          backgroundColor: '#0c0a09',
          opacity: 0.0,
          layoutPadding: 16,
          layoutGap: 16
        }
      });

      // Top bar canvas
      const topBarId = uuidv4();
      batchObjects.push({
        id: topBarId,
        name: 'Top Status Bar',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentCanvasId,
        properties: {
          layoutMode: 'row',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'space-between',
          backgroundColor: '#18181b',
          opacity: 0.9,
          layoutPadding: 12,
          layoutGap: 12,
          borderRadius: 8,
          height: 50
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Top Status Text',
        type: 'hudText',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: topBarId,
        properties: {
          text: '🟢 SYSTEM LINK: HEALTHY',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#10b981'
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Top Status Button',
        type: 'hudButton',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: topBarId,
        properties: {
          text: 'RE-SYNC LINK',
          color: '#3b82f6',
          textColor: '#ffffff',
          borderRadius: 4,
          paddingX: 10,
          paddingY: 4
        }
      });

      // Bottom bar canvas
      const bottomBarId = uuidv4();
      batchObjects.push({
        id: bottomBarId,
        name: 'Bottom Status Bar',
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentCanvasId,
        properties: {
          layoutMode: 'row',
          layoutAlignItems: 'center',
          layoutJustifyContent: 'space-between',
          backgroundColor: '#18181b',
          opacity: 0.9,
          layoutPadding: 12,
          layoutGap: 12,
          borderRadius: 8,
          height: 50
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Bottom Status Text',
        type: 'hudText',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: bottomBarId,
        properties: {
          text: '⚡ BATTERY CHASSIS: 98% (CHARGING)',
          fontSize: 14,
          color: '#eab308'
        }
      });

      batchObjects.push({
        id: uuidv4(),
        name: 'Bottom Settings Button',
        type: 'hudButton',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: bottomBarId,
        properties: {
          text: 'RE-CALIBRATE ENERGY',
          color: '#ca8a04',
          textColor: '#ffffff',
          borderRadius: 4,
          paddingX: 10,
          paddingY: 4
        }
      });
    }

    // Add all batch objects sequentially to the scene tree
    batchObjects.forEach(obj => {
      useEditorStore.getState().addObject(obj);
    });

    showToast(`Deployed preset scaffold "${layoutType}" directly to the scene.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="w-full h-full max-w-6xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-3xl flex flex-col relative select-none shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-white/5 animate-in zoom-in-95 duration-200">
        
      {/* Toast Notification popup */}
      {notification && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg border border-blue-500/20 z-50 flex items-center gap-1.5 animate-bounce">
          <Sparkles size={12} />
          {notification}
        </div>
      )}

      {/* Header bar */}
      <div className="h-14 border-b border-white/10 bg-black/20 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-blue-500" />
          <span className="text-sm font-black tracking-wide text-white">AR ASSET STUDIO</span>
        </div>
        
        {/* Upload & Marker Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowMarkerManager(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1E293B] hover:bg-blue-600 border border-blue-900/40 hover:border-blue-500 rounded text-[11px] text-[#93C5FD] hover:text-white font-medium transition-all cursor-pointer shadow-sm"
            title="Manage and analyze tracking print marker"
          >
            <ImageIcon size={12} className="text-blue-400 shrink-0" />
            Marker Manager
          </button>
          <button 
            onClick={handleUploadClick}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#222] hover:bg-blue-600 border border-[#333] hover:border-blue-500 rounded text-[11px] text-white font-medium transition-all"
            title="Upload GLB, PNG, MP4, MP3 or JS files"
          >
            <Upload size={12} />
            Import Asset
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".glb,.gltf,image/*,video/*,audio/*,.js"
            onChange={handleFileChange}
          />
        </div>
        <button onClick={() => setIsAssetBrowserOpen(false)} className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav categories */}
        <div className="w-56 bg-white/5 border-r border-white/10 flex flex-col py-3 overflow-y-auto shrink-0 font-sans text-sm gap-1 px-2">

          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-1">Creation</div>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'templates' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Plus size={16} className={activeTab === 'templates' ? 'text-white' : 'text-emerald-400'} />
            <span className="font-medium">Primitives & UI</span>
          </button>
          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-4 mb-1">Library</div>

          <button onClick={() => setActiveTab('uploads')} className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'uploads' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}>
    <Upload size={16} className={activeTab === 'uploads' ? 'text-white' : 'text-gray-400'} />
    <span className="font-medium">My Uploads</span>
    <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full font-mono">{assets.length}</span>
  </button>

          
          

          <button 
            onClick={() => setActiveTab('sketchfab')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'sketchfab' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Search size={16} className={activeTab === "sketchfab" ? "text-white" : "text-yellow-400"} />
            <span className="font-medium">Sketchfab / CC</span>
          </button>

          
          

          <button 
            onClick={() => setActiveTab('layouts')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'layouts' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <LayoutGrid size={16} className={activeTab === "layouts" ? "text-white" : "text-cyan-400"} />
            <span className="font-medium">2D HUD Layouts</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('models')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'models' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Box size={16} className={activeTab === "models" ? "text-white" : "text-blue-400"} />
            <span className="font-medium">3D Models</span>
          </button>

          <button 
            onClick={() => setActiveTab('markers')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'markers' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <ImageIcon size={16} className={activeTab === "markers" ? "text-white" : "text-green-400"} />
            <span className="font-medium">AR Markers</span>
          </button>

          <button 
            onClick={() => setActiveTab('audio')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'audio' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Music size={16} className={activeTab === "audio" ? "text-white" : "text-pink-400"} />
            <span className="font-medium">Audio & SFX</span>
          </button>

          <button 
            onClick={() => setActiveTab('behaviors')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'behaviors' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Zap size={16} className={activeTab === "behaviors" ? "text-white" : "text-orange-400"} />
            <span className="font-medium">Behaviors</span>
          </button>

          <button 
            onClick={() => setActiveTab('lighting')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'lighting' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Sun size={16} className={activeTab === "lighting" ? "text-white" : "text-yellow-400"} />
            <span className="font-medium">Lighting Presets</span>
          </button>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/40">

          {/* TEMPLATES TAB */}
          {activeTab === 'templates' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="mb-6 px-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Plus className="text-emerald-400" /> Primitives & Templates</h3>
                <p className="text-sm text-gray-400 mt-1">Quickly add standard 3D geometries, UI elements, and logical nodes to your scene.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 content-start overflow-y-auto pr-2 pb-20">
                
                
                {/* Search & Filter Bar */}
                <div className="col-span-full mb-4 flex gap-4">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search templates and primitives..." 
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {['all', '3d', '2d', 'ui', 'media', 'primitive', 'logic', 'complex'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setTemplateFilterTag(tag)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${templateFilterTag === tag ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                      >
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prebuilt Advanced Templates */}
                {PREBUILT_TEMPLATES.filter(t => {
                  const matchSearch = t.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) || t.description.toLowerCase().includes(templateSearchQuery.toLowerCase());
                  const matchTag = templateFilterTag === 'all' || (t.tags && t.tags.includes(templateFilterTag));
                  return matchSearch && matchTag;
                }).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { instantiateTemplate(t.id); setIsAssetBrowserOpen(false); }}
                    className="flex flex-col p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95 text-left gap-2 shadow-sm hover:shadow-emerald-500/10 col-span-2 sm:col-span-3 md:col-span-2 lg:col-span-2"
                  >
                    <h3 className="text-sm font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-2">
                      <Sparkles size={16} /> {t.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 leading-snug line-clamp-3">{t.description}</p>
                    <div className="mt-auto pt-2 flex flex-wrap gap-1">
                      {t.tags?.map(tag => (
                        <span key={tag} className="text-[8px] uppercase tracking-wider font-bold bg-white/5 px-2 py-0.5 rounded text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}

                {templateSearchQuery.trim() !== '' ? (
                  TEMPLATES.filter(t => {
                    const matchSearch = t.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) || t.desc.toLowerCase().includes(templateSearchQuery.toLowerCase());
                    const matchTag = templateFilterTag === 'all' || t.tags.includes(templateFilterTag);
                    return matchSearch && matchTag;
                  }).map((t) => {
                    const IconComp = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { handleAddTemplate(t.type); setIsAssetBrowserOpen(false); }}
                        className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95 text-center gap-3 shadow-sm hover:shadow-emerald-500/10"
                      >
                        <div className="p-3 bg-black/40 rounded-xl group-hover:bg-black/60 shadow-inner">
                          <IconComp size={28} className={`${t.color} group-hover:scale-110 transition-transform`} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{t.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 leading-tight">{t.desc}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <>
                    {/* Category 1: 2D HUD Screen Overlays */}
                    {(templateFilterTag === 'all' || templateFilterTag === '2d' || templateFilterTag === 'hud' || templateFilterTag === 'ui') && (
                      <>
                        <div className="col-span-full text-xs font-bold text-[#06b6d4] uppercase tracking-wider border-b border-[#06b6d4]/20 pb-1.5 mb-1 mt-4 flex items-center gap-2">
                          <LayoutGrid size={14} />
                          2D HUD Screen Overlay Elements
                        </div>
                        {TEMPLATES.filter(t => t.tags.includes('hud') && (templateFilterTag === 'all' || t.tags.includes(templateFilterTag))).map((t) => {
                          const IconComp = t.icon;
                          return (
                            <button
                              key={t.id}
                              onClick={() => { handleAddTemplate(t.type); setIsAssetBrowserOpen(false); }}
                              className="flex flex-col items-center p-4 bg-cyan-950/25 hover:bg-cyan-900/35 border border-cyan-500/10 hover:border-cyan-400/50 rounded-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95 text-center gap-3 shadow-sm hover:shadow-cyan-500/10"
                            >
                              <div className="p-3 bg-black/40 rounded-xl group-hover:bg-black/60 shadow-inner">
                                <IconComp size={28} className={`${t.color} group-hover:scale-110 transition-transform`} />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">{t.name}</h4>
                                <p className="text-[10px] text-gray-400 mt-1 leading-snug line-clamp-2">{t.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </>
                    )}

                    {/* Category 2: 3D Spatial Geometries & Nodes */}
                    {(templateFilterTag === 'all' || templateFilterTag === '3d' || templateFilterTag === 'primitive' || templateFilterTag === 'logic' || templateFilterTag === 'media' || templateFilterTag === 'vfx') && (
                      <>
                        <div className="col-span-full text-xs font-bold text-[#ec4899] uppercase tracking-wider border-b border-[#ec4899]/20 pb-1.5 mb-1 mt-6 flex items-center gap-2">
                          <Box size={14} />
                          3D Spatial Scene Entities
                        </div>
                        {TEMPLATES.filter(t => !t.tags.includes('hud') && (templateFilterTag === 'all' || t.tags.includes(templateFilterTag))).map((t) => {
                          const IconComp = t.icon;
                          return (
                            <button
                              key={t.id}
                              onClick={() => { handleAddTemplate(t.type); setIsAssetBrowserOpen(false); }}
                              className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95 text-center gap-3 shadow-sm hover:shadow-emerald-500/10"
                            >
                              <div className="p-3 bg-black/40 rounded-xl group-hover:bg-black/60 shadow-inner">
                                <IconComp size={28} className={`${t.color} group-hover:scale-110 transition-transform`} />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">{t.name}</h4>
                                <p className="text-[10px] text-gray-400 mt-1 leading-snug line-clamp-2">{t.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* LAYOUTS TAB */}
          {activeTab === 'layouts' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="mb-6 px-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <LayoutGrid className="text-cyan-400" />
                  2D HUD Layout Presets
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Deploy pre-configured 2D HUD structural layouts using CSS flexbox to scaffold your spatial screen interfaces instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 content-start overflow-y-auto pr-2 pb-20">
                <button
                  onClick={() => { handleAddHUDLayout('header-footer'); setIsAssetBrowserOpen(false); }}
                  className="flex flex-col p-5 bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 border border-white/10 hover:border-cyan-500/50 rounded-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95 text-left gap-2.5 shadow-sm hover:shadow-cyan-500/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono bg-cyan-950/40 border border-cyan-800/30 px-2.5 py-1 rounded">
                      FLEX: COLUMN (STRETCH)
                    </span>
                    <Layers size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-base font-bold text-white">🚀 Header-Footer Scaffold</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Spawns a full-screen parent layout with a frosted glass Header Bar (for titles), a central content panel, and a Footer Button Bar for controls.
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/5 flex gap-2">
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Header</span>
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Footer</span>
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Actions</span>
                  </div>
                </button>

                <button
                  onClick={() => { handleAddHUDLayout('split-screen'); setIsAssetBrowserOpen(false); }}
                  className="flex flex-col p-5 bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 border border-white/10 hover:border-cyan-500/50 rounded-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95 text-left gap-2.5 shadow-sm hover:shadow-cyan-500/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono bg-cyan-950/40 border border-cyan-800/30 px-2.5 py-1 rounded">
                      FLEX: ROW (STRETCH)
                    </span>
                    <LayoutGrid size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-base font-bold text-white">📊 Split-Screen Dashboard</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Creates a dual-pane setup with a left-docked 30% Control Sidebar (holding navigations) and a right-docked 70% content area detailing telemetry.
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/5 flex gap-2">
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Sidebar</span>
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Monitor</span>
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Grid</span>
                  </div>
                </button>

                <button
                  onClick={() => { handleAddHUDLayout('centered-modal'); setIsAssetBrowserOpen(false); }}
                  className="flex flex-col p-5 bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 border border-white/10 hover:border-cyan-500/50 rounded-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95 text-left gap-2.5 shadow-sm hover:shadow-cyan-500/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono bg-emerald-950/40 border border-emerald-800/30 px-2.5 py-1 rounded">
                      FLEX: CENTER (CENTER)
                    </span>
                    <Zap size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-base font-bold text-white">⚠️ Centered Dialog Modal</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Spawns a full-screen dark backdrop overlay containing a beautifully styled, centered pop-up dialog panel with confirmation action buttons.
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/5 flex gap-2">
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Modal</span>
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Popup</span>
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Overlay</span>
                  </div>
                </button>

                <button
                  onClick={() => { handleAddHUDLayout('status-grid'); setIsAssetBrowserOpen(false); }}
                  className="flex flex-col p-5 bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 border border-white/10 hover:border-cyan-500/50 rounded-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95 text-left gap-2.5 shadow-sm hover:shadow-cyan-500/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono bg-cyan-950/40 border border-cyan-800/30 px-2.5 py-1 rounded">
                      FLEX: ROW (SPACE-BETWEEN)
                    </span>
                    <Volume2 size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-base font-bold text-white">🟢 Top/Bottom Status Bar</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Spawns a sleek top-docked connection status bar and a bottom-docked calibration control ribbon across the viewport boundaries.
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/5 flex gap-2">
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Status Bar</span>
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Top Bar</span>
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded">Compact</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          
          {/* UPLOADS TAB */}
          {activeTab === 'uploads' && (
            <div className="flex flex-wrap gap-4 content-start h-full">
              {assets.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#555] gap-2 border-2 border-dashed border-[#222] rounded-lg">
                  <Upload size={28} className="text-[#333]" />
                  <p className="text-xs">No custom assets. Import a 3D model or target image to begin.</p>
                  <button 
                    onClick={handleUploadClick}
                    className="mt-1 px-3 py-1 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-[11px] text-[#888] hover:text-white rounded transition-colors"
                  >
                    Select File
                  </button>
                </div>
              ) : (
                assets.map(asset => (
                  <div 
                    key={asset.id}
                    draggable={editingId !== asset.id}
                    onDragStart={(e) => handleDragStart(e, asset)}
                    onDoubleClick={() => handleUseAsset(asset)}
                    className="w-24 h-28 bg-[#141414] border border-[#222] hover:border-blue-500 rounded flex flex-col items-center p-2 cursor-pointer hover:bg-[#1A1A1A] transition-all group relative shadow"
                    title={`${asset.name} - Double-click to apply`}
                  >
                    <div className="flex-1 w-full flex items-center justify-center overflow-hidden rounded bg-black/40 mb-1">
                      {asset.type === 'image' ? (
                        <img src={asset.url} alt={asset.name} className="w-12 h-12 object-contain" />
                      ) : (
                        getIcon(asset.type)
                      )}
                    </div>
                    
                    {editingId === asset.id ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-black text-white text-[10px] border border-blue-500 rounded px-1 outline-none text-center"
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-[10px] text-[#999] text-center w-full truncate font-sans group-hover:text-white" onDoubleClick={(e) => startEditing(e, asset.id, asset.name)}>
                        {asset.name}
                      </span>
                    )}

                    {/* Actions panel overlay */}
                    {editingId !== asset.id && (
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all bg-[#141414]/90 p-0.5 rounded shadow">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                          title="Delete"
                        >
                          <Trash2 size={10} />
                        </button>
                        <button
                          onClick={(e) => startEditing(e, asset.id, asset.name)}
                          className="p-1 hover:bg-blue-500/20 text-blue-400 rounded"
                          title="Rename"
                        >
                          <Edit2 size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* SKETCHFAB / WEB SEARCH TAB */}
          {activeTab === 'sketchfab' && (
            <div className="flex flex-col gap-4 font-sans h-full w-full">
              {/* Header */}
              <div className="flex flex-col bg-[#141414] border border-[#222] rounded-lg p-3">
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} className="animate-pulse text-yellow-400" />
                  Free 3D Discovery Studio
                </span>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  Search and deploy 100% free, open-source Creative Commons 3D models from 
                  <strong> Sketchfab</strong>, <strong>NASA</strong>, and the <strong>Smithsonian Museum</strong>. 
                  Adding an asset automatically registers it in your <strong>Asset Studio</strong> for reuse!
                </p>
              </div>

              {/* Controls: Search & Paste URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Search Box */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search models (e.g. Astronaut, Car, Rocket)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#111] text-xs font-sans pl-9 pr-3 py-2 border border-[#222] rounded focus:border-yellow-500 text-white outline-none"
                  />
                </div>

                {/* Direct Link Importer */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!customImportUrl) return;
                    // Add as asset & spawn using standard helper
                    const newAssetId = Math.random().toString(36).substring(2, 9);
                    const cleanName = customImportUrl.substring(customImportUrl.lastIndexOf('/') + 1) || 'Custom GLB Model';
                    const newAsset = {
                      id: newAssetId,
                      name: cleanName,
                      type: 'model' as AssetType,
                      url: customImportUrl
                    };
                    addAsset(newAsset);
                    handleUseAsset(newAsset);
                    setCustomImportUrl('');
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Paste any custom .glb/.gltf asset link..."
                    value={customImportUrl}
                    onChange={(e) => setCustomImportUrl(e.target.value)}
                    className="flex-1 bg-[#111] text-xs font-mono px-3 py-2 border border-[#222] rounded focus:border-yellow-500 text-white outline-none min-w-0"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xs rounded transition-colors cursor-pointer shrink-0"
                  >
                    Import & Deploy
                  </button>
                </form>
              </div>

              {/* Category Badges */}
              <div className="flex flex-wrap gap-1.5 border-b border-[#222] pb-3">
                {['all', 'space', 'vehicles', 'characters', 'nature', 'interior', 'items', 'animals'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSearchCategory(cat)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                      searchCategory === cat
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-extrabold'
                        : 'bg-[#141414] text-gray-500 hover:text-white border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Models Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 content-start">
                {SKETCHFAB_WEB_MODELS.filter(m => {
                  const matchQuery = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     m.description.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchCategory = searchCategory === 'all' || m.category === searchCategory;
                  return matchQuery && matchCategory;
                }).map(model => (
                  <div
                    key={model.name}
                    className="bg-[#141414] border border-[#222] hover:border-yellow-500 rounded p-3 flex flex-col items-start gap-1 hover:bg-[#1A1A1A] transition-all group relative cursor-pointer"
                    title="Double-click to deploy and save"
                    onDoubleClick={() => {
                      const newAsset = {
                        id: Math.random().toString(36).substring(2, 9),
                        name: model.name,
                        type: 'model' as AssetType,
                        url: model.url
                      };
                      addAsset(newAsset);
                      handleUseAsset(newAsset);
                    }}
                  >
                    {/* Visual Thumb */}
                    <div className="w-full aspect-square flex flex-col items-center justify-center bg-black/40 rounded mb-1 relative overflow-hidden text-center p-2">
                      <span className="text-3xl group-hover:scale-125 transition-transform">📦</span>
                      <span className="text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1 py-0.5 rounded mt-2 uppercase font-mono font-bold tracking-wider leading-none">
                        {model.creator}
                      </span>
                      <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Plus size={20} className="text-yellow-400" />
                      </div>
                    </div>

                    <span className="text-xs font-bold text-white truncate w-full">{model.name}</span>
                    <p className="text-[9px] text-[#666] leading-snug h-6 overflow-hidden line-clamp-2 w-full">{model.description}</p>
                    
                    <button
                      onClick={() => {
                        const newAsset = {
                          id: Math.random().toString(36).substring(2, 9),
                          name: model.name,
                          type: 'model' as AssetType,
                          url: model.url
                        };
                        addAsset(newAsset);
                        handleUseAsset(newAsset);
                      }}
                      className="mt-2 w-full text-center bg-yellow-600 hover:bg-yellow-500 text-black text-[10px] font-bold py-1 rounded transition-colors cursor-pointer"
                    >
                      Deploy Model
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3D MODELS TAB */}
          {activeTab === 'models' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 content-start">
              {PRESET_MODELS.map(model => (
                <div 
                  key={model.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, model)}
                  onDoubleClick={() => handleUseAsset(model)}
                  className="bg-[#141414] border border-[#222] hover:border-blue-500 rounded p-3 flex flex-col items-start gap-1 cursor-grab hover:bg-[#1A1A1A] transition-all group relative"
                  title="Drag into the scene or Double-click to spawn"
                >
                  <div className="w-full aspect-square flex items-center justify-center bg-black/40 rounded text-2xl mb-1 relative overflow-hidden">
                    <span className="group-hover:scale-125 transition-transform">{model.thumbnail}</span>
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus size={20} className="text-blue-400" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white truncate w-full">{model.name}</span>
                  <p className="text-[9px] text-[#666] leading-snug h-6 overflow-hidden line-clamp-2 w-full">{model.description}</p>
                  
                  <button 
                    onClick={() => handleUseAsset(model)}
                    className="mt-2 w-full text-center bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold py-1 rounded transition-colors"
                  >
                    Add to Scene
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* MARKERS TAB */}
          {activeTab === 'markers' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 content-start">
              {PRESET_MARKERS.map(marker => (
                <div 
                  key={marker.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, marker)}
                  onDoubleClick={() => handleUseAsset(marker)}
                  className="bg-[#141414] border border-[#222] hover:border-green-500 rounded p-2.5 flex flex-col gap-1 cursor-grab hover:bg-[#1A1A1A] transition-all group relative"
                  title="Drag to the Viewport or Double-click to set tracking marker"
                >
                  <div className="w-full aspect-[4/3] overflow-hidden rounded bg-black/40 relative">
                    <img src={marker.url} alt={marker.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-1.5 right-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-bold text-green-400 flex items-center gap-0.5">
                      ★ {marker.rating}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white mt-1">{marker.name}</span>
                  <p className="text-[9px] text-[#666] leading-snug w-full">{marker.description}</p>
                  
                  <button 
                    onClick={() => handleUseAsset(marker)}
                    className="mt-1 w-full text-center bg-[#222] hover:bg-green-600 border border-[#333] hover:border-green-500 text-white text-[10px] font-semibold py-1 rounded transition-colors"
                  >
                    Set as Active Target
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AUDIO TAB */}
          {activeTab === 'audio' && (
            <div className="flex flex-col gap-4 h-full overflow-hidden">
              {/* Category selector */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[#222] -mx-1 px-1">
                {['All', 'UI & Interface', 'Magical & Fantasy', 'Sci-Fi & Retro', 'Music & Loops', 'Ambience & Environments'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedAudioCategory(category)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                      selectedAudioCategory === category
                        ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
                        : 'bg-[#141414] text-gray-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Grid of sounds */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 overflow-y-auto pr-1">
                {PRESET_SOUNDS.filter(s => selectedAudioCategory === 'All' || s.category === selectedAudioCategory).map(sound => {
                  const hasSelected = !!selectedObjectId;
                  return (
                    <div 
                      key={sound.id}
                      onDoubleClick={() => handleUseAsset(sound)}
                      className="bg-[#141414] border border-[#222] hover:border-pink-500 rounded p-3 flex flex-col gap-1 cursor-pointer hover:bg-[#1A1A1A] transition-all group relative"
                      title="Double-click to preview sound / Attach to selected object"
                    >
                      <div className="w-full h-14 flex items-center justify-center bg-black/40 rounded text-xl mb-1 relative overflow-hidden">
                        <span className="group-hover:rotate-12 transition-transform">{sound.thumbnail}</span>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            const preview = new Audio(sound.url);
                            preview.volume = 0.4;
                            preview.play().catch(err => console.log('Audio playback preview failed', err));
                          }}
                          className="absolute inset-0 bg-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Play size={16} className="text-pink-400 fill-pink-400/20" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-white truncate w-full">{sound.name}</span>
                      <div className="flex items-center justify-between text-[8px] font-mono text-pink-400 uppercase tracking-wider mt-0.5">
                        {sound.category}
                      </div>
                      <p className="text-[9px] text-[#666] leading-snug h-6 overflow-hidden line-clamp-2 w-full mt-0.5">{sound.description}</p>
                      
                      <button 
                        onClick={() => handleUseAsset(sound)}
                        className={`mt-2 w-full text-center text-[10px] font-semibold py-1 rounded transition-colors border ${hasSelected ? 'bg-pink-600 hover:bg-pink-500 border-pink-500 text-white' : 'bg-[#222] hover:bg-[#333] border-[#333] text-[#888]'}`}
                      >
                        {hasSelected ? 'Attach to Selected' : 'Preview Sound'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BEHAVIORS TAB */}
          {activeTab === 'behaviors' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 content-start">
              {PRESET_BEHAVIORS.map(behavior => {
                const hasSelected = !!selectedObjectId;
                return (
                  <div 
                    key={behavior.id}
                    onDoubleClick={() => handleUseAsset(behavior)}
                    className="bg-[#141414] border border-[#222] hover:border-orange-500 rounded p-3 flex gap-3 cursor-pointer hover:bg-[#1A1A1A] transition-all group relative"
                    title="Double-click to assign this visual effect rule to selected element"
                  >
                    <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-black/40 rounded text-xl relative overflow-hidden">
                      <span className="group-hover:scale-125 transition-transform">{behavior.thumbnail}</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {behavior.name}
                          <span className="bg-orange-500/10 text-orange-400 text-[8px] font-mono px-1 rounded uppercase">Live R3F</span>
                        </span>
                        <p className="text-[9px] text-[#666] leading-snug w-full mt-0.5">{behavior.description}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleUseAsset(behavior)}
                        className={`mt-2 text-left text-[10px] font-semibold py-1 px-2.5 rounded transition-colors self-start border ${hasSelected ? 'bg-orange-600 hover:bg-orange-500 border-orange-500 text-white' : 'bg-[#222] hover:bg-[#333] border-[#333] text-[#888]'}`}
                      >
                        {hasSelected ? 'Apply Behavior' : 'Select Object first'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SCENE LIGHTING TAB */}
          {activeTab === 'lighting' && (
            <div className="flex flex-col gap-4 h-full">
              {/* Category Filter Bar */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[#222] -mx-1 px-1">
                {['All', 'Cinematic', 'Mood / Warm', 'Vibrant', 'Night / Cool', 'Neutral'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedLightingCategory(category)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                      selectedLightingCategory === category
                        ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-[#141414] text-gray-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Grid of lighting presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-1">
                {LIGHTING_PRESETS.filter(p => selectedLightingCategory === 'All' || p.category === selectedLightingCategory).map(preset => {
                  const isCurrentlyApplied = 
                    settings.ambientColor === preset.settings.ambientColor &&
                    settings.ambientIntensity === preset.settings.ambientIntensity &&
                    settings.directionalColor === preset.settings.directionalColor &&
                    settings.directionalIntensity === preset.settings.directionalIntensity;

                  return (
                    <div 
                      key={preset.id}
                      onClick={() => {
                        updateSettings(preset.settings);
                        showToast(`Applied atmospheric lighting preset "${preset.name}" to the scene.`);
                      }}
                      className={`bg-[#141414] border rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-[#1A1A1A] transition-all duration-300 group ${
                        isCurrentlyApplied 
                          ? 'border-yellow-500 shadow-lg shadow-yellow-500/5 bg-[#1C1A14]' 
                          : 'border-[#222] hover:border-gray-500'
                      }`}
                      title="Click to apply atmosphere preset to the scene"
                    >
                      {/* Dynamic Color Gradient representation of the mood/preset */}
                      <div className="w-full h-24 rounded-lg relative overflow-hidden border border-white/5 flex flex-col justify-between p-2.5"
                           style={{
                             background: `linear-gradient(135deg, ${preset.settings.ambientColor}30 0%, ${preset.settings.directionalColor}A0 100%)`
                           }}
                      >
                        {/* Dynamic color orb indicators */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: preset.settings.ambientColor }} title="Ambient Color" />
                            <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: preset.settings.directionalColor }} title="Directional Color" />
                          </div>
                          <span className="text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/60 text-yellow-400 border border-yellow-500/10 font-bold">
                            {preset.category}
                          </span>
                        </div>

                        {/* Title inside card */}
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-extrabold text-white group-hover:text-yellow-300 transition-colors drop-shadow-md">
                            {preset.name}
                          </span>
                          {isCurrentlyApplied && (
                            <span className="text-[8px] bg-yellow-500 text-black font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description and metadata details */}
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] text-gray-400 leading-relaxed font-medium h-12 overflow-hidden line-clamp-3">
                          {preset.description}
                        </p>
                        
                        {/* Show tiny color metrics */}
                        <div className="flex items-center justify-between text-[8px] font-mono text-[#666] border-t border-[#222]/60 pt-2">
                          <span>Intensity: {(preset.settings.ambientIntensity + preset.settings.directionalIntensity).toFixed(2)}x</span>
                          <span>Shadows: {preset.settings.shadowsEnabled ? `${preset.settings.shadowResolution}px` : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
      {showMarkerManager && <MarkerManagerModal onClose={() => setShowMarkerManager(false)} />}
      </div>
    </div>
  );
}
