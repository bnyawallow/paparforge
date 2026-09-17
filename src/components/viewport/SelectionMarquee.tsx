import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useEditorStore } from '../../store/useEditorStore';

export function SelectionMarquee({ orbitControlsRef }: { orbitControlsRef: React.RefObject<any> }) {
  const { camera, scene, gl } = useThree();
  const selectObjects = useEditorStore(state => state.selectObjects);
  const objects = useEditorStore(state => state.objects);
  const isMultiSelectMode = useEditorStore(state => state.isMultiSelectMode);
  const setMultiSelectMode = useEditorStore(state => state.setMultiSelectMode);
  
  const [box, setBox] = useState<{ startX: number, startY: number, endX: number, endY: number } | null>(null);
  
  const boxRef = useRef<{ startX: number, startY: number, endX: number, endY: number } | null>(null);
  
  // HTML overlay for the marquee
  const overlayRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    // Create an overlay div
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.border = '1px solid rgba(80, 150, 255, 0.8)';
    overlay.style.backgroundColor = 'rgba(80, 150, 255, 0.2)';
    overlay.style.pointerEvents = 'none';
    overlay.style.display = 'none';
    overlay.style.zIndex = '9999';
    gl.domElement.parentElement?.appendChild(overlay);
    overlayRef.current = overlay;
    
    return () => {
      if (overlay.parentElement) {
        overlay.parentElement.removeChild(overlay);
      }
    };
  }, [gl.domElement]);

  useEffect(() => {
    const canvas = gl.domElement;
    let isDragging = false;
    let hasStartedMarquee = false;

    const onPointerDown = (e: PointerEvent) => {
      // Only start marquee if Shift is held AND we click on empty space or we are forcing multi-select
      if (e.shiftKey) {
        isDragging = true;
        hasStartedMarquee = true;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        boxRef.current = { startX: x, startY: y, endX: x, endY: y };
        
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = false;
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging && hasStartedMarquee && boxRef.current) {
        const rect = canvas.getBoundingClientRect();
        boxRef.current.endX = e.clientX - rect.left;
        boxRef.current.endY = e.clientY - rect.top;
        
        if (overlayRef.current) {
          overlayRef.current.style.display = 'block';
          const left = Math.min(boxRef.current.startX, boxRef.current.endX);
          const top = Math.min(boxRef.current.startY, boxRef.current.endY);
          const width = Math.abs(boxRef.current.endX - boxRef.current.startX);
          const height = Math.abs(boxRef.current.endY - boxRef.current.startY);
          overlayRef.current.style.left = left + 'px';
          overlayRef.current.style.top = top + 'px';
          overlayRef.current.style.width = width + 'px';
          overlayRef.current.style.height = height + 'px';
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (hasStartedMarquee) {
        isDragging = false;
        hasStartedMarquee = false;
        if (overlayRef.current) {
          overlayRef.current.style.display = 'none';
        }
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true;
        }
        
        // compute selection
        if (boxRef.current) {
          const width = Math.abs(boxRef.current.endX - boxRef.current.startX);
          const height = Math.abs(boxRef.current.endY - boxRef.current.startY);
          
          if (width > 5 && height > 5) {
            performSelection(boxRef.current);
          }
          boxRef.current = null;
        }
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl, camera, scene, orbitControlsRef]);

  const performSelection = (box: {startX: number, startY: number, endX: number, endY: number}) => {
    const rect = gl.domElement.getBoundingClientRect();
    const minX = Math.min(box.startX, box.endX);
    const maxX = Math.max(box.startX, box.endX);
    const minY = Math.min(box.startY, box.endY);
    const maxY = Math.max(box.startY, box.endY);

    const selectedIds: string[] = [];
    const state = useEditorStore.getState();

    // To prevent checking thousands of internal meshes, we can iterate over the top-level objects in the store
    Object.values(state.objects).forEach(obj => {
      // Find the corresponding 3D object in the scene
      let sceneObj: THREE.Object3D | undefined;
      scene.traverse((child) => {
        if (child.userData?.id === obj.id) {
          sceneObj = child;
        }
      });

      if (sceneObj) {
        // Project object's bounding box center or vertices to screen
        const boundingBox = new THREE.Box3().setFromObject(sceneObj);
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        
        center.project(camera);
        
        // Convert to pixel coordinates
        const px = (center.x * 0.5 + 0.5) * rect.width;
        const py = (-(center.y * 0.5) + 0.5) * rect.height;

        if (px >= minX && px <= maxX && py >= minY && py <= maxY) {
          selectedIds.push(obj.id);
        }
      }
    });

    if (selectedIds.length > 0) {
      state.selectObjects([...new Set([...state.selectedObjectIds, ...selectedIds])]);
    }
  };

  return null;
}
