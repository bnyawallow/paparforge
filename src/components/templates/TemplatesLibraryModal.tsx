import React, { useState } from 'react';
import { useEditorStore, generateTemplate } from '../../store/useEditorStore';
import { TemplateType } from '../../types';
import { 
  X, LayoutTemplate, Sparkles, Check, ArrowRight, ShieldAlert,
  Car, Coffee, Gem, Building2, BookOpen, CreditCard, ShoppingBag, Eye, Zap, Layers, RefreshCw,
  Smartphone, Monitor, Box, Play, Move3d, Compass, Maximize2, ExternalLink
} from 'lucide-react';
import { GlassModal } from '../ui/HudComponents';
import { TemplateVisualBadge } from './TemplateVisualBadge';

export interface TemplatesLibraryModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export interface TemplateCardData {
  id: TemplateType;
  title: string;
  category: 'product' | 'auto' | 'food' | 'luxury' | 'realestate' | 'business' | 'education' | 'poster';
  categoryLabel: string;
  badge: string;
  description: string;
  printTargetScenario: string;
  features: string[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  bgGradient: string;
  // Polished Preview Screen Metadata
  modelName: string;
  modelThumbnail: string;
  stageDetails: string;
  spatialTextCopy: string;
  badgeText: string;
  ctaText: string;
  ctaColor: string;
  interactionDescription: string;
  entitiesBreakdown: { name: string; type: string; details: string }[];
  targetSpecs: {
    dimensions: string;
    aspectRatio: string;
    trackingRating: string;
    targetFormat: string;
  };
}

export const TEMPLATE_SCAFFOLDS: TemplateCardData[] = [
  {
    id: 'product_showcase',
    title: 'Magazine Product Showcase',
    category: 'product',
    categoryLabel: 'Product & Retail',
    badge: 'Popular Print Ad',
    description: 'Interactive 3D product model with spin controls, live color swatches, buy button CTA, video demo, and audio review.',
    printTargetScenario: 'Magazine Ads, Product Boxes & Catalogs',
    features: ['3D Mesh & Material Swatches', 'Interactive Buy Button CTA', 'Audio & Video Stream Support', 'Entrance HUD Animations'],
    icon: ShoppingBag,
    accentColor: '#3B82F6',
    bgGradient: 'from-blue-900/40 via-blue-950/20 to-transparent',
    modelName: 'Air Apex HyperSneaker 3D',
    modelThumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MaterialsVariantsShoe/screenshot/screenshot.png',
    stageDetails: 'Cyber Metallic Pedestal (Metalness: 0.9, Roughness: 0.2)',
    spatialTextCopy: 'AIR APEX PRO HYPER-SNEAKER\nSpatial Kinetic Fit',
    badgeText: '⚡ $189.99 (Limited Drop)',
    ctaText: 'PRE-ORDER NOW',
    ctaColor: '#FF007F',
    interactionDescription: 'Tap shoe to trigger custom Flex animation and toast confirmation.',
    entitiesBreakdown: [
      { name: 'AR Target', type: 'Image Target', details: 'A4 Magazine Print Anchor (10cm)' },
      { name: 'Air Apex HyperSneaker', type: '3D GLTF Model', details: 'Z-Up [90, 0, 45], Spin Behavior' },
      { name: 'Cyber Pedestal', type: 'Cylinder Stage', details: 'PBR Brushed Metal [0.6, 0.08, 0.6]' },
      { name: 'Orbit Halo Ring', type: 'Torus Light FX', details: 'Neon Cyan Emissive [0.55, 0.55, 0.03]' },
      { name: 'Product Title', type: 'Spatial 3D Text', details: 'Billboard Enabled, Outline Width 0.02' },
      { name: 'Pre-Order Button', type: 'Interactive Button', details: 'OnTap -> External Link' }
    ],
    targetSpecs: {
      dimensions: '21.0 × 29.7 cm (A4 Page)',
      aspectRatio: '1:1.41 (Portrait)',
      trackingRating: '5/5 Stars (High Feature Density)',
      targetFormat: 'High-contrast Glossy Print'
    }
  },
  {
    id: 'automobile_showroom',
    title: 'Automobile Showroom Print Ad',
    category: 'auto',
    categoryLabel: 'Automotive & Industrial',
    badge: '3D Drivable Buggy',
    description: '3D car chassis model with interactive color switcher, key specs readout, test drive booking button, and V8 engine audio.',
    printTargetScenario: 'Newspaper Ads, Car Catalogues & Billboards',
    features: ['Real-time Paint Swatches', 'Specs HUD Overlay', 'Drivable Physics with WASD', 'Test Drive Callout'],
    icon: Car,
    accentColor: '#F97316',
    bgGradient: 'from-amber-900/40 via-orange-950/20 to-transparent',
    modelName: 'Apex Titan-X Buggy 4x4',
    modelThumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Buggy/screenshot/screenshot.png',
    stageDetails: 'Reflective Showroom Turntable Stage (Metalness: 0.95, Roughness: 0.1)',
    spatialTextCopy: 'APEX TITAN-X OFF-ROAD BUGGY',
    badgeText: '⚡ DUAL AWD MOTOR | ACTIVE HYDRAULIC OBB SUSPENSION',
    ctaText: 'ENTER TEST DRIVE [W,A,S,D]',
    ctaColor: '#DC2626',
    interactionDescription: 'Drivable vehicle physics: Steer on-screen or with W, A, S, D keys.',
    entitiesBreakdown: [
      { name: 'AR Target', type: 'Image Target', details: 'Catalogue Spread Anchor (15cm)' },
      { name: 'Cyber Buggy 4x4', type: '3D Vehicle Model', details: 'Z-Up [90, 0, 0], SAT Box Collider' },
      { name: 'Reflective Podium', type: 'Cylinder Stage', details: 'Turn-table Base [1.5, 0.06, 1.5]' },
      { name: 'Performance Specs', type: 'Spatial 3D Text', details: 'Dual AWD Motor Callout' },
      { name: 'Test Drive CTA', type: 'Interactive Button', details: 'OnTap -> Physics Driving Mode' }
    ],
    targetSpecs: {
      dimensions: '29.7 × 42.0 cm (A3 Spread)',
      aspectRatio: '1.41:1 (Landscape)',
      trackingRating: '5/5 Stars (Automotive Target)',
      targetFormat: 'Matte Print / Newspaper Insert'
    }
  },
  {
    id: 'fast_food_beverage',
    title: 'Food & Beverage Promo Inserts',
    category: 'food',
    categoryLabel: 'Food & Dining',
    badge: 'High Conversion',
    description: 'Dynamic beverage can & gourmet combo box with floating flavor rings, promo coupon code pill, and delivery order CTA.',
    printTargetScenario: 'Menu Inserts, Table Tent Cards & Food Packaging',
    features: ['Floating Behavior FX', 'Promo Code Voucher Pill', 'Instant Delivery Order CTA', 'Spinning Asset Anchors'],
    icon: Coffee,
    accentColor: '#EAB308',
    bgGradient: 'from-yellow-900/40 via-amber-950/20 to-transparent',
    modelName: 'Gourmet Sparkling Beverage Bottle',
    modelThumbnail: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
    stageDetails: 'Amber Glow Pedestal with Orbital Flavor Particles',
    spatialTextCopy: 'CRISP CITRUS BURST • 100% ORGANIC',
    badgeText: '🎟️ CODE: REFRESH25 (25% OFF)',
    ctaText: 'ORDER EXPRESS DELIVERY',
    ctaColor: '#EAB308',
    interactionDescription: 'Tap bottle to trigger fizz audio chime and copy 25% discount voucher code.',
    entitiesBreakdown: [
      { name: 'AR Target', type: 'Image Target', details: 'Table Tent Card Anchor (10cm)' },
      { name: '3D Beverage Bottle', type: '3D GLTF Model', details: 'Z-Up [90, 0, 0], Float & Spin' },
      { name: 'Flavor Slice Ring', type: 'Torus Halo', details: 'Citrus Yellow Emissive Ring' },
      { name: 'Promo Voucher Pill', type: 'Spatial 3D Text', details: '25% Discount Coupon Badge' },
      { name: 'Order Button', type: 'Interactive Button', details: 'OnTap -> Express Delivery Link' }
    ],
    targetSpecs: {
      dimensions: '10.5 × 14.8 cm (A6 Tent Card)',
      aspectRatio: '1:1.41 (Portrait)',
      trackingRating: '4.8/5 Stars (Tabletop Media)',
      targetFormat: 'Laminated Table Tent / Coaster'
    }
  },
  {
    id: 'luxury_fashion',
    title: 'Luxury Fashion & Timepieces',
    category: 'luxury',
    categoryLabel: 'Luxury & Fashion',
    badge: 'PBR Physical Shader',
    description: 'Vintage brass camera & chronograph timepiece on marble pedestal with dynamic PBR clearcoat materials and luxury vault button.',
    printTargetScenario: 'Luxury Magazines, Store Display Posters',
    features: ['Reflective PBR Materials', 'Floating Sparkle FX', 'VIP Collection Button', 'Ambient Audio Node'],
    icon: Gem,
    accentColor: '#EC4899',
    bgGradient: 'from-pink-900/40 via-rose-950/20 to-transparent',
    modelName: 'Vintage Leica Brass Camera',
    modelThumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AntiqueCamera/screenshot/screenshot.jpg',
    stageDetails: 'Carrara Marble Display Pedestal with Gold Inlay',
    spatialTextCopy: 'HERITAGE CHRONOS COLLECTION\nCarl Zeiss Apocromatic 50mm',
    badgeText: '✨ EDITION N° 042 / 500',
    ctaText: 'ENTER VIP VAULT',
    ctaColor: '#DB2777',
    interactionDescription: 'Tap lens to focus camera shutter and reveal limited edition provenance certificate.',
    entitiesBreakdown: [
      { name: 'AR Target', type: 'Image Target', details: 'Glossy Magazine Print (12cm)' },
      { name: 'Vintage Leica Camera', type: '3D GLTF Model', details: 'Z-Up [90, 0, 0], PBR Metallic Brass' },
      { name: 'Carrara Marble Stage', type: 'Cylinder Stage', details: 'Specular Reflection Finish' },
      { name: 'Heritage Title', type: 'Spatial 3D Text', details: 'Gold Serif Typography' },
      { name: 'VIP Vault Button', type: 'Interactive Button', details: 'OnTap -> Private Concierge Link' }
    ],
    targetSpecs: {
      dimensions: '23.0 × 30.0 cm (Luxury Magazine)',
      aspectRatio: '1:1.3 (Portrait)',
      trackingRating: '5/5 Stars (High Contrast Textures)',
      targetFormat: 'Heavyweight Heavy-Gloss Print'
    }
  },
  {
    id: 'real_estate',
    title: 'Real Estate Brochure AR',
    category: 'realestate',
    categoryLabel: 'Real Estate & Architecture',
    badge: 'Interactive Floorplan',
    description: '3D villa architectural model with floor selector buttons, virtual tour trigger button, and direct agent call action.',
    printTargetScenario: 'Property Brochures, Yard Signs & Inserts',
    features: ['Architectural 3D Model', 'Floor Selector Buttons', 'Virtual Tour Video Player', 'Agent Contact Action'],
    icon: Building2,
    accentColor: '#10B981',
    bgGradient: 'from-emerald-900/40 via-teal-950/20 to-transparent',
    modelName: 'Modernist Horizon Villa & Lantern',
    modelThumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/screenshot/screenshot.png',
    stageDetails: 'Smoked Obsidian Glass Architectural Podium',
    spatialTextCopy: 'HORIZON SKYLINE RESIDENCES\nPenthouse Collection Suite 8B',
    badgeText: '🏡 $2,450,000 • 3,200 SQ FT',
    ctaText: 'BOOK 3D VIRTUAL TOUR',
    ctaColor: '#059669',
    interactionDescription: 'Tap villa floors to isolate floorplan layers and view panoramic balcony horizons.',
    entitiesBreakdown: [
      { name: 'AR Target', type: 'Image Target', details: 'Tri-Fold Property Brochure (10cm)' },
      { name: 'Architectural Model', type: '3D GLTF Model', details: 'Z-Up [90, 0, 0], PBR Glass & Metal' },
      { name: 'Glass Podium', type: 'Box Stage', details: 'Obsidian Smoked Acrylic Base' },
      { name: 'Residence Specs', type: 'Spatial 3D Text', details: 'Square Footage & Pricing Readout' },
      { name: 'Tour CTA Button', type: 'Interactive Button', details: 'OnTap -> 360° Virtual Tour Stream' }
    ],
    targetSpecs: {
      dimensions: '21.0 × 29.7 cm (Tri-fold Brochure)',
      aspectRatio: '1:1.41 (Portrait)',
      trackingRating: '4.9/5 Stars (Brochure Floorplan)',
      targetFormat: 'Matte Silk Finish Brochure'
    }
  },
  {
    id: 'business_card',
    title: 'Business Card WebAR',
    category: 'business',
    categoryLabel: 'Business & Professional',
    badge: 'Essential AR Card',
    description: '3D logo badge, quick tap social media icons, profile card, audio greeting, and direct vCard saved contact button.',
    printTargetScenario: 'Business Cards, Badges & Conference Passes',
    features: ['Interactive Social Icons', 'vCard Contact Trigger', '3D Emblem Ring', 'Audio Chime Greeting'],
    icon: CreditCard,
    accentColor: '#8B5CF6',
    bgGradient: 'from-purple-900/40 via-indigo-950/20 to-transparent',
    modelName: 'Apollo Astronaut Spacewalker Mascot',
    modelThumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop&q=80',
    stageDetails: 'Holographic Carbon Fiber Business Card Surface',
    spatialTextCopy: 'ALEXANDER VANCE\nPrincipal WebAR Solutions Architect',
    badgeText: '💼 SPATIAL COMPUTING & 3D COMMERCE',
    ctaText: 'DOWNLOAD VCARD CONTACT',
    ctaColor: '#7C3AED',
    interactionDescription: 'Tap astronaut to trigger wave animation and download digital contact card directly.',
    entitiesBreakdown: [
      { name: 'AR Target', type: 'Image Target', details: 'Standard Business Card (8.5 × 5.5 cm)' },
      { name: 'Astronaut Mascot', type: '3D GLTF Model', details: 'Z-Up [90, 0, 0], Wave Animation' },
      { name: 'Hologram Card Base', type: 'Plane Stage', details: 'Carbon Fiber Texture Decal' },
      { name: 'Identity Title', type: 'Spatial 3D Text', details: 'Name & Executive Title Billboard' },
      { name: 'vCard Action Button', type: 'Interactive Button', details: 'OnTap -> Instant Contact Download' }
    ],
    targetSpecs: {
      dimensions: '8.5 × 5.5 cm (Standard Business Card)',
      aspectRatio: '1.54:1 (Landscape)',
      trackingRating: '5/5 Stars (High Edge Contrast)',
      targetFormat: 'Heavy 350gsm Cardstock'
    }
  },
  {
    id: 'educational',
    title: 'Educational Book Interactive AR',
    category: 'education',
    categoryLabel: 'Education & STEM',
    badge: 'STEM Audio Narrator',
    description: '3D animated fox model with walk/run kinematics, facts info panel, voice narration sound node, and STEM quiz button.',
    printTargetScenario: 'School Textbooks, Flashcards & Science Posters',
    features: ['Kinematic Walk Motion', 'Voice Narration Player', 'Fact Spot annotation', 'Interactive STEM Quiz'],
    icon: BookOpen,
    accentColor: '#06B6D4',
    bgGradient: 'from-cyan-900/40 via-sky-950/20 to-transparent',
    modelName: 'STEM Animated Red Fox Model',
    modelThumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/screenshot/screenshot.png',
    stageDetails: 'Textured Woodland Grass Base with Biological Callout Hotspots',
    spatialTextCopy: 'VULPES VULPES (RED FOX)\nMammalian Kinematics & Biology',
    badgeText: '🔬 INTERACTIVE STEM FIELD GUIDE',
    ctaText: 'START INTERACTIVE QUIZ',
    ctaColor: '#0891B2',
    interactionDescription: 'Tap fox to toggle walk and run skeletal cycles and listen to habitat audio clips.',
    entitiesBreakdown: [
      { name: 'AR Target', type: 'Image Target', details: 'Textbook Science Illustration (14cm)' },
      { name: 'Animated Fox', type: '3D GLTF Model', details: 'Z-Up [90, 0, 0], Walk / Run Cycles' },
      { name: 'Woodland Stage', type: 'Cylinder Stage', details: 'Terrain Grass Base [0.8, 0.05, 0.8]' },
      { name: 'Biology Label', type: 'Spatial 3D Text', details: 'Scientific Classification Header' },
      { name: 'STEM Quiz Button', type: 'Interactive Button', details: 'OnTap -> Interactive Q&A Overlay' }
    ],
    targetSpecs: {
      dimensions: '18.0 × 24.0 cm (Textbook Page)',
      aspectRatio: '1:1.33 (Portrait)',
      trackingRating: '5/5 Stars (Detailed Illustration)',
      targetFormat: 'Textbook / Educational Flashcard'
    }
  },
  {
    id: 'billboard_poster',
    title: 'Billboard Scannable AR Ad',
    category: 'poster',
    categoryLabel: 'Outdoor & Events',
    badge: 'Large Scale Target',
    description: '3D Dragon creature bursting from billboard frame, movie trailer video screen, sound effect, and ticket booking CTA.',
    printTargetScenario: 'City Billboards, Event Posters & Bus Shelters',
    features: ['High-contrast Typography', 'Cinema Video Frame', 'Sound FX Action', 'Ticket Booking CTA'],
    icon: Zap,
    accentColor: '#F43F5E',
    bgGradient: 'from-rose-900/40 via-red-950/20 to-transparent',
    modelName: 'IMAX 3D Dragon Theatrical Creature',
    modelThumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DragonAttenuation/screenshot/screenshot.jpg',
    stageDetails: 'Metallic Billboard Bezel Frame with Neon Backlighting',
    spatialTextCopy: 'CHRONICLES OF PYROTH: REBORN\nIn IMAX Theatres Worldwide',
    badgeText: '🎟️ IN THEATRES THIS FRIDAY • GET ADVANCE TICKETS',
    ctaText: 'GET MOVIE TICKETS',
    ctaColor: '#E11D48',
    interactionDescription: 'Tap billboard to play movie trailer sound effect and open ticket booking portal.',
    entitiesBreakdown: [
      { name: 'AR Target', type: 'Image Target', details: 'Bus Shelter / Subway Poster (20cm)' },
      { name: 'IMAX 3D Dragon', type: '3D GLTF Model', details: 'Z-Up [90, 0, 0], Attenuation Glass' },
      { name: 'Billboard Frame', type: 'Box Stage', details: 'Metallic Extrusion Frame' },
      { name: 'Movie Title', type: 'Spatial 3D Text', details: 'Neon Theatrical Header' },
      { name: 'Tickets Button', type: 'Interactive Button', details: 'OnTap -> Fandango Booking Portal' }
    ],
    targetSpecs: {
      dimensions: '60.0 × 90.0 cm (Large Format Poster)',
      aspectRatio: '1:1.5 (Portrait)',
      trackingRating: '5/5 Stars (Outdoor Keypoints)',
      targetFormat: 'Backlit Cinema Display Poster'
    }
  },
  {
    id: 'face_filter_mask',
    title: 'AR Face Filter & Visor Mask',
    category: 'luxury',
    categoryLabel: 'Face Tracking & AR Filters',
    badge: 'Face Target Anchor',
    description: 'Interactive Sci-Fi Visor face mask with real 3D GLTF tracking, HUD pulse effects, and AR photo snapshot capture button.',
    printTargetScenario: 'Selfie Mirror, Social Promo, Event Filter',
    features: ['Real-time 68-Point Face Tracking', 'Neon Visor HUD Pulse', 'AR Snapshot Photo Button', 'Mobile Front Camera Ready'],
    icon: Sparkles,
    accentColor: '#A855F7',
    bgGradient: 'from-purple-900/40 via-fuchsia-950/20 to-transparent',
    modelName: 'Cyberpunk Neon Visor Mask',
    modelThumbnail: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/screenshot/screenshot.png',
    stageDetails: 'Face Occluder & 3D Spatial Tracking Geometry',
    spatialTextCopy: 'CYBERPUNK NEON VISOR\nReal-time Spatial Face Tracking',
    badgeText: '📸 TAP BUTTON TO CAPTURE SNAPSHOT',
    ctaText: 'CAPTURE AR PHOTO',
    ctaColor: '#9333EA',
    interactionDescription: 'Tracks user face in real-time via front camera; tap button to save branded AR photo.',
    entitiesBreakdown: [
      { name: 'Face Anchor', type: 'Face Target', details: '68 Keypoint Spatial Face Mesh Anchor' },
      { name: 'Sci-Fi Visor Mask', type: '3D GLTF Model', details: 'Z-Up [90, 0, 0], Emissive Visor' },
      { name: 'HUD Ring Overlay', type: 'Torus Light FX', details: 'Neon Purple Pulsing Reticle' },
      { name: 'Filter Title', type: 'Spatial 3D Text', details: 'AR Filter Brand Typography' },
      { name: 'Snapshot CTA', type: 'Interactive Button', details: 'OnTap -> Save Camera Frame' }
    ],
    targetSpecs: {
      dimensions: 'Dynamic Front Facing Video Feed',
      aspectRatio: '9:16 (Mobile Fullscreen)',
      trackingRating: '5/5 Stars (Face Mesh Geometry)',
      targetFormat: 'Smartphone Selfie Camera'
    }
  }
];

export function TemplatesLibraryModal({ isOpen = true, onClose }: TemplatesLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTemplate, setActiveTemplate] = useState<TemplateCardData>(TEMPLATE_SCAFFOLDS[0]);
  const [previewTab, setPreviewTab] = useState<'hologram' | 'breakdown' | 'specs'>('hologram');
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);
  const [simulatedActionActive, setSimulatedActionActive] = useState(false);

  const {
    objects,
    settings,
    applyTemplate,
    createProject,
    isProjectOpen,
    addToast
  } = useEditorStore();

  const objectCount = Object.keys(objects).length;

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'product', label: 'Product & Retail' },
    { id: 'auto', label: 'Automotive' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'luxury', label: 'Luxury & Jewelry' },
    { id: 'realestate', label: 'Real Estate' },
    { id: 'business', label: 'Business Cards' },
    { id: 'education', label: 'Education & STEM' },
    { id: 'poster', label: 'Billboards & Events' },
  ];

  const filteredTemplates = TEMPLATE_SCAFFOLDS.filter(
    tpl => selectedCategory === 'all' || tpl.category === selectedCategory
  );

  const handleApplyTemplate = (tpl: TemplateCardData) => {
    setActiveTemplate(tpl);
    if (isProjectOpen && objectCount > 1) {
      setConfirmReplaceOpen(true);
    } else {
      doApplyTemplate(tpl.id);
    }
  };

  const doApplyTemplate = (tplId: TemplateType) => {
    if (!isProjectOpen) {
      createProject(`${activeTemplate.title} Project`, tplId);
      addToast(`Created new project with "${activeTemplate.title}" template!`);
    } else {
      applyTemplate(tplId);
      addToast(`Loaded "${activeTemplate.title}" into scene!`);
    }
    setConfirmReplaceOpen(false);
    onClose();
  };

  const handleSimulateAction = () => {
    setSimulatedActionActive(true);
    addToast(activeTemplate.interactionDescription);
    setTimeout(() => setSimulatedActionActive(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      hideHeader={true}
      maxWidth="max-w-6xl"
      className="flex flex-col h-[90vh] max-h-[820px] p-0 overflow-hidden bg-[#0A0A0D] border border-[#22222E] shadow-2xl rounded-2xl"
    >
      {/* Modal Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#20202A] bg-[#111116] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-md">
            <LayoutTemplate size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide uppercase font-mono">
                WebAR Experience Templates & Scaffolding
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PRO PRINT TEMPLATES
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Interactive 3D scaffolds tailored for magazines, packaging, event posters, and business cards
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Close Templates Library"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Split Layout: Left 5/12 for Catalog List, Right 7/12 for Rich Visual Preview Screen */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Column: Template Cards Catalog */}
        <div className="w-5/12 border-r border-[#20202A] flex flex-col bg-[#0D0D12] overflow-hidden">
          
          {/* Category Filter Chips */}
          <div className="p-3 border-b border-[#20202A] bg-[#101017] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-mono font-semibold cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Templates Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
            {filteredTemplates.map(tpl => {
              const isSelected = activeTemplate.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setActiveTemplate(tpl)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 relative group select-none ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40'
                      : 'border-[#22222E] bg-[#14141C] hover:border-white/20 hover:bg-[#181824]'
                  }`}
                >
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-sm">
                    <TemplateVisualBadge templateId={tpl.id} size="sm" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate">{tpl.title}</h4>
                      <span 
                        className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border shrink-0"
                        style={{ backgroundColor: `${tpl.accentColor}15`, borderColor: `${tpl.accentColor}30`, color: tpl.accentColor }}
                      >
                        {tpl.badge}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 block truncate">
                      {tpl.printTargetScenario}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: High-Craft Visual Template Preview Screen */}
        <div className="w-7/12 flex flex-col bg-[#0B0B10] overflow-hidden">
          
          {/* Preview Navigation Tabs & Target Info */}
          <div className="px-6 py-3 border-b border-[#20202A] bg-[#111118] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewTab('hologram')}
                className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewTab === 'hologram'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye size={13} />
                <span>AR Perspective View</span>
              </button>

              <button
                onClick={() => setPreviewTab('breakdown')}
                className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewTab === 'breakdown'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers size={13} />
                <span>Included Entities ({activeTemplate.entitiesBreakdown.length})</span>
              </button>

              <button
                onClick={() => setPreviewTab('specs')}
                className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewTab === 'specs'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Compass size={13} />
                <span>Print & WebAR Specs</span>
              </button>
            </div>

            {/* Simulated Live Action Trigger */}
            <button
              onClick={handleSimulateAction}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                simulatedActionActive
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
              }`}
              title="Test interactive tap behavior"
            >
              <Zap size={13} className={simulatedActionActive ? 'text-emerald-400' : 'text-amber-400'} />
              <span>Simulate Tap Event</span>
            </button>
          </div>

          {/* Dynamic Preview Screen Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* 1. Hologram AR Perspective View */}
            {previewTab === 'hologram' && (
              <div className="space-y-4">
                
                {/* 3D AR Target Simulation Canvas Box */}
                <div className="w-full aspect-[16/10] rounded-2xl border border-[#2A2A38] bg-gradient-to-b from-[#14141E] via-[#0E0E16] to-[#0A0A0F] relative overflow-hidden shadow-2xl p-6 flex flex-col items-center justify-center select-none">
                  
                  {/* Camera Reticle Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>TARGET LOCKED (60 FPS)</span>
                  </div>

                  <div className="absolute top-3 right-3 text-[10px] font-mono text-gray-400 flex items-center gap-1">
                    <Smartphone size={12} />
                    <span>WebAR Viewport</span>
                  </div>

                  {/* Corner tracking brackets */}
                  <div className="absolute inset-4 border border-cyan-500/20 rounded-xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                  </div>

                  {/* Simulated 3D Plane with Perspective */}
                  <div className="relative z-10 flex flex-col items-center justify-center" style={{ perspective: '900px' }}>
                    
                    {/* Floating Spatial 3D Title */}
                    <div className="mb-2 text-center transform -translate-y-1">
                      <div className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-300 uppercase tracking-wider font-mono drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        {activeTemplate.spatialTextCopy.split('\n')[0]}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
                        {activeTemplate.badgeText}
                      </div>
                    </div>

                    {/* Central 3D Target Card with Hovering Hologram */}
                    <div className="relative flex flex-col items-center justify-center">
                      
                      {/* Physical Print Target Surface Card (Tilted) */}
                      <div 
                        className="w-56 h-36 rounded-xl border-2 border-dashed border-cyan-400/40 bg-gradient-to-tr from-slate-900 via-blue-950/40 to-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center justify-between p-3 transform rotate-x-25 transition-transform duration-500 hover:rotate-x-15"
                      >
                        <div className="flex items-center justify-between w-full text-[9px] font-mono text-cyan-300 font-bold">
                          <span>PRINT TARGET</span>
                          <span>{activeTemplate.targetSpecs.dimensions.split(' ')[0]}</span>
                        </div>

                        {/* Stage Podium Mesh */}
                        <div className="w-28 h-7 rounded-full bg-gradient-to-r from-slate-700 via-cyan-900 to-slate-800 border border-cyan-400/50 shadow-inner flex items-center justify-center text-[9px] font-mono text-cyan-200 font-bold">
                          Stage Pedestal
                        </div>

                        <div className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">
                          MindAR 60FPS Surface
                        </div>
                      </div>

                      {/* Floating 3D Model Asset hovering above the pedestal */}
                      <div 
                        className={`absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300 ${
                          simulatedActionActive ? 'scale-115 -translate-y-14' : 'hover:scale-105'
                        }`}
                      >
                        {/* 3D Asset Art Card */}
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-black to-slate-900 border-2 border-cyan-400/70 shadow-[0_15px_35px_rgba(0,243,255,0.25)] overflow-hidden flex items-center justify-center relative">
                          <img 
                            src={activeTemplate.modelThumbnail} 
                            alt={activeTemplate.modelName}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              // Fallback placeholder icon if image fails
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-1">
                            <span className="text-[8px] font-mono text-white font-bold tracking-tight text-center px-1 truncate w-full">
                              {activeTemplate.modelName}
                            </span>
                          </div>
                        </div>

                        {/* Drop Holographic Ray to Stage */}
                        <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-transparent" />
                      </div>

                    </div>

                    {/* Floating Interactive CTA Button */}
                    <div className="mt-3 transform translate-y-1">
                      <button
                        onClick={handleSimulateAction}
                        className="py-1.5 px-5 rounded-xl text-xs font-mono font-black tracking-wider uppercase text-white shadow-xl flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
                        style={{ backgroundColor: activeTemplate.ctaColor }}
                      >
                        <Zap size={12} />
                        <span>{activeTemplate.ctaText}</span>
                      </button>
                    </div>

                  </div>

                  {/* Bottom tracking status */}
                  <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-[10px] font-mono text-gray-400 border-t border-white/10 pt-2">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Sparkles size={11} /> Ready for Safari & Chrome
                    </span>
                    <span>No App Download Required</span>
                  </div>

                </div>

                {/* Details Banner */}
                <div className="p-4 rounded-xl bg-[#14141E] border border-[#22222E] flex items-start gap-3">
                  <div 
                    className="p-2 rounded-lg shrink-0 mt-0.5"
                    style={{ backgroundColor: `${activeTemplate.accentColor}20`, color: activeTemplate.accentColor }}
                  >
                    <activeTemplate.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      {activeTemplate.title}
                      <span className="text-[10px] font-mono text-gray-400 font-normal">
                        ({activeTemplate.categoryLabel})
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                      {activeTemplate.description}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                      <Check size={12} />
                      <span>{activeTemplate.interactionDescription}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. Included Entities Breakdown Tab */}
            {previewTab === 'breakdown' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase font-bold text-gray-400 tracking-wider">
                    Scene Hierarchy Structure ({activeTemplate.entitiesBreakdown.length} Entities)
                  </span>
                  <span className="text-[11px] font-mono text-blue-400">
                    Auto-configured with Z-Up Orientation
                  </span>
                </div>

                <div className="space-y-2">
                  {activeTemplate.entitiesBreakdown.map((entity, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-[#13131C] border border-[#22222E] flex items-center justify-between hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-blue-400">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{entity.name}</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300">
                              {entity.type}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">
                            {entity.details}
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check size={12} /> Configured
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Print & WebAR Specs Tab */}
            {previewTab === 'specs' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#13131C] border border-[#22222E] space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Target Dimensions</span>
                    <div className="text-sm font-bold text-white font-mono">{activeTemplate.targetSpecs.dimensions}</div>
                    <span className="text-[10px] text-gray-400">Recommended print size for optimal detection</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#13131C] border border-[#22222E] space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Target Aspect Ratio</span>
                    <div className="text-sm font-bold text-white font-mono">{activeTemplate.targetSpecs.aspectRatio}</div>
                    <span className="text-[10px] text-gray-400">Maintains proportional scaling on camera frames</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#13131C] border border-[#22222E] space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">MindAR Keypoint Rating</span>
                    <div className="text-sm font-bold text-emerald-400 font-mono">{activeTemplate.targetSpecs.trackingRating}</div>
                    <span className="text-[10px] text-gray-400">Sub-pixel tracking stability</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#13131C] border border-[#22222E] space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Media Format</span>
                    <div className="text-sm font-bold text-blue-400 font-mono">{activeTemplate.targetSpecs.targetFormat}</div>
                    <span className="text-[10px] text-gray-400">Compatible with physical print surfaces</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="p-4 rounded-xl bg-[#13131C] border border-[#22222E] space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-gray-400">
                    Included Interactive Features:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {activeTemplate.features.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                        <Check size={13} className="text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 border-t border-[#20202A] bg-[#0E0E14] flex items-center justify-between shrink-0">
            <div className="text-xs text-gray-400 font-mono">
              Selected: <strong className="text-white">{activeTemplate.title}</strong>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-gray-400 hover:text-white uppercase tracking-wider cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => handleApplyTemplate(activeTemplate)}
                className="py-2.5 px-6 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white shadow-xl transition-all flex items-center gap-2 cursor-pointer hover:opacity-95 active:scale-98"
                style={{ backgroundColor: activeTemplate.accentColor }}
              >
                <span>Apply Scaffold to Scene</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Dialog Overlay */}
      {confirmReplaceOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181824] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <ShieldAlert size={24} />
              <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-white">
                Replace Current Scene?
              </h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Your scene currently has <strong className="text-white">{objectCount} objects</strong>. Applying the <strong className="text-blue-400">{activeTemplate.title}</strong> template will replace existing objects with this scaffold.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmReplaceOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold font-mono text-gray-300 uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => doApplyTemplate(activeTemplate.id)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold font-mono text-white uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </GlassModal>
  );
}
