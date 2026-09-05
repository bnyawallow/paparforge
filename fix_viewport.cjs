const fs = require('fs');
let code = fs.readFileSync('src/components/viewport/Viewport.tsx', 'utf8');

const badCodeStart = code.indexOf('<button\n                onClick={() => { setActiveAxisView(\'3D\');');
const badCodeEnd = code.indexOf('          </div>\n\n          {/* Camera projection toggle */}');

if (badCodeStart !== -1 && badCodeEnd !== -1) {
  const replacement = `              <button
                onClick={() => setTransformGizmoEnabled(true)}
                className={\`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer \${
                  transformGizmoEnabled
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }\`}
                title="Transform Object [W,E,R] - Gizmo mode"
              >
                <Move size={14} />
              </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-0.5" />

            {/* Grid & Rotation Snap Toggles */}
            <div className="flex items-center gap-1 bg-[#1a1a24] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setGridSnapEnabled(!gridSnapEnabled)}
                className={\`w-8 h-8 rounded-lg flex items-center justify-center transition-colors \${
                  gridSnapEnabled ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }\`}
                title="Toggle Position Snap"
              >
                <Grid3X3 size={14} />
              </button>
              <button
                onClick={() => setRotationSnapEnabled(!rotationSnapEnabled)}
                className={\`w-8 h-8 rounded-lg flex items-center justify-center transition-colors \${
                  rotationSnapEnabled ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }\`}
                title="Toggle Rotation Snap"
              >
                <RotateCw size={14} />
              </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-0.5" />

            {/* Camera Projection, View Angles & Wireframe Toggles */}
            <div className="flex items-center gap-1.5 text-[10px] font-sans border-l border-[#2A2A2A] pl-2 ml-1">
              {/* Axis Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAxisMenuOpen(!isAxisMenuOpen)}
                  className="h-8 px-2 rounded flex items-center gap-1 bg-[#1C1C1C] border border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#25252e] hover:border-blue-500/50 transition-all cursor-pointer select-none"
                  title="Select Camera Perspective / Axis"
                >
                  {activeAxisView === 'Z' && <Compass size={11} className="text-blue-400" />}
                  {activeAxisView === 'Y' && <ArrowUp size={11} className="text-emerald-400" />}
                  {activeAxisView === 'X' && <ArrowRight size={11} className="text-red-400" />}
                  {activeAxisView === '3D' && <Box size={11} className="text-purple-400" />}
                  <span className="font-mono font-bold text-[9px] tracking-wide">{activeAxisView}</span>
                  <ChevronDown size={10} className={\`text-gray-500 transition-transform duration-200 \${isAxisMenuOpen ? 'rotate-180' : ''}\`} />
                </button>

                {isAxisMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsAxisMenuOpen(false)} 
                    />
                    <div className="absolute bottom-full mb-1.5 left-0 z-50 bg-[#121217]/95 border border-white/10 rounded-lg p-1 shadow-2xl min-w-[70px] flex flex-col gap-0.5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
                      {/* Option Z */}
                      <button
                        onClick={() => { setActiveAxisView('Z'); setAxisUpdateId(n => n + 1); setIsAxisMenuOpen(false); }}
                        className={\`h-7 px-2 rounded flex items-center gap-2 text-[9px] font-mono font-bold transition-all cursor-pointer select-none text-left w-full hover:bg-white/5 \${activeAxisView === 'Z' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-300'}\`}
                      >
                        <Compass size={11} className="text-blue-400 shrink-0" />
                        <span>Z</span>
                      </button>

                      {/* Option Y */}
                      <button
                        onClick={() => { setActiveAxisView('Y'); setAxisUpdateId(n => n + 1); setIsAxisMenuOpen(false); }}
                        className={\`h-7 px-2 rounded flex items-center gap-2 text-[9px] font-mono font-bold transition-all cursor-pointer select-none text-left w-full hover:bg-white/5 \${activeAxisView === 'Y' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' : 'text-gray-300'}\`}
                      >
                        <ArrowUp size={11} className="text-emerald-400 shrink-0" />
                        <span>Y</span>
                      </button>

                      {/* Option X */}
                      <button
                        onClick={() => { setActiveAxisView('X'); setAxisUpdateId(n => n + 1); setIsAxisMenuOpen(false); }}
                        className={\`h-7 px-2 rounded flex items-center gap-2 text-[9px] font-mono font-bold transition-all cursor-pointer select-none text-left w-full hover:bg-white/5 \${activeAxisView === 'X' ? 'bg-red-600/20 text-red-400 border border-red-500/20' : 'text-gray-300'}\`}
                      >
                        <ArrowRight size={11} className="text-red-400 shrink-0" />
                        <span>X</span>
                      </button>

                      {/* Option 3D */}
                      <button
                        onClick={() => { setActiveAxisView('3D'); setAxisUpdateId(n => n + 1); setIsAxisMenuOpen(false); }}
                        className={\`h-7 px-2 rounded flex items-center gap-2 text-[9px] font-mono font-bold transition-all cursor-pointer select-none text-left w-full hover:bg-white/5 \${activeAxisView === '3D' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-gray-300'}\`}
                      >
                        <Box size={11} className="text-purple-400 shrink-0" />
                        <span>3D</span>
                      </button>
                    </div>
                  </>
                )}
`;
  code = code.substring(0, badCodeStart) + replacement + code.substring(badCodeEnd);
  fs.writeFileSync('src/components/viewport/Viewport.tsx', code);
}
