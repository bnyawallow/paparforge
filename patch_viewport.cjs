const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

// Replace Z button
code = code.replace(/onClick=\{\(\) => \{[\s\S]*?setActiveAxisView\('Z'\);[\s\S]*?setIsAxisMenuOpen\(false\);\s*\}\}/, "onClick={() => { setActiveAxisView('Z'); setAxisUpdateId(n => n + 1); setIsAxisMenuOpen(false); }}");
code = code.replace(/onClick=\{\(\) => \{[\s\S]*?setActiveAxisView\('Y'\);[\s\S]*?setIsAxisMenuOpen\(false\);\s*\}\}/, "onClick={() => { setActiveAxisView('Y'); setAxisUpdateId(n => n + 1); setIsAxisMenuOpen(false); }}");
code = code.replace(/onClick=\{\(\) => \{[\s\S]*?setActiveAxisView\('X'\);[\s\S]*?setIsAxisMenuOpen\(false\);\s*\}\}/, "onClick={() => { setActiveAxisView('X'); setAxisUpdateId(n => n + 1); setIsAxisMenuOpen(false); }}");
code = code.replace(/onClick=\{\(\) => \{[\s\S]*?setActiveAxisView\('3D'\);[\s\S]*?setIsAxisMenuOpen\(false\);\s*\}\}/, "onClick={() => { setActiveAxisView('3D'); setAxisUpdateId(n => n + 1); setIsAxisMenuOpen(false); }}");

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
