const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

const regex = /const audio = new Audio\(soundUrl\);/;
const replacement = `if (!globalAudioCache[soundUrl]) globalAudioCache[soundUrl] = new Audio(soundUrl);\n    const audio = globalAudioCache[soundUrl];`;
code = code.replace(regex, replacement);

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
console.log("Success");
