const fs = require('fs');
let code = fs.readFileSync('src/components/hierarchy/HierarchyPanel.tsx', 'utf8');

// 1. Remove activeTab state
code = code.replace(/const \[activeTab, setActiveTab\] = useState<'hierarchy' | 'library'>\('hierarchy'\);\n/, '');

// 2. Remove Visual Tab Bar (lines 520-547 in the original, now let's just use regex)
code = code.replace(/\{\/\* Visual Tab Bar \*\/\}[\s\S]*?<\/div>/, '{/* Header */}');

// 3. Remove {activeTab === 'hierarchy' && ( and its closing braces and library stuff
code = code.replace(/\{activeTab === 'hierarchy' && \(\n\s*<div className="flex-1 flex flex-col overflow-hidden">/, '<div className="flex-1 flex flex-col overflow-hidden">');

// Find the end of hierarchy tab and library tab.
// Currently it is:
//           </span>
//         </button>
//       </div>
//       </div>
//       )}
//       
//       {activeTab === 'library' && (
//          ... library stuff ...
//       )}
//     </aside>

const regexRemoveEnd = /<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}\n\s*\{activeTab === 'library' && \([\s\S]*?\}\)\n\s*\)\}\n\s*<\/div>\n\s*<\/div>\n\s*\)\}\n\s*<\/aside>/;
const repEnd = `</button>
      </div>
      </div>
    </aside>`;
code = code.replace(regexRemoveEnd, repEnd);

// There is also some {activeTab === 'library' && ( ... )} we should just match the whole library tab and remove it.
// Let's do it safer. 
