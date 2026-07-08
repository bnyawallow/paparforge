const fs = require('fs');

let content = fs.readFileSync('src/lib/aframeGenerator.ts', 'utf-8');

content = content.replace(
  /<a-scene([\s\S]*?)<\/a-scene>/,
  `<template id="scene-template">
      <a-scene$1</a-scene>
    </template>
    <script>
      const initScene = () => {
        const template = document.getElementById('scene-template');
        document.body.appendChild(template.content.cloneNode(true));
      };
      if (window.XR8) {
        initScene();
      } else {
        window.addEventListener('xrloaded', initScene);
      }
    </script>`
);

fs.writeFileSync('src/lib/aframeGenerator.ts', content);
console.log("Patched aframeGenerator.ts");
