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
      <feDropShadow dx="2" dy="2" stdDeviation="4" floodOpacity="0.2" floodColor="#3D3D3D" />
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
  for (let i = 0; i < 3; i++) {
    deskPositions.push({ x: 480 + i * 180, y: 420 });
  }
  for (let i = 0; i < 3; i++) {
    deskPositions.push({ x: 480 + i * 180, y: 580 });
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
      >
        {SHARED_FILTERS}

        {/* Floor */}
        <rect x="0" y="300" width="1200" height="500" fill="#E8DCC8" />

        {/* Wall */}
        <rect x="0" y="0" width="1200" height="300" fill="#F5EFE0" />

        {/* Wall trim */}
        <rect x="0" y="290" width="1200" height="10" fill="#C49A6C" />

        {/* Window (left) */}
        <g className="window-light">
          <rect x="40" y="60" width="120" height="180" rx="4" ry="4" fill="#87CEEB" opacity="0.4" />
          <rect x="40" y="60" width="120" height="180" rx="4" ry="4" fill="none" stroke="#8B7355" strokeWidth="6" />
          <line x1="100" y1="60" x2="100" y2="240" stroke="#8B7355" strokeWidth="3" />
          <line x1="40" y1="150" x2="160" y2="150" stroke="#8B7355" strokeWidth="3" />
        </g>

        {/* Window (right) */}
        <g className="window-light">
          <rect x="1040" y="60" width="120" height="180" rx="4" ry="4" fill="#87CEEB" opacity="0.4" />
          <rect x="1040" y="60" width="120" height="180" rx="4" ry="4" fill="none" stroke="#8B7355" strokeWidth="6" />
          <line x1="1100" y1="60" x2="1100" y2="240" stroke="#8B7355" strokeWidth="3" />
          <line x1="1040" y1="150" x2="1160" y2="150" stroke="#8B7355" strokeWidth="3" />
        </g>

        {/* Clock */}
        <g transform="translate(600, 50)">
          <circle cx="0" cy="0" r="24" fill="#FFF" stroke="#3D3D3D" strokeWidth="3" />
          <line x1="0" y1="0" x2="0" y2="-14" stroke="#3D3D3D" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="0" x2="8" y2="-6" stroke="#3D3D3D" strokeWidth="2" strokeLinecap="round" />
          <line className="clock-second-hand" x1="0" y1="0" x2="0" y2="-16" stroke="#E8645A" strokeWidth="1" strokeLinecap="round" />
          <circle cx="0" cy="0" r="2" fill="#3D3D3D" />
        </g>

        {/* Blackboard */}
        <Blackboard
          x={300} y={80}
          width={600} height={180}
          content={blackboardContent[lessonPhase]}
        />

        {/* Podium */}
        <Podium x={550} y={310} />

        {/* Desks */}
        {deskPositions.map((pos, i) => (
          <Desk key={i} x={pos.x} y={pos.y} />
        ))}

        {/* Student layer */}
        {children}
      </svg>
    </div>
  );
};

export default ClassroomScene;
