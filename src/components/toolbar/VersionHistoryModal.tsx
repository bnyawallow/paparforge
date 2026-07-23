import React, { useState } from 'react';
import { History, Plus, RotateCcw, Trash2, Clock, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { GlassModal } from '../ui/HudComponents';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VersionHistoryModal({ isOpen, onClose }: VersionHistoryModalProps) {
  const {
    versions,
    createVersionSnapshot,
    restoreVersionSnapshot,
    deleteVersionSnapshot,
    addToast
  } = useEditorStore();

  const [snapshotName, setSnapshotName] = useState('');

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    createVersionSnapshot(snapshotName.trim() || undefined);
    setSnapshotName('');
  };

  const handleRestore = (id: string, name: string) => {
    restoreVersionSnapshot(id);
    addToast(`Restored scene to "${name}"`);
    onClose();
  };

  const handleDelete = (id: string) => {
    deleteVersionSnapshot(id);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <History size={20} className="text-amber-400" />
          <span>Project Version History & Snapshots</span>
        </div>
      }
      maxWidth="max-w-xl"
    >
      <div className="p-5 flex flex-col gap-5">
        {/* Creation Header Card */}
        <form onSubmit={handleCreateSnapshot} className="bg-[#181818]/80 border border-amber-500/30 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              Create Scene Snapshot
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Manual Checkpoint</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-normal">
            Take a point-in-time snapshot of your current 3D AR scene. Revert back to any version if you make mistakes.
          </p>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              placeholder="e.g. Before lighting adjustments, Version 1.0"
              className="flex-1 bg-black/60 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/70"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer shrink-0"
            >
              <Plus size={14} className="stroke-[3]" />
              Snapshot
            </button>
          </div>
        </form>

        {/* Snapshots List */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Saved Snapshots ({versions.length})
            </span>
          </div>

          {versions.length === 0 ? (
            <div className="bg-[#121212]/60 border border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-2 text-gray-400">
              <Clock size={28} className="text-gray-600 mb-1" />
              <p className="text-xs font-medium text-gray-300">No version snapshots created yet</p>
              <p className="text-[11px] text-gray-500 max-w-sm">
                Create a snapshot above before making big changes to easily revert back if needed.
              </p>
            </div>
          ) : (
            <div className="max-h-[280px] overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
              {versions.map((ver, idx) => {
                const objectCount = Object.keys(ver.snapshot.objects || {}).length;
                const assetCount = (ver.snapshot.assets || []).length;

                return (
                  <div
                    key={ver.id}
                    className="bg-[#161616]/90 hover:bg-[#1C1C1C] border border-white/10 hover:border-amber-500/40 rounded-xl p-3 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                        <History size={16} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate max-w-[220px]">
                            {ver.name}
                          </span>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Latest
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-2">
                          <span>{formatDate(ver.timestamp)}</span>
                          <span className="text-gray-600">•</span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Layers size={10} />
                            {objectCount} objects
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRestore(ver.id, ver.name)}
                        className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Revert current scene to this version snapshot"
                      >
                        <RotateCcw size={12} />
                        Restore
                      </button>
                      <button
                        onClick={() => handleDelete(ver.id)}
                        className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete snapshot"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </GlassModal>
  );
}
