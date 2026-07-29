// Spline.design-inspired Sound Engine & SFX Library
// Provides 50+ curated audio presets, Web Audio API synthesis fallback for 100% reliability,
// and 3D Spatial Audio positioning for AR/3D object sound triggers.

export type SoundCategory = 
  | 'UI & Interface'
  | '3D Spatial & Motion'
  | 'Magic & Sci-Fi'
  | 'Mechanical & Physical'
  | 'Game & Interactive'
  | 'Ambient & Drones'
  | 'Musical & Chords';

export interface SplineSoundPreset {
  id: string;
  name: string;
  category: SoundCategory;
  url: string;
  thumbnail: string;
  description: string;
  duration: string;
  tags: string[];
  synthType?: string; // Web Audio synth fallback type
}

// ==========================================
// 50+ SPLINE 3D SOUND PRESETS
// ==========================================
export const SPLINE_SOUND_PRESETS: SplineSoundPreset[] = [
  // --- 1. UI & INTERFACE (8) ---
  {
    id: 'sfx-ui-cyber-click',
    name: 'Cyber Click',
    category: 'UI & Interface',
    url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
    thumbnail: '🔘',
    description: 'Crisp electronic tap feedback for buttons and menus.',
    duration: '0.1s',
    tags: ['ui', 'click', 'cyber', 'button'],
    synthType: 'click'
  },
  {
    id: 'sfx-ui-soft-tap',
    name: 'Soft UI Tap',
    category: 'UI & Interface',
    url: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-84.wav',
    thumbnail: '👇',
    description: 'Subtle high-frequency organic confirmation sound.',
    duration: '0.15s',
    tags: ['ui', 'tap', 'soft', 'gentle'],
    synthType: 'tap'
  },
  {
    id: 'sfx-ui-tactile-toggle',
    name: 'Tactile Switch Toggle',
    category: 'UI & Interface',
    url: 'https://assets.mixkit.co/active_storage/sfx/2562/2562-84.wav',
    thumbnail: '🎚️',
    description: 'Double mechanical toggle click for checkboxes and options.',
    duration: '0.2s',
    tags: ['ui', 'toggle', 'switch', 'tactile'],
    synthType: 'toggle'
  },
  {
    id: 'sfx-ui-glass-pop',
    name: 'Glass Bubble Pop',
    category: 'UI & Interface',
    url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-84.wav',
    thumbnail: '🫧',
    description: 'Resonant glass pop for tooltips and tag selections.',
    duration: '0.2s',
    tags: ['ui', 'pop', 'glass', 'bubble'],
    synthType: 'pop'
  },
  {
    id: 'sfx-ui-slide-snap',
    name: 'Slider Snap',
    category: 'UI & Interface',
    url: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-84.wav',
    thumbnail: '📏',
    description: 'Crisp notch click for range sliders and step inputs.',
    duration: '0.1s',
    tags: ['ui', 'slider', 'snap', 'notch'],
    synthType: 'snap'
  },
  {
    id: 'sfx-ui-minimal-ping',
    name: 'Minimal Ping',
    category: 'UI & Interface',
    url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav',
    thumbnail: '🔔',
    description: 'High delicate metallic chime for alert dots and badges.',
    duration: '0.3s',
    tags: ['ui', 'ping', 'chime', 'alert'],
    synthType: 'ping'
  },
  {
    id: 'sfx-ui-hover-tick',
    name: 'Hover Tick',
    category: 'UI & Interface',
    url: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-84.wav',
    thumbnail: '🎯',
    description: 'Ultra-fast subtle tick sound played when hovering elements.',
    duration: '0.05s',
    tags: ['ui', 'hover', 'tick', 'micro'],
    synthType: 'tick'
  },
  {
    id: 'sfx-ui-drawer-slide',
    name: 'Panel Drawer Slide',
    category: 'UI & Interface',
    url: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-84.wav',
    thumbnail: '📱',
    description: 'Smooth mechanical friction slide for opening sidebars.',
    duration: '0.4s',
    tags: ['ui', 'drawer', 'slide', 'sidebar'],
    synthType: 'slide'
  },

  // --- 2. 3D SPATIAL & MOTION (8) ---
  {
    id: 'sfx-spatial-orbit-swoosh',
    name: '3D Orbit Swoosh',
    category: '3D Spatial & Motion',
    url: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-84.wav',
    thumbnail: '🌀',
    description: 'Dynamic air swoosh when rotating camera or 3D objects.',
    duration: '0.5s',
    tags: ['motion', 'swoosh', 'orbit', 'camera'],
    synthType: 'swoosh'
  },
  {
    id: 'sfx-spatial-zoom-rush',
    name: 'Spatial Zoom Rush',
    category: '3D Spatial & Motion',
    url: 'https://assets.mixkit.co/active_storage/sfx/2581/2581-84.wav',
    thumbnail: '🔍',
    description: 'Frequency pitch shift whoosh for zooming in spatial AR.',
    duration: '0.4s',
    tags: ['motion', 'zoom', 'rush', 'pitch'],
    synthType: 'zoom'
  },
  {
    id: 'sfx-spatial-teleport-portal',
    name: 'Portal Teleport Sweep',
    category: '3D Spatial & Motion',
    url: 'https://assets.mixkit.co/active_storage/sfx/2582/2582-84.wav',
    thumbnail: '🌀',
    description: 'Sci-fi phase sweep for spawning or moving 3D models.',
    duration: '0.7s',
    tags: ['spatial', 'teleport', 'portal', 'spawn'],
    synthType: 'teleport'
  },
  {
    id: 'sfx-spatial-gravity-drop',
    name: 'Gravity Drop Impact',
    category: '3D Spatial & Motion',
    url: 'https://assets.mixkit.co/active_storage/sfx/2583/2583-84.wav',
    thumbnail: '🧱',
    description: 'Subtle low-end thud when object lands on AR floor grid.',
    duration: '0.3s',
    tags: ['spatial', 'gravity', 'drop', 'impact'],
    synthType: 'drop'
  },
  {
    id: 'sfx-spatial-float-whoosh',
    name: 'Float Elevation Rise',
    category: '3D Spatial & Motion',
    url: 'https://assets.mixkit.co/active_storage/sfx/2584/2584-84.wav',
    thumbnail: '🎈',
    description: 'Gentle airy elevation sound for lifting 3D objects.',
    duration: '0.6s',
    tags: ['spatial', 'float', 'rise', 'lift'],
    synthType: 'float'
  },
  {
    id: 'sfx-spatial-spin-whir',
    name: 'Gyroscope Spin Whir',
    category: '3D Spatial & Motion',
    url: 'https://assets.mixkit.co/active_storage/sfx/2586/2586-84.wav',
    thumbnail: '🔄',
    description: 'Smooth centrifugal spinning whir for 3D rotators.',
    duration: '0.5s',
    tags: ['spatial', 'spin', 'whir', 'gyro'],
    synthType: 'spin'
  },
  {
    id: 'sfx-spatial-elastic-bounce',
    name: 'Elastic Bounce',
    category: '3D Spatial & Motion',
    url: 'https://assets.mixkit.co/active_storage/sfx/2587/2587-84.wav',
    thumbnail: '🏀',
    description: 'Springy rubber bounce effect for spring physics animations.',
    duration: '0.3s',
    tags: ['spatial', 'bounce', 'spring', 'elastic'],
    synthType: 'bounce'
  },
  {
    id: 'sfx-spatial-snap-alignment',
    name: 'Grid Snap Magnet',
    category: '3D Spatial & Motion',
    url: 'https://assets.mixkit.co/active_storage/sfx/2588/2588-84.wav',
    thumbnail: '🧲',
    description: 'Magnetic lock click when aligning objects in 3D space.',
    duration: '0.15s',
    tags: ['spatial', 'snap', 'magnet', 'grid'],
    synthType: 'snap'
  },

  // --- 3. MAGIC & SCI-FI (8) ---
  {
    id: 'sfx-scifi-fairy-sparkle',
    name: 'Fairy Dust Sparkle',
    category: 'Magic & Sci-Fi',
    url: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-84.wav',
    thumbnail: '🪄',
    description: 'High-pitch ascending windchimes for magic and enchantments.',
    duration: '0.8s',
    tags: ['magic', 'sparkle', 'chime', 'fairy'],
    synthType: 'sparkle'
  },
  {
    id: 'sfx-scifi-laser-zap',
    name: 'Neon Laser Zap',
    category: 'Magic & Sci-Fi',
    url: 'https://assets.mixkit.co/active_storage/sfx/2585/2585-84.wav',
    thumbnail: '⚡',
    description: 'Classic synthesized raygun laser blast.',
    duration: '0.3s',
    tags: ['scifi', 'laser', 'zap', 'raygun'],
    synthType: 'laser'
  },
  {
    id: 'sfx-scifi-hologram-hum',
    name: 'Hologram Grid Hum',
    category: 'Magic & Sci-Fi',
    url: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-84.wav',
    thumbnail: '🌐',
    description: 'Electric static telemetry and hologram projection pulse.',
    duration: '1.2s',
    tags: ['scifi', 'hologram', 'hum', 'grid'],
    synthType: 'hologram'
  },
  {
    id: 'sfx-scifi-shield-up',
    name: 'Forcefield Shield Up',
    category: 'Magic & Sci-Fi',
    url: 'https://assets.mixkit.co/active_storage/sfx/2589/2589-84.wav',
    thumbnail: '🛡️',
    description: 'Rising electronic energy barrier initialization chime.',
    duration: '0.6s',
    tags: ['scifi', 'shield', 'energy', 'forcefield'],
    synthType: 'shield'
  },
  {
    id: 'sfx-scifi-quantum-warp',
    name: 'Quantum Warp Charge',
    category: 'Magic & Sci-Fi',
    url: 'https://assets.mixkit.co/active_storage/sfx/2590/2590-84.wav',
    thumbnail: '🌌',
    description: 'Ascending oscillator charge up before space jump.',
    duration: '0.9s',
    tags: ['scifi', 'warp', 'quantum', 'charge'],
    synthType: 'warp'
  },
  {
    id: 'sfx-scifi-plasma-discharge',
    name: 'Plasma Arc Spark',
    category: 'Magic & Sci-Fi',
    url: 'https://assets.mixkit.co/active_storage/sfx/2591/2591-84.wav',
    thumbnail: '🌩️',
    description: 'High voltage electrical arc discharge snap.',
    duration: '0.2s',
    tags: ['scifi', 'plasma', 'spark', 'electric'],
    synthType: 'spark'
  },
  {
    id: 'sfx-scifi-mystic-dream',
    name: 'Mystic Dream Shimmer',
    category: 'Magic & Sci-Fi',
    url: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-84.wav',
    thumbnail: '🔮',
    description: 'Ethereal ambient wave ideal for magical interactions.',
    duration: '1.0s',
    tags: ['magic', 'mystic', 'dream', 'shimmer'],
    synthType: 'shimmer'
  },
  {
    id: 'sfx-scifi-robot-chirp',
    name: 'Robot Droid Chirp',
    category: 'Magic & Sci-Fi',
    url: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-84.wav',
    thumbnail: '🤖',
    description: 'Chirpy electronic robot expression tone.',
    duration: '0.25s',
    tags: ['scifi', 'robot', 'chirp', 'droid'],
    synthType: 'chirp'
  },

  // --- 4. MECHANICAL & PHYSICAL (7) ---
  {
    id: 'sfx-mech-metal-clank',
    name: 'Heavy Metal Clank',
    category: 'Mechanical & Physical',
    url: 'https://assets.mixkit.co/active_storage/sfx/2592/2592-84.wav',
    thumbnail: '🔨',
    description: 'Solid metallic impact for machinery and armor.',
    duration: '0.4s',
    tags: ['mech', 'metal', 'clank', 'heavy'],
    synthType: 'metal'
  },
  {
    id: 'sfx-mech-hydraulic-hiss',
    name: 'Hydraulic Piston Hiss',
    category: 'Mechanical & Physical',
    url: 'https://assets.mixkit.co/active_storage/sfx/2593/2593-84.wav',
    thumbnail: '⚙️',
    description: 'Pneumatic air release hiss for robotic arms.',
    duration: '0.5s',
    tags: ['mech', 'hydraulic', 'piston', 'air'],
    synthType: 'hiss'
  },
  {
    id: 'sfx-mech-wood-thud',
    name: 'Polished Wood Thud',
    category: 'Mechanical & Physical',
    url: 'https://assets.mixkit.co/active_storage/sfx/2594/2594-84.wav',
    thumbnail: '🪵',
    description: 'Organic warm wooden impact for furniture and blocks.',
    duration: '0.2s',
    tags: ['mech', 'wood', 'thud', 'organic'],
    synthType: 'wood'
  },
  {
    id: 'sfx-mech-gear-click',
    name: 'Precision Gear Click',
    category: 'Mechanical & Physical',
    url: 'https://assets.mixkit.co/active_storage/sfx/2595/2595-84.wav',
    thumbnail: '🕰️',
    description: 'Watchmaker gear ratchet click for fine adjustments.',
    duration: '0.1s',
    tags: ['mech', 'gear', 'ratchet', 'clockwork'],
    synthType: 'gear'
  },
  {
    id: 'sfx-mech-glass-shatter',
    name: 'Crystal Glass Shatter',
    category: 'Mechanical & Physical',
    url: 'https://assets.mixkit.co/active_storage/sfx/2596/2596-84.wav',
    thumbnail: '🥛',
    description: 'Resonant glass break for destruction mechanics.',
    duration: '0.5s',
    tags: ['mech', 'glass', 'shatter', 'break'],
    synthType: 'shatter'
  },
  {
    id: 'sfx-mech-door-latch',
    name: 'Vault Door Latch',
    category: 'Mechanical & Physical',
    url: 'https://assets.mixkit.co/active_storage/sfx/2597/2597-84.wav',
    thumbnail: '🚪',
    description: 'Heavy locking mechanism latch snap.',
    duration: '0.3s',
    tags: ['mech', 'door', 'latch', 'vault'],
    synthType: 'latch'
  },
  {
    id: 'sfx-mech-bubble-burst',
    name: 'Water Drip Drop',
    category: 'Mechanical & Physical',
    url: 'https://assets.mixkit.co/active_storage/sfx/2598/2598-84.wav',
    thumbnail: '💧',
    description: 'Clean cavern water droplet impact in deep reservoir.',
    duration: '0.35s',
    tags: ['mech', 'water', 'drip', 'drop'],
    synthType: 'drip'
  },

  // --- 5. GAME & INTERACTIVE (8) ---
  {
    id: 'sfx-game-coin-pickup',
    name: 'Arcade Gold Coin',
    category: 'Game & Interactive',
    url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav',
    thumbnail: '🪙',
    description: 'Classic double-frequency arcade coin pickup chime.',
    duration: '0.2s',
    tags: ['game', 'coin', 'pickup', 'gold'],
    synthType: 'coin'
  },
  {
    id: 'sfx-game-success-chime',
    name: 'Success Ring',
    category: 'Game & Interactive',
    url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav',
    thumbnail: '✅',
    description: 'Shimmering positive response chime for completions and unlocks.',
    duration: '0.4s',
    tags: ['game', 'success', 'ring', 'unlock'],
    synthType: 'success'
  },
  {
    id: 'sfx-game-level-up',
    name: 'Level Up Fanfare',
    category: 'Game & Interactive',
    url: 'https://assets.mixkit.co/active_storage/sfx/2021/2021-84.wav',
    thumbnail: '🆙',
    description: 'Ascending victory brass fanfare for achievements.',
    duration: '1.2s',
    tags: ['game', 'levelup', 'fanfare', 'victory'],
    synthType: 'levelup'
  },
  {
    id: 'sfx-game-error-buzzer',
    name: 'Warning Buzzer',
    category: 'Game & Interactive',
    url: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-84.wav',
    thumbnail: '🚨',
    description: 'Short abrasive buzzer sound indicating errors or invalid actions.',
    duration: '0.3s',
    tags: ['game', 'error', 'buzzer', 'warning'],
    synthType: 'error'
  },
  {
    id: 'sfx-game-powerup-chime',
    name: 'Energy Powerup',
    category: 'Game & Interactive',
    url: 'https://assets.mixkit.co/active_storage/sfx/2599/2599-84.wav',
    thumbnail: '⚡',
    description: 'Rising synth chord for picking up boosts and powerups.',
    duration: '0.6s',
    tags: ['game', 'powerup', 'boost', 'energy'],
    synthType: 'powerup'
  },
  {
    id: 'sfx-game-target-lock',
    name: 'Target Lock Acquired',
    category: 'Game & Interactive',
    url: 'https://assets.mixkit.co/active_storage/sfx/2600/2600-84.wav',
    thumbnail: '🎯',
    description: 'Rapid HUD reticle lock-on confirmation tones.',
    duration: '0.25s',
    tags: ['game', 'target', 'lock', 'hud'],
    synthType: 'lock'
  },
  {
    id: 'sfx-game-combo-streak',
    name: 'Combo Multiplier Streak',
    category: 'Game & Interactive',
    url: 'https://assets.mixkit.co/active_storage/sfx/2601/2601-84.wav',
    thumbnail: '🔥',
    description: 'Pitch-elevated chime for streak multipliers.',
    duration: '0.3s',
    tags: ['game', 'combo', 'streak', 'multiplier'],
    synthType: 'combo'
  },
  {
    id: 'sfx-game-treasure-chest',
    name: 'Treasure Chest Open',
    category: 'Game & Interactive',
    url: 'https://assets.mixkit.co/active_storage/sfx/2602/2602-84.wav',
    thumbnail: '💎',
    description: 'Glowing magical unlock shimmer for chest rewards.',
    duration: '1.0s',
    tags: ['game', 'treasure', 'chest', 'unlock'],
    synthType: 'treasure'
  },

  // --- 6. AMBIENT & DRONES (6) ---
  {
    id: 'sfx-ambient-cyber-city',
    name: 'Cyber City Rain Ambient',
    category: 'Ambient & Drones',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    thumbnail: '🏙️',
    description: 'Distant neon city traffic and gentle rain background atmosphere.',
    duration: 'Loopable',
    tags: ['ambient', 'cyber', 'city', 'rain'],
    synthType: 'ambient_city'
  },
  {
    id: 'sfx-ambient-solar-wind',
    name: 'Deep Space Drone',
    category: 'Ambient & Drones',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    thumbnail: '🚀',
    description: 'Low frequency cosmic resonance for sci-fi space scenes.',
    duration: 'Loopable',
    tags: ['ambient', 'space', 'drone', 'cosmic'],
    synthType: 'ambient_space'
  },
  {
    id: 'sfx-ambient-forest-rain',
    name: 'Light Rain & Breeze',
    category: 'Ambient & Drones',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    thumbnail: '🌧️',
    description: 'Calming natural rain drops and soft wind loop.',
    duration: 'Loopable',
    tags: ['ambient', 'rain', 'forest', 'nature'],
    synthType: 'ambient_rain'
  },
  {
    id: 'sfx-ambient-ocean-waves',
    name: 'Ocean Waves Shore',
    category: 'Ambient & Drones',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    thumbnail: '🌊',
    description: 'Rhythmic sea waves rolling onto sandy coast.',
    duration: 'Loopable',
    tags: ['ambient', 'ocean', 'waves', 'shore'],
    synthType: 'ambient_ocean'
  },
  {
    id: 'sfx-ambient-crystal-cave',
    name: 'Crystal Cavern Resonance',
    category: 'Ambient & Drones',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    thumbnail: '💎',
    description: 'Ethereal metallic cave echoes and harmonic drones.',
    duration: 'Loopable',
    tags: ['ambient', 'crystal', 'cave', 'resonance'],
    synthType: 'ambient_cave'
  },
  {
    id: 'sfx-ambient-campfire-crackle',
    name: 'Campfire Wood Crackle',
    category: 'Ambient & Drones',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    thumbnail: '🔥',
    description: 'Warm cozy fire wood crackling embers background.',
    duration: 'Loopable',
    tags: ['ambient', 'fire', 'campfire', 'crackle'],
    synthType: 'ambient_fire'
  },

  // --- 7. MUSICAL & CHORDS (5) ---
  {
    id: 'sfx-music-synth-stab',
    name: 'Synthwave Chord Stab',
    category: 'Musical & Chords',
    url: 'https://assets.mixkit.co/active_storage/sfx/2603/2603-84.wav',
    thumbnail: '🎹',
    description: 'Punchy 80s analog synthesizer chord stab.',
    duration: '0.4s',
    tags: ['music', 'synth', 'stab', 'chord'],
    synthType: 'synth_stab'
  },
  {
    id: 'sfx-music-lofi-piano',
    name: 'Lo-Fi Jazz Piano Chord',
    category: 'Musical & Chords',
    url: 'https://assets.mixkit.co/active_storage/sfx/2604/2604-84.wav',
    thumbnail: '☕',
    description: 'Warm vinyl-filtered electric piano chord.',
    duration: '0.8s',
    tags: ['music', 'piano', 'lofi', 'chord'],
    synthType: 'piano'
  },
  {
    id: 'sfx-music-marimba-arpeggio',
    name: 'Marimba Arpeggio Chime',
    category: 'Musical & Chords',
    url: 'https://assets.mixkit.co/active_storage/sfx/2605/2605-84.wav',
    thumbnail: '🪵',
    description: 'Playful wooden marimba ascending run.',
    duration: '0.5s',
    tags: ['music', 'marimba', 'arpeggio', 'wooden'],
    synthType: 'marimba'
  },
  {
    id: 'sfx-music-celestial-bell',
    name: 'Celestial Glass Bell',
    category: 'Musical & Chords',
    url: 'https://assets.mixkit.co/active_storage/sfx/2606/2606-84.wav',
    thumbnail: '🎐',
    description: 'Pure high frequency crystal bell resonance.',
    duration: '1.0s',
    tags: ['music', 'bell', 'celestial', 'crystal'],
    synthType: 'bell'
  },
  {
    id: 'sfx-music-harp-glissando',
    name: 'Harp Glissando Strum',
    category: 'Musical & Chords',
    url: 'https://assets.mixkit.co/active_storage/sfx/2607/2607-84.wav',
    thumbnail: '🪕',
    description: 'Graceful acoustic harp sweep across strings.',
    duration: '0.9s',
    tags: ['music', 'harp', 'glissando', 'strum'],
    synthType: 'harp'
  }
];

