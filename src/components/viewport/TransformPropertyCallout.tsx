import React from 'react';
import * as THREE from 'three';
import { Move, RotateCw, Maximize2, Zap, Layers, Globe, Box } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

/**
 * Ultra-clean, high-visibility 2D HUD Transform Callout.
 * Features a clear visual indicator for the active axis of interaction
 * and active local/world coordinate space indicator.
 */
export function TransformHUDCallout() {
  const callout = useEditorStore((state) => state.activeTransformCallout);
  const activeTransformAxis = useEditorStore((state) => state.activeTransformAxis);
  const transformSpace = useEditorStore((state) => state.transformSpace);

  if (!callout || !callout.active) {
    // If user is hovering an axis before dragging, show an unobtrusive active axis hint
    if (activeTransformAxis) {
      const isX = activeTransformAxis.includes('X');
      const isY = activeTransformAxis.includes('Y');
      const isZ = activeTransformAxis.includes('Z');
      const isAll = activeTransformAxis === 'XYZ';

      return (
        <div
          id="transform-hud-hover-axis"
          className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="bg-[#121218]/95 backdrop-blur-md border border-white/15 rounded-full px-3.5 py-1 shadow-xl flex items-center gap-2 text-white">
            {/* Active Axis Indicator Pill */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider ${
              isAll
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : isX && !isY && !isZ
                ? 'bg-red-500/25 text-red-300 border border-red-500/50'
                : isY && !isX && !isZ
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                : isZ && !isX && !isY
                ? 'bg-blue-500/25 text-blue-300 border border-blue-500/50'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-ping ${
                isAll ? 'bg-purple-400' : isX && !isY && !isZ ? 'bg-red-400' : isY && !isX && !isZ ? 'bg-emerald-400' : isZ && !isX && !isY ? 'bg-blue-400' : 'bg-cyan-400'
              }`} />
              <span>{isAll ? 'XYZ (All Axes)' : activeTransformAxis.length > 1 ? `Plane: ${activeTransformAxis}` : `Axis: ${activeTransformAxis}`}</span>
            </div>

            <span className="text-[11px] text-gray-300 font-sans">
              Drag to transform in <strong className="uppercase text-white font-mono">{transformSpace}</strong> space
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  const { mode, axis, selectedCount, x, y, z, deltaX, deltaY, deltaZ, unit, isSnapped, snapLabel, space } = callout;
  const currentSpace = space || transformSpace;

  const formatVal = (num: number) => {
    if (isNaN(num)) return '0.00';
    return num.toFixed(mode === 'rotate' ? 1 : 2);
  };

  const formatDelta = (delta?: number) => {
    if (delta === undefined || Math.abs(delta) < 0.005) return null;
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(mode === 'rotate' ? 1 : 2)}`;
  };

  // Determine active axes from the gizmo manipulation axis (e.g., 'X', 'Y', 'Z', 'XY', 'XYZ')
  const rawAxis = (axis || activeTransformAxis || '').toUpperCase();
  
  // Calculate which specific axes are actively being changed
  const isXChanging = rawAxis.includes('X') || (Math.abs(deltaX ?? 0) > 0.0005 && !rawAxis);
  const isYChanging = rawAxis.includes('Y') || (Math.abs(deltaY ?? 0) > 0.0005 && !rawAxis);
  const isZChanging = rawAxis.includes('Z') || (Math.abs(deltaZ ?? 0) > 0.0005 && !rawAxis);

  // Is it a uniform 3D scale or all-axis transformation?
  const isUniformScale = mode === 'scale' && (rawAxis === 'XYZ' || (!rawAxis && (isXChanging || (!isXChanging && !isYChanging && !isZChanging))));

  // High-contrast badge color for active axis
  const getAxisTheme = () => {
    if (rawAxis === 'XYZ' || isUniformScale) {
      return { bg: 'bg-purple-500/25', border: 'border-purple-500/60', text: 'text-purple-300', dot: 'bg-purple-400', label: 'XYZ Uniform' };
    }
    if (rawAxis === 'XY') {
      return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-300', dot: 'bg-amber-400', label: 'Plane: X-Y' };
    }
    if (rawAxis === 'XZ') {
      return { bg: 'bg-pink-500/20', border: 'border-pink-500/50', text: 'text-pink-300', dot: 'bg-pink-400', label: 'Plane: X-Z' };
    }
    if (rawAxis === 'YZ') {
      return { bg: 'bg-teal-500/20', border: 'border-teal-500/50', text: 'text-teal-300', dot: 'bg-teal-400', label: 'Plane: Y-Z' };
    }
    if (rawAxis === 'X' || (isXChanging && !isYChanging && !isZChanging)) {
      return { bg: 'bg-red-500/25', border: 'border-red-500/60', text: 'text-red-300', dot: 'bg-red-400', label: 'Axis: X' };
    }
    if (rawAxis === 'Y' || (isYChanging && !isXChanging && !isZChanging)) {
      return { bg: 'bg-emerald-500/25', border: 'border-emerald-500/60', text: 'text-emerald-300', dot: 'bg-emerald-400', label: 'Axis: Y' };
    }
    if (rawAxis === 'Z' || (isZChanging && !isXChanging && !isYChanging)) {
      return { bg: 'bg-blue-500/25', border: 'border-blue-500/60', text: 'text-blue-300', dot: 'bg-blue-400', label: 'Axis: Z' };
    }
    return { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-300', dot: 'bg-blue-400', label: rawAxis || 'Active' };
  };

  const axisTheme = getAxisTheme();

  return (
    <div
      id="transform-hud-callout"
      className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="bg-[#121218]/95 backdrop-blur-md border border-white/15 rounded-full px-3.5 py-1.5 shadow-2xl flex items-center gap-2.5 text-white">
        {/* Mode Icon & Label */}
        <div className="flex items-center gap-1.5">
          {mode === 'translate' && (
            <span className="text-blue-400">
              <Move size={13} />
            </span>
          )}
          {mode === 'rotate' && (
            <span className="text-emerald-400">
              <RotateCw size={13} />
            </span>
          )}
          {mode === 'scale' && (
            <span className="text-purple-400">
              <Maximize2 size={13} />
            </span>
          )}
          <span className="text-[11px] font-bold text-white/90 uppercase tracking-wide">
            {mode === 'translate' ? 'Move' : mode === 'rotate' ? 'Rotate' : 'Scale'}
          </span>
        </div>

        {/* Clear Active Axis Indicator Badge */}
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider border shadow-xs ${axisTheme.bg} ${axisTheme.border} ${axisTheme.text}`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${axisTheme.dot}`} />
          <span>{axisTheme.label}</span>
        </div>

        {/* Local / World Coordinate Space Badge */}
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
          currentSpace === 'local'
            ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
            : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
        }`}>
          {currentSpace === 'local' ? <Box size={10} /> : <Globe size={10} />}
          <span className="uppercase tracking-wider">{currentSpace}</span>
        </div>

        {/* Multi-object count if transforming multiple objects simultaneously */}
        {selectedCount && selectedCount > 1 && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Layers size={9} /> {selectedCount}
          </span>
        )}

        <div className="h-3 w-px bg-white/20" />

        {/* Active Axis & Value Only */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {isUniformScale ? (
            <div className="flex items-center gap-1">
              <span className="text-purple-300 font-bold">{formatVal(x)}{unit}</span>
              {formatDelta(deltaX) && (
                <span className="text-[10px] text-purple-400 font-medium">({formatDelta(deltaX)})</span>
              )}
            </div>
          ) : (
            <>
              {/* Only show X if actively being changed */}
              {isXChanging && (
                <div className="flex items-center gap-1">
                  <span className="text-red-400 font-bold text-[10px] bg-red-500/15 px-1 rounded">X</span>
                  <span className="font-bold text-white/95">{formatVal(x)}{unit}</span>
                  {formatDelta(deltaX) && (
                    <span className="text-[10px] text-red-300 font-medium">({formatDelta(deltaX)})</span>
                  )}
                </div>
              )}

              {/* Only show Y if actively being changed */}
              {isYChanging && (
                <div className="flex items-center gap-1">
                  <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/15 px-1 rounded">Y</span>
                  <span className="font-bold text-white/95">{formatVal(y)}{unit}</span>
                  {formatDelta(deltaY) && (
                    <span className="text-[10px] text-emerald-300 font-medium">({formatDelta(deltaY)})</span>
                  )}
                </div>
              )}

              {/* Only show Z if actively being changed */}
              {isZChanging && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-400 font-bold text-[10px] bg-blue-500/15 px-1 rounded">Z</span>
                  <span className="font-bold text-white/95">{formatVal(z)}{unit}</span>
                  {formatDelta(deltaZ) && (
                    <span className="text-[10px] text-blue-300 font-medium">({formatDelta(deltaZ)})</span>
                  )}
                </div>
              )}

              {/* Fallback if no specific delta detected yet (e.g. right on pointer-down) */}
              {!isXChanging && !isYChanging && !isZChanging && (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white/95">
                    {mode === 'rotate' ? `${formatVal(z)}°` : `${formatVal(x)}${unit}`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Snap Indicator */}
        {isSnapped && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
            <Zap size={9} />
            <span>{snapLabel || 'Snap'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Over-gizmo 3D callout is disabled to keep the 3D viewport clean and non-distracting.
 */
export function TransformGizmoCallout3D(_props: { target: THREE.Object3D | null }) {
  return null;
}

/**
 * Compatibility alias for mobile HUD.
 */
export function MobileTransformHUD() {
  return <TransformHUDCallout />;
}

