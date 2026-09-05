import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Mail, 
  Sparkles, 
  Camera, 
  Check, 
  Image as ImageIcon,
  Sliders,
  Send,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Clock,
  Layers,
  ZoomIn,
  RefreshCw
} from 'lucide-react';

export interface SnapshotShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawImageDataUrl: string; // The base composite capture (video + WebGL canvas)
  onRetake?: () => void;
  initialWatermark?: string;
  initialIncludeTimestamp?: boolean;
}

export type SnapshotFrameStyle = 'clean' | 'ar-hud' | 'polaroid' | 'cinematic';

export const SnapshotShareModal: React.FC<SnapshotShareModalProps> = ({
  isOpen,
  onClose,
  rawImageDataUrl,
  onRetake,
  initialWatermark = 'Captured with AR Studio',
  initialIncludeTimestamp = true
}) => {
  const [watermark, setWatermark] = useState<string>(initialWatermark);
  const [showWatermark, setShowWatermark] = useState<boolean>(Boolean(initialWatermark));
  const [showTimestamp, setShowTimestamp] = useState<boolean>(initialIncludeTimestamp);
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [frameStyle, setFrameStyle] = useState<SnapshotFrameStyle>('clean');
  
  const [composedDataUrl, setComposedDataUrl] = useState<string>(rawImageDataUrl);
  const [composedBlob, setComposedBlob] = useState<Blob | null>(null);
  
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'fallback'>('idle');
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [viewZoom, setViewZoom] = useState<boolean>(false);
  const [captureTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check if Web Share API with files is supported
  const isWebShareSupported = typeof navigator !== 'undefined' && !!navigator.share;
  const isFileShareSupported = typeof navigator !== 'undefined' && !!navigator.canShare;

  // Re-compose the image on an offscreen canvas whenever custom styling/watermarks change
  useEffect(() => {
    if (!rawImageDataUrl) return;

    let isMounted = true;
    setIsComposing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!isMounted) return;

      const canvas = canvasRef.current || document.createElement('canvas');
      canvasRef.current = canvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      // Adjust dimensions for frames if needed
      if (frameStyle === 'polaroid') {
        const borderSide = Math.round(width * 0.05);
        const borderTop = Math.round(height * 0.05);
        const borderBottom = Math.round(height * 0.18);
        canvas.width = width + (borderSide * 2);
        canvas.height = height + borderTop + borderBottom;

        // Draw Polaroid card background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Photo
        ctx.drawImage(img, borderSide, borderTop, width, height);

        // Draw Polaroid handwritten-style label
        ctx.fillStyle = '#1e293b';
        ctx.font = `600 ${Math.max(16, Math.round(height * 0.038))}px 'Comic Sans MS', cursive, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelText = showWatermark && watermark ? watermark : 'Augmented Reality Moment ✨';
        ctx.fillText(labelText, canvas.width / 2, height + borderTop + (borderBottom / 2));

        if (showTimestamp) {
          ctx.fillStyle = '#64748b';
          ctx.font = `400 ${Math.max(10, Math.round(height * 0.02))}px monospace`;
          ctx.fillText(captureTime, canvas.width / 2, height + borderTop + (borderBottom * 0.82));
        }

      } else {
        canvas.width = width;
        canvas.height = height;

        // Draw Base Image
        ctx.drawImage(img, 0, 0, width, height);

        // Cinematic Vignette / Letterbox if chosen
        if (frameStyle === 'cinematic') {
          const barHeight = Math.round(height * 0.08);
          ctx.fillStyle = '#050505';
          ctx.fillRect(0, 0, width, barHeight);
          ctx.fillRect(0, height - barHeight, width, barHeight);

          // Top AR telemetry
          ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
          ctx.font = `bold ${Math.max(11, Math.round(height * 0.022))}px monospace`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('◈ AR EXPERIENCE CAPTURE', Math.round(width * 0.04), barHeight / 2);

          if (showTimestamp) {
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'right';
            ctx.fillText(captureTime, width - Math.round(width * 0.04), barHeight / 2);
          }
        }

        // Futuristic AR HUD Frame if chosen
        if (frameStyle === 'ar-hud') {
          const m = Math.round(Math.min(width, height) * 0.05);
          const cornerLen = Math.round(m * 1.5);
          const strokeW = Math.max(3, Math.round(width * 0.005));

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = strokeW;
          ctx.lineCap = 'round';

          // Top Left
          ctx.beginPath();
          ctx.moveTo(m, m + cornerLen);
          ctx.lineTo(m, m);
          ctx.lineTo(m + cornerLen, m);
          ctx.stroke();

          // Top Right
          ctx.beginPath();
          ctx.moveTo(width - m - cornerLen, m);
          ctx.lineTo(width - m, m);
          ctx.lineTo(width - m, m + cornerLen);
          ctx.stroke();

          // Bottom Left
          ctx.beginPath();
          ctx.moveTo(m, height - m - cornerLen);
          ctx.lineTo(m, height - m);
          ctx.lineTo(m + cornerLen, height - m);
          ctx.stroke();

          // Bottom Right
          ctx.beginPath();
          ctx.moveTo(width - m - cornerLen, height - m);
          ctx.lineTo(width - m, height - m);
          ctx.lineTo(width - m, height - m - cornerLen);
          ctx.stroke();

          // Center Reticle
          const cx = width / 2;
          const cy = height / 2;
          const reticleSize = Math.round(m * 0.4);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.arc(cx, cy, reticleSize, 0, Math.PI * 2);
          ctx.stroke();

          // Reticle Crosshairs
          ctx.beginPath();
          ctx.moveTo(cx - reticleSize * 1.6, cy);
          ctx.lineTo(cx - reticleSize * 0.6, cy);
          ctx.moveTo(cx + reticleSize * 0.6, cy);
          ctx.lineTo(cx + reticleSize * 1.6, cy);
          ctx.moveTo(cx, cy - reticleSize * 1.6);
          ctx.lineTo(cx, cy - reticleSize * 0.6);
          ctx.moveTo(cx, cy + reticleSize * 0.6);
          ctx.lineTo(cx, cy + reticleSize * 1.6);
          ctx.stroke();
        }

        // Overlay Watermark & Timestamp Badges for clean/ar-hud
        if (frameStyle !== 'cinematic') {
          if (showWatermark && watermark.trim()) {
            const fontSize = Math.max(12, Math.round(height * 0.03));
            ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
            
            const paddingX = Math.round(fontSize * 0.9);
            const paddingY = Math.round(fontSize * 0.45);
            const textMetrics = ctx.measureText(watermark);
            const boxWidth = textMetrics.width + (paddingX * 2);
            const boxHeight = fontSize + (paddingY * 2);
            const margin = Math.round(Math.min(width, height) * 0.04);

            let bx = width - boxWidth - margin;
            let by = height - boxHeight - margin;

            if (watermarkPosition === 'bottom-left') {
              bx = margin;
              by = height - boxHeight - margin;
            } else if (watermarkPosition === 'top-right') {
              bx = width - boxWidth - margin;
              by = margin;
            } else if (watermarkPosition === 'top-left') {
              bx = margin;
              by = margin;
            }

            // Glass badge background
            ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
            ctx.beginPath();
            ctx.roundRect(bx, by, boxWidth, boxHeight, Math.round(boxHeight * 0.3));
            ctx.fill();

            // Glow border
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
            ctx.lineWidth = Math.max(1, Math.round(width * 0.002));
            ctx.stroke();

            // Watermark text
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(watermark, bx + paddingX, by + (boxHeight / 2));
          }

          if (showTimestamp) {
            const fontSize = Math.max(10, Math.round(height * 0.022));
            ctx.font = `500 ${fontSize}px monospace`;
            
            const paddingX = Math.round(fontSize * 0.8);
            const paddingY = Math.round(fontSize * 0.4);
            const textMetrics = ctx.measureText(captureTime);
            const boxWidth = textMetrics.width + (paddingX * 2);
            const boxHeight = fontSize + (paddingY * 2);
            const margin = Math.round(Math.min(width, height) * 0.04);

            let tx = margin;
            let ty = height - boxHeight - margin;

            if (watermarkPosition === 'bottom-left') {
              tx = width - boxWidth - margin;
            }

            // Dark pill background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.beginPath();
            ctx.roundRect(tx, ty, boxWidth, boxHeight, Math.round(boxHeight * 0.3));
            ctx.fill();

            ctx.fillStyle = '#cbd5e1';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(captureTime, tx + paddingX, ty + (boxHeight / 2));
          }
        }
      }

      // Convert to blob and dataUrl
      const finalDataUrl = canvas.toDataURL('image/png', 0.95);
      setComposedDataUrl(finalDataUrl);

      canvas.toBlob((blob) => {
        if (isMounted && blob) {
          setComposedBlob(blob);
        }
        setIsComposing(false);
      }, 'image/png', 0.95);
    };

    img.src = rawImageDataUrl;

    return () => {
      isMounted = false;
    };
  }, [rawImageDataUrl, watermark, showWatermark, showTimestamp, watermarkPosition, frameStyle, captureTime]);

  if (!isOpen) return null;

  // 1. Generate formatted filename
  const getFormattedFilename = () => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
    return `AR_Snapshot_${dateStr}_${timeStr}.png`;
  };

  // 2. Direct Download / Save to Device
  const handleSaveToDevice = () => {
    const filename = getFormattedFilename();
    const link = document.createElement('a');
    link.download = filename;
    link.href = composedDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Web Share API (Native mobile share to Instagram, WhatsApp, AirDrop, Twitter, etc.)
  const handleNativeShare = async () => {
    const filename = getFormattedFilename();
    const shareTitle = 'AR Experience Snapshot';
    const shareText = `Check out this Augmented Reality experience snapshot! 🚀✨ #WebAR #AR`;

    try {
      if (composedBlob && isFileShareSupported) {
        const file = new File([composedBlob], filename, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            files: [file]
          });
          setShareStatus('success');
          setTimeout(() => setShareStatus('idle'), 3000);
          return;
        }
      }

      // Fallback share without file if file sharing fails or is unsupported
      if (isWebShareSupported) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href
        });
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 3000);
      } else {
        // Fallback to clipboard
        handleCopyToClipboard();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Share error, falling back:', err);
        handleCopyToClipboard();
      }
    }
  };

  // 4. Copy Image to Clipboard
  const handleCopyToClipboard = async () => {
    try {
      if (composedBlob && typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': composedBlob
          })
        ]);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2500);
        return;
      }

      // Fallback to copying URL or text
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2500);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2500);
    }
  };

  // 5. Share via Email
  const handleShareEmail = () => {
    const subject = encodeURIComponent(`AR Snapshot: ${watermark || 'Interactive AR Experience'}`);
    const body = encodeURIComponent(
      `Hi there,\n\nI captured an interactive Augmented Reality snapshot on ${captureTime}!\n\nCheck out the experience here: ${window.location.href}\n\n(Snapshot image saved to device / attached)`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // 6. Direct Social Links
  const handleSocialShare = (platform: 'twitter' | 'whatsapp' | 'facebook' | 'linkedin' | 'telegram') => {
    const text = encodeURIComponent(`Check out my Augmented Reality experience snapshot! 🚀✨ #WebAR #3D #AR`);
    const url = encodeURIComponent(window.location.href);

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=500,location=no,menubar=no');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[95vh] bg-[#121216] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#16161c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                AR Snapshot Studio
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                  HD Capture
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">Preview, customize, save to storage, or share instantly</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRetake && (
              <button
                onClick={() => {
                  onClose();
                  onRetake();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 flex items-center gap-1.5 transition-colors"
                title="Retake photo"
              >
                <RefreshCw size={13} />
                <span className="hidden sm:inline">Retake</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              title="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Content (2-Column on Desktop: Preview + Controls) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-white/10 min-h-0">
          
          {/* Left Column: Image Preview Canvas */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col items-center justify-center bg-[#09090c] relative select-none">
            <div className="relative max-w-full max-h-[55vh] lg:max-h-[65vh] flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/60 group">
              <img
                src={composedDataUrl}
                alt="AR Screenshot Preview"
                className={`max-w-full max-h-[55vh] lg:max-h-[65vh] object-contain transition-transform duration-200 ${viewZoom ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'}`}
                onClick={() => setViewZoom(!viewZoom)}
              />

              {isComposing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-2 text-xs font-medium text-blue-300">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                  Rendering snapshot...
                </div>
              )}

              <button
                onClick={() => setViewZoom(!viewZoom)}
                className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white/80 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 text-xs flex items-center gap-1"
                title={viewZoom ? 'Zoom out' : 'Zoom in'}
              >
                <ZoomIn size={14} />
                <span>{viewZoom ? 'Zoom Out' : 'Zoom'}</span>
              </button>
            </div>

            <div className="mt-3 flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-neutral-500" />
                {captureTime}
              </span>
              <span>•</span>
              <span className="text-emerald-400">Ready to save / share</span>
            </div>
          </div>

          {/* Right Column: Customization & Sharing Actions */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto bg-[#141419]">
            
            {/* Primary Action Buttons */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Save & Share</label>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Save / Download to Device */}
                <button
                  onClick={handleSaveToDevice}
                  className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
                  title="Save PNG image directly to your device storage"
                >
                  <Download size={15} />
                  <span>Save to Device</span>
                </button>

                {/* Native Web Share */}
                <button
                  onClick={handleNativeShare}
                  className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
                  title="Share image directly via WhatsApp, Instagram, Messages, AirDrop, etc."
                >
                  <Share2 size={15} />
                  <span>{shareStatus === 'success' ? 'Shared!' : 'Native Share'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-0.5">
                {/* Copy to Clipboard */}
                <button
                  onClick={handleCopyToClipboard}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-medium text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  title="Copy full image directly to clipboard"
                >
                  {copyStatus === 'copied' ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied Image!</span>
                    </>
                  ) : copyStatus === 'error' ? (
                    <>
                      <Copy size={14} className="text-amber-400" />
                      <span className="text-amber-400">Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Image</span>
                    </>
                  )}
                </button>

                {/* Share via Email */}
                <button
                  onClick={handleShareEmail}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-medium text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  title="Compose email with AR snapshot information"
                >
                  <Mail size={14} />
                  <span>Email Snapshot</span>
                </button>
              </div>
            </div>

            {/* Social Media Quick Share */}
            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
              <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Social Media & Messaging</label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSocialShare('whatsapp')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                  title="Share on WhatsApp"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#1DA1F2]/15 hover:bg-[#1DA1F2]/25 border border-[#1DA1F2]/30 text-[#1DA1F2] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                  title="Share on X / Twitter"
                >
                  <Twitter size={13} />
                  <span>X / Tweet</span>
                </button>
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 text-[#1877F2] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                  title="Share on Facebook"
                >
                  <Facebook size={13} />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => handleSocialShare('telegram')}
                  className="py-1.5 px-2.5 rounded-lg bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/30 text-[#0088cc] text-[11px] font-medium flex items-center justify-center transition-colors"
                  title="Share on Telegram"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>

            {/* Customization & Frame Styling */}
            <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Sliders size={11} className="text-blue-400" />
                  Customize Photo & Frame
                </label>
              </div>

              {/* Frame Style Selector */}
              <div className="grid grid-cols-4 gap-1.5">
                {(['clean', 'ar-hud', 'cinematic', 'polaroid'] as SnapshotFrameStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setFrameStyle(style)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-medium capitalize border transition-all ${
                      frameStyle === style
                        ? 'bg-blue-600/25 border-blue-500 text-blue-300 font-semibold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {style.replace('-', ' ')}
                  </button>
                ))}
              </div>

              {/* Watermark Controls */}
              <div className="flex flex-col gap-1.5 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-neutral-300 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-400" />
                    Watermark / Badge
                  </label>
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="rounded accent-blue-500 cursor-pointer"
                  />
                </div>

                {showWatermark && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <input
                      type="text"
                      placeholder="Custom watermark text..."
                      value={watermark}
                      onChange={(e) => setWatermark(e.target.value)}
                      className="w-full bg-black/60 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white placeholder-neutral-500 focus:border-blue-500 outline-none"
                    />

                    {frameStyle !== 'polaroid' && frameStyle !== 'cinematic' && (
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-0.5">
                        <span>Position:</span>
                        <div className="flex items-center gap-1">
                          {(['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const).map((pos) => (
                            <button
                              key={pos}
                              onClick={() => setWatermarkPosition(pos)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                                watermarkPosition === pos
                                  ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                                  : 'bg-black/40 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                              }`}
                            >
                              {pos.replace('bottom-', 'B-').replace('top-', 'T-').replace('right', 'R').replace('left', 'L')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp Toggle */}
              <div className="flex items-center justify-between bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
                <label className="text-[11px] text-neutral-300 flex items-center gap-1.5">
                  <Clock size={12} className="text-blue-400" />
                  Include Timestamp Badge
                </label>
                <input
                  type="checkbox"
                  checked={showTimestamp}
                  onChange={(e) => setShowTimestamp(e.target.checked)}
                  className="rounded accent-blue-500 cursor-pointer"
                />
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
