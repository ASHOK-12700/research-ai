import React from 'react';
import { motion } from 'framer-motion';

interface YellowCharacterProps {
  className?: string;
  mouseX?: number;
  mouseY?: number;
  isLookingAtPassword?: boolean;
}

export const YellowCharacter: React.FC<YellowCharacterProps> = ({ 
  className = '', 
  mouseX = 0, 
  mouseY = 0,
  isLookingAtPassword = false 
}) => {
  // Calculate eye movement based on mouse position
  const eyeMovementX = isLookingAtPassword ? 0 : mouseX * 3.5;
  const eyeMovementY = isLookingAtPassword ? 0 : mouseY * 2.5;

  return (
    <div className={`relative ${className}`}>
      <svg
        width="135"
        height="175"
        viewBox="0 0 100 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Main body - rounded yellow rectangle */}
        <rect x="15" y="20" width="70" height="90" rx="15" fill="#FBBF24" />
        
        {/* Beak-like protrusion */}
        <path d="M 50 110 L 45 95 L 55 95 Z" fill="#F59E0B" />
        
        {/* Eyes with pupil movement */}
        <g>
          {/* Left eye white */}
          <circle cx="35" cy="50" r="6" fill="white" />
          {/* Left eye pupil */}
          {!isLookingAtPassword ? (
            <motion.circle
              cx={35 + eyeMovementX}
              cy={50 + eyeMovementY}
              r="3"
              fill="#1F2937"
              transition={{
                cx: { type: 'spring', stiffness: 300, damping: 30 },
                cy: { type: 'spring', stiffness: 300, damping: 30 },
              }}
            />
          ) : (
            // Closed eye - line
            <motion.line
              x1="29"
              y1="50"
              x2="41"
              y2="50"
              stroke="#1F2937"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0.1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </g>
        
        <g>
          {/* Right eye white */}
          <circle cx="65" cy="50" r="6" fill="white" />
          {/* Right eye pupil */}
          {!isLookingAtPassword ? (
            <motion.circle
              cx={65 + eyeMovementX}
              cy={50 + eyeMovementY}
              r="3"
              fill="#1F2937"
              transition={{
                cx: { type: 'spring', stiffness: 300, damping: 30 },
                cy: { type: 'spring', stiffness: 300, damping: 30 },
              }}
            />
          ) : (
            // Closed eye - line
            <motion.line
              x1="59"
              y1="50"
              x2="71"
              y2="50"
              stroke="#1F2937"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0.1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </g>
        
        {/* Simple beak/mouth */}
        <path d="M 45 70 L 50 75 L 55 70" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Subtle highlight */}
        <rect x="20" y="25" width="12" height="18" rx="6" fill="white" fillOpacity="0.15" />
      </svg>
    </div>
  );
};