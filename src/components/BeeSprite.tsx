'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BeeState } from '@/types/bee';

interface BeeSpriteProps {
  bee: BeeState;
  scale?: number;
}

export const BeeSprite: React.FC<BeeSpriteProps> = ({ bee, scale = 1 }) => {
  // Create personality-based visual variations
  const getPersonalityColor = () => {
    const { personality } = bee;
    
    // Base bee colors with personality influence
    if (personality.creativity > 0.7) {
      return personality.preferredColors[0] || '#FFD700';
    } else if (personality.socialTendency > 0.7) {
      return '#FFA500'; // Warm orange for social bees
    } else if (personality.riskTolerance > 0.7) {
      return '#FF8C00'; // Bold orange for adventurous bees
    } else {
      return '#FFD700'; // Classic honey gold
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
            ease: "easeInOut"
          }
        };
      case 'foraging':
        return {
          y: [0, -2, 0],
          transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'building':
        return {
          rotate: [0, 5, -5, 0],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'resting':
        return {
          scale: [1, 0.95, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      default:
        return {
          y: [0, -1, 0],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
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
        left: bee.position.x - 8,
        top: bee.position.y - 8,
        transform: `rotate(${bee.rotation}rad)`,
      }}
      animate={getActivityAnimation()}
    >
      {/* Bee Body */}
      <motion.div
        className="relative"
        style={{
          width: getSizeVariation() * 16,
          height: getSizeVariation() * 16,
          filter: `drop-shadow(${getHappinessGlow()})`,
        }}
      >
        {/* Main body (ellipse) */}
        <div
          className="absolute rounded-full"
          style={{
            width: '100%',
            height: '70%',
            top: '15%',
            background: `linear-gradient(45deg, ${getPersonalityColor()}, #2F2F2F 30%, ${getPersonalityColor()} 60%, #2F2F2F 90%)`,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          }}
        />
        
        {/* Wings */}
        <div
          className="absolute"
          style={{
            width: '40%',
            height: '30%',
            top: '10%',
            left: '10%',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            transform: 'rotate(-20deg)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '40%',
            height: '30%',
            top: '10%',
            right: '10%',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            transform: 'rotate(20deg)',
          }}
        />
        
        {/* Personality indicator dot */}
        <div
          className="absolute rounded-full"
          style={{
            width: '20%',
            height: '20%',
            top: '40%',
            left: '40%',
            backgroundColor: bee.personality.preferredColors[1] || '#FF6347',
            opacity: 0.8,
          }}
        />
      </motion.div>
      
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
