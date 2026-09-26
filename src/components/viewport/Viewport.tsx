import { playCachedAudio, globalAudioCache } from '../../lib/audioManager';
import { PivotNormalizationService } from '../../lib/PivotNormalizationService';
import { createSyntheticAnimationClip } from '../../utils/animationSynthesizer';
import { cn } from '../../lib/utils';
import React, { useRef, useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { CameraController } from './CameraController';
import { OrbitControls, TransformControls, Grid, Text, useGLTF, useTexture, GizmoHelper, GizmoViewport, useGizmoContext, useAnimations, Html, Environment, ContactShadows, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import { useEditorStore } from '../../store/useEditorStore';
import { DEFAULT_ART_POSTER_TEXTURE } from '../../lib/arTargetTexture';
import { SceneObject } from '../../types';
import * as THREE from 'three';
import { GlassCard, GlassFAB } from '../ui/HudComponents';
import { Overlay2DRenderer } from "./Overlay2DRenderer";
import { SnapshotShareModal } from './SnapshotShareModal';
import { PublicationModal } from './PublicationModal';
import { BloomEffect } from './BloomEffect';
import { Spline3DIconRenderer } from './Spline3DIconRenderer';
import { Spline2DIconRenderer } from './Spline2DIconRenderer';
import { MarkerConflictBanner } from '../toolbar/MarkerConflictBanner';
import { SelectionMarquee } from './SelectionMarquee';
import { SnapToGridMenu } from '../layout/SnapToGridMenu';
import { TransformGizmoCallout3D, MobileTransformHUD, TransformHUDCallout } from './TransformPropertyCallout';
import { computeComprehensiveSnapPosition, getObjectBoundingBox, computeGizmoScaleSnap } from '../../utils/snapping';
import { 
  Maximize, 
  Maximize2,
  RotateCw, 
  RotateCcw,
  Move, 
  MousePointer,
  Camera, 
  RefreshCw, 
  Video, 
  Smartphone, 
  CheckCircle, 
  Tv, 
  Signal, 
  Wifi, 
  BatteryCharging, 
  Sparkles,
  Magnet,
  Grid as GridIcon, Grid3x3,
  Layers,
  Compass,
  Globe,
  Gauge,
  Zap,
  Lock,
  Unlock,
  Info,
  HelpCircle,
  Tag,
  Volume2,
  VolumeX,
  Box,
  BoxSelect,
  Play,
  Link2,
  Star,
  X,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Crosshair,
  Shield,
  ArrowRight,
  ArrowUp,
  ShoppingCart,
  Heart,
  Plus,
  Download,
  Settings,
  Rocket,
  Check,
  Boxes,
  Activity,
  Car
} from 'lucide-react';
import { VehicleDrivingHUD } from './VehicleDrivingHUD';
import { VehiclePhysicsSceneController } from './VehiclePhysicsSceneController';
import { 
  stepVehiclePhysics, 
  DEFAULT_VEHICLE_CONFIG, 
  VehiclePhysicsConfig, 
  computeOrientedBoundingBox 
} from '../../lib/physics/collisionEngine';
import { vehicleSoundEngine } from '../../lib/physics/vehicleSoundEngine';

// Module-scoped flag to track if the user is actively dragging the transform gizmo.
// This prevents useFrame from overwriting the vertical position during dragging.
let isTransformDragging = false;

// Color helper to darken hex values for 3D extrusion/beveiling
function darkenHexColor(hex: string, factor: number) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  let r = Math.floor(((num >> 16) & 255) * factor);
  let g = Math.floor(((num >> 8) & 255) * factor);
  let b = Math.floor((num & 255) * factor);
  
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Volumetric 3D Text using layered rendering for absolute compatibility and look
function Volumetric3DText({ text, color, fontSize, position, ...props }: any) {
  const depth = 5; // number of offset layers for 3D extrusion
  const step = 0.003; // distance between layers
  
  return (
    <group position={position}>
      {Array.from({ length: depth }).map((_, i) => {
        const zOffset = -i * step;
        const factor = 1 - (i / depth) * 0.5; // darken background layers
        const layerColor = darkenHexColor(color, factor);
        return (
          <Text
            key={i}
            {...props}
            fontSize={fontSize}
            color={layerColor}
            position={[0, 0, zOffset]}
          >
            {text}
          </Text>
        );
      })}
    </group>
  );
}

// Helper to render icon for buttons
function renderButtonIconHelper(name?: string, size = 16, className = '') {
  if (!name) return null;
  switch (name) {
    case 'Sparkles': return <Sparkles size={size} className={className} />;
    case 'ArrowRight': return <ArrowRight size={size} className={className} />;
    case 'Play': return <Play size={size} className={className} />;
    case 'ShoppingCart': return <ShoppingCart size={size} className={className} />;
    case 'Heart': return <Heart size={size} className={className} />;
    case 'Plus': return <Plus size={size} className={className} />;
    case 'Download': return <Download size={size} className={className} />;
    case 'Settings': return <Settings size={size} className={className} />;
    case 'Rocket': return <Rocket size={size} className={className} />;
    case 'Check': return <Check size={size} className={className} />;
    case 'Zap': return <Zap size={size} className={className} />;
    case 'Shield': return <Shield size={size} className={className} />;
    case 'Compass': return <Compass size={size} className={className} />;
    case 'Star': return <Star size={size} className={className} />;
    case 'Globe': return <Globe size={size} className={className} />;
    case 'Info': return <Info size={size} className={className} />;
    default: return <Sparkles size={size} className={className} />;
  }
}

// Interactive physical 3D Push Button and Spatial Canva UI Button / Floating Panel
function Interactive3DButton({ obj, isPreviewMode, onInteract }: { obj: SceneObject; isPreviewMode: boolean; onInteract?: () => void }) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const wireframe = useEditorStore(state => state.wireframeEnabled) || false;

  const style = obj.properties.buttonStyle || '3d_push';
  const shape = obj.properties.shape || 'rounded';
  const color = obj.properties.color || '#3b82f6';
  const secondaryColor = obj.properties.secondaryColor || color;
  const borderColor = obj.properties.borderColor || 'rgba(255,255,255,0.2)';
  const textColor = obj.properties.textColor || '#ffffff';
  const text = obj.properties.text || 'Action Button';
  const url = obj.properties.url || '';
  const icon = obj.properties.icon || '';
  const iconPosition = obj.properties.iconPosition || 'left';
  const borderRadius = obj.properties.borderRadius ?? (shape === 'pill' || shape === 'circle' ? 9999 : shape === 'sharp' ? 0 : 12);
  const borderWidth = obj.properties.borderWidth ?? (style === 'outline' ? 2 : 0);
  const fontSize = obj.properties.fontSize ?? 0.18;
  const fontFamily = obj.properties.fontFamily || 'Inter';
  const fontWeight = obj.properties.fontWeight || '700';
  const glowEffect = obj.properties.glowEffect ?? false;
  const glowColor = obj.properties.glowColor || 'rgba(59, 130, 246, 0.5)';

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (url && isPreviewMode) {
      window.open(url, '_blank');
    }
    if (onInteract) onInteract();
  };

  // 1. Spatial Glassmorphic UI Panel
  if (style === 'glass_panel') {
    return (
      <group>
        {/* Glass panel frame backing plate */}
        <mesh castShadow receiveShadow>
          <planeGeometry args={[1.6, 0.9]} />
          <meshStandardMaterial 
            color="#0a0a0a" 
            transparent 
            opacity={0.3} 
            roughness={0.15} 
            metalness={0.9} 
            side={THREE.DoubleSide} 
            wireframe={wireframe}
          />
        </mesh>
        
        <Html zIndexRange={[10, 0]}
          transform
          occlude="blending"
          pointerEvents={isPreviewMode ? "auto" : "none"}
          distanceFactor={1.25}
          position={[0, 0, 0.02]}
          style={{ pointerEvents: isPreviewMode ? "auto" : "none" }}
        >
          <div className="flex flex-col gap-2.5 p-4 bg-neutral-900/60 border border-white/15 backdrop-blur-xl rounded-2xl shadow-2xl text-white font-sans w-64 items-center justify-center select-none">
            <div className="flex items-center justify-between w-full border-b border-white/10 pb-1.5 px-0.5">
              <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono tracking-wider uppercase font-semibold">
                <Sparkles size={11} className="animate-pulse" />
                <span>Spatial HUD Panel</span>
              </div>
              <span className="text-[9px] text-gray-400 font-mono bg-white/10 px-1.5 py-0.5 rounded">
                v2.4
              </span>
            </div>
            
            <button 
              onClick={handleClick}
              style={{
                background: secondaryColor && secondaryColor !== color
                  ? `linear-gradient(135deg, ${color}, ${secondaryColor})`
                  : color,
                color: textColor,
                borderRadius: `${borderRadius}px`,
                border: borderWidth ? `${borderWidth}px solid ${borderColor}` : undefined,
                fontFamily: fontFamily,
                fontWeight: fontWeight,
                boxShadow: glowEffect ? `0 0 20px ${glowColor}` : '0 10px 25px -5px rgba(0,0,0,0.5)',
              }}
              className="w-full py-2.5 px-4 font-bold text-xs shadow-lg transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {icon && iconPosition === 'left' && renderButtonIconHelper(icon, 14)}
              <span>{text}</span>
              {icon && iconPosition === 'right' && renderButtonIconHelper(icon, 14)}
              {icon && iconPosition === 'only' && renderButtonIconHelper(icon, 16)}
            </button>
            
            {url && (
              <div className="flex items-center gap-1 text-[9px] text-neutral-400 font-mono truncate max-w-full hover:text-cyan-300 transition-colors">
                <ExternalLink size={10} />
                <span className="truncate">{url}</span>
              </div>
            )}
          </div>
        </Html>
      </group>
    );
  }

  // 2. High-Tech 2D/3D Hybrid Spatial Canva Buttons (Pill, Circle, Rounded, Chamfer, Gradient, Outline)
  if (style !== '3d_push') {
    const isCircle = shape === 'circle' || style === 'circle';
    const isChamfer = shape === 'chamfer' || style === 'chamfer';
    const isPill = shape === 'pill' || style === 'pill';
    const isOutline = style === 'outline';

    const bgStyle = isOutline
      ? (color === 'transparent' ? 'rgba(15, 23, 42, 0.6)' : color)
      : (secondaryColor && secondaryColor !== color
        ? `linear-gradient(135deg, ${color}, ${secondaryColor})`
        : color);

    const clipPath = isChamfer
      ? 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)'
      : undefined;

    return (
      <group>
        {/* Invisible 3D hit volume so it can be dragged/transformed in 3D */}
        <mesh 
          castShadow 
          receiveShadow
          onClick={handleClick}
          onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
          onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); setIsPressed(false); }}
          onPointerDown={(e) => { e.stopPropagation(); setIsPressed(true); }}
          onPointerUp={(e) => { e.stopPropagation(); setIsPressed(false); }}
        >
          {isCircle ? (
            <cylinderGeometry args={[0.35, 0.35, 0.04, 32]} />
          ) : (
            <boxGeometry args={[1.4, 0.5, 0.04]} />
          )}
          <meshStandardMaterial 
            color={color === 'transparent' ? '#3b82f6' : color} 
            transparent 
            opacity={0.15} 
            wireframe={wireframe}
          />
        </mesh>

        <Html
          zIndexRange={[10, 0]}
          transform
          occlude="blending"
          pointerEvents={isPreviewMode ? "auto" : "none"}
          distanceFactor={1.15}
          position={[0, 0, 0.025]}
          style={{ pointerEvents: isPreviewMode ? "auto" : "none" }}
        >
          <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            style={{
              background: bgStyle,
              color: textColor,
              borderRadius: isChamfer ? '0px' : `${borderRadius}px`,
              clipPath: clipPath,
              border: `${Math.max(borderWidth, isOutline ? 2 : 0)}px solid ${borderColor || color}`,
              boxShadow: glowEffect
                ? `0 0 25px ${glowColor}, 0 8px 20px rgba(0,0,0,0.4)`
                : isHovered
                ? '0 12px 28px -4px rgba(0,0,0,0.6)'
                : '0 6px 16px -2px rgba(0,0,0,0.4)',
              transform: isPressed ? 'scale(0.94)' : isHovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
              fontFamily: fontFamily,
              fontWeight: fontWeight,
            }}
            className={`select-none cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md ${
              isCircle
                ? 'w-14 h-14'
                : isPill
                ? 'py-2.5 px-6 min-w-[150px]'
                : 'py-2.5 px-5 min-w-[140px]'
            }`}
          >
            {icon && (iconPosition === 'left' || iconPosition === 'only') && (
              <span className={iconPosition === 'only' ? '' : 'shrink-0'}>
                {renderButtonIconHelper(icon, isCircle ? 20 : 16)}
              </span>
            )}
            {(!icon || iconPosition !== 'only') && (
              <span 
                className="whitespace-nowrap tracking-wide leading-none text-center"
                style={{ fontSize: `${Math.max(12, Math.round(fontSize * 75))}px` }}
              >
                {text}
              </span>
            )}
            {icon && iconPosition === 'right' && (
              <span className="shrink-0">
                {renderButtonIconHelper(icon, 16)}
              </span>
            )}
          </div>
        </Html>
      </group>
    );
  }

  // 3. True Physical 3D Tactile Push Button
  const plungerZ = isPressed ? 0.01 : isHovered ? 0.04 : 0.05;

  return (
    <group 
      onPointerDown={(e) => { e.stopPropagation(); setIsPressed(true); }}
      onPointerUp={(e) => { e.stopPropagation(); setIsPressed(false); }}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); setIsPressed(false); }}
      onClick={handleClick}
    >
      {/* 3D Outer Bezel Base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.5, 0.08]} />
        <meshStandardMaterial 
          color="#1c1917" 
          roughness={0.4} 
          metalness={0.8} 
          wireframe={wireframe}
        />
      </mesh>

      {/* Interactive Plunger cap */}
      <group position={[0, 0, plungerZ]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.42, 0.1]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.2} 
            metalness={0.1} 
            emissive={color}
            emissiveIntensity={isHovered ? 0.25 : 0.05}
            wireframe={wireframe}
          />
        </mesh>

        {/* True 3D Text Extrusion */}
        <Volumetric3DText 
          text={text}
          color={textColor}
          fontSize={fontSize || 0.16}
          position={[0, 0, 0.06]}
          anchorX="center"
          anchorY="middle"
        />
      </group>
    </group>
  );
}

// Helper to calculate YouTube aspect ratio ratio decimal
export function getYoutubeAspectRatioRatio(
  aspectRatio?: string,
  customW?: number,
  customH?: number
): number {
  switch (aspectRatio) {
    case '4:3':
      return 4 / 3;
    case '1:1':
      return 1.0;
    case '21:9':
      return 21 / 9;
    case '9:16':
      return 9 / 16;
    case 'custom':
      if (customW && customH && customH > 0) {
        return customW / customH;
      }
      return 16 / 9;
    case '16:9':
    default:
      return 16 / 9;
  }
}

// Global helper to dispatch YouTube player commands via postMessage
export function sendYoutubeCommand(objectId: string, command: string, args: any[] = []) {
  const iframes = document.querySelectorAll(`iframe[data-youtube-object-id="${objectId}"]`);
  iframes.forEach((iframeNode) => {
    const iframe = iframeNode as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: args
          }),
          '*'
        );
      } catch (e) {
        console.warn('YouTube postMessage dispatch error:', e);
      }
    }
  });
}

