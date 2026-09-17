import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Smartphone, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Printer, 
  Sparkles, 
  Layers, 
  Camera, 
  RefreshCw,
  Info,
  ShieldCheck,
  Zap,
  Eye,
  Share2,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { GlassModal } from '../ui/HudComponents';
import { useEditorStore } from '../../store/useEditorStore';
import { useTheme } from '../../lib/theme';
import { DEFAULT_ART_POSTER_TEXTURE } from '../../lib/arTargetTexture';

interface ProjectQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectName?: string;
}

export function ProjectQRCodeModal({ 
  isOpen, 
  onClose, 
  projectId: propProjectId, 
  projectName: propProjectName 
}: ProjectQRCodeModalProps) {
  const t = useTheme();
  const currentProjectId = useEditorStore(state => state.currentProjectId);
  const objects = useEditorStore(state => state.objects);
  const settings = useEditorStore(state => state.settings);
  const saveCurrentProject = useEditorStore(state => state.saveCurrentProject);
  const addToast = useEditorStore(state => state.addToast);

  const targetProjectId = propProjectId || currentProjectId;
  const targetProjectName = propProjectName || settings.projectName || 'AR Project';

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'marker' | 'guide'>('qr');

  // Compute mobile WebAR viewer URL
  const viewerUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/viewer/${targetProjectId}`
    : `https://arforge.dev/viewer/${targetProjectId}`;

  // Find active target marker preview if available
  const imageTargetObj = Object.values(objects).find(o => o.type === 'imageTarget');
  const targetImageUrl = imageTargetObj?.properties?.textureUrl || DEFAULT_ART_POSTER_TEXTURE;
  const targetMode = imageTargetObj?.properties?.targetType || 'image';

  // Save current project and generate QR Code when modal opens
  useEffect(() => {
    if (!isOpen || !targetProjectId) return;

    let isMounted = true;
    setIsGenerating(true);
    setIsSyncing(true);

    // If viewing the currently active project in editor, trigger a fresh save & sync
    if (targetProjectId === currentProjectId) {
      try {
        saveCurrentProject();
      } catch (err) {
        console.warn('Save before QR generation warning:', err);
      }
    }

    setTimeout(() => {
      if (isMounted) setIsSyncing(false);
    }, 400);

    // Generate high-resolution QR code
    QRCode.toDataURL(viewerUrl, {
      width: 480,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetProjectId, viewerUrl, currentProjectId, saveCurrentProject]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(viewerUrl);
      } else {
        const input = document.createElement('input');
        input.value = viewerUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      addToast('Viewer URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      addToast('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: targetProjectName,
          text: `Test "${targetProjectName}" live in WebAR on your smartphone!`,
          url: viewerUrl
        });
        addToast('Shared WebAR viewer link!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;

    // Draw customized branded QR canvas card with project name and instructions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 640;
    canvas.height = 760;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Header Banner
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, 100);

    // Title text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(targetProjectName.length > 28 ? targetProjectName.slice(0, 26) + '...' : targetProjectName, canvas.width / 2, 48);

    // Subtitle
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('WebAR Live Mobile Experience • Scan to Launch', canvas.width / 2, 78);

    // QR Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 80, 130, 480, 480);

      // Bottom footer instructions
      ctx.fillStyle = '#52525b';
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Point your smartphone camera at this QR code to test in Augmented Reality.', canvas.width / 2, 650);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`Project ID: ${targetProjectId} • Powered by AR Forge`, canvas.width / 2, 680);

      const downloadUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${targetProjectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_ar_test_qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addToast('Downloaded high-res QR code!');
    };
    img.src = qrDataUrl;
  };

  const handlePrintSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast('Pop-up blocked. Please allow pop-ups to print the AR test sheet.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${targetProjectName} - AR Test & Marker Sheet</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #111827;
              margin: 0;
              padding: 20px;
              background: #fff;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .title { font-size: 24px; font-weight: 800; margin: 0 0 6px 0; }
            .subtitle { font-size: 14px; color: #4b5563; margin: 0; }
            .grid {
              display: flex;
              gap: 24px;
              justify-content: center;
              align-items: flex-start;
              margin-bottom: 30px;
            }
            .card {
              flex: 1;
              max-width: 340px;
              border: 1px solid #d1d5db;
              border-radius: 16px;
              padding: 20px;
              text-align: center;
              box-sizing: border-box;
            }
            .card h3 { font-size: 15px; margin: 0 0 12px 0; color: #1f2937; }
            .qr-img { width: 220px; height: 220px; margin: 0 auto; display: block; }
            .marker-img { width: 220px; height: 220px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; margin: 0 auto; display: block; }
            .steps {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 16px 24px;
              margin-top: 20px;
            }
            .steps ol { margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #374151; line-height: 1.8; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 11px;
              color: #9ca3af;
              border-top: 1px solid #f3f4f6;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${targetProjectName}</h1>
            <p class="subtitle">Augmented Reality Mobile Test Sheet</p>
          </div>
          <div class="grid">
            <div class="card">
              <h3>1. Scan QR with Smartphone</h3>
              <img class="qr-img" src="${qrDataUrl}" alt="AR Viewer QR Code" />
              <p style="font-size: 11px; color: #6b7280; margin-top: 10px;">Launches the WebAR interactive viewer.</p>
            </div>
            <div class="card">
              <h3>2. Point Camera at Marker</h3>
              <img class="marker-img" src="${targetImageUrl}" alt="AR Target Marker" />
              <p style="font-size: 11px; color: #6b7280; margin-top: 10px;">Target: ${targetMode === 'single' ? 'Single Marker' : 'Multi-Marker'}</p>
            </div>
          </div>
          <div class="steps">
            <strong>Quick Testing Instructions:</strong>
            <ol>
              <li>Open your phone's native camera app (iOS Safari or Android Chrome).</li>
              <li>Scan the QR Code on the left to open the WebAR Viewer link.</li>
              <li>Accept the camera permission prompt in your browser.</li>
              <li>Aim your mobile device at the Target Marker image on the right to see your 3D scene materialize in real time!</li>
            </ol>
          </div>
          <div class="footer">
            Generated via AR Forge Studio • Project ID: ${targetProjectId}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Mobile AR Live Test & QR Code"
      maxWidth="max-w-xl"
      className="max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:rounded-t-3xl max-sm:max-h-[92vh] max-sm:p-4 max-sm:border-t max-sm:border-blue-500/30"
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1.5 bg-gray-500/40 rounded-full mx-auto mb-1 sm:hidden" />

        {/* Header summary & badge */}
        <div className={cn(
          "flex items-center justify-between p-3 rounded-xl border",
          t.isLight ? "bg-blue-50/70 border-blue-200/80" : "bg-blue-950/25 border-blue-500/20"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <Smartphone size={16} />
            </div>
            <div className="min-w-0">
              <h4 className={cn("text-xs sm:text-sm font-bold leading-tight flex items-center gap-1.5 truncate", t.isLight ? "text-gray-900" : "text-white")}>
                <span className="truncate">{targetProjectName}</span>
                {isSyncing && (
                  <span className="text-[10px] text-blue-400 font-normal flex items-center gap-1 shrink-0">
                    <RefreshCw size={10} className="animate-spin" /> Syncing...
                  </span>
                )}
              </h4>
              <p className={cn("text-[10px] sm:text-[11px] truncate", t.isLight ? "text-gray-500" : "text-gray-400")}>
                Scan with smartphone camera for instant zero-install WebAR
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 ml-2">
            {targetMode === 'single' ? 'Single Marker' : 'Multi-Target'}
          </span>
        </div>

        {/* Mobile Tab Control for optimal UI comfort on narrow screens */}
        <div className="flex items-center p-1 rounded-xl bg-black/20 border border-white/10 sm:hidden">
          <button
            onClick={() => setActiveTab('qr')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95",
              activeTab === 'qr'
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-gray-400 hover:text-white"
            )}
          >
            <QrCode size={13} />
            <span>QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('marker')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95",
              activeTab === 'marker'
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-gray-400 hover:text-white"
            )}
          >
            <ImageIcon size={13} />
            <span>Marker</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95",
              activeTab === 'guide'
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-gray-400 hover:text-white"
            )}
          >
            <HelpCircle size={13} />
            <span>Guide</span>
          </button>
        </div>

        {/* Center QR Code and details - Desktop grid / Mobile active tab */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          
          {/* QR Code Container (Visible if desktop OR if mobile tab === 'qr') */}
          <div className={cn(
            "flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border relative transition-all",
            t.isLight ? "bg-white border-gray-200 shadow-sm" : "bg-[#141416] border-[#2A2A2E] shadow-xl",
            activeTab !== 'qr' ? "max-sm:hidden" : "block"
          )}>
            <div 
              onClick={handleCopyLink}
              title="Click to copy WebAR link"
              className="relative p-2.5 sm:p-3 bg-white rounded-2xl shadow-md border border-gray-200 flex items-center justify-center cursor-pointer group hover:scale-[1.02] transition-transform duration-200 ring-4 ring-blue-500/10"
            >
              {isGenerating || !qrDataUrl ? (
                <div className="w-44 h-44 sm:w-52 sm:h-52 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <RefreshCw size={24} className="animate-spin text-blue-500" />
                  <span className="text-xs font-mono">Generating QR...</span>
                </div>
              ) : (
                <>
                  <img 
                    src={qrDataUrl} 
                    alt="AR Project Viewer QR Code" 
                    className="w-44 h-44 sm:w-52 sm:h-52 block rounded-lg select-none" 
                  />
                  <div className="absolute inset-0 bg-blue-600/80 backdrop-blur-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                    <Copy size={22} className="mb-1 animate-bounce" />
                    <span className="text-xs font-bold">Click to Copy Link</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-blue-400">
              <Zap size={13} className="text-amber-400" />
              <span>Dynamic auto-refresh enabled</span>
            </div>
          </div>

          {/* Quick instructions & Action Buttons (Desktop or Mobile Tab selection) */}
          <div className="flex flex-col gap-3">
            
            {/* Guide box (Visible if desktop OR if mobile tab === 'guide') */}
            <div className={cn(
              "p-3 rounded-xl border text-xs flex flex-col gap-2",
              t.isLight ? "bg-gray-50 border-gray-200 text-gray-700" : "bg-[#18181A] border-[#2A2A2E] text-gray-300",
              activeTab !== 'guide' ? "max-sm:hidden" : "block"
            )}>
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-400">
                <Camera size={14} />
                <span>3-Step Instant Mobile Test</span>
              </div>
              <ol className="space-y-1.5 text-[11px] leading-relaxed pl-4 list-decimal text-gray-400">
                <li>Point native iOS/Android camera at QR code.</li>
                <li>Tap banner to open WebAR interactive viewer.</li>
                <li>Allow camera access and scan target marker!</li>
              </ol>
            </div>

            {/* Target Marker preview thumbnail (Visible if desktop OR if mobile tab === 'marker') */}
            <div className={cn(
              "p-2.5 rounded-xl border flex items-center justify-between gap-2",
              t.isLight ? "bg-gray-50 border-gray-200" : "bg-[#18181A] border-[#2A2A2E]",
              activeTab !== 'marker' ? "max-sm:hidden" : "block"
            )}>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img 
                  src={targetImageUrl} 
                  alt="Target Marker" 
                  className="w-12 h-12 rounded-lg object-cover border border-blue-500/30 shrink-0" 
                />
                <div className="truncate">
                  <div className={cn("text-xs font-bold truncate", t.isLight ? "text-gray-800" : "text-gray-200")}>
                    Tracking Target Marker
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Point phone camera at marker image
                  </div>
                </div>
              </div>

              <button
                onClick={handlePrintSheet}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border shrink-0 active:scale-95 min-h-[40px]",
                  t.isLight 
                    ? "bg-white hover:bg-gray-100 text-gray-700 border-gray-200 shadow-sm" 
                    : "bg-[#222225] hover:bg-[#2c2c30] text-gray-200 border-[#333]"
                )}
                title="Print Target Marker & QR Code Sheet"
              >
                <Printer size={13} className="text-purple-400" />
                <span className="text-[11px]">Print Sheet</span>
              </button>
            </div>

            {/* Download QR PNG & Open Tab */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadQR}
                className={cn(
                  "py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 min-h-[44px]",
                  t.isLight 
                    ? "bg-white hover:bg-gray-100 border-gray-200 text-gray-700 shadow-sm" 
                    : "bg-[#1C1C1F] hover:bg-[#252529] border-[#2A2A2E] text-gray-200"
                )}
              >
                <Download size={13} className="text-blue-400" />
                <span>Save QR PNG</span>
              </button>

              <a
                href={viewerUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center active:scale-95 min-h-[44px]",
                  t.isLight 
                    ? "bg-white hover:bg-gray-100 border-gray-200 text-gray-700 shadow-sm" 
                    : "bg-[#1C1C1F] hover:bg-[#252529] border-[#2A2A2E] text-gray-200"
                )}
              >
                <Eye size={13} className="text-emerald-400" />
                <span>Open Viewer</span>
              </a>
            </div>
          </div>
        </div>

        {/* Primary Link Sharing Bar & Touch Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
          <div className={cn(
            "flex-1 flex items-center px-3 py-2.5 rounded-xl border font-mono text-[11px] truncate min-h-[44px]",
            t.isLight ? "bg-gray-100 border-gray-200 text-gray-700" : "bg-[#101012] border-[#242428] text-gray-300"
          )}>
            <span className="truncate">{viewerUrl}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-md min-h-[44px] active:scale-95",
                copied 
                  ? "bg-emerald-600 text-white" 
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
              )}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            {/* Native Share button for Mobile Devices */}
            <button
              onClick={handleNativeShare}
              className={cn(
                "px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border min-h-[44px] active:scale-95",
                t.isLight
                  ? "bg-white hover:bg-gray-100 border-gray-200 text-gray-700 shadow-sm"
                  : "bg-[#1C1C1F] hover:bg-[#252529] border-[#2A2A2E] text-gray-200"
              )}
              title="Share WebAR link via native mobile app"
            >
              <Share2 size={14} className="text-sky-400" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-400 truncate">
            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
            <span className="truncate">HTTPS & Sensor Permissions Guaranteed</span>
          </div>

          <button
            onClick={onClose}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border shrink-0 active:scale-95 min-h-[36px]",
              t.isLight 
                ? "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700" 
                : "bg-[#1F1F22] hover:bg-[#28282B] border-[#2A2A2E] text-gray-300 hover:text-white"
            )}
          >
            Done
          </button>
        </div>
      </div>
    </GlassModal>
  );
}

// Utility class helper
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
