import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Palette, 
  Pipette, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Wand2
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MaterialColorPickerProps {
  value: string;
  onChange: (hexColor: string) => void;
  label?: string;
  defaultExpanded?: boolean;
}

// ----------------------------------------------------
// Precise Color Conversion Utilities
// ----------------------------------------------------

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = (hex || '').replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  if (cleaned.length !== 6) return { r: 255, g: 255, b: 255 };
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return { r: 255, g: 255, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('').toLowerCase();
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta > 0.0001) {
    if (max === rNorm) {
      h = 60 * (((gNorm - bNorm) / delta) % 6);
    } else if (max === gNorm) {
      h = 60 * ((bNorm - rNorm) / delta + 2);
    } else {
      h = 60 * ((rNorm - gNorm) / delta + 4);
    }
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;
  return { h: Math.round(h), s, v };
}

export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const hPrime = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));
  const m = v - c;

  let r1 = 0, g1 = 0, b1 = 0;
  if (hPrime >= 0 && hPrime < 1) {
    r1 = c; g1 = x; b1 = 0;
  } else if (hPrime >= 1 && hPrime < 2) {
    r1 = x; g1 = c; b1 = 0;
  } else if (hPrime >= 2 && hPrime < 3) {
    r1 = 0; g1 = c; b1 = x;
  } else if (hPrime >= 3 && hPrime < 4) {
    r1 = 0; g1 = x; b1 = c;
  } else if (hPrime >= 4 && hPrime < 5) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta > 0.0001) {
    if (max === rNorm) {
      h = 60 * (((gNorm - bNorm) / delta) % 6);
    } else if (max === gNorm) {
      h = 60 * ((bNorm - rNorm) / delta + 2);
    } else {
      h = 60 * ((rNorm - gNorm) / delta + 4);
    }
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const hPrime = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));
  const m = lNorm - c / 2;

  let r1 = 0, g1 = 0, b1 = 0;
  if (hPrime >= 0 && hPrime < 1) {
    r1 = c; g1 = x; b1 = 0;
  } else if (hPrime >= 1 && hPrime < 2) {
    r1 = x; g1 = c; b1 = 0;
  } else if (hPrime >= 2 && hPrime < 3) {
    r1 = 0; g1 = c; b1 = x;
  } else if (hPrime >= 3 && hPrime < 4) {
    r1 = 0; g1 = x; b1 = c;
  } else if (hPrime >= 4 && hPrime < 5) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

// Curated PBR & Spatial Palettes
const PBR_PALETTES = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Matte Titanium', hex: '#cbd5e1' },
  { name: 'Gunmetal Gray', hex: '#334155' },
  { name: 'Obsidian Black', hex: '#0f172a' },
  { name: 'Luxury Gold', hex: '#ffd700' },
  { name: 'Satin Brass', hex: '#d4af37' },
  { name: 'Polished Copper', hex: '#b87333' },
  { name: 'Cyber Cyan', hex: '#00f3ff' },
  { name: 'Neon Pink', hex: '#ff007f' },
  { name: 'Electric Purple', hex: '#8b5cf6' },
  { name: 'Emerald Glow', hex: '#10b981' },
  { name: 'Amber Flame', hex: '#f59e0b' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Royal Blue', hex: '#3b82f6' }
];

// Quick Hue Landmarks
const HUE_PRESETS = [
  { name: 'Red', hue: 0, hex: '#ff0000' },
  { name: 'Orange', hue: 30, hex: '#ff8000' },
  { name: 'Yellow', hue: 60, hex: '#ffff00' },
  { name: 'Green', hue: 120, hex: '#00ff00' },
  { name: 'Cyan', hue: 180, hex: '#00ffff' },
  { name: 'Blue', hue: 240, hex: '#0000ff' },
  { name: 'Purple', hue: 280, hex: '#a800ff' },
  { name: 'Magenta', hue: 320, hex: '#ff00aa' }
];

