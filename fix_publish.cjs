const fs = require('fs');

// Fix PublishModal
let content = fs.readFileSync('src/components/toolbar/PublishModal.tsx', 'utf8');
content = content.replace(
  /const projectData = \{\s*objects: storeState\.objects,\s*rootObjects: storeState\.rootObjects,\s*settings: \{\s*\.\.\.storeState\.settings,\s*publishedProjectId: projectId\s*\},\s*assets: storeState\.assets\s*\};/g,
  `const projectData = {
        objects: storeState.objects,
        rootObjects: storeState.rootObjects,
        settings: {
          ...storeState.settings,
          publishedProjectId: projectId
        },
        assets: storeState.assets,
        scenes: storeState.scenes,
        activeSceneId: storeState.activeSceneId
      };`
);
fs.writeFileSync('src/components/toolbar/PublishModal.tsx', content);

// Fix useEditorStore
let store = fs.readFileSync('src/store/useEditorStore.ts', 'utf8');
store = store.replace(
  /SupabaseService\.saveProject\(\s*state\.settings\.publishedProjectId!,\s*state\.settings\.projectName,\s*\{\s*objects: state\.objects,\s*rootObjects: state\.rootObjects,\s*settings: state\.settings,\s*assets: state\.assets\s*\}\s*\)/g,
  `SupabaseService.saveProject(
              state.settings.publishedProjectId!,
              state.settings.projectName,
              {
                objects: state.objects,
                rootObjects: state.rootObjects,
                settings: state.settings,
                assets: state.assets,
                scenes: updatedScenes,
                activeSceneId: state.activeSceneId
              }
            )`
);
fs.writeFileSync('src/store/useEditorStore.ts', store);
