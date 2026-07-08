const fs = require('fs');

let content = fs.readFileSync('src/components/toolbar/PublishModal.tsx', 'utf-8');

// Replace the Supabase logic and URL generation in handlePublish
content = content.replace(
  /      if \(supabase\) \{\n        const \{ error \} = await supabase\.from\('projects'\)\.insert\(\[\n          \{\n            id: projectId,\n            name: storeState\.settings\.projectName,\n            data: projectData\n          \}\n        \]\);\n        if \(error\) \{\n          console\.error\("Supabase insert error:", error\);\n          throw new Error\(error\.message\);\n        \}\n      \}\n      clearInterval\(timer\);\n      setPublishProgress\(100\);\n      setPublishStep\('success'\);\n      \n      const url = `\$\{window\.location\.origin\}\/papar\/\$\{projectId\}`;\n      setPublishedUrl\(url\);\n      \n      const qr = `https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?size=180x180&color=10-10-10&bgcolor=ffffff&data=\$\{encodeURIComponent\(url\)\}`;\n      setQrCodeUrl\(qr\);/g,
  `      // Optionally save to Supabase
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

      // Publish the actual standalone HTML file
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
      setQrCodeUrl(qr);`
);

fs.writeFileSync('src/components/toolbar/PublishModal.tsx', content);
console.log("Patched PublishModal.tsx");
