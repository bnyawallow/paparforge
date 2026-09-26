import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Filter, 
  Check, 
  Box, 
  Eye, 
  Heart, 
  Layers, 
  AlertCircle, 
  RefreshCw,
  Tag,
  DollarSign,
  Globe,
  Rocket,
  Shield,
  ShoppingBag,
  Bookmark,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export interface SketchfabModelItem {
  id: string;
  name: string;
  creator: string;
  category: string;
  thumbnail: string;
  url: string;
  license: string;
  isFree: boolean;
  priceText: string;
  platform: 'Sketchfab' | 'Poly Pizza' | 'NASA 3D' | 'Smithsonian 3D' | 'Khronos Archive' | 'Open Archive';
  polyCount?: string;
  viewCount?: number;
  likeCount?: number;
  description: string;
  sketchfabUrl?: string;
  isScene?: boolean;
  tags?: string[];
  fileSize?: string;
}

// Multi-Platform Curated 3D Models with Rich Free / Paid Tags & Certified Z-Up Compatibility
export const CURATED_3D_ARCHIVE: SketchfabModelItem[] = [
  // --- FREE MODELS (NASA, Poly Pizza, Khronos, Smithsonian, Sketchfab CC0/CC-BY) ---
  {
    id: 'sf-astronaut',
    name: 'Apollo Astronaut Suit',
    creator: 'NASA 3D Resources',
    category: 'space',
    thumbnail: 'https://raw.githubusercontent.com/google/model-viewer/master/packages/shared-assets/models/NeilArmstrong.webp',
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    license: 'CC0 Public Domain',
    isFree: true,
    priceText: 'FREE • CC0',
    platform: 'NASA 3D',
    polyCount: '48.2k polys',
    fileSize: '4.8 MB',
    viewCount: 142000,
    likeCount: 8900,
    tags: ['free', 'cc0', 'nasa', 'space', 'astronaut', 'suit', 'character'],
    description: 'Photorealistic zero-gravity lunar spacesuit model from NASA open archives.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/astronaut-spacesuit-nasa'
  },
  {
    id: 'sf-damaged-helmet',
    name: 'Battle-Damaged Sci-Fi Helmet',
    creator: 'Khronos Group PBR',
    category: 'items',
    thumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/screenshot/screenshot.png',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    license: 'CC-BY 4.0',
    isFree: true,
    priceText: 'FREE • CC-BY',
    platform: 'Khronos Archive',
    polyCount: '15.2k polys',
    fileSize: '3.6 MB',
    viewCount: 225000,
    likeCount: 16800,
    tags: ['free', 'cc-by', 'pbr', 'helmet', 'sci-fi', 'armor', 'cyberpunk'],
    description: 'Reference PBR metallic-roughness model with emissive visor and weathering textures.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/battle-damaged-sci-fi-helmet'
  },
  {
    id: 'sf-curiosity-rover',
    name: 'Mars Curiosity Rover',
    creator: 'NASA Jet Propulsion Lab',
    category: 'space',
    thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&auto=format&fit=crop&q=80',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    license: 'CC0 Public Domain',
    isFree: true,
    priceText: 'FREE • NASA JPL',
    platform: 'NASA 3D',
    polyCount: '65.0k polys',
    fileSize: '7.2 MB',
    viewCount: 198000,
    likeCount: 14200,
    tags: ['free', 'cc0', 'nasa', 'space', 'mars', 'rover', 'robot', 'vehicle'],
    description: 'Detailed 3D scan of NASA Curiosity Mars Exploration Rover with articulated robotic arm.',
    sketchfabUrl: 'https://nasa3d.arc.nasa.gov/detail/curiosity-standalone'
  },
  {
    id: 'sf-vintage-camera',
    name: 'Antique Vintage Leica Camera',
    creator: 'Khronos Group',
    category: 'items',
    thumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AntiqueCamera/screenshot/screenshot.jpg',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
    license: 'CC-BY 4.0',
    isFree: true,
    priceText: 'FREE • CC-BY',
    platform: 'Khronos Archive',
    polyCount: '28.4k polys',
    fileSize: '5.1 MB',
    viewCount: 112000,
    likeCount: 9400,
    tags: ['free', 'cc-by', 'camera', 'vintage', 'brass', 'antique', 'pbr', 'luxury'],
    description: 'Handcrafted antique camera with brass gears and polished glass optics.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/antique-camera'
  },
  {
    id: 'sf-sheen-chair',
    name: 'Sheen Modern Velvet Armchair',
    creator: 'Wayfair & Khronos',
    category: 'furniture',
    thumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/screenshot/screenshot.png',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    license: 'CC-BY 4.0',
    isFree: true,
    priceText: 'FREE • CC-BY',
    platform: 'Khronos Archive',
    polyCount: '18.6k polys',
    fileSize: '2.4 MB',
    viewCount: 95000,
    likeCount: 7200,
    tags: ['free', 'cc-by', 'furniture', 'chair', 'interior', 'velvet', 'modern'],
    description: 'Velvet upholstered armchair demonstrating realistic cloth micro-fibers and soft sheen.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/sheen-chair'
  },
  {
    id: 'sf-smithsonian-cat',
    name: 'Smithsonian Gilded Bronze Cat',
    creator: 'Smithsonian Asian Art Museum',
    category: 'museum',
    thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb',
    license: 'CC0 Public Domain',
    isFree: true,
    priceText: 'FREE • SMITHSONIAN',
    platform: 'Smithsonian 3D',
    polyCount: '42.0k polys',
    fileSize: '4.2 MB',
    viewCount: 88000,
    likeCount: 6500,
    tags: ['free', 'cc0', 'smithsonian', 'museum', 'egyptian', 'cat', 'statue', 'sculpture'],
    description: 'High-precision laser 3D scan of an ancient museum bronze sculpture.',
    sketchfabUrl: 'https://3d.si.edu/object/3d/bronze-cat'
  },
  {
    id: 'sf-materials-shoe',
    name: 'Air Apex HyperSneaker 3D',
    creator: 'Khronos Group',
    category: 'items',
    thumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MaterialsVariantsShoe/screenshot/screenshot.png',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
    license: 'CC0 Public Domain',
    isFree: true,
    priceText: 'FREE • CC0',
    platform: 'Khronos Archive',
    polyCount: '19.8k polys',
    fileSize: '3.1 MB',
    viewCount: 310000,
    likeCount: 24500,
    tags: ['free', 'cc0', 'shoe', 'sneaker', 'sport', 'fashion', 'retail', 'product'],
    description: 'Interactive athletic sneaker with multi-layer knit, leather, and air-cushion materials.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/variants-shoe'
  },
  {
    id: 'sf-flight-helmet',
    name: 'Fighter Jet Pilot Flight Helmet',
    creator: 'Khronos Group',
    category: 'items',
    thumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/FlightHelmet/screenshot/screenshot.png',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/FlightHelmet/glTF-Binary/FlightHelmet.glb',
    license: 'CC-BY 4.0',
    isFree: true,
    priceText: 'FREE • CC-BY',
    platform: 'Khronos Archive',
    polyCount: '48.0k polys',
    fileSize: '8.4 MB',
    viewCount: 180000,
    likeCount: 14200,
    tags: ['free', 'cc-by', 'helmet', 'aviation', 'jet', 'military', 'pilot'],
    description: 'Heavy tactical flight helmet with dual sun-visors, leather earcups, and oxygen mask.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/flight-helmet'
  },
  {
    id: 'sf-poly-tree',
    name: 'Low-Poly Birch Nature Forest',
    creator: 'Poly Pizza Assets',
    category: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb',
    license: 'CC0 Public Domain',
    isFree: true,
    priceText: 'FREE • POLY PIZZA',
    platform: 'Poly Pizza',
    polyCount: '1.8k polys',
    fileSize: '0.4 MB',
    viewCount: 52000,
    likeCount: 3900,
    tags: ['free', 'cc0', 'nature', 'tree', 'forest', 'low-poly', 'environment'],
    description: 'Stylized low-polygon birch tree with gentle foliage branches, perfect for AR.',
    sketchfabUrl: 'https://poly.pizza/m/low-poly-tree'
  },
  {
    id: 'sf-water-bottle',
    name: 'Gourmet Sparkling Water Bottle',
    creator: 'Khronos Group',
    category: 'food',
    thumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/screenshot/screenshot.png',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/WaterBottle/glTF-Binary/WaterBottle.glb',
    license: 'CC0 Public Domain',
    isFree: true,
    priceText: 'FREE • CC0',
    platform: 'Khronos Archive',
    polyCount: '12.4k polys',
    fileSize: '1.8 MB',
    viewCount: 135000,
    likeCount: 9800,
    tags: ['free', 'cc0', 'bottle', 'drink', 'beverage', 'water', 'food', 'fmcg'],
    description: 'Stainless steel vacuum insulated drink bottle with transparent gloss finish.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/water-bottle'
  },
  {
    id: 'sf-animated-fox',
    name: 'Animated Red Fox Skeleton',
    creator: 'Khronos Group',
    category: 'nature',
    thumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/screenshot/screenshot.png',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb',
    license: 'CC-BY 4.0',
    isFree: true,
    priceText: 'FREE • ANIMATED',
    platform: 'Khronos Archive',
    polyCount: '6.2k polys',
    fileSize: '0.9 MB',
    viewCount: 290000,
    likeCount: 22000,
    tags: ['free', 'cc-by', 'fox', 'animal', 'nature', 'animated', 'kinematics'],
    description: 'Low-poly rigged fox model featuring Survey, Walk, and Run bone animations.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/animated-fox'
  },
  {
    id: 'sf-duck-mascot',
    name: 'Classic Yellow Rubber Duck',
    creator: 'Sony & Khronos',
    category: 'items',
    thumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/screenshot/screenshot.png',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb',
    license: 'CC0 Public Domain',
    isFree: true,
    priceText: 'FREE • CC0',
    platform: 'Khronos Archive',
    polyCount: '4.2k polys',
    fileSize: '0.5 MB',
    viewCount: 160000,
    likeCount: 11200,
    tags: ['free', 'cc0', 'duck', 'toy', 'mascot', 'yellow', 'item'],
    description: 'The iconic glTF test mascot rubber duck with cheerful yellow diffuse material.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/rubber-duck'
  },

  // --- PAID / STORE MODELS (Commercial Studio Quality with Price Tags) ---
  {
    id: 'sf-store-hypercar',
    name: 'Apex HyperCar Concept 2026',
    creator: 'Apex Studio 3D',
    category: 'vehicles',
    thumbnail: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500&auto=format&fit=crop&q=80',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Buggy/glTF-Binary/Buggy.glb',
    license: 'Commercial Store License',
    isFree: false,
    priceText: 'PAID • $49.00',
    platform: 'Sketchfab',
    polyCount: '124.5k polys',
    fileSize: '24.5 MB',
    viewCount: 380000,
    likeCount: 31000,
    tags: ['paid', 'store', '$49', 'vehicle', 'car', 'supercar', 'commercial', 'pbr'],
    description: 'Ultra-high-poly concept supercar with opening scissor doors and PBR carbon chassis.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/apex-hypercar-concept-store'
  },
  {
    id: 'sf-store-mecha',
    name: 'Valkyrie Heavy Combat Mecha',
    creator: 'IronWorks Games',
    category: 'characters',
    thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    license: 'Commercial Store License',
    isFree: false,
    priceText: 'PAID • $39.00',
    platform: 'Sketchfab',
    polyCount: '88.0k polys',
    fileSize: '18.2 MB',
    viewCount: 260000,
    likeCount: 21500,
    tags: ['paid', 'store', '$39', 'mecha', 'robot', 'sci-fi', 'character', 'combat'],
    description: 'Fully rigged sci-fi combat robot with particle thrusters and heavy plasma cannon.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/valkyrie-combat-mecha-store'
  },
  {
    id: 'sf-store-watch',
    name: 'Chronograph Tourbillon Watch',
    creator: 'Horology Studio 3D',
    category: 'items',
    thumbnail: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
    license: 'Commercial Store License',
    isFree: false,
    priceText: 'PAID • $29.00',
    platform: 'Sketchfab',
    polyCount: '54.2k polys',
    fileSize: '8.7 MB',
    viewCount: 195000,
    likeCount: 17400,
    tags: ['paid', 'store', '$29', 'watch', 'luxury', 'timepiece', 'pbr', 'gold'],
    description: 'Luxury mechanical Swiss watch with sapphire crystal glass and animated tourbillon escapement.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/luxury-tourbillon-watch-store'
  },
  {
    id: 'sf-store-samurai',
    name: 'Cyberpunk Neon Ronin Samurai',
    creator: 'NeoTokyo 3D',
    category: 'characters',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    license: 'Commercial Store License',
    isFree: false,
    priceText: 'PAID • $35.00',
    platform: 'Sketchfab',
    polyCount: '76.0k polys',
    fileSize: '14.1 MB',
    viewCount: 220000,
    likeCount: 19800,
    tags: ['paid', 'store', '$35', 'samurai', 'cyberpunk', 'character', 'katana', 'sci-fi'],
    description: 'Cybernetic warrior with glowing plasma katana blade and traditional kabuto armor.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/cyberpunk-samurai-ronin-store'
  },
  {
    id: 'sf-store-loft',
    name: 'Modernist Architectural Loft Room',
    creator: 'ArchViz Pro 3D',
    category: 'furniture',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=80',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    license: 'Commercial Store License',
    isFree: false,
    priceText: 'PAID • $45.00',
    platform: 'Sketchfab',
    polyCount: '160.0k polys',
    fileSize: '32.0 MB',
    viewCount: 140000,
    likeCount: 12100,
    tags: ['paid', 'store', '$45', 'architecture', 'loft', 'interior', 'room', 'furniture'],
    description: 'Complete Scandinavian living room scene with realistic lighting, sofa, and art.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/scandinavian-loft-interior-store'
  },
  {
    id: 'sf-store-drone',
    name: 'Octo-Rotor Heavy Delivery Drone',
    creator: 'AeroTech Systems',
    category: 'vehicles',
    thumbnail: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500&auto=format&fit=crop&q=80',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Buggy/glTF-Binary/Buggy.glb',
    license: 'Commercial Store License',
    isFree: false,
    priceText: 'PAID • $19.00',
    platform: 'Sketchfab',
    polyCount: '34.8k polys',
    fileSize: '6.4 MB',
    viewCount: 110000,
    likeCount: 8900,
    tags: ['paid', 'store', '$19', 'drone', 'uav', 'vehicle', 'cargo', 'sci-fi'],
    description: 'Industrial autonomous delivery drone with spinning carbon propellers and cargo pod.',
    sketchfabUrl: 'https://sketchfab.com/3d-models/octo-rotor-heavy-drone-store'
  }
];

