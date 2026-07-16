const fs = require('fs');
let code = fs.readFileSync('src/lib/aframeGenerator.ts', 'utf8');

const scriptRegex = /<script>/;
const scriptReplacement = `<script>
      // Audio caching and preloading
      window.__audioCache = {};
      const preloadedSounds = new Set();
      // Unmute all audio on first interaction
      function unlockAudio() {
        Object.values(window.__audioCache).forEach(audio => {
           audio.muted = false;
        });
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      }
      document.addEventListener('click', unlockAudio);
      document.addEventListener('touchstart', unlockAudio);`;

if (code.includes('<script>') && !code.includes('window.__audioCache = {};')) {
    code = code.replace(scriptRegex, scriptReplacement);
    
    // add preload statements
    const soundUrls = new Set();
    const regexExtract = /playSound.*?b\.soundPreset \|\| b\.url \|\| '(.*?)'/g;
    
    // We can just find all soundUrls in objects and push them to __audioCache.
    // Instead of doing it in node script, we can do it when generating the HTML:
    
    // I'll modify the generator code to inject preloads.
}
fs.writeFileSync('src/lib/aframeGenerator.ts', code);
console.log("Success");
