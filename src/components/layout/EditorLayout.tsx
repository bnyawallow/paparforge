import React from 'react';
import { Toolbar } from '../toolbar/Toolbar';
import { HierarchyPanel } from '../hierarchy/HierarchyPanel';
import { InspectorPanel } from '../inspector/InspectorPanel';
import { Viewport } from '../viewport/Viewport';
import { AssetBrowser } from '../assets/AssetBrowser';
import { ScriptEditorPanel } from './ScriptEditorPanel';
import { useEditorStore } from '../../store/useEditorStore';

export function EditorLayout() {
  const isPreviewMode = useEditorStore(state => state.isPreviewMode);
  const editingScriptObjectId = useEditorStore(state => state.editingScriptObjectId);

  const [bottomHeight, setBottomHeight] = React.useState(224); // default 224px (h-56)
  const [isDragging, setIsDragging] = React.useState(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      // restrict size to sensible bounds (e.g. min 120px, max screen - 200px)
      if (newHeight > 120 && newHeight < window.innerHeight - 200) {
        setBottomHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-[#111111]">
          {/* Top segment: Hierarchy Panel and Viewport (3D Editor) side-by-side */}
          <div className="flex-1 flex overflow-hidden relative">
            {!isPreviewMode && <HierarchyPanel />}
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
          {/* Bottom segment: AssetBrowser or ScriptEditorPanel */}
          {!isPreviewMode && (
            <>
              {/* Resize handle bar */}
              <div 
                onMouseDown={startResize}
                className="h-1 bg-[#222] hover:bg-blue-500 cursor-row-resize transition-all shrink-0 z-40 relative group"
                title="Drag to resize assets panel"
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
                {editingScriptObjectId ? <ScriptEditorPanel /> : <AssetBrowser />}
              </div>
            </>
          )}
        </div>
        {!isPreviewMode && <InspectorPanel />}
      </div>
    </div>
  );
}
