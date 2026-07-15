import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Settings, Grid3X3, Check, Globe, ExternalLink, X } from 'lucide-react';

export function Overlay2DRenderer({ isPreviewMode = false }: { isPreviewMode?: boolean }) {
  const { objects, selectedObjectId, selectObject, updateObject, overlayGridEnabled, setOverlayGridEnabled, overlayGridSize, setOverlayGridSize } = useEditorStore();
  const [showGridSettings, setShowGridSettings] = React.useState(false);
  const [activeSnapLines, setActiveSnapLines] = React.useState<Array<{ type: 'v' | 'h'; coord: number }>>([]);
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

  const [resizingObj, setResizingObj] = React.useState<{
    id: string;
    edge: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startLeft: number;
    startTop: number;
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
        const dragObj = useEditorStore.getState().objects[draggingObj.id];
        const dragParentObj = dragObj?.parentId ? useEditorStore.getState().objects[dragObj.parentId] : null;
        const dragParentIsAutoLayout = dragParentObj && dragParentObj.type === 'overlay2d' && ['row', 'column'].includes(dragParentObj.properties?.layoutMode || '');
        if (dragParentIsAutoLayout) {
          return;
        }

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
              ...useEditorStore.getState().objects[draggingObj.id].properties,
              offsetX: newOffsetX,
              offsetY: newOffsetY
            }
          });
        } else {
          let newLeft = draggingObj.startLeft + deltaX;
          let newTop = draggingObj.startTop + deltaY;

          const dragId = draggingObj.id;
          const dragObj = useEditorStore.getState().objects[dragId];
          const dragProps = dragObj?.properties || {};
          const dragWidth = dragProps.width !== undefined ? dragProps.width : (dragObj.type === 'overlayImage' ? 200 : (dragObj.type === 'overlayEmbed' ? 400 : 150));
          const dragHeight = dragProps.height !== undefined ? dragProps.height : (dragObj.type === 'overlayImage' ? 200 : (dragObj.type === 'overlayEmbed' ? 300 : 40));

          // Retrieve parent width/height if parenting is active
          let parentW = 0;
          let parentH = 0;
          if (dragObj?.parentId) {
            const parentObj = useEditorStore.getState().objects[dragObj.parentId];
            if (parentObj && parentObj.type === 'overlay2d') {
              parentW = parentObj.properties?.width || 0;
              parentH = parentObj.properties?.height || 0;
            }
          }

          // Filter for snap candidates at same hierarchical level
          const isDescendant = (childId: string, parentId: string): boolean => {
            let curr = useEditorStore.getState().objects[childId];
            while (curr && curr.parentId) {
              if (curr.parentId === parentId) return true;
              curr = useEditorStore.getState().objects[curr.parentId];
            }
            return false;
          };

          const otherOverlays = Object.values(useEditorStore.getState().objects).filter((o: any) => 
            ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(o.type) &&
            o.id !== dragId && 
            o.visible !== false &&
            !isDescendant(o.id, dragId) && 
            o.parentId === dragObj.parentId
          );

          let bestDeltaX = 8; // Snap threshold
          let bestSnapX: number | null = null;
          let bestLineX: number | null = null;

          let bestDeltaY = 8;
          let bestSnapY: number | null = null;
          let bestLineY: number | null = null;

          const targetsX: number[] = [];
          const targetsY: number[] = [];

          if (parentW > 0) {
            targetsX.push(0, parentW / 2, parentW);
          }
          if (parentH > 0) {
            targetsY.push(0, parentH / 2, parentH);
          }

          otherOverlays.forEach((o: any) => {
            const oLeft = o.properties?.left ?? 20;
            const oWidth = o.properties?.width ?? (o.type === 'overlayImage' ? 200 : (o.type === 'overlayEmbed' ? 400 : 150));
            targetsX.push(oLeft, oLeft + oWidth / 2, oLeft + oWidth);

            const oTop = o.properties?.top ?? 20;
            const oHeight = o.properties?.height ?? (o.type === 'overlayImage' ? 200 : (o.type === 'overlayEmbed' ? 300 : 40));
            targetsY.push(oTop, oTop + oHeight / 2, oTop + oHeight);
          });

          // Horizontal/Vertical snapping checks
          targetsX.forEach(tx => {
            const dLeft = Math.abs(newLeft - tx);
            if (dLeft < bestDeltaX) {
              bestDeltaX = dLeft;
              bestSnapX = tx;
              bestLineX = tx;
            }
            const dCenter = Math.abs(newLeft + dragWidth / 2 - tx);
            if (dCenter < bestDeltaX) {
              bestDeltaX = dCenter;
              bestSnapX = tx - dragWidth / 2;
              bestLineX = tx;
            }
            const dRight = Math.abs(newLeft + dragWidth - tx);
            if (dRight < bestDeltaX) {
              bestDeltaX = dRight;
              bestSnapX = tx - dragWidth;
              bestLineX = tx;
            }
          });

          targetsY.forEach(ty => {
            const dTop = Math.abs(newTop - ty);
            if (dTop < bestDeltaY) {
              bestDeltaY = dTop;
              bestSnapY = ty;
              bestLineY = ty;
            }
            const dCenterY = Math.abs(newTop + dragHeight / 2 - ty);
            if (dCenterY < bestDeltaY) {
              bestDeltaY = dCenterY;
              bestSnapY = ty - dragHeight / 2;
              bestLineY = ty;
            }
            const dBottom = Math.abs(newTop + dragHeight - ty);
            if (dBottom < bestDeltaY) {
              bestDeltaY = dBottom;
              bestSnapY = ty - dragHeight;
              bestLineY = ty;
            }
          });

          const lines: Array<{ type: 'v' | 'h'; coord: number }> = [];
          if (bestSnapX !== null) {
            newLeft = bestSnapX;
            if (bestLineX !== null) lines.push({ type: 'v', coord: bestLineX });
          }
          if (bestSnapY !== null) {
            newTop = bestSnapY;
            if (bestLineY !== null) lines.push({ type: 'h', coord: bestLineY });
          }

          setActiveSnapLines(lines);

          if (overlayGridEnabled && bestSnapX === null && bestSnapY === null) {
            newLeft = Math.round(newLeft / overlayGridSize) * overlayGridSize;
            newTop = Math.round(newTop / overlayGridSize) * overlayGridSize;
          }

          updateObject(draggingObj.id, {
            properties: {
              ...useEditorStore.getState().objects[draggingObj.id].properties,
              left: newLeft,
              top: newTop
            }
          });
        }
      }

      if (resizingObj) {
        const deltaX = e.clientX - resizingObj.startX;
        const deltaY = e.clientY - resizingObj.startY;

        let newWidth = resizingObj.startWidth;
        let newHeight = resizingObj.startHeight;
        let newLeft = resizingObj.startLeft;
        let newTop = resizingObj.startTop;

        if (resizingObj.edge.includes('e')) newWidth += deltaX;
        if (resizingObj.edge.includes('w')) {
          newWidth -= deltaX;
          newLeft += deltaX;
        }
        if (resizingObj.edge.includes('s')) newHeight += deltaY;
        if (resizingObj.edge.includes('n')) {
          newHeight -= deltaY;
          newTop += deltaY;
        }

        newWidth = Math.max(10, newWidth);
        newHeight = Math.max(10, newHeight);

        updateObject(resizingObj.id, {
          properties: {
            ...useEditorStore.getState().objects[resizingObj.id].properties,
            width: newWidth,
            height: newHeight,
            left: newLeft,
            top: newTop
          }
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingObj(null);
      setResizingObj(null);
      setActiveSnapLines([]);
    };

    if (draggingObj || resizingObj) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingObj, resizingObj, overlayGridEnabled, overlayGridSize, updateObject]);

  const overlayObjects = Object.values(useEditorStore.getState().objects).filter((obj: any) => 
    ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(obj.type) && obj.visible !== false
  );

  const selectedObj = selectedObjectId ? useEditorStore.getState().objects[selectedObjectId] : null;
  const is2DSelected = selectedObj && ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(selectedObj.type);

  const handleAlign = (alignment: string) => {
    if (!selectedObjectId) return;
    updateObject(selectedObjectId, {
      properties: {
        ...useEditorStore.getState().objects[selectedObjectId].properties,
        alignment,
        offsetX: 0,
        offsetY: 0
      }
    });
  };

  const alignments = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'center-left', label: 'Center Left' },
    { value: 'center', label: 'Center' },
    { value: 'center-right', label: 'Center Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' }
  ];

  if (overlayObjects.length === 0) return null;

  const projectedPositions = (useEditorStore.getState() as any).projectedPositions || {};

  const getOverlayStyle = (obj: any, parentProjected: { x: number, y: number, visible: boolean } | null): React.CSSProperties => {
    const props = obj.properties || {};
    const alignment = props.alignment || 'none';
    const widthType = props.widthType || 'px';
    const heightType = props.heightType || 'px';
    const widthVal = props.width !== undefined ? props.width : (obj.type === 'overlayImage' ? 200 : (obj.type === 'overlayEmbed' ? 400 : (obj.type === 'overlay2d' ? 500 : 150)));
    const heightVal = props.height !== undefined ? props.height : (obj.type === 'overlayImage' ? 200 : (obj.type === 'overlayEmbed' ? 300 : (obj.type === 'overlay2d' ? 400 : 40)));
    const widthStr = widthType === '%' ? `${widthVal}%` : `${widthVal}px`;
    const heightStr = heightType === '%' ? `${heightVal}%` : `${heightVal}px`;
    const opacity = props.opacity ?? 1;

    const parentObj = obj.parentId ? useEditorStore.getState().objects[obj.parentId] : null;
    const isAutoLayoutActive = parentObj && parentObj.type === 'overlay2d' && ['row', 'column'].includes(parentObj.properties?.layoutMode || '');

    if (obj.type === 'overlayEmbed' && props.fullScreenWithMargins) {
      const topM = props.marginTop ?? 20;
      const bottomM = props.marginBottom ?? 20;
      const leftM = props.marginLeft ?? 20;
      const rightM = props.marginRight ?? 20;
      return {
        position: 'absolute',
        opacity,
        top: `${topM}px`,
        bottom: `${bottomM}px`,
        left: `${leftM}px`,
        right: `${rightM}px`,
        width: 'auto',
        height: 'auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        zIndex: props.zIndex ?? 1,
      };
    }

    const baseStyle: React.CSSProperties = {
      position: isAutoLayoutActive ? 'relative' : 'absolute',
      opacity,
      width: widthStr,
      height: heightStr,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      zIndex: props.zIndex ?? 1,
    };

    if (obj.type === 'overlay2d' && ['row', 'column'].includes(props.layoutMode || '')) {
      baseStyle.display = 'flex';
      baseStyle.flexDirection = props.layoutMode;
      baseStyle.padding = `${props.layoutPadding ?? 16}px`;
      baseStyle.gap = `${props.layoutGap ?? 8}px`;
      baseStyle.alignItems = props.layoutAlignItems || 'center';
      baseStyle.justifyContent = props.layoutJustifyContent || 'flex-start';
      baseStyle.flexWrap = props.layoutWrap || 'nowrap';
    }

    if (isAutoLayoutActive) {
      // Position is managed automatically by the flex layout
    } else if (parentProjected) {
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

    const scaleX = obj.scale?.[0] ?? 1;
    const scaleY = obj.scale?.[1] ?? 1;
    if (scaleX !== 1 || scaleY !== 1) {
      if (baseStyle.transform) {
        baseStyle.transform += ` scale(${scaleX}, ${scaleY})`;
      } else {
        baseStyle.transform = `scale(${scaleX}, ${scaleY})`;
      }
      baseStyle.transformOrigin = 'center center';
    }

    return baseStyle;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {!isPreviewMode && is2DSelected && overlayGridEnabled && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
            backgroundSize: `${overlayGridSize}px ${overlayGridSize}px`
          }}
        ></div>
      )}
      {!isPreviewMode && is2DSelected && overlayObjects.length > 0 && (
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
      {is2DSelected && !isPreviewMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-50 animate-in slide-in-from-top-4 duration-200">
          <div className="bg-[#111113]/95 backdrop-blur-md border border-[#2D2D30]/80 shadow-2xl rounded-xl p-2.5 flex items-center gap-3.5">
            {/* Visual Alignment Label */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">HUD Snap</span>
              <span className="text-[9px] text-gray-400 truncate max-w-[100px]">{selectedObj?.name}</span>
            </div>

            {/* 3x3 Snap Grid */}
            <div className="grid grid-cols-3 gap-1 bg-[#0A0A0C] p-1 rounded-lg border border-[#222]">
              {alignments.map((align) => {
                const isActive = selectedObj?.properties?.alignment === align.value;
                return (
                  <button
                    key={align.value}
                    onClick={() => handleAlign(align.value)}
                    className={`w-5.5 h-5.5 rounded transition-all flex items-center justify-center cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 scale-105' 
                        : 'bg-[#18181B] hover:bg-[#27272A] border border-[#2E2E33] hover:border-gray-500 text-gray-500 hover:text-white'
                    }`}
                    title={`Snap to ${align.label}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-black' : 'bg-gray-500 group-hover:bg-white'}`} />
                  </button>
                );
              })}
            </div>

            <div className="h-8 w-[1px] bg-[#2D2D30]" />

            {/* Free drag reset button */}
            <button
              onClick={() => handleAlign('none')}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                selectedObj?.properties?.alignment === 'none' || !selectedObj?.properties?.alignment
                  ? 'bg-[#222] border border-cyan-500/30 text-cyan-400 font-bold'
                  : 'bg-transparent border border-transparent hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
              title="Switch to Free Drag Manual placement"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Free Drag</span>
            </button>
          </div>
        </div>
      )}
      {(() => {
        // Helper to convert hex to rgba for background transparency so children aren't made transparent
        const hexToRgba = (hex: string, alpha: number) => {
          if (!hex || !hex.startsWith('#')) return hex;
          const r = parseInt(hex.slice(1, 3), 16) || 0;
          const g = parseInt(hex.slice(3, 5), 16) || 0;
          const b = parseInt(hex.slice(5, 7), 16) || 0;
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const renderOverlayObject = (obj: any) => {
          const props = obj.properties || {};
          const alignment = props.alignment || 'none';
          const isSelected = selectedObjectId === obj.id;
          const parentProjected = obj.parentId ? (projectedPositions[obj.parentId] || null) : null;

          const handleMouseDown = (e: React.MouseEvent) => {
            if (isPreviewMode) return;
            e.stopPropagation();
            selectObject(obj.id);
            
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
          };

          const handleResizeMouseDown = (e: React.MouseEvent, edge: string) => {
            if (isPreviewMode) return;
            e.stopPropagation();
            selectObject(obj.id);

            const widthVal = props.width !== undefined ? props.width : (obj.type === 'overlayImage' ? 200 : (obj.type === 'overlayEmbed' ? 400 : (obj.type === 'overlay2d' ? 500 : 150)));
            const heightVal = props.height !== undefined ? props.height : (obj.type === 'overlayImage' ? 200 : (obj.type === 'overlayEmbed' ? 300 : (obj.type === 'overlay2d' ? 400 : 40)));
            
            setResizingObj({
              id: obj.id,
              edge,
              startX: e.clientX,
              startY: e.clientY,
              startWidth: widthVal,
              startHeight: heightVal,
              startLeft: props.left || 0,
              startTop: props.top || 0
            });
          };

          const renderResizeHandles = () => {
            if (isPreviewMode || !isSelected) return null;
            const edges = ['nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'];
            return edges.map(handle => {
              const handleStyle: React.CSSProperties = {
                position: 'absolute',
                width: '10px',
                height: '10px',
                backgroundColor: 'white',
                border: '1px solid #06b6d4',
                zIndex: 60,
              };
              
              if (handle.includes('n')) handleStyle.top = '-5px';
              if (handle.includes('s')) handleStyle.bottom = '-5px';
              if (handle.includes('e')) handleStyle.right = '-5px';
              if (handle.includes('w')) handleStyle.left = '-5px';

              if (handle === 'n' || handle === 's') {
                handleStyle.left = 'calc(50% - 5px)';
                handleStyle.cursor = 'ns-resize';
              } else if (handle === 'e' || handle === 'w') {
                handleStyle.top = 'calc(50% - 5px)';
                handleStyle.cursor = 'ew-resize';
              } else if (handle === 'nw' || handle === 'se') {
                handleStyle.cursor = 'nwse-resize';
              } else {
                handleStyle.cursor = 'nesw-resize';
              }

              return (
                <div 
                  key={handle}
                  onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                  style={handleStyle}
                  className="rounded-sm"
                />
              );
            });
          };

          const computedStyle = getOverlayStyle(obj, parentProjected);
          const activeStyle: React.CSSProperties = {
            ...computedStyle,
            pointerEvents: 'auto',
            border: !isPreviewMode 
              ? (isSelected ? '2px solid #06b6d4' : '1px dashed rgba(255, 255, 255, 0.25)') 
              : undefined,
            outline: (!isPreviewMode && isSelected) ? '2px solid rgba(6, 182, 212, 0.5)' : undefined,
            boxShadow: (!isPreviewMode && isSelected) ? '0 0 10px rgba(6, 182, 212, 0.5)' : undefined,
          };

          // Filter overlayObjects to find children of this object
          const children = overlayObjects.filter((o: any) => o.parentId === obj.id);

          if (obj.type === 'overlay2d') {
            const bgCol = props.backgroundColor || '#000000';
            const op = props.opacity !== undefined ? props.opacity : 0.5;
            const bgStyle = bgCol.startsWith('#') ? hexToRgba(bgCol, op) : bgCol;

            return (
              <div 
                key={obj.id} 
                id={obj.id}
                style={{ 
                  ...activeStyle,
                  backgroundColor: bgStyle,
                  opacity: 1.0, // Prevent children from inheriting transparency
                  pointerEvents: 'auto',
                  overflow: 'visible',
                  backdropFilter: props.blur ? `blur(${props.blur}px)` : undefined,
                  WebkitBackdropFilter: props.blur ? `blur(${props.blur}px)` : undefined,
                }}
                onMouseDown={handleMouseDown}
              >
                {renderResizeHandles()}
                {children.map((child: any) => renderOverlayObject(child))}
              </div>
            );
          }

          if (obj.type === 'overlayText') {
            return (
              <div 
                key={obj.id} 
                id={obj.id}
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
                {renderResizeHandles()}
                {props.text || 'Text'}
                {children.map((child: any) => renderOverlayObject(child))}
              </div>
            );
          }

          if (obj.type === 'overlayButton') {
            return (
              <button 
                key={obj.id} 
                id={obj.id}
                style={{ 
                  ...activeStyle, 
                  backgroundColor: props.color || '#3b82f6', 
                  color: props.textColor || '#fff', 
                  padding: `${props.paddingY || 8}px ${props.paddingX || 16}px`, 
                  borderRadius: `${props.borderRadius || 8}px`,
                  border: activeStyle.border || 'none',
                  cursor: isPreviewMode ? 'pointer' : 'move',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}
                onMouseDown={handleMouseDown}
                onClick={() => {
                  if (isPreviewMode && props.url) {
                    window.open(props.url, '_blank');
                  }
                }}
              >
                {renderResizeHandles()}
                {props.text || 'Button'}
                {children.map((child: any) => renderOverlayObject(child))}
              </button>
            );
          }

          if (obj.type === 'overlayImage') {
            return (
              <div 
                key={obj.id} 
                id={obj.id}
                style={{ 
                  ...activeStyle, 
                  cursor: !isPreviewMode ? 'move' : 'default',
                }}
                onMouseDown={handleMouseDown}
              >
                {renderResizeHandles()}
                <img 
                  src={props.textureUrl || 'https://via.placeholder.com/200'}
                  alt={obj.name}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
                {children.map((child: any) => renderOverlayObject(child))}
              </div>
            );
          }

          if (obj.type === 'overlayEmbed') {
            const showBorder = props.borderEnabled ?? true;
            const showAddressBar = props.showAddressBar ?? true;
            return (
              <div 
                key={obj.id} 
                id={obj.id}
                style={{ 
                  ...activeStyle, 
                  backgroundColor: 'transparent',
                  overflow: 'visible', // Changed to visible for resize handles
                  border: 'none',
                  cursor: !isPreviewMode ? 'move' : 'default',
                  position: activeStyle.position || 'absolute',
                }}
                onMouseDown={handleMouseDown}
              >
                {renderResizeHandles()}
                <div 
                  className="w-full h-full flex flex-col"
                  style={{
                    backgroundColor: '#111', 
                    borderRadius: `${props.borderRadius || 12}px`,
                    overflow: 'hidden',
                    border: (!isPreviewMode && isSelected) ? activeStyle.border : (showBorder ? `2px solid ${props.borderColor || '#2563eb'}` : (activeStyle.border || 'none')),
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  }}
                >
                  {showAddressBar && (
                  <div className="bg-[#1a1a1a] px-3 py-1.5 flex items-center justify-between border-b border-[#222] select-none text-[10px] text-gray-400 font-mono shrink-0 z-10">
                    <div className="flex items-center gap-1.5 overflow-hidden flex-1 mr-2">
                      <Globe size={12} className="text-cyan-400 shrink-0 animate-pulse" />
                      <span className="truncate text-[10px] font-medium text-gray-300">{props.url || 'No URL'}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isPreviewMode && (
                        <button 
                          onClick={() => window.open(props.url || 'https://wikipedia.org', '_blank')}
                          className="hover:bg-[#333] p-0.5 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
                          title="Open in new tab"
                        >
                          <ExternalLink size={10} />
                        </button>
                      )}
                      <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" title="Connected"></div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateObject(obj.id, { visible: false });
                        }}
                        className="hover:bg-red-600/80 hover:text-white p-0.5 rounded text-gray-400 transition-colors cursor-pointer flex items-center justify-center ml-1"
                        title="Hide / Close Embed"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                )}

                {!showAddressBar && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateObject(obj.id, { visible: false });
                    }}
                    className="absolute top-2.5 right-2.5 z-30 bg-[#111]/90 hover:bg-red-600 hover:border-red-500 border border-[#333] text-gray-300 hover:text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer select-none"
                    title="Hide / Close Embed"
                  >
                    <X size={12} />
                  </button>
                )}
                
                <div className="flex-1 w-full h-full relative bg-white overflow-hidden min-h-0">
                  <iframe 
                    key={props.url || 'default-embed'}
                    src={props.url || 'https://wikipedia.org'} 
                    title={obj.name}
                    className="absolute inset-0 w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    referrerPolicy="no-referrer"
                  />
                  {!isPreviewMode && (
                    <div className="absolute inset-0 bg-transparent pointer-events-auto cursor-move" />
                  )}
                </div>
                </div>
                {children.map((child: any) => renderOverlayObject(child))}
              </div>
            );
          }

          return null;
        };

        const rootOverlayObjects = overlayObjects.filter((obj: any) => {
          if (!obj.parentId) return true;
          const parentObj = useEditorStore.getState().objects[obj.parentId];
          if (!parentObj) return true;
          const parentIs2D = ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(parentObj.type);
          return !parentIs2D;
        });

        return rootOverlayObjects.map((obj: any) => renderOverlayObject(obj));
      })()}

      {activeSnapLines.map((line, i) => (
        <div
          key={i}
          className="absolute bg-cyan-400 pointer-events-none z-50 shadow-[0_0_4px_#22d3ee]"
          style={{
            left: line.type === 'v' ? `${line.coord}px` : 0,
            right: line.type === 'v' ? undefined : 0,
            top: line.type === 'h' ? `${line.coord}px` : 0,
            bottom: line.type === 'h' ? undefined : 0,
            width: line.type === 'v' ? '1.5px' : '100%',
            height: line.type === 'h' ? '1.5px' : '100%',
          }}
        />
      ))}
    </div>
  );
}
