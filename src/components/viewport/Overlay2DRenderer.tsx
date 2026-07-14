import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';

import { Settings, Grid3X3, Check } from 'lucide-react';

export function Overlay2DRenderer({ isPreviewMode = false }: { isPreviewMode?: boolean }) {
  const { objects, selectedObjectId, selectObject, updateObject, overlayGridEnabled, setOverlayGridEnabled, overlayGridSize, setOverlayGridSize } = useEditorStore();
  const [showGridSettings, setShowGridSettings] = React.useState(false);
  const [draggingObj, setDraggingObj] = React.useState<{id: string, startX: number, startY: number, startTop: number, startLeft: number} | null>(null);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingObj) {
        const deltaX = e.clientX - draggingObj.startX;
        const deltaY = e.clientY - draggingObj.startY;
        let newLeft = draggingObj.startLeft + deltaX;
        let newTop = draggingObj.startTop + deltaY;
        
        if (overlayGridEnabled) {
          newLeft = Math.round(newLeft / overlayGridSize) * overlayGridSize;
          newTop = Math.round(newTop / overlayGridSize) * overlayGridSize;
        }

        updateObject(draggingObj.id, {
          properties: {
            ...objects[draggingObj.id].properties,
            left: newLeft,
            top: newTop
          }
        });
      }
    };
    const handleMouseUp = () => {
      setDraggingObj(null);
    };

    if (draggingObj) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingObj, overlayGridEnabled, overlayGridSize, updateObject, objects]);
  
  const overlayObjects = Object.values(objects).filter((obj: any) => 
    ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage'].includes(obj.type) && obj.visible !== false
  );

  if (overlayObjects.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {!isPreviewMode && overlayGridEnabled && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
            backgroundSize: `${overlayGridSize}px ${overlayGridSize}px`
          }}
        ></div>
      )}
      {!isPreviewMode && overlayObjects.length > 0 && (
        <div className="absolute top-4 right-4 pointer-events-auto z-50">
          <div className="relative">
            <button 
              onClick={() => setShowGridSettings(!showGridSettings)}
              className="bg-[#111] border border-[#333] hover:border-[#555] text-white p-2 rounded-lg shadow-lg flex items-center justify-center transition-all"
              title="2D Overlay Grid Settings"
            >
              <Grid3X3 size={16} className={overlayGridEnabled ? 'text-cyan-400' : 'text-[#888]'} />
            </button>
            {showGridSettings && (
              <div className="absolute top-12 right-0 bg-[#161616] border border-[#333] rounded-lg shadow-xl w-48 p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Snap Grid</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={overlayGridEnabled} onChange={(e) => setOverlayGridEnabled(e.target.checked)} />
                    <div className="w-8 h-4 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
                {overlayGridEnabled && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#888] font-medium">Grid Size (px)</label>
                    <input 
                      type="number" 
                      value={overlayGridSize} 
                      onChange={(e) => setOverlayGridSize(Math.max(10, parseInt(e.target.value) || 50))}
                      className="bg-[#0A0A0A] text-xs p-1.5 rounded w-full border border-[#222] text-white focus:border-cyan-500 outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {overlayObjects.map((obj: any) => {
        const props = obj.properties || {};
        
        // Ensure interactive elements have pointer events when in preview, or when they are selected in the editor? 
        // We'll just let them be styled, but pointer-events: none is on the wrapper. We must enable it per element in preview.
        const pointerEvents = 'auto';
        const handleMouseDown = (e: React.MouseEvent) => {
          if (isPreviewMode) return;
          e.stopPropagation();
          selectObject(obj.id);
          if (obj.type !== 'overlay2d') { // overlay2d is fullscreen, so no drag
            setDraggingObj({
              id: obj.id,
              startX: e.clientX,
              startY: e.clientY,
              startTop: props.top || 0,
              startLeft: props.left || 0
            });
          }
        };
        const isSelected = selectedObjectId === obj.id;

        const baseStyle: React.CSSProperties = {
          position: 'absolute',
          top: props.top !== undefined ? `${props.top}px` : undefined,
          left: props.left !== undefined ? `${props.left}px` : undefined,
          opacity: props.opacity ?? 1,
          pointerEvents,
          border: (!isPreviewMode && isSelected) ? '2px solid #06b6d4' : undefined,
          outline: (!isPreviewMode && isSelected) ? '2px solid rgba(6, 182, 212, 0.5)' : undefined,
          boxShadow: (!isPreviewMode && isSelected) ? '0 0 10px rgba(6, 182, 212, 0.5)' : undefined,
          boxSizing: 'border-box'
        };

        if (obj.type === 'overlay2d') {
          return (
            <div 
              key={obj.id} 
              className="absolute inset-0"
              style={{ 
                backgroundColor: props.backgroundColor || '#000', 
                opacity: props.opacity ?? 0.5,
                pointerEvents,
              }}
              onMouseDown={handleMouseDown}
            >
            </div>
          );
        }

        if (obj.type === 'overlayText') {
          return (
            <div 
              key={obj.id} 
              style={{ 
                ...baseStyle, 
                color: props.color || '#fff', 
                fontSize: `${props.fontSize || 24}px`,
                whiteSpace: 'pre-wrap',
                cursor: !isPreviewMode ? 'move' : 'default'
              }}
              onMouseDown={handleMouseDown}
            >
              {props.text || 'Text'}
            </div>
          );
        }

        if (obj.type === 'overlayButton') {
          return (
            <button 
              key={obj.id} 
              style={{ 
                ...baseStyle, 
                backgroundColor: props.color || '#3b82f6', 
                color: props.textColor || '#fff', 
                padding: `${props.paddingY || 8}px ${props.paddingX || 16}px`, 
                borderRadius: `${props.borderRadius || 8}px`,
                border: (!isPreviewMode && isSelected) ? '2px solid #fff' : 'none',
                cursor: !isPreviewMode ? 'move' : 'pointer'
              }}
              onMouseDown={handleMouseDown}
              onClick={() => {
                if (isPreviewMode && props.url) {
                  window.open(props.url, '_blank');
                }
              }}
            >
              {props.text || 'Button'}
            </button>
          );
        }

        if (obj.type === 'overlayImage') {
          return (
            <img 
              key={obj.id}
              src={props.textureUrl || 'https://via.placeholder.com/200'}
              alt={obj.name}
              style={{ 
                ...baseStyle, 
                width: `${props.width || 200}px`, 
                height: `${props.height || 200}px`, 
                objectFit: 'cover',
                cursor: !isPreviewMode ? 'move' : 'default'
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
