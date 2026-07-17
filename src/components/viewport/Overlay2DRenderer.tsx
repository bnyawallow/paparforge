import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Settings, Grid3X3, Check, Globe, ExternalLink, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { HUDCanvas } from './HUDCanvas';
import { FONT_LIBRARY } from '../inspector/InspectorPanel';

const LucideIcon = ({ name, size = 16, className }: { name: string; size?: number; className?: string }) => {
  if (!name) return null;
  const normalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const IconComponent = (LucideIcons as any)[normalizedName] || (LucideIcons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
};

export function Overlay2DRenderer({ isPreviewMode = false }: { isPreviewMode?: boolean }) {
  const { objects, selectedObjectId, selectedObjectIds, selectObject, updateObject, overlayGridEnabled, setOverlayGridEnabled, overlayGridSize, setOverlayGridSize, settings } = useEditorStore();
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
    aspectRatio: number;
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

  // Dynamic Font Loader for 2D UI and 3D text
  React.useEffect(() => {
    const fontsToLoad = new Set<string>();
    
    if (settings.themeFontFamily && settings.themeFontFamily !== 'sans-serif' && settings.themeFontFamily !== 'serif' && settings.themeFontFamily !== 'monospace') {
      fontsToLoad.add(settings.themeFontFamily);
    }
    
    Object.values(objects).forEach((obj: any) => {
      const family = obj.properties?.fontFamily;
      if (family && family !== 'sans-serif' && family !== 'serif' && family !== 'monospace') {
        fontsToLoad.add(family);
      }
      
      const fontUrl = obj.properties?.fontUrl;
      if (fontUrl) {
        const found = FONT_LIBRARY.find(f => f.url === fontUrl);
        if (found && found.name && found.name !== 'Default (Inter)') {
          fontsToLoad.add(found.name);
        }
      }
    });

    fontsToLoad.forEach(family => {
      const id = `font-link-${family.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, '+')}:wght@100;300;400;500;600;700;900&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [objects]);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingObj) {
        const dragObj = useEditorStore.getState().objects[draggingObj.id];
        const dragParentObj = dragObj?.parentId ? useEditorStore.getState().objects[dragObj.parentId] : null;
        const dragParentIsAutoLayout = dragParentObj && dragParentObj.type === 'hudCanvas' && ['row', 'column'].includes(dragParentObj.properties?.layoutMode || '');
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
          const dragWidth = dragProps.width !== undefined ? dragProps.width : (dragObj.type === 'hudImage' ? 200 : (dragObj.type === 'hudEmbed' ? 400 : 150));
          const dragHeight = dragProps.height !== undefined ? dragProps.height : (dragObj.type === 'hudImage' ? 200 : (dragObj.type === 'hudEmbed' ? 300 : 40));

          // Retrieve parent width/height if parenting is active
          let parentW = 0;
          let parentH = 0;
          if (dragObj?.parentId) {
            const parentObj = useEditorStore.getState().objects[dragObj.parentId];
            if (parentObj && parentObj.type === 'hudCanvas') {
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
            ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(o.type) &&
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
            const oWidth = o.properties?.width ?? (o.type === 'hudImage' ? 200 : (o.type === 'hudEmbed' ? 400 : 150));
            targetsX.push(oLeft, oLeft + oWidth / 2, oLeft + oWidth);

            const oTop = o.properties?.top ?? 20;
            const oHeight = o.properties?.height ?? (o.type === 'hudImage' ? 200 : (o.type === 'hudEmbed' ? 300 : 40));
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

        // Apply aspect ratio lock constraint if holding Shift or enabled in properties
        const targetObj = useEditorStore.getState().objects[resizingObj.id];
        const aspectLocked = e.shiftKey || !!targetObj?.properties?.aspectRatioLocked;
        if (aspectLocked && resizingObj.aspectRatio) {
          if (resizingObj.edge === 'e' || resizingObj.edge === 'w') {
            newHeight = newWidth / resizingObj.aspectRatio;
          } else if (resizingObj.edge === 's' || resizingObj.edge === 'n') {
            newWidth = newHeight * resizingObj.aspectRatio;
          } else {
            // Corner handles: use the larger of the two dimension changes to scale proportionally
            const wChange = Math.abs(newWidth - resizingObj.startWidth);
            const hChange = Math.abs(newHeight - resizingObj.startHeight);
            if (wChange > hChange) {
              newHeight = newWidth / resizingObj.aspectRatio;
              if (resizingObj.edge.includes('n')) {
                newTop = resizingObj.startTop + (resizingObj.startHeight - newHeight);
              }
            } else {
              newWidth = newHeight * resizingObj.aspectRatio;
              if (resizingObj.edge.includes('w')) {
                newLeft = resizingObj.startLeft + (resizingObj.startWidth - newWidth);
              }
            }
          }
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
    ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(obj.type) && obj.visible !== false
  );

  const selectedObj = selectedObjectId ? useEditorStore.getState().objects[selectedObjectId] : null;
  const is2DSelected = selectedObj && ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(selectedObj.type);



  if (overlayObjects.length === 0) return null;

  const projectedPositions = (useEditorStore.getState() as any).projectedPositions || {};

  const getOverlayStyle = (obj: any, parentProjected: { x: number, y: number, visible: boolean } | null): React.CSSProperties => {
    const props = obj.properties || {};
    const alignment = props.alignment || 'center';
    const widthType = props.widthType || 'px';
    const heightType = props.heightType || 'px';
    const widthVal = props.width !== undefined ? props.width : (obj.type === 'hudImage' ? 200 : (obj.type === 'hudEmbed' ? 400 : (obj.type === 'hudCanvas' ? 100 : 150)));
    const heightVal = props.height !== undefined ? props.height : (obj.type === 'hudImage' ? 200 : (obj.type === 'hudEmbed' ? 300 : (obj.type === 'hudCanvas' ? 100 : 40)));
    const widthStr = widthType === '%' ? `${widthVal}%` : `${widthVal}px`;
    const heightStr = heightType === '%' ? `${heightVal}%` : `${heightVal}px`;
    const opacity = props.opacity ?? 1;

    const parentObj = obj.parentId ? useEditorStore.getState().objects[obj.parentId] : null;
    const isAutoLayoutActive = parentObj && parentObj.type === 'hudCanvas' && ['row', 'column'].includes(parentObj.properties?.layoutMode || '');

    if (obj.type === 'hudEmbed' && props.fullScreenWithMargins) {
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

    if (obj.type === 'hudCanvas' && ['row', 'column'].includes(props.layoutMode || '')) {
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
        baseStyle.left = props.left !== undefined ? `${props.left}px` : '0px';
        baseStyle.top = props.top !== undefined ? `${props.top}px` : '0px';
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

    if (props.dropShadowEnabled) {
      const dx = props.dropShadowOffsetX ?? 0;
      const dy = props.dropShadowOffsetY ?? 4;
      const blur = props.dropShadowBlur ?? 8;
      const color = props.dropShadowColor ?? '#000000';
      const opacity = props.dropShadowOpacity ?? 0.3;
      
      let shadowColor = color;
      if (color.startsWith('#') && color.length === 7) {
        const r = parseInt(color.substring(1, 3), 16);
        const g = parseInt(color.substring(3, 5), 16);
        const b = parseInt(color.substring(5, 7), 16);
        shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      baseStyle.filter = `drop-shadow(${dx}px ${dy}px ${blur}px ${shadowColor})`;
    }

    // Custom HUD Style, Shape & Border Customizations
    if (props.hudShape === 'circle') {
      baseStyle.borderRadius = '50%';
    } else if (props.borderRadius !== undefined) {
      baseStyle.borderRadius = `${props.borderRadius}px`;
    }

    const borderSize = props.borderSize !== undefined ? props.borderSize : 0;
    if (borderSize > 0) {
      baseStyle.border = `${borderSize}px solid ${props.borderColor || '#ffffff'}`;
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

      {(() => {
        // Helper to convert hex to rgba for background transparency so children aren't made transparent
        const hexToRgba = (hex: string, alpha: number) => {
          if (!hex || !hex.startsWith('#')) return hex;
          const r = parseInt(hex.slice(1, 3), 16) || 0;
          const g = parseInt(hex.slice(3, 5), 16) || 0;
          const b = parseInt(hex.slice(5, 7), 16) || 0;
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const renderIconAndText = (text: string, props: any) => {
          const iconName = props.icon;
          const iconPos = props.iconPosition || 'left';
          const iconSize = props.iconSize ?? 16;
          
          if (!iconName) return text || '';
          
          let iconEl;
          if (iconName.startsWith('http') || iconName.startsWith('data:')) {
            iconEl = <img src={iconName} style={{ width: iconSize, height: iconSize, objectFit: 'contain' }} className="shrink-0 pointer-events-none" alt="" />;
          } else {
            iconEl = <LucideIcon name={iconName} size={iconSize} className="shrink-0" />;
          }
          
          const flexDirClass = 
            iconPos === 'top' ? 'flex-col items-center gap-1.5' :
            iconPos === 'bottom' ? 'flex-col-reverse items-center gap-1.5' :
            iconPos === 'right' ? 'flex-row-reverse items-center gap-2' :
            'flex-row items-center gap-2'; // left
            
          return (
            <div className={`flex ${flexDirClass} justify-center items-center h-full w-full`}>
              {iconEl}
              {text && <span className="truncate">{text}</span>}
            </div>
          );
        };

        const renderOverlayObject = (obj: any) => {
          const props = obj.properties || {};
          const alignment = props.alignment || 'center';
          const isSelected = selectedObjectIds.includes(obj.id);
          const parentProjected = obj.parentId ? (projectedPositions[obj.parentId] || null) : null;

          const getAnimClass = () => {
            if (!isPreviewMode) return '';
            const anim = props.hudAnimation;
            if (!anim || anim === 'none') return '';
            switch (anim) {
              case 'fade-in': return 'animate-in fade-in duration-500';
              case 'slide-up': return 'animate-in fade-in slide-in-from-bottom-8 duration-500';
              case 'slide-down': return 'animate-in fade-in slide-in-from-top-8 duration-500';
              case 'slide-left': return 'animate-in fade-in slide-in-from-right-8 duration-500';
              case 'slide-right': return 'animate-in fade-in slide-in-from-left-8 duration-500';
              case 'zoom-in': return 'animate-in fade-in zoom-in-50 duration-500';
              case 'bounce': return 'animate-bounce';
              default: return '';
            }
          };
          const animClass = getAnimClass();

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
              isAligned: true,
              startOffsetX: props.offsetX || 0,
              startOffsetY: props.offsetY || 0,
            });
          };

          const handleResizeMouseDown = (e: React.MouseEvent, edge: string) => {
            if (isPreviewMode) return;
            e.stopPropagation();
            selectObject(obj.id);

            const widthVal = props.width !== undefined ? props.width : (obj.type === 'hudImage' ? 200 : (obj.type === 'hudEmbed' ? 400 : (obj.type === 'hudCanvas' ? 100 : 150)));
            const heightVal = props.height !== undefined ? props.height : (obj.type === 'hudImage' ? 200 : (obj.type === 'hudEmbed' ? 300 : (obj.type === 'hudCanvas' ? 100 : 40)));
            
            setResizingObj({
              id: obj.id,
              edge,
              startX: e.clientX,
              startY: e.clientY,
              startWidth: widthVal,
              startHeight: heightVal,
              startLeft: props.left || 0,
              startTop: props.top || 0,
              aspectRatio: heightVal > 0 ? widthVal / heightVal : 1
            });
          };

          const renderResizeHandles = () => {
            if (isPreviewMode || !isSelected || obj.type === 'hudCanvas') return null;
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

          const isInteractive = ['hudButton', 'hudEmbed'].includes(obj.type);
          const computedStyle = getOverlayStyle(obj, parentProjected);
          const activeStyle: React.CSSProperties = {
            ...computedStyle,
            pointerEvents: !isPreviewMode ? 'auto' : (isInteractive ? 'auto' : 'none'),
            border: !isPreviewMode 
              ? (isSelected ? '2px solid #06b6d4' : (computedStyle.border || '1px dashed rgba(255, 255, 255, 0.25)')) 
              : computedStyle.border,
            outline: (!isPreviewMode && isSelected) ? '2px solid rgba(6, 182, 212, 0.5)' : undefined,
            boxShadow: (!isPreviewMode && isSelected) ? '0 0 10px rgba(6, 182, 212, 0.5)' : undefined,
          };

          // Filter overlayObjects to find children of this object
          const children = overlayObjects.filter((o: any) => o.parentId === obj.id);

          if (obj.type === 'hudCanvas') {
            return (
              <HUDCanvas key={obj.id} obj={obj} isPreviewMode={isPreviewMode}>
                {renderResizeHandles()}
                {children.map((child: any) => renderOverlayObject(child))}
              </HUDCanvas>
            );
          }

          if (obj.type === 'hudText') {
            return (
              <div 
                key={obj.id} 
                id={obj.id}
                className={animClass}
                style={{ 
                  ...activeStyle, 
                  color: props.color || settings.themeTextColor || '#fff', 
                  fontSize: `${props.fontSize || 24}px`,
                  fontFamily: props.fontFamily || settings.themeFontFamily || 'sans-serif',
                  fontWeight: props.fontWeight || 'normal',
                  letterSpacing: props.letterSpacing !== undefined ? `${props.letterSpacing}px` : 'normal',
                  textAlign: props.textAlign || 'left',
                  whiteSpace: props.whiteSpace || 'pre-wrap',
                  lineHeight: props.lineHeight !== undefined ? `${props.lineHeight}` : 'normal',
                  textTransform: props.textTransform || 'none',
                  textDecoration: props.textDecoration || 'none',
                  fontStyle: props.fontStyle || 'normal',
                  cursor: !isPreviewMode ? 'move' : 'default',
                  alignItems: props.textAlign === 'center' ? 'center' : (props.textAlign === 'right' ? 'flex-end' : (props.textAlign === 'justify' ? 'stretch' : 'flex-start')),
                  justifyContent: 'center',
                }}
                onMouseDown={handleMouseDown}
              >
                {renderResizeHandles()}
                {renderIconAndText(props.text || 'Text', props)}
                {children.map((child: any) => renderOverlayObject(child))}
              </div>
            );
          }

          if (obj.type === 'hudButton') {
            const currentShape = props.shape || props.hudShape || 'rectangle';
            const currentBorderWidth = props.borderWidth !== undefined ? props.borderWidth : (props.borderSize !== undefined ? props.borderSize : 0);
            return (
              <button 
                key={obj.id} 
                id={obj.id}
                className={animClass}
                style={{ 
                  ...activeStyle, 
                  backgroundColor: props.color || settings.themePrimaryColor || '#3b82f6', 
                  color: props.textColor || settings.themeTextColor || '#fff', 
                  padding: currentShape === 'circle' ? '0px' : `${props.paddingY || 8}px ${props.paddingX || 16}px`, 
                  borderRadius: currentShape === 'circle' 
                    ? '9999px' 
                    : currentShape === 'pill' 
                      ? '9999px' 
                      : (props.borderRadius !== undefined ? `${props.borderRadius}px` : (settings.themeBorderRadius !== undefined ? `${settings.themeBorderRadius}px` : '8px')),
                  border: activeStyle.border || (currentBorderWidth > 0 
                    ? `${currentBorderWidth}px solid ${props.borderColor || '#ffffff'}` 
                    : (settings.themeBorderColor ? `1px solid ${settings.themeBorderColor}` : 'none')),
                  aspectRatio: currentShape === 'circle' ? '1 / 1' : undefined,
                  cursor: isPreviewMode ? 'pointer' : 'move',
                  display: 'flex',
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
                {renderIconAndText(props.text || 'Button', props)}
                {children.map((child: any) => renderOverlayObject(child))}
              </button>
            );
          }

          if (obj.type === 'hudImage') {
            const currentShape = props.shape || props.hudShape || 'rectangle';
            const currentBorderWidth = props.borderWidth !== undefined ? props.borderWidth : (props.borderSize !== undefined ? props.borderSize : 0);
            return (
              <div 
                key={obj.id} 
                id={obj.id}
                className={animClass}
                style={{ 
                  ...activeStyle, 
                  overflow: 'hidden',
                  borderRadius: currentShape === 'circle' 
                    ? '9999px' 
                    : currentShape === 'pill' 
                      ? '9999px' 
                      : (props.borderRadius !== undefined ? `${props.borderRadius}px` : (settings.themeBorderRadius !== undefined ? `${settings.themeBorderRadius}px` : '8px')),
                  border: activeStyle.border || (currentBorderWidth > 0 
                    ? `${currentBorderWidth}px solid ${props.borderColor || '#ffffff'}` 
                    : 'none'),
                  aspectRatio: currentShape === 'circle' ? '1 / 1' : undefined,
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

          if (obj.type === 'hudEmbed') {
            const showBorder = props.borderEnabled ?? true;
            const showAddressBar = props.showAddressBar ?? true;
            return (
              <div 
                key={obj.id} 
                id={obj.id}
                className={animClass}
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
          const parentIs2D = ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(parentObj.type);
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

      {(() => {
        const activeId = draggingObj?.id || resizingObj?.id;
        if (!activeId) return null;
        const activeElement = document.getElementById(activeId);
        if (!activeElement) return null;
        
        const parentElement = activeElement.parentElement;
        if (!parentElement) return null;

        const activeRect = activeElement.getBoundingClientRect();
        const parentRect = parentElement.getBoundingClientRect();

        // Calculate relative coordinates in pixels
        const left = Math.round(activeRect.left - parentRect.left);
        const top = Math.round(activeRect.top - parentRect.top);
        const right = Math.round(parentRect.right - activeRect.right);
        const bottom = Math.round(parentRect.bottom - activeRect.bottom);
        const width = Math.round(activeRect.width);
        const height = Math.round(activeRect.height);

        return (
          <div className="absolute inset-0 pointer-events-none z-[9999]">
            {/* Center alignment guidelines */}
            {Math.abs((left + width / 2) - parentRect.width / 2) < 6 && (
              <div 
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-emerald-400 z-40 shadow-[0_0_8px_#34d399]" 
                style={{ left: `${left + width / 2}px` }}
              />
            )}
            {Math.abs((top + height / 2) - parentRect.height / 2) < 6 && (
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-400 z-40 shadow-[0_0_8px_#34d399]" 
                style={{ top: `${top + height / 2}px` }}
              />
            )}

            {/* Tracking Crosshair Lines */}
            <div 
              className="absolute border-l border-dashed border-cyan-400/40 z-10" 
              style={{ left: `${left + width / 2}px`, top: 0, bottom: 0 }} 
            />
            <div 
              className="absolute border-t border-dashed border-cyan-400/40 z-10" 
              style={{ top: `${top + height / 2}px`, left: 0, right: 0 }} 
            />

            {/* Snap-to-grid dot markers (grid divisions) */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              {Array.from({ length: 9 }).map((_, idx) => {
                const row = Math.floor(idx / 3) + 1;
                const col = (idx % 3) + 1;
                const markerX = col * 25; // 25%, 50%, 75%
                const markerY = row * 25; // 25%, 50%, 75%
                const isNearIntersection = 
                  Math.abs((left + width / 2) - (parentRect.width * markerX / 100)) < 15 &&
                  Math.abs((top + height / 2) - (parentRect.height * markerY / 100)) < 15;

                return (
                  <div 
                    key={idx} 
                    className={`absolute w-2 h-2 rounded-full border transition-all duration-150 ${
                      isNearIntersection 
                        ? 'border-cyan-400 bg-cyan-400 shadow-[0_0_6px_#22d3ee] scale-125' 
                        : 'border-cyan-500/30 bg-cyan-950/20'
                    }`}
                    style={{
                      left: `${markerX}%`,
                      top: `${markerY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                );
              })}
            </div>

            {/* Outline around active HUD object */}
            <div 
              className="absolute border border-dashed border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`
              }}
            >
              {/* Dimensions Tooltip */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow border border-pink-400/30 whitespace-nowrap z-50">
                {width} × {height} px
              </div>
            </div>

            {/* Left Edge Tracker */}
            <div 
              className="absolute border-t border-dashed border-pink-500/60"
              style={{
                left: 0,
                top: `${top + height / 2}px`,
                width: `${left}px`,
                height: 0
              }}
            >
              {left > 15 && (
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1c1917]/95 border border-pink-500/40 text-pink-400 text-[8px] font-mono px-1 rounded-sm shadow">
                  {left}px
                </div>
              )}
            </div>

            {/* Right Edge Tracker */}
            <div 
              className="absolute border-t border-dashed border-pink-500/60"
              style={{
                left: `${left + width}px`,
                top: `${top + height / 2}px`,
                width: `${right}px`,
                height: 0
              }}
            >
              {right > 15 && (
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1c1917]/95 border border-pink-500/40 text-pink-400 text-[8px] font-mono px-1 rounded-sm shadow">
                  {right}px
                </div>
              )}
            </div>

            {/* Top Edge Tracker */}
            <div 
              className="absolute border-l border-dashed border-pink-500/60"
              style={{
                left: `${left + width / 2}px`,
                top: 0,
                width: 0,
                height: `${top}px`
              }}
            >
              {top > 15 && (
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1c1917]/95 border border-pink-500/40 text-pink-400 text-[8px] font-mono px-1 rounded-sm shadow">
                  {top}px
                </div>
              )}
            </div>

            {/* Bottom Edge Tracker */}
            <div 
              className="absolute border-l border-dashed border-pink-500/60"
              style={{
                left: `${left + width / 2}px`,
                top: `${top + height}px`,
                width: 0,
                height: `${bottom}px`
              }}
            >
              {bottom > 15 && (
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1c1917]/95 border border-pink-500/40 text-pink-400 text-[8px] font-mono px-1 rounded-sm shadow">
                  {bottom}px
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
