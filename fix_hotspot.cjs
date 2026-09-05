const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf-8');

// Also for Hotspot3DRenderer
code = code.replace(
  /function Hotspot3DRenderer\(\{ obj, isPreviewMode, onInteract \}: \{ obj: SceneObject; isPreviewMode: boolean; onInteract\?: \(e\?: any\) => void \}\) \{\n  const selectedObjectIds = useEditorStore\(state => state\.selectedObjectIds\);/g,
  `function Hotspot3DRenderer({ obj, isPreviewMode, onInteract }: { obj: SceneObject; isPreviewMode: boolean; onInteract?: (e?: any) => void }) {\n  const selectedObjectIds = useEditorStore(state => state.selectedObjectIds);\n  if (!obj || !obj.properties) return null;`
);

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
