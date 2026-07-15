import React from 'react';
import { Toolbar } from '../toolbar/Toolbar';
import { HierarchyPanel } from '../hierarchy/HierarchyPanel';
import { InspectorPanel } from '../inspector/InspectorPanel';
import { Viewport } from '../viewport/Viewport';
import { AssetBrowser } from '../assets/AssetBrowser';
import { ScriptEditorPanel } from './ScriptEditorPanel';
import { useEditorStore } from '../../store/useEditorStore';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

export function EditorLayout() {
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

  // Auto-save mechanism: persists scene state to local storage every 30 seconds
  React.useEffect(() => {
    const handleAutoSave = () => {
      try {
        const state = useEditorStore.getState();
        const dataToSave = {
          objects: state.objects,
          rootObjects: state.rootObjects,
          settings: state.settings,
          assets: state.assets,
          lastSavedTime: Date.now()
        };
        localStorage.setItem('ar_forge_autosave', JSON.stringify(dataToSave));
        useEditorStore.setState({ lastSavedTime: Date.now() });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };

    const interval = setInterval(handleAutoSave, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0F0F0F] text-[#E0E0E0] font-sans overflow-hidden">
      <Toolbar />
      <AssetBrowser />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-[#111111]">
          {/* Top segment: Hierarchy Panel and Viewport (3D Editor) side-by-side */}
          <div className="flex-1 flex overflow-hidden relative">
            {!isPreviewMode && <HierarchyPanel width={leftWidth} />}
            {!isPreviewMode && (
              <div 
                onMouseDown={startResizeLeft}
                className="w-1 bg-[#222] hover:bg-blue-500 cursor-col-resize transition-all shrink-0 z-40 relative group"
                title="Drag to resize hierarchy panel"
              >
                <div className="absolute inset-y-0 -left-1.5 -right-1.5 cursor-col-resize"></div>
                {/* Visual grab indicators in the center of the vertical bar */}
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
                  <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
                  <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
                </div>
              </div>
            )}
            <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-[#0a0a0a]">
              {isPreviewMode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-[#1A1A1A] border border-[#333] rounded-lg z-50 shadow-xl">
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-2 rounded-md transition-colors ${previewDevice === 'mobile' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white hover:bg-[#222]'}`}
                    title="Mobile View (375x812)"
                  >
                    <Smartphone size={16} />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`p-2 rounded-md transition-colors ${previewDevice === 'tablet' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white hover:bg-[#222]'}`}
                    title="Tablet View (768x1024)"
                  >
                    <Tablet size={16} />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-2 rounded-md transition-colors ${previewDevice === 'desktop' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white hover:bg-[#222]'}`}
                    title="Desktop View (Full Screen)"
                  >
                    <Monitor size={16} />
                  </button>
                </div>
              )}
              {!isPreviewMode && (
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#666 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                ></div>
              )}
              
              <div 
                className={`transition-all duration-300 ease-in-out relative ${
                  isPreviewMode && previewDevice !== 'desktop' 
                    ? 'border-8 border-[#333] rounded-[2rem] overflow-hidden shadow-2xl mx-auto my-auto' 
                    : 'w-full h-full'
                }`}
                style={
                  isPreviewMode && previewDevice === 'mobile' ? { width: '375px', height: '812px', maxHeight: '90vh' } :
                  isPreviewMode && previewDevice === 'tablet' ? { width: '768px', height: '1024px', maxHeight: '90vh' } :
                  { width: '100%', height: '100%' }
                }
              >
                <Viewport />
              </div>
            </div>
          </div>

          {/* Bottom segment: ScriptEditorPanel */}
          {!isPreviewMode && editingScriptObjectId && (
            <>
              {/* Resize handle bar */}
              <div 
                onMouseDown={startResizeBottom}
                className="h-1 bg-[#222] hover:bg-blue-500 cursor-row-resize transition-all shrink-0 z-40 relative group"
                title="Drag to resize script panel"
              >
                <div className="absolute inset-x-0 -top-1 -bottom-1 cursor-row-resize"></div>
                {/* Visual grab indicators in the center of the bar */}
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 flex gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1 rounded-full bg-blue-400"></div>
                  <div className="w-1.5 h-1 rounded-full bg-blue-400"></div>
                  <div className="w-1.5 h-1 rounded-full bg-blue-400"></div>
                </div>
              </div>
              <div style={{ height: `${bottomHeight}px` }} className="shrink-0 flex flex-col overflow-hidden">
                <ScriptEditorPanel />
              </div>
            </>
          )}
        </div>
        {!isPreviewMode && (
          <>
            <div 
              onMouseDown={startResizeRight}
              className="w-1 bg-[#222] hover:bg-blue-500 cursor-col-resize transition-all shrink-0 z-40 relative group"
              title="Drag to resize inspector panel"
            >
              <div className="absolute inset-y-0 -left-1.5 -right-1.5 cursor-col-resize"></div>
              {/* Visual grab indicators in the center of the vertical bar */}
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
                <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
                <div className="w-1 h-1.5 rounded-full bg-blue-400"></div>
              </div>
            </div>
            <InspectorPanel width={rightWidth} />
          </>
        )}
      </div>
    </div>
  );
}
