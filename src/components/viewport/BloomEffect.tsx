import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { useEditorStore } from '../../store/useEditorStore';
import * as THREE from 'three';

export function BloomEffect() {
  const { gl, scene, camera, size } = useThree();
  const settings = useEditorStore(state => state.settings);
  
  const bloomEnabled = settings.bloomEnabled ?? false;
  const bloomIntensity = settings.bloomIntensity ?? 1.2;
  const bloomRadius = settings.bloomRadius ?? 0.5;
  const bloomThreshold = settings.bloomThreshold ?? 0.5; // low threshold to make emissive glow!

  const composerRef = useRef<EffectComposer | null>(null);

  useEffect(() => {
    if (!bloomEnabled) {
      composerRef.current = null;
      return;
    }

    const composer = new EffectComposer(gl);
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      bloomIntensity,
      bloomRadius,
      bloomThreshold
    );
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    composerRef.current = composer;

    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera, bloomEnabled, bloomIntensity, bloomRadius, bloomThreshold, size.width, size.height]);

  useFrame(() => {
    if (bloomEnabled && composerRef.current) {
      composerRef.current.render();
    }
  }, bloomEnabled ? 1 : 0);

  return null;
}
