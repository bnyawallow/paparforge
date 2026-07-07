const fs = require('fs');
let content = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf-8');
content = content.replace("import { supabase } from '../../lib/supabase';", "import { supabase } from '../../lib/supabase';\nimport { fileToDataUrl } from '../../lib/fileUtils';");
content = content.replace("url = URL.createObjectURL(file);", "url = await fileToDataUrl(file);");
content = content.replace("url = URL.createObjectURL(file);", "url = await fileToDataUrl(file);");
fs.writeFileSync('src/components/assets/AssetBrowser.tsx', content);
console.log("AssetBrowser patched");
