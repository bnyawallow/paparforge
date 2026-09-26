export interface ImageInfo {
  width: number;
  height: number;
  aspectRatio: number;
  isPowerOfTwo?: boolean;
}

export const nearestPowerOfTwo = (val: number): number => {
  const potSizes = [64, 128, 256, 512, 1024, 2048, 4096];
  return potSizes.reduce((prev, curr) => 
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
};

export const isPowerOfTwoNumber = (n: number): boolean => {
  return n > 0 && (n & (n - 1)) === 0;
};

export const isPowerOfTwo = (w: number, h: number): boolean => {
  return isPowerOfTwoNumber(w) && isPowerOfTwoNumber(h);
};

export interface TextureMobileARAnalysis {
  url: string;
  width: number;
  height: number;
  isPOT: boolean;
  isNPOT: boolean;
  aspectRatio: number;
  recommendedWidth: number;
  recommendedHeight: number;
  recommendedBitDepth: 'jpeg-8bit' | 'webp-8bit' | 'png-32bit';
  estimatedOrigVramKb: number;
  estimatedOptVramKb: number;
  vramSavingsPercent: number;
  arRecommendation: string;
  severity: 'critical' | 'warning' | 'optimal';
}

export const getImageInfo = (url: string): Promise<ImageInfo> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("No URL provided"));
      return;
    }

    if (url.startsWith('primitive:') || url.endsWith('.svg')) {
      resolve({
        width: 512,
        height: 512,
        aspectRatio: 1,
        isPowerOfTwo: true
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth || 512;
      const h = img.naturalHeight || 512;
      resolve({
        width: w,
        height: h,
        aspectRatio: w / (h || 1),
        isPowerOfTwo: isPowerOfTwo(w, h)
      });
    };
    img.onerror = (err) => {
      // Return safe fallback rather than hard rejection to allow offline/CORS resilience
      resolve({
        width: 1024,
        height: 1024,
        aspectRatio: 1,
        isPowerOfTwo: true
      });
    };
    img.src = url;
  });
};

export const analyzeTextureForMobileAR = async (
  url: string, 
  mapType: string = 'Diffuse Map'
): Promise<TextureMobileARAnalysis> => {
  const info = await getImageInfo(url);
  const w = info.width;
  const h = info.height;
  const pot = isPowerOfTwo(w, h);

  let recW = 1024;
  let recH = 1024;

  if (Math.max(w, h) > 1024) {
    // Mobile AR target recommendation: clamp to 1024 max POT
    if (w >= h) {
      recW = 1024;
      recH = nearestPowerOfTwo(Math.round((h * 1024) / w));
    } else {
      recH = 1024;
      recW = nearestPowerOfTwo(Math.round((w * 1024) / h));
    }
  } else {
    recW = nearestPowerOfTwo(w);
    recH = nearestPowerOfTwo(h);
  }

  recW = Math.max(64, Math.min(2048, recW));
  recH = Math.max(64, Math.min(2048, recH));

  // Determine recommended bit depth
  const isAlphaMap = mapType.toLowerCase().includes('alpha') || mapType.toLowerCase().includes('opacity') || url.endsWith('.png');
  const recommendedBitDepth: 'jpeg-8bit' | 'webp-8bit' | 'png-32bit' = isAlphaMap 
    ? (typeof OffscreenCanvas !== 'undefined' ? 'webp-8bit' : 'png-32bit')
    : 'jpeg-8bit';

  const origVramBytes = w * h * 4;
  const optVramBytes = recW * recH * (recommendedBitDepth === 'jpeg-8bit' ? 3 : 4);
  const origKb = Math.round(origVramBytes / 1024);
  const optKb = Math.round(optVramBytes / 1024);
  const savingsPct = Math.max(0, Math.round(((origVramBytes - optVramBytes) / origVramBytes) * 100));

  let arRecommendation = 'Texture is power-of-two compliant for hardware mobile AR mipmapping.';
  let severity: 'critical' | 'warning' | 'optimal' = 'optimal';

  if (!pot) {
    if (Math.max(w, h) > 1024) {
      severity = 'critical';
      arRecommendation = `NPOT Alert: ${w}x${h} forces software mipmap generation on mobile GPU. Recommend downsampling to ${recW}x${recH} POT (${recommendedBitDepth}) for stable 60 FPS mobile AR tracking.`;
    } else {
      severity = 'warning';
      arRecommendation = `NPOT Warning: ${w}x${h} is non-power-of-two. Compress to ${recW}x${recH} POT to eliminate GPU software resampling overhead.`;
    }
  } else if (Math.max(w, h) > 1024) {
    severity = 'warning';
    arRecommendation = `High Resolution (${w}x${h}): Recommend clamping to 1024x1024 POT for low-memory mobile AR targets.`;
  }

  return {
    url,
    width: w,
    height: h,
    isPOT: pot,
    isNPOT: !pot,
    aspectRatio: info.aspectRatio,
    recommendedWidth: recW,
    recommendedHeight: recH,
    recommendedBitDepth,
    estimatedOrigVramKb: origKb,
    estimatedOptVramKb: optKb,
    vramSavingsPercent: savingsPct,
    arRecommendation,
    severity
  };
};

