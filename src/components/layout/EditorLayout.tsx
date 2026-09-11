import React, { useState, useEffect, useRef } from 'react';
import { Toolbar } from '../toolbar/Toolbar';
import { HierarchyPanel } from '../hierarchy/HierarchyPanel';
import { InspectorPanel } from '../inspector/InspectorPanel';
import { Viewport } from '../viewport/Viewport';
import { AssetBrowser } from '../assets/AssetBrowser';
import { ScriptEditorPanel } from './ScriptEditorPanel';
import { PublishModal } from '../toolbar/PublishModal';
import { UIOptimizerModal } from '../toolbar/UIOptimizerModal';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  Layers, 
  Sliders, 
  Move, 
  RotateCw, 
  Maximize2, 
  Undo2, 
  Redo2, 
  FolderOpen, 
  Camera, 
  Edit3, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Magnet,
  Eye,
  PanelLeft,
  PanelRight,
  Gauge,
  Globe,
  Maximize,
  Minimize
} from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function EditorLayout() {
  const t = useTheme();
  const isPreviewMode = useEditorStore(state => state.isPreviewMode);
  const setPreviewMode = useEditorStore(state => state.setPreviewMode);
  const editingScriptObjectId = useEditorStore(state => state.editingScriptObjectId);
  const transformMode = useEditorStore(state => state.transformMode);
  const setTransformMode = useEditorStore(state => state.setTransformMode);
  const selectedObjectId = useEditorStore(state => state.selectedObjectId);
  const objects = useEditorStore(state => state.objects);
  const rootObjects = useEditorStore(state => state.rootObjects);
  const undo = useEditorStore(state => state.undo);
  const redo = useEditorStore(state => state.redo);
  const past = useEditorStore(state => state.past);
  const future = useEditorStore(state => state.future);
  const openAssetBrowser = useEditorStore(state => state.openAssetBrowser);
  const gridSnapEnabled = useEditorStore(state => state.gridSnapEnabled);
  const setGridSnapEnabled = useEditorStore(state => state.setGridSnapEnabled);
  const setRotationSnapEnabled = useEditorStore(state => state.setRotationSnapEnabled);

  const [bottomHeight, setBottomHeight] = useState(224); // default 224px (h-56)
  const [leftWidth, setLeftWidth] = useState(240); // default 240px
  const [rightWidth, setRightWidth] = useState(288); // default 288px (w-72)
  const [isDraggingBottom, setIsDraggingBottom] = useState(false);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  // Collapsible panels state for desktop/tablet
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mobile active drawer state: 'none' | 'hierarchy' | 'inspector'
  const [mobileDrawer, setMobileDrawer] = useState<'none' | 'hierarchy' | 'inspector'>('none');

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Comprehensive responsive metrics (detect portrait vs landscape on mobile/tablet)
  const [screenMetrics, setScreenMetrics] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: false,
    isLandscape: false,
    isPortrait: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768 || (width < 960 && height < 550);
      const isLandscape = width > height && (width < 1024 || height < 600);
      const isPortrait = !isLandscape && isMobile;
      setScreenMetrics({ width, height, isMobile, isLandscape, isPortrait });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const { isMobile, isLandscape, isPortrait } = screenMetrics;

  const startResizeBottom = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingBottom(true);
  };

  const startResizeLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingLeft(true);
  };

  const startResizeRight = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRight(true);
  };

  useEffect(() => {
    if (!isDraggingBottom && !isDraggingLeft && !isDraggingRight) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingBottom) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight > 100 && newHeight < window.innerHeight - 200) {
          setBottomHeight(newHeight);
        }
      } else if (isDraggingLeft) {
        const newWidth = e.clientX;
        if (newWidth > 180 && newWidth < 500) {
          setLeftWidth(newWidth);
        }
      } else if (isDraggingRight) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 240 && newWidth < 600) {
          setRightWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingBottom(false);
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingBottom, isDraggingLeft, isDraggingRight]);

  // Global Keyboard Shortcuts for Undo/Redo and Tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPreviewMode) return;

      const activeElement = document.activeElement;
      if (activeElement) {
        const tagName = activeElement.tagName.toLowerCase();
        if (
          tagName === 'input' || 
          tagName === 'textarea' || 
          tagName === 'select' || 
          activeElement.hasAttribute('contenteditable')
        ) {
          return;
        }
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl && !e.altKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            useEditorStore.getState().redo();
          } else {
            useEditorStore.getState().undo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          useEditorStore.getState().redo();
        } else if (e.key.toLowerCase() === 'c') {
          const state = useEditorStore.getState();
          if (state.selectedObjectId) {
            e.preventDefault();
            state.copyObject(state.selectedObjectId);
          }
        } else if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          useEditorStore.getState().pasteObject();
        } else if (e.key.toLowerCase() === 'd') {
          const state = useEditorStore.getState();
          if (state.selectedObjectId || state.selectedObjectIds.length > 0) {
            e.preventDefault();
            state.duplicateSelection();
          }
        }
      } else if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        const lowerKey = e.key.toLowerCase();
        if (lowerKey === 'w' || lowerKey === 't') {
          e.preventDefault();
          useEditorStore.getState().setTransformMode('translate');
        } else if (lowerKey === 'e') {
          e.preventDefault();
          useEditorStore.getState().setTransformMode('rotate');
        } else if (lowerKey === 'r' || lowerKey === 's') {
          e.preventDefault();
          useEditorStore.getState().setTransformMode('scale');
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          const state = useEditorStore.getState();
          if (state.selectedObjectId) {
            const obj = state.objects[state.selectedObjectId];
            if (obj && obj.type !== 'imageTarget') {
              e.preventDefault();
              state.removeObject(state.selectedObjectId);
            }
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          useEditorStore.getState().selectObject(null);
          setMobileDrawer('none');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPreviewMode]);

  const toasts = useEditorStore(state => state.toasts);
  const removeToast = useEditorStore(state => state.removeToast);

  // Auto-save mechanism
  useEffect(() => {
    const handleAutoSave = () => {
      try {
        const state = useEditorStore.getState();
        if (state.hasUnsavedChanges) {
          state.saveCurrentProject();
          state.addToast('Scene auto-saved successfully');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };

    const interval = setInterval(handleAutoSave, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalObjectCount = Object.keys(objects).length;
  const selectedObject = selectedObjectId ? objects[selectedObjectId] : null;

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-200 ${t.bgMain} ${t.textMain}`}>
      <Toolbar />
      <AssetBrowser />

      <div className="flex flex-1 overflow-hidden relative">
        <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-200 ${t.isLight ? 'bg-[#F9F9FB]' : 'bg-[#111111]'}`}>
          {/* Top segment: Hierarchy Panel and Viewport (3D Editor) side-by-side */}
          <div className="flex-1 flex overflow-hidden relative">
            
            {/* Desktop Collapsible Hierarchy Panel */}
            {!isMobile && (
              <AnimatePresence mode="wait">
                {!isPreviewMode && !isLeftCollapsed && (
                  <motion.div
                    key="hierarchy-panel"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: leftWidth }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex h-full shrink-0 overflow-hidden"
                  >
                    <HierarchyPanel width={leftWidth} onClose={() => setIsLeftCollapsed(true)} />
                    <div 
                      onMouseDown={startResizeLeft}
                      className={`w-1.5 cursor-col-resize transition-all shrink-0 z-40 relative group ${t.isLight ? 'bg-gray-200 hover:bg-blue-500' : 'bg-[#222] hover:bg-blue-500'}`}
                      title="Drag to resize / Click to collapse hierarchy"
                    >
                      <div className="absolute inset-y-0 -left-1.5 -right-1.5 cursor-col-resize"></div>
                      <button
                        onClick={() => setIsLeftCollapsed(true)}
                        className="absolute top-1/2 -translate-y-1/2 -right-2.5 z-50 w-5 h-6 bg-[#1C1C20] border border-[#333] hover:border-blue-500 text-gray-400 hover:text-white rounded flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Collapse Hierarchy Panel"
                      >
                        <ChevronLeft size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Desktop Left Edge Uncollapse Button (When Left Panel is Collapsed) */}
            {!isMobile && !isPreviewMode && isLeftCollapsed && (
              <button
                onClick={() => setIsLeftCollapsed(false)}
                className="absolute left-2 top-3 z-40 px-2.5 py-1.5 rounded-lg bg-[#141417]/90 hover:bg-[#1f1f24] border border-[#333] hover:border-blue-500/50 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md transition-all cursor-pointer group"
                title="Expand Scene Hierarchy Panel"
              >
                <Layers size={13} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Scene</span>
                <ChevronRight size={12} className="text-gray-500 group-hover:text-blue-400" />
              </button>
            )}

            {/* Mobile/Tablet Quick Floating Edge Toggles (Portrait and Landscape) */}
            {isMobile && !isPreviewMode && (
              <>
                {/* Floating Left Trigger: Scene Objects */}
                <button
                  onClick={() => setMobileDrawer(d => d === 'hierarchy' ? 'none' : 'hierarchy')}
                  className={cn(
                    "absolute left-2.5 top-3 z-40 px-2.5 py-1.5 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer select-none active:scale-95",
                    mobileDrawer === 'hierarchy'
                      ? "bg-blue-600 text-white border-blue-400 shadow-blue-500/30"
                      : "bg-[#141418]/90 text-gray-200 hover:text-white border-[#2A2A30] hover:border-blue-500/50"
                  )}
                  title="Toggle Scene Hierarchy"
                >
                  <Layers size={14} className={mobileDrawer === 'hierarchy' ? "text-white" : "text-blue-400"} />
                  <span className="hidden xs:inline">Scene</span>
                  <span className="text-[10px] px-1 py-0.2 rounded-full bg-white/10 font-mono">
                    {totalObjectCount}
                  </span>
                </button>

                {/* Floating Right Trigger: Properties / Inspector */}
                <button
                  onClick={() => setMobileDrawer(d => d === 'inspector' ? 'none' : 'inspector')}
                  className={cn(
                    "absolute right-2.5 top-3 z-40 px-2.5 py-1.5 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer select-none active:scale-95",
                    mobileDrawer === 'inspector'
                      ? "bg-blue-600 text-white border-blue-400 shadow-blue-500/30"
                      : "bg-[#141418]/90 text-gray-200 hover:text-white border-[#2A2A30] hover:border-blue-500/50"
                  )}
                  title="Toggle Properties Inspector"
                >
                  <span className="hidden xs:inline truncate max-w-[90px]">
                    {selectedObject ? selectedObject.name : 'Inspect'}
                  </span>
                  <Sliders size={14} className={mobileDrawer === 'inspector' ? "text-white" : "text-blue-400"} />
                </button>
              </>
            )}

            {/* Main 3D Viewport */}
            <div className="flex-1 relative overflow-hidden">
              {!isPreviewMode && (
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#666 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                ></div>
              )}
              <Viewport />
            </div>

            {/* Desktop Right Edge Uncollapse Button (When Right Panel is Collapsed) */}
            {!isMobile && !isPreviewMode && isRightCollapsed && (
              <button
                onClick={() => setIsRightCollapsed(false)}
                className="absolute right-2 top-3 z-40 px-2.5 py-1.5 rounded-lg bg-[#141417]/90 hover:bg-[#1f1f24] border border-[#333] hover:border-blue-500/50 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md transition-all cursor-pointer group"
                title="Expand Properties Inspector Panel"
              >
                <ChevronLeft size={12} className="text-gray-500 group-hover:text-blue-400" />
                <Sliders size={13} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Properties</span>
              </button>
            )}

            {/* Desktop Collapsible Inspector Panel */}
            {!isMobile && (
              <AnimatePresence mode="wait">
                {!isPreviewMode && !isRightCollapsed && (
                  <motion.div
                    key="inspector-panel"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: rightWidth }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex h-full shrink-0 relative z-[45] overflow-hidden"
                  >
                    <div 
                      onMouseDown={startResizeRight}
                      className={`w-1.5 cursor-col-resize transition-all shrink-0 z-40 relative group ${t.isLight ? 'bg-gray-200 hover:bg-blue-500' : 'bg-[#222] hover:bg-blue-500'}`}
                      title="Drag to resize / Click to collapse inspector"
                    >
                      <div className="absolute inset-y-0 -left-1.5 -right-1.5 cursor-col-resize"></div>
                      <button
                        onClick={() => setIsRightCollapsed(true)}
                        className="absolute top-1/2 -translate-y-1/2 -left-2.5 z-50 w-5 h-6 bg-[#1C1C20] border border-[#333] hover:border-blue-500 text-gray-400 hover:text-white rounded flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Collapse Inspector Panel"
                      >
                        <ChevronRight size={12} />
                      </button>
                    </div>
                    <InspectorPanel width={rightWidth} onClose={() => setIsRightCollapsed(true)} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Bottom segment: ScriptEditorPanel */}
          <AnimatePresence>
            {!isPreviewMode && editingScriptObjectId && (
              <motion.div
                key="script-editor-panel"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col shrink-0 overflow-hidden"
              >
                <div 
                  onMouseDown={startResizeBottom}
                  className={`h-1 cursor-row-resize transition-all shrink-0 z-40 relative group ${t.isLight ? 'bg-gray-200 hover:bg-blue-500' : 'bg-[#222] hover:bg-blue-500'}`}
                  title="Drag to resize script panel"
                >
                  <div className="absolute inset-x-0 -top-1 -bottom-1 cursor-row-resize"></div>
                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 flex gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1 rounded-full bg-blue-400"></div>
                    <div className="w-1.5 h-1 rounded-full bg-blue-400"></div>
                  </div>
                </div>
                <div style={{ height: `${bottomHeight}px` }} className="shrink-0 flex flex-col overflow-hidden">
                  <ScriptEditorPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Touch-Optimized Navigation Dock (Optimized for Portrait and Landscape) */}
      {isMobile && !isPreviewMode && (
        <nav 
          aria-label="Mobile Navigation Dock"
          className={cn(
            "bg-[#111114]/95 backdrop-blur-xl border-t border-[#26262B] flex items-center overflow-x-auto overflow-y-hidden no-scrollbar px-2 gap-1 z-40 shrink-0 safe-area-inset-bottom scroll-smooth",
            isLandscape ? "h-12 justify-around" : "h-16 justify-start sm:justify-around"
          )}
        >
          {/* Scene Hierarchy Drawer Trigger */}
          <button
            onClick={() => setMobileDrawer(d => d === 'hierarchy' ? 'none' : 'hierarchy')}
            className={cn(
              "flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer shrink-0 select-none active:scale-95",
              mobileDrawer === 'hierarchy' 
                ? "bg-blue-600/25 text-blue-400 font-bold border border-blue-500/40" 
                : "text-gray-400 hover:text-white"
            )}
            title="Scene Objects & Hierarchy"
          >
            <Layers size={isLandscape ? 15 : 18} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap">Scene</span>
          </button>

          {/* Transform Mode: Translate */}
          <button
            onClick={() => setTransformMode('translate')}
            className={cn(
              "flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer shrink-0 select-none active:scale-95",
              transformMode === 'translate' 
                ? "bg-blue-600/25 text-blue-400 font-bold border border-blue-500/40" 
                : "text-gray-400 hover:text-white"
            )}
            title="Translate / Move Object"
          >
            <Move size={isLandscape ? 15 : 18} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap">Move</span>
          </button>

          {/* Transform Mode: Rotate */}
          <button
            onClick={() => setTransformMode('rotate')}
            className={cn(
              "flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer shrink-0 select-none active:scale-95",
              transformMode === 'rotate' 
                ? "bg-emerald-600/25 text-emerald-400 font-bold border border-emerald-500/40" 
                : "text-gray-400 hover:text-white"
            )}
            title="Rotate Object"
          >
            <RotateCw size={isLandscape ? 15 : 18} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap">Rotate</span>
          </button>

          {/* Transform Mode: Scale */}
          <button
            onClick={() => setTransformMode('scale')}
            className={cn(
              "flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer shrink-0 select-none active:scale-95",
              transformMode === 'scale' 
                ? "bg-purple-600/25 text-purple-400 font-bold border border-purple-500/40" 
                : "text-gray-400 hover:text-white"
            )}
            title="Scale Object"
          >
            <Maximize2 size={isLandscape ? 15 : 18} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap">Scale</span>
          </button>

          {/* Snap Alignment Toggle */}
          <button
            onClick={() => {
              const next = !gridSnapEnabled;
              setGridSnapEnabled(next);
              setRotationSnapEnabled(next);
              useEditorStore.getState().addToast(next ? 'Snapping enabled' : 'Snapping disabled');
            }}
            className={cn(
              "flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer shrink-0 select-none active:scale-95",
              gridSnapEnabled
                ? "bg-cyan-600/25 text-cyan-400 font-bold border border-cyan-500/40"
                : "text-gray-400 hover:text-white"
            )}
            title={gridSnapEnabled ? "Snapping is ON (tap to disable)" : "Snapping is OFF (tap to enable)"}
          >
            <Magnet size={isLandscape ? 15 : 18} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap">Snap</span>
          </button>

          {/* Inspector Properties Drawer Trigger */}
          <button
            onClick={() => setMobileDrawer(d => d === 'inspector' ? 'none' : 'inspector')}
            className={cn(
              "flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer shrink-0 select-none active:scale-95",
              mobileDrawer === 'inspector' 
                ? "bg-blue-600/25 text-blue-400 font-bold border border-blue-500/40" 
                : "text-gray-400 hover:text-white"
            )}
            title="Properties & Transforms"
          >
            <Sliders size={isLandscape ? 15 : 18} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap">Inspect</span>
          </button>

          {/* Asset Browser Trigger */}
          <button
            onClick={() => openAssetBrowser('architecture')}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-2 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer shrink-0 select-none active:scale-95"
            title="Open Asset Browser"
          >
            <FolderOpen size={isLandscape ? 15 : 18} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap">Assets</span>
          </button>

          {/* Full Screen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-2 rounded-xl text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer shrink-0 select-none active:scale-95"
            title={isFullscreen ? "Exit Full Screen" : "Enable Full Screen"}
          >
            {isFullscreen ? <Minimize size={isLandscape ? 15 : 18} /> : <Maximize size={isLandscape ? 15 : 18} />}
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap">Full Screen</span>
          </button>

          {/* UI Optimizer Trigger */}
          <button
            onClick={() => useEditorStore.getState().setIsUIOptimizerOpen(true)}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-2 rounded-xl text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer shrink-0 select-none active:scale-95"
            title="UI Optimizer & Device Viewport Resolution"
          >
            <Gauge size={isLandscape ? 15 : 18} className="animate-pulse" />
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap">Optimize</span>
          </button>

          {/* Publish Trigger (Always visible and accessible on mobile) */}
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20 border border-blue-400/40 transition-all cursor-pointer shrink-0 select-none active:scale-95"
            title="Publish AR experience"
          >
            <Globe size={isLandscape ? 15 : 18} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap font-bold">Publish</span>
          </button>

          {/* Undo / Redo Touch Buttons */}
          <div className="flex items-center gap-0.5 pl-1 border-l border-[#26262B] shrink-0">
            <button
              onClick={() => undo()}
              disabled={past.length === 0}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-lg shrink-0 cursor-pointer active:scale-95 min-h-[44px] min-w-[36px] flex items-center justify-center"
              title="Undo"
            >
              <Undo2 size={isLandscape ? 14 : 16} />
            </button>
            <button
              onClick={() => redo()}
              disabled={future.length === 0}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-lg shrink-0 cursor-pointer active:scale-95 min-h-[44px] min-w-[36px] flex items-center justify-center"
              title="Redo"
            >
              <Redo2 size={isLandscape ? 14 : 16} />
            </button>
          </div>
        </nav>
      )}

      {/* Mobile Drawer (Portrait: Bottom Sheet, Landscape: Side Overlay Sheet) */}
      {isMobile && (
        <AnimatePresence>
          {mobileDrawer !== 'none' && (
            <>
              {/* Backdrop */}
              <motion.div
                key="mobile-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileDrawer('none')}
              />

              {/* Landscape Side Panel or Portrait Bottom Sheet */}
              {isLandscape ? (
                /* Landscape: Left or Right Slide-over sheet */
                <motion.div
                  key="mobile-landscape-drawer"
                  initial={{ x: mobileDrawer === 'hierarchy' ? '-100%' : '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: mobileDrawer === 'hierarchy' ? '-100%' : '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                  className={cn(
                    "fixed inset-y-0 z-50 w-80 sm:w-96 bg-[#121215] border-[#2A2A30] shadow-2xl flex flex-col overflow-hidden",
                    mobileDrawer === 'hierarchy' ? "left-0 border-r" : "right-0 border-l"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#17171C] border-b border-[#25252B] shrink-0">
                    <div className="flex items-center gap-2">
                      {mobileDrawer === 'hierarchy' ? (
                        <>
                          <Layers size={15} className="text-blue-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Scene Objects</span>
                        </>
                      ) : (
                        <>
                          <Sliders size={15} className="text-blue-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Properties</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setMobileDrawer('none')}
                      className="p-1 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Panel Content */}
                  <div className="flex-1 overflow-y-auto">
                    {mobileDrawer === 'hierarchy' && <HierarchyPanel onClose={() => setMobileDrawer('none')} />}
                    {mobileDrawer === 'inspector' && <InspectorPanel onClose={() => setMobileDrawer('none')} />}
                  </div>
                </motion.div>
              ) : (
                /* Portrait: Bottom Sheet */
                <motion.div
                  key="mobile-portrait-drawer"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                  className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] h-[75vh] bg-[#121215] border-t border-[#2A2A30] rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
                >
                  {/* Drag Handle & Header */}
                  <div className="flex flex-col items-center px-4 pt-2.5 pb-2 bg-[#17171C] border-b border-[#25252B] shrink-0">
                    <div className="w-10 h-1 rounded-full bg-gray-600/70 mb-2" />
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {mobileDrawer === 'hierarchy' ? (
                          <>
                            <Layers size={15} className="text-blue-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Scene Hierarchy</span>
                          </>
                        ) : (
                          <>
                            <Sliders size={15} className="text-blue-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Object Inspector</span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => setMobileDrawer('none')}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        title="Close drawer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 overflow-y-auto">
                    {mobileDrawer === 'hierarchy' && <HierarchyPanel onClose={() => setMobileDrawer('none')} />}
                    {mobileDrawer === 'inspector' && <InspectorPanel onClose={() => setMobileDrawer('none')} />}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      )}

      {/* Publish Modal for Mobile Dock Trigger */}
      {showPublishModal && <PublishModal onClose={() => setShowPublishModal(false)} />}

      {/* Global Toast Notifications Banner */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-[#141414]/95 border border-blue-500/40 text-white px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 shadow-2xl backdrop-blur-md pointer-events-auto"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
              <span className="flex-1 font-sans tracking-wide">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors ml-1 text-[10px]"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
