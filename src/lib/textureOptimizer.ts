export interface ImageInfo {
  width: number;
  height: number;
  aspectRatio: number;
  isPowerOfTwo?: boolean;
}

export const nearestPowerOfTwo = (val: number): number => {
  const potSizes = [128, 256, 512, 1024, 2048, 4096];
  return potSizes.reduce((prev, curr) => 
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
};

export const isPowerOfTwo = (w: number, h: number): boolean => {
  return (w & (w - 1)) === 0 && (h & (h - 1)) === 0;
};

export const getImageInfo = (url: string): Promise<ImageInfo> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("No URL provided"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      resolve({
        width: w,
        height: h,
        aspectRatio: w / h,
        isPowerOfTwo: isPowerOfTwo(w, h)
      });
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = url;
  });
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

