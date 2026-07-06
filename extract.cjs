const fs = require('fs');
const content = fs.readFileSync('src/components/toolbar/PublishModal.tsx', 'utf-8');

// Find the start and end of generateAFrameScene
const startIndex = content.indexOf('const generateAFrameScene = () => {');
let endIndex = content.indexOf('const htmlContent = generateAFrameScene();');

if (startIndex !== -1 && endIndex !== -1) {
  let funcBody = content.substring(startIndex, endIndex);
  
  // We need to modify it to accept state arguments instead of using closure variables
  // The variables used are: objects, rootObjects, settings
  funcBody = funcBody.replace('const generateAFrameScene = () => {', 'export const generateAFrameScene = (state: any) => {\n  const { objects, rootObjects, settings } = state;');
  
  const fileContent = `
import { Vector3Data } from '../../types';

${funcBody}
  `;
  
  fs.writeFileSync('src/lib/aframeGenerator.ts', fileContent);
  console.log("Extracted successfully.");
} else {
  console.log("Could not find function bounds.");
}
