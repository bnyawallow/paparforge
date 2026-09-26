import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Keyboard, Search, X, Move, RotateCw, Maximize2, 
  Layers, Magnet, Camera, Undo2, Redo2, Copy, Sparkles,
  Command, CornerDownLeft, Eye, HelpCircle, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEditorStore } from '../../store/useEditorStore';

export interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'transform' | 'snap' | 'group' | 'camera' | 'history' | 'general';
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export const SHORTCUTS_DATA: ShortcutItem[] = [
  // Transformation
  { keys: ['W', 'T'], description: 'Activate Translate / Move Gizmo', category: 'transform', icon: Move },
  { keys: ['E'], description: 'Activate Rotate Gizmo', category: 'transform', icon: RotateCw },
  { keys: ['R', 'S'], description: 'Activate Scale Gizmo', category: 'transform', icon: Maximize2 },
  { keys: ['Q'], description: 'Toggle World / Local Coordinate Transform Space', category: 'transform', icon: Sparkles },
  { keys: ['Delete', 'Backspace'], description: 'Delete Selected Object', category: 'transform' },

  // Snapping & Precision
  { keys: ['G'], description: 'Toggle Position Snap to Grid', category: 'snap', icon: Magnet },
  { keys: ['Alt', 'R'], description: 'Toggle Rotation Angle Snapping (15°)', category: 'snap', icon: Magnet },
  { keys: ['Shift', 'S'], description: 'Toggle Scale Snap-to-Grid Visualizer', category: 'snap', icon: Magnet },
  { keys: ['Shift', 'Drag'], description: 'Precision Snap & Surface Alignment during drag', category: 'snap', icon: Magnet },

  // Grouping & Selection
  { keys: ['Ctrl / ⌘', 'G'], description: 'Group selected objects into a single manipulatable entity', category: 'group', icon: Layers },
  { keys: ['Ctrl / ⌘', 'Shift', 'G'], description: 'Ungroup selected group back to individual objects', category: 'group', icon: Layers },
  { keys: ['Shift', 'Click'], description: 'Add / remove object from multi-selection', category: 'group' },
  { keys: ['Esc'], description: 'Deselect current object / Close active panels', category: 'group' },

  // Camera & Viewport
  { keys: ['F'], description: 'Focus selected object (or Recenter Scene if none selected)', category: 'camera', icon: Camera },
  { keys: ['Home'], description: 'Reset Camera Orbit and viewing distance to default', category: 'camera', icon: Camera },
  { keys: ['Right Drag'], description: 'Orbit / Rotate 3D Viewport camera', category: 'camera', icon: Camera },
  { keys: ['Middle Drag', 'Space + Drag'], description: 'Pan 3D Viewport camera', category: 'camera', icon: Camera },
  { keys: ['Scroll Wheel'], description: 'Zoom In / Out in 3D Viewport', category: 'camera', icon: Camera },

  // History & Clipboard
  { keys: ['Ctrl / ⌘', 'Z'], description: 'Undo last action', category: 'history', icon: Undo2 },
  { keys: ['Ctrl / ⌘', 'Y'], description: 'Redo previously undone action', category: 'history', icon: Redo2 },
  { keys: ['Ctrl / ⌘', 'Shift', 'Z'], description: 'Redo previously undone action (alternate)', category: 'history', icon: Redo2 },
  { keys: ['Ctrl / ⌘', 'C'], description: 'Copy selected object to clipboard', category: 'history', icon: Copy },
  { keys: ['Ctrl / ⌘', 'V'], description: 'Paste object from clipboard at current origin', category: 'history', icon: Copy },
  { keys: ['Ctrl / ⌘', 'D'], description: 'Duplicate selected object or group in place', category: 'history', icon: Copy },

  // General & Performance
  { keys: ['?'], description: 'Open this Keyboard Shortcuts Guide', category: 'general', icon: HelpCircle },
  { keys: ['Alt', 'M'], description: 'Quick-optimize all 3D scene meshes for mobile', category: 'general', icon: Sparkles },
  { keys: ['Alt', 'W'], description: 'Toggle Wireframe Debug Mode', category: 'general', icon: Eye }
];

