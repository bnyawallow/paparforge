import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  X, 
  Play, 
  BookOpen, 
  Code, 
  Check, 
  FileCode, 
  Zap, 
  Sparkles, 
  RotateCw, 
  Maximize, 
  Volume2, 
  Compass,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { cn } from '../../lib/utils';

const SCRIPT_EXAMPLES = [
  {
    name: '🎈 Levitate & Rotate',
    desc: 'Continuously floats the object up and down and spins it around.',
    code: `// Registers a callback that runs on every frame
onUpdate((time) => {
  // mesh is the ThreeJS group reference
  mesh.position.y = Math.sin(time * 2.5) * 0.4;
  mesh.rotation.y = time * 0.8;
});`
  },
  {
    name: '✨ Tap to Play Sound & Message',
    desc: 'Triggers a success sound chime and displays an on-screen toast.',
    code: `// Registers a callback when the object is clicked in Preview Mode
onTap(() => {
  // Play the Success Chime sound preset
  api.playSound('/sounds/success_chime.wav');
  
  // Show an AR notification banner
  api.showToast("Success! You activated the portal.");
});`
  },
  {
    name: '🌈 Interactive Color Cycle',
    desc: 'Cycles the object color on tap.',
    code: `let colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
let currentIndex = 0;

onTap(() => {
  currentIndex = (currentIndex + 1) % colors.length;
  // Modify properties reactively
  api.showToast("Changer Color to: " + colors[currentIndex]);
  
  // Check if mesh material color can be changed
  mesh.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.color.set(colors[currentIndex]);
    }
  });
});`
  },
  {
    name: '📐 Orbital Scaling',
    desc: 'Changes scale in response to a cosine wave.',
    code: `onUpdate((time) => {
  const factor = 1 + Math.cos(time * 3) * 0.15;
  mesh.scale.set(factor, factor, factor);
});`
  }
];

