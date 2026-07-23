import React, { useState } from 'react';
import { X, Save, Info, Tag, Layers, CheckCircle } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { GlassModal } from '../ui/HudComponents';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    currentProjectId,
    settings,
    objects,
    updateObject,
    renameProject,
    saveCurrentProject,
    addToast
  } = useEditorStore();

  const [projectName, setProjectName] = useState(settings.projectName);
  const [imageTargetName, setImageTargetName] = useState(settings.imageTargetName || '');
  
  // Find the image target to read/update physical width
  const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
  const initialWidth = imageTarget?.properties?.physicalWidth || 0.1;
  const [physicalWidth, setPhysicalWidth] = useState(initialWidth.toString());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      addToast('Project name cannot be empty');
      return;
    }

    // 1. Rename the project
    renameProject(currentProjectId, projectName.trim());

    // 2. Update Image Target physical width if imageTarget exists
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

    // 3. Save to local storage explicitly
    setTimeout(() => {
      saveCurrentProject();
      addToast('Settings saved successfully');
      onClose();
    }, 50);
  };

  return (
    <GlassModal isOpen={true} onClose={onClose} hideHeader={true} maxWidth="max-w-md" className="animate-in fade-in zoom-in-95 duration-150 p-0">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222222] flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h2 className="text-sm uppercase font-bold tracking-wider text-[#CCC]">Project Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#2A2A2A] rounded-md text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#888] flex items-center gap-1.5">
              <Tag size={12} className="text-blue-400" />
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. My Awesome AR Experience"
              className="w-full bg-[#1C1C1C] border border-[#2D2D2D] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              required
            />
          </div>

          {/* Target Physical Width */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#888] flex items-center gap-1.5">
              <Layers size={12} className="text-purple-400" />
              Image Target Physical Width (meters)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={physicalWidth}
                onChange={(e) => setPhysicalWidth(e.target.value)}
                placeholder="0.10"
                className="w-full bg-[#1C1C1C] border border-[#2D2D2D] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                required
              />
              <span className="bg-[#1C1C1C] border border-[#2D2D2D] rounded-lg px-3 py-2 text-xs text-[#666] flex items-center font-semibold">
                m
              </span>
            </div>
            
            {/* Helper Table for common dimensions */}
            <div className="p-3 bg-[#1A1A1A] rounded-lg border border-[#252525] space-y-1.5 text-[11px] text-[#777] leading-normal">
              <div className="flex items-start gap-1.5">
                <Info size={12} className="text-[#555] mt-0.5 shrink-0" />
                <span>Provides correct real-world scale for floating elements.</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-[#252525] font-mono text-[10px]">
                <div className="flex justify-between"><span>Business Card:</span> <span className="text-[#999]">0.09 m</span></div>
                <div className="flex justify-between"><span>A4 Poster:</span> <span className="text-[#999]">0.21 m</span></div>
                <div className="flex justify-between"><span>Magazine Page:</span> <span className="text-[#999]">0.22 m</span></div>
                <div className="flex justify-between"><span>QR Code:</span> <span className="text-[#999]">0.05 m</span></div>
              </div>
            </div>
          </div>

          {/* QR Code / Trackable Status */}
          <div className="p-3.5 bg-[#172554]/20 border border-[#1e3a8a]/40 rounded-xl flex items-start gap-3">
            <CheckCircle className="text-blue-400 shrink-0 mt-0.5" size={15} />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-blue-300">Live Engine Active</h4>
              <p className="text-[11px] text-blue-200/80 leading-normal">
                Any changes made here will update the local 3D workspace. The spatial engine matches camera scaling on-the-fly.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#222222] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-[#222] text-sm font-semibold rounded-lg text-[#AAA] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Save size={14} />
              Save Changes
            </button>
          </div>

        </form>
    </GlassModal>
  );
}
