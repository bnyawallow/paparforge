import React, { useState, useEffect } from 'react';
import { 
  X, Eye, Clock, MousePointerClick, TrendingUp, Sparkles, RefreshCw, 
  Database, Smartphone, Laptop, Tablet, Target, Play, ShieldCheck, BarChart2, Zap, Calendar
} from 'lucide-react';
import { GlassModal } from '../ui/HudComponents';
import { AnalyticsService, ProjectMetrics } from '../../services/analyticsService';
import { useEditorStore } from '../../store/useEditorStore';

interface AnalyticsDashboardOverlayProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export function AnalyticsDashboardOverlay({ projectId, projectName, onClose }: AnalyticsDashboardOverlayProps) {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; scans: number; avgDuration: number } | null>(null);
  const { addToast } = useEditorStore();

  useEffect(() => {
    loadMetrics();
  }, [projectId]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await AnalyticsService.getProjectMetrics(projectId, projectName);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = async () => {
    setIsSimulating(true);
    try {
      const updated = await AnalyticsService.simulateScan(projectId);
      setMetrics(updated);
      addToast('Simulated incoming WebAR visitor scan (+1 View logged)');
    } catch (e) {
      addToast('Error logging scan');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = async () => {
    AnalyticsService.resetMetrics(projectId);
    await loadMetrics();
    addToast('Engagement metrics reset to initial baseline');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (loading || !metrics) {
    return (
      <GlassModal isOpen={true} onClose={onClose} hideHeader={true} maxWidth="max-w-4xl" className="p-8 flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono uppercase font-bold tracking-wider">Loading Engagement Metrics...</span>
        </div>
      </GlassModal>
    );
  }

  const maxDailyScans = Math.max(...metrics.dailyScans.map(d => d.scans), 1);

  return (
    <GlassModal 
      isOpen={true} 
      onClose={onClose} 
      hideHeader={true} 
      maxWidth="max-w-4xl" 
      className="flex flex-col max-h-[90vh] p-0 overflow-hidden bg-[#0D0D0D]"
    >
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-[#222222] bg-[#141414] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
            <BarChart2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white font-mono">
                AR Engagement Analytics
              </h2>
              <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Tracking Active
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
              <span>Project: <strong className="text-blue-400 font-semibold">{projectName}</strong></span>
              <span>•</span>
              <span className="text-gray-500">Last scan: {new Date(metrics.lastScanAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateScan}
            disabled={isSimulating}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Simulate a live visitor viewing the AR print campaign"
          >
            {isSimulating ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap size={13} className="text-amber-300" />
            )}
            Simulate Scan
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#252525] rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Scans */}
          <div className="p-4 rounded-xl bg-[#151515] border border-[#222222] space-y-2 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-mono text-[10px] uppercase font-bold text-gray-400">Total Scans & Views</span>
              <div className="p-1.5 bg-blue-950/60 text-blue-400 rounded-lg border border-blue-800/40">
                <Eye size={15} />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-white font-mono">{metrics.totalViews}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <TrendingUp size={10} /> +18.4%
              </span>
            </div>
            <div className="text-[10px] text-gray-500 pt-1 border-t border-[#1F1F1F] flex justify-between">
              <span>Unique Visitors:</span>
              <strong className="text-gray-300 font-mono">{metrics.uniqueVisitors}</strong>
            </div>
          </div>

          {/* Card 2: Avg Session Duration */}
          <div className="p-4 rounded-xl bg-[#151515] border border-[#222222] space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-mono text-[10px] uppercase font-bold text-gray-400">Avg Session Duration</span>
              <div className="p-1.5 bg-amber-950/60 text-amber-400 rounded-lg border border-amber-800/40">
                <Clock size={15} />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-white font-mono">
                {formatDuration(metrics.avgSessionDurationSeconds)}
              </span>
              <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/50 border border-amber-800/40 px-1.5 py-0.5 rounded">
                High Retention
              </span>
            </div>
            <div className="text-[10px] text-gray-500 pt-1 border-t border-[#1F1F1F] flex justify-between">
              <span>Attention Benchmark:</span>
              <strong className="text-gray-300 font-mono">&gt; 30s target</strong>
            </div>
          </div>

          {/* Card 3: Total CTA Clicks */}
          <div className="p-4 rounded-xl bg-[#151515] border border-[#222222] space-y-2 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-mono text-[10px] uppercase font-bold text-gray-400">CTA Interactions</span>
              <div className="p-1.5 bg-purple-950/60 text-purple-400 rounded-lg border border-purple-800/40">
                <MousePointerClick size={15} />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-white font-mono">{metrics.totalInteractions}</span>
              <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-950/50 border border-purple-800/40 px-1.5 py-0.5 rounded">
                {((metrics.totalInteractions / metrics.totalViews) * 100).toFixed(1)}% CTR
              </span>
            </div>
            <div className="text-[10px] text-gray-500 pt-1 border-t border-[#1F1F1F] flex justify-between">
              <span>Conversion Actions:</span>
              <strong className="text-gray-300 font-mono">Buttons, Swatches, Audio</strong>
            </div>
          </div>

          {/* Card 4: Target Lock Rate */}
          <div className="p-4 rounded-xl bg-[#151515] border border-[#222222] space-y-2 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-mono text-[10px] uppercase font-bold text-gray-400">Target Lock Stability</span>
              <div className="p-1.5 bg-cyan-950/60 text-cyan-400 rounded-lg border border-cyan-800/40">
                <Target size={15} />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-white font-mono">96.8%</span>
              <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                60 FPS tracking
              </span>
            </div>
            <div className="text-[10px] text-gray-500 pt-1 border-t border-[#1F1F1F] flex justify-between">
              <span>Camera Pipeline:</span>
              <strong className="text-gray-300 font-mono">MindAR / Zappar</strong>
            </div>
          </div>

        </div>

        {/* 7-Day Scan Timeline Chart & Device Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bar Chart (2 cols) */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Calendar size={14} className="text-blue-400" />
                  7-Day Scan & View Volume
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Daily breakdown of visitor scans and average session length</p>
              </div>

              {hoveredDay && (
                <div className="px-2.5 py-1 rounded bg-[#202020] border border-[#333] text-[10px] font-mono text-gray-300">
                  <strong className="text-white">{hoveredDay.date}</strong>: {hoveredDay.scans} scans ({hoveredDay.avgDuration}s avg)
                </div>
              )}
            </div>

            {/* Visual Bar Chart */}
            <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-[#222]">
              {metrics.dailyScans.map((day, idx) => {
                const heightPercent = Math.max(12, Math.round((day.scans / maxDailyScans) * 100));
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
                  >
                    <div className="w-full relative flex justify-center items-end flex-1">
                      <div 
                        className="w-full max-w-[36px] bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400 rounded-t-md transition-all duration-300 group-hover:brightness-125 shadow-[0_0_12px_rgba(59,130,246,0.25)] relative"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-gray-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.scans}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-gray-500 font-semibold group-hover:text-white transition-colors">
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Device & Platform Distribution */}
          <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Smartphone size={14} className="text-purple-400" />
                Device Distribution
              </h3>
              <p className="text-[10px] text-gray-400">Platform breakdown of AR scan traffic</p>
            </div>

            <div className="space-y-3.5">
              {/* Mobile iOS/Android */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <Smartphone size={12} className="text-blue-400" /> Mobile WebAR (iOS/Android)
                  </span>
                  <span className="text-blue-400 font-bold">{metrics.deviceBreakdown.mobile}%</span>
                </div>
                <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${metrics.deviceBreakdown.mobile}%` }} />
                </div>
              </div>

              {/* Desktop Preview */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <Laptop size={12} className="text-purple-400" /> Desktop WebGL Preview
                  </span>
                  <span className="text-purple-400 font-bold">{metrics.deviceBreakdown.desktop}%</span>
                </div>
                <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${metrics.deviceBreakdown.desktop}%` }} />
                </div>
              </div>

              {/* Tablet */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <Tablet size={12} className="text-amber-400" /> Tablets & iPads
                  </span>
                  <span className="text-amber-400 font-bold">{metrics.deviceBreakdown.tablet}%</span>
                </div>
                <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${metrics.deviceBreakdown.tablet}%` }} />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0B0B] border border-[#1A1A1A] text-[10px] font-mono text-gray-400 flex items-center justify-between">
              <span>Optimal Camera: Safari / Chrome WebAR</span>
            </div>
          </div>

        </div>

        {/* Top AR Interaction Breakdown & Cloud Sync */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Interactions */}
          <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Zap size={14} className="text-amber-400" />
              Top AR User Interactions
            </h3>

            <div className="space-y-2">
              {metrics.topInteractions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#1A1A1A] border border-[#252525] text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 text-blue-400 font-mono text-[9px] font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-gray-200 font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-white font-bold">{item.count} clicks</span>
                    <span className="text-[9px] text-gray-500">({Math.round((item.count / metrics.totalViews) * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Firebase / Supabase Storage Sync Card */}
          <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Database size={14} className="text-cyan-400" />
                  Cloud Analytics Database
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-bold">
                  Firebase / Supabase Ready
                </span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Analytics logs real-time scan events, unique session durations, and button interaction callbacks directly to browser storage and cloud databases.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D0D0D] border border-[#222] space-y-2 font-mono text-[10px]">
              <div className="flex justify-between text-gray-400">
                <span>Database Sync Engine:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck size={11} /> Active Sync
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Project ID:</span>
                <span className="text-gray-300">{projectId.slice(0, 18)}...</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-3 bg-[#1D1D1D] hover:bg-[#252525] border border-[#2A2A2A] text-gray-300 hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} /> Reset Baseline
              </button>
            </div>
          </div>

        </div>

      </div>
    </GlassModal>
  );
}
