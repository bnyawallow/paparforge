const fs = require('fs');
let code = fs.readFileSync('src/store/useEditorStore.ts', 'utf-8');
const target = `    removeRecursive(id);

    return {
      objects: newObjects,
      rootObjects: state.rootObjects.filter(rootId => rootId !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
      selectedObjectIds: state.selectedObjectIds.includes(id) ? state.selectedObjectIds.filter(x => x !== id) : state.selectedObjectIds,
      selectedObjectRef: state.selectedObjectId === id ? null : state.selectedObjectRef,
      past: newPast,`;
const replacement = `    removeRecursive(id);
    
    const isSelectedDeleted = state.selectedObjectId && !newObjects[state.selectedObjectId];

    return {
      objects: newObjects,
      rootObjects: state.rootObjects.filter(rootId => rootId !== id),
      selectedObjectId: isSelectedDeleted ? null : state.selectedObjectId,
      selectedObjectIds: state.selectedObjectIds.filter(x => newObjects[x]),
      selectedObjectRef: isSelectedDeleted ? null : state.selectedObjectRef,
      past: newPast,`;
code = code.replace(target, replacement);
fs.writeFileSync('src/store/useEditorStore.ts', code, 'utf-8');