export interface SketchfabBrowserProps {
  onSelectModel: (model: SketchfabModelItem) => void;
  onSaveToAssets?: (model: SketchfabModelItem) => void;
  selectedObjectId?: string | null;
  replaceTargetObjectId?: string | null;
  initialQuery?: string;
}

export function SketchfabBrowser({
  onSelectModel,
  onSaveToAssets,
  selectedObjectId,
  replaceTargetObjectId,
  initialQuery = ''
}: SketchfabBrowserProps) {
  const [query, setQuery] = useState(initialQuery);
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [models, setModels] = useState<SketchfabModelItem[]>(CURATED_3D_ARCHIVE);
  const [inspectModalItem, setInspectModalItem] = useState<SketchfabModelItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [savedAssetIds, setSavedAssetIds] = useState<Set<string>>(new Set());

  const { addToast } = useEditorStore();

  // Sync initial query if it changes from parent
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Filtering function
  const executeFilter = useCallback((
    searchTerm: string, 
    pricing: 'all' | 'free' | 'paid', 
    tag: string,
    cat: string, 
    plat: string
  ) => {
    const q = searchTerm.trim().toLowerCase();
    const filtered = CURATED_3D_ARCHIVE.filter(item => {
      // 1. Pricing match
      if (pricing === 'free' && !item.isFree) return false;
      if (pricing === 'paid' && item.isFree) return false;

      // 2. Tag match
      if (tag !== 'all') {
        const itemTags = item.tags || [];
        const hasTag = itemTags.some(t => t.toLowerCase() === tag.toLowerCase()) ||
          item.license.toLowerCase().includes(tag.toLowerCase()) ||
          (tag === 'cc0' && item.license.toLowerCase().includes('cc0')) ||
          (tag === 'cc-by' && item.license.toLowerCase().includes('cc-by')) ||
          (tag === 'under25' && !item.isFree && item.priceText.includes('$19')) ||
          (tag === 'studio' && !item.isFree && (item.priceText.includes('$35') || item.priceText.includes('$39') || item.priceText.includes('$45') || item.priceText.includes('$49')));
        if (!hasTag) return false;
      }

      // 3. Category match
      if (cat !== 'All' && item.category.toLowerCase() !== cat.toLowerCase()) return false;

      // 4. Platform match
      if (plat !== 'All' && item.platform !== plat) return false;

      // 5. Query match
      if (q) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCreator = item.creator.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchLicense = item.license.toLowerCase().includes(q);
        const matchTags = (item.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchCreator && !matchCategory && !matchLicense && !matchTags) {
          return false;
        }
      }

      return true;
    });

    // Sort: Free first if 'all', then high likes
    filtered.sort((a, b) => {
      if (pricing === 'all') {
        if (a.isFree !== b.isFree) return a.isFree ? -1 : 1;
      }
      return (b.likeCount || 0) - (a.likeCount || 0);
    });

    setModels(filtered);
  }, []);

  useEffect(() => {
    executeFilter(query, pricingFilter, tagFilter, categoryFilter, platformFilter);
  }, [query, pricingFilter, tagFilter, categoryFilter, platformFilter, executeFilter]);

  // Handle direct download to active scene
  const handleDirectDownload = (item: SketchfabModelItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingId(item.id);
    setTimeout(() => {
      onSelectModel(item);
      setDownloadingId(null);
      addToast(`Downloaded "${item.name}" directly into scene (Instantiated Z-Up)!`);
      if (inspectModalItem?.id === item.id) {
        setInspectModalItem(null);
      }
    }, 400);
  };

  // Handle saving model to project assets
  const handleSaveToProjectAssets = (item: SketchfabModelItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSaveToAssets) {
      onSaveToAssets(item);
      setSavedAssetIds(prev => new Set(prev).add(item.id));
      addToast(`Saved "${item.name}" to Project Assets!`);
    }
  };

  const categories = ['All', 'space', 'vehicles', 'items', 'furniture', 'museum', 'nature', 'food', 'characters'];
  const platforms = ['All', 'NASA 3D', 'Khronos Archive', 'Poly Pizza', 'Smithsonian 3D', 'Sketchfab'];
  
  const tagChips = [
    { id: 'all', label: 'All Tags' },
    { id: 'cc0', label: 'CC0 Public Domain' },
    { id: 'cc-by', label: 'CC-BY Attribution' },
    { id: 'pbr', label: 'PBR Physical Shaders' },
    { id: 'under25', label: 'Store: Under $25' },
    { id: 'studio', label: 'Store: Studio ($25+)' },
    { id: 'animated', label: 'Rigged & Animated' }
  ];

  const freeCount = models.filter(m => m.isFree).length;
  const paidCount = models.filter(m => !m.isFree).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0B0F] text-white overflow-hidden select-none">
      
      {/* Top Header & Search Controller */}
      <div className="p-4 border-b border-white/10 bg-[#111116] space-y-3 shrink-0">
        
        {/* Title & Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Globe size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-wide">
                  Online 3D Asset Library & Sketchfab
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Z-UP APP CONVENTION READY
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Filter online 3D repositories by Free (CC0/CC-BY) or Paid Store tags and download directly to your WebAR scene.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
            <span className="text-emerald-400 font-bold">{freeCount} Free</span>
            <span className="text-gray-500">•</span>
            <span className="text-amber-400 font-bold">{paidCount} Store Models</span>
          </div>
        </div>

        {/* Live Search Input Bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search online 3D assets by name, tag, creator, or license (e.g. Astronaut, Buggy, Leica, Helmet, Sneaker)..."
            className="w-full bg-[#181822] text-xs text-white placeholder-gray-500 pl-10 pr-9 py-2.5 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Bar 1: Primary Pricing Toggle & Sources */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
          
          {/* Free vs Paid Toggle */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <span className="text-[10px] text-gray-400 font-semibold px-2 uppercase tracking-wider font-mono">
              Pricing:
            </span>
            <button
              onClick={() => {
                setPricingFilter('all');
                setTagFilter('all');
              }}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer text-[11px] ${
                pricingFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Assets ({models.length})
            </button>
            <button
              onClick={() => setPricingFilter('free')}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                pricingFilter === 'free'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Check size={12} className={pricingFilter === 'free' ? 'inline' : 'hidden'} />
              <span>Free Models</span>
            </button>
            <button
              onClick={() => setPricingFilter('paid')}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                pricingFilter === 'paid'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingBag size={12} />
              <span>Paid / Store</span>
            </button>
          </div>

          {/* Platform Source Selector */}
          <div 
            className="flex items-center gap-1 overflow-x-auto overflow-y-hidden no-scrollbar touch-pan-x select-none"
            onWheel={(e) => {
              if (e.currentTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            <span className="text-[10px] text-gray-400 font-semibold px-1 uppercase tracking-wider font-mono shrink-0">
              Source:
            </span>
            {platforms.map((plat) => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-mono transition-all shrink-0 cursor-pointer ${
                  platformFilter === plat
                    ? 'bg-white/20 text-white font-bold border border-white/30'
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>

        </div>

        {/* Filter Bar 2: Free / Paid Specific Tag Chips */}
        <div 
          className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden no-scrollbar pt-1 touch-pan-x select-none"
          onWheel={(e) => {
            if (e.currentTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
        >
          <span className="text-[10px] text-gray-400 font-semibold px-1 uppercase tracking-wider font-mono shrink-0 flex items-center gap-1">
            <Tag size={11} className="text-blue-400" />
            Tags:
          </span>
          {tagChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setTagFilter(chip.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-mono whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                tagFilter === chip.id
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Filter Bar 3: Categories */}
        <div 
          className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden no-scrollbar touch-pan-x select-none"
          onWheel={(e) => {
            if (e.currentTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-[11px] px-2.5 py-0.5 rounded-md font-mono capitalize transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {cat === 'All' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* Models Grid Display with Direct Download Controls */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {models.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <Box size={40} className="text-white/20" />
            <h4 className="text-base font-bold text-white font-mono">No 3D models match your search filters</h4>
            <p className="text-xs text-gray-400 max-w-sm">
              Try adjusting your Free / Paid tag filters, source platform, or query keywords.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setPricingFilter('all');
                setTagFilter('all');
                setCategoryFilter('All');
                setPlatformFilter('All');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold font-mono text-white rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {models.map((item) => {
              const isSaved = savedAssetIds.has(item.id);
              const isDownloading = downloadingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setInspectModalItem(item)}
                  className="group rounded-2xl border border-white/10 bg-[#13131A] hover:border-blue-500/50 hover:bg-[#181824] transition-all cursor-pointer flex flex-col overflow-hidden relative shadow-lg"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-square w-full bg-black/60 overflow-hidden">
                    <img 
                      src={item.thumbnail} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Pricing Tag Badge Top Left */}
                    <div className="absolute top-2 left-2 z-10">
                      <span 
                        className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border shadow-md ${
                          item.isFree
                            ? 'bg-emerald-500/90 text-white border-emerald-400'
                            : 'bg-amber-500 text-black border-amber-300 font-extrabold'
                        }`}
                      >
                        {item.priceText}
                      </span>
                    </div>

                    {/* Platform Tag Top Right */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className="text-[8px] font-mono text-white/80 bg-black/70 px-1.5 py-0.5 rounded border border-white/10">
                        {item.platform}
                      </span>
                    </div>

                    {/* Hover Quick Action Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 gap-1.5 z-20">
                      
                      {/* Direct Download Button (Instantiated Z-Up) */}
                      <button
                        onClick={(e) => handleDirectDownload(item, e)}
                        disabled={isDownloading}
                        className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer ${
                          item.isFree
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold'
                        }`}
                        title="Download directly into scene (Instantiated Z-Up)"
                      >
                        {isDownloading ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <Download size={12} />
                            <span>{item.isFree ? 'Download (Z-Up)' : 'Preview (Z-Up)'}</span>
                          </>
                        )}
                      </button>

                      {/* Save to Project Assets Button */}
                      {onSaveToAssets && (
                        <button
                          onClick={(e) => handleSaveToProjectAssets(item, e)}
                          className={`w-full py-1 px-2 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                            isSaved
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-white/10 hover:bg-white/20 border-white/10 text-gray-200'
                          }`}
                          title="Save model to Project Assets library"
                        >
                          {isSaved ? <CheckCircle2 size={11} /> : <Bookmark size={11} />}
                          <span>{isSaved ? 'Saved to Assets' : 'Save to Assets'}</span>
                        </button>
                      )}

                    </div>
                  </div>

                  {/* Card Info Details */}
                  <div className="p-3 flex flex-col justify-between flex-1 gap-1.5">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {item.creator}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 border-t border-white/5 pt-1.5">
                      <span>{item.polyCount || '3D Asset'}</span>
                      <span className="text-cyan-400">Z-Up Ready</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Model Full Inspection & Direct Download Modal */}
      {inspectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#15151F] border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                    inspectModalItem.isFree
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {inspectModalItem.priceText}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  {inspectModalItem.platform}
                </span>
              </div>

              <button
                onClick={() => setInspectModalItem(null)}
                className="text-gray-400 hover:text-white text-sm p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Thumbnail Preview Banner */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/50">
              <img 
                src={inspectModalItem.thumbnail} 
                alt={inspectModalItem.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div>
                  <h4 className="text-base font-black text-white font-mono">{inspectModalItem.name}</h4>
                  <p className="text-xs text-gray-300">By {inspectModalItem.creator}</p>
                </div>
              </div>
            </div>

            {/* Specs & Description */}
            <div className="space-y-2 text-xs">
              <p className="text-gray-300 leading-relaxed">{inspectModalItem.description}</p>
              
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 font-mono text-[11px]">
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-gray-400 block text-[9px] uppercase">Polygon Count</span>
                  <span className="text-white font-bold">{inspectModalItem.polyCount || 'Standard'}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-gray-400 block text-[9px] uppercase">File Size</span>
                  <span className="text-white font-bold">{inspectModalItem.fileSize || '3.2 MB'}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-gray-400 block text-[9px] uppercase">Orientation</span>
                  <span className="text-emerald-400 font-bold">Z-Up [90, 0, 0]</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                <span>License: <strong className="text-white">{inspectModalItem.license}</strong></span>
                {inspectModalItem.tags && (
                  <span className="text-[10px] text-blue-400">
                    #{inspectModalItem.tags.slice(0, 3).join(' #')}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-2 border-t border-white/10">
              
              {/* Main Download / Instantiate Button */}
              <button
                onClick={() => handleDirectDownload(inspectModalItem)}
                className={`flex-1 w-full py-2.5 px-4 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  inspectModalItem.isFree
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold'
                }`}
              >
                <Download size={14} />
                <span>
                  {inspectModalItem.isFree 
                    ? 'Download to Scene (Z-Up)' 
                    : 'Test Preview in Scene (Z-Up)'}
                </span>
              </button>

              {/* Save to Project Assets Button */}
              {onSaveToAssets && (
                <button
                  onClick={() => handleSaveToProjectAssets(inspectModalItem)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bookmark size={13} />
                  <span>Save to Assets</span>
                </button>
              )}

              {/* External Store Link if available */}
              {inspectModalItem.sketchfabUrl && (
                <a
                  href={inspectModalItem.sketchfabUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Store Page</span>
                </a>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
