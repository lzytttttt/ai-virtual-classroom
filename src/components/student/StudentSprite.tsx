import React from 'react';
import type { StudentSlice } from '../../store/types';
import { StateOverlay } from './StateOverlay';
import { SpeechBubble, type BubbleMode } from './SpeechBubble';
import { StudentStatusBadge } from './StudentStatusBadge';

const PERSONALITY_SVG_MAP: Record<string, string> = {
  '学霸': `${import.meta.env.BASE_URL}svg/student-base-学霸.svg`,
  '内向': `${import.meta.env.BASE_URL}svg/student-base-内向.svg`,
  '调皮': `${import.meta.env.BASE_URL}svg/student-base-调皮.svg`,
  '努力': `${import.meta.env.BASE_URL}svg/student-base-努力.svg`,
  '文艺': `${import.meta.env.BASE_URL}svg/student-base-文艺.svg`,
  '体育': `${import.meta.env.BASE_URL}svg/student-base-体育.svg`,
};

/** Desk positions matching ClassroomScene layout */
function getSeatWorldPos(row: number, col: number): { x: number; y: number } {
  return {
    x: 480 + col * 180,
    y: row === 0 ? 420 : 580,
  };
}

interface StudentSpriteProps {
  student: StudentSlice;
  bubbleText?: string;
  bubbleMode?: BubbleMode;
  isSelected?: boolean;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}

export const StudentSprite: React.FC<StudentSpriteProps> = ({
  student,
  bubbleText,
  bubbleMode = 'individual',
  isSelected = false,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { personality, state, seatPosition } = student;
  const svgSrc = PERSONALITY_SVG_MAP[personality];
  const seatPos = getSeatWorldPos(seatPosition.row, seatPosition.col);

  const charWidth = 60;
  const charHeight = 90;
  const charX = seatPos.x - charWidth / 2;
  const charY = seatPos.y - charHeight - 10;

  return (
    <g
      className={`student-sprite state-${state}${isSelected ? ' student-sprite--selected' : ''}`}
      style={{ cursor: 'pointer' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Selection highlight ring */}
      {isSelected && (
        <ellipse
          cx={seatPos.x}
          cy={seatPos.y - 10}
          rx={45}
          ry={20}
          className="student-selected-glow"
        />
      )}

      {/* Character base (SVG image) */}
      <image
        href={svgSrc}
        x={charX}
        y={charY}
        width={charWidth}
        height={charHeight}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* State overlay */}
      <g transform={`translate(${charX}, ${charY}) scale(${charWidth / 120}, ${charHeight / 180})`}>
        <StateOverlay state={state} />
      </g>

      {/* Status badge above character */}
      <g transform={`translate(${seatPos.x}, ${charY - 8})`}>
        <StudentStatusBadge state={state} name={student.name} />
      </g>

      {/* Speech bubble */}
      {bubbleText && (
        <g transform={`translate(${seatPos.x}, ${charY - 20})`}>
          <SpeechBubble text={bubbleText} mode={bubbleMode} />
        </g>
      )}
    </g>
  );
};

export default StudentSprite;
