'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BeeState } from '@/types/bee';

interface BeeSpriteProps {
  bee: BeeState;
  scale?: number;
}

export const BeeSprite: React.FC<BeeSpriteProps> = ({ bee, scale = 1 }) => {
  // Select bee icon based on personality traits
  const getBeeIcon = () => {
    const { personality } = bee;

    // Match bee icons to personality types
    if (personality.creativity > 0.7) {
      return '/bee_1.png'; // Creative bee with happy face
    } else if (personality.socialTendency > 0.7) {
      return '/bee_3.png'; // Social bee with traditional look
    } else if (personality.riskTolerance > 0.7) {
      return '/bee_2.png'; // Adventurous bee with side view
    } else {
      return '/bee_4.png'; // Calm bee with side view
    }
  };

  const getActivityAnimation = () => {
    switch (bee.currentActivity) {
      case 'dancing':
        return {
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1, 1.1, 1],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      case 'foraging':
        return {
          y: [0, -2, 0],
          transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      case 'building':
        return {
          rotate: [0, 5, -5, 0],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      case 'resting':
        return {
          scale: [1, 0.95, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      default:
        return {
          y: [0, -1, 0],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
    }
  };

  const getSizeVariation = () => {
    // Size based on personality and energy
    const baseSize = bee.size * scale;
    const energyMultiplier = 0.8 + (bee.energy / 100) * 0.4; // 0.8 to 1.2
    return baseSize * energyMultiplier;
  };

  const getHappinessGlow = () => {
    if (bee.happiness > 80) {
      return '0 0 8px rgba(255, 215, 0, 0.6)';
    } else if (bee.happiness > 60) {
      return '0 0 4px rgba(255, 215, 0, 0.3)';
    }
    return 'none';
  };

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: bee.position.x - 16,
        top: bee.position.y - 16,
        transform: `rotate(${bee.rotation}rad)`,
      }}
      animate={getActivityAnimation()}
    >
      {/* Bee Image */}
      <motion.img
        src={getBeeIcon()}
        alt={`Bee ${bee.id}`}
        className="relative"
        style={{
          width: getSizeVariation() * 32,
          height: getSizeVariation() * 32,
          filter: `drop-shadow(${getHappinessGlow()})`,
        }}
      />

      {/* Personality color indicator (small dot overlay) */}
      <div
        className="absolute rounded-full"
        style={{
          width: '8px',
          height: '8px',
          top: '20%',
          right: '20%',
          backgroundColor: bee.personality.preferredColors[1] || '#FF6347',
          opacity: 0.8,
          border: '1px solid white',
        }}
      />
      
      {/* Activity indicator */}
      {bee.currentActivity === 'dancing' && (
        <motion.div
          className="absolute -top-2 -left-2 text-xs"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
        >
          💃
        </motion.div>
      )}
      
      {bee.currentActivity === 'building' && (
        <motion.div
          className="absolute -top-2 -right-2 text-xs"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          🔨
        </motion.div>
      )}
      
      {bee.friends.length > 5 && (
        <motion.div
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-xs"
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        >
          ❤️
        </motion.div>
      )}
    </motion.div>
  );
};
