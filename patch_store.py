import re

with open('src/store/useEditorStore.ts', 'r') as f:
    content = f.read()

# Add import for useAuthStore at the top
import_str = "import { useAuthStore } from './useAuthStore';\n"
if "useAuthStore" not in content:
    content = import_str + content

# Helper function
helper = """
const getStorageKey = (key: string) => {
  const user = useAuthStore.getState().user;
  return user ? `${user.id}_${key}` : key;
};
"""
if "const getStorageKey" not in content:
    # insert after imports
    content = content.replace("const initialImageTargetId", helper + "\nconst initialImageTargetId")

# Replace localStorage.getItem('...')
content = re.sub(r"localStorage\.getItem\((['`])ar_forge_([^'`]+)(['`])\)", r"localStorage.getItem(getStorageKey(\1ar_forge_\2\3))", content)
content = re.sub(r"localStorage\.setItem\((['`])ar_forge_([^'`]+)(['`]),", r"localStorage.setItem(getStorageKey(\1ar_forge_\2\3),", content)
content = re.sub(r"localStorage\.removeItem\((['`])ar_forge_([^'`]+)(['`])\)", r"localStorage.removeItem(getStorageKey(\1ar_forge_\2\3))", content)

with open('src/store/useEditorStore.ts', 'w') as f:
    f.write(content)
