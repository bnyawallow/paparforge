import React from 'react';
import * as THREE from 'three';
import { Move, RotateCw, Maximize2, Zap, Layers } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

/**
 * Ultra-clean, transparent, non-distracting 2D HUD Transform Callout.
 * Rendered unobtrusively at the top of the viewport canvas.
 * Strictly displays ONLY the axis and value currently being manipulated.
 * Static values are completely ignored to avoid clutter and never obstruct the 3D Gizmo.
 */
export function TransformHUDCallout() {
  const callout = useEditorStore((state) => state.activeTransformCallout);

  if (!callout || !callout.active) {
    return null;
  }

  const { mode, axis, selectedCount, x, y, z, deltaX, deltaY, deltaZ, unit, isSnapped, snapLabel } = callout;

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
  const rawAxis = (axis || '').toUpperCase();
  
  // Calculate which specific axes are actively being changed
  const isXChanging = rawAxis.includes('X') || (Math.abs(deltaX ?? 0) > 0.0005 && !rawAxis);
  const isYChanging = rawAxis.includes('Y') || (Math.abs(deltaY ?? 0) > 0.0005 && !rawAxis);
  const isZChanging = rawAxis.includes('Z') || (Math.abs(deltaZ ?? 0) > 0.0005 && !rawAxis);

  // Is it a uniform 3D scale or all-axis transformation?
  const isUniformScale = mode === 'scale' && (rawAxis === 'XYZ' || (!rawAxis && (isXChanging || (!isXChanging && !isYChanging && !isZChanging))));

  return (
    <div
      id="transform-hud-callout"
      className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="bg-black/25 backdrop-blur-sm border border-white/5 rounded-full px-3 py-1 shadow-sm flex items-center gap-2 text-white/90">
        {/* Mode Icon & Label */}
        <div className="flex items-center gap-1">
          {mode === 'translate' && (
            <span className="text-blue-400">
              <Move size={12} />
            </span>
          )}
          {mode === 'rotate' && (
            <span className="text-emerald-400">
              <RotateCw size={12} />
            </span>
          )}
          {mode === 'scale' && (
            <span className="text-purple-400">
              <Maximize2 size={12} />
            </span>
          )}
          <span className="text-[10px] font-medium text-white/70 capitalize">
            {mode === 'translate' ? 'Move' : mode === 'rotate' ? 'Rotate' : 'Scale'}
          </span>
        </div>

        {/* Multi-object count if transforming multiple objects simultaneously */}
        {selectedCount && selectedCount > 1 && (
          <span className="text-[9px] font-semibold px-1 py-0.2 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20 flex items-center gap-0.5">
            <Layers size={8} /> {selectedCount}
          </span>
        )}

        <div className="h-2.5 w-px bg-white/10" />

        {/* Active Axis & Value Only - Static axes ignored */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {isUniformScale ? (
            <div className="flex items-center gap-1">
              <span className="text-purple-300 font-semibold">{formatVal(x)}{unit}</span>
              {formatDelta(deltaX) && (
                <span className="text-[9px] text-purple-400/80">({formatDelta(deltaX)})</span>
              )}
            </div>
          ) : (
            <>
              {/* Only show X if actively being changed */}
              {isXChanging && (
                <div className="flex items-center gap-1">
                  <span className="text-red-400 font-bold text-[10px]">X</span>
                  <span className="font-semibold text-white/95">{formatVal(x)}{unit}</span>
                  {formatDelta(deltaX) && (
                    <span className="text-[9px] text-red-300/80">({formatDelta(deltaX)})</span>
                  )}
                </div>
              )}

              {/* Only show Y if actively being changed */}
              {isYChanging && (
                <div className="flex items-center gap-1">
                  <span className="text-emerald-400 font-bold text-[10px]">Y</span>
                  <span className="font-semibold text-white/95">{formatVal(y)}{unit}</span>
                  {formatDelta(deltaY) && (
                    <span className="text-[9px] text-emerald-300/80">({formatDelta(deltaY)})</span>
                  )}
                </div>
              )}

              {/* Only show Z if actively being changed */}
              {isZChanging && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-400 font-bold text-[10px]">Z</span>
                  <span className="font-semibold text-white/95">{formatVal(z)}{unit}</span>
                  {formatDelta(deltaZ) && (
                    <span className="text-[9px] text-blue-300/80">({formatDelta(deltaZ)})</span>
                  )}
                </div>
              )}

              {/* Fallback if no specific delta detected yet (e.g. right on pointer-down) */}
              {!isXChanging && !isYChanging && !isZChanging && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-white/95">
                    {mode === 'rotate' ? `${formatVal(z)}°` : `${formatVal(x)}${unit}`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Snap Indicator */}
        {isSnapped && (
          <div className="flex items-center gap-0.5 text-[9px] font-semibold text-amber-300 bg-amber-500/15 px-1 py-0.2 rounded-full border border-amber-500/20">
            <Zap size={8} />
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
