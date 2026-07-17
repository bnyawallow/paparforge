import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';

interface HUDCanvasProps {
  obj: any;
  children: React.ReactNode;
  isPreviewMode?: boolean;
}

export function HUDCanvas({ obj, children, isPreviewMode = false }: HUDCanvasProps) {
  const { selectedObjectId, selectObject } = useEditorStore();
  const isSelected = selectedObjectId === obj.id;
  
  const props = obj.properties || {};
  const layoutMode = props.layoutMode === 'row' ? 'row' : 'column'; // Enforce flexbox (default to column)
  const bgCol = props.backgroundColor || '#000000';
  const op = props.opacity !== undefined ? props.opacity : 0.0;
  
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
    padding: `${props.layoutPadding ?? 16}px`,
    gap: `${props.layoutGap ?? 8}px`,
    alignItems: props.layoutAlignItems || 'center',
    justifyContent: props.layoutJustifyContent || 'flex-start',
    flexWrap: props.layoutWrap || 'nowrap',
    overflow: 'visible',
    pointerEvents: !isPreviewMode ? 'auto' : 'none',
    zIndex: props.zIndex ?? 1,
    backdropFilter: props.blur ? `blur(${props.blur}px)` : undefined,
    WebkitBackdropFilter: props.blur ? `blur(${props.blur}px)` : undefined,
    border: !isPreviewMode 
      ? (isSelected ? '2px solid #06b6d4' : '1px dashed rgba(255, 255, 255, 0.25)') 
      : undefined,
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
    </div>
  );
}
