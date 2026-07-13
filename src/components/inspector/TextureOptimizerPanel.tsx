import React, { useState, useEffect } from 'react';
import { SceneObject } from '../../types';
import { getImageInfo, downsampleTexture, ImageInfo } from '../../lib/textureOptimizer';
import { Cpu, Image as ImageIcon, Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

interface TextureOptimizerPanelProps {
  obj: SceneObject;
  handlePropertyChange: (key: string, value: any) => void;
}

interface TextureInfo extends ImageInfo {
  src?: string;
}

interface TextureChannel {
  key: string;
  label: string;
}

const TEXTURE_CHANNELS: TextureChannel[] = [
  { key: 'textureUrl', label: 'Base Texture Map' },
  { key: 'normalMapUrl', label: 'Normal Surface Bump' },
  { key: 'roughnessMapUrl', label: 'Roughness Guide' },
  { key: 'metalnessMapUrl', label: 'Metalness Guide' },
  { key: 'displacementMapUrl', label: 'Height Displacement' }
];

export function TextureOptimizerPanel({ obj, handlePropertyChange }: TextureOptimizerPanelProps) {
  const { addToast } = useEditorStore();
  const [textureStats, setTextureStats] = useState<Record<string, { info: TextureInfo | null; error: string | null; loading: boolean }>>({});
  const [optimizing, setOptimizing] = useState<Record<string, boolean>>({});

  // Detect active textures
  const activeTextures = TEXTURE_CHANNELS.filter(channel => obj.properties && obj.properties[channel.key]);

  // Load stats for active textures
  useEffect(() => {
    activeTextures.forEach(channel => {
      const url = obj.properties[channel.key];
      if (!url) return;

      // If we already have stats for this specific URL, don't reload
      if (textureStats[channel.key] && textureStats[channel.key].info?.src === url) {
        return;
      }

      setTextureStats(prev => ({
        ...prev,
        [channel.key]: { info: null, error: null, loading: true }
      }));

      getImageInfo(url)
        .then(info => {
          setTextureStats(prev => ({
            ...prev,
            [channel.key]: { info: { ...info, src: url }, error: null, loading: false }
          }));
        })
        .catch(err => {
          console.warn(`Failed to fetch texture stats for ${channel.label}:`, err);
          setTextureStats(prev => ({
            ...prev,
            [channel.key]: { info: null, error: "Unable to parse dimensions", loading: false }
          }));
        });
    });
  }, [obj.properties, activeTextures.length]);

  const handleOptimize = async (channelKey: string, channelLabel: string, targetSize: number) => {
    const url = obj.properties[channelKey];
    if (!url) return;

    setOptimizing(prev => ({ ...prev, [channelKey]: true }));

    try {
      const result = await downsampleTexture(url, targetSize);
      
      // Update property in editor state
      handlePropertyChange(channelKey, result.url);
      
      // Update local stats state directly
      setTextureStats(prev => ({
        ...prev,
        [channelKey]: {
          info: {
            width: result.width,
            height: result.height,
            aspectRatio: result.width / result.height,
            src: result.url
          },
          error: null,
          loading: false
        }
      }));

      addToast(`Optimized ${channelLabel} down to ${result.width}x${result.height}!`);
    } catch (err: any) {
      console.error(err);
      setTextureStats(prev => ({
        ...prev,
        [channelKey]: {
          ...prev[channelKey],
          error: err.message || "Compression failed",
          loading: false
        }
      }));
      addToast(`Failed to optimize ${channelLabel}: CORS or format error`);
    } finally {
      setOptimizing(prev => ({ ...prev, [channelKey]: false }));
    }
  };

  if (activeTextures.length === 0) {
    return (
      <div className="bg-[#1A1A1A]/20 border border-dashed border-[#222] p-4 rounded-xl text-center">
        <ImageIcon size={16} className="text-gray-500 mx-auto mb-1.5" />
        <span className="text-[10px] font-semibold text-gray-400 block">No Active Texture Maps</span>
        <span className="text-[8px] text-gray-500 leading-normal block max-w-[180px] mx-auto mt-1">
          Assign an image texture map in the slots above to unlock performance size optimization controls.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A]/30 border border-[#222] rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center gap-1.5 border-b border-black/20 pb-2">
        <Cpu size={12} className="text-blue-400" />
        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">Texture Size Optimizer</span>
        <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full font-bold uppercase tracking-wider ml-auto">Mobile AR Guard</span>
      </div>

      <p className="text-[8px] text-gray-500 leading-normal">
        AR models running on mobile safari/chrome crash if textures exceed 1024px. Downsample heavy textures to 1024px or 512px locally to guarantee 60fps.
      </p>

      <div className="flex flex-col gap-3">
        {activeTextures.map(channel => {
          const url = obj.properties[channel.key];
          const stats = textureStats[channel.key];
          const isCurrentOptimizing = optimizing[channel.key];
          
          const info = stats?.info;
          const isLarge = info ? (info.width > 1024 || info.height > 1024) : false;
          const isOptimized = info ? (info.width <= 1024) : false;

          return (
            <div key={channel.key} className="bg-black/25 border border-[#222] rounded-lg p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-300 font-mono">{channel.label}</span>
                {stats?.loading ? (
                  <RefreshCw size={10} className="text-gray-500 animate-spin" />
                ) : isCurrentOptimizing ? (
                  <span className="text-[8px] text-blue-400 font-bold animate-pulse font-mono">Resizing...</span>
                ) : info ? (
                  isLarge ? (
                    <span className="text-[8px] px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/10 rounded-full font-bold uppercase flex items-center gap-1">
                      <AlertTriangle size={8} /> Heavy
                    </span>
                  ) : (
                    <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-full font-bold uppercase flex items-center gap-1">
                      <CheckCircle size={8} /> Optimized
                    </span>
                  )
                ) : null}
              </div>

              <div className="flex items-center gap-3 bg-black/15 p-1.5 rounded border border-white/5">
                <div className="w-10 h-10 rounded overflow-hidden bg-[#222] border border-[#333] shrink-0 relative flex items-center justify-center">
                  {url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http') ? (
                    <img src={url} alt={channel.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon size={14} className="text-[#444]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-white font-mono leading-none">
                    {stats?.loading ? (
                      <span className="text-gray-500">Measuring...</span>
                    ) : info ? (
                      `${info.width} × ${info.height} px`
                    ) : (
                      <span className="text-gray-500">Auto-resolved</span>
                    )}
                  </div>
                  <div className="text-[8px] text-gray-500 font-mono truncate mt-1">
                    {url.slice(0, 45)}...
                  </div>
                </div>
              </div>

              {stats?.error && (
                <div className="bg-red-500/5 border border-red-500/10 p-2 rounded text-[8px] text-red-400 leading-normal flex gap-1.5">
                  <AlertTriangle size={10} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{stats.error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  disabled={isCurrentOptimizing || stats?.loading}
                  onClick={() => handleOptimize(channel.key, channel.label, 1024)}
                  className="py-1 px-2 bg-[#1A1A1A] hover:bg-[#222] disabled:opacity-30 disabled:hover:bg-[#1A1A1A] border border-[#262626] rounded text-[8.5px] font-bold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Zap size={10} className="text-yellow-500" />
                  <span>Resize to 1024px</span>
                </button>
                <button
                  disabled={isCurrentOptimizing || stats?.loading}
                  onClick={() => handleOptimize(channel.key, channel.label, 512)}
                  className="py-1 px-2 bg-[#1A1A1A] hover:bg-[#222] disabled:opacity-30 disabled:hover:bg-[#1A1A1A] border border-[#262626] rounded text-[8.5px] font-bold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Cpu size={10} className="text-blue-400" />
                  <span>Resize to 512px</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
