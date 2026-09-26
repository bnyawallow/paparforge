import React, { useState, useRef, useEffect } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Layers,
  ChevronDown,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useTheme } from '../../lib/theme';

export const AlignmentMenu: React.FC = () => {
  const t = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const selectedObjectIds = useEditorStore((state) => state.selectedObjectIds);
  const alignSelectedObjects = useEditorStore((state) => state.alignSelectedObjects);
  const distributeSelectedObjects = useEditorStore((state) => state.distributeSelectedObjects);
  const centerSelectedOnTarget = useEditorStore((state) => state.centerSelectedOnTarget);
  const snapSelectedToGround = useEditorStore((state) => state.snapSelectedToGround);

  const selectionCount = selectedObjectIds.length > 0 
    ? selectedObjectIds.length 
    : (selectedObjectId ? 1 : 0);

  const hasSelection = selectionCount >= 1;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        id="btn-alignment-menu"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2 py-1 rounded-lg border transition-all duration-100 flex items-center gap-1.5 cursor-pointer text-xs font-bold shrink-0 ${
          isOpen
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : t.isLight
            ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
            : 'bg-blue-950/30 hover:bg-blue-950/50 text-blue-400 border-blue-500/30'
        }`}
        title="Object Alignment & Layout Distribution Tools"
        aria-label="Object Alignment Menu"
      >
        <Layers size={13} className="text-blue-400" />
        <span className="text-[11px] whitespace-nowrap">Align</span>
        {selectionCount > 1 && (
          <span className="px-1 py-0.2 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-mono">
            {selectionCount}
          </span>
        )}
        <ChevronDown size={11} className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id="alignment-menu-dropdown"
          className="absolute left-0 mt-1.5 w-64 rounded-xl bg-[#18181C] border border-[#2F2F38] shadow-2xl backdrop-blur-xl z-50 p-2.5 text-gray-200 space-y-2.5 animate-in fade-in-50 zoom-in-95 duration-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers size={13} className="text-blue-400" />
              <span>Layout & Alignment</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              {selectionCount > 0 ? `${selectionCount} selected` : 'None selected'}
            </span>
          </div>

          {!hasSelection && (
            <div className="text-[11px] text-gray-400 italic bg-gray-900/60 p-2 rounded-lg border border-gray-800/80">
              Select one or more objects in the viewport to enable alignment.
            </div>
          )}

          {/* Horizontal Alignment */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
              Horizontal Align
            </div>
            <div className="grid grid-cols-3 gap-1 bg-gray-900/60 p-1 rounded-lg border border-gray-800">
              <button
                id="menu-align-left"
                disabled={!hasSelection}
                onClick={() => {
                  alignSelectedObjects('x', 'min');
                  setIsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-1.5 rounded-md hover:bg-gray-800 active:bg-blue-600/30 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all text-[10px] font-medium gap-1"
                title="Align Left (X Min)"
              >
                <AlignLeft size={14} className="text-blue-400" />
                <span>Left</span>
              </button>

              <button
                id="menu-align-center-x"
                disabled={!hasSelection}
                onClick={() => {
                  alignSelectedObjects('x', 'center');
                  setIsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-1.5 rounded-md hover:bg-gray-800 active:bg-blue-600/30 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all text-[10px] font-medium gap-1"
                title="Align Center Horizontally"
              >
                <AlignCenter size={14} className="text-blue-400" />
                <span>Center</span>
              </button>

              <button
                id="menu-align-right"
                disabled={!hasSelection}
                onClick={() => {
                  alignSelectedObjects('x', 'max');
                  setIsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-1.5 rounded-md hover:bg-gray-800 active:bg-blue-600/30 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all text-[10px] font-medium gap-1"
                title="Align Right (X Max)"
              >
                <AlignRight size={14} className="text-blue-400" />
                <span>Right</span>
              </button>
            </div>
          </div>

          {/* Vertical Alignment */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
              Vertical Align
            </div>
            <div className="grid grid-cols-3 gap-1 bg-gray-900/60 p-1 rounded-lg border border-gray-800">
              <button
                id="menu-align-top"
                disabled={!hasSelection}
                onClick={() => {
                  alignSelectedObjects('y', 'max');
                  setIsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-1.5 rounded-md hover:bg-gray-800 active:bg-blue-600/30 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all text-[10px] font-medium gap-1"
                title="Align Top (Y Max)"
              >
                <AlignStartVertical size={14} className="text-purple-400" />
                <span>Top</span>
              </button>

              <button
                id="menu-align-center-y"
                disabled={!hasSelection}
                onClick={() => {
                  alignSelectedObjects('y', 'center');
                  setIsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-1.5 rounded-md hover:bg-gray-800 active:bg-blue-600/30 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all text-[10px] font-medium gap-1"
                title="Align Center Vertically"
              >
                <AlignCenterVertical size={14} className="text-purple-400" />
                <span>Middle</span>
              </button>

              <button
                id="menu-align-bottom"
                disabled={!hasSelection}
                onClick={() => {
                  alignSelectedObjects('y', 'min');
                  setIsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-1.5 rounded-md hover:bg-gray-800 active:bg-blue-600/30 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all text-[10px] font-medium gap-1"
                title="Align Bottom (Y Min)"
              >
                <AlignEndVertical size={14} className="text-purple-400" />
                <span>Bottom</span>
              </button>
            </div>
          </div>

          {/* Distribution Group */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
              Distribute Spacing
            </div>
            <div className="grid grid-cols-2 gap-1 bg-gray-900/60 p-1 rounded-lg border border-gray-800">
              <button
                id="menu-distribute-h"
                disabled={selectionCount < 3}
                onClick={() => {
                  distributeSelectedObjects('x');
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-1.5 rounded-md hover:bg-gray-800 active:bg-blue-600/30 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all text-[10px] font-medium"
                title={selectionCount < 3 ? "Requires 3+ objects" : "Distribute Horizontally"}
              >
                <AlignHorizontalDistributeCenter size={14} className="text-cyan-400" />
                <span>Horizontal</span>
              </button>

              <button
                id="menu-distribute-v"
                disabled={selectionCount < 3}
                onClick={() => {
                  distributeSelectedObjects('y');
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-1.5 rounded-md hover:bg-gray-800 active:bg-blue-600/30 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all text-[10px] font-medium"
                title={selectionCount < 3 ? "Requires 3+ objects" : "Distribute Vertically"}
              >
                <AlignVerticalDistributeCenter size={14} className="text-cyan-400" />
                <span>Vertical</span>
              </button>
            </div>
          </div>

          {/* Quick Ground & Stage Actions */}
          <div className="pt-1 border-t border-gray-800 grid grid-cols-2 gap-1">
            <button
              id="menu-center-target"
              disabled={!hasSelection}
              onClick={() => {
                centerSelectedOnTarget();
                setIsOpen(false);
              }}
              className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none"
              title="Center on Target Origin"
            >
              <Maximize2 size={12} />
              <span>Center Stage</span>
            </button>

            <button
              id="menu-snap-ground"
              disabled={!hasSelection}
              onClick={() => {
                snapSelectedToGround();
                setIsOpen(false);
              }}
              className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none"
              title="Flush Base to Ground (Z=0)"
            >
              <Sparkles size={12} />
              <span>Ground Z=0</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
