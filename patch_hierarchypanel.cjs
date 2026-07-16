const fs = require('fs');
let code = fs.readFileSync('src/components/hierarchy/HierarchyPanel.tsx', 'utf8');

// Replace the Add Component logic
const regex = /<button\n\s*onClick=\{.*?setIsAddDropdownOpen.*?\}\n\s*disabled=\{isPreviewMode\}[\s\S]*?\{isAddDropdownOpen && !isPreviewMode && \([\s\S]*?<\/div>\n\s*<\/div>\n\s*\)\}/;

const replacement = `<button
          onClick={() => useEditorStore.getState().setIsAssetBrowserOpen(true)}
          disabled={isPreviewMode}
          className="flex items-center justify-between w-full px-2.5 py-1.5 bg-[#222] hover:bg-[#2A2A2A] active:bg-[#1E1E1E] border border-[#2B2B2B] hover:border-[#3C3C3C] disabled:opacity-20 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-[#E5E5E5] transition-all cursor-pointer shadow-sm select-none"
          title={isPreviewMode ? "Creator disabled in Live Preview" : "Insert 3D Mesh, Media or Interaction element"}
        >
          <span className="flex items-center gap-1.5">
            <Plus size={14} className="text-blue-500 stroke-[3]" />
            <span>Add Asset</span>
          </span>
        </button>`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/hierarchy/HierarchyPanel.tsx', code);
    console.log("Success Hierarchy");
} else {
    console.log("Failed Hierarchy");
}
