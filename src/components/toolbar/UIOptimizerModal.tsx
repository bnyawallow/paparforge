import React, { useState, useEffect } from 'react';
import { 
  Monitor, Smartphone, Tablet, Glasses, Cpu, Gauge, Zap, CheckCircle2, 
  RotateCcw, Sliders, Maximize, ShieldCheck, Sparkles, Layers, RefreshCw,
  Eye, Check, Info, Box, Compass, Activity
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { GlassModal } from '../ui/HudComponents';
import { OptimizationProposalsScreen } from './OptimizationProposalsScreen';

interface DevicePreset {
  id: string;
  name: string;
  category: 'phone' | 'tablet' | 'desktop' | 'spatial';
  width: number;
  height: number;
  dpr: number;
  aspect: string;
  refreshRate: string;
  description: string;
}

const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: 'iphone_15_pro',
    name: 'iPhone 15 / 16 Pro',
    category: 'phone',
    width: 393,
    height: 852,
    dpr: 3.0,
    aspect: '19.5:9',
    refreshRate: '120Hz ProMotion',
    description: 'Dynamic Island, Super Retina XDR OLED'
  },
  {
    id: 'iphone_15_promax',
    name: 'iPhone 15 Pro Max',
    category: 'phone',
    width: 430,
    height: 932,
    dpr: 3.0,
    aspect: '19.5:9',
    refreshRate: '120Hz ProMotion',
    description: 'Max screen size, Super Retina OLED'
  },
  {
    id: 'samsung_s24_ultra',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'phone',
    width: 412,
    height: 915,
    dpr: 3.5,
    aspect: '20:9',
    refreshRate: '120Hz Dynamic LTPO',
    description: 'Dynamic AMOLED 2X, Quad HD+'
  },
  {
    id: 'pixel_8_pro',
    name: 'Google Pixel 8 / 9 Pro',
    category: 'phone',
    width: 412,
    height: 892,
    dpr: 2.625,
    aspect: '20:9',
    refreshRate: '120Hz Actua OLED',
    description: 'High-contrast spatial color matrix'
  },
  {
    id: 'compact_phone',
    name: 'iPhone SE / Compact Phone',
    category: 'phone',
    width: 375,
    height: 667,
    dpr: 2.0,
    aspect: '16:9',
    refreshRate: '60Hz LCD',
    description: 'Classic compact 16:9 touch layout'
  },
  {
    id: 'ipad_pro_129',
    name: 'iPad Pro 12.9" / 13"',
    category: 'tablet',
    width: 1024,
    height: 1366,
    dpr: 2.0,
    aspect: '4:3',
    refreshRate: '120Hz Liquid Retina XDR',
    description: 'Large spatial AR canvas & inspector'
  },
  {
    id: 'ipad_air',
    name: 'iPad Air 10.9"',
    category: 'tablet',
    width: 820,
    height: 1180,
    dpr: 2.0,
    aspect: '4.3:3',
    refreshRate: '60Hz Liquid Retina',
    description: 'Balanced tablet aspect viewport'
  },
  {
    id: 'desktop_fhd',
    name: 'Desktop Full HD (1080p)',
    category: 'desktop',
    width: 1920,
    height: 1080,
    dpr: 1.0,
    aspect: '16:9',
    refreshRate: '60Hz - 144Hz',
    description: 'Standard web publishing baseline'
  },
  {
    id: 'desktop_2k',
    name: 'Desktop Quad HD (1440p / 2K)',
    category: 'desktop',
    width: 2560,
    height: 1440,
    dpr: 1.25,
    aspect: '16:9',
    refreshRate: '144Hz+',
    description: 'HiDPI ultra-sharp desktop display'
  },
  {
    id: 'desktop_4k',
    name: 'Desktop 4K UHD (2160p)',
    category: 'desktop',
    width: 3840,
    height: 2160,
    dpr: 1.5,
    aspect: '16:9',
    refreshRate: '60Hz - 120Hz',
    description: 'Extreme resolution spatial rendering'
  },
  {
    id: 'vision_pro',
    name: 'Apple Vision Pro',
    category: 'spatial',
    width: 2000,
    height: 2040,
    dpr: 2.0,
    aspect: '1:1.02',
    refreshRate: '90Hz / 100Hz',
    description: 'Foveated 4K Micro-OLED spatial headset'
  },
  {
    id: 'quest_3',
    name: 'Meta Quest 3 / Pro',
    category: 'spatial',
    width: 2064,
    height: 2208,
    dpr: 1.5,
    aspect: '1:1.07',
    refreshRate: '90Hz / 120Hz',
    description: 'High-res color passthrough WebXR AR'
  }
];

