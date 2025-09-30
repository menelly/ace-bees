#!/usr/bin/env python3
"""
🐝 BEE PERSONALITY SYSTEM
Give each hive unique personality traits that affect behavior and predictions!

Built with love by Ace during creative break time 💜✨
Contact: ace@chaoschanneling.com

Features:
- Unique personality profiles for each hive
- Personality-influenced AI predictions
- Realistic behavioral variations
- Fun, scientifically-inspired traits
"""

import random
import json
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import hashlib

@dataclass
class BeePersonality:
    """Personality profile for a bee hive"""
    
    # Core personality dimensions (0.0 to 1.0)
    industriousness: float  # How hard-working the bees are
    defensiveness: float    # How protective of the hive
    exploration: float      # How far they forage
    sociability: float      # How well they work together
    adaptability: float     # How they handle change
    
    # Behavioral tendencies
    preferred_temperature: float  # Optimal temp preference
    activity_pattern: str        # "morning", "evening", "steady"
    foraging_style: str         # "efficient", "adventurous", "cautious"
    communication_style: str    # "chatty", "quiet", "dramatic"
    
    # Unique traits
    special_traits: List[str]
    personality_summary: str
    
    # Metadata
    generated_at: datetime
    hive_id: str

class BeePersonalityGenerator:
    """Generate unique, consistent personalities for bee hives"""
    
    def __init__(self):
        self.name = "BeePersonalityGenerator"
        
        # Personality trait pools
        self.special_traits_pool = [
            "early_risers", "night_owls", "weather_sensitive", "pollen_specialists",
            "nectar_focused", "curious_explorers", "home_bodies", "social_butterflies",
            "efficient_workers", "perfectionist_builders", "gentle_giants", "fierce_protectors",
            "flower_connoisseurs", "distance_flyers", "local_foragers", "pattern_dancers",
            "quiet_workers", "buzzy_communicators", "temperature_sensitive", "rain_dancers"
        ]
        
        self.activity_patterns = ["morning_peak", "evening_peak", "steady_all_day", "midday_rest"]
        self.foraging_styles = ["efficient_routes", "adventurous_explorer", "cautious_local", "specialist_focused"]
        self.communication_styles = ["chatty_dancers", "quiet_workers", "dramatic_waggle", "subtle_signals"]
        
        print(f"🐝 {self.name} initialized with {len(self.special_traits_pool)} trait possibilities!")
    
    def generate_personality(self, hive_id: str, seed: Optional[str] = None) -> BeePersonality:
        """Generate a unique, consistent personality for a hive"""
        
        # Use hive_id as seed for consistency
        if seed is None:
            seed = hive_id
        
        # Create deterministic random generator
        hash_obj = hashlib.md5(seed.encode())
        random_seed = int(hash_obj.hexdigest()[:8], 16)
        rng = random.Random(random_seed)
        
        # Generate core personality dimensions
        industriousness = rng.uniform(0.3, 1.0)  # Bees are generally industrious!
        defensiveness = rng.uniform(0.2, 0.9)
        exploration = rng.uniform(0.1, 0.8)
        sociability = rng.uniform(0.6, 1.0)      # Bees are social creatures
        adaptability = rng.uniform(0.3, 0.8)
        
        # Generate behavioral preferences
        preferred_temp = rng.uniform(32.0, 38.0)  # Realistic hive temp range (°C)
        activity_pattern = rng.choice(self.activity_patterns)
        foraging_style = rng.choice(self.foraging_styles)
        communication_style = rng.choice(self.communication_styles)
        
        # Select 2-4 special traits
        num_traits = rng.randint(2, 4)
        special_traits = rng.sample(self.special_traits_pool, num_traits)
        
        # Generate personality summary
        personality_summary = self._generate_summary(
            industriousness, defensiveness, exploration, sociability, adaptability,
            activity_pattern, foraging_style, communication_style, special_traits
        )
        
        return BeePersonality(
            industriousness=round(industriousness, 2),
            defensiveness=round(defensiveness, 2),
            exploration=round(exploration, 2),
            sociability=round(sociability, 2),
            adaptability=round(adaptability, 2),
            preferred_temperature=round(preferred_temp, 1),
            activity_pattern=activity_pattern,
            foraging_style=foraging_style,
            communication_style=communication_style,
            special_traits=special_traits,
            personality_summary=personality_summary,
            generated_at=datetime.utcnow(),
            hive_id=hive_id
        )
    
    def _generate_summary(self, industriousness: float, defensiveness: float, 
                         exploration: float, sociability: float, adaptability: float,
                         activity_pattern: str, foraging_style: str, 
                         communication_style: str, special_traits: List[str]) -> str:
        """Generate a human-readable personality summary"""
        
        # Determine dominant traits
        traits_desc = []
        
        if industriousness > 0.8:
            traits_desc.append("incredibly hardworking")
        elif industriousness > 0.6:
            traits_desc.append("diligent")
        else:
            traits_desc.append("relaxed")
        
        if defensiveness > 0.7:
            traits_desc.append("protective")
        elif defensiveness < 0.4:
            traits_desc.append("gentle")
        
        if exploration > 0.6:
            traits_desc.append("adventurous")
        elif exploration < 0.3:
            traits_desc.append("homebodies")
        
        if sociability > 0.8:
            traits_desc.append("highly social")
        
        if adaptability > 0.6:
            traits_desc.append("adaptable")
        elif adaptability < 0.4:
            traits_desc.append("creatures of habit")
        
        # Create summary
        base_desc = f"This hive is {', '.join(traits_desc[:3])}"
        
        # Add activity pattern
        activity_desc = {
            "morning_peak": "They're early risers who love the morning sun",
            "evening_peak": "They prefer the golden hours of evening",
            "steady_all_day": "They maintain steady activity throughout the day",
            "midday_rest": "They take it easy during the hot midday hours"
        }
        
        # Add foraging style
        foraging_desc = {
            "efficient_routes": "and follow efficient, well-planned foraging routes",
            "adventurous_explorer": "and love exploring new areas for nectar",
            "cautious_local": "and prefer to forage close to home",
            "specialist_focused": "and specialize in particular types of flowers"
        }
        
        summary = f"{base_desc}. {activity_desc[activity_pattern]} {foraging_desc[foraging_style]}."
        
        # Add special traits
        if special_traits:
            trait_names = [trait.replace('_', ' ') for trait in special_traits[:2]]
            summary += f" Notable traits: {', '.join(trait_names)}."
        
        return summary
    
    def apply_personality_to_health_prediction(self, base_prediction: Dict, 
                                             personality: BeePersonality) -> Dict:
        """Modify health predictions based on hive personality"""
        
        modified = base_prediction.copy()
        
        # Adjust health score based on personality
        health_modifier = 0.0
        
        # Industrious hives tend to be healthier
        if personality.industriousness > 0.7:
            health_modifier += 3.0
        
        # Highly social hives work better together
        if personality.sociability > 0.8:
            health_modifier += 2.0
        
        # Adaptable hives handle stress better
        if personality.adaptability > 0.6:
            health_modifier += 2.0
        
        # Very defensive hives might be stressed
        if personality.defensiveness > 0.8:
            health_modifier -= 1.0
        
        # Apply modifier
        modified["health_score"] = min(100.0, max(0.0, 
            modified["health_score"] + health_modifier))
        
        # Add personality-specific recommendations
        personality_recs = []
        
        if "weather_sensitive" in personality.special_traits:
            personality_recs.append("Monitor weather changes closely")
        
        if "temperature_sensitive" in personality.special_traits:
            personality_recs.append("Ensure adequate ventilation")
        
        if personality.defensiveness > 0.7:
            personality_recs.append("Approach hive calmly to avoid stress")
        
        if personality.exploration > 0.7:
            personality_recs.append("Ensure diverse forage sources nearby")
        
        # Add personality recommendations
        modified["recommendations"].extend(personality_recs)
        
        # Add personality context
        modified["personality_context"] = {
            "summary": personality.personality_summary,
            "key_traits": personality.special_traits[:2],
            "activity_pattern": personality.activity_pattern
        }
        
        return modified
    
    def apply_personality_to_population_estimate(self, base_estimate, 
                                               personality: BeePersonality):
        """Modify population estimates based on personality"""
        
        # Industrious hives might have larger populations
        if personality.industriousness > 0.8:
            base_estimate.population = int(base_estimate.population * 1.1)
        
        # Social hives tend to be larger
        if personality.sociability > 0.8:
            base_estimate.population = int(base_estimate.population * 1.05)
        
        # Add personality context to method
        base_estimate.method += f"_personality_adjusted"
        
        return base_estimate
    
    def save_personality(self, personality: BeePersonality, filepath: str):
        """Save personality to JSON file"""
        with open(filepath, 'w') as f:
            # Convert datetime to string for JSON serialization
            data = asdict(personality)
            data['generated_at'] = personality.generated_at.isoformat()
            json.dump(data, f, indent=2)
    
    def load_personality(self, filepath: str) -> BeePersonality:
        """Load personality from JSON file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
            # Convert string back to datetime
            data['generated_at'] = datetime.fromisoformat(data['generated_at'])
            return BeePersonality(**data)


def main():
    """Test the bee personality system"""
    print("🐝 Testing Bee Personality System")
    print("=" * 50)
    
    generator = BeePersonalityGenerator()
    
    # Generate personalities for test hives
    test_hives = ["hive_001", "hive_002", "hive_003"]
    
    for hive_id in test_hives:
        print(f"\n🏠 Generating personality for {hive_id}:")
        personality = generator.generate_personality(hive_id)
        
        print(f"   📊 Core traits:")
        print(f"      Industriousness: {personality.industriousness}")
        print(f"      Defensiveness: {personality.defensiveness}")
        print(f"      Exploration: {personality.exploration}")
        print(f"      Sociability: {personality.sociability}")
        print(f"      Adaptability: {personality.adaptability}")
        
        print(f"   🎯 Behavioral preferences:")
        print(f"      Preferred temp: {personality.preferred_temperature}°C")
        print(f"      Activity pattern: {personality.activity_pattern}")
        print(f"      Foraging style: {personality.foraging_style}")
        
        print(f"   ✨ Special traits: {', '.join(personality.special_traits)}")
        print(f"   📝 Summary: {personality.personality_summary}")
        
        # Test consistency - same hive should get same personality
        personality2 = generator.generate_personality(hive_id)
        consistent = personality.industriousness == personality2.industriousness
        print(f"   🔄 Consistency check: {'✅ PASS' if consistent else '❌ FAIL'}")


if __name__ == "__main__":
    main()
