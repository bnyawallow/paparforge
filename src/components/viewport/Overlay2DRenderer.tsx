import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Settings, Grid3X3, Check, Globe, ExternalLink } from 'lucide-react';

export function Overlay2DRenderer({ isPreviewMode = false }: { isPreviewMode?: boolean }) {
  const { objects, selectedObjectId, selectObject, updateObject, overlayGridEnabled, setOverlayGridEnabled, overlayGridSize, setOverlayGridSize } = useEditorStore();
  const [showGridSettings, setShowGridSettings] = React.useState(false);
  const [draggingObj, setDraggingObj] = React.useState<{
    id: string;
    startX: number;
    startY: number;
    startTop: number;
    startLeft: number;
    isAligned: boolean;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  // High-frequency frame loop to update positions of 2D elements anchored to 3D targets
  const [frameTime, setFrameTime] = React.useState(0);
  React.useEffect(() => {
    let active = true;
    const tick = () => {
      if (!active) return;
      setFrameTime(Date.now());
      requestAnimationFrame(tick);
    };
    tick();
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingObj) {
        const deltaX = e.clientX - draggingObj.startX;
        const deltaY = e.clientY - draggingObj.startY;

        if (draggingObj.isAligned) {
          let newOffsetX = draggingObj.startOffsetX + deltaX;
          let newOffsetY = draggingObj.startOffsetY + deltaY;
          
          if (overlayGridEnabled) {
            newOffsetX = Math.round(newOffsetX / overlayGridSize) * overlayGridSize;
            newOffsetY = Math.round(newOffsetY / overlayGridSize) * overlayGridSize;
          }

          updateObject(draggingObj.id, {
            properties: {
              ...objects[draggingObj.id].properties,
              offsetX: newOffsetX,
              offsetY: newOffsetY
            }
          });
        } else {
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
    ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(obj.type) && obj.visible !== false
  );

  if (overlayObjects.length === 0) return null;

  const projectedPositions = (useEditorStore.getState() as any).projectedPositions || {};

  const getOverlayStyle = (obj: any, parentProjected: { x: number, y: number, visible: boolean } | null): React.CSSProperties => {
    const props = obj.properties || {};
    const alignment = props.alignment || 'none';
    const widthType = props.widthType || 'px';
    const heightType = props.heightType || 'px';
    const widthVal = props.width !== undefined ? props.width : (obj.type === 'overlayImage' ? 200 : 150);
    const heightVal = props.height !== undefined ? props.height : (obj.type === 'overlayImage' ? 200 : 40);
    const widthStr = widthType === '%' ? `${widthVal}%` : `${widthVal}px`;
    const heightStr = heightType === '%' ? `${heightVal}%` : `${heightVal}px`;
    const opacity = props.opacity ?? 1;

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      opacity,
      width: widthStr,
      height: heightStr,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    };

    if (parentProjected) {
      baseStyle.left = `${parentProjected.x}px`;
      baseStyle.top = `${parentProjected.y}px`;
      baseStyle.display = parentProjected.visible ? 'flex' : 'none';

      const offsetX = props.offsetX || 0;
      const offsetY = props.offsetY || 0;

      switch (alignment) {
        case 'top-left':
          baseStyle.transform = `translate(${-100 + offsetX}%, ${-100 + offsetY}%)`;
          break;
        case 'top-center':
          baseStyle.transform = `translate(${-50 + offsetX}%, ${-100 + offsetY}%)`;
          break;
        case 'top-right':
          baseStyle.transform = `translate(${offsetX}%, ${-100 + offsetY}%)`;
          break;
        case 'center-left':
          baseStyle.transform = `translate(${-100 + offsetX}%, ${-50 + offsetY}%)`;
          break;
        case 'center':
          baseStyle.transform = `translate(${-50 + offsetX}%, ${-50 + offsetY}%)`;
          break;
        case 'center-right':
          baseStyle.transform = `translate(${offsetX}%, ${-50 + offsetY}%)`;
          break;
        case 'bottom-left':
          baseStyle.transform = `translate(${-100 + offsetX}%, ${offsetY}%)`;
          break;
        case 'bottom-center':
          baseStyle.transform = `translate(${-50 + offsetX}%, ${offsetY}%)`;
          break;
        case 'bottom-right':
          baseStyle.transform = `translate(${offsetX}%, ${offsetY}%)`;
          break;
        default:
          baseStyle.transform = `translate(${props.left || 0}px, ${props.top || 0}px)`;
          break;
      }
    } else {
      const offsetX = props.offsetX || 0;
      const offsetY = props.offsetY || 0;

      if (alignment === 'none') {
        baseStyle.left = props.left !== undefined ? `${props.left}px` : '20px';
        baseStyle.top = props.top !== undefined ? `${props.top}px` : '20px';
      } else {
        switch (alignment) {
          case 'top-left':
            baseStyle.top = `${offsetY}px`;
            baseStyle.left = `${offsetX}px`;
            break;
          case 'top-center':
            baseStyle.top = `${offsetY}px`;
            baseStyle.left = '50%';
            baseStyle.transform = `translateX(-50%) translateX(${offsetX}px)`;
            break;
          case 'top-right':
            baseStyle.top = `${offsetY}px`;
            baseStyle.right = `${offsetX}px`;
            break;
          case 'center-left':
            baseStyle.top = '50%';
            baseStyle.left = `${offsetX}px`;
            baseStyle.transform = `translateY(-50%) translateY(${offsetY}px)`;
            break;
          case 'center':
            baseStyle.top = '50%';
            baseStyle.left = '50%';
            baseStyle.transform = `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`;
            break;
          case 'center-right':
            baseStyle.top = '50%';
            baseStyle.right = `${offsetX}px`;
            baseStyle.transform = `translateY(-50%) translateY(${offsetY}px)`;
            break;
          case 'bottom-left':
            baseStyle.bottom = `${offsetY}px`;
            baseStyle.left = `${offsetX}px`;
            break;
          case 'bottom-center':
            baseStyle.bottom = `${offsetY}px`;
            baseStyle.left = '50%';
            baseStyle.transform = `translateX(-50%) translateX(${offsetX}px)`;
            break;
          case 'bottom-right':
            baseStyle.bottom = `${offsetY}px`;
            baseStyle.right = `${offsetX}px`;
            break;
        }
      }
    }

    return baseStyle;
  };

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
        const alignment = props.alignment || 'none';
        const isSelected = selectedObjectId === obj.id;
        const parentProjected = obj.parentId ? (projectedPositions[obj.parentId] || null) : null;

        const handleMouseDown = (e: React.MouseEvent) => {
          if (isPreviewMode) return;
          e.stopPropagation();
          selectObject(obj.id);
          
          if (obj.type !== 'overlay2d') {
            setDraggingObj({
              id: obj.id,
              startX: e.clientX,
              startY: e.clientY,
              startTop: props.top || 0,
              startLeft: props.left || 0,
              isAligned: alignment !== 'none' || !!obj.parentId,
              startOffsetX: props.offsetX || 0,
              startOffsetY: props.offsetY || 0,
            });
          }
        };

        const computedStyle = getOverlayStyle(obj, parentProjected);
        const activeStyle: React.CSSProperties = {
          ...computedStyle,
          pointerEvents: 'auto',
          border: (!isPreviewMode && isSelected) ? '2px solid #06b6d4' : undefined,
          outline: (!isPreviewMode && isSelected) ? '2px solid rgba(6, 182, 212, 0.5)' : undefined,
          boxShadow: (!isPreviewMode && isSelected) ? '0 0 10px rgba(6, 182, 212, 0.5)' : undefined,
        };

        if (obj.type === 'overlay2d') {
          return (
            <div 
              key={obj.id} 
              className="absolute inset-0"
              style={{ 
                backgroundColor: props.backgroundColor || '#000', 
                opacity: props.opacity ?? 0.5,
                pointerEvents: 'auto',
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
                ...activeStyle, 
                color: props.color || '#fff', 
                fontSize: `${props.fontSize || 24}px`,
                whiteSpace: 'pre-wrap',
                cursor: !isPreviewMode ? 'move' : 'default',
                alignItems: alignment.includes('center') ? 'center' : (alignment.includes('right') ? 'flex-end' : 'flex-start'),
                justifyContent: 'center',
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
                ...activeStyle, 
                backgroundColor: props.color || '#3b82f6', 
                color: props.textColor || '#fff', 
                padding: `${props.paddingY || 8}px ${props.paddingX || 16}px`, 
                borderRadius: `${props.borderRadius || 8}px`,
                border: (!isPreviewMode && isSelected) ? '2px solid #fff' : 'none',
                cursor: !isPreviewMode ? 'move' : 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
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
                ...activeStyle, 
                objectFit: 'cover',
                cursor: !isPreviewMode ? 'move' : 'default'
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
          );
        }

        if (obj.type === 'overlayEmbed') {
          const showBorder = props.borderEnabled ?? true;
          return (
            <div 
              key={obj.id} 
              style={{ 
                ...activeStyle, 
                backgroundColor: '#111', 
                borderRadius: `${props.borderRadius || 12}px`,
                overflow: 'hidden',
                border: showBorder ? `2px solid ${props.borderColor || '#2563eb'}` : 'none',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                cursor: !isPreviewMode ? 'move' : 'default'
              }}
              onMouseDown={handleMouseDown}
            >
              <div className="bg-[#1a1a1a] px-3 py-1.5 flex items-center justify-between border-b border-[#222] select-none text-[10px] text-gray-400 font-mono shrink-0">
                <div className="flex items-center gap-1.5 overflow-hidden flex-1 mr-2">
                  <Globe size={12} className="text-cyan-400 shrink-0 animate-pulse" />
                  <span className="truncate text-[10px] font-medium text-gray-300">{props.url || 'No URL'}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isPreviewMode && (
                    <button 
                      onClick={() => window.open(props.url || 'https://wikipedia.org', '_blank')}
                      className="hover:bg-[#333] p-0.5 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="Open in new tab"
                    >
                      <ExternalLink size={10} />
                    </button>
                  )}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                </div>
              </div>
              
              <div className="flex-1 w-full h-full relative bg-white overflow-hidden">
                <iframe 
                  src={props.url || 'https://wikipedia.org'} 
                  title={obj.name}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  referrerPolicy="no-referrer"
                />
                {!isPreviewMode && (
                  <div className="absolute inset-0 bg-transparent pointer-events-auto cursor-move" />
                )}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
