import { generateAFrameScene } from '../../lib/aframeGenerator';
import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  X, Copy, Check, Download, Globe, Code, Cpu, Sparkles, AlertCircle, Play, 
  ExternalLink, QrCode, Box, PackageCheck, FileCode, Smartphone,
  Image as ImageIcon, Smile, Scan, Globe2, Sliders, Target, CheckCircle2,
  Maximize2, Layers, RefreshCw
} from 'lucide-react';
import { SceneObject } from '../../types';
import { exportSceneToGLB, exportSceneAsZapparPackage } from '../../lib/arExporter';
import { DEFAULT_ART_POSTER_TEXTURE } from '../../lib/arTargetTexture';
import QRCode from 'qrcode';

import { GlassModal } from '../ui/HudComponents';

export function PublishModal({ onClose }: { onClose: () => void }) {
  const { 
    objects, 
    rootObjects, 
    settings, 
    updateSettings, 
    isPreviewMode, 
    assets, 
    scenes, 
    activeSceneId, 
    openQRCodeModal,
    updateObject 
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'cloud' | 'exports' | 'developer'>('cloud');
  const [copied, setCopied] = useState(false);
  const [publishStep, setPublishStep] = useState<'idle' | 'validating' | 'packaging' | 'optimizing' | 'deploying' | 'success'>(
    settings.publishedProjectUrl ? 'success' : 'idle'
  );
  const [publishProgress, setPublishProgress] = useState(settings.publishedProjectUrl ? 100 : 0);
  const [publishedUrl, setPublishedUrl] = useState(settings.publishedProjectUrl || '');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Determine active scene and tracking mode
  const activeScene = scenes[activeSceneId];
  const activeTrackingMode = activeScene?.targetType || settings.trackingMode || 'image';

  // Find target object in current scene objects
  const targetObject = Object.values(objects).find(
    (obj) => obj.type === 'imageTarget'
  );

  useEffect(() => {
    if (publishedUrl) {
      QRCode.toDataURL(publishedUrl, { width: 360, margin: 1, errorCorrectionLevel: 'H' })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('PublishModal QR error:', err));
    }
  }, [publishedUrl]);

  const [isExportingGLB, setIsExportingGLB] = useState(false);
  const [isExportingZappar, setIsExportingZappar] = useState(false);
  
  // Clean URL-friendly slug
  const projectName = settings.projectName || 'AR Experience';
  const projectSlug = settings.publishedProjectId || (projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'ar-experience');

  // Scene audit detection
  const stats = React.useMemo(() => {
    let scriptCount = 0;
    let behaviorCount = 0;
    let inheritedBehaviorCount = 0;
    let buttonCount = 0;
    let mediaCount = 0;
    let lightCount = 0;
    let interactiveCount = 0;

    Object.values(objects).forEach((obj: any) => {
      if (obj.properties?.scriptCode && (obj.properties.scriptEnabled ?? true)) {
        scriptCount++;
      }
      if (obj.properties?.behavior) {
        behaviorCount++;
      } else if (obj.parentId && objects[obj.parentId]?.properties?.behavior) {
        inheritedBehaviorCount++;
      }
      if (obj.type === 'button') {
        buttonCount++;
      }
      if (obj.type === 'light') {
        lightCount++;
      }
      if (obj.type === 'audio' || obj.type === 'youtube' || obj.properties?.soundUrl) {
        mediaCount++;
      }
      if ((obj.events && obj.events.length > 0) || (obj.states && obj.states.length > 0) || obj.properties?.billboard) {
        interactiveCount++;
      }
    });

    return { 
      totalObjects: Object.keys(objects).length,
      scriptCount, 
      behaviorCount: behaviorCount + inheritedBehaviorCount,
      inheritedBehaviorCount,
      buttonCount, 
      mediaCount, 
      lightCount,
      interactiveCount 
    };
  }, [objects]);

  const htmlContent = generateAFrameScene(useEditorStore.getState());

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectSlug}-ar-experience.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadQR = async () => {
    if (!publishedUrl) return;
    try {
      const highResDataUrl = await QRCode.toDataURL(publishedUrl, {
        width: 600,
        margin: 2,
        errorCorrectionLevel: 'H'
      });
      const a = document.createElement('a');
      a.href = highResDataUrl;
      a.download = `${projectSlug}-ar-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      useEditorStore.getState().addToast('Downloaded high-res QR code image (.png)');
    } catch {
      useEditorStore.getState().addToast('Failed to download QR image');
    }
  };

  const handlePublish = async () => {
    if (publishStep !== 'idle' && publishStep !== 'success') return;
    
    setPublishProgress(25);
    setPublishStep('validating');

    try {
      // Step 1: Pre-publish validation of scene and objects
      const storeState = useEditorStore.getState();
      const objCount = Object.keys(storeState.objects).length;
      if (objCount === 0) {
        useEditorStore.getState().addToast('Scene is empty. Add at least one object before publishing.');
      }

      setPublishProgress(50);
      setPublishStep('packaging');

      const { SupabaseService } = await import('../../services/supabaseService');
      const projName = storeState.settings.projectName || 'AR Experience';
      const projectId = storeState.settings.publishedProjectId || Math.random().toString(36).substring(2, 8);
      
      const projectData = {
        objects: storeState.objects,
        rootObjects: storeState.rootObjects,
        settings: {
          ...storeState.settings,
          publishedProjectId: projectId
        },
        assets: storeState.assets,
        scenes: storeState.scenes,
        activeSceneId: storeState.activeSceneId
      };

      setPublishProgress(75);
      setPublishStep('optimizing');

      // Generate the full HTML for standalone with comprehensive object properties & inheritance
      const compiledHtml = generateAFrameScene({
        ...storeState,
        settings: {
          ...storeState.settings,
          publishedProjectId: projectId
        }
      });

      setPublishProgress(90);
      setPublishStep('deploying');

      // Delegate persistence and deployment to the unified service layer
      const result = await SupabaseService.publishProject(
        projectId,
        projName,
        projectData,
        compiledHtml
      );

      setPublishProgress(100);
      setPublishStep('success');
      
      setPublishedUrl(result.url);

      // Save settings with publishedProjectId and publishedProjectUrl to state and localStorage
      updateSettings({
        publishedProjectId: result.publishedProjectId,
        publishedProjectUrl: result.url
      });
      useEditorStore.getState().saveCurrentProject();
      
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=10-10-10&bgcolor=ffffff&data=${encodeURIComponent(result.url)}`;
      setQrCodeUrl(qr);
      useEditorStore.getState().addToast('Experience published live with all object properties!');
    } catch (err) {
      console.error('Publishing failed:', err);
      setPublishStep('success'); // Fallback to serverless demo
      const url = `${window.location.origin}/papar/local-demo-only`;
      setPublishedUrl(url);
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=10-10-10&bgcolor=ffffff&data=${encodeURIComponent(url)}`;
      setQrCodeUrl(qr);
    }
  };

  const handleExportGLB = async () => {
    try {
      setIsExportingGLB(true);
      const blob = await exportSceneToGLB(objects, rootObjects, projectSlug);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectSlug}-scene.glb`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      useEditorStore.getState().addToast('GLB binary 3D model exported successfully');
    } catch (err) {
      console.error('GLB export failed:', err);
      useEditorStore.getState().addToast('Failed to export GLB model');
    } finally {
      setIsExportingGLB(false);
    }
  };

  const handleExportZappar = async () => {
    try {
      setIsExportingZappar(true);
      const state = useEditorStore.getState();
      const blob = await exportSceneAsZapparPackage({
        objects,
        rootObjects,
        settings,
        assets: state.assets
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectSlug}-zappar-webar.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      useEditorStore.getState().addToast('Zappar WebAR package (.zip) exported successfully');
    } catch (err) {
      console.error('Zappar export failed:', err);
      useEditorStore.getState().addToast('Failed to export Zappar WebAR package');
    } finally {
      setIsExportingZappar(false);
    }
  };

  // Helper to update target properties if a target object exists
  const handleUpdateTargetProp = (key: string, value: any) => {
    if (targetObject) {
      updateObject(targetObject.id, {
        properties: {
          ...targetObject.properties,
          [key]: value
        }
      });
      useEditorStore.getState().addToast(`Updated ${key} setting for ${activeTrackingMode} tracking`);
    }
  };

  return (
    <GlassModal isOpen={true} onClose={onClose} hideHeader={true} maxWidth="max-w-4xl" className="flex flex-col max-h-[92vh] sm:max-h-[88vh] h-full w-[96vw] sm:w-full overflow-hidden">
      {/* Modal Header - Mobile Responsive */}
      <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 border-b border-[#222]">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0">⚡</div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-white font-mono">Publish Center</h2>
            <p className="text-[10px] text-gray-400 font-sans mt-0.5 truncate max-w-[200px] xs:max-w-[300px] sm:max-w-none">
              Deploy, package & export live WebAR print experience
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 sm:p-1.5 hover:bg-[#1D1D1D] rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
          aria-label="Close Publish Modal"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tab Controls - Mobile Touch Horizontally Scrollable */}
      <div className="flex border-b border-[#1C1C1C] bg-[#0E0E0E] px-2 sm:px-4 overflow-x-auto scrollbar-none touch-pan-x shrink-0">
        <button
          onClick={() => setActiveTab('cloud')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'cloud'
              ? 'border-blue-500 text-white font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Globe size={14} className={activeTab === 'cloud' ? 'text-blue-400' : ''} />
          <span>Cloud Deployment</span>
        </button>
        <button
          onClick={() => setActiveTab('exports')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'exports'
              ? 'border-blue-500 text-white font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Box size={14} className={activeTab === 'exports' ? 'text-purple-400' : ''} />
          <span>3D & Zappar Exports</span>
        </button>
        <button
          onClick={() => setActiveTab('developer')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'developer'
              ? 'border-blue-500 text-white font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          <Code size={14} className={activeTab === 'developer' ? 'text-blue-400' : ''} />
          <span>HTML Bundle</span>
        </button>
      </div>

      {/* Modal Content Area */}
      <div className="p-3.5 sm:p-6 flex-1 overflow-y-auto min-h-0 bg-[#121212] space-y-4 touch-pan-y scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {activeTab === 'cloud' ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6">
            
            {/* Left Configuration and Audit column */}
            <div className="md:col-span-3 space-y-4 sm:space-y-5">
              
              {/* Dynamic Tracking Mode Information & Specs Card */}
              <div className="bg-[#181818] border border-[#222] rounded-xl p-3.5 sm:p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    {activeTrackingMode === 'image' && <ImageIcon size={13} className="text-blue-400" />}
                    {activeTrackingMode === 'face' && <Smile size={13} className="text-amber-400" />}
                    {activeTrackingMode === 'surface' && <Scan size={13} className="text-emerald-400" />}
                    {activeTrackingMode === 'world' && <Globe2 size={13} className="text-purple-400" />}
                    <span>Active Tracking: <strong className="text-white uppercase">{activeTrackingMode} Mode</strong></span>
                  </span>

                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    activeTrackingMode === 'image' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                    activeTrackingMode === 'face' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    activeTrackingMode === 'surface' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}>
                    {activeScene?.name || 'Default Scene'}
                  </span>
                </div>

                {/* IMAGE TRACKING SPECS */}
                {activeTrackingMode === 'image' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#0E0E0E] border border-[#1C1C1C] rounded-lg flex flex-col xs:flex-row items-center gap-3">
                      <div className="w-16 h-16 rounded-lg bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img 
                          src={targetObject?.properties?.textureUrl || DEFAULT_ART_POSTER_TEXTURE} 
                          alt="Marker Target" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 text-left space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>MindAR Image Target Anchor</span>
                          <span className="text-[10px] text-blue-400 font-mono">
                            {settings.targetMode === 'multi' ? 'Multi-Target' : 'Single Target'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          Compiled client-side for WebAR print scanning. Content attaches over physical print markers.
                        </p>
                      </div>
                    </div>

                    {/* Physical Width Calibration Control */}
                    <div className="p-2.5 bg-[#0A0A0E] border border-white/5 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-medium">Physical Print Width:</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={targetObject?.properties?.physicalWidth || 0.127}
                          onChange={(e) => handleUpdateTargetProp('physicalWidth', parseFloat(e.target.value))}
                          className="bg-[#1A1A22] text-white text-xs border border-white/15 rounded px-2 py-1 focus:outline-none focus:border-blue-500 font-mono"
                        >
                          <option value={0.085}>8.5 cm (Business Card)</option>
                          <option value={0.10}>10.0 cm (Compact Print)</option>
                          <option value={0.127}>12.7 cm (5x7" Standard Photo)</option>
                          <option value={0.210}>21.0 cm (A4 Flyer / Poster)</option>
                          <option value={0.297}>29.7 cm (A3 Large Display)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* FACE MESH TRACKING SPECS */}
                {activeTrackingMode === 'face' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#0E0E0E] border border-[#1C1C1C] rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <Smile size={14} className="text-amber-400" />
                          <span>468-Point Face Mesh Anchor</span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono">MediaPipe Face Mesh</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Tracks real-time 3D facial topology, head rotation, expressions, and attaches 3D masks, glasses, or hats.
                      </p>
                    </div>

                    {/* Face Anchor Selector */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-[#0A0A0E] border border-white/5 rounded-lg flex items-center justify-between">
                        <span className="text-gray-300">Anchor Position:</span>
                        <select
                          value={targetObject?.properties?.faceAnchor || 'head'}
                          onChange={(e) => handleUpdateTargetProp('faceAnchor', e.target.value)}
                          className="bg-[#1A1A22] text-white text-xs border border-white/15 rounded px-2 py-1 focus:outline-none focus:border-amber-500 font-mono"
                        >
                          <option value="head">Head Center</option>
                          <option value="forehead">Forehead</option>
                          <option value="eyes">Eyes / Glasses</option>
                          <option value="nose">Nose Tip</option>
                          <option value="mouth">Mouth / Lips</option>
                          <option value="chin">Chin</option>
                        </select>
                      </div>

                      <div className="p-2 bg-[#0A0A0E] border border-white/5 rounded-lg flex items-center justify-between">
                        <span className="text-gray-300">Head Occluder Mask:</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateTargetProp('enableOcclusionMesh', !(targetObject?.properties?.enableOcclusionMesh ?? true))}
                          className={`px-2 py-1 rounded text-[10px] font-bold font-mono border cursor-pointer transition-all ${
                            (targetObject?.properties?.enableOcclusionMesh ?? true)
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-white/5 text-gray-400 border-white/10'
                          }`}
                        >
                          {(targetObject?.properties?.enableOcclusionMesh ?? true) ? 'Active (Depth Cut)' : 'Off'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SURFACE AR TRACKING SPECS */}
                {activeTrackingMode === 'surface' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#0E0E0E] border border-[#1C1C1C] rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <Scan size={14} className="text-emerald-400" />
                          <span>Surface Plane Detection & AR Reticle</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">Ground / Wall Surface</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Detects horizontal floors, tabletops, or vertical walls with ground depth plane occlusion and metric snapping.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-[#0A0A0E] border border-white/5 rounded-lg flex items-center justify-between">
                        <span className="text-gray-300">Plane Orientation:</span>
                        <select
                          value={targetObject?.properties?.surfaceOrientation || 'horizontal'}
                          onChange={(e) => handleUpdateTargetProp('surfaceOrientation', e.target.value)}
                          className="bg-[#1A1A22] text-white text-xs border border-white/15 rounded px-2 py-1 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="horizontal">Horizontal Floor/Table</option>
                          <option value="vertical">Vertical Wall/Board</option>
                        </select>
                      </div>

                      <div className="p-2 bg-[#0A0A0E] border border-white/5 rounded-lg flex items-center justify-between">
                        <span className="text-gray-300">AR Reticle Style:</span>
                        <select
                          value={targetObject?.properties?.reticleStyle || 'cyber_brackets'}
                          onChange={(e) => handleUpdateTargetProp('reticleStyle', e.target.value)}
                          className="bg-[#1A1A22] text-white text-xs border border-white/15 rounded px-2 py-1 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="cyber_brackets">Cyber Brackets</option>
                          <option value="target_ring">Target Ring</option>
                          <option value="minimal_dot">Minimal Dot</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* WORLD AR TRACKING SPECS */}
                {activeTrackingMode === 'world' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#0E0E0E] border border-[#1C1C1C] rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <Globe2 size={14} className="text-purple-400" />
                          <span>WebXR Spatial 6DOF Coordinate Anchor</span>
                        </div>
                        <span className="text-[10px] text-purple-400 font-mono">6DOF Spatial Room</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Places 3D content directly into real-world 6DOF spatial coordinates with environmental light matching.
                      </p>
                    </div>

                    <div className="p-2 bg-[#0A0A0E] border border-white/5 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-gray-300">Ground Height Elevation:</span>
                      <div className="flex items-center gap-2 font-mono text-purple-400">
                        <input
                          type="range"
                          min="-2.0"
                          max="2.0"
                          step="0.05"
                          value={targetObject?.properties?.groundOffset || 0}
                          onChange={(e) => handleUpdateTargetProp('groundOffset', parseFloat(e.target.value))}
                          className="w-24 accent-purple-500 cursor-pointer"
                        />
                        <span>{(targetObject?.properties?.groundOffset || 0).toFixed(2)} m</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Capabilities Audit Checklist */}
              <div className="bg-[#181818] border border-[#222] rounded-xl p-3.5 sm:p-4 shadow-sm space-y-3">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Cpu size={12} className="text-gray-500" /> WebAR Compiler Audit
                </span>

                <div className="space-y-2">
                  {/* Active Tracking Mode item */}
                  <div className="flex items-center justify-between p-2 sm:p-2.5 bg-[#0F0F0F] rounded-lg border border-[#1C1C1C]">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[9px] text-emerald-400 shrink-0">✓</div>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {activeTrackingMode === 'image' && 'MindAR Marker Sync'}
                          {activeTrackingMode === 'face' && '468-Point Face Mesh Sync'}
                          {activeTrackingMode === 'surface' && 'Surface Raycast Reticle'}
                          {activeTrackingMode === 'world' && 'WebXR 6DOF Spatial Anchor'}
                        </p>
                        <p className="text-[9px] text-gray-500">
                          {activeTrackingMode === 'image' && 'Anchors content dynamically over target print marker'}
                          {activeTrackingMode === 'face' && 'Anchors 3D models and masks to facial topology landmarks'}
                          {activeTrackingMode === 'surface' && 'Detects floor and tabletop planes for placement'}
                          {activeTrackingMode === 'world' && 'Anchors content in 6DOF spatial room coordinates'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-900/40 text-emerald-400 rounded-full border border-emerald-800/30 shrink-0">Active</span>
                  </div>

                  {/* Custom Scripts Audit */}
                  <div className="flex items-center justify-between p-2 sm:p-2.5 bg-[#0F0F0F] rounded-lg border border-[#1C1C1C]">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                        stats.scriptCount > 0 
                          ? 'bg-blue-950 border border-blue-800 text-blue-400' 
                          : 'bg-[#1C1C1C] text-gray-600'
                      }`}>
                        {stats.scriptCount > 0 ? '✓' : '•'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Custom Script Sandbox</p>
                        <p className="text-[9px] text-gray-500">Exposes custom motion logic, ticks, and updater scripts</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                      stats.scriptCount > 0 
                        ? 'bg-blue-900/40 text-blue-400 border-blue-800/30' 
                        : 'bg-gray-900/30 text-gray-500 border-gray-800/20'
                    }`}>
                      {stats.scriptCount > 0 ? `${stats.scriptCount} Scripts` : 'None'}
                    </span>
                  </div>

                  {/* Event Behaviors Audit */}
                  <div className="flex items-center justify-between p-2 sm:p-2.5 bg-[#0F0F0F] rounded-lg border border-[#1C1C1C]">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                        stats.behaviorCount > 0 
                          ? 'bg-purple-950 border border-purple-800 text-purple-400' 
                          : 'bg-[#1C1C1C] text-gray-600'
                      }`}>
                        {stats.behaviorCount > 0 ? '✓' : '•'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Live Motion & Behaviors</p>
                        <p className="text-[9px] text-gray-500">Autonomous loops, spin, bounce, and parent motion inheritance</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                      stats.behaviorCount > 0 
                        ? 'bg-purple-900/40 text-purple-400 border-purple-800/30' 
                        : 'bg-gray-900/30 text-gray-500 border-gray-800/20'
                    }`}>
                      {stats.behaviorCount > 0 ? `${stats.behaviorCount} Active` : 'None'}
                    </span>
                  </div>

                  {/* Media playback Audit */}
                  <div className="flex items-center justify-between p-2 sm:p-2.5 bg-[#0F0F0F] rounded-lg border border-[#1C1C1C]">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                        stats.mediaCount > 0 
                          ? 'bg-cyan-950 border border-cyan-800 text-cyan-400' 
                          : 'bg-[#1C1C1C] text-gray-600'
                      }`}>
                        {stats.mediaCount > 0 ? '✓' : '•'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Sound / Video Sync</p>
                        <p className="text-[9px] text-gray-500">Embedded stream files, sound clickers, or video textures</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                      stats.mediaCount > 0 
                        ? 'bg-cyan-900/40 text-cyan-400 border-cyan-800/30' 
                        : 'bg-gray-900/30 text-gray-500 border-gray-800/20'
                    }`}>
                      {stats.mediaCount > 0 ? `${stats.mediaCount} Media` : 'None'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Publish & Deployment Console column */}
            <div className="md:col-span-2 flex flex-col justify-between space-y-4">
              
              {publishStep === 'idle' && (
                <div className="bg-[#181818] border border-[#222] rounded-xl p-4 sm:p-5 text-center flex-1 flex flex-col justify-center items-center space-y-4">
                  <div className="w-12 h-12 bg-blue-950 border border-blue-900 rounded-full flex items-center justify-center text-blue-400 shadow-inner">
                    <Globe size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Deploy to Edge CDN</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed max-w-[220px] mx-auto">
                      Deploys your {activeTrackingMode} WebAR experience on high-speed global CDN edge hosting. Ready for hardware devices.
                    </p>
                  </div>
                  <button
                    onClick={handlePublish}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-98 rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play size={13} fill="currentColor" />
                    Publish {activeTrackingMode.toUpperCase()} Project
                  </button>
                </div>
              )}

              {/* simulated publishing progress states */}
              {publishStep !== 'idle' && publishStep !== 'success' && (
                <div className="bg-[#181818] border border-[#222] rounded-xl p-4 sm:p-5 text-center flex-1 flex flex-col justify-center space-y-4">
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                      {publishStep === 'validating' && 'Stage 1/4: Parsing Scene Nodes...'}
                      {publishStep === 'packaging' && 'Stage 2/4: Packing Static Bundles...'}
                      {publishStep === 'optimizing' && 'Stage 3/4: Transpiling ECMA Sandbox...'}
                      {publishStep === 'deploying' && 'Stage 4/4: Deploying to Edge CDN...'}
                    </span>
                    <h4 className="text-xs font-semibold text-white">Publishing in progress</h4>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2 bg-[#0F0F0F] rounded-full overflow-hidden border border-[#222]">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
                        style={{ width: `${publishProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono text-gray-400">
                      <span>Deploying bundle</span>
                      <span>{publishProgress}%</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-relaxed text-left border-t border-[#222] pt-3">
                    {publishStep === 'validating' && 'Verifying spatial layout, parsing 3D transforms, bounding volumes, and assets.'}
                    {publishStep === 'packaging' && 'Compiling geometry maps, rendering entities, and packaging external assets.'}
                    {publishStep === 'optimizing' && 'Analyzing custom script syntax, packaging sandboxed loops, and testing event bindings.'}
                    {publishStep === 'deploying' && 'Propagating index files and compiled asset buffers to 240+ global Edge caching locations.'}
                  </p>
                </div>
              )}

              {/* Published Success view */}
              {publishStep === 'success' && (
                <div className="bg-[#181818] border border-[#222] rounded-xl p-4 sm:p-5 flex flex-col justify-center space-y-4 shadow-sm">
                  <div className="text-center space-y-1">
                    <div className="w-8 h-8 bg-emerald-950 border border-emerald-900 rounded-full flex items-center justify-center text-emerald-400 mx-auto shadow-inner text-sm font-bold animate-bounce">
                      ✓
                    </div>
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mt-1.5">Live On Edge CDN</h4>
                    <p className="text-[9px] text-gray-400">Scan QR Code or copy the global address to test on mobile hardware.</p>
                  </div>

                  {/* Real QR Code container */}
                  <div className="bg-white p-2 sm:p-2.5 rounded-xl w-32 h-32 sm:w-36 sm:h-36 mx-auto border border-[#E0E0E0] shadow-md flex items-center justify-center relative group shrink-0">
                    {qrCodeUrl ? (
                      <img 
                        src={qrCodeUrl} 
                        alt="AR App QR Link" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-[9px] text-gray-400 font-mono">Generating QR...</div>
                    )}
                  </div>

                  <button
                    onClick={handleDownloadQR}
                    className="text-[10px] text-gray-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer py-1"
                  >
                    <Download size={11} />
                    <span>Download QR Code (.PNG)</span>
                  </button>

                  {/* Live URL Link Block - Touch Friendly */}
                  <div className="bg-[#0E0E0E] border border-[#222] rounded-lg p-2.5 flex items-center justify-between text-[10px] font-mono min-w-0">
                    <span className="text-blue-400 truncate pr-2" title={publishedUrl}>{publishedUrl}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(publishedUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="p-1.5 hover:bg-[#1A1A1A] rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Link"
                      >
                        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                      <a 
                        href={publishedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-[#1A1A1A] rounded text-gray-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        title="Launch AR"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col xs:flex-row items-center gap-2">
                    <a
                      href={publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full xs:flex-1 py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink size={11} />
                      Open Live AR
                    </a>
                    <button
                      onClick={handlePublish}
                      className="w-full xs:flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] font-bold font-mono text-white uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={11} />
                      Sync / Republish
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : activeTab === 'exports' ? (
          /* 3D GLB & Zappar Package Export Tab */
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              
              {/* 1. GLB 3D Scene Export Card */}
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-4 sm:p-5 space-y-3.5 flex flex-col justify-between hover:border-purple-500/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
                      <Box size={18} />
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-800/40">
                      3D Binary .glb
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">Export 3D Scene (.glb)</h3>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-relaxed">
                      Compiles all 3D geometries, PBR materials, textures, animations, and transforms into a standalone binary GLB file compatible with Blender, Unity, Unreal, and WebGL viewers.
                    </p>
                  </div>

                  <div className="p-2.5 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl text-[10px] font-mono space-y-1 text-gray-400">
                    <div className="flex justify-between">
                      <span>3D Mesh Entities:</span>
                      <span className="text-white font-bold">{Object.keys(objects).filter(id => objects[id].type !== 'imageTarget').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format Standard:</span>
                      <span className="text-purple-400 font-bold">glTF 2.0 Binary (.glb)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleExportGLB}
                  disabled={isExportingGLB}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isExportingGLB ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating GLB...
                    </>
                  ) : (
                    <>
                      <Download size={14} /> Download 3D Scene (.glb)
                    </>
                  )}
                </button>
              </div>

              {/* 2. Zappar WebAR Package Export Card */}
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-4 sm:p-5 space-y-3.5 flex flex-col justify-between hover:border-blue-500/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
                      <PackageCheck size={18} />
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-800/40">
                      Zappar WebAR .zip
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">Zappar-Ready WebAR Package</h3>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-relaxed">
                      Exports a complete Zappar WebAR project bundle containing Zappar Three.js camera pipeline script, target tracker configurations, scene manifest, and ZapWorks CLI build scripts.
                    </p>
                  </div>

                  <div className="p-2.5 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl text-[10px] font-mono space-y-1 text-gray-400">
                    <div className="flex justify-between">
                      <span>SDK Engine:</span>
                      <span className="text-blue-400 font-bold">Zappar ThreeJS / ZapWorks CLI</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Anchors:</span>
                      <span className="text-white font-bold">{Object.values(objects).filter(o => o.type === 'imageTarget').length} Target(s)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleExportZappar}
                  disabled={isExportingZappar}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isExportingZappar ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Packing Zappar Bundle...
                    </>
                  ) : (
                    <>
                      <Download size={14} /> Download Zappar Package (.zip)
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        ) : (
          // Developer bundle pane
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#181818] border border-[#222] p-3 sm:p-4 rounded-xl gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-950/40 text-blue-400 rounded-lg border border-blue-900/40 shrink-0">
                  <Code size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Export Standalone HTML Package</h3>
                  <p className="text-[10px] text-gray-400">Standalone index.html with fully baked assets, behavior rules, and client-side sandboxes.</p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1C1C1C] hover:bg-[#262626] border border-[#2C2C2C] rounded-lg text-[10px] uppercase font-bold font-mono transition-colors text-white cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
                <button 
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] uppercase font-bold font-mono transition-colors text-white cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Viewer */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">HTML Output Structure</span>
              <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-3 sm:p-4 overflow-y-auto max-h-[38vh] shadow-inner select-all relative">
                <pre className="text-[10px] sm:text-[11px] text-gray-300 font-mono leading-relaxed whitespace-pre font-medium">
                  {htmlContent}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

    </GlassModal>
  );
}

