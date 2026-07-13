export interface ImageInfo {
  width: number;
  height: number;
  aspectRatio: number;
}

export const getImageInfo = (url: string): Promise<ImageInfo> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("No URL provided"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
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
}

export const downsampleTexture = (
  url: string,
  targetMaxDim: number
): Promise<DownsampleResult> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("No URL provided"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const origW = img.naturalWidth;
      const origH = img.naturalHeight;
      
      let targetW = origW;
      let targetH = origH;
      
      if (origW > targetMaxDim || origH > targetMaxDim) {
        if (origW > origH) {
          targetW = targetMaxDim;
          targetH = Math.round((origH * targetMaxDim) / origW);
        } else {
          targetH = targetMaxDim;
          targetW = Math.round((origW * targetMaxDim) / origH);
        }
      } else {
        // If it's already smaller, we can still run it through canvas to compress it
        // Or keep its size. Let's keep its size but compress.
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Failed to get 2D canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, targetW, targetH);
      
      // Determine format based on URL
      const isPng = url.toLowerCase().includes('.png') || url.startsWith('data:image/png');
      const format = isPng ? 'image/png' : 'image/jpeg';
      const quality = isPng ? undefined : 0.82;
      
      try {
        const optimizedUrl = canvas.toDataURL(format, quality);
        resolve({
          url: optimizedUrl,
          width: targetW,
          height: targetH,
          originalWidth: origW,
          originalHeight: origH
        });
      } catch (e: any) {
        console.error("Error downsampling texture:", e);
        if (e.name === 'SecurityError') {
          reject(new Error("CORS Security Restriction: This image is hosted on an external server that restricts direct canvas access. Try uploading the image as a local asset to optimize it!"));
        } else {
          reject(e);
        }
      }
    };
    img.onerror = () => {
      reject(new Error("Failed to load image. Verify the URL is valid."));
    };
    img.src = url;
  });
};
