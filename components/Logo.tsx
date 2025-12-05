import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      role="img"
      aria-label="Woodpecker Logo"
    >
      {/* Background Circle */}
      <circle cx="100" cy="100" r="95" fill="#F0F0F0" />
      
      {/* Tree Trunk - Watercolor style simulation with paths */}
      <path d="M140 190C140 190 130 150 135 100C140 50 130 10 130 10H160C160 10 170 60 165 110C160 160 170 190 170 190H140Z" fill="#A89F91" />
      <path d="M145 190C145 190 138 150 142 100C146 50 138 10 138 10" stroke="#8D8477" strokeWidth="2" opacity="0.5" />
      
      {/* Woodpecker Body */}
      {/* Tail */}
      <path d="M130 130L110 150L135 145" fill="#2C2C2C" />
      
      {/* Main Body Back (Dark Grey/Black) */}
      <path d="M135 130C135 130 115 135 105 115C95 95 100 80 110 70C110 70 120 75 125 90C130 105 135 130 135 130Z" fill="#2C2C2C" />
      
      {/* Wing (Dark Grey with texture hint) */}
      <path d="M128 95C128 95 110 100 115 120C120 140 132 125 132 125" fill="#3E3E3E" />
      
      {/* Chest (White) */}
      <path d="M105 115C105 115 90 110 95 90C100 70 110 70 110 70C110 70 105 90 105 115Z" fill="#FFFFFF" />
      
      {/* Head (Black & White) */}
      <path d="M110 70C110 70 105 60 115 55C125 50 130 60 130 65L110 70Z" fill="#2C2C2C" />
      <path d="M115 55C115 55 108 58 108 62" stroke="white" strokeWidth="2" />
      
      {/* Red Patch (Behind eye/Back of head) */}
      <circle cx="125" cy="58" r="4" fill="#D66D6B" />
      
      {/* Beak */}
      <path d="M108 62L95 65L108 66" fill="#555" />
      
      {/* Eye */}
      <circle cx="112" cy="62" r="1.5" fill="white" />
      <circle cx="112" cy="62" r="0.8" fill="black" />
      
      {/* Feet */}
      <path d="M130 135L138 140" stroke="#555" strokeWidth="2" />
      <path d="M130 138L138 143" stroke="#555" strokeWidth="2" />

    </svg>
  );
};
