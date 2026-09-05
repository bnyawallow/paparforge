const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf-8');

code = code.replace(
  /function Hotspot3DRenderer\(\{ obj, isPreviewMode, onInteract \}: \{ obj: SceneObject; isPreviewMode: boolean; onInteract\?: \(e\?: any\) => void \}\) \{\n  const beaconRef = useRef<THREE.Group>\(null\);/g,
  `function Hotspot3DRenderer({ obj, isPreviewMode, onInteract }: { obj: SceneObject; isPreviewMode: boolean; onInteract?: (e?: any) => void }) {\n  const beaconRef = useRef<THREE.Group>(null);\n  if (!obj) return null;`
);

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
