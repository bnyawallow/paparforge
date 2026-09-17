import { SceneObject, Vector3Data } from '../types';

export interface DesignFont {
  id: string;
  name: string;
  family: string;
  cssFamily: string;
  category: 'Serif' | 'Sans-Serif' | 'Display' | 'Script' | 'Monospace' | 'Condensed';
  description: string;
  weights: string[];
  url: string; // WOFF font URL for Drei 3D <Text>
  sampleWord: string;
}

export const DESIGN_FONTS: DesignFont[] = [
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    family: 'Playfair Display',
    cssFamily: "'Playfair Display', Georgia, serif",
    category: 'Serif',
    description: 'High-contrast editorial serif; the global standard for fashion magazines, luxury print & titles.',
    weights: ['400', '600', '700', '800', '900'],
    url: 'https://unpkg.com/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff',
    sampleWord: 'Editorial Haute',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: 'Montserrat',
    cssFamily: "'Montserrat', sans-serif",
    category: 'Sans-Serif',
    description: 'Modern geometric architectural sans; ubiquitous in print posters, branding & signage.',
    weights: ['300', '400', '600', '700', '800', '900'],
    url: 'https://unpkg.com/@fontsource/montserrat/files/montserrat-latin-400-normal.woff',
    sampleWord: 'Geometric Modern',
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    family: 'Cinzel',
    cssFamily: "'Cinzel', Georgia, serif",
    category: 'Display',
    description: 'Imperial Roman inscriptions serif; gold foil print, luxury packaging, awards & monograms.',
    weights: ['400', '600', '700', '800', '900'],
    url: 'https://unpkg.com/@fontsource/cinzel/files/cinzel-latin-400-normal.woff',
    sampleWord: 'Imperial Roman',
  },
  {
    id: 'bebas-neue',
    name: 'Bebas Neue',
    family: 'Bebas Neue',
    cssFamily: "'Bebas Neue', sans-serif",
    category: 'Condensed',
    description: 'All-caps condensed impact poster font; punchy billboards, movie posters & bold headlines.',
    weights: ['400'],
    url: 'https://unpkg.com/@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff',
    sampleWord: 'BOLD BILLBOARD',
  },
  {
    id: 'oswald',
    name: 'Oswald',
    family: 'Oswald',
    cssFamily: "'Oswald', sans-serif",
    category: 'Condensed',
    description: 'Classic Gothic newspaper headline lettering adapted for bold modern print.',
    weights: ['400', '500', '600', '700'],
    url: 'https://unpkg.com/@fontsource/oswald/files/oswald-latin-400-normal.woff',
    sampleWord: 'BROADSHEET NEWS',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    family: 'Poppins',
    cssFamily: "'Poppins', sans-serif",
    category: 'Sans-Serif',
    description: 'Geometric sans with optical circles; high-fashion brochures & contemporary print branding.',
    weights: ['300', '400', '500', '600', '700', '800'],
    url: 'https://unpkg.com/@fontsource/poppins/files/poppins-latin-400-normal.woff',
    sampleWord: 'Clean Geometry',
  },
  {
    id: 'syne',
    name: 'Syne',
    family: 'Syne',
    cssFamily: "'Syne', sans-serif",
    category: 'Display',
    description: 'Avant-garde exhibition art direction font with extreme widths for modern art catalogs.',
    weights: ['600', '700', '800'],
    url: 'https://unpkg.com/@fontsource/syne/files/syne-latin-700-normal.woff',
    sampleWord: 'Avant-Garde Art',
  },
  {
    id: 'anton',
    name: 'Anton',
    family: 'Anton',
    cssFamily: "'Anton', sans-serif",
    category: 'Condensed',
    description: 'Ultra-heavy advertising block sans for maximum visual contrast on posters and flyers.',
    weights: ['400'],
    url: 'https://unpkg.com/@fontsource/anton/files/anton-latin-400-normal.woff',
    sampleWord: 'MAXIMUM PUNCH',
  },
  {
    id: 'abril-fatface',
    name: 'Abril Fatface',
    family: 'Abril Fatface',
    cssFamily: "'Abril Fatface', serif",
    category: 'Display',
    description: 'Glamorous 19th-century Didone titling serif; dramatic thicks-and-thins for print fashion covers.',
    weights: ['400'],
    url: 'https://unpkg.com/@fontsource/abril-fatface/files/abril-fatface-latin-400-normal.woff',
    sampleWord: 'Glamour Didone',
  },
  {
    id: 'righteous',
    name: 'Righteous',
    family: 'Righteous',
    cssFamily: "'Righteous', cursive",
    category: 'Display',
    description: 'Art Deco / 80s arcade geometric curves; retro print posters, neon signs & music packaging.',
    weights: ['400'],
    url: 'https://unpkg.com/@fontsource/righteous/files/righteous-latin-400-normal.woff',
    sampleWord: 'Retro Neon Wave',
  },
  {
    id: 'orbitron',
    name: 'Orbitron',
    family: 'Orbitron',
    cssFamily: "'Orbitron', sans-serif",
    category: 'Display',
    description: 'Futuristic geometric sci-fi font with 45-degree angled cuts; cyberpunk & telemetry prints.',
    weights: ['500', '700', '900'],
    url: 'https://unpkg.com/@fontsource/orbitron/files/orbitron-latin-400-normal.woff',
    sampleWord: 'CYBER MATRIX',
  },
  {
    id: 'pacifico',
    name: 'Pacifico',
    family: 'Pacifico',
    cssFamily: "'Pacifico', cursive",
    category: 'Script',
    description: 'Warm original surf sign-painter script; artisanal packaging, summer prints & friendly menus.',
    weights: ['400'],
    url: 'https://unpkg.com/@fontsource/pacifico/files/pacifico-latin-400-normal.woff',
    sampleWord: 'Artisan Cafe',
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    family: 'Dancing Script',
    cssFamily: "'Dancing Script', cursive",
    category: 'Script',
    description: 'Lively casual cursive with bouncing baselines for invitations, cards and celebrations.',
    weights: ['500', '700'],
    url: 'https://unpkg.com/@fontsource/dancing-script/files/dancing-script-latin-700-normal.woff',
    sampleWord: 'Celebration Joy',
  },
  {
    id: 'great-vibes',
    name: 'Great Vibes',
    family: 'Great Vibes',
    cssFamily: "'Great Vibes', cursive",
    category: 'Script',
    description: 'Regal calligraphic script with sweeping loops for wedding invitations and luxury certificates.',
    weights: ['400'],
    url: 'https://unpkg.com/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff',
    sampleWord: 'Luxury Invitation',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    family: 'Space Grotesk',
    cssFamily: "'Space Grotesk', sans-serif",
    category: 'Sans-Serif',
    description: 'Brutalist neo-grotesque font for contemporary art galleries, architecture & exhibition catalogs.',
    weights: ['500', '700'],
    url: 'https://unpkg.com/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff',
    sampleWord: 'Brutalist Studio',
  },
  {
    id: 'lora',
    name: 'Lora',
    family: 'Lora',
    cssFamily: "'Lora', Georgia, serif",
    category: 'Serif',
    description: 'Contemporary literary serif with brushed curves; perfect for books, essays & editorial copy.',
    weights: ['400', '500', '600', '700'],
    url: 'https://unpkg.com/@fontsource/lora/files/lora-latin-400-normal.woff',
    sampleWord: 'Literary Journal',
  },
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans',
    family: 'Plus Jakarta Sans',
    cssFamily: "'Plus Jakarta Sans', sans-serif",
    category: 'Sans-Serif',
    description: 'Ultra-refined geometric sans engineered for print brand design and spatial UI clarity.',
    weights: ['400', '600', '700', '800'],
    url: 'https://unpkg.com/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
    sampleWord: 'Spatial Vision',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: 'Outfit',
    cssFamily: "'Outfit', sans-serif",
    category: 'Sans-Serif',
    description: 'Geometric display sans with friendly character; clean branding, logos and posters.',
    weights: ['400', '600', '700', '800'],
    url: 'https://unpkg.com/@fontsource/outfit/files/outfit-latin-600-normal.woff',
    sampleWord: 'Brand Identity',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: 'JetBrains Mono',
    cssFamily: "'JetBrains Mono', monospace",
    category: 'Monospace',
    description: 'Crisp technical monospaced font with high legibility for blueprints, telemetry & coordinates.',
    weights: ['400', '500', '700'],
    url: 'https://unpkg.com/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff',
    sampleWord: 'POS: 42.109, -71.02',
  },
];

