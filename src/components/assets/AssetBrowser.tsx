import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { v4 as uuidv4 } from 'uuid';
import { MarkerManagerModal } from '../toolbar/MarkerManagerModal';
import { 
  Image as ImageIcon, 
  Video, 
  Box, 
  FileCode, 
  Upload, 
  Trash2, 
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
  Play
} from 'lucide-react';
import { Asset, AssetType, SceneObject } from '../../types';

// Premium high-quality stable GLB presets for instant AR experience
const PRESET_MODELS = [
  {
    id: 'p-model-astronaut',
    name: 'Astronaut',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    thumbnail: '🚀',
    description: 'Classic zero-gravity space explorer',
  },
  {
    id: 'p-model-car',
    name: 'Toy Retro Car',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb',
    thumbnail: '🚗',
    description: 'Highly detailed vintage toy car',
  },
  {
    id: 'p-model-robot',
    name: 'Expressive Robot',
    type: 'model' as AssetType,
    url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    thumbnail: '🤖',
    description: 'Robot with animated face panels',
  },
  {
    id: 'p-model-vase',
    name: 'Bronze Vase',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/VaseBronze/glTF-Binary/VaseBronze.glb',
    thumbnail: '🏺',
    description: 'Ancient bronze museum artifact',
  },
  {
    id: 'p-model-lantern',
    name: 'Vintage Lantern',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Lantern/glTF-Binary/Lantern.glb',
    thumbnail: '🏮',
    description: 'Detailed classic light container',
  },
  {
    id: 'p-model-shoe',
    name: 'E-Comm Sneaker',
    type: 'model' as AssetType,
    url: 'https://modelviewer.dev/shared-assets/models/MaterialsVariantsShoe.glb',
    thumbnail: '👟',
    description: 'E-commerce style athletic shoe',
  }
];

// Certified high-contrast tracking images for robust image targeting
const PRESET_MARKERS = [
  {
    id: 'p-marker-magazine',
    name: 'Magazine Cover',
    type: 'image' as AssetType,
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    description: 'High contrast text & graphics (Tracking: 95/100)',
    rating: 95,
  },
  {
    id: 'p-marker-abstract',
    name: 'Abstract Art',
    type: 'image' as AssetType,
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    description: 'Complex geometric structures (Tracking: 88/100)',
    rating: 88,
  },
  {
    id: 'p-marker-map',
    name: 'Contour Map',
    type: 'image' as AssetType,
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop',
    description: 'Topographic contour line grids (Tracking: 94/100)',
    rating: 94,
  },
  {
    id: 'p-marker-blueprint',
    name: 'Blueprint Grid',
    type: 'image' as AssetType,
    url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600&auto=format&fit=crop',
    description: 'High frequency technical details (Tracking: 91/100)',
    rating: 91,
  }
];

// SFX files for interactive triggers
const PRESET_SOUNDS = [
  {
    id: 'p-sound-click',
    name: 'Cyber Click',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
    thumbnail: '🎵',
    description: 'Clean futuristic electronic tap feedback',
  },
  {
    id: 'p-sound-success',
    name: 'Success Ring',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav',
    thumbnail: '✨',
    description: 'Shimmering positive response chime',
  },
  {
    id: 'p-sound-beep',
    name: 'Tech Beep',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/1601/1601-84.wav',
    thumbnail: '🤖',
    description: 'Short high-pitch computer processing tone',
  },
  {
    id: 'p-sound-ambient',
    name: 'Nature Ambient',
    type: 'audio' as AssetType,
    url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-84.wav',
    thumbnail: '🌲',
    description: 'Gentle organic wilderness backdrop loop',
  }
];

// Interactive structural and transform behaviors
const PRESET_BEHAVIORS = [
  {
    id: 'p-behavior-spin',
    name: 'Continuous Spin',
    type: 'behavior' as AssetType,
    value: 'spin',
    thumbnail: '🔄',
    description: 'Smooth full 360-degree rotation on Y-axis',
  },
  {
    id: 'p-behavior-hover',
    name: 'Gentle Float',
    type: 'behavior' as AssetType,
    value: 'hover',
    thumbnail: '🎈',
    description: 'Levitates gently up/down on a sine wave',
  },
  {
    id: 'p-behavior-pulse',
    name: 'Rhythmic Pulse',
    type: 'behavior' as AssetType,
    value: 'pulse',
    thumbnail: '💓',
    description: 'Slightly expands and contracts scale',
  }
];

type CategoryTab = 'uploads' | 'models' | 'markers' | 'audio' | 'behaviors';

