const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

const lastGlassCard = '        </div>\n      </GlassCard>';
const newStr = '        </div>\n      </div>\n      )}';

const parts = code.split(lastGlassCard);
if (parts.length > 1) {
  code = parts.slice(0, parts.length - 1).join(lastGlassCard) + newStr + parts[parts.length - 1];
}

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