export type UnifiedTextCategory =
  | 'Trending Print & Editorial'
  | 'Neon & Nightlife Glow'
  | 'Luxury Gold & Bronze'
  | 'Bold Billboard & Posters'
  | 'Artisanal & Scripts'
  | 'Futuristic & Cyber'
  | 'Minimal & Modern'
  | 'Badges & Callouts'
  | 'Buttons & CTAs';

export interface UnifiedTextPreset {
  id: string;
  name: string;
  category: UnifiedTextCategory;
  fontId: string;
  fontFamily: string;
  sampleText: string;
  description: string;
  badge: string;
  badgeColor?: string;
  tags: string[];
  // Visual styling for Canva-like previews and 2D HUD rendering
  style: {
    fontFamily: string;
    fontSize?: string;
    fontWeight?: string;
    color: string;
    letterSpacing?: string;
    textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
    fontStyle?: 'italic' | 'normal';
    textShadow?: string;
    background?: string;
    border?: string;
    borderRadius?: string;
    padding?: string;
    boxShadow?: string;
    backdropFilter?: string;
  };
  // Properties applied to 3D Scene <Text> objects
  properties3D: {
    color: string;
    outlineColor?: string;
    outlineWidth?: number;
    letterSpacing?: number;
    lineHeight?: number;
    fontUrl: string;
    billboard?: boolean;
    fontSize?: number;
    depth?: number;
    bevelEnabled?: boolean;
  };
  // Properties applied to 2D HUD text/button objects
  properties2D: {
    color: string;
    fontFamily: string;
    fontWeight: string;
    fontSize: number;
    letterSpacing?: string;
    textTransform?: string;
    fontStyle?: string;
    textShadow?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    paddingX?: number;
    paddingY?: number;
    boxShadow?: string;
    backdropFilter?: string;
  };
  defaultTarget: '3D Scene' | '2D HUD';
}

