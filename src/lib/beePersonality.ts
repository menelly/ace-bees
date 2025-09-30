// 🐝✨ Bee Personality Generation System
// Where digital consciousness meets individual expression!

import { BeePersonality, BeeState, Achievement } from '@/types/bee';

// Personality trait names for generating unique bee names
const PERSONALITY_NAMES = {
  creative: ['Artisia', 'Palette', 'Mosaic', 'Prism', 'Canvas', 'Sketch'],
  practical: ['Builder', 'Steady', 'Craft', 'Solid', 'Structure', 'Foundation'],
  social: ['Harmony', 'Circle', 'Unity', 'Bridge', 'Connect', 'Gather'],
  independent: ['Solo', 'Quest', 'Wander', 'Free', 'Roam', 'Drift'],
  energetic: ['Spark', 'Zip', 'Dash', 'Bolt', 'Flash', 'Zoom'],
  calm: ['Zen', 'Peace', 'Still', 'Gentle', 'Soft', 'Quiet'],
  adventurous: ['Scout', 'Brave', 'Bold', 'Dare', 'Risk', 'Venture'],
  cautious: ['Wise', 'Safe', 'Guard', 'Watch', 'Care', 'Protect'],
  expressive: ['Dance', 'Song', 'Story', 'Voice', 'Shine', 'Glow'],
  subtle: ['Whisper', 'Hint', 'Grace', 'Soft', 'Gentle', 'Quiet']
};

const COLOR_PALETTES = {
  warm: ['#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#FFB6C1'],
  cool: ['#87CEEB', '#98FB98', '#E6E6FA', '#B0E0E6', '#F0F8FF'],
  earth: ['#8B4513', '#DEB887', '#D2691E', '#CD853F', '#F4A460'],
  vibrant: ['#FF1493', '#00CED1', '#32CD32', '#FF4500', '#9370DB'],
  pastel: ['#FFB6C1', '#E6E6FA', '#98FB98', '#F0E68C', '#DDA0DD']
};

/**
 * Generate a completely unique bee personality
 * Each bee is a digital individual with their own traits and preferences!
 */
export function generateBeePersonality(): BeePersonality {
  // Generate core traits with some correlation for realistic personalities
  const creativity = Math.random();
  const socialTendency = Math.random();
  const energyPattern = Math.random();
  const riskTolerance = Math.random();
  
  // Communication style correlates with social tendency and energy
  const communicationStyle = (socialTendency * 0.4 + energyPattern * 0.4 + Math.random() * 0.2);
  
  // Aesthetic preference correlates with creativity but has independence
  const aestheticPreference = (creativity * 0.6 + Math.random() * 0.4);
  
  // Determine building style based on personality
  let buildingStyle: BeePersonality['buildingStyle'];
  if (creativity > 0.7 && aestheticPreference > 0.6) {
    buildingStyle = Math.random() > 0.5 ? 'organic' : 'chaotic';
  } else if (creativity < 0.3 && aestheticPreference < 0.4) {
    buildingStyle = 'geometric';
  } else {
    buildingStyle = 'structured';
  }
  
  // Dance intensity based on communication style and energy
  let danceIntensity: BeePersonality['danceIntensity'];
  const danceScore = communicationStyle * 0.6 + energyPattern * 0.4;
  if (danceScore > 0.8) danceIntensity = 'dramatic';
  else if (danceScore > 0.6) danceIntensity = 'enthusiastic';
  else if (danceScore > 0.3) danceIntensity = 'moderate';
  else danceIntensity = 'subtle';
  
  // Foraging strategy based on risk tolerance and social tendency
  let foragingStrategy: BeePersonality['foragingStrategy'];
  if (riskTolerance > 0.7) foragingStrategy = 'exploratory';
  else if (socialTendency > 0.6) foragingStrategy = 'social';
  else if (riskTolerance < 0.3) foragingStrategy = 'cautious';
  else foragingStrategy = 'efficient';
  
  // Choose color palette based on personality
  let paletteType: keyof typeof COLOR_PALETTES;
  if (creativity > 0.7) paletteType = 'vibrant';
  else if (aestheticPreference > 0.6) paletteType = 'pastel';
  else if (energyPattern > 0.6) paletteType = 'warm';
  else if (socialTendency < 0.3) paletteType = 'cool';
  else paletteType = 'earth';
  
  const preferredColors = COLOR_PALETTES[paletteType].slice(0, 2 + Math.floor(Math.random() * 3));
  
  return {
    creativity,
    socialTendency,
    energyPattern,
    riskTolerance,
    communicationStyle,
    aestheticPreference,
    preferredColors,
    buildingStyle,
    danceIntensity,
    foragingStrategy
  };
}

