import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { vehicleSoundEngine } from '../../lib/physics/vehicleSoundEngine';
import { 
  Gauge, 
  X, 
  RotateCcw, 
  Volume2, 
  Lightbulb, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Shield,
  Activity,
  Zap
} from 'lucide-react';

interface VehicleDrivingHUDProps {
  onControlInput?: (input: { steer: number; throttle: number; brake: boolean }) => void;
  onResetVehicle?: () => void;
  onToggleHeadlights?: () => void;
}

export const VehicleDrivingHUD: React.FC<VehicleDrivingHUDProps> = ({
  onControlInput,
  onResetVehicle,
  onToggleHeadlights
}) => {
  const isDrivingActive = useEditorStore(state => state.isDrivingActive);
  const activeDrivingVehicleId = useEditorStore(state => state.activeDrivingVehicleId);
  const setDrivingActive = useEditorStore(state => state.setDrivingActive);
  const telemetry = useEditorStore(state => state.vehicleDrivingTelemetry);
  const objects = useEditorStore(state => state.objects);

  const vehicleObj = activeDrivingVehicleId ? objects[activeDrivingVehicleId] : null;
  const vehicleName = vehicleObj?.name || '3D Vehicle';

  // Active touch inputs
  const [touchSteer, setTouchSteer] = useState(0);
  const [touchThrottle, setTouchThrottle] = useState(0);
  const [touchBrake, setTouchBrake] = useState(false);
  const isHornActiveRef = useRef(false);

  // Synchronize touch inputs with parent viewport loop
  useEffect(() => {
    if (onControlInput) {
      onControlInput({
        steer: touchSteer,
        throttle: touchThrottle,
        brake: touchBrake
      });
    }
  }, [touchSteer, touchThrottle, touchBrake, onControlInput]);

  const handleHornDown = useCallback(() => {
    isHornActiveRef.current = true;
    vehicleSoundEngine.startHorn();
  }, []);

  const handleHornUp = useCallback(() => {
    isHornActiveRef.current = false;
    vehicleSoundEngine.stopHorn();
  }, []);

  if (!isDrivingActive) return null;

  // Convert internal speed to display km/h (speed * 7.5)
  const displayKmh = Math.abs(Math.round(telemetry.speed * 7.5));
  const maxDisplayKmh = 160;
  const speedPercent = Math.min(100, Math.round((displayKmh / maxDisplayKmh) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 select-none">
      {/* Top Bar: Vehicle Info, Collision Alert, and Exit Button */}
      <div className="flex items-center justify-between w-full">
        {/* Vehicle Badge & Collision Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <span className="text-sm">🚗</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wide text-white truncate max-w-[140px] sm:max-w-[200px]">
                {vehicleName}
              </span>
              <span className="text-[9px] font-mono text-cyan-400">PHYSICS RIG ACTIVE</span>
            </div>
          </div>

          {/* Real-time Collision Banner */}
          {telemetry.isColliding && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/90 border border-red-500/80 text-red-200 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <AlertTriangle size={14} className="text-red-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-100">
                  OBB COLLISION
                </span>
                {telemetry.obstacleName && (
                  <span className="text-[8px] font-mono text-red-300 truncate max-w-[120px]">
                    Hit: {telemetry.obstacleName}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions: Headlights, Horn, Reset, Exit */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Headlights */}
          <button
            onClick={() => onToggleHeadlights && onToggleHeadlights()}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-[10px] font-semibold transition-all cursor-pointer ${
              telemetry.headlights
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-black/60 text-gray-400 border-white/10 hover:text-white hover:bg-black/80'
            }`}
            title="Toggle Vehicle Headlights [L]"
          >
            <Lightbulb size={13} className={telemetry.headlights ? 'fill-amber-400 text-amber-400' : ''} />
            <span className="hidden sm:inline">Lights</span>
          </button>

          {/* Horn */}
          <button
            onPointerDown={handleHornDown}
            onPointerUp={handleHornUp}
            onPointerLeave={handleHornUp}
            className="px-2.5 py-1.5 rounded-xl border bg-black/60 border-white/10 text-gray-300 hover:text-cyan-300 hover:border-cyan-500/40 active:bg-cyan-500/20 transition-all flex items-center gap-1 text-[10px] font-semibold cursor-pointer active:scale-95"
            title="Sound Vehicle Horn [H]"
          >
            <Volume2 size={13} />
            <span className="hidden sm:inline">Horn</span>
          </button>

          {/* Reset Position */}
          <button
            onClick={() => onResetVehicle && onResetVehicle()}
            className="p-1.5 rounded-xl border bg-black/60 border-white/10 text-gray-300 hover:text-white hover:bg-black/80 transition-all cursor-pointer"
            title="Reset Vehicle to Origin Position"
          >
            <RotateCcw size={14} />
          </button>

          {/* Exit Drive Mode */}
          <button
            onClick={() => setDrivingActive(false)}
            className="px-3 py-1.5 rounded-xl border bg-red-600/20 border-red-500/40 text-red-300 hover:bg-red-600/40 hover:text-white transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer"
            title="Exit Driving Mode [Esc]"
          >
            <X size={13} />
            <span>EXIT</span>
          </button>
        </div>
      </div>

      {/* Middle Center: Keyboard Guide Overlay (Fade after few seconds or desktop only) */}
      <div className="self-center hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 text-[10px] font-mono shadow-xl">
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[9px] border border-white/20">W / ↑</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[9px] border border-white/20">S / ↓</kbd>
          <span>Drive</span>
        </div>
        <div className="w-px h-3 bg-white/20" />
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[9px] border border-white/20">A / ←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[9px] border border-white/20">D / →</kbd>
          <span>Steer</span>
        </div>
        <div className="w-px h-3 bg-white/20" />
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-bold text-[9px] border border-white/20">Space</kbd>
          <span>Brake</span>
        </div>
        <div className="w-px h-3 bg-white/20" />
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[9px] border border-white/20">H</kbd>
          <span>Horn</span>
        </div>
        <div className="w-px h-3 bg-white/20" />
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[9px] border border-white/20">L</kbd>
          <span>Lights</span>
        </div>
      </div>

      {/* Bottom Area: Left Virtual Steering Touch D-Pad + Center Modern Digital Speedometer + Right Throttle/Brake Pedals */}
      <div className="flex items-end justify-between w-full">
        {/* Left Side: Virtual Steering D-Pad (Touch / Mobile Friendly) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 shadow-2xl">
            {/* Steer Left */}
            <button
              onPointerDown={() => setTouchSteer(1)}
              onPointerUp={() => setTouchSteer(0)}
              onPointerLeave={() => setTouchSteer(0)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg transition-all cursor-pointer select-none active:scale-90 ${
                touchSteer > 0 
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#06b6d4]' 
                  : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
              }`}
            >
              <ArrowLeft size={22} />
            </button>

            {/* Steer Right */}
            <button
              onPointerDown={() => setTouchSteer(-1)}
              onPointerUp={() => setTouchSteer(0)}
              onPointerLeave={() => setTouchSteer(0)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg transition-all cursor-pointer select-none active:scale-90 ${
                touchSteer < 0 
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#06b6d4]' 
                  : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
              }`}
            >
              <ArrowRight size={22} />
            </button>
          </div>
        </div>

        {/* Center: Cyberpunk / Luxury Digital Speedometer Cluster */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="relative flex flex-col items-center justify-center px-6 py-3 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] min-w-[170px]">
            {/* Speed Dial Radial Arc Gauge */}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                {displayKmh}
              </span>
              <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-widest">
                KM/H
              </span>
            </div>

            {/* Speedometer Progress Gauge Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5 relative">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 transition-all duration-75 rounded-full"
                style={{ width: `${Math.max(4, speedPercent)}%` }}
              />
            </div>

            {/* Transmission Gear Indicators (P - R - N - D) */}
            <div className="flex items-center justify-center gap-3 mt-2 text-[11px] font-black font-mono">
              <span className={`transition-colors ${telemetry.gear === 'P' ? 'text-amber-400 drop-shadow-[0_0_8px_#f59e0b]' : 'text-gray-600'}`}>P</span>
              <span className={`transition-colors ${telemetry.gear === 'R' ? 'text-red-400 drop-shadow-[0_0_8px_#ef4444]' : 'text-gray-600'}`}>R</span>
              <span className={`transition-colors ${telemetry.gear === 'N' ? 'text-yellow-400 drop-shadow-[0_0_8px_#eab308]' : 'text-gray-600'}`}>N</span>
              <span className={`transition-colors ${telemetry.gear === 'D' ? 'text-emerald-400 drop-shadow-[0_0_8px_#10b981]' : 'text-gray-600'}`}>D</span>
            </div>
          </div>
        </div>

        {/* Right Side: Throttle & Brake Pedals (Touch / Mobile Friendly) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Handbrake / Reverse / Gas Container */}
          <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 shadow-2xl">
            {/* Brake / Reverse Button */}
            <button
              onPointerDown={() => {
                setTouchThrottle(-1);
                setTouchBrake(true);
              }}
              onPointerUp={() => {
                setTouchThrottle(0);
                setTouchBrake(false);
              }}
              onPointerLeave={() => {
                setTouchThrottle(0);
                setTouchBrake(false);
              }}
              className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center border font-bold text-xs transition-all cursor-pointer select-none active:scale-90 ${
                touchThrottle < 0 || touchBrake
                  ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_#ef4444]' 
                  : 'bg-red-950/40 text-red-300 border-red-500/20 hover:bg-red-900/40'
              }`}
            >
              <ArrowDown size={18} />
              <span className="text-[8px] font-black uppercase mt-0.5">BRAKE</span>
            </button>

            {/* Throttle / Accelerate Button */}
            <button
              onPointerDown={() => setTouchThrottle(1)}
              onPointerUp={() => setTouchThrottle(0)}
              onPointerLeave={() => setTouchThrottle(0)}
              className={`w-14 h-16 rounded-xl flex flex-col items-center justify-center border font-black text-xs transition-all cursor-pointer select-none active:scale-90 ${
                touchThrottle > 0 
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_#10b981]' 
                  : 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50'
              }`}
            >
              <ArrowUp size={22} />
              <span className="text-[9px] font-black uppercase mt-0.5 tracking-wider">GAS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