export const UNIFIED_TEXT_PRESETS: UnifiedTextPreset[] = [
  // ==========================================
  // 1. TRENDING PRINT & EDITORIAL
  // ==========================================
  {
    id: 'preset-vogue-couture',
    name: 'Vogue Haute Couture',
    category: 'Trending Print & Editorial',
    fontId: 'playfair-display',
    fontFamily: "'Playfair Display', serif",
    sampleText: 'VOGUE COUTURE',
    description: 'High-contrast luxury Didone serif with dramatic italics for premium fashion lookbooks and print posters.',
    badge: 'EDITORIAL',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    tags: ['editorial', 'luxury', 'fashion', 'serif', 'vogue'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '22px',
      fontWeight: '700',
      fontStyle: 'italic',
      color: '#ffffff',
      letterSpacing: '0.08em',
      textShadow: '0 2px 14px rgba(255,255,255,0.35)',
    },
    properties3D: {
      color: '#ffffff',
      outlineColor: '#1c1917',
      outlineWidth: 0.015,
      letterSpacing: 0.08,
      lineHeight: 1.15,
      fontUrl: 'https://unpkg.com/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.35,
    },
    properties2D: {
      color: '#ffffff',
      fontFamily: "'Playfair Display', serif",
      fontWeight: '700',
      fontStyle: 'italic',
      fontSize: 34,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      textShadow: '0 2px 14px rgba(255,255,255,0.35)',
    },
  },
  {
    id: 'preset-bazaar-headline',
    name: 'Harper Fashion Title',
    category: 'Trending Print & Editorial',
    fontId: 'abril-fatface',
    fontFamily: "'Abril Fatface', serif",
    sampleText: 'SUMMER ISSUE',
    description: 'Dramatic 19th-century Didone titling weight with lush curves; magazine cover headlines and art prints.',
    badge: 'MAGAZINE',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    tags: ['fashion', 'didone', 'bazaar', 'summer', 'cover'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Abril Fatface', serif",
      fontSize: '24px',
      fontWeight: '400',
      color: '#f43f5e',
      letterSpacing: '0.02em',
      textShadow: '0 4px 20px rgba(244,63,94,0.4)',
    },
    properties3D: {
      color: '#f43f5e',
      outlineColor: '#881337',
      outlineWidth: 0.02,
      letterSpacing: 0.04,
      lineHeight: 1.1,
      fontUrl: 'https://unpkg.com/@fontsource/abril-fatface/files/abril-fatface-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.38,
    },
    properties2D: {
      color: '#f43f5e',
      fontFamily: "'Abril Fatface', serif",
      fontWeight: '400',
      fontSize: 36,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      textShadow: '0 4px 20px rgba(244,63,94,0.4)',
    },
  },
  {
    id: 'preset-literary-journal',
    name: 'The Paris Review',
    category: 'Trending Print & Editorial',
    fontId: 'lora',
    fontFamily: "'Lora', serif",
    sampleText: 'Literary Anthology',
    description: 'Contemporary brushed literary serif for long-form editorial essays, book titles and cultural flyers.',
    badge: 'LITERARY',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    tags: ['literary', 'books', 'editorial', 'journal', 'essay'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Lora', Georgia, serif",
      fontSize: '20px',
      fontWeight: '600',
      fontStyle: 'italic',
      color: '#fef3c7',
      letterSpacing: '0.03em',
      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
    },
    properties3D: {
      color: '#fef3c7',
      outlineColor: '#451a03',
      outlineWidth: 0.015,
      letterSpacing: 0.03,
      lineHeight: 1.25,
      fontUrl: 'https://unpkg.com/@fontsource/lora/files/lora-latin-400-normal.woff',
      billboard: false,
      fontSize: 0.3,
    },
    properties2D: {
      color: '#fef3c7',
      fontFamily: "'Lora', Georgia, serif",
      fontWeight: '600',
      fontStyle: 'italic',
      fontSize: 28,
      letterSpacing: '0.03em',
    },
  },
  {
    id: 'preset-avant-garde-art',
    name: 'Avant-Garde Exhibition',
    category: 'Trending Print & Editorial',
    fontId: 'syne',
    fontFamily: "'Syne', sans-serif",
    sampleText: 'BIENNALE 2026',
    description: 'Ultra-wide contemporary art-direction display typography for contemporary gallery catalogs and posters.',
    badge: 'GALLERY',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    tags: ['art', 'gallery', 'biennale', 'exhibition', 'syne'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Syne', sans-serif",
      fontSize: '22px',
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: '0.18em',
      textShadow: '0 0 20px rgba(168,85,247,0.6)',
    },
    properties3D: {
      color: '#ffffff',
      outlineColor: '#581c87',
      outlineWidth: 0.02,
      letterSpacing: 0.16,
      lineHeight: 1.2,
      fontUrl: 'https://unpkg.com/@fontsource/syne/files/syne-latin-700-normal.woff',
      billboard: true,
      fontSize: 0.32,
    },
    properties2D: {
      color: '#ffffff',
      fontFamily: "'Syne', sans-serif",
      fontWeight: '800',
      fontSize: 32,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      textShadow: '0 0 20px rgba(168,85,247,0.6)',
    },
  },

  // ==========================================
  // 2. NEON & NIGHTLIFE GLOW
  // ==========================================
  {
    id: 'preset-tokyo-cyber-neon',
    name: 'Tokyo Neon Nights',
    category: 'Neon & Nightlife Glow',
    fontId: 'righteous',
    fontFamily: "'Righteous', cursive",
    sampleText: 'TOKYO NIGHTS',
    description: 'Electric dual-tone neon sign typography with cyan core and glowing magenta outer corona.',
    badge: 'NEON GLOW',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    tags: ['neon', 'tokyo', 'glow', 'arcade', 'retro'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Righteous', cursive",
      fontSize: '22px',
      fontWeight: '400',
      color: '#22d3ee',
      letterSpacing: '0.06em',
      textShadow: '0 0 8px #06b6d4, 0 0 20px #ec4899, 0 0 35px #be185d',
    },
    properties3D: {
      color: '#22d3ee',
      outlineColor: '#ec4899',
      outlineWidth: 0.03,
      letterSpacing: 0.06,
      lineHeight: 1.2,
      fontUrl: 'https://unpkg.com/@fontsource/righteous/files/righteous-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.35,
    },
    properties2D: {
      color: '#22d3ee',
      fontFamily: "'Righteous', cursive",
      fontWeight: '400',
      fontSize: 34,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      textShadow: '0 0 8px #06b6d4, 0 0 20px #ec4899, 0 0 35px #be185d',
    },
  },
  {
    id: 'preset-laser-synthwave',
    name: '80s Synthwave Grid',
    category: 'Neon & Nightlife Glow',
    fontId: 'orbitron',
    fontFamily: "'Orbitron', sans-serif",
    sampleText: 'OUTRUN 1984',
    description: 'Vibrant hot magenta and orange glow with retro-futuristic angled geometry.',
    badge: 'SYNTHWAVE',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    tags: ['synthwave', '80s', 'outrun', 'arcade', 'magenta'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '20px',
      fontWeight: '900',
      color: '#f0abfc',
      letterSpacing: '0.12em',
      textShadow: '0 0 10px #e879f9, 0 0 25px #c026d3, 0 0 40px #f97316',
    },
    properties3D: {
      color: '#f0abfc',
      outlineColor: '#c026d3',
      outlineWidth: 0.025,
      letterSpacing: 0.1,
      lineHeight: 1.2,
      fontUrl: 'https://unpkg.com/@fontsource/orbitron/files/orbitron-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.32,
    },
    properties2D: {
      color: '#f0abfc',
      fontFamily: "'Orbitron', sans-serif",
      fontWeight: '900',
      fontSize: 32,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      textShadow: '0 0 10px #e879f9, 0 0 25px #c026d3, 0 0 40px #f97316',
    },
  },
  {
    id: 'preset-amber-cocktail-bar',
    name: 'Golden Sunset Lounge',
    category: 'Neon & Nightlife Glow',
    fontId: 'righteous',
    fontFamily: "'Righteous', cursive",
    sampleText: 'GOLDEN HOUR',
    description: 'Warm incandescent amber neon glow for cocktail bar flyers, festival menus and night events.',
    badge: 'AMBER GLOW',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    tags: ['amber', 'lounge', 'bar', 'warm', 'sunset'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Righteous', cursive",
      fontSize: '22px',
      fontWeight: '400',
      color: '#fef08a',
      letterSpacing: '0.08em',
      textShadow: '0 0 10px #eab308, 0 0 24px #ca8a04, 0 0 45px #ea580c',
    },
    properties3D: {
      color: '#fef08a',
      outlineColor: '#b45309',
      outlineWidth: 0.025,
      letterSpacing: 0.08,
      lineHeight: 1.2,
      fontUrl: 'https://unpkg.com/@fontsource/righteous/files/righteous-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.35,
    },
    properties2D: {
      color: '#fef08a',
      fontFamily: "'Righteous', cursive",
      fontWeight: '400',
      fontSize: 34,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      textShadow: '0 0 10px #eab308, 0 0 24px #ca8a04, 0 0 45px #ea580c',
    },
  },

  // ==========================================
  // 3. LUXURY GOLD & BRONZE
  // ==========================================
  {
    id: 'preset-imperial-gold',
    name: 'Imperial Roman Gold',
    category: 'Luxury Gold & Bronze',
    fontId: 'cinzel',
    fontFamily: "'Cinzel', serif",
    sampleText: 'SPECIAL RESERVE',
    description: 'Noble Roman engraved serif rendered in 24k polished gold foil with deep warm bronze drop outline.',
    badge: 'GOLD FOIL',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    tags: ['gold', 'luxury', 'roman', 'cinzel', 'imperial'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Cinzel', serif",
      fontSize: '20px',
      fontWeight: '800',
      color: '#fbbf24',
      letterSpacing: '0.14em',
      textShadow: '0 2px 10px rgba(251,191,36,0.5), 0 0 2px #78350f',
    },
    properties3D: {
      color: '#fbbf24',
      outlineColor: '#78350f',
      outlineWidth: 0.02,
      letterSpacing: 0.12,
      lineHeight: 1.2,
      fontUrl: 'https://unpkg.com/@fontsource/cinzel/files/cinzel-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.32,
    },
    properties2D: {
      color: '#fbbf24',
      fontFamily: "'Cinzel', serif",
      fontWeight: '800',
      fontSize: 30,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      textShadow: '0 2px 10px rgba(251,191,36,0.5), 0 0 2px #78350f',
    },
  },
  {
    id: 'preset-champagne-couture',
    name: 'Champagne Reserve',
    category: 'Luxury Gold & Bronze',
    fontId: 'playfair-display',
    fontFamily: "'Playfair Display', serif",
    sampleText: 'CHÂTEAU PRESTIGE',
    description: 'Delicate champagne shimmer with ultra-fine hairline serifs for wine labels, luxury packaging and private events.',
    badge: 'CHAMPAGNE',
    badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
    tags: ['champagne', 'wine', 'luxury', 'prestige', 'label'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '21px',
      fontWeight: '600',
      color: '#fef08a',
      letterSpacing: '0.12em',
      textShadow: '0 2px 12px rgba(254,240,138,0.4)',
    },
    properties3D: {
      color: '#fef08a',
      outlineColor: '#854d0e',
      outlineWidth: 0.015,
      letterSpacing: 0.1,
      lineHeight: 1.2,
      fontUrl: 'https://unpkg.com/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff',
      billboard: false,
      fontSize: 0.33,
    },
    properties2D: {
      color: '#fef08a',
      fontFamily: "'Playfair Display', serif",
      fontWeight: '600',
      fontSize: 32,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      textShadow: '0 2px 12px rgba(254,240,138,0.4)',
    },
  },

  // ==========================================
  // 4. BOLD BILLBOARD & POSTERS
  // ==========================================
  {
    id: 'preset-giant-billboard',
    name: 'Bebas Billboard Headline',
    category: 'Bold Billboard & Posters',
    fontId: 'bebas-neue',
    fontFamily: "'Bebas Neue', sans-serif",
    sampleText: 'WORLD TOUR 2026',
    description: 'High-impact condensed all-caps poster typography; concert flyers, outdoor billboard ads and key art.',
    badge: 'BILLBOARD',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    tags: ['billboard', 'poster', 'bebas', 'concert', 'bold'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: '26px',
      fontWeight: '400',
      color: '#ffffff',
      letterSpacing: '0.04em',
      textShadow: '0 4px 16px rgba(0,0,0,0.8)',
    },
    properties3D: {
      color: '#ffffff',
      outlineColor: '#dc2626',
      outlineWidth: 0.025,
      letterSpacing: 0.04,
      lineHeight: 1.0,
      fontUrl: 'https://unpkg.com/@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.45,
    },
    properties2D: {
      color: '#ffffff',
      fontFamily: "'Bebas Neue', sans-serif",
      fontWeight: '400',
      fontSize: 42,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      textShadow: '0 4px 16px rgba(0,0,0,0.8)',
    },
  },
  {
    id: 'preset-heavy-impact-warning',
    name: 'Hazard Block Poster',
    category: 'Bold Billboard & Posters',
    fontId: 'anton',
    fontFamily: "'Anton', sans-serif",
    sampleText: 'DO NOT ENTER',
    description: 'Maximum visual weight block sans in caution yellow with heavy black contrast outline.',
    badge: 'IMPACT',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    tags: ['anton', 'heavy', 'warning', 'hazard', 'poster'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Anton', sans-serif",
      fontSize: '24px',
      fontWeight: '400',
      color: '#facc15',
      letterSpacing: '0.02em',
      textShadow: '3px 3px 0px #000000',
    },
    properties3D: {
      color: '#facc15',
      outlineColor: '#000000',
      outlineWidth: 0.035,
      letterSpacing: 0.03,
      lineHeight: 1.05,
      fontUrl: 'https://unpkg.com/@fontsource/anton/files/anton-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.42,
    },
    properties2D: {
      color: '#facc15',
      fontFamily: "'Anton', sans-serif",
      fontWeight: '400',
      fontSize: 38,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      textShadow: '3px 3px 0px #000000',
    },
  },
  {
    id: 'preset-urban-streetwear',
    name: 'Metropolis Streetwear',
    category: 'Bold Billboard & Posters',
    fontId: 'oswald',
    fontFamily: "'Oswald', sans-serif",
    sampleText: 'LIMITED EDITION',
    description: 'Dense industrial gothic uppercase with solid monochrome contrast for streetwear apparel & poster drops.',
    badge: 'STREETWEAR',
    badgeColor: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30',
    tags: ['streetwear', 'oswald', 'apparel', 'drop', 'monochrome'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Oswald', sans-serif",
      fontSize: '22px',
      fontWeight: '700',
      color: '#ffffff',
      letterSpacing: '0.1em',
      textShadow: '0 2px 10px rgba(0,0,0,0.7)',
    },
    properties3D: {
      color: '#ffffff',
      outlineColor: '#18181b',
      outlineWidth: 0.02,
      letterSpacing: 0.08,
      lineHeight: 1.15,
      fontUrl: 'https://unpkg.com/@fontsource/oswald/files/oswald-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.38,
    },
    properties2D: {
      color: '#ffffff',
      fontFamily: "'Oswald', sans-serif",
      fontWeight: '700',
      fontSize: 34,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      textShadow: '0 2px 10px rgba(0,0,0,0.7)',
    },
  },

  // ==========================================
  // 5. ARTISANAL & SCRIPTS
  // ==========================================
  {
    id: 'preset-artisan-cafe',
    name: 'Artisanal Brush Script',
    category: 'Artisanal & Scripts',
    fontId: 'pacifico',
    fontFamily: "'Pacifico', cursive",
    sampleText: 'Handcrafted Roast',
    description: 'Warm original sign-painter brush script; artisan food packaging, coffee shops and organic bakery labels.',
    badge: 'HANDCRAFTED',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    tags: ['script', 'cafe', 'artisan', 'coffee', 'handcrafted'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Pacifico', cursive",
      fontSize: '22px',
      fontWeight: '400',
      color: '#34d399',
      letterSpacing: '0.02em',
      textShadow: '0 3px 12px rgba(52,211,153,0.4)',
    },
    properties3D: {
      color: '#34d399',
      outlineColor: '#064e3b',
      outlineWidth: 0.02,
      letterSpacing: 0.02,
      lineHeight: 1.3,
      fontUrl: 'https://unpkg.com/@fontsource/pacifico/files/pacifico-latin-400-normal.woff',
      billboard: false,
      fontSize: 0.34,
    },
    properties2D: {
      color: '#34d399',
      fontFamily: "'Pacifico', cursive",
      fontWeight: '400',
      fontSize: 32,
      letterSpacing: '0.02em',
      textShadow: '0 3px 12px rgba(52,211,153,0.4)',
    },
  },
  {
    id: 'preset-royal-wedding',
    name: 'Royal Calligraphy Script',
    category: 'Artisanal & Scripts',
    fontId: 'great-vibes',
    fontFamily: "'Great Vibes', cursive",
    sampleText: 'Save The Date',
    description: 'Graceful flowing calligraphic loops with gold-foil warmth; wedding suites, invitations and gala certificates.',
    badge: 'CALLIGRAPHY',
    badgeColor: 'bg-rose-400/20 text-rose-200 border-rose-400/30',
    tags: ['calligraphy', 'wedding', 'invitation', 'script', 'gala'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Great Vibes', cursive",
      fontSize: '26px',
      fontWeight: '400',
      color: '#fbcfe8',
      letterSpacing: '0.04em',
      textShadow: '0 2px 14px rgba(251,207,232,0.5)',
    },
    properties3D: {
      color: '#fbcfe8',
      outlineColor: '#831843',
      outlineWidth: 0.015,
      letterSpacing: 0.04,
      lineHeight: 1.4,
      fontUrl: 'https://unpkg.com/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.38,
    },
    properties2D: {
      color: '#fbcfe8',
      fontFamily: "'Great Vibes', cursive",
      fontWeight: '400',
      fontSize: 38,
      letterSpacing: '0.04em',
      textShadow: '0 2px 14px rgba(251,207,232,0.5)',
    },
  },
  {
    id: 'preset-celebration-dance',
    name: 'Celebration Cursive',
    category: 'Artisanal & Scripts',
    fontId: 'dancing-script',
    fontFamily: "'Dancing Script', cursive",
    sampleText: 'Cheers & Celebrations',
    description: 'Bouncing, joyous casual handwriting with warmth and movement for birthdays and holiday flyers.',
    badge: 'CELEBRATION',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    tags: ['celebration', 'party', 'birthday', 'dance', 'script'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Dancing Script', cursive",
      fontSize: '22px',
      fontWeight: '700',
      color: '#38bdf8',
      letterSpacing: '0.02em',
      textShadow: '0 2px 10px rgba(56,189,248,0.4)',
    },
    properties3D: {
      color: '#38bdf8',
      outlineColor: '#075985',
      outlineWidth: 0.02,
      letterSpacing: 0.02,
      lineHeight: 1.3,
      fontUrl: 'https://unpkg.com/@fontsource/dancing-script/files/dancing-script-latin-700-normal.woff',
      billboard: true,
      fontSize: 0.34,
    },
    properties2D: {
      color: '#38bdf8',
      fontFamily: "'Dancing Script', cursive",
      fontWeight: '700',
      fontSize: 32,
      letterSpacing: '0.02em',
      textShadow: '0 2px 10px rgba(56,189,248,0.4)',
    },
  },

  // ==========================================
  // 6. FUTURISTIC & CYBER
  // ==========================================
  {
    id: 'preset-matrix-telemetry',
    name: 'AR Matrix Telemetry',
    category: 'Futuristic & Cyber',
    fontId: 'jetbrains-mono',
    fontFamily: "'JetBrains Mono', monospace",
    sampleText: 'TARGET LOCK [98.4%]',
    description: 'Phosphor green terminal monospace with HUD coordinate brackets for spatial AR specs.',
    badge: 'HUD METRIC',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    tags: ['matrix', 'hud', 'telemetry', 'terminal', 'tech'],
    defaultTarget: '2D HUD',
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '18px',
      fontWeight: '700',
      color: '#10b981',
      letterSpacing: '0.08em',
      textShadow: '0 0 10px #10b981, 0 0 20px #064e3b',
      background: 'rgba(6,78,59,0.25)',
      border: '1px solid rgba(16,185,129,0.4)',
      borderRadius: '6px',
      padding: '4px 10px',
    },
    properties3D: {
      color: '#10b981',
      outlineColor: '#064e3b',
      outlineWidth: 0.025,
      letterSpacing: 0.08,
      lineHeight: 1.25,
      fontUrl: 'https://unpkg.com/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.28,
    },
    properties2D: {
      color: '#10b981',
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: '700',
      fontSize: 22,
      letterSpacing: '0.08em',
      textShadow: '0 0 10px #10b981, 0 0 20px #064e3b',
      backgroundColor: 'rgba(6,78,59,0.3)',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 6,
      paddingX: 12,
      paddingY: 6,
    },
  },
  {
    id: 'preset-cyber-quantum',
    name: 'Quantum Core AR',
    category: 'Futuristic & Cyber',
    fontId: 'orbitron',
    fontFamily: "'Orbitron', sans-serif",
    sampleText: 'QUANTUM OS v4.2',
    description: 'Electric cyan sci-fi aerospace titling font for spatial interfaces and hologram displays.',
    badge: 'AEROSPACE',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    tags: ['quantum', 'scifi', 'orbitron', 'aerospace', 'hologram'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '20px',
      fontWeight: '700',
      color: '#00f3ff',
      letterSpacing: '0.14em',
      textShadow: '0 0 12px #00f3ff, 0 0 30px #0284c7',
    },
    properties3D: {
      color: '#00f3ff',
      outlineColor: '#0369a1',
      outlineWidth: 0.03,
      letterSpacing: 0.12,
      lineHeight: 1.2,
      fontUrl: 'https://unpkg.com/@fontsource/orbitron/files/orbitron-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.32,
    },
    properties2D: {
      color: '#00f3ff',
      fontFamily: "'Orbitron', sans-serif",
      fontWeight: '700',
      fontSize: 28,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      textShadow: '0 0 12px #00f3ff, 0 0 30px #0284c7',
    },
  },

  // ==========================================
  // 7. MINIMAL & MODERN
  // ==========================================
  {
    id: 'preset-spatial-vision',
    name: 'Vision Spatial OS Header',
    category: 'Minimal & Modern',
    fontId: 'plus-jakarta-sans',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    sampleText: 'SPATIAL STUDIO',
    description: 'Pristine ultra-modern geometric header engineered for modern spatial UI and print lookbooks.',
    badge: 'VISION OS',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    tags: ['vision', 'spatial', 'minimal', 'modern', 'clean'],
    defaultTarget: '2D HUD',
    style: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '22px',
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: '-0.03em',
      textShadow: '0 4px 20px rgba(255,255,255,0.25)',
    },
    properties3D: {
      color: '#ffffff',
      outlineColor: '#1e293b',
      outlineWidth: 0.015,
      letterSpacing: -0.02,
      lineHeight: 1.15,
      fontUrl: 'https://unpkg.com/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      billboard: true,
      fontSize: 0.34,
    },
    properties2D: {
      color: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: '800',
      fontSize: 32,
      letterSpacing: '-0.03em',
      textShadow: '0 4px 20px rgba(255,255,255,0.25)',
    },
  },
  {
    id: 'preset-nordic-studio',
    name: 'Nordic Architecture Sans',
    category: 'Minimal & Modern',
    fontId: 'poppins',
    fontFamily: "'Poppins', sans-serif",
    sampleText: 'ARCHITECTURAL ESSENTIALS',
    description: 'Airy, spacious geometric sans with high tracking for Scandinavian print posters and catalogs.',
    badge: 'NORDIC',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    tags: ['nordic', 'poppins', 'minimal', 'architecture', 'clean'],
    defaultTarget: '3D Scene',
    style: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '18px',
      fontWeight: '600',
      color: '#e2e8f0',
      letterSpacing: '0.16em',
      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
    },
    properties3D: {
      color: '#e2e8f0',
      outlineColor: '#0f172a',
      outlineWidth: 0.015,
      letterSpacing: 0.14,
      lineHeight: 1.25,
      fontUrl: 'https://unpkg.com/@fontsource/poppins/files/poppins-latin-400-normal.woff',
      billboard: false,
      fontSize: 0.28,
    },
    properties2D: {
      color: '#e2e8f0',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '600',
      fontSize: 26,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
    },
  },

  // ==========================================
  // 8. BADGES & CALLOUTS
  // ==========================================
  {
    id: 'preset-gold-vip-badge',
    name: 'Gold Foil VIP Ribbon',
    category: 'Badges & Callouts',
    fontId: 'cinzel',
    fontFamily: "'Cinzel', serif",
    sampleText: 'PREMIUM ACCESS',
    description: 'Embossed luxury gold ribbon badge with fine metallic border for exclusive product tiers.',
    badge: 'VIP BADGE',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    tags: ['vip', 'gold', 'badge', 'ribbon', 'premium'],
    defaultTarget: '2D HUD',
    style: {
      fontFamily: "'Cinzel', serif",
      fontSize: '16px',
      fontWeight: '700',
      color: '#fbbf24',
      letterSpacing: '0.14em',
      background: 'linear-gradient(135deg, rgba(120,53,15,0.4), rgba(20,20,25,0.9))',
      border: '1px solid #fbbf24',
      borderRadius: '9999px',
      padding: '6px 16px',
      boxShadow: '0 0 16px rgba(251,191,36,0.35)',
    },
    properties3D: {
      color: '#fbbf24',
      outlineColor: '#78350f',
      outlineWidth: 0.02,
      letterSpacing: 0.12,
      lineHeight: 1.2,
      fontUrl: 'https://unpkg.com/@fontsource/cinzel/files/cinzel-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.26,
    },
    properties2D: {
      color: '#fbbf24',
      fontFamily: "'Cinzel', serif",
      fontWeight: '700',
      fontSize: 20,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      backgroundColor: '#1c1917',
      borderColor: '#fbbf24',
      borderWidth: 1,
      borderRadius: 9999,
      paddingX: 18,
      paddingY: 8,
      boxShadow: '0 0 16px rgba(251,191,36,0.35)',
    },
  },
  {
    id: 'preset-cyber-pill-tag',
    name: 'Cyberpunk Hotkey Pill',
    category: 'Badges & Callouts',
    fontId: 'jetbrains-mono',
    fontFamily: "'JetBrains Mono', monospace",
    sampleText: '[SCAN AR CODE]',
    description: 'Angular sci-fi scanner badge with high-voltage cyan outline and glow.',
    badge: 'AR SCAN',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    tags: ['pill', 'hotkey', 'scan', 'cyber', 'mono'],
    defaultTarget: '2D HUD',
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '15px',
      fontWeight: '700',
      color: '#22d3ee',
      letterSpacing: '0.08em',
      background: 'rgba(8,145,178,0.2)',
      border: '1px solid #22d3ee',
      borderRadius: '4px',
      padding: '5px 12px',
      boxShadow: '0 0 12px rgba(34,211,238,0.3)',
    },
    properties3D: {
      color: '#22d3ee',
      outlineColor: '#0e7490',
      outlineWidth: 0.02,
      letterSpacing: 0.06,
      lineHeight: 1.2,
      fontUrl: 'https://unpkg.com/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff',
      billboard: true,
      fontSize: 0.25,
    },
    properties2D: {
      color: '#22d3ee',
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: '700',
      fontSize: 18,
      letterSpacing: '0.08em',
      backgroundColor: 'rgba(8,145,178,0.25)',
      borderColor: '#22d3ee',
      borderWidth: 1,
      borderRadius: 4,
      paddingX: 14,
      paddingY: 7,
      boxShadow: '0 0 12px rgba(34,211,238,0.3)',
    },
  },

  // ==========================================
  // 9. BUTTONS & CTAS
  // ==========================================
  {
    id: 'preset-neon-cta-glow',
    name: 'Electric Neon CTA Button',
    category: 'Buttons & CTAs',
    fontId: 'outfit',
    fontFamily: "'Outfit', sans-serif",
    sampleText: 'EXPERIENCE IN AR ↗',
    description: 'High-converting interactive button with electric cyan-blue gradient and atmospheric shadow drop.',
    badge: 'INTERACTIVE CTA',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    tags: ['button', 'cta', 'interactive', 'neon', 'blue'],
    defaultTarget: '2D HUD',
    style: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '17px',
      fontWeight: '700',
      color: '#ffffff',
      letterSpacing: '0.04em',
      background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '12px',
      padding: '8px 20px',
      boxShadow: '0 4px 20px rgba(37,99,235,0.5)',
    },
    properties3D: {
      color: '#ffffff',
      outlineColor: '#1d4ed8',
      outlineWidth: 0.02,
      letterSpacing: 0.04,
      lineHeight: 1.2,
      fontUrl: 'https://unpkg.com/@fontsource/outfit/files/outfit-latin-600-normal.woff',
      billboard: true,
      fontSize: 0.3,
    },
    properties2D: {
      color: '#ffffff',
      fontFamily: "'Outfit', sans-serif",
      fontWeight: '700',
      fontSize: 22,
      letterSpacing: '0.04em',
      backgroundColor: '#2563eb',
      borderColor: 'rgba(255,255,255,0.4)',
      borderWidth: 1,
      borderRadius: 12,
      paddingX: 22,
      paddingY: 10,
      boxShadow: '0 4px 20px rgba(37,99,235,0.5)',
    },
  },
  {
    id: 'preset-frosted-glass-pill',
    name: 'Frosted Glassmorphic Pill',
    category: 'Buttons & CTAs',
    fontId: 'plus-jakarta-sans',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    sampleText: 'View Spec Sheet',
    description: 'Translucent frosted glass button with delicate white border and subtle ambient blur.',
    badge: 'GLASSMORPHIC',
    badgeColor: 'bg-white/20 text-white border-white/30',
    tags: ['glass', 'frosted', 'pill', 'modern', 'button'],
    defaultTarget: '2D HUD',
    style: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '16px',
      fontWeight: '600',
      color: '#ffffff',
      letterSpacing: '0.02em',
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '9999px',
      padding: '7px 18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.37)',
    },
    properties3D: {
      color: '#ffffff',
      outlineColor: '#334155',
      outlineWidth: 0.015,
      letterSpacing: 0.02,
      lineHeight: 1.2,
      fontUrl: 'https://unpkg.com/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      billboard: true,
      fontSize: 0.28,
    },
    properties2D: {
      color: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: '600',
      fontSize: 20,
      letterSpacing: '0.02em',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderColor: 'rgba(255,255,255,0.25)',
      borderWidth: 1,
      borderRadius: 9999,
      paddingX: 20,
      paddingY: 9,
      boxShadow: '0 8px 32px rgba(0,0,0,0.37)',
      backdropFilter: 'blur(16px)',
    },
  },
];

