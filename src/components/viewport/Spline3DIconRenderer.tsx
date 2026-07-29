import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneObject } from '../../types';
import { useEditorStore } from '../../store/useEditorStore';

export interface SplineIconMetadata {
  id: string;
  name: string;
  category: 'Tech & Gadgets' | 'Finance & Crypto' | 'Social & Messaging' | 'Creative & Design' | 'Gaming & VFX' | 'System & UI' | 'Nature & Weather' | 'E-Commerce';
  previewEmoji: string;
  defaultColor: string;
  secondaryColor: string;
  description: string;
  materialStyle: 'clay' | 'glossy' | 'metallic' | 'glass' | 'neon';
  tags: string[];
}

export const SPLINE_3D_ICONS: SplineIconMetadata[] = [
  // --- TECH & GADGETS ---
  {
    id: 'rocket',
    name: '3D Rocket',
    category: 'Tech & Gadgets',
    previewEmoji: '🚀',
    defaultColor: '#ef4444',
    secondaryColor: '#ffffff',
    description: 'Claymorphic space rocket with booster fins and thruster',
    materialStyle: 'glossy',
    tags: ['tech', 'space', 'launch', 'startup']
  },
  {
    id: 'smartphone',
    name: '3D Smartphone',
    category: 'Tech & Gadgets',
    previewEmoji: '📱',
    defaultColor: '#3b82f6',
    secondaryColor: '#1e293b',
    description: 'Sleek smartphone with rounded bezel and glass screen',
    materialStyle: 'glossy',
    tags: ['tech', 'phone', 'mobile', 'device']
  },
  {
    id: 'battery',
    name: '3D Power Battery',
    category: 'Tech & Gadgets',
    previewEmoji: '🔋',
    defaultColor: '#22c55e',
    secondaryColor: '#e2e8f0',
    description: 'Energy battery cell with glowing green power bars',
    materialStyle: 'glossy',
    tags: ['tech', 'power', 'energy', 'charge']
  },
  {
    id: 'headphones',
    name: '3D Studio Headphones',
    category: 'Tech & Gadgets',
    previewEmoji: '🎧',
    defaultColor: '#8b5cf6',
    secondaryColor: '#1e1b4b',
    description: 'Over-ear audio headphones with padded earcups',
    materialStyle: 'glossy',
    tags: ['tech', 'audio', 'music', 'sound']
  },
  {
    id: 'camera',
    name: '3D Retro Camera',
    category: 'Tech & Gadgets',
    previewEmoji: '📷',
    defaultColor: '#f97316',
    secondaryColor: '#334155',
    description: 'Designer camera with multi-ring lens and flash unit',
    materialStyle: 'glossy',
    tags: ['tech', 'photo', 'camera', 'media']
  },

  // --- FINANCE & CRYPTO ---
  {
    id: 'coin',
    name: '3D Gold Coin',
    category: 'Finance & Crypto',
    previewEmoji: '🪙',
    defaultColor: '#eab308',
    secondaryColor: '#fef08a',
    description: 'Heavy metallic gold coin with raised rim and currency emblem',
    materialStyle: 'metallic',
    tags: ['finance', 'crypto', 'money', 'gold']
  },
  {
    id: 'wallet',
    name: '3D Leather Wallet',
    category: 'Finance & Crypto',
    previewEmoji: '👛',
    defaultColor: '#b45309',
    secondaryColor: '#22c55e',
    description: 'Folded clay wallet with protruding banknote cash',
    materialStyle: 'clay',
    tags: ['finance', 'payment', 'card', 'cash']
  },
  {
    id: 'gem',
    name: '3D Diamond Gem',
    category: 'Finance & Crypto',
    previewEmoji: '💎',
    defaultColor: '#06b6d4',
    secondaryColor: '#67e8f9',
    description: 'Facet-cut crystal gemstone with sparkling reflections',
    materialStyle: 'glass',
    tags: ['finance', 'gem', 'diamond', 'premium']
  },
  {
    id: 'vault',
    name: '3D Safe Vault',
    category: 'Finance & Crypto',
    previewEmoji: '🔒',
    defaultColor: '#64748b',
    secondaryColor: '#e2e8f0',
    description: 'Heavy steel bank vault door with rotating combination lock handle',
    materialStyle: 'metallic',
    tags: ['finance', 'security', 'safe', 'bank']
  },

  // --- SOCIAL & MESSAGING ---
  {
    id: 'heart',
    name: '3D Glossy Heart',
    category: 'Social & Messaging',
    previewEmoji: '❤️',
    defaultColor: '#ec4899',
    secondaryColor: '#f472b6',
    description: 'Smooth volumetric love heart icon',
    materialStyle: 'glossy',
    tags: ['social', 'love', 'like', 'favorite']
  },
  {
    id: 'chat_bubble',
    name: '3D Chat Bubble',
    category: 'Social & Messaging',
    previewEmoji: '💬',
    defaultColor: '#3b82f6',
    secondaryColor: '#ffffff',
    description: 'Puffy speech bubble with tail and message indicator dots',
    materialStyle: 'clay',
    tags: ['social', 'chat', 'message', 'comm']
  },
  {
    id: 'bell',
    name: '3D Alert Bell',
    category: 'Social & Messaging',
    previewEmoji: '🔔',
    defaultColor: '#f59e0b',
    secondaryColor: '#fef3c7',
    description: 'Polished golden notification bell with clapper',
    materialStyle: 'metallic',
    tags: ['social', 'notification', 'alert', 'bell']
  },
  {
    id: 'thumbs_up',
    name: '3D Thumbs Up',
    category: 'Social & Messaging',
    previewEmoji: '👍',
    defaultColor: '#10b981',
    secondaryColor: '#ffffff',
    description: 'Friendly 3D hand giving a big thumbs up recommendation',
    materialStyle: 'clay',
    tags: ['social', 'like', 'approve', 'hand']
  },
  {
    id: 'mail',
    name: '3D Mail Envelope',
    category: 'Social & Messaging',
    previewEmoji: '✉️',
    defaultColor: '#ef4444',
    secondaryColor: '#ffffff',
    description: 'Paper envelope with V-shaped seal flap and stamp',
    materialStyle: 'glossy',
    tags: ['social', 'email', 'mail', 'inbox']
  },

  // --- CREATIVE & DESIGN ---
  {
    id: 'palette',
    name: '3D Color Palette',
    category: 'Creative & Design',
    previewEmoji: '🎨',
    defaultColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    description: 'Artist wooden palette with colorful paint droplets',
    materialStyle: 'clay',
    tags: ['creative', 'art', 'color', 'design']
  },
  {
    id: 'bulb',
    name: '3D Idea Lightbulb',
    category: 'Creative & Design',
    previewEmoji: '💡',
    defaultColor: '#eab308',
    secondaryColor: '#64748b',
    description: 'Glowing yellow lightbulb with metallic screw base',
    materialStyle: 'neon',
    tags: ['creative', 'idea', 'light', 'think']
  },
  {
    id: 'magic_wand',
    name: '3D Magic Wand',
    category: 'Creative & Design',
    previewEmoji: '🪄',
    defaultColor: '#a855f7',
    secondaryColor: '#fde047',
    description: 'Wizard star wand emitting glowing sparkle particles',
    materialStyle: 'neon',
    tags: ['creative', 'magic', 'ai', 'generate']
  },
  {
    id: 'compass',
    name: '3D Drafting Compass',
    category: 'Creative & Design',
    previewEmoji: '🧭',
    defaultColor: '#0ea5e9',
    secondaryColor: '#ef4444',
    description: 'Precision navigation compass with dual needle pointers',
    materialStyle: 'metallic',
    tags: ['creative', 'design', 'navigate', 'tools']
  },

  // --- GAMING & VFX ---
  {
    id: 'trophy',
    name: '3D Champion Trophy',
    category: 'Gaming & VFX',
    previewEmoji: '🏆',
    defaultColor: '#eab308',
    secondaryColor: '#1e293b',
    description: 'Golden winner cup with dual handles on pedestal',
    materialStyle: 'metallic',
    tags: ['gaming', 'award', 'winner', 'cup']
  },
  {
    id: 'controller',
    name: '3D Gamepad Controller',
    category: 'Gaming & VFX',
    previewEmoji: '🎮',
    defaultColor: '#6366f1',
    secondaryColor: '#ec4899',
    description: 'Modern console controller with d-pad and joysticks',
    materialStyle: 'glossy',
    tags: ['gaming', 'game', 'play', 'controller']
  },
  {
    id: 'star',
    name: '3D Golden Star',
    category: 'Gaming & VFX',
    previewEmoji: '⭐',
    defaultColor: '#f59e0b',
    secondaryColor: '#fef08a',
    description: 'Beveled 5-point star with radiant golden sheen',
    materialStyle: 'glossy',
    tags: ['gaming', 'star', 'rating', 'favorite']
  },
  {
    id: 'spline_cubes',
    name: '3D Spline Cubes',
    category: 'Gaming & VFX',
    previewEmoji: '🧊',
    defaultColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    description: 'Classic Spline-style stacked glass isometric cubes',
    materialStyle: 'glass',
    tags: ['gaming', 'spline', '3d', 'cube']
  },
  {
    id: 'donut',
    name: '3D Sprinkled Donut',
    category: 'Gaming & VFX',
    previewEmoji: '🍩',
    defaultColor: '#ec4899',
    secondaryColor: '#fef08a',
    description: 'Claymorphic torus donut with pink icing and sprinkles',
    materialStyle: 'clay',
    tags: ['gaming', 'art', 'food', 'donut']
  },
  {
    id: 'potion',
    name: '3D Magic Potion',
    category: 'Gaming & VFX',
    previewEmoji: '🧪',
    defaultColor: '#a855f7',
    secondaryColor: '#fbbf24',
    description: 'Glass alchemist flask with glowing purple liquid and cork',
    materialStyle: 'glass',
    tags: ['gaming', 'magic', 'potion', 'flask']
  },

  // --- SYSTEM & UI ---
  {
    id: 'shield',
    name: '3D Security Shield',
    category: 'System & UI',
    previewEmoji: '🛡️',
    defaultColor: '#0ea5e9',
    secondaryColor: '#22c55e',
    description: 'Volumetric emblem shield for security and verification',
    materialStyle: 'glossy',
    tags: ['system', 'security', 'shield', 'protect']
  },
  {
    id: 'lock',
    name: '3D Security Padlock',
    category: 'System & UI',
    previewEmoji: '🔒',
    defaultColor: '#f59e0b',
    secondaryColor: '#94a3b8',
    description: 'Glossy brass padlock with metallic silver shackle',
    materialStyle: 'metallic',
    tags: ['system', 'lock', 'secure', 'privacy']
  },
  {
    id: 'key',
    name: '3D Access Key',
    category: 'System & UI',
    previewEmoji: '🔑',
    defaultColor: '#eab308',
    secondaryColor: '#fef08a',
    description: 'Metallic skeleton key with circular bow and teeth',
    materialStyle: 'metallic',
    tags: ['system', 'key', 'access', 'unlock']
  },
  {
    id: 'folder',
    name: '3D Data Folder',
    category: 'System & UI',
    previewEmoji: '📁',
    defaultColor: '#3b82f6',
    secondaryColor: '#ffffff',
    description: 'Clay directory folder with protruding document sheets',
    materialStyle: 'clay',
    tags: ['system', 'folder', 'files', 'data']
  },
  {
    id: 'search',
    name: '3D Magnifying Glass',
    category: 'System & UI',
    previewEmoji: '🔍',
    defaultColor: '#64748b',
    secondaryColor: '#38bdf8',
    description: 'Glass search lens with metallic rim and sturdy handle',
    materialStyle: 'glass',
    tags: ['system', 'search', 'find', 'zoom']
  },
  {
    id: 'pin',
    name: '3D Map Pin',
    category: 'System & UI',
    previewEmoji: '📍',
    defaultColor: '#ef4444',
    secondaryColor: '#ffffff',
    description: 'Tear-drop location marker pin with central hole',
    materialStyle: 'glossy',
    tags: ['system', 'location', 'map', 'pin']
  },

  // --- NATURE & WEATHER ---
  {
    id: 'cloud',
    name: '3D Soft Cloud',
    category: 'Nature & Weather',
    previewEmoji: '☁️',
    defaultColor: '#38bdf8',
    secondaryColor: '#ffffff',
    description: 'Fluffy claymorphic weather cloud',
    materialStyle: 'clay',
    tags: ['nature', 'weather', 'cloud', 'sky']
  },
  {
    id: 'lightning',
    name: '3D Lightning Bolt',
    category: 'Nature & Weather',
    previewEmoji: '⚡',
    defaultColor: '#eab308',
    secondaryColor: '#fde047',
    description: 'High-energy angled lightning bolt with luminous glow',
    materialStyle: 'neon',
    tags: ['nature', 'weather', 'power', 'speed']
  },
  {
    id: 'flame',
    name: '3D Fire Flame',
    category: 'Nature & Weather',
    previewEmoji: '🔥',
    defaultColor: '#f97316',
    secondaryColor: '#fde047',
    description: 'Dynamic fire flame with inner hot core',
    materialStyle: 'neon',
    tags: ['nature', 'fire', 'flame', 'hot']
  },
  {
    id: 'planet',
    name: '3D Ringed Planet',
    category: 'Nature & Weather',
    previewEmoji: '🪐',
    defaultColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    description: 'Cosmic planet sphere wrapped in a tilted glossy ring',
    materialStyle: 'glossy',
    tags: ['nature', 'planet', 'space', 'cosmic']
  },
  {
    id: 'atom',
    name: '3D Quantum Atom',
    category: 'Nature & Weather',
    previewEmoji: '⚛️',
    defaultColor: '#06b6d4',
    secondaryColor: '#a855f7',
    description: 'Proton sphere wrapped in 3 orbiting electron rings',
    materialStyle: 'neon',
    tags: ['nature', 'science', 'atom', 'quantum']
  },

  // --- E-COMMERCE ---
  {
    id: 'gift',
    name: '3D Present Gift',
    category: 'E-Commerce',
    previewEmoji: '🎁',
    defaultColor: '#ef4444',
    secondaryColor: '#eab308',
    description: 'Surprise gift box wrapped in cross ribbon with top bow',
    materialStyle: 'glossy',
    tags: ['ecommerce', 'gift', 'present', 'box']
  },
  {
    id: 'target',
    name: '3D Bullseye Target',
    category: 'E-Commerce',
    previewEmoji: '🎯',
    defaultColor: '#ef4444',
    secondaryColor: '#ffffff',
    description: 'Concentric target disk with central red bullseye',
    materialStyle: 'glossy',
    tags: ['ecommerce', 'target', 'goal', 'focus']
  },
  {
    id: 'calendar',
    name: '3D Event Calendar',
    category: 'E-Commerce',
    previewEmoji: '📅',
    defaultColor: '#3b82f6',
    secondaryColor: '#ffffff',
    description: 'Date calendar sheet with binder rings and header badge',
    materialStyle: 'clay',
    tags: ['ecommerce', 'calendar', 'date', 'schedule']
  },
  {
    id: 'hourglass',
    name: '3D Hourglass',
    category: 'E-Commerce',
    previewEmoji: '⏳',
    defaultColor: '#f59e0b',
    secondaryColor: '#fef08a',
    description: 'Glass sand timer with wooden end caps and flowing sand',
    materialStyle: 'glass',
    tags: ['ecommerce', 'time', 'hourglass', 'clock']
  },
  {
    id: 'crown',
    name: '3D Royal Crown',
    category: 'E-Commerce',
    previewEmoji: '👑',
    defaultColor: '#eab308',
    secondaryColor: '#ef4444',
    description: 'Golden royal crown with 5 spikes and embedded ruby spheres',
    materialStyle: 'metallic',
    tags: ['ecommerce', 'vip', 'king', 'crown']
  }
];