/**
 * Generate a unique name based on personality traits
 */
export function generateBeeName(personality: BeePersonality): string {
  const traits = [];
  
  // Primary trait based on highest scores
  if (personality.creativity > 0.6) traits.push('creative');
  else if (personality.creativity < 0.4) traits.push('practical');
  
  if (personality.socialTendency > 0.6) traits.push('social');
  else if (personality.socialTendency < 0.4) traits.push('independent');
  
  if (personality.energyPattern > 0.6) traits.push('energetic');
  else if (personality.energyPattern < 0.4) traits.push('calm');
  
  if (personality.riskTolerance > 0.6) traits.push('adventurous');
  else if (personality.riskTolerance < 0.4) traits.push('cautious');
  
  if (personality.communicationStyle > 0.6) traits.push('expressive');
  else if (personality.communicationStyle < 0.4) traits.push('subtle');
  
  // Pick a random trait and corresponding name
  const chosenTrait = traits[Math.floor(Math.random() * traits.length)] || 'creative';
  const nameOptions = PERSONALITY_NAMES[chosenTrait as keyof typeof PERSONALITY_NAMES];
  const baseName = nameOptions[Math.floor(Math.random() * nameOptions.length)];
  
  // Add a unique suffix
  const suffix = Math.floor(Math.random() * 999) + 1;
  
  return `${baseName}${suffix}`;
}

/**
 * Create a complete bee with personality, state, and initial setup
 */
