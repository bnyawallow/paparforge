import React, { useState } from 'react';
import { 
  Settings, Edit3, Camera, Undo2, Redo2, Globe, 
  FolderOpen, Edit2, Check, Save, Sun, Moon, LogOut, ShieldAlert, History
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useAuthStore } from '../../store/useAuthStore';
import { PublishModal } from './PublishModal';
import { SettingsModal } from './SettingsModal';
import { ProjectDashboardModal } from './ProjectDashboardModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { useTheme } from '../../lib/theme';
import { useNavigate } from 'react-router-dom';

export function Toolbar() {
  const t = useTheme();
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
    addToast,
    objects,
    rootObjects,
    assets,
    importProject,
    editorTheme,
    toggleEditorTheme
  } = useEditorStore();
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [showPublish, setShowPublish] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  
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
      <div className={`h-14 border-b flex items-center justify-between px-4 shrink-0 relative z-30 transition-all duration-200 ${t.isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#141414] border-[#2A2A2A] text-white'}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/10">AF</div>
            <span className={`font-bold tracking-tight text-base hidden md:inline ${t.textHeading}`}>ARForge <span className="text-blue-500 font-mono text-[10px] opacity-70">v1.0</span></span>
          </div>

          <div className={`h-4 w-[1px] hidden xs:block ${t.isLight ? 'bg-gray-200' : 'bg-[#2A2A2A]'}`}></div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowProjects(true)}
              className={`p-1.5 rounded-lg transition-all duration-100 flex items-center gap-1.5 cursor-pointer text-xs font-bold shadow-sm ${t.isLight ? 'bg-gray-50 hover:bg-gray-100 text-[#4B5563] hover:text-gray-900 border-gray-200 hover:border-gray-300' : 'p-1.5 hover:bg-[#1A1A1A] rounded-lg text-[#AAA] hover:text-white border border-[#252525] hover:border-[#383838]'}`}
              title="Open Projects Manager"
            >
              <FolderOpen size={14} className="text-blue-400" />
              <span className={`hidden sm:inline text-[11px] uppercase tracking-wider font-extrabold ${t.isLight ? 'text-gray-500 hover:text-gray-800' : 'text-[#999] hover:text-white'}`}>Projects</span>
            </button>

            <div className={`h-4 w-[1px] hidden xs:block ${t.isLight ? 'bg-gray-200' : 'bg-[#2A2A2A]'}`}></div>

            {isEditingName ? (
              <div className={`flex items-center gap-1.5 border px-2 py-0.5 rounded-lg ${t.isLight ? 'bg-gray-50 border-blue-400' : 'bg-[#181818] border-blue-500/50'}`}>
                <input
                  type="text"
                  value={tempProjectName}
                  onChange={(e) => setTempProjectName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={handleKeyDown}
                  className={`bg-transparent text-xs font-bold focus:outline-none w-24 sm:w-40 ${t.isLight ? 'text-gray-800' : 'text-white'}`}
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
                className={`flex items-center gap-2 group px-2 py-0.5 rounded-lg border border-transparent transition-all select-none ${isPreviewMode ? 'cursor-not-allowed' : 'cursor-pointer'} ${t.isLight ? 'hover:border-gray-200 hover:bg-gray-100/55' : 'hover:border-[#252525] hover:bg-[#1A1A1A]/40'}`}
                title={isPreviewMode ? "Cannot edit project name during Live Preview" : "Click to edit project name"}
              >
                <span className={`text-xs font-extrabold tracking-tight truncate max-w-[80px] sm:max-w-[150px] ${t.isLight ? 'text-gray-700 group-hover:text-black' : 'text-[#BBB] group-hover:text-white'}`}>
                  {settings.projectName}
                </span>
                {!isPreviewMode && (
                  <Edit2 size={10} className={`opacity-0 group-hover:opacity-100 transition-all shrink-0 ${t.isLight ? 'text-gray-400 group-hover:text-blue-500' : 'text-[#555] group-hover:text-blue-400'}`} />
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

          <div className={`flex items-center gap-1 border-l pl-6 ${t.isLight ? 'border-gray-200' : 'border-[#2A2A2A]'}`}>
            <button 
              onClick={() => useEditorStore.getState().setIsAssetBrowserOpen(true)}
              className={`p-1.5 rounded-lg border transition-all duration-100 flex items-center gap-1.5 cursor-pointer text-xs font-bold mr-1.5 ${t.isLight ? 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:border-emerald-300' : 'bg-transparent text-emerald-400 hover:text-emerald-300 border-emerald-500/20 hover:border-emerald-500/40'}`}
              title="Open Assets Library"
            >
              <FolderOpen size={14} />
              <span className="hidden sm:inline">Assets Library</span>
            </button>
            <button 
              onClick={() => setShowVersions(true)}
              className={`p-1.5 rounded-lg border transition-all duration-100 flex items-center gap-1.5 cursor-pointer text-xs font-bold mr-1.5 ${t.isLight ? 'bg-amber-50 hover:bg-amber-100/80 text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300' : 'bg-transparent text-amber-400 hover:text-amber-300 border-amber-500/20 hover:border-amber-500/40'}`}
              title="Project Version History & Snapshots"
            >
              <History size={14} />
              <span className="hidden sm:inline">Versions</span>
            </button>
            <button 
              onClick={() => undo()} 
              disabled={past.length === 0 || isPreviewMode}
              className={`p-2 disabled:opacity-25 disabled:cursor-not-allowed rounded transition-all hover:scale-105 active:scale-95 duration-100 ${t.isLight ? 'text-gray-400 hover:text-black hover:bg-gray-100' : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'}`} 
              title={isPreviewMode ? "Undo disabled in Live Preview" : `Undo (Ctrl+Z)`}
            >
              <Undo2 size={16} />
            </button>
            <button 
              onClick={() => redo()} 
              disabled={future.length === 0 || isPreviewMode}
              className={`p-2 disabled:opacity-25 disabled:cursor-not-allowed rounded transition-all hover:scale-105 active:scale-95 duration-100 ${t.isLight ? 'text-gray-400 hover:text-black hover:bg-gray-100' : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'}`} 
              title={isPreviewMode ? "Redo disabled in Live Preview" : `Redo (Ctrl+Y)`}
            >
              <Redo2 size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Segmented Mode Switch */}
          <div className={`p-1 rounded-lg flex items-center gap-1 shadow-inner border ${t.isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#101010] border-[#222]'}`}>
            <button
              onClick={() => setPreviewMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                !isPreviewMode 
                  ? "bg-blue-600 text-white shadow-md font-bold" 
                  : t.isLight ? "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50" : "text-[#666] hover:text-[#BBB] hover:bg-[#1A1A1A]"
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
                  : t.isLight ? "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50" : "text-[#666] hover:text-[#CCC] hover:bg-[#1A1A1A]"
              }`}
              title="Switch to Interactive AR Preview Mode"
            >
              <Camera size={13} />
              Preview
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
                : t.isLight ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed" : "bg-[#181818] text-[#666] border border-[#2A2A2A] cursor-not-allowed"
            }`}
            title={hasUnsavedChanges ? "Save manual snapshot to storage" : "All changes saved"}
          >
            {hasUnsavedChanges ? (
              <Save size={15} className="animate-bounce" style={{ animationDuration: '2.5s' }} />
            ) : (
              <Check size={15} className="text-emerald-500 stroke-[3]" />
            )}
          </button>

          {/* Global Theme Toggle Button */}
          <button 
            onClick={() => toggleEditorTheme()}
            className={`p-1.5 border rounded transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 ${t.isLight ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900' : 'bg-[#1A1A1A] hover:bg-[#252525] border-[#333] hover:border-[#444] text-[#BBB] hover:text-[#FFF]'}`}
            title={editorTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {editorTheme === 'dark' ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} className="text-indigo-500" />}
          </button>

          {user?.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')}
              className={`p-1.5 border rounded transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 ${t.isLight ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-600' : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-400'}`}
              title="Admin Dashboard"
            >
              <ShieldAlert size={15} />
            </button>
          )}
          <button 
            onClick={logout}
            className={`p-1.5 border rounded transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 ${t.isLight ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600' : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'}`}
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
          {/* Icon-only Settings Button */}
          <button 
            onClick={() => setShowSettings(true)}
            className={`p-1.5 border rounded transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 ${t.isLight ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900' : 'bg-[#1A1A1A] hover:bg-[#252525] border-[#333] hover:border-[#444] text-[#BBB] hover:text-[#FFF]'}`}
            title="Project Settings"
          >
            <Settings size={15} />
          </button>

          <button 
            onClick={() => setShowPublish(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-semibold transition-all hover:scale-105 active:scale-95 duration-100 cursor-pointer ${t.isLight ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300' : 'bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 hover:text-blue-300 border-blue-500/20'}`}
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
      <VersionHistoryModal isOpen={showVersions} onClose={() => setShowVersions(false)} />
    </>
  );
}
