import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { EventData } from '../../types';

export interface UseGLTFAnimationEventsOptions {
  modelId: string | null;
  activeAnimation: string;
  animationPlaying: boolean;
  animationTime: number;
  clipDuration: number;
  loopAnimation: boolean;
}

export interface GLTFAnimationEventsResult {
  lastTriggeredEvent: string | null;
  lastTriggeredTime: number | null;
  triggerEventManually: (type: 'start' | 'end') => void;
  registeredStartEvents: EventData[];
  registeredEndEvents: EventData[];
}

/**
 * Hook for the animation controller that monitors GLTF model animation playback,
 * detects animation start and end lifecycle events, and executes associated event
 * actions in the ARForge action system.
 */
export function useGLTFAnimationEvents({
  modelId,
  activeAnimation,
  animationPlaying,
  animationTime,
  clipDuration,
  loopAnimation,
}: UseGLTFAnimationEventsOptions): GLTFAnimationEventsResult {
  const addToast = useEditorStore((state) => state.addToast);

  const [lastTriggeredEvent, setLastTriggeredEvent] = useState<string | null>(null);
  const [lastTriggeredTime, setLastTriggeredTime] = useState<number | null>(null);

  const prevPlayingRef = useRef<boolean>(false);
  const prevAnimRef = useRef<string>(activeAnimation);
  const hasTriggeredStartRef = useRef<boolean>(false);
  const hasTriggeredEndRef = useRef<boolean>(false);

  // Retrieve current target object and its registered events
  const targetObj = useEditorStore((state) => (modelId ? state.objects[modelId] : null));
  const events = (targetObj?.events || []) as EventData[];

  const registeredStartEvents = events.filter(
    (ev) => ev.trigger === 'onAnimationStart' || ev.trigger === 'onMediaPlay'
  );
  const registeredEndEvents = events.filter(
    (ev) => ev.trigger === 'onAnimationComplete' || ev.trigger === 'onMediaEnd'
  );

  // Helper to execute an event in the ARForge action system
  const dispatchARForgeEvent = useCallback(
    (event: EventData, triggerName: string) => {
      if (!modelId) return;

      // Dispatch custom event consumed by Viewport's ARForge event executor
      window.dispatchEvent(
        new CustomEvent('ar-trigger-event', {
          detail: {
            event,
            targetId: modelId,
            clipName: activeAnimation,
            triggerName,
            timestamp: Date.now(),
          },
        })
      );

      const actionCount = event.actions ? event.actions.length : 0;
      setLastTriggeredEvent(`${triggerName}: "${event.name || 'Action'}" (${actionCount} actions)`);
      setLastTriggeredTime(Date.now());

      if (actionCount > 0) {
        addToast(`🎬 Triggered ${triggerName}: ${event.name || 'Event'} (${actionCount} action${actionCount > 1 ? 's' : ''})`);
      }
    },
    [modelId, activeAnimation, addToast]
  );

  // Trigger start events for the active model
  const triggerStartLifecycle = useCallback(() => {
    if (!modelId) return;
    
    // Broadcast custom start event for the animation controller and scene listeners
    window.dispatchEvent(
      new CustomEvent('ar-animation-started', {
        detail: {
          modelId,
          clipName: activeAnimation,
          timestamp: Date.now(),
        },
      })
    );

    if (registeredStartEvents.length > 0) {
      registeredStartEvents.forEach((ev) => {
        dispatchARForgeEvent(ev, 'onAnimationStart');
      });
    }
  }, [modelId, activeAnimation, registeredStartEvents, dispatchARForgeEvent]);

  // Trigger end/complete events for the active model
  const triggerEndLifecycle = useCallback(() => {
    if (!modelId) return;

    // Broadcast custom complete event for the animation controller and scene listeners
    window.dispatchEvent(
      new CustomEvent('ar-animation-completed', {
        detail: {
          modelId,
          clipName: activeAnimation,
          timestamp: Date.now(),
        },
      })
    );

    if (registeredEndEvents.length > 0) {
      registeredEndEvents.forEach((ev) => {
        dispatchARForgeEvent(ev, 'onAnimationComplete');
      });
    }
  }, [modelId, activeAnimation, registeredEndEvents, dispatchARForgeEvent]);

  // Manual trigger for testing and diagnostic purposes
  const triggerEventManually = useCallback(
    (type: 'start' | 'end') => {
      if (type === 'start') {
        triggerStartLifecycle();
      } else {
        triggerEndLifecycle();
      }
    },
    [triggerStartLifecycle, triggerEndLifecycle]
  );

  // Reset lifecycle state when switching tracks or models
  useEffect(() => {
    if (prevAnimRef.current !== activeAnimation) {
      prevAnimRef.current = activeAnimation;
      hasTriggeredStartRef.current = false;
      hasTriggeredEndRef.current = false;
    }
  }, [activeAnimation]);

  // 1. Detect Animation Start Lifecycle
  useEffect(() => {
    const wasPlaying = prevPlayingRef.current;
    prevPlayingRef.current = animationPlaying;

    if (!modelId || clipDuration <= 0) return;

    // Detected transition from paused to playing
    if (!wasPlaying && animationPlaying) {
      // If beginning playback near start or resuming
      if (!hasTriggeredStartRef.current) {
        hasTriggeredStartRef.current = true;
        hasTriggeredEndRef.current = false;
        triggerStartLifecycle();
      }
    }

    // If playback stopped or reset to start, reset the start trigger flag
    if (!animationPlaying && animationTime < 0.05) {
      hasTriggeredStartRef.current = false;
      hasTriggeredEndRef.current = false;
    }
  }, [animationPlaying, animationTime, clipDuration, modelId, triggerStartLifecycle]);

  // 2. Detect Animation End Lifecycle via Timeline Progress
  useEffect(() => {
    if (!modelId || !animationPlaying || clipDuration <= 0) return;

    const threshold = Math.max(0.02, clipDuration * 0.02);
    const isAtEnd = animationTime >= clipDuration - threshold;

    if (isAtEnd && !hasTriggeredEndRef.current) {
      hasTriggeredEndRef.current = true;
      triggerEndLifecycle();

      // If loop is enabled, prepare for the next cycle
      if (loopAnimation) {
        setTimeout(() => {
          hasTriggeredEndRef.current = false;
          hasTriggeredStartRef.current = false;
        }, 150);
      }
    } else if (animationTime < clipDuration * 0.5 && hasTriggeredEndRef.current && loopAnimation) {
      // Reset end flag once loop plays past beginning
      hasTriggeredEndRef.current = false;
    }
  }, [animationTime, clipDuration, animationPlaying, loopAnimation, modelId, triggerEndLifecycle]);

  // 3. Listen to hardware/mixer-level animation events dispatched from Three.js AnimationMixer
  useEffect(() => {
    if (!modelId) return;

    const handleMixerFinished = (e: any) => {
      if (e.detail?.modelId && e.detail.modelId !== modelId) return;
      if (!hasTriggeredEndRef.current) {
        hasTriggeredEndRef.current = true;
        triggerEndLifecycle();
      }
    };

    const handleMixerStart = (e: any) => {
      if (e.detail?.modelId && e.detail.modelId !== modelId) return;
      if (!hasTriggeredStartRef.current) {
        hasTriggeredStartRef.current = true;
        triggerStartLifecycle();
      }
    };

    window.addEventListener('ar-mixer-animation-finished', handleMixerFinished);
    window.addEventListener('ar-mixer-animation-start', handleMixerStart);

    return () => {
      window.removeEventListener('ar-mixer-animation-finished', handleMixerFinished);
      window.removeEventListener('ar-mixer-animation-start', handleMixerStart);
    };
  }, [modelId, triggerStartLifecycle, triggerEndLifecycle]);

  return {
    lastTriggeredEvent,
    lastTriggeredTime,
    triggerEventManually,
    registeredStartEvents,
    registeredEndEvents,
  };
}
