const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');
code = code.replace(/\{PRESET_BEHAVIORS\.map\([\s\S]*?\)\}/, '');
fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