export function ScriptEditorPanel() {
  const { editingScriptObjectId, objects, updateObject, setEditingScriptObjectId, addToast } = useEditorStore();
  const [code, setCode] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'reference'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingScriptObjectId && objects[editingScriptObjectId]) {
      setCode(objects[editingScriptObjectId].properties.scriptCode || '');
      setIsSaved(true);
    }
  }, [editingScriptObjectId]);

  if (!editingScriptObjectId || !objects[editingScriptObjectId]) return null;

  const obj = objects[editingScriptObjectId];

  const handleSave = () => {
    updateObject(editingScriptObjectId, {
      properties: {
        ...obj.properties,
        scriptCode: code
      }
    });
    setIsSaved(true);
    addToast(`⚡ Script compiled & attached to "${obj.name}"`);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setIsSaved(false);
  };

  const injectExample = (exampleCode: string) => {
    setCode(exampleCode);
    setIsSaved(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Generate line numbers helper
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 8) }, (_, i) => i + 1);

  return (
    <div className="h-full border-t border-[#2A2A2A] bg-[#101010] flex flex-col shrink-0 text-xs font-sans relative z-30">
      {/* Script Editor Header */}
      <div className="h-10 border-b border-[#2A2A2A] bg-[#141414] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-blue-400" />
          <span className="font-mono font-bold text-white text-[11px] flex items-center gap-1.5">
            {obj.name}.ts
            <span className="text-[9px] text-[#555] font-normal font-sans">({obj.type} script)</span>
          </span>
          <span className={cn(
            "text-[9px] font-mono px-1.5 py-0.5 rounded ml-2 select-none",
            isSaved ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          )}>
            {isSaved ? "✓ Attached & Compiled" : "● Unsaved Changes"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Editor/Docs tab toggle */}
          <div className="flex bg-[#1E1E1E] border border-[#2A2A2A] rounded p-0.5 text-[10px]">
            <button 
              onClick={() => setActiveTab('editor')}
              className={cn("px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 font-medium", activeTab === 'editor' ? "bg-[#2D2D2D] text-white" : "text-[#777] hover:text-white")}
            >
              <Code size={11} /> Editor
            </button>
            <button 
              onClick={() => setActiveTab('reference')}
              className={cn("px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 font-medium", activeTab === 'reference' ? "bg-[#2D2D2D] text-white" : "text-[#777] hover:text-white")}
            >
              <BookOpen size={11} /> API Docs
            </button>
          </div>

          <button 
            onClick={handleSave}
            className={cn(
              "px-3 py-1 rounded font-bold uppercase tracking-wider text-[10px] transition-all flex items-center gap-1.5",
              isSaved 
                ? "bg-[#1C1C1C] text-[#666] border border-[#2A2A2A] cursor-default" 
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95"
            )}
            disabled={isSaved}
          >
            Save & Build
          </button>

          <button 
            onClick={() => setEditingScriptObjectId(null)}
            className="text-[#666] hover:text-white p-1 hover:bg-[#1E1E1E] rounded transition-colors"
            title="Close editor"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Coding Area */}
        <div className="flex-1 flex overflow-hidden bg-[#0A0A0A]">
          {/* Gutter Line Numbers */}
          <div className="w-10 bg-[#0E0E0E] text-right pr-2.5 select-none text-[#444] font-mono leading-5 pt-3.5 border-r border-[#1C1C1C]">
            {lineNumbers.map(n => <div key={n}>{n}</div>)}
          </div>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              placeholder={`// Write your custom interactive script code here...\n\nonTap(() => {\n  api.showToast("Hello from " + object.name);\n});`}
              className="absolute inset-0 w-full h-full bg-transparent text-white font-mono text-xs leading-5 p-3.5 resize-none outline-none overflow-y-auto whitespace-pre tab-size-4 select-text"
              style={{ tabSize: 4 }}
            />
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-80 border-l border-[#2A2A2A] bg-[#141414] flex flex-col overflow-hidden">
          {activeTab === 'editor' ? (
            /* Script Templates Selector */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-[#2A2A2A] bg-[#1A1A1A] flex items-center gap-1.5">
                <Lightbulb size={12} className="text-amber-400" />
                <span className="font-bold text-[#AAA] text-[10px] uppercase tracking-wider">Inject Script Template</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                <p className="text-[10px] text-[#666] leading-relaxed mb-1">
                  Click any template below to replace your script with a ready-to-run interactive AR behavior:
                </p>
                {SCRIPT_EXAMPLES.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => injectExample(ex.code)}
                    className="text-left bg-[#1D1D1D] hover:bg-[#252525] border border-[#2A2A2A] hover:border-[#383838] p-2.5 rounded transition-all group flex flex-col gap-1"
                  >
                    <span className="font-bold text-white group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                      {ex.name}
                    </span>
                    <span className="text-[9px] text-[#777] leading-relaxed">
                      {ex.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Interactive Sandbox API Reference */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-[#2A2A2A] bg-[#1A1A1A] flex items-center gap-1.5">
                <BookOpen size={12} className="text-blue-400" />
                <span className="font-bold text-[#AAA] text-[10px] uppercase tracking-wider">Engine Sandbox API Reference</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 font-mono text-[10px]">
                <div>
                  <div className="text-blue-400 font-bold mb-1">mesh</div>
                  <div className="text-[#888] font-sans text-[10px] leading-relaxed">
                    The underlying Three.js <span className="font-mono text-gray-400">THREE.Group</span> object. You can directly edit its <span className="font-mono text-gray-400">position</span>, <span className="font-mono text-gray-400">rotation</span>, or <span className="font-mono text-gray-400">scale</span>.
                  </div>
                </div>

                <div>
                  <div className="text-orange-400 font-bold mb-1">onUpdate(callback)</div>
                  <div className="text-[#888] font-sans text-[10px] leading-relaxed">
                    Runs on every screen refresh. Receives <span className="font-mono text-gray-400">time</span> (seconds elapsed) and <span className="font-mono text-gray-400">delta</span> (frame time).
                  </div>
                </div>

                <div>
                  <div className="text-pink-400 font-bold mb-1">onTap(callback)</div>
                  <div className="text-[#888] font-sans text-[10px] leading-relaxed">
                    Registers a function to run whenever this object is tapped in preview mode.
                  </div>
                </div>

                <div className="border-t border-[#222] my-1"></div>

                <div>
                  <div className="text-emerald-400 font-bold mb-1">api.showToast(msg)</div>
                  <div className="text-[#888] font-sans text-[10px] leading-relaxed">
                    Shows an on-screen spatial AR alert banner inside the device HUD.
                  </div>
                </div>

                <div>
                  <div className="text-indigo-400 font-bold mb-1">api.playSound(url)</div>
                  <div className="text-[#888] font-sans text-[10px] leading-relaxed">
                    Plays sound effects preset or custom sound URL.
                  </div>
                </div>

                <div>
                  <div className="text-cyan-400 font-bold mb-1">api.toggleVisibility(id)</div>
                  <div className="text-[#888] font-sans text-[10px] leading-relaxed">
                    Toggles visibility state of another entity.
                  </div>
                </div>

                <div>
                  <div className="text-purple-400 font-bold mb-1">api.setPosition(x, y, z)</div>
                  <div className="text-[#888] font-sans text-[10px] leading-relaxed">
                    Helper to update position both physically in 3D space and reactively in the UI database.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
