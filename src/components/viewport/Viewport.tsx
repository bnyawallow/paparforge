import React, { useRef, useState, useEffect, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Text, useGLTF, useTexture, GizmoHelper, GizmoViewport, useAnimations, Html } from '@react-three/drei';
import { useEditorStore } from '../../store/useEditorStore';
import { SceneObject } from '../../types';
import * as THREE from 'three';
import { 
  Maximize, 
  RotateCw, 
  Move, 
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
  Grid as GridIcon,
  Layers,
  Compass
} from 'lucide-react';

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

// Interactive physical 3D Push Button and Floating Glassmorphic UI Panel
function Interactive3DButton({ obj, isPreviewMode, onInteract }: { obj: SceneObject; isPreviewMode: boolean; onInteract?: () => void }) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const wireframe = useEditorStore(state => state.wireframeEnabled) || false;

  const style = obj.properties.buttonStyle || '3d_push';
  const color = obj.properties.color || '#3b82f6';
  const textColor = obj.properties.textColor || '#ffffff';
  const text = obj.properties.text || 'Action';
  const url = obj.properties.url || '';

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onInteract) onInteract();
  };

  if (style === 'glass_panel') {
    return (
      <group>
        {/* Glass panel frame backing plate */}
        <mesh castShadow receiveShadow>
          <planeGeometry args={[1.5, 0.8]} />
          <meshStandardMaterial 
            color="#0a0a0a" 
            transparent 
            opacity={0.25} 
            roughness={0.15} 
            metalness={0.9} 
            side={THREE.DoubleSide} 
            wireframe={wireframe}
          />
        </mesh>
        
        <Html zIndexRange={[10, 0]}
          transform
          occlude
          pointerEvents={isPreviewMode ? "auto" : "none"}
          distanceFactor={1.25}
          position={[0, 0, 0.02]}
        >
          <div className="flex flex-col gap-2.5 p-4 bg-neutral-900/50 border border-white/10 backdrop-blur-md rounded-xl shadow-2xl text-white font-sans w-64 items-center justify-center select-none">
            <div className="flex items-center gap-1.5 text-[9px] text-blue-400 font-mono tracking-wider uppercase">
              <Sparkles size={10} className="animate-pulse" />
              <span>Interactive Panel</span>
            </div>
            
            <button 
              onClick={handleClick}
              style={{ backgroundColor: color, color: textColor }}
              className="w-full py-2 px-4 rounded-lg font-bold text-xs shadow-lg transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{text}</span>
            </button>
            
            {url && (
              <span className="text-[8px] text-neutral-400 font-mono truncate max-w-full">
                {url}
              </span>
            )}
          </div>
        </Html>
      </group>
    );
  }

  // 3D Push Button Style
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
            emissiveIntensity={isHovered ? 0.15 : 0.0}
            wireframe={wireframe}
          />
        </mesh>

        {/* True 3D Text Extrusion */}
        <Volumetric3DText 
          text={text}
          color={textColor}
          fontSize={0.16}
          position={[0, 0, 0.06]}
          anchorX="center"
          anchorY="middle"
        />
      </group>
    </group>
  );
}

