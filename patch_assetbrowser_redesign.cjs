const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');

code = code.replace(/type CategoryTab = 'uploads' \| 'sketchfab' \| 'models' \| 'markers' \| 'audio' \| 'behaviors' \| 'lighting';/,
  "type CategoryTab = 'templates' | 'uploads' | 'sketchfab' | 'models' | 'markers' | 'audio' | 'behaviors' | 'lighting';");

code = code.replace(/const \[activeTab, setActiveTab\] = useState<CategoryTab>\('uploads'\);/,
  "const [activeTab, setActiveTab] = useState<CategoryTab>('templates');");

const templatesData = `
  const TEMPLATES = [
    { id: 't-box', type: 'box', name: 'Cube', icon: Box, color: 'text-blue-400', desc: 'Standard 3D Cube' },
    { id: 't-sphere', type: 'sphere', name: 'Sphere', icon: Box, color: 'text-indigo-400', desc: 'Standard 3D Sphere' },
    { id: 't-plane', type: 'plane', name: 'Plane', icon: Box, color: 'text-slate-400', desc: '2D Billboard Plane' },
    { id: 't-cylinder', type: 'cylinder', name: 'Cylinder', icon: Box, color: 'text-emerald-400', desc: '3D Cylinder' },
    { id: 't-cone', type: 'cone', name: 'Cone', icon: Box, color: 'text-amber-400', desc: '3D Cone' },
    { id: 't-torus', type: 'torus', name: 'Torus', icon: Box, color: 'text-rose-400', desc: '3D Torus (Donut)' },
    { id: 't-text', type: 'text', name: '3D Text', icon: Box, color: 'text-white', desc: '3D Billboard Text' },
    { id: 't-image', type: 'image', name: 'Image Board', icon: ImageIcon, color: 'text-green-400', desc: 'Flat Image Billboard' },
    { id: 't-video', type: 'video', name: 'Video Board', icon: Video, color: 'text-purple-400', desc: 'Flat Video Billboard' },
    { id: 't-audio', type: 'audio', name: 'Sound Node', icon: Music, color: 'text-pink-400', desc: 'Ambient Sound Emitter' },
    { id: 't-youtube', type: 'youtube', name: 'YouTube Panel', icon: Video, color: 'text-red-500', desc: 'Curved YouTube Player' },
    { id: 't-button', type: 'button', name: 'AR Button', icon: Zap, color: 'text-blue-500', desc: 'Clickable AR Button' },
    { id: 't-light', type: 'light', name: 'Custom Light', icon: Sun, color: 'text-yellow-400', desc: 'Point/Spot/Dir Light' },
    { id: 't-group', type: 'group', name: 'Logic Folder', icon: Layers, color: 'text-gray-400', desc: 'Empty Group Node' },
    { id: 't-overlay2d', type: 'overlay2d', name: '2D UI Canvas', icon: Layers, color: 'text-cyan-400', desc: 'Screenspace UI Root' },
  ];

  const handleAddTemplate = (type: string) => {
    const newObj: any = {
      id: uuidv4(),
      name: \`New \${type.charAt(0).toUpperCase() + type.slice(1)}\`,
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: null,
      properties: {}
    };
    if (type === 'box') {
      newObj.properties = { color: '#ffffff', roughness: 0.5, metalness: 0.1, opacity: 1.0, wireframe: false };
    } else if (type === 'sphere') {
      newObj.properties = { color: '#ffffff', roughness: 0.4, metalness: 0.1, opacity: 1.0, wireframe: false };
    } else if (type === 'plane') {
      newObj.properties = { color: '#666666', roughness: 0.8, doubleSided: true };
    } else if (type === 'cylinder') {
      newObj.properties = { color: '#ffffff', roughness: 0.5, metalness: 0.2 };
    } else if (type === 'cone') {
      newObj.properties = { color: '#ffffff', roughness: 0.5, metalness: 0.2 };
    } else if (type === 'torus') {
      newObj.properties = { color: '#3b82f6', roughness: 0.3, metalness: 0.4 };
    } else if (type === 'text') {
      newObj.properties = { text: 'Hello AR', color: '#ffffff', fontSize: 0.25, maxWidth: 4.0, textAlign: 'center' };
    } else if (type === 'image') {
      newObj.properties = { textureUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', opacity: 1.0, doubleSided: true };
    } else if (type === 'video') {
      newObj.properties = { videoUrl: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05c5c839d39e7fa17b4474775836a0c&profile_id=139&oauth2_token_id=57447761', playing: true, loop: true, muted: true, volume: 0.5 };
      newObj.scale = [1.6, 0.9, 1];
    } else if (type === 'audio') {
      newObj.properties = { soundUrl: '/sounds/forest_ambient.wav', autoplay: false, playing: false, loop: true, volume: 0.5 };
    } else if (type === 'light') {
      newObj.properties = { lightType: 'point', color: '#ffedd5', intensity: 3.0, distance: 12.0 };
      newObj.position = [0, 2, 0];
    } else if (type === 'button') {
      newObj.properties = { text: 'Click Me', color: '#3b82f6', textColor: '#ffffff', url: 'https://example.com' };
      newObj.scale = [1, 0.3, 0.05];
    } else if (type === 'youtube') {
      newObj.properties = { videoId: 'dQw4w9WgXcQ' };
    } else if (type === 'overlay2d') {
      newObj.name = 'HUD Group';
    }
    useEditorStore.getState().addObject(newObj);
    showToast(\`Added \${newObj.name}\`);
  };
`;

code = code.replace(/const handleKeyDown = \(e: React\.KeyboardEvent\) => \{[\s\S]*?\}\n\s*};\n/, (match) => match + '\n' + templatesData);

