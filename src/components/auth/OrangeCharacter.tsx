import React from 'react';
import { motion } from 'framer-motion';

interface OrangeCharacterProps {
  className?: string;
  mouseX?: number;
  mouseY?: number;
  isLookingAtPassword?: boolean;
}

export const OrangeCharacter: React.FC<OrangeCharacterProps> = ({ 
  className = '', 
  mouseX = 0, 
  mouseY = 0,
  isLookingAtPassword = false 
}) => {
  // Calculate eye movement based on mouse position
  const eyeMovementX = isLookingAtPassword ? 0 : mouseX * 2.5;
  const eyeMovementY = isLookingAtPassword ? 0 : mouseY * 2;

  return (
    <div className={`relative ${className}`}>
      <svg
        width="189"
        height="135"
        viewBox="0 0 140 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Main body - large orange semi-circle/blob */}
        <path d="M 20 90 Q 20 20 70 20 Q 120 20 120 90 Z" fill="#F97316" />
        
        {/* Eyes with pupil movement */}
        <g>
          {/* Left eye white */}
          <circle cx="55" cy="55" r="8" fill="white" />
          {/* Left eye pupil */}
          {!isLookingAtPassword ? (
            <motion.circle
              cx={55 + eyeMovementX}
              cy={55 + eyeMovementY}
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
              x1="47"
              y1="55"
              x2="63"
              y2="55"
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
          <circle cx="85" cy="55" r="8" fill="white" />
          {/* Right eye pupil */}
          {!isLookingAtPassword ? (
            <motion.circle
              cx={85 + eyeMovementX}
              cy={55 + eyeMovementY}
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
              x1="77"
              y1="55"
              x2="93"
              y2="55"
              stroke="#1F2937"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0.1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </g>
        
        {/* Happy smile */}
        <path d="M 45 75 Q 70 90 95 75" stroke="#1F2937" strokeWidth="4" fill="none" strokeLinecap="round" />
        
        {/* Subtle highlight */}
        <ellipse cx="45" cy="35" rx="15" ry="10" fill="white" fillOpacity="0.15" />
      </svg>
    </div>
  );
};