const fs = require('fs');
let code = fs.readFileSync('src/components/hierarchy/HierarchyPanel.tsx', 'utf8');

const regex = /<\/div>\n\s*<\/div>\n\s*\{activeTab === 'library' && \(/;
const replacement = `</div>
      </div>
      )}
      
      {activeTab === 'library' && (`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/hierarchy/HierarchyPanel.tsx', code);
console.log("Success Fix 2");
