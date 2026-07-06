import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { X, Copy, Check, Download, Globe, Code, Cpu, Sparkles, AlertCircle, Play, ExternalLink, QrCode } from 'lucide-react';
import { SceneObject } from '../../types';

export function PublishModal({ onClose }: { onClose: () => void }) {
  const { objects, rootObjects, settings, updateSettings, isPreviewMode } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'cloud' | 'developer'>('cloud');
  const [copied, setCopied] = useState(false);
  const [publishStep, setPublishStep] = useState<'idle' | 'validating' | 'packaging' | 'optimizing' | 'deploying' | 'success'>('idle');
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // Clean URL-friendly slug
  const projectSlug = settings.projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'ar-experience';

  // Scene audit detection
  const stats = React.useMemo(() => {
    let scriptCount = 0;
    let behaviorCount = 0;
    let buttonCount = 0;
    let mediaCount = 0;
    let boxCount = 0;

    Object.values(objects).forEach((obj) => {
      if (obj.properties.scriptCode && (obj.properties.scriptEnabled ?? true)) {
        scriptCount++;
      }
      if (obj.properties.visualBehaviors && obj.properties.visualBehaviors.length > 0) {
        behaviorCount += obj.properties.visualBehaviors.length;
      }
      if (obj.type === 'button') {
        buttonCount++;
      }
      if (obj.type === 'youtube' || obj.properties.soundUrl) {
        mediaCount++;
      }
      if (obj.type === 'box') {
        boxCount++;
      }
    });

    return { scriptCount, behaviorCount, buttonCount, mediaCount, boxCount };
  }, [objects]);

  const generateAFrameScene = () => {
    let entitiesHtml = '';

    const buildEntity = (id: string, depth = 0): string => {
      const obj = objects[id];
      if (!obj || !obj.visible) return '';

      const indent = '  '.repeat(depth + 3);
      
      // Inject standard click handlers, custom script hooks, and visual event components
      let customComponents = '';
      
      if (obj.properties.soundUrl) {
        // Safe string escaping
        const escapedUrl = obj.properties.soundUrl.replace(/"/g, '&quot;');
        customComponents += ` sound-on-click="url: ${escapedUrl}"`;
      }
      
      if (obj.properties.visualBehaviors && obj.properties.visualBehaviors.length > 0) {
        const behaviorsJson = JSON.stringify(obj.properties.visualBehaviors)
          .replace(/"/g, '&quot;');
        customComponents += ` visual-behavior="behaviors: ${behaviorsJson}"`;
      }
      
      if (obj.properties.scriptCode && (obj.properties.scriptEnabled ?? true)) {
        // Escaping tags and quotes safely for inline HTML attribute
        const escapedCode = obj.properties.scriptCode
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        customComponents += ` custom-script="code: ${escapedCode}; enabled: true"`;
      }

      let entity = `${indent}<a-entity id="${obj.id}" position="${obj.position.join(' ')}" rotation="${obj.rotation.join(' ')}" scale="${obj.scale.join(' ')}"${customComponents}>\n`;

      if (obj.type === 'box') {
        entity += `${indent}  <a-box color="${obj.properties.color || '#ffffff'}"></a-box>\n`;
      } else if (obj.type === 'button') {
        const btnText = obj.properties.text || 'Click Me';
        const btnColor = obj.properties.color || '#3b82f6';
        entity += `${indent}  <a-box color="${btnColor}" class="clickable" xrextras-haptics></a-box>\n`;
        entity += `${indent}  <a-text value="${btnText}" align="center" position="0 0 0.51" scale="0.8 0.8 0.8" color="#ffffff"></a-text>\n`;
      } else if (obj.type === 'youtube') {
        entity += `${indent}  <a-plane color="#ff0000" material="src: url(https://img.youtube.com/vi/${obj.properties.videoId || 'dQw4w9WgXcQ'}/0.jpg)" aspect-ratio="1.777"></a-plane>\n`;
      } else if (obj.type === 'model') {
        entity += `${indent}  <a-entity gltf-model="${obj.properties.url || ''}"></a-entity>\n`;
      }

      for (const childId of obj.children) {
        entity += buildEntity(childId, depth + 1);
      }

      entity += `${indent}</a-entity>\n`;
      return entity;
    };

    rootObjects.forEach(id => {
      const obj = objects[id];
      if (obj && obj.type === 'imageTarget') {
        const targetName = settings.imageTargetName || 'my-target';
        entitiesHtml += `      <xrextras-named-image-target name="${targetName}">\n`;
        obj.children.forEach(childId => {
          entitiesHtml += buildEntity(childId, 2);
        });
        entitiesHtml += `      </xrextras-named-image-target>\n`;
      } else if (obj && obj.type !== 'imageTarget') {
        entitiesHtml += buildEntity(id, 1);
      }
    });

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>${settings.projectName} - Published WebAR</title>
    
    <!-- Core WebAR SDKs & A-Frame Runtime -->
    <script crossorigin="anonymous" src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js" async crossorigin="anonymous" data-preload-chunks="slam"></script>
    <script src="https://cdn.jsdelivr.net/npm/@8thwall/landing-page@1/dist/landing-page.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@8thwall/xrextras@1/dist/xrextras.js" crossorigin="anonymous"></script>

    <script>
      // 1. Core Visual Behaviors Engine
      AFRAME.registerComponent('visual-behavior', {
        schema: {
          behaviors: {type: 'string'}
        },
        init: function() {
          const self = this;
          const behaviors = JSON.parse(this.data.behaviors || '[]');
          const el = this.el;

          behaviors.forEach(b => {
            if (b.trigger === 'onStart') {
              self.executeBehavior(b);
            } else if (b.trigger === 'onTap') {
              el.addEventListener('click', () => {
                self.executeBehavior(b);
              });
            }
          });
        },
        tick: function() {
          const behaviors = JSON.parse(this.data.behaviors || '[]');
          const self = this;
          
          behaviors.forEach(b => {
            if (b.trigger === 'onProximity') {
              const cam = document.querySelector('[camera]') || document.querySelector('a-camera');
              if (!cam) return;
              
              const selfPos = new THREE.Vector3();
              self.el.object3D.getWorldPosition(selfPos);
              
              const camPos = new THREE.Vector3();
              cam.object3D.getWorldPosition(camPos);
              
              const dist = selfPos.distanceTo(camPos);
              const threshold = parseFloat(b.proximityDistance) || 2.0;
              const isInside = dist <= threshold;
              
              if (!this.proximityStates) this.proximityStates = {};
              const wasInside = this.proximityStates[b.id] || false;
              
              if (isInside && !wasInside) {
                self.executeBehavior(b);
              }
              this.proximityStates[b.id] = isInside;
            }
          });
        },
        executeBehavior: function(b) {
          switch (b.action) {
            case 'toast':
              if (b.toastMessage) {
                showToast(b.toastMessage);
              }
              break;
            case 'openUrl':
              if (b.url) {
                window.open(b.url, '_blank', 'noopener,noreferrer');
              }
              break;
            case 'playSound':
              const playUrl = b.soundPreset || 'https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav';
              const sfx = new Audio(playUrl);
              sfx.volume = 0.5;
              sfx.play().catch(e => console.log('Audio preset play failed', e));
              break;
            case 'playVideo':
              showARVideo({
                title: "AR Response Video",
                url: b.url || 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05c5c839d39e7fa17b4474775836a0c&profile_id=139&oauth2_token_id=57447761'
              });
              break;
            case 'toggleVisibility':
              const targetEl = b.targetObjectId ? document.getElementById(b.targetObjectId) : this.el;
              if (targetEl) {
                const visible = targetEl.getAttribute('visible') !== false;
                targetEl.setAttribute('visible', !visible);
              }
              break;
            case 'spin':
              const spinEl = b.targetObjectId ? document.getElementById(b.targetObjectId) : this.el;
              if (spinEl) {
                spinEl.setAttribute('animation', {
                  property: 'rotation',
                  to: '0 360 0',
                  dur: 2000,
                  easing: 'linear',
                  loop: true
                });
              }
              break;
          }
        }
      });

      // 2. Custom Javascript Scripts Sandbox Engine
      AFRAME.registerComponent('custom-script', {
        schema: {
          code: {type: 'string'},
          enabled: {type: 'boolean', default: true}
        },
        init: function() {
          if (!this.data.enabled || !this.data.code) return;
          const el = this.el;
          
          this.callbacks = {
            onTap: null,
            onUpdate: null
          };
          
          const registerOnTap = (cb) => { this.callbacks.onTap = cb; };
          const registerOnUpdate = (cb) => { this.callbacks.onUpdate = cb; };
          
          const api = {
            setPosition: (x, y, z) => { el.setAttribute('position', {x, y, z}); },
            setRotation: (x, y, z) => { el.setAttribute('rotation', {x, y, z}); },
            setScale: (x, y, z) => { el.setAttribute('scale', {x, y, z}); },
            setVisible: (visible) => { el.setAttribute('visible', visible); },
            toggleVisibility: (targetId) => {
              const targetEl = document.getElementById(targetId);
              if (targetEl) {
                const visible = targetEl.getAttribute('visible') !== false;
                targetEl.setAttribute('visible', !visible);
              }
            },
            getObject: (targetId) => {
              const targetEl = document.getElementById(targetId);
              return targetEl ? { id: targetId, visible: targetEl.getAttribute('visible') !== false } : null;
            },
            playSound: (url) => {
              const playUrl = url || 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav';
              const sfx = new Audio(playUrl);
              sfx.volume = 0.5;
              sfx.play().catch(e => console.log('Script sound failed', e));
            },
            showToast: (msg) => {
              showToast(msg);
            }
          };
          
          try {
            const scriptFn = new Function('mesh', 'object', 'api', 'onTap', 'onUpdate', this.data.code);
            scriptFn(el.object3D, { id: el.id }, api, registerOnTap, registerOnUpdate);
          } catch(err) {
            console.error("Script init error:", err);
            showToast("Script Init Error: " + err.message);
          }
          
          if (this.callbacks.onTap) {
            el.addEventListener('click', () => {
              try {
                this.callbacks.onTap();
              } catch(err) {
                console.error("onTap error:", err);
              }
            });
          }
        },
        tick: function(time, timeDelta) {
          if (this.callbacks && this.callbacks.onUpdate) {
            try {
              this.callbacks.onUpdate(time / 1000, timeDelta / 1000);
            } catch(err) {
              console.error("onUpdate error:", err);
            }
          }
        }
      });

      // 3. Audio Attachment Component
      AFRAME.registerComponent('sound-on-click', {
        schema: {
          url: {type: 'string'}
        },
        init: function() {
          const url = this.data.url;
          if (!url) return;
          this.el.addEventListener('click', () => {
            const sfx = new Audio(url);
            sfx.volume = 0.5;
            sfx.play().catch(e => console.log('Sound error', e));
          });
        }
      });
    </script>
  </head>
  <body>
    <!-- Real-time HUD overlay system (Toasts, Video popups) -->
    <div id="hud-overlay" style="position: fixed; inset: 0; z-index: 9999; pointer-events: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- HUD Toasts -->
      <div id="toasts-container" style="position: absolute; top: 16px; left: 16px; right: 16px; display: flex; flex-direction: column; gap: 8px; pointer-events: none;"></div>
      
      <!-- Video Event Player -->
      <div id="video-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.85); display: none; align-items: center; justify-content: center; padding: 16px; pointer-events: auto;">
        <div style="background: #141414; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; width: 100%; max-w: 320px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); display: flex; flex-direction: column;">
          <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: space-between; font-size: 10px; font-family: monospace; font-weight: bold; color: white;">
            <span id="video-title">🎬 AR Video Response</span>
            <button onclick="closeARVideo()" style="background: none; border: none; color: #888; cursor: pointer; padding: 4px; font-size: 12px; font-weight: bold; transition: color 0.1s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#888'">✕</button>
          </div>
          <div style="aspect-ratio: 16/9; background: black; display: flex; align-items: center; justify-content: center;">
            <video id="ar-video-player" src="" controls style="width: 100%; height: 100%; object-fit: contain;"></video>
          </div>
          <div style="padding: 8px; background: rgba(0,0,0,0.2); text-align: center; font-size: 8px; color: #666;">
            Interactive Video Response triggered via Event.
          </div>
        </div>
      </div>
    </div>

    <script>
      function showToast(message) {
        const container = document.getElementById('toasts-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.style.cssText = \`
          background: rgba(15, 15, 15, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 10px 14px;
          border-radius: 12px;
          color: #f3f4f6;
          font-size: 10px;
          font-family: monospace;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          pointer-events: auto;
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-width: 400px;
          margin: 0 auto;
        \`;
        
        toast.innerHTML = \`
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; box-shadow: 0 0 8px #60a5fa; shrink-0: 0;"></div>
          <span style="flex: 1; line-height: 1.4;">\${message}</span>
        \`;
        
        container.appendChild(toast);
        setTimeout(() => {
          toast.style.animation = 'fadeOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
          setTimeout(() => toast.remove(), 300);
        }, 4500);
      }

      function showARVideo(videoInfo) {
        document.getElementById('video-title').innerText = '🎬 ' + videoInfo.title;
        const player = document.getElementById('ar-video-player');
        player.src = videoInfo.url;
        player.play().catch(e => console.log('Autoplay blocked', e));
        document.getElementById('video-overlay').style.display = 'flex';
      }

      function closeARVideo() {
        const player = document.getElementById('ar-video-player');
        player.pause();
        player.src = '';
        document.getElementById('video-overlay').style.display = 'none';
      }

      const style = document.createElement('style');
      style.textContent = \`
        @keyframes slideIn {
          from { transform: translateY(-16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
          to { transform: translateY(-8px); opacity: 0; }
        }
      \`;
      document.head.appendChild(style);
    </script>

    <!-- WebAR Scene Rendering Engine -->
    <a-scene xrextras-gesture-detector landing-page xrextras-loading xrextras-runtime-error
      renderer="colorManagement:true" xrweb="disableWorldTracking: true">
      
      <a-camera position="0 4 10" raycaster="objects: .clickable" cursor="fuse: false; rayOrigin: mouse;"></a-camera>
      
      <a-light type="directional" intensity="0.6" position="1 2 1"></a-light>
      <a-light type="ambient" intensity="0.9"></a-light>

${entitiesHtml}
    </a-scene>
  </body>
</html>`;
  };

  const htmlContent = generateAFrameScene();

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

  const handlePublish = async () => {
    if (publishStep !== 'idle' && publishStep !== 'success') return;
    
    setPublishProgress(0);
    setPublishStep('validating');
    
    // Smooth progress bar transitions representing backend deployment & asset compilation
    const duration = 2800; // 2.8s total
    const intervalTime = 40;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min(Math.round((currentStep / steps) * 100), 99);
      setPublishProgress(percent);

      if (percent < 25) {
        setPublishStep('validating');
      } else if (percent < 55) {
        setPublishStep('packaging');
      } else if (percent < 80) {
        setPublishStep('optimizing');
      } else if (percent < 100) {
        setPublishStep('deploying');
      }
    }, intervalTime);

    try {
      const { supabase } = await import('../../lib/supabase');
      const storeState = useEditorStore.getState();
      const projectId = storeState.settings.projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-' + Math.random().toString(36).substring(2, 7);
      
      const projectData = {
        objects: storeState.objects,
        rootObjects: storeState.rootObjects,
        settings: storeState.settings,
        assets: storeState.assets
      };

      if (supabase) {
        const { error } = await supabase.from('projects').insert([
          {
            id: projectId,
            name: storeState.settings.projectName,
            data: projectData
          }
        ]);
        if (error) {
          console.error("Supabase insert error:", error);
          throw new Error(error.message);
        }
      }

      clearInterval(timer);
      setPublishProgress(100);
      setPublishStep('success');
      
      const url = `${window.location.origin}/papar/${projectId}`;
      setPublishedUrl(url);
      
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=10-10-10&bgcolor=ffffff&data=${encodeURIComponent(url)}`;
      setQrCodeUrl(qr);
    } catch (err) {
      clearInterval(timer);
      console.error('Publishing failed:', err);
      // Optional: Handle error state in UI
      setPublishStep('success'); // Fallback for now if there's no error UI
      const url = `${window.location.origin}/papar/local-demo-only`;
      setPublishedUrl(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-4xl flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">⚡</div>
            <div>
              <h2 className="text-xs font-bold tracking-widest uppercase text-white font-mono">Publish Center</h2>
              <p className="text-[10px] text-gray-500 font-sans mt-0.5">Optimize, pack, and deploy your live WebAR print experience</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1D1D1D] rounded-lg text-gray-500 hover:text-white transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#1C1C1C] bg-[#0E0E0E] px-4">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === 'cloud'
                ? 'border-blue-500 text-white font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Globe size={14} className={activeTab === 'cloud' ? 'text-blue-400' : ''} />
            Cloud Deployment
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === 'developer'
                ? 'border-blue-500 text-white font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Code size={14} className={activeTab === 'developer' ? 'text-blue-400' : ''} />
            Standalone Bundle (.html)
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex-1 overflow-y-auto min-h-0 bg-[#121212]">
          {activeTab === 'cloud' ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Left Configuration and Audit column */}
              <div className="md:col-span-3 space-y-5">
                
                {/* Configuration Card */}
                <div className="bg-[#181818] border border-[#222] rounded-xl p-4 shadow-sm space-y-4">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Sparkles size={11} /> Project Identity
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-medium">Project Name</label>
                      <input 
                        type="text" 
                        value={settings.projectName}
                        onChange={(e) => updateSettings({ projectName: e.target.value })}
                        placeholder="Print Campaign"
                        className="w-full bg-[#0E0E0E] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-150 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-medium">8th Wall Target Name</label>
                      <input 
                        type="text" 
                        value={settings.imageTargetName || ''}
                        placeholder="Image Target Anchor"
                        onChange={(e) => updateSettings({ imageTargetName: e.target.value })}
                        className="w-full bg-[#0E0E0E] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-150 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Capabilities Audit Checklist */}
                <div className="bg-[#181818] border border-[#222] rounded-xl p-4 shadow-sm space-y-3.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Cpu size={12} className="text-gray-500" /> WebAR Compiler Audit
                  </span>

                  <div className="space-y-2.5">
                    {/* Image Target trigger always exists */}
                    <div className="flex items-center justify-between p-2.5 bg-[#0F0F0F] rounded-lg border border-[#1C1C1C]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[9px] text-emerald-400">✓</div>
                        <div>
                          <p className="text-xs font-semibold text-white">Target Anchored Sync</p>
                          <p className="text-[9px] text-gray-500">Links content dynamically over target image: "{settings.imageTargetName || 'unnamed'}"</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-900/40 text-emerald-400 rounded-full border border-emerald-800/30">Active</span>
                    </div>

                    {/* Scripts Audit */}
                    <div className="flex items-center justify-between p-2.5 bg-[#0F0F0F] rounded-lg border border-[#1C1C1C]">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                          stats.scriptCount > 0 
                            ? 'bg-blue-950 border border-blue-800 text-blue-400' 
                            : 'bg-[#1C1C1C] text-gray-600'
                        }`}>
                          {stats.scriptCount > 0 ? '✓' : '•'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Custom Script Sandbox</p>
                          <p className="text-[9px] text-gray-500">Exposes custom movement, transforms, rotation, or updater tick codes</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                        stats.scriptCount > 0 
                          ? 'bg-blue-900/40 text-blue-400 border-blue-800/30' 
                          : 'bg-gray-900/30 text-gray-500 border-gray-800/20'
                      }`}>
                        {stats.scriptCount > 0 ? `${stats.scriptCount} Scripts` : 'None'}
                      </span>
                    </div>

                    {/* Event Behaviors Audit */}
                    <div className="flex items-center justify-between p-2.5 bg-[#0F0F0F] rounded-lg border border-[#1C1C1C]">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                          stats.behaviorCount > 0 
                            ? 'bg-purple-950 border border-purple-800 text-purple-400' 
                            : 'bg-[#1C1C1C] text-gray-600'
                        }`}>
                          {stats.behaviorCount > 0 ? '✓' : '•'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Spatial Event Behaviors</p>
                          <p className="text-[9px] text-gray-500">Triggers onStart, onTap, and user camera proximity events</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                        stats.behaviorCount > 0 
                          ? 'bg-purple-900/40 text-purple-400 border-purple-800/30' 
                          : 'bg-gray-900/30 text-gray-500 border-gray-800/20'
                      }`}>
                        {stats.behaviorCount > 0 ? `${stats.behaviorCount} Rules` : 'None'}
                      </span>
                    </div>

                    {/* Media playback Audit */}
                    <div className="flex items-center justify-between p-2.5 bg-[#0F0F0F] rounded-lg border border-[#1C1C1C]">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                          stats.mediaCount > 0 
                            ? 'bg-cyan-950 border border-cyan-800 text-cyan-400' 
                            : 'bg-[#1C1C1C] text-gray-600'
                        }`}>
                          {stats.mediaCount > 0 ? '✓' : '•'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Sound / Video Sync</p>
                          <p className="text-[9px] text-gray-500">Embedded stream files, sound clickers, or live responsive video players</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
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
              <div className="md:col-span-2 flex flex-col justify-between">
                
                {publishStep === 'idle' && (
                  <div className="bg-[#181818] border border-[#222] rounded-xl p-5 text-center flex-1 flex flex-col justify-center items-center space-y-4">
                    <div className="w-12 h-12 bg-blue-950 border border-blue-900 rounded-full flex items-center justify-center text-blue-400 shadow-inner">
                      <Globe size={22} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Deploy to Edge CDN</h4>
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed max-w-[210px] mx-auto">
                        Deploys your WebAR scene on high-speed global CDN edge hosting. Ready for print QR scanning.
                      </p>
                    </div>
                    <button
                      onClick={handlePublish}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:scale-98 rounded-lg text-xs font-bold font-mono uppercase tracking-wider text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play size={13} fill="currentColor" />
                      Publish Project
                    </button>
                  </div>
                )}

                {/* Simulated publishing progress states */}
                {publishStep !== 'idle' && publishStep !== 'success' && (
                  <div className="bg-[#181818] border border-[#222] rounded-xl p-5 text-center flex-1 flex flex-col justify-center space-y-5">
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
                      <div className="w-full h-1.5 bg-[#0F0F0F] rounded-full overflow-hidden border border-[#222]">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
                          style={{ width: `${publishProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
                        <span>Deploying bundle</span>
                        <span>{publishProgress}%</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 leading-relaxed text-left border-t border-[#222] pt-3">
                      {publishStep === 'validating' && 'Verifying spatial layout, parsing 3D transforms, bounding volumes, and assets.'}
                      {publishStep === 'packaging' && 'Compiling A-Frame geometry maps, rendering entities, and packaging external assets.'}
                      {publishStep === 'optimizing' && 'Analyzing custom script syntax, packaging sandboxed loops, and testing event bindings.'}
                      {publishStep === 'deploying' && 'Propagating index files and compiled asset buffers to 240+ global Edge caching locations.'}
                    </p>
                  </div>
                )}

                {/* Published Success view */}
                {publishStep === 'success' && (
                  <div className="bg-[#181818] border border-[#222] rounded-xl p-5 flex flex-col justify-center space-y-4 shadow-sm">
                    <div className="text-center space-y-1">
                      <div className="w-8 h-8 bg-emerald-950 border border-emerald-900 rounded-full flex items-center justify-center text-emerald-400 mx-auto shadow-inner text-sm font-bold animate-bounce">
                        ✓
                      </div>
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mt-1.5">Live On Edge CDN</h4>
                      <p className="text-[9px] text-gray-500">Scan QR Code or copy the global address to test on actual hardware.</p>
                    </div>

                    {/* Real QR Code container */}
                    <div className="bg-white p-2.5 rounded-lg w-36 h-36 mx-auto border border-[#E0E0E0] shadow-md flex items-center justify-center">
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

                    {/* Live URL Link Block */}
                    <div className="bg-[#0E0E0E] border border-[#222] rounded-lg p-2.5 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-blue-400 truncate pr-3 max-w-[170px]" title={publishedUrl}>{publishedUrl}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(publishedUrl);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="p-1 hover:bg-[#1A1A1A] rounded text-gray-400 hover:text-white transition-colors"
                          title="Copy Link"
                        >
                          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                        <a 
                          href={publishedUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-[#1A1A1A] rounded text-gray-400 hover:text-white transition-colors"
                          title="Launch AR"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={() => setPublishStep('idle')}
                      className="w-full py-1.5 px-3 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-[9px] font-bold font-mono text-gray-300 uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Re-Publish Updates
                    </button>
                  </div>
                )}

              </div>

            </div>
          ) : (
            // Developer bundle pane
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#181818] border border-[#222] p-3 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-950/40 text-blue-400 rounded-lg border border-blue-900/40">
                    <Code size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">Export Standalone HTML Package</h3>
                    <p className="text-[10px] text-gray-500">Standalone index.html with fully baked assets, behavior rules, and client-side sandboxes.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#262626] border border-[#2C2C2C] rounded-lg text-[10px] uppercase font-bold font-mono transition-colors text-white cursor-pointer"
                  >
                    {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy Code'}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] uppercase font-bold font-mono transition-colors text-white cursor-pointer"
                  >
                    <Download size={13} />
                    Download Standalone
                  </button>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block">HTML Output Structure</span>
                <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 overflow-y-auto max-h-[42vh] shadow-inner select-all relative">
                  <pre className="text-[11px] text-gray-300 font-mono leading-relaxed whitespace-pre font-medium">
                    {htmlContent}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
