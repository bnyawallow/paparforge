
import * as THREE from 'three';
import { Vector3Data } from '../types';

export const convertEditorToAR = (
  pos: [number, number, number],
  rot: [number, number, number],
  scale: [number, number, number],
  physicalWidth: number
): { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] } => {
  const S = 1.0 / ((physicalWidth || 1) * 50);

  // 1. Position Transformation - aligned with XY plane (X = width, Y = height, Z = normal)
  const pos_ar: [number, number, number] = [
    pos[0] * S,
    pos[1] * S,
    pos[2] * S
  ];

  // 2. Scale Transformation - aligned with XY plane
  const scale_ar: [number, number, number] = [
    scale[0] * S,
    scale[1] * S,
    scale[2] * S
  ];

  // 3. Rotation Transformation - aligned 1:1
  const rot_ar_deg: [number, number, number] = [
    rot[0],
    rot[1],
    rot[2]
  ];

  return {
    position: pos_ar,
    rotation: rot_ar_deg,
    scale: scale_ar
  };
};

const buildMaterialAttr = (properties: any, isPlane = false): string => {
  const parts: string[] = [];
  
  // Base Color
  parts.push(`color: ${properties.color || '#ffffff'}`);
  
  // Roughness & Metalness
  if (properties.roughness !== undefined) {
    parts.push(`roughness: ${properties.roughness}`);
  } else {
    parts.push(`roughness: 0.5`);
  }
  if (properties.metalness !== undefined) {
    parts.push(`metalness: ${properties.metalness}`);
  } else {
    parts.push(`metalness: 0.1`);
  }
  
  // Opacity & Transparency
  if (properties.opacity !== undefined) {
    parts.push(`opacity: ${properties.opacity}`);
    if (properties.opacity < 1) {
      parts.push(`transparent: true`);
    }
  }
  
  // Wireframe Mode
  if (properties.wireframe) {
    parts.push(`wireframe: true`);
  }
  
  // Double-Sided Geometry
  const doubleSided = properties.doubleSided ?? (isPlane ? true : false);
  if (doubleSided) {
    parts.push(`side: double`);
  } else {
    parts.push(`side: front`);
  }
  
  // Texture src & mapping
  if (properties.textureUrl) {
    parts.push(`src: ${properties.textureUrl}`);
    const repX = properties.textureRepeatX ?? 1;
    const repY = properties.textureRepeatY ?? 1;
    parts.push(`repeat: ${repX} ${repY}`);
  }
  
  return parts.join('; ');
};