// Interactive 3D YouTube Screen with Clean Unified Interface across all Flavors
function InteractiveYoutubeScreen({
  obj,
  isPreviewMode,
  onInteract
}: {
  obj: SceneObject;
  isPreviewMode: boolean;
  onInteract?: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Active state property overrides if a state is active
  const curActiveStateId = useEditorStore(state => state.activeStateId);
  const selectedObjectIds = useEditorStore(state => state.selectedObjectIds);
  const isSelected = selectedObjectIds.includes(obj.id);
  const activeStateObj = (!isPreviewMode && isSelected && curActiveStateId && curActiveStateId !== 'base' && obj.states)
    ? obj.states.find((s: any) => s.id === curActiveStateId)
    : null;

  const effectiveProps = (activeStateObj && activeStateObj.properties)
    ? { ...obj.properties, ...activeStateObj.properties }
    : obj.properties;

  const videoId = effectiveProps.videoId || 'dQw4w9WgXcQ';
  const autoplay = effectiveProps.autoplay ? 1 : 0;
  const mute = effectiveProps.mute ? 1 : 0;
  const loop = effectiveProps.loop ? 1 : 0;
  const controls = effectiveProps.controls === false ? 0 : 1;
  const volume = effectiveProps.volume ?? 100;
  const aspectRatio = effectiveProps.aspectRatio || '16:9';
  const customW = effectiveProps.customAspectRatioWidth;
  const customH = effectiveProps.customAspectRatioHeight;
  const resolution = effectiveProps.resolution || '240p';
  const displayMode = effectiveProps.displayMode || '3d'; // '3d' | '2d'

  // Compute aspect ratio multiplier
  const ratio = getYoutubeAspectRatioRatio(aspectRatio, customW, customH);

  // Plane height in 3D scene (default 1.0 meter base)
  const planeHeight = 1.0;
  const planeWidth = Number((planeHeight * ratio).toFixed(3));
  const panelDepth = 0.012; // sleek, slim flat chassis with no bevels

  // Crisp HD base canvas resolution
  const baseHtmlHeight = 720;
  const baseHtmlWidth = Math.round(baseHtmlHeight * ratio);

  // Video quality code for URL / YT JS API
  const vqMap: Record<string, string> = {
    '1080p': 'hd1080',
    '720p': 'hd720',
    '480p': 'large',
    '360p': 'medium',
    '240p': 'small'
  };
  const vq = vqMap[resolution] || 'auto';

  // Apply volume, mute, quality on initial load or property changes via postMessage without iframe reload
  useEffect(() => {
    if (!iframeRef.current || !videoId) return;

    const timer = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        if (mute) {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
        } else {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [volume] }), '*');
        }
        if (vq && vq !== 'auto') {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setPlaybackQuality', args: [vq] }), '*');
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [videoId, volume, mute, vq]);

  const isCurrentlyPlaying = !!effectiveProps.isPlaying || !!effectiveProps.autoplay;

  // Sync play/pause state
  useEffect(() => {
    if (!iframeRef.current || !videoId) return;
    const timer = setTimeout(() => {
      if (isCurrentlyPlaying) {
        sendYoutubeCommand(obj.id, 'playVideo');
      } else {
        sendYoutubeCommand(obj.id, 'pauseVideo');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [obj.id, videoId, isCurrentlyPlaying]);

  const isOverlayMode = displayMode === '2d';

  // Return to 3D World callback
  const returnTo3D = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    useEditorStore.getState().updateObject(obj.id, {
      properties: { ...obj.properties, displayMode: '3d', overlayOpen: false }
    });
  }, [obj.id, obj.properties]);

  const handlePanelClick = (e: any) => {
    if (isPreviewMode) {
      e.stopPropagation?.();
      onInteract?.();
    }
  };

  return (
    <group onClick={handlePanelClick}>
      {/* Clean Flat Slim Chassis (No bevels or extra moldings) */}
      <mesh position={[0, 0, -panelDepth / 2]} castShadow receiveShadow>
        <boxGeometry args={[planeWidth, planeHeight, panelDepth]} />
        <meshStandardMaterial color="#111216" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Spatial Anchor Markers on 3D mesh when in 2D Overlay mode */}
      {isOverlayMode && (
        <group position={[0, 0, 0.001]}>
          <mesh>
            <planeGeometry args={[planeWidth, planeHeight]} />
            <meshBasicMaterial color="#0b0c10" transparent opacity={0.85} />
          </mesh>
          <Html center distanceFactor={2.0} position={[0, 0, 0.015]}>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#0e1017]/95 border border-red-500/40 text-white backdrop-blur-md select-none text-center min-w-[170px] shadow-xl">
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-[10px] uppercase tracking-wider">
                <Tv size={13} />
                <span>Spatial Anchor Linked</span>
              </div>
              <span className="text-[9px] text-gray-300 font-medium">Playing in 2D Screen Overlay</span>
              <span className="text-[8px] font-mono text-gray-400">
                {aspectRatio} ({resolution})
              </span>
              <button
                onClick={returnTo3D}
                className="mt-1 px-3 py-1 rounded-md bg-red-600 hover:bg-red-500 text-white text-[9px] font-bold shadow transition-all cursor-pointer flex items-center gap-1"
              >
                <Box size={10} />
                <span>Dock to 3D World</span>
              </button>
            </div>
          </Html>
        </group>
      )}

      {/* 3D Mode Screen Content: Live Iframe during preview/play, Clean 3D Mesh in Editor mode for reliable transform gizmo manipulation */}
      {!isOverlayMode && (
        (isPreviewMode || obj.properties?.isPlaying || obj.properties?.autoplay) ? (
          <Html
            zIndexRange={[1, 0]}
            transform
            pointerEvents={isPreviewMode ? 'auto' : 'none'}
            distanceFactor={400 / baseHtmlHeight}
            position={[0, 0, 0.002]}
            style={{
              width: `${baseHtmlWidth}px`,
              height: `${baseHtmlHeight}px`,
              background: '#09090b',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'inset 0 0 16px rgba(0, 0, 0, 0.7)',
              pointerEvents: isPreviewMode ? 'auto' : 'none',
              transformOrigin: 'center center'
            }}
          >
            {videoId ? (
              <iframe
                ref={iframeRef}
                data-youtube-object-id={obj.id}
                key={videoId}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}&mute=${mute ? 1 : 0}&loop=${loop ? 1 : 0}${loop ? `&playlist=${videoId}` : ''}&vq=${vq}&rel=0`}
                title={obj.name || 'YouTube Player'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', pointerEvents: isPreviewMode ? 'auto' : 'none' }}
              />
            ) : (
              <div className="w-full h-full bg-[#0d0e12] p-6 flex flex-col justify-center items-center text-white font-sans border border-white/5 select-none">
                <Tv size={40} className="text-red-500 mb-3" />
                <h3 className="text-lg font-bold uppercase text-neutral-200">YouTube Video Player</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-[260px] text-center">
                  Enter a YouTube Video ID in the Inspector to stream video.
                </p>
              </div>
            )}
          </Html>
        ) : (
          <YoutubePoster3DMesh
            videoId={videoId}
            planeWidth={planeWidth}
            planeHeight={planeHeight}
            aspectRatio={aspectRatio}
          />
        )
      )}
    </group>
  );
}

// Clean 3D Poster Mesh for Editor Mode (Zero suspense, robust TextureLoader fallback, reliable gizmo manipulation)
function YoutubePoster3DMesh({
  videoId,
  planeWidth,
  planeHeight,
  aspectRatio = '16:9'
}: {
  videoId?: string;
  planeWidth: number;
  planeHeight: number;
  aspectRatio?: string;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!videoId) {
      setTexture(null);
      return;
    }

    let isMounted = true;
    const loader = new THREE.TextureLoader();
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    loader.load(
      thumbUrl,
      (loadedTex) => {
        if (isMounted) {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          setTexture(loadedTex);
        }
      },
      undefined,
      () => {
        if (isMounted) setTexture(null);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const badgeScale = Math.min(planeWidth, planeHeight);
  const badgeW = Math.max(0.12, badgeScale * 0.28);
  const badgeH = Math.max(0.08, badgeScale * 0.18);
  const playSize = Math.max(0.03, badgeScale * 0.08);

  return (
    <group position={[0, 0, 0.001]}>
      {/* Video Screen Surface */}
      <mesh>
        <planeGeometry args={[planeWidth, planeHeight]} />
        {texture ? (
          <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
        ) : (
          <meshStandardMaterial color="#090a0f" roughness={0.3} metalness={0.1} />
        )}
      </mesh>

      {/* Subtle Screen Reflection Glare */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.03} />
      </mesh>

      {/* Red YouTube Center Play Button */}
      <group position={[0, 0, 0.003]}>
        {/* Red Rounded Play Pill */}
        <mesh>
          <planeGeometry args={[badgeW, badgeH]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* White Play Triangle */}
        <mesh position={[badgeW * 0.05, 0, 0.001]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[playSize * 0.6, playSize, 3]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

// Helper function to recursively traverse and build a clean model tree of sub-objects
function buildSubObjectTree(node: any, indexPath: string = '0'): any {
  const nodeName = node.name || `${node.type || 'Node'}_${indexPath}`;
  
  const children: any[] = [];
  if (node.children) {
    node.children.forEach((child: any, idx: number) => {
      // Traverse meshes, groups and standard 3D objects to build the hierarchy
      if (child.isMesh || child.isGroup || child.type === 'Object3D') {
        const childTree = buildSubObjectTree(child, `${indexPath}-${idx}`);
        if (childTree) {
          children.push(childTree);
        }
      }
    });
  }

  let materialName: string | undefined = undefined;
  if (node.isMesh && node.material) {
    if (Array.isArray(node.material)) {
      materialName = node.material.map((m: any) => m.name || '').filter(Boolean)[0] || undefined;
    } else {
      materialName = node.material.name || undefined;
    }
  }

  return {
    id: indexPath,
    name: nodeName,
    type: node.isMesh ? 'Mesh' : 'Group',
    visible: node.visible,
    materialName,
    children: children.length > 0 ? children : undefined
  };
}

// Helper function to find index path of a target THREE.Mesh/Object3D relative to root scene
function findIndexPathForObject(root: THREE.Object3D, target: THREE.Object3D): string | null {
  const traverse = (current: THREE.Object3D, path: string): string | null => {
    if (current === target) return path;
    if (current.children && current.children.length > 0) {
      for (let i = 0; i < current.children.length; i++) {
        const child = current.children[i];
        if ((child as any).isMesh || (child as any).isGroup || child.type === 'Object3D') {
          const res = traverse(child, `${path}-${i}`);
          if (res) return res;
        }
      }
    }
    return null;
  };
  return traverse(root, '0');
}

// Robust GLTF / GLB 3D Model with Full Animation Clip Mixer support
function PrimitiveModelRenderer({ url, properties }: { url: string; properties: any }) {
  const primitiveType = (url || '').replace('primitive:', '').toLowerCase();
  const castShadow = properties?.castShadow !== false;
  const receiveShadow = properties?.receiveShadow !== false;
  
  switch (primitiveType) {
    case 'sphere':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <TexturedMaterial properties={properties} defaultColor="#3b82f6" />
        </mesh>
      );
    case 'cube':
    case 'box':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <boxGeometry args={[1, 1, 1]} />
          <TexturedMaterial properties={properties} defaultColor="#3b82f6" />
        </mesh>
      );
    case 'cylinder':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
          <TexturedMaterial properties={properties} defaultColor="#3b82f6" />
        </mesh>
      );
    case 'torus':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <torusGeometry args={[0.4, 0.12, 16, 64]} />
          <TexturedMaterial properties={properties} defaultColor="#3b82f6" />
        </mesh>
      );
    case 'cone':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <coneGeometry args={[0.5, 1, 32]} />
          <TexturedMaterial properties={properties} defaultColor="#3b82f6" />
        </mesh>
      );
    case 'plane':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <planeGeometry args={[1, 1]} />
          <TexturedMaterial properties={{ ...properties, doubleSided: true }} defaultColor="#3b82f6" />
        </mesh>
      );
    case 'pyramid':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <coneGeometry args={[0.7, 1, 4]} />
          <TexturedMaterial properties={properties} defaultColor="#eab308" />
        </mesh>
      );
    case 'capsule':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <capsuleGeometry args={[0.3, 0.6, 16, 32]} />
          <TexturedMaterial properties={properties} defaultColor="#a855f7" />
        </mesh>
      );
    case 'dodecahedron':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <dodecahedronGeometry args={[0.5]} />
          <TexturedMaterial properties={properties} defaultColor="#ec4899" />
        </mesh>
      );
    case 'octahedron':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <octahedronGeometry args={[0.5]} />
          <TexturedMaterial properties={properties} defaultColor="#10b981" />
        </mesh>
      );
    case 'icosahedron':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <icosahedronGeometry args={[0.5]} />
          <TexturedMaterial properties={properties} defaultColor="#06b6d4" />
        </mesh>
      );
    case 'circle':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <circleGeometry args={[0.5, 64]} />
          <TexturedMaterial properties={{ ...properties, doubleSided: true }} defaultColor="#06b6d4" />
        </mesh>
      );
    case 'ring':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <ringGeometry args={[0.3, 0.6, 64]} />
          <TexturedMaterial properties={{ ...properties, doubleSided: true }} defaultColor="#38bdf8" />
        </mesh>
      );
    case 'tube':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <cylinderGeometry args={[0.5, 0.5, 1, 32, 1, true]} />
          <TexturedMaterial properties={{ ...properties, doubleSided: true }} defaultColor="#64748b" />
        </mesh>
      );
    case 'prism':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <cylinderGeometry args={[0.6, 0.6, 1, 3]} />
          <TexturedMaterial properties={properties} defaultColor="#f97316" />
        </mesh>
      );
    case 'helix':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <torusKnotGeometry args={[0.35, 0.08, 100, 16, 2, 5]} />
          <TexturedMaterial properties={properties} defaultColor="#06b6d4" />
        </mesh>
      );
    case 'star':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <octahedronGeometry args={[0.6, 0]} />
          <TexturedMaterial properties={properties} defaultColor="#eab308" />
        </mesh>
      );
    case 'dome':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <TexturedMaterial properties={{ ...properties, doubleSided: true }} defaultColor="#38bdf8" />
        </mesh>
      );
    case 'tetrahedron':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <tetrahedronGeometry args={[0.6]} />
          <TexturedMaterial properties={properties} defaultColor="#eab308" />
        </mesh>
      );
    case 'knot':
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <torusKnotGeometry args={[0.3, 0.1, 64, 16]} />
          <TexturedMaterial properties={properties} defaultColor="#f97316" />
        </mesh>
      );
    default:
      return (
        <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <TexturedMaterial properties={properties} defaultColor="#6366f1" />
        </mesh>
      );
  }
}

function GLTFModel({ url, properties, id }: { url: string; properties: any; id: string }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  
  const isBillboard = !!(properties?.billboard || properties?.lookAtCamera);

  // Clone scene so multiple model instances have independent animation/bone controllers
  // Immediately reconcile and normalize glTF model root object to Z-up orientation upon instantiation
  const clonedScene = React.useMemo(() => {
    const cl = scene.clone();
    PivotNormalizationService.reconcileGLTFZUpOrientation(cl, isBillboard);
    PivotNormalizationService.normalizePivot(cl);
    return cl;
  }, [scene, isBillboard]);

  // Intelligent scaling & centering calculation to fit model inside Image Target frame and normalize scale
  const { scaleFactor, offsetVector } = React.useMemo(() => {
    if (!clonedScene) return { scaleFactor: 1, offsetVector: new THREE.Vector3(0, 0, 0) };

    const bbox = new THREE.Box3().setFromObject(clonedScene);
    if (bbox.isEmpty()) {
      return { scaleFactor: 1, offsetVector: new THREE.Vector3(0, 0, 0) };
    }

    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    // Compute AR target width to ensure 3D models are scaled proportionally relative to other assets in the same category (max 50% relative to AR target)
    const allObjects = useEditorStore.getState().objects;
    const targetObj = Object.values(allObjects).find(o => o.type === 'imageTarget');
    let arTargetWidth = 5.0; // standard default target width
    if (targetObj) {
      const rawW = targetObj.properties?.physicalWidth || 0.1;
      arTargetWidth = rawW <= 1 ? rawW * 50 : rawW;
    }

    // Architectural assets & 3D models occupy at most 50% of the AR target width, scaled proportionally by category factor
    const maxPlacementPercent = properties?.maxPlacementPercent ?? 50; // default 50% max relative to AR target
    const categoryFactor = properties?.categoryProportionFactor ?? 1.0;
    const TARGET_FRAME_SIZE = (arTargetWidth * (maxPlacementPercent / 100)) * categoryFactor;
    let factor = 1.0;
    if (maxDim > 0 && Number.isFinite(maxDim)) {
      factor = TARGET_FRAME_SIZE / maxDim;
    }

    // Offset center so the model's bottom center sits exactly at the pivot origin (0, 0, 0)
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    // In Z-up coordinate system, bbox.min.z is the base/bottom of the model
    const offset = new THREE.Vector3(-center.x, -center.y, -bbox.min.z);

    return { scaleFactor: factor, offsetVector: offset };
  }, [clonedScene]);

  // Compute effective animations: includes native glTF skeletal clips plus synthesized keyframe clips
  // for any configured, discovered, or event-driven animation clips (e.g. VisorOpen, HUDScan, Spin, Flex)
  const effectiveAnimations = React.useMemo(() => {
    const result = [...(animations || [])];
    const existingNames = new Set(result.map(a => a.name));

    const requestedNames = new Set<string>();
    if (properties?.activeAnimation) requestedNames.add(properties.activeAnimation);
    if (Array.isArray(properties?.discoveredAnimations)) {
      properties.discoveredAnimations.forEach((n: string) => requestedNames.add(n));
    }
    if (Array.isArray(properties?.animationClips)) {
      properties.animationClips.forEach((n: string) => requestedNames.add(n));
    }

    const currentObj = useEditorStore.getState().objects[id];
    if (currentObj?.events) {
      currentObj.events.forEach((ev: any) => {
        ev.actions?.forEach((act: any) => {
          if ((act.type === 'playAnimation' || act.type === 'playModelAnimation') && act.animationClipName) {
            requestedNames.add(act.animationClipName);
          }
        });
      });
    }

    requestedNames.forEach(clipName => {
      if (!existingNames.has(clipName) && clipName && typeof clipName === 'string') {
        const syntheticClip = createSyntheticAnimationClip(clipName, clonedScene);
        if (syntheticClip) {
          result.push(syntheticClip);
          existingNames.add(clipName);
        }
      }
    });

    return result;
  }, [animations, properties?.activeAnimation, properties?.discoveredAnimations, properties?.animationClips, clonedScene, id]);

  const { actions, names } = useAnimations(effectiveAnimations, group);

  const storeWireframe = useEditorStore(state => state.wireframeEnabled) || false;
  const selectedModelWireframeEnabled = useEditorStore(state => state.selectedModelWireframeEnabled) || false;
  const visualizationMode = useEditorStore(state => state.visualizationMode) || 'standard';
  const selectedObjectId = useEditorStore(state => state.selectedObjectId);
  const selectedObjectIds = useEditorStore(state => state.selectedObjectIds);
  const isSelected = selectedObjectId === id || selectedObjectIds.includes(id);
  const isSelectedWireframeActive = (selectedModelWireframeEnabled || visualizationMode === 'selectedWireframe') && isSelected;
  const wireframe = storeWireframe || (properties.wireframe ?? false) || isSelectedWireframeActive;
  const mobileMeshOptimizationEnabled = useEditorStore(state => state.mobileMeshOptimizationEnabled);
  const isMobileOptimized = properties?.mobileOptimized || mobileMeshOptimizationEnabled;

  // Auto-traverse mesh elements to enable real-time shadows, mobile performance optimizations, and wireframe
  useEffect(() => {
    clonedScene.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = properties.castShadow !== false;
        node.receiveShadow = properties.receiveShadow !== false;
        node.frustumCulled = true;

        if (isMobileOptimized) {
          // Mobile performance mesh optimization:
          // 1. Frustum culling ensures non-visible submeshes are not drawn
          node.frustumCulled = true;

          // 2. Vertex optimization: ensure clean normals are computed
          if (node.geometry && !node.geometry.attributes.normal) {
            node.geometry.computeVertexNormals();
          }

          // 3. Material & Texture optimization for mobile GPU:
          const optimizeMaterial = (mat: any) => {
            if (!mat) return;
            mat.wireframe = wireframe;
            mat.precision = 'mediump'; // mobile GPU power & memory efficiency
            if (mat.roughness !== undefined) {
              mat.roughness = Math.max(0.08, mat.roughness);
            }

            // Downscale texture anisotropy on mobile to prevent memory bandwidth chokes
            const texKeys = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap'];
            texKeys.forEach(k => {
              const tex = mat[k];
              if (tex && tex.isTexture) {
                tex.anisotropy = 1;
                tex.generateMipmaps = true;
                tex.minFilter = THREE.LinearMipmapLinearFilter;
              }
            });
          };

          if (Array.isArray(node.material)) {
            node.material.forEach(optimizeMaterial);
          } else if (node.material) {
            optimizeMaterial(node.material);
          }
        } else {
          if (node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach((mat: any) => {
                if (mat) mat.wireframe = wireframe;
              });
            } else {
              node.material.wireframe = wireframe;
            }
          }
        }
      }
    });
  }, [clonedScene, wireframe, isMobileOptimized, properties.castShadow, properties.receiveShadow]);

  // Discover and store model's keyframe clips, durations, and keyframe markers in state
  useEffect(() => {
    if (effectiveAnimations && effectiveAnimations.length > 0) {
      const animNames = effectiveAnimations.map(a => a.name || 'default');
      const durations: Record<string, number> = {};
      const keyframeMarkers: Record<string, number[]> = {};

      effectiveAnimations.forEach(a => {
        const clipName = a.name || 'default';
        const dur = Number(a.duration.toFixed(3));
        durations[clipName] = dur;

        // Collect all distinct keyframe timestamps from all tracks of the clip
        const timeSet = new Set<number>();
        timeSet.add(0);
        timeSet.add(dur);

        a.tracks.forEach(track => {
          if (track.times && track.times.length > 0) {
            for (let i = 0; i < track.times.length; i++) {
              timeSet.add(Number(track.times[i].toFixed(3)));
            }
          }
        });

        keyframeMarkers[clipName] = Array.from(timeSet).sort((x, y) => x - y);
      });

      const currentObj = useEditorStore.getState().objects[id];
      const currentAnims = currentObj?.properties?.discoveredAnimations;
      const currentDurations = currentObj?.properties?.animationClipDurations;
      const currentMarkers = currentObj?.properties?.animationKeyframeMarkers;

      if (
        !currentAnims ||
        JSON.stringify(currentAnims) !== JSON.stringify(animNames) ||
        JSON.stringify(currentDurations) !== JSON.stringify(durations) ||
        JSON.stringify(currentMarkers) !== JSON.stringify(keyframeMarkers)
      ) {
        useEditorStore.getState().updateObject(id, {
          properties: {
            ...useEditorStore.getState().objects[id]?.properties,
            discoveredAnimations: animNames,
            animationClipDurations: durations,
            animationKeyframeMarkers: keyframeMarkers,
            activeAnimation: currentObj?.properties?.activeAnimation || animNames[0]
          }
        });
      }
    } else {
      const currentObj = useEditorStore.getState().objects[id];
      if (currentObj?.properties?.discoveredAnimations && currentObj.properties.discoveredAnimations.length > 0) {
        useEditorStore.getState().updateObject(id, {
          properties: {
            ...currentObj.properties,
            discoveredAnimations: [],
            animationClipDurations: {},
            animationKeyframeMarkers: {}
          }
        });
      }
    }
  }, [effectiveAnimations, id]);

  // Discover and store model's unique material names in state
  useEffect(() => {
    const materialNames: string[] = [];
    clonedScene.traverse((node: any) => {
      if (node.isMesh && node.material) {
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach((mat: any) => {
          if (mat && mat.name && !materialNames.includes(mat.name)) {
            materialNames.push(mat.name);
          }
        });
      }
    });

    if (materialNames.length > 0) {
      const currentMats = useEditorStore.getState().objects[id]?.properties.discoveredMaterials;
      if (!currentMats || JSON.stringify(currentMats) !== JSON.stringify(materialNames)) {
        useEditorStore.getState().updateObject(id, {
          properties: {
            ...useEditorStore.getState().objects[id]?.properties,
            discoveredMaterials: materialNames
          }
        });
      }
    }
  }, [clonedScene, id]);

  // Apply material overrides dynamically
  const materialOverrides = properties.materialOverrides || {};

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    clonedScene.traverse((node: any) => {
      if (node.isMesh && node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        
        materials.forEach((mat: any, index: number) => {
          const matName = mat.name;
          if (!matName) return;

          const override = materialOverrides[matName];
          if (override) {
            // Clone the material if not already cloned to prevent polluting shared model cache
            let targetMat = mat;
            if (!targetMat.__isCloned) {
              targetMat = targetMat.clone();
              targetMat.__isCloned = true;
              if (Array.isArray(node.material)) {
                node.material[index] = targetMat;
              } else {
                node.material = targetMat;
              }
            }

            // Apply override properties
            if (override.color !== undefined) {
              targetMat.color.set(override.color);
            }
            if (override.roughness !== undefined) {
              targetMat.roughness = override.roughness;
            }
            if (override.metalness !== undefined) {
              targetMat.metalness = override.metalness;
            }
            if (override.opacity !== undefined) {
              targetMat.opacity = override.opacity;
              targetMat.transparent = override.opacity < 1;
            }
            if (override.emissiveColor !== undefined) {
              if (targetMat.emissive) {
                targetMat.emissive.set(override.emissiveColor);
              }
            }
            if (override.emissiveIntensity !== undefined) {
              targetMat.emissiveIntensity = override.emissiveIntensity;
            }

            // Load and apply texture maps
            if (override.textureUrl !== undefined) {
              if (override.textureUrl) {
                loader.load(override.textureUrl, (tex) => {
                  tex.colorSpace = THREE.SRGBColorSpace;
                  targetMat.map = tex;
                  targetMat.needsUpdate = true;
                });
              } else {
                targetMat.map = null;
                targetMat.needsUpdate = true;
              }
            }
            if (override.normalMapUrl !== undefined) {
              if (override.normalMapUrl) {
                loader.load(override.normalMapUrl, (tex) => {
                  targetMat.normalMap = tex;
                  targetMat.needsUpdate = true;
                });
              } else {
                targetMat.normalMap = null;
                targetMat.needsUpdate = true;
              }
            }
            if (override.roughnessMapUrl !== undefined) {
              if (override.roughnessMapUrl) {
                loader.load(override.roughnessMapUrl, (tex) => {
                  targetMat.roughnessMap = tex;
                  targetMat.needsUpdate = true;
                });
              } else {
                targetMat.roughnessMap = null;
                targetMat.needsUpdate = true;
              }
            }
            if (override.metalnessMapUrl !== undefined) {
              if (override.metalnessMapUrl) {
                loader.load(override.metalnessMapUrl, (tex) => {
                  targetMat.metalnessMap = tex;
                  targetMat.needsUpdate = true;
                });
              } else {
                targetMat.metalnessMap = null;
                targetMat.needsUpdate = true;
              }
            }
            if (override.displacementMapUrl !== undefined) {
              if (override.displacementMapUrl) {
                loader.load(override.displacementMapUrl, (tex) => {
                  targetMat.displacementMap = tex;
                  targetMat.needsUpdate = true;
                });
              } else {
                targetMat.displacementMap = null;
                targetMat.needsUpdate = true;
              }
            }

            targetMat.needsUpdate = true;
          }
        });
      }
    });
  }, [clonedScene, materialOverrides]);

  // Discover and store model's sub-object tree structure in state
  useEffect(() => {
    if (clonedScene) {
      const tree = buildSubObjectTree(clonedScene, '0');
      const currentSubObjs = useEditorStore.getState().objects[id]?.properties.discoveredSubObjects;
      if (!currentSubObjs || JSON.stringify(currentSubObjs) !== JSON.stringify(tree)) {
        useEditorStore.getState().updateObject(id, {
          properties: {
            ...useEditorStore.getState().objects[id]?.properties,
            discoveredSubObjects: tree
          }
        });
      }
    }
  }, [clonedScene, id]);

  // Apply sub-object overrides (visibility, position, rotation, scale)
  useEffect(() => {
    const overrides = properties.subObjectOverrides || {};
    
    // Helper to find node by index path
    const findNodeByIndexPath = (root: any, indexPath: string): any => {
      const indices = indexPath.split('-').map(Number);
      let current = root;
      for (let i = 1; i < indices.length; i++) {
        const idx = indices[i];
        if (!current.children || idx >= current.children.length) return null;
        current = current.children[idx];
      }
      return current;
    };

    // First back up original states and restore them
    clonedScene.traverse((node: any) => {
      if (node.isMesh || node.isGroup || node.type === 'Object3D') {
        if (node.userData.__originalVisible === undefined) {
          node.userData.__originalVisible = node.visible;
          node.userData.__originalPosition = node.position.clone();
          node.userData.__originalRotation = node.rotation.clone();
          node.userData.__originalScale = node.scale.clone();
        }

        // Restore original values
        node.visible = node.userData.__originalVisible;
        node.position.copy(node.userData.__originalPosition);
        node.rotation.copy(node.userData.__originalRotation);
        node.scale.copy(node.userData.__originalScale);
      }
    });

    // Now apply active overrides
    Object.keys(overrides).forEach((indexPath) => {
      const node = findNodeByIndexPath(clonedScene, indexPath);
      if (node) {
        const ovr = overrides[indexPath];
        if (ovr.visible !== undefined) {
          node.visible = ovr.visible;
        }
        if (ovr.position) {
          node.position.set(ovr.position[0], ovr.position[1], ovr.position[2]);
        }
        if (ovr.rotation) {
          node.rotation.set(
            THREE.MathUtils.degToRad(ovr.rotation[0]),
            THREE.MathUtils.degToRad(ovr.rotation[1]),
            THREE.MathUtils.degToRad(ovr.rotation[2])
          );
        }
        if (ovr.scale) {
          node.scale.set(ovr.scale[0], ovr.scale[1], ovr.scale[2]);
        }

        // Apply sub-mesh specific material overrides
        if (node.isMesh && node.material && ovr.material) {
          const materials = Array.isArray(node.material) ? node.material : [node.material];
          const mOvr = ovr.material;
          
          materials.forEach((mat: any, index: number) => {
            let targetMat = mat;
            if (!targetMat.__isSubCloned) {
              targetMat = targetMat.clone();
              targetMat.__isSubCloned = true;
              if (Array.isArray(node.material)) {
                node.material[index] = targetMat;
              } else {
                node.material = targetMat;
              }
            }
            
            if (mOvr.color !== undefined) {
              targetMat.color.set(mOvr.color);
            }
            if (mOvr.roughness !== undefined) {
              targetMat.roughness = mOvr.roughness;
            }
            if (mOvr.metalness !== undefined) {
              targetMat.metalness = mOvr.metalness;
            }
            if (mOvr.opacity !== undefined) {
              targetMat.opacity = mOvr.opacity;
              targetMat.transparent = mOvr.opacity < 1;
            }
            if (mOvr.emissiveColor !== undefined && targetMat.emissive) {
              targetMat.emissive.set(mOvr.emissiveColor);
            }
            if (mOvr.emissiveIntensity !== undefined && targetMat.emissiveIntensity !== undefined) {
              targetMat.emissiveIntensity = mOvr.emissiveIntensity;
            }
            if (mOvr.wireframe !== undefined) {
              targetMat.wireframe = mOvr.wireframe;
            }
            targetMat.needsUpdate = true;
          });
        }
      }
    });
  }, [clonedScene, properties.subObjectOverrides]);

  const isPreviewMode = useEditorStore(state => state.isPreviewMode);
  const selectObject = useEditorStore(state => state.selectObject);
  const liveInteractionsInDesign = useEditorStore(state => state.liveInteractionsInDesign);
  const activeAnimation = properties.activeAnimation || (names && names[0]) || '';
  const animationPlaying = properties.animationPlaying === true;
  const actualAnimationPlaying = isPreviewMode
    ? (properties.autoplayAnimation === true && animationPlaying)
    : animationPlaying;
  const animationSpeed = properties.animationSpeed ?? 1.0;
  const loopAnimation = properties.loopAnimation !== false;
  const fadeDuration = typeof properties.fadeDuration === 'number' 
    ? properties.fadeDuration 
    : (typeof properties.animationFadeDuration === 'number' ? properties.animationFadeDuration : 0.3);

  const isScrubbing = properties.isScrubbing === true;
  const targetTime = typeof properties.animationTime === 'number' ? properties.animationTime : undefined;

  const prevActiveAnimRef = useRef<string>('');

  useEffect(() => {
    if (!actions) return;
    
    const action = actions[activeAnimation] || Object.values(actions)[0];
    if (action) {
      if (prevActiveAnimRef.current !== activeAnimation) {
        const prevAnimName = prevActiveAnimRef.current;
        const prevAction = prevAnimName ? actions[prevAnimName] : null;

        if (prevAction && prevAction !== action && fadeDuration > 0) {
          // Smooth cross-fading between animation clips using configured fade duration
          action.reset();
          action.setEffectiveTimeScale(animationSpeed);
          action.setEffectiveWeight(1);
          if (loopAnimation) {
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.clampWhenFinished = false;
          } else {
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
          }
          action.play();
          prevAction.crossFadeTo(action, fadeDuration, true);
        } else {
          // Instant switch or no previous action
          Object.values(actions).forEach(a => {
            if (a && a !== action) a?.stop();
          });
          action.reset();
        }
        prevActiveAnimRef.current = activeAnimation;
      }

      action.setEffectiveTimeScale(animationSpeed);
      
      if (loopAnimation) {
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
      } else {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }

      if (actualAnimationPlaying && !isScrubbing) {
        action.play();
        action.paused = false;
      } else {
        action.play();
        action.paused = true;
      }
    }
  }, [actions, activeAnimation, actualAnimationPlaying, animationSpeed, loopAnimation, isScrubbing, fadeDuration]);

  // Listen to Three.js AnimationMixer finished & loop events for onAnimationComplete triggers
  useEffect(() => {
    if (!actions) return;
    const currentAction = actions[activeAnimation] || Object.values(actions)[0];
    if (!currentAction) return;

    const mixer = currentAction.getMixer();
    const handleFinished = () => {
      // Dispatch hardware mixer event for animation controller and listeners
      window.dispatchEvent(
        new CustomEvent('ar-mixer-animation-finished', {
          detail: { modelId: id, clipName: activeAnimation },
        })
      );

      const obj = useEditorStore.getState().objects[id];
      if (obj) {
        // If an animation is not in loop, reset and go back to play button
        if (obj.properties?.loopAnimation === false) {
          currentAction.reset();
          currentAction.paused = true;
          useEditorStore.getState().updateObject(id, {
            properties: {
              ...obj.properties,
              animationPlaying: false,
              animationTime: 0,
              isScrubbing: false,
            }
          });
        }

        if (obj.events) {
          obj.events.forEach((ev: any) => {
            if (ev.trigger === 'onAnimationComplete' || ev.trigger === 'onMediaEnd') {
              window.dispatchEvent(new CustomEvent('ar-trigger-event', { detail: { event: ev, targetId: id } }));
            }
          });
        }
      }
    };

    const handleLoop = () => {
      window.dispatchEvent(
        new CustomEvent('ar-mixer-animation-loop', {
          detail: { modelId: id, clipName: activeAnimation },
        })
      );
    };

    mixer.addEventListener('finished', handleFinished);
    mixer.addEventListener('loop', handleLoop);
    return () => {
      mixer.removeEventListener('finished', handleFinished);
      mixer.removeEventListener('loop', handleLoop);
    };
  }, [actions, activeAnimation, id]);

  // Diagnostic tool listener for AnimationMixer state inspection and console debugging
  useEffect(() => {
    const handleDiagnosticRequest = (e: any) => {
      if (e.detail?.modelId && e.detail.modelId !== id) return;
      if (!actions) return;

      const currentAction = actions[activeAnimation] || Object.values(actions)[0];
      const mixer = currentAction?.getMixer();
      const obj = useEditorStore.getState().objects[id];

      const activeClip = currentAction?.getClip();
      const trackList = activeClip?.tracks || [];

      const diagnosticReport = {
        modelId: id,
        modelName: obj?.name || '3D Model',
        url,
        isBillboard,
        rootOrientation: clonedScene?.userData?.__zUpOrientation || 'z-up',
        mixerState: mixer
          ? {
              time: Number(mixer.time.toFixed(3)),
              timeScale: mixer.timeScale,
              rootNodeType: (mixer.getRoot() as any)?.type,
              rootNodeName: (mixer.getRoot() as any)?.name,
            }
          : null,
        activeTrack: activeAnimation,
        actionState: currentAction
          ? {
              time: Number(currentAction.time.toFixed(3)),
              duration: activeClip ? Number(activeClip.duration.toFixed(3)) : 0,
              paused: currentAction.paused,
              enabled: currentAction.enabled,
              weight: currentAction.getEffectiveWeight(),
              timeScale: currentAction.getEffectiveTimeScale(),
              loopMode: currentAction.loop === THREE.LoopRepeat ? 'THREE.LoopRepeat' : 'THREE.LoopOnce',
            }
          : null,
        totalClips: effectiveAnimations ? effectiveAnimations.length : 0,
        clips: (effectiveAnimations || []).map((a) => ({
          name: a.name,
          duration: Number(a.duration.toFixed(3)),
          tracksCount: a.tracks.length,
        })),
        activeClipTracksCount: trackList.length,
        tracksSample: trackList.slice(0, 50).map((t) => ({
          name: t.name,
          type: t.ValueTypeName,
          keyframes: t.times.length,
          firstKeyTime: `${t.times[0]?.toFixed(3) ?? 0}s`,
          lastKeyTime: `${t.times[t.times.length - 1]?.toFixed(3) ?? 0}s`,
        })),
        eventsRegistered: (obj?.events || []).map((ev: any) => ({
          name: ev.name,
          trigger: ev.trigger,
          actionsCount: ev.actions?.length || 0,
        })),
      };

      // Output rich formatted diagnostics directly to the developer console
      console.group(
        `%c🔍 [ARForge AnimationMixer Diagnostic] Model: "${diagnosticReport.modelName}" (#${id})`,
        'background: #0891b2; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 11px;'
      );
      console.log('📌 Model Info:', {
        name: diagnosticReport.modelName,
        id: diagnosticReport.modelId,
        url: diagnosticReport.url,
        isBillboard: diagnosticReport.isBillboard,
        orientation: diagnosticReport.rootOrientation,
      });
      console.log('🎛️ AnimationMixer State:', diagnosticReport.mixerState);
      console.log('▶️ Active Action State:', diagnosticReport.actionState);

      console.groupCollapsed(`🎞️ Available Animation Clips (${diagnosticReport.totalClips})`);
      console.table(diagnosticReport.clips);
      console.groupEnd();

      if (diagnosticReport.tracksSample.length > 0) {
        console.groupCollapsed(`🎼 Keyframe Tracks in "${activeAnimation}" (${diagnosticReport.activeClipTracksCount} tracks)`);
        console.table(diagnosticReport.tracksSample);
        console.groupEnd();
      }

      console.groupCollapsed(`⚡ Attached ARForge Events (${diagnosticReport.eventsRegistered.length})`);
      console.table(diagnosticReport.eventsRegistered);
      console.groupEnd();

      // Diagnostic Sanity Verifications
      if (!currentAction) {
        console.warn('⚠️ Diagnostic Notice: No active AnimationAction found in mixer for clip:', activeAnimation);
      } else if (currentAction.paused && properties?.animationPlaying !== false) {
        console.warn('⚠️ Diagnostic Notice: Action is paused while animationPlaying is active.');
      } else if (currentAction.getEffectiveWeight() === 0) {
        console.warn('⚠️ Diagnostic Warning: Action weight is 0; tracks will not produce visible transform updates.');
      } else {
        console.log('✅ Diagnostic Status: AnimationMixer is healthy and actively evaluating keyframe tracks.');
      }
      console.groupEnd();

      // Dispatch response for UI panel display
      window.dispatchEvent(
        new CustomEvent('response-animation-diagnostics', {
          detail: diagnosticReport,
        })
      );
    };

    window.addEventListener('request-animation-diagnostics', handleDiagnosticRequest);
    return () => {
      window.removeEventListener('request-animation-diagnostics', handleDiagnosticRequest);
    };
  }, [actions, activeAnimation, effectiveAnimations, clonedScene, id, isBillboard, properties, url]);

  // Real-time animation scrubber & timeline playback synchronizer
  const lastSyncTimeRef = useRef<number>(0);

  useFrame((state) => {
    if (!actions) return;
    const currentAction = actions[activeAnimation] || Object.values(actions)[0];
    if (!currentAction) return;

    const clipDuration = currentAction.getClip()?.duration || 1.0;

    if (isScrubbing && targetTime !== undefined) {
      currentAction.paused = true;
      currentAction.time = Math.max(0, Math.min(targetTime, clipDuration));
      currentAction.getMixer().update(0);
    } else if (!actualAnimationPlaying) {
      currentAction.paused = true;
      if (targetTime !== undefined && Math.abs(currentAction.time - targetTime) > 0.02) {
        currentAction.time = Math.max(0, Math.min(targetTime, clipDuration));
        currentAction.getMixer().update(0);
      }
    } else if (actualAnimationPlaying) {
      // If animation is not in loop and has finished, reset to 0 and revert to play button
      if (!loopAnimation && currentAction.time >= clipDuration) {
        currentAction.reset();
        currentAction.paused = true;
        useEditorStore.getState().updateObject(id, {
          properties: {
            ...useEditorStore.getState().objects[id]?.properties,
            animationPlaying: false,
            animationTime: 0,
            isScrubbing: false,
          }
        });
        return;
      }

      currentAction.paused = false;
    }
  });

  const handleSubMeshClick = (e: any) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      selectObject(id);
      if (e.object && clonedScene) {
        const path = findIndexPathForObject(clonedScene, e.object);
        if (path) {
          useEditorStore.getState().updateObject(id, {
            properties: {
              ...useEditorStore.getState().objects[id]?.properties,
              selectedSubObjectPath: path
            }
          });
        }
      }
    }
  };

  return (
    <group scale={[scaleFactor, scaleFactor, scaleFactor]}>
      <primitive 
        ref={group} 
        object={clonedScene} 
        position={[offsetVector.x, offsetVector.y, offsetVector.z]} 
        onClick={handleSubMeshClick}
      />
    </group>
  );
}

function ModelLoadingFallback() {
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef1.current) {
      meshRef1.current.rotation.y = t * 1.5;
      meshRef1.current.rotation.x = t * 0.7;
    }
    if (meshRef2.current) {
      meshRef2.current.rotation.y = -t * 1.2;
      meshRef2.current.rotation.z = t * 0.9;
    }
  });

  return (
    <group>
      {/* Outer spinning icosahedron wireframe */}
      <mesh ref={meshRef1}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
      </mesh>
      
      {/* Inner spinning octahedron wireframe */}
      <mesh ref={meshRef2}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.6} />
      </mesh>

      {/* Floating loading HUD */}
      <Html center distanceFactor={1.5} zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center gap-2 p-3 bg-neutral-950/90 border border-blue-500/30 backdrop-blur-md rounded-xl shadow-2xl text-white font-sans w-36 select-none pointer-events-none">
          <div className="relative flex items-center justify-center w-7 h-7">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-pulse"></div>
            <RefreshCw size={12} className="text-blue-400 animate-spin" />
          </div>
          <span className="text-[9px] font-semibold tracking-wider text-neutral-300 uppercase font-mono animate-pulse">
            Loading Model
          </span>
        </div>
      </Html>
    </group>
  );
}

function ImageTargetLoadingFallback({ obj }: { obj: SceneObject }) {
  const scanRef = useRef<THREE.Mesh>(null);
  const width = (obj.properties.physicalWidth || 1) * 50;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (scanRef.current) {
      scanRef.current.position.y = Math.sin(t * 3) * (width / 2);
    }
  });

  return (
    <group>
      {/* Plane outline boundary */}
      <mesh>
        <planeGeometry args={[width, width]} />
        <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Scanning line laser mesh */}
      <mesh ref={scanRef} position={[0, 0, 0.005]}>
        <planeGeometry args={[width, width * 0.03]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Overlay status label */}
      <Html center distanceFactor={2.0} zIndexRange={[100, 0]}>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950/90 border border-indigo-500/30 backdrop-blur-md rounded-lg shadow-xl text-white font-sans w-40 select-none pointer-events-none justify-center">
          <RefreshCw size={11} className="text-indigo-400 animate-spin flex-shrink-0" />
          <span className="text-[9px] font-semibold tracking-wider text-neutral-300 uppercase font-mono animate-pulse truncate">
            Loading Target
          </span>
        </div>
      </Html>
    </group>
  );
}

function RobbieFaceMesh3D({
  textureUrl,
  color = '#c084fc',
  opacity = 0.88,
  wireframe = false,
}: {
  textureUrl?: string;
  color?: string;
  opacity?: number;
  wireframe?: boolean;
}) {
  const obj = useLoader(
    OBJLoader,
    'https://cdn.jsdelivr.net/gh/RobbieConceptuel/Spark-AR-Face-Assets@main/Mesh/faceMesh.obj'
  );
  const faceTexture = useSafeTexture(textureUrl || '');

  const clonedObj = React.useMemo(() => {
    if (!obj) return null;
    const clone = obj.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (textureUrl && faceTexture) {
          mesh.material = new THREE.MeshBasicMaterial({
            map: faceTexture,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide,
          });
        } else {
          mesh.material = new THREE.MeshStandardMaterial({
            color: color,
            wireframe: wireframe,
            transparent: true,
            opacity: opacity,
            roughness: 0.3,
            metalness: 0.3,
            side: THREE.DoubleSide,
          });
        }
      }
    });
    return clone;
  }, [obj, faceTexture, textureUrl, color, opacity, wireframe]);

  if (!clonedObj) return null;
  return <primitive object={clonedObj} scale={[1, 1, 1]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} />;
}

function RobbieHeadOccluder3D({ opacity = 0.35 }: { opacity?: number }) {
  const obj = useLoader(
    OBJLoader,
    'https://cdn.jsdelivr.net/gh/RobbieConceptuel/Spark-AR-Face-Assets@main/Mesh/headOccluder.obj'
  );

  const clonedObj = React.useMemo(() => {
    if (!obj) return null;
    const clone = obj.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshBasicMaterial({
          color: '#3b82f6',
          wireframe: true,
          transparent: true,
          opacity: opacity,
        });
      }
    });
    return clone;
  }, [obj, opacity]);

  if (!clonedObj) return null;
  return <primitive object={clonedObj} scale={[1, 1, 1]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} />;
}

function FaceMeshFallback() {
  return null;
}

