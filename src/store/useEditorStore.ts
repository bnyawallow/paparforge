import { useAuthStore } from './useAuthStore';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';
import { EditorState, SceneObject, HistorySnapshot, ProjectVersion, StateData, TemplateType, Asset, GlobalLoadingState } from '../types';
import { DEFAULT_ART_POSTER_TEXTURE } from '../lib/arTargetTexture';
import { DirtyNodeTracker } from '../lib/dirtyNodeTracker';

const getStorageKey = (key: string) => {
  const user = useAuthStore.getState().user;
  return user ? `${user.id}_${key}` : key;
};

const loadVersionsForProject = (projectId: string): ProjectVersion[] => {
  try {
    const data = localStorage.getItem(getStorageKey(`ar_forge_versions_${projectId}`));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveVersionsForProject = (projectId: string, versions: ProjectVersion[]) => {
  try {
    localStorage.setItem(getStorageKey(`ar_forge_versions_${projectId}`), JSON.stringify(versions));
  } catch (e) {
    console.error('Failed to save version snapshots:', e);
  }
};

const initialImageTargetId = uuidv4();
const initialBoxId = uuidv4();

const defaultScene: Record<string, SceneObject> = {
  [initialImageTargetId]: {
    id: initialImageTargetId,
    name: 'AR Target',
    type: 'imageTarget',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true,
    locked: true,
    children: [initialBoxId],
    parentId: null,
    properties: {
      physicalWidth: 0.1, // 10cm default
      textureUrl: DEFAULT_ART_POSTER_TEXTURE,
    }
  },
  [initialBoxId]: {
    id: initialBoxId,
    name: 'Default 3D Box',
    type: 'box',
    position: [0, 0, 0.833],
    rotation: [0, 0, 0],
    scale: [1.666, 1.666, 1.666],
    visible: true,
    locked: false,
    children: [],
    parentId: initialImageTargetId,
    properties: {
      color: '#6366f1',
      roughness: 0.3,
      metalness: 0.2
    }
  }
};

const computeWorldMatrix = (id: string, objects: Record<string, SceneObject>): THREE.Matrix4 => {
  const obj = objects[id];
  if (!obj) return new THREE.Matrix4();
  
  const localMatrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...obj.position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...obj.rotation)),
    new THREE.Vector3(...obj.scale)
  );

  if (obj.parentId) {
    const parentMatrix = computeWorldMatrix(obj.parentId, objects);
    return parentMatrix.multiply(localMatrix);
  }
  
  return localMatrix;
};

