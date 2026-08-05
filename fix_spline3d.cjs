const fs = require('fs');
let content = fs.readFileSync('src/components/viewport/Spline3DIconRenderer.tsx', 'utf8');
content = content.replace(
  /export function Spline3DIconRenderer\(\{ obj, isPreviewMode \}: \{ obj: SceneObject; isPreviewMode: boolean \}\) \{/g,
  'export function Spline3DIconRenderer({ obj, isPreviewMode, onInteract }: { obj: SceneObject; isPreviewMode: boolean; onInteract?: (e: any) => void }) {'
);
fs.writeFileSync('src/components/viewport/Spline3DIconRenderer.tsx', content);
