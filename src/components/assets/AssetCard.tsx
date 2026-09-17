import React, { useState } from 'react';
import { Plus, Play, Square, Star, Sparkles, Check, Info, ArrowUpRight } from 'lucide-react';

interface AssetCardProps {
  id: string;
  name: string;
  type?: string;
  category?: string;
  badge?: string;
  badgeColor?: string;
  thumbnail?: React.ReactNode | string;
  description?: string;
  metaText?: string;
  previewUrl?: string;
  isPlaying?: boolean;
  onPlayToggle?: () => void;
  onSelect: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
}

export function AssetCard({
  id,
  name,
  type = 'asset',
  category,
  badge,
  badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  thumbnail,
  description,
  metaText,
  isPlaying = false,
  onPlayToggle,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
  isDraggable = true,
  onDragStart,
  className = '',
}: AssetCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
      id={`asset-card-${id}`}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      className={`group relative bg-[#131317]/80 hover:bg-[#1A1A22] border border-white/10 hover:border-blue-500/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)] select-none ${className}`}
    >
      {/* Visual Thumbnail Area */}
      <div className="relative w-full aspect-square bg-gradient-to-b from-white/[0.04] to-black/30 flex items-center justify-center p-3 overflow-hidden">
        {/* Render Thumbnail */}
        {typeof thumbnail === 'string' ? (
          thumbnail.startsWith('http') || thumbnail.startsWith('data:') || thumbnail.startsWith('/') ? (
            <img
              src={thumbnail}
              alt={name}
              className="w-full h-full object-contain pointer-events-none transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector('.asset-fallback-text')) {
                  const fallback = document.createElement('span');
                  fallback.className = 'asset-fallback-text text-3xl font-bold text-white/80';
                  fallback.innerText = name.charAt(0);
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
              {thumbnail}
            </span>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            {thumbnail}
          </div>
        )}

        {/* Top-Left Type Badge */}
        {badge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm ${badgeColor}`}>
              {badge}
            </span>
          </div>
        )}

        {/* Top-Right Favorite / Action Buttons */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`p-1.5 rounded-lg backdrop-blur-md border transition-all ${
                isFavorite
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-black/60 text-white/60 hover:text-white border-white/10 hover:border-white/30'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={12} className={isFavorite ? 'fill-amber-400 text-amber-400' : ''} />
            </button>
          )}

          {/* Quick Add (+) Button */}
          <button
            onClick={handleAddClick}
            className={`p-1.5 rounded-lg backdrop-blur-md font-bold transition-all shadow-lg flex items-center justify-center ${
              justAdded
                ? 'bg-emerald-500 text-white scale-110'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 hover:scale-110'
            }`}
            title="Add directly to scene"
          >
            {justAdded ? <Check size={13} /> : <Plus size={13} />}
          </button>
        </div>

        {/* Audio Playback Overlay if Audio Item */}
        {onPlayToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayToggle();
            }}
            className={`absolute bottom-2.5 right-2.5 z-10 p-2 rounded-xl backdrop-blur-md border flex items-center gap-1.5 transition-all shadow-lg ${
              isPlaying
                ? 'bg-pink-600 text-white border-pink-400 shadow-pink-500/40 animate-pulse'
                : 'bg-black/70 hover:bg-pink-600/80 text-pink-300 hover:text-white border-pink-500/30'
            }`}
            title={isPlaying ? 'Stop audio preview' : 'Play audio preview'}
          >
            {isPlaying ? <Square size={13} className="fill-white" /> : <Play size={13} className="fill-pink-300 group-hover:fill-white" />}
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-2/3 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </button>
        )}
      </div>

      {/* Card Info Footer */}
      <div className="p-3 bg-[#131317]/95 border-t border-white/5 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-1.5">
          <h4 className="text-xs font-semibold text-white/90 group-hover:text-white truncate" title={name}>
            {name}
          </h4>
        </div>

        {description && (
          <p className="text-[10px] text-white/40 group-hover:text-white/60 line-clamp-1 leading-snug">
            {description}
          </p>
        )}

        {metaText && (
          <div className="flex items-center justify-between text-[9px] font-mono text-white/30 pt-1 border-t border-white/[0.04]">
            <span className="truncate">{metaText}</span>
            <ArrowUpRight size={10} className="text-white/30 group-hover:text-blue-400 shrink-0 transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
}
