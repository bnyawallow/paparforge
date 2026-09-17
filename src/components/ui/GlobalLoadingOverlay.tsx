import React, { useEffect, useState, useRef } from 'react';
import { useProgress } from '@react-three/drei';
import { useEditorStore } from '../../store/useEditorStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, 
  Sparkles, 
  FolderOpen, 
  DownloadCloud, 
  RefreshCw, 
  Layers, 
  Check, 
  X 
} from 'lucide-react';

export function GlobalLoadingOverlay() {
  const globalLoading = useEditorStore((state) => state.globalLoading);
  const setGlobalLoading = useEditorStore((state) => state.setGlobalLoading);
  
  // Drei useProgress hook tracking Three.js texture/model asset downloads
  const { active: dreiActive, progress: dreiProgress, item: dreiItem, loaded: dreiLoaded, total: dreiTotal } = useProgress();

  // Internal smooth states
  const [isVisible, setIsVisible] = useState(false);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [showDismiss, setShowDismiss] = useState(false);
  const minDisplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const displayStartTimeRef = useRef<number>(0);

  const isStoreActive = Boolean(globalLoading?.active);
  const isAssetLoading = dreiActive && dreiTotal > 0;
  const shouldShow = isStoreActive || isAssetLoading;

  // Target progress value calculation
  const targetProgress = isStoreActive 
    ? (globalLoading?.progress ?? 50)
    : isAssetLoading 
      ? Math.round(dreiProgress || (dreiTotal > 0 ? (dreiLoaded / dreiTotal) * 100 : 0))
      : 100;

  // Determine title and subtitle
  let title = "Loading Project Workspace";
  let detail = "Preparing 3D spatial scene...";
  let type: 'project' | 'asset' | 'sync' | 'template' = 'project';

  if (isStoreActive && globalLoading) {
    title = globalLoading.title || "Loading...";
    detail = globalLoading.detail || "Processing spatial data...";
    type = globalLoading.type || 'project';
  } else if (isAssetLoading) {
    title = "Fetching 3D Assets";
    type = 'asset';
    if (dreiItem) {
      // Clean up item URL to show clean filename
      const cleanName = dreiItem.split('/').pop()?.split('?')[0] || "3D Asset";
      detail = cleanName.length > 36 ? `${cleanName.slice(0, 34)}...` : cleanName;
    } else {
      detail = "Streaming geometry and PBR materials...";
    }
  }

  // Smoothly interpolate progress
  useEffect(() => {
    if (!shouldShow) return;
    const interval = setInterval(() => {
      setSmoothProgress((prev) => {
        if (prev < targetProgress) {
          const step = Math.max(1, (targetProgress - prev) * 0.25);
          return Math.min(targetProgress, prev + step);
        }
        return prev;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [shouldShow, targetProgress]);

  // Handle visibility with minimum display time to prevent flickering
  useEffect(() => {
    if (shouldShow) {
      if (!isVisible) {
        setIsVisible(true);
        displayStartTimeRef.current = Date.now();
        setSmoothProgress(targetProgress > 0 ? Math.min(targetProgress, 20) : 10);
        setShowDismiss(false);

        // Show dismiss button after 6 seconds in case of slow or blocked network resource
        if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = setTimeout(() => {
          setShowDismiss(true);
        }, 6000);
      }
    } else if (isVisible) {
      // Complete progress smoothly before hiding
      setSmoothProgress(100);
      const elapsed = Date.now() - displayStartTimeRef.current;
      const minDuration = 400; // minimum duration in ms for polished perceived performance
      const remainingTime = Math.max(120, minDuration - elapsed);

      if (minDisplayTimerRef.current) clearTimeout(minDisplayTimerRef.current);
      minDisplayTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        setSmoothProgress(0);
        setShowDismiss(false);
      }, remainingTime);
    }

    return () => {
      if (minDisplayTimerRef.current) clearTimeout(minDisplayTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [shouldShow, targetProgress, isVisible]);

  const handleManualDismiss = () => {
    setIsVisible(false);
    if (isStoreActive) {
      setGlobalLoading(null);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="global-loading-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/65 backdrop-blur-md select-none pointer-events-auto p-4"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: -8 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-2xl bg-[#0e0e13]/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(59,130,246,0.15)] p-6 overflow-hidden flex flex-col items-center text-center"
        >
          {/* Subtle Ambient Radial Backlight */}
          <div 
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 rounded-full pointer-events-none opacity-40 blur-3xl"
            style={{
              background: type === 'asset' 
                ? 'radial-gradient(circle, #06b6d4 0%, #3b82f6 50%, transparent 75%)'
                : type === 'sync'
                  ? 'radial-gradient(circle, #10b981 0%, #059669 50%, transparent 75%)'
                  : 'radial-gradient(circle, #6366f1 0%, #3b82f6 50%, transparent 75%)'
            }}
          />

          {/* Dismiss Button (if long running) */}
          {showDismiss && (
            <button
              onClick={handleManualDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              title="Dismiss overlay"
            >
              <X size={14} />
            </button>
          )}

          {/* Holographic Glowing Spinner Orb */}
          <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
            {/* Outer Rotating Cyber Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-indigo-500 opacity-80"
            />
            
            {/* Inner Counter-Rotating Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
              className="absolute inset-1.5 rounded-full border border-dashed border-cyan-400/60"
            />

            {/* Glowing Core Icon */}
            <div className="relative z-10 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-white/15 flex items-center justify-center shadow-inner">
              {type === 'asset' ? (
                <DownloadCloud size={18} className="text-cyan-400 animate-pulse" />
              ) : type === 'template' ? (
                <Sparkles size={18} className="text-indigo-400 animate-pulse" />
              ) : type === 'sync' ? (
                <RefreshCw size={17} className="text-emerald-400 animate-spin" />
              ) : (
                <Box size={18} className="text-blue-400 animate-pulse" />
              )}
            </div>
          </div>

          {/* Title & Status Typography */}
          <h3 className="text-sm font-bold text-white tracking-wide mb-1">
            {title}
          </h3>
          <p className="text-[11px] text-neutral-400 font-mono max-w-[280px] truncate leading-relaxed">
            {detail}
          </p>

          {/* Glowing Animated Progress Bar */}
          <div className="w-full mt-5">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  width: `${Math.max(4, Math.min(100, smoothProgress))}%`,
                  background: type === 'asset'
                    ? 'linear-gradient(90deg, #06b6d4, #3b82f6)'
                    : type === 'sync'
                      ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                      : 'linear-gradient(90deg, #3b82f6, #6366f1, #06b6d4)'
                }}
                transition={{ ease: 'easeOut', duration: 0.15 }}
              >
                {/* Shimmer light reflection traveling along bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent w-full animate-[shimmer_1.5s_infinite]" />
              </motion.div>
            </div>

            {/* Footer Metrics Row */}
            <div className="flex items-center justify-between mt-2 px-0.5 text-[10px] font-mono text-neutral-400">
              <span className="font-semibold text-neutral-300">
                {Math.round(smoothProgress)}%
              </span>
              
              {isAssetLoading && dreiTotal > 0 ? (
                <span className="text-neutral-500">
                  {dreiLoaded} / {dreiTotal} assets
                </span>
              ) : (
                <span className="flex items-center gap-1 text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Spatial Engine Active
                </span>
              )}
            </div>
          </div>

          {showDismiss && (
            <button
              onClick={handleManualDismiss}
              className="mt-4 text-[10px] text-neutral-400 hover:text-white underline transition-colors"
            >
              Continue in background
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
