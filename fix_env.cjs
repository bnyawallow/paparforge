const fs = require('fs');
const content = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf-8');
const fixed = content.replace(/<ErrorBoundary><Environment\s+files=\{[^\}]+\}\s+preset=\{[^\}]+\}\s+background=\{hdrBackground\}\s+\/>\s+<\/ErrorBoundary>\s+\/>/m, 
`<ErrorBoundary fallback={null}><Environment
          files={hdrType === 'custom' ? hdrUrl : undefined}
          preset={hdrType !== 'custom' ? (hdrPreset as any) : undefined}
          background={hdrBackground}
        /></ErrorBoundary>`);
fs.writeFileSync('src/components/viewport/Viewport.tsx', fixed);
