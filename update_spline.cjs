const fs = require('fs');
const content = fs.readFileSync('src/components/viewport/Spline3DIconRenderer.tsx', 'utf8');

const replacement = `
export function Spline3DIconRenderer({ obj, isPreviewMode }: { obj: SceneObject; isPreviewMode: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const iconType = obj.properties?.iconType || 'rocket';
  const color = obj.properties?.color || '#ef4444';
  const secondaryColor = obj.properties?.secondaryColor || '#ffffff';
  const style = obj.properties?.materialStyle || 'glossy';
  const enableFloat = obj.properties?.floatAnim !== false;
  const rotationSpeed = obj.properties?.rotationSpeed ?? 0.5;

  useFrame((state, delta) => {
    if (groupRef.current && (enableFloat || isPreviewMode)) {
      const t = state.clock.getElapsedTime();
      if (enableFloat) {
        groupRef.current.position.y = Math.sin(t * 2) * 0.08;
      }
      if (rotationSpeed > 0 && isPreviewMode) {
        groupRef.current.rotation.y += delta * rotationSpeed;
      }
    }
  });

  const fallbackShape = (
    <ProceduralIconShape 
      iconType={iconType} 
      color={color} 
      secondaryColor={secondaryColor} 
      style={style} 
    />
  );

  return (
    <group ref={groupRef}>
      <React.Suspense fallback={fallbackShape}>
        <IconModel url={\`/models/icons/\${iconType}.glb\`} fallback={fallbackShape} />
      </React.Suspense>
    </group>
  );
}

import { useGLTF } from '@react-three/drei';
function IconModel({ url, fallback }: { url: string; fallback: React.ReactNode }) {
  try {
    const { scene } = useGLTF(url);
    return <primitive object={scene.clone()} scale={1.5} />;
  } catch (e) {
    return <>{fallback}</>;
  }
}
`;

const lines = content.split('\n');
const prefix = lines.slice(0, 1725).join('\n');
fs.writeFileSync('src/components/viewport/Spline3DIconRenderer.tsx', prefix + '\n' + replacement);
