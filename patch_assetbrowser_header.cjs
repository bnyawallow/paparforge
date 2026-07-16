const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');

code = code.replace(/<div className="h-9 border-b border-\[\#2A2A2A\] bg-\[\#161616\] flex items-center px-4 justify-between shrink-0">/,
  '<div className="h-14 border-b border-white/10 bg-black/20 flex items-center px-6 justify-between shrink-0">');

// change text-xs to text-sm for AR Assets Studio
code = code.replace(/<span className="text-xs font-semibold text-\[\#CCC\]">AR Assets Studio<\/span>/,
  '<span className="text-sm font-black tracking-wide text-white">AR ASSET STUDIO</span>');

fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
console.log("Success Header");
