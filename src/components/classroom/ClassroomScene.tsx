import React from 'react';
import { Blackboard } from './Blackboard';
import { Desk } from './Desk';
import { Podium } from './Podium';
import { useClassroomStore } from '../../store/classroomStore';
import type { LessonPhase } from '../../store/types';

const blackboardContent: Record<LessonPhase, string[]> = {
  intro: ['《滕王阁序》', '王勃'],
  teaching: ['落霞与孤鹜齐飞', '秋水共长天一色'],
  interaction: ['思考与讨论'],
  summary: ['穷且益坚', '不坠青云之志'],
};

const SHARED_FILTERS = (
  <defs>
    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="2" stdDeviation="4" floodOpacity="0.2" floodColor="var(--color-dark)" />
    </filter>
    <filter id="warmGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
      <feColorMatrix in="blur" type="matrix"
        values="1 0 0 0 0.1  0 1 0 0 0.05  0 0 1 0 0  0 0 0 0.4 0" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

export const ClassroomScene: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const lessonPhase = useClassroomStore((s) => s.lessonPhase);
  const deskPositions: { x: number; y: number }[] = [];
  // Row 1: 3 desks
  for (let i = 0; i < 3; i++) {
    deskPositions.push({ x: 480 + i * 180, y: 420 });
  }
  // Row 2: 3 desks
  for (let i = 0; i < 3; i++) {
    deskPositions.push({ x: 480 + i * 180, y: 580 });
  }

  return (
    <div style={{
      width: '100vw',
      height: 'auto',
      aspectRatio: '3 / 2',
      maxHeight: '100vh',
      overflow: 'hidden',
    }}>
      <svg
        viewBox="0 0 1200 800"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        {SHARED_FILTERS}

        {/* Back wall */}
        <rect x="0" y="0" width="1200" height="500" fill="var(--color-cream)" rx="0" />

        {/* Floor */}
        <rect x="0" y="500" width="1200" height="300" fill="#E8D5B7" rx="0" />
        {/* Floor line */}
        <line x1="0" y1="500" x2="1200" y2="500" stroke="var(--color-dark)" strokeWidth="3" />

        {/* Left wall accent strip */}
        <rect x="0" y="0" width="20" height="500" fill="var(--color-primary)" opacity="0.3" />

        {/* Window (right side) */}
        <g transform="translate(950, 80)" filter="url(#warmGlow)">
          {/* Window frame */}
          <rect x="0" y="0" width="180" height="240" rx="6" ry="6"
            fill="none" stroke="var(--color-dark)" strokeWidth="3" />
          {/* Window panes */}
          <rect x="4" y="4" width="84" height="114" rx="4" ry="4" fill="#FFEBCC" />
          <rect x="92" y="4" width="84" height="114" rx="4" ry="4" fill="#FFEBCC" />
          <rect x="4" y="122" width="84" height="114" rx="4" ry="4" fill="#FFD9A0" />
          <rect x="92" y="122" width="84" height="114" rx="4" ry="4" fill="#FFD9A0" />
          {/* Window cross bars */}
          <line x1="90" y1="0" x2="90" y2="240" stroke="var(--color-dark)" strokeWidth="3" />
          <line x1="0" y1="120" x2="180" y2="120" stroke="var(--color-dark)" strokeWidth="3" />
          {/* Warm light rays */}
          <polygon points="0,240 -40,360 220,360 180,240" fill="var(--color-primary)" opacity="0.08" />
        </g>

        {/* Clock on wall */}
        <g transform="translate(820, 60)">
          <circle cx="0" cy="0" r="28" fill="var(--color-cream)" stroke="var(--color-dark)" strokeWidth="3" />
          <line x1="0" y1="0" x2="0" y2="-18" stroke="var(--color-dark)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="0" x2="12" y2="4" stroke="var(--color-dark)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="0" r="3" fill="var(--color-accent-coral)" />
        </g>

        {/* Blackboard */}
        <Blackboard x={280} y={60} width={480} height={260} content={blackboardContent[lessonPhase]} />

        {/* Podium */}
        <Podium x={60} y={320} />

        {/* Desks */}
        {deskPositions.map((pos, i) => (
          <Desk key={i} x={pos.x} y={pos.y} />
        ))}

        {/* Children (student sprites rendered on top) */}
        {children}
      </svg>
    </div>
  );
};

export default ClassroomScene;