function FaceTarget3DRenderer({ obj }: { obj: SceneObject }) {
  const settings = useEditorStore(state => state.settings);
  const updateSettings = useEditorStore(state => state.updateSettings);
  const addToast = useEditorStore(state => state.addToast);
  const isPreviewMode = useEditorStore(state => state.isPreviewMode);
  const selectObject = useEditorStore(state => state.selectObject);
  const openAssetBrowser = useEditorStore(state => state.openAssetBrowser);

  const currentAnchor = settings.faceAnchor || 'head';
  const [hoveredAnchor, setHoveredAnchor] = useState<string | null>(null);

  const anchorPositions: Record<string, { pos: [number, number, number]; label: string; icon: string }> = {
    head: { pos: [0, 0, 0], label: 'Center Head', icon: '👤' },
    forehead: { pos: [0, 0.05, 0.08], label: 'Forehead / Crown', icon: '👑' },
    nose: { pos: [0, 0.08, 0.0], label: 'Nose Bridge', icon: '👃' },
    leftEye: { pos: [-0.035, 0.06, 0.03], label: 'Left Eye Orbit', icon: '👁️' },
    rightEye: { pos: [0.035, 0.06, 0.03], label: 'Right Eye Orbit', icon: '👁️' },
    mouth: { pos: [0, 0.07, -0.05], label: 'Lips / Mouth', icon: '👄' },
    chin: { pos: [0, 0.04, -0.09], label: 'Chin / Jawline', icon: '🗿' }
  };

  const activePos = anchorPositions[currentAnchor]?.pos || anchorPositions.head.pos;

  const handleSelectAnchor = (anchor: string, e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    updateSettings({ faceAnchor: anchor as any });
    addToast(`Selected Face Anchor: ${anchorPositions[anchor]?.label || anchor.toUpperCase()}`);
  };

  const meshType = settings.faceMeshType || 'sparkar';
  let textureUrl = settings.faceMeshTextureUrl || '';
  if (!textureUrl) {
    if (meshType === 'sparkar' || meshType === 'robbieTemplate') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/RobbieConceptuel/Spark-AR-Face-Assets@main/Textures/faceMesh.png';
    } else if (meshType === 'robbieFeminine') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/RobbieConceptuel/Spark-AR-Face-Assets@main/Textures/faceFeminine.jpg';
    } else if (meshType === 'robbieMasculine') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/RobbieConceptuel/Spark-AR-Face-Assets@main/Textures/faceMasculine.jpg';
    } else if (meshType === 'trackingMap' || meshType === 'robbieTrackingMap') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/RobbieConceptuel/Spark-AR-Face-Assets@main/Textures/faceMeshTrackers.png';
    } else if (meshType === 'robbieMask') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/RobbieConceptuel/Spark-AR-Face-Assets@main/Textures/faceMeshMask.png';
    } else if (meshType === 'robbieMaskA') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/RobbieConceptuel/Spark-AR-Face-Assets@main/Textures/faceMeshMaskA.jpg';
    } else if (meshType === 'robbieMaskB') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/RobbieConceptuel/Spark-AR-Face-Assets@main/Textures/faceMeshMaskB.jpg';
    }
  }

  const occluderType = settings.faceOccluderType || 'sparkarRealistic';
  const hasOccluder = settings.showFaceOccluder !== false && occluderType !== 'none';

  return (
    <group>
      {/* 3D Anatomical SparkAR Face Mesh & Head Occluder Models */}
      <Suspense fallback={<FaceMeshFallback />}>
        {settings.showFaceMesh !== false && (
          <RobbieFaceMesh3D
            textureUrl={textureUrl}
            wireframe={meshType === 'wireframe' || meshType === 'robbieStaticMesh'}
          />
        )}
        {hasOccluder && (
          <RobbieHeadOccluder3D />
        )}
      </Suspense>

      {/* Interactive 3D Landmark Nodes (Clickable directly on the 3D Face Model) */}
      {Object.entries(anchorPositions).map(([key, { pos }]) => {
        const isActive = currentAnchor === key;
        const isHovered = hoveredAnchor === key;

        return (
          <group key={key} position={pos}>
            <mesh
              onClick={(e) => handleSelectAnchor(key, e)}
              onPointerOver={(e) => { e.stopPropagation(); setHoveredAnchor(key); }}
              onPointerOut={() => setHoveredAnchor(null)}
            >
              <sphereGeometry args={[isActive ? 0.012 : (isHovered ? 0.01 : 0.007), 16, 16]} />
              <meshBasicMaterial
                color={isActive ? "#22d3ee" : (isHovered ? "#f59e0b" : "#c084fc")}
              />
            </mesh>

            {/* Active / Hover Ring Halo */}
            {(isActive || isHovered) && (
              <mesh>
                <ringGeometry args={[0.015, 0.02, 32]} />
                <meshBasicMaterial
                  color={isActive ? "#06b6d4" : "#f59e0b"}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0.85}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Active Anchor Reticle Highlight Pointer */}
      <group position={activePos}>
        <mesh>
          <sphereGeometry args={[0.01, 16, 16]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
        <mesh>
          <ringGeometry args={[0.018, 0.025, 32]} />
          <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      </group>

      {/* Floating Pictarize Face Studio HUD Panel */}
      {!isPreviewMode && (
        <Html position={[0, 0.12, 0.18]} center distanceFactor={6} pointerEvents="auto">
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-purple-500/40 shadow-2xl text-white select-none transition-all">
            <div className="flex items-center gap-2 border-b border-white/10 pb-1 w-full justify-between px-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Pictarize Face Anchor
              </span>
              <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                {currentAnchor.toUpperCase()}
              </span>
            </div>

            {/* Active Robbie Asset Config Info */}
            <div className="text-[8px] text-gray-400 font-mono flex flex-col gap-0.5 bg-purple-950/40 border border-purple-500/20 rounded-lg p-1 w-full select-none text-center">
              <div>
                <span className="text-purple-300 font-semibold">Mesh:</span>{' '}
                <span className="text-white">
                  {meshType === 'sparkar' ? 'Robbie Canonical UV' : 
                   meshType === 'robbieFeminine' ? 'Robbie Feminine Guide' :
                   meshType === 'robbieMasculine' ? 'Robbie Masculine Guide' :
                   meshType === 'robbieTrackingMap' ? 'Robbie Tracking Map' :
                   meshType === 'robbieStaticMesh' ? 'Robbie 3D Face OBJ' :
                   meshType === 'wireframe' ? 'Cyber Topology Grid' : 'Simple Mesh'}
                </span>
              </div>
              <div>
                <span className="text-purple-300 font-semibold">Occluder:</span>{' '}
                <span className="text-white">
                  {occluderType === 'robbieRealistic' ? 'Robbie OBJ Occluder' :
                   occluderType === 'sparkarRealistic' ? 'SparkAR GLTF' :
                   occluderType === 'default' ? 'Standard MindAR' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Quick Landmark Anchor Selector Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1 max-w-[220px]">
              {Object.entries(anchorPositions).map(([key, { label, icon }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => handleSelectAnchor(key, e)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    currentAnchor === key
                      ? 'bg-cyan-500 text-black font-bold shadow-sm shadow-cyan-500/50 scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
                  }`}
                  title={`Select ${label}`}
                >
                  <span>{icon}</span>
                  <span className="capitalize">{key}</span>
                </button>
              ))}
            </div>

            {/* Attach Asset Quick Action */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                selectObject(obj.id);
                openAssetBrowser();
              }}
              className="mt-0.5 w-full py-1 px-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-[10px] font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles size={11} className="text-amber-300" />
              <span>Attach Asset to {currentAnchor.toUpperCase()}</span>
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}

function SurfaceTarget3DRenderer({ obj }: { obj: SceneObject }) {
  const settings = useEditorStore(state => state.settings);
  const selectObject = useEditorStore(state => state.selectObject);
  const isPreviewMode = useEditorStore(state => state.isPreviewMode);

  const orientation = obj.properties?.surfaceOrientation || settings.surfaceOrientation || 'horizontal';
  const gridSize = obj.properties?.surfaceGridSize || settings.surfaceGridSize || 2;
  const showGrid = obj.properties?.showGrid ?? settings.surfaceShowGrid ?? true;
  const receiveShadows = obj.properties?.receiveShadows ?? true;
  const reticleStyle = obj.properties?.reticleStyle || settings.surfaceReticleStyle || 'modern_ring';

  return (
    <group 
      position={obj.position} 
      rotation={obj.rotation} 
      scale={obj.scale}
      onClick={(e) => {
        if (!isPreviewMode) {
          e.stopPropagation();
          selectObject(obj.id);
        }
      }}
    >
      {/* 1. Shadow Receiver Plane on physical surface */}
      <mesh 
        position={[0, 0, -0.001]} 
        rotation={orientation === 'vertical' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
        receiveShadow={receiveShadows}
      >
        <planeGeometry args={[gridSize * 3, gridSize * 3]} />
        <shadowMaterial opacity={0.4} depthWrite={true} />
      </mesh>

      {/* 2. Physical Surface Depth Occluder Plane (Occludes geometry below ground/wall plane) */}
      <mesh 
        position={[0, 0, -0.005]} 
        rotation={orientation === 'vertical' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
        renderOrder={-1}
      >
        <planeGeometry args={[gridSize * 5, gridSize * 5]} />
        <meshBasicMaterial colorWrite={false} depthWrite={true} transparent={true} opacity={0} />
      </mesh>

      {/* 3. Surface Calibrated Metric Grid */}
      {showGrid && !isPreviewMode && (
        <group rotation={orientation === 'vertical' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
          <gridHelper 
            args={[gridSize, 10, '#10b981', '#047857']} 
            rotation={[Math.PI / 2, 0, 0]} 
            position={[0, 0, 0]}
          />
        </group>
      )}

      {/* 4. Reticle Cursor Indicator */}
      {!isPreviewMode && (
        <group position={[0, 0, 0.002]} rotation={orientation === 'vertical' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
          {reticleStyle === 'cyber_brackets' ? (
            <mesh>
              <ringGeometry args={[0.2, 0.25, 4]} />
              <meshBasicMaterial color="#10b981" wireframe />
            </mesh>
          ) : reticleStyle === 'minimal_dot' ? (
            <mesh>
              <circleGeometry args={[0.08, 16]} />
              <meshBasicMaterial color="#10b981" transparent opacity={0.8} />
            </mesh>
          ) : (
            <group>
              <mesh>
                <ringGeometry args={[0.22, 0.25, 32]} />
                <meshBasicMaterial color="#10b981" transparent opacity={0.85} />
              </mesh>
              <mesh>
                <circleGeometry args={[0.03, 16]} />
                <meshBasicMaterial color="#34d399" />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* 5. Render Child 3D Entities */}
      {obj.children.map(childId => (
        <MemoizedObjectRenderer key={childId} id={childId} />
      ))}
    </group>
  );
}

function WorldTarget3DRenderer({ obj }: { obj: SceneObject }) {
  return (
    <group 
      position={obj.position} 
      rotation={[THREE.MathUtils.degToRad(obj.rotation[0]), THREE.MathUtils.degToRad(obj.rotation[1]), THREE.MathUtils.degToRad(obj.rotation[2])]} 
      scale={obj.scale}
    >
      {/* 6DOF Spatial World Anchor Grid & Compass */}
      <group position={[0, 0, -0.01]}>
        <gridHelper args={[4, 16, '#06b6d4', '#1e293b']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} />
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[0.3, 0.32, 32]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        <Html position={[0, 0, 0.25]} center>
          <div className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold font-mono tracking-wider backdrop-blur-md select-none pointer-events-none flex items-center gap-1 shadow-md">
            <span>🌐 World Spatial Anchor</span>
          </div>
        </Html>
      </group>

      {/* Render Child 3D Entities */}
      {obj.children.map(childId => (
        <MemoizedObjectRenderer key={childId} id={childId} />
      ))}
    </group>
  );
}

function ImageTargetRenderer({ obj }: { obj: SceneObject }) {
  const trackingMode = useEditorStore(state => state.settings.trackingMode);
  if (!obj || !obj.properties) return null;
  const isFace = obj.properties?.targetType === 'face' || (trackingMode === 'face' && obj.properties?.targetType !== 'image');
  const isSurface = obj.properties?.targetType === 'surface' || (trackingMode === 'surface' && obj.properties?.targetType !== 'face' && obj.properties?.targetType !== 'image');
  const isWorld = obj.properties?.targetType === 'world' || (trackingMode === 'world' && obj.properties?.targetType !== 'face' && obj.properties?.targetType !== 'image' && obj.properties?.targetType !== 'surface');

  if (isFace) {
    return <FaceTarget3DRenderer obj={obj} />;
  }

  if (isSurface) {
    return <SurfaceTarget3DRenderer obj={obj} />;
  }

  if (isWorld) {
    return <WorldTarget3DRenderer obj={obj} />;
  }

  const textureUrl = obj.properties.textureUrl || DEFAULT_ART_POSTER_TEXTURE;

  return <ImageTargetWithTexture obj={{ ...obj, properties: { ...obj.properties, textureUrl } }} />;
}

function createFallbackCanvasTexture(title: string = 'AR Target') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.5, '#312e81');
    grad.addColorStop(1, '#4338ca');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }

    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 12;
    ctx.strokeRect(12, 12, 488, 488);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ART POSTER', 256, 220);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#a5b4fc';
    ctx.fillText(title, 256, 270);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function useSafeTexture(url?: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    setTexture(null);
    const targetUrl = url || DEFAULT_ART_POSTER_TEXTURE;

    const loader = new THREE.TextureLoader();
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      loader.crossOrigin = 'anonymous';
    }

    loader.load(
      targetUrl,
      (tex) => {
        if (!active) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.mapping = THREE.UVMapping;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.warn('Failed to load target texture via TextureLoader, using fallback:', targetUrl, err);
        if (active) {
          setTexture(createFallbackCanvasTexture());
        }
      }
    );

    return () => {
      active = false;
    };
  }, [url]);

  return texture;
}

function ImageTargetWithTexture({ obj }: { obj: SceneObject }) {
  const texture = useSafeTexture(obj.properties?.textureUrl);
  const rawWidth = obj.properties?.physicalWidth || 0.1;
  const width = rawWidth <= 1 ? rawWidth * 50 : rawWidth;
  const img = texture?.image as HTMLImageElement | HTMLCanvasElement | undefined;
  const height = img && img.width ? width * (img.height / img.width) : width * 1.25;
  const wireframe = useEditorStore(state => state.wireframeEnabled) || false;

  return (
    <group>
      <mesh>
        <planeGeometry args={[width, height]} />
        {texture ? (
          <meshBasicMaterial key={texture.uuid} map={texture} transparent opacity={0.95} side={THREE.DoubleSide} wireframe={wireframe} />
        ) : (
          <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.5} side={THREE.DoubleSide} />
        )}
      </mesh>

      {/* Target Outline Accent Frame */}
      <mesh position={[0, 0, 0.005]}>
        <ringGeometry args={[Math.min(width, height) * 0.48, Math.min(width, height) * 0.5, 32]} />
        <meshBasicMaterial color="#6366f1" side={THREE.DoubleSide} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Textured material rendering for primitives - Upgraded to supports custom physical parameters and multiple maps
function TexturedMaterial({ properties, defaultColor, objectId }: { properties: any; defaultColor: string; objectId?: string }) {
  const color = properties.color || defaultColor;
  const storeWireframe = useEditorStore(state => state.wireframeEnabled) || false;
  const selectedModelWireframeEnabled = useEditorStore(state => state.selectedModelWireframeEnabled) || false;
  const visualizationMode = useEditorStore(state => state.visualizationMode) || 'standard';
  const selectedObjectId = useEditorStore(state => state.selectedObjectId);
  const selectedObjectIds = useEditorStore(state => state.selectedObjectIds);
  const isSelected = objectId ? (selectedObjectId === objectId || selectedObjectIds.includes(objectId)) : false;
  const isSelectedWireframeActive = (selectedModelWireframeEnabled || visualizationMode === 'selectedWireframe') && isSelected;
  const wireframe = storeWireframe || (properties.wireframe ?? false) || isSelectedWireframeActive;
  const opacity = properties.opacity ?? 1;
  const doubleSided = properties.doubleSided ?? false;
  
  // Basic properties
  const roughness = properties.roughness ?? 0.5;
  const metalness = properties.metalness ?? 0.1;
  
  // Emissive properties
  const emissiveColor = properties.emissiveColor || '#000000';
  const emissiveIntensity = properties.emissiveIntensity ?? 0;
  
  // Advanced clearcoat / transmission / Spline 3D physical features
  const clearcoat = properties.clearcoat ?? 0;
  const clearcoatRoughness = properties.clearcoatRoughness ?? 0.1;
  const transmission = properties.transmission ?? 0;
  const thickness = properties.thickness ?? 0;
  const ior = properties.ior ?? 1.5;
  const flatShading = properties.flatShading ?? false;
  const iridescence = properties.iridescence ?? 0;
  const iridescenceIOR = properties.iridescenceIOR ?? 1.3;
  const iridescenceThicknessRange = properties.iridescenceThicknessRange || [100, 400];
  const sheen = properties.sheen ?? 0;
  const sheenColor = properties.sheenColor || '#ffffff';
  const sheenRoughness = properties.sheenRoughness ?? 0.5;
  const attenuationColor = properties.attenuationColor;
  const attenuationDistance = properties.attenuationDistance;

  // Map URLs
  const textureUrl = properties.textureUrl;
  const normalMapUrl = properties.normalMapUrl;
  const roughnessMapUrl = properties.roughnessMapUrl;
  const metalnessMapUrl = properties.metalnessMapUrl;
  const displacementMapUrl = properties.displacementMapUrl;
  const displacementScale = properties.displacementScale ?? 0.05;
  const normalScale = properties.normalScale ?? 1;

  // Repeat and alignment values
  const repeatX = properties.textureRepeatX ?? 1;
  const repeatY = properties.textureRepeatY ?? 1;
  const centerTexture = properties.centerTexture ?? true;
  const hideOverlap = properties.hideOverlap ?? false;
  const alphaCutoff = properties.alphaCutoff ?? 0.5;
  const textureOffsetX = properties.textureOffsetX ?? 0;
  const textureOffsetY = properties.textureOffsetY ?? 0;
  const textureRotation = properties.textureRotation ?? 0;

  return (
    <ErrorBoundary fallback={
      <meshStandardMaterial 
        color={color} 
        roughness={roughness} 
        metalness={metalness} 
        wireframe={wireframe} 
        transparent={opacity < 1 || hideOverlap} 
        opacity={opacity} 
        alphaTest={hideOverlap ? alphaCutoff : 0}
        side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
      />
    }>
      <Suspense fallback={
        <meshStandardMaterial 
          color={color} 
          roughness={roughness} 
          metalness={metalness} 
          wireframe={wireframe} 
          transparent={opacity < 1 || hideOverlap} 
          opacity={opacity} 
          alphaTest={hideOverlap ? alphaCutoff : 0}
          side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
        />
      }>
        <PhysicalMaterialLoader 
          color={color}
          opacity={opacity}
          doubleSided={doubleSided}
          roughness={roughness}
          metalness={metalness}
          emissiveColor={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          clearcoat={clearcoat}
          clearcoatRoughness={clearcoatRoughness}
          transmission={transmission}
          thickness={thickness}
          ior={ior}
          iridescence={iridescence}
          iridescenceIOR={iridescenceIOR}
          iridescenceThicknessRange={iridescenceThicknessRange}
          sheen={sheen}
          sheenColor={sheenColor}
          sheenRoughness={sheenRoughness}
          attenuationColor={attenuationColor}
          attenuationDistance={attenuationDistance}
          flatShading={flatShading}
          textureUrl={textureUrl}
          normalMapUrl={normalMapUrl}
          roughnessMapUrl={roughnessMapUrl}
          metalnessMapUrl={metalnessMapUrl}
          displacementMapUrl={displacementMapUrl}
          displacementScale={displacementScale}
          normalScale={normalScale}
          repeatX={repeatX}
          repeatY={repeatY}
          centerTexture={centerTexture}
          hideOverlap={hideOverlap}
          alphaCutoff={alphaCutoff}
          textureOffsetX={textureOffsetX}
          textureOffsetY={textureOffsetY}
          textureRotation={textureRotation}
          wireframe={wireframe}
          shaderType={properties.shaderType}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

function PhysicalMaterialLoader({
  color,
  opacity,
  doubleSided,
  roughness,
  metalness,
  emissiveColor,
  emissiveIntensity,
  clearcoat,
  clearcoatRoughness,
  transmission,
  thickness,
  ior,
  iridescence,
  iridescenceIOR,
  iridescenceThicknessRange,
  sheen,
  sheenColor,
  sheenRoughness,
  attenuationColor,
  attenuationDistance,
  flatShading,
  textureUrl,
  normalMapUrl,
  roughnessMapUrl,
  metalnessMapUrl,
  displacementMapUrl,
  displacementScale,
  normalScale,
  repeatX,
  repeatY,
  centerTexture = true,
  hideOverlap = false,
  alphaCutoff = 0.5,
  textureOffsetX = 0,
  textureOffsetY = 0,
  textureRotation = 0,
  wireframe,
  shaderType
}: any) {
  const [maps, setMaps] = useState<Record<string, THREE.Texture>>({});

  useEffect(() => {
    const loadedMaps: Record<string, THREE.Texture> = {};
    let active = true;

    const urls = {
      map: textureUrl,
      normalMap: normalMapUrl,
      roughnessMap: roughnessMapUrl,
      metalnessMap: metalnessMapUrl,
      displacementMap: displacementMapUrl,
    };

    const loadPromises = Object.entries(urls).map(([key, url]) => {
      if (!url) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const individualLoader = new THREE.TextureLoader();
        if (url.startsWith('http://') || url.startsWith('https://')) {
          individualLoader.crossOrigin = 'anonymous';
        }
        individualLoader.load(
          url,
          (tex) => {
            if (active) {
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              tex.repeat.set(repeatX || 1, repeatY || 1);
              if (centerTexture) {
                tex.center.set(0.5, 0.5);
              } else {
                tex.center.set(0, 0);
              }
              tex.offset.set(textureOffsetX || 0, textureOffsetY || 0);
              if (textureRotation) {
                tex.rotation = (textureRotation * Math.PI) / 180;
              }
              if (key === 'map' || key === 'emissiveMap') {
                tex.colorSpace = THREE.SRGBColorSpace;
              } else {
                tex.colorSpace = THREE.LinearSRGBColorSpace || THREE.NoColorSpace;
              }
              tex.needsUpdate = true;
              loadedMaps[key] = tex;
            }
            resolve();
          },
          undefined,
          (err) => {
            console.warn('Failed to load map texture:', key, url, err);
            // Error loading texture - resolve silently to prevent crashing
            resolve();
          }
        );
      });
    });

    Promise.all(loadPromises).then(() => {
      if (active) {
        setMaps({ ...loadedMaps });
      }
    });

    return () => {
      active = false;
      // Dispose loaded textures
      Object.values(loadedMaps).forEach(tex => tex.dispose());
    };
  }, [textureUrl, normalMapUrl, roughnessMapUrl, metalnessMapUrl, displacementMapUrl, repeatX, repeatY]);

  // Determine default shader if not explicitly chosen
  const activeShader = shaderType || (clearcoat > 0 || transmission > 0 ? 'physical' : 'standard');
  const textureKey = Object.values(maps).map(t => t.uuid).join('-') || 'no-texture';

  if (activeShader === 'toon') {
    return (
      <meshToonMaterial
        key={textureKey}
        color={color}
        map={maps.map || null}
        normalMap={maps.normalMap || null}
        normalScale={new THREE.Vector2(normalScale, normalScale)}
        displacementMap={maps.displacementMap || null}
        displacementScale={displacementScale}
        wireframe={wireframe}
        transparent={opacity < 1}
        opacity={opacity}
        side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
      />
    );
  }

  if (activeShader === 'basic') {
    return (
      <meshBasicMaterial
        key={textureKey}
        color={color}
        map={maps.map || null}
        wireframe={wireframe}
        transparent={opacity < 1}
        opacity={opacity}
        side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
      />
    );
  }

  if (activeShader === 'normal') {
    return (
      <meshNormalMaterial
        key={textureKey}
        displacementMap={maps.displacementMap || null}
        displacementScale={displacementScale}
        wireframe={wireframe}
        transparent={opacity < 1}
        opacity={opacity}
        side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
      />
    );
  }

  if (activeShader === 'physical') {
    return (
      <meshPhysicalMaterial
        key={textureKey}
        color={color}
        map={maps.map || null}
        normalMap={maps.normalMap || null}
        normalScale={new THREE.Vector2(normalScale, normalScale)}
        roughnessMap={maps.roughnessMap || null}
        metalnessMap={maps.metalnessMap || null}
        displacementMap={maps.displacementMap || null}
        displacementScale={displacementScale}
        roughness={roughness}
        metalness={metalness}
        emissive={new THREE.Color(emissiveColor)}
        emissiveIntensity={emissiveIntensity}
        clearcoat={clearcoat}
        clearcoatRoughness={clearcoatRoughness}
        transmission={transmission}
        thickness={thickness}
        ior={ior}
        iridescence={iridescence}
        iridescenceIOR={iridescenceIOR}
        iridescenceThicknessRange={iridescenceThicknessRange}
        sheen={sheen}
        sheenColor={sheenColor ? new THREE.Color(sheenColor) : undefined}
        sheenRoughness={sheenRoughness}
        attenuationColor={attenuationColor ? new THREE.Color(attenuationColor) : undefined}
        attenuationDistance={attenuationDistance || undefined}
        flatShading={flatShading}
        wireframe={wireframe}
        transparent={opacity < 1 || transmission > 0}
        opacity={opacity}
        side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
      />
    );
  }

  return (
    <meshStandardMaterial
      key={textureKey}
      color={color}
      map={maps.map || null}
      normalMap={maps.normalMap || null}
      normalScale={new THREE.Vector2(normalScale, normalScale)}
      roughnessMap={maps.roughnessMap || null}
      metalnessMap={maps.metalnessMap || null}
      displacementMap={maps.displacementMap || null}
      displacementScale={displacementScale}
      roughness={roughness}
      metalness={metalness}
      emissive={new THREE.Color(emissiveColor)}
      emissiveIntensity={emissiveIntensity}
      flatShading={flatShading}
      wireframe={wireframe}
      transparent={opacity < 1}
      opacity={opacity}
      side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
    />
  );
}

// Interactive 3D Video Texture mapped panel
function VideoMeshMaterial({ properties }: { properties: any }) {
  const videoUrl = properties.videoUrl || 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05c5c839d39e7fa17b4474775836a0c&profile_id=139&oauth2_token_id=57447761';
  const isPlaying = properties.playing ?? true;
  const loop = properties.loop ?? true;
  const muted = properties.muted ?? true;
  const volume = properties.volume ?? 0.5;

  const [video] = useState(() => {
    const vid = document.createElement('video');
    vid.src = videoUrl;
    vid.crossOrigin = 'Anonymous';
    vid.loop = loop;
    vid.muted = muted;
    vid.volume = volume;
    vid.playsInline = true;
    if (isPlaying) {
      vid.play().catch(err => console.log('Video play deferred', err));
    }
    return vid;
  });

  useEffect(() => {
    video.src = videoUrl;
    video.load();
    if (isPlaying) {
      video.play().catch(err => console.log('Video play deferred on url change', err));
    }
  }, [videoUrl]);

  useEffect(() => {
    video.loop = loop;
  }, [loop]);

  useEffect(() => {
    video.muted = muted;
  }, [muted]);

  useEffect(() => {
    video.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      video.play().catch(err => console.log('Video play failed', err));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      video.pause();
      video.src = '';
    };
  }, [video]);

  const [texture] = useState(() => {
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });

  const storeWireframe = useEditorStore(state => state.wireframeEnabled) || false;
  const wireframe = storeWireframe || (properties.wireframe ?? false);

  return (
    <meshBasicMaterial map={texture} side={THREE.DoubleSide} wireframe={wireframe} />
  );
}

// Ultra-efficient Direct-to-DOM Performance Tracker to avoid React renders
function PerformanceTracker() {
  const { gl } = useThree();
  const fpsRef = useRef(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  
  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    if (now >= lastTime.current + 500) { // update every 500ms
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
      fpsRef.current = fps;
      frameCount.current = 0;
      lastTime.current = now;
      
      // Update DOM directly for ultra performance (no React re-renders)
      const fpsEl = document.getElementById('perf-fps');
      const callsEl = document.getElementById('perf-calls');
      const geoEl = document.getElementById('perf-geometries');
      const texEl = document.getElementById('perf-textures');
      const memEl = document.getElementById('perf-memory');
      
      if (fpsEl) {
        fpsEl.textContent = `${fps}`;
        // Color code FPS
        if (fps >= 50) {
          fpsEl.className = "text-sm font-bold font-mono text-green-400";
        } else if (fps >= 30) {
          fpsEl.className = "text-sm font-bold font-mono text-yellow-400";
        } else {
          fpsEl.className = "text-sm font-bold font-mono text-red-500 animate-pulse";
        }
      }
      if (callsEl) {
        const calls = gl.info.render.calls;
        callsEl.textContent = `${calls}`;
        // Color code Draw Calls (warn if > 50 for mobile)
        if (calls <= 50) {
          callsEl.className = "text-sm font-bold font-mono text-blue-400";
        } else if (calls <= 100) {
          callsEl.className = "text-sm font-bold font-mono text-yellow-400";
        } else {
          callsEl.className = "text-sm font-bold font-mono text-red-400";
        }
      }
      if (geoEl) geoEl.textContent = `${gl.info.memory.geometries}`;
      if (texEl) texEl.textContent = `${gl.info.memory.textures}`;
      
      if (memEl) {
        // Retrieve memory if available
        const memory = (performance as any).memory;
        if (memory) {
          const usedMB = Math.round(memory.usedJSHeapSize / (1024 * 1024));
          memEl.textContent = `${usedMB} MB`;
        } else {
          // Fallback estimated GPU footprint
          const estMem = Math.round((gl.info.memory.geometries * 0.15 + gl.info.memory.textures * 2.5) * 10) / 10;
          memEl.textContent = `${estMem} MB (est)`;
        }
      }

      // Dynamic Resolution Scaling to optimize render loop and improve UI responsiveness
      try {
        if (fps < 45) {
          // Drop pixel ratio to save GPU fill rate and keep UI fluid
          const currentRatio = gl.getPixelRatio();
          if (currentRatio > 0.8) {
            gl.setPixelRatio(Math.max(0.75, currentRatio - 0.15));
            console.log(`[Perf Optimizer] Dynamic Resolution Scaled Down. Pixel Ratio: ${gl.getPixelRatio().toFixed(2)}`);
          }
        } else if (fps > 55) {
          // Safely scale up pixel ratio when performance is healthy and stable
          const currentRatio = gl.getPixelRatio();
          const maxRatio = Math.min(2, window.devicePixelRatio || 1);
          if (currentRatio < maxRatio) {
            gl.setPixelRatio(Math.min(maxRatio, currentRatio + 0.1));
            console.log(`[Perf Optimizer] Dynamic Resolution Scaled Up. Pixel Ratio: ${gl.getPixelRatio().toFixed(2)}`);
          }
        }
      } catch (err) {
        console.warn('Dynamic resolution scaling failed:', err);
      }
    }
  });

  return null;
}

// Beautiful 3D Audio Node simulation
function AudioNodeRenderer({ properties, isPreviewMode }: { properties: any; isPreviewMode: boolean }) {
  const soundUrl = properties.soundUrl || '/sounds/forest_ambient.wav';
  const autoplay = properties.autoplay ?? false;
  const loop = properties.loop ?? true;
  const volume = properties.volume ?? 0.5;
  const isPlaying = properties.playing ?? false;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!globalAudioCache[soundUrl]) globalAudioCache[soundUrl] = new Audio(soundUrl);
    const audio = globalAudioCache[soundUrl];
    audio.loop = loop;
    audio.volume = volume;
    audioRef.current = audio;

    if (isPreviewMode && (autoplay || isPlaying)) {
      audio.play().catch(e => console.log('Audio node autoplay blocked', e));
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [soundUrl, isPreviewMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loop;
    }
  }, [loop]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && isPreviewMode) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log('Audio node play failed', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isPreviewMode]);

  const wireframe = useEditorStore(state => state.wireframeEnabled) || false;

  if (isPreviewMode) return null;

  return (
    <group>
      {/* Outer audio wireframe rings */}
      <mesh>
        <boxGeometry args={[0.3, 0.45, 0.25]} />
        <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.2} wireframe={wireframe} />
      </mesh>
      <mesh position={[0, 0, 0.15]}>
        <torusGeometry args={[0.15, 0.02, 8, 24]} />
        <meshBasicMaterial color="#a78bfa" wireframe={wireframe} />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <torusGeometry args={[0.25, 0.015, 8, 24]} />
        <meshBasicMaterial color="#c084fc" opacity={0.5} transparent wireframe={wireframe} />
      </mesh>
    </group>
  );
}

// Physical 3D light source rendering
function LightNodeRenderer({ properties, isPreviewMode }: { properties: any; isPreviewMode: boolean }) {
  const lightType = properties.lightType || 'point';
  const color = properties.color || '#ffedd5';
  const intensity = properties.intensity ?? 3.0;
  const distance = properties.distance ?? 12;
  const decay = properties.decay ?? 1.5;
  const angle = properties.angle ?? Math.PI / 4;
  const wireframe = useEditorStore(state => state.wireframeEnabled) || false;

  return (
    <group>
      {!isPreviewMode && (
        <group>
          {/* Bulb center */}
          <mesh>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshBasicMaterial color={color} wireframe={wireframe} />
          </mesh>
          {/* Wire sphere guide */}
          <mesh>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
          </mesh>
          {/* Subtle glow ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.45, 0.015, 8, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>
        </group>
      )}

      {/* Embedded functional light node */}
      {lightType === 'directional' && (
        <directionalLight color={color} intensity={intensity} castShadow={properties.castShadow !== false} />
      )}
      {lightType === 'point' && (
        <pointLight color={color} intensity={intensity} distance={distance} decay={decay} castShadow={properties.castShadow !== false} />
      )}
      {lightType === 'spot' && (
        <spotLight color={color} intensity={intensity} distance={distance} angle={angle} decay={decay} castShadow={properties.castShadow !== false} />
      )}
      {lightType === 'ambient' && (
        <ambientLight color={color} intensity={intensity} />
      )}
    </group>
  );
}

// Physical 3D camera node representation
function CameraNodeRenderer({ obj, isPreviewMode }: { obj: SceneObject; isPreviewMode: boolean }) {
  const wireframe = useEditorStore(state => state.wireframeEnabled) || false;
  const isActive = obj.properties?.active ?? true;
  const fov = obj.properties?.fov || 60;
  const color = isActive ? "#3b82f6" : "#888888";

  return (
    <group>
      {!isPreviewMode && (
        <group>
          {/* Camera Main Body Box */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.22, 0.35]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} wireframe={wireframe} />
          </mesh>
          {/* Camera Lens Cylinder */}
          <mesh position={[0, 0, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.15, 16]} />
            <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} wireframe={wireframe} />
          </mesh>
          {/* Camera Top Reel */}
          <mesh position={[0, 0.14, 0]}>
            <boxGeometry args={[0.12, 0.06, 0.15]} />
            <meshStandardMaterial color="#222222" wireframe={wireframe} />
          </mesh>
          {/* Frustum Wireframe Pyramid */}
          <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.35 * (fov / 60), 0.5, 4]} />
            <meshBasicMaterial color={color} wireframe opacity={0.4} transparent />
          </mesh>
          {/* Active Badge Label */}
          <Html position={[0, 0.28, 0]} center distanceFactor={8} zIndexRange={[100, 0]}>
            <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase font-mono shadow-md border ${
              isActive 
                ? 'bg-blue-600 border-blue-400 text-white' 
                : 'bg-gray-800/80 border-gray-600 text-gray-300'
            }`}>
              {isActive ? '🎥 Active Cam' : '📷 Camera'}
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

// External Web 3D Scene / URL Embed renderer
function Web3DSceneRenderer({ obj, isPreviewMode, onInteract }: { obj: SceneObject; isPreviewMode: boolean; onInteract?: (e: any) => void }) {
  const properties = obj.properties || {};
  const url = properties.url || 'https://threejs.org/examples/webgl_geometry_shapes.html';
  const width = properties.width || 1.6;
  const height = properties.height || 0.9;
  const isInteractive = properties.interactive ?? true;
  const title = properties.title || 'External Web 3D Scene';
  const [reloadKey, setReloadKey] = useState(0);

  const handleOpenNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {}
  };

  return (
    <group onClick={onInteract}>
      {/* 3D Glass Screen Frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width + 0.1, height + 0.18]} />
        <meshStandardMaterial color="#111116" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Interactive HTML WebGL Embed Frame */}
      <Html
        transform
        distanceFactor={1.4}
        position={[0, -0.02, 0.01]}
        style={{
          width: `${width * 380}px`,
          height: `${height * 380}px`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          background: '#09090b',
          border: '1px solid rgba(255,255,255,0.12)',
          pointerEvents: isInteractive ? 'auto' : 'none'
        }}
      >
        <div className="w-full h-full flex flex-col bg-[#0d0d11] text-white font-sans select-none overflow-hidden">
          {/* Header Control Bar */}
          <div className="px-3 py-1.5 bg-[#14141a] border-b border-[#252530] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Globe size={13} className="text-blue-400 shrink-0" />
              <span className="text-[11px] font-bold text-gray-200 truncate">{title}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono font-bold shrink-0">
                Web 3D
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setReloadKey(k => k + 1);
                }}
                className="p-1 hover:bg-[#252532] rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Reload Embed"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onClick={handleOpenNewTab}
                className="p-1 hover:bg-[#252532] rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Open in New Tab"
              >
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* Web 3D Iframe Canvas View */}
          <div className="flex-1 relative bg-black">
            <iframe
              key={reloadKey}
              src={url}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; xr-spatial-tracking"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        </div>
      </Html>
    </group>
  );
}

function CollisionDebuggerOverlay({ obj }: { obj: any }) {
  const isSelected = useEditorStore(state => state.selectedObjectIds.includes(obj.id));
  const wireframeColor = isSelected ? "#38bdf8" : "#f97316";
  
  let geometry = null;
  let label = "Box Collider";
  
  switch (obj.type) {
    case 'box':
    case 'button':
    case 'youtube':
      label = "Box Collider";
      break;
    case 'sphere':
      label = "Sphere Collider";
      break;
    case 'plane':
    case 'circle':
    case 'image':
    case 'video':
      label = obj.type === 'circle' ? "Circle Collider" : "Plane Collider";
      break;
    case 'cylinder':
      label = "Cylinder Collider";
      break;
    case 'cone':
    case 'pyramid':
      label = "Cone/Pyramid Collider";
      break;
    case 'torus':
      label = "Torus Collider";
      break;
    case 'capsule':
      label = "Capsule Collider";
      break;
    case 'dodecahedron':
      label = "Polyhedron Collider";
      break;
    case 'octahedron':
      label = "Octahedron Collider";
      break;
    case 'icosahedron':
      label = "Geodesic Collider";
      break;
    case 'knot':
      label = "Mesh Collider";
      break;
    case 'model':
      label = "OBB Bounding Box";
      break;
    case 'icon':
    case 'icon2d':
      label = "Billboard Collider";
      break;
    case 'empty':
    case 'group':
      label = obj.type === 'empty' ? "Empty Anchor Node" : "Group Origin Node";
      break;
    default:
      label = "Generic Collider";
      break;
  }

  const renderColliderGeom = () => {
    switch (obj.type) {
      case 'box':
      case 'button':
        return <boxGeometry args={[1.02, 1.02, 1.02]} />;
      case 'youtube': {
        const ratio = getYoutubeAspectRatioRatio(obj.properties?.aspectRatio, obj.properties?.customAspectRatioWidth, obj.properties?.customAspectRatioHeight);
        const pw = Number((1.0 * ratio).toFixed(3));
        return <boxGeometry args={[pw, 1.0, 0.05]} />;
      }
      case 'sphere':
        return <sphereGeometry args={[0.51, 16, 16]} />;
      case 'plane':
      case 'circle':
      case 'image':
      case 'video':
        return <planeGeometry args={[1.02, 1.02]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.51, 0.51, 1.02, 16]} />;
      case 'cone':
      case 'pyramid':
        return <coneGeometry args={[0.51, 1.02, obj.type === 'pyramid' ? 4 : 16]} />;
      case 'torus':
        return <torusGeometry args={[0.41, 0.13, 8, 32]} />;
      case 'capsule':
        return <capsuleGeometry args={[0.31, 0.61, 8, 16]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[0.51]} />;
      case 'octahedron':
        return <octahedronGeometry args={[0.51]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[0.51]} />;
      case 'knot':
        return <torusKnotGeometry args={[0.31, 0.11, 32, 8]} />;
      case 'model': {
        const bw = (obj.properties?.customBoundsWidth || 1.2) + (obj.properties?.colliderPadding?.[0] || 0);
        const bl = (obj.properties?.customBoundsLength || 2.4) + (obj.properties?.colliderPadding?.[1] || 0);
        const bh = (obj.properties?.customBoundsHeight || 1.1) + (obj.properties?.colliderPadding?.[2] || 0);
        return <boxGeometry args={[bw, bl, bh]} />;
      }
      case 'icon':
      case 'icon2d':
        return <boxGeometry args={[0.8, 0.8, 0.3]} />;
      case 'empty':
      case 'group':
        return <octahedronGeometry args={[0.3, 0]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const needsPivotNormalization = ['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane', 'circle', 'pyramid', 'capsule', 'dodecahedron', 'octahedron', 'icosahedron', 'knot', 'model'].includes(obj.type);

  return (
    <group>
      <PivotNormalizer enabled={needsPivotNormalization}>
        <mesh>
          {renderColliderGeom()}
          <meshBasicMaterial 
            color={wireframeColor} 
            wireframe 
            transparent 
            opacity={0.8} 
            depthTest={false} 
          />
        </mesh>
        
        <mesh>
          {renderColliderGeom()}
          <meshBasicMaterial 
            color={wireframeColor} 
            transparent 
            opacity={0.12} 
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </PivotNormalizer>
    </group>
  );
}

function cubicBezier(t: number, x1: number, y1: number, x2: number, y2: number): number {
  let low = 0;
  let high = 1;
  let x = t;
  for (let i = 0; i < 14; i++) {
    const mid = (low + high) / 2;
    const sampleX = 3 * Math.pow(1 - mid, 2) * mid * x1 + 3 * (1 - mid) * Math.pow(mid, 2) * x2 + Math.pow(mid, 3);
    if (sampleX < x) {
      low = mid;
    } else {
      high = mid;
    }
  }
  const mid = (low + high) / 2;
  const y = 3 * Math.pow(1 - mid, 2) * mid * y1 + 3 * (1 - mid) * Math.pow(mid, 2) * y2 + Math.pow(mid, 3);
  return y;
}

function getEasingValue(type: string, t: number): number {
  if (type.startsWith('cubic-bezier(')) {
    const match = type.match(/cubic-bezier\(([^,]+),([^,]+),([^,]+),([^)]+)\)/);
    if (match) {
      const x1 = parseFloat(match[1]);
      const y1 = parseFloat(match[2]);
      const x2 = parseFloat(match[3]);
      const y2 = parseFloat(match[4]);
      if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
        return cubicBezier(t, x1, y1, x2, y2);
      }
    }
  }

  switch (type) {
    case 'ease-in':
      return t * t;
    case 'ease-out':
      return t * (2 - t);
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'elastic': {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
    }
    case 'bounce': {
      const n1 = 7.5625;
      const d1 = 2.75;
      let tempT = t;
      if (tempT < 1 / d1) {
        return n1 * tempT * tempT;
      } else if (tempT < 2 / d1) {
        return n1 * (tempT -= 1.5 / d1) * tempT + 0.75;
      } else if (tempT < 2.5 / d1) {
        return n1 * (tempT -= 2.25 / d1) * tempT + 0.9375;
      } else {
        return n1 * (tempT -= 2.625 / d1) * tempT + 0.984375;
      }
    }
    case 'linear':
    default:
      return t;
  }
}

function PivotNormalizer({ children, enabled = true }: { children: React.ReactNode; enabled?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
}

function ObjectRenderer({ id }: { id: string }) {
  const obj = useEditorStore(state => state.objects[id]);
  if (!obj) return null;
  // Granular boolean selector: only re-renders when this specific object's selection state changes
  const isSelected = useEditorStore(state => state.selectedObjectId === id || (state.selectedObjectIds && state.selectedObjectIds.includes(id)));
  const selectObject = useEditorStore(state => state.selectObject);
  const updateObject = useEditorStore(state => state.updateObject);
  const isPreviewMode = useEditorStore(state => state.isPreviewMode);
  const liveInteractionsInDesign = useEditorStore(state => state.liveInteractionsInDesign);
  const isInteractiveActive = isPreviewMode || liveInteractionsInDesign;
  const transformGizmoEnabled = useEditorStore(state => state.transformGizmoEnabled);
  const collisionDebuggerEnabled = useEditorStore(state => state.collisionDebuggerEnabled);
  const meshRef = useRef<THREE.Group>(null);

  const { camera, gl } = useThree();
  const controls = useThree((state) => state.controls as any);

  // Children do not directly inherit parent behaviors (they follow transform changes hierarchically)
  const effectiveBehavior = obj.properties.behavior;

  const getLatestEffectiveBehavior = () => {
    const currentObj = useEditorStore.getState().objects[id];
    if (!currentObj) return undefined;
    return currentObj.properties.behavior;
  };

  // Draggable interaction state and refs
  const isDraggingRef = useRef(false);
  const dragPlaneRef = useRef(new THREE.Plane());
  const dragOffsetRef = useRef(new THREE.Vector3());
  const dragStartPosRef = useRef(new THREE.Vector3());
  const hasDraggedRef = useRef(false);

  // Long-press detection for multi-object selection
  const longPressTimerRef = useRef<any>(null);
  const isLongPressTriggeredRef = useRef(false);
  const pointerDownScreenPosRef = useRef({ x: 0, y: 0 });

  // Snapping helper: snaps target position by bounding-box to nearest surfaces and scene objects
  const computeSnappedPosition = useCallback((targetLocal: THREE.Vector3, isShiftHeld: boolean) => {
    const state = useEditorStore.getState();
    const allObjects = state.objects;
    const isSnappingOn = state.gridSnapEnabled;
    const surfaceSnapEnabled = state.surfaceSnapEnabled;
    const snapIncrement = isSnappingOn ? state.gridSnapIncrement : 0;
    return computeComprehensiveSnapPosition(
      targetLocal,
      id,
      allObjects,
      snapIncrement,
      {
        isShiftHeld,
        dragStartPos: dragStartPosRef.current,
        surfaceSnapEnabled
      }
    );
  }, [id]);

  // Global window pointer listeners for drag-and-drop resilience
  useEffect(() => {
    const onGlobalPointerMove = (evt: PointerEvent) => {
      if (!isDraggingRef.current || !meshRef.current) return;
      hasDraggedRef.current = true;
      const canvas = gl.domElement;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(dragPlaneRef.current, intersection)) {
        const targetWorld = intersection.clone().add(dragOffsetRef.current);
        const targetLocal = targetWorld.clone();
        if (meshRef.current.parent) {
          meshRef.current.parent.worldToLocal(targetLocal);
        }
        const snapped = computeSnappedPosition(targetLocal, evt.shiftKey);
        meshRef.current.position.copy(snapped.position);
        useEditorStore.getState().setActiveTransformCallout({
          active: true,
          objectId: id,
          objectName: obj?.name || 'Object',
          mode: 'translate',
          x: Number(snapped.position.x.toFixed(3)),
          y: Number(snapped.position.y.toFixed(3)),
          z: Number(snapped.position.z.toFixed(3)),
          unit: 'm',
          isSnapped: snapped.isSnapped,
          snapLabel: snapped.snapLabel || (useEditorStore.getState().gridSnapEnabled ? `Snap ${useEditorStore.getState().gridSnapIncrement}m` : undefined)
        });
      }
    };

    const onGlobalPointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        useEditorStore.getState().setIsDraggableDragging(false);
        document.body.style.cursor = 'auto';
        if (controls) {
          controls.enabled = true;
        }
        if (hasDraggedRef.current && meshRef.current) {
          const finalPos: [number, number, number] = [
            Number(meshRef.current.position.x.toFixed(3)),
            Number(meshRef.current.position.y.toFixed(3)),
            Number(meshRef.current.position.z.toFixed(3)),
          ];
          updateObject(id, { position: finalPos });
          setTimeout(() => {
            useEditorStore.getState().setActiveTransformCallout(null);
          }, 1600);
        } else {
          useEditorStore.getState().setActiveTransformCallout(null);
        }
      }
    };

    window.addEventListener('pointermove', onGlobalPointerMove);
    window.addEventListener('pointerup', onGlobalPointerUp);
    window.addEventListener('pointercancel', onGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', onGlobalPointerMove);
      window.removeEventListener('pointerup', onGlobalPointerUp);
      window.removeEventListener('pointercancel', onGlobalPointerUp);
    };
  }, [id, camera, gl, controls, updateObject, computeSnappedPosition]);

  // Local state/refs for scripts & proximity triggers
  const wasProximityActiveRef = useRef<Record<string, boolean>>({});
  const hasTriggeredOnStartRef = useRef(false);
  const scriptCallbacksRef = useRef<{
    onTap: (() => void) | null;
    onUpdate: ((time: number, delta: number) => void) | null;
  }>({ onTap: null, onUpdate: null });
  const hasInitializedScriptRef = useRef(false);
  const lastTransformRef = useRef<{
    px: number; py: number; pz: number;
    rx: number; ry: number; rz: number;
    sx: number; sy: number; sz: number;
  }>({
    px: Number.NaN, py: Number.NaN, pz: Number.NaN,
    rx: Number.NaN, ry: Number.NaN, rz: Number.NaN,
    sx: Number.NaN, sy: Number.NaN, sz: Number.NaN
  });

  // Global pivot normalization for newly instantiated primitives and groups
  useEffect(() => {
    if (meshRef.current && obj) {
      // Only normalize geometries for primitive shapes and groups. GLTF Models already handle normalized bounds & offsets.
      if (['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane', 'circle', 'pyramid', 'capsule', 'dodecahedron', 'octahedron', 'icosahedron', 'knot', 'group'].includes(obj.type)) {
        if (!obj.properties?.skipPivotNormalization) {
          const timer = setTimeout(() => {
            if (meshRef.current) {
              PivotNormalizationService.normalizePivot(meshRef.current);
            }
          }, 50); // Small timeout to ensure child meshes / geometries are fully populated
          return () => clearTimeout(timer);
        }
      }
    }
  }, [obj?.type, obj?.properties?.url]);

  const executeBehaviorAction = (b: any) => {
    const actType = b.type || b.action;
    const targetId = b.targetId || b.targetObjectId || id;
    switch (actType) {
      case 'hide':
        useEditorStore.getState().updateObject(targetId, { visible: false });
        break;
      case 'show':
        useEditorStore.getState().updateObject(targetId, { visible: true });
        break;
      case 'toggleVisibility': {
        const target = useEditorStore.getState().objects[targetId];
        if (target) {
          useEditorStore.getState().updateObject(targetId, { visible: !target.visible });
        } else if (obj) {
          useEditorStore.getState().updateObject(id, { visible: !obj.visible });
        }
        break;
      }
      case 'setVisibility': {
        const svTarget = useEditorStore.getState().objects[targetId];
        if (svTarget) {
          useEditorStore.getState().updateObject(targetId, { visible: b.visibleState !== 'false' });
        }
        break;
      }
      case 'toast':
        if (b.toastMessage) {
          useEditorStore.getState().addToast(b.toastMessage);
        }
        break;
      case 'openUrl':
        if (b.url) {
          window.open(b.url, '_blank', 'noopener,noreferrer');
        }
        break;
      case 'playSound': {
        const playUrl = b.soundUrl || b.soundPreset || '/sounds/success_chime.wav';
        playCachedAudio(playUrl, b.soundLoop, 0.5);
        break;
      }
      case 'playVideo':
        useEditorStore.getState().setARVideoPlaying({
          title: `${obj ? obj.name : 'Object'} Response Video`,
          url: b.url || 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05c5c839d39e7fa17b4474775836a0c&profile_id=139&oauth2_token_id=57447761'
        });
        break;
      case 'startBehavior':
      case 'spin': {
        const targetObj = useEditorStore.getState().objects[targetId];
        if (targetObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...targetObj.properties, behavior: b.behaviorRule || 'spin' }
          });
        }
        break;
      }
      case 'scaleUp': {
        const suTarget = useEditorStore.getState().objects[targetId];
        if (suTarget) {
          useEditorStore.getState().updateObject(targetId, { scale: [suTarget.scale[0] * 1.25, suTarget.scale[1] * 1.25, suTarget.scale[2] * 1.25] });
        }
        break;
      }
      case 'scaleDown': {
        const sdTarget = useEditorStore.getState().objects[targetId];
        if (sdTarget) {
          useEditorStore.getState().updateObject(targetId, { scale: [sdTarget.scale[0] * 0.8, sdTarget.scale[1] * 0.8, sdTarget.scale[2] * 0.8] });
        }
        break;
      }
      case 'playAnimation':
      case 'playModelAnimation': {
        const pmaTarget = useEditorStore.getState().objects[targetId];
        if (pmaTarget && pmaTarget.type === 'model') {
          const updates: any = { animationPlaying: true, isScrubbing: false, animationSpeed: b.animationSpeedValue ?? 1.0 };
          if (b.animationClipName) {
            updates.activeAnimation = b.animationClipName;
          }
          if (typeof b.seekTime === 'number') {
            updates.animationTime = b.seekTime;
          }
          useEditorStore.getState().updateObject(targetId, { properties: { ...pmaTarget.properties, ...updates } });
          useEditorStore.getState().addToast(`Playing 3D Animation: ${updates.activeAnimation || 'default'}`);
        }
        break;
      }
      case 'pauseAnimation':
      case 'pauseModelAnimation': {
        const pmaPauseTarget = useEditorStore.getState().objects[targetId];
        if (pmaPauseTarget && pmaPauseTarget.type === 'model') {
          useEditorStore.getState().updateObject(targetId, { properties: { ...pmaPauseTarget.properties, animationPlaying: false, isScrubbing: false } });
          useEditorStore.getState().addToast('Paused 3D Animation');
        }
        break;
      }
      case 'stopAnimation':
      case 'stopModelAnimation': {
        const pmaStopTarget = useEditorStore.getState().objects[targetId];
        if (pmaStopTarget && pmaStopTarget.type === 'model') {
          useEditorStore.getState().updateObject(targetId, { properties: { ...pmaStopTarget.properties, animationPlaying: false, animationTime: 0, isScrubbing: false } });
          useEditorStore.getState().addToast('Stopped 3D Animation (0.00s)');
        }
        break;
      }
      case 'seekModelAnimation': {
        const seekTarget = useEditorStore.getState().objects[targetId];
        if (seekTarget && seekTarget.type === 'model') {
          const seekT = typeof b.seekTime === 'number' ? b.seekTime : 0;
          useEditorStore.getState().updateObject(targetId, { properties: { ...seekTarget.properties, animationTime: seekT, animationPlaying: false, isScrubbing: true } });
          useEditorStore.getState().addToast(`Seek 3D Animation: ${seekT.toFixed(2)}s`);
        }
        break;
      }
      case 'toggleAnimationPlayPause': {
        const toggleTarget = useEditorStore.getState().objects[targetId];
        if (toggleTarget && toggleTarget.type === 'model') {
          const currentPlaying = toggleTarget.properties.animationPlaying !== false;
          useEditorStore.getState().updateObject(targetId, { properties: { ...toggleTarget.properties, animationPlaying: !currentPlaying, isScrubbing: false } });
          useEditorStore.getState().addToast(!currentPlaying ? 'Resumed 3D Animation' : 'Paused 3D Animation');
        }
        break;
      }
      case 'setAnimationSpeed': {
        const speedTarget = useEditorStore.getState().objects[targetId];
        if (speedTarget && speedTarget.type === 'model') {
          const newSpeed = typeof b.animationSpeedValue === 'number' ? b.animationSpeedValue : 1.0;
          useEditorStore.getState().updateObject(targetId, { properties: { ...speedTarget.properties, animationSpeed: newSpeed } });
          useEditorStore.getState().addToast(`Animation Speed: ${newSpeed}x`);
        }
        break;
      }
      case 'takeScreenshot':
      case 'captureARSnapshot':
      case 'screenshot':
        window.dispatchEvent(new CustomEvent('trigger-ar-snapshot', { detail: b }));
        break;
      case 'loadScene':
        if (b.targetSceneId) {
          useEditorStore.getState().loadScene(b.targetSceneId);
        }
        break;
      case 'transition': {
        const targetStateId = b.transitionTargetStateId || 'base';
        const duration = b.transitionDuration ?? 1.0;
        const easing = b.transitionEasing || 'linear';
        useEditorStore.getState().triggerStateTransition(targetId, targetStateId, duration, easing);
        break;
      }
      case 'youtubePlay': {
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...ytObj.properties, autoplay: true, isPlaying: true }
          });
        }
        sendYoutubeCommand(targetId, 'playVideo');
        break;
      }
      case 'youtubePause': {
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...ytObj.properties, autoplay: false, isPlaying: false }
          });
        }
        sendYoutubeCommand(targetId, 'pauseVideo');
        break;
      }
      case 'youtubeTogglePlay':
      case 'youtubeTogglePlayPause': {
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          const isCurrentlyPlaying = !!ytObj.properties?.isPlaying || !!ytObj.properties?.autoplay;
          const nextPlayingState = !isCurrentlyPlaying;
          useEditorStore.getState().updateObject(targetId, {
            properties: {
              ...ytObj.properties,
              autoplay: nextPlayingState,
              isPlaying: nextPlayingState
            }
          });
          sendYoutubeCommand(targetId, nextPlayingState ? 'playVideo' : 'pauseVideo');
        } else {
          sendYoutubeCommand(targetId, 'pauseVideo');
        }
        break;
      }
      case 'youtubeMute': {
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...ytObj.properties, mute: true }
          });
        }
        sendYoutubeCommand(targetId, 'mute');
        break;
      }
      case 'youtubeUnmute': {
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...ytObj.properties, mute: false }
          });
        }
        sendYoutubeCommand(targetId, 'unMute');
        break;
      }
      case 'youtubeSetVolume': {
        const vol = typeof b.volumeValue === 'number' ? b.volumeValue : (b.propertyValue !== undefined ? parseFloat(b.propertyValue) : 100);
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...ytObj.properties, volume: vol, mute: vol === 0 }
          });
        }
        if (vol === 0) {
          sendYoutubeCommand(targetId, 'mute');
        } else {
          sendYoutubeCommand(targetId, 'unMute');
          sendYoutubeCommand(targetId, 'setVolume', [vol]);
        }
        break;
      }
      case 'youtubeSetQuality': {
        const quality = b.qualityValue || b.propertyValue || '720p';
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...ytObj.properties, resolution: quality }
          });
        }
        const vqMap: Record<string, string> = {
          '1080p': 'hd1080',
          '720p': 'hd720',
          '480p': 'large',
          '360p': 'medium',
          '240p': 'small'
        };
        sendYoutubeCommand(targetId, 'setPlaybackQuality', [vqMap[quality] || quality]);
        break;
      }
      case 'youtubeSetDisplayMode': {
        const mode = b.youtubeDisplayMode || b.propertyValue || '2d';
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: {
              ...ytObj.properties,
              displayMode: mode,
              overlayOpen: mode === '2d' ? true : false
            }
          });
        }
        break;
      }
      case 'youtubeOpenOverlay': {
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...ytObj.properties, displayMode: '2d', overlayOpen: true }
          });
        }
        break;
      }
      case 'youtubeCloseOverlay': {
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...ytObj.properties, displayMode: '3d', overlayOpen: false }
          });
        }
        sendYoutubeCommand(targetId, 'pauseVideo');
        break;
      }
      case 'youtubeToggleOverlay': {
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          const isCurrentlyOverlay = ytObj.properties?.displayMode === '2d' && (ytObj.properties?.overlayOpen ?? true) === true;
          const nextOverlayOpen = !isCurrentlyOverlay;
          useEditorStore.getState().updateObject(targetId, {
            properties: {
              ...ytObj.properties,
              displayMode: nextOverlayOpen ? '2d' : '3d',
              overlayOpen: nextOverlayOpen
            }
          });
          if (isCurrentlyOverlay) {
            sendYoutubeCommand(targetId, 'pauseVideo');
          }
        }
        break;
      }
      case 'youtubeStop': {
        const ytObj = useEditorStore.getState().objects[targetId];
        if (ytObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...ytObj.properties, autoplay: false, isPlaying: false }
          });
        }
        sendYoutubeCommand(targetId, 'stopVideo');
        sendYoutubeCommand(targetId, 'seekTo', [0, true]);
        break;
      }
      case 'youtubeSeekTo': {
        const seconds = typeof b.seekTime === 'number' ? b.seekTime : (b.propertyValue !== undefined ? parseFloat(b.propertyValue) : 0);
        sendYoutubeCommand(targetId, 'seekTo', [seconds, true]);
        break;
      }
      case 'setTextureUrl': {
        const texObj = useEditorStore.getState().objects[targetId];
        if (texObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...texObj.properties, textureUrl: b.textureUrl || b.propertyValue || '' }
          });
        }
        break;
      }
      case 'centerTexture': {
        const texObj = useEditorStore.getState().objects[targetId];
        if (texObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...texObj.properties, centerTexture: true, textureOffsetX: 0, textureOffsetY: 0 }
          });
        }
        break;
      }
      case 'toggleHideOverlap': {
        const texObj = useEditorStore.getState().objects[targetId];
        if (texObj) {
          const curr = texObj.properties?.hideOverlap ?? false;
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...texObj.properties, hideOverlap: !curr }
          });
        }
        break;
      }
      case 'setHideOverlap': {
        const texObj = useEditorStore.getState().objects[targetId];
        if (texObj) {
          const hideVal = b.hideOverlapValue !== undefined ? b.hideOverlapValue : true;
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...texObj.properties, hideOverlap: hideVal }
          });
        }
        break;
      }
      case 'transform': {
        const targetObjT = useEditorStore.getState().objects[targetId];
        if (targetObjT) {
           const vals = (b.propertyValue || '0,0,0').split(',').map((v: string) => parseFloat(v) || 0) as [number, number, number];
           if (b.propertyName === 'position') useEditorStore.getState().updateObject(targetId, { position: vals });
           else if (b.propertyName === 'rotation') useEditorStore.getState().updateObject(targetId, { rotation: vals });
           else if (b.propertyName === 'scale') useEditorStore.getState().updateObject(targetId, { scale: vals });
        }
        break;
      }
      case 'material': {
        const targetObjM = useEditorStore.getState().objects[targetId];
        if (targetObjM) {
           if (b.propertyName === 'color') {
             useEditorStore.getState().updateObject(targetId, { properties: { ...targetObjM.properties, color: b.propertyValue } });
           } else if (b.propertyName === 'texture') {
             useEditorStore.getState().updateObject(targetId, { properties: { ...targetObjM.properties, textureUrl: b.propertyValue } });
           }
        }
        break;
      }
      default:
        break;
    }
  };

  const executeEvent = (evt: any) => {
    if (!evt) return;
    if (Array.isArray(evt.actions)) {
      evt.actions.forEach((act: any) => {
        executeBehaviorAction({
          ...act,
          action: act.type,
        });
      });
    } else {
      executeBehaviorAction(evt);
    }
  };

  // Compile & Initialize Custom JS Scripts on preview start
  useEffect(() => {
    if (!isPreviewMode || !obj || !(obj.properties.scriptEnabled ?? true)) {
      hasInitializedScriptRef.current = false;
      scriptCallbacksRef.current = { onTap: null, onUpdate: null };
      return;
    }

    if (obj.properties.scriptCode && !hasInitializedScriptRef.current) {
      try {
        const registerOnTap = (cb: () => void) => {
          scriptCallbacksRef.current.onTap = cb;
        };
        const registerOnUpdate = (cb: (time: number, delta: number) => void) => {
          scriptCallbacksRef.current.onUpdate = cb;
        };

        const api = {
          setPosition: (x: number, y: number, z: number) => {
            if (meshRef.current) meshRef.current.position.set(x, y, z);
            useEditorStore.getState().updateObject(id, { position: [x, y, z] });
          },
          setRotation: (x: number, y: number, z: number) => {
            if (meshRef.current) {
              meshRef.current.rotation.set(
                THREE.MathUtils.degToRad(x),
                THREE.MathUtils.degToRad(y),
                THREE.MathUtils.degToRad(z)
              );
            }
            useEditorStore.getState().updateObject(id, { rotation: [x, y, z] });
          },
          setScale: (x: number, y: number, z: number) => {
            if (meshRef.current) meshRef.current.scale.set(x, y, z);
            useEditorStore.getState().updateObject(id, { scale: [x, y, z] });
          },
          setVisible: (visible: boolean) => {
            useEditorStore.getState().updateObject(id, { visible });
          },
          toggleVisibility: (targetId: string) => {
            const targetObj = useEditorStore.getState().objects[targetId];
            if (targetObj) {
              useEditorStore.getState().updateObject(targetId, { visible: !targetObj.visible });
            }
          },
          getObject: (targetId: string) => {
            return useEditorStore.getState().objects[targetId];
          },
          playSound: (url: string) => {
            const playUrl = url || '/sounds/cyber_click.wav';
            const sfx = new Audio(playUrl);
            sfx.volume = 0.5;
            sfx.play().catch(e => console.log('Script sound failed', e));
          },
          showToast: (msg: string) => {
            useEditorStore.getState().addToast(msg);
          }
        };

        const scriptFn = new Function(
          'mesh',
          'object',
          'api',
          'onTap',
          'onUpdate',
          `try {
            ${obj.properties.scriptCode}
          } catch (err) {
            console.error("Script Runtime Error:", err);
            api.showToast("Script Runtime Error: " + err.message);
          }`
        );

        scriptFn(
          meshRef.current,
          obj,
          api,
          registerOnTap,
          registerOnUpdate
        );

        hasInitializedScriptRef.current = true;
      } catch (err: any) {
        console.error("Script Compilation Error:", err);
        useEditorStore.getState().addToast("Script Compile Error: " + err.message);
      }
    }
  }, [isPreviewMode, obj?.properties.scriptCode, obj?.properties.scriptEnabled, id]);

  // Handle onStart Visual Behaviors trigger
  useEffect(() => {
    if (!isPreviewMode || !obj) {
      hasTriggeredOnStartRef.current = false;
      return;
    }

    if (isPreviewMode && !hasTriggeredOnStartRef.current) {
      const behaviors = (obj.events || []) || [];
      behaviors.forEach((b: any) => {
        if (b.trigger === 'onStart') {
          executeEvent(b);
        }
      });
      hasTriggeredOnStartRef.current = true;
    }
  }, [isPreviewMode, (obj?.events || [])]);

  // Handle tap & hover triggers from 2D HUD or external events
  useEffect(() => {
    if (!isPreviewMode) return;
    const handleCustomTap = () => {
      handleInteract();
    };
    const handleCustomHoverEnter = () => {
      const behaviors = (obj?.events || []) || [];
      behaviors.forEach((b: any) => {
        if (b.trigger === 'onHoverEnter') {
          executeEvent(b);
        }
      });
    };
    const handleCustomHoverExit = () => {
      const behaviors = (obj?.events || []) || [];
      behaviors.forEach((b: any) => {
        if (b.trigger === 'onHoverExit') {
          executeEvent(b);
        }
      });
    };
    window.addEventListener(`trigger-tap-${id}`, handleCustomTap);
    window.addEventListener(`trigger-hover-enter-${id}`, handleCustomHoverEnter);
    window.addEventListener(`trigger-hover-exit-${id}`, handleCustomHoverExit);
    return () => {
      window.removeEventListener(`trigger-tap-${id}`, handleCustomTap);
      window.removeEventListener(`trigger-hover-enter-${id}`, handleCustomHoverEnter);
      window.removeEventListener(`trigger-hover-exit-${id}`, handleCustomHoverExit);
    };
  }, [isPreviewMode, id, handleInteract, (obj?.events || [])]);

  // Handle behavior animations dynamically with full R3F clock support
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Retrieve freshest state of current object and its parent from the store inside the frame loop to prevent stale closures
    const currentObj = useEditorStore.getState().objects[id];
    if (!currentObj) return;

    // Skip updating position/rotation/scale when actively transforming or dragging this object
    if (isSelected && isTransformDragging) return;
    if (isDraggingRef.current) return;

    const curActiveStateId = useEditorStore.getState().activeStateId;
    const activeStateObj = (!isPreviewMode && isSelected && curActiveStateId && curActiveStateId !== 'base' && currentObj.states)
      ? currentObj.states.find((s: any) => s.id === curActiveStateId)
      : null;

    let targetPos = activeStateObj?.position || currentObj.position;
    let targetRot = activeStateObj?.rotation || currentObj.rotation;
    let targetScl = activeStateObj?.scale || currentObj.scale;

    const activeTransitions = useEditorStore.getState().activeTransitions || {};
    const activeTransition = activeTransitions[id];

    if (activeTransition) {
      const now = performance.now() / 1000;
      const elapsed = now - activeTransition.triggerTime;
      const progress = Math.min(1, Math.max(0, elapsed / activeTransition.duration));
      const easedProgress = getEasingValue(activeTransition.easing, progress);

      // Look up transition target state properties
      const targetStateId = activeTransition.targetStateId;
      let finalTargetPos = [...currentObj.position];
      let finalTargetRot = [...currentObj.rotation];
      let finalTargetScl = [...currentObj.scale];

      if (targetStateId && targetStateId !== 'base' && currentObj.states) {
        const stateObj = currentObj.states.find((s: any) => s.id === targetStateId);
        if (stateObj) {
          finalTargetPos = [...stateObj.position];
          finalTargetRot = [...stateObj.rotation];
          finalTargetScl = [...stateObj.scale];
        }
      }

      const fromPos = activeTransition.fromPos;
      const fromRot = activeTransition.fromRot;
      const fromScl = activeTransition.fromScl;

      targetPos = [
        fromPos[0] + (finalTargetPos[0] - fromPos[0]) * easedProgress,
        fromPos[1] + (finalTargetPos[1] - fromPos[1]) * easedProgress,
        fromPos[2] + (finalTargetPos[2] - fromPos[2]) * easedProgress,
      ];

      targetRot = [
        fromRot[0] + (finalTargetRot[0] - fromRot[0]) * easedProgress,
        fromRot[1] + (finalTargetRot[1] - fromRot[1]) * easedProgress,
        fromRot[2] + (finalTargetRot[2] - fromRot[2]) * easedProgress,
      ];

      targetScl = [
        fromScl[0] + (finalTargetScl[0] - fromScl[0]) * easedProgress,
        fromScl[1] + (finalTargetScl[1] - fromScl[1]) * easedProgress,
        fromScl[2] + (finalTargetScl[2] - fromScl[2]) * easedProgress,
      ];
    }

    // Always initialize mesh transforms to the target design state
    meshRef.current.rotation.set(
      THREE.MathUtils.degToRad(targetRot[0]),
      THREE.MathUtils.degToRad(targetRot[1]),
      THREE.MathUtils.degToRad(targetRot[2])
    );
    meshRef.current.scale.set(targetScl[0], targetScl[1], targetScl[2]);
    meshRef.current.position.set(targetPos[0], targetPos[1], targetPos[2]);

    const isBillboard = !!(currentObj.properties?.billboard || currentObj.properties?.lookAtCamera);
    if (isBillboard) {
      meshRef.current.up.set(0, 0, 1);
      meshRef.current.lookAt(state.camera.position);
    }

    // Children execute their own behaviors directly (and follow parent transform changes naturally)
    const behavior = currentObj.properties.behavior;
    const hasBehavior = !!(behavior && behavior !== 'none');

    // Run behaviors only if live interaction is active (Preview mode or Play in Design View enabled)
    if (!isInteractiveActive || !hasBehavior) return;

    // Do not fight user interaction while actively dragging with gizmo or direct drag
    if (isDraggingRef.current) return;
    if (isTransformDragging && isSelected) return;

    const t = state.clock.getElapsedTime();
    const dt = delta;
    const speed = typeof currentObj.properties.behaviorSpeed === 'number' 
      ? currentObj.properties.behaviorSpeed 
      : 1.0;
    const intensity = typeof currentObj.properties.behaviorIntensity === 'number' 
      ? currentObj.properties.behaviorIntensity 
      : 1.0;
    const effectiveT = t * speed;

    if (behavior === 'hover' || behavior === 'float') {
      meshRef.current.position.z += Math.sin(effectiveT * 3) * 0.2 * intensity;
    } else if (behavior === 'bounce') {
      meshRef.current.position.z += Math.abs(Math.sin(effectiveT * 4)) * 0.5 * intensity;
    } else if (behavior === 'shake') {
      meshRef.current.position.x += (Math.random() - 0.5) * 0.1 * intensity;
      meshRef.current.position.y += (Math.random() - 0.5) * 0.1 * intensity;
    } else if (behavior === 'orbit') {
      const radius = 2 * intensity;
      meshRef.current.position.x += Math.cos(effectiveT) * radius;
      meshRef.current.position.y += Math.sin(effectiveT) * radius;
    }

    const spinAxis = currentObj.properties.spinAxis || 'z';
    const localAxis = new THREE.Vector3();
    if (spinAxis === 'x') localAxis.set(1, 0, 0);
    else if (spinAxis === 'y') localAxis.set(0, 1, 0);
    else localAxis.set(0, 0, 1);

    if (behavior === 'spin') {
      meshRef.current.rotateOnAxis(localAxis, effectiveT * 2.0 * intensity);
    } else if (behavior === 'spin-fast') {
      meshRef.current.rotateOnAxis(localAxis, effectiveT * 6.0 * intensity);
    } else if (behavior === 'pendulum') {
      meshRef.current.rotateOnAxis(localAxis, Math.sin(effectiveT * 2) * 0.4 * intensity);
    } else if (behavior === 'look-at-camera') {
      meshRef.current.up.set(0, 0, 1);
      meshRef.current.lookAt(state.camera.position);
    }

    if (behavior === 'pulse') {
      const scaleVal = 1 + Math.sin(effectiveT * 4.5) * 0.08 * intensity;
      meshRef.current.scale.multiplyScalar(scaleVal);
    } else if (behavior === 'scale-up') {
      const scaleVal = Math.min(1 + effectiveT * 0.5, 2.0); // Caps at 2.0
      meshRef.current.scale.multiplyScalar(scaleVal);
    } else if (behavior === 'scale-down') {
      const scaleVal = Math.max(1 - effectiveT * 0.2, 0.1); // Caps at 0.1
      meshRef.current.scale.multiplyScalar(scaleVal);
    }
    
    if (behavior === 'fade-in' || behavior === 'fade-out') {
      meshRef.current.traverse((child: any) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true;
          if (behavior === 'fade-in') {
            child.material.opacity = Math.min(t * 0.5, 1.0);
          } else {
            child.material.opacity = Math.max(1.0 - t * 0.5, 0.0);
          }
        }
      });
    }

    // Run Custom Script update callback loop
    if (isInteractiveActive && scriptCallbacksRef.current.onUpdate && (currentObj.properties.scriptEnabled ?? true)) {
      try {
        scriptCallbacksRef.current.onUpdate(t, dt);
      } catch (err) {
        console.error("onUpdate execution error:", err);
      }
    }

    // Evaluate Proximity Visual Event triggers
    if (isInteractiveActive) {
      const behaviors = (obj.events || []) || [];
      behaviors.forEach((b: any) => {
        if (b.trigger === 'onProximity') {
          const currentPos = new THREE.Vector3();
          meshRef.current!.getWorldPosition(currentPos);
          const dist = currentPos.distanceTo(state.camera.position);
          
          const threshold = parseFloat(b.proximityDistance) || 2.0;
          const isInside = dist <= threshold;
          const wasInside = wasProximityActiveRef.current[b.id] || false;

          if (isInside && !wasInside) {
            executeEvent(b);
          }
          wasProximityActiveRef.current[b.id] = isInside;
        }
      });
    }
  });

  const soundPresetsKey = (obj?.events || [])
    .filter((b: any) => b.action === 'playSound' && b.soundPreset)
    .map((b: any) => b.soundPreset)
    .join(',');

  useEffect(() => {
    if (!soundPresetsKey) return;
    soundPresetsKey.split(',').forEach(preset => {
      if (preset) {
        try {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = preset;
        } catch (e) {}
      }
    });
  }, [soundPresetsKey]);

  useEffect(() => {
    if (!isPreviewMode && !liveInteractionsInDesign) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;

      const behaviors = (obj?.events || []) || [];
      behaviors.forEach((b: any) => {
        if (b.trigger === 'onKeyDown') {
          if (!b.triggerKey || b.triggerKey.toLowerCase() === e.key.toLowerCase()) {
            executeEvent(b);
          }
        }
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;

      const behaviors = (obj?.events || []) || [];
      behaviors.forEach((b: any) => {
        if (b.trigger === 'onKeyUp') {
          if (!b.triggerKey || b.triggerKey.toLowerCase() === e.key.toLowerCase()) {
            executeEvent(b);
          }
        }
      });
    };

    const handleCustomTrigger = (e: any) => {
      if (e.detail && e.detail.targetId === id && e.detail.event) {
        executeEvent(e.detail.event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('ar-trigger-event', handleCustomTrigger);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('ar-trigger-event', handleCustomTrigger);
    };
  }, [isPreviewMode, liveInteractionsInDesign, id, (obj?.events || [])]);

  // Determine active target (persists across selection changes and preview mode)
  const activeTargetId = useEditorStore((state) => {
    if (state.selectedObjectId && state.objects[state.selectedObjectId]) {
      let currObj: any = state.objects[state.selectedObjectId];
      while (currObj) {
        if (currObj.type === 'imageTarget') return currObj.id;
        currObj = currObj.parentId ? state.objects[currObj.parentId] : null;
      }
    }
    if (state.lastSelectedTargetId && state.objects[state.lastSelectedTargetId]?.type === 'imageTarget') {
      return state.lastSelectedTargetId;
    }
    const firstTarget = Object.values(state.objects).find((o) => o.type === 'imageTarget');
    return firstTarget ? firstTarget.id : null;
  });

  // If this object is an imageTarget and is not the active target, hide it in the viewport
  if (obj && obj.type === 'imageTarget' && activeTargetId && obj.id !== activeTargetId) {
    return null;
  }

  if (!obj || !obj.visible) return null;

  const px = obj.pivot ? obj.pivot[0] : 0;
  const py = obj.pivot ? obj.pivot[1] : 0;
  const pz = obj.pivot ? obj.pivot[2] : 0;

  const rotation: [number, number, number] = [
    THREE.MathUtils.degToRad(obj.rotation[0]),
    THREE.MathUtils.degToRad(obj.rotation[1]),
    THREE.MathUtils.degToRad(obj.rotation[2]),
  ];

  function handleInteract(e?: any) {
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    if (!isInteractiveActive && obj.locked) return; // Prevent selection or clicks on locked items in 3D viewport
    if (obj.type === 'imageTarget') return; // Image targets are completely non-selectable
    if (e && e.stopPropagation) e.stopPropagation();
    
    console.log(`[Debug Log] Screen tapped on object: ${obj.name} (ID: ${id})`);
    if (!isPreviewMode) {
      const isMulti = useEditorStore.getState().isMultiSelectMode;
      selectObject(id, isMulti);
    }
    
    // Play sound ONLY if object has a live interaction 'play-sound' or 'click-sound' behavior, or via event actions
    const currentBehavior = getLatestEffectiveBehavior();
    if (isInteractiveActive && (currentBehavior === 'play-sound' || currentBehavior === 'click-sound')) {
      const sUrl = obj.properties.interactionSoundUrl || obj.properties.soundUrl || '/sounds/ui/click_soft.wav';
      const sVol = obj.properties.interactionSoundVolume ?? 0.5;
      playCachedAudio(sUrl, false, sVol);
    }

    // Button redirect in live interaction / preview
    if (isInteractiveActive && obj.type === 'button' && obj.properties.url) {
      window.open(obj.properties.url, '_blank', 'noopener,noreferrer');
    }

    // Run On Tap visual event rules
    if (isInteractiveActive) {
      const behaviors = (obj.events || []) || [];
      behaviors.forEach((b: any) => {
        if (b.trigger === 'onTap') {
          executeEvent(b);
        }
      });
    }

    // Run onTap script callbacks
    if (isInteractiveActive && scriptCallbacksRef.current.onTap && (obj.properties.scriptEnabled ?? true)) {
      try {
        scriptCallbacksRef.current.onTap();
      } catch (err) {
        console.error("onTap script callback error:", err);
      }
    }
  }

  const renderGeometry = () => {
    switch (obj.type) {
      case 'empty':
      case 'group':
        return (
          <group>
            {!isPreviewMode && (
              <group>
                {/* Center diamond marker */}
                <mesh scale={[0.14, 0.14, 0.14]}>
                  <octahedronGeometry args={[0.5]} />
                  <meshBasicMaterial color={isSelected ? "#38bdf8" : (obj.type === 'group' ? "#10b981" : "#a1a1aa")} wireframe transparent opacity={0.85} />
                </mesh>
                {/* Subdued Axis Lines */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.5, 0.015, 0.015]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.015, 0.5, 0.015]} />
                  <meshBasicMaterial color="#22c55e" />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.015, 0.015, 0.5]} />
                  <meshBasicMaterial color="#3b82f6" />
                </mesh>
              </group>
            )}
          </group>
        );
      case 'box':
        return (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <TexturedMaterial properties={obj.properties} defaultColor="#ffffff" />
          </mesh>
        );
      case 'sphere':
        return (
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <TexturedMaterial properties={obj.properties} defaultColor="#ffffff" />
          </mesh>
        );
      case 'plane':
        return (
          <mesh>
            <planeGeometry args={[1, 1]} />
            <TexturedMaterial properties={{ ...obj.properties, doubleSided: true }} defaultColor="#ffffff" />
          </mesh>
        );
      case 'circle':
        return (
          <mesh castShadow receiveShadow>
            <circleGeometry args={[obj.properties.radius || 0.5, obj.properties.segments || 64]} />
            <TexturedMaterial properties={{ ...obj.properties, doubleSided: true }} defaultColor="#ec4899" />
          </mesh>
        );
      case 'cylinder':
        return (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
              <TexturedMaterial properties={obj.properties} defaultColor="#ffffff" />
            </mesh>
          </group>
        );
      case 'cone':
        return (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <coneGeometry args={[0.5, 1, 32]} />
              <TexturedMaterial properties={obj.properties} defaultColor="#ffffff" />
            </mesh>
          </group>
        );
      case 'torus':
        return (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <torusGeometry args={[0.4, 0.12, 16, 64]} />
              <TexturedMaterial properties={obj.properties} defaultColor="#ffffff" />
            </mesh>
          </group>
        );
      case 'text':
        return (
          <Text
            color={obj.properties.color || '#ffffff'}
            fontSize={obj.properties.fontSize ?? 0.25}
            maxWidth={obj.properties.maxWidth ?? 4}
            lineHeight={obj.properties.lineHeight ?? 1.2}
            letterSpacing={obj.properties.letterSpacing ?? 0}
            textAlign={obj.properties.textAlign || 'center'}
            anchorX={obj.properties.anchorX || 'center'}
            anchorY={obj.properties.anchorY || 'middle'}
            outlineColor={obj.properties.outlineColor || '#000000'}
            outlineWidth={obj.properties.outlineWidth ?? 0.01}
            outlineOpacity={obj.properties.outlineOpacity ?? 1}
            font={obj.properties.fontUrl || undefined}
          >
            {obj.properties.text || 'Text Node'}
          </Text>
        );
      case 'image':
        return (
          <mesh>
            <planeGeometry args={[1, 1]} />
            <TexturedMaterial properties={{ ...obj.properties, doubleSided: true }} defaultColor="#ffffff" />
          </mesh>
        );
      case 'video':
        return (
          <mesh>
            <planeGeometry args={[1.6, 0.9]} />
            <VideoMeshMaterial properties={obj.properties} />
          </mesh>
        );
      case 'audio':
        return <AudioNodeRenderer properties={obj.properties} isPreviewMode={isPreviewMode} />;
      case 'light':
        return <LightNodeRenderer properties={obj.properties} isPreviewMode={isPreviewMode} />;
      case 'camera':
        return <CameraNodeRenderer obj={obj} isPreviewMode={isPreviewMode} />;
      case 'web3dScene':
        return <Web3DSceneRenderer obj={obj} isPreviewMode={isPreviewMode} onInteract={handleInteract} />;
      case 'button':
        return <Interactive3DButton obj={obj} isPreviewMode={isPreviewMode} onInteract={handleInteract} />;
      case 'youtube':
        return <InteractiveYoutubeScreen obj={obj} isPreviewMode={isPreviewMode} onInteract={handleInteract} />;
      case 'imageTarget':
        return (
          <ErrorBoundary fallback={null}>
            <Suspense fallback={<ImageTargetLoadingFallback obj={obj} />}>
              <ImageTargetRenderer obj={obj} />
            </Suspense>
          </ErrorBoundary>
        );
      case 'pyramid':
        return (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow={obj.properties?.castShadow !== false} receiveShadow={obj.properties?.receiveShadow !== false}>
              <coneGeometry args={[0.7, 1, 4]} />
              <TexturedMaterial properties={obj.properties} defaultColor="#eab308" />
            </mesh>
          </group>
        );
      case 'capsule':
        return (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow={obj.properties?.castShadow !== false} receiveShadow={obj.properties?.receiveShadow !== false}>
              <capsuleGeometry args={[0.3, 0.6, 16, 32]} />
              <TexturedMaterial properties={obj.properties} defaultColor="#a855f7" />
            </mesh>
          </group>
        );
      case 'dodecahedron':
        return (
          <mesh castShadow={obj.properties?.castShadow !== false} receiveShadow={obj.properties?.receiveShadow !== false}>
            <dodecahedronGeometry args={[0.5]} />
            <TexturedMaterial properties={obj.properties} defaultColor="#ec4899" />
          </mesh>
        );
      case 'octahedron':
        return (
          <mesh castShadow={obj.properties?.castShadow !== false} receiveShadow={obj.properties?.receiveShadow !== false}>
            <octahedronGeometry args={[0.5]} />
            <TexturedMaterial properties={obj.properties} defaultColor="#10b981" />
          </mesh>
        );
      case 'icosahedron':
        return (
          <mesh castShadow={obj.properties?.castShadow !== false} receiveShadow={obj.properties?.receiveShadow !== false}>
            <icosahedronGeometry args={[0.5]} />
            <TexturedMaterial properties={obj.properties} defaultColor="#06b6d4" />
          </mesh>
        );
      case 'knot':
        return (
          <mesh castShadow={obj.properties?.castShadow !== false} receiveShadow={obj.properties?.receiveShadow !== false}>
            <torusKnotGeometry args={[0.3, 0.1, 64, 16]} />
            <TexturedMaterial properties={obj.properties} defaultColor="#f97316" />
          </mesh>
        );
      case 'model':
        if (obj.properties.url && obj.properties.url.startsWith('primitive:')) {
          return <PrimitiveModelRenderer url={obj.properties.url} properties={obj.properties} />;
        }
        return obj.properties.url ? (
          <ErrorBoundary fallback={
            <mesh castShadow={obj.properties?.castShadow !== false} receiveShadow={obj.properties?.receiveShadow !== false}>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <TexturedMaterial properties={obj.properties} defaultColor="#6366f1" />
            </mesh>
          }>
            <Suspense fallback={<ModelLoadingFallback />}>
              <GLTFModel url={obj.properties.url} properties={obj.properties} id={id} />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <mesh castShadow={obj.properties?.castShadow !== false} receiveShadow={obj.properties?.receiveShadow !== false}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <TexturedMaterial properties={obj.properties} defaultColor="#3b82f6" />
          </mesh>
        );
      case 'hotspot':
        return <Hotspot3DRenderer obj={obj} isPreviewMode={isPreviewMode} onInteract={handleInteract} />;
      case 'icon':
        return <Spline3DIconRenderer obj={obj} isPreviewMode={isPreviewMode} onInteract={handleInteract} />;
      case 'icon2d':
        return <Spline2DIconRenderer obj={obj} isPreviewMode={isPreviewMode} onInteract={handleInteract} />;
      default:
        return null;
    }
  };

  return (
    <group 
      ref={meshRef}
      name={id}
      position={obj.position}
      rotation={rotation}
      rotation-order="YXZ"
      scale={obj.scale}
      visible={obj.visible ?? true}
      userData={{ isSceneObject: true }}
      onClick={handleInteract}
      onPointerOver={(e) => {
        const canDrag = !transformGizmoEnabled || (isInteractiveActive && (getLatestEffectiveBehavior() === 'draggable' || getLatestEffectiveBehavior() === 'drag'));
        if (canDrag && !obj.locked) {
          document.body.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
        } else if (isInteractiveActive && obj.properties.cursor && !obj.properties.ignoreClicks) {
          document.body.style.cursor = obj.properties.cursor;
        }
        if (isInteractiveActive) {
          e.stopPropagation();
          const behaviors = (obj.events || []) || [];
          behaviors.forEach((b: any) => {
            if (b.trigger === 'onHoverEnter') {
              executeEvent(b);
            }
          });
        }
      }}
      onPointerOut={(e) => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        const canDrag = !transformGizmoEnabled || (isInteractiveActive && (getLatestEffectiveBehavior() === 'draggable' || getLatestEffectiveBehavior() === 'drag'));
        if (canDrag && !isDraggingRef.current) {
          document.body.style.cursor = 'auto';
        } else if (isInteractiveActive && obj.properties.cursor && !obj.properties.ignoreClicks) {
          document.body.style.cursor = 'auto';
        }
        if (isInteractiveActive) {
          const behaviors = (obj.events || []) || [];
          behaviors.forEach((b: any) => {
            if (b.trigger === 'onHoverExit') {
              executeEvent(b);
            }
          });
        }
      }}
      onPointerDown={(e) => {
        if (obj.type === 'imageTarget') return; // Image targets are non-selectable
        // Start long-press detection to toggle/activate multi-object selection
        if (!isPreviewMode && !obj.locked) {
          if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
          const clientX = (e as any).clientX ?? 0;
          const clientY = (e as any).clientY ?? 0;
          pointerDownScreenPosRef.current = { x: clientX, y: clientY };
          longPressTimerRef.current = setTimeout(() => {
            isLongPressTriggeredRef.current = true;
            const editor = useEditorStore.getState();
            editor.setMultiSelectMode(true);
            editor.selectObject(id, true);
            editor.addToast(`Multi-selection active: added ${obj.name}`);
            try {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([40, 30, 40]);
              }
            } catch (_) {}
          }, 450);
        }

        const canDrag = !transformGizmoEnabled || (isInteractiveActive && (getLatestEffectiveBehavior() === 'draggable' || getLatestEffectiveBehavior() === 'drag'));
        if (canDrag && !obj.locked) {
          e.stopPropagation();
          if (!isSelected) {
            const isMulti = useEditorStore.getState().isMultiSelectMode;
            selectObject(id, isMulti);
          }
          isDraggingRef.current = true;
          hasDraggedRef.current = false;
          useEditorStore.getState().setIsDraggableDragging(true);

          if (controls) {
            controls.enabled = false;
          }

          if (meshRef.current) {
            dragStartPosRef.current.copy(meshRef.current.position);
          }

          const worldPos = new THREE.Vector3();
          meshRef.current?.getWorldPosition(worldPos);

          const camDir = new THREE.Vector3();
          camera.getWorldDirection(camDir);
          const dotZ = Math.abs(camDir.z);
          // If viewing surface from an angle or above, drag on XY plane (normal Z); otherwise camera-facing plane
          if (dotZ > 0.35) {
            dragPlaneRef.current.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), worldPos);
          } else {
            dragPlaneRef.current.setFromNormalAndCoplanarPoint(camDir.clone().negate(), worldPos);
          }

          const intersection = new THREE.Vector3();
          if (e.ray && e.ray.intersectPlane(dragPlaneRef.current, intersection)) {
            dragOffsetRef.current.subVectors(worldPos, intersection);
          } else {
            dragOffsetRef.current.set(0, 0, 0);
          }

          document.body.style.cursor = 'grabbing';
        }

        if (isInteractiveActive) {
          e.stopPropagation();
          const behaviors = (obj.events || []) || [];
          behaviors.forEach((b: any) => {
            if (b.trigger === 'onPointerDown') {
              executeEvent(b);
            }
          });
        }
      }}
      onPointerUp={(e) => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        if (isDraggingRef.current) {
          e.stopPropagation();
          isDraggingRef.current = false;
          useEditorStore.getState().setIsDraggableDragging(false);
          const canDrag = !transformGizmoEnabled || (isInteractiveActive && (getLatestEffectiveBehavior() === 'draggable' || getLatestEffectiveBehavior() === 'drag'));
          document.body.style.cursor = canDrag ? 'grab' : 'auto';

          if (controls) {
            controls.enabled = true;
          }

          if (hasDraggedRef.current && meshRef.current) {
            const finalPos: [number, number, number] = [
              Number(meshRef.current.position.x.toFixed(3)),
              Number(meshRef.current.position.y.toFixed(3)),
              Number(meshRef.current.position.z.toFixed(3)),
            ];
            updateObject(id, { position: finalPos });
          }
        }

        if (isInteractiveActive) {
          e.stopPropagation();
          const behaviors = (obj.events || []) || [];
          behaviors.forEach((b: any) => {
            if (b.trigger === 'onPointerUp') {
              executeEvent(b);
            }
          });
        }
      }}
      onPointerMove={(e) => {
        if (longPressTimerRef.current) {
          const clientX = (e as any).clientX ?? 0;
          const clientY = (e as any).clientY ?? 0;
          const dx = Math.abs(clientX - pointerDownScreenPosRef.current.x);
          const dy = Math.abs(clientY - pointerDownScreenPosRef.current.y);
          if (dx > 10 || dy > 10) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
        }
        const canDrag = !transformGizmoEnabled || (isInteractiveActive && (getLatestEffectiveBehavior() === 'draggable' || getLatestEffectiveBehavior() === 'drag'));
        if (isDraggingRef.current && canDrag) {
          e.stopPropagation();
          hasDraggedRef.current = true;
          const intersection = new THREE.Vector3();
          if (e.ray && e.ray.intersectPlane(dragPlaneRef.current, intersection)) {
            const targetWorld = intersection.clone().add(dragOffsetRef.current);
            const targetLocal = targetWorld.clone();
            if (meshRef.current?.parent) {
              meshRef.current.parent.worldToLocal(targetLocal);
            }
            const isShift = (e.nativeEvent as PointerEvent)?.shiftKey ?? false;
            const snapped = computeSnappedPosition(targetLocal, isShift);
            meshRef.current?.position.copy(snapped.position);
            useEditorStore.getState().setActiveTransformCallout({
              active: true,
              objectId: id,
              objectName: obj?.name || 'Object',
              mode: 'translate',
              x: Number(snapped.position.x.toFixed(3)),
              y: Number(snapped.position.y.toFixed(3)),
              z: Number(snapped.position.z.toFixed(3)),
              unit: 'm',
              isSnapped: snapped.isSnapped,
              snapLabel: snapped.snapLabel || (useEditorStore.getState().gridSnapEnabled ? `Snap ${useEditorStore.getState().gridSnapIncrement}m` : undefined)
            });
          }
        }

        if (isInteractiveActive) {
          const behaviors = (obj.events || []) || [];
          behaviors.forEach((b: any) => {
            if (b.trigger === 'onPointerMove') {
              executeEvent(b);
            }
          });
        }
      }}
      onWheel={(e) => {
        if (isInteractiveActive) {
          const behaviors = (obj.events || []) || [];
          behaviors.forEach((b: any) => {
            if (b.trigger === 'onScroll') {
              executeEvent(b);
            }
          });
        }
      }}
      raycast={obj.properties.ignoreClicks || obj.type === 'imageTarget' ? () => null : undefined}
    >
      {/* Pivot-offset group */}
      <group position={[-px, -py, -pz]}>
        <PivotNormalizer enabled={['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane', 'circle', 'pyramid', 'capsule', 'dodecahedron', 'octahedron', 'icosahedron', 'knot', 'model'].includes(obj.type)}>
          {renderGeometry()}
        </PivotNormalizer>
        {collisionDebuggerEnabled && <CollisionDebuggerOverlay obj={obj} />}
      </group>

      {/* Render child scene objects directly under the main parent group */}
      {obj.children.map(childId => (
        <MemoizedObjectRenderer key={childId} id={childId} />
      ))}
    </group>
  );
}

