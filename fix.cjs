const fs = require('fs');
let code = fs.readFileSync('src/components/assets/AssetBrowser.tsx', 'utf8');
code = code.replace("🌇 Sun,\n  Globeset Glow", "🌇 Sunset Glow");
code = code.replace(/import \{\n  Image as ImageIcon,[\s\S]*?Sun,\n  Globe\n\} from 'lucide-react';/,
`import {
  Image as ImageIcon,
  Video,
  Box,
  FileCode,
  Upload,
  Trash2, X,
  Edit2,
  Music,
  Zap,
  Sparkles,
  Layers,
  Volume2,
  Plus,
  Check,
  Eye,
  Info,
  Play,
  Search,
  Sun,
  Globe
} from 'lucide-react';`);
fs.writeFileSync('src/components/assets/AssetBrowser.tsx', code);
