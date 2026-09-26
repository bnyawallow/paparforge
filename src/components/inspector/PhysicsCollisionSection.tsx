import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { SceneObject } from '../../types';
import { 
  DEFAULT_VEHICLE_CONFIG, 
  VEHICLE_PRESETS, 
  VehiclePhysicsConfig 
} from '../../lib/physics/collisionEngine';
import { 
  Shield, 
  Car, 
  Zap, 
  Sliders, 
  RotateCcw, 
  Maximize2, 
  Lightbulb, 
  Volume2, 
  Layers, 
  CheckCircle2, 
  Play, 
  AlertTriangle,
  Move,
  Activity
} from 'lucide-react';

interface PhysicsCollisionSectionProps {
  obj: SceneObject;
  onPropertyChange: (key: string, value: any) => void;
  onMultiplePropertiesChange: (updates: Record<string, any>) => void;
}

export const PhysicsCollisionSection: React.FC<PhysicsCollisionSectionProps> = ({
  obj,
  onPropertyChange,
  onMultiplePropertiesChange
}) => {
  const isDrivingActive = useEditorStore(state => state.isDrivingActive);
  const activeDrivingVehicleId = useEditorStore(state => state.activeDrivingVehicleId);
  const setDrivingActive = useEditorStore(state => state.setDrivingActive);
  const collisionDebuggerEnabled = useEditorStore(state => state.collisionDebuggerEnabled);
  const setCollisionDebuggerEnabled = useEditorStore(state => state.setCollisionDebuggerEnabled);

  const isVehicle = 
    obj.properties?.isDrivable || 
    obj.properties?.behavior === 'drive' ||
    (obj.tags && obj.tags.some(t => ['vehicle', 'car', 'truck', 'bike', 'motorcycle', 'plane', 'boat', 'rover'].includes(t.toLowerCase()))) ||
    /car|vehicle|truck|van|auto|bike|sedan|coupe|suv|rover|jeep|ferrari|porsche|tesla|police|ambulance/i.test(obj.name);

  const isDrivable = Boolean(obj.properties?.isDrivable || obj.properties?.behavior === 'drive');
  const isPhysicsEnabled = Boolean(obj.properties?.physicsEnabled || isDrivable);
  const isThisVehicleDriving = isDrivingActive && activeDrivingVehicleId === obj.id;

  // Active vehicle config values with safe fallbacks
  const vehicleConfig: VehiclePhysicsConfig = {
    ...DEFAULT_VEHICLE_CONFIG,
    maxSpeed: typeof obj.properties?.vehicleMaxSpeed === 'number' ? obj.properties.vehicleMaxSpeed : DEFAULT_VEHICLE_CONFIG.maxSpeed,
    acceleration: typeof obj.properties?.vehicleAcceleration === 'number' ? obj.properties.vehicleAcceleration : DEFAULT_VEHICLE_CONFIG.acceleration,
    brakePower: typeof obj.properties?.vehicleBrakePower === 'number' ? obj.properties.vehicleBrakePower : DEFAULT_VEHICLE_CONFIG.brakePower,
    turnSpeed: typeof obj.properties?.vehicleTurnSpeed === 'number' ? obj.properties.vehicleTurnSpeed : DEFAULT_VEHICLE_CONFIG.turnSpeed,
    friction: typeof obj.properties?.vehicleFriction === 'number' ? obj.properties.vehicleFriction : DEFAULT_VEHICLE_CONFIG.friction,
    driftFactor: typeof obj.properties?.vehicleDriftFactor === 'number' ? obj.properties.vehicleDriftFactor : DEFAULT_VEHICLE_CONFIG.driftFactor,
    mass: typeof obj.properties?.mass === 'number' ? obj.properties.mass : DEFAULT_VEHICLE_CONFIG.mass,
    restitution: typeof obj.properties?.restitution === 'number' ? obj.properties.restitution : DEFAULT_VEHICLE_CONFIG.restitution,
    headlights: obj.properties?.vehicleHeadlights !== false,
    engineSound: obj.properties?.vehicleEngineSound !== false,
    preventClipping: obj.properties?.preventClipping !== false,
    isObstacle: obj.properties?.isObstacle !== false,
    colliderPadding: obj.properties?.colliderPadding || DEFAULT_VEHICLE_CONFIG.colliderPadding,
    colliderOffset: obj.properties?.colliderOffset || DEFAULT_VEHICLE_CONFIG.colliderOffset,
    reverseSpeed: DEFAULT_VEHICLE_CONFIG.reverseSpeed
  };

  const applyPreset = (presetKey: string) => {
    const preset = VEHICLE_PRESETS[presetKey];
    if (!preset) return;

    onMultiplePropertiesChange({
      isDrivable: true,
      physicsEnabled: true,
      preventClipping: true,
      isObstacle: true,
      vehicleMaxSpeed: preset.maxSpeed ?? DEFAULT_VEHICLE_CONFIG.maxSpeed,
      vehicleAcceleration: preset.acceleration ?? DEFAULT_VEHICLE_CONFIG.acceleration,
      vehicleBrakePower: preset.brakePower ?? DEFAULT_VEHICLE_CONFIG.brakePower,
      vehicleTurnSpeed: preset.turnSpeed ?? DEFAULT_VEHICLE_CONFIG.turnSpeed,
      vehicleFriction: preset.friction ?? DEFAULT_VEHICLE_CONFIG.friction,
      vehicleDriftFactor: preset.driftFactor ?? DEFAULT_VEHICLE_CONFIG.driftFactor,
      mass: preset.mass ?? DEFAULT_VEHICLE_CONFIG.mass,
      restitution: preset.restitution ?? DEFAULT_VEHICLE_CONFIG.restitution,
      vehiclePreset: presetKey
    });
  };

  const handleAutoFitBoundingBox = () => {
    // Auto-calculates optimal bounding box dimensions based on scale
    const sx = Math.abs(obj.scale[0]);
    const sy = Math.abs(obj.scale[1]);
    const sz = Math.abs(obj.scale[2]);

    onMultiplePropertiesChange({
      customBoundsWidth: Number((sx * 1.2).toFixed(2)),
      customBoundsLength: Number((sy * 2.4).toFixed(2)),
      customBoundsHeight: Number((sz * 1.1).toFixed(2)),
      colliderPadding: [0.08, 0.08, 0.08],
      colliderOffset: [0, 0, 0]
    });
  };

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* 1. VEHICLE DRIVING CONTROLS & TEST DRIVE TRIGGER */}
      <div className="flex flex-col gap-3 p-3 rounded-xl bg-[#111116] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Car size={16} />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-wide">
                Vehicle Driving Rig
              </span>
              <span className="text-[9px] text-gray-400">
                Interactive driving physics & AR controls
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDrivable}
              onChange={(e) => {
                const checked = e.target.checked;
                onMultiplePropertiesChange({
                  isDrivable: checked,
                  physicsEnabled: checked ? true : obj.properties?.physicsEnabled,
                  preventClipping: true,
                  isObstacle: true
                });
              }}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {/* DRIVE NOW BUTTON */}
        <button
          onClick={() => {
            if (!isDrivable) {
              onMultiplePropertiesChange({
                isDrivable: true,
                physicsEnabled: true,
                preventClipping: true,
                isObstacle: true
              });
            }
            setDrivingActive(!isThisVehicleDriving, obj.id);
          }}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
            isThisVehicleDriving
              ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/30'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold shadow-cyan-500/25'
          }`}
        >
          {isThisVehicleDriving ? (
            <>
              <Activity size={15} className="animate-pulse" />
              <span>EXIT DRIVING SIMULATOR</span>
            </>
          ) : (
            <>
              <Play size={15} className="fill-black" />
              <span>TEST DRIVE IN VIEWPORT</span>
            </>
          )}
        </button>

        {isDrivable && (
          <>
            {/* Vehicle Presets */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Vehicle Physics Presets
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(VEHICLE_PRESETS).map(([key, preset]) => {
                  const isSelected = obj.properties?.vehiclePreset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => applyPreset(key)}
                      className={`p-1.5 rounded-lg border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-[#181820] border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20'
                      }`}
                      title={preset.description}
                    >
                      <span className="text-sm leading-none">{preset.icon}</span>
                      <span className="text-[9px] font-bold truncate">{preset.label.split('/')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Dynamics Sliders */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Max Speed */}
              <div className="flex flex-col gap-1 bg-[#181820] p-2 rounded-lg border border-white/5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Top Speed</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {Math.round(vehicleConfig.maxSpeed * 7.5)} km/h
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="35"
                  step="1"
                  value={vehicleConfig.maxSpeed}
                  onChange={(e) => onPropertyChange('vehicleMaxSpeed', parseFloat(e.target.value))}
                  className="accent-cyan-400 w-full h-1 cursor-pointer"
                />
              </div>

              {/* Acceleration */}
              <div className="flex flex-col gap-1 bg-[#181820] p-2 rounded-lg border border-white/5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Acceleration</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {vehicleConfig.acceleration} m/s²
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="45"
                  step="1"
                  value={vehicleConfig.acceleration}
                  onChange={(e) => onPropertyChange('vehicleAcceleration', parseFloat(e.target.value))}
                  className="accent-emerald-400 w-full h-1 cursor-pointer"
                />
              </div>

              {/* Turn Sensitivity */}
              <div className="flex flex-col gap-1 bg-[#181820] p-2 rounded-lg border border-white/5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Steering Rate</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {vehicleConfig.turnSpeed.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.2"
                  value={vehicleConfig.turnSpeed}
                  onChange={(e) => onPropertyChange('vehicleTurnSpeed', parseFloat(e.target.value))}
                  className="accent-amber-400 w-full h-1 cursor-pointer"
                />
              </div>

              {/* Brake Power */}
              <div className="flex flex-col gap-1 bg-[#181820] p-2 rounded-lg border border-white/5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Braking Force</span>
                  <span className="text-red-400 font-mono font-bold">
                    {vehicleConfig.brakePower}
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={vehicleConfig.brakePower}
                  onChange={(e) => onPropertyChange('vehicleBrakePower', parseFloat(e.target.value))}
                  className="accent-red-400 w-full h-1 cursor-pointer"
                />
              </div>
            </div>

            {/* Vehicle Extras Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#181820] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vehicleConfig.headlights}
                  onChange={(e) => onPropertyChange('vehicleHeadlights', e.target.checked)}
                  className="accent-cyan-500 w-3.5 h-3.5 rounded"
                />
                <span className="text-[10px] text-gray-300 font-medium flex items-center gap-1">
                  <Lightbulb size={11} className={vehicleConfig.headlights ? 'text-amber-400' : 'text-gray-500'} />
                  Headlights Beam
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#181820] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vehicleConfig.engineSound}
                  onChange={(e) => onPropertyChange('vehicleEngineSound', e.target.checked)}
                  className="accent-cyan-500 w-3.5 h-3.5 rounded"
                />
                <span className="text-[10px] text-gray-300 font-medium flex items-center gap-1">
                  <Volume2 size={11} className={vehicleConfig.engineSound ? 'text-pink-400' : 'text-gray-500'} />
                  Engine RPM Audio
                </span>
              </label>
            </div>
          </>
        )}
      </div>

      {/* 2. PHYSICS & BOUNDING BOX COLLISION SETTINGS */}
      <div className="flex flex-col gap-3 p-3 rounded-xl bg-[#111116] border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/40">
              <Shield size={16} />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-wide">
                Bounding Box & Colliders
              </span>
              <span className="text-[9px] text-gray-400">
                Prevents passing through AR obstacles
              </span>
            </div>
          </div>

          <button
            onClick={() => setCollisionDebuggerEnabled(!collisionDebuggerEnabled)}
            className={`px-2 py-1 rounded-lg border text-[9px] font-bold transition-all cursor-pointer ${
              collisionDebuggerEnabled
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
            title="Toggle 3D Bounding Box Visualizer"
          >
            {collisionDebuggerEnabled ? 'Debug Bounds: ON' : 'Show Bounds'}
          </button>
        </div>

        {/* Prevent Clipping & Solid Obstacle Toggles */}
        <div className="flex flex-col gap-2 bg-[#181820] p-2.5 rounded-xl border border-white/5">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold text-gray-200">
                Solid Barrier / Impassable Obstacle
              </span>
              <span className="text-[8px] text-gray-400">
                Vehicles and physics objects collide and bounce off this object
              </span>
            </div>
            <input
              type="checkbox"
              checked={vehicleConfig.isObstacle}
              onChange={(e) => onPropertyChange('isObstacle', e.target.checked)}
              className="accent-orange-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-white/5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold text-gray-200">
                Prevent Vehicle Penetration (Anti-Clipping)
              </span>
              <span className="text-[8px] text-gray-400">
                Strict bounding box separation resolves contact instantly
              </span>
            </div>
            <input
              type="checkbox"
              checked={vehicleConfig.preventClipping}
              onChange={(e) => onPropertyChange('preventClipping', e.target.checked)}
              className="accent-orange-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Auto-Fit Bounding Box Button */}
        <button
          onClick={handleAutoFitBoundingBox}
          className="w-full py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Maximize2 size={12} className="text-orange-400" />
          <span>Auto-Fit Bounding Box to 3D Mesh</span>
        </button>

        {/* Bounding Box Dimensions & Custom Padding */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Collider Dimensions & Padding (X, Y, Z)
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="flex flex-col gap-0.5 bg-[#181820] p-1.5 rounded-lg border border-white/5">
              <span className="text-[8px] text-gray-400">Width (X)</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={obj.properties?.customBoundsWidth || 1.2}
                onChange={(e) => onPropertyChange('customBoundsWidth', parseFloat(e.target.value) || 1.0)}
                className="bg-transparent text-[11px] font-mono text-white outline-none w-full"
              />
            </div>
            <div className="flex flex-col gap-0.5 bg-[#181820] p-1.5 rounded-lg border border-white/5">
              <span className="text-[8px] text-gray-400">Length (Y)</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={obj.properties?.customBoundsLength || 2.4}
                onChange={(e) => onPropertyChange('customBoundsLength', parseFloat(e.target.value) || 1.0)}
                className="bg-transparent text-[11px] font-mono text-white outline-none w-full"
              />
            </div>
            <div className="flex flex-col gap-0.5 bg-[#181820] p-1.5 rounded-lg border border-white/5">
              <span className="text-[8px] text-gray-400">Height (Z)</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={obj.properties?.customBoundsHeight || 1.1}
                onChange={(e) => onPropertyChange('customBoundsHeight', parseFloat(e.target.value) || 1.0)}
                className="bg-transparent text-[11px] font-mono text-white outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Physical Material Properties (Mass, Restitution, Friction) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Bounciness / Restitution */}
          <div className="flex flex-col gap-1 bg-[#181820] p-2 rounded-lg border border-white/5">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-gray-400">Bounciness (Restitution)</span>
              <span className="text-orange-400 font-mono font-bold">
                {(vehicleConfig.restitution * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.8"
              step="0.05"
              value={vehicleConfig.restitution}
              onChange={(e) => onPropertyChange('restitution', parseFloat(e.target.value))}
              className="accent-orange-500 w-full h-1 cursor-pointer"
            />
          </div>

          {/* Mass */}
          <div className="flex flex-col gap-1 bg-[#181820] p-2 rounded-lg border border-white/5">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-gray-400">Mass Rig</span>
              <span className="text-blue-400 font-mono font-bold">
                {vehicleConfig.mass} kg
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="6000"
              step="100"
              value={vehicleConfig.mass}
              onChange={(e) => onPropertyChange('mass', parseFloat(e.target.value))}
              className="accent-blue-500 w-full h-1 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
