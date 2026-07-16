const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

const regex1 = /const sfx = new Audio\(url\);\n\s*sfx\.volume = 0;\n\s*sfx\.muted = true;\n\s*sfx\.play\(\)\n\s*\.then\(\(\) => \{\n\s*sfx\.pause\(\);\n\s*sfx\.muted = false;\n\s*sfx\.volume = 1;/;
const replacement1 = `if (!globalAudioCache[url]) globalAudioCache[url] = new Audio(url);
          const sfx = globalAudioCache[url];
          sfx.volume = 0;
          sfx.muted = true;
          sfx.play()
            .then(() => {
              sfx.pause();
              sfx.muted = false;
              sfx.volume = 1;`;
code = code.replace(regex1, replacement1);

const regex2 = /const audio = new Audio\(\);\n\s*audio\.preload = 'auto';\n\s*audio\.src = url;/;
const replacement2 = `if (!globalAudioCache[url]) {
          const audio = new Audio(url);
          audio.preload = 'auto';
          globalAudioCache[url] = audio;
        }`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
console.log("Success");