export function MaterialColorPicker({
  value = '#ffffff',
  onChange,
  label = 'Base Color',
  defaultExpanded = false
}: MaterialColorPickerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [colorMode, setColorMode] = useState<'HEX' | 'RGB' | 'HSL' | 'HARMONY'>('HEX');
  const [copied, setCopied] = useState(false);
  
  // Safe hex representation
  const normalizedHex = (value && value.startsWith('#') ? value : `#${value || 'ffffff'}`).toLowerCase();
  
  // Internal HSV representation
  const [hsv, setHsv] = useState(() => {
    const rgb = hexToRgb(normalizedHex);
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
  });
  
  // Persistent hue memory angle so desaturating to 0 doesn't lose chosen hue
  const [currentHue, setCurrentHue] = useState<number>(() => {
    const rgb = hexToRgb(normalizedHex);
    const converted = rgbToHsv(rgb.r, rgb.g, rgb.b);
    return converted.h > 0 ? converted.h : 215; // default to blue if neutral
  });

  const [initialColor] = useState(normalizedHex);
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ar_forge_recent_colors');
      return saved ? JSON.parse(saved) : ['#ffffff', '#00f3ff', '#ffd700', '#ff007f', '#3b82f6'];
    } catch {
      return ['#ffffff', '#00f3ff', '#ffd700', '#ff007f', '#3b82f6'];
    }
  });

  // Track if current update is triggered internally by dragging to avoid feedback loop jitter
  const isInternalUpdateRef = useRef(false);

  // Synchronize when external value prop changes
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    const rgb = hexToRgb(normalizedHex);
    const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setHsv(newHsv);
    if (newHsv.s > 0.05) {
      setCurrentHue(newHsv.h);
    }
  }, [normalizedHex]);

  // Persist recent colors
  const saveRecentColor = useCallback((hex: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== hex.toLowerCase());
      const updated = [hex.toLowerCase(), ...filtered].slice(0, 12);
      try {
        localStorage.setItem('ar_forge_recent_colors', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Update helper
  const applyColor = (newHex: string, newHsv?: { h: number; s: number; v: number }) => {
    isInternalUpdateRef.current = true;
    if (newHsv) {
      setHsv(newHsv);
      if (newHsv.s > 0.05 || newHsv.h !== 0) {
        setCurrentHue(newHsv.h);
      }
    }
    onChange(newHex);
    saveRecentColor(newHex);
  };

  // ----------------------------------------------------
  // HUE HANDLER (Robust 0° to 360°)
  // ----------------------------------------------------
  const handleHueChange = (newHue: number) => {
    const clampedHue = Math.max(0, Math.min(360, Math.round(newHue))) % 360;
    setCurrentHue(clampedHue);

    // If color was neutral (white, black, gray with 0 saturation),
    // automatically activate visible saturation and brightness so the hue works instantly!
    let s = hsv.s;
    let v = hsv.v;
    if (s < 0.08) {
      s = 0.85; // Give vibrant saturation
    }
    if (v < 0.15) {
      v = 0.90; // Ensure visible brightness
    }

    const updatedHsv = { h: clampedHue, s, v };
    const rgb = hsvToRgb(clampedHue, s, v);
    const newHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    applyColor(newHex, updatedHsv);
  };

  // ----------------------------------------------------
  // SATURATION & BRIGHTNESS HANDLERS
  // ----------------------------------------------------
  const handleSaturationChange = (newSat: number) => {
    const s = Math.max(0, Math.min(1, newSat));
    let v = hsv.v;
    if (v < 0.15) v = 0.85; // brighten if black
    const updatedHsv = { h: currentHue, s, v };
    const rgb = hsvToRgb(currentHue, s, v);
    applyColor(rgbToHex(rgb.r, rgb.g, rgb.b), updatedHsv);
  };

  const handleBrightnessChange = (newVal: number) => {
    const v = Math.max(0, Math.min(1, newVal));
    const s = hsv.s;
    const updatedHsv = { h: currentHue, s, v };
    const rgb = hsvToRgb(currentHue, s, v);
    applyColor(rgbToHex(rgb.r, rgb.g, rgb.b), updatedHsv);
  };

  // ----------------------------------------------------
  // 2D Saturation / Value Canvas Drag
  // ----------------------------------------------------
  const spectrumRef = useRef<HTMLDivElement>(null);
  const isDraggingSpectrumRef = useRef(false);

  const updateSpectrumFromPointer = (clientX: number, clientY: number) => {
    if (!spectrumRef.current) return;
    const rect = spectrumRef.current.getBoundingClientRect();
    const satRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const valRatio = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));

    const updatedHsv = { h: currentHue, s: satRatio, v: valRatio };
    const rgb = hsvToRgb(currentHue, satRatio, valRatio);
    applyColor(rgbToHex(rgb.r, rgb.g, rgb.b), updatedHsv);
  };

  const onSpectrumPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingSpectrumRef.current = true;
    updateSpectrumFromPointer(e.clientX, e.clientY);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingSpectrumRef.current) return;
      updateSpectrumFromPointer(moveEvent.clientX, moveEvent.clientY);
    };

    const onPointerUp = () => {
      isDraggingSpectrumRef.current = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // ----------------------------------------------------
  // Eyedropper API Tool
  // ----------------------------------------------------
  const handleEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const hex = result.sRGBHex.toLowerCase();
          const rgb = hexToRgb(hex);
          const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
          applyColor(hex, newHsv);
        }
      } catch {
        // user canceled or unsupported
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(normalizedHex.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rgb = hexToRgb(normalizedHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Compute Color Harmonies based on currentHue
  const harmonies = useMemo(() => {
    const makeColor = (h: number, s: number, l: number) => {
      const rgbC = hslToRgb((h % 360 + 360) % 360, s, l);
      return rgbToHex(rgbC.r, rgbC.g, rgbC.b);
    };
    const curH = currentHue;
    const curS = Math.max(40, hsl.s);
    const curL = Math.max(30, Math.min(75, hsl.l));

    return [
      { name: 'Base', hex: normalizedHex },
      { name: 'Complementary', hex: makeColor(curH + 180, curS, curL) },
      { name: 'Analogous L', hex: makeColor(curH - 30, curS, curL) },
      { name: 'Analogous R', hex: makeColor(curH + 30, curS, curL) },
      { name: 'Triadic 1', hex: makeColor(curH + 120, curS, curL) },
      { name: 'Triadic 2', hex: makeColor(curH + 240, curS, curL) },
      { name: 'Tint (Light)', hex: makeColor(curH, Math.max(20, curS - 25), Math.min(92, curL + 25)) },
      { name: 'Shade (Dark)', hex: makeColor(curH, curS, Math.max(15, curL - 30)) }
    ];
  }, [currentHue, normalizedHex, hsl.s, hsl.l]);

  return (
    <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-[#111116]/90 border border-white/10 shadow-sm text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Palette size={13} className="text-blue-400" />
          <span className="text-[11px] font-bold text-gray-200 tracking-wide uppercase font-mono">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Eyedropper Button */}
          {typeof window !== 'undefined' && 'EyeDropper' in window && (
            <button
              onClick={handleEyedropper}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Sample color from screen"
            >
              <Pipette size={13} />
            </button>
          )}

          {/* Reset Color */}
          {normalizedHex !== initialColor && (
            <button
              onClick={() => {
                const initRgb = hexToRgb(initialColor);
                applyColor(initialColor, rgbToHsv(initRgb.r, initRgb.g, initRgb.b));
              }}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Reset to previous color"
            >
              <RotateCcw size={12} />
            </button>
          )}

          {/* Advanced Mode Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all cursor-pointer"
          >
            <SlidersHorizontal size={11} />
            <span>{isExpanded ? 'Simple' : 'Advanced'}</span>
            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>

      {/* Main Preview Swatch & Hex Controls */}
      <div className="flex items-center gap-2">
        {/* Color Preview Swatch with click-to-trigger native picker */}
        <div className="relative w-10 h-10 rounded-lg border border-white/20 overflow-hidden shadow-md shrink-0 group cursor-pointer">
          <div 
            className="w-full h-full"
            style={{ backgroundColor: normalizedHex }}
          />
          <input 
            type="color"
            value={normalizedHex}
            onChange={(e) => {
              const hex = e.target.value.toLowerCase();
              const cRgb = hexToRgb(hex);
              applyColor(hex, rgbToHsv(cRgb.r, cRgb.g, cRgb.b));
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Open native color picker"
          />
        </div>

        {/* Hex Input with Copy button */}
        <div className="flex-1 flex items-center bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 focus-within:border-blue-500 transition-colors">
          <span className="text-xs font-mono text-gray-500 select-none mr-1">#</span>
          <input 
            type="text"
            value={normalizedHex.replace('#', '').toUpperCase()}
            onChange={(e) => {
              const val = e.target.value.trim().replace('#', '');
              if (val.length <= 6 && /^[0-9a-fA-F]*$/.test(val)) {
                if (val.length === 6 || val.length === 3) {
                  const fullHex = `#${val}`;
                  const cRgb = hexToRgb(fullHex);
                  applyColor(fullHex, rgbToHsv(cRgb.r, cRgb.g, cRgb.b));
                }
              }
            }}
            className="bg-transparent text-xs font-mono text-white outline-none w-full uppercase"
            maxLength={6}
            placeholder="FFFFFF"
          />
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
            title="Copy HEX code"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>

        {/* Current Hue Angle Badge */}
        <div className="flex items-center px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-blue-400 shrink-0">
          <span>{currentHue}°</span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* ROBUST HUE SLIDER & STEPPER CONTROLS                */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
          <span className="flex items-center gap-1.5">
            <span 
              className="w-2 h-2 rounded-full border border-white/20 shadow-xs" 
              style={{ backgroundColor: `hsl(${currentHue}, 100%, 50%)` }} 
            />
            <span>Hue Angle</span>
          </span>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleHueChange((currentHue - 15 + 360) % 360)}
              className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[9px] text-gray-300 font-mono transition-colors"
              title="-15 degrees"
            >
              -15°
            </button>
            <span className="text-gray-300 font-bold min-w-[32px] text-center">{currentHue}°</span>
            <button
              onClick={() => handleHueChange((currentHue + 15) % 360)}
              className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[9px] text-gray-300 font-mono transition-colors"
              title="+15 degrees"
            >
              +15°
            </button>
          </div>
        </div>

        {/* Rainbow Hue Range Input */}
        <div className="relative w-full h-4 flex items-center">
          <input 
            type="range"
            min="0"
            max="359"
            step="1"
            value={currentHue}
            onChange={(e) => handleHueChange(parseInt(e.target.value, 10))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer outline-none shadow-inner border border-white/20"
            style={{
              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
            }}
          />
        </div>

        {/* Quick Hue Landmark Chips */}
        <div className="grid grid-cols-8 gap-1 pt-0.5">
          {HUE_PRESETS.map((p) => {
            const isSelected = Math.abs(currentHue - p.hue) < 18;
            return (
              <button
                key={p.name}
                onClick={() => handleHueChange(p.hue)}
                title={`${p.name} (${p.hue}°)`}
                className={cn(
                  "h-4 rounded border transition-all cursor-pointer",
                  isSelected 
                    ? "border-white scale-110 ring-1 ring-white/60 shadow-sm" 
                    : "border-black/30 hover:scale-105 opacity-80 hover:opacity-100"
                )}
                style={{ backgroundColor: p.hex }}
              />
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* ADVANCED ACCORDION: SPECTRUM, SLIDERS, HARMONIES     */}
      {/* ---------------------------------------------------- */}
      {isExpanded && (
        <div className="flex flex-col gap-3 pt-3 border-t border-white/10 mt-1 animate-in fade-in duration-200">
          {/* 1. Interactive 2D Saturation / Value Canvas */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span>Saturation & Brightness Canvas</span>
              <span>S: {Math.round(hsv.s * 100)}% | B: {Math.round(hsv.v * 100)}%</span>
            </div>

            <div
              ref={spectrumRef}
              onPointerDown={onSpectrumPointerDown}
              className="relative w-full h-32 rounded-lg cursor-crosshair touch-none overflow-hidden border border-white/15 shadow-inner"
              style={{
                backgroundColor: `hsl(${currentHue}, 100%, 50%)`
              }}
            >
              {/* Horizontal white gradient */}
              <div 
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, #ffffff, transparent)' }}
              />
              {/* Vertical black gradient */}
              <div 
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, #000000, transparent)' }}
              />

              {/* Reticle */}
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-[0_0_6px_rgba(0,0,0,0.9)] pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform"
                style={{
                  left: `${hsv.s * 100}%`,
                  top: `${(1 - hsv.v) * 100}%`,
                  backgroundColor: normalizedHex
                }}
              />
            </div>
          </div>

          {/* 2. Dedicated Saturation & Brightness Sliders */}
          <div className="flex flex-col gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
            {/* Saturation Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[9px] font-mono text-gray-400">
                <span>Saturation (Purity)</span>
                <span>{Math.round(hsv.s * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={hsv.s}
                onChange={(e) => handleSaturationChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none border border-white/10"
                style={{
                  background: `linear-gradient(to right, #808080, hsl(${currentHue}, 100%, 50%))`
                }}
              />
            </div>

            {/* Brightness / Value Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[9px] font-mono text-gray-400">
                <span>Brightness (Value)</span>
                <span>{Math.round(hsv.v * 100)}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={hsv.v}
                onChange={(e) => handleBrightnessChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none border border-white/10"
                style={{
                  background: `linear-gradient(to right, #000000, hsl(${currentHue}, ${Math.max(30, hsv.s * 100)}%, 50%))`
                }}
              />
            </div>
          </div>

          {/* 3. Sub-Mode Tabs (HEX / RGB / HSL / HARMONIES) */}
          <div className="flex flex-col gap-2 bg-black/30 p-2.5 rounded-lg border border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex gap-1">
                {(['HEX', 'RGB', 'HSL', 'HARMONY'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setColorMode(mode)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all cursor-pointer",
                      colorMode === mode
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    )}
                  >
                    {mode === 'HARMONY' ? 'Harmonies' : mode}
                  </button>
                ))}
              </div>
              <span className="text-[9px] font-mono text-gray-500">
                {colorMode === 'HARMONY' ? 'Spatial Match' : 'Precision'}
              </span>
            </div>

            {/* HARMONY COLOR SCHEMES */}
            {colorMode === 'HARMONY' && (
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="grid grid-cols-4 gap-1.5">
                  {harmonies.map(h => (
                    <button
                      key={h.name}
                      onClick={() => {
                        const rgbC = hexToRgb(h.hex);
                        applyColor(h.hex, rgbToHsv(rgbC.r, rgbC.g, rgbC.b));
                      }}
                      className="group flex flex-col items-center p-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-400/50 transition-all cursor-pointer"
                    >
                      <div 
                        className="w-full h-5 rounded border border-white/10 shadow-xs mb-1 group-hover:scale-105 transition-transform" 
                        style={{ backgroundColor: h.hex }}
                      />
                      <span className="text-[8px] font-mono text-gray-300 font-bold truncate max-w-full text-center">
                        {h.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RGB Channel Inputs */}
            {colorMode === 'RGB' && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: 'R', val: rgb.r, key: 'r' as const },
                  { label: 'G', val: rgb.g, key: 'g' as const },
                  { label: 'B', val: rgb.b, key: 'b' as const }
                ].map(({ label, val, key }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-mono text-gray-400 font-bold">{label}</span>
                    <input 
                      type="number"
                      min={0}
                      max={255}
                      value={val}
                      onChange={(e) => {
                        const parsed = Math.max(0, Math.min(255, parseInt(e.target.value, 10) || 0));
                        const newRgb = { ...rgb, [key]: parsed };
                        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                        applyColor(newHex, rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
                      }}
                      className="bg-black/60 text-xs font-mono text-white p-1 rounded border border-white/10 text-center outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* HSL Channel Inputs */}
            {colorMode === 'HSL' && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-gray-400 font-bold">H (0-360°)</span>
                  <input 
                    type="number"
                    min={0}
                    max={360}
                    value={hsl.h}
                    onChange={(e) => {
                      const h = Math.max(0, Math.min(360, parseInt(e.target.value, 10) || 0));
                      setCurrentHue(h);
                      const newRgb = hslToRgb(h, hsl.s, hsl.l);
                      applyColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b), rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
                    }}
                    className="bg-black/60 text-xs font-mono text-white p-1 rounded border border-white/10 text-center outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-gray-400 font-bold">S (0-100%)</span>
                  <input 
                    type="number"
                    min={0}
                    max={100}
                    value={hsl.s}
                    onChange={(e) => {
                      const s = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                      const newRgb = hslToRgb(hsl.h, s, hsl.l);
                      applyColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b), rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
                    }}
                    className="bg-black/60 text-xs font-mono text-white p-1 rounded border border-white/10 text-center outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-gray-400 font-bold">L (0-100%)</span>
                  <input 
                    type="number"
                    min={0}
                    max={100}
                    value={hsl.l}
                    onChange={(e) => {
                      const l = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                      const newRgb = hslToRgb(hsl.h, hsl.s, l);
                      applyColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b), rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
                    }}
                    className="bg-black/60 text-xs font-mono text-white p-1 rounded border border-white/10 text-center outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* HEX Channel Info */}
            {colorMode === 'HEX' && (
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1">
                <span>RGB({rgb.r}, {rgb.g}, {rgb.b})</span>
                <span>HSL({hsl.h}°, {hsl.s}%, {hsl.l}%)</span>
              </div>
            )}
          </div>

          {/* 4. Curated Spatial PBR Palettes */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1 font-bold uppercase">
              <Sparkles size={11} className="text-amber-400" />
              PBR Material Palettes
            </span>
            <div className="grid grid-cols-7 gap-1.5">
              {PBR_PALETTES.map(swatch => {
                const active = normalizedHex === swatch.hex.toLowerCase();
                return (
                  <button
                    key={swatch.name}
                    onClick={() => {
                      const cRgb = hexToRgb(swatch.hex);
                      applyColor(swatch.hex, rgbToHsv(cRgb.r, cRgb.g, cRgb.b));
                    }}
                    title={swatch.name}
                    className={cn(
                      "w-7 h-7 rounded-md border transition-transform hover:scale-110 relative group cursor-pointer shadow-xs",
                      active ? "border-blue-400 ring-2 ring-blue-500/50 scale-105" : "border-white/10 hover:border-white/40"
                    )}
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {active && (
                      <Check 
                        size={12} 
                        className={cn(
                          "absolute inset-0 m-auto", 
                          swatch.hex === '#ffffff' || swatch.hex === '#ffd700' || swatch.hex === '#00f3ff' || swatch.hex === '#cbd5e1'
                            ? "text-black" 
                            : "text-white"
                        )} 
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Recent Colors */}
          {recentColors.length > 0 && (
            <div className="flex flex-col gap-1 pt-1 border-t border-white/5">
              <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">Recent Swatches</span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {recentColors.map((hex, idx) => (
                  <button
                    key={`${hex}-${idx}`}
                    onClick={() => {
                      const cRgb = hexToRgb(hex);
                      applyColor(hex, rgbToHsv(cRgb.r, cRgb.g, cRgb.b));
                    }}
                    title={hex.toUpperCase()}
                    className="w-5 h-5 rounded border border-white/20 shrink-0 transition-transform hover:scale-110 shadow-sm cursor-pointer"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