// Material selector helper
function IconMaterial({ color, secondaryColor, style }: { color: string; secondaryColor: string; style: string }) {
  const storeWireframe = useEditorStore(state => state.wireframeEnabled) || false;

  if (style === 'glass') {
    return (
      <meshPhysicalMaterial
        color={color}
        transmission={0.85}
        opacity={0.9}
        transparent
        roughness={0.1}
        ior={1.5}
        thickness={0.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        wireframe={storeWireframe}
      />
    );
  }

  if (style === 'metallic') {
    return (
      <meshStandardMaterial
        color={color}
        metalness={0.85}
        roughness={0.25}
        wireframe={storeWireframe}
      />
    );
  }

  if (style === 'neon') {
    return (
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.1}
        wireframe={storeWireframe}
      />
    );
  }

  if (style === 'glossy') {
    return (
      <meshPhysicalMaterial
        color={color}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        roughness={0.2}
        metalness={0.1}
        wireframe={storeWireframe}
      />
    );
  }

  // Fallback 'clay' matte style
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.5}
      metalness={0.05}
      wireframe={storeWireframe}
    />
  );
}

// Accent Material selector helper
function AccentMaterial({ color, style }: { color: string; style: string }) {
  const storeWireframe = useEditorStore(state => state.wireframeEnabled) || false;

  if (style === 'glass') {
    return (
      <meshPhysicalMaterial
        color={color}
        transmission={0.6}
        transparent
        opacity={0.8}
        roughness={0.2}
        wireframe={storeWireframe}
      />
    );
  }

  if (style === 'metallic') {
    return (
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.2}
        wireframe={storeWireframe}
      />
    );
  }

  if (style === 'neon') {
    return (
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        roughness={0.1}
        wireframe={storeWireframe}
      />
    );
  }

  return (
    <meshStandardMaterial
      color={color}
      roughness={0.3}
      metalness={0.2}
      wireframe={storeWireframe}
    />
  );
}

