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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
