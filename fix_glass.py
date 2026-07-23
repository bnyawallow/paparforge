import re

with open('src/components/viewport/Viewport.tsx', 'r') as f:
    text = f.read()

# Fix top-left GlassCard
text = re.sub(
    r'<GlassCard variant="dark" blur="md" className="absolute top-4 left-4 z-40 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">\s*<div className="w-2 h-2 rounded-full bg-\[#10b981\] animate-pulse" />\s*<span className="font-mono text-\[#AAA\]">WORKSPACE: SIMULATOR ACTIVE</span>\s*</div>',
    '<GlassCard variant="dark" blur="md" className="absolute top-4 left-4 z-40 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">\n          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />\n          <span className="font-mono text-[#AAA]">WORKSPACE: SIMULATOR ACTIVE</span>\n        </GlassCard>',
    text
)

# Fix performance monitor GlassCard
text = re.sub(
    r'(<GlassCard variant="dark" blur="md" className="absolute top-3 right-3 z-30 p-3 w-52 select-none pointer-events-none font-sans transition-all">.*?)\s*</div>\s*<Canvas',
    r'\1\n        </GlassCard>\n      <Canvas',
    text,
    flags=re.DOTALL
)

with open('src/components/viewport/Viewport.tsx', 'w') as f:
    f.write(text)
