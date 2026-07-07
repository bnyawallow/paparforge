const fs = require('fs');

let content = fs.readFileSync('src/store/useEditorStore.ts', 'utf-8');

content = content.replace(/const parsed = JSON\.parse\(savedDataStr\);/g, "const parsed = sanitizeBlobUrls(JSON.parse(savedDataStr));");
content = content.replace(/const parsed = JSON\.parse\(projectJson\);/g, "const parsed = sanitizeBlobUrls(JSON.parse(projectJson));");

fs.writeFileSync('src/store/useEditorStore.ts', content);
console.log("Patched all parse.");
