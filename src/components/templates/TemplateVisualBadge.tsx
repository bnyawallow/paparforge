import React from 'react';
import { TemplateType } from '../../types';
import { 
  Layers, ShoppingBag, Tv, Car, Utensils, Crown, Building2, 
  User as UserIcon, GraduationCap, Sparkles, Box, Play, Zap, 
  Eye, QrCode, Tag, Check, Camera, Compass, Radio, Disc, Flame, Atom, Film, Globe, Move
} from 'lucide-react';

interface TemplateVisualBadgeProps {
  templateId: TemplateType | string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showDetails?: boolean;
}

export function TemplateVisualBadge({
  templateId,
  size = 'md',
  className = '',
  showDetails = true
}: TemplateVisualBadgeProps) {
  // Dimension classes
  const containerHeight = size === 'sm' ? 'h-24' : size === 'md' ? 'h-32' : size === 'lg' ? 'h-40' : 'h-52';

  switch (templateId) {
    case 'product_showcase':
      return (
        <div className={`relative w-full ${containerHeight} rounded-xl overflow-hidden bg-gradient-to-br from-blue-950/80 via-[#0B1224] to-[#050811] border border-blue-500/20 flex flex-col items-center justify-center p-3 select-none group-hover:border-blue-400/50 transition-all ${className}`}>
          {/* Subtle Cyber Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#3B82F618_1px,transparent_1px)] [background-size:12px_12px] opacity-70 pointer-events-none" />
          
          {/* Glow backdrop */}
          <div className="absolute w-24 h-24 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />

          {/* 3D Model Stage Preview Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Holographic Glowing Ring */}
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-1 rounded-full border border-cyan-400/40 animate-spin" style={{ animationDuration: '8s' }} />
              
              {/* Product Mesh Visual Container */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-blue-500/30 border border-white/30 flex items-center justify-center text-white transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
                <ShoppingBag size={24} className="stroke-[2.2]" />
              </div>
            </div>

            {/* Pedestal Base */}
            <div className="w-20 h-2 mt-2 rounded-full bg-gradient-to-r from-blue-500/20 via-cyan-400/60 to-blue-500/20 blur-[1px]" />
          </div>

          {showDetails && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30 backdrop-blur-sm">
                3D PBR Mesh
              </span>
              <span className="text-[9px] font-mono font-bold text-blue-400">
                $189.99
              </span>
            </div>
          )}
        </div>
      );

    case 'automobile_showroom':
      return (
        <div className={`relative w-full ${containerHeight} rounded-xl overflow-hidden bg-gradient-to-br from-red-950/80 via-[#180A0A] to-[#0A0303] border border-red-500/20 flex flex-col items-center justify-center p-3 select-none group-hover:border-red-400/50 transition-all ${className}`}>
          {/* Speed line accents */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-gradient-to-r from-transparent via-red-500/10 to-transparent pointer-events-none" />
          <div className="absolute w-28 h-28 rounded-full bg-red-600/15 blur-xl pointer-events-none" />

          {/* 3D Car & Turntable Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-600 shadow-lg shadow-red-500/30 border border-white/30 flex items-center justify-center text-white transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
              <Car size={26} className="stroke-[2.2]" />
            </div>

            {/* Turntable platform */}
            <div className="w-24 h-2.5 mt-2 rounded-full bg-gradient-to-r from-red-900/60 via-red-500/40 to-red-900/60 border-t border-red-400/40" />
          </div>

          {showDetails && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-orange-300 border border-red-500/30 backdrop-blur-sm">
                WASD Drivable
              </span>
              <span className="text-[9px] font-mono font-bold text-red-400">
                AWD 4x4
              </span>
            </div>
          )}
        </div>
      );

    case 'fast_food_beverage':
      return (
        <div className={`relative w-full ${containerHeight} rounded-xl overflow-hidden bg-gradient-to-br from-amber-950/80 via-[#181105] to-[#080500] border border-amber-500/20 flex flex-col items-center justify-center p-3 select-none group-hover:border-amber-400/50 transition-all ${className}`}>
          {/* Flavor particle bubbles */}
          <div className="absolute top-2 left-4 w-2 h-2 rounded-full bg-amber-400/40 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-4 right-5 w-1.5 h-1.5 rounded-full bg-yellow-400/50 animate-pulse" />
          <div className="absolute w-24 h-24 rounded-full bg-amber-500/20 blur-xl pointer-events-none" />

          {/* 3D Beverage & Float Mesh Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 shadow-lg shadow-amber-500/30 border border-white/30 flex items-center justify-center text-white transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
                <Utensils size={24} className="stroke-[2.2]" />
              </div>
              {/* Floating Sparkle Pill */}
              <div className="absolute -top-1.5 -right-2 w-5 h-5 rounded-full bg-amber-400 border border-white text-black flex items-center justify-center shadow-md">
                <Sparkles size={11} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Pedestal with flavor ring */}
            <div className="w-20 h-2 mt-2 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/50 to-amber-500/20 blur-[1px]" />
          </div>

          {showDetails && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-yellow-300 border border-amber-500/30 backdrop-blur-sm">
                25% OFF Promo
              </span>
              <span className="text-[9px] font-mono font-bold text-amber-400">
                Audio FX
              </span>
            </div>
          )}
        </div>
      );

    case 'luxury_fashion':
      return (
        <div className={`relative w-full ${containerHeight} rounded-xl overflow-hidden bg-gradient-to-br from-pink-950/80 via-[#160613] to-[#070106] border border-pink-500/20 flex flex-col items-center justify-center p-3 select-none group-hover:border-pink-400/50 transition-all ${className}`}>
          {/* Gold ray accents */}
          <div className="absolute inset-0 bg-[radial-gradient(#F472B618_1px,transparent_1px)] [background-size:14px_14px] opacity-60 pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full bg-pink-500/20 blur-xl pointer-events-none" />

          {/* Luxury Crown / Perfume Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 shadow-lg shadow-pink-500/30 border border-white/40 flex items-center justify-center text-white transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
              <Crown size={24} className="stroke-[2.2]" />
            </div>

            {/* Marble & Gold Base */}
            <div className="w-22 h-2.5 mt-2 rounded-full bg-gradient-to-r from-pink-900/60 via-amber-300/60 to-pink-900/60 border-t border-amber-300/40" />
          </div>

          {showDetails && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 backdrop-blur-sm">
                PBR Gold Shader
              </span>
              <span className="text-[9px] font-mono font-bold text-amber-300">
                VIP Vault
              </span>
            </div>
          )}
        </div>
      );

    case 'real_estate':
      return (
        <div className={`relative w-full ${containerHeight} rounded-xl overflow-hidden bg-gradient-to-br from-emerald-950/80 via-[#06140E] to-[#010704] border border-emerald-500/20 flex flex-col items-center justify-center p-3 select-none group-hover:border-emerald-400/50 transition-all ${className}`}>
          {/* Architectural blueprint grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10B98110_1px,transparent_1px),linear-gradient(to_bottom,#10B98110_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 blur-xl pointer-events-none" />

          {/* 3D Villa Architecture Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/30 border border-white/30 flex items-center justify-center text-white transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
              <Building2 size={24} className="stroke-[2.2]" />
            </div>

            {/* Architectural Podium */}
            <div className="w-20 h-2 mt-2 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-400/60 to-emerald-500/20 blur-[1px]" />
          </div>

          {showDetails && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-teal-300 border border-emerald-500/30 backdrop-blur-sm">
                3D Floorplan
              </span>
              <span className="text-[9px] font-mono font-bold text-emerald-400">
                Virtual Tour
              </span>
            </div>
          )}
        </div>
      );

    case 'business_card':
      return (
        <div className={`relative w-full ${containerHeight} rounded-xl overflow-hidden bg-gradient-to-br from-indigo-950/80 via-[#0D091F] to-[#04020B] border border-indigo-500/20 flex flex-col items-center justify-center p-3 select-none group-hover:border-indigo-400/50 transition-all ${className}`}>
          {/* NFC Wave rings */}
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full border border-indigo-400/20 pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full border border-indigo-400/10 pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />

          {/* 3D Astronaut Avatar / Identity Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 shadow-lg shadow-indigo-500/30 border border-white/30 flex items-center justify-center text-white transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
                <UserIcon size={24} className="stroke-[2.2]" />
              </div>
              <div className="absolute -bottom-1 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 border border-black flex items-center justify-center text-white">
                <Radio size={9} className="stroke-[3]" />
              </div>
            </div>

            {/* Carbon card base */}
            <div className="w-22 h-2 mt-2 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-400/50 to-indigo-500/20 blur-[1px]" />
          </div>

          {showDetails && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-sm">
                vCard Contact
              </span>
              <span className="text-[9px] font-mono font-bold text-purple-400">
                Spatial ID
              </span>
            </div>
          )}
        </div>
      );

    case 'educational':
      return (
        <div className={`relative w-full ${containerHeight} rounded-xl overflow-hidden bg-gradient-to-br from-cyan-950/80 via-[#04151B] to-[#01080A] border border-cyan-500/20 flex flex-col items-center justify-center p-3 select-none group-hover:border-cyan-400/50 transition-all ${className}`}>
          {/* Orbital atom electrons */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-28 h-10 rounded-[100%] border border-cyan-400/25 rotate-45" />
            <div className="w-28 h-10 rounded-[100%] border border-cyan-400/25 -rotate-45" />
          </div>
          <div className="absolute w-24 h-24 rounded-full bg-cyan-500/20 blur-xl pointer-events-none" />

          {/* 3D Animated STEM Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-700 shadow-lg shadow-cyan-500/30 border border-white/30 flex items-center justify-center text-white transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
              <GraduationCap size={24} className="stroke-[2.2]" />
            </div>

            {/* Terrain platform */}
            <div className="w-20 h-2 mt-2 rounded-full bg-gradient-to-r from-cyan-500/20 via-sky-400/60 to-cyan-500/20 blur-[1px]" />
          </div>

          {showDetails && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-sky-300 border border-cyan-500/30 backdrop-blur-sm">
                STEM Narration
              </span>
              <span className="text-[9px] font-mono font-bold text-cyan-400">
                Kinematics
              </span>
            </div>
          )}
        </div>
      );

    case 'billboard_poster':
      return (
        <div className={`relative w-full ${containerHeight} rounded-xl overflow-hidden bg-gradient-to-br from-rose-950/80 via-[#1C060D] to-[#0A0105] border border-rose-500/20 flex flex-col items-center justify-center p-3 select-none group-hover:border-rose-400/50 transition-all ${className}`}>
          {/* Cinema beam light */}
          <div className="absolute inset-0 bg-[radial-gradient(#F43F5E20_1px,transparent_1px)] [background-size:12px_12px] opacity-70 pointer-events-none" />
          <div className="absolute w-28 h-28 rounded-full bg-rose-500/20 blur-xl pointer-events-none" />

          {/* 3D Billboard & Video Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-700 shadow-lg shadow-rose-500/30 border border-white/30 flex items-center justify-center text-white transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
                <Tv size={24} className="stroke-[2.2]" />
              </div>
              <div className="absolute -top-1 -right-1.5 w-5 h-5 rounded-full bg-red-600 border border-white text-white flex items-center justify-center shadow-md">
                <Play size={10} className="fill-white" />
              </div>
            </div>

            {/* Billboard frame extrusion */}
            <div className="w-22 h-2.5 mt-2 rounded-full bg-gradient-to-r from-rose-900/60 via-rose-500/50 to-rose-900/60 border-t border-rose-400/40" />
          </div>

          {showDetails && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-sm">
                IMAX 3D Video
              </span>
              <span className="text-[9px] font-mono font-bold text-rose-400">
                Ticket CTA
              </span>
            </div>
          )}
        </div>
      );

    case 'face_filter_mask':
      return (
        <div className={`relative w-full ${containerHeight} rounded-xl overflow-hidden bg-gradient-to-br from-purple-950/80 via-[#150522] to-[#08010E] border border-purple-500/20 flex flex-col items-center justify-center p-3 select-none group-hover:border-purple-400/50 transition-all ${className}`}>
          {/* Reticle / Face scan lines */}
          <div className="absolute inset-x-6 top-3 bottom-3 border border-dashed border-purple-400/20 rounded-2xl pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full bg-purple-500/20 blur-xl pointer-events-none" />

          {/* 3D Visor / Face Filter Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30 border border-white/30 flex items-center justify-center text-white transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
                <Sparkles size={24} className="stroke-[2.2]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-500 border border-white text-white flex items-center justify-center">
                <Camera size={9} />
              </div>
            </div>

            {/* Occluder Ring */}
            <div className="w-20 h-2 mt-2 rounded-full bg-gradient-to-r from-purple-500/20 via-fuchsia-400/60 to-purple-500/20 blur-[1px]" />
          </div>

          {showDetails && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-fuchsia-300 border border-purple-500/30 backdrop-blur-sm">
                68-Pt Face Mesh
              </span>
              <span className="text-[9px] font-mono font-bold text-purple-400">
                AR Selfie
              </span>
            </div>
          )}
        </div>
      );

    case 'empty':
    default:
      return (
        <div className={`relative w-full ${containerHeight} rounded-xl overflow-hidden bg-gradient-to-br from-slate-900/80 via-[#0F1117] to-[#07080B] border border-slate-700/30 flex flex-col items-center justify-center p-3 select-none group-hover:border-slate-500/50 transition-all ${className}`}>
          {/* Clean CAD blueprint grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748B12_1px,transparent_1px),linear-gradient(to_bottom,#64748B12_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
          
          {/* 3D Blueprint Marker Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 shadow-lg border border-white/20 flex items-center justify-center text-slate-300 transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
              <Layers size={24} className="stroke-[2]" />
            </div>

            {/* Target dimensions base */}
            <div className="w-20 h-2 mt-2 rounded-full bg-slate-600/30 blur-[1px]" />
          </div>

          {showDetails && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-700/40 text-slate-300 border border-slate-600/40 backdrop-blur-sm">
                Starter Slate
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400">
                Custom Target
              </span>
            </div>
          )}
        </div>
      );
  }
}
