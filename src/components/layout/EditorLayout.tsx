import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toolbar } from '../toolbar/Toolbar';
import { HierarchyPanel } from '../hierarchy/HierarchyPanel';
import { InspectorPanel } from '../inspector/InspectorPanel';
import { Viewport } from '../viewport/Viewport';
import { AssetBrowser } from '../assets/AssetBrowser';
import { ScriptEditorPanel } from './ScriptEditorPanel';
import { AnimationControllerPanel } from '../animation/AnimationControllerPanel';
import { PublishModal } from '../toolbar/PublishModal';
import { UIOptimizerModal } from '../toolbar/UIOptimizerModal';
import { SceneManagerModal } from '../scenes/SceneManagerModal';
import { KeyboardShortcutsModal } from '../ui/KeyboardShortcutsModal';
import { SnapToGridMenu } from './SnapToGridMenu';
import { AlignmentToolbar } from '../toolbar/AlignmentToolbar';
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
  Minimize,
  Plus,
  CheckSquare,
  Copy,
  Trash2,
  FolderPlus,
  Film,
  Box,
  BookOpen
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
  const selectedObjectIds = useEditorStore(state => state.selectedObjectIds);
  const selectObject = useEditorStore(state => state.selectObject);
  const isMultiSelectMode = useEditorStore(state => state.isMultiSelectMode);
  const toggleMultiSelectMode = useEditorStore(state => state.toggleMultiSelectMode);
  const deleteSelection = useEditorStore(state => state.deleteSelection);
  const groupSelection = useEditorStore(state => state.groupSelection);
  const duplicateSelection = useEditorStore(state => state.duplicateSelection);
  const scenes = useEditorStore(state => state.scenes);
  const activeSceneId = useEditorStore(state => state.activeSceneId);
  const openCreateSceneModal = useEditorStore(state => state.openCreateSceneModal);
  const activeSceneName = scenes[activeSceneId]?.name || 'Scene 1';

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
  const [fullscreenPref, setFullscreenPref] = useState<'enabled' | 'disabled' | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ar_editor_fullscreen_user_pref');
      if (saved === 'enabled' || saved === 'disabled') return saved;
    }
    return null;
  });

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
      localStorage.setItem('ar_editor_fullscreen_user_pref', 'enabled');
      setFullscreenPref('enabled');
      useEditorStore.getState().addToast('Full Screen enabled (saved)');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      localStorage.setItem('ar_editor_fullscreen_user_pref', 'disabled');
      setFullscreenPref('disabled');
      useEditorStore.getState().addToast('Full Screen disabled (saved)');
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
      
      const isInputActive = typeof document !== 'undefined' && 
        ['input', 'textarea', 'select'].includes(document.activeElement?.tagName.toLowerCase() || '');

      setScreenMetrics(prev => {
        // Prefer physical screen orientation API over window inner dimensions (which collapse when soft keyboard opens)
        let isLandscape = prev.isLandscape;
        if (typeof screen !== 'undefined' && (screen as any).orientation && (screen as any).orientation.type) {
          isLandscape = (screen as any).orientation.type.includes('landscape');
        } else if (typeof window !== 'undefined' && typeof window.orientation !== 'undefined') {
          isLandscape = Math.abs(Number(window.orientation)) === 90;
        } else if (!isInputActive) {
          isLandscape = width > height && (width < 1024 || height < 600);
        }

        const isPortrait = !isLandscape && isMobile;
        return { width, height, isMobile, isLandscape, isPortrait };
      });
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

  // Mobile bottom dock drag-to-scroll support & scroll state
  const bottomNavRef = useRef<HTMLElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingNav = useRef(false);
  const startXNav = useRef(0);
  const startScrollLeftNav = useRef(0);

  const checkNavScroll = useCallback(() => {
    const el = bottomNavRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = bottomNavRef.current;
    if (!el) return;
    checkNavScroll();
    el.addEventListener('scroll', checkNavScroll, { passive: true });
    window.addEventListener('resize', checkNavScroll);
    const timer = setTimeout(checkNavScroll, 150);
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkNavScroll);
      window.removeEventListener('resize', checkNavScroll);
    };
  }, [checkNavScroll, isMobile, isPreviewMode]);

  const scrollNav = (direction: 'left' | 'right') => {
    const el = bottomNavRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -220 : 220;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkNavScroll, 300);
  };

  const handleNavPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    // If it's a touch event, allow native browser touch pan-x scrolling
    if (e.pointerType === 'touch') return;
    const el = bottomNavRef.current;
    if (!el) return;
    isDraggingNav.current = true;
    startXNav.current = e.clientX;
    startScrollLeftNav.current = el.scrollLeft;
  };

  const handleNavPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDraggingNav.current || e.pointerType === 'touch') return;
    const el = bottomNavRef.current;
    if (!el) return;
    const deltaX = e.clientX - startXNav.current;
    if (Math.abs(deltaX) > 4) {
      el.scrollLeft = startScrollLeftNav.current - deltaX;
      checkNavScroll();
    }
  };

  const handleNavPointerUp = () => {
    isDraggingNav.current = false;
  };

  // Ensure that full screen mode selection is strictly preserved across device orientation changes
  useEffect(() => {
    const syncFullscreenState = () => {
      const currentPref = localStorage.getItem('ar_editor_fullscreen_user_pref');
      
      // If user explicitly enabled full screen mode, preserve full screen state on orientation change
      if (currentPref === 'enabled') {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else if ((document.documentElement as any).webkitRequestFullscreen) {
            (document.documentElement as any).webkitRequestFullscreen();
          }
        }
      }
    };

    window.addEventListener('orientationchange', syncFullscreenState);
    return () => {
      window.removeEventListener('orientationchange', syncFullscreenState);
    };
  }, [fullscreenPref]);

  // Touch gesture listener to restore full screen on touch if browser blocked initial request when pref is 'enabled'
  useEffect(() => {
    const handleTouchRestore = () => {
      const pref = localStorage.getItem('ar_editor_fullscreen_user_pref');
      if (pref === 'enabled' && !document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          (document.documentElement as any).webkitRequestFullscreen();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchRestore, { passive: true });
    window.addEventListener('click', handleTouchRestore, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchRestore);
      window.removeEventListener('click', handleTouchRestore);
    };
  }, [fullscreenPref]);

  // Global Keyboard Shortcuts for Snap-to-Grid and Advertising Alignment
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'g' || e.key === 'G') {
        if (e.shiftKey) {
          e.preventDefault();
          useEditorStore.getState().snapSelectedToGrid();
        } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          const current = useEditorStore.getState().gridSnapEnabled;
          useEditorStore.getState().setGridSnapEnabled(!current);
          useEditorStore.getState().setRotationSnapEnabled(!current);
          useEditorStore.getState().addToast(!current ? 'Snap to Grid: ON' : 'Snap to Grid: OFF');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        } else if (e.key.toLowerCase() === 'g') {
          e.preventDefault();
          const state = useEditorStore.getState();
          if (e.shiftKey) {
            state.ungroupSelection();
          } else {
            state.groupSelection();
          }
        }
      } else if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          useEditorStore.getState().optimizeAllSceneMeshesForMobile();
        }
      } else if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault();
          useEditorStore.getState().setIsShortcutsModalOpen(true);
          return;
        }
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

  const [showAnimationController, setShowAnimationController] = useState(false);
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

            {/* Redesigned Mobile Top Bar & Multi-Select Action Island */}
            {isMobile && !isPreviewMode && (
              <>
                <div 
                  className="absolute top-2 inset-x-2 z-40 flex items-center gap-1.5 overflow-x-auto overflow-y-hidden scrollbar-none touch-pan-x pointer-events-auto select-none p-1.5 bg-[#101014]/92 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl shadow-black/50"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                  onWheel={(e) => {
                    if (e.currentTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                      e.currentTarget.scrollLeft += e.deltaY;
                    }
                  }}
                >
                  {/* Integrated View Mode Toggle Pill (Editor / Preview) - Ergonomic position in Mobile Nav without overlapping */}
                  <div className="flex items-center bg-[#1B1B22] p-0.5 rounded-xl border border-white/10 shrink-0 shadow-inner">
                    <button
                      id="mobile-top-editor-btn"
                      onClick={() => setPreviewMode(false)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none active:scale-95 shrink-0",
                        !isPreviewMode 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-extrabold" 
                          : "text-gray-400 hover:text-white"
                      )}
                      title="Editor Mode"
                    >
                      <Box size={12} />
                      <span>Editor</span>
                    </button>
                    <button
                      id="mobile-top-preview-btn"
                      onClick={() => setPreviewMode(true)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none active:scale-95 shrink-0",
                        isPreviewMode 
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 font-extrabold ring-1 ring-emerald-400/40" 
                          : "text-gray-400 hover:text-white"
                      )}
                      title="Preview Mode"
                    >
                      <Camera size={12} />
                      <span>Preview</span>
                    </button>
                  </div>

                  <div className="h-5 w-px bg-white/10 shrink-0 mx-0.5" />

                  {/* Scene Hierarchy Trigger */}
                  <button
                    onClick={() => setMobileDrawer(d => d === 'hierarchy' ? 'none' : 'hierarchy')}
                    className={cn(
                      "h-8.5 px-2.5 rounded-xl border backdrop-blur-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer select-none active:scale-95 shrink-0",
                      mobileDrawer === 'hierarchy'
                        ? "bg-blue-600 text-white border-blue-400 shadow-blue-500/30"
                        : "bg-white/5 text-gray-200 hover:text-white border-white/10 hover:border-blue-500/40"
                    )}
                    title="Scene Objects & Hierarchy"
                  >
                    <Layers size={13} className={mobileDrawer === 'hierarchy' ? "text-white" : "text-blue-400"} />
                    <span>Scene</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/15 font-mono font-bold">
                      {totalObjectCount}
                    </span>
                  </button>

                  {/* Active Scene Pill with Add Scene shortcut */}
                  <button
                    onClick={() => openCreateSceneModal()}
                    className="h-8.5 px-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-all shrink-0 max-w-[140px]"
                    title={`Current Scene: "${activeSceneName}". Tap to add or manage scenes.`}
                  >
                    <Film size={12} className="text-purple-400 shrink-0" />
                    <span className="truncate">{activeSceneName}</span>
                    <Plus size={11} className="text-gray-400 shrink-0 stroke-[3]" />
                  </button>

                  {/* Animation Controller Toggle */}
                  <button
                    onClick={() => setShowAnimationController(v => !v)}
                    className={cn(
                      "h-8.5 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer select-none active:scale-95 shrink-0",
                      showAnimationController
                        ? "bg-cyan-600 text-white border-cyan-400 shadow-cyan-500/30"
                        : "bg-white/5 text-gray-200 hover:text-white border-white/10 hover:border-cyan-500/40"
                    )}
                    title="Toggle Keyframe Animation Controller Panel"
                  >
                    <Film size={12} className={showAnimationController ? "text-white" : "text-cyan-400"} />
                    <span>Anim</span>
                  </button>

                  {/* Object Properties Inspector */}
                  <button
                    onClick={() => setMobileDrawer(d => d === 'inspector' ? 'none' : 'inspector')}
                    className={cn(
                      "h-8.5 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer select-none active:scale-95 shrink-0 max-w-[140px]",
                      mobileDrawer === 'inspector'
                        ? "bg-blue-600 text-white border-blue-400 shadow-blue-500/30"
                        : "bg-white/5 text-gray-200 hover:text-white border-white/10 hover:border-blue-500/40"
                    )}
                    title="Toggle Object Properties Inspector"
                  >
                    <Sliders size={12} className={mobileDrawer === 'inspector' ? "text-white" : "text-blue-400"} />
                    <span className="truncate">
                      {selectedObject ? selectedObject.name : 'Properties'}
                    </span>
                  </button>
                </div>

                {/* Floating Multi-Selection Action Island (Visible when 2+ objects selected, scrollable) */}
                {selectedObjectIds.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-[#17171C]/95 border border-[#33333C] backdrop-blur-xl shadow-2xl rounded-2xl p-1.5 flex items-center justify-start gap-1.5 max-w-[96vw] overflow-x-auto overflow-y-hidden scrollbar-none touch-pan-x select-none"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                    onWheel={(e) => {
                      if (e.currentTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                        e.currentTarget.scrollLeft += e.deltaY;
                      }
                    }}
                  >
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold shrink-0">
                      <CheckSquare size={13} />
                      <span>{selectedObjectIds.length}</span>
                    </div>

                    {/* Integrated Alignment Controls */}
                    <AlignmentToolbar compact showTitle={false} className="border-0 bg-transparent p-0 shadow-none shrink-0" />

                    <div className="h-4 w-px bg-white/10 mx-0.5 shrink-0" />

                    <button
                      onClick={() => groupSelection()}
                      className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-xs font-semibold flex items-center gap-1 border border-white/10 cursor-pointer active:scale-95 transition-all shrink-0"
                      title="Group Selected Objects"
                    >
                      <FolderPlus size={13} className="text-amber-400" />
                      <span>Group</span>
                    </button>
                    <button
                      onClick={() => duplicateSelection()}
                      className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-xs font-semibold flex items-center gap-1 border border-white/10 cursor-pointer active:scale-95 transition-all shrink-0"
                      title="Duplicate Selected Objects"
                    >
                      <Copy size={13} className="text-cyan-400" />
                      <span>Clone</span>
                    </button>
                    <button
                      onClick={() => deleteSelection()}
                      className="px-2 py-1 rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1 border border-red-500/30 cursor-pointer active:scale-95 transition-all shrink-0"
                      title="Delete Selected Objects"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={() => selectObject(null)}
                      className="p-1 rounded-xl text-gray-400 hover:text-white cursor-pointer active:scale-95 shrink-0"
                      title="Clear Selection"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
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

              {/* View Mode Toggle: Editor vs Preview (Floating at Top Center of Viewport on Desktop ONLY - never overlaps mobile editor nav!) */}
              <div 
                id="view-mode-toggle-container"
                className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 z-40 items-center bg-[#131317]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl pointer-events-auto ring-1 ring-black/50"
              >
                <button
                  id="view-mode-editor-btn"
                  onClick={() => setPreviewMode(false)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95",
                    !isPreviewMode
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/40"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                  title="Editor Mode: Full workspace with transform gizmos, scene hierarchy, and inspector"
                >
                  <Edit3 size={13} />
                  <span>Editor</span>
                </button>
                <button
                  id="view-mode-preview-btn"
                  onClick={() => setPreviewMode(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95",
                    isPreviewMode
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/40 ring-1 ring-emerald-400/50"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                  title="Preview Mode: Simulate how end users experience the AR scene without leaving the workspace"
                >
                  <Camera size={13} />
                  <span>Preview</span>
                </button>
              </div>

              <Viewport />

              {/* Floating Animation Controller Overlay */}
              {!isPreviewMode && showAnimationController && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[94%] sm:w-full pointer-events-auto shadow-2xl">
                  <AnimationControllerPanel onClose={() => setShowAnimationController(false)} />
                </div>
              )}
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

      {/* Mobile Touch-Optimized Navigation Dock (Scrollable with Horizontal Drag/Touch) */}
      {isMobile && !isPreviewMode && (
        <div className="relative w-full shrink-0 z-40 select-none">
          {/* Scroll Left Chevron Hint Button */}
          {canScrollLeft && (
            <button
              onClick={() => scrollNav('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-50 w-7 h-7 rounded-full bg-black/85 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md cursor-pointer transition-all active:scale-90"
              title="Scroll Left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Scroll Right Chevron Hint Button */}
          {canScrollRight && (
            <button
              onClick={() => scrollNav('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-50 w-7 h-7 rounded-full bg-black/85 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md cursor-pointer transition-all active:scale-90"
              title="Scroll Right"
            >
              <ChevronRight size={16} />
            </button>
          )}

          <nav 
            ref={bottomNavRef}
            aria-label="Mobile Navigation Dock"
            className={cn(
              "bg-[#111114]/98 backdrop-blur-xl border-t border-[#26262B] flex items-center justify-start overflow-x-auto overflow-y-hidden px-3 gap-2 shrink-0 safe-area-inset-bottom touch-pan-x w-full select-none scrollbar-none",
              isLandscape ? "h-12" : "h-15"
            )}
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onPointerDown={handleNavPointerDown}
            onPointerMove={handleNavPointerMove}
            onPointerUp={handleNavPointerUp}
            onPointerCancel={handleNavPointerUp}
            onWheel={(e) => {
              if (e.currentTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {/* View Mode Toggle Pill (Editor / Preview) */}
            <div className="flex items-center bg-[#1A1A22] p-0.5 rounded-xl border border-white/10 shrink-0 shadow-inner">
              <button
                id="mobile-nav-editor-toggle-btn"
                onClick={() => setPreviewMode(false)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95",
                  !isPreviewMode 
                    ? "bg-blue-600 text-white shadow font-extrabold" 
                    : "text-gray-400 hover:text-white"
                )}
                title="Editor Mode: 3D scene editing and authoring"
              >
                <Box size={13} />
                <span>Editor</span>
              </button>
              <button
                id="mobile-nav-preview-toggle-btn"
                onClick={() => setPreviewMode(true)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95",
                  isPreviewMode 
                    ? "bg-emerald-600 text-white shadow font-extrabold" 
                    : "text-gray-400 hover:text-white"
                )}
                title="Preview Mode: Live AR simulation as experienced by end users"
              >
                <Camera size={13} />
                <span>Preview</span>
              </button>
            </div>
            <div className="h-6 w-px bg-white/10 shrink-0" />
          {/* Multi-Object Selection Mode Toggle */}
          <button
            onClick={() => {
              toggleMultiSelectMode();
              useEditorStore.getState().addToast(
                !isMultiSelectMode ? 'Multi-select ON: Tap objects in viewport or list' : 'Multi-select OFF'
              );
            }}
            className={cn(
              "flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-2 rounded-xl transition-all cursor-pointer shrink-0 select-none active:scale-95 relative",
              isMultiSelectMode 
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 border border-blue-400" 
                : "text-gray-400 hover:text-white"
            )}
            title="Toggle Multi-Selection Mode"
          >
            <div className="relative">
              <CheckSquare size={isLandscape ? 15 : 18} />
              {selectedObjectIds.length > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1 py-0.2 min-w-[14px] h-[14px] rounded-full bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center shadow-xs">
                  {selectedObjectIds.length}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap font-medium">
              {isMultiSelectMode ? 'Multi (ON)' : 'Multi'}
            </span>
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

          {/* Snap Alignment & Advertising Grid Control */}
          <div className="flex items-center shrink-0">
            <SnapToGridMenu direction="up" compact={true} align="center" />
          </div>

          {/* Prominent Asset Browser / Add Asset Trigger */}
          <button
            onClick={() => {
              openAssetBrowser('architecture');
              setMobileDrawer('none');
            }}
            className="flex flex-col items-center justify-center min-w-[54px] min-h-[44px] py-1 px-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold shadow-lg shadow-emerald-500/25 border border-emerald-400/40 transition-all cursor-pointer shrink-0 select-none active:scale-95 ring-1 ring-emerald-400/30"
            title="Add 3D Assets & Media"
          >
            <div className="flex items-center gap-0.5">
              <Plus size={isLandscape ? 11 : 13} className="stroke-[3]" />
              <FolderOpen size={isLandscape ? 13 : 15} />
            </div>
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap font-bold tracking-wide">Add Asset</span>
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

          {/* Onboarding Guide Trigger on Mobile */}
          <button
            onClick={() => useEditorStore.getState().setIsOnboardingModalOpen(true)}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-2 rounded-xl text-amber-400 hover:text-amber-300 transition-all cursor-pointer shrink-0 select-none active:scale-95"
            title="Interactive WebAR Guide & Onboarding (Turn On/Off)"
          >
            <BookOpen size={isLandscape ? 15 : 18} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 whitespace-nowrap">Guide</span>
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
        </div>
      )}

      {/* Mobile Floating Preview Controller when in Preview Mode */}
      {isMobile && isPreviewMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center gap-2.5 bg-[#111114]/95 backdrop-blur-2xl border border-emerald-500/40 px-4 py-2 rounded-2xl shadow-2xl ring-1 ring-black/60 select-none animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>AR Preview Mode</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <button
            id="mobile-exit-preview-btn"
            onClick={() => setPreviewMode(false)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/30 cursor-pointer active:scale-95 transition-all"
          >
            <Edit3 size={13} />
            <span>Return to Editor</span>
          </button>
        </div>
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
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setMobileDrawer('none');
                  }
                }}
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
                    "fixed inset-y-0 z-50 w-80 sm:w-96 bg-[#121215] border-[#2A2A30] shadow-2xl flex flex-col overflow-hidden ui-panel no-pointer-miss",
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
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold">
                            {totalObjectCount}
                          </span>
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
                  <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                    {mobileDrawer === 'hierarchy' && <HierarchyPanel hideHeader={true} onClose={() => setMobileDrawer('none')} />}
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
                  className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] h-[78vh] bg-[#121215] border-t border-[#2A2A30] rounded-t-2xl shadow-2xl flex flex-col overflow-hidden ui-panel no-pointer-miss"
                >
                  {/* Drag Handle & Header */}
                  <div className="flex flex-col items-center px-4 pt-2.5 pb-2 bg-[#17171C] border-b border-[#25252B] shrink-0">
                    <div className="w-10 h-1.5 rounded-full bg-gray-500/50 mb-2" />
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {mobileDrawer === 'hierarchy' ? (
                          <>
                            <Layers size={15} className="text-blue-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Scene Objects</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold">
                              {totalObjectCount}
                            </span>
                          </>
                        ) : (
                          <>
                            <Sliders size={15} className="text-blue-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Object Inspector</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {mobileDrawer === 'hierarchy' && (
                          <button
                            onClick={() => {
                              openAssetBrowser('architecture');
                              setMobileDrawer('none');
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Add Asset"
                          >
                            <Plus size={12} className="stroke-[3]" />
                            <span>Add Asset</span>
                          </button>
                        )}
                        <button
                          onClick={() => setMobileDrawer('none')}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                          title="Close drawer"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                    {mobileDrawer === 'hierarchy' && <HierarchyPanel hideHeader={true} onClose={() => setMobileDrawer('none')} />}
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

      {/* Centralized Scene Manager Modal (Create, Rename, Delete) */}
      <SceneManagerModal />

      {/* Accessible Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal />

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
