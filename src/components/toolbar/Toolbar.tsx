import React, { useState, useRef } from 'react';
import { 
  Settings, Edit3, Camera, Undo2, Redo2, Globe, 
  FolderOpen, Edit2, Check, Save, Sun, Moon, LogOut, ShieldAlert, History, QrCode, Printer, LayoutTemplate,
  Image as ImageIcon, Smile, Sliders, Gauge, Sparkles, ChevronLeft, ChevronRight, Maximize, Minimize
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useAuthStore } from '../../store/useAuthStore';
import { PublishModal } from './PublishModal';
import { SettingsModal } from './SettingsModal';
import { ProjectDashboardModal } from './ProjectDashboardModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { MarkerManagerModal } from './MarkerManagerModal';
import { TemplatesLibraryModal } from '../templates/TemplatesLibraryModal';
import { TrackingModeModal } from './TrackingModeModal';
import { UIOptimizerModal } from './UIOptimizerModal';
import { ProjectQRCodeModal } from '../qrcode/ProjectQRCodeModal';
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
    updateSettings,
    renameProject,
    saveCurrentProject,
    addToast,
    objects,
    rootObjects,
    assets,
    importProject,
    editorTheme,
    toggleEditorTheme,
    isUIOptimizerOpen,
    setIsUIOptimizerOpen,
    isQRCodeModalOpen,
    qrCodeModalProject,
    openQRCodeModal,
    closeQRCodeModal
  } = useEditorStore();
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [showPublish, setShowPublish] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showMarkerStudio, setShowMarkerStudio] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTrackingMode, setShowTrackingMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState(settings.projectName);

  const scrollTrackRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen();
      }
      localStorage.setItem('ar_editor_fullscreen_user_pref', 'enabled');
      addToast('Full Screen enabled (saved)');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      localStorage.setItem('ar_editor_fullscreen_user_pref', 'disabled');
      addToast('Full Screen disabled (saved)');
    }
  };

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

  const handleScrollLeft = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: -140, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: 140, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className={`h-14 border-b flex items-center justify-between px-1.5 sm:px-3 shrink-0 relative z-30 select-none overflow-x-auto overflow-y-hidden no-scrollbar touch-pan-x w-full ${t.isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#141414] border-[#2A2A2A] text-white'}`}>
        {/* 1. Left Section: Logo & Project Switcher (Pinned, never clipped) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 z-10">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-md shadow-blue-500/20 shrink-0">
              AF
            </div>
            <span className={`font-bold tracking-tight text-sm hidden lg:inline ${t.textHeading}`}>
              ARForge
            </span>
          </div>

          <div className={`h-4 w-[1px] hidden xs:block ${t.isLight ? 'bg-gray-200' : 'bg-[#2A2A2A]'}`} />

          <button
            onClick={() => useEditorStore.getState().closeProject()}
            className={`p-1.5 rounded-lg transition-all duration-100 flex items-center gap-1 cursor-pointer text-xs font-bold shadow-sm shrink-0 ${
              t.isLight 
                ? 'bg-gray-50 hover:bg-gray-100 text-[#4B5563] hover:text-gray-900 border border-gray-200' 
                : 'bg-[#1A1A1A] hover:bg-[#222] text-[#AAA] hover:text-white border border-[#2A2A2A]'
            }`}
            title="Return to Projects Manager"
          >
            <FolderOpen size={13} className="text-blue-400" />
            <span className="hidden md:inline text-[10px] uppercase tracking-wider font-extrabold">Projects</span>
          </button>

          {isEditingName ? (
            <div className={`flex items-center gap-1 border px-1.5 py-0.5 rounded-lg shrink-0 ${t.isLight ? 'bg-gray-50 border-blue-400' : 'bg-[#181818] border-blue-500/50'}`}>
              <input
                type="text"
                value={tempProjectName}
                onChange={(e) => setTempProjectName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                className={`bg-transparent text-xs font-bold focus:outline-none w-16 sm:w-28 ${t.isLight ? 'text-gray-800' : 'text-white'}`}
                autoFocus
              />
              <button onMouseDown={handleSaveName} className="text-emerald-400 hover:text-emerald-300">
                <Check size={11} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => {
                if (isPreviewMode) return;
                setTempProjectName(settings.projectName);
                setIsEditingName(true);
              }}
              className={`flex items-center gap-1 group px-1 sm:px-1.5 py-0.5 rounded-lg border border-transparent transition-all select-none shrink-0 ${
                isPreviewMode ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${t.isLight ? 'hover:border-gray-200 hover:bg-gray-100/55' : 'hover:border-[#252525] hover:bg-[#1A1A1A]/40'}`}
              title={isPreviewMode ? "Cannot edit project name during Live Preview" : "Click to edit project name"}
            >
              <span className={`text-xs font-bold tracking-tight truncate max-w-[60px] xs:max-w-[100px] sm:max-w-[140px] ${t.isLight ? 'text-gray-700 group-hover:text-black' : 'text-[#BBB] group-hover:text-white'}`}>
                {settings.projectName}
              </span>
              {!isPreviewMode && (
                <Edit2 size={9} className={`opacity-0 group-hover:opacity-100 transition-all shrink-0 ${t.isLight ? 'text-gray-400 group-hover:text-blue-500' : 'text-[#555] group-hover:text-blue-400'}`} />
              )}
              
              {hasUnsavedChanges ? (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" title="Unsaved changes" />
              ) : (
                <span title="Saved"><Check size={9} className="text-emerald-500 stroke-[3] shrink-0" /></span>
              )}
            </div>
          )}
        </div>

        {/* 2. Middle Section: Toolbar Tools */}
        <div className="flex items-center gap-1 sm:gap-1.5 mx-1.5 sm:mx-2.5 shrink-0 py-1">
            {/* Asset Browser Trigger */}
            <button 
              onClick={() => useEditorStore.getState().openAssetBrowser('models')}
              className={`px-2 py-1 rounded-lg border transition-all duration-100 flex items-center gap-1.5 cursor-pointer text-xs font-bold shrink-0 ${
                t.isLight 
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
                  : 'bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
              }`}
              title="Open 3D Asset Browser & Models Library"
            >
              <FolderOpen size={13} />
              <span className="text-[11px] whitespace-nowrap">Assets</span>
            </button>

            {/* UI Optimizer & Resolution Trigger */}
            <button
              onClick={() => setIsUIOptimizerOpen(true)}
              className={`px-2 py-1 rounded-lg border transition-all duration-100 flex items-center gap-1.5 cursor-pointer text-xs font-bold shrink-0 ${
                t.isLight
                  ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200'
                  : 'bg-cyan-950/30 hover:bg-cyan-950/50 text-cyan-400 border-cyan-500/30'
              }`}
              title="UI Optimizer & Device Viewport Resolution Manager"
            >
              <Gauge size={13} className="text-cyan-400 animate-pulse" />
              <span className="text-[11px] whitespace-nowrap">Optimizer</span>
            </button>

            {/* Tracking Mode Studio */}
            <button 
              onClick={() => setShowTrackingMode(true)}
              className={`p-1.5 rounded-lg border transition-all duration-100 flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 ${
                t.isLight 
                  ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' 
                  : 'bg-purple-950/20 hover:bg-purple-950/40 text-purple-400 border-purple-500/20'
              }`}
              title="AR Tracking Target & Marker Setup"
            >
              <QrCode size={14} />
            </button>

            {/* Version History */}
            <button 
              onClick={() => setShowVersions(true)}
              className={`p-1.5 rounded-lg border transition-all duration-100 flex items-center justify-center cursor-pointer text-xs font-bold shrink-0 ${
                t.isLight 
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' 
                  : 'bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 border-amber-500/20'
              }`}
              title="Project Version History & Snapshots"
            >
              <History size={14} />
            </button>

            {/* Global Theme Toggle */}
            <button 
              onClick={() => toggleEditorTheme()}
              className={`p-1.5 border rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 ${
                t.isLight 
                  ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600' 
                  : 'bg-[#1A1A1A] hover:bg-[#252525] border-[#333] text-[#BBB]'
              }`}
              title={editorTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {editorTheme === 'dark' ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-indigo-500" />}
            </button>

            {/* Full Screen Mode Toggle */}
            <button 
              onClick={toggleFullscreen}
              className={`p-1.5 border rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 ${
                t.isLight 
                  ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600' 
                  : 'bg-[#1A1A1A] hover:bg-[#252525] border-[#333] text-[#BBB]'
              }`}
              title={isFullscreen ? 'Exit Full Screen Mode' : 'Enable Full Screen Mode'}
            >
              {isFullscreen ? <Minimize size={14} className="text-blue-400" /> : <Maximize size={14} className="text-blue-400" />}
            </button>

            {/* Project Settings Modal */}
            <button 
              onClick={() => setShowSettings(true)}
              className={`p-1.5 border rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 ${
                t.isLight 
                  ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600' 
                  : 'bg-[#1A1A1A] hover:bg-[#252525] border-[#333] text-[#BBB]'
              }`}
              title="Project Environment & Export Settings"
            >
              <Settings size={14} />
            </button>

            {/* Admin Dashboard (if authorized) */}
            {user?.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className={`p-1.5 border rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 ${
                  t.isLight ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-600' : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-400'
                }`}
                title="Admin Dashboard"
              >
                <ShieldAlert size={14} />
              </button>
            )}

            {/* Logout button */}
            <button 
              onClick={logout}
              className={`p-1.5 border rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 ${
                t.isLight ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600' : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'
              }`}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>

        {/* 3. Right Section: Pinned Critical Actions (Always Visible on ALL devices and orientations) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 z-10">
          {/* Undo / Redo Cluster (Visible on larger screens) */}
          <div className={`flex items-center p-0.5 rounded-lg border shrink-0 ${t.isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#18181A] border-[#2A2A2E]'}`}>
            <button 
              onClick={() => undo()} 
              disabled={past.length === 0 || isPreviewMode}
              className={`p-1 sm:p-1.5 disabled:opacity-25 disabled:cursor-not-allowed rounded transition-all cursor-pointer ${
                t.isLight ? 'text-gray-600 hover:text-black hover:bg-white' : 'text-gray-300 hover:text-white hover:bg-[#252528]'
              }`} 
              title={isPreviewMode ? "Undo disabled during Live Preview" : "Undo (Ctrl+Z)"}
            >
              <Undo2 size={14} />
            </button>
            <button 
              onClick={() => redo()} 
              disabled={future.length === 0 || isPreviewMode}
              className={`p-1 sm:p-1.5 disabled:opacity-25 disabled:cursor-not-allowed rounded transition-all cursor-pointer ${
                t.isLight ? 'text-gray-600 hover:text-black hover:bg-white' : 'text-gray-300 hover:text-white hover:bg-[#252528]'
              }`} 
              title={isPreviewMode ? "Redo disabled during Live Preview" : "Redo (Ctrl+Y)"}
            >
              <Redo2 size={14} />
            </button>
          </div>

          {/* Design / Preview Mode Switch (Permanently visible on ALL devices!) */}
          <div className={`p-0.5 rounded-lg flex items-center gap-0.5 border shadow-inner shrink-0 ${
            t.isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#101012] border-[#242428]'
          }`}>
            <button
              onClick={() => setPreviewMode(false)}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                !isPreviewMode 
                  ? "bg-blue-600 text-white shadow font-extrabold" 
                  : t.isLight ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-gray-200"
              }`}
              title="Switch to Design & Edit Mode"
            >
              <Edit3 size={12} />
              <span className="text-[11px] inline">Design</span>
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                isPreviewMode 
                  ? "bg-emerald-600 text-white shadow font-extrabold" 
                  : t.isLight ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-gray-200"
              }`}
              title="Switch to Interactive AR Live Preview"
            >
              <Camera size={12} />
              <span className="text-[11px] inline">Preview</span>
            </button>
          </div>

          {/* Mobile AR Test & Dynamic QR Code Trigger */}
          <button 
            onClick={() => openQRCodeModal()}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-extrabold transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 shadow-sm ${
              t.isLight 
                ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 shadow-purple-500/10' 
                : 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border-purple-500/30 shadow-purple-500/15'
            }`}
            title="Scan Dynamic QR Code for Instant Mobile WebAR Testing"
          >
            <QrCode size={13} className="text-purple-400" />
            <span className="text-[11px] whitespace-nowrap hidden sm:inline">Mobile AR</span>
          </button>

          {/* Manual Save Button */}
          <button 
            onClick={() => {
              if (hasUnsavedChanges) {
                saveCurrentProject();
                addToast('Project saved to storage');
              }
            }}
            disabled={!hasUnsavedChanges}
            className={`flex p-1.5 rounded-lg transition-all duration-150 cursor-pointer shrink-0 ${
              hasUnsavedChanges 
                ? "bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white shadow-md active:scale-95" 
                : t.isLight ? "bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed" : "bg-[#18181A] text-gray-600 border border-[#2A2A2E] cursor-not-allowed"
            }`}
            title={hasUnsavedChanges ? "Save manual snapshot to storage" : "All changes saved"}
          >
            {hasUnsavedChanges ? (
              <Save size={14} className="animate-bounce" style={{ animationDuration: '2s' }} />
            ) : (
              <Check size={14} className="text-emerald-500 stroke-[3]" />
            )}
          </button>

          {/* Publish Button (ALWAYS Accessible, pinned with high-visibility styling) */}
          <button 
            onClick={() => setShowPublish(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-extrabold shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 border border-blue-400/40"
            title="Publish AR experience to the web"
          >
            <Globe size={13} className="text-blue-200" />
            <span className="text-[11px] whitespace-nowrap">Publish</span>
          </button>
        </div>
      </header>

      {/* Modals and Overlays */}
      {showPublish && <PublishModal onClose={() => setShowPublish(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showProjects && <ProjectDashboardModal onClose={() => setShowProjects(false)} />}
      {showMarkerStudio && <MarkerManagerModal onClose={() => setShowMarkerStudio(false)} />}
      {showTemplates && <TemplatesLibraryModal onClose={() => setShowTemplates(false)} />}
      {showTrackingMode && <TrackingModeModal onClose={() => setShowTrackingMode(false)} />}
      {isUIOptimizerOpen && <UIOptimizerModal onClose={() => setIsUIOptimizerOpen(false)} />}
      <VersionHistoryModal isOpen={showVersions} onClose={() => setShowVersions(false)} />
      <ProjectQRCodeModal 
        isOpen={isQRCodeModalOpen} 
        onClose={closeQRCodeModal}
        projectId={qrCodeModalProject?.id}
        projectName={qrCodeModalProject?.name}
      />
    </>
  );
}

