const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

code = code.replace('      </GlassCard>\n      {/* AR Snapshot Preview & Share Modal */}', '        </div>\n      </div>\n      )}\n\n      {/* AR Snapshot Preview & Share Modal */}');

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
