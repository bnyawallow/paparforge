import React, { useState, useEffect, useMemo } from 'react';
import { PRINT_MEDIA_PRESETS, PrintMediaPreset, findMatchingPreset } from '../../lib/printMediaPresets';
import { Sliders, Check, Ruler, Info, Search, X } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { cn } from '../../lib/utils';

interface PrintMediaPresetPickerProps {
  value: number; // In meters
  onChange: (widthInMeters: number) => void;
  compact?: boolean;
}

// Curated popular presets for fast 1-tap mobile/desktop selection
const POPULAR_PRESET_IDS = [
  'a4-document', 
  'business-card', 
  'medium-poster', 
  'pkg-small-box', 
  'birthday-card', 
  'restaurant-menu',
  'pkg-tshirt',
  'id-lanyard-badge'
];

export function PrintMediaPresetPicker({ value, onChange }: PrintMediaPresetPickerProps) {
  const editorTheme = useEditorStore((state) => state.editorTheme);
  const isLight = editorTheme === 'light';

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(() => findMatchingPreset(value)?.id || null);
  const currentPreset = PRINT_MEDIA_PRESETS.find(p => p.id === selectedPresetId) || findMatchingPreset(value);
  const isCustom = !currentPreset;
  const [unit, setUnit] = useState<'cm' | 'in' | 'mm' | 'm'>('cm');
  const [customInputValue, setCustomInputValue] = useState<string>(() => {
    return (value * 100).toFixed(1);
  });
  const [showCustomDrawer, setShowCustomDrawer] = useState(isCustom);
  const [selectedCategory, setSelectedCategory] = useState<string>('Popular');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync custom input when value or unit changes externally
  useEffect(() => {
    if (unit === 'cm') {
      setCustomInputValue((value * 100).toFixed(1));
    } else if (unit === 'mm') {
      setCustomInputValue((value * 1000).toFixed(0));
    } else if (unit === 'in') {
      setCustomInputValue((value * 39.3701).toFixed(1));
    } else {
      setCustomInputValue(value.toFixed(3));
    }

    const p = PRINT_MEDIA_PRESETS.find(p => p.id === selectedPresetId);
    if (!p || Math.abs(p.widthMeters - value) > 0.005) {
      const match = findMatchingPreset(value);
      setSelectedPresetId(match ? match.id : null);
    }
  }, [value, unit, selectedPresetId]);

  const handleSelectPreset = (preset: PrintMediaPreset) => {
    setSelectedPresetId(preset.id);
    setShowCustomDrawer(false);
    onChange(preset.widthMeters);
  };

  const handleCustomSubmit = (rawStr: string, currentUnit: 'cm' | 'in' | 'mm' | 'm') => {
    setCustomInputValue(rawStr);
    const parsed = parseFloat(rawStr);
    if (isNaN(parsed) || parsed <= 0) return;

    let inMeters = parsed;
    if (currentUnit === 'cm') inMeters = parsed / 100;
    else if (currentUnit === 'mm') inMeters = parsed / 1000;
    else if (currentUnit === 'in') inMeters = parsed / 39.3701;

    // Constrain to reasonable real-world bounds: 1mm to 50m
    const clamped = Math.max(0.001, Math.min(50, inMeters));
    onChange(clamped);
  };

  const handleUnitChange = (newUnit: 'cm' | 'in' | 'mm' | 'm') => {
    setUnit(newUnit);
    if (newUnit === 'cm') {
      setCustomInputValue((value * 100).toFixed(1));
    } else if (newUnit === 'mm') {
      setCustomInputValue((value * 1000).toFixed(0));
    } else if (newUnit === 'in') {
      setCustomInputValue((value * 39.3701).toFixed(1));
    } else {
      setCustomInputValue(value.toFixed(3));
    }
  };

  const categories = [
    { id: 'Popular', label: '🔥 Popular' },
    { id: 'All', label: 'All Presets' },
    { id: 'Standard Paper', label: '📄 Documents' },
    { id: 'Posters & Displays', label: '🖼️ Posters' },
    { id: 'Cards & Stationery', label: '💳 Cards' },
    { id: 'Packaging & Merch', label: '📦 Packaging' },
    { id: 'Flyers & Menus', label: '📜 Menus & Flyers' },
    { id: 'Books & Magazines', label: '📖 Books & Mags' },
    { id: 'Retail & Storefront', label: '🛍️ Retail' },
    { id: 'Newspaper & Ads', label: '📰 Press' }
  ];

  const filteredPresets = useMemo(() => {
    let result = PRINT_MEDIA_PRESETS;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.label.toLowerCase().includes(q) ||
        p.popularName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.recommendedUse.toLowerCase().includes(q)
      );
    } else if (selectedCategory === 'Popular') {
      result = PRINT_MEDIA_PRESETS.filter(p => POPULAR_PRESET_IDS.includes(p.id));
    } else if (selectedCategory !== 'All') {
      result = PRINT_MEDIA_PRESETS.filter(p => p.category === selectedCategory);
    }

    return result;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Active Selection Summary Card */}
      <div 
        className={cn(
          "p-2.5 sm:p-3 rounded-xl border flex items-center justify-between transition-colors",
          isLight 
            ? "bg-gray-50 border-gray-200 text-gray-800" 
            : "bg-[#141416] border-white/10 text-white"
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-xl shrink-0">{currentPreset?.icon || '📏'}</span>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold truncate">
                {currentPreset ? currentPreset.label : 'Custom Dimensions'}
              </span>
              {currentPreset && (
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30 font-semibold whitespace-nowrap">
                  {currentPreset.aspectRatioLabel}
                </span>
              )}
            </div>
            <span className={cn("text-[10px] font-mono mt-0.5 truncate", isLight ? "text-gray-500" : "text-gray-400")}>
              {(value * 100).toFixed(1)} cm • {(value * 39.3701).toFixed(1)}" • {(value * 1000).toFixed(0)} mm
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomDrawer(!showCustomDrawer)}
          className={cn(
            "min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95",
            showCustomDrawer || isCustom
              ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
              : isLight
                ? "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
          )}
          title="Configure custom width in cm, inches, mm, or meters"
        >
          <Sliders size={13} />
          <span>Custom</span>
        </button>
      </div>

      {/* Search & Category Filter Header */}
      <div className="flex flex-col gap-2">
        <div className="relative flex items-center">
          <Search size={13} className={cn("absolute left-2.5 pointer-events-none", isLight ? "text-gray-400" : "text-gray-500")} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search print media (A4, Box, T-shirt, Poster, Menu...)"
            className={cn(
              "w-full h-8 rounded-lg pl-8 pr-7 text-xs outline-none border transition-all",
              isLight
                ? "bg-white border-gray-200 text-gray-900 focus:border-blue-500"
                : "bg-[#16161a] border-white/10 text-white focus:border-blue-500"
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-0.5 rounded-full text-gray-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        {!searchQuery && (
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "text-[10px] px-2.5 py-1 rounded-lg border font-medium whitespace-nowrap transition-all cursor-pointer active:scale-95 shrink-0",
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white border-blue-500 shadow-xs font-semibold"
                    : isLight
                      ? "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preset Cards Grid - Responsive touch-friendly layout */}
      <div className="flex flex-col gap-1.5">
        {filteredPresets.length === 0 ? (
          <div className={cn("p-4 rounded-xl border text-center text-xs", isLight ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white/5 text-gray-400 border-white/10")}>
            No print media found matching "{searchQuery}". Try searching for A4, Poster, Box, Card, or Menu.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[220px] overflow-y-auto pr-0.5 scrollbar-thin">
            {filteredPresets.map((preset) => {
              const isSelected = currentPreset?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  title={`${preset.description}\nBest for: ${preset.recommendedUse}`}
                  className={cn(
                    "min-h-[58px] p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 cursor-pointer active:scale-98 select-none",
                    isSelected
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/40"
                      : isLight
                        ? "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                        : "bg-[#18181C] hover:bg-[#202026] border-white/5 hover:border-white/20 text-gray-300"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base">{preset.icon}</span>
                    {isSelected ? (
                      <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className={cn("text-[9px] font-mono font-medium", isLight ? "text-gray-400" : "text-gray-500")}>
                        {preset.widthCm}cm
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-semibold truncate leading-tight">
                      {preset.label}
                    </div>
                    <div className={cn("text-[9px] truncate mt-0.5", isLight ? "text-gray-400" : "text-gray-500")}>
                      {preset.aspectRatioLabel || `${preset.widthInches}"`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Dimensions Drawer */}
      {(showCustomDrawer || isCustom) && (
        <div 
          className={cn(
            "p-3 rounded-xl border flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150",
            isLight
              ? "bg-purple-50/70 border-purple-200 text-purple-900"
              : "bg-purple-950/20 border-purple-500/30 text-white"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold flex items-center gap-1.5 text-purple-400">
              <Ruler size={13} />
              Custom Width
            </span>

            {/* Unit Toggle Tabs */}
            <div className={cn("flex items-center rounded-lg p-0.5 border text-[10px] font-mono", isLight ? "bg-white border-purple-200" : "bg-black/40 border-white/10")}>
              {(['cm', 'in', 'mm', 'm'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleUnitChange(u)}
                  className={cn(
                    "min-h-[24px] px-2 py-0.5 rounded transition-all cursor-pointer",
                    unit === u
                      ? "bg-purple-600 text-white font-bold shadow-xs"
                      : isLight ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                step={unit === 'm' ? '0.001' : unit === 'mm' ? '1' : '0.1'}
                min="0.001"
                value={customInputValue}
                onChange={(e) => handleCustomSubmit(e.target.value, unit)}
                placeholder="Enter width..."
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-sm font-mono outline-none border transition-all pr-8",
                  isLight
                    ? "bg-white border-purple-300 text-gray-900 focus:border-purple-600"
                    : "bg-[#121216] border-white/20 text-white focus:border-purple-400"
                )}
              />
              <span className={cn("absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none", isLight ? "text-gray-400" : "text-gray-500")}>
                {unit}
              </span>
            </div>

            {/* Quick preset buttons for selected unit */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
              {unit === 'cm' && [5, 10, 15, 21, 50, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleCustomSubmit(val.toString(), 'cm')}
                  className={cn(
                    "min-h-[30px] px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer shrink-0 active:scale-95",
                    isLight 
                      ? "bg-white hover:bg-gray-100 text-gray-700 border-purple-200" 
                      : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                  )}
                >
                  {val}cm
                </button>
              ))}
              {unit === 'in' && [2, 4, 6, 8.5, 12, 24].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleCustomSubmit(val.toString(), 'in')}
                  className={cn(
                    "min-h-[30px] px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer shrink-0 active:scale-95",
                    isLight 
                      ? "bg-white hover:bg-gray-100 text-gray-700 border-purple-200" 
                      : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                  )}
                >
                  {val}"
                </button>
              ))}
              {unit === 'mm' && [50, 89, 100, 148, 210, 297].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleCustomSubmit(val.toString(), 'mm')}
                  className={cn(
                    "min-h-[30px] px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer shrink-0 active:scale-95",
                    isLight 
                      ? "bg-white hover:bg-gray-100 text-gray-700 border-purple-200" 
                      : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                  )}
                >
                  {val}mm
                </button>
              ))}
              {unit === 'm' && [0.1, 0.2, 0.5, 1, 2, 3].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleCustomSubmit(val.toString(), 'm')}
                  className={cn(
                    "min-h-[30px] px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer shrink-0 active:scale-95",
                    isLight 
                      ? "bg-white hover:bg-gray-100 text-gray-700 border-purple-200" 
                      : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                  )}
                >
                  {val}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-[10px] leading-tight text-gray-400">
            <Info size={11} className="text-purple-400 shrink-0 mt-0.5" />
            <span>
              Real-world physical width calibrates 3D content to match your physical printed artwork or target.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

