const fs = require('fs');

const content = fs.readFileSync('src/store/useEditorStore.ts', 'utf-8');

const regex = /const loadSavedState = \(\) => \{([\s\S]*?)return \{[\s\S]*?\} catch \(e\) \{/g;
let newContent = content.replace("const loadSavedState = () => {", `
const sanitizeBlobUrls = (data: any) => {
  if (!data) return data;
  if (typeof data === 'string') {
    if (data.startsWith('blob:')) return '';
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeBlobUrls(item));
  }
  if (typeof data === 'object') {
    const copy = { ...data };
    for (const key in copy) {
      if (typeof copy[key] === 'string' && copy[key].startsWith('blob:')) {
         copy[key] = '';
      } else if (typeof copy[key] === 'object') {
         copy[key] = sanitizeBlobUrls(copy[key]);
      }
    }
    return copy;
  }
  return data;
};

const loadSavedState = () => {`);

newContent = newContent.replace("const parsed = JSON.parse(savedDataStr);", "const parsed = sanitizeBlobUrls(JSON.parse(savedDataStr));");
newContent = newContent.replace("const parsed = JSON.parse(oldAutosave);", "const parsed = sanitizeBlobUrls(JSON.parse(oldAutosave));");

fs.writeFileSync('src/store/useEditorStore.ts', newContent);
console.log("Patched store.");
