import { playCachedAudio } from '../../lib/audioManager';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { DEFAULT_ART_POSTER_TEXTURE } from '../../lib/arTargetTexture';
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
  Copy,
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
  LayoutGrid,
  Palette,
  Grid,
  Shapes,
  RefreshCw,
  Download,
  Star,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Asset, AssetType, SceneObject } from '../../types';
import { SPLINE_3D_ICONS, SplineIconMetadata } from '../viewport/Spline3DIconRenderer';
import { SPLINE_2D_ICONS, Spline2DIconMetadata } from '../../lib/spline2DIcons';
import { SPLINE_MATERIAL_PRESETS, getOptimizedARTextures, SplineMaterialPreset, GeneratedARTexture } from '../../lib/splineMaterials';
import { UI_KIT_PRESETS, UIKitPreset } from '../../lib/uiKits';
import { TEXT_STYLE_PRESETS, TextStylePreset } from '../../lib/textStylesCollection';
import { SPLINE_SOUND_PRESETS, playSplineSound, SplineSoundPreset } from '../../lib/splineSoundEngine';
import { BUTTON_TEMPLATES, ButtonTemplate } from '../../lib/buttonTemplates';
import { PRIMITIVE_TEMPLATES, PrimitiveTemplate } from '../../lib/primitiveTemplates';
import { MEDIA_WIDGET_TEMPLATES, MediaWidgetTemplate } from '../../lib/mediaTemplates';
import { CategoryTab } from './assetTypes';
import { CanvaDock } from './CanvaDock';
import { CanvaHeader } from './CanvaHeader';
import { DiscoverView, renderButtonPreview, renderPrimitivePreview, renderMediaPreview } from './DiscoverView';
import { AssetCard } from './AssetCard';
import { MousePointerClick } from 'lucide-react';

export function getSplineThumbnailStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const presets = [
    {
      bg: 'radial-gradient(circle at 35% 35%, #9effeb 0%, #2e86ab 45%, #2a085c 85%, #0d0121 100%)',
      orbBg: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #00f3ff 30%, #b000ff 70%, #1e003a 100%)',
      glowColor: 'rgba(0, 243, 255, 0.4)',
    },
    {
      bg: 'radial-gradient(circle at 35% 35%, #fffbeb 0%, #f59e0b 45%, #b45309 80%, #450a0a 100%)',
      orbBg: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #facc15 35%, #dc2626 75%, #450a0a 100%)',
      glowColor: 'rgba(245, 158, 11, 0.4)',
    },
    {
      bg: 'radial-gradient(circle at 35% 35%, #f7fee7 0%, #84cc16 45%, #15803d 80%, #022c22 100%)',
      orbBg: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #a3e635 30%, #047857 70%, #022c22 100%)',
      glowColor: 'rgba(132, 204, 22, 0.4)',
    },
    {
      bg: 'radial-gradient(circle at 35% 35%, #fff1f2 0%, #fda4af 40%, #e11d48 75%, #4c0519 100%)',
      orbBg: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #fda4af 30%, #be123c 70%, #4c0519 100%)',
      glowColor: 'rgba(225, 29, 72, 0.4)',
    },
    {
      bg: 'radial-gradient(circle at 35% 35%, #ecfeff 0%, #06b6d4 45%, #0369a1 80%, #082f49 100%)',
      orbBg: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #22d3ee 30%, #0284c7 70%, #082f49 100%)',
      glowColor: 'rgba(6, 182, 212, 0.4)',
    },
    {
      bg: 'radial-gradient(circle at 35% 35%, #faf5ff 0%, #c084fc 45%, #7e22ce 80%, #3b0764 100%)',
      orbBg: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e9d5ff 30%, #9333ea 70%, #3b0764 100%)',
      glowColor: 'rgba(192, 132, 252, 0.4)',
    },
    {
      bg: 'radial-gradient(circle at 35% 35%, #f8fafc 0%, #cbd5e1 45%, #475569 80%, #0f172a 100%)',
      orbBg: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e2e8f0 30%, #475569 70%, #0f172a 100%)',
      glowColor: 'rgba(203, 213, 225, 0.3)',
    }
  ];

  return presets[hash % presets.length];
}

export function parseGLBMetadata(arrayBuffer: ArrayBuffer) {
  const view = new DataView(arrayBuffer);
  
  if (view.byteLength < 12) {
    throw new Error("Invalid GLB file: Too short.");
  }
  
  const magic = view.getUint32(0, true);
  if (magic !== 0x46546C67) {
    throw new Error("Invalid GLB file format: magic header is incorrect.");
  }
  
  const version = view.getUint32(4, true);
  const totalLength = view.getUint32(8, true);
  
  if (view.byteLength < 20) {
    throw new Error("Invalid GLB file: Missing JSON chunk header.");
  }
  
  const chunkLength = view.getUint32(12, true);
  const chunkType = view.getUint32(16, true);
  
  if (chunkType !== 0x4E4F534A) {
    throw new Error("Invalid GLB: First chunk is not JSON.");
  }
  
  const jsonBytes = new Uint8Array(arrayBuffer, 20, chunkLength);
  const decoder = new TextDecoder("utf-8");
  const jsonStr = decoder.decode(jsonBytes);
  const gltf = JSON.parse(jsonStr);
  
  let totalTriangles = 0;
  let totalVertices = 0;
  if (gltf.meshes) {
    gltf.meshes.forEach((mesh: any) => {
      if (mesh.primitives) {
        mesh.primitives.forEach((prim: any) => {
          const posAccessorIdx = prim.attributes?.POSITION;
          if (posAccessorIdx !== undefined && gltf.accessors?.[posAccessorIdx]) {
            const posAccessor = gltf.accessors[posAccessorIdx];
            totalVertices += posAccessor.count || 0;
          }
          const indicesAccessorIdx = prim.indices;
          if (indicesAccessorIdx !== undefined && gltf.accessors?.[indicesAccessorIdx]) {
            const indAccessor = gltf.accessors[indicesAccessorIdx];
            totalTriangles += Math.floor((indAccessor.count || 0) / 3);
          } else if (posAccessorIdx !== undefined) {
            totalTriangles += Math.floor((gltf.accessors[posAccessorIdx].count || 0) / 3);
          }
        });
      }
    });
  }

  const externalUris: string[] = [];
  if (gltf.buffers) {
    gltf.buffers.forEach((b: any) => {
      if (b.uri && !b.uri.startsWith('data:')) {
        externalUris.push(b.uri);
      }
    });
  }
  if (gltf.images) {
    gltf.images.forEach((img: any) => {
      if (img.uri && !img.uri.startsWith('data:')) {
        externalUris.push(img.uri);
      }
    });
  }

  return {
    totalVertices,
    totalTriangles,
    externalUris,
    meshCount: gltf.meshes?.length || 0,
    materialCount: gltf.materials?.length || 0,
    textureCount: gltf.textures?.length || 0,
    imageCount: gltf.images?.length || 0,
  };
}

export async function validate3DModel(file: File) {
  let stats: any = null;
  try {
    if (file.name.endsWith('.glb')) {
      const buffer = await file.arrayBuffer();
      stats = parseGLBMetadata(buffer);
    } else if (file.name.endsWith('.gltf')) {
      const text = await file.text();
      const gltf = JSON.parse(text);
      let totalTriangles = 0;
      let totalVertices = 0;
      if (gltf.meshes) {
        gltf.meshes.forEach((mesh: any) => {
          if (mesh.primitives) {
            mesh.primitives.forEach((prim: any) => {
              const posAccessorIdx = prim.attributes?.POSITION;
              if (posAccessorIdx !== undefined && gltf.accessors?.[posAccessorIdx]) {
                totalVertices += gltf.accessors[posAccessorIdx].count || 0;
              }
              const indicesAccessorIdx = prim.indices;
              if (indicesAccessorIdx !== undefined && gltf.accessors?.[indicesAccessorIdx]) {
                totalTriangles += Math.floor((gltf.accessors[indicesAccessorIdx].count || 0) / 3);
              }
            });
          }
        });
      }
      const externalUris: string[] = [];
      if (gltf.buffers) {
        gltf.buffers.forEach((b: any) => {
          if (b.uri && !b.uri.startsWith('data:')) externalUris.push(b.uri);
        });
      }
      if (gltf.images) {
        gltf.images.forEach((img: any) => {
          if (img.uri && !img.uri.startsWith('data:')) externalUris.push(img.uri);
        });
      }
      stats = {
        totalVertices,
        totalTriangles,
        externalUris,
        meshCount: gltf.meshes?.length || 0,
        materialCount: gltf.materials?.length || 0,
        textureCount: gltf.textures?.length || 0,
        imageCount: gltf.images?.length || 0,
      };
    }
  } catch (err) {
    console.warn("Could not parse 3D model metadata for pre-import validation:", err);
  }
  return stats;
}

