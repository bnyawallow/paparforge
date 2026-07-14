const fs = require('fs');

const path = 'src/lib/aframeGenerator.ts';
let content = fs.readFileSync(path, 'utf8');

const buildEntityPattern = "const buildEntity = (id: string, depth = 0): string => {";
const buildEntityStart = content.indexOf(buildEntityPattern);
if (buildEntityStart > -1) {
  content = content.replace(buildEntityPattern, `
    const buildEntity = (id: string, depth = 0): string => {
      const obj = objects[id];
      if (!obj || !obj.visible) return '';
      // Skip 2D overlays in A-Frame 3D scene
      if (['overlay2d', 'overlayText', 'overlayButton', 'overlayImage'].includes(obj.type)) return '';
`);
}

const htmlPattern = "return `<!DOCTYPE html>";
const htmlStart = content.indexOf(htmlPattern);
if (htmlStart > -1) {
  const overlayHtmlCode = `
    let overlayHtml = '';
    const overlayObjects = Object.values(objects).filter((obj: any) => 
      ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage'].includes(obj.type) && obj.visible !== false
    );

    if (overlayObjects.length > 0) {
      overlayHtml += \`<div id="ui-layer" style="position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 1000; overflow: hidden;">\\n\`;
      overlayObjects.forEach((obj: any) => {
        const props = obj.properties || {};
        const pointerEvents = 'auto'; // allow clicks
        
        let styleStr = \`position: absolute; pointer-events: \${pointerEvents}; box-sizing: border-box; \`;
        
        if (obj.type === 'overlay2d') {
          styleStr += \`top: 0; left: 0; right: 0; bottom: 0; background-color: \${props.backgroundColor || '#000'}; opacity: \${props.opacity ?? 0.5};\`;
          overlayHtml += \`  <div id="\${obj.id}" style="\${styleStr}"></div>\\n\`;
        } else {
          styleStr += \`top: \${props.top !== undefined ? props.top + 'px' : '0'}; left: \${props.left !== undefined ? props.left + 'px' : '0'}; opacity: \${props.opacity ?? 1}; \`;
          
          if (obj.type === 'overlayText') {
            styleStr += \`color: \${props.color || '#fff'}; font-size: \${props.fontSize || 24}px; white-space: pre-wrap; font-family: sans-serif;\`;
            overlayHtml += \`  <div id="\${obj.id}" style="\${styleStr}">\${props.text || 'Text'}</div>\\n\`;
          } else if (obj.type === 'overlayButton') {
            styleStr += \`background-color: \${props.color || '#3b82f6'}; color: \${props.textColor || '#fff'}; padding: \${props.paddingY || 8}px \${props.paddingX || 16}px; border-radius: \${props.borderRadius || 8}px; border: none; cursor: pointer;\`;
            const onClickAttr = props.url ? \` onclick="window.open('\${props.url}', '_blank')"\` : '';
            overlayHtml += \`  <button id="\${obj.id}" style="\${styleStr}"\${onClickAttr}>\${props.text || 'Button'}</button>\\n\`;
          } else if (obj.type === 'overlayImage') {
            styleStr += \`width: \${props.width || 200}px; height: \${props.height || 200}px; object-fit: cover;\`;
            overlayHtml += \`  <img id="\${obj.id}" src="\${props.textureUrl || 'https://via.placeholder.com/200'}" style="\${styleStr}" />\\n\`;
          }
        }
      });
      overlayHtml += \`</div>\\n\`;
    }

    return \`<!DOCTYPE html>`;
  
  content = content.replace(htmlPattern, overlayHtmlCode);
}

const bodyStart = content.indexOf("<body>");
if (bodyStart > -1) {
  content = content.replace("<body>", "<body>\n    ${overlayHtml}");
}

fs.writeFileSync(path, content, 'utf8');
