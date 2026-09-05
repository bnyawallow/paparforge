const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// The TestErrorBoundary we added might be causing issues. Let's revert it.
code = code.replace(/import \{ TestErrorBoundary \} from ".\/test_error_boundary";\n/g, '');
code = code.replace(/<TestErrorBoundary>/g, '');
code = code.replace(/<\/TestErrorBoundary>/g, '');

fs.writeFileSync('src/App.tsx', code);

let editorLayoutCode = fs.readFileSync('src/components/layout/EditorLayout.tsx', 'utf-8');
editorLayoutCode = editorLayoutCode.replace(/import \{ TestErrorBoundary \} from "..\/..\/test_error_boundary";\n/g, '');
editorLayoutCode = editorLayoutCode.replace(/<TestErrorBoundary><Viewport \/><\/TestErrorBoundary>/g, '<Viewport />');
fs.writeFileSync('src/components/layout/EditorLayout.tsx', editorLayoutCode);
