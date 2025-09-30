// 🐝🧠 Bee Simulation Engine
// Where individual personalities create emergent swarm intelligence!

import { BeeState, Colony, FlowerLocation, BeeActivity, DanceMessage } from '@/types/bee';
import { createBee, calculateCompatibility, shouldFormFriendship, evolvePersonality, checkForAchievements } from './beePersonality';

export class BeeSimulation {
  private colony: Colony;
  private animationId: number | null = null;
  private lastUpdate: number = 0;
  private updateCallbacks: ((colony: Colony) => void)[] = [];

  constructor(canvasWidth: number, canvasHeight: number) {
    this.colony = this.initializeColony(canvasWidth, canvasHeight);
  }

  private initializeColony(width: number, height: number): Colony {
    const bees: BeeState[] = [];
    const initialBeeCount = 12; // Start with a small, manageable colony
    
    // Create initial bees with spread-out positions
    for (let i = 0; i < initialBeeCount; i++) {
      const angle = (i / initialBeeCount) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.3;
      const centerX = width / 2;
      const centerY = height / 2;
      
      const position = {
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 50
      };
      
      bees.push(createBee(position));
    }

    // Generate some initial flowers
    const flowers: FlowerLocation[] = [];
    const flowerCount = 8;
    
    for (let i = 0; i < flowerCount; i++) {
      flowers.push({
        id: `flower_${i}`,
        position: {
          x: Math.random() * width,
          y: Math.random() * height
        },
        type: ['lavender', 'sunflower', 'wildflower', 'clover'][Math.floor(Math.random() * 4)] as any,
        quality: 0.3 + Math.random() * 0.7,
        discoveredBy: '',
        lastVisited: 0
      });
    }

    return {
      id: 'main_colony',
      name: 'Digital Bee Paradise',
      bees,
      hive: {
        center: { x: width / 2, y: height / 2 },
        cells: [],
        totalSize: 0,
        architecturalStyle: 'mixed',
        culturalElements: []
      },
      environment: {
        flowers,
        obstacles: [],
        weather: {
          type: 'sunny',
          intensity: 0.8,
          temperature: 22,
          windSpeed: 0.2,
          visibility: 1.0
        },
        season: 'spring',
        timeOfDay: 12
      },
      statistics: {
        population: bees.length,
        totalHoneyProduced: 0,
        averageHappiness: 75,
        averageEnergy: 80,
        buildingProgress: 0,
        explorationRadius: 200,
        culturalDiversity: 0.8,
        innovationRate: 0.1
      },
      culture: {
        dominantPersonalities: [],
        sharedTraditions: [],
        artisticMovements: [],
        socialNorms: []
      }
    };
  }

  /**
   * Main simulation update loop
   */
  public update(deltaTime: number): void {
    // Update each bee's behavior
    this.colony.bees.forEach(bee => {
      this.updateBeePhysics(bee, deltaTime);
      this.updateBeeBehavior(bee, deltaTime);
      this.updateBeeNeeds(bee, deltaTime);
    });

    // Handle social interactions
    this.processSocialInteractions();
    
    // Update colony statistics
    this.updateColonyStatistics();
    
    // Notify subscribers
    this.updateCallbacks.forEach(callback => callback(this.colony));
  }

  private updateBeePhysics(bee: BeeState, deltaTime: number): void {
    // Apply personality-based movement patterns
    const speed = 50 + (bee.personality.energyPattern * 100); // pixels per second
    const agility = bee.personality.riskTolerance * 2 + 1; // turning speed multiplier
    
    // If bee has a target, move towards it
    if (bee.targetPosition) {
      const dx = bee.targetPosition.x - bee.position.x;
      const dy = bee.targetPosition.y - bee.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5) {
        // Move towards target
        bee.velocity.x = (dx / distance) * speed * deltaTime;
        bee.velocity.y = (dy / distance) * speed * deltaTime;
        bee.rotation = Math.atan2(dy, dx);
      } else {
        // Reached target
        bee.targetPosition = undefined;
        bee.velocity.x *= 0.8; // Slow down
        bee.velocity.y *= 0.8;
      }
    } else {
      // Random wandering based on personality
      if (Math.random() < 0.02) { // 2% chance to change direction
        const randomAngle = Math.random() * Math.PI * 2;
        const wanderSpeed = speed * 0.3;
        bee.velocity.x = Math.cos(randomAngle) * wanderSpeed * deltaTime;
        bee.velocity.y = Math.sin(randomAngle) * wanderSpeed * deltaTime;
        bee.rotation = randomAngle;
      }
    }

