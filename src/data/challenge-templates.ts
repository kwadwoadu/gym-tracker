// Challenge Templates for Community Features
// Pre-defined challenges that users can quickly start

import type { ChallengeType } from "@/lib/api-client";

export interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  target: number;
  durationDays: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: string; // Lucide icon name
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // Beginner-friendly challenges
  {
    id: "ct-weekly-warrior",
    name: "Weekly Warrior",
    description: "Complete 4 workouts this week",
    type: "workouts",
    target: 4,
    durationDays: 7,
    difficulty: "beginner",
    icon: "Calendar",
  },
  {
    id: "ct-streak-starter",
    name: "Streak Starter",
    description: "Build a 7-day workout streak",
    type: "streak",
    target: 7,
    durationDays: 14,
    difficulty: "beginner",
    icon: "Flame",
  },
  {
    id: "ct-first-steps",
    name: "First Steps",
    description: "Complete 3 workouts in 7 days",
    type: "workouts",
    target: 3,
    durationDays: 7,
    difficulty: "beginner",
    icon: "Footprints",
  },

  // Intermediate challenges
  {
    id: "ct-volume-king",
    name: "Volume King",
    description: "Lift 10,000 kg total this week",
    type: "volume",
    target: 10000,
    durationDays: 7,
    difficulty: "intermediate",
    icon: "Dumbbell",
  },
  {
    id: "ct-consistency-champion",
    name: "Consistency Champion",
    description: "Work out 12 days this month",
    type: "consistency",
    target: 12,
    durationDays: 30,
    difficulty: "intermediate",
    icon: "Target",
  },
  {
    id: "ct-two-week-streak",
    name: "Two Week Titan",
    description: "Maintain a 14-day workout streak",
    type: "streak",
    target: 14,
    durationDays: 21,
    difficulty: "intermediate",
    icon: "Flame",
  },
  {
    id: "ct-volume-surge",
    name: "Volume Surge",
    description: "Lift 25,000 kg in two weeks",
    type: "volume",
    target: 25000,
    durationDays: 14,
    difficulty: "intermediate",
    icon: "TrendingUp",
  },

  // Advanced challenges
  {
    id: "ct-iron-month",
    name: "Iron Month",
    description: "Complete 20 workouts in 30 days",
    type: "workouts",
    target: 20,
    durationDays: 30,
    difficulty: "advanced",
    icon: "Trophy",
  },
  {
    id: "ct-beast-mode",
    name: "Beast Mode",
    description: "Lift 50,000 kg in one month",
    type: "volume",
    target: 50000,
    durationDays: 30,
    difficulty: "advanced",
    icon: "Zap",
  },
  {
    id: "ct-month-streak",
    name: "30-Day Legend",
    description: "Build a 30-day consecutive workout streak",
    type: "streak",
    target: 30,
    durationDays: 45,
    difficulty: "advanced",
    icon: "Award",
  },
];

// Helper function to get templates by difficulty
export function getTemplatesByDifficulty(difficulty: ChallengeTemplate["difficulty"]): ChallengeTemplate[] {
  return CHALLENGE_TEMPLATES.filter((t) => t.difficulty === difficulty);
}

// Helper function to get a template by ID
export function getTemplateById(id: string): ChallengeTemplate | undefined {
  return CHALLENGE_TEMPLATES.find((t) => t.id === id);
}

// Helper to calculate end date from start date and duration
export function calculateEndDate(startDate: Date, durationDays: number): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate.toISOString().split("T")[0];
}