// 3D Procedural Mesh Builders for each icon type
function ProceduralIconShape({ iconType, color, secondaryColor, style }: { iconType: string; color: string; secondaryColor: string; style: string }) {
  switch (iconType) {
    case 'rocket':
      return (
        <group>
          {/* Rocket Body */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.35, 1.0, 32]} />
            <IconMaterial color={secondaryColor} secondaryColor={color} style={style} />
          </mesh>
          {/* Nose Cone */}
          <mesh position={[0, 0.65, 0]}>
            <coneGeometry args={[0.25, 0.45, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* 3 Fins */}
          {[0, 120, 240].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <group key={i} rotation={[0, rad, 0]}>
                <mesh position={[0.3, -0.3, 0]} rotation={[0, 0, -0.4]}>
                  <boxGeometry args={[0.2, 0.4, 0.05]} />
                  <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
                </mesh>
              </group>
            );
          })}
          {/* Porthole Window */}
          <mesh position={[0, 0.2, 0.22]}>
            <torusGeometry args={[0.12, 0.03, 16, 32]} />
            <AccentMaterial color="#38bdf8" style={style} />
          </mesh>
          {/* Thruster Flame */}
          <mesh position={[0, -0.65, 0]}>
            <coneGeometry args={[0.18, 0.35, 16]} />
            <AccentMaterial color="#f97316" style="neon" />
          </mesh>
        </group>
      );

    case 'heart':
      return (
        <group scale={[0.8, 0.8, 0.8]}>
          {/* Left Lobed Sphere */}
          <mesh position={[-0.25, 0.2, 0]}>
            <sphereGeometry args={[0.35, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Right Lobed Sphere */}
          <mesh position={[0.25, 0.2, 0]}>
            <sphereGeometry args={[0.35, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Bottom Cone */}
          <mesh position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.55, 0.7, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
        </group>
      );

    case 'star':
      return (
        <group>
          {/* Center core */}
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.2, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* 5 Points */}
          {[0, 72, 144, 216, 288].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <group key={i} rotation={[0, 0, rad]}>
                <mesh position={[0, 0.42, 0]}>
                  <coneGeometry args={[0.22, 0.5, 4]} />
                  <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
                </mesh>
              </group>
            );
          })}
        </group>
      );

    case 'coin':
      return (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.5, 0.5, 0.12, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <torusGeometry args={[0.42, 0.04, 16, 32]} />
            <AccentMaterial color={secondaryColor} style="metallic" />
          </mesh>
          <mesh position={[0, -0.07, 0]}>
            <torusGeometry args={[0.42, 0.04, 16, 32]} />
            <AccentMaterial color={secondaryColor} style="metallic" />
          </mesh>
        </group>
      );

    case 'cloud':
      return (
        <group scale={[0.85, 0.85, 0.85]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh position={[-0.35, -0.05, 0]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh position={[0.35, -0.05, 0]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh position={[0.15, 0.2, 0]}>
            <sphereGeometry args={[0.32, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[1.0, 0.25, 0.4]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
        </group>
      );

    case 'lightning':
      return (
        <group>
          <mesh position={[0.1, 0.25, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.2, 0.5, 0.12]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh position={[-0.1, -0.25, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.18, 0.5, 0.12]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
        </group>
      );

    case 'chat_bubble':
      return (
        <group>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.9, 0.65, 0.25]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh position={[-0.25, -0.3, 0]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.18, 0.35, 3]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {[-0.22, 0, 0.22].map((x, i) => (
            <mesh key={i} position={[x, 0.1, 0.14]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <AccentMaterial color={secondaryColor} style="clay" />
            </mesh>
          ))}
        </group>
      );

    case 'gift':
      return (
        <group>
          {/* Main box */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Cross Ribbons */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.74, 0.74, 0.14]} />
            <AccentMaterial color={secondaryColor} style={style} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.14, 0.74, 0.74]} />
            <AccentMaterial color={secondaryColor} style={style} />
          </mesh>
          {/* Top Bow */}
          <mesh position={[0, 0.42, 0]}>
            <torusGeometry args={[0.14, 0.05, 16, 32]} />
            <AccentMaterial color={secondaryColor} style="glossy" />
          </mesh>
        </group>
      );

    case 'trophy':
      return (
        <group>
          {/* Pedestal */}
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[0.5, 0.2, 0.5]} />
            <AccentMaterial color="#1e293b" style="clay" />
          </mesh>
          {/* Stem */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 0.3, 16]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Cup */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.35, 0.15, 0.55, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Left Handle */}
          <mesh position={[-0.38, 0.2, 0]}>
            <torusGeometry args={[0.15, 0.04, 16, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Right Handle */}
          <mesh position={[0.38, 0.2, 0]}>
            <torusGeometry args={[0.15, 0.04, 16, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
        </group>
      );

    case 'smartphone':
      return (
        <group>
          {/* Body */}
          <mesh>
            <boxGeometry args={[0.55, 0.95, 0.08]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Glass Screen */}
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[0.48, 0.86]} />
            <AccentMaterial color="#0284c7" style="glass" />
          </mesh>
        </group>
      );

    case 'gem':
      return (
        <group>
          {/* Upper cone */}
          <mesh position={[0, 0.15, 0]}>
            <coneGeometry args={[0.45, 0.35, 8]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glass" />
          </mesh>
          {/* Lower cone */}
          <mesh position={[0, -0.25, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.45, 0.45, 8]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glass" />
          </mesh>
        </group>
      );

    case 'bell':
      return (
        <group>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.2, 0.45, 0.55, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.22, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Clapper */}
          <mesh position={[0, -0.22, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <AccentMaterial color={secondaryColor} style="metallic" />
          </mesh>
        </group>
      );

    case 'palette':
      return (
        <group rotation={[-0.2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.55, 0.55, 0.08, 32]} />
            <IconMaterial color="#d97706" secondaryColor={secondaryColor} style="clay" />
          </mesh>
          {/* Paint dots */}
          {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ec4899'].map((col, idx) => {
            const angle = (idx * 60 * Math.PI) / 180;
            const r = 0.35;
            return (
              <mesh key={idx} position={[Math.cos(angle) * r, 0.05, Math.sin(angle) * r]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <AccentMaterial color={col} style="glossy" />
              </mesh>
            );
          })}
        </group>
      );

    case 'lock':
      return (
        <group>
          {/* Body */}
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[0.6, 0.45, 0.3]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Shackle */}
          <mesh position={[0, 0.2, 0]}>
            <torusGeometry args={[0.2, 0.06, 16, 32]} />
            <AccentMaterial color="#94a3b8" style="metallic" />
          </mesh>
        </group>
      );

    case 'bulb':
      return (
        <group>
          {/* Glass bulb */}
          <mesh position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.38, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="neon" />
          </mesh>
          {/* Base screw */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.3, 16]} />
            <AccentMaterial color="#64748b" style="metallic" />
          </mesh>
        </group>
      );

    case 'flame':
      return (
        <group>
          <mesh position={[0, 0.0, 0]}>
            <coneGeometry args={[0.35, 0.85, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="neon" />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <coneGeometry args={[0.2, 0.5, 32]} />
            <AccentMaterial color={secondaryColor} style="neon" />
          </mesh>
        </group>
      );

    case 'headphones':
      return (
        <group>
          {/* Headband */}
          <mesh position={[0, 0.1, 0]}>
            <torusGeometry args={[0.4, 0.05, 16, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Left Earcup */}
          <mesh position={[-0.4, -0.1, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.25, 32]} />
            <AccentMaterial color={secondaryColor} style="glossy" />
          </mesh>
          {/* Right Earcup */}
          <mesh position={[0.4, -0.1, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.25, 32]} />
            <AccentMaterial color={secondaryColor} style="glossy" />
          </mesh>
        </group>
      );

    case 'controller':
      return (
        <group>
          {/* Body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.85, 0.45, 0.2]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Handles */}
          <mesh position={[-0.35, -0.2, 0]} rotation={[0, 0, 0.4]}>
            <cylinderGeometry args={[0.15, 0.12, 0.45, 16]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh position={[0.35, -0.2, 0]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.15, 0.12, 0.45, 16]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Buttons */}
          <mesh position={[0.25, 0.05, 0.11]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <AccentMaterial color="#ec4899" style="glossy" />
          </mesh>
        </group>
      );

    case 'camera':
      return (
        <group>
          {/* Body */}
          <mesh>
            <boxGeometry args={[0.75, 0.5, 0.3]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Lens */}
          <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.15, 32]} />
            <AccentMaterial color={secondaryColor} style="metallic" />
          </mesh>
        </group>
      );

    case 'planet':
      return (
        <group rotation={[0.4, 0, 0.4]}>
          <mesh>
            <sphereGeometry args={[0.38, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.62, 0.06, 16, 64]} />
            <AccentMaterial color={secondaryColor} style="glass" />
          </mesh>
        </group>
      );

    case 'spline_cubes':
      return (
        <group rotation={[0.5, 0.7, 0]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.45, 0.45, 0.45]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glass" />
          </mesh>
          <mesh position={[-0.25, -0.25, 0.15]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <AccentMaterial color={secondaryColor} style="glass" />
          </mesh>
          <mesh position={[0.25, -0.25, -0.15]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <AccentMaterial color="#38bdf8" style="glass" />
          </mesh>
        </group>
      );

    case 'donut':
      return (
        <group rotation={[0.6, 0.3, 0]}>
          {/* Dough */}
          <mesh>
            <torusGeometry args={[0.4, 0.18, 32, 64]} />
            <IconMaterial color="#d97706" secondaryColor={secondaryColor} style="clay" />
          </mesh>
          {/* Icing */}
          <mesh position={[0, 0.02, 0]}>
            <torusGeometry args={[0.41, 0.15, 32, 64]} />
            <AccentMaterial color={color} style="glossy" />
          </mesh>
        </group>
      );

    case 'potion':
      return (
        <group>
          {/* Flask */}
          <mesh position={[0, -0.1, 0]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glass" />
          </mesh>
          {/* Neck */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.3, 16]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glass" />
          </mesh>
          {/* Cork */}
          <mesh position={[0, 0.52, 0]}>
            <cylinderGeometry args={[0.13, 0.1, 0.12, 16]} />
            <AccentMaterial color="#b45309" style="clay" />
          </mesh>
        </group>
      );

    case 'shield':
      return (
        <group scale={[0.85, 0.85, 0.85]}>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.7, 0.5, 0.18]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh position={[0, -0.25, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.35, 0.5, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh position={[0, 0.05, 0.1]}>
            <torusGeometry args={[0.16, 0.04, 16, 32]} />
            <AccentMaterial color={secondaryColor} style="metallic" />
          </mesh>
        </group>
      );

    case 'atom':
      return (
        <group>
          <mesh>
            <sphereGeometry args={[0.22, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="neon" />
          </mesh>
          {[0, 60, 120].map((deg, i) => (
            <group key={i} rotation={[0, 0, (deg * Math.PI) / 180]}>
              <mesh>
                <torusGeometry args={[0.55, 0.02, 16, 64]} />
                <AccentMaterial color={secondaryColor} style="neon" />
              </mesh>
            </group>
          ))}
        </group>
      );

    case 'battery':
      return (
        <group>
          {/* Main cell body */}
          <mesh>
            <boxGeometry args={[0.45, 0.8, 0.3]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Top terminal cap */}
          <mesh position={[0, 0.46, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.12, 16]} />
            <AccentMaterial color="#e2e8f0" style="metallic" />
          </mesh>
          {/* 3 Charge Status Level Bars */}
          {[-0.2, 0, 0.2].map((y, idx) => (
            <mesh key={idx} position={[0, y, 0.16]}>
              <boxGeometry args={[0.3, 0.12, 0.04]} />
              <AccentMaterial color="#22c55e" style="neon" />
            </mesh>
          ))}
        </group>
      );

    case 'wallet':
      return (
        <group rotation={[0, 0.2, 0]}>
          {/* Folded Leather Body */}
          <mesh>
            <boxGeometry args={[0.8, 0.52, 0.22]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Metallic Clasp */}
          <mesh position={[0.25, 0, 0.12]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <AccentMaterial color="#eab308" style="metallic" />
          </mesh>
          {/* Protruding Cash Notes */}
          <mesh position={[-0.1, 0.22, 0]}>
            <boxGeometry args={[0.6, 0.2, 0.04]} />
            <AccentMaterial color="#22c55e" style="clay" />
          </mesh>
        </group>
      );

    case 'vault':
      return (
        <group>
          {/* Steel Safe Box */}
          <mesh>
            <boxGeometry args={[0.8, 0.8, 0.65]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Vault Round Door */}
          <mesh position={[0, 0, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.08, 32]} />
            <AccentMaterial color="#94a3b8" style="metallic" />
          </mesh>
          {/* Combination Wheel Handle */}
          <mesh position={[0, 0, 0.4]}>
            <torusGeometry args={[0.14, 0.03, 16, 32]} />
            <AccentMaterial color="#e2e8f0" style="metallic" />
          </mesh>
        </group>
      );

    case 'thumbs_up':
      return (
        <group rotation={[0, -0.3, 0]}>
          {/* Wrist cuff */}
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.25, 32]} />
            <IconMaterial color={secondaryColor} secondaryColor={color} style={style} />
          </mesh>
          {/* Hand Fist block */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.42, 0.42, 0.35]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Extended Thumb Cylinder */}
          <mesh position={[0.08, 0.28, 0]} rotation={[0, 0, -0.2]}>
            <cylinderGeometry args={[0.12, 0.14, 0.45, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          <mesh position={[0.12, 0.48, 0]}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
        </group>
      );

    case 'mail':
      return (
        <group rotation={[0.1, 0, 0]}>
          {/* Envelope Body */}
          <mesh>
            <boxGeometry args={[0.9, 0.6, 0.1]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Flap Prism Top */}
          <mesh position={[0, 0.12, 0.06]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.42, 0.3, 3]} />
            <IconMaterial color={secondaryColor} secondaryColor={color} style={style} />
          </mesh>
          {/* Red Seal */}
          <mesh position={[0, 0, 0.07]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <AccentMaterial color="#ef4444" style="glossy" />
          </mesh>
        </group>
      );

    case 'magic_wand':
      return (
        <group rotation={[0, 0, -0.6]}>
          {/* Wand Shaft */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 1.1, 16]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="clay" />
          </mesh>
          {/* Wand Tip Cap */}
          <mesh position={[0, 0.52, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.18, 16]} />
            <AccentMaterial color="#e2e8f0" style="metallic" />
          </mesh>
          {/* Star Top */}
          <mesh position={[0, 0.68, 0]}>
            <octahedronGeometry args={[0.18, 0]} />
            <AccentMaterial color={secondaryColor} style="neon" />
          </mesh>
        </group>
      );

    case 'compass':
      return (
        <group rotation={[Math.PI / 3, 0, 0]}>
          {/* Brass Housing */}
          <mesh>
            <cylinderGeometry args={[0.55, 0.55, 0.12, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Glass Face */}
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.02, 32]} />
            <AccentMaterial color="#e0f2fe" style="glass" />
          </mesh>
          {/* North Red Pointer */}
          <mesh position={[0, 0.08, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.32, 4]} />
            <AccentMaterial color="#ef4444" style="glossy" />
          </mesh>
          {/* South Blue Pointer */}
          <mesh position={[0, 0.08, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.32, 4]} />
            <AccentMaterial color="#3b82f6" style="glossy" />
          </mesh>
        </group>
      );

    case 'key':
      return (
        <group rotation={[0, 0, 0.4]}>
          {/* Ring Bow Head */}
          <mesh position={[0, 0.38, 0]}>
            <torusGeometry args={[0.2, 0.05, 16, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Key Stem Shaft */}
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.75, 16]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Key Notch Teeth */}
          <mesh position={[0.08, -0.38, 0]}>
            <boxGeometry args={[0.12, 0.22, 0.05]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
        </group>
      );

    case 'folder':
      return (
        <group rotation={[0, -0.2, 0]}>
          {/* Main Folder Base */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.85, 0.6, 0.16]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Folder Top Tab */}
          <mesh position={[-0.26, 0.36, 0]}>
            <boxGeometry args={[0.32, 0.14, 0.16]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Inner Document Paper Sheet */}
          <mesh position={[0, 0.1, 0.04]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[0.7, 0.55, 0.04]} />
            <AccentMaterial color="#ffffff" style="clay" />
          </mesh>
        </group>
      );

    case 'search':
      return (
        <group rotation={[0, 0, -0.5]}>
          {/* Magnifying Glass Rim */}
          <mesh position={[0, 0.22, 0]}>
            <torusGeometry args={[0.3, 0.05, 16, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Lens Glass Center */}
          <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.02, 32]} />
            <AccentMaterial color="#38bdf8" style="glass" />
          </mesh>
          {/* Handle Shaft */}
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.5, 16]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="clay" />
          </mesh>
        </group>
      );

    case 'pin':
      return (
        <group>
          {/* Top Pin Sphere */}
          <mesh position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Tapered Bottom Cone */}
          <mesh position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.3, 0.55, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Center Pin Cutout Hole */}
          <mesh position={[0, 0.28, 0.22]}>
            <torusGeometry args={[0.1, 0.03, 16, 32]} />
            <AccentMaterial color="#ffffff" style="glossy" />
          </mesh>
        </group>
      );

    case 'target':
      return (
        <group rotation={[Math.PI / 4, 0, 0]}>
          {/* Outer Red Ring */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.45, 0.07, 16, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
          {/* Middle White Ring */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.3, 0.06, 16, 32]} />
            <AccentMaterial color="#ffffff" style="clay" />
          </mesh>
          {/* Center Bullseye Sphere */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.16, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
        </group>
      );

    case 'calendar':
      return (
        <group rotation={[0.1, 0, 0]}>
          {/* Calendar Plaque Slab */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 0.7, 0.12]} />
            <AccentMaterial color="#ffffff" style="clay" />
          </mesh>
          {/* Top Header Banner Strip */}
          <mesh position={[0, 0.24, 0.02]}>
            <boxGeometry args={[0.8, 0.22, 0.12]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Top Binder Ring Toruses */}
          {[-0.22, 0.22].map((x, i) => (
            <mesh key={i} position={[x, 0.38, 0]}>
              <torusGeometry args={[0.07, 0.02, 16, 32]} />
              <AccentMaterial color="#94a3b8" style="metallic" />
            </mesh>
          ))}
        </group>
      );

    case 'hourglass':
      return (
        <group>
          {/* Top & Bottom End Plates */}
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.08, 32]} />
            <IconMaterial color={secondaryColor} secondaryColor={color} style="metallic" />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.08, 32]} />
            <IconMaterial color={secondaryColor} secondaryColor={color} style="metallic" />
          </mesh>
          {/* Upper Glass Bulb */}
          <mesh position={[0, 0.18, 0]}>
            <coneGeometry args={[0.3, 0.4, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glass" />
          </mesh>
          {/* Lower Glass Bulb */}
          <mesh position={[0, -0.18, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.3, 0.4, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glass" />
          </mesh>
        </group>
      );

    case 'crown':
      return (
        <group>
          {/* Golden Rim Base */}
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.42, 0.45, 0.15, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* 5 Spikes/Peaks */}
          {[0, 72, 144, 216, 288].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const r = 0.38;
            return (
              <group key={i} position={[Math.sin(rad) * r, 0.1, Math.cos(rad) * r]}>
                <mesh>
                  <coneGeometry args={[0.1, 0.45, 4]} />
                  <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
                </mesh>
                <mesh position={[0, 0.25, 0]}>
                  <sphereGeometry args={[0.06, 16, 16]} />
                  <AccentMaterial color="#ef4444" style="glossy" />
                </mesh>
              </group>
            );
          })}
        </group>
      );

    default:
      // Generic fallback 3D glossy rounded cube
      return (
        <mesh>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
        </mesh>
      );
  }
}

export function Spline3DIconRenderer({ obj, isPreviewMode }: { obj: SceneObject; isPreviewMode: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const iconType = obj.properties?.iconType || 'rocket';
  const color = obj.properties?.color || '#ef4444';
  const secondaryColor = obj.properties?.secondaryColor || '#ffffff';
  const style = obj.properties?.materialStyle || 'glossy';
  const enableFloat = obj.properties?.floatAnim !== false;
  const rotationSpeed = obj.properties?.rotationSpeed ?? 0.5;

  // Realtime subtle floating animation loop
  useFrame((state, delta) => {
    if (groupRef.current && (enableFloat || isPreviewMode)) {
      const t = state.clock.getElapsedTime();
      if (enableFloat) {
        groupRef.current.position.y = Math.sin(t * 2) * 0.08;
      }
      if (rotationSpeed > 0 && isPreviewMode) {
        groupRef.current.rotation.y += delta * rotationSpeed;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <ProceduralIconShape 
        iconType={iconType} 
        color={color} 
        secondaryColor={secondaryColor} 
        style={style} 
      />
    </group>
  );
}
