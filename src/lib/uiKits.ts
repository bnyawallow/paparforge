import { SceneObject, Vector3Data } from '../types';

export type UIKitCategory = 
  | 'Vision OS Spatial'
  | 'Cyberpunk Tactical'
  | 'Smart Home IoT'
  | 'E-Commerce AR'
  | 'Fintech & Crypto'
  | 'Spatial Audio'
  | 'AR Wayfinding'
  | 'Studio Productivity';

export type UIKitTarget = '2D HUD' | '3D Scene';

export interface UIKitPreset {
  id: string;
  name: string;
  category: UIKitCategory;
  target: UIKitTarget;
  description: string;
  badge: string;
  objectType: SceneObject['type'];
  tags: string[];
  properties: Record<string, any>;
  scale?: Vector3Data;
  position?: Vector3Data;
  rotation?: Vector3Data;
}

// Helper to construct HTML data URLs for embedded HUD UI Kits
function createEmbedHtml(title: string, themeColor: string, bodyHtml: string): string {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      padding: 0;
      background: rgba(10, 15, 29, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      color: #ffffff;
      overflow: hidden;
      height: 100vh;
      user-select: none;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { display: none; }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.9; }
    }
    .pulse-glow { animation: pulseGlow 2s infinite ease-in-out; }
  </style>
</head>
<body class="p-4 flex flex-col justify-between h-full border border-white/10 rounded-2xl shadow-2xl relative">
  ${bodyHtml}
