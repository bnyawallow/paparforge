const fs = require('fs');

let content = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf-8');

content = content.replace("import React, { useRef, useState, useEffect, Suspense } from 'react';", "import React, { useRef, useState, useEffect, Suspense } from 'react';\nimport { ErrorBoundary } from './ErrorBoundary';");

content = content.replace(
  /<Suspense fallback=\{([\s\S]*?)\}>([\s\S]*?)<\/Suspense>/g,
  (match, fallback, children) => {
     return `<ErrorBoundary fallback={${fallback}}><Suspense fallback={${fallback}}>${children}</Suspense></ErrorBoundary>`;
  }
);

fs.writeFileSync('src/components/viewport/Viewport.tsx', content);
console.log("Patched ErrorBoundary.");
