import React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalDistributeCenter,
  AlignHorizontalDistributeCenter,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

interface AlignmentToolbarProps {
  compact?: boolean;
  className?: string;
  showTitle?: boolean;
}

export const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({
  compact = false,
  className = '',
  showTitle = true
}) => {
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const selectedObjectIds = useEditorStore((state) => state.selectedObjectIds);
  const alignSelectedObjects = useEditorStore((state) => state.alignSelectedObjects);
  const distributeSelectedObjects = useEditorStore((state) => state.distributeSelectedObjects);
  const centerSelectedOnTarget = useEditorStore((state) => state.centerSelectedOnTarget);
  const snapSelectedToGround = useEditorStore((state) => state.snapSelectedToGround);

  const selectionCount = selectedObjectIds.length > 0
    ? selectedObjectIds.length
    : (selectedObjectId ? 1 : 0);

  const hasMultiple = selectionCount >= 2;
  const hasSelection = selectionCount >= 1;

  if (!hasSelection && !compact) {
    return null;
  }

  return (
    <div
      id="alignment-toolbar"
      className={`flex items-center gap-1.5 p-1.5 rounded-xl bg-gray-900/90 border border-gray-700/70 backdrop-blur-md shadow-2xl text-gray-200 select-none ${className}`}
    >
      {showTitle && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 border-r border-gray-700/60 mr-0.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-semibold tracking-wide text-gray-300">
            Align
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-mono font-medium">
            {selectionCount}
          </span>
        </div>
      )}

      {/* Horizontal Alignment Group */}
      <div className="flex items-center gap-0.5 bg-gray-800/60 rounded-lg p-0.5 border border-gray-700/40">
        <button
          id="btn-align-left"
          type="button"
          onClick={() => alignSelectedObjects('x', 'min')}
          disabled={!hasSelection}
          className="p-1.5 rounded-md hover:bg-gray-700/80 active:bg-blue-600/30 text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Align Left (X Min)"
          aria-label="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          id="btn-align-center-x"
          type="button"
          onClick={() => alignSelectedObjects('x', 'center')}
          disabled={!hasSelection}
          className="p-1.5 rounded-md hover:bg-gray-700/80 active:bg-blue-600/30 text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Align Center Horizontally (X Center)"
          aria-label="Align Center Horizontally"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          id="btn-align-right"
          type="button"
          onClick={() => alignSelectedObjects('x', 'max')}
          disabled={!hasSelection}
          className="p-1.5 rounded-md hover:bg-gray-700/80 active:bg-blue-600/30 text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Align Right (X Max)"
          aria-label="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      {/* Vertical Alignment Group */}
      <div className="flex items-center gap-0.5 bg-gray-800/60 rounded-lg p-0.5 border border-gray-700/40">
        <button
          id="btn-align-top"
          type="button"
          onClick={() => alignSelectedObjects('y', 'max')}
          disabled={!hasSelection}
          className="p-1.5 rounded-md hover:bg-gray-700/80 active:bg-blue-600/30 text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Align Top (Y Max)"
          aria-label="Align Top"
        >
          <AlignStartVertical className="w-4 h-4" />
        </button>

        <button
          id="btn-align-center-y"
          type="button"
          onClick={() => alignSelectedObjects('y', 'center')}
          disabled={!hasSelection}
          className="p-1.5 rounded-md hover:bg-gray-700/80 active:bg-blue-600/30 text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Align Center Vertically (Y Center)"
          aria-label="Align Center Vertically"
        >
          <AlignCenterVertical className="w-4 h-4" />
        </button>

        <button
          id="btn-align-bottom"
          type="button"
          onClick={() => alignSelectedObjects('y', 'min')}
          disabled={!hasSelection}
          className="p-1.5 rounded-md hover:bg-gray-700/80 active:bg-blue-600/30 text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Align Bottom (Y Min / Ground)"
          aria-label="Align Bottom"
        >
          <AlignEndVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Distribution (Requires 3+ items) */}
      <div className="flex items-center gap-0.5 bg-gray-800/60 rounded-lg p-0.5 border border-gray-700/40">
        <button
          id="btn-distribute-h"
          type="button"
          onClick={() => distributeSelectedObjects('x')}
          disabled={selectionCount < 3}
          className="p-1.5 rounded-md hover:bg-gray-700/80 active:bg-blue-600/30 text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
          title={selectionCount < 3 ? "Select 3+ objects to distribute horizontally" : "Distribute Horizontally (Even Spacing)"}
          aria-label="Distribute Horizontally"
        >
          <AlignHorizontalDistributeCenter className="w-4 h-4" />
        </button>

        <button
          id="btn-distribute-v"
          type="button"
          onClick={() => distributeSelectedObjects('y')}
          disabled={selectionCount < 3}
          className="p-1.5 rounded-md hover:bg-gray-700/80 active:bg-blue-600/30 text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
          title={selectionCount < 3 ? "Select 3+ objects to distribute vertically" : "Distribute Vertically (Even Spacing)"}
          aria-label="Distribute Vertically"
        >
          <AlignVerticalDistributeCenter className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Centering & Grounding */}
      <div className="flex items-center gap-0.5 bg-gray-800/60 rounded-lg p-0.5 border border-gray-700/40">
        <button
          id="btn-center-target"
          type="button"
          onClick={() => centerSelectedOnTarget()}
          disabled={!hasSelection}
          className="p-1.5 rounded-md hover:bg-gray-700/80 active:bg-blue-600/30 text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
          title="Center on AR Target Center"
          aria-label="Center on AR Target"
        >
          <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
          {!compact && <span className="text-[10px] font-medium hidden sm:inline">Center</span>}
        </button>

        <button
          id="btn-snap-ground"
          type="button"
          onClick={() => snapSelectedToGround()}
          disabled={!hasSelection}
          className="p-1.5 rounded-md hover:bg-gray-700/80 active:bg-blue-600/30 text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
          title="Flush Bottom to Ground (Z=0)"
          aria-label="Flush Bottom to Ground"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          {!compact && <span className="text-[10px] font-medium hidden sm:inline">Ground</span>}
        </button>
      </div>
    </div>
  );
};