// Preset GLB models
const PRESET_MODELS = [
  {
    id: 'p-model-astronaut',
    name: 'Astronaut',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    thumbnail: '🚀',
    category: 'Characters',
    description: 'Classic zero-gravity space explorer GLB model',
  },
  {
    id: 'p-model-car',
    name: 'Toy Retro Car',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb',
    thumbnail: '🚗',
    category: 'Vehicles',
    description: 'Highly detailed vintage toy car GLB model',
  },
  {
    id: 'p-model-robot',
    name: 'Expressive Robot',
    type: 'model' as AssetType,
    url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    thumbnail: '🤖',
    category: 'Characters',
    description: 'Robot with animated face panels and joints',
  },
  {
    id: 'p-model-vase',
    name: 'Bronze Vase',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/VaseBronze/glTF-Binary/VaseBronze.glb',
    thumbnail: '🏺',
    category: 'Items',
    description: 'Ancient bronze museum artifact GLB model',
  },
  {
    id: 'p-model-lantern',
    name: 'Vintage Lantern',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Lantern/glTF-Binary/Lantern.glb',
    thumbnail: '🏮',
    category: 'Items',
    description: 'Detailed classic light container GLB model',
  },
  {
    id: 'p-model-shoe',
    name: 'E-Comm Sneaker',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/MaterialsVariantsShoe.glb',
    thumbnail: '👟',
    category: 'Items',
    description: 'E-commerce athletic sneaker with material variants',
  },
  {
    id: 'p-model-helmet',
    name: 'Damaged Sci-Fi Helmet',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    thumbnail: '🪖',
    category: 'Items',
    description: 'High-poly sci-fi battle-damaged helmet',
  },
  {
    id: 'p-model-avocado',
    name: '3D Avocado',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Avocado/glTF-Binary/Avocado.glb',
    thumbnail: '🥑',
    category: 'Food',
    description: 'Photorealistic fresh avocado GLB model',
  },
  {
    id: 'p-model-boombox',
    name: 'Retro BoomBox',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/BoomBox/glTF-Binary/BoomBox.glb',
    thumbnail: '📻',
    category: 'Items',
    description: '80s cassette player stereo boombox',
  },
  {
    id: 'p-model-duck',
    name: 'Rubber Duck',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Duck/glTF-Binary/Duck.glb',
    thumbnail: '🦆',
    category: 'Animals',
    description: 'Yellow bath rubber duck GLB model',
  },
  {
    id: 'p-model-fox',
    name: 'Low-Poly Fox',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb',
    thumbnail: '🦊',
    category: 'Animals',
    description: 'Animated low-poly forest fox character',
  },
  {
    id: 'p-model-chair',
    name: 'Modern Sheen Chair',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    thumbnail: '🪑',
    category: 'Furniture',
    description: 'Velvet fabric modern lounge arm chair',
  },
  {
    id: 'p-model-flamingo',
    name: 'Tropical Flamingo',
    type: 'model' as AssetType,
    url: 'https://threejs.org/examples/models/gltf/Flamingo.glb',
    thumbnail: '🦩',
    category: 'Animals',
    description: 'Animated flying tropical flamingo mesh',
  },
  {
    id: 'p-model-horse',
    name: 'Wild Stallion Horse',
    type: 'model' as AssetType,
    url: 'https://threejs.org/examples/models/gltf/Horse.glb',
    thumbnail: '🐎',
    category: 'Animals',
    description: 'Galloping wild stallion horse GLB model',
  },
  {
    id: 'p-model-parrot',
    name: 'Exotic Parrot',
    type: 'model' as AssetType,
    url: 'https://threejs.org/examples/models/gltf/Parrot.glb',
    thumbnail: '🦜',
    category: 'Animals',
    description: 'Animated flying jungle parrot mesh',
  }
];

// Preset lighting environments
const LIGHTING_PRESETS = [
  {
    id: 'light-studio-clean',
    name: 'Pure Studio Light',
    category: 'Studio',
    description: 'Crisp, high-contrast balanced lighting with gentle soft shadows.',
    settings: {
      ambientIntensity: 0.65,
      ambientColor: '#ffffff',
      directionalIntensity: 1.2,
      directionalColor: '#ffffff',
      shadowsEnabled: true,
      shadowResolution: 2048,
    }
  },
  {
    id: 'light-cyberpunk-neon',
    name: 'Cyberpunk Neon Rig',
    category: 'Cyberpunk',
    description: 'Vibrant neon ambiance with high-intensity cyan and magenta illumination.',
    settings: {
      ambientIntensity: 0.3,
      ambientColor: '#00f3ff',
      directionalIntensity: 1.5,
      directionalColor: '#ff007f',
      shadowsEnabled: true,
      shadowResolution: 2048,
    }
  },
  {
    id: 'light-golden-sunset',
    name: 'Golden Hour Sunset',
    category: 'Outdoor',
    description: 'Warm, low-angle sunset glow with rich amber and rose undertones.',
    settings: {
      ambientIntensity: 0.5,
      ambientColor: '#fdba74',
      directionalIntensity: 1.4,
      directionalColor: '#fb923c',
      shadowsEnabled: true,
      shadowResolution: 1024,
    }
  },
  {
    id: 'light-midnight-moon',
    name: 'Midnight Moon Ambiance',
    category: 'Night',
    description: 'Deep, atmospheric midnight lighting with cool blue rim illumination.',
    settings: {
      ambientIntensity: 0.25,
      ambientColor: '#1e1b4b',
      directionalIntensity: 0.9,
      directionalColor: '#93c5fd',
      shadowsEnabled: true,
      shadowResolution: 1024,
    }
  }
];

// Preset AR tracking markers
const MARKER_PRESETS = [
  {
    id: 'marker-default-poster',
    name: 'Geometric Cyber Matrix',
    type: 'marker',
    url: DEFAULT_ART_POSTER_TEXTURE,
    stability: '98% (High Feature Density)',
    description: 'Optimized high-contrast tracking target poster for AR cameras',
  },
  {
    id: 'marker-hiro',
    name: 'Classic Hiro Pattern',
    type: 'marker',
    url: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/HIRO.jpg',
    stability: '99% (Standard Industrial)',
    description: 'Standard high-contrast Hiro marker pattern',
  },
  {
    id: 'marker-kanji',
    name: 'Kanji Symbol Marker',
    type: 'marker',
    url: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/kanji.jpg',
    stability: '95% (Standard Industrial)',
    description: 'Standard Kanji marker pattern for target tracking',
  }
];

// Sketchfab Models
const SKETCHFAB_PRESETS = [
  {
    name: 'Astronaut Suit 🚀',
    category: 'characters',
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    creator: 'NASA Model Archive CC0',
    description: 'Photorealistic zero-gravity spacesuit model'
  },
  {
    name: 'Retro Toy Car 🚗',
    category: 'vehicles',
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb',
    creator: 'Khronos Group CC0',
    description: 'Detailed vintage toy car with metallic reflections'
  },
  {
    name: 'Expressive Robot 🤖',
    category: 'characters',
    url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    creator: 'Three.js CC-BY',
    description: 'Multi-jointed interactive robot with expressive facial states'
  },
  {
    name: 'Damaged Sci-Fi Helmet 🪖',
    category: 'items',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    creator: 'Sketchfab CC-BY',
    description: 'Futuristic sci-fi battle-damaged helmet with detailed textures'
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
  }
];

