import { EditorStore } from '../store/useEditorStore';

export function generateAFrameScene(storeState: EditorStore, mindDataUri?: string): string {
  const { objects, rootObjects, settings } = storeState;

  const imageTargetObj = Object.values(objects).find(obj => obj.type === 'imageTarget');
  const targetImageUrl = imageTargetObj?.properties?.textureUrl || '';

  const buildEntity = (id: string, depth: number = 2): string => {
    const obj = objects[id];
    if (!obj) return '';

    const indent = '  '.repeat(depth);
    let entity = '';

    const p = obj.position.map(n => n.toFixed(3)).join(' ');
    const r = obj.rotation.map(n => n.toFixed(3)).join(' ');
    const s = obj.scale.map(n => n.toFixed(3)).join(' ');

    if (obj.type === 'imageTarget') {
        let childrenHtml = '';
        obj.children.forEach(childId => {
          childrenHtml += buildEntity(childId, depth + 1);
        });
        return childrenHtml;
    } else {
      entity += `${indent}<a-entity id="${obj.id}" position="${p}" rotation="${r}" scale="${s}"`;

      const behaviors = obj.properties.visualBehaviors;
      let animString = '';

      if (behaviors && behaviors.length > 0) {
        behaviors.forEach((behavior, index) => {
           if (behavior.type === 'spin') {
             animString += `animation__spin_${index}="property: rotation; to: ${obj.rotation[0]} ${obj.rotation[1] + 360} ${obj.rotation[2]}; loop: true; dur: ${Math.max(100, 5000 / (behavior.speed || 1))}; easing: linear;" `;
           } else if (behavior.type === 'float') {
             const basePosY = obj.position[1];
             const floatRange = 0.1 * (behavior.intensity || 1);
             animString += `animation__float_${index}="property: position; to: ${obj.position[0]} ${basePosY + floatRange} ${obj.position[2]}; dir: alternate; loop: true; dur: ${Math.max(100, 2000 / (behavior.speed || 1))}; easing: easeInOutSine;" `;
           }
        });
        if (animString) {
            entity += ` ${animString}`;
        }
      }

      entity += `>\n`;

      if (obj.type === 'box') {
        const color = obj.properties.color || '#ffffff';
        entity += `${indent}  <a-box color="${color}" width="1" height="1" depth="1" shadow="receive: true; cast: true"></a-box>\n`;
      } else if (obj.type === 'sphere') {
        const color = obj.properties.color || '#ffffff';
        entity += `${indent}  <a-sphere color="${color}" radius="0.5" shadow="receive: true; cast: true"></a-sphere>\n`;
      } else if (obj.type === 'text') {
        const color = obj.properties.color || '#ffffff';
        const text = obj.properties.text || '';
        entity += `${indent}  <a-text value="${text}" color="${color}" align="center" width="2"></a-text>\n`;
      } else if (obj.type === 'button') {
        const btnText = obj.properties.text || 'Click Me';
        const btnColor = obj.properties.color || '#3b82f6';
        entity += `${indent}  <a-box color="${btnColor}" class="clickable"></a-box>\n`;
        entity += `${indent}  <a-text value="${btnText}" align="center" position="0 0 0.51" scale="0.8 0.8 0.8" color="#ffffff"></a-text>\n`;
      } else if (obj.type === 'youtube') {
        entity += `${indent}  <a-plane color="#ff0000" material="src: url(https://img.youtube.com/vi/${obj.properties.videoId || 'dQw4w9WgXcQ'}/0.jpg)" aspect-ratio="1.777"></a-plane>\n`;
        entity += `${indent}  <a-image src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_play_button_icon_%282013%E2%80%932017%29.svg" position="0 0 0.05" scale="0.3 0.3 0.3"></a-image>\n`;
      } else if (obj.type === 'model' && obj.properties.modelUrl) {
        entity += `${indent}  <a-gltf-model src="${obj.properties.modelUrl}" shadow="receive: true; cast: true"></a-gltf-model>\n`;
      } else if (obj.type === 'image' && obj.properties.textureUrl) {
        entity += `${indent}  <a-image src="${obj.properties.textureUrl}" width="1" height="1"></a-image>\n`;
      }

      obj.children.forEach(childId => {
        entity += buildEntity(childId, depth + 1);
      });

      entity += `${indent}</a-entity>\n`;
    }

    return entity;
  };

  let entitiesHtml = '';
  rootObjects.forEach(id => {
    const obj = objects[id];
    if (obj && obj.type === 'imageTarget') {
      entitiesHtml += `      <a-entity mindar-image-target="targetIndex: 0">\n`;
      obj.children.forEach(childId => {
        entitiesHtml += buildEntity(childId, 4);
      });
      entitiesHtml += `      </a-entity>\n`;
    } else if (obj && obj.type !== 'imageTarget') {
      entitiesHtml += buildEntity(id, 3);
    }
  });

  let customScripts = '';
  Object.values(objects).forEach(obj => {
     if (obj.properties.scriptCode && (obj.properties.scriptEnabled ?? true)) {
         customScripts += `
    try {
      const el = document.getElementById('${obj.id}');
      if (el) {
        const objectData = ${JSON.stringify(obj)};
        ${obj.properties.scriptCode}
      }
    } catch (e) {
      console.error('Custom script error for ${obj.name}:', e);
    }
`;
     }
  });

  // Decide what imageTargetSrc to use.
  // If mindDataUri is provided, we use it directly. Otherwise, it defaults to a placeholder.
  const resolvedMindDataUri = mindDataUri || '#';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${settings.projectName || 'AR Experience'}</title>
    
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      
      /* Force the video and canvas to fill the screen properly in MindAR */
      video, canvas {
        width: 100vw !important;
        height: 100vh !important;
        object-fit: cover !important;
      }

      .mindar-ui-overlay {
        position: absolute;
        inset: 0;
        z-index: 9999;
      }
    </style>
    
    <!-- Core WebAR SDKs & A-Frame Runtime -->
    <script crossorigin="anonymous" src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"></script>

    <script>
      AFRAME.registerComponent('ar-visual-behaviors', {
        init: function () {}
      });

      AFRAME.registerComponent('ar-interaction-manager', {
        init: function () {
          const el = this.el;
          let isClicked = false;
          
          el.addEventListener('click', function () {
            if (isClicked) return;
            isClicked = true;
            
            const objData = el.getAttribute('data-ar-object');
            if (objData) {
              try {
                const parsed = JSON.parse(objData);
                if (parsed.type === 'button') {
                  if (parsed.properties.url) {
                    window.location.href = parsed.properties.url;
                  }
                  showToast('Button Clicked: ' + parsed.properties.text);
                } else if (parsed.type === 'youtube') {
                  const videoId = parsed.properties.videoId;
                  if (videoId) {
                    showVideoOverlay(videoId);
                  }
                }
              } catch(e) {}
            }
            
            const currentScale = el.getAttribute('scale');
            el.setAttribute('animation__pop', {
              property: 'scale',
              to: \`\${currentScale.x * 1.1} \${currentScale.y * 1.1} \${currentScale.z * 1.1}\`,
              dur: 150,
              dir: 'alternate',
              loop: 1
            });
            
            setTimeout(() => { isClicked = false; }, 300);
          });
        }
      });

      function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = \`
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          background: rgba(20,20,20,0.9);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 12px 24px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 10000;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          pointer-events: none;
        \`;
        toast.innerText = message;
        document.getElementById('hud-overlay').appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '1';
          toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(-50%) translateY(-20px)';
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      }

      function showVideoOverlay(videoId) {
        const overlay = document.getElementById('video-overlay');
        const iframe = document.getElementById('video-iframe');
        iframe.src = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&rel=0\`;
        overlay.style.display = 'flex';
        setTimeout(() => { overlay.style.opacity = '1'; }, 10);
      }

      function closeVideoOverlay() {
        const overlay = document.getElementById('video-overlay');
        const iframe = document.getElementById('video-iframe');
        overlay.style.opacity = '0';
        setTimeout(() => { 
          overlay.style.display = 'none';
          iframe.src = '';
        }, 300);
      }
    </script>
  </head>
  <body>
    <!-- Real-time HUD overlay system (Toasts, Video popups) -->
    <div id="hud-overlay" style="position: fixed; inset: 0; z-index: 9999; pointer-events: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- Video Popup -->
      <div id="video-overlay" style="display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); opacity: 0; transition: opacity 0.3s ease; align-items: center; justify-content: center; pointer-events: auto;">
        <div style="position: relative; width: 90%; max-width: 800px; aspect-ratio: 16/9; background: #000; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);">
          <button onclick="closeVideoOverlay()" style="position: absolute; top: 10px; right: 10px; width: 36px; height: 36px; border-radius: 18px; background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; backdrop-filter: blur(4px);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <iframe id="video-iframe" style="width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    </div>

    <!-- UI Overlay for scanning state -->
    <div id="scanning-overlay" class="mindar-ui-overlay" style="display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; transition: opacity 0.5s ease;">
      <div style="text-align: center; margin-bottom: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
        <p style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: 0.5px;">Point camera at image</p>
        <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 0;">Fill the frame with the target</p>
      </div>
      
      <div style="position: relative; width: 220px; height: 220px;">
        <div style="position: absolute; top: 0; left: 0; width: 30px; height: 30px; border-top: 3px solid white; border-left: 3px solid white; border-radius: 4px 0 0 0;"></div>
        <div style="position: absolute; top: 0; right: 0; width: 30px; height: 30px; border-top: 3px solid white; border-right: 3px solid white; border-radius: 0 4px 0 0;"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 30px; height: 30px; border-bottom: 3px solid white; border-left: 3px solid white; border-radius: 0 0 0 4px;"></div>
        <div style="position: absolute; bottom: 0; right: 0; width: 30px; height: 30px; border-bottom: 3px solid white; border-right: 3px solid white; border-radius: 0 0 4px 0;"></div>
        
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: rgba(59, 130, 246, 0.8); box-shadow: 0 0 12px rgba(59, 130, 246, 0.8); animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;"></div>
      </div>
      
      <div style="margin-top: 32px; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 12px; max-width: 280px;">
        ${targetImageUrl ? 
          `<img src="${targetImageUrl}" style="width: 70px; height: 70px; object-fit: contain; border-radius: 6px; background: #000;" />` : 
          `<div style="width: 70px; height: 70px; background: #222; border-radius: 6px; display: flex; items-center; justify-content: center;"><span style="color:#666;font-size:10px;">No Target</span></div>`
        }
        <div style="text-align: left;">
          <div style="color: white; font-size: 13px; font-weight: 500; margin-bottom: 4px; line-height: 1.2;">Target Image</div>
          <div style="color: rgba(255,255,255,0.6); font-size: 11px; line-height: 1.4;">Hold steady until tracking initializes</div>
        </div>
      </div>
    </div>

    <style>
      @keyframes scan {
        0%, 100% { top: 0; opacity: 0; }
        10%, 90% { opacity: 1; }
        50% { top: 100%; }
      }
    </style>

    <!-- WebAR Scene Rendering Engine -->
    <a-scene mindar-image="imageTargetSrc: ${resolvedMindDataUri}; autoStart: true; maxTrack: 1; filterMinCF:0.0001; filterBeta:0.001;" 
             embedded color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights: true" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
      
      <a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false; rayOrigin: mouse;" raycaster="objects: .clickable"></a-camera>
      
      <a-light type="directional" intensity="0.6" position="1 2 1"></a-light>
      <a-light type="ambient" intensity="0.9"></a-light>

${entitiesHtml}
    </a-scene>

    <script>
      function hideScanningOverlay() {
        const overlay = document.getElementById('scanning-overlay');
        if (overlay) {
          overlay.style.opacity = '0';
          setTimeout(() => overlay.style.display = 'none', 500);
        }
      }
      
      function showScanningOverlay() {
        const overlay = document.getElementById('scanning-overlay');
        if (overlay) {
          overlay.style.display = 'flex';
          setTimeout(() => overlay.style.opacity = '1', 10);
        }
      }

      const scene = document.querySelector('a-scene');
      
      if (scene) {
        scene.addEventListener('loaded', () => {
          const interactives = document.querySelectorAll('.clickable, [data-ar-object]');
          interactives.forEach(el => {
            el.setAttribute('ar-interaction-manager', '');
          });
          
          ${customScripts}
          
          console.log('[STAGE] WebGL Renderer render loop started successfully.');
        });

        const targetEl = scene.querySelector('[mindar-image-target]');
        if (targetEl) {
          targetEl.addEventListener('targetFound', (event) => {
            console.log('[TRACKING] Image target found! Fading scanning UI.');
            hideScanningOverlay();
          });

          targetEl.addEventListener('targetLost', (event) => {
            console.log('[TRACKING] Image target lost.');
            showScanningOverlay();
          });
        }
      }
    </script>
  </body>
</html>`;
}
