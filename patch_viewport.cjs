const fs = require('fs');

let content = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf-8');

// The regex replacement duplicated some things or missed matching correctly.
// Let's restore the original and fix it.
content = content.replace(/<ErrorBoundary fallback=\{([\s\S]*?)\}><Suspense fallback=\{([\s\S]*?)\}>([\s\S]*?)<\/Suspense><\/ErrorBoundary>/g, "<Suspense fallback={$1}>$3</Suspense>");

// Then manually replace the 3 occurrences:
// 1.
content = content.replace(
  '<Suspense fallback={\n        <meshStandardMaterial \n          color={color} \n          roughness={roughness} \n          metalness={metalness} \n          wireframe={wireframe} \n          transparent={opacity < 1} \n          opacity={opacity} \n          side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}\n        />\n      }>\n        <TexturedMaterialWithHook \n          url={textureUrl} \n          color={color} \n          roughness={roughness} \n          metalness={metalness} \n          wireframe={wireframe} \n          opacity={opacity} \n          repeatX={properties.textureRepeatX} \n          repeatY={properties.textureRepeatY} \n          doubleSided={doubleSided}\n        />\n      </Suspense>',
  `<ErrorBoundary fallback={
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
        <Suspense fallback={
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
        </Suspense>
      </ErrorBoundary>`
);

content = content.replace(
  '<Suspense fallback={\n            <mesh rotation={[-Math.PI / 2, 0, 0]}>\n              <planeGeometry args={[obj.properties.physicalWidth * 10, obj.properties.physicalWidth * 10]} />\n              <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.5} side={THREE.DoubleSide} />\n            </mesh>\n          }>\n            <ImageTargetRenderer obj={obj} />\n          </Suspense>',
  `<ErrorBoundary fallback={
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[obj.properties.physicalWidth * 10, obj.properties.physicalWidth * 10]} />
              <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
          }>
            <Suspense fallback={
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[obj.properties.physicalWidth * 10, obj.properties.physicalWidth * 10]} />
                <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
            }>
              <ImageTargetRenderer obj={obj} />
            </Suspense>
          </ErrorBoundary>`
);

content = content.replace(
  '<Suspense fallback={\n            <mesh>\n              <boxGeometry args={[1, 1, 1]} />\n              <meshStandardMaterial color="#888" wireframe />\n            </mesh>\n          }>\n            <GLTFModel url={obj.properties.url} properties={obj.properties} id={id} />\n          </Suspense>',
  `<ErrorBoundary fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#888" wireframe />
            </mesh>
          }>
            <Suspense fallback={
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#888" wireframe />
              </mesh>
            }>
              <GLTFModel url={obj.properties.url} properties={obj.properties} id={id} />
            </Suspense>
          </ErrorBoundary>`
);

// We need to restore the messy broken one first!
// The previous replace totally ruined the code structure so it's probably easier to just git checkout or undo.
