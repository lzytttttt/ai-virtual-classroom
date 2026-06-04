import React from 'react';

export type BubbleMode = 'individual' | 'collective-reading';

interface SpeechBubbleProps {
  text: string;
  mode?: BubbleMode;
  /** Position offset from character center */
  offsetX?: number;
  offsetY?: number;
}

const FONT_SIZE = 12;
const LINE_HEIGHT = 15;
const PADDING_X = 10;
const PADDING_Y = 8;
const MAX_BUBBLE_WIDTH = 200;
const MAX_LINES = 4;

/** Pixel width of a single character at the current font size */
function charWidth(ch: string): number {
  // CJK / fullwidth ≈ 1.05em, Latin/digits ≈ 0.55em
  return ch.charCodeAt(0) > 0x7F ? FONT_SIZE * 1.05 : FONT_SIZE * 0.55;
}

/** Pixel width of a string */
function measureText(s: string): number {
  let w = 0;
  for (const ch of s) w += charWidth(ch);
  return w;
}

/** Wrap text to fit within maxWidthPx, truncating with '…' if exceeding MAX_LINES */
function wrapText(text: string, maxWidthPx: number): string[] {
  const maxContentWidth = maxWidthPx - PADDING_X * 2;
  const lines: string[] = [];
  let current = '';

  for (const ch of text) {
    const test = current + ch;
    if (measureText(test) > maxContentWidth && current) {
      lines.push(current);
      current = ch;
      if (lines.length >= MAX_LINES) break;
    } else {
      current = test;
    }
  }
  if (current && lines.length < MAX_LINES) lines.push(current);

  // Truncate last line if we hit the limit mid-word
  if (lines.length === MAX_LINES && current && !lines[MAX_LINES - 1].endsWith(current)) {
    const last = lines[MAX_LINES - 1];
    const truncated = last.slice(0, -2) + '…';
    lines[MAX_LINES - 1] = truncated;
  }

  return lines.length > 0 ? lines : [text.slice(0, 8) + '…'];
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  mode = 'individual',
  offsetX = 0,
  offsetY = -20,
}) => {
  if (mode === 'collective-reading') {
    return (
      <g
        className="speech-bubble reading-bubble"
        transform={`translate(${offsetX}, ${offsetY})`}
      >
        {/* Reading band below character */}
        <rect
          x="-60" y="0"
          width="120" height="24"
          rx="12" ry="12"
          fill="#54A0FF"
          stroke="#3D3D3D"
          strokeWidth="2"
          opacity="0.9"
        />
        <text
          x="0" y="15"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize="11"
          fontFamily="'Comic Sans MS', 'Chalkboard SE', cursive"
          fontWeight="bold"
        >
          {text}
        </text>
      </g>
    );
  }

  // Individual speech bubble
  const textLines = wrapText(text, MAX_BUBBLE_WIDTH);
  const widestLine = Math.max(60, ...textLines.map(measureText));
  const bubbleWidth = Math.min(MAX_BUBBLE_WIDTH, widestLine + PADDING_X * 2);
  const bubbleHeight = textLines.length * LINE_HEIGHT + PADDING_Y * 2;

  return (
    <g
      className="speech-bubble"
      transform={`translate(${offsetX}, ${offsetY})`}
    >
      {/* Full text for hover */}
      <title>{text}</title>

      {/* Bubble body */}
      <rect
        x={-bubbleWidth / 2} y={-bubbleHeight}
        width={bubbleWidth} height={bubbleHeight}
        rx="10" ry="10"
        fill="#FFFFFF"
        stroke="#3D3D3D"
        strokeWidth="2.5"
      />
      {/* Tail (pointing down) */}
      <polygon
        points="-6,{-2} 6,{-2} 0,10"
        fill="#FFFFFF"
        stroke="#3D3D3D"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Cover the tail-body junction */}
      <rect
        x="-8" y="-4"
        width="16" height="6"
        fill="#FFFFFF"
      />
      {/* Text lines */}
      {textLines.map((line, i) => (
        <text
          key={i}
          x="0"
          y={-bubbleHeight + PADDING_Y + LINE_HEIGHT * (i + 1) - 3}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#3D3D3D"
          fontSize={FONT_SIZE}
          fontFamily="'Comic Sans MS', 'Chalkboard SE', cursive"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export default SpeechBubble;
