import { SceneObject } from '../types';

export interface ArchitecturalAsset {
  id: string;
  name: string;
  category: 'Furniture' | 'Architecture' | 'Lighting' | 'Decor & Plants' | 'Retail & Display';
  description: string;
  badge: string;
  badgeColor?: string;
  icon: string;
  thumbnailUrl: string; // Exact thumbnail from original repository
  previewGradient?: string;
  previewColor: string;
  tags?: string[];
  categoryProportionFactor: number; // Proportional scaling relative to max placement benchmark (0.10 to 1.00)
  maxPlacementPercent: number; // Max placement threshold relative to AR Target size (default 50%)
  createObject: (id: string, arTargetWidth?: number) => SceneObject;
}

const BASE_ITEM_URL = 'https://raw.githubusercontent.com/pascalorg/editor/main/apps/editor/public/items';

function createModelAsset(
  id: string,
  slug: string,
  name: string,
  category: 'Furniture' | 'Architecture' | 'Lighting' | 'Decor & Plants' | 'Retail & Display',
  description: string,
  badge: string,
  badgeColor: string,
  icon: string,
  previewColor: string,
  categoryProportionFactor: number = 0.5,
  tags: string[] = []
): ArchitecturalAsset {
  const maxPlacementPercent = 50; // Max 50% placement limit relative to AR Target

  return {
    id,
    name,
    category,
    description,
    badge,
    badgeColor,
    icon,
    thumbnailUrl: `${BASE_ITEM_URL}/${slug}/thumbnail.webp`,
    previewColor,
    tags,
    categoryProportionFactor,
    maxPlacementPercent,
    createObject: (objId: string, arTargetWidth: number = 5.0): SceneObject => {
      // Calculate proportional scale: AR Target size * 50% max threshold * category proportion factor
      const maxLimitRatio = maxPlacementPercent / 100; // 0.50 max placement
      const effectiveFactor = Math.min(1.0, Math.max(0.1, categoryProportionFactor));
      const targetScale = Math.min(0.50 * arTargetWidth, arTargetWidth * maxLimitRatio * effectiveFactor);
      const s = Number(targetScale.toFixed(3));

      return {
        id: objId,
        name,
        type: 'model',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: null,
        properties: {
          url: `${BASE_ITEM_URL}/${slug}/model.glb`,
          behavior: 'none',
          autoplay: false,
          isInteractive: false,
          categoryProportionFactor: effectiveFactor,
          maxPlacementPercent: maxPlacementPercent,
          scaledProportionally: true,
          initialArTargetWidth: arTargetWidth,
          defaultScaleRatio: s
        }
      };
    }
  };
}

