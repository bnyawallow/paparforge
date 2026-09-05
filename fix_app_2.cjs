const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/import \{ TestErrorBoundary \} from ".\/test_error_boundary";\n/g, '');
fs.writeFileSync('src/App.tsx', code);

let editorLayoutCode = fs.readFileSync('src/components/layout/EditorLayout.tsx', 'utf-8');
editorLayoutCode = editorLayoutCode.replace(/import \{ TestErrorBoundary \} from "..\/..\/test_error_boundary";\n/g, '');
fs.writeFileSync('src/components/layout/EditorLayout.tsx', editorLayoutCode);
