import re

with open('src/components/viewport/Viewport.tsx', 'r') as f:
    text = f.read()

# Fix performance monitor GlassCard
text = re.sub(
    r'(<GlassCard variant="dark" blur="md" className="absolute top-3 right-3 z-30 p-3 w-52 select-none pointer-events-none font-sans transition-all">.*?)\s*</div>\s*\)}\s*<Canvas',
    r'\1\n        </GlassCard>\n      )}\n      <Canvas',
    text,
    flags=re.DOTALL
)

with open('src/components/viewport/Viewport.tsx', 'w') as f:
    f.write(text)
