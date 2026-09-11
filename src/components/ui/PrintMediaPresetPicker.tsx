import React, { useState, useEffect } from 'react';
import { PRINT_MEDIA_PRESETS, PrintMediaPreset, findMatchingPreset } from '../../lib/printMediaPresets';
import { Sliders, Sparkles, Check, Ruler, Info } from 'lucide-react';

interface PrintMediaPresetPickerProps {
  value: number; // In meters
  onChange: (widthInMeters: number) => void;
  compact?: boolean;
}

export function PrintMediaPresetPicker({ value, onChange, compact = false }: PrintMediaPresetPickerProps) {
  const currentPreset = findMatchingPreset(value);
  const isCustom = !currentPreset;
  const [unit, setUnit] = useState<'m' | 'cm' | 'in'>('cm');
  const [customInputValue, setCustomInputValue] = useState<string>(() => {
    return (value * 100).toFixed(1);
  });
  const [showCustomDrawer, setShowCustomDrawer] = useState(isCustom);

  // Sync custom input when value or unit changes externally
  useEffect(() => {
    if (unit === 'cm') {
      setCustomInputValue((value * 100).toFixed(1));
    } else if (unit === 'in') {
      setCustomInputValue((value * 39.3701).toFixed(1));
    } else {
      setCustomInputValue(value.toFixed(3));
    }
  }, [value, unit]);

  const handleSelectPreset = (preset: PrintMediaPreset) => {
    setShowCustomDrawer(false);
    onChange(preset.widthMeters);
  };

  const handleCustomSubmit = (rawStr: string, currentUnit: 'm' | 'cm' | 'in') => {
    setCustomInputValue(rawStr);
    const parsed = parseFloat(rawStr);
    if (isNaN(parsed) || parsed <= 0) return;

    let inMeters = parsed;
    if (currentUnit === 'cm') inMeters = parsed / 100;
    else if (currentUnit === 'in') inMeters = parsed / 39.3701;

    // Constrain to reasonable real-world bounds: 1cm to 50m
    const clamped = Math.max(0.01, Math.min(50, inMeters));
    onChange(clamped);
  };

  const handleUnitChange = (newUnit: 'm' | 'cm' | 'in') => {
    setUnit(newUnit);
    if (newUnit === 'cm') {
      setCustomInputValue((value * 100).toFixed(1));
    } else if (newUnit === 'in') {
      setCustomInputValue((value * 39.3701).toFixed(1));
    } else {
      setCustomInputValue(value.toFixed(3));
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Active Selection Summary Card */}
      <div className="p-2.5 rounded-xl bg-[#141416] border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{currentPreset?.icon || '📏'}</span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              {currentPreset ? currentPreset.label : 'Custom Physical Size'}
              {currentPreset && (
                <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 font-medium">
                  {currentPreset.aspectRatioLabel}
                </span>
              )}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              {(value * 100).toFixed(1)} cm • {(value * 39.3701).toFixed(1)}" • {value.toFixed(3)} m
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomDrawer(!showCustomDrawer)}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
            showCustomDrawer || isCustom
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
          }`}
          title="Configure custom size in cm, inches, or meters"
        >
          <Sliders size={11} />
          <span>Custom</span>
        </button>
      </div>

      {/* Popular Preset Grid */}
      <div className={`grid ${compact ? 'grid-cols-2 gap-1.5' : 'grid-cols-3 gap-1.5'}`}>
        {PRINT_MEDIA_PRESETS.map((preset) => {
          const isSelected = currentPreset?.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              title={`${preset.description} (${preset.widthCm} cm / ${preset.widthInches}")`}
              className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 group ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500/70 shadow-sm shadow-blue-500/20 text-white'
                  : 'bg-[#18181C] hover:bg-[#202026] border-white/5 hover:border-white/20 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">{preset.icon}</span>
                {isSelected ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <Check size={9} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-gray-500 group-hover:text-gray-400">
                    {preset.widthCm}cm
                  </span>
                )}
              </div>
              <div>
                <div className="text-[11px] font-semibold truncate leading-tight">
                  {preset.label}
                </div>
                <div className="text-[9px] text-gray-500 truncate mt-0.5">
                  {preset.aspectRatioLabel || `${preset.widthInches}"`}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Size Drawer */}
      {(showCustomDrawer || isCustom) && (
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
              <Ruler size={12} className="text-purple-400" />
              Custom Target Dimensions
            </span>

            {/* Unit Toggle Tabs */}
            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10 text-[9px] font-mono">
              {(['cm', 'in', 'm'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleUnitChange(u)}
                  className={`px-2 py-0.5 rounded ${
                    unit === u
                      ? 'bg-purple-600 text-white font-bold shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                step={unit === 'm' ? '0.001' : '0.1'}
                min="0.001"
                value={customInputValue}
                onChange={(e) => handleCustomSubmit(e.target.value, unit)}
                placeholder="Enter width..."
                className="w-full bg-[#121216] border border-white/20 focus:border-purple-400 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono pointer-events-none">
                {unit}
              </span>
            </div>

            {/* Common quick sizes in current unit */}
            <div className="flex items-center gap-1">
              {unit === 'cm' && [10, 15, 21, 50, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleCustomSubmit(val.toString(), 'cm')}
                  className="px-1.5 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-gray-300 border border-white/10"
                >
                  {val}cm
                </button>
              ))}
              {unit === 'in' && [4, 6, 8.5, 12, 24].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleCustomSubmit(val.toString(), 'in')}
                  className="px-1.5 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-gray-300 border border-white/10"
                >
                  {val}"
                </button>
              ))}
              {unit === 'm' && [0.1, 0.2, 0.5, 1, 2].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleCustomSubmit(val.toString(), 'm')}
                  className="px-1.5 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-gray-300 border border-white/10"
                >
                  {val}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-[10px] text-gray-400 leading-tight">
            <Info size={11} className="text-purple-400 shrink-0 mt-0.5" />
            <span>
              Real-world size scales 3D virtual content relative to the physical printed target detected by your device's camera.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
