import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useEditorStore } from '../../store/useEditorStore';

export function SelectionMarquee({ orbitControlsRef }: { orbitControlsRef: React.RefObject<any> }) {
  const { camera, scene, gl } = useThree();
  const selectObjects = useEditorStore(state => state.selectObjects);
  const objects = useEditorStore(state => state.objects);
  const isMultiSelectMode = useEditorStore(state => state.isMultiSelectMode);
  const isBoxSelectToolActive = useEditorStore(state => state.isBoxSelectToolActive);
  const selectedObjectIds = useEditorStore(state => state.selectedObjectIds);

  const [candidateIds, setCandidateIds] = useState<string[]>([]);
  const [isMarqueeActive, setIsMarqueeActive] = useState<boolean>(false);
  
  const boxRef = useRef<{ startX: number, startY: number, endX: number, endY: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);

  // Set up screen-space DOM overlay for the selection marquee
  useEffect(() => {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.border = '1.5px solid #00e5ff';
    overlay.style.backgroundColor = 'rgba(0, 229, 255, 0.12)';
    overlay.style.boxShadow = '0 0 16px rgba(0, 229, 255, 0.25), inset 0 0 12px rgba(0, 229, 255, 0.08)';
    overlay.style.pointerEvents = 'none';
    overlay.style.display = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.borderRadius = '4px';

    const badge = document.createElement('div');
    badge.style.position = 'absolute';
    badge.style.bottom = '-26px';
    badge.style.left = '50%';
    badge.style.transform = 'translateX(-50%)';
    badge.style.backgroundColor = '#09090b';
    badge.style.color = '#38bdf8';
    badge.style.border = '1px solid rgba(56, 189, 248, 0.4)';
    badge.style.borderRadius = '9999px';
    badge.style.padding = '2px 8px';
    badge.style.fontSize = '10px';
    badge.style.fontFamily = 'monospace';
    badge.style.fontWeight = 'bold';
    badge.style.whiteSpace = 'nowrap';
    badge.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.6)';
    badge.innerText = 'Selecting 0 objects';
    overlay.appendChild(badge);

    gl.domElement.parentElement?.appendChild(overlay);
    overlayRef.current = overlay;
    badgeRef.current = badge;

    return () => {
      if (overlay.parentElement) {
        overlay.parentElement.removeChild(overlay);
      }
    };
  }, [gl.domElement]);

  useEffect(() => {
    const canvas = gl.domElement;
    let isDragging = false;
    let hasStarted = false;

    const onPointerDown = (e: PointerEvent) => {
      // Activate on left click if box select tool is active OR Shift key is held
      if (e.button !== 0) return;
      const shouldTrigger = e.shiftKey || isBoxSelectToolActive || isMultiSelectMode;
      
      if (shouldTrigger) {
        isDragging = true;
        hasStarted = true;
        setIsMarqueeActive(true);
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
      if (isDragging && hasStarted && boxRef.current) {
        const rect = canvas.getBoundingClientRect();
        boxRef.current.endX = e.clientX - rect.left;
        boxRef.current.endY = e.clientY - rect.top;

        const minX = Math.min(boxRef.current.startX, boxRef.current.endX);
        const maxX = Math.max(boxRef.current.startX, boxRef.current.endX);
        const minY = Math.min(boxRef.current.startY, boxRef.current.endY);
        const maxY = Math.max(boxRef.current.startY, boxRef.current.endY);
        const width = maxX - minX;
        const height = maxY - minY;

        if (overlayRef.current) {
          overlayRef.current.style.display = 'block';
          overlayRef.current.style.left = minX + 'px';
          overlayRef.current.style.top = minY + 'px';
          overlayRef.current.style.width = width + 'px';
          overlayRef.current.style.height = height + 'px';
        }

        // Live 3D projection test to find candidate objects within bounding box
        if (width > 4 || height > 4) {
          const matchingIds = testSceneObjectsInBox(minX, maxX, minY, maxY, rect);
          setCandidateIds(matchingIds);
          if (badgeRef.current) {
            badgeRef.current.innerText = `${matchingIds.length} object${matchingIds.length === 1 ? '' : 's'} in box`;
          }
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (hasStarted) {
        isDragging = false;
        hasStarted = false;
        setIsMarqueeActive(false);

        if (overlayRef.current) {
          overlayRef.current.style.display = 'none';
        }
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true;
        }

        if (boxRef.current) {
          const width = Math.abs(boxRef.current.endX - boxRef.current.startX);
          const height = Math.abs(boxRef.current.endY - boxRef.current.startY);

          if (width > 6 && height > 6) {
            const rect = canvas.getBoundingClientRect();
            const minX = Math.min(boxRef.current.startX, boxRef.current.endX);
            const maxX = Math.max(boxRef.current.startX, boxRef.current.endX);
            const minY = Math.min(boxRef.current.startY, boxRef.current.endY);
            const maxY = Math.max(boxRef.current.startY, boxRef.current.endY);

            const finalIds = testSceneObjectsInBox(minX, maxX, minY, maxY, rect);
            if (finalIds.length > 0) {
              if (e.shiftKey) {
                // Additive toggle
                const combined = new Set([...useEditorStore.getState().selectedObjectIds, ...finalIds]);
                useEditorStore.getState().selectObjects(Array.from(combined));
              } else {
                useEditorStore.getState().selectObjects(finalIds);
              }
            }
          }
          boxRef.current = null;
          setCandidateIds([]);
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
  }, [gl, camera, scene, orbitControlsRef, isBoxSelectToolActive, isMultiSelectMode]);

  // Projects each 3D object's 8 corners & center into 2D screen coordinates
  const testSceneObjectsInBox = (
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    rect: DOMRect
  ): string[] => {
    const matches: string[] = [];
    const state = useEditorStore.getState();
    const objectList = Object.values(state.objects);

    for (const obj of objectList) {
      if (!obj.visible || obj.locked) continue;
      if (obj.type === 'hudCanvas' || ['hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(obj.type)) continue;

      let found3D: THREE.Object3D | null = null;
      scene.traverse((child) => {
        if (child.userData?.id === obj.id || child.name === obj.id) {
          found3D = child;
        }
      });

      if (!found3D) continue;

      const bbox = new THREE.Box3().setFromObject(found3D);
      if (bbox.isEmpty()) continue;

      // Check center
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      const projCenter = center.clone().project(camera);
      const cx = (projCenter.x * 0.5 + 0.5) * rect.width;
      const cy = (-(projCenter.y * 0.5) + 0.5) * rect.height;

      // Check if center or any of the 8 bounding box corners falls within the selection box
      let isInside = (cx >= minX && cx <= maxX && cy >= minY && cy <= maxY && projCenter.z <= 1);

      if (!isInside) {
        const corners = [
          new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z),
          new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z),
          new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z),
          new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.min.z),
          new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.max.z),
          new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.max.z),
          new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.max.z),
          new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z),
        ];

        for (const pt of corners) {
          pt.project(camera);
          const px = (pt.x * 0.5 + 0.5) * rect.width;
          const py = (-(pt.y * 0.5) + 0.5) * rect.height;
          if (px >= minX && px <= maxX && py >= minY && py <= maxY && pt.z <= 1) {
            isInside = true;
            break;
          }
        }
      }

      if (isInside) {
        matches.push(obj.id);
      }
    }

    return matches;
  };

  // Render 3D live bounding box highlights for candidate objects in the scene
  return (
    <group name="marquee-preview-group">
      {isMarqueeActive && candidateIds.map(id => {
        const obj = objects[id];
        if (!obj) return null;

        return (
          <CandidateBoundingPreview key={`cand-${id}`} objectId={id} />
        );
      })}
    </group>
  );
}

