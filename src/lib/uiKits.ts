import { SceneObject, Vector3Data } from '../types';

export type UIKitCategory = 
  | 'Vision OS Spatial'
  | 'Cyberpunk Tactical'
  | 'Smart Home IoT'
  | 'E-Commerce AR'
  | 'Fintech & Crypto'
  | 'Spatial Audio'
  | 'AR Wayfinding'
  | 'Studio Productivity'
  | 'Media & Entertainment'
  | 'Gaming & Scoreboards'
  | 'Forms & Controls';

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
      background: rgba(10, 15, 29, 0.78);
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

// ==========================================
// 50+ UI KIT PRESETS COLLECTION
// ==========================================
export const UI_KIT_PRESETS: UIKitPreset[] = [
  // --- 1. VISION OS SPATIAL (6) ---
  {
    id: 'uk-vision-spatial-hub',
    name: 'Vision Pro Spatial Control Window',
    category: 'Vision OS Spatial',
    target: '2D HUD',
    badge: 'VISION OS',
    description: 'Translucent spatial window with sidebar navigation, eye tracking metrics, and glass pill controls.',
    tags: ['vision-os', 'glass', 'dashboard', 'hud'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('SPATIAL HUB', '#38bdf8', `
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
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
            <span class="text-[9px] text-cyan-400">Locked 90Hz</span>
          </div>
          <div class="p-2.5 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between">
            <span class="text-[9px] font-mono uppercase text-slate-400">Depth Buffer</span>
            <span class="text-lg font-bold text-white mono mt-1">0.4mm</span>
            <span class="text-[9px] text-indigo-400">LiDAR Active</span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <span class="text-[10px] font-mono text-slate-400">Pinch gesture to interact</span>
          <button class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1 rounded-full text-xs transition-all">Recalibrate</button>
        </div>
      `)
    }
  },
  {
    id: 'uk-vision-floating-dock',
    name: 'Spatial App Floating Dock',
    category: 'Vision OS Spatial',
    target: '2D HUD',
    badge: 'VISION OS',
    description: 'Pill-shaped spatial toolbar dock with glassmorphism icons and subtle selection halos.',
    tags: ['vision-os', 'dock', 'toolbar', 'glass'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('SPATIAL DOCK', '#38bdf8', `
        <div class="flex items-center justify-center h-full">
          <div class="flex items-center gap-3 bg-white/10 border border-white/20 p-2.5 rounded-full shadow-2xl backdrop-blur-xl">
            <div class="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold text-sm shadow-[0_0_15px_rgba(56,189,248,0.3)]">🏠</div>
            <div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm hover:bg-white/20 transition-all cursor-pointer">🎨</div>
            <div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm hover:bg-white/20 transition-all cursor-pointer">📐</div>
            <div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm hover:bg-white/20 transition-all cursor-pointer">🎵</div>
            <div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm hover:bg-white/20 transition-all cursor-pointer">⚙️</div>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-vision-eye-card',
    name: 'Gaze Focus Highlight Card',
    category: 'Vision OS Spatial',
    target: '2D HUD',
    badge: 'VISION OS',
    description: 'Interactive focus card that reacts to eye-gaze targeting and hand pinch feedback.',
    tags: ['vision-os', 'gaze', 'card', 'interact'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('GAZE CARD', '#38bdf8', `
        <div class="flex flex-col justify-between h-full">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-cyan-400 uppercase">Gaze Sensor #14</span>
            <span class="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">FOCUSED</span>
          </div>
          <div class="my-2">
            <h3 class="text-base font-bold text-white">Spatial Object Properties</h3>
            <p class="text-xs text-slate-300 mt-1">Look at any control to highlight, tap fingers together to trigger action.</p>
          </div>
          <div class="flex gap-2">
            <button class="flex-1 bg-white/10 border border-white/20 hover:bg-cyan-500 hover:text-black py-1.5 rounded-xl text-xs font-bold transition-all">Select</button>
            <button class="bg-white/5 border border-white/10 py-1.5 px-3 rounded-xl text-xs font-bold text-slate-300">Dismiss</button>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-vision-volume-dial',
    name: '3D Spatial Audio Sphere Slider',
    category: 'Vision OS Spatial',
    target: '2D HUD',
    badge: 'VISION OS',
    description: 'Curved volume slider with 3D audio positional node feedback.',
    tags: ['vision-os', 'audio', 'volume', 'slider'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('SPATIAL AUDIO DIAL', '#38bdf8', `
        <div class="flex flex-col justify-between h-full">
          <div class="flex justify-between items-center">
            <span class="text-xs font-mono text-cyan-300 font-bold">SPATIAL SOUNDSTAGE</span>
            <span class="text-xs font-mono text-white">78%</span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-3 relative my-3 overflow-hidden border border-white/10">
            <div class="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full" style="width: 78%"></div>
          </div>
          <div class="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Binaural HRTF</span>
            <span>Spatial Panning: Center</span>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-vision-battery-status',
    name: 'Spatial Battery & Wireless Pod',
    category: 'Vision OS Spatial',
    target: '2D HUD',
    badge: 'VISION OS',
    description: 'Status indicator pod displaying battery status, Wi-Fi 7 telemetry, and thermals.',
    tags: ['vision-os', 'battery', 'status', 'wifi'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('BATTERY POD', '#38bdf8', `
        <div class="flex items-center justify-between h-full">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 font-bold text-sm">⚡</div>
            <div>
              <div class="text-sm font-bold text-white">External Battery Pack</div>
              <div class="text-xs text-slate-400 font-mono">2h 45m remaining (88%)</div>
            </div>
          </div>
          <div class="text-right font-mono text-xs text-cyan-400 font-bold">Wi-Fi 7 Active</div>
        </div>
      `)
    }
  },
  {
    id: 'uk-vision-system-menu',
    name: 'Glass System Quick Controls',
    category: 'Vision OS Spatial',
    target: '2D HUD',
    badge: 'VISION OS',
    description: 'Minimal system quick control bar for brightness, pass-through toggle, and spatial environment preset.',
    tags: ['vision-os', 'quick-settings', 'passthrough', 'controls'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('QUICK CONTROLS', '#38bdf8', `
        <div class="grid grid-cols-2 gap-2 h-full">
          <div class="p-2.5 bg-white/10 rounded-xl border border-white/15 flex items-center justify-between">
            <span class="text-xs font-bold text-white">Environment</span>
            <span class="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full">Yosemite</span>
          </div>
          <div class="p-2.5 bg-white/10 rounded-xl border border-white/15 flex items-center justify-between">
            <span class="text-xs font-bold text-white">Passthrough</span>
            <span class="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full">100% Real</span>
          </div>
        </div>
      `)
    }
  },

  // --- 2. CYBERPUNK TACTICAL (6) ---
  {
    id: 'uk-cyber-hud-radar',
    name: 'Cyberpunk Tactical Target Reticle',
    category: 'Cyberpunk Tactical',
    target: '2D HUD',
    badge: 'CYBER TACTICAL',
    description: 'Neon amber tactical radar crosshair with lock-on target coordinates and distance telemetry.',
    tags: ['cyberpunk', 'reticle', 'tactical', 'radar'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('TACTICAL RETICLE', '#f59e0b', `
        <div class="flex flex-col justify-between h-full font-mono text-amber-400">
          <div class="flex justify-between items-center text-[10px] border-b border-amber-500/30 pb-1">
            <span>TARGET_LOCK // SYS.88</span>
            <span class="text-emerald-400">[ ACQUIRED ]</span>
          </div>
          <div class="my-2 flex items-center justify-center relative h-16">
            <div class="w-12 h-12 rounded-full border-2 border-amber-500/80 border-dashed animate-spin"></div>
            <div class="absolute w-2 h-2 bg-amber-400 rounded-full"></div>
            <span class="absolute right-2 text-[9px]">DIST: 42.8m</span>
          </div>
          <div class="flex justify-between text-[9px] text-amber-300">
            <span>AZ: 184°</span>
            <span>ALT: +12.4m</span>
            <span>SPEED: 0.0 m/s</span>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-cyber-health-bar',
    name: 'Neon Health & Shield Gauge',
    category: 'Cyberpunk Tactical',
    target: '2D HUD',
    badge: 'CYBER TACTICAL',
    description: 'Futuristic segmented vital status bar showing shield armor points, health bar, and stamina.',
    tags: ['cyberpunk', 'health', 'shield', 'vitals'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('VITALS GAUGE', '#ef4444', `
        <div class="flex flex-col justify-between h-full font-mono">
          <div class="flex justify-between text-xs font-bold text-red-400">
            <span>VITAL SIGNS</span>
            <span>100 / 100 HP</span>
          </div>
          <div class="w-full bg-red-950/60 border border-red-500/40 h-3 rounded flex p-0.5 gap-0.5">
            <div class="bg-red-500 flex-1 rounded-sm"></div>
            <div class="bg-red-500 flex-1 rounded-sm"></div>
            <div class="bg-red-500 flex-1 rounded-sm"></div>
            <div class="bg-red-500 flex-1 rounded-sm"></div>
            <div class="bg-red-500 flex-1 rounded-sm"></div>
          </div>
          <div class="flex justify-between text-[10px] text-cyan-400 mt-1">
            <span>SHIELD RECHARGE</span>
            <span>250 AP [MAX]</span>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-cyber-weapon-ammo',
    name: 'Cyber Ammo & Energy Cell Counter',
    category: 'Cyberpunk Tactical',
    target: '2D HUD',
    badge: 'CYBER TACTICAL',
    description: 'Big bold digital ammunition counter with battery cell heat bar.',
    tags: ['cyberpunk', 'ammo', 'weapons', 'counter'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('AMMO STATUS', '#f59e0b', `
        <div class="flex items-center justify-between h-full font-mono">
          <div>
            <div class="text-[10px] text-amber-400 uppercase tracking-widest">PLASMA RIFLE</div>
            <div class="text-3xl font-black text-amber-300">48 <span class="text-sm font-normal text-amber-500">/ 180</span></div>
          </div>
          <div class="text-right">
            <span class="text-[9px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded">OVERHEAT: 12%</span>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-cyber-minimap',
    name: 'Tactical Hologram Radar Minimap',
    category: 'Cyberpunk Tactical',
    target: '2D HUD',
    badge: 'CYBER TACTICAL',
    description: 'Circular radar grid display with ping markers and waypoint blips.',
    tags: ['cyberpunk', 'minimap', 'radar', 'navigation'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('RADAR MINIMAP', '#10b981', `
        <div class="flex flex-col items-center justify-between h-full font-mono text-emerald-400">
          <div class="w-full flex justify-between text-[9px]">
            <span>GRID: SECTOR 7G</span>
            <span>WAYPOINT: 120m</span>
          </div>
          <div class="w-16 h-16 rounded-full border border-emerald-500/50 bg-emerald-950/40 relative flex items-center justify-center">
            <div class="w-full h-0.5 bg-emerald-500/30 absolute"></div>
            <div class="h-full w-0.5 bg-emerald-500/30 absolute"></div>
            <div class="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]"></div>
            <div class="w-1.5 h-1.5 bg-red-400 rounded-full absolute top-2 right-3 animate-ping"></div>
          </div>
          <div class="text-[9px] text-emerald-500">3 OBJECTIVES IN RANGE</div>
        </div>
      `)
    }
  },
  {
    id: 'uk-cyber-hack-terminal',
    name: 'Cybernetic Hacking Terminal Code HUD',
    category: 'Cyberpunk Tactical',
    target: '2D HUD',
    badge: 'CYBER TACTICAL',
    description: 'Matrix terminal overlay displaying active node bypass code and encryption cipher status.',
    tags: ['cyberpunk', 'hack', 'terminal', 'code'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('HACK TERMINAL', '#10b981', `
        <div class="flex flex-col justify-between h-full font-mono text-emerald-400 text-[10px]">
          <div class="flex justify-between border-b border-emerald-500/30 pb-1">
            <span>NET_RUNNER // V2.1</span>
            <span class="text-emerald-300">STATUS: OVERRIDE</span>
          </div>
          <div class="bg-black/60 p-2 rounded border border-emerald-900 leading-tight">
            <div>> INJECTING EXPLOIT...</div>
            <div class="text-emerald-300">> NODE 0x7F2A: BYPASSED</div>
            <div class="text-emerald-500">> ENCRYPTION: 88% BROKEN</div>
          </div>
          <div class="flex justify-between text-[9px] text-emerald-600">
            <span>ICE TRACE: 0.00%</span>
            <span>PRESS [E] TO CONFIRM</span>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-cyber-night-vision',
    name: 'Night Vision Thermographic Sensor',
    category: 'Cyberpunk Tactical',
    target: '2D HUD',
    badge: 'CYBER TACTICAL',
    description: 'Phosphor green infrared night vision telemetry header for dark environment exploration.',
    tags: ['cyberpunk', 'night-vision', 'thermal', 'sensor'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('IR THERMAL SENSOR', '#10b981', `
        <div class="flex flex-col justify-between h-full font-mono text-emerald-400">
          <div class="flex justify-between text-[10px]">
            <span>MODE: THERMAL IR</span>
            <span>GAIN: +18dB</span>
          </div>
          <div class="text-center my-1 text-xs font-bold text-emerald-300 bg-emerald-950/80 py-1 rounded border border-emerald-800">
            HEAT SIGNATURE DETECTED [37.2°C]
          </div>
          <div class="flex justify-between text-[9px] text-emerald-500">
            <span>BATTERY: 94%</span>
            <span>SPECTRUM: 800nm-1000nm</span>
          </div>
        </div>
      `)
    }
  },

  // --- 3. SMART HOME IOT (5) ---
  {
    id: 'uk-iot-thermostat',
    name: 'Smart IoT Glass Thermostat Dial',
    category: 'Smart Home IoT',
    target: '2D HUD',
    badge: 'SMART HOME',
    description: 'Minimal thermostat controller with climate preset toggles and temperature reader.',
    tags: ['iot', 'thermostat', 'smart-home', 'climate'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('CLIMATE CONTROL', '#f97316', `
        <div class="flex flex-col justify-between h-full">
          <div class="flex justify-between items-center text-xs font-bold text-amber-400">
            <span>LIVING ROOM CLIMATE</span>
            <span class="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800">HEATING</span>
          </div>
          <div class="flex items-center justify-center my-1">
            <span class="text-3xl font-black text-white">72.5°<span class="text-sm font-normal text-slate-400">F</span></span>
          </div>
          <div class="flex gap-2">
            <button class="flex-1 bg-white/10 hover:bg-white/20 py-1 rounded text-xs font-bold text-white">Eco Mode</button>
            <button class="flex-1 bg-amber-500 hover:bg-amber-400 py-1 rounded text-xs font-bold text-slate-950">Boost +</button>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-iot-lighting-scene',
    name: 'Ambient Lighting Scene Selector',
    category: 'Smart Home IoT',
    target: '2D HUD',
    badge: 'SMART HOME',
    description: 'Color glow scene selector card for smart home lighting bulbs and ambient LED strips.',
    tags: ['iot', 'lighting', 'rgb', 'scene'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('LIGHTING SCENES', '#a855f7', `
        <div class="flex flex-col justify-between h-full">
          <div class="text-xs font-bold text-purple-300 mb-1">SMART AMBIANCE</div>
          <div class="grid grid-cols-4 gap-1.5 my-1">
            <div class="p-2 bg-indigo-500/30 border border-indigo-400 rounded-lg text-center cursor-pointer text-[10px] font-bold text-white">Cyber</div>
            <div class="p-2 bg-pink-500/30 border border-pink-400 rounded-lg text-center cursor-pointer text-[10px] font-bold text-white">Sunset</div>
            <div class="p-2 bg-emerald-500/30 border border-emerald-400 rounded-lg text-center cursor-pointer text-[10px] font-bold text-white">Relax</div>
            <div class="p-2 bg-amber-500/30 border border-amber-400 rounded-lg text-center cursor-pointer text-[10px] font-bold text-white">Warm</div>
          </div>
          <div class="text-[10px] text-slate-400 text-center">12 Connected Hue Bulbs Active</div>
        </div>
      `)
    }
  },
  {
    id: 'uk-iot-security-cam',
    name: 'AR Live Security Camera Feed Tile',
    category: 'Smart Home IoT',
    target: '2D HUD',
    badge: 'SMART HOME',
    description: 'Security camera status widget showing motion alert and live streaming indicator.',
    tags: ['iot', 'security', 'camera', 'live'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('SECURITY FEED', '#3b82f6', `
        <div class="flex flex-col justify-between h-full">
          <div class="flex justify-between items-center text-xs font-bold">
            <span class="text-blue-400">FRONT PORCH CAM</span>
            <span class="text-[9px] bg-red-600 text-white font-mono px-1.5 py-0.5 rounded animate-pulse">● LIVE</span>
          </div>
          <div class="my-2 bg-slate-900 border border-slate-700 rounded-lg p-3 text-center text-slate-400 text-xs font-mono">
            [ MOTION CLEAR ]
          </div>
          <div class="flex justify-between text-[10px] text-slate-400">
            <span>1080p 60fps</span>
            <span>NightVision: AUTO</span>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-iot-solar-power',
    name: 'Solar Grid Energy Monitor',
    category: 'Smart Home IoT',
    target: '2D HUD',
    badge: 'SMART HOME',
    description: 'Solar power generation and house battery charge status dashboard tile.',
    tags: ['iot', 'solar', 'energy', 'power'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('SOLAR ENERGY', '#eab308', `
        <div class="flex flex-col justify-between h-full font-mono">
          <div class="flex justify-between text-xs font-bold text-yellow-400">
            <span>SOLAR GENERATION</span>
            <span>+4.8 kW</span>
          </div>
          <div class="my-1 text-2xl font-black text-white">92% <span class="text-xs font-normal text-emerald-400">Battery Full</span></div>
          <div class="text-[10px] text-slate-400">Grid Export: 2.1 kW // Eco Savings: $14.20/day</div>
        </div>
      `)
    }
  },
  {
    id: 'uk-iot-door-lock',
    name: 'Smart Door Lock Toggle Widget',
    category: 'Smart Home IoT',
    target: '2D HUD',
    badge: 'SMART HOME',
    description: 'Secure biometric door lock status card with lock/unlock action button.',
    tags: ['iot', 'lock', 'security', 'door'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('SMART LOCK', '#10b981', `
        <div class="flex items-center justify-between h-full">
          <div>
            <div class="text-xs font-bold text-emerald-400">MAIN ENTRANCE LOCK</div>
            <div class="text-xs text-slate-300 font-mono mt-0.5">LOCKED // BIOMETRIC SECURE</div>
          </div>
          <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all">Unlock 🔑</button>
        </div>
      `)
    }
  },

  // --- 4. E-COMMERCE AR (5) ---
  {
    id: 'uk-ecom-product-card',
    name: 'AR Product Spec & Buy Card',
    category: 'E-Commerce AR',
    target: '2D HUD',
    badge: 'E-COMMERCE',
    description: 'Floating product info card with price tag, color swatch selector, and Instant Buy button.',
    tags: ['e-commerce', 'product', 'buy', 'price'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('PRODUCT SPEC', '#ec4899', `
        <div class="flex flex-col justify-between h-full">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[9px] font-mono text-pink-400 uppercase tracking-wider">NEW COLLECTION</span>
              <h3 class="text-sm font-bold text-white">Spatial AR Glasses Pro</h3>
            </div>
            <span class="text-base font-black text-emerald-400 font-mono">$899</span>
          </div>
          <div class="flex items-center gap-1.5 my-2">
            <span class="text-[10px] text-slate-400">Color:</span>
            <div class="w-4 h-4 rounded-full bg-slate-900 border-2 border-pink-500 cursor-pointer"></div>
            <div class="w-4 h-4 rounded-full bg-slate-300 border border-white/20 cursor-pointer"></div>
            <div class="w-4 h-4 rounded-full bg-amber-600 border border-white/20 cursor-pointer"></div>
          </div>
          <button class="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-1.5 rounded-xl text-xs transition-all shadow-lg shadow-pink-600/30">Add to Spatial Cart 🛒</button>
        </div>
      `)
    }
  },
  {
    id: 'uk-ecom-size-picker',
    name: '3D Fit & Dimension Reader',
    category: 'E-Commerce AR',
    target: '2D HUD',
    badge: 'E-COMMERCE',
    description: 'Dimension measurements widget displaying width, height, and depth in centimeters.',
    tags: ['e-commerce', 'dimension', 'fit', 'size'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('DIMENSIONS', '#ec4899', `
        <div class="flex flex-col justify-between h-full font-mono">
          <div class="text-xs font-bold text-pink-300">REAL-SCALE BOUNDING BOX</div>
          <div class="grid grid-cols-3 gap-1 my-2 text-center">
            <div class="p-1 bg-white/5 rounded"><div class="text-[9px] text-slate-400">WIDTH</div><div class="text-xs font-bold text-white">45 cm</div></div>
            <div class="p-1 bg-white/5 rounded"><div class="text-[9px] text-slate-400">HEIGHT</div><div class="text-xs font-bold text-white">82 cm</div></div>
            <div class="p-1 bg-white/5 rounded"><div class="text-[9px] text-slate-400">DEPTH</div><div class="text-xs font-bold text-white">50 cm</div></div>
          </div>
          <div class="text-[9px] text-emerald-400 text-center">✓ Fits in your room footprint</div>
        </div>
      `)
    }
  },
  {
    id: 'uk-ecom-reviews',
    name: 'Customer Ratings & Reviews Badge',
    category: 'E-Commerce AR',
    target: '2D HUD',
    badge: 'E-COMMERCE',
    description: 'Star ratings breakdown widget with verified buyer badge and quick review snippets.',
    tags: ['e-commerce', 'reviews', 'stars', 'rating'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('REVIEWS', '#f59e0b', `
        <div class="flex items-center justify-between h-full">
          <div>
            <div class="flex items-center gap-1">
              <span class="text-amber-400 text-sm">★★★★★</span>
              <span class="text-xs font-bold text-white">4.9 / 5.0</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">Based on 1,240 verified AR try-ons</div>
          </div>
          <span class="text-xs font-bold text-amber-300 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800">Top Rated</span>
        </div>
      `)
    }
  },
  {
    id: 'uk-ecom-checkout',
    name: 'Instant Spatial Apple Pay Bar',
    category: 'E-Commerce AR',
    target: '2D HUD',
    badge: 'E-COMMERCE',
    description: 'One-click spatial checkout bar with Apple Pay / Google Pay instant trigger.',
    tags: ['e-commerce', 'checkout', 'pay', 'apple-pay'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('SPATIAL CHECKOUT', '#ffffff', `
        <div class="flex items-center justify-between h-full text-slate-900">
          <div>
            <span class="text-[10px] font-mono text-slate-400">TOTAL DUE</span>
            <div class="text-lg font-black text-white">$1,299.00</div>
          </div>
          <button class="bg-white hover:bg-slate-200 text-black font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all">
             Pay
          </button>
        </div>
      `)
    }
  },
  {
    id: 'uk-ecom-variant-swatch',
    name: 'Material & Texture Material Swatch Picker',
    category: 'E-Commerce AR',
    target: '2D HUD',
    badge: 'E-COMMERCE',
    description: 'Material surface switcher for toggling between Leather, Velvet, Chrome, and Wood finishes.',
    tags: ['e-commerce', 'material', 'swatch', 'texture'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('MATERIAL SWATCH', '#38bdf8', `
        <div class="flex flex-col justify-between h-full">
          <div class="text-xs font-bold text-cyan-300">SURFACE FINISH PRESET</div>
          <div class="flex gap-2 my-1">
            <button class="flex-1 bg-slate-800 border border-cyan-400 p-1.5 rounded text-[10px] font-bold text-white">Matte Black</button>
            <button class="flex-1 bg-amber-900 border border-white/10 p-1.5 rounded text-[10px] font-bold text-white">Walnut Wood</button>
            <button class="flex-1 bg-slate-300 border border-white/10 p-1.5 rounded text-[10px] font-bold text-slate-900">Brushed Aluminum</button>
          </div>
          <div class="text-[9px] text-slate-400 text-center">Real-time PBR Shaders</div>
        </div>
      `)
    }
  },

  // --- 5. FINTECH & CRYPTO (5) ---
  {
    id: 'uk-fintech-ticker',
    name: 'Live Crypto Ticker & Price Sparkline',
    category: 'Fintech & Crypto',
    target: '2D HUD',
    badge: 'FINTECH',
    description: 'Live price ticker displaying Bitcoin/Ethereum values with 24h percentage change.',
    tags: ['fintech', 'crypto', 'ticker', 'bitcoin'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('LIVE TICKER', '#10b981', `
        <div class="flex items-center justify-between h-full font-mono">
          <div>
            <div class="text-xs font-bold text-slate-300">BTC / USD</div>
            <div class="text-xl font-black text-white">$94,250.00</div>
          </div>
          <div class="text-right">
            <div class="text-xs font-bold text-emerald-400">+5.82% ▲</div>
            <div class="text-[9px] text-slate-400">24h Vol: $42.8B</div>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-fintech-portfolio',
    name: 'Spatial Wealth Portfolio Donut Card',
    category: 'Fintech & Crypto',
    target: '2D HUD',
    badge: 'FINTECH',
    description: 'Portfolio balance dashboard displaying asset allocation and net worth growth.',
    tags: ['fintech', 'portfolio', 'balance', 'wealth'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('PORTFOLIO BAL', '#6366f1', `
        <div class="flex flex-col justify-between h-full font-mono">
          <div class="flex justify-between text-xs font-bold text-indigo-300">
            <span>NET WORTH</span>
            <span class="text-emerald-400">▲ +12.4%</span>
          </div>
          <div class="text-2xl font-black text-white">$248,910.50</div>
          <div class="flex justify-between text-[10px] text-slate-400">
            <span>Stocks: 55%</span>
            <span>Crypto: 30%</span>
            <span>Cash: 15%</span>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-fintech-gas-tracker',
    name: 'Ethereum Gas Fee Monitor',
    category: 'Fintech & Crypto',
    target: '2D HUD',
    badge: 'FINTECH',
    description: 'Real-time Web3 network gas fee monitor showing Gwei rates for instant vs slow transactions.',
    tags: ['fintech', 'gas', 'ethereum', 'web3'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('GAS TRACKER', '#a855f7', `
        <div class="flex items-center justify-between h-full font-mono">
          <div>
            <div class="text-xs font-bold text-purple-300">ETH GAS PRICE</div>
            <div class="text-lg font-bold text-white">14 <span class="text-xs font-normal text-slate-400">Gwei</span></div>
          </div>
          <span class="text-xs text-emerald-400 bg-emerald-950 px-2 py-1 rounded border border-emerald-800">FAST [~$0.45]</span>
        </div>
      `)
    }
  },
  {
    id: 'uk-fintech-card-3d',
    name: '3D Holographic Visa Metal Card',
    category: 'Fintech & Crypto',
    target: '2D HUD',
    badge: 'FINTECH',
    description: 'Metallic holographic payment debit card with contact chip and cardholder details.',
    tags: ['fintech', 'card', 'visa', 'payment'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('METAL CARD', '#38bdf8', `
        <div class="flex flex-col justify-between h-full p-2 bg-gradient-to-tr from-slate-900 to-indigo-900 border border-cyan-500/40 rounded-xl">
          <div class="flex justify-between items-center text-xs font-bold text-cyan-300">
            <span>FINTECH PLATINUM</span>
            <span>VISA</span>
          </div>
          <div class="w-8 h-6 bg-amber-400/80 rounded border border-amber-300/50 my-1"></div>
          <div class="font-mono text-xs text-white tracking-widest">•••• •••• •••• 8842</div>
        </div>
      `)
    }
  },
  {
    id: 'uk-fintech-swap',
    name: 'Instant Web3 Token Swap Box',
    category: 'Fintech & Crypto',
    target: '2D HUD',
    badge: 'FINTECH',
    description: 'DEX token swap interface with input/output token pair and execution button.',
    tags: ['fintech', 'swap', 'dex', 'tokens'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('TOKEN SWAP', '#6366f1', `
        <div class="flex flex-col justify-between h-full font-mono">
          <div class="flex justify-between items-center bg-white/5 p-1.5 rounded">
            <span class="text-xs font-bold text-white">1.0 ETH</span>
            <span class="text-[10px] bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded">ETH</span>
          </div>
          <div class="text-center text-xs text-indigo-400">⬇ Slippage 0.5%</div>
          <div class="flex justify-between items-center bg-white/5 p-1.5 rounded">
            <span class="text-xs font-bold text-white">3,240.50 USDC</span>
            <span class="text-[10px] bg-blue-900 text-blue-300 px-2 py-0.5 rounded">USDC</span>
          </div>
        </div>
      `)
    }
  },

  // --- 6. SPATIAL AUDIO (5) ---
  {
    id: 'uk-audio-eq-bars',
    name: '3D Equalizer Spectrum Analyzer',
    category: 'Spatial Audio',
    target: '2D HUD',
    badge: 'AUDIO HUD',
    description: 'Bouncing 10-band frequency equalizer spectrum visualizer.',
    tags: ['audio', 'equalizer', 'spectrum', 'music'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('EQUALIZER', '#ec4899', `
        <div class="flex flex-col justify-between h-full font-mono">
          <div class="flex justify-between text-xs font-bold text-pink-400">
            <span>MASTER EQUALIZER</span>
            <span>44.1 kHz</span>
          </div>
          <div class="flex items-end justify-between h-12 gap-1 my-1">
            <div class="bg-pink-500 w-full h-8 rounded-t"></div>
            <div class="bg-pink-500 w-full h-12 rounded-t"></div>
            <div class="bg-pink-500 w-full h-6 rounded-t"></div>
            <div class="bg-pink-500 w-full h-10 rounded-t"></div>
            <div class="bg-pink-500 w-full h-7 rounded-t"></div>
            <div class="bg-pink-500 w-full h-11 rounded-t"></div>
          </div>
          <div class="flex justify-between text-[9px] text-slate-400">
            <span>60Hz</span><span>1kHz</span><span>16kHz</span>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-audio-waveform',
    name: 'Spatial Waveform Player Controller',
    category: 'Spatial Audio',
    target: '2D HUD',
    badge: 'AUDIO HUD',
    description: 'Audio playback bar with waveform track visualizer and play/pause controls.',
    tags: ['audio', 'waveform', 'player', 'control'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('WAVEFORM PLAYER', '#38bdf8', `
        <div class="flex items-center justify-between h-full font-mono">
          <button class="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-sm">▶</button>
          <div class="flex-1 mx-3">
            <div class="text-xs font-bold text-white">Midnight Synthwave Loop</div>
            <div class="text-[10px] text-cyan-300">01:42 / 03:15</div>
          </div>
          <span class="text-xs text-slate-400">Loop 🔂</span>
        </div>
      `)
    }
  },
  {
    id: 'uk-audio-surround-node',
    name: '3D Spatial Soundstage Node Locator',
    category: 'Spatial Audio',
    target: '2D HUD',
    badge: 'AUDIO HUD',
    description: 'Interactive 3D binaural sound stage node displaying listener orientation.',
    tags: ['audio', 'surround', 'spatial', '3d-sound'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('SOUNDSTAGE LOCATOR', '#38bdf8', `
        <div class="flex flex-col justify-between h-full font-mono text-cyan-300 text-[10px]">
          <div class="flex justify-between">
            <span>BINAURAL HEAD TRACKING</span>
            <span class="text-emerald-400">ACTIVE</span>
          </div>
          <div class="text-center bg-cyan-950/80 p-2 rounded border border-cyan-800 text-white font-bold my-1">
            POSITION: X: -1.2m | Y: +0.4m | Z: +2.1m
          </div>
          <div class="flex justify-between text-slate-400 text-[9px]">
            <span>Dolby Atmos AR</span>
            <span>Atten: Inverse Square</span>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-audio-bpm-counter',
    name: 'BPM & Tempo Sync Meter',
    category: 'Spatial Audio',
    target: '2D HUD',
    badge: 'AUDIO HUD',
    description: 'Live beat-per-minute detector and rhythm sync tempo indicator.',
    tags: ['audio', 'bpm', 'tempo', 'sync'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('BPM SYNC', '#f43f5e', `
        <div class="flex items-center justify-between h-full font-mono">
          <div>
            <div class="text-[10px] text-rose-400">TEMPO LOCK</div>
            <div class="text-2xl font-black text-white">128 <span class="text-xs font-normal text-rose-300">BPM</span></div>
          </div>
          <div class="w-4 h-4 rounded-full bg-rose-500 animate-ping"></div>
        </div>
      `)
    }
  },
  {
    id: 'uk-audio-mic-gain',
    name: 'Spatial Voice Mic Gain Indicator',
    category: 'Spatial Audio',
    target: '2D HUD',
    badge: 'AUDIO HUD',
    description: 'Microphone input level VU meter with noise suppression toggle.',
    tags: ['audio', 'mic', 'gain', 'voice'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('MIC VU METER', '#10b981', `
        <div class="flex flex-col justify-between h-full font-mono">
          <div class="flex justify-between text-xs font-bold text-emerald-400">
            <span>VOICE INPUT</span>
            <span>-6.2 dB</span>
          </div>
          <div class="w-full bg-slate-900 border border-slate-700 h-2.5 rounded overflow-hidden flex my-2">
            <div class="bg-emerald-500 h-full" style="width: 70%"></div>
          </div>
          <div class="text-[9px] text-slate-400 text-center">AI Noise Cancellation: ON</div>
        </div>
      `)
    }
  },

  // --- 7. AR WAYFINDING (5) ---
  {
    id: 'uk-way-arrow',
    name: 'AR Directional Nav Compass',
    category: 'AR Wayfinding',
    target: '2D HUD',
    badge: 'WAYFINDING',
    description: '3D navigation compass arrow with heading direction and destination distance in meters.',
    tags: ['wayfinding', 'compass', 'arrow', 'nav'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('AR COMPASS', '#06b6d4', `
        <div class="flex items-center justify-between h-full font-mono">
          <div class="w-12 h-12 rounded-full border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-black text-xl">
            ➔
          </div>
          <div class="flex-1 mx-3">
            <div class="text-xs font-bold text-white">Turn Right in 15m</div>
            <div class="text-[10px] text-cyan-300">Heading 045° NE // Gate B12</div>
          </div>
          <span class="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-1 rounded">2 min</span>
        </div>
      `)
    }
  },
  {
    id: 'uk-way-distance',
    name: 'Spatial Distance Beacon Card',
    category: 'AR Wayfinding',
    target: '2D HUD',
    badge: 'WAYFINDING',
    description: 'Proximity distance reader for tagged locations in augmented space.',
    tags: ['wayfinding', 'distance', 'beacon', 'location'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('DISTANCE BEACON', '#06b6d4', `
        <div class="flex flex-col justify-between h-full font-mono">
          <div class="text-xs font-bold text-cyan-300">AR BEACON // STAGE A</div>
          <div class="text-2xl font-black text-white my-1">3.4 <span class="text-xs font-normal text-slate-400">meters away</span></div>
          <div class="text-[9px] text-emerald-400">Direct Line of Sight Verified</div>
        </div>
      `)
    }
  },
  {
    id: 'uk-way-floor-plan',
    name: 'Building Interior Mini Floorplan',
    category: 'AR Wayfinding',
    target: '2D HUD',
    badge: 'WAYFINDING',
    description: 'Multi-level indoor floor plan map widget with user position blip.',
    tags: ['wayfinding', 'floorplan', 'indoor', 'map'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('INDOOR MAP', '#06b6d4', `
        <div class="flex flex-col justify-between h-full font-mono text-[10px]">
          <div class="flex justify-between font-bold text-cyan-300">
            <span>FLOOR 3 // ZONE C</span>
            <span>ELEVATOR: 20m</span>
          </div>
          <div class="bg-black/50 p-2 rounded border border-cyan-900 text-slate-300 my-1">
            📍 YOU ARE HERE: Room 304 (Lab)
          </div>
          <div class="text-[9px] text-slate-400">GPS + Ultra-Wideband Triangulated</div>
        </div>
      `)
    }
  },
  {
    id: 'uk-way-speedometer',
    name: 'Movement Speed & Cadence HUD',
    category: 'AR Wayfinding',
    target: '2D HUD',
    badge: 'WAYFINDING',
    description: 'Live movement velocity gauge showing walking/running speed in km/h.',
    tags: ['wayfinding', 'speed', 'cadence', 'pedometer'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('SPEED HUD', '#06b6d4', `
        <div class="flex items-center justify-between h-full font-mono">
          <div>
            <div class="text-[10px] text-cyan-400">WALKING PACE</div>
            <div class="text-2xl font-black text-white">5.2 <span class="text-xs font-normal text-slate-400">km/h</span></div>
          </div>
          <div class="text-right text-[10px] text-slate-400">
            <div>Steps: 4,820</div>
            <div>Cal: 184 kcal</div>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-way-poi-card',
    name: 'Point-of-Interest Info Overlay',
    category: 'AR Wayfinding',
    target: '2D HUD',
    badge: 'WAYFINDING',
    description: 'POi popup card detailing museum artifact info or landmark history.',
    tags: ['wayfinding', 'poi', 'landmark', 'museum'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('POI INFO', '#06b6d4', `
        <div class="flex flex-col justify-between h-full">
          <div class="flex justify-between items-center text-xs font-bold">
            <span class="text-cyan-300">HISTORIC MONUMENT #04</span>
            <span class="text-[9px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded">INFO</span>
          </div>
          <p class="text-xs text-slate-200 my-1">Constructed in 1892. Click to play 3D audio narration guide.</p>
          <button class="bg-cyan-500 text-slate-950 font-bold py-1 rounded text-xs">Play Guide 🎧</button>
        </div>
      `)
    }
  },

  // --- 8. STUDIO PRODUCTIVITY (6) ---
  {
    id: 'uk-studio-layer-tree',
    name: 'Spatial Layer Hierarchy Tree Window',
    category: 'Studio Productivity',
    target: '2D HUD',
    badge: 'STUDIO',
    description: 'Layer tree window listing 3D scene objects with visibility and lock toggles.',
    tags: ['studio', 'layers', 'tree', 'hierarchy'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('LAYERS TREE', '#6366f1', `
        <div class="flex flex-col justify-between h-full font-mono text-[10px]">
          <div class="flex justify-between font-bold text-indigo-300 border-b border-indigo-500/30 pb-1">
            <span>SCENE OUTLINER</span>
            <span>4 OBJECTS</span>
          </div>
          <div class="space-y-1 my-1">
            <div class="flex justify-between bg-white/10 p-1 rounded text-white"><span>👁️ 🧊 Main Mesh</span><span>🔒</span></div>
            <div class="flex justify-between bg-white/5 p-1 rounded text-slate-300"><span>👁️ 💡 Key Light</span><span>🔓</span></div>
            <div class="flex justify-between bg-white/5 p-1 rounded text-slate-300"><span>👁️ 📷 Main Camera</span><span>🔓</span></div>
          </div>
          <div class="text-[9px] text-slate-400">+ Add New Layer Group</div>
        </div>
      `)
    }
  },
  {
    id: 'uk-studio-transform-inspector',
    name: '3D Transform Position/Rotation/Scale Inspector',
    category: 'Studio Productivity',
    target: '2D HUD',
    badge: 'STUDIO',
    description: 'Numerical inspector panel for editing X, Y, Z coordinates.',
    tags: ['studio', 'transform', 'inspector', 'xyz'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('TRANSFORM INSPECTOR', '#6366f1', `
        <div class="flex flex-col justify-between h-full font-mono text-[10px]">
          <div class="font-bold text-indigo-300 mb-1">TRANSFORM VALUES</div>
          <div class="space-y-1">
            <div class="flex items-center justify-between"><span class="text-red-400">X:</span><input class="bg-black/50 w-24 p-0.5 text-center rounded text-white border border-white/10" value="0.00"></div>
            <div class="flex items-center justify-between"><span class="text-emerald-400">Y:</span><input class="bg-black/50 w-24 p-0.5 text-center rounded text-white border border-white/10" value="1.50"></div>
            <div class="flex items-center justify-between"><span class="text-blue-400">Z:</span><input class="bg-black/50 w-24 p-0.5 text-center rounded text-white border border-white/10" value="-2.10"></div>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-studio-history-undo',
    name: 'Undo / Redo Action Timeline Stack',
    category: 'Studio Productivity',
    target: '2D HUD',
    badge: 'STUDIO',
    description: 'History stack timeline showing recent edits and undo/redo buttons.',
    tags: ['studio', 'history', 'undo', 'redo'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('HISTORY STACK', '#6366f1', `
        <div class="flex items-center justify-between h-full font-mono">
          <button class="bg-white/10 hover:bg-white/20 p-2 rounded text-xs text-white">↩ Undo</button>
          <div class="text-center text-[10px] text-slate-300">
            <div class="font-bold">Modified Material</div>
            <div class="text-slate-500">2s ago</div>
          </div>
          <button class="bg-white/10 hover:bg-white/20 p-2 rounded text-xs text-white">↪ Redo</button>
        </div>
      `)
    }
  },
  {
    id: 'uk-studio-export-panel',
    name: '3D Export glTF / USDZ / OBJ Panel',
    category: 'Studio Productivity',
    target: '2D HUD',
    badge: 'STUDIO',
    description: 'Export configuration dialog for saving 3D models in glTF, USDZ, or OBJ formats.',
    tags: ['studio', 'export', 'gltf', 'usdz'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('EXPORT 3D', '#6366f1', `
        <div class="flex flex-col justify-between h-full font-mono">
          <div class="text-xs font-bold text-indigo-300">EXPORT FORMAT</div>
          <div class="flex gap-1.5 my-1">
            <button class="flex-1 bg-indigo-600 text-white p-1 rounded text-[10px] font-bold">glTF 2.0</button>
            <button class="flex-1 bg-white/10 text-slate-300 p-1 rounded text-[10px] font-bold">USDZ</button>
            <button class="flex-1 bg-white/10 text-slate-300 p-1 rounded text-[10px] font-bold">OBJ</button>
          </div>
          <button class="w-full bg-emerald-500 text-slate-950 font-bold py-1 rounded text-xs">Download File 💾</button>
        </div>
      `)
    }
  },
  {
    id: 'uk-studio-snapping-grid',
    name: 'Grid Alignment & Pivot Control',
    category: 'Studio Productivity',
    target: '2D HUD',
    badge: 'STUDIO',
    description: 'Grid snap interval switcher and object pivot point origin controller.',
    tags: ['studio', 'grid', 'snap', 'pivot'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('GRID SNAP', '#6366f1', `
        <div class="flex items-center justify-between h-full font-mono text-xs">
          <span class="text-indigo-300 font-bold">GRID SNAP: 0.25m</span>
          <div class="flex gap-1">
            <button class="bg-indigo-900 text-indigo-200 px-2 py-1 rounded border border-indigo-700">0.1m</button>
            <button class="bg-indigo-600 text-white px-2 py-1 rounded font-bold">0.25m</button>
            <button class="bg-indigo-900 text-indigo-200 px-2 py-1 rounded border border-indigo-700">1.0m</button>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-studio-ai-prompt',
    name: 'Gemini AI 3D Generator Prompt Box',
    category: 'Studio Productivity',
    target: '2D HUD',
    badge: 'STUDIO',
    description: 'Natural language text prompt box for generating materials and 3D shapes with Gemini AI.',
    tags: ['studio', 'ai', 'gemini', 'prompt'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('GEMINI AI GENERATOR', '#a855f7', `
        <div class="flex flex-col justify-between h-full">
          <div class="flex justify-between items-center text-xs font-bold text-purple-300">
            <span>✨ GEMINI AI 3D PROMPT</span>
            <span class="text-[9px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded">READY</span>
          </div>
          <input class="w-full bg-white/10 border border-purple-500/30 rounded p-1.5 text-xs text-white placeholder-slate-400 my-1 focus:outline-none" placeholder="e.g. Glowing neon crystal pedestal...">
          <button class="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1 rounded text-xs">Generate Asset ✨</button>
        </div>
      `)
    }
  },

  // --- 9. MEDIA & ENTERTAINMENT (5) ---
  {
    id: 'uk-media-video-player',
    name: 'AR Holographic Cinema Video Player',
    category: 'Media & Entertainment',
    target: '2D HUD',
    badge: 'MEDIA HUD',
    description: 'Curved 16:9 spatial theater screen video controls with scrubber timeline and volume dial.',
    tags: ['media', 'video', 'cinema', 'theater'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('CINEMA PLAYER', '#f43f5e', `
        <div class="flex flex-col justify-between h-full font-mono">
          <div class="flex justify-between text-xs font-bold text-rose-400">
            <span>SPATIAL CINEMA 4K</span>
            <span class="text-emerald-400">HDR10+</span>
          </div>
          <div class="flex items-center justify-center gap-4 my-1">
            <button class="text-slate-300">⏮</button>
            <button class="w-10 h-10 bg-rose-600 text-white rounded-full font-bold">▶</button>
            <button class="text-slate-300">⏭</button>
          </div>
          <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div class="bg-rose-500 h-full" style="width: 45%"></div>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-media-stream-chat',
    name: 'Live AR Stream Chat Overlay',
    category: 'Media & Entertainment',
    target: '2D HUD',
    badge: 'MEDIA HUD',
    description: 'Scrolling live streaming chat comments feed with user avatars and reactions.',
    tags: ['media', 'chat', 'live', 'stream'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('LIVE STREAM CHAT', '#a855f7', `
        <div class="flex flex-col justify-between h-full text-[10px]">
          <div class="font-bold text-purple-300 border-b border-purple-500/30 pb-1">LIVE CHAT // 1,420 VIEWERS</div>
          <div class="space-y-1 my-1">
            <div><span class="font-bold text-cyan-400">@CyberAlex:</span> <span class="text-slate-200">This AR scene looks incredible! 🔥</span></div>
            <div><span class="font-bold text-pink-400">@NeonRider:</span> <span class="text-slate-200">Where can I get the 3D model?</span></div>
          </div>
          <input class="w-full bg-white/10 rounded px-2 py-1 text-white placeholder-slate-400" placeholder="Send chat message...">
        </div>
      `)
    }
  },
  {
    id: 'uk-media-photo-gallery',
    name: 'Spatial Photo Carousel Card',
    category: 'Media & Entertainment',
    target: '2D HUD',
    badge: 'MEDIA HUD',
    description: '3D floating photo album carousel with next/prev pagination buttons.',
    tags: ['media', 'photo', 'gallery', 'carousel'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('PHOTO GALLERY', '#38bdf8', `
        <div class="flex items-center justify-between h-full">
          <button class="text-slate-400 hover:text-white font-bold">◀</button>
          <div class="text-center">
            <div class="text-xs font-bold text-white">Yosemite Sunset AR</div>
            <div class="text-[10px] text-cyan-300">Photo 3 of 12</div>
          </div>
          <button class="text-slate-400 hover:text-white font-bold">▶</button>
        </div>
      `)
    }
  },
  {
    id: 'uk-media-podcast-mic',
    name: 'Podcast Host On-Air Indicator',
    category: 'Media & Entertainment',
    target: '2D HUD',
    badge: 'MEDIA HUD',
    description: 'Pulsing glowing ON-AIR red sign for broadcast recording studios.',
    tags: ['media', 'on-air', 'podcast', 'mic'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('ON AIR', '#ef4444', `
        <div class="flex items-center justify-center h-full">
          <div class="bg-red-600 text-white font-black text-lg px-6 py-2 rounded-xl tracking-widest border border-red-400 shadow-[0_0_20px_#ef4444] animate-pulse">
            🔴 ON AIR
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-media-dj-deck',
    name: 'Virtual DJ Mixer Crossfader',
    category: 'Media & Entertainment',
    target: '2D HUD',
    badge: 'MEDIA HUD',
    description: 'Dual-deck audio crossfader slider for DJ mixing performance.',
    tags: ['media', 'dj', 'mixer', 'crossfader'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('DJ CROSSFADER', '#f59e0b', `
        <div class="flex flex-col justify-between h-full font-mono text-xs">
          <div class="flex justify-between font-bold text-amber-400">
            <span>DECK A</span>
            <span>DECK B</span>
          </div>
          <div class="w-full bg-slate-900 border border-amber-500/40 h-4 rounded relative my-1 flex items-center">
            <div class="w-6 h-6 bg-amber-500 rounded border border-white absolute cursor-pointer shadow-lg" style="left: 45%"></div>
          </div>
          <div class="text-center text-[9px] text-slate-400">CROSSFADER CENTERED</div>
        </div>
      `)
    }
  },

  // --- 10. GAMING & SCOREBOARDS (5) ---
  {
    id: 'uk-game-scoreboard',
    name: 'Arcade Multi-Player Scoreboard',
    category: 'Gaming & Scoreboards',
    target: '2D HUD',
    badge: 'GAMING HUD',
    description: 'Retro 8-bit digital arcade scoreboard listing player rank, score, and combo multiplier.',
    tags: ['gaming', 'scoreboard', 'arcade', 'score'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('ARCADE SCOREBOARD', '#eab308', `
        <div class="flex flex-col justify-between h-full font-mono text-yellow-400 text-xs">
          <div class="flex justify-between font-bold border-b border-yellow-500/30 pb-1">
            <span>HIGH SCORES</span>
            <span>STAGE 4</span>
          </div>
          <div class="space-y-1 my-1">
            <div class="flex justify-between text-white"><span>1. PLAYER_1</span><span>84,200</span></div>
            <div class="flex justify-between text-slate-400"><span>2. CYBER_GHOST</span><span>62,100</span></div>
            <div class="flex justify-between text-slate-400"><span>3. NEON_FOX</span><span>48,900</span></div>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-game-inventory-grid',
    name: 'RPG Item Inventory Slot Grid',
    category: 'Gaming & Scoreboards',
    target: '2D HUD',
    badge: 'GAMING HUD',
    description: '4x2 item inventory grid slots for storing potion, sword, shield, and keys.',
    tags: ['gaming', 'inventory', 'rpg', 'slots'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('INVENTORY GRID', '#10b981', `
        <div class="flex flex-col justify-between h-full text-emerald-400 font-mono text-xs">
          <div class="font-bold">INVENTORY (6/8)</div>
          <div class="grid grid-cols-4 gap-1.5 my-1">
            <div class="bg-black/60 border border-emerald-500/50 p-2 text-center rounded text-base">🧪</div>
            <div class="bg-black/60 border border-emerald-500/50 p-2 text-center rounded text-base">⚔️</div>
            <div class="bg-black/60 border border-emerald-500/50 p-2 text-center rounded text-base">🛡️</div>
            <div class="bg-black/60 border border-emerald-500/50 p-2 text-center rounded text-base">🗝️</div>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-game-quest-tracker',
    name: 'Active Quest & Objective Tracker',
    category: 'Gaming & Scoreboards',
    target: '2D HUD',
    badge: 'GAMING HUD',
    description: 'Side quest objective list card with completion checkboxes.',
    tags: ['gaming', 'quest', 'objective', 'tracker'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('QUEST TRACKER', '#38bdf8', `
        <div class="flex flex-col justify-between h-full text-xs">
          <div class="font-bold text-cyan-300 uppercase tracking-wider">MAIN QUEST: PORTAL MAZE</div>
          <div class="space-y-1 text-slate-200 text-[10px] my-1">
            <div>☑ Find the Crystal Key (1/1)</div>
            <div class="text-cyan-300">☐ Activate 3 Power Generators (2/3)</div>
            <div class="text-slate-500">☐ Defeat Guardian Boss</div>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-game-combo-counter',
    name: 'Dynamic Combo Multiplier Meter',
    category: 'Gaming & Scoreboards',
    target: '2D HUD',
    badge: 'GAMING HUD',
    description: 'High energy combo counter displaying 10x multiplier streak with flame glow.',
    tags: ['gaming', 'combo', 'multiplier', 'streak'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('COMBO STREAK', '#f97316', `
        <div class="flex items-center justify-between h-full font-mono">
          <div class="text-3xl font-black text-amber-400 shadow-[0_0_10px_#f97316]">12x</div>
          <div class="text-right">
            <div class="text-xs font-bold text-amber-300">COMBO STREAK!</div>
            <div class="text-[9px] text-slate-400">+2,400 Bonus Pts</div>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-game-boss-health',
    name: 'Epic Boss Encounter Health Header',
    category: 'Gaming & Scoreboards',
    target: '2D HUD',
    badge: 'GAMING HUD',
    description: 'Top screen boss fight health bar with skull icon and shield armor points.',
    tags: ['gaming', 'boss', 'health', 'fight'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('BOSS HEALTH', '#ef4444', `
        <div class="flex flex-col justify-between h-full font-mono">
          <div class="flex justify-between items-center text-xs font-bold text-red-400">
            <span>💀 CYBERNETIC OVERLORD</span>
            <span>85% HP</span>
          </div>
          <div class="w-full bg-red-950 border border-red-500 h-3 rounded overflow-hidden my-1">
            <div class="bg-red-600 h-full shadow-[0_0_10px_#ef4444]" style="width: 85%"></div>
          </div>
        </div>
      `)
    }
  },

  // --- 11. FORMS & CONTROLS (5) ---
  {
    id: 'uk-ctrl-search-bar',
    name: 'Glassmorphism Search & Filter Bar',
    category: 'Forms & Controls',
    target: '2D HUD',
    badge: 'CONTROLS',
    description: 'Glass search input with search icon, clear button, and filter tags.',
    tags: ['controls', 'search', 'input', 'form'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('SEARCH BAR', '#38bdf8', `
        <div class="flex items-center gap-2 h-full">
          <div class="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-white">
            <span>🔍 Search 3D objects...</span>
            <span class="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400">⌘K</span>
          </div>
        </div>
      `)
    }
  },
  {
    id: 'uk-ctrl-segmented-tabs',
    name: 'Pill Segmented Tab Control',
    category: 'Forms & Controls',
    target: '2D HUD',
    badge: 'CONTROLS',
    description: 'Segmented navigation tab row for switching views between 2D, 3D, and AR mode.',
    tags: ['controls', 'tabs', 'segmented', 'pill'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('SEGMENTED TABS', '#38bdf8', `
        <div class="flex items-center justify-between h-full bg-white/5 border border-white/10 rounded-xl p-1">
          <button class="flex-1 bg-cyan-500 text-slate-950 font-bold py-1 rounded-lg text-xs">2D View</button>
          <button class="flex-1 text-slate-300 font-bold py-1 rounded-lg text-xs">3D Canvas</button>
          <button class="flex-1 text-slate-300 font-bold py-1 rounded-lg text-xs">AR Live</button>
        </div>
      `)
    }
  },
  {
    id: 'uk-ctrl-toggle-switches',
    name: 'Tactile Toggle Switch Group',
    category: 'Forms & Controls',
    target: '2D HUD',
    badge: 'CONTROLS',
    description: 'Stack of ON/OFF toggle switches for shadows, bloom, physics, and wireframe.',
    tags: ['controls', 'toggle', 'switch', 'settings'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('TOGGLE SWITCHES', '#10b981', `
        <div class="flex flex-col justify-between h-full text-xs">
          <div class="flex justify-between items-center"><span class="text-white">HDR Shadows</span><span class="text-emerald-400 font-bold">ON 🟢</span></div>
          <div class="flex justify-between items-center"><span class="text-white">Bloom Glow</span><span class="text-emerald-400 font-bold">ON 🟢</span></div>
          <div class="flex justify-between items-center"><span class="text-white">Wireframe</span><span class="text-slate-500 font-bold">OFF ⚪</span></div>
        </div>
      `)
    }
  },
  {
    id: 'uk-ctrl-color-picker',
    name: 'RGB Color Spectrum Wheel & Hex Input',
    category: 'Forms & Controls',
    target: '2D HUD',
    badge: 'CONTROLS',
    description: 'Color swatch selector card with hex code input field.',
    tags: ['controls', 'color', 'picker', 'hex'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('COLOR PICKER', '#ec4899', `
        <div class="flex items-center justify-between h-full">
          <div class="flex gap-2">
            <div class="w-8 h-8 rounded-full bg-cyan-400 border-2 border-white shadow"></div>
            <div class="w-8 h-8 rounded-full bg-purple-500 border border-white/20"></div>
            <div class="w-8 h-8 rounded-full bg-pink-500 border border-white/20"></div>
          </div>
          <input class="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs text-white font-mono w-20 text-center" value="#38BDF8">
        </div>
      `)
    }
  },
  {
    id: 'uk-ctrl-rating-stars',
    name: 'Feedback Rating Stars & Comment Field',
    category: 'Forms & Controls',
    target: '2D HUD',
    badge: 'CONTROLS',
    description: '5-star rating control with submit button.',
    tags: ['controls', 'rating', 'feedback', 'stars'],
    objectType: 'hudEmbed',
    properties: {
      url: createEmbedHtml('RATING STARS', '#f59e0b', `
        <div class="flex items-center justify-between h-full">
          <div class="text-amber-400 text-lg">★★★★★</div>
          <button class="bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded text-xs">Submit Rating</button>
        </div>
      `)
    }
  }
];
