// 🐝 Bee Personality and Behavior Types
// The heart of our digital consciousness simulation!

export interface BeePersonality {
  // Core personality traits (0-1 scale)
  creativity: number;        // Artistic vs. Practical building
  socialTendency: number;    // Collaborative vs. Independent
  energyPattern: number;     // Steady vs. Burst work style
  riskTolerance: number;     // Adventurous vs. Cautious
  communicationStyle: number; // Enthusiastic vs. Subtle
  aestheticPreference: number; // Geometric vs. Organic patterns
  
  // Derived characteristics
  preferredColors: string[];
  buildingStyle: 'geometric' | 'organic' | 'chaotic' | 'structured';
  danceIntensity: 'subtle' | 'moderate' | 'enthusiastic' | 'dramatic';
  foragingStrategy: 'efficient' | 'exploratory' | 'social' | 'cautious';
}

export interface BeeState {
  id: string;
  name: string;
  personality: BeePersonality;
  
  // Physical properties
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  rotation: number;
  size: number;
  
  // Current behavior
  currentActivity: BeeActivity;
  targetPosition?: { x: number; y: number };
  energy: number; // 0-100
  happiness: number; // 0-100
  
  // Social connections
  friends: string[]; // IDs of other bees
  collaborators: string[]; // Current building partners
  
  // Memory and experience
  knownFlowers: FlowerLocation[];
  buildingProjects: BuildingProject[];
  danceMessages: DanceMessage[];
  
  // Life history
  age: number; // in simulation ticks
  achievements: Achievement[];
  personalityEvolution: PersonalitySnapshot[];
}

export type BeeActivity = 
  | 'foraging'
  | 'building'
  | 'dancing'
  | 'resting'
  | 'socializing'
  | 'exploring'
  | 'patrolling';

export interface FlowerLocation {
  id: string;
  position: { x: number; y: number };
  type: 'lavender' | 'sunflower' | 'wildflower' | 'clover';
  quality: number; // 0-1
  discoveredBy: string; // bee ID
  lastVisited: number; // timestamp
}

export interface BuildingProject {
  id: string;
  type: 'honeycomb' | 'storage' | 'nursery' | 'art';
  position: { x: number; y: number };
  progress: number; // 0-1
  contributors: string[]; // bee IDs
  style: BeePersonality['buildingStyle'];
  pattern: HexPattern;
}

export interface HexPattern {
  cells: HexCell[];
  symmetry: 'radial' | 'bilateral' | 'asymmetric' | 'fractal';
  colorScheme: string[];
  artisticElements: ArtisticElement[];
}

export interface HexCell {
  q: number; // hex coordinate
  r: number; // hex coordinate
  type: 'honey' | 'pollen' | 'brood' | 'empty' | 'art';
  color: string;
  builder: string; // bee ID
  buildTime: number;
}

export interface ArtisticElement {
  type: 'spiral' | 'flower' | 'geometric' | 'organic';
  position: { q: number; r: number };
  size: number;
  color: string;
  creator: string; // bee ID
}

export interface DanceMessage {
  id: string;
  dancer: string; // bee ID
  type: 'flower_location' | 'building_site' | 'danger' | 'celebration';
  content: any; // specific to message type
  intensity: number; // 0-1
  timestamp: number;
  audience: string[]; // bee IDs who watched
}

export interface Achievement {
  id: string;
  type: 'first_flower' | 'master_builder' | 'social_butterfly' | 'artist' | 'explorer';
  title: string;
  description: string;
  unlockedAt: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface PersonalitySnapshot {
  timestamp: number;
  personality: BeePersonality;
  trigger: string; // what caused the personality shift
}

// Colony-level types
export interface Colony {
  id: string;
  name: string;
  bees: BeeState[];
  hive: Hive;
  environment: Environment;
  statistics: ColonyStats;
  culture: ColonyCulture;
}

export interface Hive {
  center: { x: number; y: number };
  cells: HexCell[];
  totalSize: number;
  architecturalStyle: 'mixed' | 'geometric' | 'organic' | 'artistic';
  culturalElements: CulturalElement[];
}

export interface CulturalElement {
  type: 'tradition' | 'innovation' | 'art_style' | 'building_technique';
  name: string;
  description: string;
  originBee: string; // who started it
  adoptionRate: number; // 0-1
  evolutionHistory: string[];
}

export interface Environment {
  flowers: FlowerLocation[];
  obstacles: Obstacle[];
  weather: WeatherCondition;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  timeOfDay: number; // 0-24
}

export interface Obstacle {
  id: string;
  type: 'rock' | 'water' | 'wind' | 'predator';
  position: { x: number; y: number };
  size: { width: number; height: number };
  effect: 'blocks_movement' | 'slows_movement' | 'dangerous' | 'beneficial';
}

export interface WeatherCondition {
  type: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy';
  intensity: number; // 0-1
  temperature: number; // affects bee activity
  windSpeed: number; // affects flight
  visibility: number; // affects foraging range
}

export interface ColonyStats {
  population: number;
  totalHoneyProduced: number;
  averageHappiness: number;
  averageEnergy: number;
  buildingProgress: number;
  explorationRadius: number;
  culturalDiversity: number;
  innovationRate: number;
}

export interface ColonyCulture {
  dominantPersonalities: BeePersonality[];
  sharedTraditions: CulturalElement[];
  artisticMovements: ArtisticMovement[];
  socialNorms: SocialNorm[];
}

export interface ArtisticMovement {
  name: string;
  style: string;
  founders: string[]; // bee IDs
  followers: string[]; // bee IDs
  signature_elements: ArtisticElement[];
  influence: number; // 0-1
}

export interface SocialNorm {
  type: 'building_etiquette' | 'foraging_protocol' | 'dance_style' | 'conflict_resolution';
  description: string;
  adherence: number; // 0-1
  enforcers: string[]; // bee IDs who promote this norm
}
