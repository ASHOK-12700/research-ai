import React from 'react';
import { motion } from 'framer-motion';

interface ResearcherCharacterProps {
  className?: string;
}

export const ResearcherCharacter: React.FC<ResearcherCharacterProps> = ({ className = '' }) => {
  return (
    <motion.div
      className={`flex items-end justify-center ${className}`}
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div
        className="relative w-full max-w-xs"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Character Container */}
        <div className="relative">
          {/* Glow Background */}
          <motion.div
            className="absolute inset-0 rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Main Character SVG */}
          <svg
            className="relative z-10 w-full h-auto"
            viewBox="0 0 200 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Head */}
            <motion.circle
              cx="100"
              cy="60"
              r="28"
              fill="#e8d5c4"
              stroke="#4f46e5"
              strokeWidth="1.5"
            />

            {/* Hair */}
            <motion.path
              d="M 72 40 Q 70 20 100 15 Q 130 20 128 40"
              fill="#2c1810"
              stroke="#4f46e5"
              strokeWidth="1.5"
            />

            {/* Eyes */}
            <motion.circle cx="90" cy="55" r="3" fill="#2c1810" />
            <motion.circle cx="110" cy="55" r="3" fill="#2c1810" />

            {/* Smile */}
            <motion.path
              d="M 90 65 Q 100 70 110 65"
              stroke="#d97706"
              strokeWidth="1.5"
              fill="none"
            />

            {/* Neck */}
            <line x1="90" y1="88" x2="90" y2="105" stroke="#e8d5c4" strokeWidth="6" />
            <line x1="110" y1="88" x2="110" y2="105" stroke="#e8d5c4" strokeWidth="6" />

            {/* Body/Shirt */}
            <motion.rect
              x="65"
              y="105"
              width="70"
              height="60"
              rx="8"
              fill="#1f2937"
              stroke="#4f46e5"
              strokeWidth="1.5"
            />

            {/* Laptop on Chest */}
            <motion.rect
              x="75"
              y="120"
              width="50"
              height="35"
              rx="4"
              fill="#111827"
              stroke="#4f46e5"
              strokeWidth="1"
            />
            <motion.rect
              x="77"
              y="122"
              width="46"
              height="28"
              fill="#0f172a"
            />

            {/* Screen Glow */}
            <motion.rect
              x="77"
              y="122"
              width="46"
              height="28"
              fill="url(#screenGradient)"
              opacity="0.4"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Left Arm */}
            <motion.path
              d="M 65 115 L 45 130"
              stroke="#e8d5c4"
              strokeWidth="8"
              strokeLinecap="round"
              animate={{
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ originX: '65px', originY: '115px' }}
            />

            {/* Right Arm */}
            <motion.path
              d="M 135 115 L 155 130"
              stroke="#e8d5c4"
              strokeWidth="8"
              strokeLinecap="round"
              animate={{
                rotate: [5, -5, 5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ originX: '135px', originY: '115px' }}
            />

            {/* Pants */}
            <rect x="70" y="165" width="25" height="50" rx="6" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1.5" />
            <rect x="105" y="165" width="25" height="50" rx="6" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1.5" />

            {/* Shoes */}
            <rect x="72" y="215" width="20" height="12" rx="4" fill="#0f172a" stroke="#4f46e5" strokeWidth="1" />
            <rect x="108" y="215" width="20" height="12" rx="4" fill="#0f172a" stroke="#4f46e5" strokeWidth="1" />

            <defs>
              <radialGradient id="screenGradient">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#312e81" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
};
