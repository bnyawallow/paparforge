const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

const anchor = "                        <span>3D</span>\n                      </button>\n                    </div>\n                  </>\n                )}";

code = code.replace(anchor, anchor + "\n              </div>\n            </div>");

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
