const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');

const regex = /<button \n\s*onClick=\{\(\) => handleUseAsset\(sound\)\}\n\s*className=\{\`mt-2 w-full text-center text-\[10px\] font-semibold py-1 rounded transition-colors border \$\{hasSelected \? 'bg-pink-600 hover:bg-pink-500 border-pink-500 text-white' : 'bg-\\[#222\\] hover:bg-\\[#333\\] border-\\[#333\\] text-\\[#888\\]'\}\`\}\n\s*>\n\s*\{hasSelected \? 'Attach to Selected' : 'Preview Sound'\}\n\s*<\/button>/;

const replacement = `<div className="mt-2 flex gap-1.5 w-full">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            const preview = new Audio(sound.url);
                            preview.volume = 0.4;
                            preview.play().catch(err => console.log('Audio playback preview failed', err));
                          }}
                          className="flex-1 bg-[#222] hover:bg-[#333] border border-[#333] text-[#CCC] text-center text-[10px] font-semibold py-1 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Play size={10} /> Preview
                        </button>
                        <button 
                          onClick={() => handleUseAsset(sound)}
                          className={\`flex-1 text-center text-[10px] font-semibold py-1 rounded transition-colors border \${hasSelected ? 'bg-pink-600 hover:bg-pink-500 border-pink-500 text-white' : 'bg-pink-900/40 hover:bg-pink-800/60 border-pink-700/50 text-pink-200'}\`}
                        >
                          {hasSelected ? 'Attach' : 'Add to Scene'}
                        </button>
                      </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
console.log("Success audio update");