const MemoizedObjectRenderer = React.memo(ObjectRenderer);

function ProjectedPositionsUpdater() {
  const { scene, camera, size } = useThree();
  const objects = useEditorStore(state => state.objects);
  
  useFrame(() => {
    const proj: Record<string, { x: number; y: number; visible: boolean }> = {};
    const tempV = new THREE.Vector3();
    
    Object.keys(objects).forEach(id => {
      const obj3d = scene.getObjectByName(id);
      if (obj3d) {
        obj3d.getWorldPosition(tempV);
        tempV.project(camera);
        const isBehind = tempV.z > 1;
        
        const x = (tempV.x * 0.5 + 0.5) * size.width;
        const y = (-(tempV.y * 0.5) + 0.5) * size.height;
        
        proj[id] = { x, y, visible: !isBehind };
      }
    });
    
    (useEditorStore.getState() as any).projectedPositions = proj;
  });
  
  return null;
}

function isObjectInScene(obj: THREE.Object3D | null | undefined, scene: THREE.Scene): boolean {
  if (!obj) return false;
  let current: THREE.Object3D | null = obj;
  while (current) {
    if (current === scene) return true;
    current = current.parent;
  }
  return false;
}

function ThumbnailCapturer() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const currentProjectId = useEditorStore((state) => state.currentProjectId);
  const lastSavedTime = useEditorStore((state) => state.lastSavedTime);
  const updateProjectThumbnail = useEditorStore((state) => state.updateProjectThumbnail);
  const lastCapturedTime = useRef<number | null>(null);

  useEffect(() => {
    const project = useEditorStore.getState().projectsList.find(p => p.id === currentProjectId);
    const needsInitialSnapshot = project && !project.thumbnail;

    if ((lastSavedTime && lastSavedTime !== lastCapturedTime.current) || needsInitialSnapshot) {
      if (lastSavedTime) lastCapturedTime.current = lastSavedTime;
      const timer = setTimeout(() => {
        try {
          // Save camera state
          const origPos = camera.position.clone();
          const origQuat = camera.quaternion.clone();

          // Calculate bounding box containing all visible meshes/objects
          const box = new THREE.Box3();
          let count = 0;

          scene.traverse((node) => {
            if (
              node.visible &&
              (node as THREE.Mesh).isMesh &&
              !node.name.includes('gizmo') &&
              !node.name.includes('grid') &&
              !node.name.includes('Transform') &&
              !node.name.includes('reticle') &&
              !node.name.includes('helper') &&
              node.type !== 'LineSegments'
            ) {
              box.expandByObject(node);
              count++;
            }
          });

          if (count === 0 || box.isEmpty()) {
            box.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.5, 1.5, 1.5));
          }

          const center = new THREE.Vector3();
          box.getCenter(center);
          const size = new THREE.Vector3();
          box.getSize(size);

          const maxDim = Math.max(size.x, size.y, size.z, 0.5);

          // Compute distance to frame all objects comfortably within camera FOV
          let distance = 2.0;
          if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
            const perspCam = camera as THREE.PerspectiveCamera;
            const fovRad = (perspCam.fov * Math.PI) / 180;
            distance = Math.abs(maxDim / (2 * Math.tan(fovRad / 2))) * 1.35;
          }
          distance = Math.max(distance, 1.2);

          // Position camera looking at box center from a nice diagonal view angle
          const offset = new THREE.Vector3(0.5, 0.4, 0.85).normalize().multiplyScalar(distance);
          camera.position.copy(center).add(offset);
          camera.lookAt(center);
          camera.updateMatrixWorld(true);

          // Render framed snapshot
          gl.render(scene, camera);
          const dataUrl = gl.domElement.toDataURL('image/jpeg', 0.6);

          // Restore original camera position and rotation immediately
          camera.position.copy(origPos);
          camera.quaternion.copy(origQuat);
          camera.updateMatrixWorld(true);

          if (dataUrl && dataUrl.length > 100) {
            updateProjectThumbnail(currentProjectId, dataUrl);
          }
        } catch (e) {
          console.error('Failed to capture framed thumbnail:', e);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [lastSavedTime, gl, scene, camera, currentProjectId, updateProjectThumbnail]);

  return null;
}

// Helper function to snap transform gizmo position to ground surface, object surfaces, and alignments
function computeGizmoSnapPosition(
  pos: THREE.Vector3,
  objectId: string,
  objects: Record<string, SceneObject>,
  gridSnapIncrement: number = 0.1
) {
  const surfaceSnapEnabled = useEditorStore.getState().surfaceSnapEnabled;
  return computeComprehensiveSnapPosition(pos, objectId, objects, gridSnapIncrement, { surfaceSnapEnabled });
}

function TransformController({ 
  orbitControlsRef, 
  activeAxisView 
}: { 
  orbitControlsRef?: React.RefObject<any>; 
  activeAxisView?: string; 
}) {
  const { scene } = useThree();
  const selectedObjectId = useEditorStore(state => state.selectedObjectId);
  const objects = useEditorStore(state => state.objects);
  const transformMode = useEditorStore(state => state.transformMode);
  const transformSpace = useEditorStore(state => state.transformSpace);
  const transformGizmoEnabled = useEditorStore(state => state.transformGizmoEnabled);
  const updateObject = useEditorStore(state => state.updateObject);
  const isPreviewMode = useEditorStore(state => state.isPreviewMode);
  const cameraType = useEditorStore(state => state.cameraType);
  const controlsRef = useRef<any>(null);

  const normView = (activeAxisView || '').toUpperCase();
  const isTopOrBottomView = ['TOP', 'Z', '-Z', 'BOTTOM'].includes(normView);
  const isFrontOrBackView = ['FRONT', 'Y', '-Y', 'BACK'].includes(normView);
  const isSideOrLeftRightView = ['SIDE', 'RIGHT', 'LEFT', 'X', '-X'].includes(normView);
  const isPlanarOrtho = isTopOrBottomView || isFrontOrBackView || isSideOrLeftRightView;

  // Filter gizmo axes visibility to strictly match the orthographic view plane
  let allowX = true;
  let allowY = true;
  let allowZ = true;

  if (isPlanarOrtho) {
    if (isTopOrBottomView) {
      // Top/Bottom (X-Y Plane):
      // Move/Scale: X & Y allowed, Z hidden (perpendicular to screen)
      // Rotate: Z allowed (in-plane spin), X & Y hidden
      if (transformMode === 'rotate') {
        allowX = false;
        allowY = false;
        allowZ = true;
      } else {
        allowX = true;
        allowY = true;
        allowZ = false;
      }
    } else if (isFrontOrBackView) {
      // Front/Back (X-Z Plane):
      // Move/Scale: X & Z allowed, Y hidden (perpendicular to screen)
      // Rotate: Y allowed (in-plane spin), X & Z hidden
      if (transformMode === 'rotate') {
        allowX = false;
        allowY = true;
        allowZ = false;
      } else {
        allowX = true;
        allowY = false;
        allowZ = true;
      }
    } else if (isSideOrLeftRightView) {
      // Side/Right/Left (Y-Z Plane):
      // Move/Scale: Y & Z allowed, X hidden (perpendicular to screen)
      // Rotate: X allowed (in-plane spin), Y & Z hidden
      if (transformMode === 'rotate') {
        allowX = true;
        allowY = false;
        allowZ = false;
      } else {
        allowX = false;
        allowY = true;
        allowZ = true;
      }
    }
  }

  const gridSnapEnabled = useEditorStore(state => state.gridSnapEnabled);
  const gridSnapIncrement = useEditorStore(state => state.gridSnapIncrement);
  const rotationSnapEnabled = useEditorStore(state => state.rotationSnapEnabled);
  const rotationSnapIncrement = useEditorStore(state => state.rotationSnapIncrement);
  const scaleSnapEnabled = useEditorStore(state => (state as any).scaleSnapEnabled ?? true);
  const scaleSnapIncrement = useEditorStore(state => (state as any).scaleSnapIncrement ?? 0.1);
  const lockedAxes = useEditorStore(state => state.lockedAxes);

  const selectedObjectIds = useEditorStore(state => state.selectedObjectIds);
  const isMultiSelecting = selectedObjectIds && selectedObjectIds.length > 1;

  const multiPivotGroupRef = useRef<THREE.Group | null>(null);
  if (!multiPivotGroupRef.current) {
    multiPivotGroupRef.current = new THREE.Group();
    multiPivotGroupRef.current.name = '__multi_selection_pivot__';
  }

  useEffect(() => {
    const grp = multiPivotGroupRef.current;
    if (grp) {
      scene.add(grp);
    }
    return () => {
      if (grp) {
        scene.remove(grp);
      }
    };
  }, [scene]);

  // Compute selection center vector for multi-selection
  const selectionCenterPos = useMemo(() => {
    if (!isMultiSelecting || !selectedObjectIds) return null;
    let sumX = 0, sumY = 0, sumZ = 0, count = 0;
    selectedObjectIds.forEach(id => {
      const o = objects[id];
      if (o && o.visible && !o.locked && o.type !== 'imageTarget') {
        sumX += o.position[0];
        sumY += o.position[1];
        sumZ += o.position[2];
        count++;
      }
    });
    if (count === 0) return null;
    return new THREE.Vector3(sumX / count, sumY / count, sumZ / count);
  }, [isMultiSelecting, selectedObjectIds, objects]);

  // Keep pivot group centered when not actively dragging
  useEffect(() => {
    if (isMultiSelecting && selectionCenterPos && multiPivotGroupRef.current && !isTransformDragging) {
      multiPivotGroupRef.current.position.copy(selectionCenterPos);
      multiPivotGroupRef.current.rotation.set(0, 0, 0);
      multiPivotGroupRef.current.scale.set(1, 1, 1);
      multiPivotGroupRef.current.updateMatrixWorld(true);
    }
  }, [isMultiSelecting, selectionCenterPos]);

  const obj = selectedObjectId ? objects[selectedObjectId] : null;

  const isTransformable = Boolean(
    !isPreviewMode &&
    (
      (isMultiSelecting && selectionCenterPos) ||
      (selectedObjectId && obj && obj.visible && !obj.locked && obj.type !== 'imageTarget' && !['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed', 'icon2d'].includes(obj.type) && !(obj.type === 'youtube' && obj.properties?.displayMode === '2d'))
    )
  );

  // Resolve target directly from the scene graph with useMemo
  const target = useMemo<THREE.Object3D | null>(() => {
    if (!isTransformable) return null;
    if (isMultiSelecting && selectionCenterPos && multiPivotGroupRef.current) {
      return multiPivotGroupRef.current;
    }
    if (!selectedObjectId) return null;
    const found = scene.getObjectByName(selectedObjectId);
    if (found && found.parent && isObjectInScene(found, scene)) {
      return found;
    }
    return null;
  }, [isTransformable, isMultiSelecting, selectionCenterPos, selectedObjectId, scene, objects]);

  // Safe ref binder that patches updateMatrixWorld to prevent three-stdlib error
  const bindControls = useCallback((controls: any) => {
    if (!controls) {
      if (controlsRef.current) {
        try {
          controlsRef.current.detach();
        } catch (e) {}
      }
      controlsRef.current = null;
      return;
    }
    controlsRef.current = controls;

    if (!controls.__safePatched) {
      controls.__safePatched = true;
      const originalUpdateMatrixWorld = controls.updateMatrixWorld.bind(controls);
      controls.updateMatrixWorld = function (force?: boolean) {
        if (this.object) {
          if (!this.object.parent || (this.object.parent as any) === null || !isObjectInScene(this.object, scene)) {
            try {
              this.detach();
            } catch (e) {}
            return;
          }
        }
        return originalUpdateMatrixWorld(force);
      };
    }
  }, [scene]);

  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        try {
          controlsRef.current.detach();
        } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    if (!target && controlsRef.current && controlsRef.current.object) {
      try {
        controlsRef.current.detach();
      } catch (e) {}
    }
  }, [target]);

  const multiInitialTransformsRef = useRef<Map<string, {
    pos: THREE.Vector3;
    rot: THREE.Euler;
    scl: THREE.Vector3;
  }>>(new Map());

  const handleTransform = useCallback(() => {
    if (!target || !selectedObjectId) return;
    const state = useEditorStore.getState();
    const allTargetIds = (state.selectedObjectIds && state.selectedObjectIds.length > 0)
      ? state.selectedObjectIds
      : [selectedObjectId];

    let finalPos = target.position.clone();
    if (gridSnapEnabled && transformMode === 'translate') {
      const snapResult = computeGizmoSnapPosition(finalPos, selectedObjectId, state.objects, gridSnapIncrement);
      finalPos = snapResult.position;
      target.position.copy(finalPos);
    }

    const initPrimary = initialTransformRef.current;
    if (initPrimary && isPlanarOrtho) {
      if (isTopOrBottomView) {
        finalPos.z = initPrimary.pos.z;
        target.position.z = initPrimary.pos.z;
        target.rotation.x = initPrimary.rot.x;
        target.rotation.y = initPrimary.rot.y;
        target.scale.z = initPrimary.scl.z;
      } else if (isFrontOrBackView) {
        finalPos.y = initPrimary.pos.y;
        target.position.y = initPrimary.pos.y;
        target.rotation.x = initPrimary.rot.x;
        target.rotation.z = initPrimary.rot.z;
        target.scale.y = initPrimary.scl.y;
      } else if (isSideOrLeftRightView) {
        finalPos.x = initPrimary.pos.x;
        target.position.x = initPrimary.pos.x;
        target.rotation.y = initPrimary.rot.y;
        target.rotation.z = initPrimary.rot.z;
        target.scale.x = initPrimary.scl.x;
      }
    }

    const deltaPos = initPrimary ? finalPos.clone().sub(initPrimary.pos) : new THREE.Vector3();
    const deltaRotX = initPrimary ? THREE.MathUtils.radToDeg(target.rotation.x - initPrimary.rot.x) : 0;
    const deltaRotY = initPrimary ? THREE.MathUtils.radToDeg(target.rotation.y - initPrimary.rot.y) : 0;
    const deltaRotZ = initPrimary ? THREE.MathUtils.radToDeg(target.rotation.z - initPrimary.rot.z) : 0;
    const ratioX = (initPrimary && initPrimary.scl.x !== 0) ? target.scale.x / initPrimary.scl.x : 1;
    const ratioY = (initPrimary && initPrimary.scl.y !== 0) ? target.scale.y / initPrimary.scl.y : 1;
    const ratioZ = (initPrimary && initPrimary.scl.z !== 0) ? target.scale.z / initPrimary.scl.z : 1;

    allTargetIds.forEach((id) => {
      if (id === selectedObjectId) {
        updateObject(id, {
          position: [
            Number(finalPos.x.toFixed(3)),
            Number(finalPos.y.toFixed(3)),
            Number(finalPos.z.toFixed(3))
          ],
          rotation: [
            Number(THREE.MathUtils.radToDeg(target.rotation.x).toFixed(2)),
            Number(THREE.MathUtils.radToDeg(target.rotation.y).toFixed(2)),
            Number(THREE.MathUtils.radToDeg(target.rotation.z).toFixed(2))
          ],
          scale: [
            Number(target.scale.x.toFixed(3)),
            Number(target.scale.y.toFixed(3)),
            Number(target.scale.z.toFixed(3))
          ]
        });
      } else {
        const init = multiInitialTransformsRef.current.get(id);
        if (init) {
          updateObject(id, {
            position: [
              Number((init.pos.x + deltaPos.x).toFixed(3)),
              Number((init.pos.y + deltaPos.y).toFixed(3)),
              Number((init.pos.z + deltaPos.z).toFixed(3))
            ],
            rotation: [
              Number((THREE.MathUtils.radToDeg(init.rot.x) + deltaRotX).toFixed(2)),
              Number((THREE.MathUtils.radToDeg(init.rot.y) + deltaRotY).toFixed(2)),
              Number((THREE.MathUtils.radToDeg(init.rot.z) + deltaRotZ).toFixed(2))
            ],
            scale: [
              Number((init.scl.x * ratioX).toFixed(3)),
              Number((init.scl.y * ratioY).toFixed(3)),
              Number((init.scl.z * ratioZ).toFixed(3))
            ]
          });
        }
      }
    });
  }, [target, selectedObjectId, updateObject, gridSnapEnabled, transformMode, gridSnapIncrement]);

  // Ensure gizmo controls are always rendered on top of 3D models without depth clipping
  const lastTraversedHelperRef = useRef<any>(null);
  useFrame(() => {
    const controls = controlsRef.current;
    if (controls) {
      if (controls.object && (!controls.object.parent || !isObjectInScene(controls.object, scene))) {
        try {
          controls.detach();
        } catch (e) {}
      }

      const helper = controls.getHelper ? controls.getHelper() : (controls as any)._gizmo;
      if (helper && helper !== lastTraversedHelperRef.current) {
        lastTraversedHelperRef.current = helper;
        helper.traverse((child: any) => {
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m: any) => {
              m.depthTest = false;
              m.depthWrite = false;
              m.transparent = true;
            });
            child.renderOrder = 99999;
          }
        });
      }
    }
  });

  const initialTransformRef = useRef<{
    pos: THREE.Vector3;
    rot: THREE.Euler;
    scl: THREE.Vector3;
  } | null>(null);
  const calloutTimeoutRef = useRef<any>(null);

  const updateCallout = useCallback((
    tgt: THREE.Object3D,
    active: boolean,
    isSnapped = false,
    snapText?: string,
    axisOverride?: string
  ) => {
    if (!selectedObjectId) return;
    const state = useEditorStore.getState();
    const currentObj = state.objects[selectedObjectId];
    const name = currentObj?.name || 'Object';
    const init = initialTransformRef.current;
    const allTargetIds = (state.selectedObjectIds && state.selectedObjectIds.length > 0)
      ? state.selectedObjectIds
      : [selectedObjectId];
    const selectedCount = allTargetIds.length;

    const detectedAxis = axisOverride || (controlsRef.current as any)?.axis || undefined;

    if (transformMode === 'translate') {
      const x = Number(tgt.position.x.toFixed(3));
      const y = Number(tgt.position.y.toFixed(3));
      const z = Number(tgt.position.z.toFixed(3));
      const deltaX = init ? Number((tgt.position.x - init.pos.x).toFixed(3)) : 0;
      const deltaY = init ? Number((tgt.position.y - init.pos.y).toFixed(3)) : 0;
      const deltaZ = init ? Number((tgt.position.z - init.pos.z).toFixed(3)) : 0;
      state.setActiveTransformCallout({
        active,
        objectId: selectedObjectId,
        objectName: name,
        mode: 'translate',
        axis: detectedAxis,
        space: state.transformSpace,
        selectedCount,
        x,
        y,
        z,
        deltaX,
        deltaY,
        deltaZ,
        unit: 'm',
        isSnapped: isSnapped || gridSnapEnabled,
        snapLabel: snapText || (gridSnapEnabled ? `Snap ${gridSnapIncrement}m` : undefined)
      });
    } else if (transformMode === 'rotate') {
      const degX = Number(THREE.MathUtils.radToDeg(tgt.rotation.x).toFixed(1));
      const degY = Number(THREE.MathUtils.radToDeg(tgt.rotation.y).toFixed(1));
      const degZ = Number(THREE.MathUtils.radToDeg(tgt.rotation.z).toFixed(1));
      const deltaX = init ? Number((THREE.MathUtils.radToDeg(tgt.rotation.x - init.rot.x)).toFixed(1)) : 0;
      const deltaY = init ? Number((THREE.MathUtils.radToDeg(tgt.rotation.y - init.rot.y)).toFixed(1)) : 0;
      const deltaZ = init ? Number((THREE.MathUtils.radToDeg(tgt.rotation.z - init.rot.z)).toFixed(1)) : 0;
      state.setActiveTransformCallout({
        active,
        objectId: selectedObjectId,
        objectName: name,
        mode: 'rotate',
        axis: detectedAxis,
        space: state.transformSpace,
        selectedCount,
        x: degX,
        y: degY,
        z: degZ,
        deltaX,
        deltaY,
        deltaZ,
        unit: '°',
        isSnapped: rotationSnapEnabled,
        snapLabel: rotationSnapEnabled ? `${rotationSnapIncrement}°` : undefined
      });
    } else if (transformMode === 'scale') {
      const sx = Number(tgt.scale.x.toFixed(2));
      const sy = Number(tgt.scale.y.toFixed(2));
      const sz = Number(tgt.scale.z.toFixed(2));
      const deltaX = init ? Number((tgt.scale.x - init.scl.x).toFixed(2)) : 0;
      const deltaY = init ? Number((tgt.scale.y - init.scl.y).toFixed(2)) : 0;
      const deltaZ = init ? Number((tgt.scale.z - init.scl.z).toFixed(2)) : 0;
      state.setActiveTransformCallout({
        active,
        objectId: selectedObjectId,
        objectName: name,
        mode: 'scale',
        axis: detectedAxis,
        space: state.transformSpace,
        selectedCount,
        x: sx,
        y: sy,
        z: sz,
        deltaX,
        deltaY,
        deltaZ,
        unit: 'x'
      });
    }
  }, [selectedObjectId, transformMode, gridSnapEnabled, gridSnapIncrement, rotationSnapEnabled, rotationSnapIncrement]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const axisChangedCallback = (e: any) => {
      const activeAxis = e?.value || (controls as any)?.axis || null;
      useEditorStore.getState().setActiveTransformAxis(activeAxis);
    };

    const draggingCallback = (e: any) => {
      const isDragging = !!e.value;
      isTransformDragging = isDragging;

      if (orbitControlsRef && orbitControlsRef.current) {
        orbitControlsRef.current.enabled = !isDragging;
      }

      if (isDragging) {
        if (calloutTimeoutRef.current) {
          clearTimeout(calloutTimeoutRef.current);
          calloutTimeoutRef.current = null;
        }
        if (target) {
          initialTransformRef.current = {
            pos: target.position.clone(),
            rot: target.rotation.clone(),
            scl: target.scale.clone()
          };

          const state = useEditorStore.getState();
          const allTargetIds = (state.selectedObjectIds && state.selectedObjectIds.length > 0)
            ? state.selectedObjectIds
            : (selectedObjectId ? [selectedObjectId] : []);

          multiInitialTransformsRef.current.clear();
          allTargetIds.forEach((id) => {
            const o = state.objects[id];
            if (o) {
              multiInitialTransformsRef.current.set(id, {
                pos: new THREE.Vector3(...o.position),
                rot: new THREE.Euler(
                  THREE.MathUtils.degToRad(o.rotation[0]),
                  THREE.MathUtils.degToRad(o.rotation[1]),
                  THREE.MathUtils.degToRad(o.rotation[2])
                ),
                scl: new THREE.Vector3(...o.scale)
              });
            }
          });

          const activeAxis = (controls as any).axis || undefined;
          useEditorStore.getState().setActiveTransformAxis(activeAxis || null);
          updateCallout(target, true, false, undefined, activeAxis);
        }
      } else {
        handleTransform();
        if (target) {
          const activeAxis = (controls as any).axis || undefined;
          updateCallout(target, true, false, undefined, activeAxis);
          if (calloutTimeoutRef.current) clearTimeout(calloutTimeoutRef.current);
          calloutTimeoutRef.current = setTimeout(() => {
            useEditorStore.getState().setActiveTransformCallout(null);
            useEditorStore.getState().setActiveTransformAxis(null);
          }, 1600);
        } else {
          useEditorStore.getState().setActiveTransformCallout(null);
          useEditorStore.getState().setActiveTransformAxis(null);
        }
      }
    };

    const changeCallback = () => {
      if (isTransformDragging && target && selectedObjectId) {
        let currentPos = target.position.clone();
        let wasSnapped = false;
        let snapLabel = '';
        const surfaceSnapEnabled = useEditorStore.getState().surfaceSnapEnabled;
        if ((gridSnapEnabled || surfaceSnapEnabled) && transformMode === 'translate') {
          const snapResult = computeGizmoSnapPosition(
            currentPos, 
            selectedObjectId, 
            useEditorStore.getState().objects, 
            gridSnapEnabled ? gridSnapIncrement : 0
          );
          wasSnapped = snapResult.isSnapped;
          snapLabel = snapResult.snapLabel || (gridSnapEnabled ? `Snap ${gridSnapIncrement}m` : (surfaceSnapEnabled ? 'Surface Snapped' : undefined)) || '';
          target.position.copy(snapResult.position);
          currentPos = snapResult.position;
        }

        const state = useEditorStore.getState();
        const initPrimary = initialTransformRef.current;
        const currentLocks = state.lockedAxes;

        if (initPrimary && currentLocks) {
          if (currentLocks.x) {
            target.position.x = initPrimary.pos.x;
            target.rotation.x = initPrimary.rot.x;
            target.scale.x = initPrimary.scl.x;
            currentPos.x = initPrimary.pos.x;
          }
          if (currentLocks.y) {
            target.position.y = initPrimary.pos.y;
            target.rotation.y = initPrimary.rot.y;
            target.scale.y = initPrimary.scl.y;
            currentPos.y = initPrimary.pos.y;
          }
          if (currentLocks.z) {
            target.position.z = initPrimary.pos.z;
            target.rotation.z = initPrimary.rot.z;
            target.scale.z = initPrimary.scl.z;
            currentPos.z = initPrimary.pos.z;
          }
        }

        // Enforce Orthographic View Plane constraints during dragging
        if (initPrimary && isPlanarOrtho) {
          if (isTopOrBottomView) {
            target.position.z = initPrimary.pos.z;
            target.rotation.x = initPrimary.rot.x;
            target.rotation.y = initPrimary.rot.y;
            target.scale.z = initPrimary.scl.z;
            currentPos.z = initPrimary.pos.z;
          } else if (isFrontOrBackView) {
            target.position.y = initPrimary.pos.y;
            target.rotation.x = initPrimary.rot.x;
            target.rotation.z = initPrimary.rot.z;
            target.scale.y = initPrimary.scl.y;
            currentPos.y = initPrimary.pos.y;
          } else if (isSideOrLeftRightView) {
            target.position.x = initPrimary.pos.x;
            target.rotation.y = initPrimary.rot.y;
            target.rotation.z = initPrimary.rot.z;
            target.scale.x = initPrimary.scl.x;
            currentPos.x = initPrimary.pos.x;
          }
        }

        const deltaPos = initPrimary ? currentPos.clone().sub(initPrimary.pos) : new THREE.Vector3();
        const deltaRotX = initPrimary ? THREE.MathUtils.radToDeg(target.rotation.x - initPrimary.rot.x) : 0;
        const deltaRotY = initPrimary ? THREE.MathUtils.radToDeg(target.rotation.y - initPrimary.rot.y) : 0;
        const deltaRotZ = initPrimary ? THREE.MathUtils.radToDeg(target.rotation.z - initPrimary.rot.z) : 0;
        const ratioX = (initPrimary && initPrimary.scl.x !== 0) ? target.scale.x / initPrimary.scl.x : 1;
        const ratioY = (initPrimary && initPrimary.scl.y !== 0) ? target.scale.y / initPrimary.scl.y : 1;
        const ratioZ = (initPrimary && initPrimary.scl.z !== 0) ? target.scale.z / initPrimary.scl.z : 1;

        const allTargetIds = (state.selectedObjectIds && state.selectedObjectIds.length > 0)
          ? state.selectedObjectIds
          : [selectedObjectId];

        allTargetIds.forEach((id) => {
          if (id === selectedObjectId) {
            state.updateObject(id, {
              position: [
                Number(currentPos.x.toFixed(3)),
                Number(currentPos.y.toFixed(3)),
                Number(currentPos.z.toFixed(3))
              ],
              rotation: [
                Number(THREE.MathUtils.radToDeg(target.rotation.x).toFixed(2)),
                Number(THREE.MathUtils.radToDeg(target.rotation.y).toFixed(2)),
                Number(THREE.MathUtils.radToDeg(target.rotation.z).toFixed(2))
              ],
              scale: [
                Number(target.scale.x.toFixed(3)),
                Number(target.scale.y.toFixed(3)),
                Number(target.scale.z.toFixed(3))
              ]
            });
          } else {
            const init = multiInitialTransformsRef.current.get(id);
            if (init) {
              state.updateObject(id, {
                position: [
                  Number((init.pos.x + deltaPos.x).toFixed(3)),
                  Number((init.pos.y + deltaPos.y).toFixed(3)),
                  Number((init.pos.z + deltaPos.z).toFixed(3))
                ],
                rotation: [
                  Number((THREE.MathUtils.radToDeg(init.rot.x) + deltaRotX).toFixed(2)),
                  Number((THREE.MathUtils.radToDeg(init.rot.y) + deltaRotY).toFixed(2)),
                  Number((THREE.MathUtils.radToDeg(init.rot.z) + deltaRotZ).toFixed(2))
                ],
                scale: [
                  Number((init.scl.x * ratioX).toFixed(3)),
                  Number((init.scl.y * ratioY).toFixed(3)),
                  Number((init.scl.z * ratioZ).toFixed(3))
                ]
              });
            }
          }
        });

        const activeAxis = (controls as any).axis || undefined;
        updateCallout(target, true, wasSnapped, snapLabel, activeAxis);
      }
    };

    controls.addEventListener('axis-changed', axisChangedCallback);
    controls.addEventListener('dragging-changed', draggingCallback);
    controls.addEventListener('change', changeCallback);
    return () => {
      controls.removeEventListener('axis-changed', axisChangedCallback);
      controls.removeEventListener('dragging-changed', draggingCallback);
      controls.removeEventListener('change', changeCallback);
      isTransformDragging = false;
      if (calloutTimeoutRef.current) {
        clearTimeout(calloutTimeoutRef.current);
      }
      useEditorStore.getState().setActiveTransformCallout(null);
      useEditorStore.getState().setActiveTransformAxis(null);
      if (orbitControlsRef && orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
      }
    };
  }, [target, selectedObjectId, orbitControlsRef, handleTransform, gridSnapEnabled, transformMode, gridSnapIncrement, updateCallout]);

  if (!isTransformable || !target) {
    return null;
  }

  return (
    <ErrorBoundary fallback={null}>
      <TransformControls
        key={selectedObjectId}
        ref={bindControls}
        object={target}
        mode={transformMode}
        space={transformSpace}
        showX={allowX && !lockedAxes?.x}
        showY={allowY && !lockedAxes?.y}
        showZ={allowZ && !lockedAxes?.z}
        translationSnap={gridSnapEnabled ? gridSnapIncrement : null}
        rotationSnap={rotationSnapEnabled ? (rotationSnapIncrement * Math.PI) / 180 : null}
        scaleSnap={scaleSnapEnabled ? scaleSnapIncrement : null}
      />
    </ErrorBoundary>
  );
}

