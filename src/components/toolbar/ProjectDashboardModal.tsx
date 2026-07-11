import React, { useState, useRef } from 'react';
import { 
  X, Plus, Trash2, Copy, FileDown, FileUp, Folder, Calendar, ArrowRight, Sparkles, 
  Layers, User, ShoppingBag, GraduationCap, Check, AlertTriangle, Upload
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

interface ProjectDashboardModalProps {
  onClose: () => void;
}

export function ProjectDashboardModal({ onClose }: ProjectDashboardModalProps) {
  const {
    currentProjectId,
    projectsList,
    createProject,
    loadProject,
    deleteProject,
    duplicateProject,
    importProject,
    addToast
  } = useEditorStore();

  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'empty' | 'business_card' | 'product_showcase' | 'educational'>('empty');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = [
    {
      id: 'empty',
      name: 'Empty Scene',
      description: 'A clean slate with a single trackable Image Target to place models.',
      icon: Layers,
      color: 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    },
    {
      id: 'business_card',
      name: 'AR Business Card',
      description: 'Interactive social card with contact details, links, and profile videos.',
      icon: User,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'product_showcase',
      name: 'Product Showcase',
      description: 'Interactive product demo with price tag, order buttons, and visual animations.',
      icon: ShoppingBag,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'educational',
      name: 'Educational Simulation',
      description: 'Spatial orbits demo with structural grouping and educational labeling.',
      icon: GraduationCap,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    }
  ];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      addToast('Please enter a project name');
      return;
    }

    const createdId = createProject(newProjectName.trim(), selectedTemplate);
    addToast(`Project "${newProjectName.trim()}" created successfully!`);
    setNewProjectName('');
    onClose();
  };

  const handleSelectProject = (id: string) => {
    loadProject(id);
    addToast('Project loaded successfully');
    onClose();
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      const proj = projectsList.find(p => p.id === projectToDelete);
      if (proj) {
        setIsDeleting(true);
        try {
          const { SupabaseService } = await import('../../services/supabaseService');
          if (SupabaseService.isConfigured()) {
            const assetUrls: string[] = [];
            const savedDataStr = localStorage.getItem(`ar_forge_project_${proj.id}`);
            if (savedDataStr) {
              const parsed = JSON.parse(savedDataStr);
              if (parsed.assets && Array.isArray(parsed.assets)) {
                parsed.assets.forEach((asset: any) => {
                  if (asset.url) assetUrls.push(asset.url);
                });
              }
            }

            // Centralized cleanup of database entry and associated storage assets
            await SupabaseService.deleteProject(proj.id, proj.name, assetUrls);
          }
        } catch (err) {
          console.error("Cleanup error:", err);
        }
        deleteProject(projectToDelete);
        addToast(`Project "${proj.name}" and its resources deleted`);
        setProjectToDelete(null);
        setIsDeleting(false);
      }
    }
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
      addToast(`Project "${name}" exported successfully`);
    } catch (e) {
      console.error(e);
      addToast('Export failed');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
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
          addToast('Project imported and loaded successfully');
          onClose();
        } else {
          addToast('Failed to import: Invalid project file format');
        }
      } catch (err) {
        addToast('Failed to read project file');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // clear input
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] w-full max-w-4xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222222] flex items-center justify-between bg-[#181818] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-500">
              <Folder size={18} />
            </div>
            <div>
              <h2 className="text-sm uppercase font-bold tracking-widest text-[#FFF]">Local Project Manager</h2>
              <p className="text-[11px] text-[#777]">Create, switch, clone, backup and manage your local AR scenes</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#2A2A2A] rounded-lg text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Outer Split Pane Layout */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Side: Create / Templates */}
          <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-[#222222] p-6 overflow-y-auto space-y-5 bg-[#171717]/40 shrink-0">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">New Project Starter</h3>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#888]">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Interactive Smart Card"
                  className="w-full bg-[#1C1C1C] border border-[#2D2D2D] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#888]">Choose a Scene Template</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {templates.map((tpl) => {
                    const Icon = tpl.icon;
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        type="button"
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id as any)}
                        className={`text-left p-3 rounded-xl border transition-all flex gap-3 cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-600/10 border-blue-500/40' 
                            : 'bg-[#181818] border-[#252525] hover:border-[#333333]'
                        }`}
                      >
                        <div className={`p-2 rounded-lg border h-fit shrink-0 ${tpl.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h4 className={`text-xs font-bold ${isSelected ? 'text-blue-400' : 'text-[#CCC]'}`}>{tpl.name}</h4>
                            {isSelected && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded uppercase font-bold">Selected</span>}
                          </div>
                          <p className="text-[10px] text-[#777] leading-relaxed">{tpl.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Plus size={14} />
                Create New Project
              </button>
            </form>
          </div>

          {/* Right Side: Existing Projects List */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#999] flex items-center gap-1.5">
                <Folder size={14} />
                Saved Projects List ({projectsList.length})
              </h3>
              
              {/* Import Action */}
              <button
                onClick={handleImportClick}
                className="flex items-center gap-1.5 px-2.5 py-1.2 bg-[#1A1A1A] hover:bg-[#222] text-[#AAA] hover:text-white border border-[#2D2D2D] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                title="Import/restore a project JSON file"
              >
                <FileUp size={13} className="text-blue-400" />
                Import Project
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
            </div>

            {/* List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
              {projectsList.map((project) => {
                const isActive = project.id === currentProjectId;
                return (
                  <div
                    key={project.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      isActive 
                        ? 'bg-[#1C2433] border-blue-500/30 shadow-inner' 
                        : 'bg-[#181818] border-[#252525] hover:border-[#333333]'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-[#555]'}`}></span>
                        <h4 className={`text-xs font-bold truncate ${isActive ? 'text-blue-400' : 'text-[#CCC]'}`}>
                          {project.name}
                        </h4>
                        {isActive && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded uppercase font-bold">Active</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[#666]">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          Updated: {new Date(project.updatedAt).toLocaleDateString()} at {new Date(project.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      {!isActive && (
                        <button
                          onClick={() => handleSelectProject(project.id)}
                          className="px-2.5 py-1.2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Open this project in the workspace"
                        >
                          Open
                          <ArrowRight size={12} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDuplicate(project.id, project.name)}
                        className="p-1.5 bg-[#202020] hover:bg-[#2A2A2A] text-[#888] hover:text-white border border-[#2A2A2A] rounded-lg transition-colors cursor-pointer"
                        title="Clone project"
                      >
                        <Copy size={13} />
                      </button>

                      <button
                        onClick={() => handleExport(project.id, project.name)}
                        className="p-1.5 bg-[#202020] hover:bg-[#2A2A2A] text-[#888] hover:text-white border border-[#2A2A2A] rounded-lg transition-colors cursor-pointer"
                        title="Backup / Export to JSON"
                      >
                        <FileDown size={13} />
                      </button>

                      <button
                        onClick={() => setProjectToDelete(project.id)}
                        className="p-1.5 bg-[#202020] hover:bg-red-500/15 text-[#888] hover:text-red-400 border border-[#2A2A2A] hover:border-red-500/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* Confirmation Modal overlay inside */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-[#000000]/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#333333] p-5 rounded-xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex gap-3 text-red-400">
              <AlertTriangle className="shrink-0" size={20} />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Delete Project?</h4>
                <p className="text-xs text-[#888] leading-normal">
                  Are you absolutely sure you want to delete <span className="text-red-400 font-bold">"{projectsList.find(p => p.id === projectToDelete)?.name}"</span>? This will permanently erase the 3D scene from browser storage and cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#252525]">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className={`px-3.5 py-1.5 bg-transparent hover:bg-[#252525] text-xs font-bold rounded-lg text-[#AAA] hover:text-white ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Keep Project
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className={`px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-xs font-bold rounded-lg text-white ${isDeleting ? 'opacity-50 cursor-not-allowed flex items-center gap-2' : 'cursor-pointer'}`}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
