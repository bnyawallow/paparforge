const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf-8');

// Similarly for ImageTargetRenderer
code = code.replace(
  /function ImageTargetRenderer\(\{ obj \}: \{ obj: SceneObject \}\) \{\n  const trackingMode = useEditorStore\(state => state\.settings\.trackingMode\);/g,
  `function ImageTargetRenderer({ obj }: { obj: SceneObject }) {\n  const trackingMode = useEditorStore(state => state.settings.trackingMode);\n  if (!obj || !obj.properties) return null;`
);

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
