
import { Vector3Data } from '../types';

export const generateAFrameScene = (state: any) => {
  const { objects, rootObjects, settings } = state;
  const imageTargetObj = Object.values(objects).find((o: any) => o.type === 'imageTarget') as any;
  const targetImageUrl = imageTargetObj?.properties?.textureUrl || '';
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
    <title>\${settings.projectName} - Published WebAR</title>

    <!-- Global Mobile Console Logger Interceptor -->
    <script>
      (function() {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        const logsBuffer = [];

        window.__logsBuffer = logsBuffer;

        const addLog = (type, args) => {
          const message = args.map(arg => {
            if (arg === null) return 'null';
            if (arg === undefined) return 'undefined';
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg);
              } catch (e) {
                return String(arg);
              }
            }
            return String(arg);
          }).join(' ');
          
          logsBuffer.push({ type, message, time: new Date().toLocaleTimeString() });
          if (logsBuffer.length > 300) {
            logsBuffer.shift();
          }
          if (typeof updateConsoleUI === 'function') {
            const panel = document.getElementById('debug-log-panel');
            if (panel && panel.style.display === 'flex') {
              updateConsoleUI();
            }
          }
        };

        console.log = function(...args) {
          originalLog.apply(console, args);
          addLog('log', args);
        };
        console.warn = function(...args) {
          originalWarn.apply(console, args);
          addLog('warn', args);
        };
        console.error = function(...args) {
          originalError.apply(console, args);
          addLog('error', args);
        };

        window.addEventListener('error', function(e) {
          addLog('error', [e.message + ' (' + e.filename + ':' + e.lineno + ')']);
        });
        
        window.addEventListener('unhandledrejection', function(e) {
          addLog('error', ['Unhandled Promise Rejection: ' + (e.reason ? e.reason.message || e.reason : e)]);
        });
      })();
    </script>
    
    <!-- Core WebAR SDKs & A-Frame Runtime -->
    <script crossorigin="anonymous" src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js" crossorigin="anonymous" data-preload-chunks="slam"></script>
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
      
      <!-- Mobile Debug Console Toggle -->
      <button id="debug-toggle-btn" style="position: absolute; bottom: 85px; right: 16px; width: 44px; height: 44px; border-radius: 22px; background: rgba(15, 15, 15, 0.85); border: 1px solid rgba(255,255,255,0.15); color: #fbbf24; z-index: 100000; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.5); backdrop-filter: blur(8px); pointer-events: auto; outline: none; transition: transform 0.1s active;" onclick="toggleDebugConsole()">🐞</button>

      <!-- Mobile System Log Console Panel -->
      <div id="debug-log-panel" style="position: absolute; bottom: 0; left: 0; right: 0; height: 45vh; background: rgba(10, 10, 10, 0.95); border-top: 1px solid rgba(255,255,255,0.15); box-shadow: 0 -10px 30px rgba(0,0,0,0.8); z-index: 100001; display: none; flex-direction: column; font-family: monospace; color: #e5e7eb; backdrop-filter: blur(16px); pointer-events: auto;">
        <div style="padding: 10px 16px; background: rgba(0,0,0,0.6); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: bold; text-transform: uppercase;">
          <span style="color: #fbbf24; display: flex; align-items: center; gap: 6px;">🐞 Device Debug Log</span>
          <div style="display: flex; gap: 8px;">
            <button onclick="clearDebugLogs()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 4px 10px; border-radius: 6px; font-size: 9px; cursor: pointer; text-transform: uppercase; font-weight: bold;">Clear</button>
            <button onclick="toggleDebugConsole()" style="background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; padding: 4px 10px; border-radius: 6px; font-size: 9px; cursor: pointer; text-transform: uppercase; font-weight: bold;">Close</button>
          </div>
        </div>
        <div id="debug-log-list" style="flex: 1; overflow-y: auto; padding: 12px; font-size: 9px; line-height: 1.4; display: flex; flex-direction: column; gap: 4px; font-family: monospace; -webkit-overflow-scrolling: touch;"></div>
      </div>

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

      <!-- Image Target Scanner Overlay -->
      <div id="scanner-overlay" style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.45); z-index: 9998; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; transition: opacity 0.4s ease-in-out; opacity: 1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Reticle Scanner Box -->
        <div style="position: relative; width: 250px; height: 250px; border: 2px solid rgba(251, 191, 36, 0.35); border-radius: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(0,0,0,0.5); background: rgba(0,0,0,0.15);">
          <!-- Corners -->
          <div style="position: absolute; top: -2px; left: -2px; width: 24px; height: 24px; border-top: 4px solid #fbbf24; border-left: 4px solid #fbbf24; border-top-left-radius: 24px;"></div>
          <div style="position: absolute; top: -2px; right: -2px; width: 24px; height: 24px; border-top: 4px solid #fbbf24; border-right: 4px solid #fbbf24; border-top-right-radius: 24px;"></div>
          <div style="position: absolute; bottom: -2px; left: -2px; width: 24px; height: 24px; border-bottom: 4px solid #fbbf24; border-left: 4px solid #fbbf24; border-bottom-left-radius: 24px;"></div>
          <div style="position: absolute; bottom: -2px; right: -2px; width: 24px; height: 24px; border-bottom: 4px solid #fbbf24; border-right: 4px solid #fbbf24; border-bottom-right-radius: 24px;"></div>
          
          <!-- Laser Line -->
          <div style="position: absolute; left: 8px; right: 8px; height: 3px; background: linear-gradient(90deg, transparent, #fbbf24, transparent); box-shadow: 0 0 10px #fbbf24, 0 0 16px #fbbf24; animation: scanLine 2.5s ease-in-out infinite;"></div>
          
          <!-- Pulsing Eye/Finder icon -->
          <div style="color: rgba(251, 191, 36, 0.6); font-size: 32px; animation: pulseReticle 1.5s ease-in-out infinite;">🔍</div>
        </div>

        <!-- Guidance Text -->
        <div style="margin-top: 24px; text-align: center; color: white; padding: 0 24px; max-width: 280px; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
          <h3 style="margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #fbbf24;">Point at Marker Image</h3>
          <p style="margin: 6px 0 0 0; font-size: 10px; opacity: 0.75; line-height: 1.4;">Position the printed marker in the viewfinder above to trigger the interactive experience.</p>
        </div>

        <!-- Mini Preview Thumbnail -->
        ${targetImageUrl ? `
        <div style="margin-top: 20px; background: rgba(15, 15, 15, 0.9); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 8px; display: flex; flex-direction: column; align-items: center; gap: 4px; box-shadow: 0 8px 20px rgba(0,0,0,0.4); pointer-events: none;">
          <span style="font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #fbbf24; opacity: 0.8;">Target Image to Scan:</span>
          <img src="${targetImageUrl}" style="width: 70px; height: 70px; object-fit: contain; border-radius: 6px; background: #000;" />
        </div>
        ` : ''}
      </div>
    </div>

    <script>
      function updateConsoleUI() {
        const list = document.getElementById('debug-log-list');
        if (!list) return;
        list.innerHTML = (window.__logsBuffer || []).map(item => {
          let color = '#a3a3a3'; // log
          let bg = 'transparent';
          let icon = '•';
          if (item.type === 'warn') {
            color = '#fbbf24'; // warn
            icon = '⚠️';
          } else if (item.type === 'error') {
            color = '#f87171'; // error
            bg = 'rgba(239, 68, 68, 0.08)';
            icon = '❌';
          }
          return '<div style="padding: 4px 6px; border-radius: 4px; background: ' + bg + '; color: ' + color + '; word-break: break-all; border-left: 2px solid ' + (color === '#a3a3a3' ? 'rgba(255,255,255,0.1)' : color) + '; display: flex; gap: 6px; align-items: flex-start;">' +
            '<span style="opacity: 0.4; font-size: 8px; flex-shrink: 0;">[' + item.time + ']</span>' +
            '<span style="flex-shrink: 0;">' + icon + '</span>' +
            '<span style="white-space: pre-wrap; font-family: monospace;">' + item.message + '</span>' +
          '</div>';
        }).join('');
        list.scrollTop = list.scrollHeight;
      }

      function toggleDebugConsole() {
        const panel = document.getElementById('debug-log-panel');
        if (!panel) return;
        if (panel.style.display === 'none' || !panel.style.display) {
          panel.style.display = 'flex';
          updateConsoleUI();
        } else {
          panel.style.display = 'none';
        }
      }

      function clearDebugLogs() {
        if (window.__logsBuffer) {
          window.__logsBuffer.length = 0;
        }
        updateConsoleUI();
      }

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
        @keyframes scanLine {
          0% { top: 12px; }
          50% { top: calc(100% - 15px); }
          100% { top: 12px; }
        }
        @keyframes pulseReticle {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.9; }
        }
      \`;
      document.head.appendChild(style);
    </script>

    <!-- WebAR Scene Rendering Engine -->
    <template id="scene-template">
      <a-scene xrextras-gesture-detector landing-page xrextras-loading xrextras-runtime-error
      renderer="colorManagement:true" xrweb="disableWorldTracking: true">
      
      <a-camera position="0 4 10" raycaster="objects: .clickable" cursor="fuse: false; rayOrigin: mouse;"></a-camera>
      
      <a-light type="directional" intensity="0.6" position="1 2 1"></a-light>
      <a-light type="ambient" intensity="0.9"></a-light>

${entitiesHtml}
    </a-scene>
    </template>
    <script>
      function hideScanningOverlay() {
        const overlay = document.getElementById('scanner-overlay');
        if (overlay) {
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.style.display = 'none';
          }, 400);
        }
      }

      function showScanningOverlay() {
        const overlay = document.getElementById('scanner-overlay');
        if (overlay) {
          overlay.style.display = 'flex';
          overlay.offsetHeight; // force reflow
          overlay.style.opacity = '1';
        }
      }

      function attachSceneListeners(scene) {
        console.log('[STAGE] A-Frame scene element matched. Preparing tracking events.');
        
        scene.addEventListener('loaded', () => {
          console.log('[STAGE] A-Frame components loaded and assets are ready.');
        });
        
        scene.addEventListener('renderstart', () => {
          console.log('[STAGE] WebGL Renderer render loop started successfully.');
        });

        scene.addEventListener('realityready', () => {
          console.log('[STAGE] 8th Wall Reality initialized. Camera feed active and tracking is hot!');
        });

        scene.addEventListener('xrimagefound', (event) => {
          console.log('[TRACKING] Image target found: "' + event.detail.name + '" detected! Fading scanning UI.');
          hideScanningOverlay();
        });

        scene.addEventListener('xrimagelost', (event) => {
          console.log('[TRACKING] Image target lost: "' + event.detail.name + '" is out of camera view.');
          showScanningOverlay();
        });
      }

      // Proactive Lifecycle Loggers
      console.log('[STAGE] Device environment matches WebAR. Launching A-Frame scene...');
      window.addEventListener('load', () => console.log('[STAGE] Window load complete. Assets finished transferring.'));
      window.addEventListener('xrloaded', () => console.log('[STAGE] 8th Wall engine bundle loaded and initialized.'));

      const initScene = () => {
        console.log('[STAGE] Cloning scene nodes from HTML template.');
        const template = document.getElementById('scene-template');
        if (!template) {
          console.error('[ERROR] Scene template element not found in DOM.');
          return;
        }
        const clone = template.content.cloneNode(true);
        const scene = clone.querySelector('a-scene');
        if (scene) {
          attachSceneListeners(scene);
        } else {
          console.warn('[WARN] No custom scene container found inside cloned template.');
        }
        document.body.appendChild(clone);
        console.log('[STAGE] Scene injected into document tree successfully.');
      };

      if (window.XR8) {
        initScene();
      } else {
        window.addEventListener('xrloaded', initScene);
      }
    </script>
  </body>
</html>`;
  };

  
  