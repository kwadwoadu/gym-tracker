/**
 * SetFlow Gamification System
 *
 * Handles achievement checking, unlocking, and progress tracking
 */

import {
  workoutLogsApi,
  personalRecordsApi,
  achievementsApi,
  type WorkoutLog,
  type Achievement,
} from "./api-client";
import { ACHIEVEMENTS, getAchievementById, type AchievementDefinition } from "@/data/achievements";

// ============================================================
// Achievement Progress Types
// ============================================================

export interface AchievementProgress {
  achievement: AchievementDefinition;
  currentValue: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  percentComplete: number;
}

export interface AchievementUnlock {
  achievement: AchievementDefinition;
  unlockedAt: string;
}

// ============================================================
// Stats Calculation Functions
// ============================================================

/**
 * Calculate total number of completed workouts
 */
export async function getTotalWorkouts(): Promise<number> {
  const workouts = await workoutLogsApi.list();
  return workouts.filter((w: WorkoutLog) => w.isComplete).length;
}

/**
 * Calculate total volume lifted (in kg)
 */
export async function getTotalVolume(): Promise<number> {
  const workouts = await workoutLogsApi.list();
  const completedWorkouts = workouts.filter((w: WorkoutLog) => w.isComplete);
  let totalVolume = 0;

  for (const workout of completedWorkouts) {
    for (const set of workout.sets) {
      if (set.isComplete) {
        // Convert lbs to kg if needed
        const weightKg = set.unit === "lbs" ? set.weight * 0.453592 : set.weight;
        totalVolume += weightKg * set.actualReps;
      }
    }
  }

  return Math.round(totalVolume);
}

/**
 * Calculate total number of personal records
 */
export async function getTotalPRs(): Promise<number> {
  const prs = await personalRecordsApi.list();
  return prs.length;
}

/**
 * Calculate current streak (consecutive workout days)
 */
export async function getCurrentStreak(): Promise<number> {
  const workouts = await workoutLogsApi.list();
  const completedWorkouts = workouts.filter((w: WorkoutLog) => w.isComplete);

  if (completedWorkouts.length === 0) return 0;

  // Get unique dates sorted descending
  const dates: string[] = [...new Set(completedWorkouts.map((w: WorkoutLog) => w.date))].sort().reverse();

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Check if streak includes today or yesterday
  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const previous = new Date(dates[i + 1]);
    const diffDays = Math.floor((current.getTime() - previous.getTime()) / 86400000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ============================================================
// Achievement Operations
// ============================================================

/**
 * Get all unlocked achievements
 */
export async function getUnlockedAchievements(): Promise<Achievement[]> {
  return achievementsApi.list();
}

/**
 * Check if a specific achievement is unlocked
 */
export async function isAchievementUnlocked(achievementId: string): Promise<boolean> {
  const achievements = await achievementsApi.list();
  return achievements.some(a => a.achievementId === achievementId);
}

/**
 * Unlock an achievement
 */
export async function unlockAchievement(achievementId: string): Promise<AchievementUnlock | null> {
  // Check if already unlocked
  if (await isAchievementUnlocked(achievementId)) {
    return null;
  }

  const definition = getAchievementById(achievementId);
  if (!definition) {
    console.error(`Achievement not found: ${achievementId}`);
    return null;
  }

  try {
    const achievement = await achievementsApi.unlock(achievementId);

    return {
      achievement: definition,
      unlockedAt: achievement.unlockedAt,
    };
  } catch (error) {
    console.error(`Failed to unlock achievement: ${achievementId}`, error);
    return null;
  }
}

/**
 * Check and unlock achievements based on current stats
 * Returns newly unlocked achievements
 */
export async function checkAchievements(): Promise<AchievementUnlock[]> {
  const newUnlocks: AchievementUnlock[] = [];

  // Get current stats
  const [totalWorkouts, totalVolume, totalPRs, currentStreak] = await Promise.all([
    getTotalWorkouts(),
    getTotalVolume(),
    getTotalPRs(),
    getCurrentStreak(),
  ]);

  // Check each achievement
  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (await isAchievementUnlocked(achievement.id)) {
      continue;
    }

    let shouldUnlock = false;

    switch (achievement.checkType) {
      case "streak":
        shouldUnlock = currentStreak >= achievement.requirement;
        break;
      case "total_workouts":
        shouldUnlock = totalWorkouts >= achievement.requirement;
        break;
      case "total_volume":
        shouldUnlock = totalVolume >= achievement.requirement;
        break;
      case "total_prs":
        shouldUnlock = totalPRs >= achievement.requirement;
        break;
      // Weekly/monthly completion achievements require special handling
      case "weekly_completion":
      case "monthly_completion":
        // These are checked separately with specific logic
        break;
    }

    if (shouldUnlock) {
      const unlock = await unlockAchievement(achievement.id);
      if (unlock) {
        newUnlocks.push(unlock);
      }
    }
  }

  return newUnlocks;
}

/**
 * Get progress for all achievements
 */
export async function getAchievementProgress(): Promise<AchievementProgress[]> {
  const [totalWorkouts, totalVolume, totalPRs, currentStreak, unlockedAchievements] = await Promise.all([
    getTotalWorkouts(),
    getTotalVolume(),
    getTotalPRs(),
    getCurrentStreak(),
    getUnlockedAchievements(),
  ]);

  const unlockedMap = new Map(unlockedAchievements.map(a => [a.achievementId, a.unlockedAt]));

  return ACHIEVEMENTS.map(achievement => {
    let currentValue = 0;

    switch (achievement.checkType) {
      case "streak":
        currentValue = currentStreak;
        break;
      case "total_workouts":
        currentValue = totalWorkouts;
        break;
      case "total_volume":
        currentValue = totalVolume;
        break;
      case "total_prs":
        currentValue = totalPRs;
        break;
      default:
        currentValue = 0;
    }

    const isUnlocked = unlockedMap.has(achievement.id);
    const percentComplete = isUnlocked ? 100 : Math.min(100, Math.round((currentValue / achievement.requirement) * 100));

    return {
      achievement,
      currentValue,
      isUnlocked,
      unlockedAt: unlockedMap.get(achievement.id),
      percentComplete,
    };
  });
}

/**
 * Get the next achievement to unlock for each category
 */
export async function getNextAchievements(): Promise<AchievementProgress[]> {
  const progress = await getAchievementProgress();
  const categories = new Map<string, AchievementProgress>();

  // Find the first non-unlocked achievement in each category
  for (const p of progress) {
    if (!p.isUnlocked && !categories.has(p.achievement.category)) {
      categories.set(p.achievement.category, p);
    }
  }

  return Array.from(categories.values());
}

/**
 * Get achievement stats summary
 */
export async function getAchievementStats(): Promise<{
  totalAchievements: number;
  unlockedCount: number;
  bronzeCount: number;
  silverCount: number;
  goldCount: number;
}> {
  const unlocked = await getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map(a => a.achievementId));

  let bronzeCount = 0;
  let silverCount = 0;
  let goldCount = 0;

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) {
      switch (achievement.tier) {
        case "bronze":
          bronzeCount++;
          break;
        case "silver":
          silverCount++;
          break;
        case "gold":
          goldCount++;
          break;
      }
    }
  }

  return {
    totalAchievements: ACHIEVEMENTS.length,
    unlockedCount: unlocked.length,
    bronzeCount,
    silverCount,
    goldCount,
  };
}
