const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');

const regex = /\{TEMPLATES\.map\(\(t\) => \(/;
const replacement = `
                {/* Search & Filter Bar */}
                <div className="col-span-full mb-4 flex gap-4">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search templates..." 
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {['all', '3d', '2d', 'ui', 'media', 'primitive', 'logic'].map(tag => (
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
                {TEMPLATES.filter(t => {
                  const matchSearch = t.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) || t.desc.toLowerCase().includes(templateSearchQuery.toLowerCase());
                  const matchTag = templateFilterTag === 'all' || t.tags.includes(templateFilterTag);
                  return matchSearch && matchTag;
                }).map((t) => (`;
code = code.replace(regex, replacement);

fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
console.log("Success templates ui update");
