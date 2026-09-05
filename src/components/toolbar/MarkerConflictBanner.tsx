import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle, Image as ImageIcon, Eye, Layers, Sparkles } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useMarkerValidation } from '../../hooks/useMarkerValidation';

export function MarkerConflictBanner({ onOpenMarkerManager }: { onOpenMarkerManager?: (targetId?: string) => void }) {
  const { selectObject, settings } = useEditorStore();
  const { report, hasConflicts, resolveTargetTexture, switchToMultiTargetMode } = useMarkerValidation();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!hasConflicts || isDismissed || report.issues.length === 0) {
    return null;
  }

  const primaryIssue = report.issues[0];
  const isError = primaryIssue.severity === 'error';

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 max-w-3xl w-[92%] pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
      <div className={`p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${
        isError
          ? 'bg-red-950/90 border-red-500/50 text-red-100 shadow-red-950/50'
          : 'bg-[#1e1709]/95 border-amber-500/50 text-amber-100 shadow-amber-950/50'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 mt-0.5 shadow-inner ${
              isError ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <AlertTriangle size={18} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {primaryIssue.title}
                </h4>
                {report.issues.length > 1 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-white/10 text-white">
                    +{report.issues.length - 1} more issue{report.issues.length > 2 ? 's' : ''}
                  </span>
                )}
                {primaryIssue.similarityScore !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold bg-black/40 text-amber-300 border border-amber-500/30">
                    {primaryIssue.similarityScore}% Visual Match
                  </span>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-black/40 text-gray-300">
                  {settings.targetMode === 'multi' ? 'Multi-Target Mode' : 'Single Marker Mode'}
                </span>
              </div>
              <p className="text-xs text-gray-200/90 leading-snug">
                {primaryIssue.message}
              </p>
              <p className="text-[11px] text-gray-300/80 leading-snug">
                💡 <span className="font-semibold text-white/90">Recommendation:</span> {primaryIssue.recommendation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {/* Quick Auto-Fix for identical or similar texture conflict */}
            {(primaryIssue.type === 'identical_image' || primaryIssue.type === 'similar_image') && primaryIssue.conflictingTargetId && (
              <button
                onClick={() => resolveTargetTexture(primaryIssue.conflictingTargetId!)}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                title="Automatically assign a distinct reference image preset to resolve tracking conflict"
              >
                <Sparkles size={13} className="text-emerald-200" />
                <span>Auto-Fix Marker</span>
              </button>
            )}

            {/* Quick Switch to Multi-Target Mode */}
            {primaryIssue.type === 'single_mode_multiple_targets' && (
              <button
                onClick={switchToMultiTargetMode}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                title="Enable Multi-Target Mode to register all markers simultaneously in AR"
              >
                <Layers size={13} />
                <span>Enable Multi-Target</span>
              </button>
            )}

            {primaryIssue.conflictingTargetId && (
              <button
                onClick={() => {
                  selectObject(primaryIssue.conflictingTargetId!);
                }}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1 border border-white/10"
                title="Select conflicting target in 3D viewport"
              >
                <Eye size={13} />
                <span>Focus Target</span>
              </button>
            )}

            {onOpenMarkerManager && primaryIssue.conflictingTargetId && (
              <button
                onClick={() => onOpenMarkerManager(primaryIssue.conflictingTargetId)}
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 active:scale-95 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1 shadow-md"
              >
                <ImageIcon size={13} />
                <span>Marker Manager</span>
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Dismiss warning for this session"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
