import React, { useState } from 'react';
import { 
  Settings, Edit3, Camera, Undo2, Redo2, Globe, 
  FolderOpen, Edit2, Check, Save
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { PublishModal } from './PublishModal';
import { SettingsModal } from './SettingsModal';
import { ProjectDashboardModal } from './ProjectDashboardModal';

export function Toolbar() {
  const { 
    isPreviewMode, 
    setPreviewMode,
    past,
    future,
    undo,
    redo,
    hasUnsavedChanges,
    currentProjectId,
    settings,
    renameProject,
    saveCurrentProject,
    addToast
  } = useEditorStore();
  
  const [showPublish, setShowPublish] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProjects, setShowProjects] = useState(true);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState(settings.projectName);

  React.useEffect(() => {
    setTempProjectName(settings.projectName);
  }, [settings.projectName]);

  const handleSaveName = () => {
    if (!tempProjectName.trim()) {
      addToast('Project name cannot be empty');
      setTempProjectName(settings.projectName);
      setIsEditingName(false);
      return;
    }
    renameProject(currentProjectId, tempProjectName.trim());
    saveCurrentProject();
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setTempProjectName(settings.projectName);
      setIsEditingName(false);
    }
  };

  return (
    <>
      <div className="h-14 border-b border-[#2A2A2A] bg-[#141414] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/10">AF</div>
            <span className="font-bold tracking-tight text-base hidden md:inline">ARForge <span className="text-blue-500 font-mono text-[10px] opacity-70">v1.0</span></span>
          </div>

          <div className="h-4 w-[1px] bg-[#2A2A2A] hidden xs:block"></div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowProjects(true)}
              className="p-1.5 hover:bg-[#1A1A1A] rounded-lg text-[#AAA] hover:text-white border border-[#252525] hover:border-[#383838] transition-all duration-100 flex items-center gap-1.5 cursor-pointer text-xs font-bold shadow-sm"
              title="Open Projects Manager"
            >
              <FolderOpen size={14} className="text-blue-400" />
              <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-extrabold text-[#999] hover:text-white">Projects</span>
            </button>

            <div className="h-4 w-[1px] bg-[#2A2A2A] hidden xs:block"></div>

            {isEditingName ? (
              <div className="flex items-center gap-1.5 bg-[#181818] border border-blue-500/50 px-2 py-0.5 rounded-lg">
                <input
                  type="text"
                  value={tempProjectName}
                  onChange={(e) => setTempProjectName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none w-24 sm:w-40"
                  autoFocus
                />
                <button onMouseDown={handleSaveName} className="text-emerald-400 hover:text-emerald-300">
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => {
                  if (isPreviewMode) return;
                  setTempProjectName(settings.projectName);
                  setIsEditingName(true);
                }}
                className={`flex items-center gap-2 group px-2 py-0.5 rounded-lg border border-transparent hover:border-[#252525] hover:bg-[#1A1A1A]/40 transition-all select-none ${isPreviewMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                title={isPreviewMode ? "Cannot edit project name during Live Preview" : "Click to edit project name"}
              >
                <span className="text-xs font-extrabold tracking-tight text-[#BBB] group-hover:text-white truncate max-w-[80px] sm:max-w-[150px]">
                  {settings.projectName}
                </span>
                {!isPreviewMode && (
                  <Edit2 size={10} className="text-[#555] group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                )}
                
                {hasUnsavedChanges ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 select-none animate-pulse shrink-0" title="You have unsaved changes">
                    <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                    Edited
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 select-none shrink-0" title="All changes saved to storage">
                    <Check size={10} className="stroke-[3]" />
                    Saved
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 border-l border-[#2A2A2A] pl-6">
            <button 
              onClick={() => useEditorStore.getState().setIsAssetBrowserOpen(true)}
              className="p-1.5 hover:bg-[#1A1A1A] rounded-lg text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-100 flex items-center gap-1.5 cursor-pointer text-xs font-bold mr-2"
              title="Open Assets Library"
            >
              <FolderOpen size={14} />
              <span className="hidden sm:inline">Assets Library</span>
            </button>
            <button 
              onClick={() => undo()} 
              disabled={past.length === 0 || isPreviewMode}
              className="p-2 hover:bg-[#1A1A1A] disabled:opacity-25 disabled:cursor-not-allowed rounded text-[#888] hover:text-white transition-all hover:scale-105 active:scale-95 duration-100" 
              title={isPreviewMode ? "Undo disabled in Live Preview" : `Undo (Ctrl+Z)`}
            >
              <Undo2 size={16} />
            </button>
            <button 
              onClick={() => redo()} 
              disabled={future.length === 0 || isPreviewMode}
              className="p-2 hover:bg-[#1A1A1A] disabled:opacity-25 disabled:cursor-not-allowed rounded text-[#888] hover:text-white transition-all hover:scale-105 active:scale-95 duration-100" 
              title={isPreviewMode ? "Redo disabled in Live Preview" : `Redo (Ctrl+Y)`}
            >
              <Redo2 size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Segmented Mode Switch */}
          <div className="bg-[#101010] p-1 rounded-lg border border-[#222] flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setPreviewMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                !isPreviewMode 
                  ? "bg-blue-600 text-white shadow-md font-bold" 
                  : "text-[#666] hover:text-[#BBB] hover:bg-[#1A1A1A]"
              }`}
              title="Switch to Editing and Design Mode"
            >
              <Edit3 size={13} />
              Design
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isPreviewMode 
                  ? "bg-emerald-600 text-white shadow-md font-bold" 
                  : "text-[#666] hover:text-[#CCC] hover:bg-[#1A1A1A]"
              }`}
              title="Switch to Interactive AR Live Preview Mode"
            >
              <Camera size={13} />
              Live Preview
            </button>
          </div>

          {/* Google AI Studio Save Button */}
          <button 
            onClick={() => {
              if (hasUnsavedChanges) {
                saveCurrentProject();
                addToast('Project saved to storage');
              }
            }}
            disabled={!hasUnsavedChanges}
            className={`flex items-center justify-center p-1.5 rounded transition-all duration-150 cursor-pointer ${
              hasUnsavedChanges 
                ? "bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.25)] hover:scale-105 active:scale-95" 
                : "bg-[#181818] text-[#666] border border-[#2A2A2A] cursor-not-allowed"
            }`}
            title={hasUnsavedChanges ? "Save manual snapshot to storage" : "All changes saved"}
          >
            {hasUnsavedChanges ? (
              <Save size={15} className="animate-bounce" style={{ animationDuration: '2.5s' }} />
            ) : (
              <Check size={15} className="text-emerald-500 stroke-[3]" />
            )}
          </button>

          {/* Icon-only Settings Button (more convenient than text) */}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] hover:border-[#444] rounded text-[#BBB] hover:text-[#FFF] transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0"
            title="Project Settings"
          >
            <Settings size={15} />
          </button>

          <button 
            onClick={() => setShowPublish(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 hover:text-blue-300 border border-blue-500/20 rounded text-xs font-semibold transition-all hover:scale-105 active:scale-95 duration-100 cursor-pointer"
            title="Publish your AR experience to the web"
          >
            <Globe size={13} />
            Publish
          </button>
        </div>
      </div>
      {showPublish && <PublishModal onClose={() => setShowPublish(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showProjects && <ProjectDashboardModal onClose={() => setShowProjects(false)} />}
    </>
  );
}
