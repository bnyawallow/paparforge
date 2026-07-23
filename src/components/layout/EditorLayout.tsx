import React from 'react';
import { Toolbar } from '../toolbar/Toolbar';
import { HierarchyPanel } from '../hierarchy/HierarchyPanel';
import { InspectorPanel } from '../inspector/InspectorPanel';
import { Viewport } from '../viewport/Viewport';
import { AssetBrowser } from '../assets/AssetBrowser';
import { ScriptEditorPanel } from './ScriptEditorPanel';
import { useEditorStore } from '../../store/useEditorStore';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { motion, AnimatePresence } from 'motion/react';

export function EditorLayout() {
  const t = useTheme();
  const isPreviewMode = useEditorStore(state => state.isPreviewMode);
  const editingScriptObjectId = useEditorStore(state => state.editingScriptObjectId);

  const [bottomHeight, setBottomHeight] = React.useState(224); // default 224px (h-56)
  const [leftWidth, setLeftWidth] = React.useState(240); // default 240px
  const [rightWidth, setRightWidth] = React.useState(288); // default 288px (w-72)
  const [isDraggingBottom, setIsDraggingBottom] = React.useState(false);
  const [isDraggingLeft, setIsDraggingLeft] = React.useState(false);
  const [isDraggingRight, setIsDraggingRight] = React.useState(false);
  const [previewDevice, setPreviewDevice] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');

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

  React.useEffect(() => {
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

  // Global Keyboard Shortcuts for Undo/Redo (Ctrl+Z / Cmd+Z, Ctrl+Y / Cmd+Shift+Z)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPreviewMode) return;

      const activeElement = document.activeElement;
      if (activeElement) {
        const tagName = activeElement.tagName.toLowerCase();
        // Skip global shortcuts when actively typing in text input elements
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
          if (state.selectedObjectId) {
            e.preventDefault();
            state.duplicateObject(state.selectedObjectId);
          }
        }
      } else if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        // Individual key shortcuts when no modifier is pressed
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

  // Auto-save mechanism: periodically saves current scene state to local storage and triggers toast notification
  React.useEffect(() => {
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

    const interval = setInterval(handleAutoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-200 ${t.bgMain} ${t.textMain}`}>
      <Toolbar />
      <AssetBrowser />
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-200 ${t.isLight ? 'bg-[#F9F9FB]' : 'bg-[#111111]'}`}>
          {/* Top segment: Hierarchy Panel and Viewport (3D Editor) side-by-side */}
          <div className="flex-1 flex overflow-hidden relative">
            <AnimatePresence mode="wait">
              {!isPreviewMode && (
                <motion.div
                  key="hierarchy-panel"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex h-full shrink-0"
                >
                  <HierarchyPanel width={leftWidth} />
                  <div 
                    onMouseDown={startResizeLeft}
                    className={`w-1 cursor-col-resize transition-all shrink-0 z-40 relative group ${t.isLight ? 'bg-gray-200 hover:bg-blue-500' : 'bg-[#222] hover:bg-blue-500'}`}
                    title="Drag to resize hierarchy panel"
                  >
                    <div className="absolute inset-y-0 -left-1.5 -right-1.5 cursor-col-resize"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
                      <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
                      <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 relative overflow-hidden">
              {!isPreviewMode && (
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#666 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                ></div>
              )}
              <Viewport />
            </div>
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

        <AnimatePresence mode="wait">
          {!isPreviewMode && (
            <motion.div
              key="inspector-panel"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex h-full shrink-0"
            >
              <div 
                onMouseDown={startResizeRight}
                className={`w-1 cursor-col-resize transition-all shrink-0 z-40 relative group ${t.isLight ? 'bg-gray-200 hover:bg-blue-500' : 'bg-[#222] hover:bg-blue-500'}`}
                title="Drag to resize inspector panel"
              >
                <div className="absolute inset-y-0 -left-1.5 -right-1.5 cursor-col-resize"></div>
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
                  <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
                  <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
                </div>
              </div>
              <InspectorPanel width={rightWidth} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
