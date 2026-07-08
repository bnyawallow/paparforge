const fs = require('fs');
let content = fs.readFileSync('src/components/layout/ViewerLayout.tsx', 'utf-8');

content = content.replace(
  /return \(\n    <div className="w-full h-screen bg-black overflow-hidden relative">\n      <iframe \n        srcDoc=\{htmlContent\}\n        className="w-full h-full border-none"\n        title="AR Experience"\n        allow="camera; microphone; accelerometer; gyroscope; magnetometer; xr-spatial-tracking"\n      \/>\n    <\/div>\n  \);/,
  `// Use document.write to completely replace the React SPA with the raw HTML
  // This avoids iframe permission restrictions for WebXR/Camera.
  useEffect(() => {
    if (htmlContent) {
      document.open();
      document.write(htmlContent);
      document.close();
    }
  }, [htmlContent]);

  return null;`
);

fs.writeFileSync('src/components/layout/ViewerLayout.tsx', content);
console.log("Patched ViewerLayout.tsx");
