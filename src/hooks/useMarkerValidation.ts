import { useState, useEffect, useMemo, useCallback } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import {
  MarkerValidationReport,
  validateMarkersSync,
  validateMarkersPerceptual
} from '../lib/markerValidation';
import { SAMPLE_TARGET_TEXTURES } from '../lib/arTargetTexture';

export function useMarkerValidation() {
  const objects = useEditorStore((state) => state.objects);
  const settings = useEditorStore((state) => state.settings);
  const updateObject = useEditorStore((state) => state.updateObject);
  const updateSettings = useEditorStore((state) => state.updateSettings);
  const addToast = useEditorStore((state) => state.addToast);

  // Synchronous report is calculated immediately with memo
  const syncReport = useMemo(() => {
    return validateMarkersSync(objects, settings);
  }, [objects, settings]);

  const [perceptualReport, setPerceptualReport] = useState<MarkerValidationReport | null>(null);

  // Background perceptual comparison
  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(async () => {
      try {
        const fullReport = await validateMarkersPerceptual(objects, settings);
        if (isMounted) {
          setPerceptualReport(fullReport);
        }
      } catch (err) {
        console.warn('Perceptual marker validation warning:', err);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [objects, settings]);

  const report = perceptualReport || syncReport;

  // Helper to auto-resolve identical/conflicting target texture by assigning an unused preset
  const resolveTargetTexture = useCallback((targetId: string) => {
    const target = objects[targetId];
    if (!target) return;

    // Find textures currently in use by other targets
    const usedTextures = new Set(
      Object.values(objects)
        .filter((o) => o && o.type === 'imageTarget' && o.id !== targetId)
        .map((o) => o.properties?.textureUrl)
        .filter(Boolean)
    );

    // Find an unused preset
    const availablePreset = SAMPLE_TARGET_TEXTURES.find((p) => !usedTextures.has(p.url));
    const newUrl = availablePreset ? availablePreset.url : SAMPLE_TARGET_TEXTURES[1].url;

    updateObject(targetId, {
      properties: {
        ...target.properties,
        textureUrl: newUrl
      }
    });

    addToast(`Updated reference image for "${target.name}" to resolve marker conflict!`);
  }, [objects, updateObject, addToast]);

  const switchToMultiTargetMode = useCallback(() => {
    updateSettings({ targetMode: 'multi' });
    addToast('Switched to Multi-Target Mode: AR engine can now track multiple markers simultaneously!');
  }, [updateSettings, addToast]);

  const switchToSingleMarkerMode = useCallback(() => {
    updateSettings({ targetMode: 'single' });
    addToast('Switched to Single Marker Mode');
  }, [updateSettings, addToast]);

  return {
    report,
    hasConflicts: !report.isValid,
    hasErrors: report.hasErrors,
    hasWarnings: report.hasWarnings,
    conflictedTargetIds: report.conflictedTargetIds,
    resolveTargetTexture,
    switchToMultiTargetMode,
    switchToSingleMarkerMode
  };
}
