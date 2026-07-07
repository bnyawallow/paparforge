const fs = require('fs');
let content = fs.readFileSync('src/components/toolbar/MarkerManagerModal.tsx', 'utf-8');
content = content.replace("import { useEditorStore } from '../../store/useEditorStore';", "import { useEditorStore } from '../../store/useEditorStore';\nimport { fileToDataUrl } from '../../lib/fileUtils';");
content = content.replace("const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {", "const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {");
content = content.replace("const url = URL.createObjectURL(file);", "const url = await fileToDataUrl(file);");
fs.writeFileSync('src/components/toolbar/MarkerManagerModal.tsx', content);
console.log("MarkerManagerModal patched");
