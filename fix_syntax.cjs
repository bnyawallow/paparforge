const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

// The anchor was:
const anchor = "                        <span>3D</span>\n                      </button>\n                    </div>\n                  </>\n                )}\n              </div>\n            </div>";

// We need to restore it to the proper form.
const replacement = "                        <span>3D</span>\n                      </button>\n                    </div>\n                  </>\n                )}\n              </div>\n\n          {/* Camera projection toggle */}";

code = code.replace(anchor, replacement);

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
