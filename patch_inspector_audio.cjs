const fs = require('fs');
let code = fs.readFileSync('src/components/inspector/InspectorPanel.tsx', 'utf8');

code = "import { playCachedAudio } from '../../lib/audioManager';\n" + code;

const regex1 = /const sfx = new Audio\(obj\.properties\.soundUrl\);\n\s*sfx\.play\(\)\.catch\(e => console\.log\('Audio test play failed', e\)\);/;
const replacement1 = `playCachedAudio(obj.properties.soundUrl);`;
code = code.replace(regex1, replacement1);

const regex2 = /const sfx = new Audio\(obj\.properties\.soundUrl\);\n\s*sfx\.play\(\)\.catch\(e => console\.log\('Audio test play failed', e\)\);/g;
code = code.replace(regex2, replacement1);

fs.writeFileSync('src/components/inspector/InspectorPanel.tsx', code);
console.log("Success");
