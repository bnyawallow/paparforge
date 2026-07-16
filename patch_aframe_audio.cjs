const fs = require('fs');
let code = fs.readFileSync('src/lib/aframeGenerator.ts', 'utf8');

const regex = /const audio = new Audio\(playUrl\);\n\s*audio\.volume = 0\.5;\n\s*if \(b\.soundLoop\) audio\.loop = true;\n\s*audio\.play\(\)\.catch\(e => console\.error\('Audio play failed:', e\)\);/;
const replacement = `if (!window.__audioCache) window.__audioCache = {};
              if (!window.__audioCache[playUrl]) {
                const a = new Audio(playUrl);
                a.preload = 'auto';
                window.__audioCache[playUrl] = a;
              }
              const audio = window.__audioCache[playUrl];
              audio.volume = 0.5;
              audio.currentTime = 0;
              if (b.soundLoop) audio.loop = true;
              audio.play().catch(e => console.error('Audio play failed:', e));`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/lib/aframeGenerator.ts', code);
console.log("Success");
