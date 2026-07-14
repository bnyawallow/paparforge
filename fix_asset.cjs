const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf-8');
const target = `    description: 'Elegant wexport function AssetBrowser() {`;
const replacement = `    description: 'Elegant white stork soaring with flapping wings'
  }
];

type CategoryTab = 'uploads' | 'sketchfab' | 'models' | 'markers' | 'audio' | 'behaviors' | 'lighting';

export function AssetBrowser() {`;
code = code.replace(target, replacement);

const target2 = `  if (!isAssetBrowserOpen) return null;;

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);`;
const replacement2 = `  if (!isAssetBrowserOpen) return null;`;
code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code, 'utf-8');
