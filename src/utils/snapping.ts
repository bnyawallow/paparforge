import * as THREE from 'three';
import { SceneObject } from '../types';

export interface BoundingBoxInfo {
  min: THREE.Vector3;
  max: THREE.Vector3;
  size: THREE.Vector3;
  center: THREE.Vector3;
}

export interface SnapResult {
  position: THREE.Vector3;
  isSnapped: boolean;
  snapLabel?: string;
  snappedX: boolean;
  snappedY: boolean;
  snappedZ: boolean;
  snapType?: 'surface' | 'object' | 'grid';
}

/**
 * Computes the precise 3D Axis-Aligned Bounding Box (AABB) of any SceneObject,
 * factoring in its geometry type, properties, scale, and pivot offset.
 */
export function getObjectBoundingBox(
  targetObj: SceneObject,
  posOverride?: [number, number, number]
): BoundingBoxInfo {
  const pos = posOverride || targetObj.position || [0, 0, 0];
  const scale = targetObj.scale || [1, 1, 1];
  const props = targetObj.properties || {};

  let sizeX = Math.abs(scale[0]);
  let sizeY = Math.abs(scale[1]);
  let sizeZ = Math.abs(scale[2]);

  switch (targetObj.type) {
    case 'box':
      sizeX *= Number(props.width ?? 1);
      sizeY *= Number(props.height ?? 1);
      sizeZ *= Number(props.depth ?? 1);
      break;
    case 'sphere': {
      const radius = Number(props.radius ?? 0.5);
      sizeX *= radius * 2;
      sizeY *= radius * 2;
      sizeZ *= radius * 2;
      break;
    }
    case 'cylinder': {
      const radius = Number(props.radius ?? 0.5);
      const height = Number(props.height ?? 1);
      sizeX *= radius * 2;
      sizeY *= radius * 2;
      sizeZ *= height;
      break;
    }
    case 'cone': {
      const radius = Number(props.radius ?? 0.5);
      const height = Number(props.height ?? 1);
      sizeX *= radius * 2;
      sizeY *= radius * 2;
      sizeZ *= height;
      break;
    }
    case 'plane':
    case 'imageTarget':
      sizeX *= Number(props.width ?? 1);
      sizeY *= Number(props.height ?? 1);
      sizeZ = Math.max(0.02, sizeZ * 0.02);
      break;
    case 'circle': {
      const radius = Number(props.radius ?? 0.5);
      sizeX *= radius * 2;
      sizeY *= radius * 2;
      sizeZ = Math.max(0.02, sizeZ * 0.02);
      break;
    }
    case 'text': {
      const fontSize = Number(props.fontSize ?? 0.5);
      const textLen = (props.text || 'Text').length;
      sizeX *= Math.max(0.4, textLen * fontSize * 0.4);
      sizeY *= Math.max(0.3, fontSize * 0.8);
      sizeZ *= 0.1;
      break;
    }
    case 'model':
      if (props.boundingBox?.size) {
        sizeX *= props.boundingBox.size[0] || 1;
        sizeY *= props.boundingBox.size[1] || 1;
        sizeZ *= props.boundingBox.size[2] || 1;
      } else {
        sizeX *= Number(props.sizeX ?? 1);
        sizeY *= Number(props.sizeY ?? 1);
        sizeZ *= Number(props.sizeZ ?? 1);
      }
      break;
    default:
      sizeX = Math.max(0.1, sizeX);
      sizeY = Math.max(0.1, sizeY);
      sizeZ = Math.max(0.1, sizeZ);
      break;
  }

  const pivot = targetObj.pivot || [0, 0, 0];
  const halfX = sizeX * 0.5;
  const halfY = sizeY * 0.5;
  const halfZ = sizeZ * 0.5;

  const min = new THREE.Vector3(
    pos[0] - halfX - pivot[0],
    pos[1] - halfY - pivot[1],
    pos[2] - halfZ - pivot[2]
  );

  const max = new THREE.Vector3(
    pos[0] + halfX - pivot[0],
    pos[1] + halfY - pivot[1],
    pos[2] + halfZ - pivot[2]
  );

  const center = new THREE.Vector3(
    (min.x + max.x) * 0.5,
    (min.y + max.y) * 0.5,
    (min.z + max.z) * 0.5
  );

  return {
    min,
    max,
    size: new THREE.Vector3(sizeX, sizeY, sizeZ),
    center
  };
}

