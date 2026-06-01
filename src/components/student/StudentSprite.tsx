import React from 'react';
import type { StudentSlice } from '../../store/types';
import { StateOverlay } from './StateOverlay';
import { SpeechBubble, type BubbleMode } from './SpeechBubble';

const PERSONALITY_SVG_MAP: Record<string, string> = {
  '学霸': '/svg/student-base-学霸.svg',
  '内向': '/svg/student-base-内向.svg',
  '调皮': '/svg/student-base-调皮.svg',
  '努力': '/svg/student-base-努力.svg',
  '文艺': '/svg/student-base-文艺.svg',
  '体育': '/svg/student-base-体育.svg',
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
  /** Optional speech/thought text to display */
  bubbleText?: string;
  /** Bubble display mode */
  bubbleMode?: BubbleMode;
}

export const StudentSprite: React.FC<StudentSpriteProps> = ({
  student,
  bubbleText,
  bubbleMode = 'individual',
}) => {
  const { personality, state, seatPosition } = student;
  const svgSrc = PERSONALITY_SVG_MAP[personality];
  const seatPos = getSeatWorldPos(seatPosition.row, seatPosition.col);

  // Character is positioned so feet are near the desk
  // SVG viewBox is 120x180, scale down to fit ~60px width in scene
  const charWidth = 60;
  const charHeight = 90;
  const charX = seatPos.x - charWidth / 2;
  const charY = seatPos.y - charHeight - 10;

  return (
    <g className={`student-sprite state-${state}`}>
      {/* Character base (SVG image) */}
      <image
        href={svgSrc}
        x={charX}
        y={charY}
        width={charWidth}
        height={charHeight}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* State overlay positioned relative to character */}
      <g transform={`translate(${charX}, ${charY}) scale(${charWidth / 120}, ${charHeight / 180})`}>
        <StateOverlay state={state} />
      </g>

      {/* Speech bubble above character */}
      {bubbleText && (
        <g transform={`translate(${seatPos.x}, ${charY - 5})`}>
          <SpeechBubble text={bubbleText} mode={bubbleMode} />
        </g>
      )}
    </g>
  );
};

export default StudentSprite;