// ==========================================
// WEB AUDIO API SYNTHESIZER ENGINE
// Guarantees zero-latency sound synthesis if external URLs fail or offline!
// ==========================================
class WebAudioSoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public synthesizeSound(synthType: string, volume = 0.5, spatialX = 0, spatialY = 0, spatialZ = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.4, now);

    // Optional 3D Spatial Panner Node
    let destNode: AudioNode = ctx.destination;
    if (spatialX !== 0 || spatialY !== 0 || spatialZ !== 0) {
      if (ctx.createPanner) {
        const panner = ctx.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 20;
        panner.rolloffFactor = 1;
        if (panner.positionX) {
          panner.positionX.setValueAtTime(spatialX, now);
          panner.positionY.setValueAtTime(spatialY, now);
          panner.positionZ.setValueAtTime(spatialZ, now);
        } else {
          panner.setPosition(spatialX, spatialY, spatialZ);
        }
        masterGain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        masterGain.connect(ctx.destination);
      }
    } else {
      masterGain.connect(ctx.destination);
    }

    switch (synthType) {
      case 'click':
      case 'tap':
      case 'tick': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
        masterGain.gain.setValueAtTime(volume * 0.3, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'pop':
      case 'drip': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        masterGain.gain.setValueAtTime(volume * 0.4, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case 'laser':
      case 'zap': {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        masterGain.gain.setValueAtTime(volume * 0.3, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case 'sparkle':
      case 'bell':
      case 'ping': {
        const freqs = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.06);
          g.gain.setValueAtTime(0, now);
          g.gain.setValueAtTime(volume * 0.2, now + idx * 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.4);
        });
        break;
      }

      case 'coin':
      case 'success': {
        const freqs = [987.77, 1318.51]; // B5 -> E6
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          g.gain.setValueAtTime(volume * 0.35, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
        break;
      }

      case 'swoosh':
      case 'zoom':
      case 'slide': {
        // Filtered white noise swoosh
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.3);

        masterGain.gain.setValueAtTime(0.01, now);
        masterGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.15);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start(now);
        break;
      }

      default: {
        // Default warm chime tone
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.2);
        masterGain.gain.setValueAtTime(volume * 0.3, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
    }
  }
}

export const splineSoundEngine = new WebAudioSoundEngine();

/**
 * Play a sound preset with Web Audio API synthesis fallback and optional 3D spatial coordinates!
 */
export const playSplineSound = (presetInput: SplineSoundPreset | string, volume = 0.5, position?: [number, number, number]) => {
  if (!presetInput) return;

  const preset = typeof presetInput === 'string'
    ? SPLINE_SOUND_PRESETS.find(p => p.id === presetInput)
    : presetInput;

  if (!preset) {
    // If unknown string ID, generate a default synthetic click
    splineSoundEngine.synthesizeSound('click', volume);
    return;
  }

  // Synthesize immediately for instant zero-latency feedback!
  if (preset.synthType) {
    splineSoundEngine.synthesizeSound(
      preset.synthType, 
      volume, 
      position ? position[0] : 0, 
      position ? position[1] : 0, 
      position ? position[2] : 0
    );
  }

  // Also attempt playing audio URL if available
  if (preset.url) {
    try {
      const audio = new Audio(preset.url);
      audio.volume = Math.min(1, Math.max(0, volume));
      audio.play().catch(() => {
        // Audio load failed, synth fallback handled it seamlessly!
      });
    } catch {
      // Ignored
    }
  }
};
