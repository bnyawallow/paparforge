import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { GlassModal } from '../ui/HudComponents';
import { PrintMediaPresetPicker } from '../ui/PrintMediaPresetPicker';
import { PRINT_MEDIA_PRESETS, findMatchingPreset } from '../../lib/printMediaPresets';
import { Layers, Sparkles, Target, X, Check, Trash2, Edit3, Ruler, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const SUGGESTED_SCENE_NAMES = [
  'Product Demo',
  'Art Gallery',
  'Showroom',
  'Poster AR',
  'Business Card',
  'Catalog Item'
];

// Quick presets for mobile size selection
const MOBILE_SIZE_PRESETS = [
  { id: 'a4-document', label: 'A4 Page', widthCm: 21.0, widthM: 0.210 },
  { id: 'movie-poster', label: 'Poster', widthCm: 50.0, widthM: 0.500 },
  { id: 'business-card', label: 'Biz Card', widthCm: 8.9, widthM: 0.089 },
  { id: 'birthday-card', label: 'Postcard', widthCm: 15.2, widthM: 0.152 },
  { id: 'restaurant-menu', label: 'Menu', widthCm: 21.5, widthM: 0.215 },
  { id: 'custom', label: 'Custom', widthCm: 0, widthM: 0 }
];

export function SceneManagerModal() {
  const {
    sceneModalState,
    closeSceneModal,
    setSceneModalState,
    createScene,
    renameScene,
    deleteScene,
    scenes,
    saveCurrentProject,
    addToast,
    editorTheme
  } = useEditorStore();

  const isOpen = sceneModalState.type !== null;
  const isLight = editorTheme === 'light';

  // Responsive mobile detection
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Local state for instant input responsiveness
  const [nameValue, setNameValue] = useState(sceneModalState.value || '');
  const [targetMode, setTargetMode] = useState<'single' | 'multi'>(sceneModalState.targetMode || 'single');
  const [physicalWidth, setPhysicalWidth] = useState<number>(sceneModalState.physicalWidth || 0.127);
  const [isCustomMobileSize, setIsCustomMobileSize] = useState(false);
  const [customMobileCm, setCustomMobileCm] = useState('12.7');

  // Sync with store state when opened
  useEffect(() => {
    if (sceneModalState.type !== null) {
      const defaultName = `Scene ${Object.keys(scenes || {}).length + 1}`;
      setNameValue(sceneModalState.value || (sceneModalState.type === 'create' ? defaultName : ''));
      setTargetMode(sceneModalState.targetMode || 'single');
      const w = sceneModalState.physicalWidth || 0.127;
      setPhysicalWidth(w);
      setCustomMobileCm((w * 100).toFixed(1));
      setIsCustomMobileSize(!findMatchingPreset(w));
    }
  }, [sceneModalState.type, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const trimmed = nameValue.trim();
    if (sceneModalState.type === 'create') {
      if (!trimmed) return;
      createScene(trimmed, targetMode, physicalWidth);
      saveCurrentProject();
      addToast(`Created scene "${trimmed}"`);
      closeSceneModal();
    } else if (sceneModalState.type === 'rename') {
      if (!trimmed || !sceneModalState.sceneId) return;
      renameScene(sceneModalState.sceneId, trimmed);
      saveCurrentProject();
      addToast(`Renamed scene to "${trimmed}"`);
      closeSceneModal();
    } else if (sceneModalState.type === 'delete') {
      if (!sceneModalState.sceneId) return;
      deleteScene(sceneModalState.sceneId);
      saveCurrentProject();
      addToast('Scene deleted successfully');
      closeSceneModal();
    }
  };

  const handleMobilePresetSelect = (preset: typeof MOBILE_SIZE_PRESETS[0]) => {
    if (preset.id === 'custom') {
      setIsCustomMobileSize(true);
    } else {
      setIsCustomMobileSize(false);
      setPhysicalWidth(preset.widthM);
      setCustomMobileCm(preset.widthCm.toFixed(1));
    }
  };

  const handleCustomMobileChange = (cmStr: string) => {
    setCustomMobileCm(cmStr);
    const num = parseFloat(cmStr);
    if (!isNaN(num) && num > 0) {
      const inMeters = num / 100;
      setPhysicalWidth(inMeters);
    }
  };

  // MOBILE BOTTOM SHEET VIEW
  if (isMobile) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSceneModal}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              "relative z-10 w-full max-h-[92vh] flex flex-col rounded-t-3xl border-t shadow-2xl overflow-hidden",
              isLight ? "bg-white border-gray-200 text-gray-900" : "bg-[#141418] border-[#2E2E38] text-white"
            )}
          >
            {/* Grab Handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className={cn("w-10 h-1.5 rounded-full", isLight ? "bg-gray-300" : "bg-white/20")} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                {sceneModalState.type === 'create' ? (
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                ) : sceneModalState.type === 'rename' ? (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Edit3 size={16} />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                    <Trash2 size={16} />
                  </div>
                )}
                <span className="font-bold text-sm">
                  {sceneModalState.type === 'create' ? 'Add New Scene' :
                   sceneModalState.type === 'rename' ? 'Rename Scene' :
                   'Delete Scene'}
                </span>
              </div>
              <button
                onClick={closeSceneModal}
                className={cn(
                  "p-1.5 rounded-full transition-colors cursor-pointer",
                  isLight ? "hover:bg-gray-100 text-gray-500" : "hover:bg-white/10 text-gray-400 hover:text-white"
                )}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4 overscroll-contain">
              {sceneModalState.type === 'delete' ? (
                <div className="flex flex-col gap-3 py-2">
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-300">
                    <Trash2 size={20} className="text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      Are you sure you want to delete{' '}
                      <strong className={isLight ? "text-gray-900 font-bold" : "text-white font-bold"}>
                        "{scenes[sceneModalState.sceneId || '']?.name || 'this scene'}"
                      </strong>
                      ? All AR objects and media inside this scene will be deleted.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Scene Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className={cn("text-[11px] font-bold uppercase tracking-wider", isLight ? "text-gray-600" : "text-gray-400")}>
                      Scene Name
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => {
                          setNameValue(e.target.value);
                          setSceneModalState({ ...sceneModalState, value: e.target.value });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleConfirm();
                          }
                        }}
                        className={cn(
                          "w-full h-11 rounded-xl px-3.5 text-sm outline-none border transition-all font-sans pr-9",
                          isLight 
                            ? "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white" 
                            : "bg-[#18181D] border-white/15 text-white focus:border-blue-500 focus:bg-[#1D1D24]"
                        )}
                        placeholder="e.g. Art Gallery, Product Demo"
                      />
                      {nameValue && (
                        <button
                          type="button"
                          onClick={() => {
                            setNameValue('');
                            setSceneModalState({ ...sceneModalState, value: '' });
                          }}
                          className="absolute right-2.5 p-1 rounded-full text-gray-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Horizontal Suggestion Chips */}
                    {sceneModalState.type === 'create' && (
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar -mx-1 px-1">
                        <span className={cn("text-[10px] shrink-0 font-medium", isLight ? "text-gray-400" : "text-gray-500")}>
                          Suggestions:
                        </span>
                        {SUGGESTED_SCENE_NAMES.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setNameValue(name);
                              setSceneModalState({ ...sceneModalState, value: name });
                            }}
                            className={cn(
                              "text-[10px] px-2.5 py-1 rounded-lg border whitespace-nowrap font-medium transition-all active:scale-95 cursor-pointer shrink-0",
                              nameValue === name
                                ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                                : isLight
                                  ? "bg-white hover:bg-gray-100 border-gray-200 text-gray-700"
                                  : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                            )}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {sceneModalState.type === 'create' && (
                    <>
                      {/* Compact Segmented Target Mode */}
                      <div className="flex flex-col gap-1.5">
                        <label className={cn("text-[11px] font-bold uppercase tracking-wider", isLight ? "text-gray-600" : "text-gray-400")}>
                          Tracking Target Mode
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetMode('single');
                              setSceneModalState({ ...sceneModalState, targetMode: 'single' });
                            }}
                            className={cn(
                              "h-14 p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all active:scale-98 cursor-pointer select-none",
                              targetMode === 'single'
                                ? "bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/50"
                                : isLight
                                  ? "bg-gray-50 border-gray-200 text-gray-600"
                                  : "bg-[#18181D] border-white/10 text-gray-400"
                            )}
                          >
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", targetMode === 'single' ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400")}>
                              <Target size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-blue-400 flex items-center justify-between">
                                <span>Single Target</span>
                                {targetMode === 'single' && <Check size={12} className="text-blue-400" />}
                              </div>
                              <span className="text-[10px] text-gray-400 block truncate">1 Image / Face</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTargetMode('multi');
                              setSceneModalState({ ...sceneModalState, targetMode: 'multi' });
                            }}
                            className={cn(
                              "h-14 p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all active:scale-98 cursor-pointer select-none",
                              targetMode === 'multi'
                                ? "bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500/50"
                                : isLight
                                  ? "bg-gray-50 border-gray-200 text-gray-600"
                                  : "bg-[#18181D] border-white/10 text-gray-400"
                            )}
                          >
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", targetMode === 'multi' ? "bg-purple-500 text-white" : "bg-white/5 text-gray-400")}>
                              <Layers size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-purple-400 flex items-center justify-between">
                                <span>Multi-Target</span>
                                {targetMode === 'multi' && <Check size={12} className="text-purple-400" />}
                              </div>
                              <span className="text-[10px] text-gray-400 block truncate">Multiple markers</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Print Media Preset Picker */}
                      <div className="flex flex-col gap-1.5">
                        <label className={cn("text-[11px] font-bold uppercase tracking-wider flex items-center justify-between", isLight ? "text-gray-600" : "text-gray-400")}>
                          <span className="flex items-center gap-1.5">
                            <Ruler size={13} className="text-cyan-400" />
                            Print Media & Target Size
                          </span>
                          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                            {(physicalWidth * 100).toFixed(1)} cm
                          </span>
                        </label>

                        <PrintMediaPresetPicker 
                          value={physicalWidth}
                          onChange={(w) => setPhysicalWidth(w)}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className={cn(
              "p-4 border-t flex items-center gap-2.5 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]",
              isLight ? "bg-gray-50 border-gray-200" : "bg-[#16161B] border-white/10"
            )}>
              <button
                type="button"
                onClick={closeSceneModal}
                className={cn(
                  "h-12 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer border active:scale-95",
                  isLight 
                    ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100" 
                    : "bg-white/5 border-white/10 text-gray-300 hover:text-white"
                )}
              >
                Cancel
              </button>

              {sceneModalState.type === 'delete' ? (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-600/30 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  <span>Delete Scene</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!nameValue.trim()}
                  onClick={handleConfirm}
                  className={cn(
                    "flex-1 h-12 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2",
                    nameValue.trim()
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30"
                      : "bg-blue-600/40 opacity-50 cursor-not-allowed"
                  )}
                >
                  <Sparkles size={16} />
                  <span>{sceneModalState.type === 'create' ? 'Create Scene' : 'Save Changes'}</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // DESKTOP MODAL VIEW
  return (
    <GlassModal
      isOpen={isOpen}
      onClose={closeSceneModal}
      title={
        sceneModalState.type === 'create' ? 'Create New Scene' :
        sceneModalState.type === 'rename' ? 'Rename Scene' :
        'Delete Scene'
      }
      maxWidth="max-w-md w-full"
    >
      {sceneModalState.type === 'delete' ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
            <Trash2 size={20} className="text-red-400 shrink-0" />
            <p className={cn("text-xs leading-relaxed", isLight ? "text-gray-700" : "text-gray-300")}>
              Are you sure you want to delete{' '}
              <strong className={isLight ? "text-gray-900" : "text-white"}>
                "{scenes[sceneModalState.sceneId || '']?.name || 'this scene'}"
              </strong>
              ? All objects and interactions inside will be permanently removed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-2">
            <button
              type="button"
              onClick={closeSceneModal}
              className={cn(
                "min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border outline-none active:scale-95",
                isLight 
                  ? "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700" 
                  : "bg-[#1f1f22] hover:bg-[#28282b] border-white/10 text-gray-300 hover:text-white"
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="min-h-[44px] px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-red-600/20 outline-none active:scale-95"
            >
              Delete Scene
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Scene Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className={cn("text-[11px] font-bold uppercase tracking-wider", isLight ? "text-gray-600" : "text-gray-400")}>
              Scene Name
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                value={nameValue}
                onChange={(e) => {
                  setNameValue(e.target.value);
                  setSceneModalState({ ...sceneModalState, value: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirm();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeSceneModal();
                  }
                }}
                className={cn(
                  "w-full min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm outline-none border transition-all font-sans pr-9",
                  isLight 
                    ? "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white" 
                    : "bg-[#16161a] border-white/15 text-white focus:border-blue-500/80 focus:bg-[#1a1a1f]"
                )}
                placeholder="e.g. Gallery Showroom"
              />
              {nameValue && (
                <button
                  type="button"
                  onClick={() => {
                    setNameValue('');
                    setSceneModalState({ ...sceneModalState, value: '' });
                  }}
                  className="absolute right-2.5 p-1 rounded-full text-gray-400 hover:text-white transition-colors"
                  title="Clear name"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick suggested name chips */}
            {sceneModalState.type === 'create' && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                <span className={cn("text-[10px] shrink-0 font-medium", isLight ? "text-gray-400" : "text-gray-500")}>
                  Suggestions:
                </span>
                {SUGGESTED_SCENE_NAMES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setNameValue(name);
                      setSceneModalState({ ...sceneModalState, value: name });
                    }}
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-lg border whitespace-nowrap font-medium transition-all active:scale-95 cursor-pointer",
                      nameValue === name
                        ? "bg-blue-600 text-white border-blue-500"
                        : isLight
                          ? "bg-white hover:bg-gray-100 border-gray-200 text-gray-700"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {sceneModalState.type === 'create' && (
            <>
              {/* AR Target Mode: Cards */}
              <div className="flex flex-col gap-2">
                <label className={cn("text-[11px] font-bold uppercase tracking-wider", isLight ? "text-gray-600" : "text-gray-400")}>
                  AR Tracking Target Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetMode('single');
                      setSceneModalState({ ...sceneModalState, targetMode: 'single' });
                    }}
                    className={cn(
                      "min-h-[56px] flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer outline-none active:scale-98 select-none",
                      targetMode === 'single'
                        ? "bg-blue-600/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/40"
                        : isLight
                          ? "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          : "bg-[#161618] border-white/10 text-gray-400 hover:text-gray-200 hover:bg-[#1e1e22]"
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", targetMode === 'single' ? "bg-blue-500/25 text-blue-400" : "bg-white/5 text-gray-400")}>
                      <Target size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-blue-400">Single Marker</span>
                        {targetMode === 'single' && (
                          <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-gray-400 leading-tight line-clamp-1 mt-0.5">
                        High stability & 60 FPS anchor.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetMode('multi');
                      setSceneModalState({ ...sceneModalState, targetMode: 'multi' });
                    }}
                    className={cn(
                      "min-h-[56px] flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer outline-none active:scale-98 select-none",
                      targetMode === 'multi'
                        ? "bg-purple-600/15 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/40"
                        : isLight
                          ? "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          : "bg-[#161618] border-white/10 text-gray-400 hover:text-gray-200 hover:bg-[#1e1e22]"
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", targetMode === 'multi' ? "bg-purple-500/25 text-purple-400" : "bg-white/5 text-gray-400")}>
                      <Layers size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-purple-400">Multi-Target</span>
                        {targetMode === 'multi' && (
                          <span className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-white">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-gray-400 leading-tight line-clamp-1 mt-0.5">
                        Simultaneous multi-marker tracking.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Marker Size Preset Picker */}
              <div className="flex flex-col gap-1.5">
                <label className={cn("text-[11px] font-bold uppercase tracking-wider flex items-center justify-between", isLight ? "text-gray-600" : "text-gray-400")}>
                  <span className="flex items-center gap-1.5">
                    <Layers size={12} className="text-blue-400" />
                    Print Media & Marker Size
                  </span>
                  <span className="text-blue-400 font-mono font-bold text-xs">
                    {(physicalWidth * 100).toFixed(1)} cm
                  </span>
                </label>
                <PrintMediaPresetPicker 
                  value={physicalWidth}
                  onChange={(w) => {
                    setPhysicalWidth(w);
                  }}
                  compact={true}
                />
              </div>
            </>
          )}

          {/* Sticky Touch-Friendly Action Footer */}
          <div 
            className={cn(
              "sticky bottom-0 -mx-3.5 sm:-mx-6 -mb-3.5 sm:-mb-6 p-3 sm:p-4 border-t flex items-center justify-end gap-2.5 z-10",
              isLight 
                ? "bg-white/95 backdrop-blur-md border-gray-200" 
                : "bg-[#121217]/95 backdrop-blur-md border-white/10"
            )}
          >
            <button
              type="button"
              onClick={closeSceneModal}
              className={cn(
                "min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border outline-none active:scale-95",
                isLight 
                  ? "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700" 
                  : "bg-[#1f1f22] hover:bg-[#28282b] border-white/10 text-gray-300 hover:text-white"
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!nameValue.trim()}
              onClick={handleConfirm}
              className={cn(
                "min-h-[44px] px-6 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md outline-none active:scale-95 flex-1 sm:flex-initial flex items-center justify-center gap-2",
                nameValue.trim() 
                  ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/25" 
                  : "bg-blue-600/40 opacity-50 cursor-not-allowed"
              )}
            >
              <Sparkles size={14} />
              <span>{sceneModalState.type === 'create' ? 'Create Scene' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}
    </GlassModal>
  );
}
