const fs = require('fs');
let content = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

content = content.replace(
  /tex\.repeat\.set\(repeatX \|\| 1, repeatY \|\| 1\);\s+tex\.needsUpdate = true;\s+loadedMaps\[key\] = tex;/g,
  `tex.repeat.set(repeatX || 1, repeatY || 1);
              if (key === 'map' || key === 'emissiveMap') {
                tex.colorSpace = THREE.SRGBColorSpace;
              } else {
                tex.colorSpace = THREE.LinearSRGBColorSpace || THREE.NoColorSpace;
              }
              tex.needsUpdate = true;
              loadedMaps[key] = tex;`
);

fs.writeFileSync('src/components/viewport/Viewport.tsx', content);
