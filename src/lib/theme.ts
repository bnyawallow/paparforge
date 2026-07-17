import { useEditorStore } from '../store/useEditorStore';

export function useTheme() {
  const theme = useEditorStore(state => state.editorTheme);
  const isLight = theme === 'light';

  return {
    isLight,
    theme,
    // Backgrounds
    bgMain: isLight ? 'bg-white' : 'bg-[#0F0F0F]',
    bgPanel: isLight ? 'bg-[#F4F4F5]' : 'bg-[#141414]',
    bgPanelHeader: isLight ? 'bg-[#E4E4E7]' : 'bg-[#111111]',
    bgInput: isLight ? 'bg-white text-[#1F2937] border-[#D4D4D8]' : 'bg-black/40 text-white border-[#2A2A2A]',
    bgDropdown: isLight ? 'bg-white border-[#E4E4E7] text-gray-800' : 'bg-[#161616] border-[#333] text-white',
    bgItemHover: isLight ? 'hover:bg-gray-200/70' : 'hover:bg-[#222]',
    bgActive: isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-600/20 text-blue-400 border-blue-500/30',
    
    // Text colors
    textMain: isLight ? 'text-[#1F2937]' : 'text-[#E0E0E0]',
    textHeading: isLight ? 'text-gray-900' : 'text-white',
    textMuted: isLight ? 'text-[#71717A]' : 'text-[#888888]',
    textSub: isLight ? 'text-[#4B5563]' : 'text-[#AAAAAA]',
    
    // Borders
    border: isLight ? 'border-[#E4E4E7]' : 'border-[#2A2A2A]',
    borderDarker: isLight ? 'border-[#D4D4D8]' : 'border-[#1C1C1C]',
    borderLight: isLight ? 'border-gray-200' : 'border-[#333]',
  };
}
