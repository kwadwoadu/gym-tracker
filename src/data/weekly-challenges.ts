// Weekly challenges data for SetFlow Webapp gamification system

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  requirement: {
    type: 'workouts' | 'protein_days' | 'volume' | 'streak' | 'prs' | 'sets' | 'reps';
    value: number;
  };
}

// Pool of possible weekly challenges - 3 are selected each week
export const weeklyChallengePool: WeeklyChallenge[] = [
  // Workout frequency challenges
  {
    id: 'weekly-3-workouts',
    title: 'Consistent',
    description: 'Complete 3 workouts this week',
    icon: 'Calendar',
    xpReward: 100,
    requirement: { type: 'workouts', value: 3 },
  },
  {
    id: 'weekly-5-workouts',
    title: '5 Workouts This Week',
    description: 'Complete 5 workouts this week',
    icon: 'Dumbbell',
    xpReward: 200,
    requirement: { type: 'workouts', value: 5 },
  },
  {
    id: 'weekly-7-workouts',
    title: 'No Days Off',
    description: 'Work out every day this week',
    icon: 'Flame',
    xpReward: 350,
    requirement: { type: 'workouts', value: 7 },
  },

  // Nutrition challenges
  {
    id: 'weekly-protein-3',
    title: 'Protein Focus',
    description: 'Hit protein goal 3 days this week',
    icon: 'Beef',
    xpReward: 100,
    requirement: { type: 'protein_days', value: 3 },
  },
  {
    id: 'weekly-protein-5',
    title: 'Hit Protein Goal 5 Days',
    description: 'Reach your protein target 5 days this week',
    icon: 'Beef',
    xpReward: 150,
    requirement: { type: 'protein_days', value: 5 },
  },
  {
    id: 'weekly-protein-7',
    title: 'Protein Perfect',
    description: 'Hit protein goal every day this week',
    icon: 'Zap',
    xpReward: 250,
    requirement: { type: 'protein_days', value: 7 },
  },

  // Volume challenges
  {
    id: 'weekly-10k-volume',
    title: '10,000 kg Volume',
    description: 'Lift 10,000 kg total this week',
    icon: 'Weight',
    xpReward: 250,
    requirement: { type: 'volume', value: 10000 },
  },
  {
    id: 'weekly-20k-volume',
    title: '20,000 kg Volume',
    description: 'Lift 20,000 kg total this week',
    icon: 'Star',
    xpReward: 400,
    requirement: { type: 'volume', value: 20000 },
  },
  {
    id: 'weekly-50k-volume',
    title: 'Tonnage Titan',
    description: 'Lift 50,000 kg total this week',
    icon: 'Crown',
    xpReward: 750,
    requirement: { type: 'volume', value: 50000 },
  },

  // Streak challenges
  {
    id: 'weekly-7-streak',
    title: '7-Day Streak',
    description: 'Maintain a 7-day workout streak',
    icon: 'Target',
    xpReward: 300,
    requirement: { type: 'streak', value: 7 },
  },

  // PR challenges
  {
    id: 'weekly-3-prs',
    title: 'PR Week',
    description: 'Set 3 personal records this week',
    icon: 'Trophy',
    xpReward: 200,
    requirement: { type: 'prs', value: 3 },
  },
  {
    id: 'weekly-5-prs',
    title: 'Record Breaker',
    description: 'Set 5 personal records this week',
    icon: 'Medal',
    xpReward: 350,
    requirement: { type: 'prs', value: 5 },
  },

  // Set challenges
  {
    id: 'weekly-50-sets',
    title: 'Set Accumulator',
    description: 'Complete 50 sets this week',
    icon: 'BarChart3',
    xpReward: 150,
    requirement: { type: 'sets', value: 50 },
  },
  {
    id: 'weekly-100-sets',
    title: 'Century Sets',
    description: 'Complete 100 sets this week',
    icon: 'BarChart3',
    xpReward: 300,
    requirement: { type: 'sets', value: 100 },
  },

  // Rep challenges
  {
    id: 'weekly-500-reps',
    title: 'Rep Accumulator',
    description: 'Complete 500 reps this week',
    icon: 'Hash',
    xpReward: 150,
    requirement: { type: 'reps', value: 500 },
  },
  {
    id: 'weekly-1000-reps',
    title: 'Thousand Reps',
    description: 'Complete 1,000 reps this week',
    icon: 'Zap',
    xpReward: 300,
    requirement: { type: 'reps', value: 1000 },
  },
];

// Simple hash function for seeding
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Get Monday of a given week
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Get weekly challenges (seeded by week for consistency)
export function getWeeklyChallenges(date: Date = new Date()): WeeklyChallenge[] {
  const monday = getMonday(date);
  const weekString = monday.toISOString().split('T')[0];
  const seed = hashCode(weekString);

  // Create a shuffled copy using the seed
  const shuffled = [...weeklyChallengePool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((seed * (i + 1)) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Return first 3 challenges
  return shuffled.slice(0, 3);
}

// Get days remaining in the week (from current date to Sunday)
export function getDaysRemainingInWeek(date: Date = new Date()): number {
  const day = date.getDay();
  // Sunday = 0, we want days until Sunday (end of week)
  return day === 0 ? 0 : 7 - day;
}

// Get current week ID (Monday's date in YYYY-MM-DD format)
export function getWeekId(date: Date = new Date()): string {
  return getMonday(date).toISOString().split('T')[0];
}

// Get challenge by ID from the pool
export function getWeeklyChallengeById(id: string): WeeklyChallenge | undefined {
  return weeklyChallengePool.find(c => c.id === id);
}
