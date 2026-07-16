const fs = require('fs');
let code = fs.readFileSync('src/components/hierarchy/HierarchyPanel.tsx', 'utf8');

const regex = /<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}\n\s*\{activeTab === 'library' && \([\s\S]*?\)\n\s*\}\n/m;
code = code.replace(regex, `</button>\n      </div>\n      </div>\n`);

code = code.replace(/\{activeTab === 'hierarchy' && \(\n\s*<div className="flex-1 flex flex-col overflow-hidden">/, '<div className="flex-1 flex flex-col overflow-hidden">');

const regexEnd = /<\/div>\n\s*<\/div>\n\s*\)\}\n\s*<\/aside>/;
code = code.replace(regexEnd, `</div>\n      </div>\n    </aside>`);

fs.writeFileSync('src/components/hierarchy/HierarchyPanel.tsx', code);
console.log("Success Clean Hard");
