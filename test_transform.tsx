import React, { useEffect, useRef } from 'react';
import { TransformControls } from '@react-three/drei';

export function TransformController() {
  const ref = useRef<any>(null);
  
  useEffect(() => {
    if (ref.current) {
      console.log(ref.current);
    }
  }, []);
  
  return <TransformControls ref={ref} />;
}
