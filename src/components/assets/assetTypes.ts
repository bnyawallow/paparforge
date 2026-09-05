import { AssetType } from '../../types';

export type CategoryTab = 
  | 'discover'
  | 'primitives'
  | 'media'
  | 'elements'
  | 'buttons'
  | 'text-styles'
  | 'ui-kits'
  | 'materials'
  | 'textures'
  | 'audio'
  | 'lighting'
  | 'markers'
  | 'sketchfab'
  | 'uploads'
  | 'layouts'
  | 'models'
  | 'templates'
  | 'icons'
  | '2d-icons';

export interface DockCategory {
  id: CategoryTab;
  label: string;
  iconName: string;
  badge?: number | string;
  gradient?: string;
  accentColor: string;
  group?: 'primary' | 'library' | 'system';
}

export interface UniversalAssetItem {
  id: string;
  name: string;
  category: CategoryTab;
  type: string;
  thumbnail?: string;
  previewUrl?: string;
  description?: string;
  tags?: string[];
  color?: string;
  badgeText?: string;
  meta?: any;
  onAdd: () => void;
}
