import { playSplineSound, SPLINE_SOUND_PRESETS } from './splineSoundEngine';

export const globalAudioCache: Record<string, HTMLAudioElement> = {};

export const playCachedAudio = (url: string, loop = false, volume = 0.5) => {
  if (!url) return null;

  // 1. Handle explicit synth: prefix
  if (url.startsWith('synth:')) {
    const presetId = url.replace('synth:', '');
    playSplineSound(presetId, volume);
    return null;
  }

  // 2. Check if URL matches a Spline Sound Preset ID or name
  const splinePreset = SPLINE_SOUND_PRESETS.find(p => 
    p.id === url || 
    p.name.toLowerCase() === url.toLowerCase() ||
    p.id === url.toLowerCase().replace(/[^a-z0-9]/g, '-')
  );

  if (splinePreset) {
    playSplineSound(splinePreset, volume);
    return null;
  }

  // 3. Handle standard audio URL or data URI
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('/sounds/')) {
    if (!globalAudioCache[url]) {
      const a = new Audio(url);
      a.preload = 'auto';
      globalAudioCache[url] = a;
    }
    const audio = globalAudioCache[url];
    try {
      audio.currentTime = 0;
      audio.loop = loop;
      audio.volume = volume;
      audio.play().catch(e => {
        console.log('Audio playback failed, using Web Audio synthesis fallback', e);
        playSplineSound('sfx-ui-cyber-click', volume);
      });
      return audio;
    } catch {
      playSplineSound('sfx-ui-cyber-click', volume);
      return null;
    }
  }

  // 4. Default fallback: synthesize sound via Web Audio API
  playSplineSound(url, volume);
  return null;
};

export const preloadAudio = (url: string) => {
  if (!url) return;
  if (!globalAudioCache[url]) {
    const a = new Audio(url);
    a.preload = 'auto';
    globalAudioCache[url] = a;
  }
};
