export interface ProjectMetricsData {
  projectId: string;
  projectName: string;
  totalViews: number;
  uniqueVisitors: number;
  avgSessionDurationSeconds: number;
  interactionCount: number;
  scanSuccessRate: number;
  ctrPercent: number;
  deviceBreakdown: {
    ios: number;
    android: number;
    desktop: number;
  };
  dailyTrend: { date: string; views: number; interactions: number }[];
  recentActivity: {
    id: string;
    timestamp: string;
    device: string;
    duration: string;
    location: string;
    action: string;
  }[];
}

/**
 * Get stored metrics or generate realistic seed metrics for an AR project
 */
export function getProjectMetrics(projectId: string, projectName: string): ProjectMetricsData {
  const key = `ar_forge_metrics_${projectId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback if corrupt
    }
  }

  // Generate deterministic seed based on string hash
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = (hash << 5) - hash + projectId.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const baseViews = 420 + (seed % 1800);
  const uniqueVisitors = Math.round(baseViews * (0.68 + (seed % 15) / 100));
  const avgSessionDurationSeconds = 90 + (seed % 150);
  const interactionCount = Math.round(baseViews * (0.32 + (seed % 12) / 100));
  const scanSuccessRate = +(95 + (seed % 40) / 10).toFixed(1);
  const ctrPercent = +((interactionCount / baseViews) * 100).toFixed(1);

  const dates: { date: string; views: number; interactions: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayMult = 0.6 + ((seed + i * 17) % 80) / 100;
    const views = Math.round((baseViews / 7) * dayMult);
    const interactions = Math.round(views * 0.38);
    dates.push({ date: dateStr, views, interactions });
  }

  const initialMetrics: ProjectMetricsData = {
    projectId,
    projectName,
    totalViews: baseViews,
    uniqueVisitors,
    avgSessionDurationSeconds,
    interactionCount,
    scanSuccessRate,
    ctrPercent,
    deviceBreakdown: {
      ios: 58,
      android: 34,
      desktop: 8
    },
    dailyTrend: dates,
    recentActivity: [
      {
        id: '1',
        timestamp: '2 mins ago',
        device: 'iPhone 15 Pro (Safari WebXR)',
        duration: '3m 12s',
        location: 'United States',
        action: 'Scanned Target & Clicked Buy CTA'
      },
      {
        id: '2',
        timestamp: '14 mins ago',
        device: 'Samsung S24 Ultra (Chrome)',
        duration: '1m 45s',
        location: 'United Kingdom',
        action: 'Switched 3D Material Paint'
      },
      {
        id: '3',
        timestamp: '38 mins ago',
        device: 'iPad Air (Safari)',
        duration: '4m 02s',
        location: 'Germany',
        action: 'Played Embedded AR Video'
      },
      {
        id: '4',
        timestamp: '1 hour ago',
        device: 'Google Pixel 8 (Chrome)',
        duration: '2m 10s',
        location: 'Japan',
        action: 'Scanned Print Target Anchor'
      }
    ]
  };

  localStorage.setItem(key, JSON.stringify(initialMetrics));
  return initialMetrics;
}

/**
 * Record a simulated live view scan to update metric counters
 */
export function recordProjectView(projectId: string, projectName: string): ProjectMetricsData {
  const metrics = getProjectMetrics(projectId, projectName);
  metrics.totalViews += 1;
  metrics.uniqueVisitors += Math.random() > 0.3 ? 1 : 0;
  metrics.interactionCount += Math.random() > 0.4 ? 1 : 0;
  metrics.ctrPercent = +((metrics.interactionCount / metrics.totalViews) * 100).toFixed(1);

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const todayEntry = metrics.dailyTrend.find((d) => d.date === todayStr);
  if (todayEntry) {
    todayEntry.views += 1;
    todayEntry.interactions += 1;
  } else {
    metrics.dailyTrend.push({ date: todayStr, views: 1, interactions: 1 });
    if (metrics.dailyTrend.length > 7) metrics.dailyTrend.shift();
  }

  const devices = ['iPhone 15 Pro (Safari)', 'Samsung Galaxy S24 (Chrome)', 'iPad Pro (Safari)', 'Google Pixel 8'];
  const locations = ['United States', 'Germany', 'United Kingdom', 'Canada', 'Japan', 'France'];
  const actions = ['Scanned Print Target', 'Triggered 3D Animation', 'Clicked HUD Action Button', 'Changed Color Material'];

  metrics.recentActivity.unshift({
    id: Date.now().toString(),
    timestamp: 'Just now',
    device: devices[Math.floor(Math.random() * devices.length)],
    duration: `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 50) + 10}s`,
    location: locations[Math.floor(Math.random() * locations.length)],
    action: actions[Math.floor(Math.random() * actions.length)]
  });

  if (metrics.recentActivity.length > 8) {
    metrics.recentActivity.pop();
  }

  localStorage.setItem(`ar_forge_metrics_${projectId}`, JSON.stringify(metrics));
  return metrics;
}

/**
 * Reset project metrics back to baseline
 */
export function resetProjectMetrics(projectId: string, projectName: string): ProjectMetricsData {
  localStorage.removeItem(`ar_forge_metrics_${projectId}`);
  return getProjectMetrics(projectId, projectName);
}
