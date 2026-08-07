import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, Plus, Upload, Trash2, Copy, FileDown, Search, ArrowRight, Sparkles, 
  Layers, User as UserIcon, ShoppingBag, GraduationCap, Check, AlertTriangle, 
  Sun, Moon, LogOut, Box, Clock, Edit2, Tv, Car, Utensils, Crown, Building2,
  Globe, X, Download, ExternalLink, Lock, LayoutTemplate, BookmarkPlus
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../lib/theme';
import { motion, AnimatePresence } from 'motion/react';
import { TemplateType } from '../../types';

export function ProjectManagerView() {
  const t = useTheme();
  const {
    projectsList,
    createProject,
    openProject,
    deleteProject,
    duplicateProject,
    importProject,
    renameProject,
    addToast,
    editorTheme,
    toggleEditorTheme
  } = useEditorStore();

  const { user, logout } = useAuthStore();

  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('empty');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Custom templates state
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);

  // Publish details modal state
  const [publishModalProject, setPublishModalProject] = useState<any | null>(null);

  // Admin Save as Template modal state
  const [saveTemplateProject, setSaveTemplateProject] = useState<any | null>(null);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateBadge, setTemplateBadge] = useState('Custom');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateColor, setTemplateColor] = useState('from-purple-600 to-indigo-800 text-purple-400 bg-purple-500/10 border-purple-500/20');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom templates on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ar_forge_custom_templates');
      if (stored) {
        setCustomTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse custom templates:', e);
    }
  }, []);

  const builtinTemplates = [
    {
      id: 'empty',
      name: 'Empty Canvas',
      badge: 'Starter',
      description: 'Clean canvas with a trackable Image Target ready for custom 3D models & overlays.',
      icon: Layers,
      color: 'from-slate-600 to-slate-800 text-slate-400 bg-slate-500/10 border-slate-500/20'
    },
    {
      id: 'product_showcase',
      name: 'Tech Gadget Launch',
      badge: 'Product Demo',
      description: 'Interactive 3D tech reveal with rotating pedestal, specs & pre-order button.',
      icon: ShoppingBag,
      color: 'from-cyan-600 to-blue-800 text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      id: 'billboard_poster',
      name: 'AR Holographic Billboard',
      badge: 'Entertainment',
      description: '3D floating billboard display with YouTube trailer, neon typography & coupon overlay.',
      icon: Tv,
      color: 'from-pink-600 to-rose-800 text-pink-400 bg-pink-500/10 border-pink-500/20'
    },
    {
      id: 'automobile_showroom',
      name: '3D EV Showroom Ad',
      badge: 'Automobile',
      description: 'Electric vehicle stage with specs, color picker & Test Drive CTA.',
      icon: Car,
      color: 'from-red-600 to-orange-800 text-red-400 bg-red-500/10 border-red-500/20'
    },
    {
      id: 'fast_food_beverage',
      name: 'Food & Beverage Promo',
      badge: 'FMCG & Dining',
      description: '3D soda & burger combo with particle rings, 25% discount voucher & order CTA.',
      icon: Utensils,
      color: 'from-amber-600 to-yellow-800 text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'luxury_fashion',
      name: 'Luxury Fragrance & Fashion',
      badge: 'Luxury & Beauty',
      description: 'Marble display pedestal with gold halo lights & collection showcase.',
      icon: Crown,
      color: 'from-yellow-600 to-amber-800 text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    },
    {
      id: 'real_estate',
      name: 'Architectural Villa & Property',
      badge: 'Real Estate',
      description: '3D penthouse villa model on dark glass stage with amenity hotspots.',
      icon: Building2,
      color: 'from-blue-600 to-indigo-800 text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'business_card',
      name: 'AR Business Card & Identity',
      badge: 'Networking',
      description: 'Interactive social identity card with contact buttons, website links & video pitch reel.',
      icon: UserIcon,
      color: 'from-indigo-600 to-purple-800 text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      id: 'educational',
      name: 'Spatial Interactive Journey',
      badge: 'Education',
      description: 'Interactive spatial solar orbit with Earth core & annotated labels.',
      icon: GraduationCap,
      color: 'from-purple-600 to-pink-800 text-purple-400 bg-purple-500/10 border-purple-500/20'
    }
  ];

  const getProjectPublishInfo = (proj: any) => {
    let url = proj.publishedProjectUrl;
    let id = proj.publishedProjectId;
    let disabled = proj.isPublishDisabled;

    if (url === undefined || id === undefined || disabled === undefined) {
      try {
        const fullSavedKey = `ar_forge_project_${proj.id}`;
        const userState = useAuthStore.getState().user;
        const storageKey = userState ? `${userState.id}_${fullSavedKey}` : fullSavedKey;
        const savedDataStr = localStorage.getItem(storageKey) || localStorage.getItem(fullSavedKey);
        if (savedDataStr) {
          const parsed = JSON.parse(savedDataStr);
          if (url === undefined) url = parsed.settings?.publishedProjectUrl;
          if (id === undefined) id = parsed.settings?.publishedProjectId;
          if (disabled === undefined) disabled = parsed.settings?.isPublishDisabled;
        }
      } catch (e) {
        console.error('Failed to parse publish info:', e);
      }
    }

    return { 
      publishedProjectUrl: url || '', 
      publishedProjectId: id || '', 
      isPublishDisabled: !!disabled 
    };
  };

  const filteredProjects = projectsList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      addToast('Please enter a project name');
      return;
    }

    const matchedCustom = customTemplates.find(ct => ct.id === selectedTemplate);
    createProject(newProjectName.trim(), selectedTemplate as TemplateType, matchedCustom);
    addToast(`Project "${newProjectName.trim()}" created successfully!`);
    setNewProjectName('');
  };

  const handleOpenProject = (id: string) => {
    openProject(id);
    addToast('Opening project editor...');
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const { SupabaseService } = await import('../../services/supabaseService');
      if (SupabaseService.isConfigured()) {
        const assetUrls: string[] = [];
        const savedDataStr = localStorage.getItem(`ar_forge_project_${projectToDelete.id}`);
        if (savedDataStr) {
          const parsed = JSON.parse(savedDataStr);
          if (parsed.assets && Array.isArray(parsed.assets)) {
            parsed.assets.forEach((asset: any) => {
              if (asset.url) assetUrls.push(asset.url);
            });
          }
        }
        await SupabaseService.deleteProject(projectToDelete.id, projectToDelete.name, assetUrls);
      }
    } catch (err) {
      console.error('Cleanup error:', err);
    }

    deleteProject(projectToDelete.id);
    addToast(`Deleted "${projectToDelete.name}"`);
    setProjectToDelete(null);
    setIsDeleting(false);
  };

  const handleRenameSubmit = (projectId: string) => {
    if (renameValue.trim()) {
      renameProject(projectId, renameValue.trim());
      addToast(`Renamed project to "${renameValue.trim()}"`);
    }
    setRenamingProjectId(null);
    setRenameValue('');
  };

  const handleDuplicate = (id: string, name: string) => {
    duplicateProject(id);
    addToast(`Duplicated "${name}"`);
  };

  const handleExport = (id: string, name: string) => {
    try {
      const savedDataStr = localStorage.getItem(`ar_forge_project_${id}`);
      if (!savedDataStr) {
        addToast('Could not locate project save data');
        return;
      }
      const blob = new Blob([savedDataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.replace(/\s+/g, '_')}_ar_forge.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast(`Exported "${name}"`);
    } catch (e) {
      addToast('Export failed');
    }
  };

  // Admin Save as Template Handler
  const handleOpenSaveTemplateModal = (proj: any) => {
    setSaveTemplateProject(proj);
    setTemplateTitle(proj.name);
    setTemplateBadge('Custom');
    setTemplateDescription(`Custom AR experience template based on ${proj.name}.`);
    setTemplateColor('from-purple-600 to-indigo-800 text-purple-400 bg-purple-500/10 border-purple-500/20');
  };

  const handleSaveAsTemplateSubmit = () => {
    if (!saveTemplateProject) return;
    try {
      const fullSavedKey = `ar_forge_project_${saveTemplateProject.id}`;
      const userState = useAuthStore.getState().user;
      const storageKey = userState ? `${userState.id}_${fullSavedKey}` : fullSavedKey;
      const savedDataStr = localStorage.getItem(storageKey) || localStorage.getItem(fullSavedKey);
      
      if (!savedDataStr) {
        addToast('Could not load project data to save as template');
        return;
      }

      const parsed = JSON.parse(savedDataStr);
      const newTemplate = {
        id: `custom_${Date.now()}`,
        name: templateTitle.trim() || saveTemplateProject.name,
        badge: templateBadge.trim() || 'Custom',
        description: templateDescription.trim() || 'Custom pre-configured AR experience template.',
        color: templateColor,
        isCustom: true,
        createdBy: userState?.username || 'Admin',
        createdAt: Date.now(),
        objects: parsed.objects || {},
        rootObjects: parsed.rootObjects || [],
        settings: parsed.settings || {},
        assets: parsed.assets || []
      };

      const existingCustomStr = localStorage.getItem('ar_forge_custom_templates');
      const existingCustom = existingCustomStr ? JSON.parse(existingCustomStr) : [];
      const updatedCustom = [newTemplate, ...existingCustom];
      localStorage.setItem('ar_forge_custom_templates', JSON.stringify(updatedCustom));

      setCustomTemplates(updatedCustom);
      setSelectedTemplate(newTemplate.id);
      addToast(`Saved "${newTemplate.name}" as workspace template!`);
      setSaveTemplateProject(null);
    } catch (e) {
      console.error('Failed to save template:', e);
      addToast('Error saving template');
    }
  };

  const handleDeleteCustomTemplate = (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const existingCustomStr = localStorage.getItem('ar_forge_custom_templates');
      if (!existingCustomStr) return;
      const existingCustom = JSON.parse(existingCustomStr);
      const updated = existingCustom.filter((t: any) => t.id !== templateId);
      localStorage.setItem('ar_forge_custom_templates', JSON.stringify(updated));
      setCustomTemplates(updated);
      if (selectedTemplate === templateId) {
        setSelectedTemplate('empty');
      }
      addToast(`Deleted template "${templateName}"`);
    } catch (err) {
      addToast('Failed to delete custom template');
    }
  };

  const handleDownloadQRCode = async (url: string, projectName: string) => {
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=000000&bgcolor=ffffff&data=${encodeURIComponent(url)}`;
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_qrcode.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      addToast('Downloaded QR Code image!');
    } catch (err) {
      addToast('Failed to download QR code image');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      addToast('Please drop a valid .json project file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const importedId = importProject(json);
        if (importedId) {
          addToast('Project imported successfully');
        } else {
          addToast('Invalid project JSON structure');
        }
      } catch (err) {
        addToast('Failed to read project file');
      }
    };
    reader.readAsText(file);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const importedId = importProject(json);
        if (importedId) {
          addToast('Project imported successfully');
        } else {
          addToast('Invalid project JSON structure');
        }
      } catch (err) {
        addToast('Failed to read project file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 relative ${t.isLight ? 'bg-[#F8F9FA] text-gray-900' : 'bg-[#0A0A0B] text-white'}`}
    >
      {/* File Drag Overlay */}
      <AnimatePresence>
        {isDraggingFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-blue-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-8"
          >
            <Upload size={64} className="animate-bounce mb-4 text-white" />
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Drop Project File Here</h2>
            <p className="text-blue-100 font-medium">Release to import your .json AR Forge experience into your workspace</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className={`h-16 border-b px-6 flex items-center justify-between shrink-0 ${t.isLight ? 'bg-white border-gray-200' : 'bg-[#121214] border-[#222226]'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 text-sm">
            AF
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight flex items-center gap-2">
              AR Forge Workspace
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold border border-blue-500/20">
                Projects Manager
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${t.isLight ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-[#1C1C20] border-[#2E2E35] text-gray-300'}`}>
              <UserIcon size={14} className="text-blue-400" />
              <span>{user.username}</span>
              {user.role === 'admin' && (
                <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Admin</span>
              )}
            </div>
          )}

          <button 
            onClick={toggleEditorTheme}
            className={`p-2 border rounded-lg transition-colors shadow-sm ${t.isLight ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700' : 'bg-[#1C1C20] hover:bg-[#25252A] border-[#2E2E35] text-gray-300'}`}
            title={editorTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {editorTheme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-400" />}
          </button>

          <button 
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border-red-500/20 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={14} />
            <span className="hidden xs:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
        
        {/* Hero Greeting Section */}
        <section className={`p-8 rounded-3xl border relative overflow-hidden ${t.isLight ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-100' : 'bg-gradient-to-r from-[#141418] via-[#16161D] to-[#12121A] border-[#2A2A35]'}`}>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20 mb-4">
              <Sparkles size={14} />
              <span>Spatial AR Creation Hub</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              {user ? `Welcome back, ${user.username}!` : 'Welcome to AR Forge!'}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${t.isLight ? 'text-gray-600' : 'text-[#999]'}`}>
              Select an existing AR experience to edit or start fresh by picking a template below. The 3D editor will boot seamlessly as soon as you open a project.
            </p>
          </div>
        </section>

        {/* Section 1: Create New Project */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="text-blue-500" size={20} />
              <h3 className="text-lg font-extrabold tracking-tight">Create New Project</h3>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${t.isLight ? 'bg-white hover:bg-gray-100 border-gray-300 text-gray-700 shadow-sm' : 'bg-[#18181C] hover:bg-[#222228] border-[#2C2C36] text-gray-300'}`}
            >
              <Upload size={14} className="text-blue-400" />
              <span>Import .JSON Project</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileImport} 
              accept=".json" 
              className="hidden" 
            />
          </div>

          <form onSubmit={handleCreateProject} className="flex flex-col gap-5">
            {/* Templates Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Built-in Templates */}
              {builtinTemplates.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                      isSelected 
                        ? 'border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20 bg-blue-500/5' 
                        : t.isLight ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md' : 'bg-[#141418] border-[#24242C] hover:border-[#3A3A48]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl border ${tpl.color}`}>
                        <Icon size={18} />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <h4 className="font-bold text-sm truncate">{tpl.name}</h4>
                      </div>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${t.isLight ? 'text-gray-500' : 'text-[#888]'}`}>
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Custom Admin Saved Templates */}
              {customTemplates.map((ct) => {
                const isSelected = selectedTemplate === ct.id;
                return (
                  <div
                    key={ct.id}
                    onClick={() => setSelectedTemplate(ct.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                      isSelected 
                        ? 'border-purple-500 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/20 bg-purple-500/5' 
                        : t.isLight ? 'bg-white border-purple-200 hover:border-purple-300 hover:shadow-md' : 'bg-[#16141F] border-[#2A243A] hover:border-[#42365A]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl border ${ct.color || 'from-purple-600 to-indigo-800 text-purple-400 bg-purple-500/10 border-purple-500/20'}`}>
                        <BookmarkPlus size={18} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {user?.role === 'admin' && (
                          <button
                            onClick={(e) => handleDeleteCustomTemplate(ct.id, ct.name, e)}
                            className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete custom template"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {ct.badge || 'Custom'}
                        </span>
                        <h4 className="font-bold text-sm truncate">{ct.name}</h4>
                      </div>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${t.isLight ? 'text-gray-500' : 'text-[#999]'}`}>
                        {ct.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Project Name input + Submit */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-3 ${t.isLight ? 'bg-white border-gray-200' : 'bg-[#141418] border-[#24242C]'}`}>
              <div className="flex-1 w-full relative">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name (e.g. My Next AR Scene)..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                    t.isLight ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#0A0A0C] border-[#2A2A33] text-white placeholder-gray-600'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Plus size={16} />
                <span>Create & Open Project</span>
              </button>
            </div>
          </form>
        </section>

        {/* Section 2: Existing Projects */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Folder className="text-blue-500" size={20} />
              <h3 className="text-lg font-extrabold tracking-tight">Your Saved Projects</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.isLight ? 'bg-gray-200 text-gray-700' : 'bg-[#22222A] text-gray-400'}`}>
                {projectsList.length}
              </span>
            </div>

            <div className="relative max-w-xs w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                  t.isLight ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#141418] border-[#2A2A33] text-white placeholder-gray-600'
                }`}
              />
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border flex flex-col items-center justify-center gap-3 ${t.isLight ? 'bg-white border-gray-200' : 'bg-[#141418] border-[#22222A]'}`}>
              <Box size={40} className="text-gray-500 opacity-40" />
              <h4 className="font-bold text-base">No projects found</h4>
              <p className={`text-xs max-w-sm ${t.isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                {searchQuery ? `No project matches "${searchQuery}".` : 'Create your first project using the form above to start building AR scenes.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((proj) => {
                const isRenaming = renamingProjectId === proj.id;
                const pubInfo = getProjectPublishInfo(proj);
                const isPublished = !!pubInfo.publishedProjectUrl;

                return (
                  <motion.div
                    key={proj.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between group hover:shadow-xl ${
                      t.isLight ? 'bg-white border-gray-200 hover:border-blue-400' : 'bg-[#141418] border-[#22222A] hover:border-[#333342]'
                    }`}
                  >
                    <div>
                      {/* Top Header of Card & Space-Optimized Action Toolbar */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                            <Folder size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono text-gray-500 block truncate">
                              {proj.id.substring(0, 10)}
                            </span>
                          </div>
                        </div>

                        {/* Space-Optimized Icon Toolbar */}
                        <div className={`flex items-center gap-0.5 p-1 rounded-xl border ${
                          t.isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0E0E11] border-[#22222A]'
                        }`}>
                          {/* Publish Details Popup Trigger */}
                          <button
                            onClick={() => setPublishModalProject(proj)}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer relative ${
                              isPublished 
                                ? pubInfo.isPublishDisabled 
                                  ? 'text-amber-400 hover:bg-amber-500/20' 
                                  : 'text-emerald-400 hover:bg-emerald-500/20'
                                : 'text-gray-400 hover:text-blue-400 hover:bg-gray-500/10'
                            }`}
                            title={isPublished ? (pubInfo.isPublishDisabled ? 'Experience Paused - Click for QR & Link' : 'Experience Live - Click for QR & Link') : 'Publish & Share WebAR'}
                          >
                            <Globe size={13} />
                            {isPublished && (
                              <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                                pubInfo.isPublishDisabled ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                              }`} />
                            )}
                          </button>

                          {/* Rename */}
                          <button
                            onClick={() => {
                              setRenamingProjectId(proj.id);
                              setRenameValue(proj.name);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
                            title="Rename Project"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Export JSON */}
                          <button
                            onClick={() => handleExport(proj.id, proj.name)}
                            className="p-1.5 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-purple-400 transition-colors cursor-pointer"
                            title="Export JSON"
                          >
                            <FileDown size={13} />
                          </button>

                          {/* Save as Template (Admin Users) */}
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleOpenSaveTemplateModal(proj)}
                              className="p-1.5 rounded-lg hover:bg-purple-500/10 text-gray-400 hover:text-purple-300 transition-colors cursor-pointer"
                              title="Save as Admin Template"
                            >
                              <LayoutTemplate size={13} />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setProjectToDelete({ id: proj.id, name: proj.name })}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Metadata */}
                      {isRenaming ? (
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameSubmit(proj.id);
                              if (e.key === 'Escape') setRenamingProjectId(null);
                            }}
                            autoFocus
                            className={`w-full px-2.5 py-1 rounded-lg border text-sm font-bold focus:outline-none ${
                              t.isLight ? 'bg-gray-100 border-blue-400 text-gray-900' : 'bg-[#0F0F12] border-blue-500 text-white'
                            }`}
                          />
                          <button
                            onClick={() => handleRenameSubmit(proj.id)}
                            className="p-1 bg-blue-600 text-white rounded-lg text-xs font-bold px-2 cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <h4 className="font-extrabold text-base tracking-tight mb-1 truncate" title={proj.name}>
                          {proj.name}
                        </h4>
                      )}

                      <div className={`flex items-center justify-between text-xs mb-3 ${t.isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'Recent'}
                        </span>

                        {/* Compact WebAR Status Badge Button */}
                        {isPublished ? (
                          <button
                            onClick={() => setPublishModalProject(proj)}
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                              pubInfo.isPublishDisabled
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                            title="Click for QR Code & Share link"
                          >
                            <Globe size={11} className={pubInfo.isPublishDisabled ? '' : 'animate-pulse'} />
                            <span>{pubInfo.isPublishDisabled ? 'Paused' : 'Live WebAR'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setPublishModalProject(proj)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold text-gray-400 hover:text-blue-400 transition-colors cursor-pointer ${
                              t.isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#1A1A20] border-[#2A2A33]'
                            }`}
                          >
                            <Globe size={10} />
                            <span>Not Published</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex gap-2 pt-2 border-t border-dashed border-gray-500/20">
                      <button
                        onClick={() => handleDuplicate(proj.id, proj.name)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          t.isLight 
                            ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700' 
                            : 'bg-[#1C1C20] hover:bg-[#25252A] border-[#2E2E35] text-gray-300'
                        }`}
                        title="Duplicate project"
                      >
                        <Copy size={12} />
                        <span>Duplicate</span>
                      </button>
                      
                      <button
                        onClick={() => handleOpenProject(proj.id)}
                        className="flex-1 py-2 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5 group/btn cursor-pointer"
                      >
                        <span>Open Editor</span>
                        <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* PUBLISH DETAILS POPUP MODAL */}
      <AnimatePresence>
        {publishModalProject && (() => {
          const pubInfo = getProjectPublishInfo(publishModalProject);
          const isPublished = !!pubInfo.publishedProjectUrl;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl relative ${
                  t.isLight ? 'bg-white border-gray-200' : 'bg-[#141418] border-[#262632]'
                }`}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                        {publishModalProject.name}
                      </h3>
                      <p className="text-xs text-gray-400">WebAR Publishing & QR Code Details</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setPublishModalProject(null)}
                    className="p-1.5 rounded-xl hover:bg-gray-500/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {isPublished ? (
                  <div className="flex flex-col gap-5">
                    {/* Status & Real-time Toggle */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                      pubInfo.isPublishDisabled 
                        ? 'bg-amber-500/5 border-amber-500/20' 
                        : 'bg-emerald-500/5 border-emerald-500/20'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full ${
                          pubInfo.isPublishDisabled ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                        }`} />
                        <div>
                          <span className="text-xs font-extrabold block">
                            {pubInfo.isPublishDisabled ? 'Experience Paused' : 'Experience Live'}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {pubInfo.isPublishDisabled ? 'Public access temporarily suspended' : 'Anyone with link or QR can view'}
                          </span>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={async () => {
                          const success = await useEditorStore.getState().togglePublishStatus(publishModalProject.id, pubInfo.isPublishDisabled);
                          if (success) {
                            addToast(pubInfo.isPublishDisabled ? 'Published experience is now live!' : 'Published experience has been paused.');
                            // Force update modal state
                            setPublishModalProject({ ...publishModalProject });
                          } else {
                            addToast('Failed to change publish status.');
                          }
                        }}
                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer focus:outline-none flex items-center ${
                          pubInfo.isPublishDisabled ? 'bg-gray-700 justify-start' : 'bg-emerald-500 justify-end'
                        }`}
                        title={pubInfo.isPublishDisabled ? "Activate public link" : "Temporarily pause public access"}
                      >
                        <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>

                    {/* Sharable Shortlink Section */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shareable WebAR Shortlink</label>
                      <div className={`p-2.5 rounded-2xl border flex items-center gap-2 ${
                        t.isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0E0E11] border-[#22222A]'
                      }`}>
                        <input
                          type="text"
                          readOnly
                          value={pubInfo.publishedProjectUrl}
                          className="bg-transparent text-xs font-mono text-blue-400 flex-1 outline-none truncate"
                        />

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(pubInfo.publishedProjectUrl);
                            addToast('Copied shortlink to clipboard!');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Copy size={12} />
                          <span>Copy</span>
                        </button>

                        <a
                          href={pubInfo.publishedProjectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 transition-colors cursor-pointer"
                          title="Open in new tab"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>

                    {/* Downloadable QR Code Section */}
                    <div className={`p-5 rounded-2xl border flex flex-col items-center text-center gap-3 ${
                      t.isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0E0E11] border-[#22222A]'
                    }`}>
                      <div className="p-3 bg-white rounded-2xl shadow-xl border border-white/10">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=000000&bgcolor=ffffff&data=${encodeURIComponent(pubInfo.publishedProjectUrl)}`}
                          alt="WebAR QR Code"
                          className="w-40 h-40 rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-gray-300 mb-0.5">Scan on Smartphone Camera</p>
                        <p className="text-[11px] text-gray-400">Launches WebAR experience instantly without app install</p>
                      </div>

                      <button
                        onClick={() => handleDownloadQRCode(pubInfo.publishedProjectUrl, publishModalProject.name)}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-600 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                      >
                        <Download size={14} />
                        <span>Download QR Code Image (.PNG)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Not yet published prompt */
                  <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                    <Globe size={40} className="text-blue-500/40 animate-pulse" />
                    <h4 className="font-extrabold text-base">Not Yet Published</h4>
                    <p className="text-xs text-gray-400 max-w-xs">
                      Open this project in the editor and click the <strong className="text-blue-400">Publish</strong> button in the top toolbar to generate a shareable WebAR shortlink & QR Code.
                    </p>
                    <button
                      onClick={() => {
                        setPublishModalProject(null);
                        handleOpenProject(publishModalProject.id);
                      }}
                      className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Open in Editor</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ADMIN SAVE AS TEMPLATE MODAL */}
      <AnimatePresence>
        {saveTemplateProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl relative ${
                t.isLight ? 'bg-white border-gray-200' : 'bg-[#141418] border-[#2A243A]'
              }`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <LayoutTemplate size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight">Save as Admin Template</h3>
                    <p className="text-xs text-purple-300/70">Publish scene structure to workspace templates</p>
                  </div>
                </div>

                <button
                  onClick={() => setSaveTemplateProject(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-500/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Template Name</label>
                  <input
                    type="text"
                    value={templateTitle}
                    onChange={(e) => setTemplateTitle(e.target.value)}
                    placeholder="Template Title..."
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
                      t.isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-[#0E0E11] border-[#2A2A35] text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={templateBadge}
                    onChange={(e) => setTemplateBadge(e.target.value)}
                    placeholder="e.g. Featured, Custom, Showcase..."
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
                      t.isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-[#0E0E11] border-[#2A2A35] text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe what is pre-configured in this template..."
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
                      t.isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-[#0E0E11] border-[#2A2A35] text-white'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-2">
                  <button
                    onClick={() => setSaveTemplateProject(null)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      t.isLight ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700' : 'bg-[#222228] hover:bg-[#2A2A32] border-[#33333E] text-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAsTemplateSubmit}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookmarkPlus size={14} />
                    <span>Save Template</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {projectToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${t.isLight ? 'bg-white border-gray-200' : 'bg-[#18181C] border-[#2C2C35]'}`}
            >
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">Delete Project?</h4>
                  <p className="text-xs text-gray-400">This action cannot be undone.</p>
                </div>
              </div>
              <p className={`text-sm mb-6 ${t.isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                Are you sure you want to permanently delete <strong className="text-white">"{projectToDelete.name}"</strong>?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setProjectToDelete(null)}
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border ${t.isLight ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700' : 'bg-[#222228] hover:bg-[#2A2A32] border-[#33333E] text-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
