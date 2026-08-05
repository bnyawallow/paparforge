const fs = require('fs');
let code = fs.readFileSync('src/lib/aframeGenerator.ts', 'utf8');
code = code.replace(/obj\.properties\.visualBehaviors/g, '(obj.events || [])');
code = code.replace(/props\.visualBehaviors/g, '(props.events || [])');
code = code.replace(/obj\.properties\?\.visualBehaviors/g, '(obj.events || [])');

// We also need to map the new 'events' & 'actions' array into a structure that `visual-behavior` expects, 
// OR we rewrite the AFRAME component. It's safer to map the new structure to the old structure inside aframeGenerator, 
// OR just write a quick mapped string. Wait, if I want to remove the old system entirely, I should rewrite the A-Frame component logic.
