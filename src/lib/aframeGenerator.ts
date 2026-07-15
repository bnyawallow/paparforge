
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
  
  // Shader type mapping
  if (properties.shaderType === 'toon') {
    parts.push(`shader: toon`);
  } else if (properties.shaderType === 'basic') {
    parts.push(`shader: flat`);
  } else {
    parts.push(`shader: standard`);
  }

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
    parts.push(`src: url(${properties.textureUrl})`);
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
      // Skip 2D overlays in A-Frame 3D scene
      if (['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(obj.type)) return '';


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
        const fontStr = obj.properties.fontUrl ? ` font: ${obj.properties.fontUrl};` : '';
        const sizeStr = ` fontSize: ${obj.properties.fontSize ?? 0.25};`;
        const maxWidthStr = ` maxWidth: ${obj.properties.maxWidth ?? 4};`;
        const alignStr = ` align: ${obj.properties.textAlign || 'center'};`;
        const lineHeightStr = ` lineHeight: ${obj.properties.lineHeight ?? 1.2};`;
        const letterSpacingStr = ` letterSpacing: ${obj.properties.letterSpacing ?? 0};`;
        const outlineColorStr = ` outlineColor: ${obj.properties.outlineColor || '#000000'};`;
        const outlineWidthStr = ` outlineWidth: ${obj.properties.outlineWidth ?? 0.01};`;
        const outlineOpacityStr = ` outlineOpacity: ${obj.properties.outlineOpacity ?? 1};`;
        entity += `${indent}  <a-entity troika-text="value: ${obj.properties.text || 'Text Node'}; color: ${obj.properties.color || '#ffffff'};${fontStr}${sizeStr}${maxWidthStr}${alignStr}${lineHeightStr}${letterSpacingStr}${outlineColorStr}${outlineWidthStr}${outlineOpacityStr}"></a-entity>\n`;
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
        entity += `${indent}  <a-entity position="0 0 0.11" scale="0.8 0.8 0.8" troika-text="value: ${btnText}; align: center; color: ${textColor}; fontSize: 0.25; maxWidth: 4"></a-entity>\n`;
      } else if (obj.type === 'youtube') {
        entity += `${indent}  <a-plane color="#ff0000" material="src: url(https://img.youtube.com/vi/${obj.properties.videoId || 'dQw4w9WgXcQ'}/0.jpg)" aspect-ratio="1.777"></a-plane>\n`;
      } else if (obj.type === 'model') {
        const activeAnim = obj.properties.activeAnimation || '*';
        const speed = obj.properties.animationPlaying !== false ? (obj.properties.animationSpeed ?? 1.0) : 0;
        const animMixerAttr = ` animation-mixer="clip: ${activeAnim}; timeScale: ${speed}; loop: repeat"`;
        const wireframeAttr = ` model-wireframe="enabled: ${obj.properties.wireframe ?? false}"`;
        const matOverridesStr = JSON.stringify(obj.properties.materialOverrides || {}).replace(/"/g, '&quot;');
        const subOverridesStr = JSON.stringify(obj.properties.subObjectOverrides || {}).replace(/"/g, '&quot;');
        const overridesAttr = ` model-overrides="materials: ${matOverridesStr}; subObjects: ${subOverridesStr}"`;
        entity += `${indent}  <a-entity gltf-model="${obj.properties.url || ''}"${animMixerAttr}${wireframeAttr}${overridesAttr}></a-entity>\n`;
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

    
    let overlayHtml = '';
    const overlayObjects = Object.values(objects).filter((obj: any) => 
      ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(obj.type) && obj.visible !== false
    );

    const hexToRgba = (hex: string, alpha: number) => {
      if (!hex || !hex.startsWith('#')) return hex;
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const buildOverlayHtml = (obj: any): string => {
      const props = obj.properties || {};
      const alignment = props.alignment || 'none';
      const widthType = props.widthType || 'px';
      const heightType = props.heightType || 'px';
      const widthVal = props.width !== undefined ? props.width : (obj.type === 'overlayImage' ? 200 : (obj.type === 'overlayEmbed' ? 400 : 150));
      const heightVal = props.height !== undefined ? props.height : (obj.type === 'overlayImage' ? 200 : (obj.type === 'overlayEmbed' ? 300 : 40));
      const widthStr = widthType === '%' ? `${widthVal}%` : `${widthVal}px`;
      const heightStr = heightType === '%' ? `${heightVal}%` : `${heightVal}px`;
      const opacity = props.opacity ?? 1;
      const offsetX = props.offsetX || 0;
      const offsetY = props.offsetY || 0;

      const parentObj = obj.parentId ? objects[obj.parentId] : null;
      const parentIs2D = parentObj && ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(parentObj.type);

      let styleStr = `position: absolute; pointer-events: auto; box-sizing: border-box; width: ${widthStr}; height: ${heightStr}; `;
      if (obj.type !== 'overlay2d') {
        styleStr += `opacity: ${opacity}; `;
      }

      if (obj.type === 'overlayEmbed' && props.fullScreenWithMargins) {
        const topM = props.marginTop ?? 20;
        const bottomM = props.marginBottom ?? 20;
        const leftM = props.marginLeft ?? 20;
        const rightM = props.marginRight ?? 20;
        styleStr = `position: absolute; pointer-events: auto; box-sizing: border-box; opacity: ${opacity}; top: ${topM}px; bottom: ${bottomM}px; left: ${leftM}px; right: ${rightM}px; width: auto; height: auto; display: flex; flex-direction: column; `;
      } else if (obj.parentId && !parentIs2D) {
        // Anchored to a 3D object (projected)
        styleStr += `display: none; `;
        entitiesHtml += `      <a-entity id="${obj.id}-projector" projected-overlay="target: #${obj.parentId}; alignment: ${alignment}; offsetX: ${offsetX}; offsetY: ${offsetY};"></a-entity>\n`;
      } else {
        // Root or parentIs2D (relative container alignment)
        if (alignment === 'none') {
          styleStr += `top: ${props.top !== undefined ? props.top + 'px' : '20px'}; left: ${props.left !== undefined ? props.left + 'px' : '20px'}; `;
        } else {
          switch (alignment) {
            case 'top-left':
              styleStr += `top: ${offsetY}px; left: ${offsetX}px; `;
              break;
            case 'top-center':
              styleStr += `top: ${offsetY}px; left: 50%; transform: translateX(-50%) translateX(${offsetX}px); `;
              break;
            case 'top-right':
              styleStr += `top: ${offsetY}px; right: ${offsetX}px; `;
              break;
            case 'center-left':
              styleStr += `top: 50%; left: ${offsetX}px; transform: translateY(-50%) translateY(${offsetY}px); `;
              break;
            case 'center':
              styleStr += `top: 50%; left: 50%; transform: translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px); `;
              break;
            case 'center-right':
              styleStr += `top: 50%; right: ${offsetX}px; transform: translateY(-50%) translateY(${offsetY}px); `;
              break;
            case 'bottom-left':
              styleStr += `bottom: ${offsetY}px; left: ${offsetX}px; `;
              break;
            case 'bottom-center':
              styleStr += `bottom: ${offsetY}px; left: 50%; transform: translateX(-50%) translateX(${offsetX}px); `;
              break;
            case 'bottom-right':
              styleStr += `bottom: ${offsetY}px; right: ${offsetX}px; `;
              break;
          }
        }
      }

      styleStr += `z-index: ${props.zIndex ?? 1}; `;

      const scaleX = obj.scale ? (obj.scale[0] ?? 1) : 1;
      const scaleY = obj.scale ? (obj.scale[1] ?? 1) : 1;
      if (scaleX !== 1 || scaleY !== 1) {
        if (styleStr.includes('transform:')) {
          styleStr = styleStr.replace(/transform:\s*([^;]+);/, (match, p1) => `transform: ${p1} scale(${scaleX}, ${scaleY});`);
        } else {
          styleStr += `transform: scale(${scaleX}, ${scaleY}); `;
        }
        styleStr += `transform-origin: center center; `;
      }

      const overlayId = (obj.parentId && !parentIs2D) ? `${obj.id}-overlay` : obj.id;
      
      // Render recursive child HTML
      const children = overlayObjects.filter((o: any) => o.parentId === obj.id);
      const childrenHtml = children.map(c => buildOverlayHtml(c)).join('\n');

      if (obj.type === 'overlay2d') {
        const bgCol = props.backgroundColor || '#000000';
        let backgroundStyle = styleStr;
        const bgStyle = bgCol.startsWith('#') ? hexToRgba(bgCol, opacity) : bgCol;
        backgroundStyle += `background-color: ${bgStyle}; overflow: hidden;`;
        return `  <div id="${overlayId}" style="${backgroundStyle}">${childrenHtml}</div>`;
      } else if (obj.type === 'overlayText') {
        const textAlignment = props.textAlign || 'left';
        const alignSelf = textAlignment === 'center' ? 'center' : (textAlignment === 'right' ? 'flex-end' : (textAlignment === 'justify' ? 'stretch' : 'flex-start'));
        const fontFamily = props.fontFamily ? `'${props.fontFamily}', sans-serif` : 'sans-serif';
        const fontWeight = props.fontWeight || 'normal';
        const letterSpacing = props.letterSpacing !== undefined ? `${props.letterSpacing}px` : 'normal';
        const whiteSpace = props.whiteSpace || 'pre-wrap';
        const lineHeight = props.lineHeight !== undefined ? `${props.lineHeight}` : 'normal';
        const textTransform = props.textTransform || 'none';
        const textDecoration = props.textDecoration || 'none';
        const fontStyle = props.fontStyle || 'normal';

        styleStr += `color: ${props.color || '#fff'}; font-size: ${props.fontSize || 24}px; text-align: ${textAlignment}; white-space: ${whiteSpace}; font-family: ${fontFamily}; font-weight: ${fontWeight}; letter-spacing: ${letterSpacing}; line-height: ${lineHeight}; text-transform: ${textTransform}; text-decoration: ${textDecoration}; font-style: ${fontStyle}; display: flex; flex-direction: column; align-items: ${alignSelf}; justify-content: center;`;
        return `  <div id="${overlayId}" style="${styleStr}">${props.text || 'Text'}${childrenHtml}</div>`;
      } else if (obj.type === 'overlayButton') {
        styleStr += `background-color: ${props.color || '#3b82f6'}; color: ${props.textColor || '#fff'}; padding: ${props.paddingY || 8}px ${props.paddingX || 16}px; border-radius: ${props.borderRadius || 8}px; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold;`;
        const onClickAttr = props.url ? ` onclick="window.open('${props.url}', '_blank')"` : '';
        return `  <button id="${overlayId}" style="${styleStr}"${onClickAttr}>${props.text || 'Button'}${childrenHtml}</button>`;
      } else if (obj.type === 'overlayImage') {
        styleStr += `position: absolute; overflow: hidden;`;
        let imgStyle = `width: 100%; height: 100%; object-fit: cover; pointer-events: none;`;
        return `  <div id="${overlayId}" style="${styleStr}"><img src="${props.textureUrl || 'https://via.placeholder.com/200'}" style="${imgStyle}" />${childrenHtml}</div>`;
      } else if (obj.type === 'overlayEmbed') {
        const showBorder = props.borderEnabled ?? true;
        const showAddressBar = props.showAddressBar ?? true;
        styleStr += `background-color: #111; border-radius: ${props.borderRadius || 12}px; overflow: hidden; display: flex; flex-direction: column; position: absolute; `;
        if (showBorder) {
          styleStr += `border: 2px solid ${props.borderColor || '#2563eb'}; `;
        }
        
        let embedHtml = `  <div id="${overlayId}" style="${styleStr}">\n`;
        if (showAddressBar) {
          embedHtml += `    <div style="background-color: #1a1a1a; padding: 6px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222; font-family: monospace; font-size: 10px; color: #aaa; flex-shrink: 0; z-index: 10;">\n`;
          embedHtml += `      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">${props.url || 'No URL'}</span>\n`;
          embedHtml += `      <span style="width: 10px; height: 10px; border-radius: 50%; background-color: #10b981;"></span>\n`;
          embedHtml += `    </div>\n`;
        }
        embedHtml += `    <div style="flex: 1; width: 100%; height: 100%; position: relative; overflow: hidden; min-h: 0;">\n`;
        embedHtml += `      <iframe src="${props.url || 'https://wikipedia.org'}" style="position: absolute; inset: 0; border: none; width: 100%; height: 100%;" sandbox="allow-scripts allow-same-origin allow-forms" referrerpolicy="no-referrer"></iframe>\n`;
        embedHtml += `    </div>\n`;
        embedHtml += `${childrenHtml}\n`;
        embedHtml += `  </div>`;
        return embedHtml;
      }

      return '';
    };

    const root2DObjects = overlayObjects.filter((obj: any) => {
      if (!obj.parentId) return true;
      const parentObj = objects[obj.parentId];
      const parentIs2D = parentObj && ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(parentObj.type);
      return !parentIs2D;
    });

    if (overlayObjects.length > 0) {
      overlayHtml += `<div id="ui-layer" style="position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 1000; overflow: hidden;">\n`;
      root2DObjects.forEach((obj: any) => {
        overlayHtml += buildOverlayHtml(obj) + '\n';
      });
      overlayHtml += `</div>\n`;
    }

    // Parse Google Font family name from its @fontsource unpkg url (e.g. "space-grotesk" -> "Space Grotesk")
    const getFontFamilyNameFromUrl = (url: string): string => {
      if (!url) return '';
      const match = url.match(/@fontsource\/([^/]+)/);
      if (match && match[1]) {
        return match[1]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      return '';
    };

    // Gather all custom fonts used in the scene
    const fontsToLoad = new Set<string>();
    Object.values(objects).forEach((obj: any) => {
      if (obj.properties?.fontFamily) {
        fontsToLoad.add(obj.properties.fontFamily);
      }
      if (obj.properties?.fontUrl) {
        const parsedName = getFontFamilyNameFromUrl(obj.properties.fontUrl);
        if (parsedName) fontsToLoad.add(parsedName);
      }
    });

    let googleFontsLinksHtml = '';
    fontsToLoad.forEach(family => {
      if (family && family !== 'sans-serif' && family !== 'serif' && family !== 'monospace' && family !== 'Default (Inter)') {
        googleFontsLinksHtml += `    <link href="https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, '+')}:wght@100;300;400;500;600;700;900&display=swap" rel="stylesheet">\n`;
      }
    });

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>${settings.projectName} - Published WebAR</title>

${googleFontsLinksHtml}

    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .a-enter-vr, .a-enter-ar { display: none !important; }
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
    <script src="https://cdn.jsdelivr.net/npm/three@0.150.0/examples/js/loaders/RGBELoader.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v7.0.0/dist/aframe-extras.min.js"></script>
    <script src="https://unpkg.com/aframe-troika-text/dist/aframe-troika-text.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-compiler.prod.js"></script>

    <script>
      // Deduplication lock to prevent double taps/clicks on mobile devices
      window.__lastClickTimes = window.__lastClickTimes || {};
      window.isDuplicateClick = function(el) {
        const id = el.id || 'anonymous';
        const now = Date.now();
        const lastTime = window.__lastClickTimes[id] || 0;
        // If clicks happen in the same call frame (within 30ms), let both fire (e.g., sound + custom script components)
        // If clicks are more than 30ms but less than 400ms apart, deduplicate them as duplicate taps.
        if (now - lastTime > 30 && now - lastTime < 400) {
          return true;
        }
        window.__lastClickTimes[id] = now;
        return false;
      };

      // Register custom Toon shader for elements using shader: toon
      AFRAME.registerShader('toon', {
        schema: {
          color: {type: 'color', is: 'uniform', default: '#ffffff'},
          src: {type: 'map', is: 'uniform'},
          opacity: {type: 'number', is: 'uniform', default: 1.0},
          transparent: {type: 'boolean', default: false}
        },
        init: function (data) {
          this.material = new THREE.MeshToonMaterial({
            color: new THREE.Color(data.color),
            opacity: data.opacity,
            transparent: data.transparent || data.opacity < 1
          });
          AFRAME.utils.material.updateMap(this, data);
        },
        update: function (data) {
          this.material.color.set(data.color);
          this.material.opacity = data.opacity;
          this.material.transparent = data.transparent || data.opacity < 1;
          AFRAME.utils.material.updateMap(this, data);
        }
      });

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
          this.el.object3D.rotation.set(this.initialRotX, this.initialRotY, this.initialRotZ);

          if (rule === 'hover') {
            this.el.object3D.position.z = this.initialZ + Math.sin(t * 3) * 0.2;
          } else if (rule === 'spin') {
            const localAxis = new THREE.Vector3();
            if (spinAxis === 'x') localAxis.set(1, 0, 0);
            else if (spinAxis === 'y') localAxis.set(0, 1, 0);
            else localAxis.set(0, 0, 1);
            this.el.object3D.rotateOnAxis(localAxis, t * 1.5);
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
              const tapHandler = (e) => {
                if (window.isDuplicateClick && window.isDuplicateClick(el)) return;
                if (e.type === 'touchstart') return; // ignore native touchstart if it ever fires
                self.executeBehavior(b);
              };
              el.addEventListener('click', tapHandler);
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
              const playUrl = b.soundPreset || b.url || 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
              const audio = new Audio(playUrl);
              audio.volume = 0.5;
              audio.play().catch(e => console.error('Audio play failed:', e));
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
                if (targetEl.tagName && (targetEl.tagName.toLowerCase() === 'a-entity' || targetEl.tagName.toLowerCase().startsWith('a-'))) {
                  const currentVisible = targetEl.getAttribute('visible');
                  const visible = currentVisible !== false && currentVisible !== 'false';
                  targetEl.setAttribute('visible', !visible);
                } else {
                  // 2D DOM element
                  const isHidden = targetEl.style.display === 'none' || targetEl.style.visibility === 'hidden' || targetEl.style.opacity === '0';
                  if (isHidden) {
                    targetEl.style.display = targetEl.dataset.originalDisplay || 'flex';
                    targetEl.style.opacity = '1';
                    targetEl.style.pointerEvents = 'auto';
                  } else {
                    targetEl.dataset.originalDisplay = targetEl.style.display;
                    targetEl.style.display = 'none';
                    targetEl.style.opacity = '0';
                    targetEl.style.pointerEvents = 'none';
                  }
                }
              }
              break;
            case 'setVisibility': {
              const setVisEl = b.targetObjectId ? document.getElementById(b.targetObjectId) : this.el;
              if (setVisEl) {
                const targetState = b.visibleState !== 'false';
                if (setVisEl.tagName && (setVisEl.tagName.toLowerCase() === 'a-entity' || setVisEl.tagName.toLowerCase().startsWith('a-'))) {
                  setVisEl.setAttribute('visible', targetState);
                } else {
                  if (targetState) {
                    setVisEl.style.display = setVisEl.dataset.originalDisplay || 'flex';
                    setVisEl.style.opacity = '1';
                    setVisEl.style.pointerEvents = 'auto';
                  } else {
                    setVisEl.dataset.originalDisplay = setVisEl.style.display;
                    setVisEl.style.display = 'none';
                    setVisEl.style.opacity = '0';
                    setVisEl.style.pointerEvents = 'none';
                  }
                }
              }
              break;
            }
            case 'scaleUp': {
              const scaleEl = b.targetObjectId ? document.getElementById(b.targetObjectId) : this.el;
              if (scaleEl && scaleEl.tagName && (scaleEl.tagName.toLowerCase() === 'a-entity' || scaleEl.tagName.toLowerCase().startsWith('a-'))) {
                const currentScale = scaleEl.getAttribute('scale') || {x: 1, y: 1, z: 1};
                const s = typeof currentScale === 'string'
                  ? currentScale.split(' ').map(parseFloat)
                  : [currentScale.x, currentScale.y, currentScale.z];
                scaleEl.setAttribute('scale', {
                  x: (s[0] || 1) * 1.25,
                  y: (s[1] || 1) * 1.25,
                  z: (s[2] || 1) * 1.25
                });
              }
              break;
            }
            case 'scaleDown': {
              const scaleEl = b.targetObjectId ? document.getElementById(b.targetObjectId) : this.el;
              if (scaleEl && scaleEl.tagName && (scaleEl.tagName.toLowerCase() === 'a-entity' || scaleEl.tagName.toLowerCase().startsWith('a-'))) {
                const currentScale = scaleEl.getAttribute('scale') || {x: 1, y: 1, z: 1};
                const s = typeof currentScale === 'string'
                  ? currentScale.split(' ').map(parseFloat)
                  : [currentScale.x, currentScale.y, currentScale.z];
                scaleEl.setAttribute('scale', {
                  x: (s[0] || 1) * 0.8,
                  y: (s[1] || 1) * 0.8,
                  z: (s[2] || 1) * 0.8
                });
              }
              break;
            }
            case 'playModelAnimation': {
              const animEl = b.targetObjectId ? document.getElementById(b.targetObjectId) : this.el;
              if (animEl) {
                const modelEl = animEl.hasAttribute('animation-mixer') ? animEl : animEl.querySelector('[animation-mixer]');
                if (modelEl) {
                  modelEl.setAttribute('animation-mixer', 'timeScale', 1);
                }
              }
              break;
            }
            case 'pauseModelAnimation': {
              const animEl = b.targetObjectId ? document.getElementById(b.targetObjectId) : this.el;
              if (animEl) {
                const modelEl = animEl.hasAttribute('animation-mixer') ? animEl : animEl.querySelector('[animation-mixer]');
                if (modelEl) {
                  modelEl.setAttribute('animation-mixer', 'timeScale', 0);
                }
              }
              break;
            }
            case 'pauseScanning':
              const sceneEl = document.querySelector('a-scene');
              if (sceneEl && sceneEl.systems['mindar-image-system']) {
                sceneEl.systems['mindar-image-system'].pause();
                showToast('Tracking Paused');
              }
              break;
            case 'resumeScanning':
              const sceneEl2 = document.querySelector('a-scene');
              if (sceneEl2 && sceneEl2.systems['mindar-image-system']) {
                sceneEl2.systems['mindar-image-system'].unpause();
                showToast('Tracking Resumed');
              }
              break;
            case 'spin':
              const spinEl = b.targetObjectId ? document.getElementById(b.targetObjectId) : this.el;
              if (spinEl) {
                spinEl.setAttribute('live-behavior', 'rule: spin');
              }
              break;
            case 'transform':
              const tfEl = b.targetObjectId ? document.getElementById(b.targetObjectId) : this.el;
              if (tfEl && b.propertyName && b.propertyValue) {
                let valStr = b.propertyValue.trim().replace(/,/g, ' ');
                tfEl.setAttribute(b.propertyName, valStr);
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
                if (targetEl.tagName && (targetEl.tagName.toLowerCase() === 'a-entity' || targetEl.tagName.toLowerCase().startsWith('a-'))) {
                  const currentVisible = targetEl.getAttribute('visible');
                  const visible = currentVisible !== false && currentVisible !== 'false';
                  targetEl.setAttribute('visible', !visible);
                } else {
                  const isHidden = targetEl.style.display === 'none' || targetEl.style.visibility === 'hidden' || targetEl.style.opacity === '0';
                  if (isHidden) {
                    targetEl.style.display = targetEl.dataset.originalDisplay || 'flex';
                    targetEl.style.opacity = '1';
                    targetEl.style.pointerEvents = 'auto';
                  } else {
                    targetEl.dataset.originalDisplay = targetEl.style.display;
                    targetEl.style.display = 'none';
                    targetEl.style.opacity = '0';
                    targetEl.style.pointerEvents = 'none';
                  }
                }
              }
            },
            getObject: (targetId) => {
              const targetEl = document.getElementById(targetId);
              return targetEl ? { id: targetId, visible: targetEl.getAttribute('visible') !== false } : null;
            },
            playSound: (url) => {
              const playUrl = url || '/sounds/cyber_click.wav';
              const audio = new Audio(playUrl);
              audio.volume = 0.5;
              audio.play().catch(e => console.error('Audio play failed:', e));
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
            if (window.isDuplicateClick && window.isDuplicateClick(el)) return;
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

      AFRAME.registerComponent('model-overrides', {
        schema: {
          materials: {type: 'string', default: '{}'},
          subObjects: {type: 'string', default: '{}'}
        },
        init: function() {
          this.el.addEventListener('model-loaded', () => {
            this.applyOverrides();
          });
          // Fallback if model is already loaded
          if (this.el.getObject3D('mesh')) {
            this.applyOverrides();
          }
        },
        update: function() {
          this.applyOverrides();
        },
        applyOverrides: function() {
          const obj3d = this.el.getObject3D('mesh') || this.el.object3D;
          if (!obj3d) return;

          let mats = {};
          let subs = {};
          try {
            mats = JSON.parse(this.data.materials);
          } catch(e) {}
          try {
            subs = JSON.parse(this.data.subObjects);
          } catch(e) {}

          // Apply Material Overrides by material name
          obj3d.traverse(node => {
            if (node.isMesh && node.material) {
              const nodeMats = Array.isArray(node.material) ? node.material : [node.material];
              nodeMats.forEach((mat, idx) => {
                if (mat && mat.name && mats[mat.name]) {
                  const ovr = mats[mat.name];
                  
                  // Clone to prevent shared cache pollution
                  let targetMat = mat;
                  if (!mat.__clonedForOverride) {
                    targetMat = mat.clone();
                    targetMat.__clonedForOverride = true;
                    if (Array.isArray(node.material)) {
                      node.material[idx] = targetMat;
                    } else {
                      node.material = targetMat;
                    }
                  }

                  if (ovr.color) targetMat.color.set(ovr.color);
                  if (ovr.roughness !== undefined) targetMat.roughness = ovr.roughness;
                  if (ovr.metalness !== undefined) targetMat.metalness = ovr.metalness;
                  if (ovr.opacity !== undefined) {
                    targetMat.opacity = ovr.opacity;
                    targetMat.transparent = ovr.opacity < 1;
                  }
                  if (ovr.emissive) targetMat.emissive.set(ovr.emissive);
                  
                  // Handle texture overrides
                  if (ovr.textureUrl) {
                    const loader = new THREE.TextureLoader();
                    loader.load(ovr.textureUrl, (texture) => {
                      texture.colorSpace = 'srgb';
                      targetMat.map = texture;
                      targetMat.needsUpdate = true;
                    });
                  }
                }
              });
            }
          });

          // Helper to find node by index path
          const findNodeByIndexPath = (root, indexPath) => {
            const indices = indexPath.split('-').map(Number);
            let current = root;
            for (let i = 1; i < indices.length; i++) {
              const idx = indices[i];
              if (!current.children || idx >= current.children.length) return null;
              current = current.children[idx];
            }
            return current;
          };

          // Apply Sub-object Overrides (visibility, transform, etc.)
          Object.keys(subs).forEach(indexPath => {
            const node = findNodeByIndexPath(obj3d, indexPath);
            if (node) {
              const ovr = subs[indexPath];
              if (ovr.visible !== undefined) {
                node.visible = ovr.visible;
              }
              if (ovr.position) {
                node.position.set(ovr.position[0], ovr.position[1], ovr.position[2]);
              }
              if (ovr.rotation) {
                node.rotation.set(
                  THREE.MathUtils.degToRad(ovr.rotation[0]),
                  THREE.MathUtils.degToRad(ovr.rotation[1]),
                  THREE.MathUtils.degToRad(ovr.rotation[2])
                );
              }
              if (ovr.scale) {
                node.scale.set(ovr.scale[0], ovr.scale[1], ovr.scale[2]);
              }
            }
          });
        }
      });

      AFRAME.registerComponent('hdr-environment', {
        schema: {
          enabled: {type: 'boolean', default: false},
          type: {type: 'string', default: 'preset'},
          preset: {type: 'string', default: 'studio'},
          url: {type: 'string', default: ''},
          showBackground: {type: 'boolean', default: false}
        },
        init: function() {
          this.applyHDREnvironment();
        },
        update: function() {
          this.applyHDREnvironment();
        },
        applyHDREnvironment: function() {
          if (!this.data.enabled) return;
          const sceneEl = this.el;
          const scene = sceneEl.object3D;
          const renderer = sceneEl.renderer;
          if (!renderer) {
            sceneEl.addEventListener('render-target-loaded', () => {
              this.applyHDREnvironment();
            });
            return;
          }

          let url = '';
          if (this.data.type === 'custom' && this.data.url) {
            url = this.data.url;
          } else {
            const presetUrls = {
              studio: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/equirectangular/royal_esplanade_1k.hdr',
              apartment: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/equirectangular/royal_esplanade_1k.hdr',
              lobby: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/equirectangular/royal_esplanade_1k.hdr',
              city: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/equirectangular/royal_esplanade_1k.hdr',
              forest: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/equirectangular/venice_sunset_1k.hdr',
              sunset: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/equirectangular/venice_sunset_1k.hdr',
              warehouse: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/equirectangular/royal_esplanade_1k.hdr',
              park: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/equirectangular/venice_sunset_1k.hdr'
            };
            url = presetUrls[this.data.preset] || presetUrls.studio;
          }

          if (!url) return;

          const RGBELoaderClass = THREE.RGBELoader || (window.THREE && window.THREE.RGBELoader);
          if (!RGBELoaderClass) {
            console.warn('[HDR] RGBELoader not found, retrying...');
            setTimeout(() => this.applyHDREnvironment(), 500);
            return;
          }

          try {
            const pmremGenerator = new THREE.PMREMGenerator(renderer);
            pmremGenerator.compileEquirectangularShader();
            
            const rgbeLoader = new RGBELoaderClass();
            rgbeLoader.load(url, (texture) => {
              const envMap = pmremGenerator.fromEquirectangular(texture).texture;
              
              if (this.data.showBackground) {
                scene.background = envMap;
              }
              scene.environment = envMap;
              
              texture.dispose();
              pmremGenerator.dispose();
              
              console.log('[HDR] Environment map reflections applied successfully:', url);
            }, undefined, (err) => {
              console.error('[HDR] Failed to load HDR environment map:', err);
            });
          } catch (e) {
            console.error('[HDR] Error setting up environment generator:', e);
          }
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
            if (window.isDuplicateClick && window.isDuplicateClick(el)) return;
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
            if (window.isDuplicateClick && window.isDuplicateClick(this.el)) return;
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
             const soundEntity = document.createElement('a-entity');
             soundEntity.setAttribute('sound', 'src: url(' + url + '); autoplay: true; volume: 0.5');
             this.el.appendChild(soundEntity);
             setTimeout(() => { if(soundEntity.parentNode) soundEntity.parentNode.removeChild(soundEntity); }, 5000);
          };
          this.el.addEventListener('click', () => {
            if (window.isDuplicateClick && window.isDuplicateClick(this.el)) return;
            playSound();
          });
        }
      });

      // Real-time 3D projected overlay alignment system
      AFRAME.registerComponent('projected-overlay', {
        schema: {
          target: { type: 'selector' },
          alignment: { type: 'string', default: 'none' },
          offsetX: { type: 'number', default: 0 },
          offsetY: { type: 'number', default: 0 }
        },
        init: function() {
          this.overlayEl = document.getElementById(this.el.id.replace('-projector', '-overlay'));
          this.camera = document.querySelector('[camera]')?.components?.camera?.camera;
        },
        tick: function() {
          if (!this.overlayEl) return;
          if (!this.camera) {
            this.camera = document.querySelector('[camera]')?.components?.camera?.camera;
            return;
          }
          if (!this.data.target) return;
          
          var targetObj = this.data.target.object3D;
          if (!targetObj) return;

          var tempV = new THREE.Vector3();
          targetObj.getWorldPosition(tempV);
          
          tempV.project(this.camera);
          
          if (tempV.z > 1) {
            this.overlayEl.style.display = 'none';
            return;
          }
          
          this.overlayEl.style.display = 'flex';
          var x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
          var y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;
          
          this.overlayEl.style.left = x + 'px';
          this.overlayEl.style.top = y + 'px';
          
          var ox = this.data.offsetX;
          var oy = this.data.offsetY;
          var alignment = this.data.alignment;
          
          var tx = -50, ty = -50;
          switch (alignment) {
            case 'top-left': tx = -100; ty = -100; break;
            case 'top-center': tx = -50; ty = -100; break;
            case 'top-right': tx = 0; ty = -100; break;
            case 'center-left': tx = -100; ty = -50; break;
            case 'center': tx = -50; ty = -50; break;
            case 'center-right': tx = 0; ty = -50; break;
            case 'bottom-left': tx = -100; ty = 0; break;
            case 'bottom-center': tx = -50; ty = 0; break;
            case 'bottom-right': tx = 0; ty = 0; break;
            default: tx = 0; ty = 0; break;
          }
          this.overlayEl.style.transform = 'translate(' + (tx + ox) + '%, ' + (ty + oy) + '%)';
        }
      });

      // Global touch/click interaction helper to unlock audio context on mobile browsers
      const unlockAudioContext = function () {
        const audioCtx = THREE.AudioContext.getContext();
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().then(() => {
            console.log('AudioContext successfully unlocked via global interaction!');
            document.removeEventListener('click', unlockAudioContext);
            document.removeEventListener('touchstart', unlockAudioContext);
            document.removeEventListener('touchend', unlockAudioContext);
          }).catch(err => console.log('Context unlock failed:', err));
        } else if (audioCtx && audioCtx.state === 'running') {
            document.removeEventListener('click', unlockAudioContext);
            document.removeEventListener('touchstart', unlockAudioContext);
            document.removeEventListener('touchend', unlockAudioContext);
        }
      };
      document.addEventListener('click', unlockAudioContext, { passive: true });
      document.addEventListener('touchstart', unlockAudioContext, { passive: true });
      document.addEventListener('touchend', unlockAudioContext, { passive: true });
    </script>
  </head>
  <body>
    ${overlayHtml}
    <!-- WebAR Loading Screen -->
    <div id="compiler-overlay" style="position: fixed; inset: 0; background: #0E0E0E; z-index: 10000010 !important; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; transition: opacity 0.4s ease-in-out; color: white;">
      <div style="background: #181818; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 20px; width: 85%; max-width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center;">
        <div style="width: 50px; height: 50px; border-radius: 25px; border: 3px solid rgba(251, 191, 36, 0.15); border-top-color: #fbbf24; animation: spinLoader 1s linear infinite;"></div>
        <div>
          <h2 id="loading-title" style="margin: 0; font-size: 14px; font-weight: 600; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.05em;">Initializing WebAR</h2>
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
               embedded color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights: true" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false"
               ${settings.hdrEnvironmentEnabled ? `hdr-environment="enabled: true; type: ${settings.hdrEnvironmentType || 'preset'}; preset: ${settings.hdrPreset || 'studio'}; url: ${settings.hdrEnvironmentUrl || ''}; showBackground: ${settings.hdrBackgroundEnabled ?? false}"` : ''}>
        
        <a-assets>
          ${Array.from(audioAssetUrls).map((url, i) => `<audio id="audio-asset-${i}" src="${url}" preload="auto"></audio>`).join('\n          ')}
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false; rayOrigin: mouse;" raycaster="objects: .clickable"></a-camera>
        
        <a-light type="ambient" color="${settings.ambientColor || '#ffffff'}" intensity="${settings.ambientIntensity ?? 0.5}"></a-light>
        <a-light type="directional" color="${settings.directionalColor || '#ffffff'}" intensity="${settings.directionalIntensity ?? 1.0}" position="${settings.directionalPosition ? settings.directionalPosition.join(' ') : '1 2 1'}" ${settings.shadowsEnabled !== false ? `light="castShadow: true; shadowMapHeight: ${settings.shadowResolution || 1024}; shadowMapWidth: ${settings.shadowResolution || 1024}; shadowRadius: ${settings.shadowSoftness ?? 3}; shadowBias: -0.0005"` : 'light="castShadow: false"'}></a-light>

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

      function setupMobileTouchFallback(scene) {
        console.log('[TOUCH] Initializing bulletproof mobile screen touch/tap raycaster.');
        
        const handleScreenTouch = (e) => {
          // Supports standard click, touchstart/touchend, etc.
          let clientX, clientY;
          if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
          } else if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
          } else if (e.clientX !== undefined) {
            clientX = e.clientX;
            clientY = e.clientY;
          } else {
            return;
          }

          const cameraEl = scene.querySelector('[camera]') || scene.querySelector('a-camera');
          if (!cameraEl || !cameraEl.components.camera) {
            console.warn('[TOUCH-WARN] Active camera component not ready.');
            return;
          }

          const camera = cameraEl.components.camera.camera;
          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2();

          // Resolve normalized coordinate [-1, 1] relative to client screen
          mouse.x = (clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(clientY / window.innerHeight) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);

          // Locate all clickable nodes
          const clickables = Array.from(scene.querySelectorAll('.clickable'));
          const objects3D = clickables.map(el => el.object3D).filter(Boolean);

          if (objects3D.length === 0) return;

          // Check intersections
          const intersects = raycaster.intersectObjects(objects3D, true);
          if (intersects.length > 0) {
            // Traverse up to find the element containing the matching class
            let firstObj = intersects[0].object;
            let current = firstObj;
            let matchedEl = null;

            while (current) {
              matchedEl = clickables.find(el => el.object3D === current);
              if (matchedEl) break;
              current = current.parent;
            }

            if (matchedEl) {
              console.log('[TOUCH-SUCCESS] Raycaster intersected clickable entity:', matchedEl.id || matchedEl.tagName);
              
              // Standard DOM click dispatching to invoke A-Frame click event listeners
              matchedEl.emit('click', { intersection: intersects[0] });
            }
          }
        };

        // Attach listeners directly to scene element
        scene.addEventListener('touchend', handleScreenTouch, { passive: true });
        scene.addEventListener('click', handleScreenTouch, { passive: true });
      }

      function attachSceneListeners(scene) {
        console.log('[STAGE] A-Frame scene element matched. Preparing tracking and system events.');
        
        scene.addEventListener('loaded', () => {
          console.log('[STAGE] A-Frame components loaded and assets are ready.');
          setupMobileTouchFallback(scene);
        });
        
        scene.addEventListener('renderstart', () => {
          console.log('[STAGE] WebGL Renderer render loop started successfully.');
        });

        scene.addEventListener('arReady', (event) => {
          console.log('[MINDAR] AR Engine is ready and camera feed is active!');
          const compilerOverlay = document.getElementById('compiler-overlay');
          if (compilerOverlay) {
            compilerOverlay.style.opacity = '0';
            setTimeout(() => {
              compilerOverlay.style.display = 'none';
            }, 400);
          }
          showScanningOverlay();
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
          
          const statusText = document.getElementById('compiler-status');
          if (statusText) statusText.innerText = 'Starting AR Engine...';
          const loadingTitle = document.getElementById('loading-title');
          if (loadingTitle) loadingTitle.innerText = 'Initializing WebAR';
          
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

  
  