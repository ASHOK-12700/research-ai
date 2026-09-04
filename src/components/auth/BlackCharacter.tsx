import React from 'react';
import { motion } from 'framer-motion';

interface BlackCharacterProps {
  className?: string;
  mouseX?: number;
  mouseY?: number;
  isLookingAtPassword?: boolean;
}

export const BlackCharacter: React.FC<BlackCharacterProps> = ({ 
  className = '', 
  mouseX = 0, 
  mouseY = 0,
  isLookingAtPassword = false 
}) => {
  // Calculate eye movement based on mouse position
  const eyeMovementX = isLookingAtPassword ? 0 : mouseX * 3;
  const eyeMovementY = isLookingAtPassword ? 0 : mouseY * 2;

  return (
    <div className={`relative ${className}`}>
      <svg
        width="122"
        height="189"
        viewBox="0 0 90 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Main body - black rectangle */}
        <rect x="15" y="25" width="60" height="100" rx="6" fill="#1F2937" />
        
        {/* Eyes with pupil movement */}
        <g>
          {/* Left eye white */}
          <circle cx="35" cy="55" r="6" fill="white" />
          {/* Left eye pupil */}
          {!isLookingAtPassword ? (
            <motion.circle
              cx={35 + eyeMovementX}
              cy={55 + eyeMovementY}
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
              y1="55"
              x2="41"
              y2="55"
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
          <circle cx="55" cy="55" r="6" fill="white" />
          {/* Right eye pupil */}
          {!isLookingAtPassword ? (
            <motion.circle
              cx={55 + eyeMovementX}
              cy={55 + eyeMovementY}
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
              x1="49"
              y1="55"
              x2="61"
              y2="55"
              stroke="#1F2937"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0.1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </g>
        
        {/* Simple straight mouth */}
        <path d="M 40 75 L 50 75" stroke="white" strokeWidth="2" strokeLinecap="round" />
        
        {/* Subtle highlight */}
        <rect x="20" y="30" width="10" height="15" rx="3" fill="white" fillOpacity="0.05" />
      </svg>
    </div>
  );
};