import { useEffect, useState, useRef } from 'react';
import { useClassroomStore } from '../store/classroomStore';
import type { ScriptNode } from '../store/types';

export function NarratorOverlay() {
  const scriptNodes = useClassroomStore((s) => s.scriptNodes);
  const scriptPosition = useClassroomStore((s) => s.scriptPosition);
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [opacity, setOpacity] = useState(0);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    // Look for narration or phaseTransition at current position
    const recentNodes: ScriptNode[] = [];
    const lookBack = Math.max(0, scriptPosition - 3);
    for (let i = lookBack; i < scriptPosition; i++) {
      if (scriptNodes[i]) recentNodes.push(scriptNodes[i]);
    }

    const narrationNode = recentNodes.find(
      (n) => n.type === 'narration' || n.type === 'phaseTransition'
    );

    if (narrationNode) {
      const displayText =
        narrationNode.type === 'phaseTransition'
          ? `— ${narrationNode.title} —`
          : narrationNode.type === 'narration'
          ? narrationNode.text
          : '';

      if (displayText && displayText !== text) {
        setText(displayText);
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

  const isPhaseTransition = text.startsWith('—') && text.endsWith('—');

  return (
    <div
      style={{
        position: 'absolute',
        top: isPhaseTransition ? '50%' : '16px',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        pointerEvents: 'none',
        opacity,
        transition: 'opacity 0.4s ease',
        textAlign: 'center',
        maxWidth: '80%',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          padding: isPhaseTransition ? '16px 48px' : '10px 28px',
          background: isPhaseTransition
            ? 'linear-gradient(135deg, rgba(255,159,67,0.95), rgba(84,160,255,0.95))'
            : 'rgba(0,0,0,0.75)',
          borderRadius: '12px',
          color: '#fff',
          fontSize: isPhaseTransition ? '28px' : '16px',
          fontWeight: isPhaseTransition ? 700 : 500,
          fontFamily: 'var(--font-main)',
          letterSpacing: isPhaseTransition ? '4px' : '1px',
          boxShadow: isPhaseTransition
            ? '0 8px 32px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {text}
      </div>
    </div>
  );
}