export const generateAFrameScene = (state: any) => {
  const { objects, rootObjects, settings } = state;
  const imageTargetObj = Object.values(objects).find((o: any) => o.type === 'imageTarget') as any;
  const targetImageUrl = imageTargetObj?.properties?.textureUrl || '';
  let entitiesHtml = '';
  const audioAssetUrls = new Set<string>();
  if (settings.ambientSoundUrl) {
    audioAssetUrls.add(settings.ambientSoundUrl);
  }

    const buildEntity = (id: string, depth = 0): string => {
      const obj = objects[id];
      if (!obj || !obj.visible) return '';

      const indent = '  '.repeat(depth + 3);
      
      // Inject standard click handlers, custom script hooks, and visual event components
      let customComponents = '';
      let isClickable = false;
      
      if (obj.properties.soundUrl) {
        audioAssetUrls.add(obj.properties.soundUrl);
        // Safe string escaping
        const escapedUrl = obj.properties.soundUrl.replace(/"/g, '&quot;');
        customComponents += ` sound-on-click data-sound-url="${escapedUrl}"`;
        isClickable = true;
      }
      
      if (obj.properties.visualBehaviors && obj.properties.visualBehaviors.length > 0) {
        const behaviorsJson = JSON.stringify(obj.properties.visualBehaviors)
          .replace(/"/g, '&quot;');
        customComponents += ` visual-behavior data-behaviors="${behaviorsJson}"`;
        const hasTap = obj.properties.visualBehaviors.some((b: any) => b.trigger === 'onTap');
        if (hasTap) {
          isClickable = true;
        }
        
        obj.properties.visualBehaviors.forEach((b: any) => {
          if (b.action === 'playSound' && b.soundPreset) {
            audioAssetUrls.add(b.soundPreset);
          }
        });
      }
      
      if (obj.properties.scriptCode && (obj.properties.scriptEnabled ?? true)) {
        // Escaping tags and quotes safely for inline HTML attribute
        const escapedCode = obj.properties.scriptCode
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        customComponents += ` custom-script data-script-code="${escapedCode}" data-script-enabled="true"`;
        isClickable = true;
      }

      if (obj.properties.behavior) {
        const spinAxis = obj.properties.spinAxis || 'z';
        customComponents += ` live-behavior="rule: ${obj.properties.behavior}; spinAxis: ${spinAxis}"`;
      }

      if (obj.type === 'button') {
        isClickable = true;
      }

      if (obj.properties.ignoreClicks) {
        isClickable = false;
      }

      const classAttr = isClickable ? ' class="clickable"' : '';

      // Check if this object is a direct child of the image target
      const physicalWidth = imageTargetObj?.properties?.physicalWidth || 1;
      const isDirectChild = imageTargetObj?.children?.includes(id);

      let positionStr = obj.position.join(' ');
      let rotationStr = obj.rotation.join(' ');
      let scaleStr = obj.scale.join(' ');

      if (isDirectChild) {
        const transformed = convertEditorToAR(obj.position, obj.rotation, obj.scale, physicalWidth);
        positionStr = transformed.position.map(v => Number(v.toFixed(6))).join(' ');
        rotationStr = transformed.rotation.map(v => Number(v.toFixed(6))).join(' ');
        scaleStr = transformed.scale.map(v => Number(v.toFixed(6))).join(' ');
      }

      let entity = `${indent}<a-entity id="${obj.id}" position="${positionStr}" rotation="${rotationStr}" scale="${scaleStr}"${classAttr}${customComponents}>\n`;

      if (obj.type === 'box') {
        entity += `${indent}  <a-box material="${buildMaterialAttr(obj.properties)}"></a-box>\n`;
      } else if (obj.type === 'sphere') {
        entity += `${indent}  <a-sphere radius="0.5" material="${buildMaterialAttr(obj.properties)}"></a-sphere>\n`;
      } else if (obj.type === 'cylinder') {
        entity += `${indent}  <a-cylinder radius="0.5" height="1" material="${buildMaterialAttr(obj.properties)}"></a-cylinder>\n`;
      } else if (obj.type === 'cone') {
        entity += `${indent}  <a-cone radius-bottom="0.5" height="1" material="${buildMaterialAttr(obj.properties)}"></a-cone>\n`;
      } else if (obj.type === 'torus') {
        entity += `${indent}  <a-torus radius="0.4" radius-tubular="0.12" material="${buildMaterialAttr(obj.properties)}"></a-torus>\n`;
      } else if (obj.type === 'plane') {
        entity += `${indent}  <a-plane material="${buildMaterialAttr(obj.properties, true)}"></a-plane>\n`;
      } else if (obj.type === 'text') {
        entity += `${indent}  <a-text value="${obj.properties.text || 'Text Node'}" align="${obj.properties.textAlign || 'center'}" color="${obj.properties.color || '#ffffff'}" width="4"></a-text>\n`;
      } else if (obj.type === 'image') {
        entity += `${indent}  <a-image src="${obj.properties.textureUrl || ''}" material="${buildMaterialAttr(obj.properties, true)}"></a-image>\n`;
      } else if (obj.type === 'video') {
        const autoplay = obj.properties.autoplay !== false;
        const loop = obj.properties.loop !== false;
        const muted = obj.properties.muted !== false;
        const volume = obj.properties.volume ?? 0.5;
        const wireframe = obj.properties.wireframe ? '; wireframe: true' : '';
        entity += `${indent}  <a-video src="${obj.properties.videoUrl || ''}" width="1.6" height="0.9" ar-video-handler="autoplay: ${autoplay}; loop: ${loop}; muted: ${muted}; volume: ${volume}" material="side: double${wireframe}"></a-video>\n`;
      } else if (obj.type === 'light') {
        const lightType = obj.properties.lightType || 'point';
        const color = obj.properties.color || '#ffffff';
        const intensity = obj.properties.intensity ?? 1.0;
        let lightAttrs = `type="${lightType}" color="${color}" intensity="${intensity}"`;
        if (lightType !== 'directional') {
          lightAttrs += ` distance="${obj.properties.distance ?? 12.0}"`;
        }
        if (lightType === 'spot') {
          const angleRad = obj.properties.angle ?? (Math.PI / 4);
          const angleDeg = Math.round((angleRad * 180) / Math.PI);
          lightAttrs += ` angle="${angleDeg}"`;
        }
        entity += `${indent}  <a-light ${lightAttrs}></a-light>\n`;
      } else if (obj.type === 'button') {
        const btnText = obj.properties.text || 'Click Me';
        const btnColor = obj.properties.color || '#3b82f6';
        const textColor = obj.properties.textColor || '#ffffff';
        const style = obj.properties.buttonStyle || '3d_push';
        const url = obj.properties.url || '';
        const btnUrlAttr = url ? ` ar-button-handler="url: ${url}"` : '';
        
        if (style === 'glass_panel') {
          entity += `${indent}  <a-box material="color: #ffffff; opacity: 0.25; transparent: true; roughness: 0.1; metalness: 0.8; side: double" depth="0.05" class="clickable"${btnUrlAttr}></a-box>\n`;
        } else {
          entity += `${indent}  <a-box material="color: ${btnColor}; roughness: 0.4; metalness: 0.2" depth="0.2" class="clickable"${btnUrlAttr}></a-box>\n`;
        }
        entity += `${indent}  <a-text value="${btnText}" align="center" position="0 0 0.11" scale="0.8 0.8 0.8" color="${textColor}"></a-text>\n`;
      } else if (obj.type === 'youtube') {
        entity += `${indent}  <a-plane color="#ff0000" material="src: url(https://img.youtube.com/vi/${obj.properties.videoId || 'dQw4w9WgXcQ'}/0.jpg)" aspect-ratio="1.777"></a-plane>\n`;
      } else if (obj.type === 'model') {
        const activeAnim = obj.properties.activeAnimation || '*';
        const speed = obj.properties.animationPlaying !== false ? (obj.properties.animationSpeed ?? 1.0) : 0;
        const animMixerAttr = ` animation-mixer="clip: ${activeAnim}; timeScale: ${speed}; loop: repeat"`;
        const wireframeAttr = ` model-wireframe="enabled: ${obj.properties.wireframe ?? false}"`;
        entity += `${indent}  <a-entity gltf-model="${obj.properties.url || ''}"${animMixerAttr}${wireframeAttr}></a-entity>\n`;
      } else if (obj.type === 'audio') {
        const soundUrl = obj.properties.soundUrl || '';
        if (soundUrl) audioAssetUrls.add(soundUrl);
        const volume = obj.properties.volume ?? 0.5;
        const autoplay = obj.properties.autoplay ?? false;
        const loop = obj.properties.loop ?? true;
        entity += `${indent}  <a-sound src="${soundUrl}" volume="${volume}" autoplay="${autoplay}" loop="${loop}"></a-sound>\n`;
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
        entitiesHtml += `      <a-entity mindar-image-target="targetIndex: 0">\n`;
        obj.children.forEach(childId => {
          entitiesHtml += buildEntity(childId, 2);
        });
        entitiesHtml += `      </a-entity>\n`;
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

    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      a-scene {
        width: 100%;
        height: 100%;
      }
      video:not(#ar-video-player) {
        width: 100vw !important;
        height: 100vh !important;
        object-fit: cover !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        z-index: -2 !important;
      }
    </style>

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
    <script src="https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v7.0.0/dist/aframe-extras.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-compiler.prod.js"></script>

    <script>
      // 0. Continuous Interactive Live Behaviors (Spin, Hover, Pulse)
      AFRAME.registerComponent('live-behavior', {
        schema: {
          rule: {type: 'string', default: ''},
          spinAxis: {type: 'string', default: 'z'}
        },
        init: function() {
          this.initialY = this.el.object3D.position.y;
          this.initialZ = this.el.object3D.position.z;
          this.initialRotX = this.el.object3D.rotation.x;
          this.initialRotY = this.el.object3D.rotation.y;
          this.initialRotZ = this.el.object3D.rotation.z;
          this.initialScaleX = this.el.object3D.scale.x;
          this.initialScaleY = this.el.object3D.scale.y;
          this.initialScaleZ = this.el.object3D.scale.z;
          this.time = 0;
        },
        tick: function(time, timeDelta) {
          const rule = this.data.rule;
          const spinAxis = this.data.spinAxis;
          if (!rule) return;
          this.time += timeDelta / 1000;
          const t = this.time;

          // Restore un-animated channels to prevent stale transitions
          this.el.object3D.position.y = this.initialY;
          this.el.object3D.position.z = this.initialZ;
          if (spinAxis !== 'x') this.el.object3D.rotation.x = this.initialRotX;
          if (spinAxis !== 'y') this.el.object3D.rotation.y = this.initialRotY;
          if (spinAxis !== 'z') this.el.object3D.rotation.z = this.initialRotZ;

          if (rule === 'hover') {
            this.el.object3D.position.z = this.initialZ + Math.sin(t * 3) * 0.2;
          } else if (rule === 'spin') {
            if (spinAxis === 'x') {
              this.el.object3D.rotation.x = this.initialRotX + t * 0.8;
            } else if (spinAxis === 'y') {
              this.el.object3D.rotation.y = this.initialRotY + t * 0.8;
            } else {
              this.el.object3D.rotation.z = this.initialRotZ + t * 0.8;
            }
          } else if (rule === 'pulse') {
            const scaleVal = 1 + Math.sin(t * 4.5) * 0.08;
            this.el.object3D.scale.set(
              this.initialScaleX * scaleVal,
              this.initialScaleY * scaleVal,
              this.initialScaleZ * scaleVal
            );
          }
        }
      });

      // 1. Core Visual Behaviors Engine
      AFRAME.registerComponent('visual-behavior', {
        triggerEvent: function(triggerName) {
          if (!this.behaviors) return;
          this.behaviors.forEach(b => {
            if (b.trigger === triggerName) {
              this.executeBehavior(b);
            }
          });
        },
        init: function() {
          const self = this;
          const behaviorsJson = this.el.getAttribute('data-behaviors');
          this.behaviors = [];
          try {
            this.behaviors = JSON.parse(behaviorsJson || '[]');
          } catch (e) {
            console.error("Error parsing visual behaviors:", e);
          }
          const el = this.el;

          this.behaviors.forEach(b => {
            if (b.action === 'playSound' && b.soundPreset) {
              const audio = new Audio();
              audio.preload = 'auto';
              audio.src = b.soundPreset;
            }

            if (b.trigger === 'onStart') {
              self.executeBehavior(b);
            } else if (b.trigger === 'onTap') {
              const tapHandler = () => self.executeBehavior(b);
              el.addEventListener('click', tapHandler);
              el.addEventListener('touchstart', tapHandler);
            }
          });
        },
        tick: function() {
          if (!this.behaviors || this.behaviors.length === 0) return;
          const self = this;
          
          this.behaviors.forEach(b => {
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
              const playUrl = b.soundPreset || '/sounds/success_chime.wav';
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
                  to: '0 0 360',
                  dur: 2000,
                  easing: 'linear',
                  loop: true
                });
              }
              break;
            case 'transform':
              const tfEl = b.targetObjectId ? document.getElementById(b.targetObjectId) : this.el;
              if (tfEl && b.propertyName && b.propertyValue) {
                let valStr = b.propertyValue.trim().replace(/,/g, ' ');
                tfEl.setAttribute('animation__transform_' + Date.now(), {
                  property: b.propertyName,
                  to: valStr,
                  dur: 1000,
                  easing: 'easeOutQuad'
                });
              }
              break;
            case 'material':
              const matEl = b.targetObjectId ? document.getElementById(b.targetObjectId) : this.el;
              if (matEl && b.propertyName && b.propertyValue) {
                if (b.propertyName === 'color') {
                  matEl.setAttribute('animation__color_' + Date.now(), {
                    property: 'material.color',
                    to: b.propertyValue,
                    dur: 1000,
                    easing: 'easeOutQuad'
                  });
                } else if (b.propertyName === 'texture') {
                  matEl.setAttribute('material', 'src', b.propertyValue);
                }
              }
              break;
          }
        }
      });

      // 2. Custom Javascript Scripts Sandbox Engine
      AFRAME.registerComponent('custom-script', {
        init: function() {
          const code = this.el.getAttribute('data-script-code');
          const enabled = this.el.getAttribute('data-script-enabled') !== 'false';
          if (!enabled || !code) return;
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
              const playUrl = url || '/sounds/cyber_click.wav';
              const sfx = new Audio(playUrl);
              sfx.volume = 0.5;
              sfx.play().catch(e => console.log('Script sound failed', e));
            },
            showToast: (msg) => {
              showToast(msg);
            }
          };
          
          try {
            const scriptFn = new Function('mesh', 'object', 'api', 'onTap', 'onUpdate', code);
            scriptFn(el.object3D, { id: el.id }, api, registerOnTap, registerOnUpdate);
          } catch(err) {
            console.error("Script init error:", err);
            showToast("Script Init Error: " + err.message);
          }
          
          el.addEventListener('click', () => {
            if (this.callbacks && typeof this.callbacks.onTap === 'function') {
              try {
                this.callbacks.onTap();
              } catch(err) {
                console.error("onTap error:", err);
              }
            }
          });
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
      // Custom system components inserted here:
      AFRAME.registerComponent('model-wireframe', {
        schema: {
          enabled: {type: 'boolean', default: false}
        },
        init: function() {
          this.el.addEventListener('model-loaded', () => {
            this.update();
          });
        },
        update: function() {
          const enabled = this.data.enabled;
          const obj3d = this.el.getObject3D('mesh');
          if (!obj3d) return;
          obj3d.traverse(node => {
            if (node.isMesh && node.material) {
              node.material.wireframe = enabled;
            }
          });
        }
      });

      AFRAME.registerComponent('ar-video-handler', {
        schema: {
          autoplay: {type: 'boolean', default: true},
          loop: {type: 'boolean', default: true},
          muted: {type: 'boolean', default: true},
          volume: {type: 'number', default: 0.5}
        },
        init: function() {
          const el = this.el;
          const data = this.data;
          const videoUrl = el.getAttribute('src');
          if (!videoUrl) return;
          
          const video = document.createElement('video');
          video.src = videoUrl;
          video.crossOrigin = 'anonymous';
          video.loop = data.loop;
          video.muted = data.muted;
          video.volume = data.volume;
          video.playsInline = true;
          
          el.setAttribute('material', {
            src: video,
            shader: 'flat',
            side: 'double'
          });
          
          const playVideo = () => {
            video.play().catch(err => console.log('Video autoplay blocked, waiting for click', err));
          };
          
          if (data.autoplay) {
            playVideo();
            document.body.addEventListener('click', playVideo, {once: true});
            document.body.addEventListener('touchstart', playVideo, {once: true});
          }
          
          el.addEventListener('click', () => {
            if (video.paused) {
              video.play().catch(e => console.log(e));
            } else {
              video.pause();
            }
          });
        }
      });

      AFRAME.registerComponent('ar-button-handler', {
        schema: {
          url: {type: 'string', default: ''}
        },
        init: function() {
          const data = this.data;
          this.el.addEventListener('click', () => {
            if (data.url) {
              window.open(data.url, '_blank', 'noopener,noreferrer');
            }
          });
        }
      });

      AFRAME.registerComponent('sound-on-click', {
        init: function() {
          const url = this.el.getAttribute('data-sound-url');
          if (!url) return;
          const playSound = () => {
            const sfx = new Audio(url);
            sfx.volume = 0.5;
            sfx.play().catch(e => {
              console.log('AudioContext play error, trying to resume context', e);
              const resumeAndPlay = () => {
                const sceneEl = document.querySelector('a-scene');
                if (sceneEl && sceneEl.audioListener) {
                  sceneEl.audioListener.context.resume().then(() => {
                    sfx.play().catch(err => console.log('Audio retry failed:', err));
                  });
                } else {
                  sfx.play().catch(err => console.log('Audio fallback failed:', err));
                }
              };
              resumeAndPlay();
            });
          };
          this.el.addEventListener('click', playSound);
        }
      });

      // Global touch/click interaction helper to unlock audio context on mobile browsers
      document.addEventListener('click', function unlockAudioContext() {
        const sceneEl = document.querySelector('a-scene');
        if (sceneEl && sceneEl.audioListener && sceneEl.audioListener.context) {
          sceneEl.audioListener.context.resume().then(() => {
            console.log('AudioContext successfully unlocked via global click gesture!');
            document.removeEventListener('click', unlockAudioContext);
          }).catch(err => console.log('Context unlock failed:', err));
        }
      });
    </script>
  </head>
  <body>
    <!-- Target Compilation Overlay -->
    <div id="compiler-overlay" style="position: fixed; inset: 0; background: #0E0E0E; z-index: 10000010 !important; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; transition: opacity 0.4s ease-in-out; color: white;">
      <div style="background: #181818; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 20px; width: 85%; max-width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center;">
        <div style="width: 50px; height: 50px; border-radius: 25px; border: 3px solid rgba(251, 191, 36, 0.15); border-top-color: #fbbf24; animation: spinLoader 1s linear infinite;"></div>
        <div>
          <h2 style="margin: 0; font-size: 14px; font-weight: 600; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.05em;">WebAR Compiling</h2>
          <p id="compiler-status" style="margin: 8px 0 0 0; font-size: 10px; opacity: 0.7; line-height: 1.4;">Downloading target image features...</p>
        </div>
        <!-- Progress bar container -->
        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; position: relative;">
          <div id="compiler-progress" style="position: absolute; left: 0; top: 0; bottom: 0; width: 0%; background: #fbbf24; box-shadow: 0 0 8px #fbbf24; transition: width 0.3s ease;"></div>
        </div>
      </div>
    </div>

    <!-- Real-time HUD overlay system (Toasts, Video popups) -->
    <div id="hud-overlay" style="position: fixed; inset: 0; z-index: 10000000 !important; pointer-events: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
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
        @keyframes spinLoader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      \`;
      document.head.appendChild(style);
    </script>

    <!-- WebAR Scene Rendering Engine -->
    <template id="scene-template">
      <a-scene mindar-image="imageTargetSrc: __MIND_URL_PLACEHOLDER__; autoStart: true; maxTrack: 1; filterMinCF:${imageTargetObj?.properties?.filterMinCF ?? 0.0001}; filterBeta:${imageTargetObj?.properties?.filterBeta ?? 0.001}; missTolerance:${imageTargetObj?.properties?.missTolerance ?? 5}; uiScanning: no;" 
               embedded color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights: true" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
        
        <a-assets>
          ${Array.from(audioAssetUrls).map((url, i) => `<audio id="audio-asset-${i}" src="${url}" preload="auto"></audio>`).join('\n          ')}
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false; rayOrigin: mouse;" raycaster="objects: .clickable"></a-camera>
        
        <a-light type="directional" intensity="0.6" position="1 2 1"></a-light>
        <a-light type="ambient" intensity="0.9"></a-light>

        ${settings.ambientSoundUrl ? `
        <a-sound src="${settings.ambientSoundUrl}" autoplay="true" loop="true" position="0 0 0" volume="1"></a-sound>
        ` : ''}

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
        console.log('[STAGE] A-Frame scene element matched. Preparing tracking and system events.');
        
        scene.addEventListener('loaded', () => {
          console.log('[STAGE] A-Frame components loaded and assets are ready.');
        });
        
        scene.addEventListener('renderstart', () => {
          console.log('[STAGE] WebGL Renderer render loop started successfully.');
        });

        scene.addEventListener('arReady', (event) => {
          console.log('[MINDAR] AR Engine is ready and camera feed is active!');
        });

        scene.addEventListener('arError', (event) => {
          console.error('[MINDAR-ERROR] AR Engine initialization failed:', event);
        });

        // Listen for targetFound and targetLost on MindAR target entity
        const targetEl = scene.querySelector('[mindar-image-target]');
        if (targetEl) {
          targetEl.addEventListener('targetFound', (event) => {
            console.log('[MINDAR-TRACKING] Image target found! Fading scanning UI.');
            hideScanningOverlay();
            document.querySelectorAll('[visual-behavior]').forEach(el => {
              if (el.components['visual-behavior']) {
                el.components['visual-behavior'].triggerEvent('onTargetFound');
              }
            });
          });

          targetEl.addEventListener('targetLost', (event) => {
            console.log('[MINDAR-TRACKING] Image target lost.');
            showScanningOverlay();
            document.querySelectorAll('[visual-behavior]').forEach(el => {
              if (el.components['visual-behavior']) {
                el.components['visual-behavior'].triggerEvent('onTargetLost');
              }
            });
          });
        } else {
          console.warn('[WARN] mindar-image-target entity not found in scene.');
        }
      }

      async function compileTargetImage(imageUrl) {
        console.log('[STAGE] Starting target image compilation...');
        const statusEl = document.getElementById('compiler-status');
        const progressEl = document.getElementById('compiler-progress');
        
        try {
          statusEl.innerText = 'Fetching marker image...';
          progressEl.style.width = '10%';
          
          // Load image element
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          const loadPromise = new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('Failed to load target image: ' + imageUrl));
          });
          
          img.src = imageUrl;
          await loadPromise;
          
          statusEl.innerText = 'Analyzing feature points...';
          progressEl.style.width = '30%';
          
          console.log('[STAGE] Image loaded successfully, dimensions: ' + img.width + 'x' + img.height);
          
          // Create MindAR Compiler
          const compiler = new MINDAR.IMAGE.Compiler();
          
          progressEl.style.width = '50%';
          statusEl.innerText = 'Compiling WebAR dataset (this may take a few seconds)...';
          
          // Compile track with a progress callback
          await compiler.compileImageTargets([img], (percent) => {
            const displayPercent = Math.min(Math.round(50 + (percent / 2)), 99);
            progressEl.style.width = displayPercent + '%';
            statusEl.innerText = 'Extracting keypoints (' + Math.round(percent) + '%)...';
          });
          
          progressEl.style.width = '100%';
          statusEl.innerText = 'Finalizing tracking database...';
          
          const buffer = compiler.exportData();
          const blob = new Blob([buffer], {type: 'application/octet-stream'});
          const mindUrl = URL.createObjectURL(blob);
          
          console.log('[STAGE] Dynamic compilation complete. Created MindAR object URL: ' + mindUrl);
          return mindUrl;
          
        } catch (err) {
          console.error('[ERROR] Compilation failed:', err);
          statusEl.innerText = 'Compilation Error: ' + err.message;
          statusEl.style.color = '#ef4444';
          progressEl.style.backgroundColor = '#ef4444';
          throw err;
        }
      }

      async function initAR() {
        const imageUrl = "${targetImageUrl}";
        if (!imageUrl) {
          console.error('[ERROR] No target image URL specified for tracking.');
          const compilerOverlay = document.getElementById('compiler-overlay');
          if (compilerOverlay) compilerOverlay.style.display = 'none';
          showToast('Error: No target image uploaded for AR tracking.');
          return;
        }
        
        try {
          const mindUrl = await compileTargetImage(imageUrl);
          
          // Hide compiler overlay with a smooth fade
          const compilerOverlay = document.getElementById('compiler-overlay');
          if (compilerOverlay) {
            compilerOverlay.style.opacity = '0';
            setTimeout(() => {
              compilerOverlay.style.display = 'none';
            }, 400);
          }
          
          console.log('[STAGE] Injecting MindAR A-Frame scene...');
          
          // Setup the scene HTML
          const template = document.getElementById('scene-template');
          if (!template) {
            console.error('[ERROR] Scene template element not found in DOM.');
            return;
          }
          
          let sceneHtml = template.innerHTML;
          
          // Replace placeholder imageTargetSrc with compiled mindUrl
          sceneHtml = sceneHtml.replace('__MIND_URL_PLACEHOLDER__', mindUrl);
          
          const sceneContainer = document.createElement('div');
          sceneContainer.innerHTML = sceneHtml;
          const scene = sceneContainer.querySelector('a-scene');
          
          if (scene) {
            attachSceneListeners(scene);
          }
          
          document.body.appendChild(sceneContainer.firstElementChild);
          
        } catch (err) {
          console.error('[ERROR] AR Initialization failed:', err);
        }
      }

      // Proactive Lifecycle Loggers
      console.log('[STAGE] Device environment matches WebAR. Starting up...');
      window.addEventListener('load', () => {
        console.log('[STAGE] Window load complete. Launching compiler and AR engine.');
        initAR();
      });
    </script>
  </body>
</html>`;
  };

  
  