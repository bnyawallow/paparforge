import { SceneObject } from '../types';

export interface SplineMaterialPreset {
  id: string;
  name: string;
  category: 'Clay & Matte' | 'Glass & Crystal' | 'Metals & Chrome' | 'Holographic & Iridescent' | 'Neon & Glow' | 'Textures & Patterns' | 'Organic & Fabric';
  previewColor: string;
  secondaryColor?: string;
  thumbnailEmoji?: string;
  previewStyle?: React.CSSProperties;
  description: string;
  materialProps: {
    shaderType?: 'standard' | 'physical' | 'toon' | 'basic' | 'normal';
    color: string;
    roughness: number;
    metalness?: number;
    opacity?: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
    transmission?: number;
    thickness?: number;
    ior?: number;
    emissiveColor?: string;
    emissiveIntensity?: number;
    iridescence?: number;
    iridescenceIOR?: number;
    iridescenceThicknessRange?: [number, number];
    sheen?: number;
    sheenColor?: string;
    sheenRoughness?: number;
    attenuationColor?: string;
    attenuationDistance?: number;
    textureUrl?: string;
    normalMapUrl?: string;
    roughnessMapUrl?: string;
    metalnessMapUrl?: string;
    textureRepeatX?: number;
    textureRepeatY?: number;
    wireframe?: boolean;
    flatShading?: boolean;
  };
}

// --------------------------------------------------
// PROCEDURAL CANVAS AR TEXTURE GENERATOR
// Mobile-optimized, ultra lightweight 512x512 tileable maps
// --------------------------------------------------
export interface GeneratedARTexture {
  id: string;
  name: string;
  category: 'Marble' | 'Pattern' | 'Metal' | 'Wood' | 'Fabric' | 'Grid' | 'Noise';
  description: string;
  previewUrl: string; // Albedo map
  normalMapUrl: string; // Normal map
  roughnessMapUrl: string; // Roughness map
  recommendedScale: [number, number];
}

const textureCache: Record<string, GeneratedARTexture> = {};

export function generateARTexture(
  id: string,
  name: string,
  category: GeneratedARTexture['category'],
  description: string,
  drawPattern: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  drawNormal?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  drawRoughness?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  repeatScale: [number, number] = [2, 2]
): GeneratedARTexture {
  if (textureCache[id]) return textureCache[id];

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return {
      id,
      name,
      category,
      description,
      previewUrl: '',
      normalMapUrl: '',
      roughnessMapUrl: '',
      recommendedScale: repeatScale,
    };
  }

  // Draw Albedo (Color Map)
  drawPattern(ctx, size, size);
  const previewUrl = canvas.toDataURL('image/png');

  // Draw Normal Map (default bluish neutral normal map if unspecified)
  ctx.clearRect(0, 0, size, size);
  if (drawNormal) {
    drawNormal(ctx, size, size);
  } else {
    ctx.fillStyle = 'rgb(128, 128, 255)'; // Neutral tangent-space normal (0.5, 0.5, 1.0)
    ctx.fillRect(0, 0, size, size);
  }
  const normalMapUrl = canvas.toDataURL('image/png');

  // Draw Roughness Map (default gray if unspecified)
  ctx.clearRect(0, 0, size, size);
  if (drawRoughness) {
    drawRoughness(ctx, size, size);
  } else {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);
  }
  const roughnessMapUrl = canvas.toDataURL('image/png');

  const tex: GeneratedARTexture = {
    id,
    name,
    category,
    description,
    previewUrl,
    normalMapUrl,
    roughnessMapUrl,
    recommendedScale: repeatScale,
  };

  textureCache[id] = tex;
  return tex;
}

