const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace("import { ViewerLayout } from './components/layout/ViewerLayout';\n", "");
content = content.replace('        <Route path="/papar/:projectId" element={<ViewerLayout />} />\n', "");

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx");
