const fs = require('fs');
let code = fs.readFileSync('src/utils/prebuiltTemplates.ts', 'utf8');

// Add tags to the interface
code = code.replace(/objectType: SceneObject\['type'\];/, "objectType: SceneObject['type'];\n  tags?: string[];");

// Now let's inject tags to the instances.
code = code.replace(/name: 'Glassmorphism Panel',[\s\S]*?description: '(.*?)',/, "$&\n    tags: ['2d', 'ui', 'panel'],");
code = code.replace(/name: 'HUD Title Text',[\s\S]*?description: '(.*?)',/, "$&\n    tags: ['2d', 'ui', 'text'],");
code = code.replace(/name: 'Modern UI Button',[\s\S]*?description: '(.*?)',/, "$&\n    tags: ['2d', 'ui', 'button'],");
code = code.replace(/name: 'HTML Telemetry Dashboard',[\s\S]*?description: '(.*?)',/, "$&\n    tags: ['2d', 'ui', 'embed', 'complex'],");
code = code.replace(/name: '3D Neon Glass CTA',[\s\S]*?description: '(.*?)',/, "$&\n    tags: ['3d', 'interactive', 'button'],");
code = code.replace(/name: '3D Hologram Card',[\s\S]*?description: '(.*?)',/, "$&\n    tags: ['3d', 'text', 'hologram'],");

fs.writeFileSync('src/utils/prebuiltTemplates.ts', code);
console.log("Success Prebuilt");
