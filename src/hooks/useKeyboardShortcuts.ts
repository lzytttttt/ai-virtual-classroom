import { useEffect } from 'react';
import { useClassroomStore } from '../store/classroomStore';
import { useScriptPlayback } from './useScriptPlayback';
import { useTeacherAction } from './useTeacherAction';
import type { LessonPhase } from '../store/types';

export function useKeyboardShortcuts() {
  const { togglePlayPause, fastForward, seekTo } = useScriptPlayback();
  const { callOnStudent, askQuestion, discipline, groupDiscussion } = useTeacherAction();
  const { students, scriptNodes, setPlaybackSpeed, playbackSpeed } = useClassroomStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;

        case 'ArrowRight':
          e.preventDefault();
          fastForward();
          break;

        case 'Digit1':
          e.preventDefault();
          callOnStudent('student-1');
          break;

        case 'Digit2':
          e.preventDefault();
          askQuestion();
          break;

        case 'Digit3':
          e.preventDefault();
          discipline();
          break;

        case 'Digit4':
          e.preventDefault();
          groupDiscussion();
          break;

        // Rehearsal mode: 2x speed toggle
        case 'KeyT':
          e.preventDefault();
          setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1);
          break;

        // Phase skip: 5-8 keys
        case 'Digit5':
          e.preventDefault();
          skipToPhase('intro', scriptNodes, seekTo);
          break;
        case 'Digit6':
          e.preventDefault();
          skipToPhase('teaching', scriptNodes, seekTo);
          break;
        case 'Digit7':
          e.preventDefault();
          skipToPhase('interaction', scriptNodes, seekTo);
          break;
        case 'Digit8':
          e.preventDefault();
          skipToPhase('summary', scriptNodes, seekTo);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, fastForward, callOnStudent, askQuestion, discipline, groupDiscussion, students, scriptNodes, playbackSpeed, setPlaybackSpeed, seekTo]);
}

function skipToPhase(
  phase: LessonPhase,
  scriptNodes: ReturnType<typeof useClassroomStore.getState>['scriptNodes'],
  seekTo: (fraction: number) => void
) {
  const maxTime = scriptNodes.length > 0 ? scriptNodes[scriptNodes.length - 1].timestamp : 1;
  const phaseNode = scriptNodes.find((n) => n.type === 'phaseTransition' && n.phase === phase);
  if (phaseNode) {
    seekTo(phaseNode.timestamp / maxTime);
  }
}
