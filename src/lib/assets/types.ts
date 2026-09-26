import { SceneObject } from '../../types';

export type AssetCategory = 'Advertising & Retail' | 'Face Tracking & Masks' | 'Electronics' | 'Furniture' | 'Household' | 'Machines & Industrial' | 'Vehicles' | 'Nature & Outdoor' | 'Realistic Buildings' | 'Cartoon Buildings' | 'Realistic Food & Utensils' | 'Cartoon Food & Treats' | string;

export interface Real3DAsset {
  id: string;
  name: string;
  category: 'Electronics' | 'Household' | 'Machines & Industrial' | 'Vehicles' | 'Furniture' | 'Nature & Outdoor' | 'Face Tracking & Masks' | 'Advertising & Retail' | 'Realistic Buildings' | 'Cartoon Buildings' | 'Realistic Food & Utensils' | 'Cartoon Food & Treats' | string;
  description: string;
  badge: string;
  badgeColor?: string;
  icon: string;
  thumbnailUrl: string;
  modelUrl: string;
  previewColor: string;
  tags?: string[];
  categoryProportionFactor: number;
  maxPlacementPercent: number;
  faceAnchor?: 'head' | 'nose' | 'forehead' | 'chin' | 'leftEye' | 'rightEye' | 'mouth';
  createObject: (id: string, arTargetWidth?: number) => SceneObject;
}

export const BASE_ITEM_URL = 'https://raw.githubusercontent.com/pascalorg/editor/main/apps/editor/public/items';
export const BASE_KHRONOS_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models';
export const BASE_MODELVIEWER_URL = 'https://raw.githubusercontent.com/google/model-viewer/master/packages/shared-assets/models';

export function createRealAsset(
  id: string,
  name: string,
  category: string,
  description: string,
  badge: string,
  badgeColor: string,
  icon: string,
  thumbnailUrl: string,
  modelUrl: string,
  previewColor: string,
  categoryProportionFactor: number = 0.5,
  tags: string[] = [],
  faceAnchor?: 'head' | 'nose' | 'forehead' | 'chin' | 'leftEye' | 'rightEye' | 'mouth'
): Real3DAsset {
  const maxPlacementPercent = 50;

  return {
    id,
    name,
    category,
    description,
    badge,
    badgeColor,
    icon,
    thumbnailUrl,
    modelUrl,
    previewColor,
    tags,
    categoryProportionFactor,
    maxPlacementPercent,
    faceAnchor,
    createObject: (objId: string, arTargetWidth: number = 5.0): SceneObject => {
      const maxLimitRatio = maxPlacementPercent / 100;
      const effectiveFactor = Math.min(1.0, Math.max(0.1, categoryProportionFactor));
      const targetScale = Math.min(0.50 * arTargetWidth, arTargetWidth * maxLimitRatio * effectiveFactor);
      const s = Number(targetScale.toFixed(3));

      const isVeh = category === 'Vehicles' || (tags && tags.some(t => ['vehicle', 'car', 'truck', 'ambulance', 'buggy', 'bike', 'scooter'].includes(t.toLowerCase())));

      return {
        id: objId,
        name,
        type: 'model',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: null,
        tags: tags || (isVeh ? ['vehicle'] : []),
        properties: {
          url: modelUrl,
          modelUrl: modelUrl,
          behavior: isVeh ? 'drive' : 'none',
          isDrivable: isVeh,
          collisionEnabled: true,
          boundingShape: 'box',
          colliderSize: isVeh ? [2.0, 1.4, 0.9] : [1.0, 1.0, 1.0],
          speed: 1.4,
          turnSpeed: 2.0,
          autoplay: false,
          isInteractive: isVeh,
          categoryProportionFactor: effectiveFactor,
          maxPlacementPercent: maxPlacementPercent,
          scaledProportionally: true,
          initialArTargetWidth: arTargetWidth,
          defaultScaleRatio: s,
          faceAnchor: faceAnchor
        }
      };
    }
  };
}