const CATEGORIES = [
  { id: 'all', label: 'All Shortcuts' },
  { id: 'transform', label: 'Transformation', icon: Move },
  { id: 'snap', label: 'Snapping', icon: Magnet },
  { id: 'group', label: 'Grouping', icon: Layers },
  { id: 'camera', label: 'Camera & Viewport', icon: Camera },
  { id: 'history', label: 'History & Clipboard', icon: Undo2 },
  { id: 'general', label: 'General & Mobile', icon: Sparkles }
];

export function KeyboardShortcutsModal() {
  const isOpen = useEditorStore(state => state.isShortcutsModalOpen);
  const setIsOpen = useEditorStore(state => state.setIsShortcutsModalOpen);
  const editorTheme = useEditorStore(state => state.editorTheme);
  const isLight = editorTheme === 'light';

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const filteredShortcuts = useMemo(() => {
    return SHORTCUTS_DATA.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const query = search.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch = 
        item.description.toLowerCase().includes(query) ||
        item.keys.some(k => k.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-dialog-title"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
            isLight 
              ? 'bg-white text-zinc-900 border-zinc-200' 
              : 'bg-[#141418] text-zinc-100 border-white/10'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'border-zinc-200 bg-zinc-50' : 'border-white/10 bg-[#1a1a22]'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Keyboard size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 id="shortcuts-dialog-title" className="text-base font-bold tracking-tight">
                  Editor Keyboard Shortcuts
                </h2>
                <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Quick-access hotkeys for transformation, snapping, grouping, and camera navigation
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close keyboard shortcuts dialog"
              className={`p-1.5 rounded-lg transition-colors ${
                isLight 
                  ? 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Search and Category Filter Bar */}
          <div className={`p-4 border-b space-y-3 ${isLight ? 'border-zinc-200 bg-white' : 'border-white/5 bg-[#17171d]'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shortcuts (e.g., snap, group, rotate, camera)..."
                aria-label="Filter keyboard shortcuts"
                className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  isLight 
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder:text-zinc-400' 
                    : 'bg-black/30 border-white/10 text-zinc-100 placeholder:text-zinc-500'
                }`}
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isLight
                          ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                          : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                    }`}
                  >
                    {cat.icon && <cat.icon size={13} />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shortcuts List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-white/5">
            {filteredShortcuts.length === 0 ? (
              <div className="py-12 text-center text-zinc-400">
                <Search size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No matching shortcuts found</p>
                <p className="text-xs text-zinc-500 mt-1">Try searching for &quot;snap&quot;, &quot;group&quot;, or &quot;camera&quot;</p>
              </div>
            ) : (
              filteredShortcuts.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={`${item.description}-${index}`}
                    className={`pt-2.5 first:pt-0 flex items-center justify-between gap-4 p-2 rounded-xl transition-colors ${
                      isLight ? 'hover:bg-zinc-100' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {IconComponent && (
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isLight ? 'bg-zinc-200/70 text-zinc-700' : 'bg-white/5 text-zinc-300'
                        }`}>
                          <IconComponent size={14} />
                        </div>
                      )}
                      <span className="text-sm font-medium leading-tight truncate">
                        {item.description}
                      </span>
                    </div>

                    {/* Key combo badges */}
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((key, kIndex) => (
                        <React.Fragment key={kIndex}>
                          <kbd
                            className={`px-2 py-1 text-xs font-mono font-semibold rounded-md border shadow-xs select-none ${
                              isLight
                                ? 'bg-zinc-100 border-zinc-300 text-zinc-800 shadow-zinc-200'
                                : 'bg-[#22222a] border-white/20 text-zinc-200 shadow-black/40'
                            }`}
                          >
                            {key}
                          </kbd>
                          {kIndex < item.keys.length - 1 && (
                            <span className="text-zinc-500 text-xs mx-0.5">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Note */}
          <div className={`px-6 py-3 border-t text-xs flex items-center justify-between ${
            isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-500' : 'border-white/10 bg-[#121216] text-zinc-400'
          }`}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Press <kbd className="px-1.5 py-0.5 rounded border text-[11px] font-mono bg-white/5 border-white/20 font-bold">?</kbd> anywhere in the editor to open this helper
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Done (Esc)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
