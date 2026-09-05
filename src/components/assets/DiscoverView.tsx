import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Type, 
  Palette, 
  Music, 
  Box, 
  Grid, 
  Zap, 
  Clock, 
  LayoutGrid, 
  Compass,
  Play,
  MousePointerClick,
  ShoppingCart,
  Heart,
  Plus,
  Download,
  Rocket,
  Check,
  Shield,
  Settings,
  Star,
  Video
} from 'lucide-react';
import { CategoryTab } from './assetTypes';
import { AssetCard } from './AssetCard';
import { SPLINE_3D_ICONS, SplineIconMetadata } from '../viewport/Spline3DIconRenderer';
import { UI_KIT_PRESETS, UIKitPreset } from '../../lib/uiKits';
import { TEXT_STYLE_PRESETS, TextStylePreset } from '../../lib/textStylesCollection';
import { SPLINE_MATERIAL_PRESETS, SplineMaterialPreset } from '../../lib/splineMaterials';
import { SPLINE_SOUND_PRESETS, SplineSoundPreset } from '../../lib/splineSoundEngine';
import { BUTTON_TEMPLATES, ButtonTemplate } from '../../lib/buttonTemplates';
import { PRIMITIVE_TEMPLATES, PrimitiveTemplate } from '../../lib/primitiveTemplates';
import { MEDIA_WIDGET_TEMPLATES, MediaWidgetTemplate } from '../../lib/mediaTemplates';
import { getSplineThumbnailStyle } from './AssetBrowser';

interface DiscoverViewProps {
  onNavigateTab: (tab: CategoryTab) => void;
  recentAssets: any[];
  onSelectRecentAsset: (asset: any) => void;
  onAdd3DIcon: (icon: SplineIconMetadata) => void;
  onAddUIKit: (preset: UIKitPreset) => void;
  onAddTextStyle: (style: TextStylePreset) => void;
  onApplyMaterial: (mat: SplineMaterialPreset) => void;
  onAddSound: (sound: SplineSoundPreset) => void;
  onAddButtonTemplate?: (template: ButtonTemplate) => void;
  onAddPrimitiveTemplate?: (template: PrimitiveTemplate) => void;
  onAddMediaTemplate?: (template: MediaWidgetTemplate) => void;
  playingSoundId: string | null;
  onPlaySoundToggle: (sound: SplineSoundPreset) => void;
}

