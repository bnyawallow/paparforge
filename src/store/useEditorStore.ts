import { useAuthStore } from './useAuthStore';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { EditorState, SceneObject, HistorySnapshot, ProjectVersion } from '../types';

const getStorageKey = (key: string) => {
  const user = useAuthStore.getState().user;
  return user ? `${user.id}_${key}` : key;
};

const loadVersionsForProject = (projectId: string): ProjectVersion[] => {
  try {
    const data = localStorage.getItem(getStorageKey(`ar_forge_versions_${projectId}`));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveVersionsForProject = (projectId: string, versions: ProjectVersion[]) => {
  try {
    localStorage.setItem(getStorageKey(`ar_forge_versions_${projectId}`), JSON.stringify(versions));
  } catch (e) {
    console.error('Failed to save version snapshots:', e);
  }
};

const initialImageTargetId = uuidv4();

const defaultScene: Record<string, SceneObject> = {
  [initialImageTargetId]: {
    id: initialImageTargetId,
    name: 'Image Target',
    type: 'imageTarget',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true,
    locked: true,
    children: [],
    parentId: null,
    properties: {
      physicalWidth: 0.1, // 10cm default
    }
  }
};

// Generate template scenes to allow quick prototyping
export const generateTemplate = (projectName: string, templateType: 'empty' | 'business_card' | 'product_showcase' | 'educational') => {
  const imageTargetId = uuidv4();
  const objects: Record<string, SceneObject> = {
    [imageTargetId]: {
      id: imageTargetId,
      name: 'Image Target',
      type: 'imageTarget',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: true,
      children: [],
      parentId: null,
      properties: {
        physicalWidth: 0.1, // 10cm default
      }
    }
  };
  const rootObjects = [imageTargetId];

  if (templateType === 'business_card') {
    // Add business card box
    const cardId = uuidv4();
    const textNameId = uuidv4();
    const btnId = uuidv4();
    const ytId = uuidv4();

    objects[imageTargetId].children = [cardId];
    objects[cardId] = {
      id: cardId,
      name: 'Business Card Panel',
      type: 'box',
      position: [0, 0, 0.01],
      rotation: [0, 0, 0],
      scale: [1.2, 0.8, 0.02],
      visible: true,
      children: [textNameId, btnId, ytId],
      parentId: imageTargetId,
      properties: { color: '#111827' }
    };

    objects[textNameId] = {
      id: textNameId,
      name: 'Name Text',
      type: 'text',
      position: [-0.3, 0.2, 0.03],
      rotation: [0, 0, 0],
      scale: [0.5, 0.5, 0.5],
      visible: true,
      children: [],
      parentId: cardId,
      properties: { text: 'Alex Carter\nCreative Developer', color: '#60a5fa' }
    };

    objects[btnId] = {
      id: btnId,
      name: 'Portfolio Link',
      type: 'button',
      position: [-0.3, -0.15, 0.03],
      rotation: [0, 0, 0],
      scale: [0.4, 0.1, 0.02],
      visible: true,
      children: [],
      parentId: cardId,
      properties: { text: 'Visit Website', color: '#2563eb', url: 'https://example.com' }
    };

    objects[ytId] = {
      id: ytId,
      name: 'Intro Video',
      type: 'youtube',
      position: [0.25, 0, 0.03],
      rotation: [0, 0, 0],
      scale: [0.5, 0.28, 0.5],
      visible: true,
      children: [],
      parentId: cardId,
      properties: { videoId: 'dQw4w9WgXcQ' }
    };
  } else if (templateType === 'product_showcase') {
    const pGroupId = uuidv4();
    const sphereId = uuidv4();
    const textPriceId = uuidv4();
    const btnBuyId = uuidv4();

    objects[imageTargetId].children = [pGroupId];
    objects[pGroupId] = {
      id: pGroupId,
      name: 'Product Group',
      type: 'group',
      position: [0, 0, 0.2],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [sphereId, textPriceId, btnBuyId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[sphereId] = {
      id: sphereId,
      name: 'Product Model Sphere',
      type: 'sphere',
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
      scale: [0.3, 0.3, 0.3],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: { color: '#ef4444' }
    };

    objects[textPriceId] = {
      id: textPriceId,
      name: 'Product Label',
      type: 'text',
      position: [0, 0.4, 0],
      rotation: [0, 0, 0],
      scale: [0.4, 0.4, 0.4],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: { text: 'Fusion Sphere XT\n$199.99', color: '#10b981' }
    };

    objects[btnBuyId] = {
      id: btnBuyId,
      name: 'Buy Button',
      type: 'button',
      position: [0, -0.2, 0],
      rotation: [0, 0, 0],
      scale: [0.4, 0.1, 0.02],
      visible: true,
      children: [],
      parentId: pGroupId,
      properties: { text: 'Order Now', color: '#ef4444', url: 'https://example.com' }
    };
  } else if (templateType === 'educational') {
    const parentGroupId = uuidv4();
    const earthId = uuidv4();
    const satelliteId = uuidv4();
    const labelId = uuidv4();

    objects[imageTargetId].children = [parentGroupId];
    objects[parentGroupId] = {
      id: parentGroupId,
      name: 'Solar Demo Group',
      type: 'group',
      position: [0, 0, 0.15],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [earthId, satelliteId, labelId],
      parentId: imageTargetId,
      properties: {}
    };

    objects[earthId] = {
      id: earthId,
      name: 'Earth Core Sphere',
      type: 'sphere',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [0.4, 0.4, 0.4],
      visible: true,
      children: [],
      parentId: parentGroupId,
      properties: { color: '#3b82f6' }
    };

    objects[satelliteId] = {
      id: satelliteId,
      name: 'Orbiting Satellite',
      type: 'box',
      position: [0.5, 0.2, 0.2],
      rotation: [15, 45, 0],
      scale: [0.1, 0.1, 0.15],
      visible: true,
      children: [],
      parentId: parentGroupId,
      properties: { color: '#9ca3af' }
    };

    objects[labelId] = {
      id: labelId,
      name: 'Orbit Label',
      type: 'text',
      position: [0, -0.4, 0],
      rotation: [0, 0, 0],
      scale: [0.4, 0.4, 0.4],
      visible: true,
      children: [],
      parentId: parentGroupId,
      properties: { text: 'Low Earth Orbit (LEO) Simulation', color: '#ffffff' }
    };
  }

  return { objects, rootObjects };
};

const normalizeSceneHierarchyAndLockImageTarget = (objects: Record<string, SceneObject>, rootObjects?: string[]) => {
  if (!objects || Object.keys(objects).length === 0) {
    const imageTargetId = uuidv4();
    const defaultImageTarget: SceneObject = {
      id: imageTargetId,
      name: 'Image Target',
      type: 'imageTarget',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: true,
      children: [],
      parentId: null,
      properties: { physicalWidth: 0.1 }
    };
    return {
      objects: { [imageTargetId]: defaultImageTarget },
      rootObjects: [imageTargetId]
    };
  }

  const updatedObjects: Record<string, SceneObject> = {};
  
  // 1. Shallow copy & legacy type conversions
  Object.keys(objects).forEach(id => {
    if (!objects[id]) return;
    const obj = { ...objects[id] };
    
    if (obj.type === 'imageTarget') {
      obj.locked = true;
    }

    const typeStr = obj.type as string;
    if (typeStr === 'overlay2d') { obj.type = 'hudCanvas'; }
    else if (typeStr === 'overlayText') { obj.type = 'hudText'; }
    else if (typeStr === 'overlayButton') { obj.type = 'hudButton'; }
    else if (typeStr === 'overlayImage') { obj.type = 'hudImage'; }
    else if (typeStr === 'overlayEmbed') { obj.type = 'hudEmbed'; }

    if (obj.name && obj.name.includes('Overlay')) {
      obj.name = obj.name.replace(/Overlay/g, 'HUD');
    }

    obj.children = []; // Rebuild children deterministically
    updatedObjects[id] = obj;
  });

  // 2. Ensure imageTarget exists
  let imageTarget = Object.values(updatedObjects).find(o => o.type === 'imageTarget');
  if (!imageTarget) {
    const imageTargetId = uuidv4();
    imageTarget = {
      id: imageTargetId,
      name: 'Image Target',
      type: 'imageTarget',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: true,
      children: [],
      parentId: null,
      properties: { physicalWidth: 0.1 }
    };
    updatedObjects[imageTargetId] = imageTarget;
  }

  // 3. Ensure default hudCanvas exists if there are HUD elements
  const HUD_ELEMENT_TYPES = ['hudText', 'hudButton', 'hudImage', 'hudEmbed'];
  const hasHudElements = Object.values(updatedObjects).some(o => HUD_ELEMENT_TYPES.includes(o.type));
  let defaultHudCanvas = Object.values(updatedObjects).find(o => o.type === 'hudCanvas');

  if (hasHudElements && !defaultHudCanvas) {
    const canvasId = uuidv4();
    defaultHudCanvas = {
      id: canvasId,
      name: 'HUD Canvas',
      type: 'hudCanvas',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      children: [],
      parentId: null,
      properties: {
        layoutMode: 'column',
        layoutAlignItems: 'center',
        layoutJustifyContent: 'center',
        backgroundColor: '#1c1917',
        opacity: 0.85,
        layoutPadding: 16,
        layoutGap: 8,
        themeBorderRadius: 12,
        themeBlur: 4,
      }
    };
    updatedObjects[canvasId] = defaultHudCanvas;
  }

  // 4. Validate & assign parentId for all objects according to strict rules:
  // - imageTarget and hudCanvas MUST have parentId: null (placed at root)
  // - HUD elements MUST be parented by a hudCanvas
  // - All other objects MUST be children of active imageTarget (or a descendant of imageTarget)
  Object.keys(updatedObjects).forEach(id => {
    const obj = updatedObjects[id];

    if (obj.type === 'imageTarget' || obj.type === 'hudCanvas') {
      obj.parentId = null;
    } else if (HUD_ELEMENT_TYPES.includes(obj.type)) {
      const currentParent = obj.parentId ? updatedObjects[obj.parentId] : null;
      if (!currentParent || currentParent.type !== 'hudCanvas') {
        obj.parentId = defaultHudCanvas ? defaultHudCanvas.id : null;
      }
    } else {
      // Non-HUD / 3D element: check if current parent is valid (not null, not hudCanvas, and exists)
      const currentParent = obj.parentId ? updatedObjects[obj.parentId] : null;
      if (!currentParent || currentParent.type === 'hudCanvas' || currentParent.id === obj.id) {
        obj.parentId = imageTarget!.id;
      }
    }
  });

  // 5. Rebuild children arrays & rootObjects array
  const updatedRootObjects: string[] = [];
  if (updatedObjects[imageTarget.id]) {
    updatedRootObjects.push(imageTarget.id);
  }

  Object.keys(updatedObjects).forEach(id => {
    const obj = updatedObjects[id];
    if (obj.parentId && updatedObjects[obj.parentId]) {
      updatedObjects[obj.parentId].children.push(id);
    } else {
      if (!updatedRootObjects.includes(id)) {
        updatedRootObjects.push(id);
      }
    }
  });

  return { objects: updatedObjects, rootObjects: updatedRootObjects };
};

const ensureImageTargetLocked = (objects: Record<string, SceneObject>) => {
  return normalizeSceneHierarchyAndLockImageTarget(objects).objects;
};


const sanitizeBlobUrls = (data: any) => {
  if (!data) return data;
  if (typeof data === 'string') {
    if (data.startsWith('blob:')) return '';
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeBlobUrls(item));
  }
  if (typeof data === 'object') {
    const copy = { ...data };
    for (const key in copy) {
      if (typeof copy[key] === 'string' && copy[key].startsWith('blob:')) {
         copy[key] = '';
      } else if (typeof copy[key] === 'object') {
         copy[key] = sanitizeBlobUrls(copy[key]);
      }
    }
    return copy;
  }
  return data;
};

const loadSavedState = () => {
  try {
    // 1. Check if projects list exists
    let listSaved = localStorage.getItem(getStorageKey('ar_forge_project_list'));
    let projectsList = listSaved ? JSON.parse(listSaved) : [];
    
    // 2. If list is empty, let's see if we have an old single-project autosave to migrate
    const oldAutosave = localStorage.getItem(getStorageKey('ar_forge_autosave'));
    
    if (projectsList.length === 0) {
      if (oldAutosave) {
        try {
          const parsed = sanitizeBlobUrls(JSON.parse(oldAutosave));
          if (parsed && parsed.objects) {
            const defaultId = 'project-' + uuidv4();
            const defaultProjMetadata = {
              id: defaultId,
              name: parsed.settings?.projectName || 'My AR Experience',
              createdAt: Date.now() - 3600000,
              updatedAt: Date.now()
            };
            projectsList = [defaultProjMetadata];
            localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(projectsList));
            
            const defaultProjData = {
              id: defaultId,
              name: parsed.settings?.projectName || 'My AR Experience',
              objects: parsed.objects,
              rootObjects: parsed.rootObjects || [initialImageTargetId],
              settings: parsed.settings || { projectName: 'My AR Experience', imageTargetName: null },
              assets: parsed.assets || [],
              lastSavedTime: parsed.lastSavedTime || Date.now()
            };
            localStorage.setItem(getStorageKey(`ar_forge_project_${defaultId}`), JSON.stringify(defaultProjData));
          }
        } catch (e) {
          console.error('Migration failed:', e);
        }
      }
    }
    
    // 3. If list is STILL empty, initialize with default scene
    if (projectsList.length === 0) {
      const defaultId = 'project-' + uuidv4();
      const defaultProjMetadata = {
        id: defaultId,
        name: 'My AR Experience',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      projectsList = [defaultProjMetadata];
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(projectsList));
      
      const defaultProjData = {
        id: defaultId,
        name: 'My AR Experience',
        objects: defaultScene,
        rootObjects: [initialImageTargetId],
        settings: {
          projectName: 'My AR Experience',
          imageTargetName: null
        },
        assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
        lastSavedTime: Date.now()
      };
      localStorage.setItem(getStorageKey(`ar_forge_project_${defaultId}`), JSON.stringify(defaultProjData));
    }
    
    // 4. Determine current active project ID
    let activeId = localStorage.getItem(getStorageKey('ar_forge_active_project_id'));
    if (!activeId || !projectsList.some((p: any) => p.id === activeId)) {
      activeId = projectsList[0].id;
      localStorage.setItem(getStorageKey('ar_forge_active_project_id'), activeId);
    }
    
    // 5. Load current project data
    const activeProjDataStr = localStorage.getItem(getStorageKey(`ar_forge_project_${activeId}`));
    if (activeProjDataStr) {
      const activeProjData = sanitizeBlobUrls(JSON.parse(activeProjDataStr));
      let scenes = activeProjData.scenes;
      let activeSceneId = activeProjData.activeSceneId;
      if (!scenes || !activeSceneId) {
        activeSceneId = 'default';
        scenes = {
          'default': { id: 'default', name: 'Main Scene', objects: ensureImageTargetLocked(activeProjData.objects), rootObjects: activeProjData.rootObjects }
        };
      } else {
        const activeScene = scenes[activeSceneId];
        if (activeScene) {
          activeProjData.objects = ensureImageTargetLocked(activeScene.objects);
          activeProjData.rootObjects = activeScene.rootObjects;
        }
      }

      return {
        currentProjectId: activeId,
        projectsList,
        scenes,
        activeSceneId,
        objects: ensureImageTargetLocked(activeProjData.objects),
        rootObjects: activeProjData.rootObjects,
        settings: activeProjData.settings || { projectName: activeProjData.name || 'My AR Experience', imageTargetName: null },
        assets: activeProjData.assets || [],
        lastSavedTime: activeProjData.lastSavedTime || Date.now(),
        versions: loadVersionsForProject(activeId)
      };
    }
    
    // Fallback
    return {
      currentProjectId: projectsList[0].id,
      projectsList,
      objects: ensureImageTargetLocked(defaultScene),
      rootObjects: [initialImageTargetId],
      settings: { projectName: projectsList[0].name, imageTargetName: null },
      assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
      lastSavedTime: Date.now()
    };
  } catch (e) {
    console.error('Failed to initialize local multi-project system:', e);
    const fallbackId = 'project-default';
    return {
      currentProjectId: fallbackId,
      projectsList: [{ id: fallbackId, name: 'My AR Experience', createdAt: Date.now(), updatedAt: Date.now() }],
      objects: ensureImageTargetLocked(defaultScene),
      rootObjects: [initialImageTargetId],
      settings: { projectName: 'My AR Experience', imageTargetName: null },
      assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
      lastSavedTime: Date.now()
    };
  }
};

const savedData = loadSavedState();

const initialObjects = savedData.objects;
const initialRootObjects = savedData.rootObjects;
const initialSettings = savedData.settings;
const initialAssets = savedData.assets;
const initialLastSavedTime = savedData.lastSavedTime;
const initialCurrentProjectId = savedData.currentProjectId;
const initialProjectsList = savedData.projectsList;

// Cooldown state for property update snapshots
let lastSnapshotTime = 0;
let lastEditedObjectId: string | null = null;

const createSnapshot = (state: any): HistorySnapshot => {
  return {
    objects: JSON.parse(JSON.stringify(state.objects)),
    rootObjects: [...state.rootObjects],
    selectedObjectId: state.selectedObjectId, selectedObjectIds: [...state.selectedObjectIds]
  };
};

const cloneObjectSubtree = (
  rootId: string,
  targetParentId: string | null,
  sourceObjects: Record<string, SceneObject>,
  newObjects: Record<string, SceneObject>,
  isRoot: boolean
): SceneObject | null => {
  const original = sourceObjects[rootId];
  if (!original) return null;

  const newId = uuidv4();
  const clonedProps = JSON.parse(JSON.stringify(original.properties));

  let position = [...original.position] as [number, number, number];
  if (isRoot) {
    position[0] += 0.25; // Slightly offset X
    position[2] += 0.25; // Slightly offset Z
  }

  const clonedObj: SceneObject = {
    ...original,
    id: newId,
    name: isRoot 
      ? (original.name.endsWith(' (Copy)') ? original.name : `${original.name} (Copy)`)
      : original.name,
    position,
    rotation: [...original.rotation] as [number, number, number],
    scale: [...original.scale] as [number, number, number],
    parentId: targetParentId,
    children: [],
    properties: clonedProps
  };

  newObjects[newId] = clonedObj;

  original.children.forEach(childId => {
    const childClone = cloneObjectSubtree(childId, newId, sourceObjects, newObjects, false);
    if (childClone) {
      clonedObj.children.push(childClone.id);
    }
  });

  return clonedObj;
};

export const useEditorStore = create<EditorState>((set) => ({
  objects: initialObjects,
  rootObjects: initialRootObjects,
  selectedObjectId: null, selectedObjectIds: [],
  selectedObjectRef: null,
  settings: initialSettings,
  transformMode: 'translate',
  transformSpace: 'world',
  transformGizmoEnabled: true,
  assets: initialAssets,
  copiedObjectData: null,
  isPreviewMode: false,
  activeHotspotCard: null,
  setActiveHotspotCard: (card) => set({ activeHotspotCard: card }),
  lastSavedTime: initialLastSavedTime,
  hasUnsavedChanges: false,
  currentProjectId: initialCurrentProjectId,
  projectsList: initialProjectsList,
  versions: loadVersionsForProject(initialCurrentProjectId),

  activeSceneId: 'default',
  scenes: {
    'default': { id: 'default', name: 'Main Scene', objects: initialObjects, rootObjects: initialRootObjects }
  },
  createScene: (name) => set((state) => {
    const newSceneId = `scene_${Date.now()}`;
    const newScene = { id: newSceneId, name, objects: JSON.parse(JSON.stringify(defaultScene)), rootObjects: [initialImageTargetId] };
    
    // Save current scene state before switching
    const currentScenes = { ...state.scenes };
    if (currentScenes[state.activeSceneId]) {
      currentScenes[state.activeSceneId] = {
        ...currentScenes[state.activeSceneId],
        objects: state.objects,
        rootObjects: state.rootObjects
      };
    }
    
    return {
      scenes: { ...currentScenes, [newSceneId]: newScene },
      activeSceneId: newSceneId,
      objects: newScene.objects,
      rootObjects: newScene.rootObjects,
      selectedObjectId: null,
      selectedObjectIds: [],
      past: [],
      future: [],
      hasUnsavedChanges: true
    };
  }),
  loadScene: (sceneId) => set((state) => {
    // Before switching, save current scene state
    const currentScenes = { ...state.scenes };
    if (currentScenes[state.activeSceneId]) {
      currentScenes[state.activeSceneId] = {
        ...currentScenes[state.activeSceneId],
        objects: state.objects,
        rootObjects: state.rootObjects
      };
    }
    const targetScene = currentScenes[sceneId];
    if (!targetScene) return state;

    return {
      scenes: currentScenes,
      activeSceneId: sceneId,
      objects: targetScene.objects,
      rootObjects: targetScene.rootObjects,
      selectedObjectId: null,
      selectedObjectIds: [],
      past: [],
      future: [],
      hasUnsavedChanges: true
    };
  }),
  deleteScene: (sceneId) => set((state) => {
    if (Object.keys(state.scenes).length <= 1) return state; // Prevent deleting last scene
    const newScenes = { ...state.scenes };
    delete newScenes[sceneId];
    
    // If we deleted the active scene, switch to the first available one
    if (state.activeSceneId === sceneId) {
      const firstAvailableId = Object.keys(newScenes)[0];
      const targetScene = newScenes[firstAvailableId];
      return {
        scenes: newScenes,
        activeSceneId: firstAvailableId,
        objects: targetScene.objects,
        rootObjects: targetScene.rootObjects,
        selectedObjectId: null,
        selectedObjectIds: [],
        hasUnsavedChanges: true
      };
    }
    
    return { scenes: newScenes, hasUnsavedChanges: true };
  }),
  renameScene: (sceneId, newName) => set((state) => {
    if (!state.scenes[sceneId]) return state;
    return {
      scenes: {
        ...state.scenes,
        [sceneId]: {
          ...state.scenes[sceneId],
          name: newName
        }
      },
      hasUnsavedChanges: true
    };
  }),

  // Snapping defaults
  gridSnapEnabled: false,
  gridSnapIncrement: 0.1,
  rotationSnapEnabled: false,
  rotationSnapIncrement: 15,
  
  isAssetBrowserOpen: false,
  overlayGridEnabled: false,
  overlayGridSize: 50,
  hudDebugGridEnabled: false,

  // Camera & View modes
  cameraType: 'perspective',
  wireframeEnabled: false,
  editorTheme: 'dark',
  
  // History state
  past: [],
  future: [],

  addObject: (obj, parentId) => set((state) => {
    // Save snapshot of current state before mutation
    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    // Reset update cooldown
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    let newObjects = { ...state.objects };
    let newRootObjects = [...state.rootObjects];

    const targetObj = { ...obj };
    const isHUDChild = ['hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(targetObj.type);

    let resolvedParentId = parentId;

    if (isHUDChild) {
      // Force HUD child element to be nested in a hudCanvas
      const proposedParent = resolvedParentId ? newObjects[resolvedParentId] : null;
      if (proposedParent && proposedParent.type === 'hudCanvas') {
        // Correct parent specified.
      } else {
        // Proposed parent is not a hudCanvas. Find an existing one in the scene!
        const existingCanvas = Object.values(newObjects).find(o => o.type === 'hudCanvas');
        if (existingCanvas) {
          resolvedParentId = existingCanvas.id;
        } else {
          // No existing hudCanvas. Let's auto-create one!
          const canvasId = uuidv4();
          const newCanvas: SceneObject = {
            id: canvasId,
            name: 'HUD Canvas',
            type: 'hudCanvas',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            visible: true,
            children: [],
            parentId: null,
            properties: {
              layoutMode: 'column',
              layoutAlignItems: 'center',
              layoutJustifyContent: 'center',
              backgroundColor: '#1c1917',
              opacity: 0.85,
              layoutPadding: 16,
              layoutGap: 8,
              themeBorderRadius: 12,
              themeBlur: 4,
            }
          };
          newObjects[canvasId] = newCanvas;
          newRootObjects.push(canvasId);
          resolvedParentId = canvasId;
        }
      }
    }

    // Insert target object
    newObjects[targetObj.id] = targetObj;

    if (resolvedParentId && newObjects[resolvedParentId]) {
      newObjects[resolvedParentId] = {
        ...newObjects[resolvedParentId],
        children: [...newObjects[resolvedParentId].children, targetObj.id]
      };
      newObjects[targetObj.id].parentId = resolvedParentId;
    } else {
      newRootObjects.push(targetObj.id);
    }

    const normalized = normalizeSceneHierarchyAndLockImageTarget(newObjects, newRootObjects);

    return { 
      objects: normalized.objects, 
      rootObjects: normalized.rootObjects,
      past: newPast,
      future: [], // Clear redo stack on new action
      hasUnsavedChanges: true
    };
  }),

  removeObject: (id) => set((state) => {
    // Save snapshot of current state before mutation
    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    // Reset update cooldown
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    const newObjects = { ...state.objects };
    const objToRemove = newObjects[id];
    if (!objToRemove) return state;

    // Remove from parent
    if (objToRemove.parentId && newObjects[objToRemove.parentId]) {
      newObjects[objToRemove.parentId] = {
        ...newObjects[objToRemove.parentId],
        children: newObjects[objToRemove.parentId].children.filter(childId => childId !== id)
      };
    }

    // Recursively remove children
    const removeRecursive = (targetId: string) => {
      const target = newObjects[targetId];
      if (target) {
        target.children.forEach(removeRecursive);
        delete newObjects[targetId];
      }
    };
    removeRecursive(id);
    
    const isSelectedDeleted = state.selectedObjectId && !newObjects[state.selectedObjectId];

    return {
      objects: newObjects,
      rootObjects: state.rootObjects.filter(rootId => rootId !== id),
      selectedObjectId: isSelectedDeleted ? null : state.selectedObjectId,
      selectedObjectIds: state.selectedObjectIds.filter(x => newObjects[x]),
      selectedObjectRef: isSelectedDeleted ? null : state.selectedObjectRef,
      past: newPast,
      future: [], // Clear redo stack on new action
      hasUnsavedChanges: true
    };
  }),

  updateObject: (id, updates) => set((state) => {
    if (!state.objects[id]) return state;

    const now = Date.now();
    let newPast = state.past;

    // Save snapshot if:
    // - Editing a different object
    // - Cooldown elapsed (1.5s)
    if (id !== lastEditedObjectId || (now - lastSnapshotTime) > 1500) {
      const snapshot = createSnapshot(state);
      newPast = [...state.past, snapshot];
      if (newPast.length > 50) {
        newPast = newPast.slice(1);
      }
      lastEditedObjectId = id;
    }
    
    // Always update timestamp to roll the cooldown window
    lastSnapshotTime = now;

    return {
      objects: {
        ...state.objects,
        [id]: { ...state.objects[id], ...updates }
      },
      past: newPast,
      future: [], // Clear redo stack on new action
      hasUnsavedChanges: true
    };
  }),

  selectObject: (id, multi) => set((state) => {
    // Reset update cooldown on selection change so next update is a clean new snapshot
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    if (multi && id) {
      const isAlreadySelected = state.selectedObjectIds.includes(id);
      let newSelectedIds = [...state.selectedObjectIds];
      
      if (isAlreadySelected) {
        newSelectedIds = newSelectedIds.filter(selectedId => selectedId !== id);
      } else {
        newSelectedIds.push(id);
      }
      
      return {
        selectedObjectId: newSelectedIds.length > 0 ? newSelectedIds[newSelectedIds.length - 1] : null,
        selectedObjectIds: newSelectedIds,
        selectedObjectRef: null
      };
    }

    return { 
      selectedObjectId: id,
      selectedObjectIds: id ? [id] : [],
      selectedObjectRef: state.selectedObjectId === id ? state.selectedObjectRef : null 
    };
  }),

  groupSelection: () => set((state) => {
    const selectedIds = state.selectedObjectIds;
    if (selectedIds.length === 0) return state;

    // Filter to only include top-most selected objects
    const topSelectedIds = selectedIds.filter(id => {
      let current = state.objects[id];
      if (!current) return false;
      while (current.parentId) {
        if (selectedIds.includes(current.parentId)) {
          return false;
        }
        current = state.objects[current.parentId];
      }
      return true;
    });

    if (topSelectedIds.length === 0) return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    // Check if the selection consists of 2D overlays
    const is2DSelection = topSelectedIds.every(id => {
      const o = state.objects[id];
      return o && ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(o.type);
    });

    const groupId = uuidv4();
    let groupObj: SceneObject;
    const newObjects = { ...state.objects };

    const firstParentId = state.objects[topSelectedIds[0]]?.parentId || null;
    const allShareSameParent = topSelectedIds.every(id => state.objects[id]?.parentId === firstParentId);
    const groupParentId = allShareSameParent ? firstParentId : null;

    if (is2DSelection) {
      // 2D Layout Grouping
      let minLeft = Infinity;
      let minTop = Infinity;
      let maxRight = -Infinity;
      let maxBottom = -Infinity;

      topSelectedIds.forEach(id => {
        const child = state.objects[id];
        if (child) {
          const cl = child.properties?.left !== undefined ? child.properties.left : 20;
          const ct = child.properties?.top !== undefined ? child.properties.top : 20;
          const cw = child.properties?.width !== undefined ? child.properties.width : (child.type === 'hudImage' ? 200 : (child.type === 'hudEmbed' ? 400 : 150));
          const ch = child.properties?.height !== undefined ? child.properties.height : (child.type === 'hudImage' ? 200 : (child.type === 'hudEmbed' ? 300 : 40));

          if (cl < minLeft) minLeft = cl;
          if (ct < minTop) minTop = ct;
          if (cl + cw > maxRight) maxRight = cl + cw;
          if (ct + ch > maxBottom) maxBottom = ct + ch;
        }
      });

      if (minLeft === Infinity) {
        minLeft = 20;
        minTop = 20;
        maxRight = 170;
        maxBottom = 60;
      }

      const groupW = maxRight - minLeft;
      const groupH = maxBottom - minTop;

      groupObj = {
        id: groupId,
        name: "HUD Canvas",
        type: 'hudCanvas',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [...topSelectedIds],
        parentId: groupParentId,
        properties: {
          backgroundColor: '#000000',
          opacity: 0.0, // Transparent container acting as folder
          alignment: 'center',
          width: 100,
          height: 100,
          widthType: '%',
          heightType: '%',
          layoutMode: 'column',
          layoutPadding: 16,
          layoutGap: 8,
          layoutAlignItems: 'center',
          layoutJustifyContent: 'center',
          layoutWrap: 'nowrap'
        }
      };

      newObjects[groupId] = groupObj;

      topSelectedIds.forEach(id => {
        const child = newObjects[id];
        if (child) {
          newObjects[id] = {
            ...child,
            parentId: groupId,
            properties: {
              ...child.properties
            }
          };
        }
      });
    } else {
      // Standard 3D Grouping
      let sumX = 0, sumY = 0, sumZ = 0;
      let count = 0;
      topSelectedIds.forEach(id => {
        const obj = state.objects[id];
        if (obj) {
          sumX += obj.position[0];
          sumY += obj.position[1];
          sumZ += obj.position[2];
          count++;
        }
      });

      const centerX = count > 0 ? sumX / count : 0;
      const centerY = count > 0 ? sumY / count : 0;
      const centerZ = count > 0 ? sumZ / count : 0;

      groupObj = {
        id: groupId,
        name: "Grouped Objects",
        type: 'group',
        position: [centerX, centerY, centerZ],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [...topSelectedIds],
        parentId: groupParentId,
        properties: {}
      };

      newObjects[groupId] = groupObj;

      topSelectedIds.forEach(id => {
        const child = newObjects[id];
        if (child) {
          newObjects[id] = {
            ...child,
            parentId: groupId,
            position: [
              child.position[0] - centerX,
              child.position[1] - centerY,
              child.position[2] - centerZ
            ]
          };
        }
      });
    }

    let newRootObjects = [...state.rootObjects];
    if (groupParentId && newObjects[groupParentId]) {
      const parent = newObjects[groupParentId];
      newObjects[groupParentId] = {
        ...parent,
        children: [
          ...parent.children.filter(childId => !topSelectedIds.includes(childId)),
          groupId
        ]
      };
    } else {
      newRootObjects = [
        ...newRootObjects.filter(id => !topSelectedIds.includes(id)),
        groupId
      ];
    }

    if (!allShareSameParent) {
      topSelectedIds.forEach(id => {
        const child = state.objects[id];
        if (child && child.parentId && newObjects[child.parentId]) {
          const oldParent = newObjects[child.parentId];
          newObjects[child.parentId] = {
            ...oldParent,
            children: oldParent.children.filter(cId => cId !== id)
          };
        }
      });
    }

    return {
      objects: newObjects,
      rootObjects: newRootObjects,
      selectedObjectId: groupId,
      selectedObjectIds: [groupId],
      selectedObjectRef: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true
    };
  }),

  ungroupObject: (groupId) => set((state) => {
    const groupObj = state.objects[groupId];
    if (!groupObj || (groupObj.type !== 'group' && groupObj.type !== 'hudCanvas')) return state;

    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    const newObjects = { ...state.objects };
    const childIds = [...groupObj.children];
    const parentId = groupObj.parentId;
    const is2DUngroup = groupObj.type === 'hudCanvas';

    delete newObjects[groupId];

    childIds.forEach(childId => {
      const child = newObjects[childId];
      if (child) {
        if (is2DUngroup) {
          newObjects[childId] = {
            ...child,
            parentId: parentId,
            properties: {
              ...child.properties
            }
          };
        } else {
          newObjects[childId] = {
            ...child,
            parentId: parentId,
            position: [
              child.position[0] + groupObj.position[0],
              child.position[1] + groupObj.position[1],
              child.position[2] + groupObj.position[2]
            ]
          };
        }
      }
    });

    let newRootObjects = [...state.rootObjects];
    if (parentId && newObjects[parentId]) {
      const parent = newObjects[parentId];
      newObjects[parentId] = {
        ...parent,
        children: [
          ...parent.children.filter(id => id !== groupId),
          ...childIds
        ]
      };
    } else {
      newRootObjects = [
        ...newRootObjects.filter(id => id !== groupId),
        ...childIds
      ];
    }

    return {
      objects: newObjects,
      rootObjects: newRootObjects,
      selectedObjectId: childIds.length > 0 ? childIds[childIds.length - 1] : null,
      selectedObjectIds: childIds,
      selectedObjectRef: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true
    };
  }),

  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates },
    hasUnsavedChanges: true
  })),

  setTransformMode: (mode) => set({ transformMode: mode }),
  setTransformSpace: (space) => set({ transformSpace: space }),
  setTransformGizmoEnabled: (enabled) => set({ transformGizmoEnabled: enabled }),

  moveObject: (draggedId, targetId) => set((state) => {
    const newObjects = { ...state.objects };
    const draggedObj = newObjects[draggedId];

    if (!draggedObj) return state;

    if (targetId === 'root') {
      if (!draggedObj.parentId) return state; // Already at root

      // Save snapshot before mutating hierarchy
      const snapshot = createSnapshot(state);
      let newPast = [...state.past, snapshot];
      if (newPast.length > 50) {
        newPast = newPast.slice(1);
      }

      // Reset update cooldown
      lastEditedObjectId = null;
      lastSnapshotTime = 0;

      // Remove from old parent
      if (draggedObj.parentId && newObjects[draggedObj.parentId]) {
        newObjects[draggedObj.parentId] = {
          ...newObjects[draggedObj.parentId],
          children: newObjects[draggedObj.parentId].children.filter(id => id !== draggedId)
        };
      }

      const newRootObjects = [...state.rootObjects];
      if (!newRootObjects.includes(draggedId)) {
        newRootObjects.push(draggedId);
      }

      newObjects[draggedId] = {
        ...draggedObj,
        parentId: null
      };

      return {
        objects: newObjects,
        rootObjects: newRootObjects,
        past: newPast,
        future: [],
        hasUnsavedChanges: true
      };
    }

    const targetObj = newObjects[targetId];
    if (!targetObj) return state;
    if (draggedId === targetId) return state;

    const isDragged2D = ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(draggedObj.type);
    const isTarget2D = ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(targetObj.type);

    if (isDragged2D && isTarget2D) {
      // Prevent cyclic drops
      let currentCheck = targetObj;
      while (currentCheck.parentId) {
        if (currentCheck.parentId === draggedId) return state;
        currentCheck = newObjects[currentCheck.parentId];
      }

      // Create history snapshot
      const snapshot = createSnapshot(state);
      let newPast = [...state.past, snapshot];
      if (newPast.length > 50) {
        newPast = newPast.slice(1);
      }

      // Reset update cooldown
      lastEditedObjectId = null;
      lastSnapshotTime = 0;

      // Remove from old parent children list
      if (draggedObj.parentId && newObjects[draggedObj.parentId]) {
        newObjects[draggedObj.parentId] = {
          ...newObjects[draggedObj.parentId],
          children: newObjects[draggedObj.parentId].children.filter(id => id !== draggedId)
        };
      }

      let newRootObjects = [...state.rootObjects];
      if (!draggedObj.parentId) {
        newRootObjects = newRootObjects.filter(id => id !== draggedId);
      }

      let resolvedParentId: string | null = null;

      if (targetObj.type === 'hudCanvas') {
        // Parent inside the target canvas!
        resolvedParentId = targetId;
        const targetChildren = [...targetObj.children];
        if (!targetChildren.includes(draggedId)) {
          targetChildren.push(draggedId);
        }
        newObjects[targetId] = {
          ...targetObj,
          children: targetChildren
        };
      } else {
        // Sibling placement next to the target element!
        resolvedParentId = targetObj.parentId;
        if (resolvedParentId && newObjects[resolvedParentId]) {
          const parentChildren = [...newObjects[resolvedParentId].children];
          const targetIdx = parentChildren.indexOf(targetId);
          if (targetIdx !== -1) {
            parentChildren.splice(targetIdx, 0, draggedId);
          } else {
            parentChildren.push(draggedId);
          }
          newObjects[resolvedParentId] = {
            ...newObjects[resolvedParentId],
            children: parentChildren
          };
        } else {
          // If target is at root
          const targetIdx = newRootObjects.indexOf(targetId);
          if (targetIdx !== -1) {
            newRootObjects.splice(targetIdx, 0, draggedId);
          } else {
            newRootObjects.push(draggedId);
          }
        }
      }

      // Update dragged object parent
      newObjects[draggedId] = {
        ...draggedObj,
        parentId: resolvedParentId
      };

      // Re-assign z-indexes of all 2D siblings under the resolved parent/root to maintain top-down layering
      const siblings = resolvedParentId ? newObjects[resolvedParentId].children : newRootObjects;
      const overlaySiblings = siblings.filter(id => {
        const o = newObjects[id];
        return o && ['hudCanvas', 'hudText', 'hudButton', 'hudImage', 'hudEmbed'].includes(o.type);
      });

      overlaySiblings.forEach((childId, idx) => {
        const child = newObjects[childId];
        if (child) {
          // Topmost visual items get highest z-index
          const newZ = (overlaySiblings.length - idx) * 10;
          newObjects[childId] = {
            ...child,
            properties: {
              ...child.properties,
              zIndex: newZ
            }
          };
        }
      });

      return {
        objects: newObjects,
        rootObjects: newRootObjects,
        past: newPast,
        future: [],
        hasUnsavedChanges: true
      };
    }

    // Prevent cyclic drops
    let current = targetObj;
    while (current.parentId) {
      if (current.parentId === draggedId) return state;
      current = newObjects[current.parentId];
    }

    // Save snapshot before mutating hierarchy
    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    // Reset update cooldown
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    // Remove from old parent
    if (draggedObj.parentId && newObjects[draggedObj.parentId]) {
      newObjects[draggedObj.parentId] = {
        ...newObjects[draggedObj.parentId],
        children: newObjects[draggedObj.parentId].children.filter(id => id !== draggedId)
      };
    }

    let newRootObjects = [...state.rootObjects];
    if (!draggedObj.parentId) {
       newRootObjects = newRootObjects.filter(id => id !== draggedId);
    }

    // Add to new parent
    if (!newObjects[targetId].children.includes(draggedId)) {
      newObjects[targetId] = {
        ...newObjects[targetId],
        children: [...newObjects[targetId].children, draggedId]
      };
    }

    newObjects[draggedId] = {
      ...newObjects[draggedId],
      parentId: targetId
    };

    return { 
      objects: newObjects, 
      rootObjects: newRootObjects,
      past: newPast,
      future: [], // Clear redo stack
      hasUnsavedChanges: true
    };
  }),

  duplicateObject: (id) => set((state) => {
    const original = state.objects[id];
    if (!original || original.type === 'imageTarget') return state;

    // Create history snapshot
    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    const newObjects = { ...state.objects };
    let newRootObjects = [...state.rootObjects];

    // Clone the subtree
    const rootClone = cloneObjectSubtree(id, original.parentId, state.objects, newObjects, true);
    if (!rootClone) return state;

    // Insert into parent or root objects list next to original
    if (original.parentId && newObjects[original.parentId]) {
      const parent = newObjects[original.parentId];
      const index = parent.children.indexOf(id);
      const newChildren = [...parent.children];
      if (index !== -1) {
        newChildren.splice(index + 1, 0, rootClone.id);
      } else {
        newChildren.push(rootClone.id);
      }
      newObjects[original.parentId] = {
        ...parent,
        children: newChildren
      };
    } else {
      const index = newRootObjects.indexOf(id);
      if (index !== -1) {
        newRootObjects.splice(index + 1, 0, rootClone.id);
      } else {
        newRootObjects.push(rootClone.id);
      }
    }

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      objects: newObjects,
      rootObjects: newRootObjects,
      selectedObjectId: rootClone.id,
      selectedObjectRef: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Duplicated "${original.name}"` }]
    };
  }),

  copyObject: (id) => set((state) => {
    const original = state.objects[id];
    if (!original || original.type === 'imageTarget') return state;

    // Collect all descendants of the object
    const copiedObjects: Record<string, SceneObject> = {};
    const collectDescendants = (targetId: string) => {
      const obj = state.objects[targetId];
      if (obj) {
        copiedObjects[targetId] = JSON.parse(JSON.stringify(obj));
        obj.children.forEach(collectDescendants);
      }
    };
    collectDescendants(id);

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      copiedObjectData: {
        rootId: id,
        objects: copiedObjects
      },
      toasts: [...state.toasts, { id: toastId, message: `Copied "${original.name}" to clipboard` }]
    };
  }),

  pasteObject: () => set((state) => {
    if (!state.copiedObjectData) {
      const toastId = Math.random().toString(36).substring(2, 9);
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
      }, 3000);
      return {
        toasts: [...state.toasts, { id: toastId, message: 'Clipboard is empty' }]
      };
    }

    const { rootId, objects: copiedObjects } = state.copiedObjectData;
    const originalRoot = copiedObjects[rootId];
    if (!originalRoot) return state;

    // Create history snapshot
    const snapshot = createSnapshot(state);
    let newPast = [...state.past, snapshot];
    if (newPast.length > 50) {
      newPast = newPast.slice(1);
    }

    const newObjects = { ...state.objects };
    let newRootObjects = [...state.rootObjects];

    // Determine target parent ID
    const selectedId = state.selectedObjectId;
    let targetParentId: string | null = null;
    if (selectedId) {
      const selObj = state.objects[selectedId];
      if (selObj) {
        if (selObj.type === 'group' || selObj.type === 'imageTarget') {
          targetParentId = selectedId;
        } else {
          targetParentId = selObj.parentId;
        }
      }
    } else {
      const imageTarget = Object.values(state.objects).find(o => o.type === 'imageTarget');
      if (imageTarget) {
        targetParentId = imageTarget.id;
      }
    }

    // Clone subtree
    const rootClone = cloneObjectSubtree(rootId, targetParentId, copiedObjects, newObjects, true);
    if (!rootClone) return state;

    // Insert into hierarchy
    if (targetParentId && newObjects[targetParentId]) {
      const parentObj = newObjects[targetParentId];
      if (selectedId && selectedId !== targetParentId && parentObj.children.includes(selectedId)) {
        const index = parentObj.children.indexOf(selectedId);
        const newChildren = [...parentObj.children];
        newChildren.splice(index + 1, 0, rootClone.id);
        newObjects[targetParentId] = {
          ...parentObj,
          children: newChildren
        };
      } else {
        newObjects[targetParentId] = {
          ...parentObj,
          children: [...parentObj.children, rootClone.id]
        };
      }
    } else {
      if (selectedId && newRootObjects.includes(selectedId)) {
        const index = newRootObjects.indexOf(selectedId);
        newRootObjects.splice(index + 1, 0, rootClone.id);
      } else {
        newRootObjects.push(rootClone.id);
      }
    }

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 3000);

    return {
      objects: newObjects,
      rootObjects: newRootObjects,
      selectedObjectId: rootClone.id,
      selectedObjectRef: null,
      past: newPast,
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Pasted "${originalRoot.name}"` }]
    };
  }),

  addAsset: (asset) => set((state) => ({
    assets: [...state.assets, asset],
    hasUnsavedChanges: true
  })),

  removeAsset: (id) => set((state) => ({
    assets: state.assets.filter(a => a.id !== id),
    hasUnsavedChanges: true
  })),

  updateAsset: (id, name) => set((state) => ({
    assets: state.assets.map(a => a.id === id ? { ...a, name } : a),
    hasUnsavedChanges: true
  })),
  setPreviewMode: (preview) => set({ isPreviewMode: preview }),
  
  // Script & behavior implementation
  editingScriptObjectId: null,
  toasts: [],
  arVideoPlaying: null,
  
  setEditingScriptObjectId: (id) => set({ editingScriptObjectId: id }),
  addToast: (message) => set((state) => {
    const id = Math.random().toString(36).substring(2, 9);
    // Auto remove after 4 seconds
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
    return { toasts: [...state.toasts, { id, message }] };
  }),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
  setARVideoPlaying: (video) => set({ arVideoPlaying: video }),

  undo: () => set((state) => {
    if (state.past.length === 0) return state;

    // Reset update cooldown
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);

    // Save current state into future stack
    const currentSnapshot = createSnapshot(state);
    const newFuture = [currentSnapshot, ...state.future];

    return {
      objects: previous.objects,
      rootObjects: previous.rootObjects,
      selectedObjectId: previous.selectedObjectId,
      selectedObjectIds: previous.selectedObjectIds,
      selectedObjectRef: state.selectedObjectId === previous.selectedObjectId ? state.selectedObjectRef : null,
      past: newPast,
      future: newFuture,
      hasUnsavedChanges: true
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state;

    // Reset update cooldown
    lastEditedObjectId = null;
    lastSnapshotTime = 0;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    // Save current state into past stack
    const currentSnapshot = createSnapshot(state);
    const newPast = [...state.past, currentSnapshot];

    return {
      objects: next.objects,
      rootObjects: next.rootObjects,
      selectedObjectId: next.selectedObjectId,
      selectedObjectIds: next.selectedObjectIds,
      selectedObjectRef: state.selectedObjectId === next.selectedObjectId ? state.selectedObjectRef : null,
      past: newPast,
      future: newFuture,
      hasUnsavedChanges: true
    };
  }),

  loadProject: (projectId) => set((state) => {
    try {
      const savedDataStr = localStorage.getItem(getStorageKey(`ar_forge_project_${projectId}`));
      if (!savedDataStr) return state;

      const parsed = sanitizeBlobUrls(JSON.parse(savedDataStr));
      localStorage.setItem(getStorageKey('ar_forge_active_project_id'), projectId);

      let scenes = parsed.scenes;
      let activeSceneId = parsed.activeSceneId;

      if (!scenes || !activeSceneId) {
        activeSceneId = 'default';
        scenes = {
          'default': { id: 'default', name: 'Main Scene', objects: ensureImageTargetLocked(parsed.objects), rootObjects: parsed.rootObjects }
        };
      } else {
        // Ensure active scene is loaded
        const activeScene = scenes[activeSceneId];
        if (activeScene) {
          parsed.objects = ensureImageTargetLocked(activeScene.objects);
          parsed.rootObjects = activeScene.rootObjects;
        }
      }

      return {
        currentProjectId: projectId,
        objects: ensureImageTargetLocked(parsed.objects),
        rootObjects: parsed.rootObjects,
        scenes,
        activeSceneId,
        settings: parsed.settings || { projectName: parsed.name || 'Untitled Project', imageTargetName: null },
        assets: parsed.assets || [],
        selectedObjectId: null, selectedObjectIds: [],
        selectedObjectRef: null,
        past: [],
        future: [],
        lastSavedTime: parsed.lastSavedTime || Date.now(),
        hasUnsavedChanges: false,
        versions: loadVersionsForProject(projectId)
      };
    } catch (e) {
      console.error('Failed to load project:', e);
      return state;
    }
  }),

  createProject: (name, templateType) => {
    const newId = 'project-' + uuidv4();
    const { objects, rootObjects } = generateTemplate(name, templateType);
    
    const metadata = {
      id: newId,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    let updatedList = [];
    set((state) => {
      updatedList = [metadata, ...state.projectsList];
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      const projectData = {
        id: newId,
        name,
        objects,
        rootObjects,
        settings: {
          projectName: name,
          imageTargetName: null
        },
        assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
        scenes: {
          'default': { id: 'default', name: 'Main Scene', objects, rootObjects }
        },
        activeSceneId: 'default',
        lastSavedTime: Date.now()
      };
      localStorage.setItem(getStorageKey(`ar_forge_project_${newId}`), JSON.stringify(projectData));
      localStorage.setItem(getStorageKey('ar_forge_active_project_id'), newId);

      return {
        currentProjectId: newId,
        projectsList: updatedList,
        objects,
        rootObjects,
        scenes: projectData.scenes,
        activeSceneId: projectData.activeSceneId,
        settings: {
          projectName: name,
          imageTargetName: null
        },
        assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
        selectedObjectId: null, selectedObjectIds: [],
        selectedObjectRef: null,
        past: [],
        future: [],
        lastSavedTime: Date.now(),
        hasUnsavedChanges: false
      };
    });

    return newId;
  },

  deleteProject: (projectId) => set((state) => {
    try {
      localStorage.removeItem(getStorageKey(`ar_forge_project_${projectId}`));
      const updatedList = state.projectsList.filter((p) => p.id !== projectId);
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      if (state.currentProjectId === projectId) {
        // If the deleted project was active, find another or create a default
        if (updatedList.length > 0) {
          const nextActiveId = updatedList[0].id;
          localStorage.setItem(getStorageKey('ar_forge_active_project_id'), nextActiveId);
          
          const savedDataStr = localStorage.getItem(getStorageKey(`ar_forge_project_${nextActiveId}`));
          if (savedDataStr) {
            const parsed = sanitizeBlobUrls(JSON.parse(savedDataStr));
            return {
              currentProjectId: nextActiveId,
              projectsList: updatedList,
              objects: ensureImageTargetLocked(parsed.objects),
              rootObjects: parsed.rootObjects,
              settings: parsed.settings || { projectName: parsed.name || 'Untitled Project', imageTargetName: null },
              assets: parsed.assets || [],
              selectedObjectId: null, selectedObjectIds: [],
              selectedObjectRef: null,
              past: [],
              future: [],
              lastSavedTime: parsed.lastSavedTime || Date.now(),
              hasUnsavedChanges: false
            };
          }
        }

        // If no projects remaining, recreate a default empty project
        const defaultId = 'project-' + uuidv4();
        const defaultMetadata = {
          id: defaultId,
          name: 'My AR Experience',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const newList = [defaultMetadata];
        localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(newList));

        const defaultImageTargetId = uuidv4();
        const defaultObjects = {
          [defaultImageTargetId]: {
            id: defaultImageTargetId,
            name: 'Image Target',
            type: 'imageTarget' as const,
            position: [0, 0, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            visible: true,
            locked: true,
            children: [],
            parentId: null,
            properties: { physicalWidth: 0.1 }
          }
        };

        const defaultProjData = {
          id: defaultId,
          name: 'My AR Experience',
          objects: defaultObjects,
          rootObjects: [defaultImageTargetId],
          settings: { projectName: 'My AR Experience', imageTargetName: null },
          assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
          lastSavedTime: Date.now()
        };
        localStorage.setItem(getStorageKey(`ar_forge_project_${defaultId}`), JSON.stringify(defaultProjData));
        localStorage.setItem(getStorageKey('ar_forge_active_project_id'), defaultId);

        return {
          currentProjectId: defaultId,
          projectsList: newList,
          objects: defaultObjects,
          rootObjects: [defaultImageTargetId],
          settings: { projectName: 'My AR Experience', imageTargetName: null },
          assets: [
    // Built-in Audio Library
    { id: 'a_click_soft', name: 'Soft Click 🖱️', type: 'audio', url: '/sounds/ui/click_soft.wav' },
    { id: 'a_click_hard', name: 'Hard Click 🖱️', type: 'audio', url: '/sounds/ui/click_hard.wav' },
    { id: 'a_error_buzz', name: 'Error Buzz ❌', type: 'audio', url: '/sounds/ui/error_buzz.wav' },
    { id: 'a_success_bell', name: 'Success Bell ✅', type: 'audio', url: '/sounds/ui/success_bell.wav' },
    { id: 'a_notification', name: 'Notification 💬', type: 'audio', url: '/sounds/ui/notification.wav' },
    { id: 'a_pop', name: 'Pop 💥', type: 'audio', url: '/sounds/ui/pop.wav' },
    { id: 'a_swoosh', name: 'Swoosh 💨', type: 'audio', url: '/sounds/ui/swoosh.wav' },
    { id: 'a_whoosh', name: 'Whoosh 💨', type: 'audio', url: '/sounds/ui/whoosh.wav' },
    { id: 'a_magic_wand', name: 'Magic Wand 🪄', type: 'audio', url: '/sounds/ui/magic_wand.wav' },
    { id: 'a_arcade_coin', name: 'Arcade Coin 🪙', type: 'audio', url: '/sounds/ui/arcade_coin.wav' },
    { id: 'a_level_up', name: 'Level Up 🆙', type: 'audio', url: '/sounds/ui/level_up.wav' },
    { id: 'a_game_over', name: 'Game Over 💀', type: 'audio', url: '/sounds/ui/game_over.wav' },
    { id: 'a_ocean_waves', name: 'Ocean Waves 🌊', type: 'audio', url: '/sounds/ambient/ocean_waves.wav' },
    { id: 'a_rain_light', name: 'Light Rain 🌧️', type: 'audio', url: '/sounds/ambient/rain_light.wav' },
    { id: 'a_thunder', name: 'Thunder ⚡', type: 'audio', url: '/sounds/ambient/thunder.wav' },
    { id: 'a_wind_howl', name: 'Howling Wind 🌬️', type: 'audio', url: '/sounds/ambient/wind_howl.wav' },
    { id: 'a_fire_crackle', name: 'Campfire 🔥', type: 'audio', url: '/sounds/ambient/fire_crackle.wav' },
    { id: 'a_space_drone', name: 'Space Drone 🚀', type: 'audio', url: '/sounds/ambient/space_drone.wav' },
    { id: 'a_city_traffic', name: 'City Traffic 🏙️', type: 'audio', url: '/sounds/ambient/city_traffic.wav' },
    { id: 'a_door_open', name: 'Door Open 🚪', type: 'audio', url: '/sounds/objects/door_open.wav' },
    { id: 'a_door_close', name: 'Door Close 🚪', type: 'audio', url: '/sounds/objects/door_close.wav' },
    { id: 'a_glass_break', name: 'Glass Break 🥛', type: 'audio', url: '/sounds/objects/glass_break.wav' },
    { id: 'a_metal_clank', name: 'Metal Clank 🔨', type: 'audio', url: '/sounds/objects/metal_clank.wav' },
    { id: 'a_wood_thud', name: 'Wood Thud 🪵', type: 'audio', url: '/sounds/objects/wood_thud.wav' },
    { id: 'a_laser_pew', name: 'Laser Pew 🔫', type: 'audio', url: '/sounds/fx/laser_pew.wav' },
    { id: 'a_teleport', name: 'Teleport ✨', type: 'audio', url: '/sounds/fx/teleport.wav' },
    { id: 'a_energy_hum', name: 'Energy Hum ⚡', type: 'audio', url: '/sounds/fx/energy_hum.wav' },
    { id: 'a_shield_up', name: 'Shield Up 🛡️', type: 'audio', url: '/sounds/fx/shield_up.wav' },
    { id: 'a_piano_chord', name: 'Piano Chord 🎹', type: 'audio', url: '/sounds/music/piano_chord.wav' },
    { id: 'a_guitar_strum', name: 'Guitar Strum 🎸', type: 'audio', url: '/sounds/music/guitar_strum.wav' },
    { id: 'a_drum_beat', name: 'Drum Beat 🥁', type: 'audio', url: '/sounds/music/drum_beat.wav' }
  ],
          selectedObjectId: null, selectedObjectIds: [],
          selectedObjectRef: null,
          past: [],
          future: [],
          lastSavedTime: Date.now(),
          hasUnsavedChanges: false
        };
      }

      return {
        projectsList: updatedList
      };
    } catch (e) {
      console.error('Failed to delete project:', e);
      return state;
    }
  }),

  duplicateProject: (projectId) => set((state) => {
    try {
      const savedDataStr = localStorage.getItem(getStorageKey(`ar_forge_project_${projectId}`));
      if (!savedDataStr) return state;

      const parsed = sanitizeBlobUrls(JSON.parse(savedDataStr));
      const newId = 'project-' + uuidv4();
      const newName = `${parsed.settings?.projectName || parsed.name || 'Project'} Copy`;

      const metadata = {
        id: newId,
        name: newName,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const updatedList = [metadata, ...state.projectsList];
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      const projectData = {
        ...parsed,
        id: newId,
        name: newName,
        settings: {
          ...(parsed.settings || {}),
          projectName: newName
        },
        lastSavedTime: Date.now()
      };
      localStorage.setItem(getStorageKey(`ar_forge_project_${newId}`), JSON.stringify(projectData));
      localStorage.setItem(getStorageKey('ar_forge_active_project_id'), newId);

      return {
        currentProjectId: newId,
        projectsList: updatedList,
        objects: ensureImageTargetLocked(projectData.objects),
        rootObjects: projectData.rootObjects,
        settings: projectData.settings,
        assets: projectData.assets || [],
        selectedObjectId: null, selectedObjectIds: [],
        selectedObjectRef: null,
        past: [],
        future: [],
        lastSavedTime: Date.now(),
        hasUnsavedChanges: false
      };
    } catch (e) {
      console.error('Failed to duplicate project:', e);
      return state;
    }
  }),

  saveCurrentProject: () => set((state) => {
    try {
      const updatedScenes = { ...state.scenes };
      if (updatedScenes[state.activeSceneId]) {
        updatedScenes[state.activeSceneId] = {
          ...updatedScenes[state.activeSceneId],
          objects: state.objects,
          rootObjects: state.rootObjects
        };
      }

      const projectData = {
        id: state.currentProjectId,
        name: state.settings.projectName,
        objects: state.objects,
        rootObjects: state.rootObjects,
        settings: state.settings,
        assets: state.assets,
        scenes: updatedScenes,
        activeSceneId: state.activeSceneId,
        lastSavedTime: Date.now()
      };

      localStorage.setItem(getStorageKey(`ar_forge_project_${state.currentProjectId}`), JSON.stringify(projectData));

      // If already published, sync the configuration to Supabase in the background
      if (state.settings.publishedProjectId) {
        import('../services/supabaseService').then(({ SupabaseService }) => {
          if (SupabaseService.isConfigured()) {
            SupabaseService.saveProject(
              state.settings.publishedProjectId!,
              state.settings.projectName,
              {
                objects: state.objects,
                rootObjects: state.rootObjects,
                settings: state.settings,
                assets: state.assets
              }
            ).then(() => {
              console.log('Successfully synced current project configuration to the cloud.');
            }).catch((err) => {
              console.warn('Could not sync project configuration to the cloud:', err);
            });
          }
        });
      }

      const updatedList = state.projectsList.map((p) => 
        p.id === state.currentProjectId 
          ? { ...p, name: state.settings.projectName, updatedAt: Date.now() }
          : p
      );
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      return {
        projectsList: updatedList,
        lastSavedTime: Date.now(),
        hasUnsavedChanges: false
      };
    } catch (e) {
      console.error('Failed to save project:', e);
      return state;
    }
  }),

  updateProjectThumbnail: (projectId: string, thumbnailDataUrl: string) => set((state) => {
    try {
      const updatedList = state.projectsList.map((p) =>
        p.id === projectId ? { ...p, thumbnail: thumbnailDataUrl, updatedAt: Date.now() } : p
      );
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      const key = getStorageKey(`ar_forge_project_${projectId}`);
      const existing = localStorage.getItem(key);
      if (existing) {
        const parsed = JSON.parse(existing);
        parsed.thumbnail = thumbnailDataUrl;
        localStorage.setItem(key, JSON.stringify(parsed));
      }

      return { projectsList: updatedList };
    } catch (e) {
      console.error('Failed to update project thumbnail:', e);
      return state;
    }
  }),

  renameProject: (projectId, newName) => set((state) => {
    try {
      const updatedList = state.projectsList.map((p) => 
        p.id === projectId ? { ...p, name: newName, updatedAt: Date.now() } : p
      );
      localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

      const savedDataStr = localStorage.getItem(getStorageKey(`ar_forge_project_${projectId}`));
      if (savedDataStr) {
        const parsed = sanitizeBlobUrls(JSON.parse(savedDataStr));
        parsed.name = newName;
        if (!parsed.settings) parsed.settings = { projectName: newName, imageTargetName: null };
        parsed.settings.projectName = newName;
        parsed.lastSavedTime = Date.now();
        localStorage.setItem(getStorageKey(`ar_forge_project_${projectId}`), JSON.stringify(parsed));
      }

      if (state.currentProjectId === projectId) {
        return {
          projectsList: updatedList,
          settings: { ...state.settings, projectName: newName },
          lastSavedTime: Date.now(),
          hasUnsavedChanges: false
        };
      }

      return {
        projectsList: updatedList
      };
    } catch (e) {
      console.error('Failed to rename project:', e);
      return state;
    }
  }),

  importProject: (projectJson) => {
    try {
      const parsed = sanitizeBlobUrls(JSON.parse(projectJson));
      if (!parsed.objects || !parsed.rootObjects) {
        return null;
      }

      const newId = 'project-' + uuidv4();
      const name = parsed.settings?.projectName || parsed.name || 'Imported Project';

      const metadata = {
        id: newId,
        name,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      let finalId = newId;
      set((state) => {
        const updatedList = [metadata, ...state.projectsList];
        localStorage.setItem(getStorageKey('ar_forge_project_list'), JSON.stringify(updatedList));

        const projectData = {
          id: newId,
          name,
          objects: parsed.objects,
          rootObjects: parsed.rootObjects,
          settings: parsed.settings || { projectName: name, imageTargetName: null },
          assets: parsed.assets || [],
          lastSavedTime: Date.now()
        };
        localStorage.setItem(getStorageKey(`ar_forge_project_${newId}`), JSON.stringify(projectData));
        localStorage.setItem(getStorageKey('ar_forge_active_project_id'), newId);

        return {
          currentProjectId: newId,
          projectsList: updatedList,
          objects: ensureImageTargetLocked(projectData.objects),
          rootObjects: projectData.rootObjects,
          settings: projectData.settings,
          assets: projectData.assets,
          selectedObjectId: null, selectedObjectIds: [],
          selectedObjectRef: null,
          past: [],
          future: [],
          lastSavedTime: Date.now(),
          hasUnsavedChanges: false
        };
      });

      return finalId;
    } catch (e) {
      console.error('Failed to import project:', e);
      return null;
    }
  },

  setGridSnapEnabled: (enabled) => set({ gridSnapEnabled: enabled }),
  setGridSnapIncrement: (increment) => set({ gridSnapIncrement: increment }),
  setRotationSnapEnabled: (enabled) => set({ rotationSnapEnabled: enabled }),
  setRotationSnapIncrement: (increment) => set({ rotationSnapIncrement: increment }),

  setIsAssetBrowserOpen: (open) => set({ isAssetBrowserOpen: open }),
  setOverlayGridEnabled: (enabled) => set({ overlayGridEnabled: enabled }),
  setOverlayGridSize: (size) => set({ overlayGridSize: size }),
  setHudDebugGridEnabled: (enabled) => set({ hudDebugGridEnabled: enabled }),

  setCameraType: (cameraType) => set({ cameraType }),
  setWireframeEnabled: (enabled) => set({ wireframeEnabled: enabled }),
  toggleEditorTheme: () => set((state) => ({ editorTheme: state.editorTheme === 'dark' ? 'light' : 'dark' })),

  createVersionSnapshot: (customName?: string) => set((state) => {
    const versionId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const snapshotName = customName && customName.trim() ? customName.trim() : `Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${Object.keys(state.objects).length} objects)`;
    
    const newVersion: ProjectVersion = {
      id: versionId,
      name: snapshotName,
      timestamp: Date.now(),
      snapshot: {
        objects: JSON.parse(JSON.stringify(state.objects)),
        rootObjects: JSON.parse(JSON.stringify(state.rootObjects)),
        settings: JSON.parse(JSON.stringify(state.settings)),
        assets: JSON.parse(JSON.stringify(state.assets))
      }
    };

    const updatedVersions = [newVersion, ...state.versions];
    saveVersionsForProject(state.currentProjectId, updatedVersions);

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 4000);

    return {
      versions: updatedVersions,
      toasts: [...state.toasts, { id: toastId, message: `Created snapshot "${snapshotName}"` }]
    };
  }),

  restoreVersionSnapshot: (versionId: string) => set((state) => {
    const targetVersion = state.versions.find((v) => v.id === versionId);
    if (!targetVersion) return state;

    const snapshotToPush: HistorySnapshot = {
      objects: JSON.parse(JSON.stringify(state.objects)),
      rootObjects: JSON.parse(JSON.stringify(state.rootObjects)),
      selectedObjectId: state.selectedObjectId,
      selectedObjectIds: JSON.parse(JSON.stringify(state.selectedObjectIds))
    };

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 4000);

    return {
      objects: JSON.parse(JSON.stringify(targetVersion.snapshot.objects)),
      rootObjects: JSON.parse(JSON.stringify(targetVersion.snapshot.rootObjects)),
      settings: JSON.parse(JSON.stringify(targetVersion.snapshot.settings)),
      assets: JSON.parse(JSON.stringify(targetVersion.snapshot.assets)),
      selectedObjectId: null,
      selectedObjectIds: [],
      selectedObjectRef: null,
      past: [...state.past, snapshotToPush],
      future: [],
      hasUnsavedChanges: true,
      toasts: [...state.toasts, { id: toastId, message: `Restored scene to "${targetVersion.name}"` }]
    };
  }),

  deleteVersionSnapshot: (versionId: string) => set((state) => {
    const updatedVersions = state.versions.filter((v) => v.id !== versionId);
    saveVersionsForProject(state.currentProjectId, updatedVersions);

    const toastId = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }));
    }, 4000);

    return {
      versions: updatedVersions,
      toasts: [...state.toasts, { id: toastId, message: 'Deleted version snapshot' }]
    };
  }),
}));