export const ARCHITECTURAL_ASSETS: ArchitecturalAsset[] = [
  // --- FURNITURE (Benchmark Max = Platform Double Bed / Modular Sofa at 50% AR Target) ---
  createModelAsset(
    'arch-lounge-chair',
    'lounge-chair',
    'Modern Lounge Armchair',
    'Furniture',
    'Contemporary Scandinavian lounge armchair with upholstered cushion and angled oak legs.',
    'ARMCHAIR',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '🪑',
    '#059669',
    0.56, // 28% of AR Target
    ['chair', 'lounge', 'scandinavian', 'wood', 'fabric']
  ),
  createModelAsset(
    'arch-coffee-table',
    'coffee-table',
    'Minimalist Coffee Table',
    'Furniture',
    'Architectural coffee table with tempered glass surface and dark walnut structural frame.',
    'TABLE',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '🛋️',
    '#0284c7',
    0.48, // 24% of AR Target
    ['table', 'coffee', 'living room', 'glass', 'minimal']
  ),
  createModelAsset(
    'arch-modular-sofa',
    'sofa',
    'Contemporary Modular Sofa',
    'Furniture',
    'Low-profile minimalist sectional sofa block with premium linen upholstery.',
    'SOFA',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '🛋️',
    '#6366f1',
    0.95, // 47.5% of AR Target
    ['sofa', 'couch', 'living room', 'modular', 'fabric']
  ),
  createModelAsset(
    'arch-couch-medium',
    'couch-medium',
    'Studio Medium Couch',
    'Furniture',
    'Mid-century upholstered medium couch tailored for retail lounges and living spaces.',
    'COUCH',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '🛋️',
    '#4f46e5',
    0.80, // 40% of AR Target
    ['couch', 'sofa', 'studio', 'interior']
  ),
  createModelAsset(
    'arch-workstation-desk',
    'desk',
    'Executive Studio Desk',
    'Furniture',
    'Solid natural oak desktop on matte black powder-coated steel trestle base.',
    'STUDIO DESK',
    'bg-amber-500/20 text-amber-300 border-amber-500/30',
    '💻',
    '#b45309',
    0.75, // 37.5% of AR Target
    ['desk', 'office', 'wood', 'studio', 'workstation']
  ),
  createModelAsset(
    'arch-office-chair',
    'office-chair',
    'Ergonomic Task Chair',
    'Furniture',
    'High-performance ergonomic mesh task chair with polished aluminum base.',
    'OFFICE',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '🪑',
    '#0f766e',
    0.52, // 26% of AR Target
    ['chair', 'office', 'ergonomic', 'workspace']
  ),
  createModelAsset(
    'arch-dining-chair',
    'dining-chair',
    'Curved Dining Chair',
    'Furniture',
    'Curved architectural dining chair featuring contoured timber backrest and slim metal legs.',
    'DINING',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '🪑',
    '#059669',
    0.48, // 24% of AR Target
    ['chair', 'dining', 'curved', 'modern']
  ),
  createModelAsset(
    'arch-dining-table',
    'dining-table',
    'Timber Dining Table',
    'Furniture',
    'Expansive architectural solid timber dining table for hospitality and residential dining.',
    'TABLE',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '🪑',
    '#b45309',
    0.90, // 45% of AR Target
    ['table', 'dining', 'wood', 'gathering']
  ),
  createModelAsset(
    'arch-bookshelf',
    'bookshelf',
    'Nordic Modular Bookshelf',
    'Furniture',
    'Multi-tier open architectural shelving unit for product display or gallery presentation.',
    'SHELVING',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '📚',
    '#10b981',
    0.70, // 35% of AR Target
    ['bookshelf', 'storage', 'library', 'display']
  ),
  createModelAsset(
    'arch-bedside-table',
    'bedside-table',
    'Floating Bedside Table',
    'Furniture',
    'Compact modern nightstand drawer with clean architectural beveled edge.',
    'NIGHTSTAND',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '🛏️',
    '#0284c7',
    0.32, // 16% of AR Target
    ['bedside', 'table', 'nightstand', 'bedroom']
  ),
  createModelAsset(
    'arch-double-bed',
    'double-bed',
    'Platform Double Bed',
    'Furniture',
    'Minimalist low-profile platform bed with upholstered padded headboard.',
    'BED',
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    '🛏️',
    '#4338ca',
    1.00, // 50% of AR Target (Benchmark Max)
    ['bed', 'bedroom', 'platform', 'linen']
  ),
  createModelAsset(
    'arch-bean-bag',
    'bean-bag',
    'Casual Lounge Bean Bag',
    'Furniture',
    'Relaxed textured canvas bean bag lounger for casual recreation and youth lounges.',
    'LOUNGE',
    'bg-teal-500/20 text-teal-300 border-teal-500/30',
    '🛋️',
    '#0d9488',
    0.44, // 22% of AR Target
    ['beanbag', 'soft', 'lounge', 'casual']
  ),

  // --- ARCHITECTURE ---
  createModelAsset(
    'arch-fluted-column',
    'column',
    'Classical Fluted Column',
    'Architecture',
    'Neoclassical fluted architectural column rendered in honed travertine marble.',
    'COLUMN',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    '🏛️',
    '#9333ea',
    0.80, // 40% of AR Target
    ['column', 'classical', 'marble', 'pillar', 'architecture']
  ),
  createModelAsset(
    'arch-front-door',
    'door',
    'Architectural Interior Door',
    'Architecture',
    'Flush contemporary interior door with concealed hinges and matte hardware.',
    'DOOR',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    '🚪',
    '#7c3aed',
    0.84, // 42% of AR Target
    ['door', 'entrance', 'interior', 'minimal']
  ),
  createModelAsset(
    'arch-glass-door',
    'glass-door',
    'Framed Glass Pivot Door',
    'Architecture',
    'Modern floor-to-ceiling glass pivot door with black anodized aluminum framing.',
    'PIVOT DOOR',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    '🚪',
    '#0284c7',
    0.90, // 45% of AR Target
    ['door', 'glass', 'pivot', 'aluminum']
  ),
  createModelAsset(
    'arch-window-large',
    'window-large',
    'Panoramic Picture Window',
    'Architecture',
    'Large floor-to-ceiling architectural window frame with clean thermal sightlines.',
    'WINDOW',
    'bg-sky-500/20 text-sky-300 border-sky-500/30',
    '🪟',
    '#0284c7',
    0.96, // 48% of AR Target
    ['window', 'glass', 'panoramic', 'framing']
  ),
  createModelAsset(
    'arch-window-double',
    'window-double',
    'Double Casement Window',
    'Architecture',
    'Classic architectural double casement window with deep reveal frame.',
    'WINDOW',
    'bg-sky-500/20 text-sky-300 border-sky-500/30',
    '🪟',
    '#0369a1',
    0.72, // 36% of AR Target
    ['window', 'casement', 'architectural']
  ),
  createModelAsset(
    'arch-stairs',
    'stairs',
    'Floating Cantilever Stairs',
    'Architecture',
    'Contemporary open-riser architectural flight of stairs with timber treads.',
    'STAIRS',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    '🪜',
    '#7c3aed',
    1.00, // 50% of AR Target (Benchmark Max)
    ['stairs', 'steps', 'architecture', 'wood']
  ),
  createModelAsset(
    'arch-suspended-fireplace',
    'suspended-fireplace',
    'Suspended Hearth Fireplace',
    'Architecture',
    'Sculptural ceiling-hung matte black steel fireplace with panoramic fire bowl.',
    'FIREPLACE',
    'bg-orange-500/20 text-orange-300 border-orange-500/30',
    '🔥',
    '#c2410c',
    0.64, // 32% of AR Target
    ['fireplace', 'hearth', 'sculptural', 'steel']
  ),

  // --- LIGHTING ---
  createModelAsset(
    'arch-floor-lamp',
    'floor-lamp',
    'Modern Floor Arc Lamp',
    'Lighting',
    'Minimalist curved floor lamp with directional hemisphere diffuser shade.',
    'FLOOR LAMP',
    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    '💡',
    '#eab308',
    0.70, // 35% of AR Target
    ['lamp', 'lighting', 'floor', 'brass', 'arc']
  ),
  createModelAsset(
    'arch-table-lamp',
    'table-lamp',
    'Studio Table Lamp',
    'Lighting',
    'Refined ambient table luminaire with turned brass stem and diffuse globe.',
    'DESK LAMP',
    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    '💡',
    '#ca8a04',
    0.28, // 14% of AR Target
    ['lamp', 'table', 'desk', 'brass']
  ),
  createModelAsset(
    'arch-ceiling-lamp',
    'ceiling-lamp',
    'Pendant Chandelier Lamp',
    'Lighting',
    'Architectural geometric pendant chandelier casting soft downward conical illumination.',
    'PENDANT',
    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    '💡',
    '#eab308',
    0.56, // 28% of AR Target
    ['lighting', 'ceiling', 'pendant', 'chandelier']
  ),

  // --- DECOR & PLANTS ---
  createModelAsset(
    'arch-indoor-plant',
    'indoor-plant',
    'Potted Monstera Deliciosa',
    'Decor & Plants',
    'Broad Swiss Cheese Monstera plant in a sculptural matte ceramic cylinder planter.',
    'BOTANICAL',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '🪴',
    '#10b981',
    0.48, // 24% of AR Target
    ['plant', 'monstera', 'botanical', 'indoor', 'greenery']
  ),
  createModelAsset(
    'arch-palm-tree',
    'palm',
    'Indoor Areca Palm',
    'Decor & Plants',
    'Graceful tropical Areca palm fronds bringing lush natural atmosphere to AR scenes.',
    'PALM',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '🌴',
    '#059669',
    0.64, // 32% of AR Target
    ['palm', 'tropical', 'indoor', 'foliage']
  ),
  createModelAsset(
    'arch-cactus-succulent',
    'cactus',
    'Desert Columnar Cactus',
    'Decor & Plants',
    'Architectural saguaro desert cactus set in a textured terracotta planter.',
    'SUCCULENT',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '🌵',
    '#15803d',
    0.32, // 16% of AR Target
    ['cactus', 'succulent', 'desert', 'terracotta']
  ),
  createModelAsset(
    'arch-books-stack',
    'books',
    'Monograph Hardcover Books',
    'Decor & Plants',
    'Art and architecture hardcover monographs stacked horizontally for table styling.',
    'BOOKS',
    'bg-amber-500/20 text-amber-300 border-amber-500/30',
    '📚',
    '#d97706',
    0.24, // 12% of AR Target
    ['books', 'monograph', 'decor', 'editorial']
  ),
  createModelAsset(
    'arch-framed-picture',
    'picture',
    'Framed Gallery Print',
    'Decor & Plants',
    'Museum-grade gallery wooden picture frame with archival white border matting.',
    'GALLERY ART',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    '🖼️',
    '#9333ea',
    0.60, // 30% of AR Target
    ['picture', 'art', 'frame', 'gallery', 'wall']
  ),
  createModelAsset(
    'arch-wall-art',
    'wall-art-06',
    'Abstract Architectural Canvas',
    'Decor & Plants',
    'Large-scale minimalist geometric canvas painting with textured brushwork.',
    'CANVAS',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    '🎨',
    '#7e22ce',
    0.76, // 38% of AR Target
    ['art', 'canvas', 'abstract', 'painting']
  ),
  createModelAsset(
    'arch-round-mirror',
    'round-mirror',
    'Circular Vanity Mirror',
    'Decor & Plants',
    'Deep bronze rimmed circular mirror offering spatial optical reflections.',
    'MIRROR',
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    '🪞',
    '#0284c7',
    0.56, // 28% of AR Target
    ['mirror', 'reflection', 'decor', 'vanity']
  ),
  createModelAsset(
    'arch-grand-piano',
    'piano',
    'Concert Grand Piano',
    'Decor & Plants',
    'Polished high-gloss black lacquer concert grand piano with brass pedals.',
    'INSTRUMENT',
    'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
    '🎹',
    '#18181b',
    1.00, // 50% of AR Target (Benchmark Max)
    ['piano', 'grand piano', 'music', 'instrument', 'luxury']
  ),
  createModelAsset(
    'arch-acoustic-guitar',
    'guitar',
    'Natural Acoustic Guitar',
    'Decor & Plants',
    'Handcrafted spruce soundboard acoustic guitar on display floor stand.',
    'INSTRUMENT',
    'bg-amber-600/20 text-amber-300 border-amber-600/30',
    '🎸',
    '#b45309',
    0.50, // 25% of AR Target
    ['guitar', 'acoustic', 'music', 'instrument']
  ),

  // --- RETAIL & DISPLAY / WORKSPACE ---
  createModelAsset(
    'arch-flat-screen-tv',
    'flat-screen-tv',
    'OLED Display Screen',
    'Retail & Display',
    'Ultra-slim borderless OLED display panel for interactive video overlays.',
    'DISPLAY',
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    '📺',
    '#2563eb',
    0.80, // 40% of AR Target
    ['tv', 'screen', 'display', 'oled', 'video']
  ),
  createModelAsset(
    'arch-desktop-computer',
    'computer',
    'Creative Studio Workstation',
    'Retail & Display',
    'All-in-one aluminum studio desktop monitor with wireless keyboard and mouse.',
    'WORKSTATION',
    'bg-slate-500/20 text-slate-300 border-slate-500/30',
    '🖥️',
    '#475569',
    0.56, // 28% of AR Target
    ['computer', 'mac', 'workstation', 'monitor']
  ),
  createModelAsset(
    'arch-stereo-speaker',
    'stereo-speaker',
    'Hi-Fi Studio Monitor Speaker',
    'Retail & Display',
    'Acoustic damped studio monitor speaker with woven composite driver.',
    'AUDIO',
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    '🔊',
    '#4338ca',
    0.36, // 18% of AR Target
    ['speaker', 'audio', 'sound', 'hifi']
  ),
];