/**
 * Snaps candidate position to ground/target surface (Z=0), other scene objects' bounding boxes,
 * and complementary grid increments.
 * Used for BOTH direct object dragging AND active Transform Gizmo translation.
 */
export function computeComprehensiveSnapPosition(
  candidatePos: THREE.Vector3,
  objectId: string,
  objects: Record<string, SceneObject>,
  gridSnapIncrement: number = 0.1,
  options?: {
    isShiftHeld?: boolean;
    dragStartPos?: THREE.Vector3;
    snapThreshold?: number;
  }
): SnapResult {
  const result = candidatePos.clone();
  const currentObj = objects[objectId];
  if (!currentObj) {
    return {
      position: result,
      isSnapped: false,
      snappedX: false,
      snappedY: false,
      snappedZ: false
    };
  }

  // 1. Constrain to dominant displacement axis if Shift key is held
  if (options?.isShiftHeld && options.dragStartPos) {
    const start = options.dragStartPos;
    const deltaX = Math.abs(result.x - start.x);
    const deltaY = Math.abs(result.y - start.y);
    const deltaZ = Math.abs(result.z - start.z);
    if (deltaX >= deltaY && deltaX >= deltaZ) {
      result.y = start.y;
      result.z = start.z;
    } else if (deltaY >= deltaX && deltaY >= deltaZ) {
      result.x = start.x;
      result.z = start.z;
    } else {
      result.x = start.x;
      result.y = start.y;
    }
  }

  // Dynamic snapping proximity threshold
  const SNAP_THRESHOLD = options?.snapThreshold ?? Math.max(0.32, gridSnapIncrement * 2.0);

  // Candidate moving bounding box at current test position
  const myBox = getObjectBoundingBox(currentObj, [result.x, result.y, result.z]);

  let bestDeltaX: number | null = null;
  let minAbsDeltaX = SNAP_THRESHOLD;
  let labelX = '';

  let bestDeltaY: number | null = null;
  let minAbsDeltaY = SNAP_THRESHOLD;
  let labelY = '';

  let bestDeltaZ: number | null = null;
  let minAbsDeltaZ = SNAP_THRESHOLD;
  let labelZ = '';

  let snapType: 'surface' | 'object' | 'grid' | undefined;

  // A. SURFACE SNAPPING: Target Surface / Ground Plane (Z = 0)
  // 1. Bottom face resting flush on surface (min.z = 0)
  const surfaceRestDeltaZ = 0 - myBox.min.z;
  if (Math.abs(surfaceRestDeltaZ) < minAbsDeltaZ) {
    minAbsDeltaZ = Math.abs(surfaceRestDeltaZ);
    bestDeltaZ = surfaceRestDeltaZ;
    labelZ = 'Flush Surface (Z=0)';
    snapType = 'surface';
  }

  // 2. Center aligned with surface (center.z = 0)
  const surfaceCenterDeltaZ = 0 - myBox.center.z;
  if (Math.abs(surfaceCenterDeltaZ) < minAbsDeltaZ) {
    minAbsDeltaZ = Math.abs(surfaceCenterDeltaZ);
    bestDeltaZ = surfaceCenterDeltaZ;
    labelZ = 'Center on Surface';
    snapType = 'surface';
  }

  // 3. Underside surface snap (max.z = 0)
  const surfaceUndersideDeltaZ = 0 - myBox.max.z;
  if (Math.abs(surfaceUndersideDeltaZ) < minAbsDeltaZ) {
    minAbsDeltaZ = Math.abs(surfaceUndersideDeltaZ);
    bestDeltaZ = surfaceUndersideDeltaZ;
    labelZ = 'Underside Surface';
    snapType = 'surface';
  }

  // B. OBJECT-TO-OBJECT BOUNDING BOX SNAPPING
  for (const otherId in objects) {
    if (otherId === objectId) continue;
    const other = objects[otherId];
    if (!other || !other.visible || other.type === 'hudCanvas' || ['hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(other.type)) continue;
    if (other.parentId === objectId) continue;
    if (other.parentId !== currentObj.parentId) continue;

    const otherBox = getObjectBoundingBox(other);

    // Bounding proximity check to avoid expensive checks on faraway objects
    const centerDistSq = myBox.center.distanceToSquared(otherBox.center);
    const maxCombinedExtent = myBox.size.length() + otherBox.size.length() + 3.5;
    if (centerDistSq > maxCombinedExtent * maxCombinedExtent) continue;

    const otherName = other.name || 'Object';

    // 1. Z-Axis Snapping (Stacking on top, underneath, or flush edge alignment)
    const zCandidates: Array<{ delta: number; label: string }> = [
      { delta: otherBox.max.z - myBox.min.z, label: `Stack on ${otherName}` },
      { delta: otherBox.min.z - myBox.max.z, label: `Under ${otherName}` },
      { delta: otherBox.min.z - myBox.min.z, label: `Flush Base with ${otherName}` },
      { delta: otherBox.max.z - myBox.max.z, label: `Flush Top with ${otherName}` },
      { delta: otherBox.center.z - myBox.center.z, label: `Center Z with ${otherName}` }
    ];

    for (const cand of zCandidates) {
      if (Math.abs(cand.delta) < minAbsDeltaZ) {
        minAbsDeltaZ = Math.abs(cand.delta);
        bestDeltaZ = cand.delta;
        labelZ = cand.label;
        snapType = 'object';
      }
    }

    // 2. X-Axis Snapping (Side-by-side touching faces & flush edge alignment)
    const xCandidates: Array<{ delta: number; label: string }> = [
      { delta: otherBox.max.x - myBox.min.x, label: `Snap Right of ${otherName}` },
      { delta: otherBox.min.x - myBox.max.x, label: `Snap Left of ${otherName}` },
      { delta: otherBox.min.x - myBox.min.x, label: `Flush Left with ${otherName}` },
      { delta: otherBox.max.x - myBox.max.x, label: `Flush Right with ${otherName}` },
      { delta: otherBox.center.x - myBox.center.x, label: `Center X with ${otherName}` }
    ];

    for (const cand of xCandidates) {
      if (Math.abs(cand.delta) < minAbsDeltaX) {
        minAbsDeltaX = Math.abs(cand.delta);
        bestDeltaX = cand.delta;
        labelX = cand.label;
        snapType = 'object';
      }
    }

    // 3. Y-Axis Snapping (Front/Back touching faces & flush edge alignment)
    const yCandidates: Array<{ delta: number; label: string }> = [
      { delta: otherBox.max.y - myBox.min.y, label: `Snap Front of ${otherName}` },
      { delta: otherBox.min.y - myBox.max.y, label: `Snap Back of ${otherName}` },
      { delta: otherBox.min.y - myBox.min.y, label: `Flush Front with ${otherName}` },
      { delta: otherBox.max.y - myBox.max.y, label: `Flush Back with ${otherName}` },
      { delta: otherBox.center.y - myBox.center.y, label: `Center Y with ${otherName}` }
    ];

    for (const cand of yCandidates) {
      if (Math.abs(cand.delta) < minAbsDeltaY) {
        minAbsDeltaY = Math.abs(cand.delta);
        bestDeltaY = cand.delta;
        labelY = cand.label;
        snapType = 'object';
      }
    }
  }

  const snappedX = bestDeltaX !== null;
  const snappedY = bestDeltaY !== null;
  const snappedZ = bestDeltaZ !== null;

  // Apply nearest bounding box snap offsets
  if (snappedX) result.x += bestDeltaX!;
  if (snappedY) result.y += bestDeltaY!;
  if (snappedZ) result.z += bestDeltaZ!;

  // C. Fallback Grid Increments for any axis that didn't snap to an object or surface
  if (gridSnapIncrement > 0) {
    if (!snappedX) {
      result.x = Math.round(result.x / gridSnapIncrement) * gridSnapIncrement;
    }
    if (!snappedY) {
      result.y = Math.round(result.y / gridSnapIncrement) * gridSnapIncrement;
    }
    if (!snappedZ) {
      result.z = Math.round(result.z / gridSnapIncrement) * gridSnapIncrement;
    }
  }

  const isSnapped = snappedX || snappedY || snappedZ || gridSnapIncrement > 0;
  let snapLabel: string | undefined;

  if (labelZ) {
    snapLabel = labelZ;
  } else if (labelX) {
    snapLabel = labelX;
  } else if (labelY) {
    snapLabel = labelY;
  } else if (gridSnapIncrement > 0) {
    snapLabel = `Grid ${gridSnapIncrement}m`;
    if (!snapType) snapType = 'grid';
  }

  return {
    position: result,
    isSnapped,
    snapLabel,
    snappedX,
    snappedY,
    snappedZ,
    snapType
  };
}

export interface ScaleSnapResult {
  scale: THREE.Vector3;
  isSnapped: boolean;
  snapLabel?: string;
  snappedX: boolean;
  snappedY: boolean;
  snappedZ: boolean;
  aspectRatioLabel?: string;
  worldDimensions?: { width: number; height: number; depth: number };
}

/**
 * Common print advertising aspect ratios (width / height)
 */
export const PRINT_ASPECT_RATIOS = [
  { name: '1:1 Square Ad', ratio: 1.0 },
  { name: '4:3 Poster', ratio: 4 / 3 },
  { name: '3:4 Portrait Poster', ratio: 3 / 4 },
  { name: '16:9 Landscape Banner', ratio: 16 / 9 },
  { name: '9:16 Story / Billboard', ratio: 9 / 16 },
  { name: 'A4 Standard (1:1.414)', ratio: 1 / Math.SQRT2 },
  { name: 'A4 Portrait (1.414:1)', ratio: Math.SQRT2 },
  { name: '2:1 Leaderboard', ratio: 2.0 },
];

/**
 * Computes scale snap increments, grid steps, and print advertising aspect ratio alignment.
 */
export function computeGizmoScaleSnap(
  candidateScale: THREE.Vector3,
  objectId: string,
  objects: Record<string, SceneObject>,
  scaleSnapIncrement: number = 0.1,
  options?: {
    snapToPrintRatios?: boolean;
    snapThreshold?: number;
  }
): ScaleSnapResult {
  const result = candidateScale.clone();
  let isSnapped = false;
  let snappedX = false;
  let snappedY = false;
  let snappedZ = false;
  let snapLabel: string | undefined;
  let aspectRatioLabel: string | undefined;

  const threshold = options?.snapThreshold ?? 0.05;

  // 1. Grid Scale Increments (e.g., 0.05x, 0.1x, 0.25x)
  if (scaleSnapIncrement > 0) {
    const snapVal = (v: number) => {
      const clamped = Math.max(0.01, v);
      return Math.round(clamped / scaleSnapIncrement) * scaleSnapIncrement;
    };

    const targetX = snapVal(result.x);
    const targetY = snapVal(result.y);
    const targetZ = snapVal(result.z);

    if (Math.abs(result.x - targetX) < threshold) {
      result.x = parseFloat(targetX.toFixed(3));
      snappedX = true;
    }
    if (Math.abs(result.y - targetY) < threshold) {
      result.y = parseFloat(targetY.toFixed(3));
      snappedY = true;
    }
    if (Math.abs(result.z - targetZ) < threshold) {
      result.z = parseFloat(targetZ.toFixed(3));
      snappedZ = true;
    }
  }

  // 2. Compute object world size & check print ratio alignment
  const targetObj = objects[objectId];
  let worldWidth = result.x;
  let worldHeight = result.y;
  let worldDepth = result.z;

  if (targetObj) {
    const baseBox = getObjectBoundingBox(targetObj, [0, 0, 0]);
    const baseW = (baseBox.size.x / Math.max(0.001, targetObj.scale[0] || 1));
    const baseH = (baseBox.size.y / Math.max(0.001, targetObj.scale[1] || 1));
    const baseD = (baseBox.size.z / Math.max(0.001, targetObj.scale[2] || 1));

    worldWidth = baseW * result.x;
    worldHeight = baseH * result.y;
    worldDepth = baseD * result.z;

    if (options?.snapToPrintRatios !== false && worldHeight > 0) {
      const currentRatio = worldWidth / worldHeight;
      for (const preset of PRINT_ASPECT_RATIOS) {
        if (Math.abs(currentRatio - preset.ratio) < 0.04) {
          aspectRatioLabel = preset.name;
          break;
        }
      }
    }
  }

  isSnapped = snappedX || snappedY || snappedZ || !!aspectRatioLabel;

  if (isSnapped) {
    if (aspectRatioLabel) {
      snapLabel = `Print Aspect: ${aspectRatioLabel}`;
    } else {
      snapLabel = `Scale Grid ${scaleSnapIncrement}x (${worldWidth.toFixed(2)}m × ${worldHeight.toFixed(2)}m)`;
    }
  }

  return {
    scale: result,
    isSnapped,
    snapLabel,
    snappedX,
    snappedY,
    snappedZ,
    aspectRatioLabel,
    worldDimensions: {
      width: worldWidth,
      height: worldHeight,
      depth: worldDepth,
    }
  };
}

