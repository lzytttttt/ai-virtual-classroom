import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useClassroomStore } from '../store/classroomStore';

export function useScriptPlayback() {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Subscribe to store values without causing re-renders in the animation loop
  const store = useClassroomStore;
  const isPaused = useSyncExternalStore(
    store.subscribe,
    () => store.getState().isPaused,
  );
  const activeInteraction = useSyncExternalStore(
    store.subscribe,
    () => store.getState().activeInteraction,
  );
  const playbackSpeed = useSyncExternalStore(
    store.subscribe,
    () => store.getState().playbackSpeed,
  );
  const elapsedMs = useSyncExternalStore(
    store.subscribe,
    () => store.getState().elapsedMs,
  );
  const scriptNodes = useSyncExternalStore(
    store.subscribe,
    () => store.getState().scriptNodes,
  );
  const scriptPosition = useSyncExternalStore(
    store.subscribe,
    () => store.getState().scriptPosition,
  );

  // Main playback loop — reads from store directly, does NOT cause re-renders
  useEffect(() => {
    if (isPaused || activeInteraction) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const state = store.getState();
      const delta = (now - lastTimeRef.current) * state.playbackSpeed;
      lastTimeRef.current = now;
      const newElapsed = state.elapsedMs + delta;

      // Process script nodes
      let pos = state.scriptPosition;
      let needsUpdate = false;

      while (pos < state.scriptNodes.length && state.scriptNodes[pos].timestamp <= newElapsed) {
        const node = state.scriptNodes[pos];

        if (node.type === 'teacherPrompt') {
          store.setState({ elapsedMs: newElapsed, scriptPosition: pos, isPaused: true });
          state.reconcileScriptState(newElapsed);
          return;
        }

        if (node.type === 'phaseTransition') {
          state.setLessonPhase(node.phase);
        }

        pos++;
        needsUpdate = true;
      }

      if (needsUpdate) {
        store.setState({ scriptPosition: pos });
        state.reconcileScriptState(newElapsed);
      }

      store.setState({ elapsedMs: newElapsed });

      if (pos >= state.scriptNodes.length) {
        store.setState({ isPaused: true });
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused, activeInteraction]); // Only depend on pause/interaction state

  const play = useCallback(() => {
    const state = store.getState();
    if (!state.activeInteraction) {
      store.setState({ isPaused: false });
    }
  }, []);

  const pause = useCallback(() => {
    store.setState({ isPaused: true });
  }, []);

  const togglePlayPause = useCallback(() => {
    const state = store.getState();
    if (state.isPaused) {
      if (!state.activeInteraction) {
        store.setState({ isPaused: false });
      }
    } else {
      store.setState({ isPaused: true });
    }
  }, []);

  // Fast-forward: find next teacherPrompt after current position
  const fastForward = useCallback(() => {
    const state = store.getState();
    const { scriptNodes: nodes, scriptPosition: pos } = state;

    for (let i = pos; i < nodes.length; i++) {
      if (nodes[i].type === 'teacherPrompt') {
        const targetTimestamp = nodes[i].timestamp;
        store.setState({ elapsedMs: targetTimestamp, scriptPosition: i, isPaused: true });
        state.reconcileScriptState(targetTimestamp);
        return;
      }
    }

    // No more teacher prompts — jump to end
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      store.setState({ elapsedMs: lastNode.timestamp, scriptPosition: nodes.length, isPaused: true });
      state.reconcileScriptState(lastNode.timestamp);
    }
  }, []);

  const seekTo = useCallback((fraction: number) => {
    const state = store.getState();
    const { scriptNodes: nodes } = state;
    if (nodes.length === 0) return;

    const maxTime = nodes[nodes.length - 1].timestamp;
    const targetTime = maxTime * Math.max(0, Math.min(1, fraction));

    let pos = 0;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].timestamp <= targetTime) {
        pos = i + 1;
      } else {
        break;
      }
    }

    store.setState({ elapsedMs: targetTime, scriptPosition: pos });
    state.reconcileScriptState(targetTime);
  }, []);

  const progress = scriptNodes.length > 0
    ? scriptPosition / scriptNodes.length
    : 0;

  const totalDuration = scriptNodes.length > 0
    ? scriptNodes[scriptNodes.length - 1].timestamp
    : 0;

  return {
    play,
    pause,
    togglePlayPause,
    fastForward,
    seekTo,
    progress,
    totalDuration,
    isPaused,
    elapsedMs,
    playbackSpeed,
  };
}
