export const globalAudioCache: Record<string, HTMLAudioElement> = {};

export const playCachedAudio = (url: string, loop = false, volume = 0.5) => {
  if (!url) return null;
  if (!globalAudioCache[url]) {
    const a = new Audio(url);
    a.preload = 'auto';
    globalAudioCache[url] = a;
  }
  const audio = globalAudioCache[url];
  audio.currentTime = 0;
  audio.loop = loop;
  audio.volume = volume;
  audio.play().catch(e => console.log('Audio preset play failed', e));
  return audio;
};

export const preloadAudio = (url: string) => {
  if (!url) return;
  if (!globalAudioCache[url]) {
    const a = new Audio(url);
    a.preload = 'auto';
    globalAudioCache[url] = a;
  }
};
