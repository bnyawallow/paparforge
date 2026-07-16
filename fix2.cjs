const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');
code = code.replace("<Sun,\n  Globe size={16}", "<Sun size={16}");
fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
