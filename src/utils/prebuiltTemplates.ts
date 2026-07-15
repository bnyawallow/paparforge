import { v4 as uuidv4 } from 'uuid';
import { SceneObject, Vector3Data } from '../types';
import { useEditorStore } from '../store/useEditorStore';

export interface PrebuiltTemplate {
  id: string;
  name: string;
  type: '2D HUD' | '3D Scene';
  description: string;
  objectType: SceneObject['type'];
  properties: Record<string, any>;
  scale?: Vector3Data;
  position?: Vector3Data;
  rotation?: Vector3Data;
}

export const PREBUILT_TEMPLATES: PrebuiltTemplate[] = [
  {
    id: 'glass-panel',
    name: 'Glassmorphism Panel',
    type: '2D HUD',
    description: 'A translucent, blurred background container panel, perfect for building clean modern UIs.',
    objectType: 'overlay2d',
    properties: {
      backgroundColor: '#0f172a',
      opacity: 0.65,
      blur: 12,
      width: 320,
      widthType: 'px',
      height: 200,
      heightType: 'px',
      alignment: 'center-left',
      offsetX: 20,
      offsetY: 0,
      borderRadius: 16,
      borderEnabled: true,
      borderColor: '#38bdf8',
      zIndex: 10
    }
  },
  {
    id: 'hud-title',
    name: 'HUD Title Text',
    type: '2D HUD',
    description: 'A crisp, modern display title for interfaces and panels.',
    objectType: 'overlayText',
    properties: {
      text: 'SYSTEM METRICS',
      color: '#38bdf8',
      fontSize: 18,
      alignment: 'top-left',
      offsetX: 40,
      offsetY: 40,
      zIndex: 20
    }
  },
  {
    id: 'modern-cta',
    name: 'Modern UI Button',
    type: '2D HUD',
    description: 'A responsive action button with clean padding and rounded corners.',
    objectType: 'overlayButton',
    properties: {
      text: 'INITIALIZE SEQUENCE',
      color: '#0ea5e9',
      textColor: '#ffffff',
      alignment: 'bottom-center',
      offsetY: 40,
      width: 220,
      widthType: 'px',
      height: 48,
      heightType: 'px',
      borderRadius: 24,
      zIndex: 50
    }
  },
  {
    id: 'html-dashboard',
    name: 'HTML Telemetry Dashboard',
    type: '2D HUD',
    description: 'A complex, responsive HTML/Tailwind widget embedded in the HUD.',
    objectType: 'overlayEmbed',
    properties: {
      url: `data:text/html,<html><head><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;margin:0;background:rgba(15,23,42,0.7);backdrop-filter:blur(16px);color:white;overflow:hidden;}</style></head><body class="p-5 h-full flex flex-col justify-between"><div class="flex flex-col gap-2"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span><h1 class="text-[10px] uppercase font-bold tracking-widest text-emerald-400">TELEMETRY</h1></div><span class="text-[9px] font-mono text-slate-400">v2.0.4</span></div><h2 class="text-xl font-semibold tracking-tight text-white/95">Environmental Monitor</h2><p class="text-[11px] text-slate-300/90 leading-relaxed mt-1">Diagnostics indicate optimal atmospheric parameters. Oxygen: 21%, Pressure: 1.01 atm, Temp: 22°C.</p></div><div class="flex justify-between items-center pt-3 border-t border-slate-700/50 mt-4"><span class="text-[10px] font-mono text-slate-400">SYS_04 // ACTIVE</span><button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-md text-[10px] transition-colors shadow-lg shadow-emerald-500/20" onclick="alert('Telemetry Sync Recalibrated!')">RECALIBRATE</button></div></body></html>`,
      width: 380,
      widthType: 'px',
      height: 240,
      heightType: 'px',
      alignment: 'top-right',
      offsetX: 20,
      offsetY: 20,
      borderRadius: 16,
      borderEnabled: true,
      borderColor: '#10b981',
      showAddressBar: false,
      zIndex: 10
    }
  },
  {
    id: '3d-neon-button',
    name: '3D Neon Glass CTA',
    type: '3D Scene',
    description: 'A floating translucent 3D button styled in bright cyber-neon accents for physical integration.',
    objectType: 'button',
    properties: {
      text: 'ENTER PORTAL',
      color: '#06b6d4',
      textColor: '#ffffff',
      url: 'https://example.com'
    },
    scale: [1, 0.35, 0.05],
    position: [0, 0.2, 0.1],
    rotation: [0, 0, 0]
  },
  {
    id: '3d-holo-panel',
    name: '3D Hologram Card',
    type: '3D Scene',
    description: 'A futuristic floating holographic display card detailing mesh and system matrix status.',
    objectType: 'text',
    properties: {
      text: "⚡ GRID MATRIX ACTIVE\nSYNC LEVEL: 98.4%\nSECURITY CODE: 88-X9",
      color: '#00f5ff',
      fontSize: 0.12,
      outlineColor: '#005f73',
      outlineWidth: 0.012,
      textAlign: 'center'
    },
    scale: [1, 1, 1],
    position: [0, 1.2, 0],
    rotation: [0, 0, 0]
  }
];

export function instantiateTemplate(templateId: string, parentId?: string): SceneObject | null {
  const store = useEditorStore.getState();
  const template = PREBUILT_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  const newObj: SceneObject = {
    id: uuidv4(),
    name: template.name,
    type: template.objectType,
    position: template.position || [0, 0, 0],
    rotation: template.rotation || [0, 0, 0],
    scale: template.scale || [1, 1, 1],
    visible: true,
    children: [],
    parentId: null,
    properties: { ...template.properties }
  };

  const is2DOverlay = ['overlay2d', 'overlayText', 'overlayButton', 'overlayImage', 'overlayEmbed'].includes(template.objectType);
  let resolvedParentId = parentId || null;

  if (is2DOverlay) {
    if (!resolvedParentId) {
      // Find existing 2D Canvas in objects
      const activeOverlay2d = Object.values(store.objects).find(o => o.type === 'overlay2d');
      if (activeOverlay2d) {
        resolvedParentId = activeOverlay2d.id;
      } else {
        // Create 2D Canvas dynamically to host the element
        const canvasId = uuidv4();
        const newCanvas: SceneObject = {
          id: canvasId,
          name: 'HUD 2D Canvas',
          type: 'overlay2d',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          visible: true,
          children: [],
          parentId: null,
          properties: { backgroundColor: '#000000', opacity: 0.0, alignment: 'none', width: 100, widthType: '%', height: 100, heightType: '%' }
        };
        store.addObject(newCanvas);
        resolvedParentId = canvasId;
      }
    }
  } else {
    // 3D placement relative to target if not provided
    if (!resolvedParentId) {
      const imageTarget = Object.values(store.objects).find(o => o.type === 'imageTarget');
      if (imageTarget) resolvedParentId = imageTarget.id;
    }
  }

  newObj.parentId = resolvedParentId;
  store.addObject(newObj, resolvedParentId || undefined);
  store.selectObject(newObj.id);

  return newObj;
}