export interface DownsampleResult {
  url: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  format?: string;
  quality?: number;
  estimatedVramSavedKb?: number;
}

export interface CompressOptions {
  targetPot?: number; // Target power-of-two max dimension: 256, 512, 1024, 2048
  forceSquarePOT?: boolean;
  bitDepthFormat?: 'jpeg-8bit' | 'webp-8bit' | 'png-32bit';
  quality?: number; // 0.1 to 1.0
}

export const compressTexturePOT = (
  url: string,
  options: CompressOptions = {}
): Promise<DownsampleResult> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("No URL provided"));
      return;
    }

    // Handle SVG or primitive URLs safely
    if (url.startsWith('primitive:') || url.endsWith('.svg')) {
      resolve({
        url,
        width: 512,
        height: 512,
        originalWidth: 512,
        originalHeight: 512
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const origW = img.naturalWidth || 1024;
      const origH = img.naturalHeight || 1024;

      const maxDim = options.targetPot || nearestPowerOfTwo(Math.max(origW, origH));
      
      let targetW = maxDim;
      let targetH = maxDim;

      if (!options.forceSquarePOT) {
        if (origW >= origH) {
          targetW = maxDim;
          targetH = nearestPowerOfTwo(Math.round((origH * maxDim) / origW));
        } else {
          targetH = maxDim;
          targetW = nearestPowerOfTwo(Math.round((origW * maxDim) / origH));
        }
      }

      targetW = Math.max(64, targetW);
      targetH = Math.max(64, targetH);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Failed to get 2D canvas context"));
        return;
      }

      // Fill black background for JPEG compression to handle transparent PNGs
      if (options.bitDepthFormat === 'jpeg-8bit') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      let mimeType = 'image/jpeg';
      let qualityVal = options.quality ?? 0.78;

      if (options.bitDepthFormat === 'png-32bit') {
        mimeType = 'image/png';
        qualityVal = undefined as any;
      } else if (options.bitDepthFormat === 'webp-8bit') {
        mimeType = 'image/webp';
        qualityVal = options.quality ?? 0.80;
      } else {
        // default jpeg-8bit
        mimeType = 'image/jpeg';
        qualityVal = options.quality ?? 0.75;
      }

      try {
        const optimizedUrl = canvas.toDataURL(mimeType, qualityVal);
        
        // Estimate original vs optimized VRAM (width * height * 4 bytes RGBA)
        const origVramBytes = origW * origH * 4;
        const optVramBytes = targetW * targetH * (options.bitDepthFormat === 'jpeg-8bit' ? 3 : 4);
        const vramSavedKb = Math.max(0, Math.round((origVramBytes - optVramBytes) / 1024));

        resolve({
          url: optimizedUrl,
          width: targetW,
          height: targetH,
          originalWidth: origW,
          originalHeight: origH,
          format: mimeType,
          quality: qualityVal,
          estimatedVramSavedKb: vramSavedKb
        });
      } catch (e: any) {
        console.error("Error compressing texture:", e);
        if (e.name === 'SecurityError') {
          reject(new Error("CORS Security Restriction: External texture URL cannot be processed in canvas directly."));
        } else {
          reject(e);
        }
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image texture for compression."));
    };
    img.src = url;
  });
};

export const downsampleTexture = (
  url: string,
  targetMaxDim: number
): Promise<DownsampleResult> => {
  return compressTexturePOT(url, { targetPot: nearestPowerOfTwo(targetMaxDim), bitDepthFormat: 'jpeg-8bit' });
};

