import React from 'react';
import { motion } from 'framer-motion';

interface PurpleCharacterProps {
  className?: string;
  mouseX?: number;
  mouseY?: number;
  isLookingAtPassword?: boolean;
}

export const PurpleCharacter: React.FC<PurpleCharacterProps> = ({ 
  className = '', 
  mouseX = 0, 
  mouseY = 0,
  isLookingAtPassword = false 
}) => {
  // Calculate eye movement based on mouse position
  const eyeMovementX = isLookingAtPassword ? 0 : mouseX * 4;
  const eyeMovementY = isLookingAtPassword ? 0 : mouseY * 3;

  return (
    <div className={`relative ${className}`}>
      <svg
        width="162"
        height="270"
        viewBox="0 0 120 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Main body - tall purple rectangle */}
        <rect x="20" y="30" width="80" height="150" rx="8" fill="#8B5CF6" />
        
        {/* Eyes with pupil movement */}
        <g>
          {/* Left eye white */}
          <circle cx="45" cy="70" r="8" fill="white" />
          {/* Left eye pupil */}
          {!isLookingAtPassword ? (
            <motion.circle
              cx={45 + eyeMovementX}
              cy={70 + eyeMovementY}
              r="4"
              fill="#1F2937"
              transition={{
                cx: { type: 'spring', stiffness: 300, damping: 30 },
                cy: { type: 'spring', stiffness: 300, damping: 30 },
              }}
            />
          ) : (
            // Closed eye - line
            <motion.line
              x1="38"
              y1="70"
              x2="52"
              y2="70"
              stroke="#1F2937"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0.1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </g>
        
        <g>
          {/* Right eye white */}
          <circle cx="75" cy="70" r="8" fill="white" />
          {/* Right eye pupil */}
          {!isLookingAtPassword ? (
            <motion.circle
              cx={75 + eyeMovementX}
              cy={70 + eyeMovementY}
              r="4"
              fill="#1F2937"
              transition={{
                cx: { type: 'spring', stiffness: 300, damping: 30 },
                cy: { type: 'spring', stiffness: 300, damping: 30 },
              }}
            />
          ) : (
            // Closed eye - line
            <motion.line
              x1="68"
              y1="70"
              x2="82"
              y2="70"
              stroke="#1F2937"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0.1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </g>
        
        {/* Simple mouth */}
        <path d="M 50 90 Q 60 95 70 90" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
        
        {/* Subtle highlight */}
        <rect x="25" y="35" width="15" height="20" rx="4" fill="white" fillOpacity="0.1" />
      </svg>
    </div>
  );
};