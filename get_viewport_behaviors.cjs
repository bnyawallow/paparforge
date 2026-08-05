const fs = require('fs');
const lines = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8').split('\n');
const results = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('visualBehaviors')) {
    results.push(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}
console.log(results.join('\n'));
