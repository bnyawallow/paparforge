import React from 'react';

export interface MediaWidgetTemplate {
  id: string;
  name: string;
  category: 'YouTube Player' | 'Video & Audio' | 'Interactive Hotspots' | 'Image & Web Embeds';
  type: 'youtube' | 'video' | 'audio' | 'hotspot' | 'image' | 'hudEmbed';
  description: string;
  properties: {
    // YouTube
    videoId?: string;
    autoplay?: boolean;
    mute?: boolean;
    loop?: boolean;
    controls?: boolean;
    volume?: number;
    aspectRatio?: '16:9' | '4:3' | '9:16' | '1:1' | '21:9' | 'custom';
    resolution?: '1080p' | '720p' | '480p' | '360p' | '240p' | 'auto';
    displayMode?: '3d' | '2d';
    overlayOpen?: boolean;
    // Video
    videoUrl?: string;
    // Audio
    audioUrl?: string;
    spatial?: boolean;
    distanceModel?: string;
    // Hotspot
    title?: string;
    annotationText?: string;
    icon?: string;
    pulseAnimation?: boolean;
    badgeStyle?: string;
    color?: string;
    // Image
    imageUrl?: string;
    textureUrl?: string;
    frameColor?: string;
    frameWidth?: number;
    // Web Embed
    embedUrl?: string;
    opacity?: number;
    roughness?: number;
    metalness?: number;
    width?: number;
    height?: number;
  };
  previewBg: string;
  badge: string;
  badgeColor: string;
  icon: string;
  metaText?: string;
}