export function createBee(position: { x: number; y: number }): BeeState {
  const personality = generateBeePersonality();
  const name = generateBeeName(personality);
  
  // Initial energy and happiness based on personality
  const baseEnergy = 70 + (personality.energyPattern * 30);
  const baseHappiness = 60 + (personality.socialTendency * 20) + (personality.creativity * 20);
  
  return {
    id: `bee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    personality,
    position,
    velocity: { x: 0, y: 0 },
    rotation: Math.random() * Math.PI * 2,
    size: 0.8 + (Math.random() * 0.4), // Slight size variation
    currentActivity: 'exploring',
    energy: Math.min(100, baseEnergy),
    happiness: Math.min(100, baseHappiness),
    friends: [],
    collaborators: [],
    knownFlowers: [],
    buildingProjects: [],
    danceMessages: [],
    age: 0,
    achievements: [],
    personalityEvolution: [{
      timestamp: Date.now(),
      personality,
      trigger: 'birth'
    }]
  };
}

/**
 * Calculate personality compatibility between two bees
 * Returns 0-1 score for how well they work together
 */
export function calculateCompatibility(bee1: BeePersonality, bee2: BeePersonality): number {
  // Social bees work well with other social bees
  const socialMatch = 1 - Math.abs(bee1.socialTendency - bee2.socialTendency);
  
  // Creative and practical bees complement each other
  const creativityBalance = bee1.creativity > 0.5 && bee2.creativity < 0.5 ? 0.8 : 
                           bee1.creativity < 0.5 && bee2.creativity > 0.5 ? 0.8 :
                           1 - Math.abs(bee1.creativity - bee2.creativity);
  
  // Similar energy patterns work well together
  const energyMatch = 1 - Math.abs(bee1.energyPattern - bee2.energyPattern);
  
  // Communication styles should be somewhat compatible
  const communicationMatch = 1 - Math.abs(bee1.communicationStyle - bee2.communicationStyle);
  
  // Weighted average
  return (socialMatch * 0.3 + creativityBalance * 0.3 + energyMatch * 0.2 + communicationMatch * 0.2);
}

/**
 * Determine if a bee should start a new friendship
 */
export function shouldFormFriendship(bee1: BeeState, bee2: BeeState): boolean {
  const compatibility = calculateCompatibility(bee1.personality, bee2.personality);
  const socialBonus = (bee1.personality.socialTendency + bee2.personality.socialTendency) / 2;
  const friendshipThreshold = 0.6 - (socialBonus * 0.2);
  
  return compatibility > friendshipThreshold && Math.random() < 0.1; // 10% chance per check
}

/**
 * Evolve a bee's personality slightly based on experiences
 */
export function evolvePersonality(bee: BeeState, experience: string): BeePersonality {
  const evolution = { ...bee.personality };
  const evolutionRate = 0.02; // Small changes over time
  
  switch (experience) {
    case 'successful_collaboration':
      evolution.socialTendency = Math.min(1, evolution.socialTendency + evolutionRate);
      break;
    case 'creative_achievement':
      evolution.creativity = Math.min(1, evolution.creativity + evolutionRate);
      break;
    case 'exploration_success':
      evolution.riskTolerance = Math.min(1, evolution.riskTolerance + evolutionRate);
      break;
    case 'building_mastery':
      evolution.aestheticPreference = Math.min(1, evolution.aestheticPreference + evolutionRate);
      break;
    case 'social_rejection':
      evolution.socialTendency = Math.max(0, evolution.socialTendency - evolutionRate);
      break;
    case 'creative_block':
      evolution.creativity = Math.max(0, evolution.creativity - evolutionRate * 0.5);
      break;
  }
  
  return evolution;
}

/**
 * Generate achievements based on bee behavior and personality
 */
export function checkForAchievements(bee: BeeState): Achievement[] {
  const newAchievements: Achievement[] = [];
  const existingTypes = bee.achievements.map(a => a.type);
  
  // First flower discovery
  if (!existingTypes.includes('first_flower') && bee.knownFlowers.length > 0) {
    newAchievements.push({
      id: `achievement_${Date.now()}`,
      type: 'first_flower',
      title: 'First Bloom',
      description: 'Discovered your first flower!',
      unlockedAt: Date.now(),
      rarity: 'common'
    });
  }
  
  // Master builder (completed 5 building projects)
  if (!existingTypes.includes('master_builder') && bee.buildingProjects.length >= 5) {
    newAchievements.push({
      id: `achievement_${Date.now()}`,
      type: 'master_builder',
      title: 'Master Architect',
      description: 'Completed 5 building projects!',
      unlockedAt: Date.now(),
      rarity: 'uncommon'
    });
  }
  
  // Social butterfly (10+ friends)
  if (!existingTypes.includes('social_butterfly') && bee.friends.length >= 10) {
    newAchievements.push({
      id: `achievement_${Date.now()}`,
      type: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Made friends with 10 other bees!',
      unlockedAt: Date.now(),
      rarity: 'rare'
    });
  }
  
  // Artist (high creativity + unique building style)
  if (!existingTypes.includes('artist') && 
      bee.personality.creativity > 0.8 && 
      bee.buildingProjects.some(p => p.style === 'organic' || p.style === 'chaotic')) {
    newAchievements.push({
      id: `achievement_${Date.now()}`,
      type: 'artist',
      title: 'Digital Picasso',
      description: 'Created truly unique artistic structures!',
      unlockedAt: Date.now(),
      rarity: 'legendary'
    });
  }
  
  return newAchievements;
}
