const fs = require('fs');
let content = fs.readFileSync('src/lib/aframeGenerator.ts', 'utf-8');
content = content.replace(
  '<script src="https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js" async crossorigin="anonymous" data-preload-chunks="slam"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js" crossorigin="anonymous" data-preload-chunks="slam"></script>'
);
fs.writeFileSync('src/lib/aframeGenerator.ts', content);
console.log("Patched async.");
