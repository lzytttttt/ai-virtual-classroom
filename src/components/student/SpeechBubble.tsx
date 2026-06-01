import React from 'react';

export type BubbleMode = 'individual' | 'collective-reading';

interface SpeechBubbleProps {
  text: string;
  mode?: BubbleMode;
  /** Position offset from character center */
  offsetX?: number;
  offsetY?: number;
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
  const textLines = wrapText(text, 12);
  const lineHeight = 14;
  const padding = 10;
  const bubbleHeight = textLines.length * lineHeight + padding * 2;
  const bubbleWidth = Math.max(60, Math.max(...textLines.map(l => l.length)) * 9 + padding * 2);

  return (
    <g
      className="speech-bubble"
      transform={`translate(${offsetX}, ${offsetY})`}
    >
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
        points={`-6,${-2} 6,${-2} 0,10`}
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
          y={-bubbleHeight + padding + lineHeight * (i + 1) - 3}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#3D3D3D"
          fontSize="12"
          fontFamily="'Comic Sans MS', 'Chalkboard SE', cursive"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

/** Simple text wrapping for CJK and Latin characters */
function wrapText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const lines: string[] = [];
  let remaining = text;
  while (remaining.length > maxChars) {
    lines.push(remaining.slice(0, maxChars));
    remaining = remaining.slice(maxChars);
  }
  if (remaining) lines.push(remaining);
  return lines;
}

export default SpeechBubble;
