const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');
code = code.replace(/<button[^>]+onClick=\{\(\) => setActiveTab\('behaviors'\)\}[\s\S]*?<\/button>/, '');
fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