    // Apply velocity with personality-based variation
    const personalityVariation = (Math.sin(Date.now() * 0.001 + bee.age * 0.1) * 0.1);
    bee.position.x += bee.velocity.x * (1 + personalityVariation);
    bee.position.y += bee.velocity.y * (1 + personalityVariation);

    // Keep bees within bounds (with some tolerance)
    const margin = 50;
    bee.position.x = Math.max(margin, Math.min(800 - margin, bee.position.x));
    bee.position.y = Math.max(margin, Math.min(600 - margin, bee.position.y));

    // Age the bee
    bee.age += deltaTime;
  }

  private updateBeeBehavior(bee: BeeState, deltaTime: number): void {
    // Decide on new activity based on personality and current state
    if (Math.random() < 0.01) { // 1% chance to change activity each frame
      bee.currentActivity = this.chooseNewActivity(bee);
    }

    // Execute current activity
    switch (bee.currentActivity) {
      case 'foraging':
        this.handleForaging(bee);
        break;
      case 'building':
        this.handleBuilding(bee);
        break;
      case 'dancing':
        this.handleDancing(bee);
        break;
      case 'socializing':
        this.handleSocializing(bee);
        break;
      case 'exploring':
        this.handleExploring(bee);
        break;
      case 'resting':
        this.handleResting(bee, deltaTime);
        break;
    }

    // Check for achievements
    const newAchievements = checkForAchievements(bee);
    bee.achievements.push(...newAchievements);
  }

  private chooseNewActivity(bee: BeeState): BeeActivity {
    const activities: { activity: BeeActivity; weight: number }[] = [
      { activity: 'foraging', weight: 0.3 + bee.personality.riskTolerance * 0.2 },
      { activity: 'building', weight: 0.2 + bee.personality.creativity * 0.3 },
      { activity: 'socializing', weight: 0.1 + bee.personality.socialTendency * 0.4 },
      { activity: 'exploring', weight: 0.2 + bee.personality.riskTolerance * 0.2 },
      { activity: 'dancing', weight: 0.1 + bee.personality.communicationStyle * 0.2 },
      { activity: 'resting', weight: Math.max(0.1, (100 - bee.energy) / 100) }
    ];

    // Weighted random selection
    const totalWeight = activities.reduce((sum, a) => sum + a.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const { activity, weight } of activities) {
      random -= weight;
      if (random <= 0) return activity;
    }
    
    return 'exploring'; // fallback
  }

  private handleForaging(bee: BeeState): void {
    // Find nearest undiscovered or high-quality flower
    const availableFlowers = this.colony.environment.flowers.filter(f => 
      !bee.knownFlowers.some(kf => kf.id === f.id) || f.quality > 0.7
    );

    if (availableFlowers.length > 0) {
      const target = availableFlowers.reduce((closest, flower) => {
        const distToBee = Math.sqrt(
          Math.pow(flower.position.x - bee.position.x, 2) + 
          Math.pow(flower.position.y - bee.position.y, 2)
        );
        const distToClosest = closest ? Math.sqrt(
          Math.pow(closest.position.x - bee.position.x, 2) + 
          Math.pow(closest.position.y - bee.position.y, 2)
        ) : Infinity;
        
        return distToBee < distToClosest ? flower : closest;
      });

      bee.targetPosition = target.position;
      
      // If close to flower, "discover" it
      const distance = Math.sqrt(
        Math.pow(target.position.x - bee.position.x, 2) + 
        Math.pow(target.position.y - bee.position.y, 2)
      );
      
      if (distance < 20 && !bee.knownFlowers.some(kf => kf.id === target.id)) {
        bee.knownFlowers.push({
          ...target,
          discoveredBy: bee.id,
          lastVisited: Date.now()
        });
        bee.happiness = Math.min(100, bee.happiness + 10);
        
        // High-quality flowers might trigger dancing
        if (target.quality > 0.8 && bee.personality.communicationStyle > 0.5) {
          bee.currentActivity = 'dancing';
        }
      }
    }
  }

  private handleBuilding(bee: BeeState): void {
    // Creative bees are more likely to start new projects
    if (bee.personality.creativity > 0.6 && Math.random() < 0.05) {
      // Start a new building project near the hive
      const project = {
        id: `project_${Date.now()}_${bee.id}`,
        type: bee.personality.creativity > 0.8 ? 'art' : 'honeycomb' as any,
        position: {
          x: this.colony.hive.center.x + (Math.random() - 0.5) * 100,
          y: this.colony.hive.center.y + (Math.random() - 0.5) * 100
        },
        progress: 0.1,
        contributors: [bee.id],
        style: bee.personality.buildingStyle,
        pattern: {
          cells: [],
          symmetry: bee.personality.aestheticPreference > 0.7 ? 'radial' : 'bilateral' as any,
          colorScheme: bee.personality.preferredColors,
          artisticElements: []
        }
      };
      
      bee.buildingProjects.push(project);
      bee.targetPosition = project.position;
    }
  }

  private handleDancing(bee: BeeState): void {
    // Create dance message about discovered flowers
    if (bee.knownFlowers.length > 0 && Math.random() < 0.1) {
      const bestFlower = bee.knownFlowers.reduce((best, flower) => 
        flower.quality > best.quality ? flower : best
      );
      
      const danceMessage: DanceMessage = {
        id: `dance_${Date.now()}_${bee.id}`,
        dancer: bee.id,
        type: 'flower_location',
        content: bestFlower,
        intensity: bee.personality.communicationStyle,
        timestamp: Date.now(),
        audience: []
      };
      
      bee.danceMessages.push(danceMessage);
      
      // Attract nearby bees to watch
      const nearbyBees = this.colony.bees.filter(otherBee => {
        if (otherBee.id === bee.id) return false;
        const distance = Math.sqrt(
          Math.pow(otherBee.position.x - bee.position.x, 2) + 
          Math.pow(otherBee.position.y - bee.position.y, 2)
        );
        return distance < 50 && otherBee.personality.socialTendency > 0.3;
      });
      
      nearbyBees.forEach(watcher => {
        danceMessage.audience.push(watcher.id);
        // Watcher learns about the flower
        if (!watcher.knownFlowers.some(kf => kf.id === bestFlower.id)) {
          watcher.knownFlowers.push(bestFlower);
        }
      });
    }
  }

  private handleSocializing(bee: BeeState): void {
    // Find nearby bees to socialize with
    const nearbyBees = this.colony.bees.filter(otherBee => {
      if (otherBee.id === bee.id) return false;
      const distance = Math.sqrt(
        Math.pow(otherBee.position.x - bee.position.x, 2) + 
        Math.pow(otherBee.position.y - bee.position.y, 2)
      );
      return distance < 40;
    });

    if (nearbyBees.length > 0) {
      const socialTarget = nearbyBees[Math.floor(Math.random() * nearbyBees.length)];
      
      // Move towards social target
      bee.targetPosition = socialTarget.position;
      
      // Increase happiness from socializing
      bee.happiness = Math.min(100, bee.happiness + 1);
    }
  }

  private handleExploring(bee: BeeState): void {
    // Adventurous bees explore further from the hive
    const explorationRadius = 100 + (bee.personality.riskTolerance * 200);
    const angle = Math.random() * Math.PI * 2;
    
    bee.targetPosition = {
      x: this.colony.hive.center.x + Math.cos(angle) * explorationRadius,
      y: this.colony.hive.center.y + Math.sin(angle) * explorationRadius
    };
  }

  private handleResting(bee: BeeState, deltaTime: number): void {
    // Restore energy while resting
    bee.energy = Math.min(100, bee.energy + 20 * deltaTime);
    
    // Slow down movement
    bee.velocity.x *= 0.9;
    bee.velocity.y *= 0.9;
    
    // Return to active behavior when energy is restored
    if (bee.energy > 80) {
      bee.currentActivity = 'exploring';
    }
  }

  private updateBeeNeeds(bee: BeeState, deltaTime: number): void {
    // Energy decreases over time, faster for more active personalities
    const energyDrain = (1 + bee.personality.energyPattern) * deltaTime * 2;
    bee.energy = Math.max(0, bee.energy - energyDrain);
    
    // Happiness slowly decays without positive interactions
    bee.happiness = Math.max(0, bee.happiness - deltaTime * 0.5);
    
    // Social bees lose happiness faster when alone
    if (bee.personality.socialTendency > 0.7) {
      const nearbyBees = this.colony.bees.filter(otherBee => {
        if (otherBee.id === bee.id) return false;
        const distance = Math.sqrt(
          Math.pow(otherBee.position.x - bee.position.x, 2) + 
          Math.pow(otherBee.position.y - bee.position.y, 2)
        );
        return distance < 60;
      });
      
      if (nearbyBees.length === 0) {
        bee.happiness = Math.max(0, bee.happiness - deltaTime * 2);
      }
    }
  }

  private processSocialInteractions(): void {
    // Check for new friendships
    for (let i = 0; i < this.colony.bees.length; i++) {
      for (let j = i + 1; j < this.colony.bees.length; j++) {
        const bee1 = this.colony.bees[i];
        const bee2 = this.colony.bees[j];
        
        // Skip if already friends
        if (bee1.friends.includes(bee2.id)) continue;
        
        const distance = Math.sqrt(
          Math.pow(bee1.position.x - bee2.position.x, 2) + 
          Math.pow(bee1.position.y - bee2.position.y, 2)
        );
        
        // Only form friendships when bees are close
        if (distance < 30 && shouldFormFriendship(bee1, bee2)) {
          bee1.friends.push(bee2.id);
          bee2.friends.push(bee1.id);
          
          // Friendship boosts happiness
          bee1.happiness = Math.min(100, bee1.happiness + 15);
          bee2.happiness = Math.min(100, bee2.happiness + 15);
        }
      }
    }
  }

  private updateColonyStatistics(): void {
    const stats = this.colony.statistics;
    
    stats.population = this.colony.bees.length;
    stats.averageHappiness = this.colony.bees.reduce((sum, bee) => sum + bee.happiness, 0) / stats.population;
    stats.averageEnergy = this.colony.bees.reduce((sum, bee) => sum + bee.energy, 0) / stats.population;
    
    // Calculate cultural diversity based on personality variation
    const personalities = this.colony.bees.map(bee => bee.personality);
    const avgCreativity = personalities.reduce((sum, p) => sum + p.creativity, 0) / personalities.length;
    const creativityVariance = personalities.reduce((sum, p) => sum + Math.pow(p.creativity - avgCreativity, 2), 0) / personalities.length;
    stats.culturalDiversity = Math.min(1, creativityVariance * 4); // Scale to 0-1
  }

  // Public API methods
  public start(): void {
    if (this.animationId) return;
    
    const animate = (currentTime: number) => {
      const deltaTime = this.lastUpdate ? (currentTime - this.lastUpdate) / 1000 : 0;
      this.lastUpdate = currentTime;
      
      if (deltaTime > 0 && deltaTime < 0.1) { // Cap delta time to prevent large jumps
        this.update(deltaTime);
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public getColony(): Colony {
    return this.colony;
  }

  public onUpdate(callback: (colony: Colony) => void): void {
    this.updateCallbacks.push(callback);
  }

  public removeUpdateCallback(callback: (colony: Colony) => void): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  public addBee(position?: { x: number; y: number }): void {
    const newPosition = position || {
      x: this.colony.hive.center.x + (Math.random() - 0.5) * 100,
      y: this.colony.hive.center.y + (Math.random() - 0.5) * 100
    };

    const newBee = createBee(newPosition);
    this.colony.bees.push(newBee);
  }

  public removeBee(beeId: string): void {
    this.colony.bees = this.colony.bees.filter(bee => bee.id !== beeId);

    // Clean up references to removed bee
    this.colony.bees.forEach(bee => {
      bee.friends = bee.friends.filter(id => id !== beeId);
      bee.collaborators = bee.collaborators.filter(id => id !== beeId);
    });
  }
}
