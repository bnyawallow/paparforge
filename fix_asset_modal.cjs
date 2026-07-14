const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf-8');

const target1 = `return (
    <div className="h-full border-t border-[#2A2A2A] bg-[#111111] flex flex-col relative select-none">`;
const replacement1 = `return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-8">
      <div className="w-full h-full max-w-7xl max-h-[90vh] rounded-2xl overflow-hidden border border-[#2A2A2A] bg-[#111111] flex flex-col relative select-none shadow-2xl">
        <button 
          onClick={() => setIsAssetBrowserOpen(false)}
          className="absolute top-2 right-4 z-50 text-gray-400 hover:text-white"
        >
          ✕
        </button>`;

code = code.replace(target1, replacement1);

// find the last closing div of AssetBrowser
const target2 = `    </div>
  );
}`;
const replacement2 = `      </div>
    </div>
  );
}`;
const lastIndex = code.lastIndexOf(target2);
if (lastIndex > -1) {
  code = code.substring(0, lastIndex) + replacement2 + code.substring(lastIndex + target2.length);
}

fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code, 'utf-8');
