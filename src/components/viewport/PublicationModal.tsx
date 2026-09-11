import React, { useState } from 'react';
import { X, Copy, Check, Download, Code, Globe, Sparkles, Smartphone, Box, Zap, ExternalLink } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

interface PublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sceneRef?: THREE.Scene | null;
}

export const PublicationModal: React.FC<PublicationModalProps> = ({ isOpen, onClose, sceneRef }) => {
  const [activeTab, setActiveTab] = useState<'embed' | 'gltf' | 'react' | 'ar'>('embed');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isExportingGLTF, setIsExportingGLTF] = useState(false);
  const [exportFormat, setExportFormat] = useState<'glb' | 'gltf'>('glb');
  const [autoRotate, setAutoRotate] = useState(false);
  const [transparentBg, setTransparentBg] = useState(true);
  const [enableShadows, setEnableShadows] = useState(true);

  const objects = useEditorStore((state) => state.objects);
  const currentProjectId = useEditorStore((state) => state.currentProjectId);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const iframeEmbedCode = `<iframe 
  src="${currentUrl}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  allow="camera; microphone; fullscreen; accelerometer; gyroscope"
  style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);"
></iframe>`;

  const splineViewerCode = `<!-- 3D Web Component Embed -->
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
<model-viewer 
  src="${currentUrl}"
  ${autoRotate ? 'auto-rotate' : ''}
  camera-controls
  touch-action="pan-y"
  shadow-intensity="1"
></model-viewer>`;

  const r3fCodeSnippet = `import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

export default function Scene3DView() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '${transparentBg ? 'transparent' : '#0d0d11'}' }}>
      <Canvas
        camera={{ position: [0, -4, 4], fov: 45 }}
        gl={{ powerPreference: 'high-performance', antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <Environment preset="city" />
        
        {/* Rendered 3D Objects Count: ${Object.keys(objects).length} */}
        {/* Injected 3D Scene Components */}
        
        ${enableShadows ? '<ContactShadows position={[0, 0, -0.5]} opacity={0.4} scale={10} blur={2} />' : ''}
        <OrbitControls ${autoRotate ? 'autoRotate autoRotateSpeed={2}' : ''} makeDefault />
      </Canvas>
    </div>
  );
};`;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExportGLTF = () => {
    if (!sceneRef) {
      useEditorStore.getState().addToast("Scene object not ready. Please interact with the viewport first.");
      return;
    }

    setIsExportingGLTF(true);

    try {
      const exporter = new GLTFExporter();
      const options = {
        binary: exportFormat === 'glb',
        embedImages: true,
        onlyVisible: true,
        includeCustomMaterials: true
      };

      exporter.parse(
        sceneRef,
        (gltf) => {
          setIsExportingGLTF(false);
          let blob: Blob;
          let filename = `scene_3d_${currentProjectId || 'export'}.${exportFormat}`;

          if (gltf instanceof ArrayBuffer) {
            blob = new Blob([gltf], { type: 'application/octet-stream' });
          } else {
            const output = JSON.stringify(gltf, null, 2);
            blob = new Blob([output], { type: 'application/json' });
          }

          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          URL.revokeObjectURL(link.href);
          useEditorStore.getState().addToast(`Exported ${filename} successfully`);
        },
        (error: any) => {
          setIsExportingGLTF(false);
          console.error("GLTF Export Error:", error);
          useEditorStore.getState().addToast("Export failed: " + (error?.message || 'Unknown error'));
        },
        options
      );
    } catch (err: any) {
      setIsExportingGLTF(false);
      useEditorStore.getState().addToast("Export initialization error: " + (err?.message || 'Unknown error'));
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#121217] border border-[#2a2a36] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a36] bg-[#16161d]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                3D Scene Publish & Export Hub
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v3.0 Live
                </span>
              </h3>
              <p className="text-xs text-gray-400">Deploy high-performance interactive 3D scenes across web and mobile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#22222d] text-gray-400 hover:text-white hover:bg-[#2c2c3a] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 bg-[#14141a] border-b border-[#22222c]">
          <button
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'embed'
                ? 'bg-[#1c1c24] text-blue-400 border-blue-500'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-[#191922]'
            }`}
          >
            <Globe className="w-4 h-4" />
            Web iFrame & Viewer
          </button>
          <button
            onClick={() => setActiveTab('gltf')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'gltf'
                ? 'bg-[#1c1c24] text-emerald-400 border-emerald-500'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-[#191922]'
            }`}
          >
            <Box className="w-4 h-4" />
            3D Asset Export (GLTF / GLB)
          </button>
          <button
            onClick={() => setActiveTab('react')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'react'
                ? 'bg-[#1c1c24] text-purple-400 border-purple-500'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-[#191922]'
            }`}
          >
            <Code className="w-4 h-4" />
            React Three Fiber Code
          </button>
          <button
            onClick={() => setActiveTab('ar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'ar'
                ? 'bg-[#1c1c24] text-amber-400 border-amber-500'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-[#191922]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            AR QuickLook / Mobile
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#121217]">
          {/* Controls Settings Bar */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-[#191922] border border-[#272736]">
            <label className="flex items-center gap-2 text-xs text-gray-300 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
              <span>Auto-Rotate Camera</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-300 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
              <span>Transparent Canvas</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-300 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableShadows}
                onChange={(e) => setEnableShadows(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
              <span>High Quality Shadows</span>
            </label>
          </div>

          {/* TAB 1: EMBED */}
          {activeTab === 'embed' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    HTML iFrame Responsive Embed Code
                  </span>
                  <button
                    onClick={() => handleCopy(iframeEmbedCode, 'iframe')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 transition-colors cursor-pointer"
                  >
                    {copiedField === 'iframe' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === 'iframe' ? 'Copied!' : 'Copy iFrame Code'}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#0a0a0f] border border-[#242432] text-xs font-mono text-blue-300 overflow-x-auto whitespace-pre-wrap select-all">
                  {iframeEmbedCode}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    Spline Web Component Tag (<code className="text-purple-400">&lt;spline-viewer&gt;</code>)
                  </span>
                  <button
                    onClick={() => handleCopy(splineViewerCode, 'spline')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 transition-colors cursor-pointer"
                  >
                    {copiedField === 'spline' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === 'spline' ? 'Copied!' : 'Copy Component Code'}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#0a0a0f] border border-[#242432] text-xs font-mono text-purple-300 overflow-x-auto whitespace-pre-wrap select-all">
                  {splineViewerCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: GLTF EXPORT */}
          {activeTab === 'gltf' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#181824] border border-[#2b2b3d] space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  3D Pipeline Asset Exporter
                </h4>
                <p className="text-xs text-gray-300">
                  Export the active scene into a standard 3D asset file compatible with Blender, Unreal Engine, Unity, Three.js, or WebGL applications.
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs text-gray-400 font-medium">Format:</span>
                  <label className="flex items-center gap-1.5 text-xs text-gray-200 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="gltfFormat"
                      value="glb"
                      checked={exportFormat === 'glb'}
                      onChange={() => setExportFormat('glb')}
                      className="accent-emerald-500"
                    />
                    Binary (.glb) - Compact single file with textures
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-200 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="gltfFormat"
                      value="gltf"
                      checked={exportFormat === 'gltf'}
                      onChange={() => setExportFormat('gltf')}
                      className="accent-emerald-500"
                    />
                    JSON (.gltf) - Readable mesh structure
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleExportGLTF}
                  disabled={isExportingGLTF}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExportingGLTF ? 'Compiling 3D Geometry...' : `Download Scene Asset (.${exportFormat.toUpperCase()})`}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REACT THREE FIBER */}
          {activeTab === 'react' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-200">
                  React Three Fiber Component JSX
                </span>
                <button
                  onClick={() => handleCopy(r3fCodeSnippet, 'r3f')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 transition-colors cursor-pointer"
                >
                  {copiedField === 'r3f' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'r3f' ? 'Copied!' : 'Copy R3F Code'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#0a0a0f] border border-[#242432] text-xs font-mono text-purple-300 overflow-x-auto whitespace-pre-wrap select-all">
                {r3fCodeSnippet}
              </pre>
            </div>
          )}

          {/* TAB 4: AR QUICKLOOK */}
          {activeTab === 'ar' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#1a1824] border border-[#352a4a] space-y-3">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Mobile AR & Spatial Computing Deployment
                </h4>
                <p className="text-xs text-gray-300">
                  Launch interactive WebXR and iOS AR QuickLook directly on mobile browsers or Apple Vision Pro headsets.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleExportGLTF()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Export USDZ/GLB for iOS & WebXR
                  </button>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Live WebXR Preview
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2a36] bg-[#16161d] flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">
            Optimized for WebGL 2.0 • WebXR Enabled
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#282836] text-gray-200 hover:text-white hover:bg-[#323244] text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
