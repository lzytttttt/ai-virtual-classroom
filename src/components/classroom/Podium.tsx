import React from 'react';

interface PodiumProps {
  x: number;
  y: number;
}

export const Podium: React.FC<PodiumProps> = ({ x, y }) => {
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#dropShadow)">
      {/* Podium body */}
      <rect
        x="0" y="0"
        width="100" height="120"
        rx="6" ry="6"
        fill="#A0784C"
        stroke="#3D3D3D"
        strokeWidth="3"
      />
      {/* Podium top surface */}
      <rect
        x="-5" y="-8"
        width="110" height="16"
        rx="4" ry="4"
        fill="#C49A6C"
        stroke="#3D3D3D"
        strokeWidth="3"
      />
      {/* Front decorative panel */}
      <rect
        x="10" y="20"
        width="80" height="70"
        rx="4" ry="4"
        fill="#8B6B42"
        stroke="#3D3D3D"
        strokeWidth="2"
      />
      {/* Inner panel accent */}
      <rect
        x="18" y="28"
        width="64" height="54"
        rx="3" ry="3"
        fill="#C49A6C"
        opacity="0.5"
      />
      {/* Small microphone */}
      <line x1="70" y1="-8" x2="70" y2="-35" stroke="#3D3D3D" strokeWidth="2" strokeLinecap="round" />
      <circle cx="70" cy="-40" r="6" fill="#3D3D3D" />
      <circle cx="70" cy="-40" r="4" fill="#555" />
      {/* Book on podium */}
      <rect
        x="20" y="-18"
        width="30" height="10"
        rx="2" ry="2"
        fill="#FF6B6B"
        stroke="#3D3D3D"
        strokeWidth="1.5"
      />
    </g>
  );
};

export default Podium;
