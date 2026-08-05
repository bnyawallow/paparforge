const fs = require('fs');
let content = fs.readFileSync('src/lib/aframeGenerator.ts', 'utf8');

// Replace unescaped template literals for playVideo in AR scene script string
content = content.replace(/const videoHtml = \`\s*<div id="ar-video-overlay"/g, "const videoHtml = '\\n<div id=\"ar-video-overlay\"");
content = content.replace(/<iframe src="\$\{b\.url\}" width="80%" height="60%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen><\/iframe>\s*<\/div>\s*\`;/g, 
  "<iframe src=\"' + b.url + '\" width=\"80%\" height=\"60%\" frameborder=\"0\" allow=\"autoplay; fullscreen; picture-in-picture\" allowfullscreen></iframe>\\n</div>';");

content = content.replace(/const videoHtml = \`\s*<div id="ar-video-overlay-2d"/g, "const videoHtml = '\\n<div id=\"ar-video-overlay-2d\"");
content = content.replace(/<iframe src="\$\{b\.url\}" width="80%" height="60%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen><\/iframe>\s*<\/div>\s*\`;/g, 
  "<iframe src=\"' + b.url + '\" width=\"80%\" height=\"60%\" frameborder=\"0\" allow=\"autoplay; fullscreen; picture-in-picture\" allowfullscreen></iframe>\\n</div>';");

fs.writeFileSync('src/lib/aframeGenerator.ts', content);
