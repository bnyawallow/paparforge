import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
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

  useEffect(() => {
    if (!orbitControlsRef.current) return;
    const target = orbitControlsRef.current.target || new THREE.Vector3(0, 0, 0);
    const dist = camera.position.distanceTo(target) || 5;

    if (activeAxisView === 'Z') {
      camera.position.set(target.x, target.y, target.z + dist);
      camera.up.set(0, 1, 0);
    } else if (activeAxisView === 'Y') {
      camera.position.set(target.x, target.y - dist, target.z);
      camera.up.set(0, 0, 1);
    } else if (activeAxisView === 'X') {
      camera.position.set(target.x + dist, target.y, target.z);
      camera.up.set(0, 0, 1);
    } else if (activeAxisView === '3D') {
      camera.position.set(target.x, target.y - 4, target.z + 4);
      camera.up.set(0, 0, 1);
    }
    
    orbitControlsRef.current.update();
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

        orbitControlsRef.current.target.copy(targetPos);
        camera.position.set(targetPos.x, targetPos.y - 3, targetPos.z + 3);
        camera.up.set(0, 0, 1);
        orbitControlsRef.current.update();
      }
    };

    const handleResetCamera = () => {
      if (!orbitControlsRef.current) return;
      orbitControlsRef.current.target.set(0, 0, 0);
      camera.position.set(0, -4, 4);
      camera.up.set(0, 0, 1);
      orbitControlsRef.current.update();
    };

    window.addEventListener('trigger-frame-selected', handleFrameSelected);
    window.addEventListener('trigger-reset-camera', handleResetCamera);

    return () => {
      window.removeEventListener('trigger-frame-selected', handleFrameSelected);
      window.removeEventListener('trigger-reset-camera', handleResetCamera);
    };
  }, [camera, scene, orbitControlsRef]);

  return null;
}