export function AssetBrowser() {
  const { 
    assets, 
    addAsset, 
    removeAsset, 
    updateAsset, 
    addObject, 
    selectedObjectId, 
    selectedObjectIds,
    objects,
    updateObject,
    updateSettings,
    settings,
    isAssetBrowserOpen,
    setIsAssetBrowserOpen,
    replaceTargetObjectId,
    setReplaceTargetObjectId,
    replaceObjectAsset
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const storeAssetBrowserTab = useEditorStore(state => state.assetBrowserTab);
  const [activeTab, setActiveTab] = useState<CategoryTab>('discover');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterChip, setActiveFilterChip] = useState('All');

  // Reset filter chip to 'All' whenever changing tabs to prevent hiding assets
  useEffect(() => {
    setActiveFilterChip('All');
  }, [activeTab]);
  const [selectedIconMaterialStyle, setSelectedIconMaterialStyle] = useState<string>('glossy');
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);

  // Modals & UI State
  const [notification, setNotification] = useState<string | null>(null);
  const [showMarkerManager, setShowMarkerManager] = useState(false);
  const [validationModel, setValidationModel] = useState<any | null>(null);
  const [importProgress, setImportProgress] = useState<{ fileName: string; progress: number; status: string } | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [recentAssets, setRecentAssets] = useState<any[]>([]);

  // Sync store asset tab if opened externally
  useEffect(() => {
    if (storeAssetBrowserTab && isAssetBrowserOpen) {
      if (storeAssetBrowserTab === 'models') {
        setActiveTab('elements');
      } else if (storeAssetBrowserTab === 'templates') {
        setActiveTab('discover');
      } else {
        const isValidTab = [
          'discover', 'elements', 'buttons', 'text-styles', 'ui-kits', 
          'materials', 'textures', 'audio', 'lighting', 'markers', 
          'sketchfab', 'uploads', 'layouts'
        ].includes(storeAssetBrowserTab);
        setActiveTab(isValidTab ? (storeAssetBrowserTab as CategoryTab) : 'discover');
      }
    }
  }, [storeAssetBrowserTab, isAssetBrowserOpen]);

  // Load Recents & Favorites
  useEffect(() => {
    try {
      const storedRecent = localStorage.getItem('spline_recent_assets');
      if (storedRecent) {
        const parsed = JSON.parse(storedRecent);
        // Strip out any object thumbnails (serialized ReactNodes) that crash React
        const sanitized = parsed.map((item: any) => {
          if (item.thumbnail && typeof item.thumbnail === 'object') {
            return { ...item, thumbnail: undefined };
          }
          return item;
        });
        setRecentAssets(sanitized);
      }
      const storedFavs = localStorage.getItem('spline_favorite_assets');
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
    } catch (e) {}
  }, []);

  // Reset filter chip when tab changes
  useEffect(() => {
    setActiveFilterChip('All');
    setSearchQuery('');
  }, [activeTab]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('spline_favorite_assets', JSON.stringify(next));
      } catch(e) {}
      return next;
    });
  };

  const addToRecentAssets = (item: any) => {
    setRecentAssets(prev => {
      const filtered = prev.filter(p => p.id !== item.id && p.name !== item.name);
      const updated = [{ ...item, lastUsed: Date.now() }, ...filtered].slice(0, 18);
      try {
        localStorage.setItem('spline_recent_assets', JSON.stringify(updated));
      } catch(e) {}
      return updated;
    });
  };

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Sound Play Preview
  const handlePlaySoundToggle = (sound: any) => {
    if (playingSoundId === sound.id) {
      setPlayingSoundId(null);
    } else {
      setPlayingSoundId(sound.id);
      playSplineSound(sound.id);
      setTimeout(() => {
        setPlayingSoundId(prev => prev === sound.id ? null : prev);
      }, 2500);
    }
  };

  // Asset Import Execution
  const executeAssetImport = async (file: File, type: AssetType, stats?: any) => {
    const name = file.name;
    setImportProgress({ fileName: name, progress: 20, status: 'Reading asset data...' });
    
    try {
      const { SupabaseService } = await import('../../services/supabaseService');
      const storeState = useEditorStore.getState();
      const projectName = storeState.settings.projectName || 'default-project';

      let url = '';
      if (SupabaseService.isConfigured()) {
        setImportProgress({ fileName: name, progress: 60, status: 'Uploading to cloud storage...' });
        url = await SupabaseService.uploadAsset(file, projectName);
      } else {
        setImportProgress({ fileName: name, progress: 70, status: 'Processing local buffer...' });
        url = await fileToDataUrl(file);
      }
      
      const asset: Asset = {
        id: uuidv4(),
        name,
        type,
        url,
      };

      addAsset(asset);
      addToRecentAssets({ id: asset.id, name: asset.name, type: asset.type, url: asset.url });
      setImportProgress(null);

      if (replaceTargetObjectId && objects[replaceTargetObjectId]) {
        replaceObjectAsset(replaceTargetObjectId, asset);
        showToast(`Replaced asset for ${objects[replaceTargetObjectId].name}`);
        setReplaceTargetObjectId(null);
      } else {
        showToast(`Imported asset "${name}" successfully!`);
      }
    } catch (err: any) {
      setImportProgress(null);
      showToast(`Import failed: ${err.message}`);
    }
  };

  // Handle File Input Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    let type: AssetType = 'image';
    if (['glb', 'gltf'].includes(extension)) type = 'model';
    else if (['mp4', 'webm', 'mov'].includes(extension)) type = 'video';
    else if (['mp3', 'wav', 'ogg'].includes(extension)) type = 'audio';
    else if (['js', 'ts'].includes(extension)) type = 'script';

    if (type === 'model') {
      const stats = await validate3DModel(file);
      if (stats && (stats.totalTriangles > 90000 || stats.externalUris.length > 0)) {
        setValidationModel({
          file,
          stats,
          warnings: [
            stats.totalTriangles > 90000 ? `High polygon count: ${stats.totalTriangles.toLocaleString()} triangles.` : '',
            stats.externalUris.length > 0 ? `External dependencies found: ${stats.externalUris.join(', ')}` : '',
          ].filter(Boolean)
        });
        return;
      }
    }

    await executeAssetImport(file, type);
  };

  const handleAssetAddedSuccess = () => {
    setIsAssetBrowserOpen(false);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('trigger-frame-selected'));
    }, 60);
  };

  // Add Handlers
  const handleAddTemplate = (type: string) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    const newId = uuidv4();
    const newObj: SceneObject = {
      id: newId,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type as any,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: parentId || null,
      properties: {
        color: '#6366f1',
        roughness: 0.3,
        metalness: 0.2,
      }
    };

    addObject(newObj, parentId || undefined);
    showToast(`Added ${type} primitive to scene`);
    addToRecentAssets({ id: newObj.id, name: newObj.name, type: 'Primitive' });
    handleAssetAddedSuccess();
  };

  const handleAdd3DIcon = (icon: SplineIconMetadata) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    if (replaceTargetObjectId && objects[replaceTargetObjectId]) {
      replaceObjectAsset(replaceTargetObjectId, {
        type: 'icon',
        name: icon.name,
        iconType: icon.id,
        properties: {
          iconType: icon.id,
          color: icon.defaultColor,
          secondaryColor: icon.secondaryColor,
          materialStyle: selectedIconMaterialStyle || icon.materialStyle || 'glossy',
        }
      });
      showToast(`Replaced asset with 3D icon "${icon.name}"`);
      setReplaceTargetObjectId(null);
      return;
    }

    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    const newObj: SceneObject = {
      id: uuidv4(),
      name: icon.name,
      type: 'icon',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: parentId || null,
      properties: {
        iconType: icon.id,
        color: icon.defaultColor,
        secondaryColor: icon.secondaryColor,
        materialStyle: selectedIconMaterialStyle || icon.materialStyle || 'glossy',
        floatAnim: true,
        rotationSpeed: 0.5,
      }
    };

    addObject(newObj, parentId || undefined);
    showToast(`Added 3D icon "${newObj.name}" to the scene`);
    addToRecentAssets({ id: icon.id, name: icon.name, type: '3D Icon', description: icon.description });
    handleAssetAddedSuccess();
  };

  const handleAdd2DIcon = (icon: Spline2DIconMetadata) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    const newObj: SceneObject = {
      id: uuidv4(),
      name: icon.name,
      type: 'icon2d' as any,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: parentId || null,
      properties: {
        iconName: icon.iconName,
        color: icon.defaultColor,
        secondaryColor: icon.secondaryColor,
        badgeStyle: icon.badgeStyle,
        text: icon.name,
      }
    };

    addObject(newObj, parentId || undefined);
    showToast(`Added 2D icon badge "${icon.name}"`);
    addToRecentAssets({ id: icon.id, name: icon.name, type: '2D Badge' });
    handleAssetAddedSuccess();
  };

  const handleAddUIKit = (preset: UIKitPreset) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    const newId = uuidv4();
    const newObj: SceneObject = {
      id: newId,
      name: preset.name,
      type: preset.objectType as any,
      position: preset.position || [0, 0, 0],
      rotation: preset.rotation || [0, 0, 0],
      scale: preset.scale || [1, 1, 1],
      visible: true,
      children: [],
      parentId: parentId || null,
      properties: { ...preset.properties }
    };

    addObject(newObj, parentId || undefined);
    showToast(`Added UI kit "${preset.name}" to the scene`);
    addToRecentAssets({ id: preset.id, name: preset.name, type: 'UI Kit', description: preset.description });
    handleAssetAddedSuccess();
  };

  const handleAddTextStyle = (style: TextStylePreset) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    if (selectedObjectId && objects[selectedObjectId]) {
      const target = objects[selectedObjectId];
      updateObject(selectedObjectId, {
        properties: {
          ...target.properties,
          ...style.properties,
        }
      });
      showToast(`Applied typography style "${style.name}" to ${target.name}`);
      return;
    }

    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    const newId = uuidv4();
    const newObj: SceneObject = {
      id: newId,
      name: `${style.name}`,
      type: style.objectType as any,
      position: style.position || [0, 0, 0],
      rotation: style.rotation || [0, 0, 0],
      scale: style.scale || [1, 1, 1],
      visible: true,
      children: [],
      parentId: parentId || null,
      properties: {
        text: style.sampleText || 'AR TYPOGRAPHY',
        ...style.properties,
      }
    };

    addObject(newObj, parentId || undefined);
    showToast(`Added text "${style.name}" to scene`);
    addToRecentAssets({ id: style.id, name: style.name, type: 'Text Style' });
    handleAssetAddedSuccess();
  };

  const handleApplySplineMaterial = (preset: SplineMaterialPreset) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    if (selectedObjectId && objects[selectedObjectId]) {
      const targetObj = objects[selectedObjectId];
      updateObject(selectedObjectId, {
        properties: {
          ...targetObj.properties,
          ...preset.materialProps,
        }
      });
      showToast(`Applied "${preset.name}" material to ${targetObj.name}`);
    } else {
      const newId = uuidv4();
      const newObj: SceneObject = {
        id: newId,
        name: `${preset.name} Sphere`,
        type: 'sphere',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: null,
        properties: {
          ...preset.materialProps,
        }
      };
      addObject(newObj);
      useEditorStore.getState().selectObject(newId);
      showToast(`Created sphere with "${preset.name}" material`);
    }
    addToRecentAssets({ id: preset.id, name: preset.name, type: 'Material' });
  };

  const handleApplyARTexture = (tex: { id: string; name: string; previewUrl: string; category?: string; normalMapUrl?: string; roughnessMapUrl?: string; recommendedScale?: [number, number] }) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    if (selectedObjectId && objects[selectedObjectId]) {
      const targetObj = objects[selectedObjectId];
      updateObject(selectedObjectId, {
        properties: {
          ...targetObj.properties,
          textureUrl: tex.previewUrl,
          normalMapUrl: tex.normalMapUrl,
          roughnessMapUrl: tex.roughnessMapUrl,
          textureRepeatX: tex.recommendedScale ? tex.recommendedScale[0] : 1,
          textureRepeatY: tex.recommendedScale ? tex.recommendedScale[1] : 1,
        }
      });
      showToast(`Applied "${tex.name}" texture to ${targetObj.name}`);
    } else {
      const newId = uuidv4();
      const newObj: SceneObject = {
        id: newId,
        name: `${tex.name} Surface`,
        type: 'plane',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [2, 2, 1],
        visible: true,
        children: [],
        parentId: null,
        properties: {
          color: '#ffffff',
          roughness: 0.4,
          metalness: 0.1,
          textureUrl: tex.previewUrl,
          normalMapUrl: tex.normalMapUrl,
          roughnessMapUrl: tex.roughnessMapUrl,
          textureRepeatX: tex.recommendedScale ? tex.recommendedScale[0] : 1,
          textureRepeatY: tex.recommendedScale ? tex.recommendedScale[1] : 1,
        }
      };
      addObject(newObj);
      useEditorStore.getState().selectObject(newId);
      showToast(`Created surface with "${tex.name}" texture`);
    }
    addToRecentAssets({ id: tex.id, name: tex.name, type: 'Texture' });
  };

  const handleAddSound = (sound: SplineSoundPreset) => {
    playSplineSound(sound.id);
    if (selectedObjectId && objects[selectedObjectId]) {
      const target = objects[selectedObjectId];
      updateObject(selectedObjectId, {
        properties: {
          ...target.properties,
          interactivitySoundPreset: sound.id,
          clickSoundUrl: sound.url,
        }
      });
      showToast(`Assigned sound "${sound.name}" to ${target.name}`);
    } else {
      showToast(`Previewing "${sound.name}". Select an object in the Hierarchy to assign.`);
    }
    addToRecentAssets({ id: sound.id, name: sound.name, type: 'Audio SFX' });
  };

  const handleAddLighting = (preset: typeof LIGHTING_PRESETS[0]) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    updateSettings(preset.settings as any);
    showToast(`Applied "${preset.name}" lighting environment to scene!`);
    addToRecentAssets({ id: preset.id, name: preset.name, type: 'Lighting' });
  };

  const handleAddHUDLayout = (layoutType: string) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    const hudContainerId = uuidv4();
    const batchObjects: SceneObject[] = [
      {
        id: hudContainerId,
        name: `HUD Scaffold (${layoutType})`,
        type: 'plane',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: null,
        properties: {
          color: '#0a0f1e',
          roughness: 0.1,
          metalness: 0.2,
          opacity: 0.85,
        }
      }
    ];

    batchObjects.forEach(obj => addObject(obj));
    showToast(`Deployed "${layoutType}" layout to scene`);
    addToRecentAssets({ id: layoutType, name: `HUD ${layoutType}`, type: 'Layout' });
  };

  const handleAddPresetModel = (model: typeof PRESET_MODELS[0]) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    if (replaceTargetObjectId && objects[replaceTargetObjectId]) {
      replaceObjectAsset(replaceTargetObjectId, {
        type: 'model',
        name: model.name,
        url: model.url,
      });
      showToast(`Replaced model with "${model.name}"`);
      setReplaceTargetObjectId(null);
      return;
    }

    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    const newObj: SceneObject = {
      id: uuidv4(),
      name: model.name,
      type: 'model',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: parentId || null,
      properties: {
        modelUrl: model.url,
      }
    };

    addObject(newObj, parentId || undefined);
    showToast(`Added 3D model "${model.name}" to scene`);
    addToRecentAssets({ id: model.id, name: model.name, type: '3D Model', thumbnail: model.thumbnail });
    handleAssetAddedSuccess();
  };

  const handleAddButtonTemplate = (template: ButtonTemplate) => {
    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    const newObj: SceneObject = {
      id: uuidv4(),
      name: template.name,
      type: 'button',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: template.shape === 'circle' ? [0.8, 0.8, 0.8] : [1, 1, 1],
      visible: true,
      locked: false,
      children: [],
      parentId: parentId || null,
      properties: {
        buttonStyle: template.buttonStyle,
        shape: template.shape,
        text: template.text,
        color: template.color,
        secondaryColor: template.secondaryColor || template.color,
        borderColor: template.borderColor || 'rgba(255,255,255,0.2)',
        textColor: template.textColor,
        icon: template.icon || '',
        iconPosition: template.iconPosition || 'left',
        borderRadius: template.borderRadius ?? (template.shape === 'pill' ? 9999 : template.shape === 'circle' ? 9999 : 12),
        borderWidth: template.borderWidth ?? 0,
        fontSize: template.fontSize ?? 0.18,
        fontFamily: template.fontFamily || 'Inter',
        fontWeight: template.fontWeight || '700',
        letterSpacing: template.letterSpacing ?? 0,
        glowEffect: template.glowEffect ?? false,
        glowColor: template.glowColor || 'rgba(59, 130, 246, 0.5)',
        url: template.url || '',
      }
    };

    addObject(newObj, parentId || undefined);
    showToast(`Added button template "${template.name}" to scene`);
    addToRecentAssets({ id: template.id, name: template.name, type: 'Button',  });
    handleAssetAddedSuccess();
  };

  const handleAddPrimitiveTemplate = (prim: PrimitiveTemplate) => {
    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    const newObj: SceneObject = {
      id: uuidv4(),
      name: prim.name,
      type: prim.type as any,
      position: prim.position || [0, 0, 0],
      rotation: prim.rotation || [0, 0, 0],
      scale: prim.scale || [1, 1, 1],
      visible: true,
      locked: false,
      children: [],
      parentId: parentId || null,
      properties: {
        ...prim.properties,
      }
    };

    addObject(newObj, parentId || undefined);
    showToast(`Added primitive "${prim.name}" to scene`);
    addToRecentAssets({ id: prim.id, name: prim.name, type: 'Primitive' });
    handleAssetAddedSuccess();
  };

  const handleAddMediaTemplate = (media: MediaWidgetTemplate) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    let parentId = selectedObjectId;
    if (!parentId) {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) parentId = imageTarget.id;
    }

    const newId = uuidv4();
    const newObj: SceneObject = {
      id: newId,
      name: media.name,
      type: media.type as any,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: false,
      children: [],
      parentId: parentId || null,
      properties: {
        ...media.properties,
      }
    };

    addObject(newObj, parentId || undefined);
    useEditorStore.getState().selectObject(newId);
    showToast(`Added ${media.name} to scene`);
    addToRecentAssets({ id: media.id, name: media.name, type: 'Media', thumbnail: media.icon });
    handleAssetAddedSuccess();
  };

  // Filter chips per category
  const filterChipsForTab = useMemo(() => {
    switch (activeTab) {
      case 'primitives':
        return ['All', 'Basic Geometry', 'Textured Shapes', 'Sci-Fi Primitives', 'Organic & Metallic'];
      case 'media':
        return ['All', 'YouTube Player', 'Video & Audio', 'Interactive Hotspots', 'Image & Web Embeds'];
      case 'buttons':
        return ['All', 'Pills & CTAs', 'Glassmorphic', '3D Tactile', 'Neon & Cyberpunk', 'Minimal & Modern', 'Circular (FAB)', 'E-Commerce'];
      case 'elements':
        return ['All', '3D Icons', 'Textured Primitives', '2D Vector Badges', 'Shapes & Primitives', '3D Models'];
      case 'ui-kits':
        return ['All', 'Glassmorphic', 'Futuristic', 'Cyberpunk', 'Minimal', 'Gaming', 'Meters & Gauges'];
      case 'text-styles':
        return ['All', 'Hero Titles', 'Neon & Glow', 'Glassmorphic', 'Cyberpunk', 'Minimal & Clean'];
      case 'materials':
        return ['All', 'Glass & Hologram', 'Metals & Chrome', 'Cyber & Neon', 'Organic', 'Clay & Matte'];
      case 'textures':
        return ['All', 'Patterns', 'Grids', 'Gradients', 'High-Res Textures'];
      case 'audio':
        return ['All', 'UI & Chimes', 'Sci-Fi & Energy', 'Spatial Ambience', 'Alarms'];
      case 'lighting':
        return ['All', 'Studio', 'Cyberpunk', 'Outdoor', 'Night'];
      case 'markers':
        return ['All', 'Posters', 'Standard Patterns', 'Custom Targets'];
      case 'uploads':
        return ['All', '3D Models (.glb)', 'Images (.png/.jpg)', 'Audio (.mp3)', 'Video (.mp4)'];
      default:
        return [];
    }
  }, [activeTab]);

  // Asset counts for dock badges
  const categoryCounts = useMemo(() => {
    return {
      'primitives': PRIMITIVE_TEMPLATES.length,
      'media': MEDIA_WIDGET_TEMPLATES.length,
      'buttons': BUTTON_TEMPLATES.length,
      'elements': SPLINE_3D_ICONS.length + SPLINE_2D_ICONS.length + PRESET_MODELS.length + PRIMITIVE_TEMPLATES.length,
      'ui-kits': UI_KIT_PRESETS.length,
      'text-styles': TEXT_STYLE_PRESETS.length,
      'materials': SPLINE_MATERIAL_PRESETS.length,
      'textures': getOptimizedARTextures().length,
      'audio': SPLINE_SOUND_PRESETS.length,
      'lighting': LIGHTING_PRESETS.length,
      'markers': MARKER_PRESETS.length,
      'sketchfab': SKETCHFAB_PRESETS.length,
      'uploads': assets.length,
      'layouts': 4,
    };
  }, [assets.length]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAssetBrowserOpen) {
        setIsAssetBrowserOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAssetBrowserOpen, setIsAssetBrowserOpen]);

  if (!isAssetBrowserOpen) return null;

  const gridColsClass = density === 'comfortable' 
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full h-full max-w-7xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/10 bg-[#0F0F14] flex flex-col relative select-none shadow-[0_25px_80px_rgba(0,0,0,0.8)] ring-1 ring-white/5 animate-in zoom-in-95 duration-200">
        
        {/* Toast Notification */}
        {notification && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl border border-white/20 z-50 flex items-center gap-2 animate-bounce">
            <Sparkles size={13} className="text-yellow-300" />
            <span>{notification}</span>
          </div>
        )}

        {/* Replace Target Indicator Bar */}
        {replaceTargetObjectId && objects[replaceTargetObjectId] && (
          <div className="bg-gradient-to-r from-cyan-950 via-blue-950 to-indigo-950 border-b border-cyan-500/30 px-5 py-2.5 flex items-center justify-between text-xs text-cyan-200 shrink-0">
            <div className="flex items-center gap-2.5">
              <RefreshCw size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>
                Replacing asset for <strong className="text-white font-bold">{objects[replaceTargetObjectId].name}</strong> — Click any asset to swap!
              </span>
            </div>
            <button
              onClick={() => setReplaceTargetObjectId(null)}
              className="px-2.5 py-1 bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white rounded-lg text-xs font-medium border border-cyan-500/30 flex items-center gap-1 cursor-pointer"
            >
              <X size={12} />
              <span>Cancel</span>
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <CanvaHeader
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          onOpenUpload={handleUploadClick}
          onOpenMarkerManager={() => setShowMarkerManager(true)}
          onClose={() => setIsAssetBrowserOpen(false)}
          density={density}
          onToggleDensity={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
          filterChips={filterChipsForTab}
          activeFilterChip={activeFilterChip}
          onSelectFilterChip={setActiveFilterChip}
        />

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".glb,.gltf,image/*,video/*,audio/*,.js"
          onChange={handleFileChange}
        />

        {/* Main Body Area: Canva Left Dock + Content Canvas */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canva Navigation Rail */}
          <CanvaDock
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
            }}
            counts={categoryCounts}
          />

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0E]">
            
            {/* 1. DISCOVER VIEW (Home / For You) */}
            {activeTab === 'discover' && !searchQuery && (
              <DiscoverView
                onNavigateTab={setActiveTab}
                recentAssets={recentAssets}
                onSelectRecentAsset={(asset) => {
                  if (asset.type === '3D Model' || asset.type === 'model') {
                    const found = PRESET_MODELS.find(m => m.id === asset.id || m.name === asset.name);
                    if (found) handleAddPresetModel(found);
                  } else if (asset.type === '3D Icon') {
                    const found = SPLINE_3D_ICONS.find(i => i.name === asset.name);
                    if (found) handleAdd3DIcon(found);
                  } else if (asset.type === 'UI Kit') {
                    const found = UI_KIT_PRESETS.find(p => p.id === asset.id);
                    if (found) handleAddUIKit(found);
                  } else if (asset.type === 'Text Style') {
                    const found = TEXT_STYLE_PRESETS.find(t => t.id === asset.id);
                    if (found) handleAddTextStyle(found);
                  } else if (asset.type === 'Material') {
                    const found = SPLINE_MATERIAL_PRESETS.find(m => m.id === asset.id);
                    if (found) handleApplySplineMaterial(found);
                  } else if (asset.type === 'Audio SFX') {
                    const found = SPLINE_SOUND_PRESETS.find(s => s.id === asset.id);
                    if (found) handleAddSound(found);
                  } else if (asset.type === 'Button') {
                    const found = BUTTON_TEMPLATES.find(b => b.id === asset.id);
                    if (found) handleAddButtonTemplate(found);
                  } else if (asset.type === 'Primitive') {
                    const found = PRIMITIVE_TEMPLATES.find(p => p.id === asset.id);
                    if (found) handleAddPrimitiveTemplate(found);
                  } else if (asset.type === 'Media' || asset.type === 'youtube') {
                    const found = MEDIA_WIDGET_TEMPLATES.find(m => m.id === asset.id);
                    if (found) handleAddMediaTemplate(found);
                  }
                }}
                onAdd3DIcon={handleAdd3DIcon}
                onAddUIKit={handleAddUIKit}
                onAddTextStyle={handleAddTextStyle}
                onApplyMaterial={handleApplySplineMaterial}
                onAddSound={handleAddSound}
                onAddButtonTemplate={handleAddButtonTemplate}
                onAddPrimitiveTemplate={handleAddPrimitiveTemplate}
                onAddMediaTemplate={handleAddMediaTemplate}
                playingSoundId={playingSoundId}
                onPlaySoundToggle={handlePlaySoundToggle}
              />
            )}

            {/* Global Search Results for Discover Tab */}
            {activeTab === 'discover' && searchQuery && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Search size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">Search Results for "{searchQuery}"</h3>
                      <p className="text-[11px] text-gray-400">Found across primitives, YouTube media widgets, buttons, 3D icons, and UI kits</p>
                    </div>
                  </div>
                </div>

                {/* Primitives Matches */}
                {PRIMITIVE_TEMPLATES.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())) && (
                  <section className="space-y-3">
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Box size={13} />
                      <span>3D Primitives & Shapes</span>
                    </h4>
                    <div className={`grid ${gridColsClass} gap-3`}>
                      {PRIMITIVE_TEMPLATES
                        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(prim => (
                          <AssetCard
                            key={prim.id}
                            id={prim.id}
                            name={prim.name}
                            badge={prim.badge}
                            badgeColor={prim.badgeColor}
                            thumbnail={renderPrimitivePreview(prim)}
                            description={prim.description}
                            isFavorite={!!favorites[prim.id]}
                            onToggleFavorite={() => toggleFavorite(prim.id)}
                            onSelect={() => handleAddPrimitiveTemplate(prim)}
                          />
                        ))}
                    </div>
                  </section>
                )}

                {/* Media & YouTube Matches */}
                {MEDIA_WIDGET_TEMPLATES.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase())) && (
                  <section className="space-y-3">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Video size={13} />
                      <span>YouTube & Media Widgets</span>
                    </h4>
                    <div className={`grid ${gridColsClass} gap-3`}>
                      {MEDIA_WIDGET_TEMPLATES
                        .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(media => (
                          <AssetCard
                            key={media.id}
                            id={media.id}
                            name={media.name}
                            badge={media.badge}
                            badgeColor={media.badgeColor}
                            thumbnail={renderMediaPreview(media)}
                            description={media.description}
                            isFavorite={!!favorites[media.id]}
                            onToggleFavorite={() => toggleFavorite(media.id)}
                            onSelect={() => handleAddMediaTemplate(media)}
                          />
                        ))}
                    </div>
                  </section>
                )}

                {/* Button Matches */}
                {BUTTON_TEMPLATES.some(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.description.toLowerCase().includes(searchQuery.toLowerCase()) || b.text.toLowerCase().includes(searchQuery.toLowerCase())) && (
                  <section className="space-y-3">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MousePointerClick size={13} />
                      <span>Button Templates</span>
                    </h4>
                    <div className={`grid ${gridColsClass} gap-3`}>
                      {BUTTON_TEMPLATES
                        .filter(btn => btn.name.toLowerCase().includes(searchQuery.toLowerCase()) || btn.description.toLowerCase().includes(searchQuery.toLowerCase()) || btn.text.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(btn => (
                          <AssetCard
                            key={btn.id}
                            id={btn.id}
                            name={btn.name}
                            badge="BUTTON"
                            badgeColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
                            thumbnail={renderButtonPreview(btn)}
                            description={btn.description}
                            isFavorite={!!favorites[btn.id]}
                            onToggleFavorite={() => toggleFavorite(btn.id)}
                            onSelect={() => handleAddButtonTemplate(btn)}
                          />
                        ))}
                    </div>
                  </section>
                )}

                {/* 3D Icons Matches */}
                {SPLINE_3D_ICONS.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase())) && (
                  <section className="space-y-3">
                    <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} />
                      <span>3D Spline Icons</span>
                    </h4>
                    <div className={`grid ${gridColsClass} gap-3`}>
                      {SPLINE_3D_ICONS
                        .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(icon => {
                          const thumb = getSplineThumbnailStyle(icon.name);
                          return (
                            <AssetCard
                              key={icon.id}
                              id={icon.id}
                              name={icon.name}
                              badge="3D ICON"
                              badgeColor="bg-pink-500/20 text-pink-300 border-pink-500/30"
                              thumbnail={
                                <div
                                  className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
                                  style={{ background: thumb.orbBg, boxShadow: `0 0 16px ${thumb.glowColor}` }}
                                >
                                  <span className="text-base text-white font-bold">{icon.name.charAt(0)}</span>
                                </div>
                              }
                              description={icon.description}
                              isFavorite={!!favorites[icon.id]}
                              onToggleFavorite={() => toggleFavorite(icon.id)}
                              onSelect={() => handleAdd3DIcon(icon)}
                            />
                          );
                        })}
                    </div>
                  </section>
                )}

                {/* 3D Models Matches */}
                {PRESET_MODELS.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase())) && (
                  <section className="space-y-3">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Box size={13} />
                      <span>3D Models (.glb)</span>
                    </h4>
                    <div className={`grid ${gridColsClass} gap-3`}>
                      {PRESET_MODELS
                        .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(model => (
                          <AssetCard
                            key={model.id}
                            id={model.id}
                            name={model.name}
                            badge="3D MODEL"
                            badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            thumbnail={model.thumbnail}
                            description={model.description}
                            isFavorite={!!favorites[model.id]}
                            onToggleFavorite={() => toggleFavorite(model.id)}
                            onSelect={() => handleAddPresetModel(model)}
                          />
                        ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* PRIMITIVES TAB (Basic Geometry, Shapes, Textured & Sci-Fi Primitives) */}
            {activeTab === 'primitives' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <Box size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">3D Primitives & Procedural Shapes</h3>
                      <p className="text-[11px] text-gray-400">Click any geometry to spawn cubes, spheres, cylinders, discs, torus knots, and high-res textured solids</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {PRIMITIVE_TEMPLATES.filter(p => {
                      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = activeFilterChip === 'All' || p.category === activeFilterChip;
                      return matchesSearch && matchesFilter;
                    }).length} items
                  </span>
                </div>

                <div className={`grid ${gridColsClass} gap-4`}>
                  {PRIMITIVE_TEMPLATES
                    .filter(prim => {
                      const matchesSearch = !searchQuery || prim.name.toLowerCase().includes(searchQuery.toLowerCase()) || prim.description.toLowerCase().includes(searchQuery.toLowerCase()) || prim.category.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = activeFilterChip === 'All' || prim.category === activeFilterChip;
                      return matchesSearch && matchesFilter;
                    })
                    .map((prim) => (
                      <AssetCard
                        key={prim.id}
                        id={prim.id}
                        name={prim.name}
                        badge={prim.badge}
                        badgeColor={prim.badgeColor}
                        thumbnail={renderPrimitivePreview(prim)}
                        description={prim.description}
                        isFavorite={!!favorites[prim.id]}
                        onToggleFavorite={() => toggleFavorite(prim.id)}
                        onSelect={() => handleAddPrimitiveTemplate(prim)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* MEDIA & YOUTUBE TAB (Interactive YouTube Screens, Videos, Hotspots, Embeds) */}
            {activeTab === 'media' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                      <Video size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">YouTube Players & Interactive Media</h3>
                      <p className="text-[11px] text-gray-400">Add 16:9 cinema displays, 9:16 TikTok/Shorts vertical holograms, MP4 video billboards, audio beacons, and AR hotspots</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {MEDIA_WIDGET_TEMPLATES.filter(m => {
                      const matchesSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = activeFilterChip === 'All' || m.category === activeFilterChip;
                      return matchesSearch && matchesFilter;
                    }).length} widgets
                  </span>
                </div>

                <div className={`grid ${gridColsClass} gap-4`}>
                  {MEDIA_WIDGET_TEMPLATES
                    .filter(media => {
                      const matchesSearch = !searchQuery || media.name.toLowerCase().includes(searchQuery.toLowerCase()) || media.description.toLowerCase().includes(searchQuery.toLowerCase()) || media.category.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = activeFilterChip === 'All' || media.category === activeFilterChip;
                      return matchesSearch && matchesFilter;
                    })
                    .map((media) => (
                      <AssetCard
                        key={media.id}
                        id={media.id}
                        name={media.name}
                        badge={media.badge}
                        badgeColor={media.badgeColor}
                        thumbnail={renderMediaPreview(media)}
                        description={media.description}
                        isFavorite={!!favorites[media.id]}
                        onToggleFavorite={() => toggleFavorite(media.id)}
                        onSelect={() => handleAddMediaTemplate(media)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* 2. BUTTONS TAB (Canva Interactive Buttons & CTAs) */}
            {activeTab === 'buttons' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <MousePointerClick size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">Canva Button Templates & CTAs</h3>
                      <p className="text-[11px] text-gray-400">Click any template to add an interactive, customizable 3D button</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {BUTTON_TEMPLATES.filter(b => {
                      const matchesSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.description.toLowerCase().includes(searchQuery.toLowerCase()) || b.text.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = activeFilterChip === 'All' || b.category === activeFilterChip;
                      return matchesSearch && matchesFilter;
                    }).length} styles
                  </span>
                </div>

                <div className={`grid ${gridColsClass} gap-4`}>
                  {BUTTON_TEMPLATES
                    .filter(btn => {
                      const matchesSearch = !searchQuery || btn.name.toLowerCase().includes(searchQuery.toLowerCase()) || btn.description.toLowerCase().includes(searchQuery.toLowerCase()) || btn.text.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = activeFilterChip === 'All' || btn.category === activeFilterChip;
                      return matchesSearch && matchesFilter;
                    })
                    .map((btn) => (
                      <AssetCard
                        key={btn.id}
                        id={btn.id}
                        name={btn.name}
                        badge={btn.category.toUpperCase()}
                        badgeColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
                        thumbnail={renderButtonPreview(btn)}
                        description={btn.description}
                        isFavorite={!!favorites[btn.id]}
                        onToggleFavorite={() => toggleFavorite(btn.id)}
                        onSelect={() => handleAddButtonTemplate(btn)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* 3. ELEMENTS TAB (3D Icons, Textured Primitives, 2D Vectors, Shapes, 3D Models) */}
            {activeTab === 'elements' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {/* 3D Icons Section */}
                {(activeFilterChip === 'All' || activeFilterChip === '3D Icons') && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                        <Sparkles size={15} className="text-pink-400" />
                        <span>3D Spline Geometry Icons</span>
                      </h3>
                      {/* Material Style Picker */}
                      <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg border border-white/5 text-[10px]">
                        <span className="text-gray-400 font-medium px-1">Material:</span>
                        {['glossy', 'glass', 'neon', 'clay', 'gold'].map((style) => (
                          <button
                            key={style}
                            onClick={() => setSelectedIconMaterialStyle(style)}
                            className={`px-2 py-0.5 rounded capitalize transition-all cursor-pointer ${
                              selectedIconMaterialStyle === style 
                                ? 'bg-pink-600 text-white font-bold' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={`grid ${gridColsClass} gap-3`}>
                      {SPLINE_3D_ICONS
                        .filter(i => !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((icon) => {
                          const thumb = getSplineThumbnailStyle(icon.name);
                          return (
                            <AssetCard
                              key={icon.id}
                              id={icon.id}
                              name={icon.name}
                              badge="3D ICON"
                              badgeColor="bg-pink-500/20 text-pink-300 border-pink-500/30"
                              thumbnail={
                                <div
                                  className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
                                  style={{ background: thumb.orbBg, boxShadow: `0 0 16px ${thumb.glowColor}` }}
                                >
                                  <span className="text-base text-white font-bold">{icon.name.charAt(0)}</span>
                                </div>
                              }
                              description={icon.description}
                              isFavorite={!!favorites[icon.id]}
                              onToggleFavorite={() => toggleFavorite(icon.id)}
                              onSelect={() => handleAdd3DIcon(icon)}
                            />
                          );
                        })}
                    </div>
                  </section>
                )}

                {/* Textured 3D Primitives Section (NEW) */}
                {(activeFilterChip === 'All' || activeFilterChip === 'Textured Primitives' || activeFilterChip === 'Shapes & Primitives') && (
                  <section className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                        <Grid size={15} className="text-emerald-400" />
                        <span>Textured 3D Primitives (Circles, Spheres, Grids, Rings)</span>
                      </h3>
                      <span className="text-[10px] text-gray-400 font-mono">PBR Shaders & High-Res Textures</span>
                    </div>
                    <div className={`grid ${gridColsClass} gap-3`}>
                      {PRIMITIVE_TEMPLATES
                        .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((prim) => (
                          <AssetCard
                            key={prim.id}
                            id={prim.id}
                            name={prim.name}
                            badge={prim.badge}
                            badgeColor={prim.badgeColor}
                            thumbnail={renderPrimitivePreview(prim)}
                            description={prim.description}
                            isFavorite={!!favorites[prim.id]}
                            onToggleFavorite={() => toggleFavorite(prim.id)}
                            onSelect={() => handleAddPrimitiveTemplate(prim)}
                          />
                        ))}
                    </div>
                  </section>
                )}

                {/* 2D Vector Badges Section */}
                {(activeFilterChip === 'All' || activeFilterChip === '2D Vector Badges') && (
                  <section className="space-y-3 pt-4 border-t border-white/5">
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <Shapes size={15} className="text-blue-400" />
                      <span>2D Vector Badges</span>
                    </h3>
                    <div className={`grid ${gridColsClass} gap-3`}>
                      {SPLINE_2D_ICONS
                        .filter(i => !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.category.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((icon) => (
                          <AssetCard
                            key={icon.id}
                            id={icon.id}
                            name={icon.name}
                            badge="2D BADGE"
                            badgeColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
                            thumbnail={
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                <Shapes size={20} />
                              </div>
                            }
                            description={icon.category}
                            isFavorite={!!favorites[icon.id]}
                            onToggleFavorite={() => toggleFavorite(icon.id)}
                            onSelect={() => handleAdd2DIcon(icon)}
                          />
                        ))}
                    </div>
                  </section>
                )}

                {/* 3D Models Section */}
                {(activeFilterChip === 'All' || activeFilterChip === '3D Models') && (
                  <section className="space-y-3 pt-4 border-t border-white/5">
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <Box size={15} className="text-emerald-400" />
                      <span>Curated 3D Models (.glb)</span>
                    </h3>
                    <div className={`grid ${gridColsClass} gap-3`}>
                      {PRESET_MODELS
                        .filter(m => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((model) => (
                          <AssetCard
                            key={model.id}
                            id={model.id}
                            name={model.name}
                            badge="3D MODEL"
                            badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            thumbnail={model.thumbnail}
                            description={model.description}
                            isFavorite={!!favorites[model.id]}
                            onToggleFavorite={() => toggleFavorite(model.id)}
                            onSelect={() => handleAddPresetModel(model)}
                          />
                        ))}
                    </div>
                  </section>
                )}

                {/* Basic Shapes & Primitives */}
                {(activeFilterChip === 'All' || activeFilterChip === 'Shapes & Primitives') && (
                  <section className="space-y-3 pt-4 border-t border-white/5">
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <Grid size={15} className="text-purple-400" />
                      <span>Basic 3D Primitives</span>
                    </h3>
                    <div className={`grid ${gridColsClass} gap-3`}>
                      {[
                        { type: 'empty', name: 'Empty Object', icon: '🎯', desc: 'Transform anchor & parent container' },
                        { type: 'box', name: 'Cube Box', icon: '🧊', desc: 'Standard textured mesh box' },
                        { type: 'sphere', name: 'Sphere', icon: '🔮', desc: 'Curved 3D geometry sphere' },
                        { type: 'cylinder', name: 'Cylinder', icon: '🥫', desc: 'Column shaped solid cylinder' },
                        { type: 'plane', name: 'Plane', icon: '📄', desc: 'Flat 2D surface for textures' },
                        { type: 'cone', name: 'Cone', icon: '🔺', desc: 'Tapered circular 3D cone' },
                        { type: 'torus', name: 'Torus Ring', icon: '🍩', desc: 'Circular donut geometry' },
                        { type: 'particles', name: 'Particles', icon: '✨', desc: 'Interactive spark emitter' },
                      ].map((item) => (
                        <AssetCard
                          key={item.type}
                          id={item.type}
                          name={item.name}
                          badge="PRIMITIVE"
                          badgeColor="bg-purple-500/20 text-purple-300 border-purple-500/30"
                          thumbnail={item.icon}
                          description={item.desc}
                          onSelect={() => handleAddTemplate(item.type)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* 3. UI KITS TAB */}
            {activeTab === 'ui-kits' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`}>
                  {UI_KIT_PRESETS
                    .filter(preset => {
                      const matchesSearch = !searchQuery || preset.name.toLowerCase().includes(searchQuery.toLowerCase()) || preset.description.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = activeFilterChip === 'All' || preset.category.toLowerCase().includes(activeFilterChip.toLowerCase());
                      return matchesSearch && matchesFilter;
                    })
                    .map((preset) => (
                      <AssetCard
                        key={preset.id}
                        id={preset.id}
                        name={preset.name}
                        badge="UI KIT"
                        badgeColor="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                        thumbnail={
                          <div className="w-full h-full p-2.5 flex flex-col justify-between bg-black/50 rounded-lg border border-white/5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-cyan-300 font-mono uppercase">{preset.category}</span>
                              <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            </div>
                            <div className="py-2">
                              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-1.5">
                                <div className="h-full bg-cyan-400 w-3/4 rounded-full" />
                              </div>
                              <div className="text-[10px] text-white font-medium truncate">{preset.name}</div>
                            </div>
                            <div className="text-[8px] text-gray-500 font-mono">1-Click AR Deploy</div>
                          </div>
                        }
                        description={preset.description}
                        isFavorite={!!favorites[preset.id]}
                        onToggleFavorite={() => toggleFavorite(preset.id)}
                        onSelect={() => handleAddUIKit(preset)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* 4. TEXT STYLES TAB */}
            {activeTab === 'text-styles' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`}>
                  {TEXT_STYLE_PRESETS
                    .filter(style => {
                      const matchesSearch = !searchQuery || style.name.toLowerCase().includes(searchQuery.toLowerCase()) || style.description.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = activeFilterChip === 'All' || style.category.toLowerCase().includes(activeFilterChip.toLowerCase());
                      return matchesSearch && matchesFilter;
                    })
                    .map((style) => (
                      <AssetCard
                        key={style.id}
                        id={style.id}
                        name={style.name}
                        badge="FONT STYLE"
                        badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
                        thumbnail={
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-black/50 rounded-lg">
                            <span
                              className="text-lg font-black tracking-wider uppercase leading-tight truncate w-full"
                              style={{
                                color: style.previewStyle?.color || '#ffffff',
                                textShadow: style.previewStyle?.textShadow || '0 0 10px rgba(245,158,11,0.5)',
                              }}
                            >
                              {style.sampleText || style.name}
                            </span>
                            <span className="text-[9px] text-gray-400 mt-2 font-mono">{style.category}</span>
                          </div>
                        }
                        description={style.description}
                        isFavorite={!!favorites[style.id]}
                        onToggleFavorite={() => toggleFavorite(style.id)}
                        onSelect={() => handleAddTextStyle(style)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* 5. MATERIALS TAB */}
            {activeTab === 'materials' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                <div className={`grid ${gridColsClass} gap-3`}>
                  {SPLINE_MATERIAL_PRESETS
                    .filter(mat => {
                      const matchesSearch = !searchQuery || mat.name.toLowerCase().includes(searchQuery.toLowerCase()) || mat.category.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = activeFilterChip === 'All' || mat.category.toLowerCase().includes(activeFilterChip.toLowerCase());
                      return matchesSearch && matchesFilter;
                    })
                    .map((mat) => (
                      <AssetCard
                        key={mat.id}
                        id={mat.id}
                        name={mat.name}
                        badge="PBR"
                        badgeColor="bg-purple-500/20 text-purple-300 border-purple-500/30"
                        thumbnail={
                          <div
                            className="w-14 h-14 rounded-full shadow-xl border border-white/20 flex items-center justify-center"
                            style={{
                              background: mat.previewColor || `linear-gradient(135deg, ${mat.materialProps.color || '#a855f7'}, #1e1b4b)`,
                              boxShadow: mat.materialProps.emissiveIntensity ? `0 0 15px ${mat.materialProps.emissiveColor || mat.materialProps.color}` : undefined,
                            }}
                          />
                        }
                        description={mat.category}
                        isFavorite={!!favorites[mat.id]}
                        onToggleFavorite={() => toggleFavorite(mat.id)}
                        onSelect={() => handleApplySplineMaterial(mat)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* 6. TEXTURES TAB */}
            {activeTab === 'textures' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                <div className={`grid ${gridColsClass} gap-3`}>
                  {getOptimizedARTextures()
                    .filter(tex => !searchQuery || tex.name.toLowerCase().includes(searchQuery.toLowerCase()) || tex.category.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((tex) => (
                      <AssetCard
                        key={tex.id}
                        id={tex.id}
                        name={tex.name}
                        badge="TEXTURE"
                        badgeColor="bg-teal-500/20 text-teal-300 border-teal-500/30"
                        thumbnail={tex.previewUrl}
                        description={tex.category}
                        isFavorite={!!favorites[tex.id]}
                        onToggleFavorite={() => toggleFavorite(tex.id)}
                        onSelect={() => handleApplyARTexture(tex)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* 7. AUDIO TAB */}
            {activeTab === 'audio' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                <div className={`grid ${gridColsClass} gap-3`}>
                  {SPLINE_SOUND_PRESETS
                    .filter(sound => !searchQuery || sound.name.toLowerCase().includes(searchQuery.toLowerCase()) || sound.category.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((sound) => (
                      <AssetCard
                        key={sound.id}
                        id={sound.id}
                        name={sound.name}
                        badge="SFX"
                        badgeColor="bg-rose-500/20 text-rose-300 border-rose-500/30"
                        thumbnail="🎵"
                        description={sound.description || sound.category}
                        isPlaying={playingSoundId === sound.id}
                        onPlayToggle={() => handlePlaySoundToggle(sound)}
                        isFavorite={!!favorites[sound.id]}
                        onToggleFavorite={() => toggleFavorite(sound.id)}
                        onSelect={() => handleAddSound(sound)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* 8. LIGHTING TAB */}
            {activeTab === 'lighting' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {LIGHTING_PRESETS
                    .filter(l => !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((preset) => (
                      <AssetCard
                        key={preset.id}
                        id={preset.id}
                        name={preset.name}
                        badge="LIGHTING"
                        badgeColor="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        thumbnail={
                          <div 
                            className="w-full h-full rounded-xl flex items-center justify-center p-3"
                            style={{
                              background: `radial-gradient(circle at center, ${preset.settings.directionalColor} 0%, ${preset.settings.ambientColor} 60%, #0a0a0f 100%)`,
                            }}
                          >
                            <Sun size={28} className="text-white drop-shadow-md" />
                          </div>
                        }
                        description={preset.description}
                        isFavorite={!!favorites[preset.id]}
                        onToggleFavorite={() => toggleFavorite(preset.id)}
                        onSelect={() => handleAddLighting(preset)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* 9. MARKERS TAB */}
            {activeTab === 'markers' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {MARKER_PRESETS.map((marker) => (
                    <AssetCard
                      key={marker.id}
                      id={marker.id}
                      name={marker.name}
                      badge="AR TARGET"
                      badgeColor="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      thumbnail={marker.url}
                      description={marker.description}
                      metaText={marker.stability}
                      onSelect={() => {
                        const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
                        if (imageTarget) {
                          updateObject(imageTarget.id, {
                            properties: {
                              ...imageTarget.properties,
                              textureUrl: marker.url,
                            }
                          });
                        }
                        showToast(`Set tracking target poster to "${marker.name}"`);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 10. SKETCHFAB TAB */}
            {activeTab === 'sketchfab' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                <div className={`grid ${gridColsClass} gap-3`}>
                  {SKETCHFAB_PRESETS
                    .filter(m => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item, idx) => (
                      <AssetCard
                        key={idx}
                        id={`sketchfab-${idx}`}
                        name={item.name}
                        badge="SKETCHFAB"
                        badgeColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
                        thumbnail="🌐"
                        description={item.description}
                        metaText={item.creator}
                        onSelect={() => {
                          const newObj: SceneObject = {
                            id: uuidv4(),
                            name: item.name,
                            type: 'model',
                            position: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale: [1, 1, 1],
                            visible: true,
                            children: [],
                            parentId: null,
                            properties: { modelUrl: item.url }
                          };
                          addObject(newObj);
                          showToast(`Imported Sketchfab asset "${item.name}"`);
                        }}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* 11. UPLOADS TAB */}
            {activeTab === 'uploads' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {/* Canva Drag and Drop Box */}
                <div 
                  onClick={handleUploadClick}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0];
                      const extension = file.name.split('.').pop()?.toLowerCase() || '';
                      let type: AssetType = 'image';
                      if (['glb', 'gltf'].includes(extension)) type = 'model';
                      else if (['mp4', 'webm'].includes(extension)) type = 'video';
                      else if (['mp3', 'wav'].includes(extension)) type = 'audio';
                      executeAssetImport(file, type);
                    }
                  }}
                  className="w-full border-2 border-dashed border-white/20 hover:border-blue-500/60 bg-white/[0.02] hover:bg-blue-500/[0.04] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Upload size={22} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-white">Drag & drop asset files here</h4>
                    <p className="text-xs text-gray-400 mt-1">Supports 3D Models (.glb), Textures (.png, .jpg), Audio (.mp3) and Videos (.mp4)</p>
                  </div>
                </div>

                {/* Uploaded Assets List */}
                {assets.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-xs">
                    No uploaded assets yet. Click upload or drag files above to populate your library.
                  </div>
                ) : (
                  <div className={`grid ${gridColsClass} gap-3`}>
                    {assets.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        id={asset.id}
                        name={asset.name}
                        badge={asset.type.toUpperCase()}
                        badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        thumbnail={
                          asset.type === 'image' ? asset.url :
                          asset.type === 'model' ? '🧊' :
                          asset.type === 'audio' ? '🎵' :
                          asset.type === 'video' ? '🎬' : '📄'
                        }
                        description={`Uploaded ${asset.type}`}
                        onSelect={() => {
                          if (asset.type === 'model') {
                            const newObj: SceneObject = {
                              id: uuidv4(),
                              name: asset.name,
                              type: 'model',
                              position: [0, 0, 0],
                              rotation: [0, 0, 0],
                              scale: [1, 1, 1],
                              visible: true,
                              children: [],
                              parentId: null,
                              properties: { modelUrl: asset.url }
                            };
                            addObject(newObj);
                            showToast(`Added "${asset.name}" to scene`);
                          } else if (asset.type === 'image') {
                            handleApplyARTexture({
                              id: asset.id,
                              name: asset.name,
                              previewUrl: asset.url,
                              category: 'Uploads',
                              recommendedScale: [1, 1],
                            });
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 12. LAYOUTS TAB */}
            {activeTab === 'layouts' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'header-footer', name: 'Header & Footer HUD', desc: 'Top telemetry bar with bottom control buttons' },
                    { id: 'split-screen', name: 'Split Screen Dashboard', desc: 'Left diagnostic panel and right status gauges' },
                    { id: 'centered-modal', name: 'Centered Dialog Window', desc: 'Glassmorphic modal card with interactive actions' },
                    { id: 'status-grid', name: 'Status Grid Matrix', desc: '4-quadrant responsive AR dashboard widgets' },
                  ].map((layout) => (
                    <AssetCard
                      key={layout.id}
                      id={layout.id}
                      name={layout.name}
                      badge="SCAFFOLD"
                      badgeColor="bg-violet-500/20 text-violet-300 border-violet-500/30"
                      thumbnail={
                        <div className="w-full h-full p-2.5 flex flex-col justify-center gap-1.5 bg-black/50 rounded-lg border border-white/5">
                          <LayoutGrid size={24} className="text-violet-400 mx-auto" />
                          <span className="text-[10px] text-center text-gray-300 font-mono">{layout.name}</span>
                        </div>
                      }
                      description={layout.desc}
                      onSelect={() => handleAddHUDLayout(layout.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Global Search Empty State */}
            {searchQuery && (
              <div className="p-4 border-t border-white/5 bg-[#0D0D12] text-xs text-gray-400 flex items-center justify-between">
                <span>Showing search results for <strong className="text-white">"{searchQuery}"</strong></span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Marker Manager Modal */}
        {showMarkerManager && <MarkerManagerModal onClose={() => setShowMarkerManager(false)} />}

        {/* 3D Model Validation Modal */}
        {validationModel && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#121214] border border-amber-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
              <div className="p-4 border-b border-white/5 bg-amber-500/10 flex items-center gap-3">
                <Info size={20} className="text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-white">3D Model Validation Review</h3>
                  <p className="text-[10px] text-gray-400">{validationModel.file.name}</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>Triangles:</span>
                    <span className="font-bold text-white">{validationModel.stats.totalTriangles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Vertices:</span>
                    <span className="font-bold text-white">{validationModel.stats.totalVertices.toLocaleString()}</span>
                  </div>
                </div>
                {validationModel.warnings.map((w: string, idx: number) => (
                  <div key={idx} className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    ⚠️ {w}
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/5 bg-black/40 flex gap-2">
                <button
                  onClick={() => setValidationModel(null)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    executeAssetImport(validationModel.file, 'model', validationModel.stats);
                    setValidationModel(null);
                  }}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg"
                >
                  Import Anyway
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Progress Overlay */}
        {importProgress && (
          <div className="fixed bottom-6 right-6 z-[9999] bg-[#111113] border border-white/10 rounded-2xl p-4 w-80 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white truncate w-3/4">{importProgress.fileName}</span>
              <span className="text-xs font-mono text-blue-400">{importProgress.progress}%</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${importProgress.progress}%` }} />
            </div>
            <span className="text-[10px] text-gray-400">{importProgress.status}</span>
          </div>
        )}

      </div>
    </div>
  );
}
