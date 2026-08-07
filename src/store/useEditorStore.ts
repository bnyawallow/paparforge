import { useAuthStore } from './useAuthStore';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { EditorState, SceneObject, HistorySnapshot, ProjectVersion, StateData, TemplateType } from '../types';

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

const defaultScene: Record<string, SceneObject> = {
  [initialImageTargetId]: {
    id: initialImageTargetId,
    name: 'Image Target',
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
    }
  }
};

// Generate template scenes to allow quick prototyping
export const generateTemplate = (projectName: string, templateType: TemplateType) => {
  const imageTargetId = uuidv4();
  const objects: Record<string, SceneObject> = {
    [imageTargetId]: {
      id: imageTargetId,
      name: 'Image Target',
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
      }
    }
  };
  const rootObjects = [imageTargetId];

  if (templateType === 'product_showcase') {
    // Tech Gadget / Sneaker Launch Ad
    const pGroupId = uuidv4();
    const pedestalId = uuidv4();
    const heroProductSphereId = uuidv4();
    const ringGlowId = uuidv4();
    const textTitleId = uuidv4();
    const textPriceId = uuidv4();
    const btnBuyId = uuidv4();
    const specCalloutId = uuidv4();

    objects[imageTargetId].children = [pGroupId];
    objects[pGroupId] = {
      id: pGroupId,
      name: 'Tech Gadget Launch Group',
      type: 'group',
      position: [0, 0, 0.1],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [pedestalId, heroProductSphereId, ringGlowId, textTitleId, textPriceId, btnBuyId, specCalloutId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[pedestalId] = {
      id: pedestalId,
      name: 'Cyber Metallic Pedestal',
      type: 'cylinder',
      position: [0, -0.3, 0],
      rotation: [0, 0, 0],
      scale: [0.6, 0.08, 0.6],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: { color: '#0F172A', metalness: 0.9, roughness: 0.2 }
    };

    objects[heroProductSphereId] = {
      id: heroProductSphereId,
      name: 'Hero Core Model',
      type: 'sphere',
      position: [0, 0.15, 0],
      rotation: [0, 0, 0],
      scale: [0.35, 0.35, 0.35],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: { color: '#00F3FF', behavior: 'spin', spinAxis: 'y', metalness: 0.7, roughness: 0.1 }
    };

    objects[ringGlowId] = {
      id: ringGlowId,
      name: 'Orbit Halo Ring',
      type: 'torus',
      position: [0, 0.15, 0],
      rotation: [70, 0, 0],
      scale: [0.55, 0.55, 0.03],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: { color: '#FF007F', behavior: 'spin', spinAxis: 'z' }
    };

    objects[textTitleId] = {
      id: textTitleId,
      name: 'Product Title',
      type: 'text',
      position: [0, 0.6, 0],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: {
        text: 'APEX NEOPODS PRO\nSpatial Lossless Audio',
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
      properties: { text: '⚡ $249.99 (In Stock)', color: '#10B981', billboard: true }
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
      properties: { text: '✓ ANC 2.0 Active Noise\n✓ 40 Hours Playback\n✓ IPX7 Waterproof', color: '#E2E8F0', billboard: true }
    };

  } else if (templateType === 'billboard_poster') {
    // 3D Billboard & Movie / Brand Commercial Ad
    const bGroupId = uuidv4();
    const frameId = uuidv4();
    const videoId = uuidv4();
    const titleTextId = uuidv4();
    const btnTicketsId = uuidv4();
    const btnTrailerId = uuidv4();
    const hudEmbedId = uuidv4();

    objects[imageTargetId].children = [bGroupId];
    objects[bGroupId] = {
      id: bGroupId,
      name: 'AR 3D Billboard Ad',
      type: 'group',
      position: [0, 0.2, 0.05],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [frameId, videoId, titleTextId, btnTicketsId, btnTrailerId, hudEmbedId],
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

    objects[videoId] = {
      id: videoId,
      name: 'Commercial Video Player',
      type: 'youtube',
      position: [0, 0.3, 0.02],
      rotation: [0, 0, 0],
      scale: [1.3, 0.75, 0.1],
      visible: true,
      children: [],
      parentId: bGroupId,
      properties: { videoId: 'dQw4w9WgXcQ' }
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
        text: 'CYBERPUNK 2088: REBOOT',
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
      position: [-0.35, -0.22, 0.05],
      rotation: [0, 0, 0],
      scale: [0.45, 0.12, 0.03],
      visible: true,
      children: [],
      parentId: bGroupId,
      properties: { text: 'GET TICKETS $15', color: '#EC4899', textColor: '#FFFFFF', url: 'https://example.com' }
    };

    objects[btnTrailerId] = {
      id: btnTrailerId,
      name: 'Watch Trailer CTA',
      type: 'button',
      position: [0.35, -0.22, 0.05],
      rotation: [0, 0, 0],
      scale: [0.45, 0.12, 0.03],
      visible: true,
      children: [],
      parentId: bGroupId,
      properties: { text: 'SHARE PROMO 🚀', color: '#3B82F6', textColor: '#FFFFFF', url: 'https://example.com' }
    };

    objects[hudEmbedId] = {
      id: hudEmbedId,
      name: 'Promo Coupon HUD Overlay',
      type: 'hudEmbed',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: bGroupId,
      properties: {
        url: `data:text/html,<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="m-0 bg-slate-950/80 backdrop-blur-md text-white p-3 font-sans overflow-hidden"><div class="flex items-center justify-between border-b border-pink-500/30 pb-2"><span class="text-[10px] uppercase font-bold text-pink-400 tracking-wider">🎟️ Special Offer</span><span class="text-[9px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded font-mono">LIMITED</span></div><p class="text-[11px] text-slate-300 mt-2">Use code <strong class="text-yellow-400">CYBER2088</strong> for 20% off IMAX premiere tickets!</p></body></html>`,
        width: 320,
        height: 100,
        alignment: 'bottom-left',
        offsetX: 20,
        offsetY: 20,
        borderRadius: 12,
        borderEnabled: true,
        borderColor: '#EC4899'
      }
    };

  } else if (templateType === 'automobile_showroom') {
    // 3D Car & Electric Vehicle Showroom Ad
    const cGroupId = uuidv4();
    const stageCylinderId = uuidv4();
    const chassisId = uuidv4();
    const windshieldId = uuidv4();
    const wheel1 = uuidv4();
    const wheel2 = uuidv4();
    const titleTextId = uuidv4();
    const specTextId = uuidv4();
    const btnDriveId = uuidv4();
    const btnColorRedId = uuidv4();
    const btnColorBlackId = uuidv4();

    objects[imageTargetId].children = [cGroupId];
    objects[cGroupId] = {
      id: cGroupId,
      name: 'Electric Vehicle Showroom',
      type: 'group',
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [stageCylinderId, chassisId, windshieldId, wheel1, wheel2, titleTextId, specTextId, btnDriveId, btnColorRedId, btnColorBlackId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[stageCylinderId] = {
      id: stageCylinderId,
      name: 'Reflective Showroom Podium',
      type: 'cylinder',
      position: [0, -0.25, 0],
      rotation: [0, 0, 0],
      scale: [1.2, 0.06, 1.2],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { color: '#1E293B', metalness: 0.95, roughness: 0.1 }
    };

    objects[chassisId] = {
      id: chassisId,
      name: 'Vehicle Aerodynamic Body',
      type: 'box',
      position: [0, 0.05, 0],
      rotation: [0, 0, 0],
      scale: [0.8, 0.22, 0.42],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { color: '#DC2626', behavior: 'spin', spinAxis: 'y', metalness: 0.9, roughness: 0.15 }
    };

    objects[windshieldId] = {
      id: windshieldId,
      name: 'Windshield Canopy',
      type: 'box',
      position: [0, 0.2, 0],
      rotation: [0, 0, 0],
      scale: [0.45, 0.15, 0.35],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { color: '#0284C7', opacity: 0.6, transparent: true }
    };

    objects[wheel1] = {
      id: wheel1,
      name: 'Front Alloy Wheel',
      type: 'cylinder',
      position: [-0.25, -0.1, 0.22],
      rotation: [90, 0, 0],
      scale: [0.14, 0.06, 0.14],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { color: '#09090B' }
    };

    objects[wheel2] = {
      id: wheel2,
      name: 'Rear Alloy Wheel',
      type: 'cylinder',
      position: [0.25, -0.1, 0.22],
      rotation: [90, 0, 0],
      scale: [0.14, 0.06, 0.14],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { color: '#09090B' }
    };

    objects[titleTextId] = {
      id: titleTextId,
      name: 'Vehicle Title Header',
      type: 'text',
      position: [0, 0.65, 0],
      rotation: [0, 0, 0],
      scale: [0.5, 0.5, 0.5],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: {
        text: 'APEX GT HYPER-EV',
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
      position: [0, 0.45, 0],
      rotation: [0, 0, 0],
      scale: [0.32, 0.32, 0.32],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { text: '⚡ 0-60 MPH: 2.3s  |  RANGE: 520 MILES  |  1,020 HP', color: '#F3F4F6', billboard: true }
    };

    objects[btnDriveId] = {
      id: btnDriveId,
      name: 'Test Drive CTA Button',
      type: 'button',
      position: [0, -0.38, 0.3],
      rotation: [0, 0, 0],
      scale: [0.55, 0.12, 0.03],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { text: 'BOOK TEST DRIVE', color: '#DC2626', textColor: '#FFFFFF', url: 'https://example.com' }
    };

    objects[btnColorRedId] = {
      id: btnColorRedId,
      name: 'Color Red Swatch',
      type: 'button',
      position: [-0.3, -0.38, 0.3],
      rotation: [0, 0, 0],
      scale: [0.2, 0.08, 0.02],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { text: 'CRIMSON', color: '#DC2626' }
    };

    objects[btnColorBlackId] = {
      id: btnColorBlackId,
      name: 'Color Black Swatch',
      type: 'button',
      position: [0.3, -0.38, 0.3],
      rotation: [0, 0, 0],
      scale: [0.2, 0.08, 0.02],
      visible: true,
      children: [],
      parentId: cGroupId,
      properties: { text: 'OBSIDIAN', color: '#18181B' }
    };

  } else if (templateType === 'fast_food_beverage') {
    // Fast Food & Beverage Promo Ad
    const fGroupId = uuidv4();
    const canId = uuidv4();
    const burgerBoxId = uuidv4();
    const sliceRingId = uuidv4();
    const headerTextId = uuidv4();
    const couponBadgeId = uuidv4();
    const btnOrderDeliveryId = uuidv4();
    const btnStoreId = uuidv4();

    objects[imageTargetId].children = [fGroupId];
    objects[fGroupId] = {
      id: fGroupId,
      name: 'Food & Beverage Promo',
      type: 'group',
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [canId, burgerBoxId, sliceRingId, headerTextId, couponBadgeId, btnOrderDeliveryId, btnStoreId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[canId] = {
      id: canId,
      name: 'Dynamic Beverage Can',
      type: 'cylinder',
      position: [-0.22, 0.1, 0],
      rotation: [0, 0, 0],
      scale: [0.18, 0.45, 0.18],
      visible: true,
      children: [],
      parentId: fGroupId,
      properties: { color: '#FACC15', behavior: 'float', metalness: 0.8, roughness: 0.2 }
    };

    objects[burgerBoxId] = {
      id: burgerBoxId,
      name: 'Gourmet Burger Combo',
      type: 'box',
      position: [0.2, 0.05, 0],
      rotation: [0, 15, 0],
      scale: [0.38, 0.25, 0.38],
      visible: true,
      children: [],
      parentId: fGroupId,
      properties: { color: '#EA580C', behavior: 'spin', spinAxis: 'y' }
    };

    objects[sliceRingId] = {
      id: sliceRingId,
      name: 'Floating Flavor Particles',
      type: 'torus',
      position: [-0.22, 0.38, 0],
      rotation: [90, 0, 0],
      scale: [0.28, 0.28, 0.03],
      visible: true,
      children: [],
      parentId: fGroupId,
      properties: { color: '#EF4444', behavior: 'spin', spinAxis: 'z' }
    };

    objects[headerTextId] = {
      id: headerTextId,
      name: 'Promo Header Text',
      type: 'text',
      position: [0, 0.65, 0],
      rotation: [0, 0, 0],
      scale: [0.5, 0.5, 0.5],
      visible: true,
      children: [],
      parentId: fGroupId,
      properties: {
        text: '🔥 CRISPY COMBO BOX\nSAVE 25% TODAY',
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
      properties: { text: 'PROMO CODE: YUMMY25', color: '#10B981', billboard: true }
    };

    objects[btnOrderDeliveryId] = {
      id: btnOrderDeliveryId,
      name: 'Order Delivery Button',
      type: 'button',
      position: [-0.28, -0.38, 0.25],
      rotation: [0, 0, 0],
      scale: [0.42, 0.11, 0.025],
      visible: true,
      children: [],
      parentId: fGroupId,
      properties: { text: 'ORDER DELIVERY 🍔', color: '#EA580C', textColor: '#FFFFFF', url: 'https://example.com' }
    };

    objects[btnStoreId] = {
      id: btnStoreId,
      name: 'Store Finder Button',
      type: 'button',
      position: [0.28, -0.38, 0.25],
      rotation: [0, 0, 0],
      scale: [0.42, 0.11, 0.025],
      visible: true,
      children: [],
      parentId: fGroupId,
      properties: { text: 'NEARBY STORES 📍', color: '#CA8A04', textColor: '#FFFFFF', url: 'https://example.com' }
    };

  } else if (templateType === 'luxury_fashion') {
    // Luxury Fashion & Perfume Cosmetics Ad
    const lGroupId = uuidv4();
    const marblePedestalId = uuidv4();
    const goldRingId = uuidv4();
    const bottleBodyId = uuidv4();
    const bottleCapId = uuidv4();
    const titleTextId = uuidv4();
    const descTextId = uuidv4();
    const btnDiscoverId = uuidv4();

    objects[imageTargetId].children = [lGroupId];
    objects[lGroupId] = {
      id: lGroupId,
      name: 'Luxury Fragrance Ad',
      type: 'group',
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [marblePedestalId, goldRingId, bottleBodyId, bottleCapId, titleTextId, descTextId, btnDiscoverId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[marblePedestalId] = {
      id: marblePedestalId,
      name: 'Marble Display Stand',
      type: 'cylinder',
      position: [0, -0.25, 0],
      rotation: [0, 0, 0],
      scale: [0.55, 0.08, 0.55],
      visible: true,
      children: [],
      parentId: lGroupId,
      properties: { color: '#F8FAFC', roughness: 0.1 }
    };

    objects[goldRingId] = {
      id: goldRingId,
      name: 'Gold Halo Accent',
      type: 'torus',
      position: [0, -0.2, 0],
      rotation: [90, 0, 0],
      scale: [0.58, 0.58, 0.02],
      visible: true,
      children: [],
      parentId: lGroupId,
      properties: { color: '#FFD700', metalness: 0.95 }
    };

    objects[bottleBodyId] = {
      id: bottleBodyId,
      name: 'Crystal Glass Perfume Bottle',
      type: 'box',
      position: [0, 0.12, 0],
      rotation: [0, 0, 0],
      scale: [0.22, 0.42, 0.14],
      visible: true,
      children: [],
      parentId: lGroupId,
      properties: { color: '#38BDF8', opacity: 0.75, transparent: true, behavior: 'float' }
    };

    objects[bottleCapId] = {
      id: bottleCapId,
      name: 'Gold Crown Cap',
      type: 'box',
      position: [0, 0.38, 0],
      rotation: [0, 0, 0],
      scale: [0.1, 0.1, 0.1],
      visible: true,
      children: [],
      parentId: lGroupId,
      properties: { color: '#FFD700', metalness: 0.9 }
    };

    objects[titleTextId] = {
      id: titleTextId,
      name: 'Brand Header',
      type: 'text',
      position: [0, 0.65, 0],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45],
      visible: true,
      children: [],
      parentId: lGroupId,
      properties: {
        text: 'NOCTURNE PARIS\nEAU DE PARFUM',
        color: '#FFD700',
        outlineColor: '#8B6508',
        outlineWidth: 0.018,
        billboard: true
      }
    };

    objects[descTextId] = {
      id: descTextId,
      name: 'Fragrance Notes',
      type: 'text',
      position: [0, -0.1, 0.2],
      rotation: [0, 0, 0],
      scale: [0.32, 0.32, 0.32],
      visible: true,
      children: [],
      parentId: lGroupId,
      properties: { text: 'Notes of French Rose, Sandalwood & Amber', color: '#F1F5F9', billboard: true }
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
      properties: { text: 'EXPLORE COLLECTION 👑', color: '#D97706', textColor: '#FFFFFF', url: 'https://example.com' }
    };

  } else if (templateType === 'real_estate') {
    // Architectural Property & Luxury Villa Ad
    const rGroupId = uuidv4();
    const podiumId = uuidv4();
    const mainSlabId = uuidv4();
    const glassFacadeId = uuidv4();
    const roofOverhangId = uuidv4();
    const titleTextId = uuidv4();
    const priceBadgeId = uuidv4();
    const hotspot1Id = uuidv4();
    const hotspot2Id = uuidv4();
    const btnTourId = uuidv4();

    objects[imageTargetId].children = [rGroupId];
    objects[rGroupId] = {
      id: rGroupId,
      name: 'Luxury Villa Real Estate Ad',
      type: 'group',
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [podiumId, mainSlabId, glassFacadeId, roofOverhangId, titleTextId, priceBadgeId, hotspot1Id, hotspot2Id, btnTourId],
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

    objects[mainSlabId] = {
      id: mainSlabId,
      name: 'Concrete Floor Slabs',
      type: 'box',
      position: [0, 0.05, 0],
      rotation: [0, 0, 0],
      scale: [0.75, 0.35, 0.5],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: { color: '#E2E8F0' }
    };

    objects[glassFacadeId] = {
      id: glassFacadeId,
      name: 'Panoramic Glass Wall',
      type: 'box',
      position: [0.1, 0.05, 0.26],
      rotation: [0, 0, 0],
      scale: [0.5, 0.32, 0.02],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: { color: '#38BDF8', opacity: 0.5, transparent: true }
    };

    objects[roofOverhangId] = {
      id: roofOverhangId,
      name: 'Modernist Roof Canopy',
      type: 'box',
      position: [0, 0.25, 0],
      rotation: [0, 0, 0],
      scale: [0.85, 0.04, 0.6],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: { color: '#1E293B' }
    };

    objects[titleTextId] = {
      id: titleTextId,
      name: 'Property Header',
      type: 'text',
      position: [0, 0.62, 0],
      rotation: [0, 0, 0],
      scale: [0.45, 0.45, 0.45],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: {
        text: 'SKYLINE RESIDENCES & VILLAS',
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
      position: [0, 0.42, 0],
      rotation: [0, 0, 0],
      scale: [0.35, 0.35, 0.35],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: { text: '💎 Luxury Units from $850,000', color: '#10B981', billboard: true }
    };

    objects[hotspot1Id] = {
      id: hotspot1Id,
      name: 'Infinity Pool Hotspot',
      type: 'text',
      position: [-0.45, 0.1, 0.3],
      rotation: [0, 0, 0],
      scale: [0.28, 0.28, 0.28],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: { text: '📍 Private Infinity Pool', color: '#38BDF8', billboard: true }
    };

    objects[hotspot2Id] = {
      id: hotspot2Id,
      name: 'Solar Grid Hotspot',
      type: 'text',
      position: [0.45, 0.1, 0.3],
      rotation: [0, 0, 0],
      scale: [0.28, 0.28, 0.28],
      visible: true,
      children: [],
      parentId: rGroupId,
      properties: { text: '📍 Smart Solar Energy', color: '#FACC15', billboard: true }
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
      properties: { text: 'BOOK VIRTUAL TOUR 🏡', color: '#2563EB', textColor: '#FFFFFF', url: 'https://example.com' }
    };

  } else if (templateType === 'business_card') {
    // AR Business Card & Identity
    const cardId = uuidv4();
    const textNameId = uuidv4();
    const btnId = uuidv4();
    const ytId = uuidv4();

    objects[imageTargetId].children = [cardId];
    objects[cardId] = {
      id: cardId,
      name: 'Business Card Panel',
      type: 'box',
      position: [0, 0, 0.01],
      rotation: [0, 0, 0],
      scale: [1.2, 0.8, 0.02],
      visible: true,
      children: [textNameId, btnId, ytId],
      parentId: imageTargetId,
      properties: { color: '#111827' }
    };

    objects[textNameId] = {
      id: textNameId,
      name: 'Name Text',
      type: 'text',
      position: [-0.3, 0.2, 0.03],
      rotation: [0, 0, 0],
      scale: [0.5, 0.5, 0.5],
      visible: true,
      children: [],
      parentId: cardId,
      properties: { text: 'Alex Carter\nCreative AR Director', color: '#60a5fa' }
    };

    objects[btnId] = {
      id: btnId,
      name: 'Portfolio Link',
      type: 'button',
      position: [-0.3, -0.15, 0.03],
      rotation: [0, 0, 0],
      scale: [0.4, 0.1, 0.02],
      visible: true,
      children: [],
      parentId: cardId,
      properties: { text: 'Visit Website 🌐', color: '#2563eb', url: 'https://example.com' }
    };

    objects[ytId] = {
      id: ytId,
      name: 'Intro Video',
      type: 'youtube',
      position: [0.25, 0, 0.03],
      rotation: [0, 0, 0],
      scale: [0.5, 0.28, 0.5],
      visible: true,
      children: [],
      parentId: cardId,
      properties: { videoId: 'dQw4w9WgXcQ' }
    };

  } else if (templateType === 'educational') {
    // Spatial Interactive Orbit
    const parentGroupId = uuidv4();
    const earthId = uuidv4();
    const satelliteId = uuidv4();
    const labelId = uuidv4();

    objects[imageTargetId].children = [parentGroupId];
    objects[parentGroupId] = {
      id: parentGroupId,
      name: 'Solar Orbit Group',
      type: 'group',
      position: [0, 0, 0.15],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [earthId, satelliteId, labelId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[earthId] = {
      id: earthId,
      name: 'Earth Core Sphere',
      type: 'sphere',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [0.4, 0.4, 0.4],
      visible: true,
      children: [],
      parentId: parentGroupId,
      properties: { color: '#3b82f6', behavior: 'spin', spinAxis: 'y' }
    };

    objects[satelliteId] = {
      id: satelliteId,
      name: 'Orbiting Satellite',
      type: 'box',
      position: [0.5, 0.2, 0.2],
      rotation: [15, 45, 0],
      scale: [0.1, 0.1, 0.15],
      visible: true,
      children: [],
      parentId: parentGroupId,
      properties: { color: '#9ca3af', behavior: 'float' }
    };

    objects[labelId] = {
      id: labelId,
      name: 'Orbit Label',
      type: 'text',
      position: [0, -0.4, 0],
      rotation: [0, 0, 0],
      scale: [0.4, 0.4, 0.4],
      visible: true,
      children: [],
      parentId: parentGroupId,
      properties: { text: 'Low Earth Orbit (LEO) Spatial Simulation', color: '#ffffff', billboard: true }
    };
  }

  return { objects, rootObjects };
};

const normalizeSceneHierarchyAndLockImageTarget = (objects: Record<string, SceneObject>, rootObjects?: string[]) => {
  if (!objects || Object.keys(objects).length === 0) {
    const imageTargetId = uuidv4();
    const defaultImageTarget: SceneObject = {
      id: imageTargetId,
      name: 'Image Target',
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
    return {
      objects: { [imageTargetId]: defaultImageTarget },
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
      name: 'Image Target',
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
      // Non-HUD / 3D element: check if current parent is valid (not null, not hudCanvas, and exists)
      const currentParent = obj.parentId ? updatedObjects[obj.parentId] : null;
      if (!currentParent || currentParent.type === 'hudCanvas' || currentParent.id === obj.id) {
        obj.parentId = imageTarget!.id;
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

  let position = [...original.position] as [number, number, number];
  if (isRoot) {
    position[0] += 0.25; // Slightly offset X
    position[2] += 0.25; // Slightly offset Z
  }

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
  selectedObjectId: null, selectedObjectIds: [],
  selectedObjectRef: null,
  settings: initialSettings,
  transformMode: 'translate',
  transformSpace: 'world',
  transformGizmoEnabled: true,
  transformApplyMode: 'activeStateOnly',
  setTransformApplyMode: (mode) => set({ transformApplyMode: mode }),
  assets: initialAssets,
  copiedObjectData: null,
  isPreviewMode: false,
  activeHotspotCard: null,
  setActiveHotspotCard: (card) => set({ activeHotspotCard: card }),
  lastSavedTime: initialLastSavedTime,
  hasUnsavedChanges: false,
  currentProjectId: initialCurrentProjectId,
  isProjectOpen: false,
  projectsList: initialProjectsList,
  versions: loadVersionsForProject(initialCurrentProjectId),
  openProject: (projectId: string) => {
    get().loadProject(projectId);
    set({ isProjectOpen: true });
  },
  closeProject: () => set({ isProjectOpen: false }),

  activeSceneId: initialActiveSceneId,
  scenes: initialScenes,
  createScene: (name) => set((state) => {
    const newSceneId = `scene_${Date.now()}`;
    const newScene = { id: newSceneId, name, objects: JSON.parse(JSON.stringify(defaultScene)), rootObjects: [initialImageTargetId] };
    
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

    // Auto-persist scene updates directly to storage
    const projectData = {
      id: state.currentProjectId,
      name: state.settings.projectName,
      objects: newScene.objects,
      rootObjects: newScene.rootObjects,
      settings: state.settings,
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
      activeSceneId: newSceneId,
      objects: newScene.objects,
      rootObjects: newScene.rootObjects,
      selectedObjectId: null,
      selectedObjectIds: [],
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

    // Auto-persist scene updates directly to storage
    const projectData = {
      id: state.currentProjectId,
      name: state.settings.projectName,
      objects: targetObjects,
      rootObjects: targetScene.rootObjects,
      settings: state.settings,
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

  // Snapping defaults
  gridSnapEnabled: false,
  gridSnapIncrement: 0.1,
  rotationSnapEnabled: false,
  rotationSnapIncrement: 15,
  
  isAssetBrowserOpen: false,
  setIsAssetBrowserOpen: (open) => set({ isAssetBrowserOpen: open }),
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

    let newType = obj.type;
    let newProps = { ...obj.properties };

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
    } else if (newAsset.properties) {
      if (newAsset.type) newType = newAsset.type as any;
      newProps = {
        ...newProps,
        ...newAsset.properties
      };
    }

    const updatedObj: SceneObject = {
      ...obj,
      name: newAsset.name || obj.name,
      type: newType,
      position: preservedPosition,
      rotation: preservedRotation,
      scale: preservedScale,
      parentId: preservedParentId,
      children: preservedChildren,
      properties: newProps
    };

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      objects: {
        ...state.objects,
        [targetObjectId]: updatedObj
      },
      replaceTargetObjectId: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Replaced asset on "${obj.name}" preserving transform!` }]
    };
  }),
  overlayGridEnabled: false,
  overlayGridSize: 50,
  hudDebugGridEnabled: false,

  // Camera & View modes
  cameraType: 'perspective',
  wireframeEnabled: false,
  collisionDebuggerEnabled: false,
  editorTheme: 'dark',
  
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
    }

    // Insert target object
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
      past: newPast,
      future: [], // Clear redo stack on new action
      hasUnsavedChanges: true
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

    return {
      objects: newObjects,
      rootObjects: state.rootObjects.filter(rootId => rootId !== id),
      selectedObjectId: isSelectedDeleted ? null : state.selectedObjectId,
      selectedObjectIds: state.selectedObjectIds.filter(x => newObjects[x]),
      selectedObjectRef: isSelectedDeleted ? null : state.selectedObjectRef,
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
        selectedObjectRef: null
      };
    }

    return { 
      selectedObjectId: id,
      selectedObjectIds: id ? [id] : [],
      selectedObjectRef: state.selectedObjectId === id ? state.selectedObjectRef : null,
      activeStateId: state.selectedObjectId === id ? state.activeStateId : null
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

      newObjects[draggedId] = {
        ...draggedObj,
        parentId: null
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

    const isDragged2D = ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(draggedObj.type);
    const isTarget2D = ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(targetObj.type);

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

    newObjects[draggedId] = {
      ...newObjects[draggedId],
      parentId: targetId
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
        });
      } else {
        const obj = targetObjects[0];
        const newPos = [...obj.position] as [number, number, number];
        newPos[axisIdx] = 0;
        newObjects[obj.id] = {
          ...obj,
          position: newPos
        };
      }
    }

    return {
      objects: newObjects,
      past: newPast,
      future: [],
      hasUnsavedChanges: true
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
      });
    }

    return {
      objects: newObjects,
      past: newPast,
      future: [],
      hasUnsavedChanges: true
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
  setPreviewMode: (preview) => set({ isPreviewMode: preview }),
  
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
    return {
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

  createProject: (name, templateType) => {
    const newId = 'project-' + uuidv4();
    const { objects, rootObjects } = generateTemplate(name, templateType);
    
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

      const projectData = {
        id: newId,
        name,
        objects,
        rootObjects,
        settings: {
          projectName: name,
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
        settings: {
          projectName: name,
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
            name: 'Image Target',
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

  setGridSnapEnabled: (enabled) => set({ gridSnapEnabled: enabled }),
  setGridSnapIncrement: (increment) => set({ gridSnapIncrement: increment }),
  setRotationSnapEnabled: (enabled) => set({ rotationSnapEnabled: enabled }),
  setRotationSnapIncrement: (increment) => set({ rotationSnapIncrement: increment }),

  setOverlayGridEnabled: (enabled) => set({ overlayGridEnabled: enabled }),
  setOverlayGridSize: (size) => set({ overlayGridSize: size }),
  setHudDebugGridEnabled: (enabled) => set({ hudDebugGridEnabled: enabled }),

  setCameraType: (cameraType) => set({ cameraType }),
  setWireframeEnabled: (enabled) => set({ wireframeEnabled: enabled }),
  setCollisionDebuggerEnabled: (enabled) => set({ collisionDebuggerEnabled: enabled }),
  toggleEditorTheme: () => set((state) => ({ editorTheme: state.editorTheme === 'dark' ? 'light' : 'dark' })),

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
}));
