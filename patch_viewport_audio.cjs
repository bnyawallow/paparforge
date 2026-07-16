const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

code = "import { playCachedAudio, globalAudioCache } from '../../lib/audioManager';\n" + code;

const playSoundAction = /const sfx = new Audio\(playUrl\);\n\s*sfx\.volume = 0\.5;\n\s*if \(b\.soundLoop\) \{\n\s*sfx\.loop = true;\n\s*\/\/ You might want a way to stop it, but for now we just loop it\n\s*\}\n\s*sfx\.play\(\)\.catch\(e => console\.log\('Audio preset play failed', e\)\);/;
const playSoundActionRep = `playCachedAudio(playUrl, b.soundLoop, 0.5);`;
code = code.replace(playSoundAction, playSoundActionRep);

const clickSfx = /const sfx = new Audio\(obj\.properties\.soundUrl\);\n\s*sfx\.volume = 0\.5;\n\s*sfx\.play\(\)\.catch\(err => console\.log\('Interactive SFX playback failed:', err\)\);/;
const clickSfxRep = `playCachedAudio(obj.properties.soundUrl, false, 0.5);`;
code = code.replace(clickSfx, clickSfxRep);

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
console.log("Success");
