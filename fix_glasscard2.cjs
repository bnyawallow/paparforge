const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

code = code.replace('      </GlassCard>', '        </div>\n      </div>\n      )}');

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
