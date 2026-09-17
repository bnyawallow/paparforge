import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as THREE from 'three';

// Override the deprecated useLegacyLights property to suppress console warning from react-three-fiber
if (THREE.WebGLRenderer && THREE.WebGLRenderer.prototype) {
  Object.defineProperty(THREE.WebGLRenderer.prototype, 'useLegacyLights', {
    get() {
      return false;
    },
    set() {
      // no-op
    },
    configurable: true,
  });
}

// Suppress transient TransformControls unmounting error from three-stdlib
const originalConsoleError = console.error;
console.error = function (...args: any[]) {
  if (typeof args[0] === 'string' && args[0].includes('TransformControls: The attached 3D object must be a part of the scene graph')) {
    return;
  }
  return originalConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