// Interactive 3D YouTube Screen & Bezel with Live Embedding
function InteractiveYoutubeScreen({ obj, isPreviewMode }: { obj: SceneObject; isPreviewMode: boolean }) {
  const videoId = obj.properties.videoId;
  const autoplay = obj.properties.autoplay ? 1 : 0;
  const mute = obj.properties.mute ? 1 : 0;
  const loop = obj.properties.loop ? 1 : 0;
  const controls = obj.properties.controls === false ? 0 : 1;

  return (
    <group>
      {/* 3D monitor plane back cover */}
      <mesh castShadow receiveShadow>
        <planeGeometry args={[1.7, 1.0]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Actual HTML Screen Display Panel */}
      <Html zIndexRange={[10, 0]}
        transform
        occlude
        pointerEvents={isPreviewMode ? 'auto' : 'none'}
        distanceFactor={1.25}
        position={[0, 0, 0.01]}
        style={{
          width: '640px',
          height: '376px',
          background: '#09090b',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)'
        }}
      >
        {videoId ? (
          <iframe
            key={`${videoId}-${autoplay}-${loop}-${mute}-${controls}`}
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&autoplay=${autoplay}&controls=${controls}&mute=${autoplay ? 1 : mute}&loop=${loop}${loop ? `&playlist=${videoId}` : ''}&rel=0`}
            title="Interactive 3D Media Screen"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 flex flex-col justify-center items-center text-white font-sans border border-white/5 select-none">
            <Tv size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-bold tracking-tight uppercase text-neutral-200">YouTube Video Plane</h3>
            <p className="text-sm text-neutral-400 mt-2 max-w-[280px] text-center leading-relaxed">
              Provide a YouTube Video ID in the Inspector properties panel to cast streaming HD video.
            </p>
          </div>
        )}
      </Html>
    </group>
  );
}

// Robust GLTF / GLB 3D Model with Full Animation Clip Mixer support
function GLTFModel({ url, properties, id }: { url: string; properties: any; id: string }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  
  // Clone scene so multiple model instances have independent animation/bone controllers
  const clonedScene = React.useMemo(() => {
    return scene.clone();
  }, [scene]);

  const { actions, names } = useAnimations(animations, group);

  const storeWireframe = useEditorStore(state => state.wireframeEnabled) || false;
  const wireframe = storeWireframe || (properties.wireframe ?? false);

  // Auto-traverse mesh elements to enable real-time shadows and wireframe
  useEffect(() => {
    clonedScene.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
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
    });
  }, [clonedScene, wireframe]);

  // Discover and store model's keyframe clips in state
  useEffect(() => {
    if (names && names.length > 0) {
      const currentAnims = useEditorStore.getState().objects[id]?.properties.discoveredAnimations;
      if (!currentAnims || JSON.stringify(currentAnims) !== JSON.stringify(names)) {
        useEditorStore.getState().updateObject(id, {
          properties: {
            ...useEditorStore.getState().objects[id]?.properties,
            discoveredAnimations: names
          }
        });
      }
    }
  }, [names, id]);

  const activeAnimation = properties.activeAnimation || (names && names[0]) || '';
  const animationPlaying = properties.animationPlaying !== false;
  const animationSpeed = properties.animationSpeed ?? 1.0;

  useEffect(() => {
    if (!actions) return;
    
    // Deactivate all previous tracks
    Object.values(actions).forEach(action => action?.stop());

    // Play active target keyframe track
    const action = actions[activeAnimation];
    if (action) {
      action.reset();
      action.setEffectiveTimeScale(animationSpeed);
      if (animationPlaying) {
        action.play();
      } else {
        action.play().paused = true;
      }
    } else {
      // Automatic fallback to first track if active clip not specified
      const fallbackAction = Object.values(actions)[0];
      if (fallbackAction) {
        fallbackAction.reset();
        fallbackAction.setEffectiveTimeScale(animationSpeed);
        if (animationPlaying) {
          fallbackAction.play();
        } else {
          fallbackAction.play().paused = true;
        }
      }
    }
  }, [actions, activeAnimation, animationPlaying, animationSpeed]);

  return <primitive ref={group} object={clonedScene} />;
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

function ImageTargetRenderer({ obj }: { obj: SceneObject }) {
  if (obj.properties.textureUrl) {
    return <ImageTargetWithTexture obj={obj} />;
  }
  
  const width = (obj.properties.physicalWidth || 1) * 50;
  return (
    <mesh>
      <planeGeometry args={[width, width]} />
      <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ImageTargetWithTexture({ obj }: { obj: SceneObject }) {
  const texture = useTexture(obj.properties.textureUrl) as any;
  const width = (obj.properties.physicalWidth || 1) * 50;
  const height = texture && texture.image ? width * (texture.image.height / texture.image.width) : width;
  const wireframe = useEditorStore(state => state.wireframeEnabled) || false;
  
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      {texture && <meshBasicMaterial map={texture} transparent opacity={0.8} side={THREE.DoubleSide} wireframe={wireframe} />}
    </mesh>
  );
}

// Textured material rendering for primitives - Upgraded to supports custom physical parameters and multiple maps
function TexturedMaterial({ properties, defaultColor }: { properties: any; defaultColor: string }) {
  const color = properties.color || defaultColor;
  const storeWireframe = useEditorStore(state => state.wireframeEnabled) || false;
  const wireframe = storeWireframe || (properties.wireframe ?? false);
  const opacity = properties.opacity ?? 1;
  const doubleSided = properties.doubleSided ?? false;
  
  // Basic properties
  const roughness = properties.roughness ?? 0.5;
  const metalness = properties.metalness ?? 0.1;
  
  // Emissive properties
  const emissiveColor = properties.emissiveColor || '#000000';
  const emissiveIntensity = properties.emissiveIntensity ?? 0;
  
  // Advanced clearcoat / transmission
  const clearcoat = properties.clearcoat ?? 0;
  const clearcoatRoughness = properties.clearcoatRoughness ?? 0.1;
  const transmission = properties.transmission ?? 0;
  const thickness = properties.thickness ?? 0;
  const ior = properties.ior ?? 1.5;
  const flatShading = properties.flatShading ?? false;

  // Map URLs
  const textureUrl = properties.textureUrl;
  const normalMapUrl = properties.normalMapUrl;
  const roughnessMapUrl = properties.roughnessMapUrl;
  const metalnessMapUrl = properties.metalnessMapUrl;
  const displacementMapUrl = properties.displacementMapUrl;
  const displacementScale = properties.displacementScale ?? 0.05;
  const normalScale = properties.normalScale ?? 1;

  // Repeat values
  const repeatX = properties.textureRepeatX ?? 1;
  const repeatY = properties.textureRepeatY ?? 1;

  return (
    <ErrorBoundary fallback={
      <meshStandardMaterial 
        color={color} 
        roughness={roughness} 
        metalness={metalness} 
        wireframe={wireframe} 
        transparent={opacity < 1} 
        opacity={opacity} 
        side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
      />
    }>
      <Suspense fallback={
        <meshStandardMaterial 
          color={color} 
          roughness={roughness} 
          metalness={metalness} 
          wireframe={wireframe} 
          transparent={opacity < 1} 
          opacity={opacity} 
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
          wireframe={wireframe}
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
  wireframe
}: any) {
  const [maps, setMaps] = useState<Record<string, THREE.Texture>>({});

  useEffect(() => {
    const loader = new THREE.TextureLoader();
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
        loader.load(
          url,
          (tex) => {
            if (active) {
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              tex.repeat.set(repeatX || 1, repeatY || 1);
              tex.needsUpdate = true;
              loadedMaps[key] = tex;
            }
            resolve();
          },
          undefined,
          () => {
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

  // Determine whether we should use meshPhysicalMaterial or meshStandardMaterial.
  // meshPhysicalMaterial supports transmission, clearcoat, thickness, ior.
  const isPhysical = clearcoat > 0 || transmission > 0;

  if (isPhysical) {
    return (
      <meshPhysicalMaterial
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

// Beautiful 3D Audio Node simulation
function AudioNodeRenderer({ properties, isPreviewMode }: { properties: any; isPreviewMode: boolean }) {
  const soundUrl = properties.soundUrl || '/sounds/forest_ambient.wav';
  const autoplay = properties.autoplay ?? false;
  const loop = properties.loop ?? true;
  const volume = properties.volume ?? 0.5;
  const isPlaying = properties.playing ?? false;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(soundUrl);
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
        <directionalLight color={color} intensity={intensity} />
      )}
      {lightType === 'point' && (
        <pointLight color={color} intensity={intensity} distance={distance} decay={decay} />
      )}
      {lightType === 'spot' && (
        <spotLight color={color} intensity={intensity} distance={distance} angle={angle} decay={decay} />
      )}
    </group>
  );
}

function ObjectRenderer({ id }: { id: string }) {
  const obj = useEditorStore(state => state.objects[id]);
  const selectedObjectIds = useEditorStore(state => state.selectedObjectIds);
  const selectedObjectId = useEditorStore(state => state.selectedObjectId);
  const selectObject = useEditorStore(state => state.selectObject);
  const isPreviewMode = useEditorStore(state => state.isPreviewMode);
  const meshRef = useRef<THREE.Group>(null);
  
  const isSelected = selectedObjectIds.includes(id);

  // Local state/refs for scripts & proximity triggers
  const wasProximityActiveRef = useRef<Record<string, boolean>>({});
  const hasTriggeredOnStartRef = useRef(false);
  const scriptCallbacksRef = useRef<{
    onTap: (() => void) | null;
    onUpdate: ((time: number, delta: number) => void) | null;
  }>({ onTap: null, onUpdate: null });
  const hasInitializedScriptRef = useRef(false);

  useEffect(() => {
    if (isSelected && meshRef.current) {
      useEditorStore.setState({ selectedObjectRef: meshRef.current });
    }
    return () => {
      if (isSelected) {
        useEditorStore.setState({ selectedObjectRef: null });
      }
    };
  }, [isSelected, id]);

  const executeBehaviorAction = (b: any) => {
    switch (b.action) {
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
      case 'playSound':
        const playUrl = b.soundPreset || '/sounds/success_chime.wav';
        const sfx = new Audio(playUrl);
        sfx.volume = 0.5;
        sfx.play().catch(e => console.log('Audio preset play failed', e));
        break;
      case 'playVideo':
        useEditorStore.getState().setARVideoPlaying({
          title: `${obj ? obj.name : 'Object'} Response Video`,
          url: b.url || 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05c5c839d39e7fa17b4474775836a0c&profile_id=139&oauth2_token_id=57447761'
        });
        break;
      case 'toggleVisibility':
        if (b.targetObjectId) {
          const target = useEditorStore.getState().objects[b.targetObjectId];
          if (target) {
            useEditorStore.getState().updateObject(b.targetObjectId, { visible: !target.visible });
          }
        } else {
          useEditorStore.getState().updateObject(id, { visible: !obj?.visible });
        }
        break;
      case 'spin':
        const targetId = b.targetObjectId || id;
        const targetObj = useEditorStore.getState().objects[targetId];
        if (targetObj) {
          useEditorStore.getState().updateObject(targetId, {
            properties: { ...targetObj.properties, behavior: 'spin' }
          });
        }
        break;
      case 'transform': {
        const targetIdT = b.targetObjectId || id;
        const targetObjT = useEditorStore.getState().objects[targetIdT];
        if (targetObjT) {
           const vals = (b.propertyValue || '0,0,0').split(',').map((v: string) => parseFloat(v) || 0) as [number, number, number];
           if (b.propertyName === 'position') useEditorStore.getState().updateObject(targetIdT, { position: vals });
           else if (b.propertyName === 'rotation') useEditorStore.getState().updateObject(targetIdT, { rotation: vals });
           else if (b.propertyName === 'scale') useEditorStore.getState().updateObject(targetIdT, { scale: vals });
        }
        break;
      }
      case 'material': {
        const targetIdM = b.targetObjectId || id;
        const targetObjM = useEditorStore.getState().objects[targetIdM];
        if (targetObjM) {
           if (b.propertyName === 'color') {
             useEditorStore.getState().updateObject(targetIdM, { properties: { ...targetObjM.properties, color: b.propertyValue } });
           } else if (b.propertyName === 'texture') {
             useEditorStore.getState().updateObject(targetIdM, { properties: { ...targetObjM.properties, textureUrl: b.propertyValue } });
           }
        }
        break;
      }
      default:
        break;
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
      const behaviors = obj.properties.visualBehaviors || [];
      behaviors.forEach((b: any) => {
        if (b.trigger === 'onStart') {
          executeBehaviorAction(b);
        }
      });
      hasTriggeredOnStartRef.current = true;
    }
  }, [isPreviewMode, obj?.properties.visualBehaviors]);

  // Handle behavior animations dynamically with full R3F clock support
  useFrame((state) => {
    if (!meshRef.current || !obj) return;

    // Skip updating position/rotation/scale when actively transforming this selected object
    if (isSelected && isTransformDragging) return;

    const behavior = obj.properties.behavior;
    const t = state.clock.getElapsedTime();

    // 1. Position hover levitation along Z axis (perpendicular to horizontal XY ground plane)
    if (behavior === 'hover') {
      meshRef.current.position.z = obj.position[2] + Math.sin(t * 3) * 0.2;
    } else {
      meshRef.current.position.z = obj.position[2];
    }
    meshRef.current.position.y = obj.position[1];

    // 2. Continuous spin
    const spinAxis = obj.properties.spinAxis || 'z';
    if (behavior === 'spin') {
      if (spinAxis === 'x') {
        meshRef.current.rotation.x = THREE.MathUtils.degToRad(obj.rotation[0]) + t * 0.8;
      } else if (spinAxis === 'y') {
        meshRef.current.rotation.y = THREE.MathUtils.degToRad(obj.rotation[1]) + t * 0.8;
      } else {
        meshRef.current.rotation.z = THREE.MathUtils.degToRad(obj.rotation[2]) + t * 0.8;
      }
    } else {
      if (spinAxis === 'x') meshRef.current.rotation.x = THREE.MathUtils.degToRad(obj.rotation[0]);
      if (spinAxis === 'y') meshRef.current.rotation.y = THREE.MathUtils.degToRad(obj.rotation[1]);
      if (spinAxis === 'z') meshRef.current.rotation.z = THREE.MathUtils.degToRad(obj.rotation[2]);
    }
    
    // Always reset other axes to avoid accumulating rotation on unselected axes
    if (spinAxis !== 'x') meshRef.current.rotation.x = THREE.MathUtils.degToRad(obj.rotation[0]);
    if (spinAxis !== 'y') meshRef.current.rotation.y = THREE.MathUtils.degToRad(obj.rotation[1]);
    if (spinAxis !== 'z') meshRef.current.rotation.z = THREE.MathUtils.degToRad(obj.rotation[2]);

    // 3. Rhythmic size pulse
    if (behavior === 'pulse') {
      const scaleVal = 1 + Math.sin(t * 4.5) * 0.08;
      meshRef.current.scale.set(
        obj.scale[0] * scaleVal,
        obj.scale[1] * scaleVal,
        obj.scale[2] * scaleVal
      );
    } else {
      meshRef.current.scale.set(obj.scale[0], obj.scale[1], obj.scale[2]);
    }

    // 4. Run Custom Script update callback loop
    if (isPreviewMode && scriptCallbacksRef.current.onUpdate && (obj.properties.scriptEnabled ?? true)) {
      try {
        scriptCallbacksRef.current.onUpdate(t, state.clock.getDelta());
      } catch (err) {
        console.error("onUpdate execution error:", err);
      }
    }

    // 5. Evaluate Proximity Visual Event triggers
    if (isPreviewMode) {
      const behaviors = obj.properties.visualBehaviors || [];
      behaviors.forEach((b: any) => {
        if (b.trigger === 'onProximity') {
          const currentPos = new THREE.Vector3();
          meshRef.current!.getWorldPosition(currentPos);
          const dist = currentPos.distanceTo(state.camera.position);
          
          const threshold = parseFloat(b.proximityDistance) || 2.0;
          const isInside = dist <= threshold;
          const wasInside = wasProximityActiveRef.current[b.id] || false;

          if (isInside && !wasInside) {
            executeBehaviorAction(b);
          }
          wasProximityActiveRef.current[b.id] = isInside;
        }
      });
    }
  });

  useEffect(() => {
    if (obj?.properties.visualBehaviors) {
      obj.properties.visualBehaviors.forEach((b: any) => {
        if (b.action === 'playSound' && b.soundPreset) {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = b.soundPreset;
        }
      });
    }
  }, [obj?.properties.visualBehaviors]);

  if (!obj || !obj.visible) return null;

  const rotation: [number, number, number] = [
    THREE.MathUtils.degToRad(obj.rotation[0]),
    THREE.MathUtils.degToRad(obj.rotation[1]),
    THREE.MathUtils.degToRad(obj.rotation[2]),
  ];

  const handleInteract = (e?: any) => {
    if (!isPreviewMode && obj.locked) return; // Prevent selection or clicks on locked items in 3D viewport
    if (e && e.stopPropagation) e.stopPropagation();
    
    console.log(`[Debug Log] Screen tapped on object: ${obj.name} (ID: ${id})`);
    if (!isPreviewMode) {
      const isMulti = e ? (e.shiftKey || e.ctrlKey || e.metaKey) : false;
      selectObject(id, isMulti);
    }
    
    if (isPreviewMode) {
      const hasTapBehavior = (obj.properties.visualBehaviors || []).some((b: any) => b.trigger === 'onTap');
      const hasScriptTap = scriptCallbacksRef.current.onTap && (obj.properties.scriptEnabled ?? true);
      const isButton = obj.type === 'button';
      const hasBasicSound = !!obj.properties.soundUrl;
      if (!hasTapBehavior && !hasScriptTap && !isButton && !hasBasicSound) {
        return; // Only objects with relevant behaviours attached should receive clicks/tap events.
      }
    }

    // Standard Audio playback on click if a sound asset is attached
    if (obj.properties.soundUrl) {
      const sfx = new Audio(obj.properties.soundUrl);
      sfx.volume = 0.5;
      sfx.play().catch(err => console.log('Interactive SFX playback failed:', err));
    }

    // Button redirect in live preview
    if (isPreviewMode && obj.type === 'button' && obj.properties.url) {
      window.open(obj.properties.url, '_blank', 'noopener,noreferrer');
    }

    // Run On Tap visual event rules
    if (isPreviewMode) {
      const behaviors = obj.properties.visualBehaviors || [];
      behaviors.forEach((b: any) => {
        if (b.trigger === 'onTap') {
          executeBehaviorAction(b);
        }
      });
    }

    // Run onTap script callbacks
    if (isPreviewMode && scriptCallbacksRef.current.onTap && (obj.properties.scriptEnabled ?? true)) {
      try {
        scriptCallbacksRef.current.onTap();
      } catch (err) {
        console.error("onTap script callback error:", err);
      }
    }
  };

  const renderGeometry = () => {
    switch (obj.type) {
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
      case 'cylinder':
        return (
          <mesh>
            <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
            <TexturedMaterial properties={obj.properties} defaultColor="#ffffff" />
          </mesh>
        );
      case 'cone':
        return (
          <mesh>
            <coneGeometry args={[0.5, 1, 32]} />
            <TexturedMaterial properties={obj.properties} defaultColor="#ffffff" />
          </mesh>
        );
      case 'torus':
        return (
          <mesh>
            <torusGeometry args={[0.4, 0.12, 16, 64]} />
            <TexturedMaterial properties={obj.properties} defaultColor="#ffffff" />
          </mesh>
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
      case 'button':
        return <Interactive3DButton obj={obj} isPreviewMode={isPreviewMode} onInteract={handleInteract} />;
      case 'youtube':
        return <InteractiveYoutubeScreen obj={obj} isPreviewMode={isPreviewMode} />;
      case 'imageTarget':
        return (
          <ErrorBoundary fallback={
            <mesh>
              <planeGeometry args={[(obj.properties.physicalWidth || 1) * 50, (obj.properties.physicalWidth || 1) * 50]} />
              <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
          }>
            <Suspense fallback={<ImageTargetLoadingFallback obj={obj} />}>
              <ImageTargetRenderer obj={obj} />
            </Suspense>
          </ErrorBoundary>
        );
      case 'model':
        return obj.properties.url ? (
          <ErrorBoundary fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#ef4444" wireframe />
            </mesh>
          }>
            <Suspense fallback={<ModelLoadingFallback />}>
              <GLTFModel url={obj.properties.url} properties={obj.properties} id={id} />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#888" wireframe />
          </mesh>
        );
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
      scale={obj.scale}
      onClick={handleInteract}
    >
      {renderGeometry()}
      {obj.children.map(childId => (
        <ObjectRenderer key={childId} id={childId} />
      ))}
    </group>
  );
}

function TransformController() {
  const { scene } = useThree();
  const selectedObjectId = useEditorStore(state => state.selectedObjectId);
  const target = selectedObjectId ? scene.getObjectByName(selectedObjectId) : null;
  const objects = useEditorStore(state => state.objects);
  const transformMode = useEditorStore(state => state.transformMode);
  const updateObject = useEditorStore(state => state.updateObject);
  const isPreviewMode = useEditorStore(state => state.isPreviewMode);
  const controlsRef = useRef<any>(null);

  const gridSnapEnabled = useEditorStore(state => state.gridSnapEnabled);
  const gridSnapIncrement = useEditorStore(state => state.gridSnapIncrement);
  const rotationSnapEnabled = useEditorStore(state => state.rotationSnapEnabled);
  const rotationSnapIncrement = useEditorStore(state => state.rotationSnapIncrement);

  const obj = selectedObjectId ? objects[selectedObjectId] : null;

  const handleTransform = () => {
    if (!target || !selectedObjectId) return;
    updateObject(selectedObjectId, {
      position: [target.position.x, target.position.y, target.position.z],
      rotation: [
        THREE.MathUtils.radToDeg(target.rotation.x),
        THREE.MathUtils.radToDeg(target.rotation.y),
        THREE.MathUtils.radToDeg(target.rotation.z),
      ],
      scale: [target.scale.x, target.scale.y, target.scale.z]
    });
  };

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const callback = (e: any) => {
      isTransformDragging = e.value;
    };

    controls.addEventListener('dragging-changed', callback);
    return () => {
      controls.removeEventListener('dragging-changed', callback);
      isTransformDragging = false;
    };
  }, [target]);

  if (!target || !target.parent || !selectedObjectId || isPreviewMode || !obj || !obj.visible) return null;

  // Hide gizmo if the selected object is locked
  const isLocked = obj.locked;
  if (isLocked) return null;

  return (
    <TransformControls
      ref={controlsRef}
      object={target}
      mode={transformMode}
      onMouseUp={handleTransform}
      translationSnap={gridSnapEnabled ? gridSnapIncrement : null}
      rotationSnap={rotationSnapEnabled ? (rotationSnapIncrement * Math.PI) / 180 : null}
    />
  );
}

const VIDEO_URLS = {
  office: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05c5c839d39e7fa17b4474775836a0c&profile_id=139&oauth2_token_id=57447761',
  livingroom: 'https://player.vimeo.com/external/435674703.sd.mp4?s=6f4188cbcd97ec1994e66699319e0094038a306f&profile_id=139&oauth2_token_id=57447761',
  techlab: 'https://player.vimeo.com/external/430810795.sd.mp4?s=d740c83a15af820c7cc61899532551e18cc8ef24&profile_id=139&oauth2_token_id=57447761'
};

export function Viewport() {
  const [debugLogs, setDebugLogs] = useState<{ id: number, message: string }[]>([]);
  
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
  const transformMode = useEditorStore(state => state.transformMode);
  const setTransformMode = useEditorStore(state => state.setTransformMode);
  const isPreviewMode = useEditorStore(state => state.isPreviewMode);
  const toasts = useEditorStore(state => state.toasts);
  const arVideoPlaying = useEditorStore(state => state.arVideoPlaying);
  const { 
    addObject, 
    objects, 
    settings,
    gridSnapEnabled, 
    gridSnapIncrement,
    setGridSnapEnabled,
    setGridSnapIncrement,
    rotationSnapEnabled,
    rotationSnapIncrement,
    setRotationSnapEnabled,
    setRotationSnapIncrement,
    cameraType,
    setCameraType,
    wireframeEnabled,
    setWireframeEnabled
  } = useEditorStore();

  const [showBezel, setShowBezel] = useState(true);
  const [bgType, setBgType] = useState<'office' | 'livingroom' | 'techlab' | 'webcam'>('office');
  const [trackingStable, setTrackingStable] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [snapshotFlash, setSnapshotFlash] = useState(false);
  const [currentTime, setCurrentTime] = useState('09:41 AM');

  const videoRef = useRef<HTMLVideoElement>(null);
  const webCamRef = useRef<HTMLVideoElement>(null);

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
      }

      // W or T: Set transform mode to Translate
      if (e.key.toLowerCase() === 'w' || e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTransformMode('translate');
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

      // Ctrl+D or Cmd+D or D: Duplicate selected object
      if (e.key.toLowerCase() === 'd') {
        if (selectedObjectId) {
          const selectedObj = useEditorStore.getState().objects[selectedObjectId];
          if (selectedObj && selectedObj.type !== 'imageTarget') {
            e.preventDefault();
            useEditorStore.getState().duplicateObject(selectedObjectId);
          }
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
  }, [selectObject, setTransformMode]);

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
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          visible: true,
          children: [],
          parentId: parentId,
          properties: {
            url: asset.url
          }
        };
        
        addObject(newObj, parentId || undefined);
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

  const triggerSnapshot = () => {
    setSnapshotFlash(true);
    // Play shutter sound via web audio API safely
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}

    setTimeout(() => {
      setSnapshotFlash(false);
    }, 450);
  };

  const resetTracking = () => {
    setTrackingStable(false);
    const timer = setTimeout(() => {
      setTrackingStable(true);
    }, 1800);
  };

  if (isPreviewMode) {
    return (
      <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center p-4 select-none relative overflow-hidden">
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
        <div className="absolute top-4 left-4 z-40 bg-black/60 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur text-xs flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="font-mono text-[#AAA]">WORKSPACE: SIMULATOR ACTIVE</span>
        </div>
        
        {/* Debug Log Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-40 pointer-events-none flex flex-col gap-1.5">
          {debugLogs.map(log => (
            <div key={log.id} className="bg-black/70 border border-[#333] px-3 py-2 rounded shadow text-[11px] font-mono text-yellow-400 animate-in fade-in slide-in-from-bottom-2 self-start backdrop-blur-sm">
              <span className="opacity-50 mr-2 text-white">🐞 TOUCH EVENT:</span> {log.message}
            </div>
          ))}
        </div>

        {/* Bezel Device wrapper vs Full Bleed wrapper */}
        <div className={showBezel 
          ? "relative w-[340px] h-[680px] md:w-[360px] md:h-[720px] bg-[#111] border-[10px] border-[#252525] rounded-[50px] shadow-2xl flex flex-col overflow-hidden border-t-[16px] border-b-[16px] ring-2 ring-white/5"
          : "relative w-full h-full bg-black overflow-hidden rounded-lg border border-[#222]"
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
            <div className="absolute inset-0 z-10">
              <Canvas 
                camera={{ position: [0, -4, 4], fov: 50, up: [0, 0, 1] }}
                onPointerMissed={() => { console.log('[Debug Log] Screen tapped (no object tapped)'); selectObject(null); }}
              >
                
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.2} />
                
                {rootObjects.map(id => (
                  <ObjectRenderer key={id} id={id} />
                ))}

                <OrbitControls makeDefault />
              </Canvas>
            </div>

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
                      <span>Searching Marker...</span>
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
                  ? "🎯 Point your screen at the physical image print target. Drag to rotate model, click to interact!"
                  : "🔍 Calibrating spatial environment sensors. Keep camera stable."
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
      </div>
    );
  }

  const ambientColor = settings.ambientColor || '#ffffff';
  const ambientIntensity = settings.ambientIntensity ?? 0.5;
  const directionalColor = settings.directionalColor || '#ffffff';
  const directionalIntensity = settings.directionalIntensity ?? 1.0;
  const directionalPosition = settings.directionalPosition || [10, 10, 5];
  const shadowsEnabled = settings.shadowsEnabled ?? true;

  return (
    <div 
      className="w-full h-full relative bg-[#222224]"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Canvas 
        key={cameraType}
        shadows={shadowsEnabled}
        orthographic={cameraType === 'orthographic'}
        camera={cameraType === 'orthographic' 
          ? { position: [0, -4, 4], zoom: 100, up: [0, 0, 1], near: -100, far: 1000 }
          : { position: [0, -4, 4], fov: 50, up: [0, 0, 1] }
        }
        onPointerMissed={() => { console.log('[Debug Log] Screen tapped (no object tapped)'); selectObject(null); }}
      >
        <color attach="background" args={['#222224']} />
        
        <ambientLight color={ambientColor} intensity={ambientIntensity} />
        <directionalLight 
          position={directionalPosition} 
          color={directionalColor} 
          intensity={directionalIntensity} 
          castShadow={shadowsEnabled}
          shadow-mapSize={[1024, 1024]}
        />
        
        <group rotation={[Math.PI / 2, 0, 0]}>
          <Grid 
            infiniteGrid 
            fadeDistance={20} 
            sectionColor="#6b7280" 
            cellColor="#4b5563"
            sectionThickness={1.5}
            cellThickness={1.0}
            cellSize={gridSnapEnabled ? gridSnapIncrement : 0.5}
            sectionSize={gridSnapEnabled ? gridSnapIncrement * 10 : 5}
          />
        </group>
        <axesHelper args={[5]} />
        
        {rootObjects.map(id => (
          <ObjectRenderer key={id} id={id} />
        ))}

        <TransformController />

        <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
          <GizmoViewport axisColors={['#ef4444', '#10b981', '#3b82f6']} labelColor="white" />
        </GizmoHelper>

        <OrbitControls makeDefault />
      </Canvas>

      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#141414]/90 p-1.5 rounded-lg border border-[#2A2A2A] shadow-2xl backdrop-blur-md">
        {/* Transform Mode Buttons Group */}
        <div className="flex gap-1 border-r border-[#2A2A2A] pr-2 mr-1">
          <button 
            onClick={() => setTransformMode('translate')}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${transformMode === 'translate' ? 'bg-blue-600 text-white font-semibold' : 'text-[#888] hover:text-white hover:bg-white/5'}`}
            title="Translate (Move) [W / T]"
          >
            <Move size={14} />
          </button>
          <button 
            onClick={() => setTransformMode('rotate')}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${transformMode === 'rotate' ? 'bg-blue-600 text-white font-semibold' : 'text-[#888] hover:text-white hover:bg-white/5'}`}
            title="Rotate [E]"
          >
            <RotateCw size={14} />
          </button>
          <button 
            onClick={() => setTransformMode('scale')}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${transformMode === 'scale' ? 'bg-blue-600 text-white font-semibold' : 'text-[#888] hover:text-white hover:bg-white/5'}`}
            title="Scale [R / S]"
          >
            <Maximize size={14} />
          </button>
        </div>

        {/* Grid Snapping Shortcuts */}
        <div className="flex items-center gap-1.5 text-[10px] font-sans">
          <button
            onClick={() => setGridSnapEnabled(!gridSnapEnabled)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${gridSnapEnabled ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-[#666] hover:text-[#999] bg-[#1C1C1C] border border-transparent'}`}
            title="Toggle Grid Snapping"
          >
            <Magnet size={14} />
          </button>
          {gridSnapEnabled && (
            <select
              value={gridSnapIncrement}
              onChange={(e) => setGridSnapIncrement(parseFloat(e.target.value))}
              className="bg-[#1C1C1C] border border-[#2A2A2A] rounded px-1 py-0.5 text-white font-mono text-[9px] outline-none cursor-pointer focus:border-blue-500"
              title="Grid Snapping Increment"
            >
              <option value="0.05">0.05m</option>
              <option value="0.1">0.1m</option>
              <option value="0.25">0.25m</option>
              <option value="0.5">0.5m</option>
              <option value="1">1.0m</option>
            </select>
          )}
        </div>

        {/* Rotation Snapping Shortcuts */}
        <div className="flex items-center gap-1.5 text-[10px] font-sans border-l border-[#2A2A2A] pl-2 ml-1">
          <button
            onClick={() => setRotationSnapEnabled(!rotationSnapEnabled)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${rotationSnapEnabled ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-[#666] hover:text-[#999] bg-[#1C1C1C] border border-transparent'}`}
            title="Toggle Rotation Snapping"
          >
            <RotateCw size={12} />
          </button>
          {rotationSnapEnabled && (
            <select
              value={rotationSnapIncrement}
              onChange={(e) => setRotationSnapIncrement(parseInt(e.target.value))}
              className="bg-[#1C1C1C] border border-[#2A2A2A] rounded px-1 py-0.5 text-white font-mono text-[9px] outline-none cursor-pointer focus:border-emerald-500"
              title="Rotation Snapping Angle"
            >
              <option value="5">5°</option>
              <option value="15">15°</option>
              <option value="30">30°</option>
              <option value="45">45°</option>
              <option value="90">90°</option>
            </select>
          )}
        </div>

        {/* Camera Projection & Wireframe Toggles */}
        <div className="flex items-center gap-1.5 text-[10px] font-sans border-l border-[#2A2A2A] pl-2 ml-1">
          {/* Camera projection toggle */}
          <button
            onClick={() => setCameraType(cameraType === 'perspective' ? 'orthographic' : 'perspective')}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${cameraType === 'orthographic' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-[#666] hover:text-[#999] bg-[#1C1C1C] border border-transparent'}`}
            title={`Switch to ${cameraType === 'perspective' ? 'Orthographic' : 'Perspective'} view`}
          >
            <Compass size={14} className={cameraType === 'orthographic' ? 'animate-spin' : ''} style={{ animationDuration: cameraType === 'orthographic' ? '12s' : '0s' }} />
          </button>

          {/* Wireframe toggle */}
          <button
            onClick={() => setWireframeEnabled(!wireframeEnabled)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${wireframeEnabled ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-[#666] hover:text-[#999] bg-[#1C1C1C] border border-transparent'}`}
            title={wireframeEnabled ? "Disable wireframe view" : "Enable wireframe view"}
          >
            <Layers size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