export function AssetBrowser() {
  const { 
    assets, 
    addAsset, 
    removeAsset, 
    updateAsset, 
    addObject, 
    selectedObjectId, 
    objects,
    updateObject
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<CategoryTab>('uploads');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [showMarkerManager, setShowMarkerManager] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const name = file.name;
    
    let type: AssetType = 'script';
    if (name.endsWith('.glb') || name.endsWith('.gltf')) type = 'model';
    else if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';

    const asset: Asset = {
      id: uuidv4(),
      name,
      type,
      url,
    };

    addAsset(asset);
    showToast(`Uploaded asset: ${name}`);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getIcon = (type: AssetType) => {
    switch (type) {
      case 'model': return <Box size={24} className="text-blue-400" />;
      case 'image': return <ImageIcon size={24} className="text-green-400" />;
      case 'video': return <Video size={24} className="text-purple-400" />;
      case 'script': return <FileCode size={24} className="text-yellow-400" />;
      case 'audio': return <Music size={24} className="text-pink-400" />;
      case 'behavior': return <Zap size={24} className="text-orange-400" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, asset: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleUseAsset = (asset: any) => {
    if (asset.type === 'model') {
      let parentId = selectedObjectId;
      if (!parentId) {
        const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
        if (imageTarget) parentId = imageTarget.id;
      }
      
      const newObj: SceneObject = {
        id: uuidv4(),
        name: asset.name.split('.')[0],
        type: 'model',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
        parentId: parentId || null,
        properties: {
          url: asset.url
        }
      };
      
      addObject(newObj, parentId || undefined);
      showToast(`Added 3D model "${newObj.name}" to the scene.`);
    } else if (asset.type === 'image') {
      const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
      if (imageTarget) {
        updateObject(imageTarget.id, {
          properties: {
            ...imageTarget.properties,
            textureUrl: asset.url
          }
        });
        showToast(`Set "${asset.name}" as Active tracking marker.`);
      } else {
        showToast("Error: No ImageTarget found in the scene.");
      }
    } else if (asset.type === 'audio') {
      // Play a quick audio preview
      const preview = new Audio(asset.url);
      preview.volume = 0.4;
      preview.play().catch(err => console.log('Audio playback preview failed', err));

      if (selectedObjectId && objects[selectedObjectId]) {
        updateObject(selectedObjectId, {
          properties: {
            ...objects[selectedObjectId].properties,
            soundUrl: asset.url,
            soundName: asset.name
          }
        });
        showToast(`Attached Sound "${asset.name}" to Selected Object "${objects[selectedObjectId].name}".`);
      } else {
        showToast(`Playing sound preview: ${asset.name}. Select a Scene Object to attach it!`);
      }
    } else if (asset.type === 'behavior') {
      if (selectedObjectId && objects[selectedObjectId]) {
        updateObject(selectedObjectId, {
          properties: {
            ...objects[selectedObjectId].properties,
            behavior: asset.value
          }
        });
        showToast(`Applied behavior "${asset.name}" to "${objects[selectedObjectId].name}".`);
      } else {
        showToast(`Select a Scene Object first to assign the "${asset.name}" behavior!`);
      }
    }
  };

  const startEditing = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(currentName);
  };

  const finishEditing = () => {
    if (editingId && editValue.trim() !== '') {
      updateAsset(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className="h-full border-t border-[#2A2A2A] bg-[#111111] flex flex-col relative select-none">
      {/* Toast Notification popup */}
      {notification && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg border border-blue-500/20 z-50 flex items-center gap-1.5 animate-bounce">
          <Sparkles size={12} />
          {notification}
        </div>
      )}

      {/* Header bar */}
      <div className="h-9 border-b border-[#2A2A2A] bg-[#161616] flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-blue-500" />
          <span className="text-xs font-semibold text-[#CCC]">AR Assets Studio</span>
        </div>
        
        {/* Upload & Marker Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowMarkerManager(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1E293B] hover:bg-blue-600 border border-blue-900/40 hover:border-blue-500 rounded text-[11px] text-[#93C5FD] hover:text-white font-medium transition-all cursor-pointer shadow-sm"
            title="Manage and analyze tracking print marker"
          >
            <ImageIcon size={12} className="text-blue-400 shrink-0" />
            Marker Manager
          </button>
          <button 
            onClick={handleUploadClick}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#222] hover:bg-blue-600 border border-[#333] hover:border-blue-500 rounded text-[11px] text-white font-medium transition-all"
            title="Upload GLB, PNG, MP4, MP3 or JS files"
          >
            <Upload size={12} />
            Import Asset
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".glb,.gltf,image/*,video/*,audio/*,.js"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav categories */}
        <div className="w-40 bg-[#141414] border-r border-[#2A2A2A] flex flex-col py-1 overflow-y-auto shrink-0 font-sans text-xs">
          <button 
            onClick={() => setActiveTab('uploads')}
            className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${activeTab === 'uploads' ? 'bg-[#222] text-white border-l-2 border-blue-500' : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'}`}
          >
            <Upload size={13} className="text-gray-400" />
            <span>My Uploads</span>
            <span className="ml-auto bg-[#2A2A2A] text-[#888] text-[9px] px-1.5 py-0.5 rounded-full font-mono">
              {assets.length}
            </span>
          </button>

          <div className="border-t border-[#222] my-1 mx-2"></div>
          <span className="px-3 py-1 text-[9px] font-bold text-[#555] uppercase tracking-wider">Presets Library</span>

          <button 
            onClick={() => setActiveTab('models')}
            className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${activeTab === 'models' ? 'bg-[#222] text-white border-l-2 border-blue-500' : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'}`}
          >
            <Box size={13} className="text-blue-400" />
            <span>3D Models</span>
          </button>

          <button 
            onClick={() => setActiveTab('markers')}
            className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${activeTab === 'markers' ? 'bg-[#222] text-white border-l-2 border-blue-500' : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'}`}
          >
            <ImageIcon size={13} className="text-green-400" />
            <span>AR Markers</span>
          </button>

          <button 
            onClick={() => setActiveTab('audio')}
            className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${activeTab === 'audio' ? 'bg-[#222] text-white border-l-2 border-blue-500' : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'}`}
          >
            <Music size={13} className="text-pink-400" />
            <span>Audio & SFX</span>
          </button>

          <button 
            onClick={() => setActiveTab('behaviors')}
            className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${activeTab === 'behaviors' ? 'bg-[#222] text-white border-l-2 border-blue-500' : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'}`}
          >
            <Zap size={13} className="text-orange-400" />
            <span>Behaviors</span>
          </button>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0A0A0A]">
          
          {/* UPLOADS TAB */}
          {activeTab === 'uploads' && (
            <div className="flex flex-wrap gap-4 content-start h-full">
              {assets.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#555] gap-2 border-2 border-dashed border-[#222] rounded-lg">
                  <Upload size={28} className="text-[#333]" />
                  <p className="text-xs">No custom assets. Import a 3D model or target image to begin.</p>
                  <button 
                    onClick={handleUploadClick}
                    className="mt-1 px-3 py-1 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-[11px] text-[#888] hover:text-white rounded transition-colors"
                  >
                    Select File
                  </button>
                </div>
              ) : (
                assets.map(asset => (
                  <div 
                    key={asset.id}
                    draggable={editingId !== asset.id}
                    onDragStart={(e) => handleDragStart(e, asset)}
                    onDoubleClick={() => handleUseAsset(asset)}
                    className="w-24 h-28 bg-[#141414] border border-[#222] hover:border-blue-500 rounded flex flex-col items-center p-2 cursor-pointer hover:bg-[#1A1A1A] transition-all group relative shadow"
                    title={`${asset.name} - Double-click to apply`}
                  >
                    <div className="flex-1 w-full flex items-center justify-center overflow-hidden rounded bg-black/40 mb-1">
                      {asset.type === 'image' ? (
                        <img src={asset.url} alt={asset.name} className="w-12 h-12 object-contain" />
                      ) : (
                        getIcon(asset.type)
                      )}
                    </div>
                    
                    {editingId === asset.id ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-black text-white text-[10px] border border-blue-500 rounded px-1 outline-none text-center"
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-[10px] text-[#999] text-center w-full truncate font-sans group-hover:text-white" onDoubleClick={(e) => startEditing(e, asset.id, asset.name)}>
                        {asset.name}
                      </span>
                    )}

                    {/* Actions panel overlay */}
                    {editingId !== asset.id && (
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all bg-[#141414]/90 p-0.5 rounded shadow">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                          title="Delete"
                        >
                          <Trash2 size={10} />
                        </button>
                        <button
                          onClick={(e) => startEditing(e, asset.id, asset.name)}
                          className="p-1 hover:bg-blue-500/20 text-blue-400 rounded"
                          title="Rename"
                        >
                          <Edit2 size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3D MODELS TAB */}
          {activeTab === 'models' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 content-start">
              {PRESET_MODELS.map(model => (
                <div 
                  key={model.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, model)}
                  onDoubleClick={() => handleUseAsset(model)}
                  className="bg-[#141414] border border-[#222] hover:border-blue-500 rounded p-3 flex flex-col items-start gap-1 cursor-grab hover:bg-[#1A1A1A] transition-all group relative"
                  title="Drag into the scene or Double-click to spawn"
                >
                  <div className="w-full aspect-square flex items-center justify-center bg-black/40 rounded text-2xl mb-1 relative overflow-hidden">
                    <span className="group-hover:scale-125 transition-transform">{model.thumbnail}</span>
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus size={20} className="text-blue-400" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white truncate w-full">{model.name}</span>
                  <p className="text-[9px] text-[#666] leading-snug h-6 overflow-hidden line-clamp-2 w-full">{model.description}</p>
                  
                  <button 
                    onClick={() => handleUseAsset(model)}
                    className="mt-2 w-full text-center bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold py-1 rounded transition-colors"
                  >
                    Add to Scene
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* MARKERS TAB */}
          {activeTab === 'markers' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 content-start">
              {PRESET_MARKERS.map(marker => (
                <div 
                  key={marker.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, marker)}
                  onDoubleClick={() => handleUseAsset(marker)}
                  className="bg-[#141414] border border-[#222] hover:border-green-500 rounded p-2.5 flex flex-col gap-1 cursor-grab hover:bg-[#1A1A1A] transition-all group relative"
                  title="Drag to the Viewport or Double-click to set tracking marker"
                >
                  <div className="w-full aspect-[4/3] overflow-hidden rounded bg-black/40 relative">
                    <img src={marker.url} alt={marker.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-1.5 right-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-bold text-green-400 flex items-center gap-0.5">
                      ★ {marker.rating}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white mt-1">{marker.name}</span>
                  <p className="text-[9px] text-[#666] leading-snug w-full">{marker.description}</p>
                  
                  <button 
                    onClick={() => handleUseAsset(marker)}
                    className="mt-1 w-full text-center bg-[#222] hover:bg-green-600 border border-[#333] hover:border-green-500 text-white text-[10px] font-semibold py-1 rounded transition-colors"
                  >
                    Set as Active Target
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AUDIO TAB */}
          {activeTab === 'audio' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 content-start">
              {PRESET_SOUNDS.map(sound => {
                const hasSelected = !!selectedObjectId;
                return (
                  <div 
                    key={sound.id}
                    onDoubleClick={() => handleUseAsset(sound)}
                    className="bg-[#141414] border border-[#222] hover:border-pink-500 rounded p-3 flex flex-col gap-1 cursor-pointer hover:bg-[#1A1A1A] transition-all group relative"
                    title="Double-click to preview sound / Attach to selected object"
                  >
                    <div className="w-full h-14 flex items-center justify-center bg-black/40 rounded text-xl mb-1 relative overflow-hidden">
                      <span className="group-hover:rotate-12 transition-transform">{sound.thumbnail}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUseAsset(sound); }}
                        className="absolute inset-0 bg-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Play size={16} className="text-pink-400 fill-pink-400/20" />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-white truncate w-full">{sound.name}</span>
                    <p className="text-[9px] text-[#666] leading-snug h-6 overflow-hidden line-clamp-2 w-full">{sound.description}</p>
                    
                    <button 
                      onClick={() => handleUseAsset(sound)}
                      className={`mt-2 w-full text-center text-[10px] font-semibold py-1 rounded transition-colors border ${hasSelected ? 'bg-pink-600 hover:bg-pink-500 border-pink-500 text-white' : 'bg-[#222] hover:bg-[#333] border-[#333] text-[#888]'}`}
                    >
                      {hasSelected ? 'Attach to Selected' : 'Preview Sound'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* BEHAVIORS TAB */}
          {activeTab === 'behaviors' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 content-start">
              {PRESET_BEHAVIORS.map(behavior => {
                const hasSelected = !!selectedObjectId;
                return (
                  <div 
                    key={behavior.id}
                    onDoubleClick={() => handleUseAsset(behavior)}
                    className="bg-[#141414] border border-[#222] hover:border-orange-500 rounded p-3 flex gap-3 cursor-pointer hover:bg-[#1A1A1A] transition-all group relative"
                    title="Double-click to assign this visual effect rule to selected element"
                  >
                    <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-black/40 rounded text-xl relative overflow-hidden">
                      <span className="group-hover:scale-125 transition-transform">{behavior.thumbnail}</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {behavior.name}
                          <span className="bg-orange-500/10 text-orange-400 text-[8px] font-mono px-1 rounded uppercase">Live R3F</span>
                        </span>
                        <p className="text-[9px] text-[#666] leading-snug w-full mt-0.5">{behavior.description}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleUseAsset(behavior)}
                        className={`mt-2 text-left text-[10px] font-semibold py-1 px-2.5 rounded transition-colors self-start border ${hasSelected ? 'bg-orange-600 hover:bg-orange-500 border-orange-500 text-white' : 'bg-[#222] hover:bg-[#333] border-[#333] text-[#888]'}`}
                      >
                        {hasSelected ? 'Apply Behavior' : 'Select Object first'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
      {showMarkerManager && <MarkerManagerModal onClose={() => setShowMarkerManager(false)} />}
    </div>
  );
}
