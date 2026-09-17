import React from 'react';
import { PrimitiveTemplate } from '../../lib/primitiveTemplates';

interface PrimitiveThumbnailProps {
  prim: PrimitiveTemplate;
  className?: string;
  size?: number;
}

export const PrimitiveThumbnail: React.FC<PrimitiveThumbnailProps> = ({ prim, className = 'w-full h-full', size = 80 }) => {
  const type = prim.type;
  const id = prim.id || '';
  const color = prim.properties?.color || prim.previewColor || '#3b82f6';
  const emissive = prim.properties?.emissiveColor;
  const isWireframe = prim.properties?.wireframe;
  const isGold = id.includes('gold') || color.toLowerCase() === '#eab308';
  const isCarbon = id.includes('carbon') || color.toLowerCase() === '#27272a';
  const isHolo = id.includes('holo') || id.includes('portal') || (prim.properties?.transmission && prim.properties.transmission > 0);
  const isMagma = id.includes('magma');
  const isMarble = id.includes('marble');
  const isCircuit = id.includes('circuit');
  const isGrid = id.includes('grid');
  const isEnergy = id.includes('energy');

  // SVG Unique Defs ID prefix to avoid collisions across cards
  const defsId = `prim-thumb-${id || type}-${Math.random().toString(36).substring(2, 7)}`;

  // Shading colors derived from primary color
  const baseColor = color;
  const highlightColor = isGold ? '#fef08a' : isHolo ? '#a5f3fc' : isMagma ? '#fde047' : '#ffffff';
  const shadowColor = isGold ? '#854d0e' : isMagma ? '#450a0a' : isCarbon ? '#09090b' : '#0f172a';

  return (
    <div className={`flex items-center justify-center p-2 relative overflow-hidden select-none ${className}`}>
      {/* Ambient background glow for glowing/sci-fi objects */}
      {emissive && (
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-40 pointer-events-none transform scale-75"
          style={{ background: emissive }}
        />
      )}

      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="transform transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id={`${defsId}-top`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={highlightColor} stopOpacity={isGold ? "0.9" : "0.55"} />
            <stop offset="100%" stopColor={baseColor} stopOpacity="1" />
          </linearGradient>

          <linearGradient id={`${defsId}-left`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={baseColor} stopOpacity="1" />
            <stop offset="100%" stopColor={shadowColor} stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id={`${defsId}-right`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={baseColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={shadowColor} stopOpacity="1" />
          </linearGradient>

          <radialGradient id={`${defsId}-sphere`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor={highlightColor} stopOpacity={isGold ? "1" : "0.9"} />
            <stop offset="25%" stopColor={baseColor} />
            <stop offset="75%" stopColor={shadowColor} />
            <stop offset="100%" stopColor="#050508" />
          </radialGradient>

          <radialGradient id={`${defsId}-disc`} cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor={highlightColor} stopOpacity="0.7" />
            <stop offset="50%" stopColor={baseColor} />
            <stop offset="100%" stopColor={shadowColor} />
          </radialGradient>

          <linearGradient id={`${defsId}-cylinder`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={shadowColor} stopOpacity="0.9" />
            <stop offset="25%" stopColor={baseColor} />
            <stop offset="60%" stopColor={highlightColor} stopOpacity={isEnergy ? "0.95" : "0.75"} />
            <stop offset="85%" stopColor={baseColor} />
            <stop offset="100%" stopColor={shadowColor} />
          </linearGradient>

          {/* Carbon Fiber pattern */}
          {isCarbon && (
            <pattern id={`${defsId}-carbon-pattern`} width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="#18181b" />
              <path d="M0 0L3 3M3 0L0 3M3 3L6 6M6 3L3 6" stroke="#3f3f46" strokeWidth="0.8" />
            </pattern>
          )}

          {/* Circuit pattern */}
          {isCircuit && (
            <pattern id={`${defsId}-circuit-pattern`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M2 2h6v2h-4v4h4" stroke="#10b981" strokeWidth="0.75" fill="none" opacity="0.8" />
              <circle cx="8" cy="8" r="1" fill="#34d399" />
            </pattern>
          )}

          {/* Ground drop shadow filter */}
          <radialGradient id={`${defsId}-drop-shadow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base Drop Shadow for 3D depth */}
        {type !== 'empty' && (
          <ellipse cx="50" cy="88" rx="34" ry="7" fill={`url(#${defsId}-drop-shadow)`} />
        )}

        {/* 1. CUBE / BOX */}
        {type === 'box' && (
          <g>
            {/* Top Face */}
            <polygon
              points="50,18 82,34 50,50 18,34"
              fill={`url(#${defsId}-top)`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
            {/* Left Face */}
            <polygon
              points="18,34 50,50 50,82 18,66"
              fill={`url(#${defsId}-left)`}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.75"
              strokeLinejoin="round"
            />
            {/* Right Face */}
            <polygon
              points="50,50 82,34 82,66 50,82"
              fill={`url(#${defsId}-right)`}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="0.75"
              strokeLinejoin="round"
            />

            {/* Circuit pattern overlay */}
            {isCircuit && (
              <polygon points="18,34 50,50 50,82 18,66" fill={`url(#${defsId}-circuit-pattern)`} />
            )}
            {/* Carbon pattern overlay */}
            {isCarbon && (
              <polygon points="50,50 82,34 82,66 50,82" fill={`url(#${defsId}-carbon-pattern)`} />
            )}

            {/* Corner specular glint */}
            <circle cx="50" cy="50" r="1.5" fill="#ffffff" opacity="0.7" />
          </g>
        )}

        {/* 2. UV SPHERE */}
        {type === 'sphere' && (
          <g>
            <circle
              cx="50"
              cy="50"
              r="34"
              fill={`url(#${defsId}-sphere)`}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.75"
            />
            {/* Subtle Latitude/Longitude Grid Lines (Blender / 3D Editor look) */}
            <ellipse cx="50" cy="50" rx="34" ry="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeDasharray={isHolo ? "2 2" : "none"} />
            <ellipse cx="50" cy="50" rx="14" ry="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <line x1="16" y1="50" x2="84" y2="50" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
            
            {/* Specular Core Reflection */}
            <ellipse cx="38" cy="34" rx="8" ry="5" fill="#ffffff" opacity={isGold ? "0.6" : "0.45"} transform="rotate(-25 38 34)" />
            <circle cx="36" cy="32" r="2.5" fill="#ffffff" opacity="0.8" />

            {/* Magma fissures effect */}
            {isMagma && (
              <path d="M30 45 Q 45 52 55 42 T 70 60" stroke="#fef08a" strokeWidth="1.5" fill="none" opacity="0.8" filter="drop-shadow(0 0 4px #ef4444)" />
            )}
          </g>
        )}

        {/* 3. CYLINDER */}
        {type === 'cylinder' && (
          <g>
            {/* Body */}
            <path
              d="M26 34 L26 70 C26 78 74 78 74 70 L74 34 Z"
              fill={`url(#${defsId}-cylinder)`}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="0.75"
            />
            {/* Bottom Curve highlight */}
            <path d="M26 70 C26 78 74 78 74 70" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
            
            {/* Energy Core Coil */}
            {isEnergy && (
              <g opacity="0.85">
                <path d="M26 44 C35 48 65 48 74 44" stroke="#00f0ff" strokeWidth="2" fill="none" />
                <path d="M26 56 C35 60 65 60 74 56" stroke="#00f0ff" strokeWidth="2" fill="none" />
              </g>
            )}

            {/* Top Cap Ellipse */}
            <ellipse
              cx="50"
              cy="34"
              rx="24"
              ry="10"
              fill={`url(#${defsId}-top)`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.75"
            />
            <ellipse cx="50" cy="34" rx="20" ry="7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          </g>
        )}

        {/* 4. CONE */}
        {type === 'cone' && (
          <g>
            {/* Body */}
            <path
              d="M50 18 L76 72 C76 80 24 80 24 72 Z"
              fill={`url(#${defsId}-cylinder)`}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="0.75"
            />
            {/* Base Ellipse Rim */}
            <ellipse
              cx="50"
              cy="72"
              rx="26"
              ry="9"
              fill={`url(#${defsId}-right)`}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.75"
            />
            {/* Apex Glint */}
            <circle cx="50" cy="18" r="1.5" fill="#ffffff" opacity="0.8" />
            <line x1="50" y1="18" x2="38" y2="76" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
          </g>
        )}

        {/* 5. TORUS / RING */}
        {(type === 'torus' || type === 'ring') && (
          <g>
            {/* Torus Donut Shape */}
            <ellipse cx="50" cy="52" rx="36" ry="22" fill={`url(#${defsId}-cylinder)`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
            {/* Center Hole */}
            <ellipse cx="50" cy="52" rx="16" ry="9" fill="#0c0d14" stroke="rgba(0,0,0,0.5)" strokeWidth="0.75" />
            {/* Front toroidal highlight curve */}
            <path d="M18 56 C24 72 76 72 82 56" fill="none" stroke={highlightColor} strokeWidth="1.2" opacity="0.6" />
            {/* Inner rim highlight */}
            <path d="M35 52 C35 57 65 57 65 52" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
          </g>
        )}

        {/* 6. TORUS KNOT */}
        {type === 'knot' && (
          <g>
            <path
              d="M50 20 C68 20 80 35 78 50 C76 65 58 78 50 82 C42 78 24 65 22 50 C20 35 32 20 50 20 Z"
              fill="none"
              stroke={`url(#${defsId}-cylinder)`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M32 30 C55 45 65 55 70 70 M68 30 C45 45 35 55 30 70"
              fill="none"
              stroke={`url(#${defsId}-top)`}
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Specular line */}
            <path
              d="M50 22 C64 22 74 34 72 48"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity="0.6"
            />
          </g>
        )}

        {/* 7. PLANE */}
        {type === 'plane' && (
          <g>
            {/* Planar Quad in 3D Isometric view */}
            <polygon
              points="50,22 86,44 50,78 14,56"
              fill={`url(#${defsId}-top)`}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1"
            />
            {/* 3D Grid mesh lines (Blender Wireframe Plane look) */}
            <line x1="32" y1="33" x2="68" y2="67" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
            <line x1="68" y1="33" x2="32" y2="67" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
            <line x1="23" y1="45" x2="77" y2="55" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
            <line x1="50" y1="22" x2="50" y2="78" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />

            {/* Neon Grid effect if cyber grid */}
            {isGrid && (
              <g stroke="#e879f9" strokeWidth="0.8" opacity="0.7">
                <line x1="41" y1="28" x2="59" y2="72" />
                <line x1="59" y1="28" x2="41" y2="72" />
              </g>
            )}
          </g>
        )}

        {/* 8. CIRCLE / FLAT DISC */}
        {type === 'circle' && (
          <g>
            <ellipse
              cx="50"
              cy="52"
              rx="36"
              ry="20"
              fill={`url(#${defsId}-disc)`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />
            {/* Concentric disc bevel rings */}
            <ellipse cx="50" cy="52" rx="26" ry="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
            <ellipse cx="50" cy="52" rx="14" ry="8" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
            
            {/* Surface sheen streak */}
            <path d="M22 48 C34 38 66 38 78 48" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6" />

            {/* Carbon / Gold textures */}
            {isCarbon && (
              <ellipse cx="50" cy="52" rx="36" ry="20" fill={`url(#${defsId}-carbon-pattern)`} opacity="0.5" />
            )}
          </g>
        )}

        {/* 9. CAPSULE / PILL */}
        {type === 'capsule' && (
          <g>
            {/* Top Hemisphere */}
            <path
              d="M32 40 C32 24 68 24 68 40 L68 62 C68 78 32 78 32 62 Z"
              fill={`url(#${defsId}-cylinder)`}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.75"
            />
            {/* Equator Division Line */}
            <ellipse cx="50" cy="51" rx="18" ry="5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.75" strokeDasharray="2 2" />
            
            {/* Specular Highlight Streak */}
            <path d="M40 30 L40 65" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <circle cx="42" cy="28" r="2" fill="#ffffff" opacity="0.8" />
          </g>
        )}

        {/* 10. ICOSAHEDRON / ICO SPHERE */}
        {type === 'icosahedron' && (
          <g>
            {/* Faceted Equilateral Triangles */}
            {/* Center Front Face */}
            <polygon points="50,28 68,52 32,52" fill={`url(#${defsId}-top)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" />
            {/* Top Triangles */}
            <polygon points="50,16 32,32 50,28" fill={highlightColor} opacity="0.7" stroke="rgba(255,255,255,0.5)" strokeWidth="0.75" />
            <polygon points="50,16 68,32 50,28" fill={baseColor} stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" />
            {/* Left Triangles */}
            <polygon points="32,32 18,52 32,52" fill={`url(#${defsId}-left)`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
            <polygon points="32,52 18,52 36,72" fill={shadowColor} opacity="0.9" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
            {/* Right Triangles */}
            <polygon points="68,32 82,52 68,52" fill={`url(#${defsId}-right)`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
            <polygon points="68,52 82,52 64,72" fill={shadowColor} stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
            {/* Bottom Triangles */}
            <polygon points="32,52 68,52 50,72" fill={`url(#${defsId}-left)`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
            <polygon points="36,72 64,72 50,84" fill={shadowColor} stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />

            {/* Vertex points */}
            <circle cx="50" cy="28" r="1.5" fill="#ffffff" opacity="0.9" />
          </g>
        )}

        {/* 11. OCTAHEDRON */}
        {type === 'octahedron' && (
          <g>
            {/* Top Pyramid */}
            <polygon points="50,16 78,50 50,58" fill={`url(#${defsId}-top)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" />
            <polygon points="50,16 22,50 50,58" fill={`url(#${defsId}-left)`} stroke="rgba(255,255,255,0.5)" strokeWidth="0.75" />
            {/* Bottom Pyramid */}
            <polygon points="50,84 78,50 50,58" fill={`url(#${defsId}-right)`} stroke="rgba(0,0,0,0.3)" strokeWidth="0.75" />
            <polygon points="50,84 22,50 50,58" fill={shadowColor} stroke="rgba(0,0,0,0.4)" strokeWidth="0.75" />

            {/* Facet Highlights */}
            <circle cx="50" cy="16" r="1.5" fill="#ffffff" opacity="0.9" />
            <circle cx="50" cy="58" r="1.5" fill="#ffffff" opacity="0.8" />
          </g>
        )}

        {/* 12. DODECAHEDRON */}
        {type === 'dodecahedron' && (
          <g>
            {/* Front Pentagon */}
            <polygon points="50,30 70,44 62,68 38,68 30,44" fill={`url(#${defsId}-top)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" />
            {/* Surrounding Pentagon Facets */}
            <polygon points="50,30 70,44 80,30 65,16 50,16" fill={highlightColor} opacity="0.6" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
            <polygon points="50,30 30,44 20,30 35,16 50,16" fill={`url(#${defsId}-left)`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
            <polygon points="30,44 38,68 22,78 14,60 20,30" fill={shadowColor} stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
            <polygon points="70,44 62,68 78,78 86,60 80,30" fill={`url(#${defsId}-right)`} stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" />
            <polygon points="38,68 62,68 56,84 44,84 22,78" fill={shadowColor} opacity="0.9" stroke="rgba(0,0,0,0.4)" strokeWidth="0.6" />
            
            <circle cx="50" cy="30" r="1.5" fill="#ffffff" opacity="0.9" />
          </g>
        )}

        {/* 13. PYRAMID / TETRAHEDRON */}
        {(type === 'pyramid' || type === 'tetrahedron') && (
          <g>
            {/* Left Face */}
            <polygon points="50,18 20,68 50,78" fill={`url(#${defsId}-left)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" />
            {/* Right Face */}
            <polygon points="50,18 80,68 50,78" fill={`url(#${defsId}-right)`} stroke="rgba(0,0,0,0.3)" strokeWidth="0.75" />
            {/* Base Line */}
            <line x1="20" y1="68" x2="80" y2="68" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeDasharray="2 2" />
            
            {/* Apex Glint */}
            <circle cx="50" cy="18" r="1.8" fill="#ffffff" opacity="0.9" />
            <line x1="50" y1="18" x2="50" y2="78" stroke="rgba(255,255,255,0.45)" strokeWidth="0.75" />
          </g>
        )}

        {/* 14. TUBE / PIPE */}
        {type === 'tube' && (
          <g>
            {/* Outer Cylinder */}
            <path d="M26 34 L26 70 C26 78 74 78 74 70 L74 34 Z" fill={`url(#${defsId}-cylinder)`} stroke="rgba(0,0,0,0.3)" strokeWidth="0.75" />
            {/* Top Outer Rim */}
            <ellipse cx="50" cy="34" rx="24" ry="10" fill={`url(#${defsId}-top)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" />
            {/* Inner Hollow Hole */}
            <ellipse cx="50" cy="34" rx="14" ry="6" fill="#09090d" stroke="rgba(0,0,0,0.7)" strokeWidth="0.75" />
          </g>
        )}

        {/* 15. PRISM / WEDGE */}
        {type === 'prism' && (
          <g>
            {/* Inclined Top Face */}
            <polygon points="30,28 70,28 80,72 40,72" fill={`url(#${defsId}-top)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" />
            {/* Front Triangular Face */}
            <polygon points="40,72 80,72 40,72" fill={`url(#${defsId}-left)`} />
            {/* Left Vertical Face */}
            <polygon points="30,28 40,72 20,72" fill={`url(#${defsId}-left)`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
            {/* Right Triangular End */}
            <polygon points="70,28 80,72 60,72" fill={`url(#${defsId}-right)`} stroke="rgba(0,0,0,0.3)" strokeWidth="0.75" />
            <line x1="30" y1="28" x2="70" y2="28" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
          </g>
        )}

        {/* 16. HELIX / SPRING */}
        {type === 'helix' && (
          <g>
            {/* Helical Spiral Spring Curves */}
            <path
              d="M36 28 C55 24 68 32 64 40 C60 48 36 44 40 52 C44 60 68 56 64 64 C60 72 36 68 40 76"
              fill="none"
              stroke={`url(#${defsId}-cylinder)`}
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M36 28 C55 24 68 32 64 40 C60 48 36 44 40 52 C44 60 68 56 64 64 C60 72 36 68 40 76"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>
        )}

        {/* 17. 3D STAR */}
        {type === 'star' && (
          <g>
            {/* 3D Extruded 5-Point Star with Central Facets */}
            {/* Facets from center (50, 50) */}
            <polygon points="50,18 50,50 62,38" fill={`url(#${defsId}-top)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <polygon points="50,18 50,50 38,38" fill={highlightColor} opacity="0.8" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <polygon points="82,42 50,50 62,38" fill={`url(#${defsId}-right)`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
            <polygon points="82,42 50,50 66,62" fill={shadowColor} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
            <polygon points="70,80 50,50 66,62" fill={shadowColor} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
            <polygon points="70,80 50,50 50,68" fill={`url(#${defsId}-left)`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
            <polygon points="30,80 50,50 50,68" fill={`url(#${defsId}-left)`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
            <polygon points="30,80 50,50 34,62" fill={shadowColor} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
            <polygon points="18,42 50,50 34,62" fill={shadowColor} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
            <polygon points="18,42 50,50 38,38" fill={`url(#${defsId}-left)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            
            <circle cx="50" cy="50" r="2" fill="#ffffff" opacity="0.9" />
          </g>
        )}

        {/* 18. DOME / HEMISPHERE */}
        {type === 'dome' && (
          <g>
            {/* Dome Arc */}
            <path
              d="M18 64 C18 30 82 30 82 64 Z"
              fill={`url(#${defsId}-sphere)`}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.75"
            />
            {/* Flat Base Ellipse */}
            <ellipse cx="50" cy="64" rx="32" ry="10" fill={`url(#${defsId}-right)`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
            {/* Specular curved glint */}
            <path d="M36 40 C42 34 58 34 64 40" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
          </g>
        )}

        {/* 19. EMPTY / NULL NODE (3D Spatial Coordinate Tripod Anchor) */}
        {type === 'empty' && (
          <g>
            {/* Center Pivot Point */}
            <circle cx="50" cy="50" r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
            {/* X-Axis (Red) */}
            <line x1="50" y1="50" x2="84" y2="50" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <polygon points="88,50 82,46 82,54" fill="#ef4444" />
            <text x="82" y="42" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">X</text>
            
            {/* Y-Axis (Green / Vertical in some coords) */}
            <line x1="50" y1="50" x2="50" y2="16" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
            <polygon points="50,12 46,18 54,18" fill="#10b981" />
            <text x="56" y="20" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">Y</text>

            {/* Z-Axis (Blue / Depth angle) */}
            <line x1="50" y1="50" x2="26" y2="74" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
            <polygon points="22,78 28,72 24,68" fill="#3b82f6" />
            <text x="14" y="80" fill="#3b82f6" fontSize="9" fontWeight="bold" fontFamily="monospace">Z</text>

            {/* Coordinate rings */}
            <ellipse cx="50" cy="50" rx="20" ry="10" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="1" strokeDasharray="3 3" />
          </g>
        )}
      </svg>
    </div>
  );
};
