const fs = require('fs');

let content = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf-8');

// 1. Fix TexturedMaterialWithHook ErrorBoundary
content = content.replace(
  /<ErrorBoundary fallback=\{\n        <meshStandardMaterial \n          color=\{color\} \n          roughness=\{roughness\} \n          metalness=\{metalness\} \n          wireframe=\{wireframe\} \n          transparent=\{opacity < 1\} \n          opacity=\{opacity\} \n          side=\{doubleSided \? THREE\.DoubleSide : THREE\.FrontSide\}\n        \/>\n      \}>\n        <Suspense fallback=\{\n          <meshStandardMaterial \n            color=\{color\} \n            roughness=\{roughness\} \n            metalness=\{metalness\} \n            wireframe=\{wireframe\} \n            transparent=\{opacity < 1\} \n            opacity=\{opacity\} \n            side=\{doubleSided \? THREE\.DoubleSide : THREE\.FrontSide\}\n          \/>\n        \}>\n          <TexturedMaterialWithHook \n            url=\{textureUrl\} \n            color=\{color\} \n            roughness=\{roughness\} \n            metalness=\{metalness\} \n            wireframe=\{wireframe\} \n            opacity=\{opacity\} \n            repeatX=\{properties\.textureRepeatX\} \n            repeatY=\{properties\.textureRepeatY\} \n            doubleSided=\{doubleSided\}\n          \/>\n        <\/Suspense>\n      <\/ErrorBoundary>/g,
  `<Suspense fallback={
        <meshStandardMaterial 
          color={color} 
          roughness={roughness} 
          metalness={metalness} 
          wireframe={wireframe} 
          transparent={opacity < 1} 
          opacity={opacity} 
          side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
        />
      }>
        <TexturedMaterialWithHook 
          url={textureUrl} 
          color={color} 
          roughness={roughness} 
          metalness={metalness} 
          wireframe={wireframe} 
          opacity={opacity} 
          repeatX={properties.textureRepeatX} 
          repeatY={properties.textureRepeatY} 
          doubleSided={doubleSided}
        />
      </Suspense>`
);

// Actually, in the broken file, the tag looks like this:
// <ErrorBoundary fallback={
//         <meshStandardMaterial 
// ...
//         />
//       }>
//         <TexturedMaterialWithHook ... />
//       </Suspense></ErrorBoundary>
// 
// Let's just use string replacement on the exact broken text.