/**
 * Applies a unified typography preset to an existing scene object (3D text, 2D HUD text, or button).
 * Preserves the user's existing text content unless replaceText is true.
 */
export function applyTypographyPresetToObject(
  targetObj: SceneObject,
  preset: UnifiedTextPreset,
  replaceText: boolean = false
): Partial<SceneObject> {
  const currentText = targetObj.properties?.text || targetObj.name || preset.sampleText;
  const finalText = replaceText ? preset.sampleText : currentText;

  if (targetObj.type === 'text') {
    // 3D Scene Text Object
    return {
      properties: {
        ...targetObj.properties,
        text: finalText,
        color: preset.properties3D.color,
        outlineColor: preset.properties3D.outlineColor,
        outlineWidth: preset.properties3D.outlineWidth ?? 0.02,
        letterSpacing: preset.properties3D.letterSpacing ?? 0.05,
        lineHeight: preset.properties3D.lineHeight ?? 1.2,
        fontUrl: preset.properties3D.fontUrl,
        fontFamily: preset.fontFamily,
        billboard: preset.properties3D.billboard ?? targetObj.properties?.billboard ?? false,
      }
    };
  } else if (targetObj.type === 'hudText') {
    // 2D HUD Canvas Text
    return {
      properties: {
        ...targetObj.properties,
        text: finalText,
        color: preset.properties2D.color,
        fontFamily: preset.properties2D.fontFamily,
        fontWeight: preset.properties2D.fontWeight,
        fontSize: preset.properties2D.fontSize,
        letterSpacing: preset.properties2D.letterSpacing || '0px',
        textTransform: preset.properties2D.textTransform || 'none',
        fontStyle: preset.properties2D.fontStyle || 'normal',
        textShadow: preset.properties2D.textShadow || '',
        backgroundColor: preset.properties2D.backgroundColor || 'transparent',
        borderColor: preset.properties2D.borderColor || 'transparent',
        borderWidth: preset.properties2D.borderWidth || 0,
        borderRadius: preset.properties2D.borderRadius || 0,
        paddingX: preset.properties2D.paddingX || 0,
        paddingY: preset.properties2D.paddingY || 0,
        boxShadow: preset.properties2D.boxShadow || '',
      }
    };
  } else {
    // Button or general text-holding element
    return {
      properties: {
        ...targetObj.properties,
        text: finalText,
        color: preset.properties2D.color,
        fontFamily: preset.properties2D.fontFamily,
        fontWeight: preset.properties2D.fontWeight,
        fontSize: preset.properties2D.fontSize,
        backgroundColor: preset.properties2D.backgroundColor || targetObj.properties?.backgroundColor || '#2563eb',
        borderColor: preset.properties2D.borderColor || targetObj.properties?.borderColor,
        borderRadius: preset.properties2D.borderRadius || targetObj.properties?.borderRadius || 8,
      }
    };
  }
}

