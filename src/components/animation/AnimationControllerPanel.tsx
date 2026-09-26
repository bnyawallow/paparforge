import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  FastForward, 
  Rewind, 
  Repeat, 
  Sliders, 
  Film, 
  X, 
  ChevronDown, 
  Gauge, 
  Sparkles, 
  Clock, 
  Box, 
  Zap,
  Minimize2,
  Maximize2,
  Activity,
  Bug,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ChevronRight,
  Layers,
  Flag,
  Radio,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGLTFAnimationEvents } from './useGLTFAnimationEvents';

interface AnimationControllerPanelProps {
  onClose?: () => void;
  isFloating?: boolean;
}

interface TimelineMarker {
  time: number;
  percent: number;
  type: 'keyframe' | 'start-event' | 'end-event';
  label: string;
  actionCount?: number;
}

export function AnimationControllerPanel({ onClose, isFloating = true }: AnimationControllerPanelProps) {
  const objects = useEditorStore((state) => state.objects);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const updateObject = useEditorStore((state) => state.updateObject);
  const addToast = useEditorStore((state) => state.addToast);

  const [isMinimized, setIsMinimized] = useState(false);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);
  const [hasCopiedDiag, setHasCopiedDiag] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState<TimelineMarker | null>(null);

  // Find all model objects that have discoveredAnimations or url
  const animatableModels = Object.values(objects).filter(
    (obj) => obj.type === 'model' && (obj.properties?.discoveredAnimations?.length > 0 || obj.properties?.url)
  );

  // Auto-select currently selected object if it's an animatable model, or fallback to first
  useEffect(() => {
    if (selectedObjectId && objects[selectedObjectId]?.type === 'model') {
      setActiveModelId(selectedObjectId);
    } else if (!activeModelId && animatableModels.length > 0) {
      setActiveModelId(animatableModels[0].id);
    }
  }, [selectedObjectId, animatableModels.length]);

  const targetObj = activeModelId ? objects[activeModelId] : null;
  const props = targetObj?.properties || {};

  const discoveredAnimations: string[] = props.discoveredAnimations || [];
  const clipDurations: Record<string, number> = props.animationClipDurations || {};
  const activeAnimation = props.activeAnimation || discoveredAnimations[0] || 'default';
  
  const clipDuration = clipDurations[activeAnimation] || 1.0;
  const animationTime = typeof props.animationTime === 'number' ? props.animationTime : 0;
  const animationPlaying = props.animationPlaying === true;
  const animationSpeed = props.animationSpeed ?? 1.0;
  const loopAnimation = props.loopAnimation !== false;
  const fadeDuration = typeof props.fadeDuration === 'number' 
    ? props.fadeDuration 
    : (typeof props.animationFadeDuration === 'number' ? props.animationFadeDuration : 0.3);

  // Keyframe timestamps discovered from GLTF tracks
  const keyframeMarkersMap: Record<string, number[]> = props.animationKeyframeMarkers || {};
  const activeKeyframeTimes: number[] = keyframeMarkersMap[activeAnimation] || [];

  // 1. Hook into ARForge Animation Lifecycle Events (Start & End Action Triggers)
  const {
    lastTriggeredEvent,
    lastTriggeredTime,
    triggerEventManually,
    registeredStartEvents,
    registeredEndEvents,
  } = useGLTFAnimationEvents({
    modelId: activeModelId,
    activeAnimation,
    animationPlaying,
    animationTime,
    clipDuration,
    loopAnimation,
  });

  // Calculate timeline markers combining model keyframe tracks and ARForge event triggers
  const timelineMarkers = useMemo<TimelineMarker[]>(() => {
    if (clipDuration <= 0) return [];

    const markers: TimelineMarker[] = [];
    const usedTimes = new Set<string>();

    // Add Start Event marker if actions are attached
    if (registeredStartEvents.length > 0) {
      const actionsCount = registeredStartEvents.reduce((acc, e) => acc + (e.actions?.length || 0), 0);
      markers.push({
        time: 0,
        percent: 0,
        type: 'start-event',
        label: `🎬 onAnimationStart: ${registeredStartEvents[0].name || 'Action'}`,
        actionCount: actionsCount,
      });
      usedTimes.add('0.000');
    }

    // Add End Event marker if actions are attached
    if (registeredEndEvents.length > 0) {
      const actionsCount = registeredEndEvents.reduce((acc, e) => acc + (e.actions?.length || 0), 0);
      const endKey = clipDuration.toFixed(3);
      markers.push({
        time: clipDuration,
        percent: 100,
        type: 'end-event',
        label: `🏁 onAnimationComplete: ${registeredEndEvents[0].name || 'Action'}`,
        actionCount: actionsCount,
      });
      usedTimes.add(endKey);
    }

    // Add GLTF model keyframe track markers
    if (activeKeyframeTimes.length > 0) {
      activeKeyframeTimes.forEach((t) => {
        const key = t.toFixed(3);
        if (!usedTimes.has(key) && t >= 0 && t <= clipDuration) {
          usedTimes.add(key);
          markers.push({
            time: t,
            percent: Math.min(100, Math.max(0, (t / clipDuration) * 100)),
            type: 'keyframe',
            label: `Keyframe: ${t.toFixed(2)}s`,
          });
        }
      });
    } else {
      // Fallback regular keyframe divisions (0%, 25%, 50%, 75%, 100%)
      [0, 0.25, 0.5, 0.75, 1.0].forEach((pct) => {
        const t = Number((clipDuration * pct).toFixed(3));
        const key = t.toFixed(3);
        if (!usedTimes.has(key)) {
          usedTimes.add(key);
          markers.push({
            time: t,
            percent: pct * 100,
            type: 'keyframe',
            label: `Keyframe (${(pct * 100).toFixed(0)}%): ${t.toFixed(2)}s`,
          });
        }
      });
    }

    return markers.sort((a, b) => a.time - b.time);
  }, [clipDuration, registeredStartEvents, registeredEndEvents, activeKeyframeTimes]);

  // Step to Previous Keyframe Marker
  const handlePrevKeyframe = () => {
    if (!activeModelId || timelineMarkers.length === 0) return;
    const earlier = timelineMarkers.filter((m) => m.time < animationTime - 0.02);
    const target = earlier.length > 0 ? earlier[earlier.length - 1] : timelineMarkers[0];
    updateObject(activeModelId, {
      properties: {
        ...props,
        animationTime: target.time,
        animationPlaying: false,
        isScrubbing: false,
      },
    });
    addToast(`Stepped to Keyframe: ${target.time.toFixed(2)}s`);
  };

  // Step to Next Keyframe Marker
  const handleNextKeyframe = () => {
    if (!activeModelId || timelineMarkers.length === 0) return;
    const later = timelineMarkers.filter((m) => m.time > animationTime + 0.02);
    const target = later.length > 0 ? later[0] : timelineMarkers[timelineMarkers.length - 1];
    updateObject(activeModelId, {
      properties: {
        ...props,
        animationTime: target.time,
        animationPlaying: false,
        isScrubbing: false,
      },
    });
    addToast(`Stepped to Keyframe: ${target.time.toFixed(2)}s`);
  };

  // Jump to specific marker timestamp
  const handleJumpToMarker = (marker: TimelineMarker) => {
    if (!activeModelId) return;
    updateObject(activeModelId, {
      properties: {
        ...props,
        animationTime: marker.time,
        animationPlaying: false,
        isScrubbing: false,
      },
    });
    addToast(`Jumped to ${marker.label}`);
  };

  // 2. Diagnostic Tool Handler: queries active model AnimationMixer and tracks, logs to console
  const handleRunDiagnostics = () => {
    if (!activeModelId) return;

    // Listen for diagnostic response from GLTFModel
    const onDiagResponse = (e: any) => {
      if (e.detail?.modelId === activeModelId) {
        setDiagnosticsData(e.detail);
        setShowDiagnostics(true);
        window.removeEventListener('response-animation-diagnostics', onDiagResponse);
      }
    };
    window.addEventListener('response-animation-diagnostics', onDiagResponse);

    // Broadcast request to the 3D scene
    window.dispatchEvent(
      new CustomEvent('request-animation-diagnostics', {
        detail: { modelId: activeModelId },
      })
    );

    addToast('🔍 AnimationMixer diagnostics logged to Console (F12)');

    // Fallback if no listener responded within 350ms (e.g. primitive model or uninstantiated)
    setTimeout(() => {
      window.removeEventListener('response-animation-diagnostics', onDiagResponse);
      if (!diagnosticsData) {
        const fallbackData = {
          modelId: activeModelId,
          modelName: targetObj?.name || '3D Model',
          activeTrack: activeAnimation,
          discoveredAnimations,
          clipDuration,
          animationTime,
          animationPlaying,
          animationSpeed,
          loopAnimation,
          startEventsCount: registeredStartEvents.length,
          endEventsCount: registeredEndEvents.length,
          note: 'Full diagnostic summary logged to developer console.',
        };
        console.group(`🔍 [ARForge Animation Diagnostic Tool] ${targetObj?.name || '3D Model'}`);
        console.log('Model ID:', activeModelId);
        console.log('Active Track:', activeAnimation);
        console.log('Timeline Time:', `${animationTime.toFixed(2)}s / ${clipDuration.toFixed(2)}s`);
        console.log('Playback Status:', animationPlaying ? 'Playing' : 'Paused');
        console.log('Attached ARForge Events:', targetObj?.events || []);
        console.groupEnd();
        setDiagnosticsData(fallbackData);
        setShowDiagnostics(true);
      }
    }, 350);
  };

  const handleCopyDiagnostics = () => {
    if (!diagnosticsData) return;
    navigator.clipboard.writeText(JSON.stringify(diagnosticsData, null, 2));
    setHasCopiedDiag(true);
    addToast('Copied diagnostic report to clipboard');
    setTimeout(() => setHasCopiedDiag(false), 2000);
  };

  // Listen for non-loop animation finish events to reset timeline to 0 and revert to Play button
  useEffect(() => {
    const handleMixerFinished = (e: any) => {
      if (e.detail?.modelId === activeModelId) {
        const currentObj = useEditorStore.getState().objects[activeModelId];
        if (currentObj?.properties?.loopAnimation === false) {
          updateObject(activeModelId, {
            properties: {
              ...currentObj.properties,
              animationPlaying: false,
              animationTime: 0,
              isScrubbing: false,
            },
          });
        }
      }
    };
    window.addEventListener('ar-mixer-animation-finished', handleMixerFinished);
    return () => {
      window.removeEventListener('ar-mixer-animation-finished', handleMixerFinished);
    };
  }, [activeModelId, updateObject]);

  const handlePlayPause = () => {
    if (!activeModelId) return;
    const nextPlaying = !animationPlaying;
    // If not looping and near or at end of track, reset to 0 before playing
    const resetTime = (!animationPlaying && !loopAnimation && animationTime >= clipDuration - 0.05) ? 0 : animationTime;
    updateObject(activeModelId, {
      properties: {
        ...props,
        animationTime: resetTime,
        animationPlaying: nextPlaying,
        isScrubbing: false,
      },
    });
    addToast(nextPlaying ? 'Playing Keyframe Animation' : 'Paused Animation');
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeModelId) return;
    const newTime = parseFloat(e.target.value);
    updateObject(activeModelId, {
      properties: {
        ...props,
        animationTime: newTime,
        animationPlaying: false,
        isScrubbing: true,
      },
    });
  };

  const handleScrubEnd = () => {
    if (!activeModelId) return;
    updateObject(activeModelId, {
      properties: {
        ...useEditorStore.getState().objects[activeModelId]?.properties,
        isScrubbing: false,
      },
    });
  };

  const handleStep = (deltaSeconds: number) => {
    if (!activeModelId) return;
    const newTime = Math.max(0, Math.min(clipDuration, animationTime + deltaSeconds));
    updateObject(activeModelId, {
      properties: {
        ...props,
        animationTime: Number(newTime.toFixed(3)),
        animationPlaying: false,
        isScrubbing: false,
      },
    });
  };

  const handleJumpToStart = () => {
    if (!activeModelId) return;
    updateObject(activeModelId, {
      properties: {
        ...props,
        animationTime: 0,
        animationPlaying: false,
        isScrubbing: false,
      },
    });
    addToast('Reset to Start (0.00s)');
  };

  const handleJumpToEnd = () => {
    if (!activeModelId) return;
    updateObject(activeModelId, {
      properties: {
        ...props,
        animationTime: clipDuration,
        animationPlaying: false,
        isScrubbing: false,
      },
    });
    addToast(`Jumped to End (${clipDuration.toFixed(2)}s)`);
  };

  const handleTrackSelect = (trackName: string) => {
    if (!activeModelId) return;
    updateObject(activeModelId, {
      properties: {
        ...props,
        activeAnimation: trackName,
        animationTime: 0,
        animationPlaying: true,
        isScrubbing: false,
      },
    });
    addToast(`Switched Track: ${trackName}${fadeDuration > 0 ? ` (${fadeDuration.toFixed(2)}s cross-fade)` : ''}`);
  };

  const handleFadeDurationChange = (duration: number) => {
    if (!activeModelId) return;
    const clamped = Math.max(0, Math.min(3.0, Number(duration.toFixed(2))));
    updateObject(activeModelId, {
      properties: {
        ...props,
        fadeDuration: clamped,
        animationFadeDuration: clamped,
      },
    });
  };

  const handleSpeedChange = (speed: number) => {
    if (!activeModelId) return;
    updateObject(activeModelId, {
      properties: {
        ...props,
        animationSpeed: speed,
      },
    });
    addToast(`Playback Speed: ${speed}x`);
  };

  const handleLoopToggle = () => {
    if (!activeModelId) return;
    updateObject(activeModelId, {
      properties: {
        ...props,
        loopAnimation: !loopAnimation,
      },
    });
    addToast(!loopAnimation ? 'Loop Repeat Enabled' : 'Play Once Enabled');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins < 10 ? '0' : ''}${mins}:${parseFloat(secs) < 10 ? '0' : ''}${secs}`;
  };

  if (!targetObj) {
    return (
      <div className="bg-[#121318]/95 backdrop-blur-xl border border-[#2a2d3d] p-3.5 rounded-2xl shadow-2xl text-white text-xs max-w-md w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-gray-400">
          <Film className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Select a 3D GLTF model in scene to control embedded keyframe animations</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  const scrubProgressPercent = clipDuration > 0 ? Math.min(100, Math.max(0, (animationTime / clipDuration) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.98 }}
      className={`bg-[#0c0e14]/95 border border-[#232738] rounded-2xl shadow-2xl text-white backdrop-blur-xl overflow-hidden transition-all duration-200 select-none ${
        isFloating ? 'max-w-xl w-full border-cyan-500/30' : 'w-full'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121520]/80 border-b border-[#1f2334]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Film size={15} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-100 font-sans tracking-wide">
                Keyframe Animation Controller
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                {discoveredAnimations.length > 0 ? `${discoveredAnimations.length} Track${discoveredAnimations.length > 1 ? 's' : ''}` : 'GLTF Clip'}
              </span>
              {/* Active Event Trigger Indicator */}
              {(registeredStartEvents.length > 0 || registeredEndEvents.length > 0) && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                  <Zap size={9} className="text-amber-400 fill-amber-400" />
                  <span>Events Active</span>
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 truncate max-w-[240px]">
              <Box size={10} className="text-cyan-400/70 shrink-0" />
              <span>{targetObj.name || '3D Model'}</span>
            </span>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-1.5">
          {/* Diagnostic Tool Button */}
          <button
            onClick={handleRunDiagnostics}
            className="px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/50 hover:border-cyan-500 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Diagnose AnimationMixer, active tracks, and bone bindings in Console"
          >
            <Activity size={12} className="text-cyan-400" />
            <span className="hidden sm:inline">Diagnostics</span>
          </button>

          {/* Model Selector Dropdown if multiple animatable models exist */}
          {animatableModels.length > 1 && (
            <select
              value={activeModelId || ''}
              onChange={(e) => setActiveModelId(e.target.value)}
              className="bg-[#171a29] text-[10px] text-cyan-300 border border-[#2b3046] px-2 py-1 rounded-lg outline-none cursor-pointer font-mono"
            >
              {animatableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            title={isMinimized ? 'Expand Controller' : 'Minimize Controller'}
          >
            {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Controller"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 flex flex-col gap-3.5">
          {/* Active Track Selector & Duration Readout */}
          <div className="flex items-center justify-between gap-3 bg-[#131622] p-2.5 rounded-xl border border-[#1f2335]">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold font-mono whitespace-nowrap">
                Clip Track:
              </span>
              <select
                value={activeAnimation}
                onChange={(e) => handleTrackSelect(e.target.value)}
                className="bg-[#0b0d14] text-xs font-mono font-bold text-cyan-300 border border-[#2c324a] px-2.5 py-1.5 rounded-lg outline-none cursor-pointer flex-1 min-w-0 focus:border-cyan-500 transition-colors"
              >
                {discoveredAnimations.length > 0 ? (
                  discoveredAnimations.map((name, i) => (
                    <option key={name} value={name}>
                      #{i + 1}: {name} ({clipDurations[name] ? `${clipDurations[name].toFixed(1)}s` : '0s'})
                    </option>
                  ))
                ) : (
                  <option value="default">Default Embedded Track</option>
                )}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#090b12] px-2.5 py-1 rounded-lg border border-[#1b1f30] shrink-0 font-mono text-[11px] text-cyan-400 font-bold">
              <Clock size={12} className="text-cyan-400/80" />
              <span>{formatTime(animationTime)}</span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-400">{formatTime(clipDuration)}</span>
            </div>
          </div>

          {/* Timeline Scrub Bar with Visual Keyframe & Event Markers */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 px-1">
              <div className="flex items-center gap-1.5">
                <Bookmark size={11} className="text-cyan-400" />
                <span>Keyframe Timeline</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-gray-300">
                  {timelineMarkers.length} markers
                </span>
              </div>
              <div className="flex items-center gap-2 text-[9px]">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Keyframe
                </span>
                {(registeredStartEvents.length > 0 || registeredEndEvents.length > 0) && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Event Action
                  </span>
                )}
              </div>
            </div>

            <div className="relative flex items-center group py-2.5 cursor-pointer">
              {/* Custom Track Background */}
              <div className="w-full h-3 rounded-full bg-[#141724] border border-[#23293e] relative overflow-hidden shadow-inner">
                {/* Progress Fill */}
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-75"
                  style={{ width: `${scrubProgressPercent}%` }}
                />
              </div>

              {/* Visual Keyframe Markers Overlay */}
              <div className="absolute inset-x-0 inset-y-0 pointer-events-none flex items-center">
                {timelineMarkers.map((marker, idx) => {
                  const isEvent = marker.type === 'start-event' || marker.type === 'end-event';
                  return (
                    <div
                      key={idx}
                      className="absolute transform -translate-x-1/2 flex flex-col items-center pointer-events-auto"
                      style={{ left: `${marker.percent}%` }}
                      onMouseEnter={() => setHoveredMarker(marker)}
                      onMouseLeave={() => setHoveredMarker(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJumpToMarker(marker);
                      }}
                    >
                      {/* Marker Shape: Diamond / Event Badge */}
                      {isEvent ? (
                        <div 
                          className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.9)] flex items-center justify-center cursor-pointer hover:scale-130 transition-transform"
                          title={marker.label}
                        >
                          <Zap size={8} className="text-amber-950 fill-amber-950" />
                        </div>
                      ) : (
                        <div 
                          className="w-2.5 h-2.5 rotate-45 bg-cyan-300 border border-white/80 shadow-[0_0_8px_rgba(34,211,238,0.8)] cursor-pointer hover:scale-140 transition-transform"
                          title={marker.label}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Native Input Range Overlay for Dragging */}
              <input
                type="range"
                min={0}
                max={clipDuration || 1}
                step={0.01}
                value={animationTime}
                onChange={handleScrubChange}
                onMouseUp={handleScrubEnd}
                onTouchEnd={handleScrubEnd}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {/* Scrubber Knob Indicator */}
              <div 
                className="absolute w-4 h-4 rounded-full bg-cyan-300 border-2 border-white shadow-[0_0_12px_rgba(34,211,238,0.9)] pointer-events-none transform -translate-x-1/2 transition-transform duration-75 group-hover:scale-125 z-20"
                style={{ left: `${scrubProgressPercent}%` }}
              />
            </div>

            {/* Hovered Marker Tooltip / Information Bar */}
            <div className="flex justify-between items-center px-1 text-[9px] font-mono text-gray-400 min-h-[16px]">
              {hoveredMarker ? (
                <div className="flex items-center gap-1.5 text-cyan-300 animate-fadeIn">
                  <span className="font-bold">{hoveredMarker.label}</span>
                  {hoveredMarker.actionCount !== undefined && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
                      {hoveredMarker.actionCount} ARForge action{hoveredMarker.actionCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>0.00s</span>
                  <span className="text-gray-600">•</span>
                  <span>Click any keyframe marker to jump</span>
                </div>
              )}
              <span>{clipDuration.toFixed(2)}s</span>
            </div>

            {/* Quick Keyframe Step Navigation */}
            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-gray-400">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevKeyframe}
                  className="px-2 py-0.5 rounded-md bg-[#161a29] hover:bg-[#20263b] text-gray-300 hover:text-cyan-300 border border-[#262c44] transition-colors cursor-pointer flex items-center gap-1 text-[9px]"
                  title="Step to Previous Keyframe Marker"
                >
                  <span>⏮ Prev Keyframe</span>
                </button>
                <button
                  onClick={handleNextKeyframe}
                  className="px-2 py-0.5 rounded-md bg-[#161a29] hover:bg-[#20263b] text-gray-300 hover:text-cyan-300 border border-[#262c44] transition-colors cursor-pointer flex items-center gap-1 text-[9px]"
                  title="Step to Next Keyframe Marker"
                >
                  <span>Next Keyframe ⏭</span>
                </button>
              </div>

              {/* Event trigger test controls */}
              <div className="flex items-center gap-1">
                {registeredStartEvents.length > 0 && (
                  <button
                    onClick={() => triggerEventManually('start')}
                    className="px-2 py-0.5 rounded-md bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/50 transition-colors cursor-pointer text-[9px] flex items-center gap-1"
                    title="Test execute onAnimationStart actions"
                  >
                    <Zap size={9} />
                    <span>Test Start</span>
                  </button>
                )}
                {registeredEndEvents.length > 0 && (
                  <button
                    onClick={() => triggerEventManually('end')}
                    className="px-2 py-0.5 rounded-md bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/50 transition-colors cursor-pointer text-[9px] flex items-center gap-1"
                    title="Test execute onAnimationComplete actions"
                  >
                    <Flag size={9} />
                    <span>Test End</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Transport Controls Bar */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#181c2b]">
            <div className="flex items-center gap-1">
              <button
                onClick={handleJumpToStart}
                className="p-2 rounded-xl bg-[#141724] hover:bg-[#1f2438] text-gray-300 hover:text-white border border-[#252a3f] transition-all cursor-pointer active:scale-95"
                title="Jump to Start (0s)"
              >
                <SkipBack size={14} />
              </button>
              <button
                onClick={() => handleStep(-0.1)}
                className="p-2 rounded-xl bg-[#141724] hover:bg-[#1f2438] text-gray-300 hover:text-white border border-[#252a3f] transition-all cursor-pointer active:scale-95"
                title="Step Backward 0.1s (-1 frame)"
              >
                <Rewind size={14} />
              </button>
            </div>

            {/* Main Play / Pause Button */}
            <button
              onClick={handlePlayPause}
              className={`px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ${
                animationPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30 border border-amber-400/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40 border border-cyan-400/50'
              }`}
            >
              {animationPlaying ? (
                <>
                  <Pause size={15} className="fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={15} className="fill-current ml-0.5" />
                  <span>Play</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleStep(0.1)}
                className="p-2 rounded-xl bg-[#141724] hover:bg-[#1f2438] text-gray-300 hover:text-white border border-[#252a3f] transition-all cursor-pointer active:scale-95"
                title="Step Forward +0.1s (+1 frame)"
              >
                <FastForward size={14} />
              </button>
              <button
                onClick={handleJumpToEnd}
                className="p-2 rounded-xl bg-[#141724] hover:bg-[#1f2438] text-gray-300 hover:text-white border border-[#252a3f] transition-all cursor-pointer active:scale-95"
                title="Jump to End"
              >
                <SkipForward size={14} />
              </button>
            </div>
          </div>

          {/* Clip Cross-Fade Transition Duration Option */}
          <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#111422] border border-[#1e2338]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-300">
                <Sparkles size={11} className="text-cyan-400" />
                <span className="font-semibold">Clip Cross-Fade Transition (Fade Duration):</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 font-bold bg-[#0a0d17] px-2 py-0.5 rounded border border-cyan-800/40">
                <span>{fadeDuration > 0 ? `${fadeDuration.toFixed(2)}s` : 'Instant (0s)'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.05"
                value={fadeDuration}
                onChange={(e) => handleFadeDurationChange(parseFloat(e.target.value))}
                className="accent-cyan-400 w-full h-1.5 bg-[#1a1f33] rounded-lg cursor-pointer"
                title="Configure cross-fade blending duration when switching between animation clips"
              />
              {/* Quick Presets */}
              <div className="flex items-center gap-1 shrink-0">
                {[
                  { label: 'Cut', val: 0 },
                  { label: '0.2s', val: 0.2 },
                  { label: '0.5s', val: 0.5 },
                  { label: '1.0s', val: 1.0 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleFadeDurationChange(preset.val)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                      Math.abs(fadeDuration - preset.val) < 0.04
                        ? 'bg-cyan-600 text-white font-bold shadow'
                        : 'bg-[#181c2d] text-gray-400 hover:text-white hover:bg-[#222840]'
                    }`}
                    title={`Set cross-fade duration to ${preset.val}s`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[9px] text-gray-400 font-mono">
              Smoothly blends skeletal bone transforms when switching tracks
            </span>
          </div>

          {/* Bottom Settings Row: Speed, Loop Toggle, & Event Status */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#181c2b] text-xs">
            {/* Speed Selector Pills */}
            <div className="flex items-center gap-1 bg-[#121522] p-1 rounded-xl border border-[#1f2336]">
              <Gauge size={12} className="text-gray-400 ml-1.5 mr-0.5" />
              {[0.25, 0.5, 1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                    animationSpeed === s
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Loop Toggle */}
            <button
              onClick={handleLoopToggle}
              className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
                loopAnimation
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 shadow-inner'
                  : 'bg-[#121522] text-gray-400 border-[#222638] hover:text-white'
              }`}
            >
              <Repeat size={12} className={loopAnimation ? 'text-emerald-400 animate-spin-slow' : ''} />
              <span>{loopAnimation ? 'Loop Repeat' : 'Play Once'}</span>
            </button>
          </div>

          {/* Live Animation Event Feedback Banner */}
          {lastTriggeredEvent && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[10px] font-mono text-amber-300">
              <div className="flex items-center gap-1.5 truncate">
                <Zap size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                <span className="truncate">Last Triggered: {lastTriggeredEvent}</span>
              </div>
              <span className="text-[9px] text-amber-500 shrink-0">Just now</span>
            </div>
          )}

          {/* Diagnostic Drawer / Modal Overlay */}
          <AnimatePresence>
            {showDiagnostics && diagnosticsData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 rounded-xl bg-[#080a12] border border-cyan-800/60 flex flex-col gap-2 font-mono text-[11px] overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Activity size={13} />
                    <span>AnimationMixer Diagnostic Report</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyDiagnostics}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-1 text-[9px] cursor-pointer"
                    >
                      {hasCopiedDiag ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      <span>{hasCopiedDiag ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                    <button
                      onClick={() => setShowDiagnostics(false)}
                      className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded bg-[#101422] border border-[#1b2238]">
                    <span className="text-gray-400 block mb-0.5">Model & Orientation:</span>
                    <span className="text-white font-bold block">{diagnosticsData.modelName}</span>
                    <span className="text-emerald-400 text-[9px] block">
                      Orientation: {diagnosticsData.rootOrientation || 'Z-up Normalized'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#101422] border border-[#1b2238]">
                    <span className="text-gray-400 block mb-0.5">Mixer Status:</span>
                    <span className="text-cyan-300 font-bold block">
                      {diagnosticsData.mixerState ? '🟢 Active & Evaluating' : '🟡 Standby / Instantiating'}
                    </span>
                    <span className="text-gray-400 text-[9px] block">
                      Tracks: {diagnosticsData.activeClipTracksCount || diagnosticsData.tracksSample?.length || 0} active
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded bg-[#101422] border border-[#1b2238] flex flex-col gap-1 text-[10px]">
                  <div className="flex justify-between text-gray-300">
                    <span>Active Track: <strong className="text-cyan-300">{diagnosticsData.activeTrack}</strong></span>
                    <span>Action Weight: <strong>{diagnosticsData.actionState?.weight ?? 1.0}</strong></span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Start Events Attached: <strong>{registeredStartEvents.length}</strong></span>
                    <span>End Events Attached: <strong>{registeredEndEvents.length}</strong></span>
                  </div>
                </div>

                <div className="text-[9px] text-gray-400 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                  <span>Comprehensive tracks and mixer logs written to Browser Console. Press F12 to view full tables.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

