const fs = require('fs');

let content = fs.readFileSync('src/components/toolbar/PublishModal.tsx', 'utf-8');

const replacement = `try {
      const { supabase } = await import('../../lib/supabase');
      const storeState = useEditorStore.getState();
      const projectId = storeState.settings.projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-' + Math.random().toString(36).substring(2, 7);
      
      const projectData = {
        objects: storeState.objects,
        rootObjects: storeState.rootObjects,
        settings: storeState.settings,
        assets: storeState.assets
      };

      if (supabase) {
        const { error } = await supabase.from('projects').insert([
          {
            id: projectId,
            name: storeState.settings.projectName,
            data: projectData
          }
        ]);
        if (error) {
          console.error("Supabase insert error:", error);
        }
      }

      // Generate the full HTML for standalone
      const htmlContent = generateAFrameScene(storeState);

      // Publish the actual standalone HTML file to /papar
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, html: htmlContent })
      });

      if (!response.ok) {
        throw new Error('Failed to publish HTML file');
      }
      
      const { url: publishedPath } = await response.json();

      clearInterval(timer);
      setPublishProgress(100);
      setPublishStep('success');
      
      const url = \`\${window.location.origin}\${publishedPath}\`;
      setPublishedUrl(url);
      
      const qr = \`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=10-10-10&bgcolor=ffffff&data=\${encodeURIComponent(url)}\`;
      setQrCodeUrl(qr);
    } catch (err) {`;

content = content.replace(/try\s*\{\s*const \{ supabase \}([\s\S]*?)setQrCodeUrl\(qr\);\s*\}\s*catch\s*\(err\)\s*\{/m, replacement);

fs.writeFileSync('src/components/toolbar/PublishModal.tsx', content);
console.log("Patched PublishModal 2");