function CandidateBoundingPreview({ objectId }: { objectId: string }) {
  const { scene } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const wireMeshRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const tempBox = useMemo(() => new THREE.Box3(), []);
  const tempSize = useMemo(() => new THREE.Vector3(), []);
  const tempCenter = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!groupRef.current) return;
    let target: THREE.Object3D | null = null;
    scene.traverse((child) => {
      if (child.userData?.id === objectId || child.name === objectId) {
        target = child;
      }
    });

    if (target) {
      tempBox.setFromObject(target);
      if (!tempBox.isEmpty()) {
        tempBox.getSize(tempSize);
        tempBox.getCenter(tempCenter);

        groupRef.current.position.copy(tempCenter);
        if (wireMeshRef.current) {
          wireMeshRef.current.scale.set(
            Math.max(0.01, tempSize.x * 1.05),
            Math.max(0.01, tempSize.y * 1.05),
            Math.max(0.01, tempSize.z * 1.05)
          );
        }
        if (glowMeshRef.current) {
          glowMeshRef.current.scale.set(
            Math.max(0.01, tempSize.x * 1.03),
            Math.max(0.01, tempSize.y * 1.03),
            Math.max(0.01, tempSize.z * 1.03)
          );
        }
        groupRef.current.visible = true;
        return;
      }
    }
    groupRef.current.visible = false;
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* 3D Cyan Glowing Bounding Box Wireframe Preview */}
      <mesh ref={wireMeshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial 
          color="#00e5ff" 
          wireframe 
          transparent 
          opacity={0.85} 
          depthTest={false}
        />
      </mesh>
      {/* Subtle Volumetric Glow Fill */}
      <mesh ref={glowMeshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial 
          color="#00e5ff" 
          transparent 
          opacity={0.12} 
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
