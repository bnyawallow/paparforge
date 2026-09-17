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
  static computeBoxWithoutSceneObjects(object: THREE.Object3D, box: THREE.Box3): void {
    if (object.userData?.isSceneObject) return;

    if ((object as THREE.Mesh).isMesh) {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) {
        if (!mesh.geometry.boundingBox) {
          mesh.geometry.computeBoundingBox();
        }
        const localBox = mesh.geometry.boundingBox.clone();
        localBox.applyMatrix4(mesh.matrixWorld);
        box.union(localBox);
      }
    }

    for (let i = 0; i < object.children.length; i++) {
      this.computeBoxWithoutSceneObjects(object.children[i], box);
    }
  }

  static normalizePivot(object: THREE.Object3D): void {
    if (!object || object.userData?.__pivotNormalized) return;

    // 1. Force world matrix update so we get accurate bounding box calculations
    object.updateMatrixWorld(true);

    // 2. Compute the bounding box of the object hierarchy, ignoring child scene objects
    const bbox = new THREE.Box3();
    this.computeBoxWithoutSceneObjects(object, bbox);
    if (bbox.isEmpty()) {
      return;
    }

    // 3. Find the bottom center of the bounding box
    // In AR / 3D space, bottom center is centered in X and Y, and at minimum Z
    const bottomCenter = new THREE.Vector3(
      (bbox.min.x + bbox.max.x) / 2,
      (bbox.min.y + bbox.max.y) / 2,
      bbox.min.z
    );

    // 4. Convert the bottom center from world coordinates to the local coordinate system of the object itself
    object.worldToLocal(bottomCenter);

    // If the bottom center is already extremely close to (0,0,0), it's already normalized
    if (bottomCenter.lengthSq() < 1e-6) {
      object.userData.__pivotNormalized = true;
      return;
    }

    // 5. Shift all direct children of the object in the opposite direction (-bottomCenter), ignoring child scene objects
    // This shifts the geometry visually so its bottom center sits at (0, 0, 0)
    object.children.forEach((child) => {
      if (child.userData?.isSceneObject) return;
      child.position.sub(bottomCenter);
    });

    // 6. If the object itself is a Mesh with an active geometry, normalize its geometry to bottom center too
    if ((object as THREE.Mesh).isMesh) {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.computeBoundingBox();
        const gBox = mesh.geometry.boundingBox;
        if (gBox) {
          const gBottomCenter = new THREE.Vector3(
            (gBox.min.x + gBox.max.x) / 2,
            (gBox.min.y + gBox.max.y) / 2,
            gBox.min.z
          );
          mesh.geometry.translate(-gBottomCenter.x, -gBottomCenter.y, -gBottomCenter.z);
          mesh.geometry.computeBoundingBox();
        }
      }
    }

    object.userData.__pivotNormalized = true;

    // 7. Force matrix and world matrix updates to apply translations cleanly
    object.updateMatrix();
    object.updateMatrixWorld(true);
  }
}
