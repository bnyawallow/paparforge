import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';

interface HUDCanvasProps {
  obj: any;
  children: React.ReactNode;
  isPreviewMode?: boolean;
}

export function HUDCanvas({ obj, children, isPreviewMode = false }: HUDCanvasProps) {
  const { selectedObjectId, selectObject, hudDebugGridEnabled, settings } = useEditorStore();
  const isSelected = selectedObjectId === obj.id;
  
  const props = obj.properties || {};
  const layoutMode = props.layoutMode === 'row' ? 'row' : 'column'; // Enforce flexbox (default to column)
  
  // Use global theme variables as fallbacks
  const padding = props.layoutPadding !== undefined ? props.layoutPadding : (settings.themePadding !== undefined ? settings.themePadding : 16);
  const gap = props.layoutGap !== undefined ? props.layoutGap : (settings.themeGap !== undefined ? settings.themeGap : 8);
  const bgCol = props.backgroundColor || settings.themeBackgroundColor || '#000000';
  const op = props.opacity !== undefined ? props.opacity : (settings.themeBackgroundColor ? 0.8 : 0.0);
  
  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  const bgStyle = bgCol.startsWith('#') ? hexToRgba(bgCol, op) : bgCol;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    selectObject(obj.id);
  };

  const hudAnimation = props.hudAnimation;
  const getAnimClass = () => {
    if (!isPreviewMode) return '';
    if (!hudAnimation || hudAnimation === 'none') return '';
    switch (hudAnimation) {
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

  const style: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: layoutMode,
    backgroundColor: bgStyle,
    opacity: 1.0, // Prevent children from inheriting transparency
    padding: `${padding}px`,
    gap: `${gap}px`,
    alignItems: props.layoutAlignItems || 'center',
    justifyContent: props.layoutJustifyContent || 'center',
    flexWrap: props.layoutWrap || 'nowrap',
    borderRadius: props.borderRadius !== undefined ? `${props.borderRadius}px` : (settings.themeBorderRadius !== undefined ? `${settings.themeBorderRadius}px` : undefined),
    overflow: 'visible',
    pointerEvents: !isPreviewMode ? 'auto' : 'none',
    zIndex: props.zIndex ?? 1,
    backdropFilter: props.blur ? `blur(${props.blur}px)` : undefined,
    WebkitBackdropFilter: props.blur ? `blur(${props.blur}px)` : undefined,
    border: !isPreviewMode 
      ? (isSelected ? '2px solid #06b6d4' : '1px dashed rgba(255, 255, 255, 0.25)') 
      : (props.borderEnabled || settings.themeBorderColor ? `1px solid ${props.borderColor || settings.themeBorderColor || 'rgba(255,255,255,0.1)'}` : undefined),
    outline: (!isPreviewMode && isSelected) ? '2px solid rgba(6, 182, 212, 0.5)' : undefined,
    boxShadow: (!isPreviewMode && isSelected) ? '0 0 10px rgba(6, 182, 212, 0.5)' : undefined,
  };

  return (
    <div
      id={obj.id}
      className={getAnimClass()}
      style={style}
      onMouseDown={handleMouseDown}
    >
      {children}

      {!isPreviewMode && hudDebugGridEnabled && (
        <div 
          className="absolute inset-0 pointer-events-none z-[9999] overflow-hidden"
          style={{
            border: '2px dashed #ec4899', // Pink dashed boundary
            padding: `${padding}px`
          }}
        >
          {/* Real-time padding visualization block */}
          <div className="absolute inset-0 border-4 border-emerald-500/15 pointer-events-none" />

          {/* Real-time distribution lanes inside the padding boundary */}
          <div 
            className="w-full h-full opacity-40 flex pointer-events-none"
            style={{
              flexDirection: layoutMode,
              gap: `${gap}px`
            }}
          >
            {React.Children.map(children, (_, index) => (
              <div 
                key={index}
                className="flex-1 border border-dashed border-cyan-500/40 bg-cyan-500/5 relative min-w-[20px] min-h-[20px] flex items-center justify-center transition-all duration-150"
              >
                <span className="absolute top-1 left-1 bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-mono text-[8px] px-1 rounded select-none">
                  #{index + 1}
                </span>
                
                {/* Visualizing Gap size */}
                {index > 0 && (
                  <div 
                    className="absolute bg-orange-500/20 border-l border-r border-orange-500/30 font-mono text-[8px] text-orange-400 flex items-center justify-center overflow-hidden select-none"
                    style={layoutMode === 'column' ? {
                      top: `-${gap}px`,
                      left: 0,
                      width: '100%',
                      height: `${gap}px`
                    } : {
                      left: `-${gap}px`,
                      top: 0,
                      width: `${gap}px`,
                      height: '100%'
                    }}
                  >
                    {gap}px
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Corner flex layout status badge */}
          <div className="absolute bottom-2 right-2 bg-black/90 border border-pink-500/40 text-pink-400 font-mono text-[9px] px-2 py-1 rounded shadow-lg flex items-center gap-1.5 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            <span>FLEX GRID: {layoutMode.toUpperCase()} | Align: {props.layoutAlignItems || 'center'} | Justify: {props.layoutJustifyContent || 'center'} | Gap: {gap}px | Padding: {padding}px</span>
          </div>
        </div>
      )}
    </div>
  );
}
