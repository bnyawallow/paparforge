import React, { useState } from 'react';
import { X, Image, Smile, Check, Info, Sliders, Layers, Sparkles, User, HelpCircle, Shield, Eye } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { GlassModal } from '../ui/HudComponents';
import { PrintMediaPresetPicker } from '../ui/PrintMediaPresetPicker';

interface TrackingModeModalProps {
  onClose: () => void;
}

export function TrackingModeModal({ onClose }: TrackingModeModalProps) {
  const {
    settings,
    updateSettings,
    objects,
    updateObject,
    saveCurrentProject,
    addToast
  } = useEditorStore();

  const [activeMode, setActiveMode] = useState<'image' | 'face'>(settings.trackingMode || 'image');
  const [faceAnchor, setFaceAnchor] = useState<string>(settings.faceAnchor || 'head');
  const [showFaceMesh, setShowFaceMesh] = useState<boolean>(settings.showFaceMesh || false);
  const [showFaceOccluder, setShowFaceOccluder] = useState<boolean>(settings.showFaceOccluder ?? true);

  // Find image target object for physical width & compilation parameters
  const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
  const initialWidth = imageTarget?.properties?.physicalWidth || 0.1;
  const [physicalWidth, setPhysicalWidth] = useState(initialWidth.toString());

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Update Project Settings
    updateSettings({
      trackingMode: activeMode,
      faceAnchor: faceAnchor as any,
      showFaceMesh,
      showFaceOccluder,
    });

    // 2. Update physical width on image target object if in image mode
    if (imageTarget) {
      const parsedWidth = parseFloat(physicalWidth);
      if (!isNaN(parsedWidth) && parsedWidth > 0) {
        updateObject(imageTarget.id, {
          properties: {
            ...imageTarget.properties,
            physicalWidth: parsedWidth
          }
        });
      }
    }

    // 3. Save to storage & notify
    setTimeout(() => {
      saveCurrentProject();
      addToast(`Tracking mode updated to ${activeMode === 'face' ? 'Face AR Tracking' : 'Image AR Tracking'}`);
      onClose();
    }, 50);
  };

  const handleSelectMode = (mode: 'image' | 'face') => {
    setActiveMode(mode);
  };

  return (
    <GlassModal isOpen={true} onClose={onClose} hideHeader={true} maxWidth="max-w-xl" className="animate-in fade-in zoom-in-95 duration-150 p-0">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#222222] flex items-center justify-between bg-[#161616]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm uppercase font-extrabold tracking-wider text-white">MindAR Tracking Mode Configurator</h2>
            <p className="text-[10px] text-[#888] font-medium">Switch seamlessly between Image Target and Face AR tracking</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-[#2A2A2A] rounded-md text-[#888] hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="p-5 space-y-5">

        {/* Mode Selector Cards */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Image Target Tracking Card */}
          <div
            onClick={() => handleSelectMode('image')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              activeMode === 'image'
                ? 'bg-blue-950/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                : 'bg-[#181818] border-[#282828] hover:border-[#383838] opacity-75 hover:opacity-100'
            }`}
          >
            {activeMode === 'image' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <Check size={12} className="stroke-[3]" />
              </div>
            )}
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                <Image size={20} />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Image Target Tracking</h3>
              <p className="text-[11px] text-[#888] leading-relaxed">
                Track 2D posters, business cards, billboards, food packages, and printed markers in physical space.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-blue-400 font-mono font-bold">
              <span>MindAR Image v1.2</span>
            </div>
          </div>

          {/* Face AR Tracking Card */}
          <div
            onClick={() => handleSelectMode('face')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              activeMode === 'face'
                ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                : 'bg-[#181818] border-[#282828] hover:border-[#383838] opacity-75 hover:opacity-100'
            }`}
          >
            {activeMode === 'face' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                <Check size={12} className="stroke-[3]" />
              </div>
            )}
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Smile size={20} />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Face AR Tracking</h3>
              <p className="text-[11px] text-[#888] leading-relaxed">
                Track human face landmarks in real-time. Place 3D glasses, hats, cosmetics, masks, and face filters.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-purple-400 font-mono font-bold">
              <span>MindAR Face v1.2</span>
            </div>
          </div>

        </div>

        {/* Dynamic Mode Settings Panel */}
        {activeMode === 'image' ? (
          <div className="p-4 bg-[#181818] rounded-xl border border-[#282828] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#252525]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Image size={14} />
                Image Target Settings
              </h4>
              <span className="text-[10px] font-mono text-[#666]">Physical Scale Config</span>
            </div>

            {/* Target Physical Width & Print Media Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#AAA] flex items-center gap-1.5">
                <Layers size={12} className="text-purple-400" />
                Image Target Physical Scale & Print Media Preset
              </label>
              <PrintMediaPresetPicker 
                value={parseFloat(physicalWidth) || 0.1}
                onChange={(val) => setPhysicalWidth(val.toString())}
              />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#181818] rounded-xl border border-[#282828] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#252525]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Smile size={14} />
                Face AR Options
              </h4>
              <span className="text-[10px] font-mono text-[#666]">468 Face Landmarks</span>
            </div>

            {/* Face Anchor Position Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#888] flex items-center gap-1.5">
                <User size={12} className="text-purple-400" />
                Face Attachment Anchor Point
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'head', name: 'Head / Nose Bridge', icon: '👤', idx: 'Anchor 1' },
                  { id: 'nose', name: 'Nose Tip', icon: '👃', idx: 'Anchor 4' },
                  { id: 'forehead', name: 'Forehead / Crown', icon: '🧢', idx: 'Anchor 10' },
                  { id: 'chin', name: 'Chin / Jawline', icon: '🧔', idx: 'Anchor 152' },
                  { id: 'leftEye', name: 'Left Eye', icon: '👁️', idx: 'Anchor 33' },
                  { id: 'rightEye', name: 'Right Eye', icon: '👁️', idx: 'Anchor 263' },
                  { id: 'mouth', name: 'Mouth / Lips', icon: '👄', idx: 'Anchor 13' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFaceAnchor(item.id)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      faceAnchor === item.id
                        ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                        : 'bg-[#141414] border-[#2A2A2A] text-[#888] hover:text-white hover:border-[#383838]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-[9px] font-mono text-[#666]">{item.idx}</span>
                    </div>
                    <span className="text-[11px] truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mesh & Occluder Toggles */}
            <div className="pt-2 border-t border-[#252525] grid grid-cols-2 gap-3">
              
              {/* Show Face Mesh Toggle */}
              <label className="p-2.5 rounded-lg border border-[#282828] bg-[#141414] hover:bg-[#1A1A1A] transition-colors cursor-pointer flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Eye size={12} className="text-purple-400" />
                    3D Face Mesh Wireframe
                  </span>
                  <p className="text-[10px] text-[#777]">Renders mesh overlay on face</p>
                </div>
                <input
                  type="checkbox"
                  checked={showFaceMesh}
                  onChange={(e) => setShowFaceMesh(e.target.checked)}
                  className="w-4 h-4 rounded border-[#333] text-purple-600 focus:ring-purple-500 bg-[#222] cursor-pointer"
                />
              </label>

              {/* Show Face Occluder Toggle */}
              <label className="p-2.5 rounded-lg border border-[#282828] bg-[#141414] hover:bg-[#1A1A1A] transition-colors cursor-pointer flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield size={12} className="text-blue-400" />
                    3D Head Occluder
                  </span>
                  <p className="text-[10px] text-[#777]">Occludes back of 3D glasses/hats</p>
                </div>
                <input
                  type="checkbox"
                  checked={showFaceOccluder}
                  onChange={(e) => setShowFaceOccluder(e.target.checked)}
                  className="w-4 h-4 rounded border-[#333] text-blue-600 focus:ring-blue-500 bg-[#222] cursor-pointer"
                />
              </label>

            </div>

          </div>
        )}

        {/* Info Banner */}
        <div className="p-3 bg-blue-950/20 border border-blue-800/30 rounded-xl flex items-start gap-2.5 text-blue-200/90 text-[11px] leading-relaxed">
          <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
          <span>
            {activeMode === 'face'
              ? 'In Face AR mode, 3D objects automatically track facial expressions and position in live preview and published WebAR links.'
              : 'In Image Target mode, 3D elements lock onto your printed marker image with real-world distance metrics.'
            }
          </span>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-[#222222] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-transparent hover:bg-[#222] text-xs font-bold rounded-lg text-[#AAA] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check size={14} className="stroke-[3]" />
            Apply Tracking Mode
          </button>
        </div>

      </form>
    </GlassModal>
  );
}
