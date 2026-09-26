import { Real3DAsset, AssetCategory } from './types';
import { ELECTRONICS_ASSETS } from './electronicsAssets';
import { HOUSEHOLD_ASSETS } from './householdAssets';
import { MACHINES_ASSETS } from './machinesAssets';
import { VEHICLES_ASSETS } from './vehiclesAssets';
import { FURNITURE_ASSETS } from './furnitureAssets';
import { NATURE_ASSETS } from './natureAssets';
import { FACE_TRACKING_ASSETS } from './faceTrackingAssets';
import { ADVERTISING_RETAIL_ASSETS } from './advertisingAssets';
import { BUILDING_ASSETS, REALISTIC_BUILDINGS_ASSETS, CARTOON_BUILDINGS_ASSETS } from './buildingAssets';
import { FOOD_UTENSIL_ASSETS, REALISTIC_FOOD_UTENSILS_ASSETS, CARTOON_FOOD_UTENSILS_ASSETS } from './foodUtensilAssets';

export * from './types';
export { ELECTRONICS_ASSETS } from './electronicsAssets';
export { HOUSEHOLD_ASSETS } from './householdAssets';
export { MACHINES_ASSETS } from './machinesAssets';
export { 
  VEHICLES_ASSETS,
  EMERGENCY_VEHICLES,
  CARTOON_VEHICLES,
  REALISTIC_CARS,
  COMMERCIAL_VEHICLES,
  AVIATION_VEHICLES,
  MARITIME_VEHICLES,
  SPACE_VEHICLES,
  MICROMOBILITY_VEHICLES
} from './vehiclesAssets';
export { FURNITURE_ASSETS } from './furnitureAssets';
export { NATURE_ASSETS } from './natureAssets';
export { FACE_TRACKING_ASSETS } from './faceTrackingAssets';
export { ADVERTISING_RETAIL_ASSETS } from './advertisingAssets';
export { 
  BUILDING_ASSETS, 
  REALISTIC_BUILDINGS_ASSETS, 
  CARTOON_BUILDINGS_ASSETS 
} from './buildingAssets';
export {
  FOOD_UTENSIL_ASSETS,
  REALISTIC_FOOD_UTENSILS_ASSETS,
  CARTOON_FOOD_UTENSILS_ASSETS
} from './foodUtensilAssets';

export const REAL_3D_ASSETS: Real3DAsset[] = [
  ...ADVERTISING_RETAIL_ASSETS,
  ...FACE_TRACKING_ASSETS,
  ...ELECTRONICS_ASSETS,
  ...FURNITURE_ASSETS,
  ...HOUSEHOLD_ASSETS,
  ...MACHINES_ASSETS,
  ...VEHICLES_ASSETS,
  ...NATURE_ASSETS,
  ...BUILDING_ASSETS,
  ...FOOD_UTENSIL_ASSETS
];

export const ALL_REAL_3D_ASSETS = REAL_3D_ASSETS;

export const REAL_ASSET_CATEGORIES: AssetCategory[] = [
  'Advertising & Retail',
  'Face Tracking & Masks',
  'Electronics',
  'Furniture',
  'Household',
  'Machines & Industrial',
  'Vehicles',
  'Nature & Outdoor',
  'Realistic Buildings',
  'Cartoon Buildings',
  'Realistic Food & Utensils',
  'Cartoon Food & Treats'
];
