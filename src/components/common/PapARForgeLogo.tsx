import React from 'react';

interface PapARForgeLogoProps {
  variant?: 'full' | 'icon' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const PapARForgeLogo: React.FC<PapARForgeLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  const sizeMap = {
    xs: { icon: 20, font: 'text-xs', gap: 'gap-1.5' },
    sm: { icon: 26, font: 'text-sm', gap: 'gap-2' },
    md: { icon: 32, font: 'text-base', gap: 'gap-2.5' },
    lg: { icon: 40, font: 'text-xl', gap: 'gap-3' },
    xl: { icon: 52, font: 'text-2xl', gap: 'gap-3.5' },
  };

  const { icon: iconDim, font: fontSize, gap: gapSize } = sizeMap[size] || sizeMap.md;

  const IconSVG = (
    <div 
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{ width: iconDim, height: iconDim }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Paper Sheet Gradient */}
          <linearGradient id="papar-paper-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Paper Fold Corner Gradient */}
          <linearGradient id="papar-fold-grad" x1="30" y1="4" x2="44" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* 3D Forge Prism Gradient - Top Face */}
          <linearGradient id="papar-prism-top" x1="16" y1="12" x2="32" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* 3D Forge Prism Gradient - Left Face */}
          <linearGradient id="papar-prism-left" x1="16" y1="20" x2="24" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* 3D Forge Prism Gradient - Right Face */}
          <linearGradient id="papar-prism-right" x1="24" y1="20" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>

          {/* Glowing Forge Spark */}
          <radialGradient id="papar-spark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Base Paper Print Sheet with Folded Top-Right Corner */}
        <path
          d="M 8 6 
             L 32 6 
             L 42 16 
             L 42 42 
             L 8 42 
             Z"
          fill="url(#papar-paper-grad)"
          stroke="#38bdf8"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />

        {/* Print Target Corner Reticles */}
        <path d="M 12 10 L 16 10 M 12 10 L 12 14" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <path d="M 38 38 L 34 38 M 38 38 L 38 34" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <path d="M 12 38 L 16 38 M 12 38 L 12 34" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

        {/* Grid lines on paper surface */}
        <line x1="8" y1="24" x2="42" y2="24" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="25" y1="6" x2="25" y2="42" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />

        {/* Paper Fold Flap */}
        <path
          d="M 32 6 L 32 16 L 42 16 Z"
          fill="url(#papar-fold-grad)"
          stroke="#38bdf8"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />

        {/* 2. Rising Isometric 3D AR Spatial Forge Cube/Prism */}
        {/* Top Face */}
        <path
          d="M 24 13 L 33 18 L 24 23 L 15 18 Z"
          fill="url(#papar-prism-top)"
          stroke="#7dd3fc"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />

        {/* Left Face */}
        <path
          d="M 15 18 L 24 23 L 24 33 L 15 28 Z"
          fill="url(#papar-prism-left)"
          stroke="#38bdf8"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />

        {/* Right Face */}
        <path
          d="M 24 23 L 33 18 L 33 28 L 24 33 Z"
          fill="url(#papar-prism-right)"
          stroke="#818cf8"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />

        {/* Spatial Z-Up Laser Axis Beam */}
        <line x1="24" y1="13" x2="24" y2="6" stroke="#38bdf8" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="1.5 1.5" />
        
        {/* Forge Energy Spark Beacon at Top Vertex */}
        <circle cx="24" cy="6" r="2.5" fill="#38bdf8" />
        <circle cx="24" cy="6" r="1.2" fill="#ffffff" />

        {/* Forge Amber Spark */}
        <circle cx="24" cy="23" r="1.75" fill="#f59e0b" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return IconSVG;
  }

  return (
    <div className={`inline-flex items-center ${gapSize} select-none ${className}`}>
      {IconSVG}

      <div className="flex flex-col justify-center leading-none">
        <div className={`flex items-baseline font-bold tracking-tight ${fontSize}`}>
          <span className="text-gray-100 font-semibold">pap</span>
          <span className="text-cyan-400 font-black tracking-wider">AR</span>
          <span className="text-white font-extrabold ml-1 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            Forge
          </span>
        </div>
        {showBadge && (
          <span className="text-[9px] font-mono font-bold text-cyan-400/90 uppercase tracking-widest mt-0.5">
            Spatial Print Studio
          </span>
        )}
      </div>
    </div>
  );
};
