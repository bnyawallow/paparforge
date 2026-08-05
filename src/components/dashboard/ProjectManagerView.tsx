import React, { useState, useRef } from 'react';
import { 
  Folder, Plus, Upload, Trash2, Copy, FileDown, Search, ArrowRight, Sparkles, 
  Layers, User as UserIcon, ShoppingBag, GraduationCap, Check, AlertTriangle, 
  Sun, Moon, LogOut, Box, Calendar, Clock, Edit2, Tv, Car, Utensils, Crown, Building2
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
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('empty');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates: {
    id: TemplateType;
    name: string;
    badge: string;
    description: string;
    icon: any;
    color: string;
  }[] = [
    {
      id: 'empty',
      name: 'Empty Canvas',
      badge: 'Starter',
      description: 'Clean canvas with a trackable Image Target ready for custom 3D models and HUD overlays.',
      icon: Layers,
      color: 'from-slate-600 to-slate-800 text-slate-400 bg-slate-500/10 border-slate-500/20'
    },
    {
      id: 'product_showcase',
      name: 'Tech Gadget Launch',
      badge: 'Product Demo',
      description: 'Interactive 3D tech reveal with rotating pedestal, live price tag, specs & pre-order button.',
      icon: ShoppingBag,
      color: 'from-cyan-600 to-blue-800 text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      id: 'billboard_poster',
      name: 'AR Holographic Billboard',
      badge: 'Entertainment',
      description: '3D floating billboard display with embedded YouTube trailer, neon typography & coupon overlay.',
      icon: Tv,
      color: 'from-pink-600 to-rose-800 text-pink-400 bg-pink-500/10 border-pink-500/20'
    },
    {
      id: 'automobile_showroom',
      name: '3D EV Showroom Ad',
      badge: 'Automobile',
      description: 'Electric vehicle stage with reflective podium, performance specs, color picker & Test Drive CTA.',
      icon: Car,
      color: 'from-red-600 to-orange-800 text-red-400 bg-red-500/10 border-red-500/20'
    },
    {
      id: 'fast_food_beverage',
      name: 'Food & Beverage Promo',
      badge: 'FMCG & Dining',
      description: '3D soda can & burger combo with floating particle rings, 25% discount voucher code & order button.',
      icon: Utensils,
      color: 'from-amber-600 to-yellow-800 text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'luxury_fashion',
      name: 'Luxury Fragrance & Fashion',
      badge: 'Luxury & Beauty',
      description: 'Marble display pedestal with gold halo lights, floating perfume bottle & collection button.',
      icon: Crown,
      color: 'from-yellow-600 to-amber-800 text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    },
    {
      id: 'real_estate',
      name: 'Architectural Villa & Property',
      badge: 'Real Estate',
      description: '3D penthouse villa model on dark glass stage, interactive amenity hotspots & booking button.',
      icon: Building2,
      color: 'from-blue-600 to-indigo-800 text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'business_card',
      name: 'AR Business Card & Identity',
      badge: 'Networking',
      description: 'Interactive social identity card with contact buttons, website links, and video pitch reel.',
      icon: UserIcon,
      color: 'from-indigo-600 to-purple-800 text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      id: 'educational',
      name: 'Spatial Interactive Journey',
      badge: 'Education',
      description: 'Interactive spatial solar orbit with spinning Earth core, floating satellite, and annotated labels.',
      icon: GraduationCap,
      color: 'from-purple-600 to-pink-800 text-purple-400 bg-purple-500/10 border-purple-500/20'
    }
  ];

  const filteredProjects = projectsList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      addToast('Please enter a project name');
      return;
    }

    const createdId = createProject(newProjectName.trim(), selectedTemplate);
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
              {templates.map((tpl) => {
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
                        <Icon size={20} />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">{tpl.name}</h4>
                      <p className={`text-xs leading-relaxed ${t.isLight ? 'text-gray-500' : 'text-[#888]'}`}>
                        {tpl.description}
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
                return (
                  <motion.div
                    key={proj.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group hover:shadow-xl ${
                      t.isLight ? 'bg-white border-gray-200 hover:border-blue-400' : 'bg-[#141418] border-[#22222A] hover:border-[#333342]'
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                          <Folder size={18} />
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setRenamingProjectId(proj.id);
                              setRenameValue(proj.name);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
                            title="Rename"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(proj.id, proj.name)}
                            className="p-1.5 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => handleExport(proj.id, proj.name)}
                            className="p-1.5 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-purple-400 transition-colors cursor-pointer"
                            title="Export JSON"
                          >
                            <FileDown size={14} />
                          </button>
                          <button
                            onClick={() => setProjectToDelete({ id: proj.id, name: proj.name })}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
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

                      <div className={`flex items-center gap-3 text-xs mb-4 ${t.isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'Recent'}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
                          {proj.id.substring(0, 12)}...
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <button
                      onClick={() => handleOpenProject(proj.id)}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20 hover:border-blue-600 transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                    >
                      <span>Open in Editor</span>
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

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
