import React from 'react';

interface DeskProps {
  x: number;
  y: number;
}

export const Desk: React.FC<DeskProps> = ({ x, y }) => {
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#dropShadow)">
      {/* Desk top surface */}
      <rect
        x="-60" y="-10"
        width="120" height="20"
        rx="4" ry="4"
        fill="#FF9F43"
        stroke="#3D3D3D"
        strokeWidth="3"
      />
      {/* Desk front panel */}
      <rect
        x="-55" y="10"
        width="110" height="30"
        rx="4" ry="4"
        fill="#E88A30"
        stroke="#3D3D3D"
        strokeWidth="2"
      />
      {/* Left leg */}
      <rect
        x="-50" y="40"
        width="8" height="20"
        rx="2" ry="2"
        fill="#3D3D3D"
      />
      {/* Right leg */}
      <rect
        x="42" y="40"
        width="8" height="20"
        rx="2" ry="2"
        fill="#3D3D3D"
      />
      {/* Small book on desk */}
      <rect
        x="-20" y="-16"
        width="24" height="8"
        rx="2" ry="2"
        fill="#54A0FF"
        stroke="#3D3D3D"
        strokeWidth="1.5"
      />
    </g>
  );
};

export default Desk;