// Pre-built Procedural AR Texture Collection
export function getOptimizedARTextures(): GeneratedARTexture[] {
  return [
    // 1. Terrazzo Marble
    generateARTexture(
      'terrazzo_marble',
      'Terrazzo Marble',
      'Marble',
      'Classic white stone terrazzo with speckled coral, teal, and slate flakes',
      (ctx, w, h) => {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, w, h);
        const colors = ['#f43f5e', '#0d9488', '#64748b', '#fbbf24', '#3b82f6'];
        for (let i = 0; i < 400; i++) {
          const x = (Math.sin(i * 12.3) * 0.5 + 0.5) * w;
          const y = (Math.sin(i * 45.6) * 0.5 + 0.5) * h;
          const r = 2 + (Math.sin(i * 7.8) * 0.5 + 0.5) * 8;
          ctx.fillStyle = colors[i % colors.length];
          ctx.beginPath();
          ctx.ellipse(x, y, r, r * 0.6, i * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      (ctx, w, h) => {
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 400; i++) {
          const x = (Math.sin(i * 12.3) * 0.5 + 0.5) * w;
          const y = (Math.sin(i * 45.6) * 0.5 + 0.5) * h;
          const r = 2 + (Math.sin(i * 7.8) * 0.5 + 0.5) * 8;
          ctx.fillStyle = 'rgb(160, 100, 240)';
          ctx.beginPath();
          ctx.ellipse(x, y, r + 1, (r + 1) * 0.6, i * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      (ctx, w, h) => {
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, w, h);
      },
      [3, 3]
    ),

    // 2. Carbon Fiber Hex Grid
    generateARTexture(
      'carbon_fiber',
      'Carbon Fiber Weave',
      'Pattern',
      'High-tech diagonal carbon fiber weave texture for racing & sci-fi assets',
      (ctx, w, h) => {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, w, h);
        const tileSize = 32;
        for (let y = 0; y < h; y += tileSize) {
          for (let x = 0; x < w; x += tileSize) {
            const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
            ctx.fillStyle = isAlt ? '#1f2937' : '#374151';
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.fillStyle = isAlt ? '#374151' : '#111827';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + tileSize, y + tileSize);
            ctx.lineTo(x, y + tileSize);
            ctx.fill();
          }
        }
      },
      (ctx, w, h) => {
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, w, h);
        const tileSize = 32;
        for (let y = 0; y < h; y += tileSize) {
          for (let x = 0; x < w; x += tileSize) {
            ctx.fillStyle = ((x / tileSize) + (y / tileSize)) % 2 === 0 ? 'rgb(140, 110, 255)' : 'rgb(110, 140, 255)';
            ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
          }
        }
      },
      (ctx, w, h) => {
        ctx.fillStyle = '#444444';
        ctx.fillRect(0, 0, w, h);
      },
      [4, 4]
    ),

    // 3. Cyber Grid Lines
    generateARTexture(
      'cyber_grid',
      'Neon Cyber Grid',
      'Grid',
      'Luminous isometric grid lines over dark matte canvas',
      (ctx, w, h) => {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        const step = 64;
        for (let x = 0; x <= w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y <= h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      },
      undefined,
      (ctx, w, h) => {
        ctx.fillStyle = '#222222';
        ctx.fillRect(0, 0, w, h);
      },
      [2, 2]
    ),

    // 4. Wood Grain Timber
    generateARTexture(
      'wood_grain',
      'Scandinavian Timber',
      'Wood',
      'Warm natural wooden planks with organic grain lines',
      (ctx, w, h) => {
        ctx.fillStyle = '#d97706';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#b45309';
        for (let y = 0; y < h; y += 4) {
          const wave = Math.sin(y * 0.05) * 15;
          ctx.fillRect(0, y + wave, w, 2);
        }
      },
      (ctx, w, h) => {
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 4) {
          const wave = Math.sin(y * 0.05) * 15;
          ctx.fillStyle = 'rgb(150, 128, 240)';
          ctx.fillRect(0, y + wave, w, 2);
        }
      },
      (ctx, w, h) => {
        ctx.fillStyle = '#888888';
        ctx.fillRect(0, 0, w, h);
      },
      [2, 2]
    ),

    // 5. Brushed Metal Lines
    generateARTexture(
      'brushed_metal',
      'Brushed Titanium Steel',
      'Metal',
      'Fine micro-directional brushed streaks for industrial metallic finishes',
      (ctx, w, h) => {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 2) {
          const noise = Math.sin(y * 85.3) * 20;
          ctx.fillStyle = noise > 0 ? '#cbd5e1' : '#64748b';
          ctx.fillRect(0, y, w, 1);
        }
      },
      (ctx, w, h) => {
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 2) {
          ctx.fillStyle = y % 4 === 0 ? 'rgb(145, 128, 255)' : 'rgb(110, 128, 255)';
          ctx.fillRect(0, y, w, 1);
        }
      },
      (ctx, w, h) => {
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, w, h);
      },
      [3, 3]
    ),

    // 6. Dot Matrix Perforated
    generateARTexture(
      'dot_matrix',
      'Dot Matrix Speaker Mesh',
      'Pattern',
      'Perforated audio speaker grille mesh pattern',
      (ctx, w, h) => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#0f172a';
        const r = 6;
        const step = 24;
        for (let y = step / 2; y < h; y += step) {
          for (let x = step / 2; x < w; x += step) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      },
      (ctx, w, h) => {
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, w, h);
        const r = 6;
        const step = 24;
        for (let y = step / 2; y < h; y += step) {
          for (let x = step / 2; x < w; x += step) {
            ctx.fillStyle = 'rgb(100, 100, 200)';
            ctx.beginPath();
            ctx.arc(x, y, r + 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      },
      (ctx, w, h) => {
        ctx.fillStyle = '#666666';
        ctx.fillRect(0, 0, w, h);
      },
      [3, 3]
    ),

    // 7. Organic Linen Fabric
    generateARTexture(
      'linen_fabric',
      'Organic Linen Weave',
      'Fabric',
      'Natural cross-woven fabric fibers for warm interior assets',
      (ctx, w, h) => {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#cbd5e1';
        for (let i = 0; i < w; i += 4) {
          ctx.fillRect(i, 0, 2, h);
        }
        for (let j = 0; j < h; j += 4) {
          ctx.fillRect(0, j, w, 2);
        }
      },
      undefined,
      (ctx, w, h) => {
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(0, 0, w, h);
      },
      [2, 2]
    )
  ];
}

