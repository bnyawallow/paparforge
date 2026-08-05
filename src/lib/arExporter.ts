import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import JSZip from 'jszip';
import { SceneObject, ProjectSettings, Asset } from '../types';
import { generateAFrameScene } from './aframeGenerator';

interface ExportSceneState {
  objects: Record<string, SceneObject>;
  rootObjects: string[];
  settings: ProjectSettings;
  assets: Asset[];
}

/**
 * Export 3D Scene to GLB binary format
 */
export async function exportSceneToGLB(
  objects: Record<string, SceneObject>,
  rootObjects: string[],
  projectName: string = 'ar-scene'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const scene = new THREE.Scene();

      // Add default ambient light to exported GLB scene
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(5, 10, 7.5);
      scene.add(dirLight);

      // Build Three.js objects hierarchy from store objects
      const idToThreeObjectMap: Record<string, THREE.Object3D> = {};

      // Helper to process primitive/object geometries
      const buildObjectNode = (obj: SceneObject): THREE.Object3D => {
        let node: THREE.Object3D;
        const color = new THREE.Color(obj.properties.color || '#3b82f6');
        const wireframe = !!obj.properties.wireframe;
        const roughness = obj.properties.roughness ?? 0.4;
        const metalness = obj.properties.metalness ?? 0.1;

        const material = new THREE.MeshStandardMaterial({
          color,
          roughness,
          metalness,
          wireframe,
          side: obj.properties.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });

        switch (obj.type as string) {
          case 'box':
            node = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
            break;
          case 'sphere':
            node = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
            break;
          case 'cylinder':
            node = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), material);
            break;
          case 'plane':
            node = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
            break;
          case 'torus':
            node = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.15, 16, 100), material);
            break;
          case 'cone':
            node = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 32), material);
            break;
          case 'circle':
            node = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), material);
            break;
          case 'ring':
            node = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.5, 32), material);
            break;
          case 'button':
            node = new THREE.Mesh(
              new THREE.BoxGeometry(1, 0.3, 0.05),
              new THREE.MeshStandardMaterial({
                color: new THREE.Color(obj.properties.color || '#2563eb'),
                roughness: 0.3
              })
            );
            break;
          case 'card':
          case 'panel2d':
            node = new THREE.Mesh(
              new THREE.PlaneGeometry(1, 1),
              new THREE.MeshStandardMaterial({
                color: new THREE.Color(obj.properties.backgroundColor || obj.properties.color || '#111827'),
                side: THREE.DoubleSide
              })
            );
            break;
          default:
            node = new THREE.Group();
            break;
        }

        node.name = obj.name || obj.type;
        node.position.set(obj.position[0], obj.position[1], obj.position[2]);
        node.rotation.set(
          THREE.MathUtils.degToRad(obj.rotation[0]),
          THREE.MathUtils.degToRad(obj.rotation[1]),
          THREE.MathUtils.degToRad(obj.rotation[2])
        );
        node.scale.set(obj.scale[0], obj.scale[1], obj.scale[2]);
        node.visible = obj.visible !== false;

        return node;
      };

      // Populate objects
      Object.values(objects).forEach((obj) => {
        // Skip root image targets in 3D scene export or keep them as anchors
        if (obj.type === 'imageTarget') return;
        const threeObj = buildObjectNode(obj);
        idToThreeObjectMap[obj.id] = threeObj;
      });

      // Link hierarchy
      Object.values(objects).forEach((obj) => {
        if (obj.type === 'imageTarget') {
          // Add children of image target to root scene
          (obj.children || []).forEach((childId) => {
            if (idToThreeObjectMap[childId]) {
              scene.add(idToThreeObjectMap[childId]);
            }
          });
        } else if (obj.parentId && idToThreeObjectMap[obj.parentId]) {
          idToThreeObjectMap[obj.parentId].add(idToThreeObjectMap[obj.id]);
        } else if (idToThreeObjectMap[obj.id]) {
          scene.add(idToThreeObjectMap[obj.id]);
        }
      });

      const exporter = new GLTFExporter();
      exporter.parse(
        scene,
        (gltf) => {
          if (gltf instanceof ArrayBuffer) {
            const blob = new Blob([gltf], { type: 'model/gltf-binary' });
            resolve(blob);
          } else {
            const output = JSON.stringify(gltf, null, 2);
            const blob = new Blob([output], { type: 'model/gltf+json' });
            resolve(blob);
          }
        },
        (error) => {
          console.error('GLTFExporter failed:', error);
          reject(error);
        },
        { binary: true, embedImages: true }
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate Zappar WebAR deployment package (.zip)
 */
export async function exportSceneAsZapparPackage(state: ExportSceneState): Promise<Blob> {
  const zip = new JSZip();
  const projectName = state.settings.projectName || 'AR Experience';
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'zappar-webar';

  // Find all image targets in the project
  const imageTargets = Object.values(state.objects).filter((o) => o.type === 'imageTarget');
  const targetConfigs = imageTargets.map((t, index) => ({
    targetId: t.id,
    name: t.name,
    targetIndex: index,
    physicalWidth: t.properties.physicalWidth || 1,
    textureUrl: t.properties.textureUrl || '',
    augmentationCount: (t.children || []).length
  }));

  // Generate Zappar HTML index file
  const zapparHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${projectName} - Zappar WebAR Experience</title>

  <!-- Zappar WebAR ThreeJS SDK & Camera Pipeline -->
  <script src="https://libs.zappar.com/zappar-threejs/2.0.0/zappar-threejs.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #zappar-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    #ui-hud-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }
    .hud-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(10, 10, 10, 0.85);
      border: 1px solid rgba(59, 130, 246, 0.4);
      color: #fff;
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .instructions-pill {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(99, 102, 241, 0.5);
      color: #e2e8f0;
      padding: 10px 20px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6);
      backdrop-filter: blur(10px);
    }
  </style>
</head>
<body>
  <div id="ui-hud-container">
    <div class="hud-badge">⚡ ZAPPAR WEBAR RUNTIME</div>
    <div class="instructions-pill">📷 Point camera at target print ad</div>
  </div>
  <canvas id="zappar-canvas"></canvas>

  <script>
    // Zappar WebAR Scene Initialization
    window.addEventListener('load', () => {
      // 1. Setup WebGL Renderer & Zappar Pipeline
      const canvas = document.getElementById('zappar-canvas');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // 2. Initialize Zappar Camera & Scene
      const scene = new THREE.Scene();
      const camera = new ZapparThree.Camera();
      ZapparThree.permissionRequestUI().then((granted) => {
        if (granted) camera.start();
        else ZapparThree.permissionDeniedUI();
      });

      scene.add(camera);

      // Add Ambient & Directional Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(5, 10, 7.5);
      scene.add(dirLight);

      // 3. Image Target Tracking Anchor Group
      const imageTracker = new ZapparThree.ImageTrackerLoader().loadDefault();
      const trackerGroup = new ZapparThree.ImageAnchorGroup(camera, imageTracker);
      scene.add(trackerGroup);

      // Build 3D Scaffolding Entities
      const objectsData = ${JSON.stringify(state.objects, null, 2)};
      const rootIds = ${JSON.stringify(state.rootObjects)};

      // Render loop
      function render() {
        requestAnimationFrame(render);
        camera.updateFrame(renderer);
        renderer.render(scene, camera);
      }
      render();

      window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    });
  </script>
</body>
</html>`;

  // Project Manifest for Zappar CLI / ZapWorks Studio
  const zapparManifest = {
    name: projectName,
    version: '1.0.0',
    platform: 'zappar-webar',
    exportTimestamp: new Date().toISOString(),
    imageTargets: targetConfigs,
    objectsCount: Object.keys(state.objects).length,
    sceneSettings: state.settings,
    objects: state.objects
  };

  // README file with clear ZapWorks CLI deployment instructions
  const readmeContent = `====================================================================
${projectName.toUpperCase()} - ZAPPAR WEBAR DEPLOYMENT BUNDLE
====================================================================

This package contains your complete WebAR scene formatted for Zappar WebAR
and ZapWorks Studio deployment.

FILES IN THIS BUNDLE:
1. index.html - Standalone Zappar WebAR runtime page using Zappar ThreeJS SDK.
2. zappar-manifest.json - Complete scene object hierarchy, targets & behaviors.
3. README.txt - Deployment instructions.

DEPLOYMENT OPTIONS:

OPTION A: Direct HTML Server / Web Host
Simply upload 'index.html' to any HTTPS web server or CDN (Netlify, Vercel, AWS S3).
Users scanning your print ad QR code will launch the Zappar camera tracking immediately.

OPTION B: ZapWorks CLI Deployment
1. Install ZapWorks CLI:
   npm install -g @zappar/zapworks-cli

2. Serve locally for testing:
   zapworks serve

3. Publish to ZapWorks Cloud:
   zapworks publish

====================================================================
Built with ARForge WebAR Studio
`;

  zip.file('index.html', zapparHtml);
  zip.file('zappar-manifest.json', JSON.stringify(zapparManifest, null, 2));
  zip.file('README.txt', readmeContent);

  // Generate ZIP Blob
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Export Standalone WebAR HTML File
 */
export function exportStandaloneHTML(state: ExportSceneState, projectName: string = 'ar-experience'): { filename: string; blob: Blob } {
  const htmlContent = generateAFrameScene(state as any);
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'ar-experience';
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return {
    filename: `${slug}-ar-experience.html`,
    blob
  };
}
