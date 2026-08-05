const fs = require('fs');
let content = fs.readFileSync('src/lib/aframeGenerator.ts', 'utf8');

const target = "} else if (obj.type === 'icon') {";
const replacement = `} else if (obj.type === 'icon2d') {
        const badgeColor = obj.properties.color || '#3b82f6';
        const labelText = obj.properties.text || obj.properties.iconName || 'Icon';
        entity += \`\${indent}  <a-entity geometry="primitive: plane; width: 1.5; height: 1.5" material="color: \${badgeColor}; transparent: true; opacity: 0.9; shader: flat" text="value: \${labelText}; align: center; width: 4; color: white"></a-entity>\\n\`;
      } else if (obj.type === 'icon') {`;

if (content.includes("obj.type === 'icon2d'")) {
    console.log("icon2d already exists");
} else {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/lib/aframeGenerator.ts', content);
    console.log("icon2d added to aframeGenerator");
}
