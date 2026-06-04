import React from 'react';
import type { StudentState } from '../../store/types';

const STATE_BADGE_LABELS: Record<StudentState, string> = {
  'normal': '',
  'hand-raised': '🙋 举手',
  'answering': '💬 回答',
  'collective-reading': '📖 朗读',
  'distracted': '💭 走神',
  'sleeping': '💤 睡觉',
};

interface StudentStatusBadgeProps {
  state: StudentState;
  name: string;
}

export const StudentStatusBadge: React.FC<StudentStatusBadgeProps> = ({ state }) => {
  const label = STATE_BADGE_LABELS[state];
  if (!label) return null;

  return (
    <g className="speech-bubble-container">
      <rect
        x={-28}
        y={-12}
        width={56}
        height={18}
        rx={9}
        ry={9}
        fill={state === 'sleeping' ? 'var(--color-accent-coral)' :
              state === 'distracted' ? 'var(--color-warning)' :
              state === 'answering' ? 'var(--color-secondary)' :
              state === 'hand-raised' ? 'var(--color-primary)' :
              'var(--color-accent-green)'}
        opacity={0.9}
      />
      <text
        x={0}
        y={1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize={8}
        fontWeight={600}
        fontFamily="var(--font-main)"
      >
        {label}
      </text>
    </g>
  );
};

export default StudentStatusBadge;
