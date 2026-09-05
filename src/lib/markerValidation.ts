import { SceneObject, ProjectSettings } from '../types';
import { DEFAULT_ART_POSTER_TEXTURE } from './arTargetTexture';

export interface MarkerValidationIssue {
  id: string;
  type: 'identical_image' | 'similar_image' | 'overlapping_position' | 'single_mode_multiple_targets';
  severity: 'error' | 'warning';
  primaryTargetId: string;
  primaryTargetName: string;
  conflictingTargetId?: string;
  conflictingTargetName?: string;
  similarityScore?: number; // 0 to 100%
  title: string;
  message: string;
  recommendation: string;
}

export interface MarkerValidationReport {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  totalTargets: number;
  targetMode: 'single' | 'multi';
  issues: MarkerValidationIssue[];
  conflictedTargetIds: string[];
}

// In-memory cache for computed perceptual hashes/fingerprints to prevent re-processing
const imageFingerprintCache = new Map<string, { hash: string; avgColor: number[] }>();

/**
 * Computes a lightweight perceptual difference hash (dHash) from an image URL.
 * Generates a 64-bit binary fingerprint based on gradient changes across a downsampled 9x8 canvas.
 */
export async function computeImageFingerprint(imageUrl: string): Promise<{ hash: string; avgColor: number[] } | null> {
  if (!imageUrl) return null;
  if (imageFingerprintCache.has(imageUrl)) {
    return imageFingerprintCache.get(imageUrl)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const width = 9;
        const height = 8;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height).data;

        // Convert to grayscale matrix
        const gray: number[][] = [];
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let y = 0; y < height; y++) {
          gray[y] = [];
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            rSum += r; gSum += g; bSum += b; count++;
            gray[y][x] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          }
        }

        // Compute 64-bit dHash by comparing adjacent horizontal pixels
        let hash = '';
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width - 1; x++) {
            hash += gray[y][x] > gray[y][x + 1] ? '1' : '0';
          }
        }

        const fingerprint = {
          hash,
          avgColor: [Math.round(rSum / count), Math.round(gSum / count), Math.round(bSum / count)]
        };
        imageFingerprintCache.set(imageUrl, fingerprint);
        resolve(fingerprint);
      } catch (err) {
        // Cross-origin taint or canvas read error
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = imageUrl;
  });
}

/**
 * Calculates similarity percentage between two 64-bit dHash strings (0 to 100%).
 */
export function calculateHashSimilarity(hashA: string, hashB: string): number {
  if (!hashA || !hashB || hashA.length !== hashB.length) return 0;
  let matches = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] === hashB[i]) matches++;
  }
  return Math.round((matches / hashA.length) * 100);
}

/**
 * Normalizes texture URL for comparison by stripping transient URL parameters or query strings.
 */
export function normalizeImageUrl(url?: string): string {
  if (!url) return DEFAULT_ART_POSTER_TEXTURE;
  const trimmed = url.trim();
  try {
    if (trimmed.startsWith('data:')) {
      // Data URLs: compare full content up to 1000 chars or prefix signature
      return trimmed.slice(0, 1000);
    }
    const parsed = new URL(trimmed, window.location.href);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.toLowerCase();
  } catch {
    return trimmed.split('?')[0].toLowerCase();
  }
}

/**
 * Performs fast synchronous validation of image targets in the scene.
 * Checks for:
 * 1. Identical reference image URLs / presets
 * 2. Overlapping 3D marker coordinates
 * 3. Single-marker mode with multiple targets in scene
 */
