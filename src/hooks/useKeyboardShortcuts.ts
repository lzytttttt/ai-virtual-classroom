import { useEffect } from 'react';
import { useClassroomStore } from '../store/classroomStore';
import { useScriptPlayback } from './useScriptPlayback';

export function useKeyboardShortcuts() {
  const { togglePlayPause, fastForward, skipToPhase } = useScriptPlayback();
  const { scriptNodes, setPlaybackSpeed, playbackSpeed, interaction, clearInteraction } = useClassroomStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

        case 'KeyT':
          e.preventDefault();
          setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1);
          break;

        case 'Digit5':
          e.preventDefault();
          skipToPhase(scriptNodes.find((n) => n.type === 'phaseTransition' && n.phase === 'intro'));
          break;
        case 'Digit6':
          e.preventDefault();
          skipToPhase(scriptNodes.find((n) => n.type === 'phaseTransition' && n.phase === 'teaching'));
          break;
        case 'Digit7':
          e.preventDefault();
          skipToPhase(scriptNodes.find((n) => n.type === 'phaseTransition' && n.phase === 'interaction'));
          break;
        case 'Digit8':
          e.preventDefault();
          skipToPhase(scriptNodes.find((n) => n.type === 'phaseTransition' && n.phase === 'summary'));
          break;

        case 'Escape':
          e.preventDefault();
          if (interaction?.mode === 'feedback') {
            clearInteraction();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, fastForward, skipToPhase, scriptNodes, playbackSpeed, setPlaybackSpeed, interaction, clearInteraction]);
}
