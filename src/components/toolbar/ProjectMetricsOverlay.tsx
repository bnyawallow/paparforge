import React, { useState, useEffect } from 'react';
import { 
  X, BarChart2, Eye, Clock, Users, MousePointer, QrCode, Smartphone, 
  RefreshCw, Play, TrendingUp, Globe, ShieldCheck, Zap, Layers, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { GlassModal } from '../ui/HudComponents';
import { 
  getProjectMetrics, 
  recordProjectView, 
  resetProjectMetrics, 
  ProjectMetricsData 
} from '../../lib/projectMetrics';

interface ProjectMetricsOverlayProps {
  projectId?: string;
  onClose: () => void;
}

export function ProjectMetricsOverlay({ projectId: initialProjectId, onClose }: ProjectMetricsOverlayProps) {
  const { projectsList, currentProjectId, addToast } = useEditorStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || currentProjectId || (projectsList[0]?.id ?? '')
  );

  const activeProject = projectsList.find((p) => p.id === selectedProjectId) || {
    id: selectedProjectId,
    name: 'Current Scene'
  };

  const [metrics, setMetrics] = useState<ProjectMetricsData>(() =>
    getProjectMetrics(activeProject.id, activeProject.name)
  );

  useEffect(() => {
    setMetrics(getProjectMetrics(activeProject.id, activeProject.name));
  }, [selectedProjectId, activeProject.id, activeProject.name]);

  const handleSimulateScan = () => {
    const updated = recordProjectView(activeProject.id, activeProject.name);
    setMetrics({ ...updated });
    addToast(`⚡ Live AR View Simulated! Total Scans: ${updated.totalViews.toLocaleString()}`);
  };

  const handleResetMetrics = () => {
    const resetData = resetProjectMetrics(activeProject.id, activeProject.name);
    setMetrics({ ...resetData });
    addToast('Metrics reset to baseline');
  };

  // Calculate max views for chart scaling
  const maxViews = Math.max(...metrics.dailyTrend.map((d) => d.views), 10);

  // Format seconds to mm:ss
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <GlassModal
      isOpen={true}
      onClose={onClose}
      hideHeader={true}
      maxWidth="max-w-5xl"
      className="flex flex-col h-[88vh] max-h-[780px] p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-[#222222] bg-[#121212] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
            <BarChart2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white font-mono">
                AR Experience Engagement Analytics
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Real-time scan metrics, average session duration, and viewer interactions for published WebAR experiences
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Project Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#1C1C1C] border border-[#2D2D2D] rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-mono uppercase font-bold text-gray-400">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-blue-400 outline-none cursor-pointer font-mono"
            >
              {projectsList.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#181818] text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#252525] rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Scroll Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0E0E0E]">
        
        {/* Quick Toolbar / Action Banner */}
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/30 via-[#141A29]/40 to-[#121212] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Campaign telemetry: {activeProject.name}
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Tracking WebAR camera permissions, marker locks, duration, and interactive state triggers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={handleResetMetrics}
              className="px-3 py-1.5 rounded-lg border border-[#2A2A2A] bg-[#181818] hover:bg-[#222] text-[10px] font-bold font-mono text-gray-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              title="Reset metrics counter"
            >
              <RefreshCw size={12} /> Reset Metrics
            </button>
            <button
              onClick={handleSimulateScan}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play size={13} className="fill-white" /> Simulate Live Scan
            </button>
          </div>
        </div>

        {/* 1. TOP METRICS GRID (4 Key Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: Total Published Views */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-2 relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider">
                Total Views / Scans
              </span>
              <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400">
                <Eye size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {metrics.totalViews.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp size={11} /> +14.2%
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              Total AR camera activations
            </p>
          </div>

          {/* Card 2: Avg Session Duration */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-2 relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider">
                Avg Session Duration
              </span>
              <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400">
                <Clock size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {formatDuration(metrics.avgSessionDurationSeconds)}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp size={11} /> +8.5s
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              Time spent interacting in 3D
            </p>
          </div>

          {/* Card 3: Unique Devices */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-2 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider">
                Unique Viewers
              </span>
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
                <Users size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {metrics.uniqueVisitors.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-cyan-400 font-mono">
                {((metrics.uniqueVisitors / (metrics.totalViews || 1)) * 100).toFixed(0)}% unique
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              Distinct browser device sessions
            </p>
          </div>

          {/* Card 4: Interaction CTR */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-2 relative overflow-hidden group hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider">
                Interaction CTR
              </span>
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400">
                <MousePointer size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {metrics.ctrPercent}%
              </span>
              <span className="text-[10px] font-bold text-amber-400 font-mono">
                {metrics.interactionCount} clicks
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              Button CTA & hotspot taps
            </p>
          </div>

        </div>

        {/* 2. MIDDLE SPLIT: Daily Trend Chart & OS Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Daily Views Bar Chart (Takes 2 Columns) */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-4">
            <div className="flex items-center justify-between border-b border-[#202020] pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  7-Day Views & Interaction Trend
                </h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                Daily scans breakdown
              </span>
            </div>

            {/* Custom SVG Bar Graph */}
            <div className="h-44 pt-4 flex items-end justify-between gap-3 px-2">
              {metrics.dailyTrend.map((day, idx) => {
                const barHeightPct = Math.max(12, Math.round((day.views / maxViews) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono bg-blue-950 border border-blue-800 text-blue-200 px-1.5 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap">
                      {day.views} views ({day.interactions} clicks)
                    </div>

                    <div className="w-full bg-[#1C1C1C] rounded-t-lg h-full flex items-end overflow-hidden relative">
                      {/* Bar Fill */}
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 rounded-t-lg transition-all duration-300 group-hover:brightness-125"
                        style={{ height: `${barHeightPct}%` }}
                      />
                    </div>

                    <span className="text-[10px] font-mono text-gray-400 group-hover:text-white transition-colors">
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 pt-2 border-t border-[#1C1C1C] text-[10px] font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Total AR Camera Activations
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" /> Interactive UI Hotspot Taps
              </div>
            </div>
          </div>

          {/* OS & Marker Performance (1 Column) */}
          <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#202020] pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Device Breakdown
                  </h3>
                </div>
              </div>

              {/* Progress Bars for Devices */}
              <div className="space-y-3">
                
                {/* iOS */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                      📱 iOS (Safari WebXR)
                    </span>
                    <span className="text-purple-400 font-bold">{metrics.deviceBreakdown.ios}%</span>
                  </div>
                  <div className="w-full bg-[#202020] rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${metrics.deviceBreakdown.ios}%` }} />
                  </div>
                </div>

                {/* Android */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                      🤖 Android (Chrome AR)
                    </span>
                    <span className="text-blue-400 font-bold">{metrics.deviceBreakdown.android}%</span>
                  </div>
                  <div className="w-full bg-[#202020] rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${metrics.deviceBreakdown.android}%` }} />
                  </div>
                </div>

                {/* Desktop */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                      💻 Desktop WebXR
                    </span>
                    <span className="text-cyan-400 font-bold">{metrics.deviceBreakdown.desktop}%</span>
                  </div>
                  <div className="w-full bg-[#202020] rounded-full h-2 overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${metrics.deviceBreakdown.desktop}%` }} />
                  </div>
                </div>

              </div>
            </div>

            {/* Target Recognition Quality Card */}
            <div className="p-3.5 bg-[#1B1B1B] border border-[#282828] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <QrCode size={13} className="text-emerald-400" /> Target Lock Accuracy
                </span>
                <span className="text-emerald-400 font-bold">{metrics.scanSuccessRate}%</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Optical feature tracking engine maintains smooth lock under varied print lighting.
              </p>
            </div>
          </div>

        </div>

        {/* 3. RECENT ACTIVITY SCAN LOG */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-4">
          <div className="flex items-center justify-between border-b border-[#202020] pb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Recent Viewer Session Log
              </h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              Showing last {metrics.recentActivity.length} telemetry records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="border-b border-[#222] text-gray-400 uppercase text-[9px] tracking-wider">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Device & Browser</th>
                  <th className="py-2 px-3">Duration</th>
                  <th className="py-2 px-3">Region</th>
                  <th className="py-2 px-3">Triggered Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {metrics.recentActivity.map((log) => (
                  <tr key={log.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">{log.device}</td>
                    <td className="py-2.5 px-3 text-blue-400 font-bold whitespace-nowrap">{log.duration}</td>
                    <td className="py-2.5 px-3 text-gray-300 whitespace-nowrap">{log.location}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold">
                        {log.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </GlassModal>
  );
}
