const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');

// replace TEMPLATES array with tagged versions
const newTemplates = `
  const TEMPLATES = [
    { id: 't-box', type: 'box', name: 'Cube', icon: Box, color: 'text-blue-400', desc: 'Standard 3D Cube', tags: ['3d', 'primitive'] },
    { id: 't-sphere', type: 'sphere', name: 'Sphere', icon: Box, color: 'text-indigo-400', desc: 'Standard 3D Sphere', tags: ['3d', 'primitive'] },
    { id: 't-plane', type: 'plane', name: 'Plane', icon: Box, color: 'text-slate-400', desc: '2D Billboard Plane', tags: ['3d', 'primitive'] },
    { id: 't-cylinder', type: 'cylinder', name: 'Cylinder', icon: Box, color: 'text-emerald-400', desc: '3D Cylinder', tags: ['3d', 'primitive'] },
    { id: 't-cone', type: 'cone', name: 'Cone', icon: Box, color: 'text-amber-400', desc: '3D Cone', tags: ['3d', 'primitive'] },
    { id: 't-torus', type: 'torus', name: 'Torus', icon: Box, color: 'text-rose-400', desc: '3D Torus (Donut)', tags: ['3d', 'primitive'] },
    { id: 't-text', type: 'text', name: '3D Text', icon: Box, color: 'text-white', desc: '3D Billboard Text', tags: ['3d', 'ui'] },
    { id: 't-image', type: 'image', name: 'Image Board', icon: ImageIcon, color: 'text-green-400', desc: 'Flat Image Billboard', tags: ['2d', 'media'] },
    { id: 't-video', type: 'video', name: 'Video Board', icon: Video, color: 'text-purple-400', desc: 'Flat Video Billboard', tags: ['2d', 'media'] },
    { id: 't-audio', type: 'audio', name: 'Sound Node', icon: Music, color: 'text-pink-400', desc: 'Ambient Sound Emitter', tags: ['audio', 'media'] },
    { id: 't-youtube', type: 'youtube', name: 'YouTube Panel', icon: Video, color: 'text-red-500', desc: 'Curved YouTube Player', tags: ['2d', 'media'] },
    { id: 't-button', type: 'button', name: 'AR Button', icon: Zap, color: 'text-blue-500', desc: 'Clickable AR Button', tags: ['3d', 'ui'] },
    { id: 't-web', type: 'web', name: 'Web View', icon: Globe, color: 'text-cyan-400', desc: 'Curved Web Browser Panel', tags: ['2d', 'ui'] },
    { id: 't-particles', type: 'particles', name: 'Particles', icon: Sparkles, color: 'text-purple-400', desc: 'Particle Emitter System', tags: ['3d', 'vfx'] },
    { id: 't-group', type: 'group', name: 'Group', icon: Folder, color: 'text-orange-400', desc: 'Empty Transform Group', tags: ['logic'] },
  ];
`;
code = code.replace(/const TEMPLATES = \[[\s\S]*?\];/m, newTemplates.trim());

// Also, let's inject search and tag states right after the useState section
code = code.replace(/const \[activeTab, setActiveTab\] = useState<'uploads' \| 'sketchfab' \| 'models' \| 'markers' \| 'audio' \| 'behaviors' \| 'lighting' \| 'templates'>\('uploads'\);/,
  "const [activeTab, setActiveTab] = useState<'uploads' | 'sketchfab' | 'models' | 'markers' | 'audio' | 'behaviors' | 'lighting' | 'templates'>('templates');\n  const [templateSearchQuery, setTemplateSearchQuery] = useState('');\n  const [templateFilterTag, setTemplateFilterTag] = useState('all');");

// Let's add the templates button into the sidebar, right before 3D Models
code = code.replace(/<button\s*onClick=\{\(\) => setActiveTab\('models'\)\}/,
  `<button 
            onClick={() => setActiveTab('templates')}
            className={\`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all \${activeTab === 'templates' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-white/10'}\`}
          >
            <Sparkles size={16} className={activeTab === "templates" ? "text-white" : "text-emerald-400"} />
            <span className="font-medium">Templates & Primitives</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('models')}`);

fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
console.log("Success templates update");
