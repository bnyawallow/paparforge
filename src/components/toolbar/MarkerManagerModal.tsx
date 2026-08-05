import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, CheckCircle, AlertTriangle, Image as ImageIcon, Download, QrCode, Printer, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { fileToDataUrl } from '../../lib/fileUtils';

export function MarkerManagerModal({ onClose }: { onClose: () => void }) {
  const { objects, updateObject, settings, updateSettings } = useEditorStore();
  const imageTarget = Object.values(objects).find(o => o.type === 'imageTarget');
  
  const [activeTab, setActiveTab] = useState<'generator' | 'analyzer'>('generator');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageTarget?.properties.textureUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80');
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // AR Marker Generator State
  const [campaignTitle, setCampaignTitle] = useState('Interactive 3D AR Experience');
  const [campaignSubtext, setCampaignSubtext] = useState('Point your camera at this marker to bring 3D models to life');
  const [campaignUrl, setCampaignUrl] = useState(window.location.href || 'https://ai.studio/build');
  const [markerStyle, setMarkerStyle] = useState<'fiducial' | 'qr_frame' | 'matrix' | 'minimal'>('fiducial');
  const [frameColor, setFrameColor] = useState('#000000');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [includeQrCode, setIncludeQrCode] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = await fileToDataUrl(file);
      setPreviewUrl(url);
      setScore(null);
    }
  };

  const analyzeMarker = () => {
    if (!previewUrl) return;
    setAnalyzing(true);
    
    // Simulate analysis delay and score calculation
    setTimeout(() => {
      // Create a pseudo-random score between 60 and 95
      const randomScore = Math.floor(Math.random() * 35) + 60;
      setScore(randomScore);
      setAnalyzing(false);
    }, 1200);
  };

  const registerMarker = () => {
    if (previewUrl && imageTarget) {
      updateObject(imageTarget.id, {
        properties: {
          ...imageTarget.properties,
          textureUrl: previewUrl
        }
      });
      // Use the file name without extension as the target name if a new file was uploaded
      if (selectedFile) {
        const name = selectedFile.name.split('.')[0].replace(/[^a-zA-Z0-9-]/g, '-');
        updateSettings({ imageTargetName: name });
      }
    }
    onClose();
  };

  // Helper function to draw a high-res printable AR Marker Card to HTML canvas
  const drawPrintableMarkerCanvas = (canvas: HTMLCanvasElement, forExport = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // Outer Campaign Poster Border
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = w * 0.012;
    ctx.strokeRect(w * 0.03, h * 0.02, w * 0.94, h * 0.96);

    // Header Title
    ctx.fillStyle = frameColor;
    ctx.font = `bold ${Math.round(w * 0.042)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(campaignTitle.toUpperCase(), w / 2, h * 0.07);

    // Subtitle tagline
    ctx.fillStyle = '#4B5563';
    ctx.font = `${Math.round(w * 0.022)}px sans-serif`;
    ctx.fillText(campaignSubtext, w / 2, h * 0.10);

    // Main Target Image Box Area
    const targetSize = Math.min(w * 0.65, h * 0.48);
    const targetX = (w - targetSize) / 2;
    const targetY = h * 0.15;

    // Outer Optical Border Frame for AR Camera tracking
    if (markerStyle === 'fiducial') {
      // High contrast black border frame
      ctx.fillStyle = '#000000';
      ctx.fillRect(targetX - 24, targetY - 24, targetSize + 48, targetSize + 48);

      // White inner separator
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(targetX - 12, targetY - 12, targetSize + 24, targetSize + 24);

      // Fiducial corner targets (L-shaped optical tracking marks)
      const cornerSize = 40;
      ctx.fillStyle = accentColor;
      
      // Top Left Corner Mark
      ctx.fillRect(targetX - 34, targetY - 34, cornerSize, 12);
      ctx.fillRect(targetX - 34, targetY - 34, 12, cornerSize);
      
      // Top Right Corner Mark
      ctx.fillRect(targetX + targetSize + 34 - cornerSize, targetY - 34, cornerSize, 12);
      ctx.fillRect(targetX + targetSize + 22, targetY - 34, 12, cornerSize);
      
      // Bottom Left Corner Mark
      ctx.fillRect(targetX - 34, targetY + targetSize + 22, cornerSize, 12);
      ctx.fillRect(targetX - 34, targetY + targetSize + 34 - cornerSize, 12, cornerSize);
      
      // Bottom Right Corner Mark
      ctx.fillRect(targetX + targetSize + 34 - cornerSize, targetY + targetSize + 22, cornerSize, 12);
      ctx.fillRect(targetX + targetSize + 22, targetY + targetSize + 34 - cornerSize, 12, cornerSize);

    } else if (markerStyle === 'qr_frame') {
      // QR Frame Dots & Grid
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 10;
      ctx.strokeRect(targetX - 16, targetY - 16, targetSize + 32, targetSize + 32);

      // Corner Square targets
      const sq = 30;
      ctx.fillStyle = accentColor;
      ctx.fillRect(targetX - 25, targetY - 25, sq, sq);
      ctx.fillRect(targetX + targetSize - 5, targetY - 25, sq, sq);
      ctx.fillRect(targetX - 25, targetY + targetSize - 5, sq, sq);
      ctx.fillRect(targetX + targetSize - 5, targetY + targetSize - 5, sq, sq);

    } else if (markerStyle === 'matrix') {
      // Matrix fiducial dot pattern
      ctx.fillStyle = '#111827';
      ctx.fillRect(targetX - 20, targetY - 20, targetSize + 40, targetSize + 40);

      // Grid dots
      ctx.fillStyle = '#FFFFFF';
      for (let x = targetX - 15; x <= targetX + targetSize + 15; x += 20) {
        ctx.beginPath();
        ctx.arc(x, targetY - 10, 3, 0, Math.PI * 2);
        ctx.arc(x, targetY + targetSize + 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Minimalist Clean Frame
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(targetX - 8, targetY - 8, targetSize + 16, targetSize + 16);
    }

    // Load and render Preview Target Image inside canvas
    if (previewUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, targetX, targetY, targetSize, targetSize);
        renderPosterFooter(ctx, w, h, targetY + targetSize + 50);
      };
      img.onerror = () => {
        // Fallback placeholder text if image fails to load
        ctx.fillStyle = '#E5E7EB';
        ctx.fillRect(targetX, targetY, targetSize, targetSize);
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Target Image Preview', targetX + targetSize / 2, targetY + targetSize / 2);
        renderPosterFooter(ctx, w, h, targetY + targetSize + 50);
      };
      img.src = previewUrl;
    } else {
      renderPosterFooter(ctx, w, h, targetY + targetSize + 50);
    }
  };

  const renderPosterFooter = (ctx: CanvasRenderingContext2D, w: number, h: number, footerY: number) => {
    // Divider line
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.08, footerY);
    ctx.lineTo(w * 0.92, footerY);
    ctx.stroke();

    // Bottom Section: Instructions & QR Code Trigger
    const qrSize = Math.min(w * 0.22, 220);
    const qrX = w * 0.12;
    const qrY = footerY + 25;

    if (includeQrCode) {
      // QR Code Simulation Box (High Contrast QR Code Pattern)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);

      // Draw QR Finder Patterns (Top-Left, Top-Right, Bottom-Left)
      const drawQRFinder = (fx: number, fy: number, size: number) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(fx, fy, size, size);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(fx + size * 0.2, fy + size * 0.2, size * 0.6, size * 0.6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(fx + size * 0.35, fy + size * 0.35, size * 0.3, size * 0.3);
      };

      const finderSize = qrSize * 0.28;
      drawQRFinder(qrX, qrY, finderSize);
      drawQRFinder(qrX + qrSize - finderSize, qrY, finderSize);
      drawQRFinder(qrX, qrY + qrSize - finderSize, finderSize);

      // Random QR grid modules
      ctx.fillStyle = '#000000';
      const cellSize = qrSize / 16;
      for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 16; c++) {
          // Skip finder zones
          if ((r < 5 && c < 5) || (r < 5 && c > 10) || (r > 10 && c < 5)) continue;
          if ((r * 17 + c * 31) % 3 === 0) {
            ctx.fillRect(qrX + c * cellSize, qrY + r * cellSize, cellSize - 0.5, cellSize - 0.5);
          }
        }
      }

      // Center logo badge on QR
      ctx.fillStyle = accentColor;
      ctx.fillRect(qrX + qrSize * 0.4, qrY + qrSize * 0.4, qrSize * 0.2, qrSize * 0.2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.round(qrSize * 0.09)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('AR', qrX + qrSize * 0.5, qrY + qrSize * 0.53);

      // Instruction Text next to QR code
      const textX = qrX + qrSize + 30;
      ctx.textAlign = 'left';
      ctx.fillStyle = frameColor;
      ctx.font = `bold ${Math.round(w * 0.026)}px sans-serif`;
      ctx.fillText('HOW TO TRIGGER 3D CONTENT:', textX, qrY + 28);

      ctx.fillStyle = '#374151';
      ctx.font = `${Math.round(w * 0.02)}px sans-serif`;
      ctx.fillText('1. Scan QR code using mobile phone camera', textX, qrY + 65);
      ctx.fillText('2. Open WebAR campaign URL in browser', textX, qrY + 95);
      ctx.fillText('3. Point camera at image marker to view 3D content', textX, qrY + 125);

      ctx.fillStyle = accentColor;
      ctx.font = `bold ${Math.round(w * 0.018)}px font-mono`;
      ctx.fillText(campaignUrl.length > 38 ? campaignUrl.substring(0, 35) + '...' : campaignUrl, textX, qrY + 165);
    } else {
      // Centered instruction without QR
      ctx.textAlign = 'center';
      ctx.fillStyle = frameColor;
      ctx.font = `bold ${Math.round(w * 0.028)}px sans-serif`;
      ctx.fillText('PRINTABLE AR TARGET MARKER', w / 2, footerY + 50);
      ctx.fillStyle = '#4B5563';
      ctx.font = `${Math.round(w * 0.022)}px sans-serif`;
      ctx.fillText('Point WebAR application camera at this printed image to trigger 3D scene.', w / 2, footerY + 85);
    }
  };

  // Redraw canvas whenever parameters change
  useEffect(() => {
    if (activeTab === 'generator' && canvasRef.current) {
      drawPrintableMarkerCanvas(canvasRef.current);
    }
  }, [activeTab, previewUrl, campaignTitle, campaignSubtext, campaignUrl, markerStyle, frameColor, accentColor, includeQrCode]);

  // Download printable AR marker poster as high-res PNG image
  const downloadPrintableMarker = () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 2000;
    
    drawPrintableMarkerCanvas(exportCanvas, true);

    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `AR-Marker-${campaignTitle.replace(/[^a-zA-Z0-9-]/g, '_')}.png`;
      link.href = exportCanvas.toDataURL('image/png', 1.0);
      link.click();
    }, 200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#141416] border border-[#2B2B2E] rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-[#2B2B2E] bg-black/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Printer size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2 tracking-wide">
                Printable AR Marker & Campaign Studio
              </h2>
              <p className="text-xs text-gray-400">
                Generate high-contrast optical target cards & QR-triggered printable markers for advertising campaigns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex bg-[#1E1E22] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'generator'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <QrCode size={14} /> Printable Marker Generator
              </button>
              <button
                onClick={() => setActiveTab('analyzer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'analyzer'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck size={14} /> Tracking Score Analyzer
              </button>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab 1: AR Marker Poster Generator & Downloader */}
        {activeTab === 'generator' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Controls Column */}
            <div className="w-full md:w-80 bg-white/[0.02] border-r border-white/10 p-5 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono flex items-center gap-1.5">
                <Sliders size={14} /> Campaign Marker Customizer
              </span>

              {/* Upload or Select Target Image */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-300">Image Target Source</label>
                <div className="flex gap-2">
                  <button
                    onClick={handleUploadClick}
                    className="flex-1 py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-xl text-xs font-bold text-blue-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload size={14} /> Upload Custom Image
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>

              {/* Campaign Title & Subtext */}
              <div className="flex flex-col gap-3 border-t border-white/5 pt-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-300">Campaign Header Title</label>
                  <input
                    type="text"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-sans"
                    placeholder="e.g. NIKE AIR 3D AR EXPERIENCE"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-300">Instructions / Tagline</label>
                  <input
                    type="text"
                    value={campaignSubtext}
                    onChange={(e) => setCampaignSubtext(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-sans"
                    placeholder="Tagline or scan instructions"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-300">Campaign Web AR URL</label>
                  <input
                    type="text"
                    value={campaignUrl}
                    onChange={(e) => setCampaignUrl(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Marker Border Style */}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                <label className="text-[11px] font-bold text-gray-300">AR Optical Border Pattern</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'fiducial', label: 'Classic Optical L-Corners' },
                    { id: 'qr_frame', label: 'QR Target Frame' },
                    { id: 'matrix', label: 'Matrix Fiducial' },
                    { id: 'minimal', label: 'Minimal Poster' },
                  ].map(style => (
                    <button
                      key={style.id}
                      onClick={() => setMarkerStyle(style.id as any)}
                      className={`p-2 rounded-xl border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        markerStyle === style.id
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                          : 'bg-black/30 border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Toggle & Accent Colors */}
              <div className="flex flex-col gap-3 border-t border-white/5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-300">Embed QR Scan Trigger</span>
                  <input
                    type="checkbox"
                    checked={includeQrCode}
                    onChange={(e) => setIncludeQrCode(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Primary Color</label>
                    <input
                      type="color"
                      value={frameColor}
                      onChange={(e) => setFrameColor(e.target.value)}
                      className="w-full h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Accent Color</label>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Download Action Button */}
              <button
                onClick={downloadPrintableMarker}
                className="mt-auto py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download size={16} /> Download Printable AR Marker (PNG)
              </button>
            </div>

            {/* Right Live Canvas Preview Column */}
            <div className="flex-1 p-6 bg-black/60 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="mb-3 flex items-center justify-between w-full max-w-md">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-400" /> Printable AR Marker Poster Preview
                </span>
                <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  High-Res Print Card (300 DPI Ready)
                </span>
              </div>

              {/* Interactive Canvas Rendering Element */}
              <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-white/20 bg-white max-h-[550px] aspect-[3/4] flex items-center justify-center p-2">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={800}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AR Marker Analyzer */}
        {activeTab === 'analyzer' && (
          <div className="p-6 flex flex-col md:flex-row gap-6 overflow-y-auto">
            <div className="flex-1 flex flex-col gap-4">
              <div 
                className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors ${previewUrl ? 'border-[#333] bg-black' : 'border-[#333] hover:border-blue-500 bg-[#0A0A0A] cursor-pointer'}`}
                onClick={!previewUrl ? handleUploadClick : undefined}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Marker Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={handleUploadClick} className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold">
                        Change Target Image
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={36} className="text-[#666] mb-2 animate-bounce" />
                    <p className="text-sm font-bold text-[#888]">Upload Print Marker</p>
                    <p className="text-xs text-[#555] text-center mt-2">JPG or PNG format<br/>High contrast images work best</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg, image/png" />
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <ShieldCheck className="text-blue-400" size={16} /> Tracking Confidence Analysis
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Evaluate optical feature density and contrast distribution of your print marker to guarantee rock-solid AR camera tracking.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">Tracking Confidence Rating</span>
                  {score !== null ? (
                    <span className={`text-xl font-black ${score > 80 ? 'text-green-400' : score > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {score} / 100
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">—</span>
                  )}
                </div>

                {score !== null && (
                  <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${score > 80 ? 'bg-green-500' : score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                )}

                {score !== null ? (
                  <div className="flex items-start gap-2.5 mt-2 bg-white/5 p-3 rounded-xl border border-white/5">
                    {score > 80 ? (
                      <CheckCircle className="text-green-400 shrink-0 mt-0.5" size={18} />
                    ) : (
                      <AlertTriangle className="text-yellow-400 shrink-0 mt-0.5" size={18} />
                    )}
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {score > 80 
                        ? 'Excellent tracking potential. This marker has high contrast, rich feature distribution, and distinct optical anchors.'
                        : score > 60
                        ? 'Acceptable tracking quality. Consider increasing contrast or adding bold text/shapes to enhance stability.'
                        : 'Low feature density detected. Please upload an image with higher contrast and distinct asymmetric patterns.'}
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={analyzeMarker}
                    disabled={!previewUrl || analyzing}
                    className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    {analyzing ? 'Analyzing Marker Features...' : 'Run Optical Feature Analysis'}
                  </button>
                )}
              </div>

              <div className="mt-auto pt-4 flex justify-end gap-3 border-t border-white/10">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 hover:bg-white/10 rounded-xl text-xs font-bold text-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={registerMarker}
                  disabled={!previewUrl}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                  Register & Apply Target
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

