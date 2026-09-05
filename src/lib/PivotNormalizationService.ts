import * as THREE from 'three';

/**
 * Global Pivot Normalization Service
 * 
 * Forces 3D objects (such as newly instantiated primitives and imported FBX/GLTF models)
 * to set their local anchor/pivot point to their exact geometric center (0,0,0 relative to parent),
 * regardless of the original geometry offsets or imported coordinate systems.
 */
export class PivotNormalizationService {
  /**
   * Normalizes the pivot of any Three.js Object3D by calculating its bounding box
   * and translating its child components so that the collective geometric center
   * is positioned exactly at the local origin (0, 0, 0).
   */
  static normalizePivot(object: THREE.Object3D): void {
    if (!object) return;

    // 1. Force world matrix update so we get accurate bounding box calculations
    object.updateMatrixWorld(true);

    // 2. Compute the bounding box of the object hierarchy
    const bbox = new THREE.Box3().setFromObject(object);
    if (bbox.isEmpty()) {
      return;
    }

    // 3. Find the geometric center of the bounding box
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    // 4. Convert the center from world coordinates to the local coordinate system of the object itself
    object.worldToLocal(center);

    // If the center is already extremely close to (0,0,0), it's already normalized
    if (center.lengthSq() < 1e-8) {
      return;
    }

    // 5. Shift all direct children of the object in the opposite direction (-center)
    // This shifts the geometry visually so its bounding box center sits at (0, 0, 0)
    object.children.forEach((child) => {
      child.position.sub(center);
    });

    // 6. If the object itself is a Mesh with an active geometry, normalize its geometry too
    if ((object as THREE.Mesh).isMesh) {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.center();
      }
    }

    // 7. Force matrix and world matrix updates to apply translations cleanly
    object.updateMatrix();
    object.updateMatrixWorld(true);
  }
}
