import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useClassroomStore } from '../store/classroomStore';
import { selectTotalDuration } from '../store/selectors';
import type { ScriptNode } from '../store/types';

export function useScriptPlayback() {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const store = useClassroomStore;
  const isPaused = useSyncExternalStore(store.subscribe, () => store.getState().isPaused);
  const interaction = useSyncExternalStore(store.subscribe, () => store.getState().interaction);
  const playbackSpeed = useSyncExternalStore(store.subscribe, () => store.getState().playbackSpeed);
  const elapsedMs = useSyncExternalStore(store.subscribe, () => store.getState().elapsedMs);

  // Main playback loop
  useEffect(() => {
    const blocked = isPaused || (interaction && interaction.mode !== 'idle' && interaction.mode !== 'script-playing');
    if (blocked) {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
      return;
    }

    const tick = (now: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = (now - lastTimeRef.current) * store.getState().playbackSpeed;
      lastTimeRef.current = now;

      const state = store.getState();
      const newElapsed = state.elapsedMs + delta;
      const totalDuration = selectTotalDuration(state);

      if (newElapsed >= totalDuration) {
        store.setState({ elapsedMs: totalDuration, isPaused: true });
        return;
      }

      // Advance script position
      let pos = state.scriptPosition;
      const nodes = state.scriptNodes;
      while (pos < nodes.length && nodes[pos].timestamp <= newElapsed) {
        pos++;
      }

      const posChanged = pos !== state.scriptPosition;
      store.setState({ elapsedMs: newElapsed, scriptPosition: pos });
      if (posChanged) {
        const justPassed = nodes[pos - 1];
        if (justPassed && justPassed.type === 'teacherPrompt') {
          store.setState({
            interaction: {
              mode: 'teacher-prompt',
              actionType: justPassed.action,
              prompt: justPassed.prompt,
              targetStudentId: justPassed.targetStudentId ?? null,
              candidateStudentIds: [],
              feedbackText: null,
              startedAt: Date.now(),
              resolvedAt: null,
              canContinue: false,
              source: 'script',
            },
          });
        }
        state.reconcileScriptState(newElapsed);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused, interaction?.mode]);

  const play = useCallback(() => {
    store.setState({ isPaused: false });
    lastTimeRef.current = 0;
  }, []);

  const pause = useCallback(() => {
    store.setState({ isPaused: true });
  }, []);

  const togglePlayPause = useCallback(() => {
    const s = store.getState();
    if (s.isPaused) {
      store.setState({ isPaused: false });
      lastTimeRef.current = 0;
    } else {
      store.setState({ isPaused: true });
    }
  }, []);

  const fastForward = useCallback(() => {
    const s = store.getState();
    const nodes = s.scriptNodes;
    const elapsed = s.elapsedMs;
    for (let i = s.scriptPosition; i < nodes.length; i++) {
      if (nodes[i].type === 'teacherPrompt' && nodes[i].timestamp > elapsed) {
        store.setState({ elapsedMs: nodes[i].timestamp, scriptPosition: i });
        s.reconcileScriptState(nodes[i].timestamp);
        return;
      }
    }
  }, []);

  const seekTo = useCallback((fraction: number) => {
    const s = store.getState();
    const total = selectTotalDuration(s);
    const targetMs = fraction * total;

    let pos = 0;
    const nodes = s.scriptNodes;
    while (pos < nodes.length && nodes[pos].timestamp <= targetMs) {
      pos++;
    }

    store.setState({ elapsedMs: targetMs, scriptPosition: pos, isPaused: true });
    s.reconcileScriptState(targetMs);
  }, []);

  const skipToPhase = useCallback((phaseScriptNode: ScriptNode | undefined) => {
    if (phaseScriptNode) {
      const s = store.getState();
      const total = selectTotalDuration(s);
      seekTo(phaseScriptNode.timestamp / total);
    }
  }, [seekTo]);

  const totalDuration = useSyncExternalStore(store.subscribe, () => selectTotalDuration(store.getState()));
  const progress = totalDuration > 0 ? Math.min(1, elapsedMs / totalDuration) : 0;

  return {
    elapsedMs,
    totalDuration,
    progress,
    isPaused,
    playbackSpeed,
    play,
    pause,
    togglePlayPause,
    fastForward,
    seekTo,
    skipToPhase,
  };
}
