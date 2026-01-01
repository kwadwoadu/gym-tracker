/**
 * SetFlow Achievement System
 *
 * Achievements are organized into categories with bronze/silver/gold tiers
 */

export type AchievementTier = "bronze" | "silver" | "gold";
export type AchievementCategory =
  | "streak"
  | "workouts"
  | "volume"
  | "personal_records"
  | "consistency"
  | "milestones";

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  tier: AchievementTier;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  requirement: number; // The threshold to unlock
  checkType: "streak" | "total_workouts" | "total_volume" | "total_prs" | "weekly_completion" | "monthly_completion";
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ========== STREAK ACHIEVEMENTS ==========
  {
    id: "streak_7",
    category: "streak",
    tier: "bronze",
    name: "Week Warrior",
    description: "Maintain a 7-day workout streak",
    icon: "Flame",
    requirement: 7,
    checkType: "streak",
  },
  {
    id: "streak_14",
    category: "streak",
    tier: "bronze",
    name: "Fortnight Fighter",
    description: "Maintain a 14-day workout streak",
    icon: "Flame",
    requirement: 14,
    checkType: "streak",
  },
  {
    id: "streak_30",
    category: "streak",
    tier: "silver",
    name: "Monthly Machine",
    description: "Maintain a 30-day workout streak",
    icon: "Flame",
    requirement: 30,
    checkType: "streak",
  },
  {
    id: "streak_60",
    category: "streak",
    tier: "silver",
    name: "Consistency King",
    description: "Maintain a 60-day workout streak",
    icon: "Flame",
    requirement: 60,
    checkType: "streak",
  },
  {
    id: "streak_90",
    category: "streak",
    tier: "gold",
    name: "Quarter Champion",
    description: "Maintain a 90-day workout streak",
    icon: "Flame",
    requirement: 90,
    checkType: "streak",
  },
  {
    id: "streak_180",
    category: "streak",
    tier: "gold",
    name: "Half-Year Hero",
    description: "Maintain a 180-day workout streak",
    icon: "Flame",
    requirement: 180,
    checkType: "streak",
  },
  {
    id: "streak_365",
    category: "streak",
    tier: "gold",
    name: "Year of Iron",
    description: "Maintain a 365-day workout streak",
    icon: "Crown",
    requirement: 365,
    checkType: "streak",
  },

  // ========== WORKOUT COUNT ACHIEVEMENTS ==========
  {
    id: "workouts_10",
    category: "workouts",
    tier: "bronze",
    name: "Getting Started",
    description: "Complete 10 workouts",
    icon: "Dumbbell",
    requirement: 10,
    checkType: "total_workouts",
  },
  {
    id: "workouts_25",
    category: "workouts",
    tier: "bronze",
    name: "Building Habits",
    description: "Complete 25 workouts",
    icon: "Dumbbell",
    requirement: 25,
    checkType: "total_workouts",
  },
  {
    id: "workouts_50",
    category: "workouts",
    tier: "silver",
    name: "Half Century",
    description: "Complete 50 workouts",
    icon: "Dumbbell",
    requirement: 50,
    checkType: "total_workouts",
  },
  {
    id: "workouts_100",
    category: "workouts",
    tier: "silver",
    name: "Century Club",
    description: "Complete 100 workouts",
    icon: "Medal",
    requirement: 100,
    checkType: "total_workouts",
  },
  {
    id: "workouts_250",
    category: "workouts",
    tier: "gold",
    name: "Gym Regular",
    description: "Complete 250 workouts",
    icon: "Medal",
    requirement: 250,
    checkType: "total_workouts",
  },
  {
    id: "workouts_500",
    category: "workouts",
    tier: "gold",
    name: "Iron Veteran",
    description: "Complete 500 workouts",
    icon: "Trophy",
    requirement: 500,
    checkType: "total_workouts",
  },
  {
    id: "workouts_1000",
    category: "workouts",
    tier: "gold",
    name: "Legendary Lifter",
    description: "Complete 1000 workouts",
    icon: "Crown",
    requirement: 1000,
    checkType: "total_workouts",
  },

  // ========== VOLUME ACHIEVEMENTS (in kg) ==========
  {
    id: "volume_10k",
    category: "volume",
    tier: "bronze",
    name: "First Ton",
    description: "Lift 10,000 kg total volume",
    icon: "Weight",
    requirement: 10000,
    checkType: "total_volume",
  },
  {
    id: "volume_50k",
    category: "volume",
    tier: "bronze",
    name: "Volume Builder",
    description: "Lift 50,000 kg total volume",
    icon: "Weight",
    requirement: 50000,
    checkType: "total_volume",
  },
  {
    id: "volume_100k",
    category: "volume",
    tier: "silver",
    name: "100 Ton Club",
    description: "Lift 100,000 kg total volume",
    icon: "Weight",
    requirement: 100000,
    checkType: "total_volume",
  },
  {
    id: "volume_500k",
    category: "volume",
    tier: "silver",
    name: "Heavy Hitter",
    description: "Lift 500,000 kg total volume",
    icon: "Zap",
    requirement: 500000,
    checkType: "total_volume",
  },
  {
    id: "volume_1m",
    category: "volume",
    tier: "gold",
    name: "Million Pound Club",
    description: "Lift 1,000,000 kg total volume",
    icon: "Trophy",
    requirement: 1000000,
    checkType: "total_volume",
  },

  // ========== PERSONAL RECORDS ACHIEVEMENTS ==========
  {
    id: "prs_5",
    category: "personal_records",
    tier: "bronze",
    name: "PR Starter",
    description: "Set 5 personal records",
    icon: "TrendingUp",
    requirement: 5,
    checkType: "total_prs",
  },
  {
    id: "prs_10",
    category: "personal_records",
    tier: "bronze",
    name: "Record Breaker",
    description: "Set 10 personal records",
    icon: "TrendingUp",
    requirement: 10,
    checkType: "total_prs",
  },
  {
    id: "prs_25",
    category: "personal_records",
    tier: "silver",
    name: "PR Machine",
    description: "Set 25 personal records",
    icon: "TrendingUp",
    requirement: 25,
    checkType: "total_prs",
  },
  {
    id: "prs_50",
    category: "personal_records",
    tier: "silver",
    name: "Record Setter",
    description: "Set 50 personal records",
    icon: "Star",
    requirement: 50,
    checkType: "total_prs",
  },
  {
    id: "prs_100",
    category: "personal_records",
    tier: "gold",
    name: "PR Legend",
    description: "Set 100 personal records",
    icon: "Crown",
    requirement: 100,
    checkType: "total_prs",
  },

  // ========== CONSISTENCY ACHIEVEMENTS ==========
  {
    id: "perfect_week",
    category: "consistency",
    tier: "bronze",
    name: "Perfect Week",
    description: "Complete all planned workouts in a week",
    icon: "Calendar",
    requirement: 1,
    checkType: "weekly_completion",
  },
  {
    id: "perfect_month",
    category: "consistency",
    tier: "silver",
    name: "Perfect Month",
    description: "Complete all planned workouts in a month",
    icon: "Calendar",
    requirement: 1,
    checkType: "monthly_completion",
  },
];

// Helper to get achievement by ID
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Helper to get achievements by category
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

// Helper to get achievements by tier
export function getAchievementsByTier(tier: AchievementTier): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(a => a.tier === tier);
}

// Category display names
export const CATEGORY_NAMES: Record<AchievementCategory, string> = {
  streak: "Streaks",
  workouts: "Workouts",
  volume: "Volume",
  personal_records: "Personal Records",
  consistency: "Consistency",
  milestones: "Milestones",
};

// Tier colors for UI
export const TIER_COLORS: Record<AchievementTier, { bg: string; border: string; text: string }> = {
  bronze: {
    bg: "bg-orange-900/20",
    border: "border-orange-700/50",
    text: "text-orange-400",
  },
  silver: {
    bg: "bg-gray-400/20",
    border: "border-gray-400/50",
    text: "text-gray-300",
  },
  gold: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
  },
};