</body>
</html>`;
  return `data:text/html,${encodeURIComponent(html)}`;
}

export const UI_KIT_PRESETS: UIKitPreset[] = [
  // ==========================================
  // 1. VISION OS SPATIAL UI KIT
  // ==========================================
  {
    id: 'uk-vision-spatial-hub',
    name: 'Vision Pro Spatial Control Window',
    category: 'Vision OS Spatial',
    target: '2D HUD',
    badge: 'VISION OS',
    description: 'Translucent spatial window with sidebar navigation, active status, system metrics, and pill action triggers.',
    tags: ['vision-os', 'glass', 'dashboard', 'hud'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml(
        'SPATIAL HUB',
        '#38bdf8',
        `<div class="flex items-center justify-between border-b border-white/10 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] pulse-glow"></div>
            <span class="text-xs font-bold tracking-widest uppercase text-cyan-300 mono">VISION OS // SPATIAL HUD</span>
          </div>
          <span class="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">v3.4.0</span>
        </div>

        <div class="my-3 grid grid-cols-3 gap-2">
          <div class="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between">
            <span class="text-[9px] font-mono uppercase text-slate-400">Eye Tracking</span>
            <span class="text-lg font-bold text-white mono mt-1">99.8%</span>
            <span class="text-[9px] text-emerald-400">Calibrated</span>
          </div>
          <div class="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between">
            <span class="text-[9px] font-mono uppercase text-slate-400">FPS Rate</span>
            <span class="text-lg font-bold text-white mono mt-1">90.2</span>
            <span class="text-[9px] text-cyan-400">Passthrough</span>
          </div>
          <div class="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between">
            <span class="text-[9px] font-mono uppercase text-slate-400">Depth Map</span>
            <span class="text-lg font-bold text-white mono mt-1">LiDAR</span>
            <span class="text-[9px] text-purple-400">Active Scan</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <span class="text-[10px] text-slate-300">Spatial Anchors: <strong class="text-white">12 Nodes</strong></span>
          <div class="flex gap-2">
            <button class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-cyan-500/20 transition-all active:scale-95">RE-CENTER</button>
            <button class="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/15 transition-all">EXPAND</button>
          </div>
        </div>`
      ),
      width: 420,
      widthType: 'px',
      height: 250,
      heightType: 'px',
      alignment: 'top-left',
      offsetX: 20,
      offsetY: 20,
      borderRadius: 20,
      borderEnabled: true,
      borderColor: '#38bdf8',
      showAddressBar: false,
      zIndex: 100
    }
  },

  // ==========================================
  // 2. SPATIAL AUDIO UI KIT
  // ==========================================
  {
    id: 'uk-spatial-audio-player',
    name: 'Spatial Audio Wave Player',
    category: 'Spatial Audio',
    target: '2D HUD',
    badge: 'AUDIO HUD',
    description: 'Frosted glass music deck with album artwork, audio waveform, play/pause controls, and 3D spatial audio toggle.',
    tags: ['audio', 'music', 'player', 'spatial'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml(
        'SPATIAL AUDIO',
        '#ec4899',
        `<div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-pink-500/30 font-bold shrink-0">
            🎵
          </div>
          <div class="flex-1 overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase font-mono font-bold text-pink-400 tracking-wider">3D SPATIAL SOUND</span>
              <span class="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">DOLBY ATMOS</span>
            </div>
            <h3 class="text-sm font-bold text-white truncate mt-0.5">Starlight Horizons (AR Mix)</h3>
            <p class="text-[11px] text-slate-300 truncate">Synthetica Spatial Audio Lab</p>
          </div>
        </div>

        <div class="my-3 space-y-1.5">
          <div class="flex justify-between text-[9px] font-mono text-slate-400">
            <span>01:42</span>
            <span class="text-pink-300">03:45</span>
          </div>
          <div class="w-full bg-black/40 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full w-2/5 shadow-[0_0_8px_#ec4899]"></div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1">
          <button class="text-xs text-slate-400 hover:text-white font-mono">🔀 SHUFFLE</button>
          <div class="flex items-center gap-2">
            <button class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs">⏮</button>
            <button class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 active:scale-95 text-white flex items-center justify-center text-sm shadow-lg shadow-pink-500/30">▶</button>
            <button class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs">⏭</button>
          </div>
          <button class="text-xs text-pink-400 font-mono bg-pink-500/10 border border-pink-500/30 px-2 py-1 rounded-full">🎧 3D ON</button>
        </div>`
      ),
      width: 380,
      widthType: 'px',
      height: 220,
      heightType: 'px',
      alignment: 'bottom-left',
      offsetX: 20,
      offsetY: 20,
      borderRadius: 18,
      borderEnabled: true,
      borderColor: '#ec4899',
      showAddressBar: false,
      zIndex: 100
    }
  },

  // ==========================================
  // 3. CYBERPUNK TACTICAL UI KIT
  // ==========================================
  {
    id: 'uk-cyber-target-scope',
    name: 'Cyberpunk Target Lock Reticle',
    category: 'Cyberpunk Tactical',
    target: '2D HUD',
    badge: 'CYBERPUNK',
    description: 'High-tech military HUD reticle with animated target scope, distance telemetry, and lock status.',
    tags: ['cyberpunk', 'hud', 'reticle', 'tactical'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml(
        'CYBER RETICLE',
        '#06b6d4',
        `<div class="flex items-center justify-between">
          <span class="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-widest">[ TACTICAL SCOPE v8 ]</span>
          <span class="text-[9px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">TARGET LOCKED</span>
        </div>

        <div class="my-2 flex items-center justify-center relative h-28">
          <!-- Animated Scope Rings -->
          <div class="w-24 h-24 rounded-full border-2 border-cyan-400/40 border-dashed animate-spin flex items-center justify-center relative" style="animation-duration: 12s;">
            <div class="w-16 h-16 rounded-full border border-cyan-400/80 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]"></div>
            </div>
          </div>
          <div class="absolute top-1/2 left-4 -translate-y-1/2 text-[9px] font-mono text-cyan-300">
            <div>DIST: 48.2m</div>
            <div>ELEV: +12°</div>
          </div>
          <div class="absolute top-1/2 right-4 -translate-y-1/2 text-[9px] font-mono text-cyan-300 text-right">
            <div>SPD: 0.0 m/s</div>
            <div>AZ: 184° SW</div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-cyan-500/20">
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-mono text-slate-400">AMMO:</span>
            <span class="text-xs font-mono font-bold text-cyan-300">30 / 120</span>
          </div>
          <button class="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-[10px] font-mono font-bold px-3 py-1 rounded transition-colors">ENGAGE LINK</button>
        </div>`
      ),
      width: 360,
      widthType: 'px',
      height: 230,
      heightType: 'px',
      alignment: 'center',
      offsetX: 0,
      offsetY: 0,
      borderRadius: 16,
      borderEnabled: true,
      borderColor: '#06b6d4',
      showAddressBar: false,
      zIndex: 100
    }
  },

  // ==========================================
  // 4. SMART HOME IOT UI KIT
  // ==========================================
  {
    id: 'uk-smart-thermostat',
    name: 'Smart Home HVAC & Climate Dial',
    category: 'Smart Home IoT',
    target: '2D HUD',
    badge: 'SMART IOT',
    description: 'Smart home temperature dial with humidity gauges, HVAC mode tabs, and fan toggle.',
    tags: ['smart-home', 'iot', 'hvac', 'control'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml(
        'CLIMATE CONTROL',
        '#f59e0b',
        `<div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-base">🌡️</span>
            <div>
              <h3 class="text-xs font-bold text-white">Living Room Climate</h3>
              <p class="text-[9px] text-slate-400">Thermostat #04 - Active</p>
            </div>
          </div>
          <span class="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">22°C TARGET</span>
        </div>

        <div class="my-3 flex items-center justify-between px-2">
          <div class="flex flex-col items-center">
            <div class="w-20 h-20 rounded-full border-4 border-amber-500/30 border-t-amber-400 flex flex-col items-center justify-center bg-black/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <span class="text-2xl font-bold font-mono text-white">22.5°</span>
              <span class="text-[8px] font-mono text-amber-300 uppercase">COOLING</span>
            </div>
          </div>
          <div class="flex-1 ml-4 space-y-2">
            <div class="flex justify-between items-center text-[10px] text-slate-300">
              <span>Humidity</span>
              <span class="font-mono font-bold text-cyan-300">48%</span>
            </div>
            <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10">
              <div class="bg-cyan-400 h-full rounded-full w-1/2"></div>
            </div>
            <div class="flex justify-between items-center text-[10px] text-slate-300">
              <span>Air Quality</span>
              <span class="font-mono font-bold text-emerald-400">EXCELLENT</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <div class="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[9px] font-mono">
            <button class="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg font-bold">COOL</button>
            <button class="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg">HEAT</button>
            <button class="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg">ECO</button>
          </div>
          <button class="bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono px-3 py-1.5 rounded-xl border border-white/15">FAN: AUTO</button>
        </div>`
      ),
      width: 380,
      widthType: 'px',
      height: 240,
      heightType: 'px',
      alignment: 'top-right',
      offsetX: 20,
      offsetY: 20,
      borderRadius: 18,
      borderEnabled: true,
      borderColor: '#f59e0b',
      showAddressBar: false,
      zIndex: 100
    }
  },

  // ==========================================
  // 5. E-COMMERCE AR PRODUCT SHOWCASE UI KIT
  // ==========================================
  {
    id: 'uk-ecommerce-product-card',
    name: 'E-Commerce 3D Product Showcase Card',
    category: 'E-Commerce AR',
    target: '2D HUD',
    badge: 'RETAIL AR',
    description: '3D shopping spatial card with variant color swatches, rating stars, price, and "Try in AR" call-to-action.',
    tags: ['ecommerce', 'product', 'card', 'shopping'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml(
        'PRODUCT CARD',
        '#10b981',
        `<div class="flex items-start justify-between">
          <div>
            <span class="text-[9px] font-mono uppercase font-bold text-emerald-400 tracking-widest">AR PRODUCT CARD</span>
            <h2 class="text-base font-bold text-white mt-0.5">Spatial Cyber Headphones Pro</h2>
            <div class="flex items-center gap-1 mt-1 text-[10px] text-amber-300">
              ★★★★★ <span class="text-slate-400 font-mono">(142 reviews)</span>
            </div>
          </div>
          <span class="text-lg font-bold font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-xl">$299.00</span>
        </div>

        <div class="my-3 flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
          <div class="w-16 h-16 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-2xl shrink-0">
            🎧
          </div>
          <div class="flex-1 text-[10px] text-slate-300 leading-relaxed">
            Active Noise Cancelling, 40h Battery Life, Lossless Audio Spatial Tracking.
          </div>
        </div>

        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center gap-1.5">
            <span class="text-[9px] text-slate-400 font-mono">COLOR:</span>
            <span class="w-4 h-4 rounded-full bg-cyan-400 ring-2 ring-white cursor-pointer"></span>
            <span class="w-4 h-4 rounded-full bg-pink-500 opacity-60 hover:opacity-100 cursor-pointer"></span>
            <span class="w-4 h-4 rounded-full bg-slate-800 opacity-60 hover:opacity-100 cursor-pointer"></span>
          </div>
          <button class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-[10px] font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5">
            <span>👁️ VIEW IN AR</span>
          </button>
        </div>`
      ),
      width: 390,
      widthType: 'px',
      height: 240,
      heightType: 'px',
      alignment: 'bottom-right',
      offsetX: 20,
      offsetY: 20,
      borderRadius: 18,
      borderEnabled: true,
      borderColor: '#10b981',
      showAddressBar: false,
      zIndex: 100
    }
  },

  // ==========================================
  // 6. FINTECH & CRYPTO AR UI KIT
  // ==========================================
  {
    id: 'uk-fintech-crypto-tracker',
    name: 'Fintech Crypto Portfolio Monitor',
    category: 'Fintech & Crypto',
    target: '2D HUD',
    badge: 'FINTECH',
    description: 'Glassmorphic crypto asset wallet monitor with live balances, gain/loss indicators, and quick transfer controls.',
    tags: ['fintech', 'crypto', 'wallet', 'dashboard'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml(
        'FINTECH WALLET',
        '#8b5cf6',
        `<div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold text-xs">💎</div>
            <span class="text-xs font-bold text-white tracking-wide">SPATIAL WALLET</span>
          </div>
          <span class="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">↑ +5.8% 24H</span>
        </div>

        <div class="my-3">
          <div class="text-[9px] font-mono text-slate-400 uppercase">Total Portfolio Value</div>
          <div class="text-2xl font-bold font-mono text-white mt-0.5">$48,290.50 <span class="text-xs text-purple-300 font-normal">USD</span></div>
        </div>

        <div class="grid grid-cols-2 gap-2 my-2">
          <div class="p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <div class="text-[9px] font-mono text-slate-400">BTC / Bitcoin</div>
              <div class="text-xs font-bold text-white font-mono">0.824 BTC</div>
            </div>
            <span class="text-[10px] text-emerald-400 font-mono">$42,100</span>
          </div>
          <div class="p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <div class="text-[9px] font-mono text-slate-400">ETH / Ethereum</div>
              <div class="text-xs font-bold text-white font-mono">4.120 ETH</div>
            </div>
            <span class="text-[10px] text-emerald-400 font-mono">$3,450</span>
          </div>
        </div>

        <div class="flex justify-between items-center pt-2 border-t border-white/10">
          <button class="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-purple-600/20 active:scale-95 transition-all">TRANSFER</button>
          <button class="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl border border-white/15">RECEIVE</button>
        </div>`
      ),
      width: 380,
      widthType: 'px',
      height: 240,
      heightType: 'px',
      alignment: 'center-left',
      offsetX: 20,
      offsetY: 0,
      borderRadius: 18,
      borderEnabled: true,
      borderColor: '#8b5cf6',
      showAddressBar: false,
      zIndex: 100
    }
  },

  // ==========================================
  // 7. AR WAYFINDING & NAVIGATION UI KIT
  // ==========================================
  {
    id: 'uk-ar-navigation-guide',
    name: 'Spatial Wayfinding Guide Card',
    category: 'AR Wayfinding',
    target: '2D HUD',
    badge: 'WAYFINDING',
    description: 'AR turn-by-turn navigation overlay with distance in meters, turn arrow, destination name, and ETA.',
    tags: ['navigation', 'wayfinding', 'ar', 'map'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml(
        'AR NAVIGATION',
        '#3b82f6',
        `<div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">📍</span>
            <div>
              <h3 class="text-xs font-bold text-white">Metropolitan Tech Hub</h3>
              <p class="text-[9px] text-slate-400">Destination #01 - Active Navigation</p>
            </div>
          </div>
          <span class="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">ETA: 2 MIN</span>
        </div>

        <div class="my-3 flex items-center gap-4 bg-blue-600/20 border border-blue-400/30 p-3 rounded-xl">
          <div class="w-12 h-12 rounded-xl bg-blue-500 text-slate-950 font-bold flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-blue-500/30">
            ↰
          </div>
          <div>
            <div class="text-[10px] font-mono uppercase text-blue-300">In 45 Meters</div>
            <div class="text-sm font-bold text-white">Turn Left onto Cyber Boulevard</div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-300">
          <span>Remaining: <strong class="text-white">120m</strong></span>
          <span>Elevation: <strong class="text-cyan-300">+4m</strong></span>
          <button class="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-lg">END ROUTE</button>
        </div>`
      ),
      width: 380,
      widthType: 'px',
      height: 220,
      heightType: 'px',
      alignment: 'top-left',
      offsetX: 20,
      offsetY: 20,
      borderRadius: 18,
      borderEnabled: true,
      borderColor: '#3b82f6',
      showAddressBar: false,
      zIndex: 100
    }
  },

  // ==========================================
  // 8. STUDIO CREATOR PRODUCTIVITY UI KIT
  // ==========================================
  {
    id: 'uk-studio-gizmo-assistant',
    name: 'Spatial Studio Transform Assistant',
    category: 'Studio Productivity',
    target: '2D HUD',
    badge: 'STUDIO TOOL',
    description: 'Compact AR creator panel with numeric Position, Rotation, Scale sliders, snap grid toggles, and scene node counter.',
    tags: ['studio', 'gizmo', 'transform', 'editor'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml(
        'STUDIO GIZMO',
        '#6366f1',
        `<div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-indigo-300 font-mono">📐 GIZMO INSPECTOR</span>
          </div>
          <span class="text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">Selected: Mesh_01</span>
        </div>

        <div class="my-2 space-y-2">
          <div class="flex items-center justify-between text-[10px] font-mono">
            <span class="text-slate-400">POSITION (X,Y,Z)</span>
            <div class="flex gap-1 text-white">
              <span class="bg-red-950/60 border border-red-800/40 px-1.5 py-0.5 rounded">X: 0.0</span>
              <span class="bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">Y: 1.2</span>
              <span class="bg-blue-950/60 border border-blue-800/40 px-1.5 py-0.5 rounded">Z: -0.5</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-[10px] font-mono">
            <span class="text-slate-400">SCALE</span>
            <div class="w-32 bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
              <div class="bg-indigo-400 h-full w-3/4"></div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <div class="flex gap-1">
            <button class="bg-indigo-600 text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded">SNAP GRID</button>
            <button class="bg-white/10 text-white text-[9px] font-mono px-2.5 py-1 rounded">DUPLICATE</button>
          </div>
          <button class="bg-red-500/20 text-red-300 text-[9px] font-mono px-2.5 py-1 rounded border border-red-500/30">DELETE</button>
        </div>`
      ),
      width: 360,
      widthType: 'px',
      height: 200,
      heightType: 'px',
      alignment: 'bottom-center',
      offsetX: 0,
      offsetY: 20,
      borderRadius: 16,
      borderEnabled: true,
      borderColor: '#6366f1',
      showAddressBar: false,
      zIndex: 100
    }
  },

  // ==========================================
  // 9. 3D SCENE UI KITS (3D Spatial Floating)
  // ==========================================
  {
    id: 'uk-3d-hologram-card',
    name: '3D Spatial Hologram Telemetry Card',
    category: 'Cyberpunk Tactical',
    target: '3D Scene',
    badge: '3D SPATIAL',
    description: 'Floating translucent 3D text panel emitting glowing holographic grid telemetry.',
    tags: ['3d', 'hologram', 'text', 'spatial'],
    objectType: 'text',
    properties: {
      text: "⚡ SPATIAL HUD ACTIVE\nGRID SYNC: 99.4%\nNODE LINK: OK",
      color: '#06b6d4',
      fontSize: 0.15,
      outlineColor: '#003554',
      outlineWidth: 0.015,
      textAlign: 'center'
    },
    scale: [1, 1, 1],
    position: [0, 1.2, 0],
    rotation: [0, 0, 0]
  },
  {
    id: 'uk-3d-neon-button',
    name: '3D Spatial Glass Button CTA',
    category: 'Vision OS Spatial',
    target: '3D Scene',
    badge: '3D BUTTON',
    description: '3D spatial CTA button with glowing neon borders and click interaction triggers.',
    tags: ['3d', 'button', 'interactive'],
    objectType: 'button',
    properties: {
      text: 'LAUNCH AR SCENE',
      color: '#38bdf8',
      textColor: '#ffffff',
      url: '#'
    },
    scale: [1, 0.35, 0.05],
    position: [0, 0.2, 0.1],
    rotation: [0, 0, 0]
  },
  {
    id: 'uk-3d-hotspot-pin',
    name: '3D Interactive Hotspot Pulse Marker',
    category: 'AR Wayfinding',
    target: '3D Scene',
    badge: '3D HOTSPOT',
    description: '3D pulsing ring hotspot marker attached to spatial coordinates for popover annotations.',
    tags: ['3d', 'hotspot', 'annotation', 'interactive'],
    objectType: 'hotspot',
    properties: {
      title: 'AR Feature Highlight',
      description: 'Tap to open detail inspection card.',
      color: '#ec4899',
      pulseSpeed: 1.5
    },
    scale: [1, 1, 1],
    position: [0.5, 0.8, 0],
    rotation: [0, 0, 0]
  }
];
