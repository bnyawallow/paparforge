import React, { useEffect, useLayoutEffect, useRef, useCallback } from 'react';

// In-memory cache for preserving scroll positions across modal closures and panel collapses
const scrollMemoryCache = new Map<string, number>();

/**
 * Returns the currently saved scroll top for a given key.
 */
export function getSavedScroll(key: string): number {
  return scrollMemoryCache.get(key) || 0;
}

/**
 * Manually saves a scroll position for a given key.
 */
export function saveScroll(key: string, position: number): void {
  if (key && Number.isFinite(position) && position >= 0) {
    scrollMemoryCache.set(key, position);
  }
}

/**
 * Hook for preserving and automatically restoring scroll position on scrollable containers.
 * @param key Unique key to identify the panel or modal scroll container
 * @param enabled Whether scroll restoration is active
 */
export function useScrollMemory<T extends HTMLElement = HTMLDivElement>(
  key: string | undefined | null,
  enabled: boolean = true
) {
  const ref = useRef<T | null>(null);

  // Restore scroll position
  useLayoutEffect(() => {
    if (!key || !enabled || !ref.current) return;

    const saved = scrollMemoryCache.get(key);
    if (typeof saved === 'number' && saved > 0) {
      ref.current.scrollTop = saved;

      // Double-check on next ticks in case inner content renders or measures asynchronously
      const frame1 = requestAnimationFrame(() => {
        if (ref.current) ref.current.scrollTop = saved;
      });
      const timer = setTimeout(() => {
        if (ref.current) ref.current.scrollTop = saved;
      }, 60);

      return () => {
        cancelAnimationFrame(frame1);
        clearTimeout(timer);
      };
    }
  }, [key, enabled]);

  // Record scroll position on user scroll
  const onScroll = useCallback(
    (e: React.UIEvent<T>) => {
      if (!key || !enabled) return;
      scrollMemoryCache.set(key, e.currentTarget.scrollTop);
    },
    [key, enabled]
  );

  // Save on unmount / cleanup
  useEffect(() => {
    return () => {
      if (key && enabled && ref.current) {
        scrollMemoryCache.set(key, ref.current.scrollTop);
      }
    };
  }, [key, enabled]);

  return { ref, onScroll };
}