code = code.replace(/<div className="fixed inset-0 z-50 flex items-center justify-center bg-black\/60 backdrop-blur-sm p-8">/,
  '<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200">');

code = code.replace(/<div className="w-full h-full max-w-7xl max-h-\[90vh\] rounded-2xl overflow-hidden border border-\[\#2A2A2A\] bg-\[\#111111\] flex flex-col relative select-none shadow-2xl">/,
  '<div className="w-full h-full max-w-6xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-3xl flex flex-col relative select-none shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-white/5 animate-in zoom-in-95 duration-200">');

code = code.replace(/<div className="w-40 bg-\[\#141414\] border-r border-\[\#2A2A2A\] flex flex-col py-1 overflow-y-auto shrink-0 font-sans text-xs">/,
  '<div className="w-56 bg-white/5 border-r border-white/10 flex flex-col py-3 overflow-y-auto shrink-0 font-sans text-sm gap-1 px-2">');

const sidebarButtonClass = "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all";
const sidebarButtonActive = "bg-blue-600 text-white shadow-md shadow-blue-500/20";
const sidebarButtonInactive = "text-[#A0A0A0] hover:text-white hover:bg-white/10";

function replaceSidebarButton(tabName, icon, label) {
  const regexString = "<button\\s*onClick=\\{.*?setActiveTab\\('" + tabName + "'\\).*?\\}\\s*className=\\{.*?\\}\\s*>[\\s\\S]*?</button>";
  const regex = new RegExp(regexString);
  const replacement = `<button 
            onClick={() => setActiveTab('${tabName}')}
            className={\`${sidebarButtonClass} \${activeTab === '${tabName}' ? '${sidebarButtonActive}' : '${sidebarButtonInactive}'}\`}
          >
            ${icon}
            <span className="font-medium">${label}</span>
          </button>`;
  code = code.replace(regex, replacement);
}

const uRegex = new RegExp("<button\\s*onClick=\\{.*?setActiveTab\\('uploads'\\).*?\\}\\s*className=\\{.*?\\}\\s*>[\\s\\S]*?</button>");
code = code.replace(uRegex,
  `<button onClick={() => setActiveTab('uploads')} className={\`${sidebarButtonClass} \${activeTab === 'uploads' ? '${sidebarButtonActive}' : '${sidebarButtonInactive}'}\`}>
    <Upload size={16} className={activeTab === 'uploads' ? 'text-white' : 'text-gray-400'} />
    <span className="font-medium">My Uploads</span>
    <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full font-mono">{assets.length}</span>
  </button>`);

replaceSidebarButton('sketchfab', '<Search size={16} className={activeTab === "sketchfab" ? "text-white" : "text-yellow-400"} />', 'Sketchfab / CC');
replaceSidebarButton('models', '<Box size={16} className={activeTab === "models" ? "text-white" : "text-blue-400"} />', '3D Models');
replaceSidebarButton('markers', '<ImageIcon size={16} className={activeTab === "markers" ? "text-white" : "text-green-400"} />', 'AR Markers');
replaceSidebarButton('audio', '<Music size={16} className={activeTab === "audio" ? "text-white" : "text-pink-400"} />', 'Audio & SFX');
replaceSidebarButton('behaviors', '<Zap size={16} className={activeTab === "behaviors" ? "text-white" : "text-orange-400"} />', 'Behaviors');
replaceSidebarButton('lighting', '<Sun size={16} className={activeTab === "lighting" ? "text-white" : "text-yellow-400"} />', 'Lighting Presets');

code = code.replace(/<div className="border-t border-\[\#222\] my-1 mx-2"><\/div>/g, '');
code = code.replace(/<span className="px-3 py-1 text-\[9px\] font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-1">[\s\S]*?<\/span>/g, '');
code = code.replace(/<span className="px-3 py-1 text-\[9px\] font-bold text-\[\#555\] uppercase tracking-wider">Presets Library<\/span>/g, '');

const templatesSidebarHtml = `
          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-1">Creation</div>
          <button 
            onClick={() => setActiveTab('templates')}
            className={\`${sidebarButtonClass} \${activeTab === 'templates' ? '${sidebarButtonActive}' : '${sidebarButtonInactive}'}\`}
          >
            <Plus size={16} className={activeTab === 'templates' ? 'text-white' : 'text-emerald-400'} />
            <span className="font-medium">Primitives & UI</span>
          </button>
          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-4 mb-1">Library</div>
`;
code = code.replace(/(<div className="w-56[^>]*>)/, `$1\n${templatesSidebarHtml}`);

const templatesTabHtml = `
          {/* TEMPLATES TAB */}
          {activeTab === 'templates' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="mb-6 px-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Plus className="text-emerald-400" /> Primitives & Templates</h3>
                <p className="text-sm text-gray-400 mt-1">Quickly add standard 3D geometries, UI elements, and logical nodes to your scene.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 content-start overflow-y-auto pr-2 pb-20">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { handleAddTemplate(t.type); setIsAssetBrowserOpen(false); }}
                    className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95 text-center gap-3 shadow-sm hover:shadow-emerald-500/10"
                  >
                    <div className="p-3 bg-black/40 rounded-xl group-hover:bg-black/60 shadow-inner">
                      <t.icon size={28} className={\`\${t.color} group-hover:scale-110 transition-transform\`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{t.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 leading-tight">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
`;
code = code.replace(/<div className="flex-1 overflow-y-auto p-4 bg-\[\#0A0A0A\]">/, `<div className="flex-1 overflow-y-auto p-6 bg-black/40">\n${templatesTabHtml}`);

fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
console.log("Success Templates");
