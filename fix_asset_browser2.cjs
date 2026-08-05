const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');
code = code.replace(/\{\/\* BEHAVIORS TAB \*\/\}[\s\S]*?\{\/\* SCENE LIGHTING TAB \*\/\}/, '{/* SCENE LIGHTING TAB */}');
fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
