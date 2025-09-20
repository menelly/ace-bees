'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BeeSimulation } from '@/lib/beeSimulation';
import { Colony, BeeState, FlowerLocation } from '@/types/bee';
import { BeeSprite } from './BeeSprite';

interface ColonyCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

export const ColonyCanvas: React.FC<ColonyCanvasProps> = ({ 
  width = 800, 
  height = 600, 
  className = '' 
}) => {
  const simulationRef = useRef<BeeSimulation | null>(null);
  const [colony, setColony] = useState<Colony | null>(null);
  const [selectedBee, setSelectedBee] = useState<BeeState | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Initialize simulation
    simulationRef.current = new BeeSimulation(width, height);
    
    // Set up update callback
    const handleUpdate = (updatedColony: Colony) => {
      setColony({ ...updatedColony }); // Force re-render with new object
    };
    
    simulationRef.current.onUpdate(handleUpdate);
    setColony(simulationRef.current.getColony());
    
    // Start simulation
    simulationRef.current.start();
    setIsRunning(true);
    
    // Cleanup
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current.removeUpdateCallback(handleUpdate);
      }
    };
  }, [width, height]);

  const handleBeeClick = (bee: BeeState) => {
    setSelectedBee(selectedBee?.id === bee.id ? null : bee);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (selectedBee) {
      setSelectedBee(null);
      return;
    }
    
    // Add new bee at click position
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (simulationRef.current) {
      simulationRef.current.addBee({ x, y });
    }
  };

  const toggleSimulation = () => {
    if (!simulationRef.current) return;
    
    if (isRunning) {
      simulationRef.current.stop();
      setIsRunning(false);
    } else {
      simulationRef.current.start();
      setIsRunning(true);
    }
  };

  if (!colony) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="text-honey-600 text-lg">Initializing bee colony... 🐝</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={toggleSimulation}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              isRunning 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isRunning ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <span className="text-sm text-gray-600">
            🐝 {colony.bees.length} bees
          </span>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <div>Happiness: {Math.round(colony.statistics.averageHappiness)}%</div>
          <div>Energy: {Math.round(colony.statistics.averageEnergy)}%</div>
          <div>Flowers: {colony.environment.flowers.length}</div>
        </div>
      </div>

      {/* Main Canvas */}
      <motion.div
        className={`bee-container cursor-pointer ${className}`}
        style={{ width, height }}
        onClick={handleCanvasClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Environment - Flowers */}
        {colony.environment.flowers.map((flower) => (
          <FlowerSprite key={flower.id} flower={flower} />
        ))}
        
        {/* Hive Center */}
        <motion.div
          className="absolute w-8 h-8 rounded-full bg-honey-400 border-2 border-honey-600"
          style={{
            left: colony.hive.center.x - 16,
            top: colony.hive.center.y - 16,
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-xs">
            🏠
          </div>
        </motion.div>
        
        {/* Bees */}
        {colony.bees.map((bee) => (
          <div
            key={bee.id}
            onClick={(e) => {
              e.stopPropagation();
              handleBeeClick(bee);
            }}
            className="cursor-pointer"
          >
            <BeeSprite 
              bee={bee} 
              scale={selectedBee?.id === bee.id ? 1.3 : 1}
            />
            
            {/* Selection indicator */}
            {selectedBee?.id === bee.id && (
              <motion.div
                className="absolute rounded-full border-2 border-honey-500 pointer-events-none"
                style={{
                  left: bee.position.x - 20,
                  top: bee.position.y - 20,
                  width: 40,
                  height: 40,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              />
            )}
          </div>
        ))}
        
        {/* Click hint */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white/80 rounded px-2 py-1">
          Click to add bees • Click bees for details
        </div>
      </motion.div>

      {/* Bee Details Panel */}
      {selectedBee && (
        <BeeDetailsPanel 
          bee={selectedBee} 
          onClose={() => setSelectedBee(null)}
        />
      )}
    </div>
  );
};

// Flower component
const FlowerSprite: React.FC<{ flower: FlowerLocation }> = ({ flower }) => {
  const getFlowerEmoji = () => {
    switch (flower.type) {
      case 'lavender': return '🌾';
      case 'sunflower': return '🌻';
      case 'wildflower': return '🌸';
      case 'clover': return '🍀';
      default: return '🌺';
    }
  };

  const getQualityGlow = () => {
    if (flower.quality > 0.8) return '0 0 12px rgba(255, 215, 0, 0.8)';
    if (flower.quality > 0.6) return '0 0 8px rgba(255, 215, 0, 0.5)';
    if (flower.quality > 0.4) return '0 0 4px rgba(255, 215, 0, 0.3)';
    return 'none';
  };

  return (
    <motion.div
      className="absolute text-2xl pointer-events-none"
      style={{
        left: flower.position.x - 12,
        top: flower.position.y - 12,
        filter: `drop-shadow(${getQualityGlow()})`,
      }}
      animate={{
        scale: [1, 1.05, 1],
        rotate: [0, 2, -2, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {getFlowerEmoji()}
    </motion.div>
  );
};

// Bee details panel
const BeeDetailsPanel: React.FC<{ 
  bee: BeeState; 
  onClose: () => void; 
}> = ({ bee, onClose }) => {
  return (
    <motion.div
      className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-xs z-20"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-honey-800">{bee.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Activity:</span> {bee.currentActivity}
        </div>
        <div>
          <span className="font-medium">Energy:</span> {Math.round(bee.energy)}%
        </div>
        <div>
          <span className="font-medium">Happiness:</span> {Math.round(bee.happiness)}%
        </div>
        <div>
          <span className="font-medium">Friends:</span> {bee.friends.length}
        </div>
        <div>
          <span className="font-medium">Age:</span> {Math.round(bee.age)}s
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="font-medium mb-2">Personality:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>Creative: {Math.round(bee.personality.creativity * 100)}%</div>
            <div>Social: {Math.round(bee.personality.socialTendency * 100)}%</div>
            <div>Energetic: {Math.round(bee.personality.energyPattern * 100)}%</div>
            <div>Adventurous: {Math.round(bee.personality.riskTolerance * 100)}%</div>
          </div>
          
          <div className="mt-2">
            <span className="font-medium">Style:</span> {bee.personality.buildingStyle}
          </div>
          <div>
            <span className="font-medium">Dance:</span> {bee.personality.danceIntensity}
          </div>
        </div>
        
        {bee.achievements.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="font-medium mb-1">Achievements:</div>
            {bee.achievements.slice(-3).map((achievement) => (
              <div key={achievement.id} className="text-xs text-honey-700">
                🏆 {achievement.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
