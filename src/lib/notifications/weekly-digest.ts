import db, { calculateTotalVolume, getWorkoutStreak } from "@/lib/db";
import type { QueuedNotification } from "./scheduler";
import { queueNotification } from "./scheduler";
import { getNotificationPreferences } from "./preferences";
import { isQuietHours } from "./scheduler";

// ============================================================
// Types
// ============================================================

export interface WeeklyDigest {
  workoutCount: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  newPRs: number;
  streakDays: number;
  topExercise: { name: string; volume: number } | null;
  comparedToLastWeek: {
    workouts: number;
    volume: number;
  };
}

// ============================================================
// Week Range Helpers
// ============================================================

/**
 * Get the Monday-to-Sunday date range for a given week offset.
 * offset=0 is the current week, offset=-1 is last week, etc.
 */
function getWeekRange(offset: number = 0): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday + offset * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
}

// ============================================================
// Digest Generation
// ============================================================

/**
 * Generate the weekly digest data for the current week.
 * Compiles workouts completed, total volume, PRs hit, streak status,
 * and compares against the previous week.
 */
export async function generateWeeklyDigest(): Promise<WeeklyDigest> {
  const thisWeek = getWeekRange(0);
  const lastWeek = getWeekRange(-1);

  // Get all completed workout logs
  const allLogs = await db.workoutLogs
    .filter((log) => log.isComplete)
    .toArray();

  const thisWeekLogs = allLogs.filter(
    (log) => log.date >= thisWeek.start && log.date <= thisWeek.end
  );

  const lastWeekLogs = allLogs.filter(
    (log) => log.date >= lastWeek.start && log.date <= lastWeek.end
  );

  // This week stats
  const thisWeekVolume = thisWeekLogs.reduce(
    (total, log) => total + calculateTotalVolume(log.sets),
    0
  );

  const lastWeekVolume = lastWeekLogs.reduce(
    (total, log) => total + calculateTotalVolume(log.sets),
    0
  );

  const totalSets = thisWeekLogs.reduce(
    (total, log) => total + log.sets.filter((s) => s.isComplete).length,
    0
  );

  const totalReps = thisWeekLogs.reduce(
    (total, log) =>
      total +
      log.sets
        .filter((s) => s.isComplete)
        .reduce((sum, s) => sum + s.actualReps, 0),
    0
  );

  // Count PRs hit this week
  const allPRs = await db.personalRecords.toArray();
  const thisWeekPRs = allPRs.filter(
    (pr) => pr.date >= thisWeek.start && pr.date <= thisWeek.end
  );

  // Find top exercise by volume
  const exerciseVolumes = new Map<string, { name: string; volume: number }>();
  for (const log of thisWeekLogs) {
    for (const set of log.sets) {
      if (!set.isComplete) continue;
      const existing = exerciseVolumes.get(set.exerciseId);
      const setVolume = set.weight * set.actualReps;
      if (existing) {
        existing.volume += setVolume;
      } else {
        exerciseVolumes.set(set.exerciseId, {
          name: set.exerciseName,
          volume: setVolume,
        });
      }
    }
  }

  const topExercise =
    [...exerciseVolumes.values()].sort((a, b) => b.volume - a.volume)[0] ||
    null;

  // Current streak
  const streakData = await getWorkoutStreak();

  return {
    workoutCount: thisWeekLogs.length,
    totalVolume: Math.round(thisWeekVolume),
    totalSets,
    totalReps,
    newPRs: thisWeekPRs.length,
    streakDays: streakData.currentStreak,
    topExercise,
    comparedToLastWeek: {
      workouts: thisWeekLogs.length - lastWeekLogs.length,
      volume: Math.round(thisWeekVolume - lastWeekVolume),
    },
  };
}

// ============================================================
// Digest Formatting
// ============================================================

export function formatVolumeString(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}t`;
  }
  return `${volume}kg`;
}

export function formatDigestMessage(digest: WeeklyDigest): string {
  const volumeStr = formatVolumeString(digest.totalVolume);
  let message = `${digest.workoutCount} workouts | ${volumeStr} volume`;

  if (digest.newPRs > 0) {
    message += ` | ${digest.newPRs} PR${digest.newPRs > 1 ? "s" : ""}`;
  }

  return message;
}

// ============================================================
// Queue Weekly Digest Notification
// ============================================================

/**
 * Generate and queue a weekly digest notification.
 * Should be called once per week (e.g., Sunday evening).
 */
export async function checkAndQueueWeeklyDigest(): Promise<QueuedNotification | null> {
  const prefs = await getNotificationPreferences();
  if (!prefs.weeklyDigestPush) return null;

  // Respect quiet hours
  if (isQuietHours(prefs.quietStart, prefs.quietEnd)) return null;

  const digest = await generateWeeklyDigest();

  // Build notification body
  const body =
    digest.workoutCount === 0
      ? "No workouts logged this week. Let's get back on track!"
      : formatDigestMessage(digest);

  const title =
    digest.workoutCount === 0
      ? "Weekly Check-in"
      : "Your Week in Review";

  return queueNotification({
    type: "weekly_digest",
    title,
    body,
    url: "/stats",
    data: {
      workoutCount: digest.workoutCount,
      totalVolume: digest.totalVolume,
      newPRs: digest.newPRs,
      streakDays: digest.streakDays,
      comparedToLastWeek: digest.comparedToLastWeek,
    },
  });
}
