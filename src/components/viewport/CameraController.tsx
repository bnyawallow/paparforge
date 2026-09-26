import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useEditorStore } from '../../store/useEditorStore';
import * as THREE from 'three';

export function CameraController({ 
  activeAxisView, 
  axisUpdateId, 
  orbitControlsRef, 
  onResetTo3D 
}: { 
  activeAxisView: string; 
  axisUpdateId: number; 
  orbitControlsRef: React.RefObject<any>; 
  onResetTo3D?: () => void; 
}) {
  const { camera, scene } = useThree();

  const isAnimatingRef = useRef(false);
  const animStartTimeRef = useRef(0);
  const animDuration = 0.35; // 350ms smooth transition
  const startPosRef = useRef(new THREE.Vector3());
  const targetPosRef = useRef(new THREE.Vector3());
  const startTargetRef = useRef(new THREE.Vector3());
  const targetLookRef = useRef(new THREE.Vector3());
  const startUpRef = useRef(new THREE.Vector3(0, 0, 1));
  const targetUpRef = useRef(new THREE.Vector3(0, 0, 1));

  // Function to initiate smooth camera transition
  const transitionTo = (
    destPos: THREE.Vector3, 
    destTarget: THREE.Vector3,
    destUp: THREE.Vector3 = new THREE.Vector3(0, 0, 1)
  ) => {
    startPosRef.current.copy(camera.position);
    targetPosRef.current.copy(destPos);
    startUpRef.current.copy(camera.up);
    targetUpRef.current.copy(destUp);
    
    if (orbitControlsRef.current?.target) {
      startTargetRef.current.copy(orbitControlsRef.current.target);
    } else {
      startTargetRef.current.set(0, 0, 0);
    }
    targetLookRef.current.copy(destTarget);

    animStartTimeRef.current = performance.now();
    isAnimatingRef.current = true;
  };

  const activeSceneId = useEditorStore((state) => state.activeSceneId);
  const currentScene = useEditorStore((state) => state.scenes[activeSceneId]);
  const lastActiveSceneIdRef = useRef<string | null>(null);

  // Restore camera position when scene is opened, closed & re-opened, or switched
  useEffect(() => {
    if (!orbitControlsRef.current) return;
    if (lastActiveSceneIdRef.current !== activeSceneId) {
      lastActiveSceneIdRef.current = activeSceneId;

      if (currentScene?.cameraPosition && currentScene?.cameraTarget) {
        const [px, py, pz] = currentScene.cameraPosition;
        const [tx, ty, tz] = currentScene.cameraTarget;
        if (
          Number.isFinite(px) && Number.isFinite(py) && Number.isFinite(pz) &&
          Number.isFinite(tx) && Number.isFinite(ty) && Number.isFinite(tz)
        ) {
          const destPos = new THREE.Vector3(px, py, pz);
          const destTarget = new THREE.Vector3(tx, ty, tz);
          onResetTo3D?.();
          transitionTo(destPos, destTarget, new THREE.Vector3(0, 0, 1));
        }
      }
    }
  }, [activeSceneId, currentScene?.cameraPosition, currentScene?.cameraTarget, orbitControlsRef, onResetTo3D]);

  // Persist camera position & target whenever user finishes moving, orbiting, panning, or zooming
  useEffect(() => {
    const controls = orbitControlsRef.current;
    if (!controls) return;

    let timeoutId: any = null;

    const saveCameraState = () => {
      if (isAnimatingRef.current) return;
      const pos = camera.position;
      const target = controls.target || new THREE.Vector3(0, 0, 0);
      const sceneId = useEditorStore.getState().activeSceneId;
      if (sceneId && Number.isFinite(pos.x) && Number.isFinite(pos.y) && Number.isFinite(pos.z)) {
        useEditorStore.getState().updateSceneCamera(
          sceneId,
          [Number(pos.x.toFixed(3)), Number(pos.y.toFixed(3)), Number(pos.z.toFixed(3))],
          [Number(target.x.toFixed(3)), Number(target.y.toFixed(3)), Number(target.z.toFixed(3))]
        );
      }
    };

    const onControlsChange = () => {
      if (isAnimatingRef.current) return;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(saveCameraState, 250);
    };

    controls.addEventListener('end', saveCameraState);
    controls.addEventListener('change', onControlsChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      saveCameraState();
      controls.removeEventListener('end', saveCameraState);
      controls.removeEventListener('change', onControlsChange);
    };
  }, [orbitControlsRef, camera]);

  // Listen to activeAxisView and axisUpdateId changes
  useEffect(() => {
    if (!orbitControlsRef.current) return;
    const currentTarget = orbitControlsRef.current.target 
      ? orbitControlsRef.current.target.clone() 
      : new THREE.Vector3(0, 0, 0);
    const dist = Math.max(2, Math.min(25, camera.position.distanceTo(currentTarget) || 5));

    const destPos = new THREE.Vector3();
    const destTarget = currentTarget.clone();
    const destUp = new THREE.Vector3(0, 0, 1);

    switch (activeAxisView) {
      case 'Z':
      case 'Top':
        // Top view looking straight down +Z. Camera up points along +Y
        destPos.set(currentTarget.x, currentTarget.y, currentTarget.z + dist);
        destUp.set(0, 1, 0);
        break;
      case '-Z':
      case 'Bottom':
        // Bottom view looking straight up -Z. Camera up points along -Y
        destPos.set(currentTarget.x, currentTarget.y, currentTarget.z - dist);
        destUp.set(0, -1, 0);
        break;
      case 'Y':
      case 'Front':
        // Front view looking along +Y in Z-up system
        destPos.set(currentTarget.x, currentTarget.y - dist, currentTarget.z);
        destUp.set(0, 0, 1);
        break;
      case '-Y':
      case 'Back':
        // Back view looking along -Y
        destPos.set(currentTarget.x, currentTarget.y + dist, currentTarget.z);
        destUp.set(0, 0, 1);
        break;
      case 'X':
      case 'Right':
      case 'Side':
        // Right / Side view looking along +X
        destPos.set(currentTarget.x + dist, currentTarget.y, currentTarget.z);
        destUp.set(0, 0, 1);
        break;
      case '-X':
      case 'Left':
        // Left view looking along -X
        destPos.set(currentTarget.x - dist, currentTarget.y, currentTarget.z);
        destUp.set(0, 0, 1);
        break;
      case 'Isometric':
      case 'ISO':
      case '3D':
      default:
        // 3D Perspective Isometric view
        const d = dist * 0.577;
        destPos.set(currentTarget.x + d, currentTarget.y - d, currentTarget.z + d);
        destUp.set(0, 0, 1);
        break;
    }

    transitionTo(destPos, destTarget, destUp);
  }, [activeAxisView, axisUpdateId, camera, orbitControlsRef]);

  // Frame selected object or reset camera handlers
  useEffect(() => {
    const handleFrameSelected = () => {
      if (!orbitControlsRef.current) return;
      const selectedObjectId = useEditorStore.getState().selectedObjectId;
      if (selectedObjectId) {
        const obj3d = scene.getObjectByName(selectedObjectId);
        const objStore = useEditorStore.getState().objects[selectedObjectId];
        const targetPos = new THREE.Vector3();

        if (obj3d) {
          obj3d.getWorldPosition(targetPos);
        } else if (objStore) {
          targetPos.set(objStore.position[0], objStore.position[1], objStore.position[2]);
        }

        let fitDist = 3.5;
        if (obj3d) {
          const box = new THREE.Box3().setFromObject(obj3d);
          const size = box.getSize(new THREE.Vector3()).length();
          if (size > 0.1 && size < 50) {
            fitDist = Math.max(1.5, size * 1.8);
          }
        }

        const d = fitDist * 0.707;
        const destPos = new THREE.Vector3(targetPos.x, targetPos.y - d, targetPos.z + d);
        onResetTo3D?.();
        transitionTo(destPos, targetPos, new THREE.Vector3(0, 0, 1));
      } else {
        // When no object is selected, recenter the scene
        const objects = useEditorStore.getState().objects;
        const box = new THREE.Box3();
        let validCount = 0;

        Object.values(objects).forEach((obj) => {
          if (!obj.visible) return;
          if (obj.type.startsWith('hud') || obj.type === 'icon2d') return;
          const obj3d = scene.getObjectByName(obj.id);
          if (obj3d) {
            box.expandByObject(obj3d);
            validCount++;
          }
        });

        const targetPos = new THREE.Vector3(0, 0, 0);
        let fitDist = 4.0;

        if (validCount > 0 && !box.isEmpty()) {
          box.getCenter(targetPos);
          const size = box.getSize(new THREE.Vector3()).length();
          if (size > 0.1 && size < 100) {
            fitDist = Math.max(2.5, size * 1.6);
          }
        }

        const d = fitDist * 0.707;
        const destPos = new THREE.Vector3(targetPos.x, targetPos.y - d, targetPos.z + d);
        onResetTo3D?.();
        transitionTo(destPos, targetPos, new THREE.Vector3(0, 0, 1));
      }
    };

    const handleResetCamera = () => {
      if (!orbitControlsRef.current) return;
      const targetPos = new THREE.Vector3(0, 0, 0);
      const destPos = new THREE.Vector3(0, -4, 4);
      onResetTo3D?.();
      transitionTo(destPos, targetPos, new THREE.Vector3(0, 0, 1));
    };

    window.addEventListener('trigger-frame-selected', handleFrameSelected);
    window.addEventListener('trigger-reset-camera', handleResetCamera);

    return () => {
      window.removeEventListener('trigger-frame-selected', handleFrameSelected);
      window.removeEventListener('trigger-reset-camera', handleResetCamera);
    };
  }, [camera, scene, orbitControlsRef, onResetTo3D]);

  // Interrupt animation when user begins manually interacting with OrbitControls
  useEffect(() => {
    const controls = orbitControlsRef.current;
    if (!controls) return;

    const onStart = () => {
      isAnimatingRef.current = false;
      // Note: Do NOT call onResetTo3D() here. In Top, Front, Side, and other planar views,
      // the camera is configured for 2D panning and zooming only (orbit rotation disabled).
      // Panning or zooming within Top/Front/Side must maintain the planar orientation.
      // Switching back to 3D Orbit is done deliberately via Isometric / 3D Orbit controls.
    };

    controls.addEventListener('start', onStart);
    return () => {
      controls.removeEventListener('start', onStart);
    };
  }, [orbitControlsRef]);

  // Per-frame smooth interpolation loop
  useFrame(() => {
    if (!isAnimatingRef.current || !orbitControlsRef.current) return;

    const elapsed = (performance.now() - animStartTimeRef.current) / (animDuration * 1000);
    if (elapsed >= 1) {
      camera.position.copy(targetPosRef.current);
      if (orbitControlsRef.current?.target) {
        orbitControlsRef.current.target.copy(targetLookRef.current);
      }
      camera.up.copy(targetUpRef.current);
      if (orbitControlsRef.current?.object) {
        orbitControlsRef.current.object.up.copy(targetUpRef.current);
      }
      camera.lookAt(targetLookRef.current);
      orbitControlsRef.current.update();
      isAnimatingRef.current = false;
      return;
    }

    // Cubic ease-out
    const t = elapsed;
    const progress = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(startPosRef.current, targetPosRef.current, progress);
    if (orbitControlsRef.current?.target) {
      orbitControlsRef.current.target.lerpVectors(startTargetRef.current, targetLookRef.current, progress);
    }
    camera.up.lerpVectors(startUpRef.current, targetUpRef.current, progress).normalize();
    if (orbitControlsRef.current?.object) {
      orbitControlsRef.current.object.up.copy(camera.up);
    }
    camera.lookAt(orbitControlsRef.current.target || targetLookRef.current);
    orbitControlsRef.current.update();
  });

  return null;
}

