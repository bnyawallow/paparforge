const fs = require('fs');
let content = fs.readFileSync('src/components/toolbar/PublishModal.tsx', 'utf-8');
const startIndex = content.indexOf('const generateAFrameScene = () => {');
const endIndex = content.indexOf('const htmlContent = generateAFrameScene();');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
  content = "import { generateAFrameScene } from '../../lib/aframeGenerator';\n" + content;
  content = content.replace('const htmlContent = generateAFrameScene();', 'const htmlContent = generateAFrameScene(useEditorStore.getState());');
  fs.writeFileSync('src/components/toolbar/PublishModal.tsx', content);
  console.log("PublishModal updated");
}
