import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  FolderPlus, 
  Move, 
  Globe, 
  QrCode, 
  Layers, 
  Play, 
  Eye, 
  Zap, 
  BookOpen, 
  Sliders, 
  Box, 
  CheckCircle2,
  MousePointerClick,
  Smartphone,
  RotateCcw,
  PowerOff,
  BellOff
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { GlassModal } from '../ui/HudComponents';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OnboardingStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  badge: string;
  description: string;
  bullets: { title: string; desc: string; icon?: React.ComponentType<{ size?: number; className?: string }> }[];
  actionLabel?: string;
  onAction?: () => void;
  keyboardShortcuts?: { key: string; label: string }[];
  mobileGestures?: { gesture: string; action: string }[];
  previewGraphic: 'addObject' | 'transformObject' | 'behaviors' | 'publish';
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [startupGuideDisabled, setStartupGuideDisabled] = useState(false);

  const {
    openAssetBrowser,
    setTransformMode,
    setPreviewMode,
    addToast
  } = useEditorStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ar_onboarding_completed');
      if (saved === 'true') {
        setStartupGuideDisabled(true);
      }
    }
  }, [isOpen]);

  const handleFinish = () => {
    if (startupGuideDisabled) {
      localStorage.setItem('ar_onboarding_completed', 'true');
    } else {
      localStorage.removeItem('ar_onboarding_completed');
    }
    onClose();
  };

  const handleToggleStartupGuide = (disabled: boolean) => {
    setStartupGuideDisabled(disabled);
    if (disabled) {
      localStorage.setItem('ar_onboarding_completed', 'true');
      addToast('Onboarding guide disabled on startup');
    } else {
      localStorage.removeItem('ar_onboarding_completed');
      addToast('Onboarding guide enabled on startup');
    }
  };

  const handleDisableAndClose = () => {
    localStorage.setItem('ar_onboarding_completed', 'true');
    setStartupGuideDisabled(true);
    addToast('Onboarding guide turned off. You can re-open it anytime from Settings or Toolbar.');
    onClose();
  };

  const steps: OnboardingStep[] = [
    {
      stepNumber: 1,
      title: 'Add 3D Objects & Content',
      subtitle: 'Populate your AR target marker with rich 3D assets',
      icon: Box,
      accentColor: '#3B82F6',
      badge: 'Asset Creation',
      description: 'PapARForge allows you to augment real-world print media (magazines, packaging, business cards, posters) with interactive 3D assets.',
      bullets: [
        {
          title: '3D Asset Catalog & Sketchfab',
          desc: 'Browse vehicles, architecture, characters, gadgets, and 3D primitives directly in the asset drawer.',
          icon: FolderPlus
        },
        {
          title: '100,000+ Online Models',
          desc: 'Filter online repositories by Free (CC0 / CC-BY) or Paid Store tags and download models instantly.',
          icon: Sparkles
        },
        {
          title: 'Instant Drag & Drop',
          desc: 'Drag your own .glb / .gltf 3D models, PNG decals, or audio files directly onto the canvas.',
          icon: Layers
        }
      ],
      actionLabel: 'Open 3D Asset Library',
      onAction: () => {
        openAssetBrowser('models');
        addToast('Asset Browser opened! Choose any 3D asset to add to your marker.');
        onClose();
      },
      previewGraphic: 'addObject'
    },
    {
      stepNumber: 2,
      title: 'Transform & Snap to Z-Up',
      subtitle: 'Position, orient, and scale assets with millimeter precision',
      icon: Move,
      accentColor: '#10B981',
      badge: 'Spatial Layout',
      description: 'Manipulate 3D objects in the viewport using intuitive gizmo handles and the app convention of Z-Up orientation.',
      bullets: [
        {
          title: 'Z-Up Convention Alignment',
          desc: 'All 3D assets instantiate Z-Up ([90, 0, 0]) to stand upright naturally on planar print targets.',
          icon: Check
        },
        {
          title: 'Gizmo Controls (W, E, R)',
          desc: 'Translate (move), Rotate, and Scale your selected object along X, Y, and Z axes with clean handles.',
          icon: Sliders
        },
        {
          title: 'Snap to Grid & Ground',
          desc: 'Lock transforms to clean increments, or click "Drop to Ground" to place items flush at Z = 0.',
          icon: Zap
        }
      ],
      keyboardShortcuts: [
        { key: 'W', label: 'Translate' },
        { key: 'E', label: 'Rotate' },
        { key: 'R', label: 'Scale' },
        { key: 'G', label: 'Snap' }
      ],
      mobileGestures: [
        { gesture: '1-Finger Drag', action: 'Orbit 3D Camera' },
        { gesture: '2-Finger Drag', action: 'Pan Viewport' },
        { gesture: 'Pinch', action: 'Zoom In / Out' },
        { gesture: 'Tap Object', action: 'Select & Transform' }
      ],
      actionLabel: 'Set Gizmo to Translate (W)',
      onAction: () => {
        setTransformMode('translate');
        addToast('Transform mode set to Translate. Click any object in the scene to move it!');
      },
      previewGraphic: 'transformObject'
    },
    {
      stepNumber: 3,
      title: 'Behaviors, Physics & Actions',
      subtitle: 'Bring static print ads to life with interactive motion',
      icon: Zap,
      accentColor: '#F59E0B',
      badge: 'Interactivity',
      description: 'Make your WebAR experiences engaging by adding dynamic movement, sound effects, physics collisions, and user tap actions.',
      bullets: [
        {
          title: 'Autonomous Behaviors & Physics',
          desc: 'Enable Spin, Float, or Follow Camera. For vehicles, enable Drivable Physics and steer in real-time!',
          icon: Play
        },
        {
          title: 'Tap Events & Call-to-Actions',
          desc: 'Add tap triggers that play skeletal animations, trigger sound effects, show toasts, or open web URLs.',
          icon: MousePointerClick
        },
        {
          title: 'PBR Materials & Shaders',
          desc: 'Customize metallic sheen, roughness, emissive glow colors, and opacity in the Inspector panel.',
          icon: Sliders
        }
      ],
      previewGraphic: 'behaviors'
    },
    {
      stepNumber: 4,
      title: 'Preview & Publish to WebAR',
      subtitle: 'Deploy instant zero-install AR experiences to smartphone cameras',
      icon: Globe,
      accentColor: '#8B5CF6',
      badge: 'Publishing',
      description: 'Test your interactive creation in real-time AR preview mode, then publish with one click to generate a shareable WebAR URL and QR code.',
      bullets: [
        {
          title: 'Live AR Preview Mode',
          desc: 'Switch to "Preview" mode to test tap actions, animations, and driving physics without leaving the canvas.',
          icon: Eye
        },
        {
          title: 'One-Click Cloud WebAR Publishing',
          desc: 'Publish instantly to generate a standalone web experience hosted on ultra-fast CDN infrastructure.',
          icon: Globe
        },
        {
          title: 'Zero-App Install QR Code',
          desc: 'Print or display the QR code. Viewers simply scan with iOS or Android camera—no app download required!',
          icon: QrCode
        }
      ],
      actionLabel: 'Switch to Live Preview Mode',
      onAction: () => {
        setPreviewMode(true);
        addToast('Switched to Live Preview mode! Interact with your 3D scene.');
        onClose();
      },
      previewGraphic: 'publish'
    }
  ];

  const activeStepData = steps[currentStep];

  if (!isOpen) return null;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={handleFinish}
      hideHeader={true}
      maxWidth="max-w-4xl"
      className="flex flex-col h-[90dvh] sm:h-[88vh] max-h-[720px] w-[96vw] sm:w-full p-0 overflow-hidden bg-[#0C0C10] border border-[#272732] shadow-2xl rounded-2xl md:rounded-3xl"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-[#20202A] bg-[#111116] shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
          <div 
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shadow-md shrink-0"
            style={{ 
              backgroundColor: `${activeStepData.accentColor}20`, 
              borderColor: `${activeStepData.accentColor}40`,
              color: activeStepData.accentColor 
            }}
          >
            <BookOpen size={15} className="sm:size-[18px]" />
          </div>
          <div className="overflow-hidden min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase font-mono truncate">
                Getting Started
              </h2>
              <span 
                className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 hidden xs:inline-block"
                style={{ 
                  backgroundColor: `${activeStepData.accentColor}15`, 
                  borderColor: `${activeStepData.accentColor}30`,
                  color: activeStepData.accentColor 
                }}
              >
                {activeStepData.badge}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 truncate hidden sm:block">
              Master the core fundamentals of building interactive Print-to-WebAR experiences
            </p>
          </div>
        </div>

        {/* Header Right: Direct Turn-Off Button on Mobile + Step dots + Close */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Turn Off Button directly visible in mobile header */}
          <button
            onClick={handleDisableAndClose}
            className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            title="Turn off startup onboarding guide"
          >
            <BellOff size={11} className="text-amber-400 shrink-0" />
            <span className="hidden xs:inline">Turn Off Guide</span>
            <span className="xs:hidden">Turn Off</span>
          </button>

          {/* Step dots */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`transition-all duration-200 cursor-pointer rounded-full ${
                  currentStep === idx 
                    ? 'w-5 sm:w-6 h-1.5 sm:h-2' 
                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/20 hover:bg-white/40'
                }`}
                style={{ 
                  backgroundColor: currentStep === idx ? activeStepData.accentColor : undefined 
                }}
                title={`Step ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>

          <button
            onClick={handleFinish}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center"
            title="Close Guide"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Prominent Mobile Subheader: Instant One-Tap Toggle to Turn Off / On Startup Guide */}
      <div className="bg-[#14141E] px-3 sm:px-6 py-1.5 border-b border-[#20202A] flex items-center justify-between gap-2 shrink-0 text-[10px] sm:text-[11px] font-mono">
        <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300 overflow-hidden">
          <span className="text-gray-400">Launch Behavior:</span>
          <span className={startupGuideDisabled ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
            {startupGuideDisabled ? "Disabled on startup" : "Shown on startup"}
          </span>
        </div>

        <button
          onClick={() => handleToggleStartupGuide(!startupGuideDisabled)}
          className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
            startupGuideDisabled
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
              : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
          }`}
          title="Toggle whether guide appears on startup"
        >
          {startupGuideDisabled ? (
            <>
              <Check size={10} />
              <span>Enable on Launch</span>
            </>
          ) : (
            <>
              <BellOff size={10} />
              <span>Turn Off on Startup</span>
            </>
          )}
        </button>
      </div>

      {/* Main Body: Responsive Layout (Stacked on Mobile, 2 Columns on Desktop) */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* Visual Graphic Banner (Rendered first on mobile, right column on desktop) */}
        <div className="order-1 md:order-2 w-full md:w-5/12 bg-[#12121A] md:border-l border-b md:border-b-0 border-[#20202A] p-3 sm:p-5 flex flex-col justify-between shrink-0 md:shrink overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-center">
            
            {/* Visual Canvas Diagram for each step */}
            <div className="w-full max-w-xs sm:max-w-sm h-36 sm:h-44 md:aspect-[4/3] md:h-auto rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-b from-[#181824] to-[#0E0E14] relative overflow-hidden shadow-2xl p-3 sm:p-4 flex flex-col items-center justify-center">
              
              {/* Background grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#3B82F615_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none opacity-60" />

              {/* Graphic for Step 1: Add Object */}
              {activeStepData.previewGraphic === 'addObject' && (
                <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                  <div className="relative">
                    {/* Simulated AR Target Marker Base */}
                    <div className="w-28 sm:w-36 h-16 sm:h-20 rounded-lg bg-gradient-to-tr from-blue-900/60 to-indigo-900/40 border-2 border-dashed border-blue-400/60 flex items-center justify-center shadow-lg transform rotate-x-12">
                      <div className="text-[9px] font-mono text-blue-300 font-bold uppercase tracking-wider">
                        Target Marker
                      </div>
                    </div>

                    {/* Floating 3D Model with Z-Up drop ray */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce" style={{ animationDuration: '2.5s' }}>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl border-2 border-white/40 flex items-center justify-center text-white">
                        <Box size={20} className="sm:size-[24px]" />
                      </div>
                      <div className="w-0.5 h-4 sm:h-5 bg-gradient-to-b from-cyan-400 to-transparent" />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] sm:text-xs font-bold text-white font-mono flex items-center justify-center gap-1">
                      <Sparkles size={11} className="text-blue-400" /> Instant Target Attachment
                    </span>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 max-w-[200px] hidden sm:block">
                      Models snap directly onto the detected image target with Z-Up posture.
                    </p>
                  </div>
                </div>
              )}

              {/* Graphic for Step 2: Transform Gizmo */}
              {activeStepData.previewGraphic === 'transformObject' && (
                <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                    {/* Central 3D Cube */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-white/40 shadow-xl flex items-center justify-center text-white relative z-10">
                      <Move size={20} className="sm:size-[22px]" />
                    </div>

                    {/* Gizmo Axes (X=Red, Y=Green, Z=Blue Up) */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center text-blue-400">
                      <div className="text-[8px] font-bold font-mono">Z (Up)</div>
                      <div className="w-0.5 h-5 sm:h-6 bg-blue-500 shadow-[0_0_8px_#3B82F6]" />
                    </div>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center text-rose-400">
                      <div className="w-5 sm:w-6 h-0.5 bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
                      <div className="text-[8px] font-bold font-mono ml-0.5">X</div>
                    </div>
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center text-emerald-400">
                      <div className="text-[8px] font-bold font-mono mr-0.5">Y</div>
                      <div className="w-5 sm:w-6 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] sm:text-xs font-bold text-emerald-400 font-mono">
                      Z-Up Orthogonal Axes
                    </span>
                  </div>
                </div>
              )}

              {/* Graphic for Step 3: Behaviors & Events */}
              {activeStepData.previewGraphic === 'behaviors' && (
                <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                  <div className="relative w-28 h-20 sm:w-32 sm:h-24 flex items-center justify-center">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 border border-white/30 text-white font-mono text-[10px] sm:text-xs font-extrabold shadow-xl flex items-center gap-1.5">
                      <Zap size={13} />
                      <span>TAP TO ACTIVATE</span>
                    </div>

                    <div className="absolute -bottom-1 right-2 text-amber-300 animate-pulse">
                      <MousePointerClick size={20} className="sm:size-[22px]" />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] sm:text-xs font-bold text-amber-400 font-mono">
                      OnTap • Spin • Drivable Physics
                    </span>
                  </div>
                </div>
              )}

              {/* Graphic for Step 4: Publish & QR Code */}
              {activeStepData.previewGraphic === 'publish' && (
                <div className="relative z-10 flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white text-black shadow-xl flex flex-col items-center gap-1 border-2 border-purple-500/40">
                    <QrCode size={40} className="sm:size-[48px] text-black" />
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-purple-700">
                      WebAR QR
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] sm:text-xs font-bold text-purple-300 font-mono flex items-center justify-center gap-1">
                      <Globe size={11} /> Zero-App Install WebAR
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Quick Pro Tip Box (Desktop only) */}
            <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/10 w-full space-y-1 hidden md:block">
              <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase font-bold text-blue-400">
                <Sparkles size={10} /> Pro Tip
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                {currentStep === 0 && 'High-contrast images (e.g. posters with logos and patterns) provide the highest AR tracking stability.'}
                {currentStep === 1 && 'Hold Shift while dragging Gizmo handles to constrain translation along planar surface grids.'}
                {currentStep === 2 && 'Use the Preview toggle in the top nav to test physics, sounds, and click events live.'}
                {currentStep === 3 && 'You can re-open this guide anytime by clicking the Guide icon in the top toolbar or project manager.'}
              </p>
            </div>

          </div>

          {/* Desktop Navigation Controls */}
          <div className="pt-3 border-t border-[#20202A] hidden md:flex items-center justify-between mt-3 shrink-0">
            <button
              onClick={() => setCurrentStep(c => Math.max(0, c - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>

            <div className="text-[10px] font-mono text-gray-400">
              {currentStep + 1} / {steps.length}
            </div>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1.5 transition-all hover:opacity-90 active:scale-98 cursor-pointer"
                style={{ backgroundColor: activeStepData.accentColor }}
              >
                <span>Next</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer"
              >
                <Check size={13} />
                <span>Finish</span>
              </button>
            )}
          </div>
        </div>

        {/* Step Details & Bullet Points (Scrollable on mobile and desktop) */}
        <div className="order-2 md:order-1 w-full md:w-7/12 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto bg-[#0E0E14] scrollbar-thin">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">
                Step {activeStepData.stepNumber} of {steps.length}
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
                {activeStepData.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-300 mt-1 leading-relaxed">
                {activeStepData.description}
              </p>
            </div>

            {/* Bullets List */}
            <div className="space-y-2 sm:space-y-2.5 pt-1">
              {activeStepData.bullets.map((b, idx) => {
                const BulletIcon = b.icon || Check;
                return (
                  <div 
                    key={idx} 
                    className="p-2.5 sm:p-3 rounded-xl bg-[#15151E] border border-[#242434] flex items-start gap-2.5 sm:gap-3 hover:border-white/20 transition-colors"
                  >
                    <div 
                      className="p-1.5 rounded-lg shrink-0 mt-0.5"
                      style={{ 
                        backgroundColor: `${activeStepData.accentColor}20`, 
                        color: activeStepData.accentColor 
                      }}
                    >
                      <BulletIcon size={14} className="sm:size-[15px]" />
                    </div>
                    <div>
                      <h4 className="text-[11px] sm:text-xs font-bold text-white">{b.title}</h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Gestures Guidance on mobile / Keyboard Shortcuts on desktop */}
            {activeStepData.mobileGestures && (
              <div className="pt-1 block md:hidden">
                <span className="text-[9px] font-mono uppercase font-bold text-gray-400 tracking-wider mb-1.5 flex items-center gap-1">
                  <Smartphone size={10} className="text-blue-400" /> Touch Controls:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {activeStepData.mobileGestures.map((mg, idx) => (
                    <div 
                      key={idx} 
                      className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono flex flex-col"
                    >
                      <span className="text-cyan-400 font-bold">{mg.gesture}</span>
                      <span className="text-gray-400 text-[9px]">{mg.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts on desktop */}
            {activeStepData.keyboardShortcuts && (
              <div className="pt-1 hidden md:block">
                <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider mb-1.5 block">
                  Quick Shortcuts:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeStepData.keyboardShortcuts.map((sc, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono"
                    >
                      <kbd className="px-1.5 py-0.2 rounded bg-white/15 text-white font-bold text-[9px]">
                        {sc.key}
                      </kbd>
                      <span className="text-gray-300 text-[10px]">{sc.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTA Button */}
          {activeStepData.actionLabel && activeStepData.onAction && (
            <div className="pt-3 mt-3 border-t border-[#20202A]">
              <button
                onClick={activeStepData.onAction}
                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold font-mono tracking-wide uppercase text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-98 min-h-[40px]"
                style={{ backgroundColor: activeStepData.accentColor }}
              >
                <span>{activeStepData.actionLabel}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Mobile Bottom Navigation Controls */}
          <div className="pt-3 border-t border-[#20202A] flex md:hidden items-center justify-between gap-1.5 mt-3 shrink-0">
            <button
              onClick={() => setCurrentStep(c => Math.max(0, c - 1))}
              disabled={currentStep === 0}
              className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>

            {/* Quick Turn Off on mobile right inside the step controls */}
            <button
              onClick={handleDisableAndClose}
              className="px-2 py-1 rounded-lg text-[10px] font-mono text-gray-400 hover:text-amber-300 bg-white/5 border border-white/10 flex items-center gap-1 cursor-pointer active:scale-95"
              title="Turn off guide so it does not open again on startup"
            >
              <BellOff size={11} className="text-amber-400" />
              <span>Turn Off</span>
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1.5 transition-all hover:opacity-90 active:scale-98 cursor-pointer min-h-[36px]"
                style={{ backgroundColor: activeStepData.accentColor }}
              >
                <span>Next</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer min-h-[36px]"
              >
                <Check size={13} />
                <span>Finish</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer: User Ability to Turn Off Guide on Startup */}
      <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-[#20202A] bg-[#0E0E14] flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <label className="flex items-center gap-2 cursor-pointer select-none text-left w-full sm:w-auto p-1 rounded-lg hover:bg-white/5 transition-colors">
          <input
            type="checkbox"
            checked={startupGuideDisabled}
            onChange={(e) => handleToggleStartupGuide(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 bg-[#1A1A24] cursor-pointer"
          />
          <span className="text-[11px] font-medium text-gray-300 hover:text-white">
            Don't show this guide on startup
          </span>
        </label>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={handleDisableAndClose}
            className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Turn off startup guide"
          >
            <BellOff size={12} className="text-amber-400" />
            <span>Turn Off Guide</span>
          </button>

          <button
            onClick={handleFinish}
            className="text-[10px] sm:text-[11px] font-mono font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </GlassModal>
  );
}
