const fs = require('fs');
let code = fs.readFileSync('src/lib/aframeGenerator.ts', 'utf8');

const regex = /fontsToLoad\.add\(parsedName\);\n\s*\}\n\s*\}\);/;
const replacement = `fontsToLoad.add(parsedName);
      }
    });

    const soundUrls = new Set<string>();
    Object.values(objects).forEach((obj: any) => {
      if (obj.properties?.soundUrl) {
        soundUrls.add(obj.properties.soundUrl);
      }
      if (obj.properties?.visualBehaviors) {
        obj.properties.visualBehaviors.forEach((b: any) => {
          if (b.action === 'playSound' && (b.soundPreset || b.url)) {
            soundUrls.add(b.soundPreset || b.url);
          }
        });
      }
    });

    let audioPreloadScript = \`<script>
      window.__audioCache = {};
      const urlsToPreload = \${JSON.stringify(Array.from(soundUrls))};
      urlsToPreload.forEach(url => {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.volume = 0;
        audio.muted = true;
        window.__audioCache[url] = audio;
      });
      function unlockAudio() {
        Object.values(window.__audioCache).forEach(audio => {
           audio.muted = false;
        });
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      }
      document.addEventListener('click', unlockAudio, { once: true });
      document.addEventListener('touchstart', unlockAudio, { once: true });
    </script>\`;`;

code = code.replace(regex, replacement);

const scriptInjectRegex = /\$\{googleFontsLinksHtml\}/;
code = code.replace(scriptInjectRegex, `\${googleFontsLinksHtml}\n\${audioPreloadScript}`);

fs.writeFileSync('src/lib/aframeGenerator.ts', code);
console.log("Success");
