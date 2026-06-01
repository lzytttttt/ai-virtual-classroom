import React from 'react';

interface BlackboardProps {
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string | string[];
}

export const Blackboard: React.FC<BlackboardProps> = ({ x, y, width, height, content }) => {
  const lines = content
    ? (Array.isArray(content) ? content : [content])
    : null;

  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#dropShadow)">
      {/* Outer frame (wood) */}
      <rect
        x="-8" y="-8"
        width={width + 16} height={height + 16}
        rx="6" ry="6"
        fill="#A0784C"
        stroke="var(--color-dark)"
        strokeWidth="3"
      />
      {/* Inner green board */}
      <rect
        x="0" y="0"
        width={width} height={height}
        rx="4" ry="4"
        fill="#2D5A27"
        stroke="var(--color-dark)"
        strokeWidth="2"
      />
      {/* Chalk tray */}
      <rect
        x="10" y={height - 16}
        width={width - 20} height="12"
        rx="3" ry="3"
        fill="#A0784C"
        stroke="var(--color-dark)"
        strokeWidth="2"
      />
      {/* Chalk pieces */}
      <rect x="40" y={height - 14} width="20" height="6" rx="3" ry="3" fill="#FFFFFF" opacity="0.9" />
      <rect x="70" y={height - 14} width="20" height="6" rx="3" ry="3" fill="var(--color-accent-coral)" opacity="0.9" />
      <rect x="100" y={height - 14} width="20" height="6" rx="3" ry="3" fill="#FFEB3B" opacity="0.9" />

      {/* Chalk text area */}
      {lines ? (
        <g>
          {lines.map((line, i) => {
            const isTitle = lines.length === 1;
            const fontSize = isTitle ? '28' : '22';
            const totalHeight = lines.length * 32;
            const startY = (height - 16) / 2 - totalHeight / 2 + 16;
            const yPos = startY + i * 36;

            return (
              <text
                key={i}
                className="chalk-text"
                x={width / 2}
                y={yPos}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FFFFFF"
                fontSize={fontSize}
                fontFamily="'Comic Sans MS', 'Chalkboard SE', cursive"
                opacity="0.9"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                {line}
              </text>
            );
          })}
        </g>
      ) : (
        /* Default lesson lines (chalk style) */
        <g opacity="0.7">
          <line x1="30" y1="40" x2={width - 30} y2="40" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeDasharray="2,6" />
          <line x1="30" y1="70" x2={width * 0.6} y2="70" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeDasharray="2,6" />
          <line x1="30" y1="100" x2={width * 0.8} y2="100" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeDasharray="2,6" />
          <line x1="30" y1="130" x2={width * 0.5} y2="130" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeDasharray="2,6" />
          {/* Small chalk drawing - star */}
          <polygon
            points={`${width - 80},140 ${width - 72},120 ${width - 64},140 ${width - 84},128 ${width - 60},128`}
            fill="none"
            stroke="#FFEB3B"
            strokeWidth="1.5"
            opacity="0.8"
          />
        </g>
      )}
    </g>
  );
};

export default Blackboard;