export const MEDIA_WIDGET_TEMPLATES: MediaWidgetTemplate[] = [
  // --- 1. YOUTUBE PLAYERS (UNIFIED FLAVORS ACROSS ORIENTATIONS & DIMENSIONS) ---
  {
    id: 'yt-cinema-169',
    name: 'YouTube Player (16:9 Widescreen)',
    category: 'YouTube Player',
    type: 'youtube',
    description: 'Standard 16:9 widescreen HD video display for presentations, trailers, and media',
    properties: {
      videoId: 'dQw4w9WgXcQ',
      autoplay: false,
      mute: false,
      loop: false,
      controls: true,
      volume: 100,
      aspectRatio: '16:9',
      resolution: '240p',
      displayMode: '3d',
      overlayOpen: false,
    },
    previewBg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    badge: '16:9 WIDESCREEN',
    badgeColor: 'bg-red-500/15 text-red-400 border-red-500/25',
    icon: '▶️',
    metaText: '16:9 Landscape • 240p'
  },
  {
    id: 'yt-retro-tv-43',
    name: 'YouTube Player (4:3 Classic)',
    category: 'YouTube Player',
    type: 'youtube',
    description: 'Classic 4:3 standard aspect video display for vintage media, tablet feeds, and retro video',
    properties: {
      videoId: 'dQw4w9WgXcQ',
      autoplay: false,
      mute: false,
      loop: false,
      controls: true,
      volume: 100,
      aspectRatio: '4:3',
      resolution: '240p',
      displayMode: '3d',
      overlayOpen: false,
    },
    previewBg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    badge: '4:3 CLASSIC',
    badgeColor: 'bg-red-500/15 text-red-400 border-red-500/25',
    icon: '▶️',
    metaText: '4:3 Standard • 240p'
  },
  {
    id: 'yt-square-11',
    name: 'YouTube Player (1:1 Square)',
    category: 'YouTube Player',
    type: 'youtube',
    description: 'Square 1:1 aspect video display for social gallery cards, grid feeds, and compact spots',
    properties: {
      videoId: 'dQw4w9WgXcQ',
      autoplay: false,
      mute: false,
      loop: false,
      controls: true,
      volume: 100,
      aspectRatio: '1:1',
      resolution: '240p',
      displayMode: '3d',
      overlayOpen: false,
    },
    previewBg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    badge: '1:1 SQUARE',
    badgeColor: 'bg-red-500/15 text-red-400 border-red-500/25',
    icon: '▶️',
    metaText: '1:1 Square • 240p'
  },
  {
    id: 'yt-vertical-reels-916',
    name: 'YouTube Player (9:16 Vertical)',
    category: 'YouTube Player',
    type: 'youtube',
    description: 'Vertical 9:16 portrait video display for mobile AR, YouTube Shorts, Reels, and stories',
    properties: {
      videoId: 'dQw4w9WgXcQ',
      autoplay: false,
      mute: false,
      loop: false,
      controls: true,
      volume: 100,
      aspectRatio: '9:16',
      resolution: '240p',
      displayMode: '3d',
      overlayOpen: false,
    },
    previewBg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    badge: '9:16 VERTICAL',
    badgeColor: 'bg-red-500/15 text-red-400 border-red-500/25',
    icon: '▶️',
    metaText: '9:16 Portrait • 240p'
  },
  {
    id: 'yt-ultrawide-219',
    name: 'YouTube Player (21:9 Ultrawide)',
    category: 'YouTube Player',
    type: 'youtube',
    description: 'Cinematic 21:9 panoramic video display for theater presentations and wide stages',
    properties: {
      videoId: 'dQw4w9WgXcQ',
      autoplay: false,
      mute: false,
      loop: false,
      controls: true,
      volume: 100,
      aspectRatio: '21:9',
      resolution: '240p',
      displayMode: '3d',
      overlayOpen: false,
    },
    previewBg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    badge: '21:9 ULTRAWIDE',
    badgeColor: 'bg-red-500/15 text-red-400 border-red-500/25',
    icon: '▶️',
    metaText: '21:9 Ultrawide • 240p'
  },
  {
    id: 'yt-hud-overlay',
    name: 'YouTube Player (2D HUD Overlay)',
    category: 'YouTube Player',
    type: 'youtube',
    description: 'Pinned 2D viewport overlay video player with responsive HUD dock controls',
    properties: {
      videoId: 'dQw4w9WgXcQ',
      autoplay: false,
      mute: false,
      loop: false,
      controls: true,
      volume: 100,
      aspectRatio: '16:9',
      resolution: '240p',
      displayMode: '2d',
      overlayOpen: true,
    },
    previewBg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    badge: '2D HUD OVERLAY',
    badgeColor: 'bg-red-500/15 text-red-400 border-red-500/25',
    icon: '🪟',
    metaText: 'Viewport HUD • 240p'
  },

  // --- 2. VIDEO & AUDIO ---
  {
    id: 'video-spatial-screen',
    name: 'Spatial Video Player Mesh',
    category: 'Video & Audio',
    type: 'video',
    description: 'Hardware-accelerated direct MP4/WebM video texture mapped to a 3D surface',
    properties: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      autoplay: true,
      loop: true,
      mute: true,
      roughness: 0.1,
      metalness: 0.2,
    },
    previewBg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 50%, #1e1b4b 100%)',
    badge: 'MP4 / WEBM VIDEO',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    icon: '🎥',
    metaText: 'Hardware Video Shader'
  },
  {
    id: 'audio-spatial-beacon',
    name: 'Spatial Audio Sound Beacon',
    category: 'Video & Audio',
    type: 'audio',
    description: 'Positional 3D sound emitter with distance-based attenuation and Doppler acoustics',
    properties: {
      audioUrl: 'https://cdn.freesound.org/previews/316/316844_4939433-lq.mp3',
      spatial: true,
      distanceModel: 'exponential',
      volume: 1.0,
      loop: true,
    },
    previewBg: 'linear-gradient(135deg, #f43f5e 0%, #be123c 50%, #4c0519 100%)',
    badge: '3D SPATIAL AUDIO',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: '🔊',
    metaText: 'Positional 3D Acoustics'
  },

  // --- 3. INTERACTIVE HOTSPOTS ---
  {
    id: 'hotspot-radar-pulse',
    name: 'Radar Pulse AR Hotspot',
    category: 'Interactive Hotspots',
    type: 'hotspot',
    description: 'Interactive pulsing beacon trigger that expands annotation cards on touch',
    properties: {
      title: 'Inspect Target',
      annotationText: 'Interactive point of interest with live telemetry data.',
      icon: 'Info',
      pulseAnimation: true,
      color: '#38bdf8',
      badgeStyle: 'pulse',
    },
    previewBg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 50%, #082f49 100%)',
    badge: 'RADAR HOTSPOT',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    icon: '📍',
    metaText: 'Pulse Waypoint Trigger'
  },
  {
    id: 'hotspot-info-pin',
    name: '3D Product Annotation Pin',
    category: 'Interactive Hotspots',
    type: 'hotspot',
    description: 'Minimalist glass annotation pin displaying floating product specs in 3D',
    properties: {
      title: 'Specification Pin',
      annotationText: 'Aerospace Grade 5 Titanium Body with PVD finish.',
      icon: 'Tag',
      pulseAnimation: true,
      color: '#a855f7',
      badgeStyle: 'glass',
    },
    previewBg: 'linear-gradient(135deg, #c084fc 0%, #9333ea 50%, #3b0764 100%)',
    badge: 'ANNOTATION PIN',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: '🏷️',
    metaText: 'Product Spec Callout'
  },

  // --- 4. IMAGE & EMBEDS ---
  {
    id: 'image-gallery-frame',
    name: 'Framed AR Artwork Billboard',
    category: 'Image & Web Embeds',
    type: 'image',
    description: 'Beveled art gallery canvas plane for high-resolution graphics and posters',
    properties: {
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      frameColor: '#18181b',
      frameWidth: 0.04,
      roughness: 0.2,
      metalness: 0.1,
    },
    previewBg: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 50%, #042f2e 100%)',
    badge: 'ART CANVAS',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    icon: '🖼️',
    metaText: 'Beveled Gallery Frame'
  },
  {
    id: 'embed-web-widget',
    name: 'Interactive Web / Iframe Embed',
    category: 'Image & Web Embeds',
    type: 'hudEmbed',
    description: 'Live interactive iframe web widget for web applications, charts, and portals',
    properties: {
      embedUrl: 'https://modelviewer.dev',
      opacity: 0.95,
      width: 500,
      height: 350,
    },
    previewBg: 'linear-gradient(135deg, #64748b 0%, #334155 50%, #0f172a 100%)',
    badge: 'LIVE WEB EMBED',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    icon: '🌐',
    metaText: 'Interactive Iframe'
  }
];
