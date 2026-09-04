import React, { useState, useEffect, useCallback } from 'react';
import { PurpleCharacter } from './PurpleCharacter';
import { BlackCharacter } from './BlackCharacter';
import { YellowCharacter } from './YellowCharacter';
import { OrangeCharacter } from './OrangeCharacter';

interface CharacterSceneProps {
  className?: string;
  simplified?: boolean;
  isPasswordVisible?: boolean;
}

export const CharacterScene: React.FC<CharacterSceneProps> = ({ 
  className = '', 
  simplified = false,
  isPasswordVisible = false 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Track mouse position across the entire page
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (prefersReducedMotion) return;
    
    // Calculate position relative to center of screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Normalize to -1 to 1 range
    const normalizedX = (e.clientX - centerX) / centerX;
    const normalizedY = (e.clientY - centerY) / centerY;
    
    setMousePosition({
      x: Math.max(-1, Math.min(1, normalizedX)),
      y: Math.max(-1, Math.min(1, normalizedY)),
    });
  }, [prefersReducedMotion]);

  // Reset mouse position when mouse leaves window
  const handleMouseLeave = useCallback(() => {
    setMousePosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, prefersReducedMotion]);

  // Simplified version for mobile - show only orange character centered
  if (simplified) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <OrangeCharacter 
          mouseX={mousePosition.x} 
          mouseY={mousePosition.y}
          isLookingAtPassword={isPasswordVisible}
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Character group - enlarged and centered */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Character group remains fixed in place; only the eyes track the cursor */}
        <div className="absolute bottom-1/4 left-[15%] z-10">
          <PurpleCharacter 
            mouseX={mousePosition.x} 
            mouseY={mousePosition.y}
            isLookingAtPassword={isPasswordVisible}
          />
        </div>

        <div className="absolute bottom-1/4 left-[30%] z-20">
          <BlackCharacter 
            mouseX={mousePosition.x} 
            mouseY={mousePosition.y}
            isLookingAtPassword={isPasswordVisible}
          />
        </div>

        <div className="absolute bottom-1/4 left-[45%] z-15">
          <YellowCharacter 
            mouseX={mousePosition.x} 
            mouseY={mousePosition.y}
            isLookingAtPassword={isPasswordVisible}
          />
        </div>

        <div className="absolute bottom-1/4 left-[25%] z-30">
          <OrangeCharacter 
            mouseX={mousePosition.x} 
            mouseY={mousePosition.y}
            isLookingAtPassword={isPasswordVisible}
          />
        </div>
      </div>
    </div>
  );
};