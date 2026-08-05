const fs = require('fs');

// Fix Viewport.tsx
let viewport = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');
viewport = viewport.replace(
  /<Spline3DIconRenderer obj=\{obj\} isPreviewMode=\{isPreviewMode\} \/>/g,
  '<Spline3DIconRenderer obj={obj} isPreviewMode={isPreviewMode} onInteract={handleInteract} />'
);
viewport = viewport.replace(
  /<Spline2DIconRenderer obj=\{obj\} isPreviewMode=\{isPreviewMode\} \/>/g,
  '<Spline2DIconRenderer obj={obj} isPreviewMode={isPreviewMode} onInteract={handleInteract} />'
);
fs.writeFileSync('src/components/viewport/Viewport.tsx', viewport);

// Fix Spline2DIconRenderer.tsx
let spline2d = fs.readFileSync('src/components/viewport/Spline2DIconRenderer.tsx', 'utf8');
spline2d = spline2d.replace(
  /export function Spline2DIconRenderer\(\{ obj, isPreviewMode \}: \{ obj: SceneObject; isPreviewMode: boolean \}\) \{/g,
  'export function Spline2DIconRenderer({ obj, isPreviewMode, onInteract }: { obj: SceneObject; isPreviewMode: boolean; onInteract?: (e: any) => void }) {'
);
spline2d = spline2d.replace(
  /<div\s+className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-3 transition-all duration-300 select-none group cursor-pointer hover:scale-110 active:scale-95"/g,
  `<div
          onClick={(e) => {
            if (isPreviewMode && onInteract) {
              onInteract(e);
            }
          }}
          className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-3 transition-all duration-300 select-none group cursor-pointer hover:scale-110 active:scale-95"`
);
spline2d = spline2d.replace(
  /<mesh visible=\{false\}>/g,
  '<mesh visible={true}>'
);
fs.writeFileSync('src/components/viewport/Spline2DIconRenderer.tsx', spline2d);