export function validateMarkersSync(
  objects: Record<string, SceneObject>,
  settings?: ProjectSettings
): MarkerValidationReport {
  const targetMode = settings?.targetMode || 'single';
  const imageTargets = Object.values(objects).filter(
    (obj) => obj && obj.type === 'imageTarget' && (obj.properties?.targetType || 'image') !== 'face'
  );

  const issues: MarkerValidationIssue[] = [];
  const conflictedTargetIds = new Set<string>();

  // Rule 1: Single Marker Mode with Multiple Targets
  if (targetMode === 'single' && imageTargets.length > 1) {
    issues.push({
      id: 'single_mode_overflow',
      type: 'single_mode_multiple_targets',
      severity: 'warning',
      primaryTargetId: imageTargets[0].id,
      primaryTargetName: imageTargets[0].name,
      title: 'Single Marker Mode with Multiple Targets',
      message: `Scene contains ${imageTargets.length} image targets, but Project Setting is currently in "Single Marker Mode". Only the primary target ("${imageTargets[0].name}") will be initialized and tracked in WebAR.`,
      recommendation: 'Toggle "Target Tracking Mode" to "Multi-Target Mode" in Project Settings to dynamically initialize and register all markers simultaneously.'
    });
    // Mark secondary targets
    for (let i = 1; i < imageTargets.length; i++) {
      conflictedTargetIds.add(imageTargets[i].id);
    }
  }

  // Pairwise comparisons
  for (let i = 0; i < imageTargets.length; i++) {
    for (let j = i + 1; j < imageTargets.length; j++) {
      const targetA = imageTargets[i];
      const targetB = imageTargets[j];

      const urlA = targetA.properties?.textureUrl || DEFAULT_ART_POSTER_TEXTURE;
      const urlB = targetB.properties?.textureUrl || DEFAULT_ART_POSTER_TEXTURE;
      const normA = normalizeImageUrl(urlA);
      const normB = normalizeImageUrl(urlB);

      // Rule 2: Identical Reference Images
      const isExactIdentical = normA === normB || (urlA && urlB && urlA.trim() === urlB.trim());
      if (isExactIdentical) {
        conflictedTargetIds.add(targetA.id);
        conflictedTargetIds.add(targetB.id);

        issues.push({
          id: `identical_${targetA.id}_${targetB.id}`,
          type: 'identical_image',
          severity: 'error',
          primaryTargetId: targetA.id,
          primaryTargetName: targetA.name,
          conflictingTargetId: targetB.id,
          conflictingTargetName: targetB.name,
          similarityScore: 100,
          title: 'Identical Reference Images Conflict',
          message: `Target "${targetA.name}" and Target "${targetB.name}" use the exact same reference image. WebAR image tracking algorithms cannot differentiate identical patterns, which causes tracking flickering, false positives, or failure to register.`,
          recommendation: `Change the reference image for "${targetB.name}" to a distinct, unique image with high feature contrast.`
        });
      }

      // Rule 3: 3D Spatial Position Overlap
      const posA = targetA.position || [0, 0, 0];
      const posB = targetB.position || [0, 0, 0];
      const dist = Math.hypot(posA[0] - posB[0], posA[1] - posB[1], posA[2] - posB[2]);

      // If within 0.2 units in 3D world space
      if (dist < 0.2) {
        conflictedTargetIds.add(targetA.id);
        conflictedTargetIds.add(targetB.id);

        issues.push({
          id: `overlap_${targetA.id}_${targetB.id}`,
          type: 'overlapping_position',
          severity: 'warning',
          primaryTargetId: targetA.id,
          primaryTargetName: targetA.name,
          conflictingTargetId: targetB.id,
          conflictingTargetName: targetB.name,
          title: 'Overlapping 3D Marker Coordinates',
          message: `Target "${targetA.name}" and Target "${targetB.name}" are placed at nearly identical 3D positions (distance: ${dist.toFixed(2)}m). Their attached 3D content will clip and occupy the same visual area.`,
          recommendation: `Reposition one of the targets in the 3D viewport or Inspector transform panel.`
        });
      }
    }
  }

  const hasErrors = issues.some((iss) => iss.severity === 'error');
  const hasWarnings = issues.some((iss) => iss.severity === 'warning');

  return {
    isValid: issues.length === 0,
    hasErrors,
    hasWarnings,
    totalTargets: imageTargets.length,
    targetMode,
    issues,
    conflictedTargetIds: Array.from(conflictedTargetIds)
  };
}

/**
 * Asynchronously performs perceptual similarity analysis on image targets with distinct URLs.
 * Detects reference images that look too similar (>88% perceptual hash match).
 */
export async function validateMarkersPerceptual(
  objects: Record<string, SceneObject>,
  settings?: ProjectSettings
): Promise<MarkerValidationReport> {
  const syncReport = validateMarkersSync(objects, settings);
  const imageTargets = Object.values(objects).filter(
    (obj) => obj && obj.type === 'imageTarget' && (obj.properties?.targetType || 'image') !== 'face'
  );

  if (imageTargets.length < 2) {
    return syncReport;
  }

  // Extract URLs
  const targetFingerprints: { id: string; name: string; url: string; fp: { hash: string; avgColor: number[] } | null }[] = [];

  for (const target of imageTargets) {
    const url = target.properties?.textureUrl || DEFAULT_ART_POSTER_TEXTURE;
    const fp = await computeImageFingerprint(url);
    targetFingerprints.push({ id: target.id, name: target.name, url, fp });
  }

  const additionalIssues: MarkerValidationIssue[] = [];
  const conflictedSet = new Set<string>(syncReport.conflictedTargetIds);

  for (let i = 0; i < targetFingerprints.length; i++) {
    for (let j = i + 1; j < targetFingerprints.length; j++) {
      const a = targetFingerprints[i];
      const b = targetFingerprints[j];

      // Skip if already flagged as identical in sync check
      if (normalizeImageUrl(a.url) === normalizeImageUrl(b.url)) continue;

      if (a.fp && b.fp) {
        const similarity = calculateHashSimilarity(a.fp.hash, b.fp.hash);
        // If similarity is 88% or higher, they are dangerously similar for keypoint detection
        if (similarity >= 88) {
          conflictedSet.add(a.id);
          conflictedSet.add(b.id);

          additionalIssues.push({
            id: `similar_${a.id}_${b.id}`,
            type: 'similar_image',
            severity: similarity >= 94 ? 'error' : 'warning',
            primaryTargetId: a.id,
            primaryTargetName: a.name,
            conflictingTargetId: b.id,
            conflictingTargetName: b.name,
            similarityScore: similarity,
            title: `Reference Images Too Similar (${similarity}% Match)`,
            message: `Target "${a.name}" and Target "${b.name}" share an estimated ${similarity}% perceptual visual similarity. Very similar textures confuse natural feature point matching in WebAR image trackers, causing marker cross-talk and jitter.`,
            recommendation: `Use reference images with distinct shapes, contrasting color distributions, and unique visual keypoints.`
          });
        }
      }
    }
  }

  const combinedIssues = [...syncReport.issues, ...additionalIssues];
  return {
    isValid: combinedIssues.length === 0,
    hasErrors: combinedIssues.some((iss) => iss.severity === 'error'),
    hasWarnings: combinedIssues.some((iss) => iss.severity === 'warning'),
    totalTargets: imageTargets.length,
    targetMode: syncReport.targetMode,
    issues: combinedIssues,
    conflictedTargetIds: Array.from(conflictedSet)
  };
}