export function renderMediaPreview(media: MediaWidgetTemplate) {
  if (media.type === 'youtube') {
    const aspect = (media.properties as any)?.aspectRatio || '16:9';
    let screenStyle = { width: '54px', height: '30px' }; // default 16:9
    if (aspect === '4:3') {
      screenStyle = { width: '44px', height: '33px' };
    } else if (aspect === '1:1') {
      screenStyle = { width: '36px', height: '36px' };
    } else if (aspect === '9:16') {
      screenStyle = { width: '25px', height: '44px' };
    } else if (aspect === '21:9') {
      screenStyle = { width: '62px', height: '26px' };
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 relative overflow-hidden">
        <div
          className="rounded-md shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-105 relative border border-[#2a2b32] bg-[#0c0d12]"
          style={screenStyle}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none rounded-[5px]" />
          
          <div className="w-5 h-3.5 bg-red-600 rounded-[3px] flex items-center justify-center shadow-sm">
            <div className="w-0 h-0 border-y-[2.5px] border-y-transparent border-l-[5px] border-l-white ml-0.5" />
          </div>

          <span className="absolute bottom-0.5 right-1 text-[6.5px] font-mono font-bold text-gray-400 select-none">
            {aspect}
          </span>
        </div>
        {media.metaText && (
          <span className="text-[9px] text-gray-300 font-mono mt-1.5 truncate max-w-full text-center">
            {media.metaText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2.5 relative overflow-hidden">
      <div 
        className="w-12 h-12 rounded-xl shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 relative border border-white/20"
        style={{
          background: media.previewBg,
        }}
      >
        <span className="text-xl drop-shadow-md select-none">{media.icon}</span>
      </div>
      {media.metaText && (
        <span className="text-[9px] text-gray-300 font-mono mt-1 truncate max-w-full text-center">
          {media.metaText}
        </span>
      )}
    </div>
  );
}

export function renderButtonPreview(btn: ButtonTemplate) {
  const isCircle = btn.shape === 'circle';
  const is3D = btn.buttonStyle === '3d_push';
  const isChamfer = btn.buttonStyle === 'chamfer';

  const renderIcon = (name?: string, size = 11) => {
    switch (name) {
      case 'Sparkles': return <Sparkles size={size} />;
      case 'ArrowRight': return <ArrowRight size={size} />;
      case 'Play': return <Play size={size} className="fill-current" />;
      case 'ShoppingCart': return <ShoppingCart size={size} />;
      case 'Heart': return <Heart size={size} className="fill-current" />;
      case 'Plus': return <Plus size={size} />;
      case 'Download': return <Download size={size} />;
      case 'Rocket': return <Rocket size={size} />;
      case 'Check': return <Check size={size} />;
      case 'Zap': return <Zap size={size} className="fill-current" />;
      case 'Shield': return <Shield size={size} />;
      case 'Compass': return <Compass size={size} />;
      case 'Settings': return <Settings size={size} />;
      case 'Star': return <Star size={size} className="fill-current" />;
      default: return null;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-2.5">
      <div
        className={`flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${
          isCircle ? 'w-12 h-12 rounded-full' : 'px-3 py-1.5 w-full max-w-[130px]'
        }`}
        style={{
          background: btn.previewBg || btn.color,
          color: btn.textColor,
          borderRadius: isCircle ? '9999px' : isChamfer ? '2px' : `${Math.min(24, btn.borderRadius ?? 12)}px`,
          clipPath: isChamfer ? 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' : undefined,
          border: btn.borderWidth ? `${btn.borderWidth}px solid ${btn.borderColor || 'rgba(255,255,255,0.3)'}` : undefined,
          boxShadow: btn.glowEffect ? `0 0 14px ${btn.glowColor || 'rgba(59,130,246,0.5)'}` : is3D ? '0 3px 0 rgba(0,0,0,0.6)' : '0 4px 10px rgba(0,0,0,0.3)',
          fontFamily: btn.fontFamily || 'Inter',
          fontWeight: btn.fontWeight || '700',
        }}
      >
        <div className="flex items-center justify-center gap-1 overflow-hidden">
          {btn.icon && btn.iconPosition !== 'right' && renderIcon(btn.icon, isCircle ? 16 : 11)}
          {btn.iconPosition !== 'only' && (
            <span className="text-[10px] truncate tracking-tight font-bold">
              {btn.text}
            </span>
          )}
          {btn.icon && btn.iconPosition === 'right' && renderIcon(btn.icon, 11)}
        </div>
      </div>
    </div>
  );
}

export function renderPrimitivePreview(prim: PrimitiveTemplate) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3 relative overflow-hidden">
      <div 
        className={`w-13 h-13 shadow-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 relative ${
          prim.type === 'circle' || prim.type === 'sphere' ? 'rounded-full' :
          prim.type === 'cylinder' || prim.type === 'capsule' ? 'rounded-2xl' :
          prim.type === 'torus' ? 'rounded-full border-4 border-white/40' :
          prim.type === 'pyramid' ? 'rotate-45 rounded-sm' : 'rounded-xl'
        }`}
        style={{
          background: prim.previewGradient || prim.previewColor,
          boxShadow: prim.properties.emissiveColor ? `0 0 18px ${prim.properties.emissiveColor}` : '0 6px 20px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <span className="text-xl drop-shadow-md select-none">{prim.icon}</span>
      </div>
    </div>
  );
}

export function DiscoverView({
  onNavigateTab,
  recentAssets,
  onSelectRecentAsset,
  onAdd3DIcon,
  onAddUIKit,
  onAddTextStyle,
  onApplyMaterial,
  onAddSound,
  onAddButtonTemplate,
  onAddPrimitiveTemplate,
  onAddMediaTemplate,
  playingSoundId,
  onPlaySoundToggle,
}: DiscoverViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
      {/* Canva Style Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-white/10 p-6 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
              <span>Canva-Powered AR Creator Studio</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              What will you build in Augmented Reality?
            </h1>
            <p className="text-xs text-gray-300 max-w-xl">
              Drag and drop curated 3D primitives, interactive YouTube screens, button templates, 3D icons, glassmorphic UI kits, cinematic text presets, and spatial audio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('primitives')}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Box size={14} />
              <span>3D Primitives</span>
            </button>
            <button
              onClick={() => onNavigateTab('media')}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Video size={14} />
              <span>YouTube & Media</span>
            </button>
            <button
              onClick={() => onNavigateTab('buttons')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <MousePointerClick size={14} />
              <span>Buttons</span>
            </button>
            <button
              onClick={() => onNavigateTab('elements')}
              className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-pink-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>3D Elements</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Recently Used Section */}
      {recentAssets.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-sky-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Recently Used</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentAssets.slice(0, 6).map((asset) => (
              <AssetCard
                key={asset.id}
                id={asset.id}
                name={asset.name}
                badge={asset.type?.toUpperCase() || 'RECENT'}
                thumbnail={asset.thumbnail || '📦'}
                description={asset.description || 'Recently deployed'}
                onSelect={() => onSelectRecentAsset(asset)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. YouTube Players & Interactive Media Widgets */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
              <Video size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">YouTube Players & Interactive Media</h3>
              <p className="text-[10px] text-gray-400">16:9 Cinema screens, 9:16 TikTok/Shorts holograms, neon billboards & spatial video</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('media')}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>See all ({MEDIA_WIDGET_TEMPLATES.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {MEDIA_WIDGET_TEMPLATES.slice(0, 6).map((media) => (
            <AssetCard
              key={media.id}
              id={media.id}
              name={media.name}
              badge={media.badge}
              badgeColor={media.badgeColor}
              thumbnail={renderMediaPreview(media)}
              description={media.description}
              onSelect={() => onAddMediaTemplate && onAddMediaTemplate(media)}
            />
          ))}
        </div>
      </section>

      {/* 3. 3D Primitives & Shapes */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Box size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">3D Primitives & Textured Shapes</h3>
              <p className="text-[10px] text-gray-400">Cubes, spheres, cylinders, discs, torus knots, carbon fiber, & glowing holograms</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('primitives')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>See all ({PRIMITIVE_TEMPLATES.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {PRIMITIVE_TEMPLATES.slice(0, 6).map((prim) => (
            <AssetCard
              key={prim.id}
              id={prim.id}
              name={prim.name}
              badge={prim.badge}
              badgeColor={prim.badgeColor}
              thumbnail={renderPrimitivePreview(prim)}
              description={prim.description}
              onSelect={() => onAddPrimitiveTemplate && onAddPrimitiveTemplate(prim)}
            />
          ))}
        </div>
      </section>

      {/* 4. Featured Canva Button Templates */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <MousePointerClick size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Interactive Button Templates</h3>
              <p className="text-[10px] text-gray-400">Gradient pills, glass panels, 3D plungers, and floating action triggers</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('buttons')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>See all ({BUTTON_TEMPLATES.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {BUTTON_TEMPLATES.slice(0, 6).map((btn) => (
            <AssetCard
              key={btn.id}
              id={btn.id}
              name={btn.name}
              badge="BUTTON"
              badgeColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
              thumbnail={renderButtonPreview(btn)}
              description={btn.description}
              onSelect={() => onAddButtonTemplate && onAddButtonTemplate(btn)}
            />
          ))}
        </div>
      </section>

      {/* 4. Featured 3D Spline Elements */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
              <Box size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Featured 3D Spline Elements</h3>
              <p className="text-[10px] text-gray-400">Interactive 3D geometry icons with procedural materials</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('elements')}
            className="text-xs text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>See all ({SPLINE_3D_ICONS.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SPLINE_3D_ICONS.slice(0, 6).map((icon) => {
            const thumb = getSplineThumbnailStyle(icon.name);
            return (
              <AssetCard
                key={icon.id}
                id={icon.id}
                name={icon.name}
                badge="3D ICON"
                badgeColor="bg-pink-500/20 text-pink-300 border-pink-500/30"
                thumbnail={
                  <div
                    className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
                    style={{ background: thumb.orbBg, boxShadow: `0 0 20px ${thumb.glowColor}` }}
                  >
                    <span className="text-lg text-white font-bold">{icon.name.charAt(0)}</span>
                  </div>
                }
                description={icon.description}
                onSelect={() => onAdd3DIcon(icon)}
              />
            );
          })}
        </div>
      </section>

      {/* 5. Trending UI Kits */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Glassmorphic & Cyber UI Kits</h3>
              <p className="text-[10px] text-gray-400">Complete pre-designed HUD cards, buttons, and meters</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('ui-kits')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>See all ({UI_KIT_PRESETS.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {UI_KIT_PRESETS.slice(0, 4).map((preset) => (
            <AssetCard
              key={preset.id}
              id={preset.id}
              name={preset.name}
              badge="UI KIT"
              badgeColor="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
              thumbnail={
                <div className="w-full h-full p-2 flex flex-col justify-center gap-1.5 bg-black/40 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-300">{preset.category}</span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <div className="h-1.5 w-full bg-cyan-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 w-3/4 rounded-full" />
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono truncate">{preset.name}</div>
                </div>
              }
              description={preset.description}
              onSelect={() => onAddUIKit(preset)}
            />
          ))}
        </div>
      </section>

      {/* 6. Text Styles Studio */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Type size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Text Styles & Typography</h3>
              <p className="text-[10px] text-gray-400">Cinematic headings, neon glows, and 3D typography</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('text-styles')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>See all ({TEXT_STYLE_PRESETS.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {TEXT_STYLE_PRESETS.slice(0, 4).map((style) => (
            <AssetCard
              key={style.id}
              id={style.id}
              name={style.name}
              badge="FONT STYLE"
              badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
              thumbnail={
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-black/40 rounded-lg">
                  <span
                    className="text-base font-black tracking-wider uppercase leading-tight truncate w-full"
                    style={{
                      color: style.previewStyle?.color || '#ffffff',
                      textShadow: style.previewStyle?.textShadow || '0 0 10px rgba(245,158,11,0.5)',
                    }}
                  >
                    {style.sampleText || style.name}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-1 font-mono">{style.category}</span>
                </div>
              }
              description={style.description}
              onSelect={() => onAddTextStyle(style)}
            />
          ))}
        </div>
      </section>

      {/* 7. Spline Materials & Shaders */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Palette size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">PBR Materials & Shaders</h3>
              <p className="text-[10px] text-gray-400">Glassmorphic, holographic, metallic, and procedural materials</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('materials')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>See all ({SPLINE_MATERIAL_PRESETS.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SPLINE_MATERIAL_PRESETS.slice(0, 6).map((mat) => (
            <AssetCard
              key={mat.id}
              id={mat.id}
              name={mat.name}
              badge="PBR"
              badgeColor="bg-purple-500/20 text-purple-300 border-purple-500/30"
              thumbnail={
                <div
                  className="w-14 h-14 rounded-full shadow-xl border border-white/20 flex items-center justify-center"
                  style={{
                    background: mat.previewColor || `linear-gradient(135deg, ${mat.materialProps.color || '#a855f7'}, #1e1b4b)`,
                    boxShadow: mat.materialProps.emissiveIntensity ? `0 0 15px ${mat.materialProps.emissiveColor || mat.materialProps.color}` : undefined,
                  }}
                />
              }
              description={mat.category}
              onSelect={() => onApplyMaterial(mat)}
            />
          ))}
        </div>
      </section>

      {/* 8. Atmospheric Audio & Sound Effects */}
      <section className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
              <Music size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Atmospheric Audio & Sound Effects</h3>
              <p className="text-[10px] text-gray-400">UI click chimes, spatial ambiances, and sci-fi loops</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('audio')}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>See all ({SPLINE_SOUND_PRESETS.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SPLINE_SOUND_PRESETS.slice(0, 6).map((sound) => (
            <AssetCard
              key={sound.id}
              id={sound.id}
              name={sound.name}
              badge="SFX"
              badgeColor="bg-rose-500/20 text-rose-300 border-rose-500/30"
              thumbnail="🎵"
              description={sound.description || sound.category}
              isPlaying={playingSoundId === sound.id}
              onPlayToggle={() => onPlaySoundToggle(sound)}
              onSelect={() => onAddSound(sound)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