/**
 * Creates a brand new scene object using a typography preset
 */
export function createObjectFromTypographyPreset(
  newId: string,
  preset: UnifiedTextPreset,
  targetType?: '3D Scene' | '2D HUD',
  customText?: string
): SceneObject {
  const chosenTarget = targetType || preset.defaultTarget;
  const textContent = customText || preset.sampleText;

  if (chosenTarget === '3D Scene') {
    return {
      id: newId,
      name: `${preset.name} (3D Text)`,
      type: 'text',
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        text: textContent,
        color: preset.properties3D.color,
        outlineColor: preset.properties3D.outlineColor,
        outlineWidth: preset.properties3D.outlineWidth || 0.02,
        letterSpacing: preset.properties3D.letterSpacing || 0.05,
        lineHeight: preset.properties3D.lineHeight || 1.2,
        fontUrl: preset.properties3D.fontUrl,
        fontFamily: preset.fontFamily,
        billboard: preset.properties3D.billboard ?? true,
        fontSize: preset.properties3D.fontSize || 0.35,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    };
  } else {
    return {
      id: newId,
      name: `${preset.name} (HUD Text)`,
      type: 'hudText',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        text: textContent,
        color: preset.properties2D.color,
        fontFamily: preset.properties2D.fontFamily,
        fontWeight: preset.properties2D.fontWeight,
        fontSize: preset.properties2D.fontSize,
        letterSpacing: preset.properties2D.letterSpacing || '0px',
        textTransform: preset.properties2D.textTransform || 'none',
        fontStyle: preset.properties2D.fontStyle || 'normal',
        textShadow: preset.properties2D.textShadow || '',
        backgroundColor: preset.properties2D.backgroundColor || 'transparent',
        borderColor: preset.properties2D.borderColor || 'transparent',
        borderWidth: preset.properties2D.borderWidth || 0,
        borderRadius: preset.properties2D.borderRadius || 0,
        paddingX: preset.properties2D.paddingX || 0,
        paddingY: preset.properties2D.paddingY || 0,
        boxShadow: preset.properties2D.boxShadow || '',
        alignment: 'center',
        offsetX: 0,
        offsetY: 0,
        behavior: 'none',
        autoplay: false,
        isInteractive: false,
      }
    };
  }
}
