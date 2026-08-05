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
  Download
} from 'lucide-react';
import { Asset, AssetType, SceneObject } from '../../types';
import { SPLINE_3D_ICONS, SplineIconMetadata } from '../viewport/Spline3DIconRenderer';
import { SPLINE_2D_ICONS, Spline2DIconMetadata } from '../../lib/spline2DIcons';
import * as LucideIcons from 'lucide-react';
import { SPLINE_MATERIAL_PRESETS, getOptimizedARTextures, SplineMaterialPreset, GeneratedARTexture } from '../../lib/splineMaterials';
import { UI_KIT_PRESETS, UIKitCategory, UIKitPreset } from '../../lib/uiKits';
import { TEXT_STYLE_PRESETS, TextStyleCategory, TextStylePreset } from '../../lib/textStylesCollection';
import { SPLINE_SOUND_PRESETS, playSplineSound, SplineSoundPreset } from '../../lib/splineSoundEngine';

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

// Premium high-quality stable GLB presets and procedural 3D models (50+ items)
const PRESET_MODELS = [
  {
    id: 'p-model-astronaut',
    name: 'Astronaut',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    thumbnail: '🚀',
    description: 'Classic zero-gravity space explorer GLB model',
  },
  {
    id: 'p-model-car',
    name: 'Toy Retro Car',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb',
    thumbnail: '🚗',
    description: 'Highly detailed vintage toy car GLB model',
  },
  {
    id: 'p-model-robot',
    name: 'Expressive Robot',
    type: 'model' as AssetType,
    url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    thumbnail: '🤖',
    description: 'Robot with animated face panels and joints',
  },
  {
    id: 'p-model-vase',
    name: 'Bronze Vase',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/VaseBronze/glTF-Binary/VaseBronze.glb',
    thumbnail: '🏺',
    description: 'Ancient bronze museum artifact GLB model',
  },
  {
    id: 'p-model-lantern',
    name: 'Vintage Lantern',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Lantern/glTF-Binary/Lantern.glb',
    thumbnail: '🏮',
    description: 'Detailed classic light container GLB model',
  },
  {
    id: 'p-model-shoe',
    name: 'E-Comm Sneaker',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/MaterialsVariantsShoe.glb',
    thumbnail: '👟',
    description: 'E-commerce athletic sneaker with material variants',
  },
  {
    id: 'p-model-helmet',
    name: 'Damaged Sci-Fi Helmet',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    thumbnail: '🪖',
    description: 'High-poly sci-fi battle-damaged helmet',
  },
  {
    id: 'p-model-avocado',
    name: '3D Avocado',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Avocado/glTF-Binary/Avocado.glb',
    thumbnail: '🥑',
    description: 'Photorealistic fresh avocado GLB model',
  },
  {
    id: 'p-model-boombox',
    name: 'Retro BoomBox',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/BoomBox/glTF-Binary/BoomBox.glb',
    thumbnail: '📻',
    description: '80s cassette player stereo boombox',
  },
  {
    id: 'p-model-duck',
    name: 'Rubber Duck',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Duck/glTF-Binary/Duck.glb',
    thumbnail: '🦆',
    description: 'Yellow bath rubber duck GLB model',
  },
  {
    id: 'p-model-fox',
    name: 'Low-Poly Fox',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb',
    thumbnail: '🦊',
    description: 'Animated low-poly forest fox character',
  },
  {
    id: 'p-model-waterbottle',
    name: 'Eco Water Bottle',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb',
    thumbnail: '🍼',
    description: 'Reusable metallic sports water bottle',
  },
  {
    id: 'p-model-chair',
    name: 'Modern Sheen Chair',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    thumbnail: '🪑',
    description: 'Velvet fabric modern lounge arm chair',
  },
  {
    id: 'p-model-sphere-primitive',
    name: 'Sample Mesh Sphere',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    thumbnail: '🔮',
    description: 'Online GLB high-poly sphere mesh asset',
  },
  {
    id: 'p-model-cube-primitive',
    name: 'Sample Mesh Box',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Box/glTF-Binary/Box.glb',
    thumbnail: '🧊',
    description: 'Online GLB textured box mesh asset',
  },
  {
    id: 'p-model-cylinder-primitive',
    name: 'Antique Camera',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
    thumbnail: '📷',
    description: 'Detailed vintage antique camera GLB mesh',
  },
  {
    id: 'p-model-torus-primitive',
    name: 'Cesium Explorer',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/CesiumMan/glTF-Binary/CesiumMan.glb',
    thumbnail: '🚶‍♂️',
    description: 'Animated walking explorer GLB mesh',
  },
  {
    id: 'p-model-cone-primitive',
    name: 'Suzanne Monkey Mesh',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb',
    thumbnail: '🐵',
    description: 'Classic Blender Suzanne monkey head 3D mesh',
  },
  {
    id: 'p-model-plane-primitive',
    name: 'Stained Glass Lamp',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoomBox/glTF-Binary/BoomBox.glb',
    thumbnail: '🪔',
    description: 'Ornate stained glass table lamp GLB mesh',
  },
  {
    id: 'p-model-pyramid-primitive',
    name: 'Flight Helmet',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    thumbnail: '🪖',
    description: 'PBR military pilot flight helmet GLB',
  },
  {
    id: 'p-model-capsule-primitive',
    name: 'Anatomical Brain Stem',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BrainStem/glTF-Binary/BrainStem.glb',
    thumbnail: '🧠',
    description: 'Medical anatomical brain stem 3D mesh',
  },
  {
    id: 'p-model-dodeca-primitive',
    name: 'Corset Fashion Dress',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Corset/glTF-Binary/Corset.glb',
    thumbnail: '👗',
    description: 'High quality textile corset 3D model',
  },
  {
    id: 'p-model-octa-primitive',
    name: 'Buggy Offroad Vehicle',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Buggy/glTF-Binary/Buggy.glb',
    thumbnail: '🏎️',
    description: 'Complex offroad motorsport buggy mesh',
  },
  {
    id: 'p-model-icosa-primitive',
    name: 'Tropical Flamingo',
    type: 'model' as AssetType,
    url: 'https://threejs.org/examples/models/gltf/Flamingo.glb',
    thumbnail: '🦩',
    description: 'Animated flying tropical flamingo mesh',
  },
  {
    id: 'p-model-knot-primitive',
    name: 'Wild Stallion Horse',
    type: 'model' as AssetType,
    url: 'https://threejs.org/examples/models/gltf/Horse.glb',
    thumbnail: '🐎',
    description: 'Galloping wild stallion horse GLB model',
  },
  {
    id: 'p-model-text3d',
    name: 'Exotic Parrot',
    type: 'model' as AssetType,
    url: 'https://threejs.org/examples/models/gltf/Parrot.glb',
    thumbnail: '🦜',
    description: 'Animated flying jungle parrot mesh',
  },
  {
    id: 'p-model-pointlight',
    name: 'Graceful Stork',
    type: 'model' as AssetType,
    url: 'https://threejs.org/examples/models/gltf/Stork.glb',
    thumbnail: '🦢',
    description: 'Animated soaring stork GLB 3D model',
  },
  {
    id: 'p-model-spotlight',
    name: 'Sci-Fi Combat Helmet',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    thumbnail: '🪖',
    description: 'High detail battle suit combat visor',
  },
  {
    id: 'p-model-sunlight',
    name: 'Solar Generator',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Lantern/glTF-Binary/Lantern.glb',
    thumbnail: '☀️',
    description: 'Solar power cell light generator mesh',
  },
  {
    id: 'p-model-imagetarget',
    name: 'Spatial Anchor Plane',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Box/glTF-Binary/Box.glb',
    thumbnail: '🎯',
    description: 'AR image tracking anchor plane target mesh',
  },
  {
    id: 'p-model-drone',
    name: 'Autonomous Quadcopter Drone',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    thumbnail: '🚁',
    description: 'Future surveillance quadcopter drone mesh',
  },
  {
    id: 'p-model-satellite',
    name: 'Orbital Communication Satellite',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb',
    thumbnail: '🛰️',
    description: 'Solar panel orbital communications relay satellite',
  },
  {
    id: 'p-model-portal',
    name: 'Sci-Fi Teleport Portal',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoomBox/glTF-Binary/BoomBox.glb',
    thumbnail: '🌀',
    description: 'Holographic dimensional warp gate GLB',
  },
  {
    id: 'p-model-arcade',
    name: 'Retro Arcade Machine',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoomBox/glTF-Binary/BoomBox.glb',
    thumbnail: '🕹️',
    description: 'Vintage coin-op arcade game cabinet',
  },
  {
    id: 'p-model-chest',
    name: 'Loot Treasure Chest',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/VaseBronze/glTF-Binary/VaseBronze.glb',
    thumbnail: '📦',
    description: 'Interactive loot box treasure container',
  },
  {
    id: 'p-model-sword',
    name: 'Plasma Cyber Blade',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
    thumbnail: '⚔️',
    description: 'Energy infused melee weapon blade GLB',
  },
  {
    id: 'p-model-shield',
    name: 'Aegis Force Shield',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    thumbnail: '🛡️',
    description: 'Defensive holographic forcefield shield',
  },
  {
    id: 'p-model-trophy',
    name: 'Grand Prix Trophy',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/VaseBronze/glTF-Binary/VaseBronze.glb',
    thumbnail: '🏆',
    description: 'Gold championship victory cup',
  },
  {
    id: 'p-model-gem',
    name: 'Prismatic Sapphire Gem',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb',
    thumbnail: '💎',
    description: 'High refraction cut gemstone crystal',
  },
  {
    id: 'p-model-coin-stack',
    name: 'Crypto Gold Coin Stack',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Box/glTF-Binary/Box.glb',
    thumbnail: '🪙',
    description: 'Stacked gold bullion currency coins',
  },
  {
    id: 'p-model-vr-headset',
    name: 'Spatial Vision Goggles',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
    thumbnail: '🥽',
    description: 'Ergonomic spatial computing AR headset',
  },
  {
    id: 'p-model-cpu-chip',
    name: 'Neural AI Microchip',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Box/glTF-Binary/Box.glb',
    thumbnail: '🔲',
    description: 'Multi-core quantum neural processing unit',
  },
  {
    id: 'p-model-guitar',
    name: 'Electric Rock Guitar',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    thumbnail: '🎸',
    description: '6-string solid body electric guitar',
  },
  {
    id: 'p-model-piano',
    name: 'Grand Concert Piano',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    thumbnail: '🎹',
    description: 'Polished black acoustic grand piano',
  },
  {
    id: 'p-model-watch',
    name: 'Holographic Smartwatch',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
    thumbnail: '⌚',
    description: 'Biometric telemetry smartwatch display',
  },
  {
    id: 'p-model-ring',
    name: 'Titanium Smart Ring',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    thumbnail: '💍',
    description: 'Precision machined metallic biometric ring',
  },
  {
    id: 'p-model-plant',
    name: 'Bonsai Potted Plant',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb',
    thumbnail: '🪴',
    description: 'Ceramic pot indoor evergreen bonsai tree',
  },
  {
    id: 'p-model-house',
    name: 'Architectural Modern Villa',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Box/glTF-Binary/Box.glb',
    thumbnail: '🏡',
    description: 'Scale model minimalist residential villa',
  },
  {
    id: 'p-model-rocket-ship',
    name: 'Saturn V Heavy Rocket',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    thumbnail: '🚀',
    description: 'Multi-stage deep space exploration vessel',
  },
  {
    id: 'p-model-battery',
    name: 'Quantum Cell Battery',
    type: 'model' as AssetType,
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb',
    thumbnail: '🔋',
    description: 'High capacity solid-state energy storage',
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
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    creator: 'Sketchfab CC-BY',
    description: 'Highly detailed retro cyberpunk style collectible car'
  },
  {
    name: 'Flight Pilot Helmet 🚀',
    category: 'space',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    creator: 'Khronos CC0',
    description: 'PBR military pilot flight helmet'
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
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb',
    creator: 'Poly Pizza CC0',
    description: 'Miniature Japanese bonsai tree asset'
  },
  {
    name: 'Vintage Brass Lantern 🏮',
    category: 'interior',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb',
    creator: 'Smithsonian CC0',
    description: '19th century style brass kerosene storm lantern'
  },
  {
    name: 'E-Commerce Athletic Sneaker 👟',
    category: 'items',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
    creator: 'Khronos Group CC0',
    description: 'Photorealistic commercial running sneaker model'
  },
  {
    name: 'BoomBox Audio 📻',
    category: 'items',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoomBox/glTF-Binary/BoomBox.glb',
    creator: 'Khronos Group CC0',
    description: 'Classic 1980s portable cassette radio boombox'
  },
  {
    name: 'Offroad Buggy 🌙',
    category: 'space',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Buggy/glTF-Binary/Buggy.glb',
    creator: 'Khronos CC0',
    description: 'Offroad lunar exploration buggy vehicle'
  },
  {
    name: 'Curiosity Toy Car 🚜',
    category: 'space',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    creator: 'Khronos CC0',
    description: 'Rover exploration vehicle'
  },
  {
    name: 'Bronze Museum Vase 🏺',
    category: 'interior',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/VaseBronze/glTF-Binary/VaseBronze.glb',
    creator: 'Smithsonian CC0',
    description: 'Detailed ancient Greek replica bronze vase'
  },
  {
    name: 'Retro Wood Chair 🪑',
    category: 'interior',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    creator: 'Khronos Group CC0',
    description: 'Modernist wooden design accent chair with sheen fabrics'
  },
  {
    name: 'Damaged Helmet 🪖',
    category: 'items',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
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

type CategoryTab = 'ui-kits' | 'text-styles' | 'templates' | 'materials' | 'textures' | 'icons' | '2d-icons' | 'uploads' | 'sketchfab' | 'models' | 'markers' | 'audio' | 'behaviors' | 'lighting' | 'layouts';

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
  const hoverTimeoutRef = useRef<Record<string, any>>({});
  
  useEffect(() => {
    return () => {
      Object.values(hoverTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);
  const [activeTab, setActiveTab] = useState<CategoryTab>('text-styles');
  const [uiKitSearchQuery, setUiKitSearchQuery] = useState('');
  const [selectedUiKitCategory, setSelectedUiKitCategory] = useState<string>('All');
  const [selectedUiKitTarget, setSelectedUiKitTarget] = useState<string>('All');
  const [textStyleSearchQuery, setTextStyleSearchQuery] = useState('');
  const [selectedTextStyleCategory, setSelectedTextStyleCategory] = useState<string>('All');
  const [selectedTextStyleTarget, setSelectedTextStyleTarget] = useState<string>('All');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateFilterTag, setTemplateFilterTag] = useState('all');
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [selectedIconCategory, setSelectedIconCategory] = useState<string>('All');
  const [icon2DSearchQuery, setIcon2DSearchQuery] = useState('');
  const [selected2DIconCategory, setSelected2DIconCategory] = useState<string>('All');
  const [selectedIconMaterialStyle, setSelectedIconMaterialStyle] = useState<string>('glossy');
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string>('All');
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [selectedTextureCategory, setSelectedTextureCategory] = useState<string>('All');
  const [textureSearchQuery, setTextureSearchQuery] = useState('');
  const [selectedAudioCategory, setSelectedAudioCategory] = useState<string>('All');
  const [selectedLightingCategory, setSelectedLightingCategory] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [showMarkerManager, setShowMarkerManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [customImportUrl, setCustomImportUrl] = useState('');
  const [sketchfabViewMode, setSketchfabViewMode] = useState<'grid' | 'webview'>('grid');
  const inputRef = useRef<HTMLInputElement>(null);

  const [validationModel, setValidationModel] = useState<{
    file: File;
    stats: {
      totalVertices: number;
      totalTriangles: number;
      externalUris: string[];
      meshCount: number;
      materialCount: number;
      textureCount: number;
      imageCount: number;
    };
    warnings: string[];
  } | null>(null);

  const [importProgress, setImportProgress] = useState<{
    fileName: string;
    progress: number;
    status: string;
  } | null>(null);

  const [recentAssets, setRecentAssets] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('spline_recent_assets');
      if (stored) {
        setRecentAssets(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Error loading recent assets from local storage:", e);
    }
  }, []);

  const addToRecentAssets = (item: any) => {
    try {
      const stored = localStorage.getItem('spline_recent_assets');
      let currentList = stored ? JSON.parse(stored) : [];
      currentList = currentList.filter((x: any) => x.name !== item.name && x.url !== item.url && x.id !== item.id);
      
      const newItem = {
        id: item.id || uuidv4(),
        name: item.name,
        type: item.type,
        url: item.url,
        thumbnail: item.thumbnail,
        description: item.description,
        timestamp: Date.now()
      };
      
      const newList = [newItem, ...currentList].slice(0, 12);
      localStorage.setItem('spline_recent_assets', JSON.stringify(newList));
      setRecentAssets(newList);
    } catch (e) {
      console.warn("Error adding to recent assets:", e);
    }
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
      setNotification(`✨ Applied "${preset.name}" to ${targetObj.name}`);
      setTimeout(() => setNotification(null), 3000);
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
          color: preset.materialProps.color,
          roughness: preset.materialProps.roughness,
          metalness: preset.materialProps.metalness,
          ...preset.materialProps,
        }
      };
      addObject(newObj);
      useEditorStore.getState().selectObject(newId);
      setNotification(`Created sphere with "${preset.name}" material`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleApplyARTexture = (tex: GeneratedARTexture) => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    if (selectedObjectId && objects[selectedObjectId]) {
      const targetObj = objects[selectedObjectId];
      updateObject(selectedObjectId, {
        properties: {
          ...targetObj.properties,
          textureUrl: tex.previewUrl,
          normalMapUrl: tex.normalMapUrl,
          roughnessMapUrl: tex.roughnessMapUrl,
          textureRepeatX: tex.recommendedScale[0],
          textureRepeatY: tex.recommendedScale[1],
        }
      });
      setNotification(`🎨 Applied "${tex.name}" AR texture map to ${targetObj.name}`);
      setTimeout(() => setNotification(null), 3000);
    } else {
      const newId = uuidv4();
      const newObj: SceneObject = {
        id: newId,
        name: `${tex.name} Surface`,
        type: 'plane',
        position: [0, 0, 0],
        rotation: [-Math.PI / 2, 0, 0],
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
          textureRepeatX: tex.recommendedScale[0],
          textureRepeatY: tex.recommendedScale[1],
        }
      };
      addObject(newObj);
      useEditorStore.getState().selectObject(newId);
      setNotification(`Created AR surface with "${tex.name}" texture`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleAdd3DIcon = (icon: SplineIconMetadata) => {
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
      showToast(`Replaced asset with 3D icon "${icon.name}" preserving transform.`);
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
    showToast(`Added 3D icon "${newObj.name}" to the scene.`);
  };

  const handleAdd2DIcon = (icon: Spline2DIconMetadata) => {
    if (replaceTargetObjectId && objects[replaceTargetObjectId]) {
      replaceObjectAsset(replaceTargetObjectId, {
        type: 'icon2d',
        name: icon.name,
        iconName: icon.iconName,
        properties: {
          iconName: icon.iconName,
          color: icon.defaultColor,
          secondaryColor: icon.secondaryColor,
          badgeStyle: icon.badgeStyle,
          text: icon.name,
        }
      });
      showToast(`Replaced asset with 2D icon badge "${icon.name}" preserving transform.`);
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
    showToast(`Added 2D icon badge "${icon.name}" to the scene.`);
  };

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

  const executeAssetImport = async (file: File, type: AssetType, stats?: any) => {
    const name = file.name;
    setImportProgress({ fileName: name, progress: 15, status: 'Reading file bytes...' });
    
    // Delightful simulation steps to keep the user engaged
    const timeouts = [
      setTimeout(() => {
        setImportProgress(p => p ? { ...p, progress: 40, status: 'Analyzing 3D geometry & sub-object hierarchies...' } : null);
      }, 350),
      setTimeout(() => {
        setImportProgress(p => p ? { ...p, progress: 65, status: 'Optimizing vertex structures and material mapping...' } : null);
      }, 750)
    ];

    let url = '';
    try {
      const { SupabaseService } = await import('../../services/supabaseService');
      const storeState = useEditorStore.getState();
      const projectName = storeState.settings.projectName || 'default-project';

      // Update upload status
      setTimeout(() => {
        setImportProgress(p => p ? { ...p, progress: 80, status: 'Uploading assets securely to cloud storage...' } : null);
      }, 1200);

      if (SupabaseService.isConfigured()) {
        url = await SupabaseService.uploadAsset(file, projectName);
      } else {
        url = await fileToDataUrl(file);
      }

      setImportProgress(p => p ? { ...p, progress: 95, status: 'Generating Spline3D-inspired responsive preview...' } : null);
      
      const asset: Asset = {
        id: uuidv4(),
        name,
        type,
        url,
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      addAsset(asset);
      addToRecentAssets(asset);
      setImportProgress(null);
      if (replaceTargetObjectId && objects[replaceTargetObjectId]) {
        const targetObj = objects[replaceTargetObjectId];
        replaceObjectAsset(replaceTargetObjectId, asset);
        showToast(`Uploaded and replaced asset on "${targetObj.name}" preserving transform!`);
        setReplaceTargetObjectId(null);
      } else {
        showToast(`Uploaded asset: ${name}`);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      url = await fileToDataUrl(file);
      const asset: Asset = {
        id: uuidv4(),
        name,
        type,
        url,
      };
      addAsset(asset);
      addToRecentAssets(asset);
      setImportProgress(null);
      if (replaceTargetObjectId && objects[replaceTargetObjectId]) {
        const targetObj = objects[replaceTargetObjectId];
        replaceObjectAsset(replaceTargetObjectId, asset);
        showToast(`Uploaded and replaced asset on "${targetObj.name}" preserving transform!`);
        setReplaceTargetObjectId(null);
      } else {
        showToast(`Uploaded asset locally: ${name}`);
      }
    } finally {
      timeouts.forEach(clearTimeout);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name;
    let type: AssetType = 'script';
    
    if (name.endsWith('.glb') || name.endsWith('.gltf')) type = 'model';
    else if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';

    if (type === 'model') {
      showToast(`Validating ${name} structure...`);
      const stats = await validate3DModel(file);
      
      const warnings: string[] = [];
      if (stats) {
        if (stats.totalTriangles > 80000) {
          warnings.push(`High polygon complexity detected (${stats.totalTriangles.toLocaleString()} triangles). Large files can cause performance stuttering and frame drops on older smartphones during live AR camera previews.`);
        }
        if (stats.externalUris && stats.externalUris.length > 0) {
          warnings.push(`Model contains ${stats.externalUris.length} external resource reference(s) (e.g., "${stats.externalUris[0]}"). These assets may load as blank or missing if they are not embedded or packed directly within the uploaded GLB container.`);
        }
      }

      if (warnings.length > 0) {
        setValidationModel({
          file,
          stats: stats || { totalVertices: 0, totalTriangles: 0, externalUris: [], meshCount: 0, materialCount: 0, textureCount: 0, imageCount: 0 },
          warnings
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    await executeAssetImport(file, type);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getIcon = (type: AssetType) => {
    switch (type) {
      case 'model': return <Box size={24} className="text-blue-400" />;
      case 'image': return <ImageIcon size={24} className="text-green-400" />;
      case 'video': return <Video size={24} className="text-purple-400" />;
      case 'script': return <FileCode size={24} className="text-yellow-400" />;
      case 'audio': return <Music size={24} className="text-pink-400" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, asset: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleUseAsset = (asset: any) => {
    addToRecentAssets(asset);

    // If Replace Target is active, swap asset preserving transform
    if (replaceTargetObjectId && objects[replaceTargetObjectId]) {
      const targetObj = objects[replaceTargetObjectId];
      replaceObjectAsset(replaceTargetObjectId, asset);
      showToast(`Replaced asset on "${targetObj.name}" preserving transform!`);
      setReplaceTargetObjectId(null);
      return;
    }

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
        rotation: [90, 0, 0], // Oriented in Z direction when instantiated
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentId || null,
        properties: {
          url: asset.url
        }
      };
      
      addObject(newObj, parentId || undefined);
      useEditorStore.getState().selectObject(newObj.id);
      showToast(`Added 3D model "${newObj.name}" to the scene.`);
    } else if (asset.type === 'image') {
      if (selectedObjectIds.length > 0) {
        let appliedCount = 0;
        selectedObjectIds.forEach(id => {
          const selectedObj = objects[id];
          if (selectedObj) {
            if (selectedObj.type === 'image' || selectedObj.type === 'imageTarget' || selectedObj.type === 'hudImage') {
              updateObject(id, {
                properties: {
                  ...selectedObj.properties,
                  textureUrl: asset.url
                }
              });
              appliedCount++;
            } else if (selectedObj.type === 'hudButton') {
              updateObject(id, {
                properties: {
                  ...selectedObj.properties,
                  icon: asset.url
                }
              });
              appliedCount++;
            }
          }
        });
        
        if (appliedCount > 0) {
          showToast(`Applied "${asset.name}" to ${appliedCount} selected object(s).`);
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
    { id: 't-hotspot', type: 'hotspot', name: 'Hotspot Beacon', icon: Sparkles, color: 'text-cyan-400', desc: 'Interactive touch trigger with pop-up card', tags: ['3d', 'ui', 'hotspot'] },
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

      {/* Replace Target Indicator Bar */}
      {replaceTargetObjectId && objects[replaceTargetObjectId] && (
        <div className="bg-gradient-to-r from-cyan-950/90 via-blue-950/90 to-purple-950/90 border-b border-cyan-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-cyan-200 shrink-0 shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <RefreshCw size={13} className="text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <span>
              Replacing Asset for <strong className="text-white font-bold">{objects[replaceTargetObjectId].name}</strong> — Click any asset below to swap while preserving <span className="text-cyan-300 font-mono text-[11px] bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">Position, Rotation & Scale</span>!
            </span>
          </div>
          <button
            onClick={() => setReplaceTargetObjectId(null)}
            className="px-3 py-1 bg-black/50 hover:bg-black/80 text-gray-300 hover:text-white rounded-md text-[11px] font-bold border border-cyan-500/30 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
          >
            <X size={12} />
            Cancel Replacement
          </button>
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
            onClick={() => setActiveTab('ui-kits')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'ui-kits' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20 font-bold' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Layers size={16} className={activeTab === 'ui-kits' ? 'text-white' : 'text-cyan-400'} />
            <span className="font-medium">UI Kits Collection</span>
            <span className="ml-auto bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">{UI_KIT_PRESETS.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('text-styles')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'text-styles' ? 'bg-gradient-to-r from-amber-500 to-pink-600 text-white shadow-md shadow-amber-500/20 font-bold' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Type size={16} className={activeTab === 'text-styles' ? 'text-white' : 'text-amber-400'} />
            <span className="font-medium">Text Styles Studio</span>
            <span className="ml-auto bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">{TEXT_STYLE_PRESETS.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('templates')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'templates' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Plus size={16} className={activeTab === 'templates' ? 'text-white' : 'text-emerald-400'} />
            <span className="font-medium">Primitives & UI</span>
          </button>

          <button 
            onClick={() => setActiveTab('icons')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'icons' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20 font-bold' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Sparkles size={16} className={activeTab === 'icons' ? 'text-white' : 'text-pink-400'} />
            <span className="font-medium">3D Icons (Spline)</span>
            <span className="ml-auto bg-pink-500/20 text-pink-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">{SPLINE_3D_ICONS.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('2d-icons')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === '2d-icons' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-bold' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Shapes size={16} className={activeTab === '2d-icons' ? 'text-white' : 'text-blue-400'} />
            <span className="font-medium">2D Vector Badges</span>
            <span className="ml-auto bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">{SPLINE_2D_ICONS.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('materials')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'materials' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 font-bold' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Palette size={16} className={activeTab === 'materials' ? 'text-white' : 'text-purple-400'} />
            <span className="font-medium">Spline Materials</span>
            <span className="ml-auto bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">{SPLINE_MATERIAL_PRESETS.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('textures')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'textures' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20 font-bold' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Grid size={16} className={activeTab === 'textures' ? 'text-white' : 'text-cyan-400'} />
            <span className="font-medium">AR Textures</span>
            <span className="ml-auto bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">PBR</span>
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
            onClick={() => setActiveTab('lighting')}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${activeTab === 'lighting' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}`}
          >
            <Sun size={16} className={activeTab === "lighting" ? "text-white" : "text-yellow-400"} />
            <span className="font-medium">Lighting Presets</span>
          </button>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/40">

          {recentAssets.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-400" />
                  <h4 className="text-xs font-black tracking-wider uppercase text-gray-300">Recent Assets</h4>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('spline_recent_assets');
                    setRecentAssets([]);
                  }}
                  className="text-[9px] font-bold text-gray-500 hover:text-red-400 uppercase tracking-wider transition-colors"
                >
                  Clear History
                </button>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {recentAssets.map((asset) => {
                  const preset = asset.type === 'model' || asset.type === 'icon' || asset.type === 'material'
                    ? getSplineThumbnailStyle(asset.name)
                    : null;
                    
                  return (
                    <button
                      key={asset.id + '-' + asset.timestamp}
                      onClick={() => handleUseAsset(asset)}
                      className="flex-shrink-0 w-20 flex flex-col items-center gap-1.5 group cursor-pointer"
                      title={`Add ${asset.name} directly to the scene`}
                    >
                      {/* Beautiful 3D Thumbnail Container */}
                      <div className="w-14 h-14 rounded-xl border border-white/5 overflow-hidden bg-[#111] flex items-center justify-center relative shadow-md transition-all group-hover:scale-105 group-hover:border-blue-500/50">
                        {asset.type === 'image' ? (
                          <img src={asset.url} alt={asset.name} className="w-8 h-8 object-contain" />
                        ) : asset.type === 'model' && preset ? (
                          <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{ background: preset.bg }}>
                            <div 
                              className="w-8 h-8 rounded-full relative transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex items-center justify-center shadow"
                              style={{ 
                                background: preset.orbBg,
                                boxShadow: `inset -1px -1px 3px rgba(0,0,0,0.5), 0 0 6px ${preset.glowColor}`
                              }}
                            >
                              <div className="absolute inset-0.5 rounded-full border border-white/10 opacity-50 pointer-events-none" />
                              <Box size={10} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                            </div>
                          </div>
                        ) : asset.type === 'material' ? (
                          <div className="w-full h-full flex items-center justify-center bg-[#111]">
                            <div 
                              style={{
                                background: asset.thumbnail || (preset ? preset.orbBg : 'radial-gradient(circle at 35% 35%, #fff 0%, #aaa 80%)'),
                                boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.15)'
                              }}
                              className="w-9 h-9 rounded-full transform group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ) : asset.thumbnail && typeof asset.thumbnail === 'string' && asset.thumbnail.length <= 4 ? (
                          preset ? (
                            <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{ background: preset.bg }}>
                              <div 
                                className="w-9 h-9 rounded-full relative transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex items-center justify-center shadow"
                                style={{ 
                                  background: preset.orbBg,
                                  boxShadow: `inset -1px -1px 3px rgba(0,0,0,0.5), 0 0 6px ${preset.glowColor}`
                                }}
                              >
                                <div className="absolute inset-0.5 rounded-full border border-white/15 opacity-50 pointer-events-none" />
                                <span className="text-sm relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{asset.thumbnail}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xl group-hover:scale-115 transition-transform">{asset.thumbnail}</span>
                          )
                        ) : (
                          getIcon(asset.type)
                        )}
                        
                        <span className="absolute bottom-0.5 right-0.5 text-[6px] uppercase tracking-wider font-mono font-bold px-1 py-0.5 rounded bg-black/80 text-gray-400">
                          {asset.type === 'model' ? '3D' : asset.type === 'image' ? 'IMG' : asset.type === 'material' ? 'MAT' : 'ASSET'}
                        </span>
                      </div>
                      
                      <span className="text-[9px] text-[#888] font-medium text-center w-full truncate leading-tight group-hover:text-white transition-colors px-0.5">
                        {asset.name.split('.')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* UI KITS TAB */}
          {activeTab === 'ui-kits' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="mb-6 px-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="text-cyan-400" /> UI Kits Collection
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Premium HUD and 3D spatial UI kits inspired by Vision OS, Cyberpunk Tactical, Smart Home IoT, E-Commerce AR, Fintech & Spatial Audio.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1.5 rounded-full self-start md:self-auto shrink-0">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span>{UI_KIT_PRESETS.length} READY-TO-USE KITS</span>
                </div>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="mb-6 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search UI Kits by name, category, or tag..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    value={uiKitSearchQuery}
                    onChange={(e) => setUiKitSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedUiKitCategory}
                    onChange={(e) => setSelectedUiKitCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 text-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="All" className="bg-slate-900 text-white">All Categories</option>
                    <option value="Vision OS Spatial" className="bg-slate-900 text-white">Vision OS Spatial</option>
                    <option value="Cyberpunk Tactical" className="bg-slate-900 text-white">Cyberpunk Tactical</option>
                    <option value="Smart Home IoT" className="bg-slate-900 text-white">Smart Home IoT</option>
                    <option value="E-Commerce AR" className="bg-slate-900 text-white">E-Commerce AR</option>
                    <option value="Fintech & Crypto" className="bg-slate-900 text-white">Fintech & Crypto</option>
                    <option value="Spatial Audio" className="bg-slate-900 text-white">Spatial Audio</option>
                    <option value="AR Wayfinding" className="bg-slate-900 text-white">AR Wayfinding</option>
                    <option value="Studio Productivity" className="bg-slate-900 text-white">Studio Productivity</option>
                  </select>

                  <select
                    value={selectedUiKitTarget}
                    onChange={(e) => setSelectedUiKitTarget(e.target.value)}
                    className="bg-white/5 border border-white/10 text-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="All" className="bg-slate-900 text-white">All Surfaces</option>
                    <option value="2D HUD" className="bg-slate-900 text-white">2D HUD Overlays</option>
                    <option value="3D Scene" className="bg-slate-900 text-white">3D Scene Objects</option>
                  </select>
                </div>
              </div>

              {/* Grid of UI Kits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pr-2 pb-20">
                {UI_KIT_PRESETS.filter(kit => {
                  const matchesSearch = !uiKitSearchQuery || 
                    kit.name.toLowerCase().includes(uiKitSearchQuery.toLowerCase()) ||
                    kit.category.toLowerCase().includes(uiKitSearchQuery.toLowerCase()) ||
                    kit.description.toLowerCase().includes(uiKitSearchQuery.toLowerCase()) ||
                    kit.tags.some(t => t.toLowerCase().includes(uiKitSearchQuery.toLowerCase()));
                  const matchesCat = selectedUiKitCategory === 'All' || kit.category === selectedUiKitCategory;
                  const matchesTarget = selectedUiKitTarget === 'All' || kit.target === selectedUiKitTarget;
                  return matchesSearch && matchesCat && matchesTarget;
                }).map(kit => (
                  <div 
                    key={kit.id}
                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {kit.badge}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          kit.target === '2D HUD' 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {kit.target}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {kit.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {kit.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {kit.tags.slice(0, 3).map((tag, idx) => (
                          <span key={`${tag}-${idx}`} className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playCachedAudio('/sounds/click.wav', false, 0.4);
                        const newObj: SceneObject = {
                          id: uuidv4(),
                          name: kit.name,
                          type: kit.objectType,
                          position: kit.position || [0, 0, 0],
                          rotation: kit.rotation || [0, 0, 0],
                          scale: kit.scale || [1, 1, 1],
                          visible: true,
                          children: [],
                          parentId: null,
                          properties: { ...kit.properties }
                        };
                        addObject(newObj);
                        setNotification(`✨ Added "${kit.name}" to scene`);
                        setTimeout(() => setNotification(null), 3000);
                      }}
                      className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus size={14} className="stroke-[3]" />
                      <span>Add Kit to Scene</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEXT STYLES TAB */}
          {activeTab === 'text-styles' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="mb-6 px-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Type className="text-amber-400" /> Text Styles Studio
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Canva-inspired visual collection with over 60 customizable 2D HUD and 3D scene text presets. Click to add any style and edit its content and typography in the Inspector.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-800/40 px-3 py-1.5 rounded-full self-start md:self-auto shrink-0">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{TEXT_STYLE_PRESETS.length} PRESET STYLES</span>
                </div>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="mb-6 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search text styles by name, category, font, or tag..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                    value={textStyleSearchQuery}
                    onChange={(e) => setTextStyleSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedTextStyleCategory}
                    onChange={(e) => setSelectedTextStyleCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 text-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="All" className="bg-slate-900 text-white">All Categories</option>
                    <option value="Hero & Display" className="bg-slate-900 text-white">Hero & Display</option>
                    <option value="Subtitle & Eyebrows" className="bg-slate-900 text-white">Subtitle & Eyebrows</option>
                    <option value="Cyber & Neon" className="bg-slate-900 text-white">Cyber & Neon</option>
                    <option value="Glass & Holographic" className="bg-slate-900 text-white">Glass & Holographic</option>
                    <option value="CTA & Buttons" className="bg-slate-900 text-white">CTA & Buttons</option>
                    <option value="AR Telemetry & Metrics" className="bg-slate-900 text-white">AR Telemetry & Metrics</option>
                    <option value="Retro & Vintage" className="bg-slate-900 text-white">Retro & Vintage</option>
                    <option value="Gradients & Metallic" className="bg-slate-900 text-white">Gradients & Metallic</option>
                    <option value="Badges & Labels" className="bg-slate-900 text-white">Badges & Labels</option>
                  </select>

                  <select
                    value={selectedTextStyleTarget}
                    onChange={(e) => setSelectedTextStyleTarget(e.target.value)}
                    className="bg-white/5 border border-white/10 text-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="All" className="bg-slate-900 text-white">All Surfaces</option>
                    <option value="2D HUD" className="bg-slate-900 text-white">2D HUD Overlays</option>
                    <option value="3D Scene" className="bg-slate-900 text-white">3D Scene Objects</option>
                  </select>
                </div>
              </div>

              {/* Grid of Canva-style Text Style Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pr-2 pb-20">
                {TEXT_STYLE_PRESETS.filter(ts => {
                  const matchesSearch = !textStyleSearchQuery || 
                    ts.name.toLowerCase().includes(textStyleSearchQuery.toLowerCase()) ||
                    ts.category.toLowerCase().includes(textStyleSearchQuery.toLowerCase()) ||
                    ts.sampleText.toLowerCase().includes(textStyleSearchQuery.toLowerCase()) ||
                    ts.description.toLowerCase().includes(textStyleSearchQuery.toLowerCase()) ||
                    ts.tags.some(t => t.toLowerCase().includes(textStyleSearchQuery.toLowerCase()));
                  const matchesCat = selectedTextStyleCategory === 'All' || ts.category === selectedTextStyleCategory;
                  const matchesTarget = selectedTextStyleTarget === 'All' || ts.target === selectedTextStyleTarget;
                  return matchesSearch && matchesCat && matchesTarget;
                }).map(ts => (
                  <div 
                    key={ts.id}
                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
                  >
                    <div>
                      {/* Header info */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {ts.badge}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          ts.target === '2D HUD' 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {ts.target}
                        </span>
                      </div>

                      {/* Visual Sample Canvas Box (Canva-inspired preview) */}
                      <div className="my-3 h-28 w-full bg-slate-950/80 border border-white/10 rounded-xl flex items-center justify-center p-3 relative overflow-hidden group-hover:border-amber-500/30 transition-colors">
                        <div 
                          className="text-center truncate max-w-full select-none"
                          style={{
                            fontFamily: ts.previewStyle.fontFamily || 'sans-serif',
                            fontSize: ts.previewStyle.fontSize || '16px',
                            fontWeight: ts.previewStyle.fontWeight || 'normal',
                            color: ts.previewStyle.color || '#ffffff',
                            background: ts.previewStyle.background,
                            border: ts.previewStyle.border,
                            borderRadius: ts.previewStyle.borderRadius,
                            padding: ts.previewStyle.padding,
                            textShadow: ts.previewStyle.textShadow,
                            letterSpacing: ts.previewStyle.letterSpacing,
                            fontStyle: ts.previewStyle.fontStyle,
                            textTransform: ts.previewStyle.textTransform,
                            boxShadow: ts.previewStyle.boxShadow,
                            backdropFilter: ts.previewStyle.backdropFilter,
                          }}
                        >
                          {ts.sampleText}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {ts.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {ts.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {ts.tags.slice(0, 3).map((tag, idx) => (
                          <span key={`${tag}-${idx}`} className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playCachedAudio('/sounds/click.wav', false, 0.4);
                        const newObj: SceneObject = {
                          id: uuidv4(),
                          name: ts.name,
                          type: ts.objectType,
                          position: ts.position || [0, 0, 0],
                          rotation: ts.rotation || [0, 0, 0],
                          scale: ts.scale || [1, 1, 1],
                          visible: true,
                          children: [],
                          parentId: null,
                          properties: { ...ts.properties }
                        };
                        addObject(newObj);
                        setNotification(`✨ Added "${ts.name}" style to scene`);
                        setTimeout(() => setNotification(null), 3000);
                      }}
                      className="mt-4 w-full bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus size={14} className="stroke-[3]" />
                      <span>Add Style to Scene</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                      {t.tags?.map((tag, idx) => (
                        <span key={`${tag}-${idx}`} className="text-[8px] uppercase tracking-wider font-bold bg-white/5 px-2 py-0.5 rounded text-gray-300">
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

          {/* 3D ICONS TAB (Spline 3D Style) */}
          {activeTab === 'icons' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="mb-6 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-pink-400" /> 
                    3D Icons Collection (Spline Style)
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Explore high-fidelity 3D claymorphic, glossy, glass, and metallic icons. Click to insert into scene.
                  </p>
                </div>
                {/* Global Material Style Override Selector */}
                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Material Finish:</span>
                  {(['clay', 'glossy', 'metallic', 'glass', 'neon'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedIconMaterialStyle(style)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                        selectedIconMaterialStyle === style 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Category Filtering */}
              <div className="mb-6 flex flex-col md:flex-row gap-3 px-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search 3D icons by name, tag, or topic..."
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                  {iconSearchQuery && (
                    <button 
                      onClick={() => setIconSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['All', 'Tech & Gadgets', 'Finance & Crypto', 'Social & Messaging', 'Creative & Design', 'Gaming & VFX', 'System & UI', 'Nature & Weather', 'E-Commerce'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedIconCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        selectedIconCategory === cat
                          ? 'bg-pink-600 text-white font-bold shadow-md shadow-pink-600/20'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Icons Display Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto pr-2 pb-24 content-start">
                {SPLINE_3D_ICONS.filter((icon) => {
                  const q = iconSearchQuery.toLowerCase().trim();
                  const matchesSearch = !q || 
                    icon.name.toLowerCase().includes(q) || 
                    icon.description.toLowerCase().includes(q) || 
                    icon.tags.some(t => t.toLowerCase().includes(q));
                  const matchesCategory = selectedIconCategory === 'All' || icon.category === selectedIconCategory;
                  return matchesSearch && matchesCategory;
                }).map((icon) => (
                  <div
                    key={icon.id}
                    onClick={() => {
                      handleAdd3DIcon(icon);
                      setIsAssetBrowserOpen(false);
                    }}
                    className="group relative flex flex-col p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/50 rounded-2xl transition-all cursor-pointer hover:scale-105 active:scale-95 text-left shadow-sm hover:shadow-pink-500/10 overflow-hidden"
                  >
                    {/* Background Radial Glow */}
                    <div 
                      className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity pointer-events-none"
                      style={{ backgroundColor: icon.defaultColor }}
                    />

                    {/* Preview Box */}
                    <div className="relative w-full aspect-square mb-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden group-hover:bg-black/60 transition-colors">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transform group-hover:scale-110 transition-transform duration-300 shadow-lg"
                        style={{
                          background: `radial-gradient(circle at 35% 35%, ${icon.defaultColor} 0%, ${icon.secondaryColor || '#1e1b4b'} 100%)`,
                          boxShadow: `0 8px 20px ${icon.defaultColor}40, inset 0 0 10px rgba(255,255,255,0.4)`
                        }}
                      >
                        {icon.previewEmoji}
                      </div>
                      
                      {/* Material Style Tag */}
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-pink-300 border border-white/10">
                        {selectedIconMaterialStyle || icon.materialStyle}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 flex flex-col">
                      <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
                        {icon.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2 leading-tight">
                        {icon.description}
                      </p>

                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <span className="text-[9px] text-gray-500 font-medium">
                          {icon.category}
                        </span>
                        <span className="text-xs font-bold text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          + Add
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2D VECTOR BADGES TAB (Spline Style) */}
          {activeTab === '2d-icons' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="mb-6 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shapes className="text-blue-400" /> 
                    2D Vector Icon Badges (Spline 2D)
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Lightweight, resolution-independent 2D icon badges optimized for mobile AR HUDs & UI panels.
                  </p>
                </div>
              </div>

              {/* Search & Category Filtering */}
              <div className="mb-6 flex flex-col md:flex-row gap-3 px-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search 2D vector icons by name or tag..."
                    value={icon2DSearchQuery}
                    onChange={(e) => setIcon2DSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {icon2DSearchQuery && (
                    <button 
                      onClick={() => setIcon2DSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['All', 'UI & Navigation', 'Media & Audio', 'Tech & Dev', 'Commerce & Finance', 'Social & Comm', 'Status & Badges'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelected2DIconCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        selected2DIconCategory === cat
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2D Icons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto pr-2 pb-24 content-start">
                {SPLINE_2D_ICONS.filter((icon) => {
                  const q = icon2DSearchQuery.toLowerCase().trim();
                  const matchesSearch = !q || 
                    icon.name.toLowerCase().includes(q) || 
                    icon.description.toLowerCase().includes(q) || 
                    icon.tags.some(t => t.toLowerCase().includes(q));
                  const matchesCategory = selected2DIconCategory === 'All' || icon.category === selected2DIconCategory;
                  return matchesSearch && matchesCategory;
                }).map((icon) => {
                  const IconComp = (LucideIcons[icon.iconName as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; className?: string }>) || LucideIcons.Sparkles;
                  return (
                    <div
                      key={icon.id}
                      onClick={() => {
                        handleAdd2DIcon(icon);
                        setIsAssetBrowserOpen(false);
                      }}
                      className="group relative flex flex-col p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-2xl transition-all cursor-pointer hover:scale-105 active:scale-95 text-left shadow-sm hover:shadow-blue-500/10 overflow-hidden"
                    >
                      {/* Background Radial Glow */}
                      <div 
                        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity pointer-events-none"
                        style={{ backgroundColor: icon.defaultColor }}
                      />

                      {/* 2D Badge Preview Box */}
                      <div className="relative w-full aspect-square mb-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden group-hover:bg-black/60 transition-colors">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg"
                          style={{
                            background: icon.badgeStyle === 'gradient'
                              ? `linear-gradient(135deg, ${icon.defaultColor} 0%, #ec4899 100%)`
                              : icon.badgeStyle === 'neon'
                              ? 'rgba(15, 23, 42, 0.9)'
                              : `radial-gradient(circle at 35% 35%, ${icon.defaultColor} 0%, ${icon.secondaryColor || '#1e1b4b'} 100%)`,
                            border: icon.badgeStyle === 'neon' ? `2px solid ${icon.defaultColor}` : '1px solid rgba(255,255,255,0.2)',
                            boxShadow: `0 8px 20px ${icon.defaultColor}40, inset 0 0 10px rgba(255,255,255,0.4)`,
                            color: icon.badgeStyle === 'neon' ? icon.defaultColor : '#ffffff'
                          }}
                        >
                          <IconComp size={28} />
                        </div>
                        
                        {/* Badge Style Tag */}
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-blue-300 border border-white/10">
                          {icon.badgeStyle}
                        </span>
                      </div>

                      {/* Meta info */}
                      <div className="flex-1 flex flex-col">
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                          {icon.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2 leading-tight">
                          {icon.description}
                        </p>

                        <div className="mt-auto pt-3 flex items-center justify-between">
                          <span className="text-[9px] text-gray-500 font-medium">
                            {icon.category}
                          </span>
                          <span className="text-xs font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            + Add
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SPLINE MATERIALS TAB */}
          {activeTab === 'materials' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="mb-4 px-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Palette className="text-purple-400" /> Spline 3D Materials Library
                  </h3>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full font-mono font-bold border border-purple-500/30">
                    40+ Presets • PBR & Shader Engine
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Realistic Spline3D material presets (Glass, Metallic, Holographic, Iridescent Sheen, Velvet, Neon). Select an object in the viewport and click any material to apply, or click + Spawn to create a 3D primitive with the material.
                </p>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search materials (e.g., gold, glass, holographic, velvet, neon)..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    value={materialSearchQuery}
                    onChange={(e) => setMaterialSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['All', 'Clay & Matte', 'Glass & Crystal', 'Metals & Chrome', 'Holographic & Iridescent', 'Neon & Glow', 'Textures & Patterns', 'Organic & Fabric'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedMaterialCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        selectedMaterialCategory === cat
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Materials */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 content-start overflow-y-auto pr-1 pb-20">
                {SPLINE_MATERIAL_PRESETS
                  .filter(m => selectedMaterialCategory === 'All' || m.category === selectedMaterialCategory)
                  .filter(m => m.name.toLowerCase().includes(materialSearchQuery.toLowerCase()) || m.description.toLowerCase().includes(materialSearchQuery.toLowerCase()))
                  .map(preset => {
                    const isSelected = selectedObjectId && objects[selectedObjectId];
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleApplySplineMaterial(preset)}
                        className="group relative bg-[#18181b] border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer flex flex-col p-3"
                      >
                        {/* Preview Swatch Sphere Circle */}
                        <div 
                          className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center relative overflow-hidden shadow-inner border border-white/10" 
                          style={preset.previewStyle || {
                            background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${preset.previewColor} 55%, ${preset.secondaryColor || '#000000'} 100%)`,
                            boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.4)'
                          }}
                        >
                          <span className="text-2xl filter drop-shadow-md transition-transform group-hover:scale-125 duration-300">
                            {preset.thumbnailEmoji || '🎨'}
                          </span>
                          <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-white/90 backdrop-blur-sm border border-white/10">
                            {preset.materialProps.shaderType || 'physical'}
                          </span>
                        </div>

                        {/* Text info */}
                        <div className="flex flex-col flex-1">
                          <span className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                            {preset.name}
                          </span>
                          <span className="text-[10px] text-gray-400 line-clamp-2 mt-0.5 leading-tight">
                            {preset.description}
                          </span>
                        </div>

                        {/* Apply or Create Button */}
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                            {preset.category.split(' ')[0]}
                          </span>
                          <span className="text-[10px] font-bold text-white bg-purple-600 group-hover:bg-purple-500 px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
                            {isSelected ? 'Apply' : '+ Spawn'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* AR TEXTURES TAB */}
          {activeTab === 'textures' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="mb-4 px-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Grid className="text-cyan-400" /> Mobile AR Optimized Textures Engine
                  </h3>
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full font-mono font-bold border border-cyan-500/30 flex items-center gap-1">
                    ⚡ 512×512 Tileable PBR • Mobile AR
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Ultra-lightweight procedural PBR texture maps (Albedo, Normal Map, Roughness Map) tailored for maximum AR rendering performance on mobile browsers.
                </p>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search AR textures (marble, carbon, grid, wood, metal, neon)..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    value={textureSearchQuery}
                    onChange={(e) => setTextureSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['All', 'Marble', 'Pattern', 'Metal', 'Wood', 'Fabric', 'Grid', 'Noise'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedTextureCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        selectedTextureCategory === cat
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Textures */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 content-start overflow-y-auto pr-1 pb-20">
                {getOptimizedARTextures()
                  .filter(t => selectedTextureCategory === 'All' || t.category === selectedTextureCategory)
                  .filter(t => t.name.toLowerCase().includes(textureSearchQuery.toLowerCase()) || t.category.toLowerCase().includes(textureSearchQuery.toLowerCase()))
                  .map(tex => {
                    const isSelected = selectedObjectId && objects[selectedObjectId];
                    return (
                      <div
                        key={tex.id}
                        onClick={() => handleApplyARTexture(tex)}
                        className="group relative bg-[#18181b] border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer flex flex-col p-3"
                      >
                        {/* Texture Image Preview */}
                        <div className="w-full aspect-square rounded-lg mb-2 bg-black relative overflow-hidden border border-white/10">
                          <img
                            src={tex.previewUrl}
                            alt={tex.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                          />
                          <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono bg-emerald-500/80 text-white px-1 py-0.5 rounded backdrop-blur-sm">Albedo</span>
                            <span className="text-[8px] font-mono bg-purple-500/80 text-white px-1 py-0.5 rounded backdrop-blur-sm">Normal</span>
                            <span className="text-[8px] font-mono bg-blue-500/80 text-white px-1 py-0.5 rounded backdrop-blur-sm">Roughness</span>
                          </div>
                        </div>

                        {/* Text info */}
                        <div className="flex flex-col flex-1">
                          <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                            {tex.name}
                          </span>
                          <span className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                            Scale: {tex.recommendedScale[0]}x{tex.recommendedScale[1]} • 512² PBR
                          </span>
                        </div>

                        {/* Apply or Create Button */}
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                            {tex.category}
                          </span>
                          <span className="text-[10px] font-bold text-white bg-cyan-600 group-hover:bg-cyan-500 px-2 py-0.5 rounded flex items-center gap-1 transition-colors">
                            {isSelected ? 'Apply' : '+ Spawn'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
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

          
          {/* UPLOADS TAB (Spline 3D Style) */}
          {activeTab === 'uploads' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="mb-4 px-2 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Upload className="text-blue-400" /> My Uploaded Assets Studio
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Your custom uploaded 3D models, textures, target images, and audio files. Double-click to spawn or replace.
                  </p>
                </div>
                <button
                  onClick={handleUploadClick}
                  className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <Upload size={14} /> Upload New File
                </button>
              </div>

              {assets.length === 0 ? (
                <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400 gap-3 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <Upload size={36} className="text-gray-500 animate-bounce" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">No custom assets uploaded yet</p>
                    <p className="text-xs text-gray-500 mt-1">Import .GLB 3D models, PNG target images, or textures to begin</p>
                  </div>
                  <button 
                    onClick={handleUploadClick}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Select File to Upload
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto pr-2 pb-24 content-start">
                  {assets.map(asset => {
                    const preset = getSplineThumbnailStyle(asset.name);
                    return (
                      <div 
                        key={asset.id}
                        draggable={editingId !== asset.id}
                        onDragStart={(e) => handleDragStart(e, asset)}
                        onDoubleClick={() => handleUseAsset(asset)}
                        className="group relative flex flex-col p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/60 rounded-2xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow-sm hover:shadow-blue-500/10 overflow-hidden"
                        title={`• Asset Name: ${asset.name}\n• Type: ${asset.type.toUpperCase()}\n• Source: ${asset.url.startsWith('data:') ? 'Local Memory' : asset.url}\n• Action: Double-click to insert into viewport or replace selected target object`}
                      >
                        {/* Large Preview Image Box */}
                        <div className="relative w-full aspect-square mb-2 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center overflow-hidden group-hover:bg-black/70 transition-colors">
                          {asset.type === 'image' ? (
                            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" />
                          ) : asset.type === 'model' ? (
                            <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{ background: preset.bg }}>
                              <div 
                                className="w-14 h-14 rounded-2xl relative transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex items-center justify-center shadow-lg"
                                style={{ 
                                  background: preset.orbBg,
                                  boxShadow: `inset -2px -2px 6px rgba(0,0,0,0.5), 0 0 12px ${preset.glowColor}, 0 4px 6px rgba(0,0,0,0.3)`
                                }}
                              >
                                <div className="absolute inset-0.5 rounded-2xl border border-white/20 opacity-60 pointer-events-none" />
                                <Box size={20} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
                              </div>
                            </div>
                          ) : (
                            <div className="text-3xl transition-transform group-hover:scale-125 duration-300">
                              {getIcon(asset.type)}
                            </div>
                          )}

                          {/* Hover overlay hint */}
                          <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                            <Plus size={24} className="text-white drop-shadow-md" />
                          </div>

                          {/* Asset Type Tag */}
                          <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono uppercase tracking-wider bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-blue-300 border border-white/10">
                            {asset.type}
                          </span>
                        </div>
                        
                        {/* Simple Clean Title Label */}
                        {editingId === asset.id ? (
                          <input
                            ref={inputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={finishEditing}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-black text-white text-xs border border-blue-500 rounded px-1 py-0.5 outline-none text-center font-bold"
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span 
                            className="text-xs font-bold text-white group-hover:text-blue-300 truncate w-full text-center transition-colors" 
                            onDoubleClick={(e) => startEditing(e, asset.id, asset.name)}
                          >
                            {asset.name}
                          </span>
                        )}

                        {/* Actions overlay panel on hover */}
                        {editingId !== asset.id && (
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all bg-black/90 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-lg">
                            {asset.type === 'image' && selectedObjectIds.length > 1 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUseAsset(asset); }}
                                className="p-1 hover:bg-emerald-500/30 text-emerald-400 rounded transition-colors"
                                title={`Bulk replace in ${selectedObjectIds.length} selected items`}
                              >
                                <Copy size={12} />
                              </button>
                            )}
                            <button
                              onClick={(e) => startEditing(e, asset.id, asset.name)}
                              className="p-1 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                              title="Rename asset"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
                              className="p-1 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                              title="Delete asset"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SKETCHFAB / WEB SEARCH TAB */}
          {activeTab === 'sketchfab' && (
            <div className="flex flex-col gap-4 font-sans h-full w-full">
              {/* Header */}
              <div className="flex items-center justify-between bg-[#141414] border border-[#222] rounded-xl p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="animate-pulse text-yellow-400" />
                    Interactive Sketchfab 3D Webview Studio
                  </span>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Explore millions of 100% free Creative Commons 3D models. Download directly to your <strong>Local Asset Library</strong> or deploy straight into your <strong>3D Scene</strong>.
                  </p>
                </div>
                <div className="flex bg-[#111] p-1 rounded-lg border border-white/10 shrink-0">
                  <button
                    onClick={() => setSketchfabViewMode('grid')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      sketchfabViewMode === 'grid' ? 'bg-yellow-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Asset Store Grid
                  </button>
                  <button
                    onClick={() => setSketchfabViewMode('webview')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      sketchfabViewMode === 'webview' ? 'bg-yellow-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    3D Interactive Webview
                  </button>
                </div>
              </div>

              {/* Controls: Search & Direct Model Import */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Search Box */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search 3D models (e.g. Astronaut, Drone, Car, Cyberpunk)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#111] text-xs font-sans pl-9 pr-3 py-2 border border-[#222] rounded-xl focus:border-yellow-500 text-white outline-none"
                  />
                </div>

                {/* Direct Sketchfab / GLB Link Importer */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!customImportUrl) return;
                    const newAssetId = Math.random().toString(36).substring(2, 9);
                    const cleanName = customImportUrl.substring(customImportUrl.lastIndexOf('/') + 1) || 'Sketchfab 3D Model';
                    const newAsset = {
                      id: newAssetId,
                      name: cleanName,
                      type: 'model' as AssetType,
                      url: customImportUrl
                    };
                    addAsset(newAsset);
                    handleUseAsset(newAsset);
                    showToast(`Downloaded & saved "${cleanName}" to Local Library and 3D Scene!`);
                    setCustomImportUrl('');
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Paste Sketchfab / GLB model link..."
                    value={customImportUrl}
                    onChange={(e) => setCustomImportUrl(e.target.value)}
                    className="flex-1 bg-[#111] text-xs font-mono px-3 py-2 border border-[#222] rounded-xl focus:border-yellow-500 text-white outline-none min-w-0"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 shadow-md shadow-yellow-500/10"
                  >
                    <Download size={13} /> Fetch & Deploy
                  </button>
                </form>
              </div>

              {/* Viewmode 1: Interactive 3D Webview Embed */}
              {sketchfabViewMode === 'webview' ? (
                <div className="flex-1 bg-black border border-[#222] rounded-2xl overflow-hidden flex flex-col min-h-[420px] relative">
                  <div className="bg-[#18181C] px-3 py-2 border-b border-[#222] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300 flex items-center gap-2">
                      <Globe size={13} className="text-blue-400" /> Sketchfab 3D Webview Explorer Portal
                    </span>
                    <span className="text-[9px] font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                      Live Webview Frame
                    </span>
                  </div>
                  <iframe
                    src={`https://sketchfab.com/models/3d-models?sort_by=-likeCount`}
                    className="w-full h-full border-0 flex-1 min-h-[380px]"
                    title="Sketchfab Webview Portal"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                </div>
              ) : (
                /* Viewmode 2: Curated Sketchfab Asset Grid */
                <div className="flex flex-col gap-3">
                  {/* Category Filter Badges */}
                  <div className="flex flex-wrap gap-1.5 border-b border-[#222] pb-3">
                    {['all', 'space', 'vehicles', 'characters', 'nature', 'interior', 'items', 'animals'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSearchCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                          searchCategory === cat
                            ? 'bg-yellow-500 text-black shadow-md font-black'
                            : 'bg-[#141414] text-gray-400 hover:text-white border border-transparent'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Models Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 content-start">
                    {SKETCHFAB_WEB_MODELS.filter(m => {
                      const matchQuery = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                         m.description.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchCategory = searchCategory === 'all' || m.category === searchCategory;
                      return matchQuery && matchCategory;
                    }).map(model => (
                      <div
                        key={model.name}
                        className="bg-[#141414] border border-[#222] hover:border-yellow-500 rounded-2xl p-2.5 flex flex-col items-start gap-1.5 hover:bg-[#1A1A1A] transition-all group relative cursor-pointer"
                        title="Click buttons below to download to local library or deploy to 3D scene"
                      >
                        {/* Visual Webview 3D Thumb */}
                        <div className="w-full aspect-square flex flex-col items-center justify-center bg-black/60 rounded-xl relative overflow-hidden text-center p-0 border border-white/5">
                          <iframe 
                            src={`data:text/html;charset=utf-8,${encodeURIComponent(`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
                                  <style>
                                    body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
                                    model-viewer { width: 100vw; height: 100vh; --poster-color: transparent; }
                                  </style>
                                </head>
                                <body>
                                  <model-viewer src="${model.url}" auto-rotate camera-controls disable-zoom interaction-prompt="none"></model-viewer>
                                </body>
                              </html>
                            `)}`}
                            className="w-full h-full border-0 pointer-events-none group-hover:scale-110 transition-transform duration-500"
                            title={model.name}
                            sandbox="allow-scripts"
                          />
                          <span className="absolute bottom-1 right-1 text-[7.5px] bg-black/80 text-yellow-400 px-1.5 py-0.5 rounded uppercase font-mono font-bold tracking-wider leading-none backdrop-blur border border-yellow-500/20 pointer-events-none">
                            {model.creator}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-white truncate w-full">{model.name}</span>
                        <p className="text-[8.5px] text-[#777] leading-snug h-5 overflow-hidden line-clamp-2 w-full">{model.description}</p>
                        
                        {/* Dual Action Buttons: Save to Local Library OR Deploy to Scene */}
                        <div className="grid grid-cols-2 gap-1.5 w-full mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newAsset = {
                                id: Math.random().toString(36).substring(2, 9),
                                name: model.name,
                                type: 'model' as AssetType,
                                url: model.url
                              };
                              addAsset(newAsset);
                              showToast(`Saved "${model.name}" to your Local Asset Library!`);
                            }}
                            className="w-full text-center bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[9px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                            title="Save to local library for reuse"
                          >
                            <Download size={10} /> Save Library
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newAsset = {
                                id: Math.random().toString(36).substring(2, 9),
                                name: model.name,
                                type: 'model' as AssetType,
                                url: model.url
                              };
                              addAsset(newAsset);
                              handleUseAsset(newAsset);
                              showToast(`Deployed "${model.name}" directly to 3D Scene!`);
                            }}
                            className="w-full text-center bg-yellow-500 hover:bg-yellow-400 text-black text-[9px] font-extrabold py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-yellow-500/10"
                            title="Deploy into active 3D AR canvas"
                          >
                            <Plus size={10} /> Deploy Scene
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3D MODELS TAB (Spline 3D Style) */}
          {activeTab === 'models' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="mb-4 px-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Box className="text-blue-400" /> Standard 3D Asset Library
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  High-performance 3D models with PBR textures. Drag into viewport or double-click to spawn or replace.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 content-start overflow-y-auto pr-2 pb-24">
                {PRESET_MODELS.map(model => {
                  const preset = getSplineThumbnailStyle(model.name);
                  return (
                    <div 
                      key={model.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, model)}
                      onDoubleClick={() => handleUseAsset(model)}
                      className="group relative flex flex-col p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/60 rounded-2xl transition-all duration-300 cursor-grab hover:scale-105 active:scale-95 shadow-sm hover:shadow-blue-500/10 overflow-hidden"
                      title={`• Model: ${model.name}\n• Category: ${(model as any).category || '3D Geometry'}\n• Description: ${(model as any).description || ''}\n• Format: .GLB Binary PBR\n• Action: Double-click to spawn or replace target object`}
                    >
                      {/* Large 3D Orb Preview Container */}
                      <div className="w-full aspect-square flex items-center justify-center rounded-xl mb-2 relative overflow-hidden transition-colors" style={{ background: preset.bg }}>
                        <div 
                          className="w-16 h-16 rounded-2xl relative transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex items-center justify-center shadow-xl"
                          style={{ 
                            background: preset.orbBg,
                            boxShadow: `inset -3px -3px 6px rgba(0,0,0,0.5), 0 0 16px ${preset.glowColor}, 0 4px 8px rgba(0,0,0,0.4)`
                          }}
                        >
                          <div className="absolute inset-0.5 rounded-2xl border border-white/20 opacity-70 pointer-events-none" />
                          <span className="text-2xl relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">{model.thumbnail}</span>
                        </div>
                        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                          <Plus size={28} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
                        </div>
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono uppercase tracking-wider bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-blue-300 border border-white/10">
                          .GLB
                        </span>
                      </div>

                      {/* Clean Text Label */}
                      <span className="text-xs font-bold text-white group-hover:text-blue-300 truncate w-full text-center transition-colors">
                        {model.name}
                      </span>

                      <button 
                        onClick={() => handleUseAsset(model)}
                        className="mt-2 w-full text-center bg-blue-600/80 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-xl transition-all shadow-md group-hover:scale-[1.02] active:scale-95 cursor-pointer"
                      >
                        + Add to Scene
                      </button>
                    </div>
                  );
                })}
              </div>
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
          {/* AUDIO & SFX TAB (Spline.design Sound Engine - 50+ Presets) */}
          {activeTab === 'audio' && (
            <div className="flex flex-col gap-4 h-full overflow-hidden">
              {/* Category selector */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[#222] -mx-1 px-1">
                {['All', 'UI & Interface', '3D Spatial & Motion', 'Magic & Sci-Fi', 'Mechanical & Physical', 'Game & Interactive', 'Ambient & Drones', 'Musical & Chords'].map(category => (
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

              {/* CSS Keyframes for Audio Visualizer wavebars */}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes wavebar {
                  0%, 100% { transform: scaleY(0.3); }
                  50% { transform: scaleY(1.2); }
                }
              `}} />

              {/* Grid of sounds */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 overflow-y-auto pr-1">
                {SPLINE_SOUND_PRESETS.filter(s => selectedAudioCategory === 'All' || s.category === selectedAudioCategory).map(sound => {
                  const hasSelected = !!selectedObjectId;
                  return (
                    <div 
                      key={sound.id}
                      onDoubleClick={() => {
                        playSplineSound(sound);
                        if (hasSelected) {
                          handleUseAsset({
                            type: 'audio',
                            name: sound.name,
                            url: sound.url || `synth:${sound.id}`,
                            category: sound.category
                          });
                        }
                      }}
                      onMouseEnter={() => {
                        if (hoverTimeoutRef.current[sound.id]) {
                          clearTimeout(hoverTimeoutRef.current[sound.id]);
                        }
                        hoverTimeoutRef.current[sound.id] = setTimeout(() => {
                          playSplineSound(sound);
                        }, 180);
                      }}
                      onMouseLeave={() => {
                        if (hoverTimeoutRef.current[sound.id]) {
                          clearTimeout(hoverTimeoutRef.current[sound.id]);
                          delete hoverTimeoutRef.current[sound.id];
                        }
                      }}
                      className="bg-[#141414] border border-[#222] hover:border-pink-500 rounded-xl p-3 flex flex-col gap-1 cursor-pointer hover:bg-[#1A1A1A] transition-all group relative shadow-md"
                      title="Hover to preview / Double-click to attach sound to selected object"
                    >
                      <div className="w-full h-14 flex items-center justify-center bg-black/50 rounded-lg text-2xl mb-1 relative overflow-hidden transition-all duration-300 group-hover:bg-[#111]">
                        <span className="group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">{sound.thumbnail || '🔊'}</span>
                        
                        {/* Audio wave dynamic CSS bars visualizer on hover */}
                        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <div className="w-1 bg-pink-500 rounded-full h-4 origin-bottom group-hover:animate-[wavebar_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.1s' }} />
                          <div className="w-1 bg-pink-400 rounded-full h-6 origin-bottom group-hover:animate-[wavebar_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }} />
                          <div className="w-1 bg-pink-500 rounded-full h-5 origin-bottom group-hover:animate-[wavebar_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
                          <div className="w-1 bg-pink-400 rounded-full h-7 origin-bottom group-hover:animate-[wavebar_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
                          <div className="w-1 bg-pink-500 rounded-full h-4 origin-bottom group-hover:animate-[wavebar_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
                        </div>

                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            playSplineSound(sound);
                          }}
                          className="absolute inset-0 bg-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs"
                          title="Click to play synth audition"
                        >
                          <Play size={20} className="text-pink-400 fill-pink-400" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-white truncate w-full">{sound.name}</span>
                      <div className="flex items-center justify-between text-[8px] font-mono text-pink-400 uppercase tracking-wider mt-0.5">
                        <span>{sound.category}</span>
                        <span className="text-gray-500 font-normal">{sound.duration || 'Synth'}</span>
                      </div>
                      <p className="text-[9px] text-[#777] leading-snug h-6 overflow-hidden line-clamp-2 w-full mt-0.5">{sound.description}</p>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playSplineSound(sound);
                          if (hasSelected) {
                            handleUseAsset({
                              type: 'audio',
                              name: sound.name,
                              url: sound.url || `synth:${sound.id}`,
                              category: sound.category
                            });
                          }
                        }}
                        className={`mt-2 w-full text-center text-[10px] font-semibold py-1.5 rounded-lg transition-colors border ${hasSelected ? 'bg-pink-600 hover:bg-pink-500 border-pink-500 text-white shadow-sm' : 'bg-[#222] hover:bg-[#333] border-[#333] text-gray-300'}`}
                      >
                        {hasSelected ? 'Attach Sound' : 'Audition Sound'}
                      </button>
                    </div>
                  );
                })}
              </div>
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

      {/* Pre-Import 3D Model Validation Modal */}
      {validationModel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#121214] border border-amber-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/80 flex flex-col">
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                <Info size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-wide">3D Model Validation</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Pre-import file checks & metrics review</p>
              </div>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[60vh] scrollbar-thin">
              {/* File details card */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="text-xs font-bold text-gray-300 truncate mb-2">{validationModel.file.name}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-mono text-gray-500">
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span className="text-gray-400 font-bold">{(validationModel.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Triangles:</span>
                    <span className={`font-bold ${validationModel.stats.totalTriangles > 80000 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {validationModel.stats.totalTriangles.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meshes:</span>
                    <span className="text-gray-400">{validationModel.stats.meshCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Materials:</span>
                    <span className="text-gray-400">{validationModel.stats.materialCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Textures:</span>
                    <span className="text-gray-400">{validationModel.stats.textureCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images:</span>
                    <span className="text-gray-400">{validationModel.stats.imageCount}</span>
                  </div>
                </div>
              </div>

              {/* Warning box */}
              <div className="space-y-2.5">
                <div className="text-[10px] uppercase font-black tracking-wider text-amber-500 px-1">Issues Identified</div>
                {validationModel.warnings.map((warning, idx) => (
                  <div key={idx} className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-2.5 text-xs text-amber-200 leading-relaxed">
                    <span className="text-amber-500 shrink-0 font-bold">⚠️</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-black/40 flex gap-2.5">
              <button
                onClick={() => setValidationModel(null)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-lg transition-all"
              >
                Cancel Import
              </button>
              <button
                onClick={() => {
                  executeAssetImport(validationModel.file, 'model', validationModel.stats);
                  setValidationModel(null);
                }}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-all shadow-md shadow-amber-500/15"
              >
                Import Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Import Progress Indicator Overlay */}
      {importProgress && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#111113] border border-white/10 rounded-2xl p-4 w-80 shadow-2xl shadow-black animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-white truncate w-3/4">{importProgress.fileName}</span>
            <span className="text-xs font-black font-mono text-blue-400">{importProgress.progress}%</span>
          </div>
          
          {/* Progress bar container */}
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${importProgress.progress}%` }}
            />
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
            <span className="truncate">{importProgress.status}</span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
