import { useEffect, useState, useRef } from 'react';
import { useClassroomStore } from '../store/classroomStore';
import type { ScriptNode } from '../store/types';

export function NarratorOverlay() {
  const scriptNodes = useClassroomStore((s) => s.scriptNodes);
  const scriptPosition = useClassroomStore((s) => s.scriptPosition);
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [isPhase, setIsPhase] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    const recentNodes: ScriptNode[] = [];
    const lookBack = Math.max(0, scriptPosition - 3);
    for (let i = lookBack; i < scriptPosition; i++) {
      if (scriptNodes[i]) recentNodes.push(scriptNodes[i]);
    }

    const narrationNode = recentNodes.find(
      (n) => n.type === 'narration' || n.type === 'phaseTransition',
    );

    if (narrationNode) {
      const displayText =
        narrationNode.type === 'phaseTransition'
          ? narrationNode.title
          : narrationNode.type === 'narration'
          ? narrationNode.text
          : '';

      if (displayText && displayText !== text) {
        setText(displayText);
        setIsPhase(narrationNode.type === 'phaseTransition');
        setVisible(true);
        setOpacity(1);

        clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          setOpacity(0);
          setTimeout(() => setVisible(false), 400);
        }, narrationNode.type === 'phaseTransition' ? 2500 : 4000);
      }
    }
  }, [scriptPosition, scriptNodes]);

  if (!visible) return null;

  return (
    <div
      className={`narration-overlay${isPhase ? ' narration-overlay--phase' : ''}`}
      style={{ opacity, transition: 'opacity 0.4s ease' }}
    >
      {isPhase ? (
        <div className="narration-overlay__phase-text">{text}</div>
      ) : (
        <div className="narration-overlay__text">{text}</div>
      )}
    </div>
  );
}
