import React from 'react';
import { Html } from '@react-three/drei';
import * as LucideIcons from 'lucide-react';
import { SceneObject } from '../../types';

export function Spline2DIconRenderer({ obj, isPreviewMode }: { obj: SceneObject; isPreviewMode: boolean }) {
  const iconName = (obj.properties?.iconName || 'Sparkles') as keyof typeof LucideIcons;
  const color = obj.properties?.color || '#3b82f6';
  const badgeStyle = obj.properties?.badgeStyle || 'glass';
  const IconComponent = (LucideIcons[iconName] as React.ComponentType<{ size?: number; className?: string }>) || LucideIcons.Sparkles;

  // Custom styling based on badgeStyle
  const getBadgeStyle = () => {
    switch (badgeStyle) {
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 12px ${color}40`,
          color: color,
        };
      case 'clay':
        return {
          background: color,
          borderRadius: '1.25rem',
          boxShadow: 'inset -4px -4px 10px rgba(0, 0, 0, 0.35), inset 4px 4px 10px rgba(255, 255, 255, 0.4), 0 10px 20px rgba(0, 0, 0, 0.3)',
          color: '#ffffff',
        };
      case 'neon':
        return {
          background: 'rgba(10, 10, 15, 0.85)',
          border: `2px solid ${color}`,
          boxShadow: `0 0 20px ${color}, inset 0 0 10px ${color}60`,
          color: color,
        };
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${color} 0%, #ec4899 100%)`,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          color: '#ffffff',
        };
      case 'flat':
      default:
        return {
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          color: color,
        };
    }
  };

  return (
    <group>
      {/* 3D Plane Mesh Anchor for raycasting & selection */}
      <mesh visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 2D Vector Badge HTML in 3D Space */}
      <Html
        transform
        center
        distanceFactor={4}
        zIndexRange={[10, 0]}
        pointerEvents={isPreviewMode ? 'auto' : 'none'}
      >
        <div
          className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-3 transition-all duration-300 select-none group cursor-pointer hover:scale-110 active:scale-95"
          style={getBadgeStyle()}
        >
          <div className="filter drop-shadow-md transition-transform group-hover:rotate-6">
            <IconComponent size={42} />
          </div>
          {obj.properties?.text && (
            <span className="text-[10px] font-bold mt-1 line-clamp-1 tracking-wide opacity-90">
              {obj.properties.text}
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}
