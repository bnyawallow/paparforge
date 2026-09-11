import { SceneObject } from '../types';

export interface ArchitecturalAsset {
  id: string;
  name: string;
  category: 'Furniture' | 'Architecture' | 'Lighting' | 'Decor & Plants' | 'Retail & Display';
  description: string;
  badge: string;
  badgeColor?: string;
  icon: string;
  previewGradient?: string;
  previewColor: string;
  tags?: string[];
  createObject: (id: string) => SceneObject;
}

export const ARCHITECTURAL_ASSETS: ArchitecturalAsset[] = [
  // --- FURNITURE ---
  {
    id: 'arch-lounge-chair',
    name: 'Modern Lounge Armchair',
    category: 'Furniture',
    description: 'Contemporary Scandinavian lounge armchair with upholstered cushion and angled oak legs.',
    badge: 'FURNITURE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: '🪑',
    previewColor: '#059669',
    previewGradient: 'radial-gradient(circle, #10b981 0%, #065f46 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Modern Lounge Armchair',
      type: 'box',
      position: [0, 0.35, 0],
      rotation: [0, 0, 0],
      scale: [0.7, 0.7, 0.7],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#d97706',
        roughness: 0.8,
        metalness: 0.1,
        clearcoat: 0.05,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },
  {
    id: 'arch-coffee-table',
    name: 'Minimalist Coffee Table',
    category: 'Furniture',
    description: 'Architectural tempered glass top table with dark walnut structural frame.',
    badge: 'FURNITURE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: '🛋️',
    previewColor: '#0284c7',
    previewGradient: 'radial-gradient(circle, #38bdf8 0%, #0369a1 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Minimalist Coffee Table',
      type: 'cylinder',
      position: [0, 0.22, 0],
      rotation: [0, 0, 0],
      scale: [0.9, 0.45, 0.9],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#1e293b',
        roughness: 0.2,
        metalness: 0.3,
        transmission: 0.7,
        opacity: 0.85,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },
  {
    id: 'arch-modular-sofa',
    name: 'Contemporary Modular Sofa',
    category: 'Furniture',
    description: 'Low-profile minimalist sectional sofa block with premium linen texture.',
    badge: 'FURNITURE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: '🛋️',
    previewColor: '#6366f1',
    previewGradient: 'radial-gradient(circle, #818cf8 0%, #3730a3 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Contemporary Modular Sofa',
      type: 'box',
      position: [0, 0.3, 0],
      rotation: [0, 0, 0],
      scale: [1.6, 0.6, 0.8],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#475569',
        roughness: 0.85,
        metalness: 0.05,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },
  {
    id: 'arch-workstation-desk',
    name: 'Executive Studio Desk',
    category: 'Furniture',
    description: 'Solid natural oak desktop on matte black powder-coated steel trestle base.',
    badge: 'STUDIO',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: '💻',
    previewColor: '#b45309',
    previewGradient: 'radial-gradient(circle, #f59e0b 0%, #78350f 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Executive Studio Desk',
      type: 'box',
      position: [0, 0.38, 0],
      rotation: [0, 0, 0],
      scale: [1.4, 0.75, 0.7],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#78350f',
        roughness: 0.6,
        metalness: 0.1,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },
  {
    id: 'arch-bookshelf',
    name: 'Nordic Modular Bookshelf',
    category: 'Furniture',
    description: 'Multi-tier open architectural shelving unit for product or gallery presentation.',
    badge: 'FURNITURE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: '📚',
    previewColor: '#10b981',
    previewGradient: 'radial-gradient(circle, #34d399 0%, #064e3b 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Nordic Modular Bookshelf',
      type: 'box',
      position: [0, 0.8, 0],
      rotation: [0, 0, 0],
      scale: [0.9, 1.6, 0.35],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#334155',
        roughness: 0.5,
        metalness: 0.15,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },

  // --- ARCHITECTURE ---
  {
    id: 'arch-fluted-column',
    name: 'Architectural Fluted Column',
    category: 'Architecture',
    description: 'Classical neoclassical column pillar rendered in matte travertine marble.',
    badge: 'ARCHITECTURAL',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: '🏛️',
    previewColor: '#a855f7',
    previewGradient: 'radial-gradient(circle, #c084fc 0%, #581c87 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Architectural Fluted Column',
      type: 'cylinder',
      position: [0, 1.0, 0],
      rotation: [0, 0, 0],
      scale: [0.35, 2.0, 0.35],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#e2e8f0',
        roughness: 0.3,
        metalness: 0.1,
        clearcoat: 0.2,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },
  {
    id: 'arch-glass-partition',
    name: 'Acoustic Glass Partition',
    category: 'Architecture',
    description: 'Architectural frosted fluted glass screen divider with dark bronze framing.',
    badge: 'ARCHITECTURAL',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: '🪟',
    previewColor: '#38bdf8',
    previewGradient: 'radial-gradient(circle, #7dd3fc 0%, #0369a1 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Acoustic Glass Partition',
      type: 'box',
      position: [0, 1.0, 0],
      rotation: [0, 0, 0],
      scale: [1.2, 2.0, 0.06],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#f8fafc',
        transmission: 0.85,
        opacity: 0.7,
        roughness: 0.25,
        metalness: 0.1,
        clearcoat: 0.8,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },

  // --- LIGHTING ---
  {
    id: 'arch-arc-lamp',
    name: 'Modern Floor Arc Lamp',
    category: 'Lighting',
    description: 'Curved brass floor lamp with directional hemisphere diffuser head.',
    badge: 'LIGHTING',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    icon: '💡',
    previewColor: '#eab308',
    previewGradient: 'radial-gradient(circle, #facc15 0%, #854d0e 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Modern Floor Arc Lamp',
      type: 'torus',
      position: [0, 0.9, 0],
      rotation: [90, 0, 0],
      scale: [0.6, 0.6, 0.6],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#eab308',
        metalness: 0.85,
        roughness: 0.2,
        emissiveColor: '#fef08a',
        emissiveIntensity: 0.3,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },
  {
    id: 'arch-pendant-light',
    name: 'Minimalist Cone Pendant',
    category: 'Lighting',
    description: 'Architectural ceiling drop cone pendant in matte anthracite finish.',
    badge: 'LIGHTING',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    icon: '🏮',
    previewColor: '#f59e0b',
    previewGradient: 'radial-gradient(circle, #fbbf24 0%, #9a3412 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Minimalist Cone Pendant',
      type: 'cone',
      position: [0, 1.2, 0],
      rotation: [180, 0, 0],
      scale: [0.4, 0.5, 0.4],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#18181b',
        roughness: 0.4,
        metalness: 0.6,
        emissiveColor: '#fed7aa',
        emissiveIntensity: 0.4,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },

  // --- DECOR & PLANTS ---
  {
    id: 'arch-fiddle-leaf-planter',
    name: 'Fiddle Leaf Fig Ceramic Planter',
    category: 'Decor & Plants',
    description: 'Botanical architectural plant in a cylindrical fluted white ceramic pot.',
    badge: 'BIOPHILIC',
    badgeColor: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    icon: '🪴',
    previewColor: '#65a30d',
    previewGradient: 'radial-gradient(circle, #84cc16 0%, #365314 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Fiddle Leaf Fig Planter',
      type: 'cylinder',
      position: [0, 0.4, 0],
      rotation: [0, 0, 0],
      scale: [0.35, 0.8, 0.35],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#15803d',
        roughness: 0.65,
        metalness: 0.05,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },
  {
    id: 'arch-gallery-frame',
    name: 'Gallery Picture & Art Frame',
    category: 'Decor & Plants',
    description: 'Ultra-thin architectural matte black picture frame ideal for print target overlays.',
    badge: 'FRAME',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: '🖼️',
    previewColor: '#06b6d4',
    previewGradient: 'radial-gradient(circle, #22d3ee 0%, #164e63 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Gallery Art Frame',
      type: 'plane',
      position: [0, 0.6, 0],
      rotation: [0, 0, 0],
      scale: [0.8, 1.1, 1],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#f1f5f9',
        roughness: 0.4,
        metalness: 0.1,
        doubleSided: true,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },

  // --- RETAIL & DISPLAY ---
  {
    id: 'arch-display-podium',
    name: 'Museum Exhibition Plinth',
    category: 'Retail & Display',
    description: 'Polished micro-cement display pedestal for featuring AR products on print markers.',
    badge: 'DISPLAY',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: '🏛️',
    previewColor: '#e11d48',
    previewGradient: 'radial-gradient(circle, #fb7185 0%, #881337 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Museum Exhibition Plinth',
      type: 'box',
      position: [0, 0.4, 0],
      rotation: [0, 0, 0],
      scale: [0.6, 0.8, 0.6],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#e2e8f0',
        roughness: 0.35,
        metalness: 0.1,
        clearcoat: 0.15,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },
  {
    id: 'arch-retail-standee',
    name: 'AR Retail Standee Kiosk',
    category: 'Retail & Display',
    description: 'Vertical retail advertising totem kiosk with interactive front display area.',
    badge: 'KIOSK',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: '📱',
    previewColor: '#2563eb',
    previewGradient: 'radial-gradient(circle, #60a5fa 0%, #1e3a8a 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'AR Retail Standee Kiosk',
      type: 'box',
      position: [0, 0.85, 0],
      rotation: [0, 0, 0],
      scale: [0.65, 1.7, 0.15],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#0f172a',
        roughness: 0.25,
        metalness: 0.7,
        clearcoat: 0.4,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  },
  {
    id: 'arch-packaging-box',
    name: 'Premium AR Packaging Box',
    category: 'Retail & Display',
    description: 'Matte luxury product folding carton engineered for product placement overlays.',
    badge: 'PACKAGING',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    icon: '📦',
    previewColor: '#7c3aed',
    previewGradient: 'radial-gradient(circle, #a78bfa 0%, #4c1d95 100%)',
    createObject: (id: string): SceneObject => ({
      id,
      name: 'Premium AR Packaging Box',
      type: 'box',
      position: [0, 0.25, 0],
      rotation: [0, 15, 0],
      scale: [0.5, 0.5, 0.5],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        color: '#1e1b4b',
        roughness: 0.3,
        metalness: 0.2,
        clearcoat: 0.5,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    })
  }
];
