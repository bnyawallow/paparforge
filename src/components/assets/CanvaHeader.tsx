import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  Upload, 
  Grid3X3, 
  LayoutGrid, 
  Layers, 
  Image as ImageIcon,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { CategoryTab } from './assetTypes';
import { CANVA_DOCK_CATEGORIES } from './CanvaDock';

interface CanvaHeaderProps {
  activeTab: CategoryTab;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onClearSearch: () => void;
  onOpenUpload: () => void;
  onOpenMarkerManager: () => void;
  onClose: () => void;
  density: 'comfortable' | 'compact';
  onToggleDensity: () => void;
  filterChips?: string[];
  activeFilterChip?: string;
  onSelectFilterChip?: (chip: string) => void;
}

export function CanvaHeader({
  activeTab,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onOpenUpload,
  onOpenMarkerManager,
  onClose,
  density,
  onToggleDensity,
  filterChips = [],
  activeFilterChip = 'All',
  onSelectFilterChip,
}: CanvaHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentCategory = CANVA_DOCK_CATEGORIES.find(c => c.id === activeTab) || {
    label: 'Assets',
    accentColor: '#3b82f6',
  };

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="border-b border-white/10 bg-[#121217] flex flex-col shrink-0 z-10 select-none">
      {/* Top action row */}
      <div className="h-14 px-5 flex items-center justify-between gap-4">
        {/* Left: Category Title */}
        <div className="flex items-center gap-2.5 min-w-[180px]">
          <div 
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: currentCategory.accentColor }}
          />
          <h2 className="text-sm font-bold tracking-wide text-white uppercase font-mono">
            {currentCategory.label}
          </h2>
        </div>

        {/* Center: Canva-Style Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Search ${currentCategory.label.toLowerCase()} or all assets... (Press '/' to focus)`}
              className="w-full bg-[#181820] hover:bg-[#1E1E28] focus:bg-[#1E1E28] text-xs text-white placeholder-gray-400 pl-9 pr-9 py-2 rounded-xl border border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 text-gray-400 hover:text-white p-0.5 rounded-md hover:bg-white/10 transition-colors"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMarkerManager}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 rounded-xl text-xs font-medium transition-all"
            title="Manage tracking marker posters & images"
          >
            <ImageIcon size={13} className="text-indigo-400" />
            <span>Markers</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
            title="Import 3D models, textures, audio or images"
          >
            <Plus size={14} />
            <span>Upload</span>
          </button>

          {/* Density toggle */}
          <button
            onClick={onToggleDensity}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title={density === 'comfortable' ? 'Switch to compact grid' : 'Switch to comfortable grid'}
          >
            {density === 'comfortable' ? <LayoutGrid size={16} /> : <Grid3X3 size={16} />}
          </button>

          {/* Close modal */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-1"
            title="Close asset browser (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Filter Chips Sub-Bar (If available for active category) */}
      {filterChips.length > 0 && onSelectFilterChip && (
        <div className="px-5 py-2 border-t border-white/5 bg-[#0F0F14] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {filterChips.map((chip) => {
            const isSelected = activeFilterChip === chip;
            return (
              <button
                key={chip}
                onClick={() => onSelectFilterChip(chip)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
