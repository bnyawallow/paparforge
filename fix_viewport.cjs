const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');
code = code.replace(/obj\.properties\.visualBehaviors/g, '(obj.events || [])');
code = code.replace(/obj\?\.properties\.visualBehaviors/g, '(obj?.events || [])');
code = code.replace(/obj\.properties\?\.visualBehaviors/g, '(obj?.events || [])');
fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
