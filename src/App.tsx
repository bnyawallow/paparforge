/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EditorLayout } from './components/layout/EditorLayout';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EditorLayout />} />
      </Routes>
    </Router>
  );
}
