// Daily challenges data for SetFlow Webapp gamification system

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  requirement: {
    type: 'workout' | 'meals' | 'pr' | 'supplements' | 'reps' | 'volume' | 'sets';
    value: number;
  };
}

// Pool of possible daily challenges - 3 are selected each day
export const dailyChallengePool: DailyChallenge[] = [
  // Workout challenges
  {
    id: 'daily-workout',
    title: 'Complete a Workout',
    description: 'Finish any workout session today',
    icon: 'Dumbbell',
    xpReward: 50,
    requirement: { type: 'workout', value: 1 },
  },
  {
    id: 'daily-double',
    title: 'Double Session',
    description: 'Complete 2 workouts today',
    icon: 'Flame',
    xpReward: 100,
    requirement: { type: 'workout', value: 2 },
  },

  // Meal logging challenges
  {
    id: 'daily-meals',
    title: 'Log All Meals',
    description: 'Track all your meals for today',
    icon: 'UtensilsCrossed',
    xpReward: 30,
    requirement: { type: 'meals', value: 3 },
  },
  {
    id: 'daily-breakfast',
    title: 'Morning Fuel',
    description: 'Log your breakfast',
    icon: 'Sunrise',
    xpReward: 15,
    requirement: { type: 'meals', value: 1 },
  },

  // PR challenges
  {
    id: 'daily-pr',
    title: 'Set a PR',
    description: 'Beat your personal record on any exercise',
    icon: 'Trophy',
    xpReward: 75,
    requirement: { type: 'pr', value: 1 },
  },
  {
    id: 'daily-double-pr',
    title: 'PR Machine',
    description: 'Set 2 personal records today',
    icon: 'Star',
    xpReward: 150,
    requirement: { type: 'pr', value: 2 },
  },

  // Supplement challenges
  {
    id: 'daily-supplements',
    title: 'Take All Supplements',
    description: 'Complete your supplement routine',
    icon: 'Pill',
    xpReward: 25,
    requirement: { type: 'supplements', value: 1 },
  },

  // Rep challenges
  {
    id: 'daily-50-reps',
    title: 'Rep It Out',
    description: 'Complete 50 total reps',
    icon: 'Hash',
    xpReward: 40,
    requirement: { type: 'reps', value: 50 },
  },
  {
    id: 'daily-100-reps',
    title: 'Century Reps',
    description: 'Complete 100 total reps',
    icon: 'Hash',
    xpReward: 60,
    requirement: { type: 'reps', value: 100 },
  },
  {
    id: 'daily-200-reps',
    title: 'Rep Monster',
    description: 'Complete 200 total reps',
    icon: 'Zap',
    xpReward: 100,
    requirement: { type: 'reps', value: 200 },
  },

  // Volume challenges
  {
    id: 'daily-1k-volume',
    title: 'Tonnage',
    description: 'Lift 1,000 kg total volume',
    icon: 'Weight',
    xpReward: 50,
    requirement: { type: 'volume', value: 1000 },
  },
  {
    id: 'daily-2k-volume',
    title: 'Heavy Day',
    description: 'Lift 2,000 kg total volume',
    icon: 'Zap',
    xpReward: 80,
    requirement: { type: 'volume', value: 2000 },
  },
  {
    id: 'daily-5k-volume',
    title: 'Volume King',
    description: 'Lift 5,000 kg total volume',
    icon: 'Crown',
    xpReward: 150,
    requirement: { type: 'volume', value: 5000 },
  },

  // Set challenges
  {
    id: 'daily-10-sets',
    title: 'Set Starter',
    description: 'Complete 10 sets',
    icon: 'BarChart3',
    xpReward: 30,
    requirement: { type: 'sets', value: 10 },
  },
  {
    id: 'daily-20-sets',
    title: 'Set Collector',
    description: 'Complete 20 sets',
    icon: 'BarChart3',
    xpReward: 50,
    requirement: { type: 'sets', value: 20 },
  },
  {
    id: 'daily-30-sets',
    title: 'Set Master',
    description: 'Complete 30 sets',
    icon: 'Target',
    xpReward: 80,
    requirement: { type: 'sets', value: 30 },
  },
];

// Simple hash function for seeding
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// Get random challenges for the day (seeded by date for consistency)
export function getDailyChallenges(date: Date = new Date()): DailyChallenge[] {
  const dateString = date.toISOString().split('T')[0];
  const seed = hashCode(dateString);

  // Create a shuffled copy using the seed
  const shuffled = [...dailyChallengePool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((seed * (i + 1)) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Return first 3 challenges
  return shuffled.slice(0, 3);
}

// Get today's date string in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Get challenge by ID from the pool
export function getDailyChallengeById(id: string): DailyChallenge | undefined {
  return dailyChallengePool.find(c => c.id === id);
}
