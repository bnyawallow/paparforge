const fs = require('fs');
const content = fs.readFileSync('src/lib/aframeGenerator.ts', 'utf8');

const target = "} else if (obj.type === 'icon') {";
const replacement = `} else if (obj.type === 'icon') {
        const iconColor = obj.properties.color || '#ef4444';
        const matAttr = buildMaterialAttr(obj.properties);
        const iconType = obj.properties.iconType || 'rocket';
        entity += \`\${indent}  <a-entity gltf-model="/models/icons/\${iconType}.glb" material="\${matAttr}"></a-entity>\\n\`;`;

const updated = content.replace(
    "} else if (obj.type === 'icon') {\n        const iconColor = obj.properties.color || '#ef4444';\n        const matAttr = buildMaterialAttr(obj.properties);\n        entity += `${indent}  <a-box material=\"${matAttr}\"></a-box>\\n`;", 
    replacement
);
fs.writeFileSync('src/lib/aframeGenerator.ts', updated);