const VIDEO_URLS = {
  office: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05c5c839d39e7fa17b4474775836a0c&profile_id=139&oauth2_token_id=57447761',
  livingroom: 'https://player.vimeo.com/external/435674703.sd.mp4?s=6f4188cbcd97ec1994e66699319e0094038a306f&profile_id=139&oauth2_token_id=57447761',
  techlab: 'https://player.vimeo.com/external/430810795.sd.mp4?s=d740c83a15af820c7cc61899532551e18cc8ef24&profile_id=139&oauth2_token_id=57447761'
};

function Hotspot3DRenderer({ obj, isPreviewMode, onInteract }: { obj: SceneObject; isPreviewMode: boolean; onInteract?: (e?: any) => void }) {
  const beaconRef = useRef<THREE.Group>(null);
  if (!obj) return null;
  const ringRef = useRef<THREE.Mesh>(null);
  const setActiveHotspotCard = useEditorStore(state => state.setActiveHotspotCard);
  const [hovered, setHovered] = useState(false);

  const props = obj.properties || {};
  const title = props.title || obj.name || 'Hotspot';
  const description = props.description || 'Tap to interact with this feature.';
  const liveInteractionsInDesign = useEditorStore(state => state.liveInteractionsInDesign);
  const isInteractiveActive = isPreviewMode || liveInteractionsInDesign;

  const color = props.beaconColor || '#06b6d4';
  const iconType = props.icon || 'Sparkles';
  const action = props.action || 'show_card';
  const cardButtonText = props.cardButtonText || 'Explore';
  const cardButtonUrl = props.cardButtonUrl || props.url || '';
  const cardMediaUrl = props.cardMediaUrl || '';

  useFrame((state, delta) => {
    if (!isInteractiveActive) return;
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.25;
      ringRef.current.scale.set(scale, scale, 1);
    }
    if (beaconRef.current) {
      beaconRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const handleClick = (e: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (onInteract) onInteract(e);

    if (isPreviewMode) {
      playCachedAudio('/sounds/ui/click_soft.wav', false, 0.5);

      if (action === 'show_card') {
        setActiveHotspotCard({
          title,
          description,
          icon: iconType,
          mediaUrl: cardMediaUrl,
          buttonText: cardButtonText,
          buttonUrl: cardButtonUrl,
          color,
        });
      } else if (action === 'play_audio' && props.soundUrl) {
        playCachedAudio(props.soundUrl, false, 0.7);
      } else if (action === 'open_url' && cardButtonUrl) {
        window.open(cardButtonUrl, '_blank', 'noopener,noreferrer');
      } else if (action === 'play_video' && props.videoUrl) {
        useEditorStore.getState().setARVideoPlaying({
          title,
          url: props.videoUrl
        });
      }
    }
  };

  const renderIcon = () => {
    switch (iconType) {
      case 'Info': return <Info size={12} />;
      case 'HelpCircle': return <HelpCircle size={12} />;
      case 'Tag': return <Tag size={12} />;
      case 'Volume2': return <Volume2 size={12} />;
      case 'Play': return <Play size={12} />;
      case 'Link2': return <Link2 size={12} />;
      case 'Star': return <Star size={12} />;
      case 'Sparkles':
      default: return <Sparkles size={12} />;
    }
  };

  return (
    <group ref={beaconRef} onClick={handleClick} onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} onPointerOut={() => setHovered(false)}>
      {/* Outer animated pulse ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.28, 32]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.8 : 0.45} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner glowing beacon sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.5 : 0.8} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Floating 3D/HTML Tag Badge */}
      <Html position={[0, 0.45, 0]} center distanceFactor={5} zIndexRange={[100, 0]} pointerEvents="auto">
        <button
          onClick={handleClick}
          style={{ borderColor: `${color}80`, backgroundColor: 'rgba(10, 10, 10, 0.85)' }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 cursor-pointer text-white font-mono text-xs select-none group ${
            hovered ? 'scale-110 shadow-[0_0_20px_rgba(6,182,212,0.6)]' : 'hover:scale-105'
          }`}
        >
          <span style={{ color }} className="shrink-0 group-hover:rotate-12 transition-transform">
            {renderIcon()}
          </span>
          <span className="font-bold tracking-tight text-white/90 group-hover:text-white max-w-[120px] truncate">{title}</span>
          <span style={{ backgroundColor: color }} className="w-1.5 h-1.5 rounded-full animate-ping" />
        </button>
      </Html>
    </group>
  );
}

function SelectionHighlight3D() {
  const { scene } = useThree();
  const selectedObjectIds = useEditorStore(state => state.selectedObjectIds);
  const objects = useEditorStore(state => state.objects);
  const isPreviewMode = useEditorStore(state => state.isPreviewMode);

  if (isPreviewMode || !selectedObjectIds || selectedObjectIds.length === 0) return null;

  return (
    <>
      {selectedObjectIds.map(id => {
        const obj = objects[id];
        if (!obj || !obj.visible) return null;
        if (['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed', 'icon2d'].includes(obj.type) || (obj.type === 'youtube' && obj.properties?.displayMode === '2d')) return null;

        const target = scene.getObjectByName(id);
        if (!target || !isObjectInScene(target, scene)) return null;

        return <SingleObjectHighlight key={id} id={id} obj={obj} target={target} />;
      })}
    </>
  );
}

function SingleObjectHighlight({ id, obj, target }: { id: string; obj: SceneObject; target: THREE.Object3D }) {
  const [bounds, setBounds] = useState<{ center: [number, number, number]; size: [number, number, number]; is2D: boolean } | null>(null);
  const prevRef = useRef<{ cx: number; cy: number; cz: number; sx: number; sy: number; sz: number; is2D: boolean } | null>(null);

  useFrame(() => {
    if (!target) return;
    const box = new THREE.Box3().setFromObject(target);
    if (box.isEmpty()) return;

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const is2D = 
      ['plane', 'circle', 'image', 'imageTarget', 'text', 'button', 'icon2d', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(obj.type) ||
      (obj.type === 'youtube' && obj.properties?.displayMode !== '3d') ||
      size.z < 0.04;

    size.x = Math.max(size.x, 0.1);
    size.y = Math.max(size.y, 0.1);

    if (is2D) {
      size.z = 0.002; // Ultra-slim, planar boundary hugging the 2D surface
    } else {
      size.z = Math.max(size.z, 0.06);
    }

    const prev = prevRef.current;
    if (
      !prev ||
      prev.is2D !== is2D ||
      Math.abs(prev.cx - center.x) > 0.002 ||
      Math.abs(prev.cy - center.y) > 0.002 ||
      Math.abs(prev.cz - center.z) > 0.002 ||
      Math.abs(prev.sx - size.x) > 0.002 ||
      Math.abs(prev.sy - size.y) > 0.002 ||
      Math.abs(prev.sz - size.z) > 0.002
    ) {
      prevRef.current = {
        cx: center.x,
        cy: center.y,
        cz: center.z,
        sx: size.x,
        sy: size.y,
        sz: size.z,
        is2D
      };
      setBounds({
        center: [center.x, center.y, center.z],
        size: [size.x, size.y, size.z],
        is2D
      });
    }
  });

  if (!bounds) return null;

  const [cx, cy, cz] = bounds.center;
  const [sx, sy, sz] = bounds.size;
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;

  const minDim = Math.min(sx, sy);
  const legLen = Math.min(minDim * 0.25, 0.22);
  const cornerThickness = Math.max(0.006, Math.min(0.016, minDim * 0.03));

  const cyanColor = "#00f0ff";
  const cyanGlow = "#38bdf8";

  // Sleek, slim flat bounding frame for 2D objects (Figma/Spark AR precision style)
  if (bounds.is2D) {
    return (
      <group position={[cx, cy, cz]} raycast={() => null}>
        {/* Flat Perimeter Border */}
        <mesh>
          <boxGeometry args={[sx, sy, 0.001]} />
          <meshBasicMaterial color={cyanColor} wireframe transparent opacity={0.6} />
        </mesh>

        {/* Subtle Semi-transparent Planar Tint */}
        <mesh>
          <planeGeometry args={[sx, sy]} />
          <meshBasicMaterial color={cyanColor} transparent opacity={0.03} side={THREE.DoubleSide} />
        </mesh>

        {/* 4 Flat Precision Corner L-Brackets */}
        {[-1, 1].map((signX) =>
          [-1, 1].map((signY) => {
            const vx = signX * hx;
            const vy = signY * hy;
            const key = `${signX}-${signY}`;

            return (
              <group key={key} position={[vx, vy, 0.001]}>
                {/* Corner Node */}
                <mesh>
                  <boxGeometry args={[cornerThickness * 1.6, cornerThickness * 1.6, 0.002]} />
                  <meshBasicMaterial color={cyanColor} />
                </mesh>
                {/* Flat X Leg */}
                <mesh position={[-signX * legLen / 2, 0, 0]}>
                  <boxGeometry args={[legLen, cornerThickness, 0.002]} />
                  <meshBasicMaterial color={cyanColor} />
                </mesh>
                {/* Flat Y Leg */}
                <mesh position={[0, -signY * legLen / 2, 0]}>
                  <boxGeometry args={[cornerThickness, legLen, 0.002]} />
                  <meshBasicMaterial color={cyanColor} />
                </mesh>
              </group>
            );
          })
        )}

        {/* Center Pivot Reticle Crosshair (Middle & Centered) */}
        <group position={[0, 0, 0.001]}>
          <mesh>
            <boxGeometry args={[Math.min(0.03, minDim * 0.12), cornerThickness * 0.7, 0.002]} />
            <meshBasicMaterial color={cyanGlow} />
          </mesh>
          <mesh>
            <boxGeometry args={[cornerThickness * 0.7, Math.min(0.03, minDim * 0.12), 0.002]} />
            <meshBasicMaterial color={cyanGlow} />
          </mesh>
          <mesh>
            <circleGeometry args={[cornerThickness * 0.9, 16]} />
            <meshBasicMaterial color={cyanColor} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    );
  }

  // 3D Object Bounding Cage
  return (
    <group position={[cx, cy, cz]} raycast={() => null}>
      {/* 3D Hairline Box Outline */}
      <mesh>
        <boxGeometry args={[sx, sy, sz]} />
        <meshBasicMaterial color={cyanColor} wireframe transparent opacity={0.35} />
      </mesh>

      {/* 8 Vertices with 3D L-Brackets */}
      {[-1, 1].map((signX) =>
        [-1, 1].map((signY) =>
          [-1, 1].map((signZ) => {
            const vx = signX * hx;
            const vy = signY * hy;
            const vz = signZ * hz;
            const key = `${signX}-${signY}-${signZ}`;

            return (
              <group key={key} position={[vx, vy, vz]}>
                {/* Vertex Corner Knob */}
                <mesh>
                  <boxGeometry args={[cornerThickness * 1.8, cornerThickness * 1.8, cornerThickness * 1.8]} />
                  <meshBasicMaterial color={cyanColor} />
                </mesh>

                {/* X Bracket Leg */}
                <mesh position={[-signX * legLen / 2, 0, 0]}>
                  <boxGeometry args={[legLen, cornerThickness, cornerThickness]} />
                  <meshBasicMaterial color={cyanColor} />
                </mesh>

                {/* Y Bracket Leg */}
                <mesh position={[0, -signY * legLen / 2, 0]}>
                  <boxGeometry args={[cornerThickness, legLen, cornerThickness]} />
                  <meshBasicMaterial color={cyanColor} />
                </mesh>

                {/* Z Bracket Leg */}
                <mesh position={[0, 0, -signZ * legLen / 2]}>
                  <boxGeometry args={[cornerThickness, cornerThickness, legLen]} />
                  <meshBasicMaterial color={cyanColor} />
                </mesh>
              </group>
            );
          })
        )
      )}

      {/* 3D Base Ground Reticle at z = -hz */}
      <group position={[0, 0, -hz]}>
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[Math.min(hx, hy) * 0.55, Math.min(hx, hy) * 0.55 + 0.018, 32]} />
          <meshBasicMaterial color={cyanGlow} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <circleGeometry args={[Math.min(0.04, minDim * 0.08), 16]} />
          <meshBasicMaterial color={cyanColor} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function ScaleSnapGridVisualizer() {
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const transformMode = useEditorStore((state) => state.transformMode);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const scaleSnapEnabled = useEditorStore((state) => (state as any).scaleSnapEnabled ?? true);
  const scaleSnapIncrement = useEditorStore((state) => (state as any).scaleSnapIncrement ?? 0.1);
  const scaleGridVisualEnabled = useEditorStore((state) => (state as any).scaleGridVisualEnabled ?? true);
  const objects = useEditorStore((state) => state.objects);

  if (isPreviewMode || !selectedObjectId || !scaleGridVisualEnabled) return null;

  const targetObj = objects[selectedObjectId];
  if (!targetObj || targetObj.type === 'imageTarget' || targetObj.locked || targetObj.type.startsWith('hud')) return null;

  // Render visual snap grid only when actively in scale mode
  if (transformMode !== 'scale') return null;

  const bbox = getObjectBoundingBox(targetObj);
  const pos = bbox.center;
  const size = bbox.size;

  const currentScale = new THREE.Vector3(...(targetObj.scale || [1, 1, 1]));
  const snapResult = computeGizmoScaleSnap(currentScale, selectedObjectId, objects, scaleSnapIncrement);

  const w = Math.max(0.06, size.x);
  const h = Math.max(0.06, size.y);
  const d = Math.max(0.06, size.z);

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {/* Clean Bounding Box Scale Wireframe without obstructing text callouts */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial 
          color={snapResult.isSnapped ? "#c084fc" : "#38bdf8"} 
          linewidth={2} 
          transparent 
          opacity={snapResult.isSnapped ? 0.95 : 0.65} 
        />
      </lineSegments>
    </group>
  );
}

function ZUpAxisHead({
  position,
  label,
  color,
  labelColor = '#ffffff',
  onSelect,
}: {
  position: [number, number, number];
  label?: string;
  color: string;
  labelColor?: string;
  onSelect: (pos: [number, number, number]) => void;
}) {
  const gl = useThree((state) => state.gl);
  const [active, setActive] = useState(false);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(32, 32, 22, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      if (label) {
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = labelColor;
        ctx.fillText(label, 32, 32);
      }
    }
    return new THREE.CanvasTexture(canvas);
  }, [color, label, labelColor]);

  const scale = (label ? 1.05 : 0.8) * (active ? 1.3 : 1);

  return (
    <sprite
      position={position}
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation();
        setActive(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setActive(false);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect(position);
      }}
    >
      <spriteMaterial
        map={texture}
        map-anisotropy={gl.capabilities.getMaxAnisotropy() || 1}
        alphaTest={0.1}
        opacity={label ? 1 : 0.85}
        toneMapped={false}
      />
    </sprite>
  );
}

function ZUpAxis({ color, rotation }: { color: string; rotation: [number, number, number] }) {
  return (
    <group rotation={rotation}>
      <mesh position={[0.45, 0, 0]}>
        <boxGeometry args={[0.9, 0.06, 0.06]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ZUpGizmoViewport({
  axisColors = ['#ef4444', '#10b981', '#3b82f6'],
  onSelectAxisView,
}: {
  axisColors?: [string, string, string];
  onSelectAxisView?: (axis: string) => void;
}) {
  const [centerHover, setCenterHover] = useState(false);

  const handleSelectAxis = (pos: [number, number, number]) => {
    if (!onSelectAxisView) return;
    const [x, y, z] = pos;
    if (x > 0.5) onSelectAxisView('X');
    else if (x < -0.5) onSelectAxisView('-X');
    else if (y > 0.5) onSelectAxisView('Y');
    else if (y < -0.5) onSelectAxisView('-Y');
    else if (z > 0.5) onSelectAxisView('Z');
    else if (z < -0.5) onSelectAxisView('-Z');
  };

  const [colorX, colorY, colorZ] = axisColors;

  return (
    <group scale={40}>
      {/* Clickable Center Origin Core: Resets to 3D View */}
      <mesh
        position={[0, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setCenterHover(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setCenterHover(false);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelectAxisView?.('3D');
        }}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial 
          color={centerHover ? "#38bdf8" : "#cbd5e1"} 
          toneMapped={false} 
        />
      </mesh>

      {/* Axis Lines */}
      <ZUpAxis color={colorX} rotation={[0, 0, 0]} />
      <ZUpAxis color={colorY} rotation={[0, 0, Math.PI / 2]} />
      <ZUpAxis color={colorZ} rotation={[0, -Math.PI / 2, 0]} />

      {/* Positive Axis Heads */}
      <ZUpAxisHead position={[1.2, 0, 0]} label="X" color={colorX} onSelect={handleSelectAxis} />
      <ZUpAxisHead position={[0, 1.2, 0]} label="Y" color={colorY} onSelect={handleSelectAxis} />
      <ZUpAxisHead position={[0, 0, 1.2]} label="Z" color={colorZ} onSelect={handleSelectAxis} />

      {/* Negative Axis Heads */}
      <ZUpAxisHead position={[-1.2, 0, 0]} color="#991b1b" onSelect={handleSelectAxis} />
      <ZUpAxisHead position={[0, -1.2, 0]} color="#065f46" onSelect={handleSelectAxis} />
      <ZUpAxisHead position={[0, 0, -1.2]} color="#1e40af" onSelect={handleSelectAxis} />
    </group>
  );
}

function SceneRefCapturer({ sceneRef }: { sceneRef: React.MutableRefObject<THREE.Scene | null> }) {
  const { scene } = useThree();
  useEffect(() => {
    sceneRef.current = scene;
  }, [scene, sceneRef]);
  return null;
}

function AutoSceneLightingEngine() {
  const settings = useEditorStore(state => state.settings);
  const objects = useEditorStore(state => state.objects);

  const materialAnalysis = React.useMemo(() => {
    let hasPBR = false;
    let hasGlass = false;
    let hasMetallic = false;
    let hasIridescence = false;

    Object.values(objects).forEach(obj => {
      const props = obj?.properties || {};
      if (props.transmission > 0 || (props.opacity !== undefined && props.opacity < 1)) hasGlass = true;
      if (props.metalness && props.metalness > 0.2) hasMetallic = true;
      if (props.clearcoat > 0 || props.iridescence > 0) hasIridescence = true;
      if (obj?.type === 'model' || props.shaderType === 'physical') hasPBR = true;
    });

    return { hasPBR, hasGlass, hasMetallic, hasIridescence };
  }, [objects]);

  const hdrEnabled = settings.hdrEnvironmentEnabled ?? true;
  const hdrPreset = settings.hdrPreset || 'studio';
  const hdrBackground = settings.hdrBackgroundEnabled ?? false;
  const hdrType = settings.hdrEnvironmentType || 'preset';
  const hdrUrl = settings.hdrEnvironmentUrl;

  return (
    <>
      <ambientLight intensity={materialAnalysis.hasGlass ? 0.7 : 0.5} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={materialAnalysis.hasMetallic ? 1.6 : 1.3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={[-10, 5, -10]}
        intensity={0.6}
        color="#e0f2fe"
      />
      <directionalLight
        position={[0, 10, -15]}
        intensity={0.8}
        color="#fdf4ff"
      />

      {hdrEnabled && (
        <ErrorBoundary fallback={null}><Environment
          files={hdrType === 'custom' ? hdrUrl : undefined}
          preset={hdrType !== 'custom' ? (hdrPreset as any) : undefined}
          background={hdrBackground}
        /></ErrorBoundary>
      )}

      <ContactShadows
        position={[0, 0, -0.01]}
        rotation-x={Math.PI}
        opacity={0.55}
        scale={20}
        blur={2.5}
        far={8}
        resolution={512}
        color="#000000"
      />
    </>
  );
}

export function Viewport() {
  const [debugLogs, setDebugLogs] = useState<{ id: number, message: string }[]>([]);
  const orbitControlsRef = useRef<any>(null);
  const previewOrbitControlsRef = useRef<any>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [isPublicationModalOpen, setIsPublicationModalOpen] = useState(false);
  const [axisUpdateId, setAxisUpdateId] = useState(0);
  const [activeAxisView, setActiveAxisView] = useState<string>('3D');
  const [isAxisMenuOpen, setIsAxisMenuOpen] = useState(false);

  // In Top, Front, Side, and other planar orthographic views, 3D orbit rotation is locked
  // while 2D planar panning and zooming are enabled intuitively (like Blender / CAD / Figma).
  const isPlanarOrthographicView = useMemo(() => {
    return ['Top', 'Front', 'Side', 'Z', 'Y', 'X', '-X', '-Y', '-Z', 'Bottom', 'Back', 'Left', 'Right'].includes(activeAxisView);
  }, [activeAxisView]);

  const { 
    addObject, 
    objects, 
    settings,
    activeSceneId,
    currentProjectId,
    gridSnapEnabled, 
    gridSnapIncrement,
    setGridSnapEnabled,
    setGridSnapIncrement,
    surfaceSnapEnabled,
    setSurfaceSnapEnabled,
    toggleSurfaceSnap,
    rotationSnapEnabled,
    rotationSnapIncrement,
    setRotationSnapEnabled,
    setRotationSnapIncrement,
    cameraType,
    setCameraType,
    wireframeEnabled,
    setWireframeEnabled,
    selectedModelWireframeEnabled,
    setSelectedModelWireframeEnabled,
    visualizationMode,
    setVisualizationMode,
    isPreviewMode,
    transformGizmoEnabled,
    setTransformGizmoEnabled,
    isBoxSelectToolActive,
    setBoxSelectToolActive,
    toggleBoxSelectTool,
    collisionDebuggerEnabled,
    setCollisionDebuggerEnabled,
    activeStateId,
    transformApplyMode,
    setTransformApplyMode,
    liveInteractionsInDesign,
    toggleLiveInteractionsInDesign,
    isDraggableDragging,
    targetDprScale,
    setIsUIOptimizerOpen
  } = useEditorStore();

  const handleSelectAxisView = useCallback((axis: string) => {
    setActiveAxisView(axis);
    if (axis === '3D' || axis === 'Isometric' || axis === 'ISO') {
      setCameraType('perspective');
      useEditorStore.getState().addToast('3D Orbit View: 3D Camera Rotation Enabled');
    } else {
      setCameraType('orthographic');
      useEditorStore.getState().addToast(`${axis} View: 2D Pan & Zoom Locked (3D Orbit Disabled)`);
    }
    setAxisUpdateId((n) => n + 1);
    setIsAxisMenuOpen(false);
  }, [setCameraType]);

  const canvasDpr = typeof targetDprScale === 'number' ? targetDprScale : [1, 2];

  const objectsRef = useRef(objects);
  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  // Dedicated preloader effect to pre-cache all custom sounds on mount, project load, or preview entry
  useEffect(() => {
    try {
      const soundUrls = new Set<string>();
      Object.values(objects || {}).forEach((obj: any) => {
        if (obj.properties?.soundUrl) {
          soundUrls.add(obj.properties.soundUrl);
        }
        if (obj.properties?.interactionSoundUrl) {
          soundUrls.add(obj.properties.interactionSoundUrl);
        }
        if ((obj?.events || [])) {
          (obj.events || []).forEach((b: any) => {
            if (b.action === 'playSound' && b.soundPreset) {
              soundUrls.add(b.soundPreset);
            }
          });
        }
      });

      soundUrls.forEach((url) => {
        if (!globalAudioCache[url]) {
          const audio = new Audio(url);
          audio.preload = 'auto';
          globalAudioCache[url] = audio;
        }
        console.log(`Preloading scene sound: ${url}`);
      });
    } catch (e) {
      console.warn('Preloading scene sounds failed:', e);
    }
  }, [objects, isPreviewMode]);

  // Audio unlocker for browser autoplay policies in iframe
  useEffect(() => {
    const unlockAudio = () => {
      // 1. Resume standard Three.js AudioContext
      try {
        const audioCtx = THREE.AudioContext.getContext() as any;
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().then(() => {
            console.log('THREE.AudioContext resumed successfully');
          });
        }
      } catch (e) {
        console.warn('THREE.AudioContext resume failed:', e);
      }

      // 2. Resume web AudioContext
      try {
        const { AudioContext, webkitAudioContext } = window as any;
        const ContextClass = AudioContext || webkitAudioContext;
        if (ContextClass) {
          const tempCtx = new ContextClass();
          if (tempCtx.state === 'suspended') {
            tempCtx.resume();
          }
        }
      } catch (e) {
        console.warn('Web AudioContext resume failed:', e);
      }

      // 3. Play a quick silent sound to unlock HTML5 Audio elements
      try {
        const silentAudio = new Audio();
        // A minimal valid base64 1-pixel WAV audio string
        silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA';
        silentAudio.volume = 0;
        silentAudio.play()
          .then(() => {
            console.log('HTML5 Audio successfully unlocked on user gesture inside iframe');
            // Clean up once unlocked
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
          })
          .catch(err => {
            console.log('HTML5 Audio unlock failed:', err);
          });
      } catch (e) {
        console.warn('HTML5 Audio unlock execution failed:', e);
      }

      // 4. Preload and pre-activate all custom audio clips in the scene so browser allows them to play
      try {
        const soundUrls = new Set<string>();
        Object.values(objectsRef.current || {}).forEach((obj: any) => {
          if (obj.properties?.soundUrl) {
            soundUrls.add(obj.properties.soundUrl);
          }
          if ((obj?.events || [])) {
            (obj.events || []).forEach((b: any) => {
              if (b.action === 'playSound' && b.soundPreset) {
                soundUrls.add(b.soundPreset);
              }
            });
          }
        });

        soundUrls.forEach((url) => {
          if (!globalAudioCache[url]) globalAudioCache[url] = new Audio(url);
          const sfx = globalAudioCache[url];
          sfx.volume = 0;
          sfx.muted = true;
          sfx.play()
            .then(() => {
              sfx.pause();
              sfx.muted = false;
              sfx.volume = 1;
              console.log(`Pre-activated audio cache for URL: ${url}`);
            })
            .catch(err => {
              console.warn(`Audio pre-activation failed for URL: ${url}`, err);
            });
        });
      } catch (e) {
        console.warn('Custom audios pre-activation failed:', e);
      }

      // 5. If in preview mode, play any active audio nodes in the scene
      try {
        const isPreview = useEditorStore.getState().isPreviewMode;
        if (isPreview) {
          Object.values(useEditorStore.getState().objects).forEach((obj: any) => {
            if (obj.type === 'audio') {
              const soundUrl = obj.properties?.soundUrl;
              const autoplay = obj.properties?.autoplay ?? false;
              const isPlaying = obj.properties?.playing ?? false;
              if (soundUrl && (autoplay || isPlaying)) {
                if (!globalAudioCache[soundUrl]) globalAudioCache[soundUrl] = new Audio(soundUrl);
                const audio = globalAudioCache[soundUrl];
                audio.loop = obj.properties?.loop ?? true;
                audio.volume = obj.properties?.volume ?? 0.5;
                audio.play().catch(e => console.log('Audio node failed to play on user gesture:', e));
              }
            }
          });
        }
      } catch (e) {
        console.warn('Playing active audio nodes on gesture failed:', e);
      }
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);
  
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      const msg = args.join(' ');
      if (msg.includes('[Debug Log]')) {
        setDebugLogs(prev => {
          const newLogs = [...prev, { id: Date.now(), message: msg.replace('[Debug Log]', '').trim() }];
          return newLogs.slice(-5);
        });
      }
    };
    return () => {
      console.log = originalLog;
    };
  }, []);
  const rootObjects = useEditorStore(state => state.rootObjects);
  const selectObject = useEditorStore(state => state.selectObject);
  const updateObject = useEditorStore(state => state.updateObject);
  const transformMode = useEditorStore(state => state.transformMode);
  const setTransformMode = useEditorStore(state => state.setTransformMode);
  const transformSpace = useEditorStore(state => state.transformSpace);
  const setTransformSpace = useEditorStore(state => state.setTransformSpace);
  const lockedAxes = useEditorStore(state => state.lockedAxes);
  const toggleLockAxis = useEditorStore(state => state.toggleLockAxis);
  const cameraOrbitLocked = useEditorStore(state => state.cameraOrbitLocked);
  const toggleCameraOrbitLock = useEditorStore(state => state.toggleCameraOrbitLock);
  const isDrivingActive = useEditorStore(state => state.isDrivingActive);
  const toggleDrivingActive = useEditorStore(state => state.toggleDrivingActive);
  const scaleSnapEnabled = useEditorStore(state => (state as any).scaleSnapEnabled ?? true);
  const setScaleSnapEnabled = useEditorStore(state => (state as any).setScaleSnapEnabled);
  const toasts = useEditorStore(state => state.toasts);
  const arVideoPlaying = useEditorStore(state => state.arVideoPlaying);
  const selectedObjectId = useEditorStore(state => state.selectedObjectId);
  const selectedObjectIds = useEditorStore(state => state.selectedObjectIds);
  const addToast = useEditorStore(state => state.addToast);

  const handleToggleAxisLock = useCallback((axis: 'x' | 'y' | 'z') => {
    playCachedAudio('/sounds/click.wav', false, 0.4);
    toggleLockAxis(axis);
    const willBeLocked = !lockedAxes?.[axis];
    const axisUpper = axis.toUpperCase();
    addToast(
      willBeLocked 
        ? `🔒 ${axisUpper}-Axis transform locked` 
        : `🔓 ${axisUpper}-Axis transform unlocked`
    );
  }, [toggleLockAxis, lockedAxes, addToast]);

  const handlePointerMissed = (e: any) => {
    const target = e?.target as HTMLElement;
    if (target) {
      if (
        target.closest('.ui-panel') ||
        target.closest('button') ||
        target.closest('select') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[role="dialog"]') ||
        target.closest('.no-pointer-miss') ||
        target.closest('.panel') ||
        target.closest('[class*="panel"]') ||
        target.closest('.lucide') ||
        target.closest('svg')
      ) {
        return;
      }
      const canvasElement = document.querySelector('canvas');
      if (canvasElement && !canvasElement.contains(target)) {
        return;
      }
    }
    console.log('[Debug Log] Screen tapped (no object tapped)');
    selectObject(null);
  };

  const [showBezel, setShowBezel] = useState(true);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [bgType, setBgType] = useState<'office' | 'livingroom' | 'techlab' | 'webcam'>('office');
  const [trackingStable, setTrackingStable] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [snapshotFlash, setSnapshotFlash] = useState(false);
  const [currentTime, setCurrentTime] = useState('09:41 AM');
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string>('');
  const [snapshotInitialWatermark, setSnapshotInitialWatermark] = useState<string>('Captured with AR Studio');
  const [snapshotIncludeTimestamp, setSnapshotIncludeTimestamp] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const webCamRef = useRef<HTMLVideoElement>(null);

  // Vehicle Physics & Driving Simulation Touch / Trigger Refs
  const vehicleTouchInputRef = useRef<{ steer: number; throttle: number; brake: boolean }>({ steer: 0, throttle: 0, brake: false });
  const vehicleResetTriggerRef = useRef<(() => void) | null>(null);
  const vehicleToggleHeadlightsRef = useRef<(() => void) | null>(null);

  // Time ticker for mock status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calibration/tracking simulator
  useEffect(() => {
    if (isPreviewMode) {
      setTrackingStable(false);
      const timer = setTimeout(() => {
        setTrackingStable(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isPreviewMode]);

  // Webcam stream handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isPreviewMode && bgType === 'webcam') {
      if (!navigator?.mediaDevices?.getUserMedia) {
        console.warn("Webcam not supported or permitted in this environment, falling back to office background");
        setBgType('office');
        return;
      }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          setWebcamStream(s);
          if (webCamRef.current) {
            webCamRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.warn("Webcam access failed/denied, falling back to office background:", err);
          setBgType('office');
        });
    } else {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isPreviewMode, bgType]);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut if user is actively editing a form field or input
      const activeEl = document.activeElement;
      if (activeEl) {
        const tag = activeEl.tagName.toUpperCase();
        if (tag === 'INPUT' || tag === 'TEXTAREA' || activeEl.hasAttribute('contenteditable')) {
          return;
        }
      }

      const selectedObjectId = useEditorStore.getState().selectedObjectId;

      // Escape key to deselect object
      if (e.key === 'Escape') {
        e.preventDefault();
        selectObject(null);
        useEditorStore.getState().setBoxSelectToolActive?.(false);
      }

      // B: Toggle Box Marquee Select Tool
      if (e.key.toLowerCase() === 'b' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        useEditorStore.getState().toggleBoxSelectTool?.();
      }

      // V: Pointer Select Mode
      if (e.key.toLowerCase() === 'v' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        useEditorStore.getState().setBoxSelectToolActive?.(false);
      }

      // W or T: Set transform mode to Translate
      if (e.key.toLowerCase() === 'w' || e.key.toLowerCase() === 't') {
        e.preventDefault();
        useEditorStore.getState().setBoxSelectToolActive?.(false);
        setTransformMode('translate');
      }

      // Q: Toggle coordinate transform space
      if (e.key.toLowerCase() === 'q') {
        e.preventDefault();
        const currentSpace = useEditorStore.getState().transformSpace;
        useEditorStore.getState().setTransformSpace(currentSpace === 'local' ? 'world' : 'local');
      }

      // E: Set transform mode to Rotate
      if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setTransformMode('rotate');
      }

      // R or S: Set transform mode to Scale
      if (e.key.toLowerCase() === 'r' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        setTransformMode('scale');
      }

      // F: Focus / Frame Selected Object or Recenter Scene
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('trigger-frame-selected'));
      }

      // L: Toggle Camera Orbit Lock
      if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        useEditorStore.getState().toggleCameraOrbitLock();
      }

      // Home: Reset Camera Orbit
      if (e.key === 'Home') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('trigger-reset-camera'));
      }

      // Delete or Backspace: Remove selected object
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectId) {
          const selectedObj = useEditorStore.getState().objects[selectedObjectId];
          // Prevent deleting the root image target
          if (selectedObj && selectedObj.type !== 'imageTarget') {
            e.preventDefault();
            useEditorStore.getState().removeObject(selectedObjectId);
          }
        }
      }

      // Ctrl+D or Cmd+D or D: Duplicate selected objects / selection
      if (e.key.toLowerCase() === 'd') {
        const state = useEditorStore.getState();
        if (state.selectedObjectId || state.selectedObjectIds.length > 0) {
          e.preventDefault();
          state.duplicateSelection();
        }
      }

      // Ctrl+C or Cmd+C / Ctrl+V or Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedObjectId) {
          const selectedObj = useEditorStore.getState().objects[selectedObjectId];
          if (selectedObj && selectedObj.type !== 'imageTarget') {
            e.preventDefault();
            useEditorStore.getState().copyObject(selectedObjectId);
          }
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        useEditorStore.getState().pasteObject();
      }

      // Ctrl+Z / Cmd+Z: Undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        useEditorStore.getState().undo();
      }

      // Ctrl+Y / Cmd+Y or Ctrl+Shift+Z: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectObject, setTransformMode, setTransformSpace]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    try {
      const asset = JSON.parse(data);
      if (asset.type === 'model') {
        const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
        const parentId = imageTarget ? imageTarget.id : null;
        
        const newObj: SceneObject = {
          id: crypto.randomUUID(),
          name: asset.name.split('.')[0],
          type: 'model',
          position: [0, 0, 0],
          rotation: [90, 0, 0], // Oriented in Z direction when instantiated
          scale: [1, 1, 1],
          visible: true,
          children: [],
          parentId: parentId,
          properties: {
            url: asset.url
          }
        };
        
        addObject(newObj, parentId || undefined);
        selectObject(newObj.id);
      } else if (asset.type === 'image') {
        const selectedId = useEditorStore.getState().selectedObjectId; const selectedObj = selectedId ? useEditorStore.getState().objects[selectedId] : null;
        if (selectedObj && (selectedObj.type === 'image' || selectedObj.type === 'imageTarget')) {
          useEditorStore.getState().updateObject(selectedId!, {
            properties: {
              ...selectedObj.properties,
              textureUrl: asset.url
            }
          });
        } else {
          const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
          if (imageTarget) {
            useEditorStore.getState().updateObject(imageTarget.id, {
              properties: {
                ...imageTarget.properties,
                textureUrl: asset.url
              }
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const captureARSnapshot = useCallback((options: any = {}) => {
    const shouldFlash = options.screenshotFlash !== false && options.flash !== false;
    const shouldSound = options.screenshotSound !== false && options.sound !== false;

    if (shouldFlash) {
      setSnapshotFlash(true);
      setTimeout(() => {
        setSnapshotFlash(false);
      }, 450);
    }

    if (shouldSound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(550, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1100, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {}
    }

    try {
      // Find 3D WebGL Canvas
      const webglCanvas = document.querySelector('canvas') as HTMLCanvasElement;
      const activeVideo = (bgType === 'webcam' ? webCamRef.current : videoRef.current) as HTMLVideoElement;

      // Composite onto high-res canvas
      const width = webglCanvas ? (webglCanvas.width || 1280) : 1280;
      const height = webglCanvas ? (webglCanvas.height || 720) : 720;

      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const ctx = offscreen.getContext('2d');

      if (ctx) {
        // 1. Draw video background
        if (activeVideo && activeVideo.videoWidth > 0) {
          try {
            ctx.drawImage(activeVideo, 0, 0, width, height);
          } catch (e) {
            ctx.fillStyle = '#0a0a0c';
            ctx.fillRect(0, 0, width, height);
          }
        } else {
          ctx.fillStyle = '#0a0a0c';
          ctx.fillRect(0, 0, width, height);
        }

        // 2. Draw 3D WebGL Canvas on top
        if (webglCanvas) {
          try {
            ctx.drawImage(webglCanvas, 0, 0, width, height);
          } catch (e) {
            console.warn('WebGL draw into snapshot error:', e);
          }
        }

        const dataUrl = offscreen.toDataURL('image/png', 0.95);
        setSnapshotDataUrl(dataUrl);
        setSnapshotInitialWatermark(options.screenshotWatermark || 'Captured with AR Studio');
        setSnapshotIncludeTimestamp(options.screenshotIncludeTimestamp !== false);

        if (options.screenshotDirectDownload || options.directDownload) {
          const d = new Date();
          const filename = `AR_Snapshot_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}_${Date.now().toString().slice(-4)}.png`;
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else if (options.screenshotDirectShare && typeof navigator !== 'undefined' && (navigator as any).share) {
          offscreen.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'AR_Snapshot.png', { type: 'image/png' });
              if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
                (navigator as any).share({
                  title: 'AR Snapshot',
                  text: 'Check out this augmented reality experience capture!',
                  files: [file]
                }).catch(() => {
                  setIsSnapshotModalOpen(true);
                });
                return;
              }
            }
            setIsSnapshotModalOpen(true);
          });
        } else {
          setIsSnapshotModalOpen(true);
        }
      }
    } catch (err) {
      console.error('AR Snapshot capture failed:', err);
    }
  }, [bgType]);

  // Listen for trigger-ar-snapshot custom event
  useEffect(() => {
    const handleSnapshotEvent = (e: any) => {
      captureARSnapshot(e.detail || {});
    };
    window.addEventListener('trigger-ar-snapshot', handleSnapshotEvent);
    return () => {
      window.removeEventListener('trigger-ar-snapshot', handleSnapshotEvent);
    };
  }, [captureARSnapshot]);

  const triggerSnapshot = () => {
    captureARSnapshot({
      screenshotWatermark: 'Captured with AR Studio',
      screenshotIncludeTimestamp: true,
      screenshotSound: true,
      screenshotFlash: true,
    });
  };

  const resetTracking = () => {
    setTrackingStable(false);
    const timer = setTimeout(() => {
      setTrackingStable(true);
    }, 1800);
  };

  if (isPreviewMode) {
    return (
      <div className={`w-full h-full bg-[#0a0a0a] flex items-center justify-center ${showBezel ? 'p-4' : 'p-0'} select-none relative overflow-hidden`}>
        <style>{`
          @keyframes scan-laser {
            0%, 100% { top: 20%; opacity: 0.1; }
            50% { top: 80%; opacity: 0.8; }
          }
          .animate-scan-laser {
            animation: scan-laser 3s infinite ease-in-out;
          }
        `}</style>

        {/* Blueprint Grid background in workspace */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px), linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '24px 24px, 48px 48px, 48px 48px'
          }}
        ></div>

        {settings.ambientSoundUrl && (
          <audio src={settings.ambientSoundUrl} autoPlay loop className="hidden" />
        )}

        {/* Outer Workspace HUD */}
        <GlassCard variant="dark" blur="md" className="absolute top-4 left-4 z-40 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="font-mono text-[#AAA]">WORKSPACE: SIMULATOR ACTIVE</span>
        </GlassCard>
        
        {/* Debug Log Overlay */}
        {!isPreviewMode && (
          <div className="absolute bottom-4 left-4 right-4 z-40 pointer-events-none flex flex-col gap-1.5">
            {debugLogs.map(log => (
              <div key={log.id} className="bg-black/70 border border-[#333] px-3 py-2 rounded shadow text-[11px] font-mono text-yellow-400 animate-in fade-in slide-in-from-bottom-2 self-start backdrop-blur-sm">
                <span className="opacity-50 mr-2 text-white">🐞 TOUCH EVENT:</span> {log.message}
              </div>
            ))}
          </div>
        )}

        {/* Bezel Device wrapper vs Full Bleed wrapper */}
        <div className={showBezel 
          ? "relative w-[340px] h-[680px] md:w-[360px] md:h-[720px] bg-[#111] border-[10px] border-[#252525] rounded-[50px] shadow-2xl flex flex-col overflow-hidden border-t-[16px] border-b-[16px] ring-2 ring-white/5"
          : "relative w-full h-full bg-black overflow-hidden"
        }>
          {showBezel && (
            /* Camera notch */
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#252525] rounded-full z-40 flex items-center justify-center gap-1.5 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-950/80 border border-blue-500/30 shadow-inner flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-400/40" />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
            </div>
          )}

          {/* Device Screen Viewport */}
          <div className={`relative w-full h-full flex flex-col bg-black overflow-hidden ${showBezel ? 'rounded-[32px]' : ''}`}>
            
            {/* Shutter snapshot flash overlay */}
            {snapshotFlash && (
              <div className="absolute inset-0 bg-white z-50 transition-opacity duration-300 opacity-100" />
            )}

            {/* Camera backgrounds absolute behind canvas */}
            <div className="absolute inset-0 z-0">
              {bgType === 'webcam' ? (
                <video ref={webCamRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-70" />
              ) : (
                <video ref={videoRef} src={VIDEO_URLS[bgType]} autoPlay loop playsInline muted className="w-full h-full object-cover opacity-70" />
              )}
              {/* Cinematic color correction filters for simulated camera feed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />
              <div className="absolute inset-0 bg-emerald-500/5 mix-blend-color pointer-events-none" />
            </div>

            {/* 3D R3F Canvas Layer (Transparent bg) */}
            <div 
              className="absolute inset-0 z-10"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                try {
                  const rawData = e.dataTransfer.getData('application/json');
                  if (!rawData) return;
                  const data = JSON.parse(rawData);
                  if (data.type === 'material_preset' || data.preset) {
                    const preset = data.preset || data;
                    const selectedId = selectedObjectIds[0];
                    if (selectedId && objects[selectedId]) {
                      updateObject(selectedId, {
                        properties: {
                          ...objects[selectedId].properties,
                          color: preset.color || '#ffffff',
                          roughness: preset.roughness ?? 0.5,
                          metalness: preset.metalness ?? 0,
                          emissive: preset.emissive || '#000000',
                          textureUrl: preset.textureUrl || '',
                          materialType: preset.materialType || 'standard',
                        }
                      });
                      addToast(`Applied material '${preset.name || 'Material'}' to ${objects[selectedId].name || 'Selected Object'}`);
                    } else {
                      addToast("Select an object first, then drag & drop materials onto the viewport!");
                    }
                  }
                } catch (err) {
                  console.warn("Drop handling error:", err);
                }
              }}
            >
              <ErrorBoundary
                resetKeys={[activeSceneId, currentProjectId]}
                fallback={(error, reset) => (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white p-6 z-50 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400">
                      <Camera size={22} />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">AR Simulator Reloading</h4>
                    <p className="text-[11px] text-gray-400 max-w-xs mb-4">
                      The WebGL simulator context is refreshing.
                    </p>
                    <button
                      onClick={() => reset()}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
                    >
                      Resume Simulator
                    </button>
                  </div>
                )}
              >
                <Canvas 
                  camera={{ position: [0, -4, 4], fov: 50, up: [0, 0, 1] }}
                  onPointerMissed={handlePointerMissed}
                  gl={{ preserveDrawingBuffer: true, powerPreference: 'high-performance', antialias: true }}
                  onCreated={({ gl }) => {
                    gl.domElement.addEventListener('webglcontextlost', (e) => {
                      e.preventDefault();
                      console.warn('Preview WebGL context lost handled');
                    }, false);
                  }}
                >
                  
                  <AutoSceneLightingEngine />
                  <CameraController activeAxisView={activeAxisView} axisUpdateId={axisUpdateId} orbitControlsRef={previewOrbitControlsRef} onResetTo3D={() => setActiveAxisView('3D')} />
                  <Grid 
                    position={[0, 0, -0.01]} 
                    args={[100, 100]} 
                    cellSize={1} 
                    cellThickness={1} 
                    cellColor="#333338" 
                    sectionSize={5} 
                    sectionThickness={1.5} 
                    sectionColor="#555562" 
                    fadeDistance={40} 
                    fadeStrength={1} 
                    rotation={[Math.PI / 2, 0, 0]}
                  />

                  
                  {rootObjects.map(id => (
                    <MemoizedObjectRenderer key={id} id={id} />
                  ))}

                  <OrbitControls 
                    ref={previewOrbitControlsRef} 
                    enabled={!isDraggableDragging} 
                    enableRotate={!isDraggableDragging && !isPlanarOrthographicView} 
                    enablePan={!isDraggableDragging}
                    enableZoom={!isDraggableDragging}
                    screenSpacePanning={true}
                    mouseButtons={
                      isPlanarOrthographicView ? {
                        LEFT: THREE.MOUSE.PAN,
                        MIDDLE: THREE.MOUSE.DOLLY,
                        RIGHT: THREE.MOUSE.PAN
                      } : {
                        LEFT: THREE.MOUSE.ROTATE,
                        MIDDLE: THREE.MOUSE.DOLLY,
                        RIGHT: THREE.MOUSE.PAN
                      }
                    }
                    touches={
                      isPlanarOrthographicView ? {
                        ONE: THREE.TOUCH.PAN,
                        TWO: THREE.TOUCH.DOLLY_PAN
                      } : {
                        ONE: THREE.TOUCH.ROTATE,
                        TWO: THREE.TOUCH.DOLLY_PAN
                      }
                    }
                    makeDefault 
                  />
                  <BloomEffect />
                  <PerformanceTracker />
                </Canvas>
              </ErrorBoundary>
            </div>

            {/* 2D Overlay Renderer for Preview Mode */}
            <Overlay2DRenderer isPreviewMode={true} />

            {/* Simulated Smartphone HUD overlays */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 pt-6 pb-6">
              
              {/* Real-time spatial AR toasts */}
              <div className="absolute top-14 left-4 right-4 z-40 flex flex-col gap-1.5 pointer-events-none">
                {toasts.map((t) => (
                  <div 
                    key={t.id} 
                    className="bg-black/85 border border-white/10 px-3 py-2 rounded-xl text-[10px] text-white flex items-center gap-2 shadow-lg backdrop-blur pointer-events-auto animate-bounce"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="flex-1 font-mono">{t.message}</span>
                  </div>
                ))}
              </div>

              {/* AR video playing overlay */}
              {arVideoPlaying && (
                <div className="absolute inset-0 bg-black/85 z-40 flex flex-col items-center justify-center p-4 pointer-events-auto">
                  <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden w-full max-w-[280px] shadow-2xl flex flex-col">
                    <div className="p-2.5 border-b border-white/5 bg-black/40 flex items-center justify-between text-[10px] font-mono font-bold text-white">
                      <span>🎬 {arVideoPlaying.title}</span>
                      <button 
                        onClick={() => useEditorStore.getState().setARVideoPlaying(null)}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="relative aspect-video bg-black flex items-center justify-center text-[10px]">
                      <video 
                        src={arVideoPlaying.url} 
                        autoPlay 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-2 bg-black/20 text-center text-[7px] text-gray-500 leading-relaxed font-sans">
                      Simulated AR Video Response triggered via Event.
                    </div>
                  </div>
                </div>
              )}

              {/* Top mock iOS/Android style status bar */}
              <div className="flex items-center justify-between text-white/90 text-[10px] font-mono px-3 select-none">
                <span>{currentTime}</span>
                <div className="flex items-center gap-1.5">
                  <Signal size={10} className="stroke-[2.5]" />
                  <span className="text-[8px] font-bold">5G</span>
                  <Wifi size={10} />
                  <div className="flex items-center gap-0.5 border border-white/30 rounded px-0.5 py-px text-[7px] font-bold">
                    <BatteryCharging size={10} className="text-emerald-400 animate-pulse" />
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Middle top alignment tracking indicator banner */}
              <div className="flex justify-center mt-3 select-none">
                <div className={`px-3.5 py-1 rounded-full border text-[9px] uppercase tracking-widest font-mono font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md transition-all duration-300 ${
                  trackingStable 
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                    : "bg-amber-950/40 border-amber-500/30 text-amber-300"
                }`}>
                  {trackingStable ? (
                    <>
                      <CheckCircle size={10} className="text-emerald-400" />
                      <span>Tracking Locked</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={10} className="text-amber-400 animate-spin shrink-0" />
                      <span>{settings.trackingMode === 'face' ? 'Detecting Face...' : settings.trackingMode === 'surface' ? 'Detecting Surface...' : 'Searching Marker...'}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Scanning neon horizontal sweeping laser (only when tracking is active but not locked) */}
              {!trackingStable && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Neon laser line */}
                  <div className="absolute left-6 right-6 h-0.5 bg-cyan-400/80 shadow-[0_0_12px_#22d3ee] animate-scan-laser rounded-full" />
                  {/* Reticle brackets */}
                  <div className="w-44 h-44 border border-cyan-500/20 relative rounded-2xl flex items-center justify-center animate-pulse">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                    <Sparkles className="text-cyan-400/40 animate-spin" size={24} style={{ animationDuration: '6s' }} />
                  </div>
                </div>
              )}

              {/* Tracking Guide Helper message */}
              <div className="flex justify-center mb-1 bg-black/45 backdrop-blur-sm p-2 rounded-lg border border-white/5 text-center text-white/70 text-[9px] mx-4 pointer-events-auto leading-relaxed">
                {trackingStable 
                  ? (settings.trackingMode === 'face' 
                      ? "👤 Face Locked! 3D glasses & facial filters actively attached to your mesh."
                      : settings.trackingMode === 'surface'
                        ? "📐 Surface Locked! Tap or point to place 3D models onto your floor or wall plane."
                        : "🎯 Point your screen at the physical image print target. Drag to rotate model, click to interact!")
                  : (settings.trackingMode === 'face'
                      ? "👤 Position your face clearly in the camera frame for real-time landmark tracking."
                      : settings.trackingMode === 'surface'
                        ? "📐 Point camera slowly towards a flat floor or wall surface to detect ground planes."
                        : "🔍 Calibrating spatial environment sensors. Keep camera stable.")
                }
              </div>

              {/* Bottom Interactive HUD Dock Panel */}
              <div className="bg-black/60 border border-white/10 p-2 rounded-2xl flex items-center justify-between pointer-events-auto shadow-2xl backdrop-blur-md">
                
                {/* Environment changer */}
                <div className="flex flex-col gap-1">
                  <span className="text-[7px] text-[#888] font-mono font-bold uppercase select-none tracking-wider">Feed Source</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setBgType('office')}
                      className={`p-1.5 rounded transition-colors ${bgType === 'office' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-white/10 text-white/60'}`}
                      title="Office Desk simulated scene"
                    >
                      <Tv size={12} />
                    </button>
                    <button 
                      onClick={() => setBgType('livingroom')}
                      className={`p-1.5 rounded transition-colors ${bgType === 'livingroom' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-white/10 text-white/60'}`}
                      title="Living Room simulated scene"
                    >
                      <Tv size={12} className="rotate-90" />
                    </button>
                    <button 
                      onClick={() => setBgType('techlab')}
                      className={`p-1.5 rounded transition-colors ${bgType === 'techlab' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-white/10 text-white/60'}`}
                      title="Tech Lab simulated scene"
                    >
                      <Tv size={12} className="stroke-[2.5]" />
                    </button>
                    <button 
                      onClick={() => setBgType('webcam')}
                      className={`p-1.5 rounded transition-colors ${bgType === 'webcam' ? 'bg-blue-600 text-white animate-pulse' : 'hover:bg-white/10 text-white/60'}`}
                      title="Connect real computer webcam"
                    >
                      <Camera size={12} />
                    </button>
                  </div>
                </div>

                {/* Central Capture Photo trigger */}
                <button 
                  onClick={triggerSnapshot}
                  className="w-11 h-11 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:scale-90 hover:bg-white/15 transition-all shadow-lg text-white"
                  title="Capture snapshot photo"
                >
                  <Camera size={18} className="fill-current text-white" />
                </button>

                {/* Frame configuration & tracking resets */}
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-[7px] text-[#888] font-mono font-bold uppercase select-none tracking-wider">Utilities</span>
                  <div className="flex items-center gap-1.5">
                    {/* Bezel Toggle */}
                    <button 
                      onClick={() => setShowBezel(!showBezel)}
                      className={`p-1.5 rounded transition-colors ${showBezel ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/10'}`}
                      title="Toggle simulated smartphone border"
                    >
                      <Smartphone size={12} />
                    </button>
                    
                    {/* Reset Tracking */}
                    <button 
                      onClick={resetTracking}
                      className="p-1.5 rounded hover:bg-white/10 text-white/80 transition-colors"
                      title="Calibrate / Re-align AR Tracking"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* AR Snapshot Preview & Share Modal */}
        <SnapshotShareModal
          isOpen={isSnapshotModalOpen}
          onClose={() => setIsSnapshotModalOpen(false)}
          rawImageDataUrl={snapshotDataUrl}
          initialWatermark={snapshotInitialWatermark}
          initialIncludeTimestamp={snapshotIncludeTimestamp}
          onRetake={() => captureARSnapshot()}
        />
      </div>
    );
  }

  const ambientColor = settings.ambientColor || '#ffffff';
  const ambientIntensity = settings.ambientIntensity ?? 0.5;
  const directionalColor = settings.directionalColor || '#ffffff';
  const directionalIntensity = settings.directionalIntensity ?? 1.0;
  const directionalPosition = settings.directionalPosition || [10, 10, 5];
  const shadowsEnabled = settings.shadowsEnabled ?? true;
  const shadowIntensity = settings.shadowIntensity ?? 0.6;
  const shadowSoftness = settings.shadowSoftness ?? 3.0;
  const shadowResolution = settings.shadowResolution ?? 1024;

  return (
    <div 
      className="w-full h-full relative bg-[#222224] select-none overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* 3D WebGL Canvas Layer for Scene Editor */}
      <div 
        className="absolute inset-0 z-10"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <ErrorBoundary
          resetKeys={[activeSceneId, currentProjectId]}
          fallback={(error, reset) => (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#141418] text-white p-6 z-50 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
                <Sparkles size={28} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">3D Viewport Recovered</h3>
              <p className="text-xs text-gray-400 text-center max-w-md mb-5 leading-relaxed">
                The 3D WebGL rendering context was refreshed. Your scene objects, hierarchy, and project data are safe.
              </p>
              <button
                onClick={() => {
                  reset();
                  useEditorStore.getState().selectObject(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw size={13} />
                <span>Restart 3D Engine</span>
              </button>
            </div>
          )}
        >
          <Canvas 
            camera={{ position: [0, -4, 4], fov: 50, up: [0, 0, 1] }}
            onPointerMissed={handlePointerMissed}
            gl={{ preserveDrawingBuffer: true, powerPreference: 'high-performance', antialias: true }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', (e) => {
                e.preventDefault();
                console.warn('Editor WebGL context lost handled');
              }, false);
            }}
          >
            {cameraType === 'orthographic' ? (
              <OrthographicCamera
                makeDefault
                position={[0, -4, 4]}
                zoom={80}
                near={-1000}
                far={1000}
                up={[0, 0, 1]}
              />
            ) : (
              <PerspectiveCamera
                makeDefault
                position={[0, -4, 4]}
                fov={50}
                near={0.1}
                far={1000}
                up={[0, 0, 1]}
              />
            )}
            <SelectionMarquee orbitControlsRef={orbitControlsRef} />
            <SceneRefCapturer sceneRef={sceneRef} />
            <AutoSceneLightingEngine />
            <CameraController activeAxisView={activeAxisView} axisUpdateId={axisUpdateId} orbitControlsRef={orbitControlsRef} onResetTo3D={() => setActiveAxisView('3D')} />
            <Grid 
              position={[0, 0, -0.01]} 
              args={[100, 100]} 
              cellSize={1} 
              cellThickness={1} 
              cellColor="#333338" 
              sectionSize={5} 
              sectionThickness={1.5} 
              sectionColor="#555562" 
              fadeDistance={40} 
              fadeStrength={1} 
              rotation={[Math.PI / 2, 0, 0]}
            />

            {rootObjects.map(id => (
              <MemoizedObjectRenderer key={id} id={id} />
            ))}

            <TransformController orbitControlsRef={orbitControlsRef} activeAxisView={activeAxisView} />
            <SelectionHighlight3D />
            <ScaleSnapGridVisualizer />
            <ProjectedPositionsUpdater />
            <ThumbnailCapturer />

            <GizmoHelper 
              alignment="top-right" 
              margin={[
                typeof window !== 'undefined' && window.innerWidth < 768 ? 55 : 70, 
                typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 75
              ]}
            >
              <ZUpGizmoViewport onSelectAxisView={handleSelectAxisView} />
            </GizmoHelper>

            <OrbitControls 
              ref={orbitControlsRef} 
              enabled={!isDraggableDragging && !cameraOrbitLocked} 
              enableRotate={!isDraggableDragging && !cameraOrbitLocked && !isPlanarOrthographicView} 
              enablePan={!isDraggableDragging && !cameraOrbitLocked} 
              enableZoom={!isDraggableDragging && !cameraOrbitLocked}
              screenSpacePanning={true}
              mouseButtons={
                isPlanarOrthographicView ? {
                  LEFT: THREE.MOUSE.PAN,
                  MIDDLE: THREE.MOUSE.DOLLY,
                  RIGHT: THREE.MOUSE.PAN
                } : {
                  LEFT: THREE.MOUSE.ROTATE,
                  MIDDLE: THREE.MOUSE.DOLLY,
                  RIGHT: THREE.MOUSE.PAN
                }
              }
              touches={
                isPlanarOrthographicView ? {
                  ONE: THREE.TOUCH.PAN,
                  TWO: THREE.TOUCH.DOLLY_PAN
                } : {
                  ONE: THREE.TOUCH.ROTATE,
                  TWO: THREE.TOUCH.DOLLY_PAN
                }
              }
              makeDefault 
            />
            <VehiclePhysicsSceneController
              touchInputRef={vehicleTouchInputRef}
              resetTriggerRef={vehicleResetTriggerRef}
              toggleHeadlightsRef={vehicleToggleHeadlightsRef}
            />
            <BloomEffect />
            <PerformanceTracker />
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Interactive Vehicle Driving Physics Simulation HUD */}
      <VehicleDrivingHUD
        onControlInput={(input) => { vehicleTouchInputRef.current = input; }}
        onResetVehicle={() => vehicleResetTriggerRef.current?.()}
        onToggleHeadlights={() => vehicleToggleHeadlightsRef.current?.()}
      />

      {/* Camera Orbit Locked Notification HUD */}
      {cameraOrbitLocked && (
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-xl bg-[#131317]/95 backdrop-blur-xl border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-2 shadow-2xl shadow-black/80 pointer-events-auto select-none animate-in fade-in slide-in-from-top-2">
          <Lock size={12} className="text-amber-400 shrink-0 animate-pulse" />
          <span>Camera Orbit Locked</span>
          <span className="text-[9px] text-amber-400/70 font-mono hidden sm:inline">[L]</span>
          <button 
            onClick={() => toggleCameraOrbitLock()} 
            className="ml-1 px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 text-[10px] font-sans font-bold uppercase transition-all cursor-pointer border border-amber-500/30"
          >
            Unlock
          </button>
        </div>
      )}

      {/* 2D Overlay / HUD Canvas */}
      <Overlay2DRenderer isPreviewMode={false} />

      {/* AR Marker Conflict Alert Banner */}
      <MarkerConflictBanner />

      {/* Dedicated Orthographic Camera Views & Surface Snapping Quick Bar (Top Left) */}
      {!isPreviewMode && (
        <div className="absolute top-14 sm:top-3.5 left-2 sm:left-3.5 z-30 flex flex-wrap items-center gap-1.5 pointer-events-auto select-none max-w-[calc(100vw-16px)]">
          {/* Quick Orthographic Views Pill */}
          <div className="flex items-center gap-0.5 p-1 bg-[#121217]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/70">
            <span className="text-[9.5px] font-mono font-bold text-gray-400 uppercase px-1.5 hidden md:inline">
              View:
            </span>
            
            <button
              onClick={() => {
                setActiveAxisView('Top');
                setCameraType('orthographic');
                setAxisUpdateId((n) => n + 1);
                addToast('Top View (2D Pan & Zoom - 3D Orbit Disabled)');
              }}
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1",
                (activeAxisView === 'Top' || activeAxisView === 'Z')
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 border border-blue-400/50"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              )}
              title="Top View: Locks camera to +Z axis. Drag to Pan 2D, wheel/pinch to Zoom. 3D orbit disabled."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Top</span>
            </button>

            <button
              onClick={() => {
                setActiveAxisView('Front');
                setCameraType('orthographic');
                setAxisUpdateId((n) => n + 1);
                addToast('Front View (2D Pan & Zoom - 3D Orbit Disabled)');
              }}
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1",
                (activeAxisView === 'Front' || activeAxisView === 'Y')
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/30 border border-emerald-400/50"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              )}
              title="Front View: Locks camera to +Y axis. Drag to Pan 2D, wheel/pinch to Zoom. 3D orbit disabled."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Front</span>
            </button>

            <button
              onClick={() => {
                setActiveAxisView('Side');
                setCameraType('orthographic');
                setAxisUpdateId((n) => n + 1);
                addToast('Side View (2D Pan & Zoom - 3D Orbit Disabled)');
              }}
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1",
                (activeAxisView === 'Side' || activeAxisView === 'Right' || activeAxisView === 'X')
                  ? "bg-red-600 text-white shadow-sm shadow-red-500/30 border border-red-400/50"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              )}
              title="Side View: Locks camera to +X axis. Drag to Pan 2D, wheel/pinch to Zoom. 3D orbit disabled."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>Side</span>
            </button>

            <button
              onClick={() => {
                setActiveAxisView('3D');
                setCameraType('perspective');
                setAxisUpdateId((n) => n + 1);
                addToast('3D Orbit View (Full 3D Rotation Enabled)');
              }}
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1",
                (activeAxisView === 'Isometric' || activeAxisView === '3D' || activeAxisView === 'ISO')
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30 border border-purple-400/50"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              )}
              title="Switch to 3D Orbit View: Enables full 3D rotation, pitch, and yaw."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>3D Orbit</span>
            </button>

            {isPlanarOrthographicView && (
              <button
                onClick={() => {
                  setActiveAxisView('3D');
                  setCameraType('perspective');
                  setAxisUpdateId((n) => n + 1);
                  addToast('Switched to 3D Orbit View');
                }}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1 shadow-xs"
                title="Camera rotation is locked for 2D pan/zoom alignment. Click to switch to 3D Orbit."
              >
                <RotateCw size={10} className="text-amber-400" />
                <span>Switch to 3D Orbit</span>
              </button>
            )}
          </div>

          {/* Quick Projection & Surface Snap Helper Pill */}
          <div className="flex items-center gap-1 p-1 bg-[#121217]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/70">
            {/* Projection Mode Toggle */}
            <button
              onClick={() => {
                const nextType = cameraType === 'perspective' ? 'orthographic' : 'perspective';
                setCameraType(nextType);
                addToast(`Camera Projection: ${nextType.toUpperCase()}`);
              }}
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 border",
                cameraType === 'orthographic'
                  ? "bg-cyan-600/30 text-cyan-300 border-cyan-400/50 shadow-xs"
                  : "bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10"
              )}
              title={cameraType === 'orthographic' ? "Camera in Orthographic projection mode. Click for Perspective." : "Camera in Perspective projection mode. Click for Orthographic."}
            >
              <Compass size={11} className={cameraType === 'orthographic' ? 'text-cyan-400 animate-spin' : ''} style={{ animationDuration: '12s' }} />
              <span>{cameraType === 'orthographic' ? 'Ortho' : 'Persp'}</span>
            </button>

            {/* Surface Snapping Toggle */}
            <button
              onClick={() => {
                const next = !surfaceSnapEnabled;
                setSurfaceSnapEnabled(next);
                addToast(next ? "Surface Snap: ON (Object-to-surface alignment)" : "Surface Snap: OFF");
              }}
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 border",
                surfaceSnapEnabled
                  ? "bg-cyan-500 text-white border-cyan-300 shadow-sm shadow-cyan-500/25"
                  : "bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10"
              )}
              title="Toggle Object-to-Surface Snapping (aligns flush with AR targets, ground, and other 3D surfaces)"
            >
              <Magnet size={11} className={surfaceSnapEnabled ? "text-white animate-pulse" : "text-gray-400"} />
              <span>Surface Snap</span>
            </button>
          </div>
        </div>
      )}

      {/* Performance Engine Monitor HUD */}
      {showPerformanceMonitor && (
        <div className="absolute top-4 left-4 z-40 bg-[#121217]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl text-xs font-mono text-white flex flex-col gap-2 min-w-[200px] pointer-events-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={12} className="text-yellow-400" />
              Engine Stats
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-gray-400 text-[10px]">FPS</span>
              <div id="perf-fps" className="text-sm font-bold text-emerald-400">60</div>
            </div>
            <div>
              <span className="text-gray-400 text-[10px]">Draw Calls</span>
              <div id="perf-calls" className="text-sm font-bold text-blue-400">0</div>
            </div>
            <div>
              <span className="text-gray-400 text-[10px]">Geometries</span>
              <div id="perf-geometries" className="text-sm font-bold text-gray-200">0</div>
            </div>
            <div>
              <span className="text-gray-400 text-[10px]">Textures</span>
              <div id="perf-textures" className="text-sm font-bold text-gray-200">0</div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-1 flex justify-between items-center text-[10px]">
            <span className="text-gray-400">GPU/Memory:</span>
            <span id="perf-memory" className="font-bold text-purple-300">0 MB</span>
          </div>
        </div>
      )}

      {/* Floating Spline 3D Viewport Navigation Bar (Desktop / Tablet - on mobile, tools are in mobile dock) */}
      {!isPreviewMode && (
        <div className="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[96vw]">
          <div 
            className="flex items-center gap-1.5 p-1.5 bg-[#121217]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/80 font-sans text-xs select-none overflow-x-auto touch-pan-x"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onWheel={(e) => {
              if (e.currentTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {/* Tool Modes Group: Pointer (V), Box Select (B), Move (W), Rotate (E), Scale (R) */}
            <div className="flex items-center gap-1 bg-[#1a1a24] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => {
                  setBoxSelectToolActive?.(false);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  !isBoxSelectToolActive && !transformMode
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Pointer Select Mode [V]"
              >
                <MousePointer size={14} />
              </button>

              <button
                onClick={() => {
                  toggleBoxSelectTool?.();
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  isBoxSelectToolActive
                    ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/40 ring-1 ring-cyan-300'
                    : 'text-gray-400 hover:text-cyan-400 hover:bg-white/5'
                }`}
                title="Box Selection Tool [B / Shift+Drag] - Drag 3D bounding box to select multiple objects"
              >
                <BoxSelect size={14} />
              </button>

              <button
                onClick={() => {
                  setBoxSelectToolActive?.(false);
                  setTransformMode('translate');
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  !isBoxSelectToolActive && transformMode === 'translate'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Translate / Move [W]"
              >
                <Move size={14} />
              </button>

              <button
                onClick={() => {
                  setBoxSelectToolActive?.(false);
                  setTransformMode('rotate');
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  !isBoxSelectToolActive && transformMode === 'rotate'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Rotate [E]"
              >
                <RotateCw size={14} />
              </button>

              <button
                onClick={() => {
                  setBoxSelectToolActive?.(false);
                  setTransformMode('scale');
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  !isBoxSelectToolActive && transformMode === 'scale'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Scale [R]"
              >
                <Maximize size={14} />
              </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-0.5" />

            {/* Coordinate Space Toggles (Local vs World [Q]) */}
            <div className="flex items-center bg-[#1a1a24] p-1 rounded-xl border border-white/5 gap-0.5" title="Toggle Transform Coordinate Space [Q]">
              <button
                onClick={() => useEditorStore.getState().setTransformSpace('local')}
                className={`h-6 sm:h-6.5 px-2 rounded-lg flex items-center gap-1 font-mono text-[10px] font-bold transition-all cursor-pointer select-none ${
                  transformSpace === 'local'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Local Space - Transforms align with object's own rotation"
              >
                <Box size={11} />
                <span>Local</span>
              </button>
              <button
                onClick={() => useEditorStore.getState().setTransformSpace('world')}
                className={`h-6 sm:h-6.5 px-2 rounded-lg flex items-center gap-1 font-mono text-[10px] font-bold transition-all cursor-pointer select-none ${
                  transformSpace === 'world'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="World Space - Transforms align with global world axes"
              >
                <Globe size={11} />
                <span>World</span>
              </button>
              <span className="text-[8px] bg-white/10 text-gray-400 px-1 py-0.5 rounded font-sans ml-0.5 hidden md:inline" title="Press Q to toggle space">Q</span>
            </div>

            <div className="w-px h-6 bg-white/10 mx-0.5" />

            {/* Axis Lock Controls */}
            <div className="flex items-center gap-1.5 bg-[#181822]/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg" title="Lock transform axis (Translate, Rotate, Scale)">
              <span className="text-[10px] font-mono font-extrabold text-gray-400 px-1 uppercase flex items-center gap-1 select-none">
                <Lock size={11} className="text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Axis:</span>
              </span>

              {/* X Axis Button */}
              <button
                onClick={() => handleToggleAxisLock('x')}
                className={`h-7 sm:h-8 px-2.5 rounded-lg text-xs font-mono font-extrabold transition-all duration-150 ease-out cursor-pointer flex items-center gap-1.5 border select-none active:scale-90 ${
                  lockedAxes?.x
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-400 shadow-md shadow-red-500/40 scale-105 ring-2 ring-red-400/30 font-black'
                    : 'bg-red-950/30 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300'
                }`}
                title="Toggle Lock X Axis (Red)"
              >
                <span className={`w-2 h-2 rounded-full ${lockedAxes?.x ? 'bg-white shadow-sm shadow-white/80' : 'bg-red-500 shadow-sm shadow-red-500/50'}`} />
                <span>X</span>
                {lockedAxes?.x ? (
                  <Lock size={10} className="text-white drop-shadow" />
                ) : (
                  <Unlock size={10} className="opacity-40" />
                )}
              </button>

              {/* Y Axis Button */}
              <button
                onClick={() => handleToggleAxisLock('y')}
                className={`h-7 sm:h-8 px-2.5 rounded-lg text-xs font-mono font-extrabold transition-all duration-150 ease-out cursor-pointer flex items-center gap-1.5 border select-none active:scale-90 ${
                  lockedAxes?.y
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-400 shadow-md shadow-emerald-500/40 scale-105 ring-2 ring-emerald-400/30 font-black'
                    : 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-300'
                }`}
                title="Toggle Lock Y Axis (Green)"
              >
                <span className={`w-2 h-2 rounded-full ${lockedAxes?.y ? 'bg-white shadow-sm shadow-white/80' : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'}`} />
                <span>Y</span>
                {lockedAxes?.y ? (
                  <Lock size={10} className="text-white drop-shadow" />
                ) : (
                  <Unlock size={10} className="opacity-40" />
                )}
              </button>

              {/* Z Axis Button */}
              <button
                onClick={() => handleToggleAxisLock('z')}
                className={`h-7 sm:h-8 px-2.5 rounded-lg text-xs font-mono font-extrabold transition-all duration-150 ease-out cursor-pointer flex items-center gap-1.5 border select-none active:scale-90 ${
                  lockedAxes?.z
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400 shadow-md shadow-blue-500/40 scale-105 ring-2 ring-blue-400/30 font-black'
                    : 'bg-blue-950/30 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 hover:text-blue-300'
                }`}
                title="Toggle Lock Z Axis (Blue)"
              >
                <span className={`w-2 h-2 rounded-full ${lockedAxes?.z ? 'bg-white shadow-sm shadow-white/80' : 'bg-blue-500 shadow-sm shadow-blue-500/50'}`} />
                <span>Z</span>
                {lockedAxes?.z ? (
                  <Lock size={10} className="text-white drop-shadow" />
                ) : (
                  <Unlock size={10} className="opacity-40" />
                )}
              </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-0.5" />

            {/* Camera Controls Group: Frame Selected (F), Reset Camera Orbit (Home), Axis Presets, Projection Toggle */}
            <div className="flex items-center gap-1 bg-[#1a1a24] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-frame-selected'))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                title={selectedObjectId ? "Focus / Frame Selected Object [F]" : "Focus / Recenter Scene [F]"}
              >
                <Crosshair size={14} className="text-cyan-400" />
              </button>

              <button
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-reset-camera'))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                title="Reset Camera Orbit [Home]"
              >
                <RefreshCw size={14} className="text-amber-400" />
              </button>

              {/* Axis Preset Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAxisMenuOpen(!isAxisMenuOpen)}
                  className="h-8 px-2.5 rounded-lg flex items-center gap-1 bg-[#121217] border border-white/10 text-gray-300 hover:text-white hover:bg-[#25252e] hover:border-blue-500/50 transition-all cursor-pointer select-none"
                  title="Select Camera Axis Preset (3D, Top, Front, Right, etc.)"
                >
                  <span className="font-mono font-bold text-[10px] tracking-wide">{activeAxisView}</span>
                  <ChevronDown size={10} className={`text-gray-500 transition-transform duration-200 ${isAxisMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAxisMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsAxisMenuOpen(false)} 
                    />
                    <div className="absolute bottom-full mb-1.5 left-0 z-50 bg-[#121217]/95 border border-white/10 rounded-xl p-1.5 shadow-2xl min-w-[130px] flex flex-col gap-1 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-gray-500 border-b border-white/5">
                        Camera Views
                      </div>
                      <button
                        onClick={() => handleSelectAxisView('3D')}
                        className={`h-7 px-2 rounded-lg flex items-center justify-between text-[11px] font-sans font-medium transition-all cursor-pointer select-none w-full hover:bg-white/5 ${activeAxisView === '3D' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-gray-300'}`}
                      >
                        <span>3D Orbit</span>
                        <span className="font-mono text-[9px] px-1 bg-white/5 rounded text-purple-300">ISO</span>
                      </button>

                      <button
                        onClick={() => handleSelectAxisView('Z')}
                        className={`h-7 px-2 rounded-lg flex items-center justify-between text-[11px] font-sans font-medium transition-all cursor-pointer select-none w-full hover:bg-white/5 ${activeAxisView === 'Z' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-300'}`}
                      >
                        <span>Top (+Z)</span>
                        <span className="font-mono text-[9px] px-1 bg-blue-500/20 rounded text-blue-400 font-bold">Z</span>
                      </button>

                      <button
                        onClick={() => handleSelectAxisView('Y')}
                        className={`h-7 px-2 rounded-lg flex items-center justify-between text-[11px] font-sans font-medium transition-all cursor-pointer select-none w-full hover:bg-white/5 ${activeAxisView === 'Y' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' : 'text-gray-300'}`}
                      >
                        <span>Front (+Y)</span>
                        <span className="font-mono text-[9px] px-1 bg-emerald-500/20 rounded text-emerald-400 font-bold">Y</span>
                      </button>

                      <button
                        onClick={() => handleSelectAxisView('X')}
                        className={`h-7 px-2 rounded-lg flex items-center justify-between text-[11px] font-sans font-medium transition-all cursor-pointer select-none w-full hover:bg-white/5 ${activeAxisView === 'X' ? 'bg-red-600/20 text-red-400 border border-red-500/20' : 'text-gray-300'}`}
                      >
                        <span>Right (+X)</span>
                        <span className="font-mono text-[9px] px-1 bg-red-500/20 rounded text-red-400 font-bold">X</span>
                      </button>

                      <button
                        onClick={() => handleSelectAxisView('-X')}
                        className={`h-7 px-2 rounded-lg flex items-center justify-between text-[11px] font-sans font-medium transition-all cursor-pointer select-none w-full hover:bg-white/5 ${activeAxisView === '-X' ? 'bg-red-900/30 text-red-300 border border-red-500/20' : 'text-gray-400'}`}
                      >
                        <span>Left (-X)</span>
                        <span className="font-mono text-[9px] px-1 bg-white/5 rounded text-gray-400">-X</span>
                      </button>

                      <button
                        onClick={() => handleSelectAxisView('-Y')}
                        className={`h-7 px-2 rounded-lg flex items-center justify-between text-[11px] font-sans font-medium transition-all cursor-pointer select-none w-full hover:bg-white/5 ${activeAxisView === '-Y' ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/20' : 'text-gray-400'}`}
                      >
                        <span>Back (-Y)</span>
                        <span className="font-mono text-[9px] px-1 bg-white/5 rounded text-gray-400">-Y</span>
                      </button>

                      <button
                        onClick={() => handleSelectAxisView('-Z')}
                        className={`h-7 px-2 rounded-lg flex items-center justify-between text-[11px] font-sans font-medium transition-all cursor-pointer select-none w-full hover:bg-white/5 ${activeAxisView === '-Z' ? 'bg-blue-900/30 text-blue-300 border border-blue-500/20' : 'text-gray-400'}`}
                      >
                        <span>Bottom (-Z)</span>
                        <span className="font-mono text-[9px] px-1 bg-white/5 rounded text-gray-400">-Z</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Perspective vs Orthographic Projection Toggle */}
              <button
                onClick={() => setCameraType(cameraType === 'perspective' ? 'orthographic' : 'perspective')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${cameraType === 'orthographic' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title={`Projection: ${cameraType === 'perspective' ? 'Perspective (Click for Orthographic)' : 'Orthographic (Click for Perspective)'}`}
              >
                <Compass size={14} className={cameraType === 'orthographic' ? 'animate-spin' : ''} style={{ animationDuration: cameraType === 'orthographic' ? '12s' : '0s' }} />
              </button>

              {/* Camera Orbit Lock Toggle */}
              <button
                onClick={() => toggleCameraOrbitLock()}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  cameraOrbitLocked 
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={cameraOrbitLocked ? "Camera Orbit Locked (Click to Unlock) [L]" : "Lock Camera Orbit View [L]"}
              >
                {cameraOrbitLocked ? <Lock size={14} className="text-amber-400" /> : <Unlock size={14} />}
              </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-0.5" />

            {/* Viewport Overlays Group: Position Snap (G), Rotation Snap, Wireframe Mode, AR Physics & Collision Debugger, Performance Stats */}
            <div className="flex items-center gap-1 bg-[#1a1a24] p-1 rounded-xl border border-white/5">
              {/* Comprehensive Snap-to-Grid & Print Alignment Dropdown */}
              <SnapToGridMenu direction="up" align="center" />

              <button
                onClick={() => setWireframeEnabled(!wireframeEnabled)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${wireframeEnabled ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title={wireframeEnabled ? "Disable Global Wireframe Mode" : "Enable Global Wireframe Mode"}
              >
                <Layers size={14} />
              </button>

              <button
                onClick={() => {
                  const next = !selectedModelWireframeEnabled;
                  setSelectedModelWireframeEnabled(next);
                  setVisualizationMode(next ? 'selectedWireframe' : 'standard');
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 relative ${
                  selectedModelWireframeEnabled
                    ? 'bg-cyan-600/25 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={
                  selectedModelWireframeEnabled
                    ? "Visualization Mode: Disable Selected Model Wireframe"
                    : "Visualization Mode: Toggle Wireframe for Selected Models (Assess Topology & Print-Ad AR Optimization)"
                }
              >
                <Boxes size={14} className={selectedModelWireframeEnabled ? 'text-cyan-300 animate-pulse' : ''} />
                {selectedModelWireframeEnabled && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                )}
              </button>

              <button
                onClick={() => toggleDrivingActive()}
                className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 text-xs font-bold cursor-pointer ${
                  isDrivingActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                    : 'text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/10 border border-white/5'
                }`}
                title={isDrivingActive ? "Exit Vehicle Driving Mode [Esc]" : "Engage Vehicle Driving Simulator & Physics Rig"}
              >
                <Car size={13} className={isDrivingActive ? 'text-black fill-black' : 'text-cyan-400'} />
                <span>{isDrivingActive ? 'Driving' : 'Drive'}</span>
                {isDrivingActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                )}
              </button>

              <button
                onClick={() => setCollisionDebuggerEnabled(!collisionDebuggerEnabled)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative ${collisionDebuggerEnabled ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30 scale-105 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title={collisionDebuggerEnabled ? "Disable AR Physics & Collision Debugger" : "Enable AR Physics & Collision Debugger"}
              >
                <Shield size={14} className={collisionDebuggerEnabled ? 'animate-pulse' : ''} />
                {collisionDebuggerEnabled && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                )}
              </button>

              <button
                onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showPerformanceMonitor ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title={showPerformanceMonitor ? "Hide Performance Stats Engine" : "Show Performance Stats Engine"}
              >
                <Zap size={14} className={showPerformanceMonitor ? 'animate-pulse' : ''} />
              </button>

              <button
                onClick={() => toggleLiveInteractionsInDesign()}
                className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 transition-colors text-xs font-medium ${
                  liveInteractionsInDesign
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={
                  liveInteractionsInDesign
                    ? "Live Interactions Active in Design View (Click to Disable)"
                    : "Enable Live Interactions in Design View (Preview-only by default)"
                }
              >
                <Play size={12} className={liveInteractionsInDesign ? 'fill-emerald-400 text-emerald-400' : ''} />
                <span>Live</span>
              </button>

              <button
                onClick={() => setIsPublicationModalOpen(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-gray-400 hover:text-white hover:bg-white/5"
                title="Open 3D Embed & GLTF Export Center"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Topology & Print-Ad AR Optimization Assessment Card */}
      {selectedModelWireframeEnabled && selectedObjectId && objects[selectedObjectId] && (
        <div className="absolute top-16 right-4 z-40 bg-zinc-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl w-80 text-white animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Boxes size={15} className="text-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-300 tracking-wide uppercase">Topology & Optimization</span>
            </div>
            <button
              onClick={() => {
                setSelectedModelWireframeEnabled(false);
                setVisualizationMode('standard');
              }}
              className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              title="Close Topology Visualizer"
            >
              <X size={13} />
            </button>
          </div>

          <div className="mt-2.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-300">
              <span className="text-gray-400">Target Model:</span>
              <span className="font-mono text-cyan-200 truncate max-w-[170px]">
                {objects[selectedObjectId]?.name || objects[selectedObjectId]?.type || 'Selected Object'}
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-300">
              <span className="text-gray-400">Rendering Mode:</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-semibold uppercase tracking-wider">
                Wireframe Active
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-[11px]">Print-Ad AR Readiness:</span>
                <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                  <CheckCircle size={12} /> Mobile Verified
                </span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Wireframe mode isolates edge density to verify clean quad/tri triangulation, vertex distribution, and avoid texture z-fighting when tracked across print media.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setSelectedModelWireframeEnabled(false);
                  setVisualizationMode('standard');
                }}
                className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-center text-[11px] text-gray-300 font-medium transition-colors"
              >
                Shaded View
              </button>
              <button
                onClick={() => {
                  setSelectedModelWireframeEnabled(true);
                  setVisualizationMode('selectedWireframe');
                }}
                className="flex-1 py-1.5 px-2 bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-500/50 rounded-lg text-center text-[11px] text-cyan-200 font-medium transition-colors"
              >
                Wireframe View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transparent, Non-Distracting Transform HUD Callout */}
      <TransformHUDCallout />

      {/* AR Snapshot Preview & Share Modal */}
      <SnapshotShareModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        rawImageDataUrl={snapshotDataUrl}
        initialWatermark={snapshotInitialWatermark}
        initialIncludeTimestamp={snapshotIncludeTimestamp}
        onRetake={() => captureARSnapshot()}
      />

      {/* Spline 3D Publish & Export Center Modal */}
      <PublicationModal
        isOpen={isPublicationModalOpen}
        onClose={() => setIsPublicationModalOpen(false)}
        sceneRef={sceneRef.current}
      />
    </div>
  );
}
