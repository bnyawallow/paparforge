const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

const canvasAnchor = "                <AutoSceneLightingEngine />\n        <CameraController activeAxisView={activeAxisView} axisUpdateId={axisUpdateId} orbitControlsRef={orbitControlsRef} />";

const gridCode = `
                <Grid 
                  position={[0, 0, -0.01]} 
                  args={[100, 100]} 
                  cellSize={1} 
                  cellThickness={1} 
                  cellColor="#444" 
                  sectionSize={5} 
                  sectionThickness={1.5} 
                  sectionColor="#888" 
                  fadeDistance={30} 
                  fadeStrength={1} 
                  rotation={[Math.PI / 2, 0, 0]}
                />
`;

code = code.replace(canvasAnchor, canvasAnchor + gridCode);

fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
