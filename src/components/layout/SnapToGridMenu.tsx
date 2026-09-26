import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Magnet, 
  Grid3x3, 
  RotateCw, 
  Maximize2, 
  Move, 
  ArrowDownToLine, 
  Crosshair, 
  Check, 
  ChevronDown, 
  Zap,
  Layers,
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SnapToGridMenuProps {
  compact?: boolean;
  className?: string;
  direction?: 'down' | 'up' | 'auto';
  align?: 'left' | 'right' | 'center';
}

export function SnapToGridMenu({ 
  compact = false, 
  className,
  direction = 'down',
  align = 'left'
}: SnapToGridMenuProps) {
  const t = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number }>({ left: 0, width: 336 });

  const {
    surfaceSnapEnabled,
    setSurfaceSnapEnabled,
    toggleSurfaceSnap,
    gridSnapEnabled,
    gridSnapIncrement,
    rotationSnapEnabled,
    rotationSnapIncrement,
    scaleSnapEnabled,
    scaleSnapIncrement,
    scaleGridVisualEnabled,
    setGridSnapEnabled,
    setGridSnapIncrement,
    setRotationSnapEnabled,
    setRotationSnapIncrement,
    setScaleSnapEnabled,
    setScaleSnapIncrement,
    setScaleGridVisualEnabled,
    snapSelectedToGrid,
    snapSelectedToGround,
    centerSelectedOnTarget,
    selectedObjectId,
    selectedObjectIds,
    lockedAxes,
    toggleLockAxis,
    unlockAllAxes,
    addToast
  } = useEditorStore();

  const selectedCount = selectedObjectIds.length > 0 
    ? selectedObjectIds.length 
    : (selectedObjectId ? 1 : 0);

  const calculateCoords = useCallback(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(340, window.innerWidth - 24);
    
    let left = rect.left;
    if (align === 'center') {
      left = rect.left + rect.width / 2 - popoverWidth / 2;
    } else if (align === 'right') {
      left = rect.right - popoverWidth;
    }

    // Clamp within viewport
    left = Math.max(12, Math.min(window.innerWidth - popoverWidth - 12, left));

    const isUp = direction === 'up' || (direction === 'auto' && rect.bottom + 360 > window.innerHeight);

    if (isUp) {
      setCoords({
        bottom: Math.max(8, window.innerHeight - rect.top + 8),
        left,
        width: popoverWidth
      });
    } else {
      setCoords({
        top: Math.max(8, rect.bottom + 8),
        left,
        width: popoverWidth
      });
    }
  }, [align, direction]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      calculateCoords();
    }
    setIsOpen(!isOpen);
  };

  // Calculate coordinates whenever menu opens or viewport resizes
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    calculateCoords();
    window.addEventListener('resize', calculateCoords);
    window.addEventListener('scroll', calculateCoords, true);

    return () => {
      window.removeEventListener('resize', calculateCoords);
      window.removeEventListener('scroll', calculateCoords, true);
    };
  }, [isOpen, calculateCoords]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent | PointerEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handleClickOutside);
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Position increments suitable for print advertising and spatial alignment
  const positionSnapPresets = [
    { label: '5 cm', value: 0.05, desc: 'Fine Print & Stickers' },
    { label: '10 cm', value: 0.10, desc: 'Standard Ad Elements' },
    { label: '12.5 cm', value: 0.125, desc: 'Brochure Columns' },
    { label: '25 cm', value: 0.25, desc: 'Medium Displays' },
    { label: '50 cm', value: 0.50, desc: 'Billboard / Large' },
    { label: '1.0 m', value: 1.0, desc: 'Architectural Grid' },
  ];

  // Rotation presets
  const rotationPresets = [
    { label: '15°', value: 15 },
    { label: '30°', value: 30 },
    { label: '45°', value: 45 },
    { label: '90°', value: 90 },
  ];

  // Scale presets
  const scalePresets = [
    { label: '0.05x', value: 0.05 },
    { label: '0.10x', value: 0.10 },
    { label: '0.25x', value: 0.25 },
    { label: '0.50x', value: 0.50 },
  ];

  const handleToggleMasterSnap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !gridSnapEnabled;
    setGridSnapEnabled(nextState);
    setRotationSnapEnabled(nextState);
    setScaleSnapEnabled(nextState);
    addToast(nextState ? `Snap to Grid ON (${gridSnapIncrement >= 1 ? `${gridSnapIncrement}m` : `${Math.round(gridSnapIncrement * 100)}cm`} / ${rotationSnapIncrement}°)` : 'Snap to Grid OFF');
  };

  const handleSnapSelectedNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCount === 0) {
      addToast('Select a 3D object first to snap to grid');
      return;
    }
    snapSelectedToGrid();
  };

  const handleCenterOnTarget = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCount === 0) {
      addToast('Select a 3D object first to center on target plane');
      return;
    }
    centerSelectedOnTarget();
  };

  const handleSnapToGround = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCount === 0) {
      addToast('Select a 3D object first to drop flush with base (Z=0)');
      return;
    }
    snapSelectedToGround();
  };

  const popoverContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: coords.bottom !== undefined ? 8 : -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: coords.bottom !== undefined ? 8 : -8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: coords.top !== undefined ? `${coords.top}px` : undefined,
            bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            maxHeight: '85vh',
            zIndex: 99999
          }}
          className="overflow-y-auto bg-[#141418]/98 backdrop-blur-2xl border border-[#2e2e38] rounded-2xl shadow-2xl p-3.5 text-gray-200 font-sans space-y-3.5 text-xs shadow-black/80 pointer-events-auto select-none"
        >
          {/* Header / Master Switch */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Grid3x3 size={14} />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs leading-none">Snap & Alignment Engine</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Spatial Print & 3D Mockup Placement</p>
              </div>
            </div>

            {/* Master Toggle Switch */}
            <button
              type="button"
              onClick={handleToggleMasterSnap}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all border cursor-pointer active:scale-95",
                gridSnapEnabled
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-sm shadow-cyan-500/30"
                  : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
              )}
            >
              {gridSnapEnabled ? "GRID ON" : "GRID OFF"}
            </button>
          </div>

          {/* Object-to-Surface Snapping Feature (Dedicated Toggle) */}
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Magnet size={14} className={surfaceSnapEnabled ? "text-cyan-400 animate-pulse" : "text-gray-400"} />
                <div>
                  <span className="font-bold text-white text-xs">Surface Alignment Snapping</span>
                  <p className="text-[9.5px] text-cyan-300/80">Auto-aligns flush to print target & faces</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = !surfaceSnapEnabled;
                  setSurfaceSnapEnabled(next);
                  addToast(next ? "Surface Snapping: ENABLED" : "Surface Snapping: DISABLED");
                }}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer active:scale-95",
                  surfaceSnapEnabled
                    ? "bg-cyan-500 text-white border-cyan-300 shadow-xs"
                    : "bg-black/40 text-gray-400 border-white/10 hover:text-white"
                )}
              >
                {surfaceSnapEnabled ? "ACTIVE" : "OFF"}
              </button>
            </div>
          </div>

          {/* Quick Action Buttons for Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <span>Instant Alignment Actions</span>
              {selectedCount > 0 ? (
                <span className="text-cyan-400 lowercase">({selectedCount} selected)</span>
              ) : (
                <span className="text-gray-500 lowercase">(no selection)</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={handleSnapSelectedNow}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-cyan-500/15 to-blue-500/10 hover:from-cyan-500/25 hover:to-blue-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white font-semibold transition-all cursor-pointer select-none active:scale-95 group text-center"
                title="Align selected 3D object(s) to nearest grid increment"
              >
                <Zap size={14} className="mb-1 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] leading-tight font-bold">Snap Grid</span>
                <span className="text-[8px] text-cyan-400/80 font-mono mt-0.5">Shift+G</span>
              </button>

              <button
                type="button"
                onClick={handleCenterOnTarget}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-200 hover:text-white font-semibold transition-all cursor-pointer select-none active:scale-95 group text-center"
                title="Center selected object on AR Advertising target plane"
              >
                <Crosshair size={14} className="mb-1 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] leading-tight">Center Target</span>
                <span className="text-[8px] text-gray-400 font-mono mt-0.5">[0, 0]</span>
              </button>

              <button
                type="button"
                onClick={handleSnapToGround}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-200 hover:text-white font-semibold transition-all cursor-pointer select-none active:scale-95 group text-center"
                title="Snap base of selected object flush with canvas surface (Z=0)"
              >
                <ArrowDownToLine size={14} className="mb-1 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] leading-tight">Flush Base</span>
                <span className="text-[8px] text-gray-400 font-mono mt-0.5">Z=0</span>
              </button>
            </div>
          </div>

          {/* Transform Axis Lock Section */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Lock size={11} className="text-amber-400 animate-pulse" />
                <span>Axis Lock (Move / Rotate / Scale)</span>
              </span>
              {(lockedAxes?.x || lockedAxes?.y || lockedAxes?.z) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    unlockAllAxes();
                    addToast('Unlocked all transform axes');
                  }}
                  className="text-[9px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Unlock All
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {/* X Axis Lock */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLockAxis('x');
                  const willBeLocked = !lockedAxes?.x;
                  addToast(willBeLocked ? 'X Axis Locked (Red)' : 'X Axis Unlocked');
                }}
                className={cn(
                  "py-1.5 px-2 rounded-lg font-mono text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 select-none",
                  lockedAxes?.x
                    ? "bg-red-600/35 text-white border-red-400 shadow-sm shadow-red-500/30 ring-1 ring-red-400/50"
                    : "bg-red-950/20 text-red-400/80 border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
                )}
                title="Lock/Unlock X Axis (Red) - Prevents transformation along X"
              >
                <span className={cn("w-2 h-2 rounded-full", lockedAxes?.x ? "bg-white shadow-xs" : "bg-red-500")} />
                <span>X</span>
                {lockedAxes?.x ? <Lock size={10} className="text-white" /> : <Unlock size={10} className="opacity-40" />}
              </button>

              {/* Y Axis Lock */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLockAxis('y');
                  const willBeLocked = !lockedAxes?.y;
                  addToast(willBeLocked ? 'Y Axis Locked (Green)' : 'Y Axis Unlocked');
                }}
                className={cn(
                  "py-1.5 px-2 rounded-lg font-mono text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 select-none",
                  lockedAxes?.y
                    ? "bg-emerald-600/35 text-white border-emerald-400 shadow-sm shadow-emerald-500/30 ring-1 ring-emerald-400/50"
                    : "bg-emerald-950/20 text-emerald-400/80 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300"
                )}
                title="Lock/Unlock Y Axis (Green) - Prevents transformation along Y"
              >
                <span className={cn("w-2 h-2 rounded-full", lockedAxes?.y ? "bg-white shadow-xs" : "bg-emerald-500")} />
                <span>Y</span>
                {lockedAxes?.y ? <Lock size={10} className="text-white" /> : <Unlock size={10} className="opacity-40" />}
              </button>

              {/* Z Axis Lock */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLockAxis('z');
                  const willBeLocked = !lockedAxes?.z;
                  addToast(willBeLocked ? 'Z Axis Locked (Blue)' : 'Z Axis Unlocked');
                }}
                className={cn(
                  "py-1.5 px-2 rounded-lg font-mono text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 select-none",
                  lockedAxes?.z
                    ? "bg-blue-600/35 text-white border-blue-400 shadow-sm shadow-blue-500/30 ring-1 ring-blue-400/50"
                    : "bg-blue-950/20 text-blue-400/80 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-300"
                )}
                title="Lock/Unlock Z Axis (Blue) - Prevents transformation along Z"
              >
                <span className={cn("w-2 h-2 rounded-full", lockedAxes?.z ? "bg-white shadow-xs" : "bg-blue-500")} />
                <span>Z</span>
                {lockedAxes?.z ? <Lock size={10} className="text-white" /> : <Unlock size={10} className="opacity-40" />}
              </button>
            </div>
          </div>

          {/* Position Snap Increments */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Move size={11} className="text-blue-400" />
                <span>Position Grid Step</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {gridSnapIncrement >= 1 ? `${gridSnapIncrement}m` : `${Math.round(gridSnapIncrement * 100)}cm`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {positionSnapPresets.map((preset) => {
                const isSelected = Math.abs(gridSnapIncrement - preset.value) < 0.001;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGridSnapIncrement(preset.value);
                      setGridSnapEnabled(true);
                      addToast(`Grid snap step set to ${preset.label} (${preset.desc})`);
                    }}
                    className={cn(
                      "px-2 py-1.5 rounded-lg text-left transition-all cursor-pointer border flex flex-col justify-between active:scale-95",
                      isSelected
                        ? "bg-blue-600/35 text-white border-blue-400 shadow-xs ring-1 ring-blue-400/50"
                        : "bg-white/5 text-gray-300 border-white/5 hover:bg-white/10 hover:border-white/15"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[11px]">{preset.label}</span>
                      {isSelected && <Check size={10} className="text-cyan-400 shrink-0" />}
                    </div>
                    <span className="text-[8px] text-gray-400 truncate mt-0.5">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rotation & Scale Snapping Settings */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10">
            {/* Rotation Snap */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400">
                <span className="flex items-center gap-1">
                  <RotateCw size={10} className="text-emerald-400" />
                  <span>Rotation</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRotationSnapEnabled(!rotationSnapEnabled);
                  }}
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer",
                    rotationSnapEnabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 text-gray-500"
                  )}
                >
                  {rotationSnapEnabled ? `${rotationSnapIncrement}°` : "Off"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1">
                {rotationPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRotationSnapIncrement(preset.value);
                      setRotationSnapEnabled(true);
                      addToast(`Rotation snap set to ${preset.label}`);
                    }}
                    className={cn(
                      "py-1 rounded text-center text-[10px] font-semibold border transition-all cursor-pointer active:scale-95",
                      rotationSnapEnabled && rotationSnapIncrement === preset.value
                        ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50 ring-1 ring-emerald-500/30"
                        : "bg-white/5 text-gray-400 border-transparent hover:text-white hover:bg-white/10"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Snap */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400">
                <span className="flex items-center gap-1">
                  <Maximize2 size={10} className="text-purple-400" />
                  <span>Scale Step</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setScaleSnapEnabled(!scaleSnapEnabled);
                  }}
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer",
                    scaleSnapEnabled ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-white/5 text-gray-500"
                  )}
                >
                  {scaleSnapEnabled ? `${scaleSnapIncrement}x` : "Off"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1">
                {scalePresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setScaleSnapIncrement(preset.value);
                      setScaleSnapEnabled(true);
                      addToast(`Scale snap set to ${preset.label}`);
                    }}
                    className={cn(
                      "py-1 rounded text-center text-[10px] font-semibold border transition-all cursor-pointer active:scale-95",
                      scaleSnapEnabled && Math.abs(scaleSnapIncrement - preset.value) < 0.01
                        ? "bg-purple-600/30 text-purple-300 border-purple-500/50 ring-1 ring-purple-500/30"
                        : "bg-white/5 text-gray-400 border-transparent hover:text-white hover:bg-white/10"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Grid Helpers Toggle */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-gray-300 hover:text-white">
              <input
                type="checkbox"
                checked={scaleGridVisualEnabled}
                onChange={(e) => setScaleGridVisualEnabled(e.target.checked)}
                className="rounded bg-white/10 border-white/20 text-cyan-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Show Aspect & Alignment Grid</span>
            </label>

            <span className="text-[9px] text-gray-500 font-mono">Press 'G' in 3D</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn("relative inline-block text-left select-none", className)} ref={menuRef}>
      {/* Trigger Button Group */}
      {compact ? (
        <div className="flex items-center rounded-xl overflow-hidden border border-white/10 bg-[#16161a]/90">
          <button
            type="button"
            onClick={handleToggleMasterSnap}
            className={cn(
              "flex flex-col items-center justify-center min-w-[40px] min-h-[40px] py-1 px-1.5 transition-all cursor-pointer shrink-0 active:scale-95",
              gridSnapEnabled || surfaceSnapEnabled
                ? "bg-cyan-600/30 text-cyan-400 font-bold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
            title={gridSnapEnabled ? `Snap Active (${gridSnapIncrement >= 1 ? `${gridSnapIncrement}m` : `${Math.round(gridSnapIncrement * 100)}cm`}) - Click to toggle` : (surfaceSnapEnabled ? "Surface Snapping Active" : "Toggle Snap-to-Grid")}
          >
            <div className="relative">
              <Magnet size={15} className={gridSnapEnabled || surfaceSnapEnabled ? "text-cyan-400 animate-pulse" : "text-gray-400"} />
              {(gridSnapEnabled || surfaceSnapEnabled) && (
                <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
            <span className="text-[9px] mt-0.5 whitespace-nowrap font-mono">
              {gridSnapEnabled ? (gridSnapIncrement >= 1 ? `${gridSnapIncrement}m` : `${Math.round(gridSnapIncrement * 100)}cm`) : (surfaceSnapEnabled ? 'Snap' : 'Off')}
            </span>
          </button>
          <button
            type="button"
            onClick={toggleDropdown}
            className={cn(
              "px-1.5 py-2.5 text-gray-400 hover:text-white border-l border-white/10 transition-colors cursor-pointer active:scale-95 flex items-center justify-center",
              isOpen ? "bg-cyan-500/25 text-cyan-300" : "hover:bg-white/5"
            )}
            title="Configure Snap Options & Alignment Presets"
          >
            <ChevronDown size={11} className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")} />
          </button>
        </div>
      ) : (
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleToggleMasterSnap}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-l-xl text-xs font-bold transition-all cursor-pointer active:scale-95 border",
              gridSnapEnabled || surfaceSnapEnabled
                ? "bg-cyan-600/25 text-cyan-400 border-cyan-500/40 shadow-sm shadow-cyan-500/20"
                : "bg-[#16161a]/90 text-gray-300 hover:text-white border-[#2A2A30] hover:border-cyan-500/40"
            )}
            title={gridSnapEnabled ? `Snap-to-Grid: Active (${gridSnapIncrement >= 1 ? `${gridSnapIncrement}m` : `${Math.round(gridSnapIncrement * 100)}cm`})` : "Enable Snap-to-Grid [G]"}
          >
            <Magnet size={14} className={cn(gridSnapEnabled || surfaceSnapEnabled ? "text-cyan-400 animate-pulse" : "text-gray-400")} />
            <span className="hidden sm:inline">Snap</span>
            {gridSnapEnabled && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                {gridSnapIncrement >= 1 ? `${gridSnapIncrement}m` : `${Math.round(gridSnapIncrement * 100)}cm`}
              </span>
            )}
          </button>

          {/* Dropdown Chevron Opener */}
          <button
            type="button"
            onClick={toggleDropdown}
            className={cn(
              "px-1.5 py-1.5 rounded-r-xl border-y border-r text-xs transition-all cursor-pointer active:scale-95",
              gridSnapEnabled || surfaceSnapEnabled
                ? "bg-cyan-600/30 text-cyan-300 border-cyan-500/40"
                : "bg-[#16161a]/90 text-gray-400 hover:text-white border-[#2A2A30] hover:border-cyan-500/40",
              isOpen ? "bg-cyan-500/30 text-white border-cyan-400" : ""
            )}
            title="Open Snap-to-Grid Options & Alignment Settings"
          >
            <ChevronDown size={13} className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")} />
          </button>
        </div>
      )}

      {/* Render Popover into Portal so bottom nav or any overflow container never clips it */}
      {typeof document !== 'undefined' && createPortal(popoverContent, document.body)}
    </div>
  );
}