// Generate template scenes to allow quick prototyping
export const generateTemplate = (projectName: string, templateType: TemplateType) => {
  const imageTargetId = uuidv4();
  const objects: Record<string, SceneObject> = {
    [imageTargetId]: {
      id: imageTargetId,
      name: 'AR Target',
      type: 'imageTarget',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: true,
      children: [],
      parentId: null,
      properties: {
        physicalWidth: 0.1, // 10cm default
        textureUrl: DEFAULT_ART_POSTER_TEXTURE,
      }
    }
  };
  const rootObjects = [imageTargetId];

  if (templateType === 'product_showcase') {
    // 1. Nike / Adidas AR Footwear Magazine Print Ad
    const pGroupId = uuidv4();
    const pedestalId = uuidv4();
    const shoeModelId = uuidv4();
    const ringGlowId = uuidv4();
    const textTitleId = uuidv4();
    const textPriceId = uuidv4();
    const btnBuyId = uuidv4();
    const specCalloutId = uuidv4();

    objects[imageTargetId].children = [pGroupId];
    objects[pGroupId] = {
      id: pGroupId,
      name: 'Sneaker Launch Group',
      type: 'group',
      position: [0, 0, 0.1],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [pedestalId, shoeModelId, ringGlowId, textTitleId, textPriceId, btnBuyId, specCalloutId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[pedestalId] = {
      id: pedestalId,
      name: 'Cyber Metallic Pedestal',
      type: 'cylinder',
      position: [0, -0.3, 0],
      rotation: [90, 0, 0],
      scale: [0.6, 0.08, 0.6],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: { color: '#0F172A', metalness: 0.9, roughness: 0.2 }
    };

    objects[shoeModelId] = {
      id: shoeModelId,
      name: 'Air Apex HyperSneaker 3D',
      type: 'model',
      position: [0, -0.05, 0],
      rotation: [90, 0, 45],
      scale: [1.2, 1.2, 1.2],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
        behavior: 'spin',
        spinAxis: 'z',
        animationPlaying: false,
        autoplayAnimation: false,
        animationSpeed: 1.0,
        discoveredAnimations: ['Spin', 'Bounce', 'Flex']
      },
      events: [
        {
          id: uuidv4(),
          name: 'Tap Shoe to Play Animation',
          trigger: 'onTap',
          actions: [
            { id: uuidv4(), type: 'playModelAnimation', targetId: shoeModelId, animationClipName: 'Flex' },
            { id: uuidv4(), type: 'toast', toastMessage: '⚡ Custom Air Cushioning Activated!' }
          ]
        }
      ]
    };

    objects[ringGlowId] = {
      id: ringGlowId,
      name: 'Orbit Halo Ring',
      type: 'torus',
      position: [0, 0.15, 0],
      rotation: [90, 0, 0],
      scale: [0.55, 0.55, 0.03],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: { color: '#00F3FF', behavior: 'spin', spinAxis: 'z' }
    };

    objects[textTitleId] = {
      id: textTitleId,
      name: 'Product Title',
      type: 'text',
      position: [0, 0.65, 0],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: {
        text: 'AIR APEX PRO HYPER-SNEAKER\nSpatial Kinetic Fit',
        color: '#00F3FF',
        outlineColor: '#003B46',
        outlineWidth: 0.02,
        billboard: true
      }
    };

    objects[textPriceId] = {
      id: textPriceId,
      name: 'Price Badge',
      type: 'text',
      position: [0, -0.1, 0.25],
      rotation: [0, 0, 0],
      scale: [0.35, 0.35, 0.35],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: { text: '⚡ $189.99 (Limited Drop)', color: '#10B981', billboard: true }
    };

    objects[btnBuyId] = {
      id: btnBuyId,
      name: 'Pre-Order Button',
      type: 'button',
      position: [0, -0.42, 0.2],
      rotation: [0, 0, 0],
      scale: [0.5, 0.12, 0.03],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: { text: 'PRE-ORDER NOW', color: '#FF007F', textColor: '#FFFFFF', url: 'https://example.com' }
    };

    objects[specCalloutId] = {
      id: specCalloutId,
      name: 'Feature Callout',
      type: 'text',
      position: [-0.6, 0.2, 0],
      rotation: [0, 0, 0],
      scale: [0.3, 0.3, 0.3],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: { text: '✓ Dynamic Air Soles\n✓ Carbon Fiber Plate\n✓ Recycled Flyknit Mesh', color: '#E2E8F0', billboard: true }
    };

  } else if (templateType === 'automobile_showroom') {
    // 2. High-Tech Automotive Showroom with Drivable Vehicle and Physics Collision
    const cGroupId = uuidv4();
    const stageCylinderId = uuidv4();
    const vehicleModelId = uuidv4();
    const titleTextId = uuidv4();
    const specTextId = uuidv4();
    const btnDriveId = uuidv4();

    objects[imageTargetId].children = [cGroupId];
    objects[cGroupId] = {
      id: cGroupId,
      name: 'Apex Cyber Buggy 4x4 Showroom',
      type: 'group',
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [stageCylinderId, vehicleModelId, titleTextId, specTextId, btnDriveId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[stageCylinderId] = {
      id: stageCylinderId,
      name: 'Reflective Showroom Podium',
      type: 'cylinder',
      position: [0, -0.25, 0],
      rotation: [90, 0, 0],
      scale: [1.5, 0.06, 1.5],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { color: '#1E293B', metalness: 0.95, roughness: 0.1 }
    };

    objects[vehicleModelId] = {
      id: vehicleModelId,
      name: 'Cyber Buggy 4x4 (Drivable)',
      type: 'model',
      position: [0, 0.1, 0],
      rotation: [90, 0, 0],
      scale: [0.015, 0.015, 0.015],
      visible: true,
      children: [],
      parentId: cGroupId,
      tags: ['vehicle', 'car', 'buggy', 'drivable', 'physics'],
      properties: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Buggy/glTF-Binary/Buggy.glb',
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Buggy/glTF-Binary/Buggy.glb',
        behavior: 'drive',
        isDrivable: true,
        collisionEnabled: true,
        boundingShape: 'box',
        colliderSize: [1.8, 2.6, 1.2],
        speed: 1.5,
        turnSpeed: 2.2,
        animationPlaying: false,
        autoplayAnimation: false,
        animationSpeed: 1.0
      },
      events: [
        {
          id: uuidv4(),
          name: 'Tap Vehicle to Drive',
          trigger: 'onTap',
          actions: [
            { id: uuidv4(), type: 'toast', toastMessage: '🚗 Simulation engaged! Press Drive button or use WASD/Arrows to drive.' }
          ]
        }
      ]
    };

    objects[titleTextId] = {
      id: titleTextId,
      name: 'Vehicle Title Header',
      type: 'text',
      position: [0, 0.75, 0],
      rotation: [0, 0, 0],
      scale: [0.5, 0.5, 0.5],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: {
        text: 'APEX TITAN-X OFF-ROAD BUGGY',
        color: '#F97316',
        outlineColor: '#7C2D12',
        outlineWidth: 0.02,
        billboard: true
      }
    };

    objects[specTextId] = {
      id: specTextId,
      name: 'Performance Specs',
      type: 'text',
      position: [0, 0.55, 0],
      rotation: [0, 0, 0],
      scale: [0.32, 0.32, 0.32],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { text: '⚡ DUAL AWD MOTOR | ACTIVE HYDRAULIC OBB SUSPENSION | AR DRIVING SIM', color: '#F3F4F6', billboard: true }
    };

    objects[btnDriveId] = {
      id: btnDriveId,
      name: 'Test Drive CTA Button',
      type: 'button',
      position: [0, -0.38, 0.3],
      rotation: [0, 0, 0],
      scale: [0.65, 0.13, 0.03],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { text: 'ENTER TEST DRIVE [W,A,S,D]', color: '#DC2626', textColor: '#FFFFFF', url: 'https://example.com' }
    };

  } else if (templateType === 'fast_food_beverage') {
    // 3. Gourmet Beverage Canned Soda Promo Print Ad
    const fGroupId = uuidv4();
    const drinkModelId = uuidv4();
    const sliceRingId = uuidv4();
    const headerTextId = uuidv4();
    const couponBadgeId = uuidv4();
    const btnOrderDeliveryId = uuidv4();

    objects[imageTargetId].children = [fGroupId];
    objects[fGroupId] = {
      id: fGroupId,
      name: 'Gourmet Beverage Promo',
      type: 'group',
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [drinkModelId, sliceRingId, headerTextId, couponBadgeId, btnOrderDeliveryId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[drinkModelId] = {
      id: drinkModelId,
      name: '3D Beverage Bottle Model',
      type: 'model',
      position: [0, 0.1, 0],
      rotation: [90, 0, 0],
      scale: [1.8, 1.8, 1.8],
      visible: true,
      children: [],
      parentId: fGroupId,
      properties: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/WaterBottle/glTF-Binary/WaterBottle.glb',
        behavior: 'float',
        animationPlaying: false,
        autoplayAnimation: false,
        animationSpeed: 1.0,
        discoveredAnimations: ['Spin', 'ChillSplash']
      },
      events: [
        {
          id: uuidv4(),
          name: 'Tap Bottle to Spin',
          trigger: 'onTap',
          actions: [
            { id: uuidv4(), type: 'playModelAnimation', targetId: drinkModelId, animationClipName: 'Spin' },
            { id: uuidv4(), type: 'toast', toastMessage: '🧊 Ice Cold Refreshment Activated!' }
          ]
        }
      ]
    };

    objects[sliceRingId] = {
      id: sliceRingId,
      name: 'Floating Flavor Particles',
      type: 'torus',
      position: [0, 0.38, 0],
      rotation: [90, 0, 0],
      scale: [0.45, 0.45, 0.03],
      visible: true,
      children: [],
      parentId: fGroupId,
      properties: { color: '#EF4444', behavior: 'spin', spinAxis: 'z' }
    };

    objects[headerTextId] = {
      id: headerTextId,
      name: 'Promo Header Text',
      type: 'text',
      position: [0, 0.75, 0],
      rotation: [0, 0, 0],
      scale: [0.5, 0.5, 0.5],
      visible: true,
      children: [],
      parentId: fGroupId,
      properties: {
        text: '🔥 HYDRO-CHILL SPARKLING\nSAVE 25% TODAY',
        color: '#FACC15',
        outlineColor: '#4338CA',
        outlineWidth: 0.025,
        billboard: true
      }
    };

    objects[couponBadgeId] = {
      id: couponBadgeId,
      name: 'Coupon Code Pill',
      type: 'text',
      position: [0, -0.15, 0.25],
      rotation: [0, 0, 0],
      scale: [0.35, 0.35, 0.35],
      visible: true,
      children: [],
      parentId: fGroupId,
      properties: { text: 'PROMO CODE: REFRESH25', color: '#10B981', billboard: true }
    };

    objects[btnOrderDeliveryId] = {
      id: btnOrderDeliveryId,
      name: 'Order Delivery Button',
      type: 'button',
      position: [0, -0.38, 0.25],
      rotation: [0, 0, 0],
      scale: [0.55, 0.12, 0.025],
      visible: true,
      children: [],
      parentId: fGroupId,
      properties: { text: 'ORDER EXPRESS DELIVERY 🥤', color: '#EA580C', textColor: '#FFFFFF', url: 'https://example.com' }
    };

  } else if (templateType === 'luxury_fashion') {
    // 4. Vintage Camera & Luxury Collectibles AR Print Ad
    const lGroupId = uuidv4();
    const marblePedestalId = uuidv4();
    const cameraModelId = uuidv4();
    const titleTextId = uuidv4();
    const descTextId = uuidv4();
    const btnDiscoverId = uuidv4();

    objects[imageTargetId].children = [lGroupId];
    objects[lGroupId] = {
      id: lGroupId,
      name: 'Luxury Vintage Camera Ad',
      type: 'group',
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [marblePedestalId, cameraModelId, titleTextId, descTextId, btnDiscoverId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[marblePedestalId] = {
      id: marblePedestalId,
      name: 'Marble Display Stand',
      type: 'cylinder',
      position: [0, -0.25, 0],
      rotation: [90, 0, 0],
      scale: [0.65, 0.08, 0.65],
      visible: true,
      children: [],
      parentId: lGroupId,
      properties: { color: '#F8FAFC', roughness: 0.1 }
    };

    objects[cameraModelId] = {
      id: cameraModelId,
      name: 'Antique Camera 3D Model',
      type: 'model',
      position: [0, 0.05, 0],
      rotation: [90, 0, 30],
      scale: [0.25, 0.25, 0.25],
      visible: true,
      children: [],
      parentId: lGroupId,
      properties: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
        behavior: 'spin',
        spinAxis: 'z',
        animationPlaying: false,
        autoplayAnimation: false,
        animationSpeed: 1.0,
        discoveredAnimations: ['SnapPhoto', 'FocusLens']
      },
      events: [
        {
          id: uuidv4(),
          name: 'Tap Camera to Snap Photo',
          trigger: 'onTap',
          actions: [
            { id: uuidv4(), type: 'playModelAnimation', targetId: cameraModelId, animationClipName: 'SnapPhoto' },
            { id: uuidv4(), type: 'toast', toastMessage: '📸 Vintage Shutter Click Captured!' }
          ]
        }
      ]
    };

    objects[titleTextId] = {
      id: titleTextId,
      name: 'Brand Header',
      type: 'text',
      position: [0, 0.68, 0],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45],
      visible: true,
      children: [],
      parentId: lGroupId,
      properties: {
        text: 'LEICA HERITAGE 1928\nLIMITED EDITION CAMERA',
        color: '#FFD700',
        outlineColor: '#8B6508',
        outlineWidth: 0.018,
        billboard: true
      }
    };

    objects[descTextId] = {
      id: descTextId,
      name: 'Camera Specs',
      type: 'text',
      position: [0, -0.1, 0.2],
      rotation: [0, 0, 0],
      scale: [0.32, 0.32, 0.32],
      visible: true,
      children: [],
      parentId: lGroupId,
      properties: { text: 'Handcrafted Brass Body & Carl Zeiss F/1.4 Lens', color: '#F1F5F9', billboard: true }
    };

    objects[btnDiscoverId] = {
      id: btnDiscoverId,
      name: 'Explore Collection Button',
      type: 'button',
      position: [0, -0.38, 0.25],
      rotation: [0, 0, 0],
      scale: [0.5, 0.11, 0.025],
      visible: true,
      children: [],
      parentId: lGroupId,
      properties: { text: 'EXPLORE VAULT COLLECTION 👑', color: '#D97706', textColor: '#FFFFFF', url: 'https://example.com' }
    };

  } else if (templateType === 'real_estate') {
    // 5. Architectural Lantern & Modern Villa AR Brochure
    const rGroupId = uuidv4();
    const podiumId = uuidv4();
    const lanternModelId = uuidv4();
    const titleTextId = uuidv4();
    const priceBadgeId = uuidv4();
    const btnTourId = uuidv4();

    objects[imageTargetId].children = [rGroupId];
    objects[rGroupId] = {
      id: rGroupId,
      name: 'Luxury Villa Architectural AR',
      type: 'group',
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [podiumId, lanternModelId, titleTextId, priceBadgeId, btnTourId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[podiumId] = {
      id: podiumId,
      name: 'Podium Ground Base',
      type: 'box',
      position: [0, -0.22, 0],
      rotation: [0, 0, 0],
      scale: [1.1, 0.04, 0.8],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: { color: '#0F172A', roughness: 0.2 }
    };

    objects[lanternModelId] = {
      id: lanternModelId,
      name: 'Architectural Lantern 3D Model',
      type: 'model',
      position: [0, 0.1, 0],
      rotation: [90, 0, 0],
      scale: [0.2, 0.2, 0.2],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Lantern/glTF-Binary/Lantern.glb',
        behavior: 'spin',
        spinAxis: 'z',
        animationPlaying: false,
        autoplayAnimation: false,
        animationSpeed: 1.0,
        discoveredAnimations: ['GlowToggle', 'FlamePulse']
      },
      events: [
        {
          id: uuidv4(),
          name: 'Tap Lantern to Toggle Warm Lighting',
          trigger: 'onTap',
          actions: [
            { id: uuidv4(), type: 'playModelAnimation', targetId: lanternModelId, animationClipName: 'GlowToggle' },
            { id: uuidv4(), type: 'toast', toastMessage: '💡 Smart Architectural Warm Lighting On!' }
          ]
        }
      ]
    };

    objects[titleTextId] = {
      id: titleTextId,
      name: 'Property Header',
      type: 'text',
      position: [0, 0.65, 0],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: {
        text: 'SKYLINE SANCTUARY RESIDENCES',
        color: '#FFFFFF',
        outlineColor: '#0F172A',
        outlineWidth: 0.02,
        billboard: true
      }
    };

    objects[priceBadgeId] = {
      id: priceBadgeId,
      name: 'Price Tag Pill',
      type: 'text',
      position: [0, 0.45, 0],
      rotation: [0, 0, 0],
      scale: [0.35, 0.35, 0.35],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: { text: '💎 Ultra-luxury Penthouse Units from $1,250,000', color: '#10B981', billboard: true }
    };

    objects[btnTourId] = {
      id: btnTourId,
      name: 'Schedule Virtual Tour CTA',
      type: 'button',
      position: [0, -0.38, 0.35],
      rotation: [0, 0, 0],
      scale: [0.55, 0.12, 0.03],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: { text: 'BOOK PRIVATE VIRTUAL TOUR 🏡', color: '#2563EB', textColor: '#FFFFFF', url: 'https://example.com' }
    };

  } else if (templateType === 'business_card') {
    // 6. Interactive Animated 3D Astronaut WebAR Business Card
    const cardId = uuidv4();
    const astroModelId = uuidv4();
    const textNameId = uuidv4();
    const btnWebsiteId = uuidv4();
    const btnVCardId = uuidv4();

    objects[imageTargetId].children = [cardId];
    objects[cardId] = {
      id: cardId,
      name: 'Business Card Base',
      type: 'box',
      position: [0, 0, 0.01],
      rotation: [0, 0, 0],
      scale: [1.2, 0.8, 0.02],
      visible: true,
      children: [astroModelId, textNameId, btnWebsiteId, btnVCardId],
      parentId: imageTargetId,
      properties: { color: '#111827' }
    };

    objects[astroModelId] = {
      id: astroModelId,
      name: '3D Astronaut Mascot',
      type: 'model',
      position: [0.3, 0, 0.15],
      rotation: [90, 0, -20],
      scale: [0.35, 0.35, 0.35],
      visible: true,
      children: [],
      parentId: cardId,
      properties: {
        url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
        animationPlaying: false,
        autoplayAnimation: false,
        animationSpeed: 1.0,
        activeAnimation: 'Wave',
        discoveredAnimations: ['Wave', 'Idle']
      },
      events: [
        {
          id: uuidv4(),
          name: 'Tap Astronaut to Wave Greeting',
          trigger: 'onTap',
          actions: [
            { id: uuidv4(), type: 'playModelAnimation', targetId: astroModelId, animationClipName: 'Wave' },
            { id: uuidv4(), type: 'toast', toastMessage: '👋 Hello! Welcome to my WebAR Profile!' }
          ]
        }
      ]
    };

    objects[textNameId] = {
      id: textNameId,
      name: 'Name & Title Text',
      type: 'text',
      position: [-0.3, 0.2, 0.03],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45],
      visible: true,
      children: [],
      parentId: cardId,
      properties: { text: 'Dr. Alex Vance\nSpatial AR & AI Architect', color: '#60a5fa' }
    };

    objects[btnWebsiteId] = {
      id: btnWebsiteId,
      name: 'Portfolio Button',
      type: 'button',
      position: [-0.3, -0.1, 0.03],
      rotation: [0, 0, 0],
      scale: [0.42, 0.1, 0.02],
      visible: true,
      children: [],
      parentId: cardId,
      properties: { text: 'VISIT PORTFOLIO 🌐', color: '#2563eb', textColor: '#FFFFFF', url: 'https://example.com' }
    };

    objects[btnVCardId] = {
      id: btnVCardId,
      name: 'Save Contact Button',
      type: 'button',
      position: [-0.3, -0.25, 0.03],
      rotation: [0, 0, 0],
      scale: [0.42, 0.1, 0.02],
      visible: true,
      children: [],
      parentId: cardId,
      properties: { text: 'SAVE VCARD CONTACT 🎴', color: '#10B981', textColor: '#FFFFFF', url: 'https://example.com' }
    };

  } else if (templateType === 'educational') {
    // 7. STEM Interactive Animated Fox Mascot & Event Chaining
    const parentGroupId = uuidv4();
    const foxModelId = uuidv4();
    const labelId = uuidv4();
    const btnQuizId = uuidv4();

    objects[imageTargetId].children = [parentGroupId];
    objects[parentGroupId] = {
      id: parentGroupId,
      name: 'STEM Interactive Mascot Group',
      type: 'group',
      position: [0, 0, 0.1],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [foxModelId, labelId, btnQuizId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[foxModelId] = {
      id: foxModelId,
      name: '3D Animated Fox Mascot',
      type: 'model',
      position: [0, 0, 0],
      rotation: [90, 0, 0],
      scale: [0.012, 0.012, 0.012],
      visible: true,
      children: [],
      parentId: parentGroupId,
      properties: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb',
        animationPlaying: false,
        autoplayAnimation: false,
        animationSpeed: 1.0,
        activeAnimation: 'Walk',
        discoveredAnimations: ['Walk', 'Run', 'Survey', 'LookAround']
      },
      events: [
        {
          id: uuidv4(),
          name: 'Tap Fox to Sprint',
          trigger: 'onTap',
          actions: [
            { id: uuidv4(), type: 'playModelAnimation', targetId: foxModelId, animationClipName: 'Run' },
            { id: uuidv4(), type: 'toast', toastMessage: '🦊 Fox Mascot is Running!' }
          ]
        },
        {
          id: uuidv4(),
          name: 'Animation Complete Trigger',
          trigger: 'onAnimationComplete',
          actions: [
            { id: uuidv4(), type: 'toast', toastMessage: '🌟 Great job! Animation Cycle Completed!' }
          ]
        }
      ]
    };

    objects[labelId] = {
      id: labelId,
      name: 'STEM Title Label',
      type: 'text',
      position: [0, 0.6, 0],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45],
      visible: true,
      children: [],
      parentId: parentGroupId,
      properties: { text: 'BIOLOGY STEM TEXTBOOK AR\nInteractive Mammal Kinematics', color: '#06B6D4', billboard: true }
    };

    objects[btnQuizId] = {
      id: btnQuizId,
      name: 'Take STEM Quiz CTA',
      type: 'button',
      position: [0, -0.38, 0.2],
      rotation: [0, 0, 0],
      scale: [0.55, 0.12, 0.03],
      visible: true,
      children: [],
      parentId: parentGroupId,
      properties: { text: 'TAKE INTERACTIVE QUIZ 🧠', color: '#0284C7', textColor: '#FFFFFF', url: 'https://example.com' }
    };

  } else if (templateType === 'billboard_poster') {
    // 8. Outdoor Billboard Movie Premiere Ad with 3D Dragon
    const bGroupId = uuidv4();
    const frameId = uuidv4();
    const dragonModelId = uuidv4();
    const videoId = uuidv4();
    const titleTextId = uuidv4();
    const btnTicketsId = uuidv4();

    objects[imageTargetId].children = [bGroupId];
    objects[bGroupId] = {
      id: bGroupId,
      name: 'AR 3D Billboard Premiere Ad',
      type: 'group',
      position: [0, 0.2, 0.05],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [frameId, dragonModelId, videoId, titleTextId, btnTicketsId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[frameId] = {
      id: frameId,
      name: 'Billboard Frame Box',
      type: 'box',
      position: [0, 0.3, -0.02],
      rotation: [0, 0, 0],
      scale: [1.4, 0.85, 0.04],
      visible: true,
      children: [],
      parentId: bGroupId,
      properties: { color: '#09090B', metalness: 0.8, roughness: 0.2 }
    };

    objects[dragonModelId] = {
      id: dragonModelId,
      name: '3D Dragon Creature',
      type: 'model',
      position: [0.4, 0.5, 0.25],
      rotation: [90, 0, -30],
      scale: [0.35, 0.35, 0.35],
      visible: true,
      children: [],
      parentId: bGroupId,
      properties: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DragonAttenuation/glTF-Binary/DragonAttenuation.glb',
        behavior: 'float',
        animationPlaying: false,
        autoplayAnimation: false,
        animationSpeed: 1.0,
        discoveredAnimations: ['Roar', 'Fly']
      },
      events: [
        {
          id: uuidv4(),
          name: 'Tap Dragon to Roar',
          trigger: 'onTap',
          actions: [
            { id: uuidv4(), type: 'playModelAnimation', targetId: dragonModelId, animationClipName: 'Roar' },
            { id: uuidv4(), type: 'toast', toastMessage: '🐉 Dragon Roar Activated!' }
          ]
        }
      ]
    };

    objects[videoId] = {
      id: videoId,
      name: 'Commercial Video Player',
      type: 'youtube',
      position: [-0.2, 0.3, 0.02],
      rotation: [0, 0, 0],
      scale: [0.8, 0.5, 0.1],
      visible: true,
      children: [],
      parentId: bGroupId,
      properties: { videoId: 'dQw4w9WgXcQ', resolution: '240p' }
    };

    objects[titleTextId] = {
      id: titleTextId,
      name: 'Billboard Title',
      type: 'text',
      position: [0, 0.82, 0.05],
      rotation: [0, 0, 0],
      scale: [0.55, 0.55, 0.55],
      visible: true,
      children: [],
      parentId: bGroupId,
      properties: {
        text: 'DRAGON REALM: IMAX 3D',
        color: '#EC4899',
        outlineColor: '#8B5CF6',
        outlineWidth: 0.02,
        billboard: true
      }
    };

    objects[btnTicketsId] = {
      id: btnTicketsId,
      name: 'Buy Tickets Button',
      type: 'button',
      position: [0, -0.22, 0.05],
      rotation: [0, 0, 0],
      scale: [0.55, 0.12, 0.03],
      visible: true,
      children: [],
      parentId: bGroupId,
      properties: { text: 'GET IMAX TICKETS $18 🎟️', color: '#EC4899', textColor: '#FFFFFF', url: 'https://example.com' }
    };

  } else if (templateType === 'face_filter_mask') {
    // 9. AR Face Filter & Sci-Fi Mask Experience
    const fMaskGroupId = uuidv4();
    const maskModelId = uuidv4();
    const textTitleId = uuidv4();
    const btnSnapshotId = uuidv4();

    objects[imageTargetId].children = [fMaskGroupId];
    objects[fMaskGroupId] = {
      id: fMaskGroupId,
      name: 'AR Face Filter Group',
      type: 'group',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [maskModelId, textTitleId, btnSnapshotId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[maskModelId] = {
      id: maskModelId,
      name: 'Sci-Fi Visor Face Mask',
      type: 'model',
      position: [0, 0, 0],
      rotation: [90, 0, 0],
      scale: [0.65, 0.65, 0.65],
      visible: true,
      children: [],
      parentId: fMaskGroupId,
      properties: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
        animationPlaying: false,
        autoplayAnimation: false,
        animationSpeed: 1.0,
        discoveredAnimations: ['VisorGlow', 'HUDPulse']
      },
      events: [
        {
          id: uuidv4(),
          name: 'Tap Visor to Trigger HUD Pulse',
          trigger: 'onTap',
          actions: [
            { id: uuidv4(), type: 'playModelAnimation', targetId: maskModelId, animationClipName: 'HUDPulse' },
            { id: uuidv4(), type: 'toast', toastMessage: '⚡ Cyber Visor Pulse Engaged!' }
          ]
        }
      ]
    };

    objects[textTitleId] = {
      id: textTitleId,
      name: 'Filter Title',
      type: 'text',
      position: [0, 0.65, 0],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45],
      visible: true,
      children: [],
      parentId: fMaskGroupId,
      properties: { text: 'CYBER-VISOR AR FILTER', color: '#00F3FF', billboard: true }
    };

    objects[btnSnapshotId] = {
      id: btnSnapshotId,
      name: 'Take AR Snapshot CTA',
      type: 'button',
      position: [0, -0.4, 0.2],
      rotation: [0, 0, 0],
      scale: [0.55, 0.12, 0.03],
      visible: true,
      children: [],
      parentId: fMaskGroupId,
      properties: { text: '📸 CAPTURE AR PHOTO', color: '#10B981', textColor: '#FFFFFF', url: 'https://example.com' }
    };
  } else if (templateType === 'surface_placement') {
    // 8. Surface Tracking / Environment Floor & Tabletop Placement
    objects[imageTargetId].name = 'Surface Target';
    objects[imageTargetId].properties = {
      targetType: 'surface',
      surfaceOrientation: 'horizontal',
      surfaceType: 'floor',
      placementMethod: 'tap',
      showReticle: true,
      reticleStyle: 'modern_ring',
      surfaceGridSize: 2,
      showGrid: true,
    };

    const sGroupId = uuidv4();
    const pedestalBaseId = uuidv4();
    const sculptureId = uuidv4();
    const floatingRingId = uuidv4();
    const titlePlateId = uuidv4();
    const actionBtnId = uuidv4();

    objects[imageTargetId].children = [sGroupId];
    objects[sGroupId] = {
      id: sGroupId,
      name: 'Surface Placement Group',
      type: 'group',
      position: [0, 0, 0], // Base resting flush at surface origin
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [pedestalBaseId, sculptureId, floatingRingId, titlePlateId, actionBtnId],
      parentId: imageTargetId,
      properties: {}
    };

    // Pedestal base resting on the floor (Z-up convention)
    objects[pedestalBaseId] = {
      id: pedestalBaseId,
      name: 'Floor Pedestal Base',
      type: 'cylinder',
      position: [0, 0, 0.05], // half height
      rotation: [0, 0, 0],
      scale: [0.7, 0.7, 0.1],
      visible: true,
      locked: false,
      children: [],
      parentId: sGroupId,
      properties: {
        color: '#1e293b',
        roughness: 0.2,
        metalness: 0.8
      }
    };

    // Centerpiece 3D sculpture resting Z-up on top of pedestal
    objects[sculptureId] = {
      id: sculptureId,
      name: 'Geometric Sculpture',
      type: 'sphere',
      position: [0, 0, 0.45], // Z-up height
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45],
      visible: true,
      locked: false,
      children: [],
      parentId: sGroupId,
      properties: {
        color: '#10b981',
        roughness: 0.1,
        metalness: 0.9,
        wireframe: false
      }
    };

    // Holographic glowing ring around the centerpiece
    objects[floatingRingId] = {
      id: floatingRingId,
      name: 'Holo Orbit Ring',
      type: 'cylinder',
      position: [0, 0, 0.45],
      rotation: [0, 0, 0],
      scale: [0.65, 0.65, 0.02],
      visible: true,
      locked: false,
      children: [],
      parentId: sGroupId,
      properties: {
        color: '#38bdf8',
        roughness: 0.1,
        metalness: 0.5,
        opacity: 0.85
      }
    };

    // Floating Info Tag above sculpture
    objects[titlePlateId] = {
      id: titlePlateId,
      name: 'Surface Spatial Label',
      type: 'text',
      position: [0, 0, 0.85],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: false,
      children: [],
      parentId: sGroupId,
      properties: {
        text: 'Floor Anchor Active',
        fontSize: 0.12,
        color: '#ffffff',
        anchorX: 'center',
        anchorY: 'middle'
      }
    };

    // Interactive button
    objects[actionBtnId] = {
      id: actionBtnId,
      name: 'Tap Reposition Button',
      type: 'button',
      position: [0, -0.4, 0.2],
      rotation: [0, 0, 0],
      scale: [0.5, 0.1, 0.02],
      visible: true,
      children: [],
      parentId: sGroupId,
      properties: {
        text: '📍 TAP TO REPOSITION',
        color: '#059669',
        textColor: '#FFFFFF',
        url: ''
      }
    };
  }

  if (imageTargetId && objects[imageTargetId] && (!objects[imageTargetId].children || objects[imageTargetId].children.length === 0)) {
    const boxId = uuidv4();
    objects[imageTargetId].children = [boxId];
    objects[boxId] = {
      id: boxId,
      name: 'Default 3D Box',
      type: 'box',
      position: [0, 0, 0.833],
      rotation: [0, 0, 0],
      scale: [1.666, 1.666, 1.666],
      visible: true,
      locked: false,
      children: [],
      parentId: imageTargetId,
      properties: {
        color: '#6366f1',
        roughness: 0.3,
        metalness: 0.2
      }
    };
  }

  return { objects, rootObjects };
};

const normalizeSceneHierarchyAndLockImageTarget = (objects: Record<string, SceneObject>, rootObjects?: string[]) => {
  if (!objects || Object.keys(objects).length === 0) {
    const imageTargetId = uuidv4();
    const boxId = uuidv4();
    const defaultImageTarget: SceneObject = {
      id: imageTargetId,
      name: 'AR Target',
      type: 'imageTarget',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: true,
      children: [boxId],
      parentId: null,
      properties: { physicalWidth: 0.1, textureUrl: DEFAULT_ART_POSTER_TEXTURE }
    };
    const defaultBox: SceneObject = {
      id: boxId,
      name: 'Default 3D Box',
      type: 'box',
      position: [0, 0, 0.833],
      rotation: [0, 0, 0],
      scale: [1.666, 1.666, 1.666],
      visible: true,
      locked: false,
      children: [],
      parentId: imageTargetId,
      properties: {
        color: '#6366f1',
        roughness: 0.3,
        metalness: 0.2
      }
    };
    return {
      objects: { [imageTargetId]: defaultImageTarget, [boxId]: defaultBox },
      rootObjects: [imageTargetId]
    };
  }

  const updatedObjects: Record<string, SceneObject> = {};
  
  // 1. Shallow copy & legacy type conversions
  Object.keys(objects).forEach(id => {
    if (!objects[id]) return;
    const obj = { ...objects[id] };
    
    if (obj.type === 'imageTarget') {
      obj.locked = true;
      if (!obj.properties) { obj.properties = {}; }
      if (!obj.properties.textureUrl && obj.properties.targetType !== 'face' && obj.properties.targetType !== 'surface') {
        obj.properties.textureUrl = DEFAULT_ART_POSTER_TEXTURE;
      }
    }

    const typeStr = obj.type as string;
    if (typeStr === 'overlay2d') { obj.type = 'hudCanvas'; }
    else if (typeStr === 'overlayText') { obj.type = 'hudText'; }
    else if (typeStr === 'overlayButton') { obj.type = 'hudButton'; }
    else if (typeStr === 'overlayImage') { obj.type = 'hudImage'; }
    else if (typeStr === 'overlayEmbed') { obj.type = 'hudEmbed'; }

    if (obj.name && obj.name.includes('Overlay')) {
      obj.name = obj.name.replace(/Overlay/g, 'HUD');
    }

    obj.children = []; // Rebuild children deterministically
    updatedObjects[id] = obj;
  });

  // 2. Ensure imageTarget exists
  let imageTarget = Object.values(updatedObjects).find(o => o.type === 'imageTarget');
  if (!imageTarget) {
    const imageTargetId = uuidv4();
    imageTarget = {
      id: imageTargetId,
      name: 'AR Target',
      type: 'imageTarget',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: true,
      children: [],
      parentId: null,
      properties: { physicalWidth: 0.1 }
    };
    updatedObjects[imageTargetId] = imageTarget;
  }

  // 3. Ensure default hudCanvas exists if there are HUD elements
  const HUD_ELEMENT_TYPES = ['hudText', 'hudButton', 'hudImage', 'hudEmbed'];
  const hasHudElements = Object.values(updatedObjects).some(o => HUD_ELEMENT_TYPES.includes(o.type));
  let defaultHudCanvas = Object.values(updatedObjects).find(o => o.type === 'hudCanvas');

  if (hasHudElements && !defaultHudCanvas) {
    const canvasId = uuidv4();
    defaultHudCanvas = {
      id: canvasId,
      name: 'HUD Canvas',
      type: 'hudCanvas',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        layoutMode: 'column',
        layoutAlignItems: 'center',
        layoutJustifyContent: 'center',
        backgroundColor: '#1c1917',
        opacity: 0.85,
        layoutPadding: 16,
        layoutGap: 8,
        themeBorderRadius: 12,
        themeBlur: 4,
      }
    };
    updatedObjects[canvasId] = defaultHudCanvas;
  }

  // 4. Validate & assign parentId for all objects according to strict rules:
  // - imageTarget and hudCanvas MUST have parentId: null (placed at root)
  // - HUD elements MUST be parented by a hudCanvas
  // - All other objects MUST be children of active imageTarget (or a descendant of imageTarget)
  Object.keys(updatedObjects).forEach(id => {
    const obj = updatedObjects[id];

    if (obj.type === 'imageTarget' || obj.type === 'hudCanvas') {
      obj.parentId = null;
    } else if (HUD_ELEMENT_TYPES.includes(obj.type)) {
      const currentParent = obj.parentId ? updatedObjects[obj.parentId] : null;
      if (!currentParent || currentParent.type !== 'hudCanvas') {
        obj.parentId = defaultHudCanvas ? defaultHudCanvas.id : null;
      }
    } else {
      // Non-HUD / 3D element:
      // If obj.parentId is null, it is placed at the root in the world scene.
      // If obj.parentId is set but doesn't exist or is invalid (e.g. hudCanvas or self), fallback to imageTarget if present
      if (obj.parentId) {
        const currentParent = updatedObjects[obj.parentId];
        if (!currentParent || currentParent.type === 'hudCanvas' || currentParent.id === obj.id) {
          obj.parentId = imageTarget ? imageTarget.id : null;
        }
      }
    }
  });

  // 5. Rebuild children arrays & rootObjects array
  const updatedRootObjects: string[] = [];
  if (updatedObjects[imageTarget.id]) {
    updatedRootObjects.push(imageTarget.id);
  }

  Object.keys(updatedObjects).forEach(id => {
    const obj = updatedObjects[id];
    if (obj.parentId && updatedObjects[obj.parentId]) {
      updatedObjects[obj.parentId].children.push(id);
    } else {
      if (!updatedRootObjects.includes(id)) {
        updatedRootObjects.push(id);
      }
    }
  });

  return { objects: updatedObjects, rootObjects: updatedRootObjects };
};

const ensureImageTargetLocked = (objects: Record<string, SceneObject>) => {
  return normalizeSceneHierarchyAndLockImageTarget(objects).objects;
};


const correctAssetUrl = (url: string): string => {
  if (!url) return url;
  if (url.includes('mrdoob/three.js') && url.includes('Fox.glb')) {
    return 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb';
  }
  if (url.includes('glTF-Sample-Assets/main/Models/Fox') || url.includes('gltf/Fox')) {
    return 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb';
  }
  if (url.includes('glTF-Sample-Assets/main/Models/Sphere') || url.includes('gltf/Sphere')) {
    return 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb';
  }
  if (url.includes('glTF-Sample-Assets/main/Models/Suzanne') || url.includes('glTF-Sample-Models/main/2.0/Suzanne') || url.includes('gltf/Suzanne')) {
    return 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb';
  }
  if (url.includes('glTF-Sample-Assets/main/Models/StainedGlassLamp') || url.includes('glTF-Sample-Models/main/2.0/StainedGlassLamp') || url.includes('gltf/StainedGlassLamp')) {
    return 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoomBox/glTF-Binary/BoomBox.glb';
  }
  if (url.includes('glTF-Sample-Assets/main/Models/FlightHelmet') || url.includes('glTF-Sample-Models/main/2.0/FlightHelmet') || url.includes('gltf/FlightHelmet')) {
    return 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb';
  }
  if (url.includes('glTF-Sample-Assets/main/Models/Buggy') || url.includes('glTF-Sample-Models/main/2.0/Buggy') || url.includes('gltf/Buggy')) {
    return 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Box/glTF-Binary/Box.glb';
  }
  return url;
};

const sanitizeBlobUrls = (data: any): any => {
  if (!data) return data;
  if (typeof data === 'string') {
    if (data.startsWith('blob:')) return '';
    return correctAssetUrl(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeBlobUrls(item));
  }
  if (typeof data === 'object') {
    const copy = { ...data };
    for (const key in copy) {
      if (typeof copy[key] === 'string') {
        if (copy[key].startsWith('blob:')) {
          copy[key] = '';
        } else {
          copy[key] = correctAssetUrl(copy[key]);
        }
      } else if (typeof copy[key] === 'object') {
        copy[key] = sanitizeBlobUrls(copy[key]);
      }
    }
    return copy;
  }
  return data;
};

const loadSavedState = () => {
  try {
    // 1. Check if projects list exists
    let listSaved = localStorage.getItem(getStorageKey('ar_forge_project_list'));
    let projectsList = listSaved ? JSON.parse(listSaved) : [];
    
    // 2. If list is empty, let's see if we have an old single-project autosave to migrate
    const oldAutosave = localStorage.getItem(getStorageKey('ar_forge_autosave'));
    
    if (projectsList.length === 0) {
      if (oldAutosave) {
        try {
          const parsed = sanitizeBlobUrls(JSON.parse(oldAutosave));
          if (parsed && parsed.objects) {
            const defaultId = 'project-' + uuidv4();
            const defaultProjMetadata = {
              id: defaultId,
              name: parsed.settings?.projectName || 'My AR Experience',
              createdAt: Date.now() - 3600000,
              updatedAt: Date.now()
            };
            projectsList = [defaultProjMetadata];
            localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(projectsList));
            
            const defaultProjData = {
              id: defaultId,
              name: parsed.settings?.projectName || 'My AR Experience',
              objects: parsed.objects,
              rootObjects: parsed.rootObjects || [initialImageTargetId],
              settings: parsed.settings || { projectName: 'My AR Experience', imageTargetName: null },
              assets: parsed.assets || [],
              lastSavedTime: parsed.lastSavedTime || Date.now()
            };
            localStorage.setItem(getStorageKey(`ar_forge_project_${defaultId}`), JSON.stringify(defaultProjData));
          }
        } catch (e) {
          console.error('Migration failed:', e);
        }
      }
    }
    
    // 3. If list is STILL empty, initialize with default scene
    if (projectsList.length === 0) {
      const defaultId = 'project-' + uuidv4();
      const defaultProjMetadata = {
        id: defaultId,
        name: 'My AR Experience',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      projectsList = [defaultProjMetadata];
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(projectsList));
      
      const defaultProjData = {
        id: defaultId,
        name: 'My AR Experience',
        objects: defaultScene,
        rootObjects: [initialImageTargetId],
        settings: {
          projectName: 'My AR Experience',
          imageTargetName: null
        },
        assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
        lastSavedTime: Date.now()
      };
      localStorage.setItem(getStorageKey(`ar_forge_project_${defaultId}`), JSON.stringify(defaultProjData));
    }
    
    // 4. Determine current active project ID
    let activeId = localStorage.getItem(getStorageKey('ar_forge_active_project_id'));
    if (!activeId || !projectsList.some((p: any) => p.id === activeId)) {
      activeId = projectsList[0].id;
      localStorage.setItem(getStorageKey('ar_forge_active_project_id'), activeId);
    }
    
    // 5. Load current project data
    const activeProjDataStr = localStorage.getItem(getStorageKey(`ar_forge_project_${activeId}`));
    if (activeProjDataStr) {
      const activeProjData = sanitizeBlobUrls(JSON.parse(activeProjDataStr));
      let scenes = activeProjData.scenes;
      let activeSceneId = activeProjData.activeSceneId;
      if (!scenes || typeof scenes !== 'object' || Object.keys(scenes).length === 0) {
        activeSceneId = 'default';
        scenes = {
          'default': { id: 'default', name: 'Main Scene', objects: ensureImageTargetLocked(activeProjData.objects), rootObjects: activeProjData.rootObjects }
        };
      } else if (!activeSceneId || !scenes[activeSceneId]) {
        activeSceneId = Object.keys(scenes)[0];
      }

      const activeScene = scenes[activeSceneId];
      const currentObjects = activeScene ? ensureImageTargetLocked(activeScene.objects) : ensureImageTargetLocked(activeProjData.objects);
      const currentRootObjects = activeScene ? activeScene.rootObjects : activeProjData.rootObjects;

      scenes = {
        ...scenes,
        [activeSceneId]: {
          ...scenes[activeSceneId],
          objects: currentObjects,
          rootObjects: currentRootObjects
        }
      };

      return {
        currentProjectId: activeId,
        projectsList,
        scenes,
        activeSceneId,
        objects: currentObjects,
        rootObjects: currentRootObjects,
        settings: activeProjData.settings || { projectName: activeProjData.name || 'My AR Experience', imageTargetName: null },
        assets: activeProjData.assets || [],
        lastSavedTime: activeProjData.lastSavedTime || Date.now(),
        versions: loadVersionsForProject(activeId)
      };
    }
    
    // Fallback
    return {
      currentProjectId: projectsList[0].id,
      projectsList,
      objects: ensureImageTargetLocked(defaultScene),
      rootObjects: [initialImageTargetId],
      settings: { projectName: projectsList[0].name, imageTargetName: null },
      assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
      lastSavedTime: Date.now()
    };
  } catch (e) {
    console.error('Failed to initialize local multi-project system:', e);
    const fallbackId = 'project-default';
    return {
      currentProjectId: fallbackId,
      projectsList: [{ id: fallbackId, name: 'My AR Experience', createdAt: Date.now(), updatedAt: Date.now() }],
      objects: ensureImageTargetLocked(defaultScene),
      rootObjects: [initialImageTargetId],
      settings: { projectName: 'My AR Experience', imageTargetName: null },
      assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
      lastSavedTime: Date.now()
    };
  }
};

const savedData = loadSavedState();
if (savedData?.settings && savedData.settings.depthSensingEnabled === undefined) {
  savedData.settings.depthSensingEnabled = true;
}

const initialObjects = savedData.objects;
const initialRootObjects = savedData.rootObjects;
const initialSettings = savedData.settings;
const initialAssets = savedData.assets;
const initialLastSavedTime = savedData.lastSavedTime;
const initialCurrentProjectId = savedData.currentProjectId;
const initialProjectsList = savedData.projectsList;
const initialActiveSceneId = savedData.activeSceneId || 'default';
const initialScenes = savedData.scenes || {
  'default': { id: 'default', name: 'Main Scene', objects: initialObjects, rootObjects: initialRootObjects }
};

// Cooldown state for property update snapshots
let lastSnapshotTime = 0;
let lastEditedObjectId: string | null = null;

const createSnapshot = (state: any): HistorySnapshot => {
  return {
    objects: JSON.parse(JSON.stringify(state.objects)),
    rootObjects: [...state.rootObjects],
    selectedObjectId: state.selectedObjectId, selectedObjectIds: [...state.selectedObjectIds]
  };
};

const cloneObjectSubtree = (
  rootId: string,
  targetParentId: string | null,
  sourceObjects: Record<string, SceneObject>,
  newObjects: Record<string, SceneObject>,
  isRoot: boolean
): SceneObject | null => {
  const original = sourceObjects[rootId];
  if (!original) return null;

  const newId = uuidv4();
  const clonedProps = JSON.parse(JSON.stringify(original.properties));

  // Duplicated objects must preserve exact original transforms without unintended offsets
  const position = [...original.position] as [number, number, number];

  const clonedObj: SceneObject = {
    ...original,
    id: newId,
    name: isRoot 
      ? (original.name.endsWith(' (Copy)') ? original.name : `${original.name} (Copy)`)
      : original.name,
    position,
    rotation: [...original.rotation] as [number, number, number],
    scale: [...original.scale] as [number, number, number],
    parentId: targetParentId,
    children: [],
    properties: clonedProps
  };

  newObjects[newId] = clonedObj;

  original.children.forEach(childId => {
    const childClone = cloneObjectSubtree(childId, newId, sourceObjects, newObjects, false);
    if (childClone) {
      clonedObj.children.push(childClone.id);
    }
  });

  return clonedObj;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  objects: initialObjects,
  rootObjects: initialRootObjects,
  selectedObjectId: null, 
  selectedObjectIds: [],
  isMultiSelectMode: false,
  setMultiSelectMode: (enabled) => set({ isMultiSelectMode: enabled }),
  toggleMultiSelectMode: () => set((state) => ({ isMultiSelectMode: !state.isMultiSelectMode })),
  isBoxSelectToolActive: false,
  setBoxSelectToolActive: (enabled) => set({ isBoxSelectToolActive: enabled }),
  toggleBoxSelectTool: () => set((state) => ({ isBoxSelectToolActive: !state.isBoxSelectToolActive })),
  deleteSelection: () => set((state) => {
    const idsToDelete = state.selectedObjectIds.length > 0
      ? state.selectedObjectIds
      : (state.selectedObjectId ? [state.selectedObjectId] : []);

    if (idsToDelete.length === 0) return state;

    // Filter out image targets if deleting them would leave zero targets
    const remainingTargets = Object.values(state.objects).filter(o => o.type === 'imageTarget');
    const validIds = idsToDelete.filter(id => {
      const obj = state.objects[id];
      if (!obj) return false;
      if (obj.type === 'imageTarget' && remainingTargets.length <= 1) {
        return false;
      }
      return true;
    });

    if (validIds.length === 0) {
      state.addToast('Scene must contain at least one AR Target');
      return state;
    }

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) newPast = newPast.slice(1);

    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    const newObjects = { ...state.objects };

    // Get topmost selected IDs to avoid redundant recursive deletions
    const topIds = validIds.filter(id => {
      let curr = state.objects[id];
      if (!curr) return false;
      while (curr.parentId) {
        if (validIds.includes(curr.parentId)) return false;
        curr = state.objects[curr.parentId];
      }
      return true;
    });

    const removeRecursive = (targetId: string) => {
      const target = newObjects[targetId];
      if (target) {
        target.children.forEach(removeRecursive);
        delete newObjects[targetId];
      }
    };

    topIds.forEach(id => {
      const obj = newObjects[id];
      if (!obj) return;
      if (obj.parentId && newObjects[obj.parentId]) {
        newObjects[obj.parentId] = {
          ...newObjects[obj.parentId],
          children: newObjects[obj.parentId].children.filter(cId => cId !== id)
        };
      }
      removeRecursive(id);
    });

    const newRootObjects = state.rootObjects.filter(rId => !topIds.includes(rId));
    state.addToast(`Deleted ${topIds.length} object${topIds.length > 1 ? 's' : ''}`);

    return {
      objects: newObjects,
      rootObjects: newRootObjects,
      selectedObjectId: null,
      selectedObjectIds: [],
      selectedObjectRef: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true
    };
  }),
  lastSelectedTargetId: null,
  setLastSelectedTargetId: (id) => set({ lastSelectedTargetId: id }),
  selectedObjectRef: null,
  settings: initialSettings,
  transformMode: 'translate',
  transformSpace: 'world',
  transformGizmoEnabled: true,
  activeTransformAxis: null,
  setActiveTransformAxis: (axis) => set({ activeTransformAxis: axis }),
  lockedAxes: { x: false, y: false, z: false },
  toggleLockAxis: (axis) => set((state) => ({
    lockedAxes: { ...state.lockedAxes, [axis]: !state.lockedAxes[axis] }
  })),
  setLockAxis: (axis, locked) => set((state) => ({
    lockedAxes: { ...state.lockedAxes, [axis]: locked }
  })),
  unlockAllAxes: () => set({
    lockedAxes: { x: false, y: false, z: false }
  }),
  transformApplyMode: 'activeStateOnly',
  setTransformApplyMode: (mode) => set({ transformApplyMode: mode }),
  assets: initialAssets,
  copiedObjectData: null,
  isPreviewMode: false,
  liveInteractionsInDesign: false,
  setLiveInteractionsInDesign: (enabled: boolean) => set({ liveInteractionsInDesign: enabled }),
  toggleLiveInteractionsInDesign: () => set((state) => ({ liveInteractionsInDesign: !state.liveInteractionsInDesign })),
  isDraggableDragging: false,
  setIsDraggableDragging: (dragging: boolean) => set({ isDraggableDragging: dragging }),
  activeHotspotCard: null,
  setActiveHotspotCard: (card) => set({ activeHotspotCard: card }),
  lastSavedTime: initialLastSavedTime,
  hasUnsavedChanges: false,
  currentProjectId: initialCurrentProjectId,
  isProjectOpen: false,
  projectsList: initialProjectsList,
  versions: loadVersionsForProject(initialCurrentProjectId),
  openProject: (projectId: string) => {
    const proj = get().projectsList.find(p => p.id === projectId);
    const projName = proj?.name || 'Project';
    get().setGlobalLoading({
      active: true,
      title: 'Loading Project...',
      detail: `Opening "${projName}" and preparing spatial scene...`,
      progress: 25,
      type: 'project'
    });
    get().loadProject(projectId);
    set({ isProjectOpen: true });
    setTimeout(() => {
      get().setGlobalLoading({
        active: true,
        title: 'Finalizing Scene...',
        detail: 'Setting up viewport layers and shaders...',
        progress: 85,
        type: 'project'
      });
      setTimeout(() => {
        get().setGlobalLoading(null);
      }, 350);
    }, 200);
  },
  closeProject: () => set({ isProjectOpen: false }),

  activeSceneId: initialActiveSceneId,
  scenes: initialScenes,
  updateSceneCamera: (sceneId: string, position: [number, number, number], target: [number, number, number]) => set((state) => {
    const currentScene = state.scenes[sceneId];
    if (!currentScene) return state;

    if (
      currentScene.cameraPosition &&
      currentScene.cameraTarget &&
      Math.abs(currentScene.cameraPosition[0] - position[0]) < 0.005 &&
      Math.abs(currentScene.cameraPosition[1] - position[1]) < 0.005 &&
      Math.abs(currentScene.cameraPosition[2] - position[2]) < 0.005 &&
      Math.abs(currentScene.cameraTarget[0] - target[0]) < 0.005 &&
      Math.abs(currentScene.cameraTarget[1] - target[1]) < 0.005 &&
      Math.abs(currentScene.cameraTarget[2] - target[2]) < 0.005
    ) {
      return state;
    }

    const updatedScenes = {
      ...state.scenes,
      [sceneId]: {
        ...currentScene,
        cameraPosition: position,
        cameraTarget: target
      }
    };

    try {
      const storageKey = getStorageKey(`ar_forge_project_${state.currentProjectId}`);
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.scenes = updatedScenes;
        localStorage.setItem(storageKey, JSON.stringify(parsed));
      }
    } catch (e) {}

    return { scenes: updatedScenes };
  }),
  createScene: (name, trackingMode = 'image', targetMode = 'single', physicalWidth?: number) => set((state) => {
    const newSceneId = `scene_${Date.now()}`;
    const initialObjects = JSON.parse(JSON.stringify(defaultScene));

    // Update target object properties according to selected tracking mode
    Object.values(initialObjects).forEach((obj: any) => {
      if (obj.type === 'imageTarget') {
        obj.name = trackingMode === 'face' ? 'Face Target' : trackingMode === 'surface' ? 'Surface Target' : trackingMode === 'world' ? 'World Target' : 'Image Target';
        obj.properties = {
          ...obj.properties,
          targetType: trackingMode,
          physicalWidth: typeof physicalWidth === 'number' && physicalWidth > 0 ? physicalWidth : (obj.properties?.physicalWidth || 0.127)
        };
      }
    });

    const newScene = { id: newSceneId, name, objects: initialObjects, rootObjects: [initialImageTargetId], targetType: trackingMode };
    
    // Save current scene state before switching
    const currentScenes = { ...state.scenes };
    if (currentScenes[state.activeSceneId]) {
      currentScenes[state.activeSceneId] = {
        ...currentScenes[state.activeSceneId],
        objects: state.objects,
        rootObjects: state.rootObjects
      };
    }
    
    const updatedScenes = { ...currentScenes, [newSceneId]: newScene };
    const updatedSettings = { 
      ...state.settings, 
      trackingMode, 
      targetMode: trackingMode === 'image' ? targetMode : 'single' 
    };

    // Auto-persist scene updates directly to storage
    const projectData = {
      id: state.currentProjectId,
      name: state.settings.projectName,
      objects: newScene.objects,
      rootObjects: newScene.rootObjects,
      settings: updatedSettings,
      assets: state.assets,
      scenes: updatedScenes,
      activeSceneId: newSceneId,
      lastSavedTime: Date.now()
    };
    try {
      localStorage.setItem(getStorageKey(`ar_forge_project_${state.currentProjectId}`), JSON.stringify(projectData));
    } catch (e) {
      console.error('Failed to auto-save created scene:', e);
    }

    return {
      scenes: updatedScenes,
      settings: updatedSettings,
      activeSceneId: newSceneId,
      objects: newScene.objects,
      rootObjects: newScene.rootObjects,
      selectedObjectId: null,
      selectedObjectIds: [],
      isMultiSelectMode: false,
      past: [],
      future: [],
      lastSavedTime: Date.now(),
      hasUnsavedChanges: false
    };
  }),

  loadScene: (sceneId) => set((state) => {
    // Before switching, save current scene state
    const currentScenes = { ...state.scenes };
    if (currentScenes[state.activeSceneId]) {
      currentScenes[state.activeSceneId] = {
        ...currentScenes[state.activeSceneId],
        objects: state.objects,
        rootObjects: state.rootObjects
      };
    }
    const targetScene = currentScenes[sceneId];
    if (!targetScene) return state;

    const targetObjects = ensureImageTargetLocked(targetScene.objects);
    const sceneTargetObj = Object.values(targetObjects).find(o => o.type === 'imageTarget');
    const detectedTrackingMode = (sceneTargetObj?.properties?.targetType || targetScene.targetType || state.settings.trackingMode) as 'image' | 'face' | 'surface' | 'world';
    const updatedSettings = { ...state.settings, trackingMode: detectedTrackingMode };

    // Auto-persist scene updates directly to storage
    const projectData = {
      id: state.currentProjectId,
      name: state.settings.projectName,
      objects: targetObjects,
      rootObjects: targetScene.rootObjects,
      settings: updatedSettings,
      assets: state.assets,
      scenes: currentScenes,
      activeSceneId: sceneId,
      lastSavedTime: Date.now()
    };
    try {
      localStorage.setItem(getStorageKey(`ar_forge_project_${state.currentProjectId}`), JSON.stringify(projectData));
    } catch (e) {
      console.error('Failed to auto-save loaded scene:', e);
    }

    return {
      scenes: currentScenes,
      settings: updatedSettings,
      activeSceneId: sceneId,
      objects: targetObjects,
      rootObjects: targetScene.rootObjects,
      selectedObjectId: null,
      selectedObjectIds: [],
      past: [],
      future: [],
      lastSavedTime: Date.now(),
      hasUnsavedChanges: false
    };
  }),

  deleteScene: (sceneId) => set((state) => {
    if (Object.keys(state.scenes).length <= 1) return state; // Prevent deleting last scene
    const newScenes = { ...state.scenes };
    delete newScenes[sceneId];
    
    let activeSceneId = state.activeSceneId;
    let objects = state.objects;
    let rootObjects = state.rootObjects;

    // If we deleted the active scene, switch to the first available one
    if (state.activeSceneId === sceneId) {
      activeSceneId = Object.keys(newScenes)[0];
      const targetScene = newScenes[activeSceneId];
      objects = ensureImageTargetLocked(targetScene.objects);
      rootObjects = targetScene.rootObjects;
    }

    // Auto-persist scene updates directly to storage
    const projectData = {
      id: state.currentProjectId,
      name: state.settings.projectName,
      objects,
      rootObjects,
      settings: state.settings,
      assets: state.assets,
      scenes: newScenes,
      activeSceneId,
      lastSavedTime: Date.now()
    };
    try {
      localStorage.setItem(getStorageKey(`ar_forge_project_${state.currentProjectId}`), JSON.stringify(projectData));
    } catch (e) {
      console.error('Failed to auto-save deleted scene:', e);
    }

    return {
      scenes: newScenes,
      activeSceneId,
      objects,
      rootObjects,
      selectedObjectId: null,
      selectedObjectIds: [],
      lastSavedTime: Date.now(),
      hasUnsavedChanges: false
    };
  }),

  renameScene: (sceneId, newName) => set((state) => {
    if (!state.scenes[sceneId]) return state;
    const updatedScenes = {
      ...state.scenes,
      [sceneId]: {
        ...state.scenes[sceneId],
        name: newName
      }
    };

    // Auto-persist scene updates directly to storage
    const projectData = {
      id: state.currentProjectId,
      name: state.settings.projectName,
      objects: state.objects,
      rootObjects: state.rootObjects,
      settings: state.settings,
      assets: state.assets,
      scenes: updatedScenes,
      activeSceneId: state.activeSceneId,
      lastSavedTime: Date.now()
    };
    try {
      localStorage.setItem(getStorageKey(`ar_forge_project_${state.currentProjectId}`), JSON.stringify(projectData));
    } catch (e) {
      console.error('Failed to auto-save renamed scene:', e);
    }

    return {
      scenes: updatedScenes,
      lastSavedTime: Date.now(),
      hasUnsavedChanges: false
    };
  }),

  // Scene modal dialog management
  sceneModalState: { type: null },
  setSceneModalState: (sceneModalState) => set({ sceneModalState }),
  openCreateSceneModal: () => set((state) => {
    const existingScenes = Object.values(state.scenes || {});
    let nextIndex = existingScenes.length + 1;
    const existingNames = new Set(existingScenes.map((s: any) => s.name?.trim().toLowerCase()));
    while (existingNames.has(`scene ${nextIndex}`) || existingNames.has(`new scene ${nextIndex}`)) {
      nextIndex++;
    }
    const sequentialName = `Scene ${nextIndex}`;

    return {
      sceneModalState: {
        type: 'create',
        value: sequentialName,
        trackingMode: 'image',
        targetMode: 'single',
        physicalWidth: 0.127
      }
    };
  }),
  openRenameSceneModal: (sceneId: string, currentName: string) => set({
    sceneModalState: {
      type: 'rename',
      sceneId,
      value: currentName
    }
  }),
  openDeleteSceneModal: (sceneId: string) => set({
    sceneModalState: {
      type: 'delete',
      sceneId
    }
  }),
  closeSceneModal: () => set({
    sceneModalState: { type: null }
  }),

  // Mobile AR Live Test & QR Code modal management
  isQRCodeModalOpen: false,
  qrCodeModalProject: null,
  openQRCodeModal: (project) => set({
    isQRCodeModalOpen: true,
    qrCodeModalProject: project || null
  }),
  closeQRCodeModal: () => set({
    isQRCodeModalOpen: false,
    qrCodeModalProject: null
  }),

  // Active transform callout feedback
  activeTransformCallout: null,
  setActiveTransformCallout: (callout) => set({ activeTransformCallout: callout }),

  // Snapping defaults
  surfaceSnapEnabled: true,
  setSurfaceSnapEnabled: (enabled) => set({ surfaceSnapEnabled: enabled }),
  toggleSurfaceSnap: () => set((state) => ({ surfaceSnapEnabled: !state.surfaceSnapEnabled })),
  gridSnapEnabled: false,
  gridSnapIncrement: 0.1,
  rotationSnapEnabled: false,
  rotationSnapIncrement: 15,
  scaleSnapEnabled: true,
  scaleSnapIncrement: 0.1,
  scaleGridVisualEnabled: true,
  
  isAssetBrowserOpen: false,
  assetBrowserTab: 'templates',
  setIsAssetBrowserOpen: (open) => set({ isAssetBrowserOpen: open }),
  openAssetBrowser: (tab) => set((state) => ({ 
    isAssetBrowserOpen: true, 
    assetBrowserTab: tab || state.assetBrowserTab || 'templates' 
  })),
  replaceTargetObjectId: null,
  setReplaceTargetObjectId: (id) => set({ replaceTargetObjectId: id }),
  replaceObjectAsset: (targetObjectId, newAsset) => set((state) => {
    const obj = state.objects[targetObjectId];
    if (!obj) return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    // Preserve transforms & tree hierarchy strictly
    const preservedPosition = [...obj.position] as [number, number, number];
    const preservedRotation = [...obj.rotation] as [number, number, number];
    const preservedScale = [...obj.scale] as [number, number, number];
    const preservedParentId = obj.parentId;
    const preservedChildren = [...obj.children];
    const preservedPivot = obj.pivot ? ([...obj.pivot] as [number, number, number]) : undefined;
    const preservedLocked = obj.locked;
    const preservedVisible = obj.visible ?? true;

    // Preserve live behaviors & interactivity traits strictly
    const preservedBehavior = obj.properties?.behavior;
    const preservedSpinAxis = obj.properties?.spinAxis;
    const preservedBehaviorSpeed = obj.properties?.behaviorSpeed;
    const preservedBehaviorIntensity = obj.properties?.behaviorIntensity;
    const preservedVisualBehaviors = obj.properties?.visualBehaviors;
    const preservedFloatAnim = obj.properties?.floatAnim;
    const preservedRotationSpeed = obj.properties?.rotationSpeed;
    const preservedBillboard = obj.properties?.billboard;
    const preservedLookAtCamera = obj.properties?.lookAtCamera;
    const preservedSoundUrl = obj.properties?.soundUrl;
    const preservedSoundName = obj.properties?.soundName;
    const preservedClickSoundUrl = obj.properties?.clickSoundUrl;
    const preservedInteractivitySoundPreset = obj.properties?.interactivitySoundPreset;
    const preservedEvents = obj.events ? JSON.parse(JSON.stringify(obj.events)) : undefined;
    const preservedStates = obj.states ? JSON.parse(JSON.stringify(obj.states)) : undefined;

    let newType = (newAsset.type || obj.type) as any;
    let newProps: Record<string, any> = {};

    if (newAsset.type === 'model') {
      newType = 'model';
      newProps = {
        ...newProps,
        gltfUrl: newAsset.url || newAsset.properties?.gltfUrl || newAsset.properties?.url,
        modelUrl: newAsset.url || newAsset.properties?.modelUrl || newAsset.properties?.url,
        url: newAsset.url || newAsset.properties?.url,
      };
    } else if (newAsset.type === 'image') {
      newType = 'image';
      newProps = {
        ...newProps,
        textureUrl: newAsset.url || newAsset.textureUrl || newAsset.properties?.textureUrl,
        opacity: newProps.opacity ?? 1,
        doubleSided: newProps.doubleSided ?? true,
      };
    } else if (newAsset.type === 'video') {
      newType = 'video';
      newProps = {
        ...newProps,
        videoUrl: newAsset.url || newAsset.videoUrl || newAsset.properties?.videoUrl,
        playing: true,
        loop: true,
        muted: true,
      };
    } else if (newAsset.type === 'audio') {
      newType = 'audio';
      newProps = {
        ...newProps,
        soundUrl: newAsset.url || newAsset.soundUrl || newAsset.properties?.soundUrl,
        autoplay: true,
        playing: true,
        loop: true,
      };
    } else if (newAsset.type === 'icon') {
      newType = 'icon';
      newProps = {
        ...newProps,
        iconType: newAsset.iconType || newAsset.properties?.iconType,
        color: newAsset.properties?.color || newProps.color || '#3b82f6',
        secondaryColor: newAsset.properties?.secondaryColor || newProps.secondaryColor,
      };
    } else if (newAsset.type === 'icon2d') {
      newType = 'icon2d' as any;
      newProps = {
        ...newProps,
        iconName: newAsset.iconName || newAsset.properties?.iconName,
        badgeStyle: newAsset.properties?.badgeStyle || newProps.badgeStyle,
        color: newAsset.properties?.color || newProps.color || '#3b82f6',
      };
    } else if (newAsset.type === 'button') {
      newType = 'button';
      newProps = {
        ...newAsset.properties,
      };
    } else if (newAsset.properties) {
      if (newAsset.type) newType = newAsset.type as any;
      newProps = {
        ...newAsset.properties
      };
    } else {
      newProps = { ...obj.properties };
    }

    // Strictly inherit live behaviors and interactivity from the replaced object
    if (preservedBehavior !== undefined && preservedBehavior !== '') {
      newProps.behavior = preservedBehavior;
    }
    if (preservedSpinAxis !== undefined) {
      newProps.spinAxis = preservedSpinAxis;
    }
    if (preservedBehaviorSpeed !== undefined) {
      newProps.behaviorSpeed = preservedBehaviorSpeed;
    }
    if (preservedBehaviorIntensity !== undefined) {
      newProps.behaviorIntensity = preservedBehaviorIntensity;
    }
    if (preservedVisualBehaviors !== undefined) {
      newProps.visualBehaviors = preservedVisualBehaviors;
    }
    if (preservedFloatAnim !== undefined) {
      newProps.floatAnim = preservedFloatAnim;
    }
    if (preservedRotationSpeed !== undefined) {
      newProps.rotationSpeed = preservedRotationSpeed;
    }
    if (preservedBillboard !== undefined) {
      newProps.billboard = preservedBillboard;
    }
    if (preservedLookAtCamera !== undefined) {
      newProps.lookAtCamera = preservedLookAtCamera;
    }
    if (preservedSoundUrl !== undefined) {
      newProps.soundUrl = preservedSoundUrl;
    }
    if (preservedSoundName !== undefined) {
      newProps.soundName = preservedSoundName;
    }
    if (preservedClickSoundUrl !== undefined) {
      newProps.clickSoundUrl = preservedClickSoundUrl;
    }
    if (preservedInteractivitySoundPreset !== undefined) {
      newProps.interactivitySoundPreset = preservedInteractivitySoundPreset;
    }

    const updatedObj: SceneObject = {
      ...obj,
      name: newAsset.name || obj.name,
      type: newType,
      position: preservedPosition,
      rotation: preservedRotation,
      scale: preservedScale,
      pivot: preservedPivot,
      locked: preservedLocked,
      visible: preservedVisible,
      parentId: preservedParentId,
      children: preservedChildren,
      properties: newProps,
      events: preservedEvents !== undefined ? preservedEvents : obj.events,
      states: preservedStates !== undefined ? preservedStates : obj.states
    };

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    const behaviorNote = preservedBehavior ? ` with "${preservedBehavior}" behavior preserved` : '';

    return {
      objects: {
        ...state.objects,
        [targetObjectId]: updatedObj
      },
      replaceTargetObjectId: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Replaced object "${obj.name}" preserving transform${behaviorNote}!` }]
    };
  }),
  overlayGridEnabled: false,
  overlayGridSize: 50,
  hudDebugGridEnabled: false,

  // Camera & View modes
  cameraType: 'perspective',
  cameraOrbitLocked: false,
  wireframeEnabled: false,
  selectedModelWireframeEnabled: false,
  visualizationMode: 'standard',
  collisionDebuggerEnabled: false,

  // Vehicle Physics & Driving Simulation Initial State
  isDrivingActive: false,
  activeDrivingVehicleId: null,
  vehicleDrivingTelemetry: {
    speed: 0,
    rpm: 0,
    gear: 'P',
    isColliding: false,
    headlights: true,
    obstacleName: undefined
  },
  editorTheme: 'dark',
  
  // UI Optimizer & Device Viewport Resolution initial state
  targetDprScale: 'auto',
  shadowQualityPreset: 'med',
  uiDensityMode: 'balanced',
  deviceSimulationPreset: null,
  isUIOptimizerOpen: false,
  isOnboardingModalOpen: false,
  mobileMeshOptimizationEnabled: true,
  isShortcutsModalOpen: false,
  globalLoading: null,
  
  // History state
  past: [],
  future: [],

  addObject: (obj, parentId) => set((state) => {
    // Save snapshot of current state before mutation
    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    // Reset update cooldown
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    let newObjects = { ...state.objects };
    let newRootObjects = [...state.rootObjects];

    const targetObj = { ...obj };
    if (!targetObj.pivot) {
      targetObj.pivot = [0, 0, 0];
    }
    const isHUDChild = ['hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(targetObj.type);

    let resolvedParentId = parentId;

    if (isHUDChild) {
      // Force HUD child element to be nested in a hudCanvas
      const proposedParent = resolvedParentId ? newObjects[resolvedParentId] : null;
      if (proposedParent && proposedParent.type === 'hudCanvas') {
        // Correct parent specified.
      } else {
        // Proposed parent is not a hudCanvas. Find an existing one in the scene!
        const existingCanvas = Object.values(newObjects).find(o => o.type === 'hudCanvas');
        if (existingCanvas) {
          resolvedParentId = existingCanvas.id;
        } else {
          // No existing hudCanvas. Let's auto-create one!
          const canvasId = uuidv4();
          const newCanvas: SceneObject = {
            id: canvasId,
            name: 'HUD Canvas',
            type: 'hudCanvas',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            visible: true,
            children: [],
            parentId: null,
            properties: {
              layoutMode: 'column',
              layoutAlignItems: 'center',
              layoutJustifyContent: 'center',
              backgroundColor: '#1c1917',
              opacity: 0.85,
              layoutPadding: 16,
              layoutGap: 8,
              themeBorderRadius: 12,
              themeBlur: 4,
            }
          };
          newObjects[canvasId] = newCanvas;
          newRootObjects.push(canvasId);
          resolvedParentId = canvasId;
        }
      }
    } else if (targetObj.type !== 'imageTarget') {
      // For general 3D assets:
      // Priority 1: child of selected object (if valid 3D container/parent)
      // Priority 2: otherwise child of tracker
      // Priority 3: otherwise root in world scene (null)
      if (resolvedParentId === undefined) {
        if (state.selectedObjectId && newObjects[state.selectedObjectId]) {
          const selObj = newObjects[state.selectedObjectId];
          if (selObj.type !== 'hudCanvas' && !['hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(selObj.type)) {
            resolvedParentId = selObj.id;
          }
        }
        if (!resolvedParentId) {
          const activeTracker = (state.lastSelectedTargetId && newObjects[state.lastSelectedTargetId]?.type === 'imageTarget')
            ? state.lastSelectedTargetId
            : Object.values(newObjects).find(o => o.type === 'imageTarget')?.id;
          if (activeTracker) {
            resolvedParentId = activeTracker;
          } else {
            resolvedParentId = null; // Root in world scene
          }
        }
      }

      // Ensure new 3D object defaults to [0, 0, 0] so it snaps by bottom center to parent/scene origin
      if (!targetObj.position) {
        targetObj.position = [0, 0, 0];
      }

      // Check if parent target is a Face Target
      if (resolvedParentId && newObjects[resolvedParentId]) {
        const parentTarget = newObjects[resolvedParentId];
        const isFaceTarget = parentTarget.type === 'imageTarget' && 
          (parentTarget.properties?.targetType === 'face' || (state.settings.trackingMode === 'face' && parentTarget.properties?.targetType !== 'image'));
        const isSurfaceTarget = parentTarget.type === 'imageTarget' && 
          (parentTarget.properties?.targetType === 'surface' || (state.settings.trackingMode === 'surface' && parentTarget.properties?.targetType !== 'image'));

        if (isFaceTarget) {
          const faceAnchorMap: Record<string, [number, number, number]> = {
            head: [0, 0.2, 0.8],
            forehead: [0, 0.65, 0.75],
            nose: [0, -0.15, 0.9],
            chin: [0, -0.85, 0.6],
            leftEye: [-0.32, 0.25, 0.8],
            rightEye: [0.32, 0.25, 0.8],
            mouth: [0, -0.48, 0.8]
          };
          const activeAnchor = state.settings.faceAnchor || 'head';
          const offset = faceAnchorMap[activeAnchor] || faceAnchorMap.head;
          
          if (targetObj.position[0] === 0 && targetObj.position[1] === 0 && targetObj.position[2] === 0) {
            targetObj.position = [...offset];
          }
        } else if (isSurfaceTarget) {
          // App convention: All 3D assets are instantiated Z-up resting on the surface plane
          if (!targetObj.rotation) targetObj.rotation = [0, 0, 0];
          if (targetObj.position[0] === 0 && targetObj.position[1] === 0 && targetObj.position[2] === 0) {
            const zScale = (targetObj.scale && typeof targetObj.scale[2] === 'number') ? targetObj.scale[2] : 1.0;
            // For volumetric geometries and models, offset Z by half-height so base rests flush on surface plane (Z >= 0)
            if (['box', 'cylinder', 'cone', 'sphere', 'pyramid', 'prism', 'model'].includes(targetObj.type)) {
              targetObj.position = [0, 0, zScale / 2];
            } else {
              targetObj.position = [0, 0, 0.02];
            }
          }
        }
      }
    }

    // Insert target object
    if (targetObj.type === 'imageTarget' && (!targetObj.children || targetObj.children.length === 0)) {
      if (targetObj.properties?.targetType === 'surface') {
        const boxId = uuidv4();
        const surfaceBox: SceneObject = {
          id: boxId,
          name: 'Surface 3D Object',
          type: 'box',
          position: [0, 0, 0.5], // Instantiated Z-up resting on surface
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          visible: true,
          locked: false,
          children: [],
          parentId: targetObj.id,
          properties: {
            color: '#10b981',
            roughness: 0.3,
            metalness: 0.2
          }
        };
        targetObj.children = [boxId];
        newObjects[boxId] = surfaceBox;
      } else if (targetObj.properties?.targetType !== 'face') {
        const boxId = uuidv4();
        const defaultBox: SceneObject = {
          id: boxId,
          name: 'Default 3D Box',
          type: 'box',
          position: [0, 0, 0.833],
          rotation: [0, 0, 0],
          scale: [1.666, 1.666, 1.666],
          visible: true,
          locked: false,
          children: [],
          parentId: targetObj.id,
          properties: {
            color: '#6366f1',
            roughness: 0.3,
            metalness: 0.2
          }
        };
        targetObj.children = [boxId];
        newObjects[boxId] = defaultBox;
      }
    }

    if (targetObj.type === 'model') {
      targetObj.properties = {
        ...targetObj.properties,
        animationPlaying: false,
        autoplayAnimation: false,
      };
    }

    newObjects[targetObj.id] = targetObj;

    if (resolvedParentId && newObjects[resolvedParentId]) {
      newObjects[resolvedParentId] = {
        ...newObjects[resolvedParentId],
        children: [...newObjects[resolvedParentId].children, targetObj.id]
      };
      newObjects[targetObj.id].parentId = resolvedParentId;
    } else {
      newRootObjects.push(targetObj.id);
    }

    const normalized = normalizeSceneHierarchyAndLockImageTarget(newObjects, newRootObjects);

    return { 
      objects: normalized.objects, 
      rootObjects: normalized.rootObjects,
      selectedObjectId: targetObj.id,
      selectedObjectIds: [targetObj.id],
      past: newPast,
      future: [], // Clear redo stack on new action
      hasUnsavedChanges: true
    };
  }),

  clearScene: () => set((state) => {
    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }
    
    // Find imageTarget
    const imageTarget = Object.values(state.objects).find(o => o.type === 'imageTarget');
    if (!imageTarget) return state;

    const newImageTarget = { ...imageTarget, children: [] };
    const newObjects: Record<string, SceneObject> = {
      [imageTarget.id]: newImageTarget
    };

    return {
      objects: newObjects,
      rootObjects: [imageTarget.id],
      selectedObjectId: null,
      selectedObjectIds: [],
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      lastSelectedTargetId: imageTarget.id
    };
  }),

  removeObject: (id) => set((state) => {
    // Save snapshot of current state before mutation
    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    // Reset update cooldown
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    const newObjects = { ...state.objects };
    const objToRemove = newObjects[id];
    if (!objToRemove) return state;

    if (objToRemove.type === 'imageTarget') {
      const remainingTargets = Object.values(newObjects).filter(o => o.type === 'imageTarget');
      if (remainingTargets.length <= 1) {
        state.addToast('Scene must contain at least one AR Target');
        return state;
      }
    }

    // Remove from parent
    if (objToRemove.parentId && newObjects[objToRemove.parentId]) {
      newObjects[objToRemove.parentId] = {
        ...newObjects[objToRemove.parentId],
        children: newObjects[objToRemove.parentId].children.filter(childId => childId !== id)
      };
    }

    // Recursively remove children
    const removeRecursive = (targetId: string) => {
      const target = newObjects[targetId];
      if (target) {
        target.children.forEach(removeRecursive);
        delete newObjects[targetId];
      }
    };
    removeRecursive(id);
    
    const isSelectedDeleted = state.selectedObjectId && !newObjects[state.selectedObjectId];
    const remainingTargets = Object.values(newObjects).filter(o => o.type === 'imageTarget');
    const newLastSelectedTargetId = (state.lastSelectedTargetId && newObjects[state.lastSelectedTargetId])
      ? state.lastSelectedTargetId
      : (remainingTargets[0]?.id || null);

    // If an object is deleted, the parent object should be selected
    let autoSelectedId: string | null = null;
    if (objToRemove.parentId && newObjects[objToRemove.parentId]) {
      autoSelectedId = objToRemove.parentId;
    } else if (state.selectedObjectId && newObjects[state.selectedObjectId] && state.selectedObjectId !== id) {
      autoSelectedId = state.selectedObjectId;
    } else if (newLastSelectedTargetId && newObjects[newLastSelectedTargetId]) {
      autoSelectedId = newLastSelectedTargetId;
    }

    return {
      objects: newObjects,
      rootObjects: state.rootObjects.filter(rootId => rootId !== id),
      selectedObjectId: autoSelectedId,
      selectedObjectIds: autoSelectedId ? [autoSelectedId] : [],
      selectedObjectRef: autoSelectedId === state.selectedObjectId ? state.selectedObjectRef : null,
      lastSelectedTargetId: newLastSelectedTargetId,
      past: newPast,
      future: [], // Clear redo stack on new action
      hasUnsavedChanges: true
    };
  }),

  updateObject: (id, updates) => set((state) => {
    if (!state.objects[id]) return state;

    const now = Date.now();
    let newPast = state.past;

    // Save snapshot if:
    // - Editing a different object
    // - Cooldown elapsed (1.5s)
    if (id !== lastEditedObjectId || (now - lastSnapshotTime) > 1500) {
      const snapshot = createSnapshot(state);
      newPast = [...state.past, snapshot];
      if (newPast.length > 50) {
        newPast = newPast.slice(1);
      }
      lastEditedObjectId = id;
    }
    
    // Always update timestamp to roll the cooldown window
    lastSnapshotTime = now;

    const curActiveStateId = state.activeStateId;
    const applyMode = state.transformApplyMode ?? 'activeStateOnly';
    const hasTransformUpdate = 'position' in updates || 'rotation' in updates || 'scale' in updates;
    let finalObject = { ...state.objects[id] };

    if (hasTransformUpdate && curActiveStateId && curActiveStateId !== 'base') {
      if (applyMode === 'activeStateOnly') {
        if (finalObject.states && finalObject.states.some(st => st.id === curActiveStateId)) {
          finalObject.states = finalObject.states.map((st) => {
            if (st.id === curActiveStateId) {
              const updatedSt = { ...st };
              if ('position' in updates && updates.position !== undefined) updatedSt.position = updates.position;
              if ('rotation' in updates && updates.rotation !== undefined) updatedSt.rotation = updates.rotation;
              if ('scale' in updates && updates.scale !== undefined) updatedSt.scale = updates.scale;
              return updatedSt;
            }
            return st;
          });
        } else {
          if ('position' in updates && updates.position !== undefined) finalObject.position = updates.position;
          if ('rotation' in updates && updates.rotation !== undefined) finalObject.rotation = updates.rotation;
          if ('scale' in updates && updates.scale !== undefined) finalObject.scale = updates.scale;
        }
      } else {
        // applyMode === 'all': update base object AND all states
        if ('position' in updates && updates.position !== undefined) finalObject.position = updates.position;
        if ('rotation' in updates && updates.rotation !== undefined) finalObject.rotation = updates.rotation;
        if ('scale' in updates && updates.scale !== undefined) finalObject.scale = updates.scale;
        if (finalObject.states) {
          finalObject.states = finalObject.states.map((st) => {
            const updatedSt = { ...st };
            if ('position' in updates && updates.position !== undefined) updatedSt.position = updates.position;
            if ('rotation' in updates && updates.rotation !== undefined) updatedSt.rotation = updates.rotation;
            if ('scale' in updates && updates.scale !== undefined) updatedSt.scale = updates.scale;
            return updatedSt;
          });
        }
      }

      // Apply other updates that aren't transform properties to the base object
      const otherUpdates = { ...updates };
      delete otherUpdates.position;
      delete otherUpdates.rotation;
      delete otherUpdates.scale;
      finalObject = { ...finalObject, ...otherUpdates };
    } else {
      finalObject = { ...finalObject, ...updates };
    }

    DirtyNodeTracker.markDirty(id, hasTransformUpdate ? 'transform' : 'all');

    return {
      objects: {
        ...state.objects,
        [id]: finalObject
      },
      past: newPast,
      future: [], // Clear redo stack on new action
      hasUnsavedChanges: true
    };
  }),

  selectObject: (id, multi) => set((state) => {
    // Reset update cooldown on selection change so next update is a clean new snapshot
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    let newLastSelectedTargetId = state.lastSelectedTargetId;
    if (id && state.objects[id]) {
      let currObj: any = state.objects[id];
      while (currObj) {
        if (currObj.type === 'imageTarget') {
          newLastSelectedTargetId = currObj.id;
          break;
        }
        currObj = currObj.parentId ? state.objects[currObj.parentId] : null;
      }
    }

    if (multi && id) {
      const isAlreadySelected = state.selectedObjectIds.includes(id);
      let newSelectedIds = [...state.selectedObjectIds];
      
      if (isAlreadySelected) {
        newSelectedIds = newSelectedIds.filter(selectedId => selectedId !== id);
      } else {
        newSelectedIds.push(id);
      }
      
      return {
        selectedObjectId: newSelectedIds.length > 0 ? newSelectedIds[newSelectedIds.length - 1] : null,
        selectedObjectIds: newSelectedIds,
        selectedObjectRef: null,
        lastSelectedTargetId: newLastSelectedTargetId,
        isMultiSelectMode: newSelectedIds.length > 0
      };
    }

    return { 
      selectedObjectId: id,
      selectedObjectIds: id ? [id] : [],
      selectedObjectRef: state.selectedObjectId === id ? state.selectedObjectRef : null,
      activeStateId: state.selectedObjectId === id ? state.activeStateId : null,
      lastSelectedTargetId: newLastSelectedTargetId,
      isMultiSelectMode: false
    };
  }),

  selectObjects: (ids) => set((state) => {
    return {
      selectedObjectId: ids.length > 0 ? ids[ids.length - 1] : null,
      selectedObjectIds: ids,
      selectedObjectRef: null
    };
  }),

  groupSelection: () => set((state) => {
    const selectedIds = state.selectedObjectIds;
    if (selectedIds.length === 0) return state;

    // Filter to only include top-most selected objects
    const topSelectedIds = selectedIds.filter(id => {
      let current = state.objects[id];
      if (!current) return false;
      while (current.parentId) {
        if (selectedIds.includes(current.parentId)) {
          return false;
        }
        current = state.objects[current.parentId];
      }
      return true;
    });

    if (topSelectedIds.length === 0) return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    // Check if the selection consists of 2D overlays
    const is2DSelection = topSelectedIds.every(id => {
      const o = state.objects[id];
      return o && ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(o.type);
    });

    const groupId = uuidv4();
    let groupObj: SceneObject;
    const newObjects = { ...state.objects };

    const firstParentId = state.objects[topSelectedIds[0]]?.parentId || null;
    const allShareSameParent = topSelectedIds.every(id => state.objects[id]?.parentId === firstParentId);
    const groupParentId = allShareSameParent ? firstParentId : null;

    if (is2DSelection) {
      // 2D Layout Grouping
      let minLeft = Infinity;
      let minTop = Infinity;
      let maxRight = -Infinity;
      let maxBottom = -Infinity;

      topSelectedIds.forEach(id => {
        const child = state.objects[id];
        if (child) {
          const cl = child.properties?.left !== undefined ? child.properties.left : 20;
          const ct = child.properties?.top !== undefined ? child.properties.top : 20;
          const cw = child.properties?.width !== undefined ? child.properties.width : (child.type === 'hudImage' ? 200 : (child.type === 'hudEmbed' ? 400 : 150));
          const ch = child.properties?.height !== undefined ? child.properties.height : (child.type === 'hudImage' ? 200 : (child.type === 'hudEmbed' ? 300 : 40));

          if (cl < minLeft) minLeft = cl;
          if (ct < minTop) minTop = ct;
          if (cl + cw > maxRight) maxRight = cl + cw;
          if (ct + ch > maxBottom) maxBottom = ct + ch;
        }
      });

      if (minLeft === Infinity) {
        minLeft = 20;
        minTop = 20;
        maxRight = 170;
        maxBottom = 60;
      }

      const groupW = maxRight - minLeft;
      const groupH = maxBottom - minTop;

      groupObj = {
        id: groupId,
        name: "HUD Canvas",
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [...topSelectedIds],
        parentId: groupParentId,
        properties: {
          backgroundColor: '#000000',
          opacity: 0.0, // Transparent container acting as folder
          alignment: 'center',
          width: 100,
          height: 100,
          widthType: '%',
          heightType: '%',
          layoutMode: 'column',
          layoutPadding: 16,
          layoutGap: 8,
          layoutAlignItems: 'center',
          layoutJustifyContent: 'center',
          layoutWrap: 'nowrap'
        }
      };

      newObjects[groupId] = groupObj;

      topSelectedIds.forEach(id => {
        const child = newObjects[id];
        if (child) {
          newObjects[id] = {
            ...child,
            parentId: groupId,
            properties: {
              ...child.properties
            }
          };
        }
      });
    } else {
      // Standard 3D Grouping
      let sumX = 0, sumY = 0, sumZ = 0;
      let count = 0;
      topSelectedIds.forEach(id => {
        const obj = state.objects[id];
        if (obj) {
          sumX += obj.position[0];
          sumY += obj.position[1];
          sumZ += obj.position[2];
          count++;
        }
      });

      const centerX = count > 0 ? sumX / count : 0;
      const centerY = count > 0 ? sumY / count : 0;
      const centerZ = count > 0 ? sumZ / count : 0;

      groupObj = {
        id: groupId,
        name: "Grouped Objects",
        type: 'group',
        position: [centerX, centerY, centerZ],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [...topSelectedIds],
        parentId: groupParentId,
        properties: {}
      };

      newObjects[groupId] = groupObj;

      topSelectedIds.forEach(id => {
        const child = newObjects[id];
        if (child) {
          newObjects[id] = {
            ...child,
            parentId: groupId,
            position: [
              child.position[0] - centerX,
              child.position[1] - centerY,
              child.position[2] - centerZ
            ]
          };
        }
      });
    }

    let newRootObjects = [...state.rootObjects];
    if (groupParentId && newObjects[groupParentId]) {
      const parent = newObjects[groupParentId];
      newObjects[groupParentId] = {
        ...parent,
        children: [
          ...parent.children.filter(childId => !topSelectedIds.includes(childId)),
          groupId
        ]
      };
    } else {
      newRootObjects = [
        ...newRootObjects.filter(id => !topSelectedIds.includes(id)),
        groupId
      ];
    }

    if (!allShareSameParent) {
      topSelectedIds.forEach(id => {
        const child = state.objects[id];
        if (child && child.parentId && newObjects[child.parentId]) {
          const oldParent = newObjects[child.parentId];
          newObjects[child.parentId] = {
            ...oldParent,
            children: oldParent.children.filter(cId => cId !== id)
          };
        }
      });
    }

    return {
      objects: newObjects,
      rootObjects: newRootObjects,
      selectedObjectId: groupId,
      selectedObjectIds: [groupId],
      selectedObjectRef: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true
    };
  }),

  ungroupObject: (groupId) => set((state) => {
    const groupObj = state.objects[groupId];
    if (!groupObj || (groupObj.type !== 'group' && groupObj.type !== 'hudCanvas')) return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    const newObjects = { ...state.objects };
    const childIds = [...groupObj.children];
    const parentId = groupObj.parentId;
    const is2DUngroup = groupObj.type === 'hudCanvas';

    delete newObjects[groupId];

    childIds.forEach(childId => {
      const child = newObjects[childId];
      if (child) {
        if (is2DUngroup) {
          newObjects[childId] = {
            ...child,
            parentId: parentId,
            properties: {
              ...child.properties
            }
          };
        } else {
          newObjects[childId] = {
            ...child,
            parentId: parentId,
            position: [
              child.position[0] + groupObj.position[0],
              child.position[1] + groupObj.position[1],
              child.position[2] + groupObj.position[2]
            ]
          };
        }
      }
    });

    let newRootObjects = [...state.rootObjects];
    if (parentId && newObjects[parentId]) {
      const parent = newObjects[parentId];
      newObjects[parentId] = {
        ...parent,
        children: [
          ...parent.children.filter(id => id !== groupId),
          ...childIds
        ]
      };
    } else {
      newRootObjects = [
        ...newRootObjects.filter(id => id !== groupId),
        ...childIds
      ];
    }

    return {
      objects: newObjects,
      rootObjects: newRootObjects,
      selectedObjectId: childIds.length > 0 ? childIds[childIds.length - 1] : null,
      selectedObjectIds: childIds,
      selectedObjectRef: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true
    };
  }),

  ungroupSelection: () => set((state) => {
    const selectedIds = state.selectedObjectIds.length > 0 ? state.selectedObjectIds : (state.selectedObjectId ? [state.selectedObjectId] : []);
    if (selectedIds.length === 0) return state;

    const groupIdsToUngroup = new Set<string>();
    selectedIds.forEach(id => {
      const obj = state.objects[id];
      if (!obj) return;
      if (obj.type === 'group' || obj.type === 'hudCanvas') {
        groupIdsToUngroup.add(id);
      } else if (obj.parentId) {
        const parent = state.objects[obj.parentId];
        if (parent && (parent.type === 'group' || parent.type === 'hudCanvas')) {
          groupIdsToUngroup.add(parent.id);
        }
      }
    });

    if (groupIdsToUngroup.size === 0) {
      return {
        ...state,
        toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: 'No group selected to ungroup' }]
      };
    }

    let curState: any = state;
    groupIdsToUngroup.forEach(groupId => {
      const groupObj = curState.objects[groupId];
      if (!groupObj || (groupObj.type !== 'group' && groupObj.type !== 'hudCanvas')) return;

      const snapshot = createSnapshot(curState);
      let newPast = [...curState.past, snapshot];
      if (newPast.length > 50) newPast = newPast.slice(1);

      const newObjects = { ...curState.objects };
      const childIds = [...groupObj.children];
      const parentId = groupObj.parentId;
      const is2DUngroup = groupObj.type === 'hudCanvas';

      delete newObjects[groupId];

      childIds.forEach(childId => {
        const child = newObjects[childId];
        if (child) {
          if (is2DUngroup) {
            newObjects[childId] = {
              ...child,
              parentId: parentId,
              properties: { ...child.properties }
            };
          } else {
            newObjects[childId] = {
              ...child,
              parentId: parentId,
              position: [
                child.position[0] + groupObj.position[0],
                child.position[1] + groupObj.position[1],
                child.position[2] + groupObj.position[2]
              ]
            };
          }
        }
      });

      let newRootObjects = [...curState.rootObjects];
      if (parentId && newObjects[parentId]) {
        const parent = newObjects[parentId];
        newObjects[parentId] = {
          ...parent,
          children: [
            ...parent.children.filter((id: string) => id !== groupId),
            ...childIds
          ]
        };
      } else {
        newRootObjects = [
          ...newRootObjects.filter((id: string) => id !== groupId),
          ...childIds
        ];
      }

      curState = {
        ...curState,
        objects: newObjects,
        rootObjects: newRootObjects,
        selectedObjectId: childIds.length > 0 ? childIds[childIds.length - 1] : null,
        selectedObjectIds: childIds,
        selectedObjectRef: null,
        past: newPast,
        future: [],
        hasUnsavedChanges: true
      };
    });

    return {
      ...curState,
      toasts: [...curState.toasts, { id: `toast-${Date.now()}`, message: `Ungrouped ${groupIdsToUngroup.size} group(s)` }]
    };
  }),

  optimizeAllSceneMeshesForMobile: () => {
    let result = { count: 0, drawCallsSaved: 0, memorySavedMb: 0 };
    set((state) => {
      const objectList = Object.values(state.objects);
      const meshObjects = objectList.filter(o => 
        o.type === 'model' || ['box', 'sphere', 'cylinder', 'cone', 'torus', 'knot', 'plane', 'pyramid', 'capsule', 'dodecahedron', 'octahedron', 'icosahedron'].includes(o.type)
      );

      if (meshObjects.length === 0) {
        return {
          ...state,
          toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: 'No 3D asset meshes found in the scene to optimize' }]
        };
      }

      const snapshot = createSnapshot(state);
      let newPast = [...state.past, snapshot];
      if (newPast.length > 50) newPast = newPast.slice(1);

      const newObjects = { ...state.objects };
      let count = 0;

      meshObjects.forEach(obj => {
        newObjects[obj.id] = {
          ...obj,
          properties: {
            ...obj.properties,
            mobileOptimized: true,
            maxTextureSize: 1024,
            mediumpPrecision: true,
            frustumCulled: true,
            shadowOptimization: true,
            compressedBuffers: true,
            lodDistanceBias: 1.2
          }
        };
        count++;
      });

      const memorySaved = Math.round(count * 8.5);
      const drawCallsSaved = Math.max(1, Math.round(count * 1.5));
      result = { count, drawCallsSaved, memorySavedMb: memorySaved };

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trigger-mesh-optimization-for-mobile', {
          detail: { maxTextureSize: 1024, mediump: true, frustumCull: true }
        }));
      }

      return {
        ...state,
        objects: newObjects,
        past: newPast,
        future: [],
        hasUnsavedChanges: true,
        mobileMeshOptimizationEnabled: true,
        toasts: [...state.toasts, { 
          id: `toast-${Date.now()}`, 
          message: `⚡ Mobile 3D Optimization: Optimized ${count} mesh(es), clamped textures to 1024 POT, enabled frustum culling & saved ~${memorySaved}MB VRAM!` 
        }]
      };
    });
    return result;
  },

  batchConsolidateSceneForMobile: () => {
    let result = { 
      consolidatedMaterials: 0, 
      optimizedMeshes: 0, 
      prunedObjects: 0, 
      memorySavedMb: 0, 
      drawCallsSaved: 0 
    };

    set((state) => {
      const objectList = Object.values(state.objects);
      const snapshot = createSnapshot(state);
      let newPast = [...state.past, snapshot];
      if (newPast.length > 50) newPast = newPast.slice(1);

      const newObjects: Record<string, SceneObject> = { ...state.objects };
      let consolidatedMats = 0;
      let optMeshes = 0;
      let pruned = 0;

      // 1. Redundant Material Grouping & Pooling
      const materialGroups: Record<string, string[]> = {};
      objectList.forEach(obj => {
        if (['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane', 'pyramid', 'capsule', 'dodecahedron', 'octahedron', 'icosahedron', 'knot', 'tube', 'prism', 'helix', 'model'].includes(obj.type)) {
          const props = obj.properties || {};
          const key = `${props.color || '#cccccc'}_${props.roughness ?? 0.5}_${props.metalness ?? 0.0}_${props.map || props.textureUrl || 'nomap'}_${props.wireframe || false}_${props.opacity ?? 1.0}`;
          if (!materialGroups[key]) {
            materialGroups[key] = [];
          }
          materialGroups[key].push(obj.id);
        }
      });

      Object.entries(materialGroups).forEach(([key, ids]) => {
        if (ids.length > 1) {
          const poolId = `mat_pool_${Math.abs(key.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`;
          ids.forEach((id, idx) => {
            const current = newObjects[id];
            if (current) {
              newObjects[id] = {
                ...current,
                properties: {
                  ...current.properties,
                  materialPooled: true,
                  pooledMaterialKey: poolId,
                  materialInstanceIndex: idx,
                  sharedMaterialHostId: ids[0]
                }
              };
              if (idx > 0) consolidatedMats++;
            }
          });
        }
      });

      // 2. High-Poly Mesh Decimation & Optimization
      objectList.forEach(obj => {
        const props = obj.properties || {};
        const isHighPolyPrimitive = ['knot', 'torus', 'sphere', 'tube', 'helix', 'star', 'dome'].includes(obj.type);
        const isDenseCustom = (props.radialSegments && props.radialSegments > 32) || (props.tubularSegments && props.tubularSegments > 48) || (props.segments && props.segments > 32);

        if (obj.type === 'model' || isHighPolyPrimitive || isDenseCustom) {
          const updatedProps: Record<string, any> = {
            ...props,
            mobileOptimized: true,
            frustumCulled: true,
            mediumpPrecision: true,
            maxTextureSize: 1024,
            lodDistanceBias: 1.25,
            shadowOptimization: true,
            compressedBuffers: true
          };

          if (isHighPolyPrimitive || isDenseCustom) {
            if (props.radialSegments && props.radialSegments > 24) updatedProps.radialSegments = 16;
            if (props.tubularSegments && props.tubularSegments > 32) updatedProps.tubularSegments = 32;
            if (props.segments && props.segments > 24) updatedProps.segments = 16;
            if (props.p && props.p > 3) updatedProps.p = 2;
            if (props.q && props.q > 5) updatedProps.q = 3;
            updatedProps.detailLevel = 'mobile-optimized';
          }

          newObjects[obj.id] = {
            ...newObjects[obj.id],
            properties: updatedProps
          };
          optMeshes++;
        }

        // 3. Invisible / Unused High-Poly nodes optimization
        if (obj.visible === false && (obj.type === 'model' || isHighPolyPrimitive)) {
          newObjects[obj.id] = {
            ...newObjects[obj.id],
            properties: {
              ...newObjects[obj.id].properties,
              culledFromGPU: true,
              skipShadowPass: true,
              skipMatrixUpdate: true
            }
          };
          pruned++;
        }
      });

      const memorySaved = Math.round(optMeshes * 6.5 + consolidatedMats * 4.2 + pruned * 8.0);
      const drawCallsSaved = Math.max(1, Math.round(consolidatedMats * 1.5 + optMeshes * 0.8));

      result = {
        consolidatedMaterials: consolidatedMats,
        optimizedMeshes: optMeshes,
        prunedObjects: pruned,
        memorySavedMb: memorySaved,
        drawCallsSaved: drawCallsSaved
      };

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trigger-mesh-optimization-for-mobile', {
          detail: { maxTextureSize: 1024, mediump: true, frustumCull: true, materialPooling: true }
        }));
      }

      return {
        ...state,
        objects: newObjects,
        past: newPast,
        future: [],
        hasUnsavedChanges: true,
        mobileMeshOptimizationEnabled: true,
        toasts: [...state.toasts, {
          id: `toast-${Date.now()}`,
          message: `🚀 One-Click Mobile Consolidation: Consolidated ${consolidatedMats} redundant material(s), optimized ${optMeshes} mesh(es), pruned ${pruned} hidden node(s), and reduced ~${drawCallsSaved} GPU draw call batches!`
        }]
      };
    });

    return result;
  },

  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates },
    hasUnsavedChanges: true
  })),

  setTransformMode: (mode) => set({ transformMode: mode }),
  setTransformSpace: (space) => set({ transformSpace: space }),
  setTransformGizmoEnabled: (enabled) => set({ transformGizmoEnabled: enabled }),

  moveObject: (draggedId, targetId) => set((state) => {
    const newObjects = { ...state.objects };
    const draggedObj = newObjects[draggedId];

    if (!draggedObj) return state;

    if (targetId === 'root') {
      if (!draggedObj.parentId) return state; // Already at root

      // Save snapshot before mutating hierarchy
      const snapshot = createSnapshot(state);
      let newPast = [...state.past, snapshot];
      if (newPast.length > 50) {
        newPast = newPast.slice(1);
      }

      // Reset update cooldown
      lastEditedObjectId = null;
      lastSnapshotTime = 0;

      // Remove from old parent
      if (draggedObj.parentId && newObjects[draggedObj.parentId]) {
        newObjects[draggedObj.parentId] = {
          ...newObjects[draggedObj.parentId],
          children: newObjects[draggedObj.parentId].children.filter(id => id !== draggedId)
        };
      }

      const newRootObjects = [...state.rootObjects];
      if (!newRootObjects.includes(draggedId)) {
        newRootObjects.push(draggedId);
      }

      const isDragged2D = ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed', 'youtube'].includes(draggedObj.type);

      let newPosition = [...draggedObj.position];
      let newRotation = [...draggedObj.rotation];
      let newScale = [...draggedObj.scale];

      if (!isDragged2D) {
        const draggedWorldMatrix = computeWorldMatrix(draggedId, state.objects);
        const newParentWorldMatrix = new THREE.Matrix4().identity();
        const newLocalMatrix = newParentWorldMatrix.clone().invert().multiply(draggedWorldMatrix);
        
        const p = new THREE.Vector3();
        const q = new THREE.Quaternion();
        const s = new THREE.Vector3();
        newLocalMatrix.decompose(p, q, s);
        const euler = new THREE.Euler().setFromQuaternion(q);
        
        newPosition = [p.x, p.y, p.z];
        newRotation = [euler.x, euler.y, euler.z];
        newScale = [s.x, s.y, s.z];
      }

      newObjects[draggedId] = {
        ...draggedObj,
        parentId: null,
        position: newPosition as [number, number, number],
        rotation: newRotation as [number, number, number],
        scale: newScale as [number, number, number],
      };

      return {
        objects: newObjects,
        rootObjects: newRootObjects,
        past: newPast,
        future: [],
        hasUnsavedChanges: true
      };
    }

    const targetObj = newObjects[targetId];
    if (!targetObj) return state;
    if (draggedId === targetId) return state;

    const isDragged2D = ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed', 'youtube'].includes(draggedObj.type);
    const isTarget2D = ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed', 'youtube'].includes(targetObj.type);

    if (isDragged2D && isTarget2D) {
      // Prevent cyclic drops
      let currentCheck = targetObj;
      while (currentCheck.parentId) {
        if (currentCheck.parentId === draggedId) return state;
        currentCheck = newObjects[currentCheck.parentId];
      }

      // Create history snapshot
      const snapshot = createSnapshot(state);
      let newPast = [...state.past, snapshot];
      if (newPast.length > 50) {
        newPast = newPast.slice(1);
      }

      // Reset update cooldown
      lastEditedObjectId = null;
      lastSnapshotTime = 0;

      // Remove from old parent children list
      if (draggedObj.parentId && newObjects[draggedObj.parentId]) {
        newObjects[draggedObj.parentId] = {
          ...newObjects[draggedObj.parentId],
          children: newObjects[draggedObj.parentId].children.filter(id => id !== draggedId)
        };
      }

      let newRootObjects = [...state.rootObjects];
      if (!draggedObj.parentId) {
        newRootObjects = newRootObjects.filter(id => id !== draggedId);
      }

      let resolvedParentId: string | null = null;

      if (targetObj.type === 'hudCanvas') {
        // Parent inside the target canvas!
        resolvedParentId = targetId;
        const targetChildren = [...targetObj.children];
        if (!targetChildren.includes(draggedId)) {
          targetChildren.push(draggedId);
        }
        newObjects[targetId] = {
          ...targetObj,
          children: targetChildren
        };
      } else {
        // Sibling placement next to the target element!
        resolvedParentId = targetObj.parentId;
        if (resolvedParentId && newObjects[resolvedParentId]) {
          const parentChildren = [...newObjects[resolvedParentId].children];
          const targetIdx = parentChildren.indexOf(targetId);
          if (targetIdx !== -1) {
            parentChildren.splice(targetIdx, 0, draggedId);
          } else {
            parentChildren.push(draggedId);
          }
          newObjects[resolvedParentId] = {
            ...newObjects[resolvedParentId],
            children: parentChildren
          };
        } else {
          // If target is at root
          const targetIdx = newRootObjects.indexOf(targetId);
          if (targetIdx !== -1) {
            newRootObjects.splice(targetIdx, 0, draggedId);
          } else {
            newRootObjects.push(draggedId);
          }
        }
      }

      // Update dragged object parent
      newObjects[draggedId] = {
        ...draggedObj,
        parentId: resolvedParentId
      };

      // Re-assign z-indexes of all 2D siblings under the resolved parent/root to maintain top-down layering
      const siblings = resolvedParentId ? newObjects[resolvedParentId].children : newRootObjects;
      const overlaySiblings = siblings.filter(id => {
        const o = newObjects[id];
        return o && ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(o.type);
      });

      overlaySiblings.forEach((childId, idx) => {
        const child = newObjects[childId];
        if (child) {
          // Topmost visual items get highest z-index
          const newZ = (overlaySiblings.length - idx) * 10;
          newObjects[childId] = {
            ...child,
            properties: {
              ...child.properties,
              zIndex: newZ
            }
          };
        }
      });

      return {
        objects: newObjects,
        rootObjects: newRootObjects,
        past: newPast,
        future: [],
        hasUnsavedChanges: true
      };
    }

    // Prevent cyclic drops
    let current = targetObj;
    while (current.parentId) {
      if (current.parentId === draggedId) return state;
      current = newObjects[current.parentId];
    }

    // Save snapshot before mutating hierarchy
    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    // Reset update cooldown
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    // Remove from old parent
    if (draggedObj.parentId && newObjects[draggedObj.parentId]) {
      newObjects[draggedObj.parentId] = {
        ...newObjects[draggedObj.parentId],
        children: newObjects[draggedObj.parentId].children.filter(id => id !== draggedId)
      };
    }

    let newRootObjects = [...state.rootObjects];
    if (!draggedObj.parentId) {
       newRootObjects = newRootObjects.filter(id => id !== draggedId);
    }

    // Add to new parent
    if (!newObjects[targetId].children.includes(draggedId)) {
      newObjects[targetId] = {
        ...newObjects[targetId],
        children: [...newObjects[targetId].children, draggedId]
      };
    }

    let newPosition = [...draggedObj.position];
    let newRotation = [...draggedObj.rotation];
    let newScale = [...draggedObj.scale];

    if (!isDragged2D) {
      const draggedWorldMatrix = computeWorldMatrix(draggedId, state.objects);
      const newParentWorldMatrix = computeWorldMatrix(targetId, state.objects);
      const newLocalMatrix = newParentWorldMatrix.clone().invert().multiply(draggedWorldMatrix);
      
      const p = new THREE.Vector3();
      const q = new THREE.Quaternion();
      const s = new THREE.Vector3();
      newLocalMatrix.decompose(p, q, s);
      const euler = new THREE.Euler().setFromQuaternion(q);
      
      newPosition = [p.x, p.y, p.z];
      newRotation = [euler.x, euler.y, euler.z];
      newScale = [s.x, s.y, s.z];
    }

    newObjects[draggedId] = {
      ...newObjects[draggedId],
      parentId: targetId,
      position: newPosition as [number, number, number],
      rotation: newRotation as [number, number, number],
      scale: newScale as [number, number, number],
    };

    return { 
      objects: newObjects, 
      rootObjects: newRootObjects,
      past: newPast,
      future: [], // Clear redo stack
      hasUnsavedChanges: true
    };
  }),

  duplicateObject: (id) => set((state) => {
    const original = state.objects[id];
    if (!original || original.type === 'imageTarget') return state;

    // Create history snapshot
    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    const newObjects = { ...state.objects };
    let newRootObjects = [...state.rootObjects];

    // Clone the subtree
    const rootClone = cloneObjectSubtree(id, original.parentId, state.objects, newObjects, true);
    if (!rootClone) return state;

    // Insert into parent or root objects list next to original
    if (original.parentId && newObjects[original.parentId]) {
      const parent = newObjects[original.parentId];
      const index = parent.children.indexOf(id);
      const newChildren = [...parent.children];
      if (index !== -1) {
        newChildren.splice(index + 1, 0, rootClone.id);
      } else {
        newChildren.push(rootClone.id);
      }
      newObjects[original.parentId] = {
        ...parent,
        children: newChildren
      };
    } else {
      const index = newRootObjects.indexOf(id);
      if (index !== -1) {
        newRootObjects.splice(index + 1, 0, rootClone.id);
      } else {
        newRootObjects.push(rootClone.id);
      }
    }

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      objects: newObjects,
      rootObjects: newRootObjects,
      selectedObjectId: rootClone.id,
      selectedObjectRef: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Duplicated "${original.name}"` }]
    };
  }),

  duplicateSelection: () => set((state) => {
    const idsToDuplicate = state.selectedObjectIds.length > 0 
      ? state.selectedObjectIds 
      : (state.selectedObjectId ? [state.selectedObjectId] : []);

    const validIds = idsToDuplicate.filter(id => {
      const obj = state.objects[id];
      return obj && obj.type !== 'imageTarget';
    });

    if (validIds.length === 0) return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    const newObjects = { ...state.objects };
    let newRootObjects = [...state.rootObjects];
    const newSelectedIds: string[] = [];

    const topIds = validIds.filter(id => {
      let current = state.objects[id];
      if (!current) return false;
      while (current.parentId) {
        if (validIds.includes(current.parentId)) {
          return false;
        }
        current = state.objects[current.parentId];
      }
      return true;
    });

    topIds.forEach(id => {
      const original = state.objects[id];
      if (!original) return;

      const rootClone = cloneObjectSubtree(id, original.parentId, state.objects, newObjects, true);
      if (rootClone) {
        newSelectedIds.push(rootClone.id);

        if (original.parentId && newObjects[original.parentId]) {
          const parent = newObjects[original.parentId];
          const index = parent.children.indexOf(id);
          const newChildren = [...parent.children];
          if (index !== -1) {
            newChildren.splice(index + 1, 0, rootClone.id);
          } else {
            newChildren.push(rootClone.id);
          }
          newObjects[original.parentId] = {
            ...parent,
            children: newChildren
          };
        } else {
          const index = newRootObjects.indexOf(id);
          if (index !== -1) {
            newRootObjects.splice(index + 1, 0, rootClone.id);
          } else {
            newRootObjects.push(rootClone.id);
          }
        }
      }
    });

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      objects: newObjects,
      rootObjects: newRootObjects,
      selectedObjectId: newSelectedIds[newSelectedIds.length - 1] || null,
      selectedObjectIds: newSelectedIds,
      selectedObjectRef: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Duplicated selection (${topIds.length} items)` }]
    };
  }),

  alignSelectedObjects: (axis, type) => set((state) => {
    const ids = state.selectedObjectIds.length > 0 
      ? state.selectedObjectIds 
      : (state.selectedObjectId ? [state.selectedObjectId] : []);

    const targetObjects = ids.map(id => state.objects[id]).filter(Boolean);
    if (targetObjects.length === 0) return state;

    const is2D = targetObjects.every(obj => 
      ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(obj.type)
    );

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    const newObjects = { ...state.objects };

    if (is2D) {
      const getWidth = (obj: SceneObject) => {
        return obj.properties?.width !== undefined 
          ? obj.properties.width 
          : (obj.type === 'hudImage' ? 200 : (obj.type === 'hudEmbed' ? 400 : 150));
      };
      const getHeight = (obj: SceneObject) => {
        return obj.properties?.height !== undefined 
          ? obj.properties.height 
          : (obj.type === 'hudImage' ? 200 : (obj.type === 'hudEmbed' ? 300 : 40));
      };
      const getLeft = (obj: SceneObject) => obj.properties?.left !== undefined ? obj.properties.left : 20;
      const getTop = (obj: SceneObject) => obj.properties?.top !== undefined ? obj.properties.top : 20;

      if (ids.length > 1) {
        let minLeft = Infinity;
        let minTop = Infinity;
        let maxRight = -Infinity;
        let maxBottom = -Infinity;

        targetObjects.forEach(obj => {
          const l = getLeft(obj);
          const t = getTop(obj);
          const w = getWidth(obj);
          const h = getHeight(obj);

          if (l < minLeft) minLeft = l;
          if (t < minTop) minTop = t;
          if (l + w > maxRight) maxRight = l + w;
          if (t + h > maxBottom) maxBottom = t + h;
        });

        const centerLeft = (minLeft + maxRight) / 2;
        const centerTop = (minTop + maxBottom) / 2;

        targetObjects.forEach(obj => {
          const props = { ...obj.properties };
          if (axis === 'x') {
            if (type === 'min') {
              props.left = minLeft;
            } else if (type === 'center') {
              props.left = centerLeft - getWidth(obj) / 2;
            } else if (type === 'max') {
              props.left = maxRight - getWidth(obj);
            }
          } else if (axis === 'y') {
            if (type === 'min') {
              props.top = minTop;
            } else if (type === 'center') {
              props.top = centerTop - getHeight(obj) / 2;
            } else if (type === 'max') {
              props.top = maxBottom - getHeight(obj);
            }
          }
          newObjects[obj.id] = {
            ...obj,
            properties: props
          };
        });
      } else {
        const obj = targetObjects[0];
        const parentId = obj.parentId;
        const parent = parentId ? state.objects[parentId] : null;
        const pW = parent && parent.properties?.width !== undefined ? parent.properties.width : 1000;
        const pH = parent && parent.properties?.height !== undefined ? parent.properties.height : 1000;

        const props = { ...obj.properties };
        if (axis === 'x') {
          if (type === 'min') {
            props.left = 0;
          } else if (type === 'center') {
            props.left = (pW - getWidth(obj)) / 2;
          } else if (type === 'max') {
            props.left = pW - getWidth(obj);
          }
        } else if (axis === 'y') {
          if (type === 'min') {
            props.top = 0;
          } else if (type === 'center') {
            props.top = (pH - getHeight(obj)) / 2;
          } else if (type === 'max') {
            props.top = pH - getHeight(obj);
          }
        }
        newObjects[obj.id] = {
          ...obj,
          properties: props
        };
      }
    } else {
      const axisIdx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;

      if (ids.length > 1) {
        let minVal = Infinity;
        let maxVal = -Infinity;

        targetObjects.forEach(obj => {
          const val = obj.position[axisIdx];
          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
        });

        const centerVal = (minVal + maxVal) / 2;

        targetObjects.forEach(obj => {
          const newPos = [...obj.position] as [number, number, number];
          if (type === 'min') {
            newPos[axisIdx] = minVal;
          } else if (type === 'center') {
            newPos[axisIdx] = centerVal;
          } else if (type === 'max') {
            newPos[axisIdx] = maxVal;
          }
          newObjects[obj.id] = {
            ...obj,
            position: newPos
          };
          DirtyNodeTracker.markDirty(obj.id, 'transform');
        });
      } else {
        const obj = targetObjects[0];
        const newPos = [...obj.position] as [number, number, number];
        newPos[axisIdx] = 0;
        newObjects[obj.id] = {
          ...obj,
          position: newPos
        };
        DirtyNodeTracker.markDirty(obj.id, 'transform');
      }
    }

    const toastLabel = `${axis === 'x' ? 'Horizontal' : axis === 'y' ? 'Vertical' : 'Depth'} Align: ${type.toUpperCase()}`;

    return {
      objects: newObjects,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: toastLabel }]
    };
  }),

  distributeSelectedObjects: (axis) => set((state) => {
    const ids = state.selectedObjectIds;
    if (ids.length < 3) return state;

    const targetObjects = ids.map(id => state.objects[id]).filter(Boolean);
    const is2D = targetObjects.every(obj => 
      ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(obj.type)
    );

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    const newObjects = { ...state.objects };

    if (is2D) {
      const getLeft = (obj: SceneObject) => obj.properties?.left !== undefined ? obj.properties.left : 20;
      const getTop = (obj: SceneObject) => obj.properties?.top !== undefined ? obj.properties.top : 20;

      if (axis === 'x') {
        const sorted = [...targetObjects].sort((a, b) => getLeft(a) - getLeft(b));
        const firstLeft = getLeft(sorted[0]);
        const lastLeft = getLeft(sorted[sorted.length - 1]);
        const totalDistance = lastLeft - firstLeft;
        const step = totalDistance / (sorted.length - 1);

        sorted.forEach((obj, idx) => {
          newObjects[obj.id] = {
            ...obj,
            properties: {
              ...obj.properties,
              left: Math.round(firstLeft + idx * step)
            }
          };
          DirtyNodeTracker.markDirty(obj.id, 'transform');
        });
      } else if (axis === 'y') {
        const sorted = [...targetObjects].sort((a, b) => getTop(a) - getTop(b));
        const firstTop = getTop(sorted[0]);
        const lastTop = getTop(sorted[sorted.length - 1]);
        const totalDistance = lastTop - firstTop;
        const step = totalDistance / (sorted.length - 1);

        sorted.forEach((obj, idx) => {
          newObjects[obj.id] = {
            ...obj,
            properties: {
              ...obj.properties,
              top: Math.round(firstTop + idx * step)
            }
          };
          DirtyNodeTracker.markDirty(obj.id, 'transform');
        });
      }
    } else {
      const axisIdx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
      const sorted = [...targetObjects].sort((a, b) => a.position[axisIdx] - b.position[axisIdx]);
      const firstVal = sorted[0].position[axisIdx];
      const lastVal = sorted[sorted.length - 1].position[axisIdx];
      const totalDistance = lastVal - firstVal;
      const step = totalDistance / (sorted.length - 1);

      sorted.forEach((obj, idx) => {
        const newPos = [...obj.position] as [number, number, number];
        newPos[axisIdx] = firstVal + idx * step;
        newObjects[obj.id] = {
          ...obj,
          position: newPos
        };
        DirtyNodeTracker.markDirty(obj.id, 'transform');
      });
    }

    return {
      objects: newObjects,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: `Distribute evenly along ${axis.toUpperCase()} axis` }]
    };
  }),

  centerGroupPivot: (groupId) => set((state) => {
    const groupObj = state.objects[groupId];
    if (!groupObj || groupObj.type !== 'group' || groupObj.children.length === 0) return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    const newObjects = { ...state.objects };

    let sumX = 0, sumY = 0, sumZ = 0;
    let validChildrenCount = 0;

    groupObj.children.forEach(childId => {
      const child = state.objects[childId];
      if (child) {
        sumX += child.position[0];
        sumY += child.position[1];
        sumZ += child.position[2];
        validChildrenCount++;
      }
    });

    if (validChildrenCount === 0) return state;

    const avgX = sumX / validChildrenCount;
    const avgY = sumY / validChildrenCount;
    const avgZ = sumZ / validChildrenCount;

    if (Math.abs(avgX) < 0.0001 && Math.abs(avgY) < 0.0001 && Math.abs(avgZ) < 0.0001) return state;

    const newGroupPos = [
      groupObj.position[0] + avgX,
      groupObj.position[1] + avgY,
      groupObj.position[2] + avgZ
    ] as [number, number, number];

    newObjects[groupId] = {
      ...groupObj,
      position: newGroupPos
    };

    groupObj.children.forEach(childId => {
      const child = state.objects[childId];
      if (child) {
        newObjects[childId] = {
          ...child,
          position: [
            child.position[0] - avgX,
            child.position[1] - avgY,
            child.position[2] - avgZ
          ] as [number, number, number]
        };
      }
    });

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      objects: newObjects,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Centered Pivot of "${groupObj.name}"` }]
    };
  }),

  copyObject: (id) => set((state) => {
    const original = state.objects[id];
    if (!original || original.type === 'imageTarget') return state;

    // Collect all descendants of the object
    const copiedObjects: Record<string, SceneObject> = {};
    const collectDescendants = (targetId: string) => {
      const obj = state.objects[targetId];
      if (obj) {
        copiedObjects[targetId] = JSON.parse(JSON.stringify(obj));
        obj.children.forEach(collectDescendants);
      }
    };
    collectDescendants(id);

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      copiedObjectData: {
        rootId: id,
        objects: copiedObjects
      },
      toasts: [...state.toasts, { id: toastId, message: `Copied "${original.name}" to clipboard` }]
    };
  }),

  pasteObject: () => set((state) => {
    if (!state.copiedObjectData) {
      const toastId = Math.random().toString(36).substring(2, 9);
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
      }, 3000);
      return {
        toasts: [...state.toasts, { id: toastId, message: 'Clipboard is empty' }]
      };
    }

    const { rootId, objects: copiedObjects } = state.copiedObjectData;
    const originalRoot = copiedObjects[rootId];
    if (!originalRoot) return state;

    // Create history snapshot
    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    const newObjects = { ...state.objects };
    let newRootObjects = [...state.rootObjects];

    // Determine target parent ID
    const selectedId = state.selectedObjectId;
    let targetParentId: string | null = null;
    if (selectedId) {
      const selObj = state.objects[selectedId];
      if (selObj) {
        if (selObj.type === 'group' || selObj.type === 'imageTarget') {
          targetParentId = selectedId;
        } else {
          targetParentId = selObj.parentId;
        }
      }
    } else {
      const imageTarget = Object.values(state.objects).find(o => o.type === 'imageTarget');
      if (imageTarget) {
        targetParentId = imageTarget.id;
      }
    }

    // Clone subtree
    const rootClone = cloneObjectSubtree(rootId, targetParentId, copiedObjects, newObjects, true);
    if (!rootClone) return state;

    // Insert into hierarchy
    if (targetParentId && newObjects[targetParentId]) {
      const parentObj = newObjects[targetParentId];
      if (selectedId && selectedId !== targetParentId && parentObj.children.includes(selectedId)) {
        const index = parentObj.children.indexOf(selectedId);
        const newChildren = [...parentObj.children];
        newChildren.splice(index + 1, 0, rootClone.id);
        newObjects[targetParentId] = {
          ...parentObj,
          children: newChildren
        };
      } else {
        newObjects[targetParentId] = {
          ...parentObj,
          children: [...parentObj.children, rootClone.id]
        };
      }
    } else {
      if (selectedId && newRootObjects.includes(selectedId)) {
        const index = newRootObjects.indexOf(selectedId);
        newRootObjects.splice(index + 1, 0, rootClone.id);
      } else {
        newRootObjects.push(rootClone.id);
      }
    }

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      objects: newObjects,
      rootObjects: newRootObjects,
      selectedObjectId: rootClone.id,
      selectedObjectRef: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Pasted "${originalRoot.name}"` }]
    };
  }),

  addAsset: (asset) => set((state) => ({
    assets: [...state.assets, asset],
    hasUnsavedChanges: true
  })),

  removeAsset: (id) => set((state) => ({
    assets: state.assets.filter(a => a.id !== id),
    hasUnsavedChanges: true
  })),

  updateAsset: (id, name) => set((state) => ({
    assets: state.assets.map(a => a.id === id ? { ...a, name } : a),
    hasUnsavedChanges: true
  })),
  previewSnapshotObjects: null,
  setPreviewMode: (preview) => set((state) => {
    if (preview) {
      // Snapshot current design state objects so preview animations or actions never corrupt design transforms
      return {
        isPreviewMode: true,
        previewSnapshotObjects: JSON.parse(JSON.stringify(state.objects))
      };
    } else {
      // Exiting preview mode: restore design view objects snapshot and reset runtime transitions/states
      return {
        isPreviewMode: false,
        objects: state.previewSnapshotObjects ? state.previewSnapshotObjects : state.objects,
        previewSnapshotObjects: null,
        activeTransitions: {},
        activeStateId: null
      };
    }
  }),
  
  // Script & behavior implementation
  activeStateId: null,
  setActiveStateId: (id) => set({ activeStateId: id }),
  copiedStates: null,

  copyObjectStates: (objectId) => set((state) => {
    const obj = state.objects[objectId];
    if (!obj || !obj.states || obj.states.length === 0) {
      const toastId = Math.random().toString(36).substring(2, 9);
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
      }, 3000);
      return {
        toasts: [...state.toasts, { id: toastId, message: `No custom states found on "${obj?.name || 'object'}"` }]
      };
    }

    const copied = JSON.parse(JSON.stringify(obj.states)) as StateData[];
    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      copiedStates: copied,
      toasts: [...state.toasts, { id: toastId, message: `Copied ${copied.length} state configuration(s) from "${obj.name}"` }]
    };
  }),

  copySingleState: (stateData) => set((state) => {
    const copied = [JSON.parse(JSON.stringify(stateData))] as StateData[];
    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      copiedStates: copied,
      toasts: [...state.toasts, { id: toastId, message: `Copied state "${stateData.name}"` }]
    };
  }),

  pasteObjectStates: (targetObjectId) => set((state) => {
    const target = state.objects[targetObjectId];
    if (!target || !state.copiedStates || state.copiedStates.length === 0) {
      const toastId = Math.random().toString(36).substring(2, 9);
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
      }, 3000);
      return {
        toasts: [...state.toasts, { id: toastId, message: 'No copied states available to paste' }]
      };
    }

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    const existingStates = target.states || [];
    const newStatesToAppend = state.copiedStates.map((s, idx) => {
      let name = s.name;
      const count = existingStates.filter(ex => ex.name.toLowerCase().startsWith(name.toLowerCase())).length;
      if (count > 0) {
        name = `${s.name} ${count + 1}`;
      }

      return {
        ...JSON.parse(JSON.stringify(s)),
        id: `state_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        name
      };
    });

    const updatedStates = [...existingStates, ...newStatesToAppend];
    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      objects: {
        ...state.objects,
        [targetObjectId]: {
          ...target,
          states: updatedStates
        }
      },
      activeStateId: newStatesToAppend[0]?.id || state.activeStateId,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Pasted ${newStatesToAppend.length} state configuration(s) to "${target.name}"` }]
    };
  }),
  editingScriptObjectId: null,
  toasts: [],
  arVideoPlaying: null,
  activeTransitions: {},
  
  setEditingScriptObjectId: (id) => set({ editingScriptObjectId: id }),
  addToast: (message) => set((state) => {
    const id = Math.random().toString(36).substring(2, 9);
    // Auto remove after 4 seconds
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
    return { toasts: [...state.toasts, { id, message }] };
  }),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
  setARVideoPlaying: (video) => set({ arVideoPlaying: video }),
  
  triggerStateTransition: (objectId, targetStateId, duration, easing) => set((state) => {
    const obj = state.objects[objectId];
    if (!obj) return state;

    let updatedObj = { ...obj };
    if (targetStateId && targetStateId !== 'base' && obj.states) {
      const targetState = obj.states.find(s => s.id === targetStateId);
      if (targetState && targetState.properties) {
        updatedObj.properties = { ...obj.properties, ...targetState.properties };
      }
    }

    return {
      objects: {
        ...state.objects,
        [objectId]: updatedObj
      },
      activeTransitions: {
        ...state.activeTransitions,
        [objectId]: {
          targetStateId,
          duration,
          easing,
          triggerTime: performance.now() / 1000,
          fromPos: obj.position,
          fromRot: obj.rotation,
          fromScl: obj.scale
        }
      }
    };
  }),

  undo: () => set((state) => {
    if (state.past.length === 0) return state;

    // Reset update cooldown
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);

    // Save current state into future stack
    const currentSnapshot = createSnapshot(state);
    const newFuture = [currentSnapshot, ...state.future];

    return {
      objects: previous.objects,
      rootObjects: previous.rootObjects,
      selectedObjectId: previous.selectedObjectId,
      selectedObjectIds: previous.selectedObjectIds,
      selectedObjectRef: state.selectedObjectId === previous.selectedObjectId ? state.selectedObjectRef : null,
      past: newPast,
      future: newFuture,
      hasUnsavedChanges: true
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state;

    // Reset update cooldown
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    // Save current state into past stack
    const currentSnapshot = createSnapshot(state);
    const newPast = [...state.past, currentSnapshot];

    return {
      objects: next.objects,
      rootObjects: next.rootObjects,
      selectedObjectId: next.selectedObjectId,
      selectedObjectIds: next.selectedObjectIds,
      selectedObjectRef: state.selectedObjectId === next.selectedObjectId ? state.selectedObjectRef : null,
      past: newPast,
      future: newFuture,
      hasUnsavedChanges: true
    };
  }),

  loadProject: (projectId) => set((state) => {
    try {
      // Save current project state before switching
      if (state.currentProjectId) {
        const currentScenes = { ...state.scenes };
        if (currentScenes[state.activeSceneId]) {
          currentScenes[state.activeSceneId] = {
            ...currentScenes[state.activeSceneId],
            objects: state.objects,
            rootObjects: state.rootObjects
          };
        }
        const currentData = {
          id: state.currentProjectId,
          name: state.settings.projectName,
          objects: state.objects,
          rootObjects: state.rootObjects,
          settings: state.settings,
          assets: state.assets,
          scenes: currentScenes,
          activeSceneId: state.activeSceneId,
          lastSavedTime: Date.now()
        };
        try {
          localStorage.setItem(getStorageKey(`ar_forge_project_${state.currentProjectId}`), JSON.stringify(currentData));
        } catch (e) {
          console.error('Failed to save previous project before switching:', e);
        }
      }

      const savedDataStr = localStorage.getItem(getStorageKey(`ar_forge_project_${projectId}`));
      if (!savedDataStr) return state;

      const parsed = sanitizeBlobUrls(JSON.parse(savedDataStr));
      localStorage.setItem(getStorageKey('ar_forge_active_project_id'), projectId);

      let scenes = parsed.scenes;
      let activeSceneId = parsed.activeSceneId;

      if (!scenes || typeof scenes !== 'object' || Object.keys(scenes).length === 0) {
        activeSceneId = 'default';
        scenes = {
          'default': { id: 'default', name: 'Main Scene', objects: ensureImageTargetLocked(parsed.objects), rootObjects: parsed.rootObjects }
        };
      } else if (!activeSceneId || !scenes[activeSceneId]) {
        activeSceneId = Object.keys(scenes)[0];
      }

      const activeScene = scenes[activeSceneId];
      const objects = activeScene ? ensureImageTargetLocked(activeScene.objects) : ensureImageTargetLocked(parsed.objects);
      const rootObjects = activeScene ? activeScene.rootObjects : parsed.rootObjects;

      scenes = {
        ...scenes,
        [activeSceneId]: {
          ...scenes[activeSceneId],
          objects,
          rootObjects
        }
      };

      return {
        currentProjectId: projectId,
        isProjectOpen: true,
        objects,
        rootObjects,
        scenes,
        activeSceneId,
        settings: parsed.settings || { projectName: parsed.name || 'Untitled Project', imageTargetName: null },
        assets: parsed.assets || [],
        selectedObjectId: null, selectedObjectIds: [],
        selectedObjectRef: null,
        past: [],
        future: [],
        lastSavedTime: parsed.lastSavedTime || Date.now(),
        hasUnsavedChanges: false,
        versions: loadVersionsForProject(projectId)
      };
    } catch (e) {
      console.error('Failed to load project:', e);
      return state;
    }
  }),

  createProject: (name, templateType, customTemplateData?, trackingOptions?) => {
    const newId = 'project-' + uuidv4();
    let objects: Record<string, SceneObject> = {};
    let rootObjects: string[] = [];
    let customSettings: any = null;
    let customAssets: any[] = [];

    const trackingMode = trackingOptions?.trackingMode || (typeof trackingOptions === 'string' ? undefined : undefined) || 'image';
    const targetMode = trackingOptions?.targetMode || (typeof trackingOptions === 'string' ? trackingOptions : 'single');

    if (customTemplateData && customTemplateData.objects) {
      objects = JSON.parse(JSON.stringify(customTemplateData.objects));
      rootObjects = JSON.parse(JSON.stringify(customTemplateData.rootObjects || []));
      if (customTemplateData.settings) customSettings = JSON.parse(JSON.stringify(customTemplateData.settings));
      if (customTemplateData.assets) customAssets = JSON.parse(JSON.stringify(customTemplateData.assets));
    } else {
      // Check if templateType matches a custom template in localStorage
      try {
        const storedCustomTemplates = localStorage.getItem('ar_forge_custom_templates');
        if (storedCustomTemplates) {
          const list = JSON.parse(storedCustomTemplates);
          const matched = list.find((t: any) => t.id === templateType);
          if (matched && matched.objects) {
            objects = JSON.parse(JSON.stringify(matched.objects));
            rootObjects = JSON.parse(JSON.stringify(matched.rootObjects || []));
            if (matched.settings) customSettings = JSON.parse(JSON.stringify(matched.settings));
            if (matched.assets) customAssets = JSON.parse(JSON.stringify(matched.assets));
          }
        }
      } catch (e) {
        console.error('Failed to read custom template from localStorage:', e);
      }

      // If still empty, generate built-in template
      if (Object.keys(objects).length === 0) {
        const generated = generateTemplate(name, templateType as TemplateType);
        objects = generated.objects;
        rootObjects = generated.rootObjects;
      }
    }

    // Configure root target type if trackingMode is specified
    if (trackingMode === 'face') {
      Object.values(objects).forEach((obj) => {
        if (obj.type === 'imageTarget') {
          obj.name = 'Face Target';
          obj.properties = {
            ...obj.properties,
            targetType: 'face'
          };
        }
      });
    } else if (trackingMode === 'image') {
      Object.values(objects).forEach((obj) => {
        if (obj.type === 'imageTarget') {
          if (!obj.properties?.targetType || obj.properties.targetType === 'face') {
            obj.name = 'AR Target';
            obj.properties = {
              ...obj.properties,
              targetType: 'image'
            };
          }
        }
      });
    }

    const initialPhysicalWidth = (trackingOptions as any)?.physicalWidth;
    if (typeof initialPhysicalWidth === 'number' && initialPhysicalWidth > 0) {
      Object.values(objects).forEach((obj) => {
        if (obj.type === 'imageTarget') {
          obj.properties = {
            ...obj.properties,
            physicalWidth: initialPhysicalWidth
          };
        }
      });
    }

    const metadata = {
      id: newId,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    let updatedList = [];
    set((state) => {
      updatedList = [metadata, ...state.projectsList];
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      const mergedSettings = {
        projectName: name,
        imageTargetName: null,
        trackingMode,
        targetMode,
        ...(customSettings || {})
      };

      const defaultAudioAssets: Asset[] = [
        // Built-in Audio Library
        { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
        { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
        { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
        { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
        { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
        { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
        { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
        { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
        { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
        { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
        { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
        { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
        { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
        { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
        { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
        { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
        { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
        { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
        { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
        { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
        { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
        { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
        { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
        { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
        { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
        { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
        { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
        { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
        { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
        { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
        { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
      ];

      const mergedAssets = [...defaultAudioAssets];
      if (customAssets && Array.isArray(customAssets)) {
        customAssets.forEach((ca) => {
          if (!mergedAssets.some((a) => a.id === ca.id)) {
            mergedAssets.push(ca);
          }
        });
      }

      const projectData = {
        id: newId,
        name,
        objects,
        rootObjects,
        settings: mergedSettings,
        assets: mergedAssets,
        scenes: {
          'default': { id: 'default', name: 'Main Scene', objects, rootObjects }
        },
        activeSceneId: 'default',
        lastSavedTime: Date.now()
      };
      localStorage.setItem(getStorageKey(`ar_forge_project_${newId}`), JSON.stringify(projectData));
      localStorage.setItem(getStorageKey('ar_forge_active_project_id'), newId);

      return {
        currentProjectId: newId,
        isProjectOpen: true,
        projectsList: updatedList,
        objects,
        rootObjects,
        scenes: projectData.scenes,
        activeSceneId: projectData.activeSceneId,
        settings: mergedSettings,
        assets: mergedAssets,
        selectedObjectId: null, selectedObjectIds: [],
        selectedObjectRef: null,
        past: [],
        future: [],
        lastSavedTime: Date.now(),
        hasUnsavedChanges: false
      };
    });

    return newId;
  },

  deleteProject: (projectId) => set((state) => {
    try {
      localStorage.removeItem(getStorageKey(`ar_forge_project_${projectId}`));
      const updatedList = state.projectsList.filter((p) => p.id !== projectId);
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      // Delete from SQLite server backend in the background if logged in
      import('../services/projectService').then(({ ProjectService }) => {
        if (ProjectService.isUserLoggedIn()) {
          ProjectService.deleteProject(projectId)
            .then(() => console.log('Successfully deleted project from SQLite backend server.'))
            .catch((err) => console.warn('Could not delete project from server:', err));
        }
      });

      if (state.currentProjectId === projectId) {
        // If the deleted project was active, find another or create a default
        if (updatedList.length > 0) {
          const nextActiveId = updatedList[0].id;
          localStorage.setItem(getStorageKey('ar_forge_active_project_id'), nextActiveId);
          
          const savedDataStr = localStorage.getItem(getStorageKey(`ar_forge_project_${nextActiveId}`));
          if (savedDataStr) {
            const parsed = sanitizeBlobUrls(JSON.parse(savedDataStr));
            return {
              currentProjectId: nextActiveId,
              projectsList: updatedList,
              objects: ensureImageTargetLocked(parsed.objects),
              rootObjects: parsed.rootObjects,
              settings: parsed.settings || { projectName: parsed.name || 'Untitled Project', imageTargetName: null },
              assets: parsed.assets || [],
              selectedObjectId: null, selectedObjectIds: [],
              selectedObjectRef: null,
              past: [],
              future: [],
              lastSavedTime: parsed.lastSavedTime || Date.now(),
              hasUnsavedChanges: false
            };
          }
        }

        // If no projects remaining, recreate a default empty project
        const defaultId = 'project-' + uuidv4();
        const defaultMetadata = {
          id: defaultId,
          name: 'My AR Experience',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const newList = [defaultMetadata];
        localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(newList));

        const defaultImageTargetId = uuidv4();
        const defaultObjects = {
          [defaultImageTargetId]: {
            id: defaultImageTargetId,
            name: 'AR Target',
            type: 'imageTarget' as const,
            position: [0, 0, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            visible: true,
            locked: true,
            children: [],
            parentId: null,
            properties: { physicalWidth: 0.1 }
          }
        };

        const defaultProjData = {
          id: defaultId,
          name: 'My AR Experience',
          objects: defaultObjects,
          rootObjects: [defaultImageTargetId],
          settings: { projectName: 'My AR Experience', imageTargetName: null },
          assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
          lastSavedTime: Date.now()
        };
        localStorage.setItem(getStorageKey(`ar_forge_project_${defaultId}`), JSON.stringify(defaultProjData));
        localStorage.setItem(getStorageKey('ar_forge_active_project_id'), defaultId);

        return {
          currentProjectId: defaultId,
          projectsList: newList,
          objects: defaultObjects,
          rootObjects: [defaultImageTargetId],
          settings: { projectName: 'My AR Experience', imageTargetName: null },
          assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
          selectedObjectId: null, selectedObjectIds: [],
          selectedObjectRef: null,
          past: [],
          future: [],
          lastSavedTime: Date.now(),
          hasUnsavedChanges: false
        };
      }

      return {
        projectsList: updatedList
      };
    } catch (e) {
      console.error('Failed to delete project:', e);
      return state;
    }
  }),

  duplicateProject: (projectId) => set((state) => {
    try {
      const savedDataStr = localStorage.getItem(getStorageKey(`ar_forge_project_${projectId}`));
      if (!savedDataStr) return state;

      const parsed = sanitizeBlobUrls(JSON.parse(savedDataStr));
      const newId = 'project-' + uuidv4();
      const newName = `${parsed.settings?.projectName || parsed.name || 'Project'} Copy`;

      const metadata = {
        id: newId,
        name: newName,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const updatedList = [metadata, ...state.projectsList];
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      const projectData = {
        ...parsed,
        id: newId,
        name: newName,
        settings: {
          ...(parsed.settings || {}),
          projectName: newName,
          publishedProjectId: undefined,
          publishedProjectUrl: undefined,
          isPublishDisabled: undefined
        },
        lastSavedTime: Date.now()
      };
      localStorage.setItem(getStorageKey(`ar_forge_project_${newId}`), JSON.stringify(projectData));
      localStorage.setItem(getStorageKey('ar_forge_active_project_id'), newId);

      return {
        currentProjectId: newId,
        projectsList: updatedList,
        objects: ensureImageTargetLocked(projectData.objects),
        rootObjects: projectData.rootObjects,
        scenes: projectData.scenes || { 'default': { id: 'default', name: 'Main Scene', objects: projectData.objects, rootObjects: projectData.rootObjects } },
        activeSceneId: projectData.activeSceneId || 'default',
        settings: projectData.settings,
        assets: projectData.assets || [],
        selectedObjectId: null, selectedObjectIds: [],
        selectedObjectRef: null,
        past: [],
        future: [],
        lastSavedTime: Date.now(),
        hasUnsavedChanges: false
      };
    } catch (e) {
      console.error('Failed to duplicate project:', e);
      return state;
    }
  }),

  saveCurrentProject: () => set((state) => {
    try {
      const updatedScenes = { ...state.scenes };
      if (updatedScenes[state.activeSceneId]) {
        updatedScenes[state.activeSceneId] = {
          ...updatedScenes[state.activeSceneId],
          objects: state.objects,
          rootObjects: state.rootObjects
        };
      }

      const projectData = {
        id: state.currentProjectId,
        name: state.settings.projectName,
        objects: state.objects,
        rootObjects: state.rootObjects,
        settings: state.settings,
        assets: state.assets,
        scenes: updatedScenes,
        activeSceneId: state.activeSceneId,
        lastSavedTime: Date.now()
      };

      localStorage.setItem(getStorageKey(`ar_forge_project_${state.currentProjectId}`), JSON.stringify(projectData));

      // Save to SQLite server backend in the background if logged in
      import('../services/projectService').then(({ ProjectService }) => {
        if (ProjectService.isUserLoggedIn()) {
          ProjectService.saveProject(state.currentProjectId, state.settings.projectName, projectData)
            .then(() => console.log('Successfully saved project to the SQLite backend server.'))
            .catch((err) => console.warn('Could not save project to the server:', err));
        }
      });

      // If already published, sync the configuration to Supabase in the background
      if (state.settings.publishedProjectId) {
        import('../services/supabaseService').then(({ SupabaseService }) => {
          if (SupabaseService.isConfigured()) {
            SupabaseService.saveProject(
              state.settings.publishedProjectId!,
              state.settings.projectName,
              {
                objects: state.objects,
                rootObjects: state.rootObjects,
                settings: state.settings,
                assets: state.assets,
                scenes: updatedScenes,
                activeSceneId: state.activeSceneId
              }
            ).then(() => {
              console.log('Successfully synced current project configuration to the cloud.');
            }).catch((err) => {
              console.warn('Could not sync project configuration to the cloud:', err);
            });
          }
        });
      }

      const updatedList = state.projectsList.map((p) => 
        p.id === state.currentProjectId 
          ? { 
              ...p, 
              name: state.settings.projectName, 
              publishedProjectId: state.settings.publishedProjectId,
              publishedProjectUrl: state.settings.publishedProjectUrl,
              isPublishDisabled: state.settings.isPublishDisabled,
              settings: state.settings,
              updatedAt: Date.now() 
            }
          : p
      );
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      return {
        projectsList: updatedList,
        scenes: updatedScenes,
        lastSavedTime: Date.now(),
        hasUnsavedChanges: false
      };
    } catch (e) {
      console.error('Failed to save project:', e);
      return state;
    }
  }),

  updateProjectThumbnail: (projectId: string, thumbnailDataUrl: string) => set((state) => {
    try {
      const updatedList = state.projectsList.map((p) =>
        p.id === projectId ? { ...p, thumbnail: thumbnailDataUrl, updatedAt: Date.now() } : p
      );
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      const key = getStorageKey(`ar_forge_project_${projectId}`);
      const existing = localStorage.getItem(key);
      if (existing) {
        const parsed = JSON.parse(existing);
        parsed.thumbnail = thumbnailDataUrl;
        localStorage.setItem(key, JSON.stringify(parsed));
      }

      return { projectsList: updatedList };
    } catch (e) {
      console.error('Failed to update project thumbnail:', e);
      return state;
    }
  }),

  renameProject: (projectId, newName) => set((state) => {
    try {
      const updatedList = state.projectsList.map((p) => 
        p.id === projectId ? { ...p, name: newName, updatedAt: Date.now() } : p
      );
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      const savedDataStr = localStorage.getItem(getStorageKey(`ar_forge_project_${projectId}`));
      if (savedDataStr) {
        const parsed = sanitizeBlobUrls(JSON.parse(savedDataStr));
        parsed.name = newName;
        if (!parsed.settings) parsed.settings = { projectName: newName, imageTargetName: null };
        parsed.settings.projectName = newName;
        parsed.lastSavedTime = Date.now();
        localStorage.setItem(getStorageKey(`ar_forge_project_${projectId}`), JSON.stringify(parsed));
      }

      if (state.currentProjectId === projectId) {
        return {
          projectsList: updatedList,
          settings: { ...state.settings, projectName: newName },
          lastSavedTime: Date.now(),
          hasUnsavedChanges: false
        };
      }

      return {
        projectsList: updatedList
      };
    } catch (e) {
      console.error('Failed to rename project:', e);
      return state;
    }
  }),

  togglePublishStatus: async (projectId, enabled) => {
    try {
      const response = await fetch('/api/publish/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, enabled })
      });

      if (!response.ok) {
        console.warn('Failed to toggle publish status on server, adjusting locally');
      }

      set((state) => {
        const updatedList = state.projectsList.map((p) => 
          p.id === projectId ? { ...p, isPublishDisabled: !enabled, updatedAt: Date.now() } : p
        );
        localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

        const savedDataStr = localStorage.getItem(getStorageKey(`ar_forge_project_${projectId}`));
        if (savedDataStr) {
          const parsed = sanitizeBlobUrls(JSON.parse(savedDataStr));
          if (!parsed.settings) parsed.settings = { projectName: parsed.name || 'Project', imageTargetName: null };
          parsed.settings.isPublishDisabled = !enabled;
          parsed.lastSavedTime = Date.now();
          localStorage.setItem(getStorageKey(`ar_forge_project_${projectId}`), JSON.stringify(parsed));
        }

        if (state.currentProjectId === projectId) {
          return {
            projectsList: updatedList,
            settings: { ...state.settings, isPublishDisabled: !enabled },
            lastSavedTime: Date.now(),
            hasUnsavedChanges: false
          };
        }

        return {
          projectsList: updatedList
        };
      });

      return true;
    } catch (err) {
      console.error('Error toggling publish status:', err);
      return false;
    }
  },

  importProject: (projectJson) => {
    try {
      const parsed = sanitizeBlobUrls(JSON.parse(projectJson));
      if (!parsed.objects || !parsed.rootObjects) {
        return null;
      }

      const newId = 'project-' + uuidv4();
      const name = parsed.settings?.projectName || parsed.name || 'Imported Project';

      const metadata = {
        id: newId,
        name,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      let finalId = newId;
      set((state) => {
        const updatedList = [metadata, ...state.projectsList];
        localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

        const scenes = parsed.scenes || {
          'default': { id: 'default', name: 'Main Scene', objects: parsed.objects, rootObjects: parsed.rootObjects }
        };
        const activeSceneId = parsed.activeSceneId || 'default';

        const projectData = {
          id: newId,
          name,
          objects: parsed.objects,
          rootObjects: parsed.rootObjects,
          settings: parsed.settings || { projectName: name, imageTargetName: null },
          assets: parsed.assets || [],
          scenes,
          activeSceneId,
          lastSavedTime: Date.now()
        };
        localStorage.setItem(getStorageKey(`ar_forge_project_${newId}`), JSON.stringify(projectData));
        localStorage.setItem(getStorageKey('ar_forge_active_project_id'), newId);

        return {
          currentProjectId: newId,
          isProjectOpen: true,
          projectsList: updatedList,
          objects: ensureImageTargetLocked(projectData.objects),
          rootObjects: projectData.rootObjects,
          scenes,
          activeSceneId,
          settings: projectData.settings,
          assets: projectData.assets,
          selectedObjectId: null, selectedObjectIds: [],
          selectedObjectRef: null,
          past: [],
          future: [],
          lastSavedTime: Date.now(),
          hasUnsavedChanges: false
        };
      });

      return finalId;
    } catch (e) {
      console.error('Failed to import project:', e);
      return null;
    }
  },

  syncProjectsWithServer: async () => {
    try {
      const { ProjectService } = await import('../services/projectService');
      if (ProjectService.isUserLoggedIn()) {
        await ProjectService.syncLocalAndServerProjects();
        
        // Reload saved state to update UI
        const savedData = loadSavedState();
        set({
          projectsList: savedData.projectsList,
          scenes: savedData.scenes || { 'default': { id: 'default', name: 'Main Scene', objects: savedData.objects, rootObjects: savedData.rootObjects } },
          activeSceneId: savedData.activeSceneId || 'default',
          objects: savedData.objects,
          rootObjects: savedData.rootObjects,
          settings: savedData.settings,
          assets: savedData.assets,
          currentProjectId: savedData.currentProjectId
        });
      }
    } catch (e) {
      console.error('Failed to sync projects with server:', e);
    }
  },

  setGridSnapEnabled: (enabled) => set({ gridSnapEnabled: enabled }),
  setGridSnapIncrement: (increment) => set({ gridSnapIncrement: increment }),
  setRotationSnapEnabled: (enabled) => set({ rotationSnapEnabled: enabled }),
  setRotationSnapIncrement: (increment) => set({ rotationSnapIncrement: increment }),
  setScaleSnapEnabled: (enabled) => set({ scaleSnapEnabled: enabled }),
  setScaleSnapIncrement: (increment) => set({ scaleSnapIncrement: increment }),
  setScaleGridVisualEnabled: (enabled) => set({ scaleGridVisualEnabled: enabled }),

  snapObjectToGround: (id: string) => set((state) => {
    const obj = state.objects[id];
    if (!obj || obj.locked || obj.type === 'imageTarget' || obj.type === 'hudCanvas') return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) newPast = newPast.slice(1);

    const scaleZ = obj.scale?.[2] ?? 1;
    let targetZ = 0;

    if (obj.type === 'box') {
      const h = obj.properties?.height ?? 1;
      targetZ = (h * scaleZ) / 2;
    } else if (obj.type === 'sphere') {
      const r = obj.properties?.radius ?? 0.5;
      targetZ = r * scaleZ;
    } else if (obj.type === 'cylinder' || obj.type === 'cone') {
      const h = obj.properties?.height ?? 1;
      targetZ = (h * scaleZ) / 2;
    } else if (obj.type === 'torus') {
      const r = (obj.properties?.radius ?? 0.5) + (obj.properties?.tube ?? 0.1);
      targetZ = r * scaleZ;
    } else if (obj.type === 'plane' || obj.type === 'circle' || obj.type === 'image') {
      targetZ = 0.005; // Rest slightly above ground plane (Z=0)
    } else {
      targetZ = 0;
    }

    const updatedObj: SceneObject = {
      ...obj,
      position: [obj.position[0], obj.position[1], parseFloat(targetZ.toFixed(4))]
    };

    DirtyNodeTracker.markDirty(id, 'transform');

    return {
      objects: {
        ...state.objects,
        [id]: updatedObj
      },
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: `Dropped "${obj.name}" flush to canvas surface (Z=0)` }]
    };
  }),

  snapSelectedToGround: () => set((state) => {
    const targetIds = state.selectedObjectIds.length > 0 
      ? state.selectedObjectIds 
      : (state.selectedObjectId ? [state.selectedObjectId] : []);

    if (targetIds.length === 0) return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) newPast = newPast.slice(1);

    const updatedObjects = { ...state.objects };
    let modifiedCount = 0;

    targetIds.forEach(id => {
      const obj = updatedObjects[id];
      if (!obj || obj.locked || obj.type === 'imageTarget' || obj.type === 'hudCanvas') return;

      const scaleZ = obj.scale?.[2] ?? 1;
      let targetZ = 0;

      if (obj.type === 'box') {
        const h = obj.properties?.height ?? 1;
        targetZ = (h * scaleZ) / 2;
      } else if (obj.type === 'sphere') {
        const r = obj.properties?.radius ?? 0.5;
        targetZ = r * scaleZ;
      } else if (obj.type === 'cylinder' || obj.type === 'cone') {
        const h = obj.properties?.height ?? 1;
        targetZ = (h * scaleZ) / 2;
      } else if (obj.type === 'torus') {
        const r = (obj.properties?.radius ?? 0.5) + (obj.properties?.tube ?? 0.1);
        targetZ = r * scaleZ;
      } else if (obj.type === 'plane' || obj.type === 'circle' || obj.type === 'image') {
        targetZ = 0.005;
      } else {
        targetZ = 0;
      }

      updatedObjects[id] = {
        ...obj,
        position: [obj.position[0], obj.position[1], parseFloat(targetZ.toFixed(4))]
      };
      DirtyNodeTracker.markDirty(id, 'transform');
      modifiedCount++;
    });

    if (modifiedCount === 0) return state;

    return {
      objects: updatedObjects,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: `Snapped ${modifiedCount} object(s) flush to canvas surface (Z=0)` }]
    };
  }),

  snapObjectToGrid: (id: string) => set((state) => {
    const obj = state.objects[id];
    if (!obj || obj.locked || obj.type === 'imageTarget' || obj.type === 'hudCanvas') return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) newPast = newPast.slice(1);

    const inc = state.gridSnapIncrement || 0.1;
    const rotInc = state.rotationSnapIncrement || 15;

    const snapVal = (v: number) => Math.round(v / inc) * inc;
    const snapRot = (r: number) => Math.round(r / rotInc) * rotInc;

    const updatedObj: SceneObject = {
      ...obj,
      position: [
        parseFloat(snapVal(obj.position[0]).toFixed(4)),
        parseFloat(snapVal(obj.position[1]).toFixed(4)),
        parseFloat(snapVal(obj.position[2]).toFixed(4))
      ],
      rotation: [
        parseFloat(snapRot(obj.rotation[0]).toFixed(2)),
        parseFloat(snapRot(obj.rotation[1]).toFixed(2)),
        parseFloat(snapRot(obj.rotation[2]).toFixed(2))
      ]
    };

    DirtyNodeTracker.markDirty(id, 'transform');

    return {
      objects: {
        ...state.objects,
        [id]: updatedObj
      },
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: `Snapped "${obj.name}" to grid (${inc}m)` }]
    };
  }),

  snapSelectedToGrid: () => set((state) => {
    const targetIds = state.selectedObjectIds.length > 0 
      ? state.selectedObjectIds 
      : (state.selectedObjectId ? [state.selectedObjectId] : []);

    if (targetIds.length === 0) return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) newPast = newPast.slice(1);

    const inc = state.gridSnapIncrement || 0.1;
    const rotInc = state.rotationSnapIncrement || 15;
    const snapVal = (v: number) => Math.round(v / inc) * inc;
    const snapRot = (r: number) => Math.round(r / rotInc) * rotInc;

    const updatedObjects = { ...state.objects };
    let modifiedCount = 0;

    targetIds.forEach(id => {
      const obj = updatedObjects[id];
      if (!obj || obj.locked || obj.type === 'imageTarget' || obj.type === 'hudCanvas') return;

      updatedObjects[id] = {
        ...obj,
        position: [
          parseFloat(snapVal(obj.position[0]).toFixed(4)),
          parseFloat(snapVal(obj.position[1]).toFixed(4)),
          parseFloat(snapVal(obj.position[2]).toFixed(4))
        ],
        rotation: [
          parseFloat(snapRot(obj.rotation[0]).toFixed(2)),
          parseFloat(snapRot(obj.rotation[1]).toFixed(2)),
          parseFloat(snapRot(obj.rotation[2]).toFixed(2))
        ]
      };
      DirtyNodeTracker.markDirty(id, 'transform');
      modifiedCount++;
    });

    if (modifiedCount === 0) return state;

    return {
      objects: updatedObjects,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: `Snapped ${modifiedCount} object(s) to grid (${inc}m)` }]
    };
  }),

  centerObjectOnTarget: (id: string) => set((state) => {
    const obj = state.objects[id];
    if (!obj || obj.locked || obj.type === 'imageTarget' || obj.type === 'hudCanvas') return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) newPast = newPast.slice(1);

    const updatedObj: SceneObject = {
      ...obj,
      position: [0, 0, obj.position[2]]
    };

    DirtyNodeTracker.markDirty(id, 'transform');

    return {
      objects: {
        ...state.objects,
        [id]: updatedObj
      },
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: `Centered "${obj.name}" on target canvas` }]
    };
  }),

  centerSelectedOnTarget: () => set((state) => {
    const targetIds = state.selectedObjectIds.length > 0 
      ? state.selectedObjectIds 
      : (state.selectedObjectId ? [state.selectedObjectId] : []);

    if (targetIds.length === 0) return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) newPast = newPast.slice(1);

    const updatedObjects = { ...state.objects };
    let modifiedCount = 0;

    targetIds.forEach(id => {
      const obj = updatedObjects[id];
      if (!obj || obj.locked || obj.type === 'imageTarget' || obj.type === 'hudCanvas') return;

      updatedObjects[id] = {
        ...obj,
        position: [0, 0, obj.position[2]]
      };
      DirtyNodeTracker.markDirty(id, 'transform');
      modifiedCount++;
    });

    if (modifiedCount === 0) return state;

    return {
      objects: updatedObjects,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: `Centered ${modifiedCount} object(s) on target` }]
    };
  }),

  setOverlayGridEnabled: (enabled) => set({ overlayGridEnabled: enabled }),
  setOverlayGridSize: (size) => set({ overlayGridSize: size }),
  setHudDebugGridEnabled: (enabled) => set({ hudDebugGridEnabled: enabled }),

  setCameraType: (cameraType) => set({ cameraType }),
  setCameraOrbitLocked: (locked) => set((state) => {
    const toastMsg = locked ? 'Camera Orbit Locked (View Fixed)' : 'Camera Orbit Unlocked (Free Orbit)';
    return {
      cameraOrbitLocked: locked,
      toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: toastMsg }]
    };
  }),
  toggleCameraOrbitLock: () => set((state) => {
    const nextLocked = !state.cameraOrbitLocked;
    const toastMsg = nextLocked ? 'Camera Orbit Locked (View Fixed) [L]' : 'Camera Orbit Unlocked (Free Orbit) [L]';
    return {
      cameraOrbitLocked: nextLocked,
      toasts: [...state.toasts, { id: `toast-${Date.now()}`, message: toastMsg }]
    };
  }),
  setWireframeEnabled: (enabled) => set((state) => ({ 
    wireframeEnabled: enabled,
    visualizationMode: enabled ? 'fullWireframe' : (state.selectedModelWireframeEnabled ? 'selectedWireframe' : 'standard')
  })),
  setSelectedModelWireframeEnabled: (enabled) => set((state) => ({
    selectedModelWireframeEnabled: enabled,
    visualizationMode: enabled ? 'selectedWireframe' : (state.wireframeEnabled ? 'fullWireframe' : 'standard')
  })),
  setVisualizationMode: (mode) => set({
    visualizationMode: mode,
    selectedModelWireframeEnabled: mode === 'selectedWireframe',
    wireframeEnabled: mode === 'fullWireframe',
  }),
  setCollisionDebuggerEnabled: (enabled) => set({ collisionDebuggerEnabled: enabled }),

  setDrivingActive: (active, vehicleId) => set((state) => {
    let targetVehicleId = vehicleId || state.activeDrivingVehicleId;
    if (active && !targetVehicleId) {
      // Find selected object or first drivable/model vehicle object in scene
      if (state.selectedObjectId && state.objects[state.selectedObjectId]) {
        targetVehicleId = state.selectedObjectId;
      } else {
        const foundId = Object.keys(state.objects).find(id => {
          const o = state.objects[id];
          return o.properties?.isDrivable || o.properties?.behavior === 'drive' || (o.tags && o.tags.includes('vehicle')) || (o.name && /car|vehicle|truck|van|auto|bike|sedan|coupe|suv|rover/i.test(o.name));
        });
        targetVehicleId = foundId || Object.keys(state.objects).find(id => state.objects[id].type === 'model') || null;
      }
    }

    const toastMsg = active 
      ? `🚗 Vehicle Driving Simulation Engaged! Use [W,A,S,D] or On-screen Controls.`
      : `Vehicle Driving Disengaged.`;

    const toastId = `toast-${Date.now()}`;
    return {
      isDrivingActive: active,
      activeDrivingVehicleId: active ? targetVehicleId : null,
      toasts: [...state.toasts, { id: toastId, message: toastMsg }]
    };
  }),

  toggleDrivingActive: (vehicleId) => set((state) => {
    const nextActive = !state.isDrivingActive;
    let targetVehicleId = vehicleId || state.activeDrivingVehicleId;
    if (nextActive && !targetVehicleId) {
      if (state.selectedObjectId && state.objects[state.selectedObjectId]) {
        targetVehicleId = state.selectedObjectId;
      } else {
        const foundId = Object.keys(state.objects).find(id => {
          const o = state.objects[id];
          return o.properties?.isDrivable || o.properties?.behavior === 'drive' || (o.tags && o.tags.includes('vehicle')) || (o.name && /car|vehicle|truck|van|auto|bike|sedan|coupe|suv|rover/i.test(o.name));
        });
        targetVehicleId = foundId || Object.keys(state.objects).find(id => state.objects[id].type === 'model') || null;
      }
    }

    const toastMsg = nextActive 
      ? `🚗 Vehicle Driving Simulation Engaged! Use [W,A,S,D] or On-screen Controls.`
      : `Vehicle Driving Disengaged.`;

    const toastId = `toast-${Date.now()}`;
    return {
      isDrivingActive: nextActive,
      activeDrivingVehicleId: nextActive ? targetVehicleId : null,
      toasts: [...state.toasts, { id: toastId, message: toastMsg }]
    };
  }),

  setVehicleDrivingTelemetry: (telemetry) => set((state) => ({
    vehicleDrivingTelemetry: {
      ...state.vehicleDrivingTelemetry,
      ...telemetry
    }
  })),

  toggleEditorTheme: () => set((state) => ({ editorTheme: state.editorTheme === 'dark' ? 'light' : 'dark' })),
  
  setTargetDprScale: (scale) => set({ targetDprScale: scale }),
  setShadowQualityPreset: (preset) => set({ shadowQualityPreset: preset }),
  setUiDensityMode: (mode) => set({ uiDensityMode: mode }),
  setDeviceSimulationPreset: (preset) => set({ deviceSimulationPreset: preset }),
  setIsUIOptimizerOpen: (open) => set({ isUIOptimizerOpen: open }),
  setIsOnboardingModalOpen: (open) => set({ isOnboardingModalOpen: open }),
  setMobileMeshOptimizationEnabled: (enabled) => set({ mobileMeshOptimizationEnabled: enabled }),
  setIsShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  createVersionSnapshot: (customName?: string) => set((state) => {
    const versionId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const snapshotName = customName && customName.trim() ? customName.trim() : `Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${Object.keys(state.objects).length} objects)`;
    
    const newVersion: ProjectVersion = {
      id: versionId,
      name: snapshotName,
      timestamp: Date.now(),
      snapshot: {
        objects: JSON.parse(JSON.stringify(state.objects)),
        rootObjects: JSON.parse(JSON.stringify(state.rootObjects)),
        settings: JSON.parse(JSON.stringify(state.settings)),
        assets: JSON.parse(JSON.stringify(state.assets))
      }
    };

    const updatedVersions = [newVersion, ...state.versions];
    saveVersionsForProject(state.currentProjectId, updatedVersions);

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 4000);

    return {
      versions: updatedVersions,
      toasts: [...state.toasts, { id: toastId, message: `Created snapshot "${snapshotName}"` }]
    };
  }),

  restoreVersionSnapshot: (versionId: string) => set((state) => {
    const targetVersion = state.versions.find((v) => v.id === versionId);
    if (!targetVersion) return state;

    const snapshotToPush: HistorySnapshot = {
      objects: JSON.parse(JSON.stringify(state.objects)),
      rootObjects: JSON.parse(JSON.stringify(state.rootObjects)),
      selectedObjectId: state.selectedObjectId,
      selectedObjectIds: JSON.parse(JSON.stringify(state.selectedObjectIds))
    };

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 4000);

    return {
      objects: JSON.parse(JSON.stringify(targetVersion.snapshot.objects)),
      rootObjects: JSON.parse(JSON.stringify(targetVersion.snapshot.rootObjects)),
      settings: JSON.parse(JSON.stringify(targetVersion.snapshot.settings)),
      assets: JSON.parse(JSON.stringify(targetVersion.snapshot.assets)),
      selectedObjectId: null,
      selectedObjectIds: [],
      selectedObjectRef: null,
      past: [...state.past, snapshotToPush],
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Restored scene to "${targetVersion.name}"` }]
    };
  }),

  deleteVersionSnapshot: (versionId: string) => set((state) => {
    const updatedVersions = state.versions.filter((v) => v.id !== versionId);
    saveVersionsForProject(state.currentProjectId, updatedVersions);

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 4000);

    return {
      versions: updatedVersions,
      toasts: [...state.toasts, { id: toastId, message: 'Deleted version snapshot' }]
    };
  }),

  applyTemplate: (templateType: TemplateType) => set((state) => {
    const projName = state.settings.projectName || 'AR Project';
    const generated = generateTemplate(projName, templateType);

    const snapshotToPush: HistorySnapshot = {
      objects: JSON.parse(JSON.stringify(state.objects)),
      rootObjects: JSON.parse(JSON.stringify(state.rootObjects)),
      selectedObjectId: state.selectedObjectId,
      selectedObjectIds: [...state.selectedObjectIds]
    };

    const updatedScenes = { ...state.scenes };
    if (state.activeSceneId && updatedScenes[state.activeSceneId]) {
      updatedScenes[state.activeSceneId] = {
        ...updatedScenes[state.activeSceneId],
        objects: generated.objects,
        rootObjects: generated.rootObjects
      };
    }

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 4000);

    return {
      objects: generated.objects,
      rootObjects: generated.rootObjects,
      scenes: updatedScenes,
      selectedObjectId: null,
      selectedObjectIds: [],
      past: [...state.past, snapshotToPush],
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Loaded template into scene!` }]
    };
  }),
}));
