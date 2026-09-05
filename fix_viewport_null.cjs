const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf-8');

// The error is because `obj` might be undefined when ObjectRenderer is evaluating it.
// We should return early if `!obj` at the top of ObjectRenderer or add safe guards.
// In ObjectRenderer, we already have `if (!obj || !obj.visible) return null;` on line 3217.
// We need to move this check higher up, right after `const obj = ...` OR add `if (!obj) return null;` early.

code = code.replace(
  /function ObjectRenderer\(\{ id \}: \{ id: string \}\) \{\n  const obj = useEditorStore\(state => state\.objects\[id\]\);/g,
  `function ObjectRenderer({ id }: { id: string }) {\n  const obj = useEditorStore(state => state.objects[id]);\n  if (!obj) return null;`
);

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
