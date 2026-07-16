const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');

if (!code.includes("import { instantiateTemplate, PREBUILT_TEMPLATES }")) {
  code = code.replace(/import \{ useEditorStore \}.*?;/, "import { useEditorStore } from '../../store/useEditorStore';\nimport { instantiateTemplate, PREBUILT_TEMPLATES } from '../../utils/prebuiltTemplates';");
}

const templatesUI = `
                {/* Search & Filter Bar */}
                <div className="col-span-full mb-4 flex gap-4">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search templates and primitives..." 
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {['all', '3d', '2d', 'ui', 'media', 'primitive', 'logic', 'complex'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setTemplateFilterTag(tag)}
                        className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${templateFilterTag === tag ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}\`}
                      >
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prebuilt Advanced Templates */}
                {PREBUILT_TEMPLATES.filter(t => {
                  const matchSearch = t.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) || t.description.toLowerCase().includes(templateSearchQuery.toLowerCase());
                  const matchTag = templateFilterTag === 'all' || (t.tags && t.tags.includes(templateFilterTag));
                  return matchSearch && matchTag;
                }).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { instantiateTemplate(t.id); setIsAssetBrowserOpen(false); }}
                    className="flex flex-col p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95 text-left gap-2 shadow-sm hover:shadow-emerald-500/10 col-span-2 sm:col-span-3 md:col-span-2 lg:col-span-2"
                  >
                    <h3 className="text-sm font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-2">
                      <Sparkles size={16} /> {t.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 leading-snug line-clamp-3">{t.description}</p>
                    <div className="mt-auto pt-2 flex flex-wrap gap-1">
                      {t.tags?.map(tag => (
                        <span key={tag} className="text-[8px] uppercase tracking-wider font-bold bg-white/5 px-2 py-0.5 rounded text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}

                {TEMPLATES.filter`;

code = code.replace(/\{\/\* Search \& Filter Bar \*\/\}[\s\S]*?\{TEMPLATES\.filter/, templatesUI);

fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
console.log("Success Prebuilt UI");
