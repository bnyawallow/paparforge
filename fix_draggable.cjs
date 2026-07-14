const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Overlay2DRenderer.tsx', 'utf-8');

const targetPointerEvents = `        const pointerEvents = isPreviewMode ? 'auto' : 'none';`;
const replacePointerEvents = `        const pointerEvents = 'auto';
        const handleMouseDown = (e: React.MouseEvent) => {
          if (isPreviewMode) return;
          e.stopPropagation();
          selectObject(obj.id);
          if (obj.type !== 'overlay2d') { // overlay2d is fullscreen, so no drag
            setDraggingObj({
              id: obj.id,
              startX: e.clientX,
              startY: e.clientY,
              startTop: props.top || 0,
              startLeft: props.left || 0
            });
          }
        };`;
code = code.replace(targetPointerEvents, replacePointerEvents);

// Now we need to inject onMouseDown into each element
const targetOverlay2d = `<div 
              key={obj.id} 
              className="absolute inset-0"
              style={{ 
                backgroundColor: props.backgroundColor || '#000', 
                opacity: props.opacity ?? 0.5,
                pointerEvents,
              }}
            >
            </div>`;
const replaceOverlay2d = `<div 
              key={obj.id} 
              className="absolute inset-0"
              style={{ 
                backgroundColor: props.backgroundColor || '#000', 
                opacity: props.opacity ?? 0.5,
                pointerEvents,
              }}
              onMouseDown={handleMouseDown}
            >
            </div>`;
code = code.replace(targetOverlay2d, replaceOverlay2d);

const targetOverlayText = `<div 
              key={obj.id} 
              style={{ 
                ...baseStyle, 
                color: props.color || '#fff', 
                fontSize: \`\${props.fontSize || 24}px\`,
                whiteSpace: 'pre-wrap'
              }}
            >`;
const replaceOverlayText = `<div 
              key={obj.id} 
              style={{ 
                ...baseStyle, 
                color: props.color || '#fff', 
                fontSize: \`\${props.fontSize || 24}px\`,
                whiteSpace: 'pre-wrap',
                cursor: !isPreviewMode ? 'move' : 'default'
              }}
              onMouseDown={handleMouseDown}
            >`;
code = code.replace(targetOverlayText, replaceOverlayText);

const targetOverlayButton = `<button 
              key={obj.id} 
              style={{ 
                ...baseStyle, 
                backgroundColor: props.color || '#3b82f6', 
                color: props.textColor || '#fff', 
                padding: \`\${props.paddingY || 8}px \${props.paddingX || 16}px\`, 
                borderRadius: \`\${props.borderRadius || 8}px\`,
                border: (!isPreviewMode && isSelected) ? '2px solid #fff' : 'none',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (isPreviewMode && props.url) {
                  window.open(props.url, '_blank');
                }
              }}
            >`;
const replaceOverlayButton = `<button 
              key={obj.id} 
              style={{ 
                ...baseStyle, 
                backgroundColor: props.color || '#3b82f6', 
                color: props.textColor || '#fff', 
                padding: \`\${props.paddingY || 8}px \${props.paddingX || 16}px\`, 
                borderRadius: \`\${props.borderRadius || 8}px\`,
                border: (!isPreviewMode && isSelected) ? '2px solid #fff' : 'none',
                cursor: !isPreviewMode ? 'move' : 'pointer'
              }}
              onMouseDown={handleMouseDown}
              onClick={() => {
                if (isPreviewMode && props.url) {
                  window.open(props.url, '_blank');
                }
              }}
            >`;
code = code.replace(targetOverlayButton, replaceOverlayButton);

const targetOverlayImage = `<img 
              key={obj.id}
              src={props.textureUrl || 'https://via.placeholder.com/200'}
              alt={obj.name}
              style={{ 
                ...baseStyle, 
                width: \`\${props.width || 200}px\`, 
                height: \`\${props.height || 200}px\`, 
                objectFit: 'cover' 
              }}
            />`;
const replaceOverlayImage = `<img 
              key={obj.id}
              src={props.textureUrl || 'https://via.placeholder.com/200'}
              alt={obj.name}
              style={{ 
                ...baseStyle, 
                width: \`\${props.width || 200}px\`, 
                height: \`\${props.height || 200}px\`, 
                objectFit: 'cover',
                cursor: !isPreviewMode ? 'move' : 'default'
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />`;
code = code.replace(targetOverlayImage, replaceOverlayImage);

fs.writeFileSync('src/components/viewport/Overlay2DRenderer.tsx', code, 'utf-8');