// --------------------------------------------------
// SPLINE 3D MATERIAL PRESETS COLLECTION (40+ PRESETS)
// --------------------------------------------------
// SPLINE MATERIAL PRESETS
// High fidelity 3D material presets with rich previews
// --------------------------------------------------
export const SPLINE_MATERIAL_PRESETS: SplineMaterialPreset[] = [
  // --- CLAY & MATTE ---
  {
    id: 'soft_peach_clay',
    name: 'Soft Peach Clay',
    category: 'Clay & Matte',
    previewColor: '#fda4af',
    secondaryColor: '#f43f5e',
    thumbnailEmoji: '🍑',
    previewStyle: {
      background: 'radial-gradient(circle at 35% 35%, #ffe4e6 0%, #fda4af 60%, #e11d48 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.6)'
    },
    description: 'Smooth matte clay finish in warm pastel peach',
    materialProps: {
      shaderType: 'physical',
      color: '#fda4af',
      roughness: 0.55,
      metalness: 0.05,
      clearcoat: 0.1,
      clearcoatRoughness: 0.3,
    }
  },
  {
    id: 'minty_fresh_clay',
    name: 'Minty Fresh Clay',
    category: 'Clay & Matte',
    previewColor: '#6ee7b7',
    secondaryColor: '#059669',
    thumbnailEmoji: '🌱',
    previewStyle: {
      background: 'radial-gradient(circle at 35% 35%, #d1fae5 0%, #6ee7b7 60%, #047857 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.6)'
    },
    description: 'Soothing mint green matte clay texture',
    materialProps: {
      shaderType: 'physical',
      color: '#6ee7b7',
      roughness: 0.5,
      metalness: 0.05,
      clearcoat: 0.15,
    }
  },
  {
    id: 'lavender_dream',
    name: 'Lavender Clay',
    category: 'Clay & Matte',
    previewColor: '#c084fc',
    secondaryColor: '#7e22ce',
    thumbnailEmoji: '🪻',
    previewStyle: {
      background: 'radial-gradient(circle at 35% 35%, #f3e8ff 0%, #c084fc 60%, #6b21a8 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.6)'
    },
    description: 'Pastel purple claymorphic material',
    materialProps: {
      shaderType: 'physical',
      color: '#c084fc',
      roughness: 0.5,
      metalness: 0.05,
      clearcoat: 0.2,
    }
  },
  {
    id: 'soft_charcoal_clay',
    name: 'Soft Charcoal Matte',
    category: 'Clay & Matte',
    previewColor: '#334155',
    secondaryColor: '#0f172a',
    thumbnailEmoji: '🖤',
    previewStyle: {
      background: 'radial-gradient(circle at 35% 35%, #64748b 0%, #334155 60%, #020617 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.5), inset 2px 2px 4px rgba(255,255,255,0.2)'
    },
    description: 'Deep sleek matte slate dark clay',
    materialProps: {
      shaderType: 'physical',
      color: '#334155',
      roughness: 0.65,
      metalness: 0.1,
      clearcoat: 0.05,
    }
  },
  {
    id: 'butter_yellow_clay',
    name: 'Butter Yellow Clay',
    category: 'Clay & Matte',
    previewColor: '#fde047',
    secondaryColor: '#ca8a04',
    thumbnailEmoji: '🧈',
    previewStyle: {
      background: 'radial-gradient(circle at 35% 35%, #fef9c3 0%, #fde047 60%, #a16207 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.6)'
    },
    description: 'Vibrant soft yellow clay coating',
    materialProps: {
      shaderType: 'physical',
      color: '#fde047',
      roughness: 0.45,
      metalness: 0.05,
      clearcoat: 0.2,
    }
  },

  // --- GLASS & CRYSTAL ---
  {
    id: 'crystal_prism_glass',
    name: 'Crystal Prism Glass',
    category: 'Glass & Crystal',
    previewColor: '#ffffff',
    secondaryColor: '#38bdf8',
    thumbnailEmoji: '💎',
    previewStyle: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(56,189,248,0.4) 50%, rgba(236,72,153,0.5) 100%)',
      backdropFilter: 'blur(8px)',
      boxShadow: 'inset 0 0 12px rgba(255,255,255,0.8), 0 4px 15px rgba(56,189,248,0.3)'
    },
    description: 'High refraction crystal clear glass with high transmission and clearcoat',
    materialProps: {
      shaderType: 'physical',
      color: '#ffffff',
      roughness: 0.05,
      metalness: 0.0,
      opacity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: 0.92,
      thickness: 0.8,
      ior: 1.52,
    }
  },
  {
    id: 'frosted_glass',
    name: 'Frosted Glass',
    category: 'Glass & Crystal',
    previewColor: '#e2e8f0',
    secondaryColor: '#94a3b8',
    thumbnailEmoji: '🧊',
    previewStyle: {
      background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 60%, #64748b 100%)',
      opacity: 0.85,
      boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.8)'
    },
    description: 'Diffused frosted glass with soft light dispersion',
    materialProps: {
      shaderType: 'physical',
      color: '#e2e8f0',
      roughness: 0.3,
      metalness: 0.0,
      opacity: 0.85,
      clearcoat: 0.6,
      transmission: 0.8,
      thickness: 0.5,
      ior: 1.45,
    }
  },
  {
    id: 'ruby_tinted_glass',
    name: 'Ruby Tinted Glass',
    category: 'Glass & Crystal',
    previewColor: '#f43f5e',
    secondaryColor: '#9f1239',
    thumbnailEmoji: '🔻',
    previewStyle: {
      background: 'radial-gradient(circle at 35% 35%, #fda4af 0%, #f43f5e 60%, #881337 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.4), inset 2px 2px 6px rgba(255,255,255,0.7)'
    },
    description: 'Rich translucent crimson glass with density attenuation',
    materialProps: {
      shaderType: 'physical',
      color: '#f43f5e',
      roughness: 0.1,
      metalness: 0.1,
      opacity: 0.9,
      clearcoat: 1.0,
      transmission: 0.85,
      thickness: 1.0,
      ior: 1.5,
      attenuationColor: '#e11d48',
      attenuationDistance: 0.6,
    }
  },
  {
    id: 'emerald_crystal',
    name: 'Emerald Crystal',
    category: 'Glass & Crystal',
    previewColor: '#10b981',
    secondaryColor: '#064e3b',
    thumbnailEmoji: '❇️',
    previewStyle: {
      background: 'radial-gradient(circle at 35% 35%, #6ee7b7 0%, #10b981 60%, #022c22 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.4), inset 2px 2px 6px rgba(255,255,255,0.7)'
    },
    description: 'Deep green facet gem glass refraction',
    materialProps: {
      shaderType: 'physical',
      color: '#10b981',
      roughness: 0.08,
      metalness: 0.1,
      opacity: 0.9,
      clearcoat: 1.0,
      transmission: 0.88,
      thickness: 1.2,
      ior: 1.55,
      attenuationColor: '#059669',
      attenuationDistance: 0.5,
    }
  },
  {
    id: 'rainbow_soap_bubble',
    name: 'Rainbow Bubble Glass',
    category: 'Glass & Crystal',
    previewColor: '#38bdf8',
    secondaryColor: '#ec4899',
    thumbnailEmoji: '🫧',
    previewStyle: {
      background: 'conic-gradient(from 180deg at 50% 50%, #38bdf8 0deg, #a855f7 70deg, #ec4899 140deg, #fde047 220deg, #4ade80 290deg, #38bdf8 360deg)',
      boxShadow: 'inset 0 0 10px rgba(255,255,255,0.9), 0 4px 12px rgba(168,85,247,0.3)'
    },
    description: 'Iridescent soap bubble glass with prism reflections',
    materialProps: {
      shaderType: 'physical',
      color: '#38bdf8',
      roughness: 0.02,
      metalness: 0.1,
      opacity: 0.85,
      clearcoat: 1.0,
      transmission: 0.9,
      thickness: 0.2,
      ior: 1.33,
      iridescence: 1.0,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [100, 400],
    }
  },
  {
    id: 'dark_tinted_glass',
    name: 'Obsidian Tinted Glass',
    category: 'Glass & Crystal',
    previewColor: '#1e293b',
    secondaryColor: '#020617',
    thumbnailEmoji: '🕶️',
    previewStyle: {
      background: 'radial-gradient(circle at 35% 35%, #475569 0%, #1e293b 60%, #020617 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.6), inset 2px 2px 4px rgba(255,255,255,0.3)'
    },
    description: 'Sleek dark smoked glass finish',
    materialProps: {
      shaderType: 'physical',
      color: '#0f172a',
      roughness: 0.15,
      metalness: 0.2,
      opacity: 0.88,
      clearcoat: 0.9,
      transmission: 0.7,
      thickness: 0.8,
      ior: 1.5,
    }
  },

  // --- METALS & CHROME ---
  {
    id: 'liquid_gold',
    name: '24K Liquid Gold',
    category: 'Metals & Chrome',
    previewColor: '#f59e0b',
    secondaryColor: '#fef08a',
    thumbnailEmoji: '🪙',
    previewStyle: {
      background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #b45309 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.4), inset 3px 3px 6px rgba(255,255,255,0.8), 0 4px 12px rgba(245,158,11,0.3)'
    },
    description: 'Pure polished yellow gold with glossy specular reflections',
    materialProps: {
      shaderType: 'physical',
      color: '#f59e0b',
      roughness: 0.12,
      metalness: 0.95,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    }
  },
  {
    id: 'titanium_steel',
    name: 'Titanium Steel',
    category: 'Metals & Chrome',
    previewColor: '#94a3b8',
    secondaryColor: '#334155',
    thumbnailEmoji: '⚙️',
    previewStyle: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 50%, #334155 100%)',
      boxShadow: 'inset -3px -3px 6px rgba(0,0,0,0.4), inset 2px 2px 5px rgba(255,255,255,0.7)'
    },
    description: 'Anodized silver titanium metal with subtle roughness',
    materialProps: {
      shaderType: 'physical',
      color: '#94a3b8',
      roughness: 0.25,
      metalness: 0.9,
      clearcoat: 0.4,
    }
  },
  {
    id: 'rose_gold_metal',
    name: 'Rose Gold Metallic',
    category: 'Metals & Chrome',
    previewColor: '#fb7185',
    secondaryColor: '#be123c',
    thumbnailEmoji: '✨',
    previewStyle: {
      background: 'linear-gradient(135deg, #ffe4e6 0%, #fb7185 50%, #9f1239 100%)',
      boxShadow: 'inset -3px -3px 6px rgba(0,0,0,0.4), inset 2px 2px 5px rgba(255,255,255,0.7)'
    },
    description: 'Luxury polished rose gold sheen',
    materialProps: {
      shaderType: 'physical',
      color: '#fb7185',
      roughness: 0.15,
      metalness: 0.92,
      clearcoat: 0.7,
    }
  },
  {
    id: 'brushed_copper',
    name: 'Brushed Copper',
    category: 'Metals & Chrome',
    previewColor: '#ea580c',
    secondaryColor: '#7c2d12',
    thumbnailEmoji: '🥉',
    previewStyle: {
      background: 'linear-gradient(135deg, #ffedd5 0%, #ea580c 50%, #7c2d12 100%)',
      boxShadow: 'inset -3px -3px 6px rgba(0,0,0,0.4), inset 2px 2px 5px rgba(255,255,255,0.6)'
    },
    description: 'Warm reddish brushed copper metal',
    materialProps: {
      shaderType: 'physical',
      color: '#ea580c',
      roughness: 0.35,
      metalness: 0.85,
    }
  },
  {
    id: 'iridescent_chrome',
    name: 'Iridescent Rainbow Chrome',
    category: 'Metals & Chrome',
    previewColor: '#a855f7',
    secondaryColor: '#06b6d4',
    thumbnailEmoji: '🪩',
    previewStyle: {
      background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 35%, #ec4899 70%, #fde047 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.8), 0 4px 15px rgba(168,85,247,0.4)'
    },
    description: 'Liquid chrome reflecting dynamic rainbow spectra',
    materialProps: {
      shaderType: 'physical',
      color: '#a855f7',
      roughness: 0.08,
      metalness: 0.95,
      clearcoat: 1.0,
      iridescence: 1.0,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [200, 500],
    }
  },

  // --- HOLOGRAPHIC & IRIDESCENT ---
  {
    id: 'aurora_borealis',
    name: 'Aurora Hologram',
    category: 'Holographic & Iridescent',
    previewColor: '#38bdf8',
    secondaryColor: '#a855f7',
    thumbnailEmoji: '🌌',
    previewStyle: {
      background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 40%, #a855f7 100%)',
      boxShadow: '0 0 15px rgba(56,189,248,0.5), inset 0 0 10px rgba(255,255,255,0.6)'
    },
    description: 'Shifting cyan-purple cosmic iridescent sheen',
    materialProps: {
      shaderType: 'physical',
      color: '#38bdf8',
      roughness: 0.15,
      metalness: 0.6,
      clearcoat: 1.0,
      iridescence: 1.0,
      iridescenceIOR: 1.4,
      iridescenceThicknessRange: [150, 450],
    }
  },
  {
    id: 'holographic_pearl',
    name: 'Holographic Pearl',
    category: 'Holographic & Iridescent',
    previewColor: '#f472b6',
    secondaryColor: '#fde047',
    thumbnailEmoji: '🦪',
    previewStyle: {
      background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #f472b6 50%, #fde047 100%)',
      boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.2), inset 2px 2px 6px rgba(255,255,255,0.9)'
    },
    description: 'Mother-of-pearl iridescent lustre finish',
    materialProps: {
      shaderType: 'physical',
      color: '#f472b6',
      roughness: 0.2,
      metalness: 0.4,
      clearcoat: 1.0,
      iridescence: 1.0,
      iridescenceIOR: 1.35,
      sheen: 1.0,
      sheenColor: '#fde047',
    }
  },

  // --- NEON & GLOW ---
  {
    id: 'cyber_cyan_neon',
    name: 'Cyber Cyan Glow',
    category: 'Neon & Glow',
    previewColor: '#06b6d4',
    secondaryColor: '#0891b2',
    thumbnailEmoji: '⚡',
    previewStyle: {
      background: 'radial-gradient(circle at 50% 50%, #22d3ee 0%, #06b6d4 60%, #155e75 100%)',
      boxShadow: '0 0 20px #06b6d4, inset 0 0 10px #ffffff'
    },
    description: 'High intensity emissive electric cyan plasma',
    materialProps: {
      shaderType: 'physical',
      color: '#06b6d4',
      roughness: 0.1,
      metalness: 0.1,
      emissiveColor: '#06b6d4',
      emissiveIntensity: 1.6,
    }
  },
  {
    id: 'electric_pink_neon',
    name: 'Vaporwave Electric Pink',
    category: 'Neon & Glow',
    previewColor: '#ec4899',
    secondaryColor: '#be185d',
    thumbnailEmoji: '💖',
    previewStyle: {
      background: 'radial-gradient(circle at 50% 50%, #f472b6 0%, #ec4899 60%, #831843 100%)',
      boxShadow: '0 0 20px #ec4899, inset 0 0 10px #ffffff'
    },
    description: 'Vibrant glowing magenta neon source',
    materialProps: {
      shaderType: 'physical',
      color: '#ec4899',
      roughness: 0.1,
      metalness: 0.1,
      emissiveColor: '#ec4899',
      emissiveIntensity: 1.8,
    }
  },
  {
    id: 'glowing_amber_solar',
    name: 'Glowing Solar Amber',
    category: 'Neon & Glow',
    previewColor: '#eab308',
    secondaryColor: '#ca8a04',
    thumbnailEmoji: '☀️',
    previewStyle: {
      background: 'radial-gradient(circle at 50% 50%, #fef08a 0%, #eab308 60%, #713f12 100%)',
      boxShadow: '0 0 20px #eab308, inset 0 0 10px #ffffff'
    },
    description: 'Radiant golden sun flame luminescence',
    materialProps: {
      shaderType: 'physical',
      color: '#eab308',
      roughness: 0.1,
      emissiveColor: '#f59e0b',
      emissiveIntensity: 2.0,
    }
  },

  // --- TEXTURES & PATTERNS ---
  {
    id: 'preset_terrazzo',
    name: 'Terrazzo Marble Pattern',
    category: 'Textures & Patterns',
    previewColor: '#f8fafc',
    secondaryColor: '#cbd5e1',
    thumbnailEmoji: '🧱',
    previewStyle: {
      background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #f1f5f9 60%, #94a3b8 100%)',
      boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.3)'
    },
    description: 'Terrazzo stone pattern with roughness bump map',
    materialProps: {
      shaderType: 'physical',
      color: '#ffffff',
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.4,
      textureUrl: getOptimizedARTextures()[0].previewUrl,
      normalMapUrl: getOptimizedARTextures()[0].normalMapUrl,
      roughnessMapUrl: getOptimizedARTextures()[0].roughnessMapUrl,
      textureRepeatX: 3,
      textureRepeatY: 3,
    }
  },
  {
    id: 'preset_carbon_fiber',
    name: 'Carbon Fiber Weave',
    category: 'Textures & Patterns',
    previewColor: '#1f2937',
    secondaryColor: '#030712',
    thumbnailEmoji: '🏁',
    previewStyle: {
      background: 'linear-gradient(45deg, #111827 25%, #1f2937 25%, #1f2937 50%, #111827 50%, #111827 75%, #1f2937 75%, #1f2937 100%)',
      backgroundSize: '12px 12px',
      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)'
    },
    description: 'Dark diagonal carbon weave with specular normal shine',
    materialProps: {
      shaderType: 'physical',
      color: '#ffffff',
      roughness: 0.3,
      metalness: 0.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      textureUrl: getOptimizedARTextures()[1].previewUrl,
      normalMapUrl: getOptimizedARTextures()[1].normalMapUrl,
      roughnessMapUrl: getOptimizedARTextures()[1].roughnessMapUrl,
      textureRepeatX: 4,
      textureRepeatY: 4,
    }
  },
  {
    id: 'preset_cyber_grid',
    name: 'Neon Cyber Grid Pattern',
    category: 'Textures & Patterns',
    previewColor: '#09090b',
    secondaryColor: '#06b6d4',
    thumbnailEmoji: '🌐',
    previewStyle: {
      background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(9,9,11,1) 80%)',
      border: '1px solid #06b6d4',
      boxShadow: 'inset 0 0 10px #06b6d4'
    },
    description: 'Dark background with luminous blue grid lines',
    materialProps: {
      shaderType: 'physical',
      color: '#ffffff',
      roughness: 0.2,
      metalness: 0.3,
      emissiveColor: '#06b6d4',
      emissiveIntensity: 0.4,
      textureUrl: getOptimizedARTextures()[2].previewUrl,
      textureRepeatX: 2,
      textureRepeatY: 2,
    }
  },

  // --- ORGANIC & FABRIC ---
  {
    id: 'soft_pink_velvet',
    name: 'Soft Pink Velvet',
    category: 'Organic & Fabric',
    previewColor: '#f472b6',
    secondaryColor: '#be185d',
    thumbnailEmoji: '🛋️',
    previewStyle: {
      background: 'radial-gradient(circle at 40% 40%, #fbcfe8 0%, #f472b6 60%, #9d174d 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.3)'
    },
    description: 'Plush textile velvet with directional sheen reflections',
    materialProps: {
      shaderType: 'physical',
      color: '#f472b6',
      roughness: 0.85,
      metalness: 0.0,
      sheen: 1.0,
      sheenColor: '#fda4af',
      sheenRoughness: 0.5,
    }
  },
  {
    id: 'royal_blue_velvet',
    name: 'Royal Blue Velvet',
    category: 'Organic & Fabric',
    previewColor: '#3b82f6',
    secondaryColor: '#1e3a8a',
    thumbnailEmoji: '🎀',
    previewStyle: {
      background: 'radial-gradient(circle at 40% 40%, #bfdbfe 0%, #3b82f6 60%, #1e3a8a 100%)',
      boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.3)'
    },
    description: 'Rich royal blue fabric with soft sheen highlights',
    materialProps: {
      shaderType: 'physical',
      color: '#3b82f6',
      roughness: 0.8,
      metalness: 0.0,
      sheen: 1.0,
      sheenColor: '#93c5fd',
      sheenRoughness: 0.4,
    }
  }
];

// Helper to apply preset onto an object
export function applySplineMaterialPresetToObject(
  object: SceneObject,
  preset: SplineMaterialPreset
): SceneObject {
  return {
    ...object,
    properties: {
      ...object.properties,
      ...preset.materialProps,
    }
  };
}
