import React from 'react';
import type { StudentState } from '../../store/types';

interface StateOverlayProps {
  state: StudentState;
}

export const StateOverlay: React.FC<StateOverlayProps> = ({ state }) => {
  switch (state) {
    case 'normal':
      return null;

    case 'hand-raised':
      return (
        <g className="state-hand-raised">
          {/* Raised arm extending upward from right shoulder */}
          <g className="hand-arm">
            <rect
              x="72" y="20"
              width="12" height="40"
              rx="6" ry="6"
              fill="#FFD9A0"
              stroke="#3D3D3D"
              strokeWidth="2.5"
              transform="rotate(15, 78, 40)"
            />
            {/* Open hand */}
            <ellipse cx="78" cy="16" rx="8" ry="6" fill="#FFD9A0" stroke="#3D3D3D" strokeWidth="2" />
            {/* Fingers */}
            <line x1="74" y1="12" x2="72" y2="6" stroke="#FFD9A0" strokeWidth="3" strokeLinecap="round" />
            <line x1="78" y1="10" x2="78" y2="3" stroke="#FFD9A0" strokeWidth="3" strokeLinecap="round" />
            <line x1="82" y1="12" x2="84" y2="6" stroke="#FFD9A0" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* Attention sparkles */}
          <polygon points="90,10 92,5 94,10 99,12 94,14 92,19 90,14 85,12" fill="#FF9F43" opacity="0.8" />
          <polygon points="65,8 66,4 67,8 71,9 67,10 66,14 65,10 61,9" fill="#FF9F43" opacity="0.6" />
        </g>
      );

    case 'answering':
      return (
        <g className="state-answering">
          {/* Open mouth override */}
          <ellipse cx="60" cy="64" rx="6" ry="4" fill="#3D3D3D" className="mouth" />
          {/* Small sound waves */}
          <path d="M72,58 Q78,56 78,60" fill="none" stroke="#3D3D3D" strokeWidth="1.5" opacity="0.5" />
          <path d="M76,55 Q84,52 84,58" fill="none" stroke="#3D3D3D" strokeWidth="1.5" opacity="0.3" />
        </g>
      );

    case 'collective-reading':
      return (
        <g className="state-reading">
          {/* Open mouth for reading */}
          <ellipse cx="60" cy="64" rx="5" ry="3" fill="#3D3D3D" className="mouth" />
          {/* Book prop in front of student */}
          <g transform="translate(35, 100)">
            <rect x="0" y="0" width="50" height="35" rx="3" ry="3" fill="#54A0FF" stroke="#3D3D3D" strokeWidth="2" />
            {/* Book pages */}
            <line x1="25" y1="2" x2="25" y2="33" stroke="#3D3D3D" strokeWidth="1.5" />
            <line x1="8" y1="10" x2="22" y2="10" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
            <line x1="8" y1="15" x2="20" y2="15" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
            <line x1="8" y1="20" x2="22" y2="20" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
            <line x1="28" y1="10" x2="42" y2="10" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
            <line x1="28" y1="15" x2="40" y2="15" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
            <line x1="28" y1="20" x2="42" y2="20" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
          </g>
          {/* Reading indicator lines */}
          <g className="reading-indicator" opacity="0.6">
            <line x1="86" y1="50" x2="100" y2="50" stroke="#54A0FF" strokeWidth="2" strokeLinecap="round" />
            <line x1="88" y1="56" x2="98" y2="56" stroke="#54A0FF" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      );

    case 'distracted':
      return (
        <g className="state-distracted">
          {/* Eyes looking away */}
          <g className="eyes">
            <circle cx="50" cy="48" r="3" fill="#3D3D3D" transform="translate(3, -1)" />
            <circle cx="76" cy="48" r="3" fill="#3D3D3D" transform="translate(3, -1)" />
          </g>
          {/* Thought bubble */}
          <g className="thought-bubble" transform="translate(85, 10)">
            <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#3D3D3D" strokeWidth="2" />
            <circle cx="-8" cy="18" r="5" fill="#FFFFFF" stroke="#3D3D3D" strokeWidth="1.5" />
            <circle cx="-12" cy="28" r="3" fill="#FFFFFF" stroke="#3D3D3D" strokeWidth="1.5" />
            {/* Thought content - butterfly */}
            <path d="M-6,-4 Q-10,-10 -4,-8 Q0,-12 4,-8 Q10,-10 6,-4 Q10,0 4,2 Q0,6 -4,2 Q-10,0 -6,-4Z"
              fill="#FF9F43" stroke="#3D3D3D" strokeWidth="1" opacity="0.8" />
            <line x1="0" y1="-8" x2="0" y2="2" stroke="#3D3D3D" strokeWidth="0.8" />
          </g>
        </g>
      );

    case 'sleeping':
      return (
        <g className="state-sleeping">
          {/* Closed eyes */}
          <g className="eyes">
            <path d="M42,48 Q47,52 52,48" fill="none" stroke="#3D3D3D" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M68,48 Q73,52 78,48" fill="none" stroke="#3D3D3D" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* ZZZ bubbles */}
          <text className="zzz-1" x="80" y="30" fontSize="14" fontWeight="bold" fill="#54A0FF" fontFamily="Arial, sans-serif">z</text>
          <text className="zzz-2" x="90" y="18" fontSize="18" fontWeight="bold" fill="#54A0FF" fontFamily="Arial, sans-serif">z</text>
          <text className="zzz-3" x="102" y="4" fontSize="22" fontWeight="bold" fill="#54A0FF" fontFamily="Arial, sans-serif">z</text>
        </g>
      );

    default:
      return null;
  }
};

export default StateOverlay;
