import React from 'react';
import {
  Compass,
  Shapes,
  Type,
  Layers,
  Palette,
  Grid,
  Music,
  Sun,
  Sparkles,
  Search,
  Upload,
  LayoutGrid,
  Box,
  MousePointerClick,
  Video,
  Play,
  Armchair,
  Image as ImageIcon
} from 'lucide-react';
import { CategoryTab, DockCategory } from './assetTypes';

interface CanvaDockProps {
  activeTab: CategoryTab;
  onSelectTab: (tab: CategoryTab) => void;
  counts?: Record<string, number>;
}

export const CANVA_DOCK_CATEGORIES: DockCategory[] = [
  {
    id: 'discover',
    label: 'Discover',
    iconName: 'Compass',
    accentColor: '#38bdf8',
    gradient: 'from-sky-500 to-blue-600',
    group: 'primary',
  },
  {
    id: 'architecture',
    label: 'Furniture',
    iconName: 'Armchair',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    group: 'primary',
  },
  {
    id: 'primitives',
    label: 'Primitives',
    iconName: 'Box',
    accentColor: '#a855f7',
    gradient: 'from-purple-500 to-indigo-600',
    group: 'primary',
  },
  {
    id: 'media',
    label: 'Media / YT',
    iconName: 'Video',
    accentColor: '#ef4444',
    gradient: 'from-red-500 to-rose-600',
    group: 'primary',
  },
  {
    id: 'buttons',
    label: 'Buttons',
    iconName: 'MousePointerClick',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-600',
    group: 'primary',
  },
  {
    id: 'elements',
    label: 'Elements',
    iconName: 'Shapes',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    group: 'primary',
  },
  {
    id: 'text-styles',
    label: 'Text',
    iconName: 'Type',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    group: 'primary',
  },
  {
    id: 'ui-kits',
    label: 'UI Kits',
    iconName: 'Layers',
    accentColor: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    group: 'primary',
  },
  {
    id: 'materials',
    label: 'Materials',
    iconName: 'Palette',
    accentColor: '#a855f7',
    gradient: 'from-purple-500 to-indigo-600',
    group: 'library',
  },
  {
    id: 'textures',
    label: 'Textures',
    iconName: 'Grid',
    accentColor: '#14b8a6',
    gradient: 'from-teal-500 to-emerald-600',
    group: 'library',
  },
  {
    id: 'audio',
    label: 'Audio',
    iconName: 'Music',
    accentColor: '#f43f5e',
    gradient: 'from-rose-500 to-pink-600',
    group: 'library',
  },
  {
    id: 'lighting',
    label: 'Lighting',
    iconName: 'Sun',
    accentColor: '#eab308',
    gradient: 'from-yellow-500 to-amber-600',
    group: 'library',
  },
  {
    id: 'markers',
    label: 'Markers',
    iconName: 'Sparkles',
    accentColor: '#6366f1',
    gradient: 'from-indigo-500 to-purple-600',
    group: 'library',
  },
  {
    id: 'sketchfab',
    label: '3D Models',
    iconName: 'Box',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-600',
    group: 'primary',
  },
  {
    id: 'uploads',
    label: 'Uploads',
    iconName: 'Upload',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    group: 'system',
  },
  {
    id: 'layouts',
    label: 'Layouts',
    iconName: 'LayoutGrid',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-fuchsia-600',
    group: 'system',
  },
];

export function CanvaDock({ activeTab, onSelectTab, counts = {} }: CanvaDockProps) {
  const renderIcon = (name: string, size = 20, className = '') => {
    switch (name) {
      case 'Compass': return <Compass size={size} className={className} />;
      case 'Armchair': return <Armchair size={size} className={className} />;
      case 'Box': return <Box size={size} className={className} />;
      case 'Video': return <Video size={size} className={className} />;
      case 'MousePointerClick': return <MousePointerClick size={size} className={className} />;
      case 'Shapes': return <Shapes size={size} className={className} />;
      case 'Type': return <Type size={size} className={className} />;
      case 'Layers': return <Layers size={size} className={className} />;
      case 'Palette': return <Palette size={size} className={className} />;
      case 'Grid': return <Grid size={size} className={className} />;
      case 'Music': return <Music size={size} className={className} />;
      case 'Sun': return <Sun size={size} className={className} />;
      case 'Sparkles': return <Sparkles size={size} className={className} />;
      case 'Search': return <Search size={size} className={className} />;
      case 'Upload': return <Upload size={size} className={className} />;
      case 'LayoutGrid': return <LayoutGrid size={size} className={className} />;
      default: return <Shapes size={size} className={className} />;
    }
  };

  return (
    <div className="w-full md:w-[72px] bg-[#0E0E12] border-b md:border-b-0 md:border-r border-white/10 flex flex-row md:flex-col items-center py-1.5 md:py-3 px-2 md:px-0 shrink-0 select-none z-20 overflow-x-auto md:overflow-y-auto overflow-y-hidden md:overflow-x-hidden scrollbar-none gap-1 md:gap-0">
      {/* Mini App Branding - Hidden on small mobile screens to maximize category horizontal space */}
      <div className="hidden md:flex mb-3 px-2 flex-col items-center shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-white/20">
          <Sparkles size={18} className="animate-pulse" />
        </div>
      </div>

      <div className="hidden md:block w-8 h-px bg-white/10 mb-2 shrink-0" />

      {/* Dock navigation icon buttons */}
      <div className="flex flex-row md:flex-col gap-1 md:gap-1.5 w-auto md:w-full px-0 md:px-1.5 items-center">
        {CANVA_DOCK_CATEGORIES.map((cat) => {
          const isActive = activeTab === cat.id;
          const count = counts[cat.id];

          return (
            <button
              key={cat.id}
              onClick={() => onSelectTab(cat.id)}
              className={`relative group shrink-0 min-w-[56px] md:w-full py-1.5 md:py-2 px-2 md:px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white/10 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title={cat.label}
            >
              {/* Active Indicator Bar - Left on desktop, Bottom on mobile */}
              {isActive && (
                <>
                  <div 
                    className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                    style={{ backgroundColor: cat.accentColor }}
                  />
                  <div 
                    className="md:hidden absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-5 rounded-t-full"
                    style={{ backgroundColor: cat.accentColor }}
                  />
                </>
              )}

              {/* Icon */}
              <div 
                className="p-0.5 md:p-1 rounded-lg transition-transform duration-200 group-hover:scale-110"
                style={{ color: isActive ? cat.accentColor : undefined }}
              >
                {renderIcon(cat.iconName, 17, isActive ? 'stroke-[2.2]' : 'stroke-[1.8]')}
              </div>

              {/* Label */}
              <span className={`text-[9px] md:text-[10px] font-medium tracking-tight mt-0.5 transition-colors whitespace-nowrap ${
                isActive ? 'text-white font-semibold' : 'text-gray-400 group-hover:text-gray-200'
              }`}>
                {cat.label}
              </span>

              {/* Badge count if available */}
              {count !== undefined && count > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[13px] h-[13px] px-1 bg-white/10 border border-white/10 text-gray-300 text-[7.5px] font-mono rounded-full flex items-center justify-center">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
