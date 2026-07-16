const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');

// Remove absolute close button
code = code.replace(/<button\s*onClick=\{.*?setIsAssetBrowserOpen\(false\)\}\s*className="absolute top-2 right-4 z-50 text-gray-400 hover:text-white"\s*>\s*✕\s*<\/button>/, '');

// Inject close button in header
const headerEndRegex = /<input\s*type="file"[\s\S]*?\/>\s*<\/div>/;
const headerReplacement = `$&
        <button onClick={() => setIsAssetBrowserOpen(false)} className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
          <X size={20} />
        </button>`;

code = code.replace(headerEndRegex, headerReplacement);

// Make sure X is imported from lucide-react
if (!code.includes('X,')) {
    code = code.replace(/Trash2,/, 'Trash2, X,');
}

fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
console.log("Success Close Button");