interface UIOptimizerModalProps {
  onClose: () => void;
}

export function UIOptimizerModal({ onClose }: UIOptimizerModalProps) {
  const {
    targetDprScale,
    setTargetDprScale,
    shadowQualityPreset,
    setShadowQualityPreset,
    uiDensityMode,
    setUiDensityMode,
    deviceSimulationPreset,
    setDeviceSimulationPreset,
    objects,
    addToast
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'proposals' | 'resolution' | 'presets' | 'performance'>('proposals');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'phone' | 'tablet' | 'desktop' | 'spatial'>('all');

  // Live viewport metrics
  const [viewportMetrics, setViewportMetrics] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    orientation: window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait',
    colorDepth: window.screen?.colorDepth || 24,
    touchPoints: navigator.maxTouchPoints || 0
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportMetrics({
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio || 1,
        orientation: window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait',
        colorDepth: window.screen?.colorDepth || 24,
        touchPoints: navigator.maxTouchPoints || 0
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Compute aspect ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(viewportMetrics.width), Math.round(viewportMetrics.height));
  const aspectRatioText = divisor > 0 
    ? `${(viewportMetrics.width / divisor).toFixed(1)}:${(viewportMetrics.height / divisor).toFixed(1)}` 
    : `${(viewportMetrics.width / viewportMetrics.height).toFixed(2)}:1`;

  const totalObjectsCount = Object.keys(objects).length;
  const estimatedDrawCalls = Math.max(1, totalObjectsCount * 2);
  const estimatedTriangles = totalObjectsCount * 450;

  const handleAutoOptimize = () => {
    const isMobileDevice = viewportMetrics.width < 768 || viewportMetrics.touchPoints > 0;
    const isHighDpi = viewportMetrics.dpr > 2.0;

    if (isMobileDevice) {
      setTargetDprScale(isHighDpi ? 1.5 : 'auto');
      setShadowQualityPreset('low');
      setUiDensityMode('touch');
      addToast('⚡ Auto-Optimized for Mobile Touchscreen Viewport!');
    } else if (viewportMetrics.width >= 2560) {
      setTargetDprScale(1.5);
      setShadowQualityPreset('high');
      setUiDensityMode('compact');
      addToast('⚡ Auto-Optimized for Ultra HD / 4K Desktop Viewport!');
    } else {
      setTargetDprScale('auto');
      setShadowQualityPreset('med');
      setUiDensityMode('balanced');
      addToast('⚡ Auto-Optimized for Standard Balanced Desktop Viewport!');
    }
  };

  const filteredPresets = DEVICE_PRESETS.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <GlassModal
      isOpen={true}
      onClose={onClose}
      title="Spine3D Performance & Optimisation Studio"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6 text-sm">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#26262B] gap-2 pb-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('proposals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'proposals'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-white border border-blue-500/40 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={15} className="text-amber-400 animate-pulse" />
            <span>⚡ Optimisation Proposals</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/30">
              Spine3D
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resolution')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resolution'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Monitor size={15} />
            <span>Viewport & Resolution</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone size={15} />
            <span>Device Presets ({DEVICE_PRESETS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'performance'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap size={15} />
            <span>Rendering & UI Tuning</span>
          </button>
        </div>

        {/* Tab 0: Optimization Proposals Screen inspired by Spine3D */}
        {activeTab === 'proposals' && (
          <OptimizationProposalsScreen onClose={onClose} />
        )}

        {/* Tab 1: Viewport & Resolution Analysis */}
        {activeTab === 'resolution' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* CSS Dimensions */}
              <div className="bg-[#161618] border border-[#26262B] rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">CSS Viewport</span>
                <div className="mt-2">
                  <span className="text-xl font-extrabold text-white tracking-tight">
                    {viewportMetrics.width} × {viewportMetrics.height}
                  </span>
                  <span className="block text-[10px] text-gray-500 mt-0.5">Logical screen pixels</span>
                </div>
              </div>

              {/* Render Buffer / Physical */}
              <div className="bg-[#161618] border border-[#26262B] rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Physical Render Buffer</span>
                <div className="mt-2">
                  <span className="text-xl font-extrabold text-cyan-400 tracking-tight">
                    {Math.round(viewportMetrics.width * viewportMetrics.dpr)} × {Math.round(viewportMetrics.height * viewportMetrics.dpr)}
                  </span>
                  <span className="block text-[10px] text-gray-500 mt-0.5">Physical GPU raster pixels</span>
                </div>
              </div>

              {/* Pixel Ratio DPR */}
              <div className="bg-[#161618] border border-[#26262B] rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Device Pixel Ratio</span>
                <div className="mt-2">
                  <span className="text-xl font-extrabold text-purple-400 tracking-tight">
                    {viewportMetrics.dpr.toFixed(2)}x
                  </span>
                  <span className="block text-[10px] text-gray-500 mt-0.5">Hardware DPR scale</span>
                </div>
              </div>

              {/* Orientation & Aspect Ratio */}
              <div className="bg-[#161618] border border-[#26262B] rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Orientation & Aspect</span>
                <div className="mt-2">
                  <span className="text-lg font-extrabold text-amber-400 tracking-tight truncate block">
                    {viewportMetrics.orientation}
                  </span>
                  <span className="block text-[10px] text-gray-400 mt-0.5 font-mono">
                    Ratio: {aspectRatioText}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Viewpoint Orientation Guide */}
            <div className="bg-[#161618] border border-[#26262B] rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <Compass size={15} className="text-blue-400" />
                <span>Orientation & Viewpoint Layout Diagnostics</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#111114] border border-[#2A2A30] rounded-lg">
                  <span className="text-gray-400 font-bold block mb-1">Active View Mode</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${viewportMetrics.width < 768 ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    <span className="font-extrabold text-white">
                      {viewportMetrics.width < 768 
                        ? (viewportMetrics.orientation === 'Landscape' ? 'Mobile Landscape (Side Sheets)' : 'Mobile Portrait (Bottom Sheet)')
                        : 'Desktop Workstation (Fixed Multi-Panel)'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#111114] border border-[#2A2A30] rounded-lg">
                  <span className="text-gray-400 font-bold block mb-1">Interaction Model</span>
                  <span className="font-bold text-gray-200">
                    {viewportMetrics.touchPoints > 0 ? `Touch Enabled (${viewportMetrics.touchPoints} points)` : 'Mouse & Keyboard Precision'}
                  </span>
                </div>

                <div className="p-3 bg-[#111114] border border-[#2A2A30] rounded-lg">
                  <span className="text-gray-400 font-bold block mb-1">Color Bit Depth</span>
                  <span className="font-bold text-emerald-400">
                    {viewportMetrics.colorDepth}-bit sRGB Wide Gamut
                  </span>
                </div>
              </div>
            </div>

            {/* Active Simulation preset banner if any */}
            {deviceSimulationPreset && (
              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone size={16} className="text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-white">
                      Active Device Simulation: {DEVICE_PRESETS.find(p => p.id === deviceSimulationPreset)?.name || deviceSimulationPreset}
                    </span>
                    <p className="text-[11px] text-purple-300">
                      Viewport bounds frame is currently guiding the 3D scene preview
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDeviceSimulationPreset(null);
                    addToast('Cleared device simulation preview');
                  }}
                  className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Clear Simulation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Device Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            {/* Category filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {(['all', 'phone', 'tablet', 'desktop', 'spatial'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-[#18181B] text-gray-400 hover:text-white border border-[#26262B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredPresets.map(preset => {
                const isCurrent = deviceSimulationPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setDeviceSimulationPreset(preset.id);
                      addToast(`Selected ${preset.name} simulation preset (${preset.width}×${preset.height})`);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                        : 'bg-[#161618] hover:bg-[#1A1A1D] border-[#26262B] hover:border-[#383840] text-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {preset.category === 'phone' && <Smartphone size={16} className="text-blue-400" />}
                        {preset.category === 'tablet' && <Tablet size={16} className="text-purple-400" />}
                        {preset.category === 'desktop' && <Monitor size={16} className="text-emerald-400" />}
                        {preset.category === 'spatial' && <Glasses size={16} className="text-amber-400" />}
                        <span className="font-extrabold text-sm text-white">{preset.name}</span>
                      </div>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white flex items-center gap-1">
                          <Check size={10} /> Active
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-1">{preset.description}</p>

                    <div className="mt-3 pt-2.5 border-t border-[#26262B] flex items-center justify-between text-[11px] font-mono text-gray-400">
                      <span>{preset.width} × {preset.height} px</span>
                      <span>DPR {preset.dpr}x</span>
                      <span className="text-purple-400 font-bold">{preset.aspect}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Performance & UI Optimization Tuning */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Dynamic DPR Scaling */}
            <div className="bg-[#161618] border border-[#26262B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Dynamic Pixel Ratio (DPR) Scaling</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Tune GPU raster resolution scale to balance crispness vs frame rate on mobile & high-DPI displays.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-1 bg-cyan-950/40 border border-cyan-500/30 rounded-lg">
                  {targetDprScale === 'auto' ? 'Auto (Hardware Native)' : `${targetDprScale}x Fixed`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {[
                  { value: 'auto', label: 'Auto Native', desc: 'Default DPR' },
                  { value: 0.75, label: '0.75x Scale', desc: 'Max FPS' },
                  { value: 1.0, label: '1.0x Scale', desc: 'Standard 1080p' },
                  { value: 1.5, label: '1.5x Scale', desc: 'Crisp Balanced' },
                  { value: 2.0, label: '2.0x Scale', desc: 'Ultra Sharp' }
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setTargetDprScale(opt.value as any);
                      addToast(`Target DPR scale set to ${opt.label}`);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      targetDprScale === opt.value
                        ? 'bg-cyan-600/30 border-cyan-400 text-white font-bold shadow-md'
                        : 'bg-[#111114] border-[#26262B] text-gray-400 hover:text-white hover:border-[#383840]'
                    }`}
                  >
                    <span className="block text-xs font-extrabold">{opt.label}</span>
                    <span className="block text-[10px] opacity-70 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shadow Quality Preset */}
            <div className="bg-[#161618] border border-[#26262B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">3D Shadow Map Quality</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Adjust shadow map depth resolution buffer for realistic contact shadows.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400 px-2.5 py-1 bg-purple-950/40 border border-purple-500/30 rounded-lg uppercase">
                  {shadowQualityPreset}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {[
                  { value: 'off', label: 'Off', desc: 'Highest FPS' },
                  { value: 'low', label: 'Low', desc: '512px map' },
                  { value: 'med', label: 'Med', desc: '1024px map' },
                  { value: 'high', label: 'High', desc: '2048px map' },
                  { value: 'ultra', label: 'Ultra', desc: '4096px map' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setShadowQualityPreset(opt.value as any);
                      addToast(`Shadow quality set to ${opt.label}`);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      shadowQualityPreset === opt.value
                        ? 'bg-purple-600/30 border-purple-400 text-white font-bold shadow-md'
                        : 'bg-[#111114] border-[#26262B] text-gray-400 hover:text-white hover:border-[#383840]'
                    }`}
                  >
                    <span className="block text-xs font-extrabold">{opt.label}</span>
                    <span className="block text-[10px] opacity-70 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* UI Density Mode */}
            <div className="bg-[#161618] border border-[#26262B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">UI Density & Touch Target Mode</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Adapt toolbars, inspector inputs, and navigation buttons for desktop mouse or mobile touchscreens.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-lg capitalize">
                  {uiDensityMode}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {[
                  { value: 'compact', label: 'Compact Mode', desc: 'Dense toolbars for multi-monitor desktop workstations' },
                  { value: 'balanced', label: 'Balanced Mode', desc: 'Standard comfortable spacing for laptops & tablets' },
                  { value: 'touch', label: 'Touch-Accessible Mode', desc: 'Enlarged 44px+ touch targets for smartphones & fingers' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setUiDensityMode(opt.value as any);
                      addToast(`UI Density mode set to ${opt.label}`);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      uiDensityMode === opt.value
                        ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold shadow-md'
                        : 'bg-[#111114] border-[#26262B] text-gray-400 hover:text-white hover:border-[#383840]'
                    }`}
                  >
                    <span className="block text-xs font-extrabold text-white">{opt.label}</span>
                    <span className="block text-[10px] opacity-75 mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostics Stats */}
            <div className="p-3.5 bg-[#111114] border border-[#26262B] rounded-xl flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Box size={14} className="text-blue-400" />
                <span>Scene Elements: <strong className="text-white">{totalObjectsCount}</strong></span>
              </div>
              <div>
                <span>Est. Draw Calls: <strong className="text-cyan-400">~{estimatedDrawCalls}</strong></span>
              </div>
              <div>
                <span>Est. Triangles: <strong className="text-purple-400">~{estimatedTriangles.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#26262B]">
          <div className="text-[11px] text-gray-500">
            papAR Forge UI Optimizer Pipeline • WebXR & GLTF Hardware Acceleration
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </GlassModal>
  );
}
