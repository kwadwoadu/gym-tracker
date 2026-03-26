/**
 * Consistency Scoring Engine for SetFlow
 * Calculates weekly adherence, rolling averages, and streak tracking.
 * 100% on-device - no API calls needed.
 */

export interface ConsistencyScore {
  /** Current score 0-100 */
  score: number;
  /** Trend direction */
  trend: "improving" | "declining" | "stable";
  /** Current week stats */
  currentWeek: {
    workoutsDone: number;
    workoutsPlanned: number;
    adherencePercent: number;
  };
  /** 4-week rolling data */
  weeklyHistory: Array<{
    weekStart: string;
    workoutsDone: number;
    workoutsPlanned: number;
    adherencePercent: number;
  }>;
  /** Consecutive weeks meeting target */
  streakWeeks: number;
  /** Rolling 4-week average adherence */
  rollingAverage: number;
}

/** Number of weeks for rolling average */
const ROLLING_WEEKS = 4;

/** Threshold for "meeting target": adherence >= this % */
const TARGET_THRESHOLD = 0.75; // 75%

/** How many weeks back to analyze */
const MAX_WEEKS_BACK = 8;

/**
 * Get the Monday of a given date's week (ISO week start)
 */
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Calculate consistency score from workout logs
 *
 * @param workoutLogs - All completed workout logs
 * @param plannedDaysPerWeek - Number of training days in the program
 * @returns ConsistencyScore or null if no data
 */
export function calculateConsistencyScore(
  workoutLogs: Array<{
    date: string;
    isComplete: boolean;
  }>,
  plannedDaysPerWeek: number
): ConsistencyScore | null {
  if (plannedDaysPerWeek <= 0) return null;

  const completedLogs = workoutLogs.filter((l) => l.isComplete);
  if (completedLogs.length === 0) return null;

  const now = new Date();
  const currentMonday = getMondayOfWeek(now);

  // Pre-build a Map of week-start to unique workout dates in a single pass (O(L))
  const workoutDatesByWeek = new Map<string, Set<string>>();
  for (const log of completedLogs) {
    const logDate = new Date(log.date);
    const weekStart = getMondayOfWeek(logDate);
    const key = formatDate(weekStart);
    if (!workoutDatesByWeek.has(key)) workoutDatesByWeek.set(key, new Set());
    workoutDatesByWeek.get(key)!.add(log.date.slice(0, 10));
  }

  // Build weekly history for the last MAX_WEEKS_BACK weeks using the pre-built Map
  const weeklyHistory: Array<{
    weekStart: string;
    workoutsDone: number;
    workoutsPlanned: number;
    adherencePercent: number;
  }> = [];

  for (let i = 0; i < MAX_WEEKS_BACK; i++) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekStartStr = formatDate(weekStart);

    const daysWorkedOut = workoutDatesByWeek.get(weekStartStr);
    const workoutsDone = daysWorkedOut ? daysWorkedOut.size : 0;
    const adherencePercent =
      plannedDaysPerWeek > 0
        ? Math.min(100, Math.round((workoutsDone / plannedDaysPerWeek) * 100))
        : 0;

    weeklyHistory.push({
      weekStart: weekStartStr,
      workoutsDone,
      workoutsPlanned: plannedDaysPerWeek,
      adherencePercent,
    });
  }

  // weeklyHistory[0] = current week, [1] = last week, etc.
  const currentWeek = weeklyHistory[0];

  // 4-week rolling average (using weeks 0-3)
  const recentWeeks = weeklyHistory.slice(0, ROLLING_WEEKS);
  const rollingAverage =
    recentWeeks.length > 0
      ? Math.round(
          recentWeeks.reduce((sum, w) => sum + w.adherencePercent, 0) /
            recentWeeks.length
        )
      : 0;

  // Calculate streak (consecutive weeks meeting target, going backwards from last complete week)
  let streakWeeks = 0;
  // Start from week 1 (last complete week) since current week is in progress
  for (let i = 1; i < weeklyHistory.length; i++) {
    const w = weeklyHistory[i];
    if (w.workoutsDone / w.workoutsPlanned >= TARGET_THRESHOLD) {
      streakWeeks++;
    } else {
      break;
    }
  }

  // Also check if current week is on track
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon, 7=Sun
  const expectedByNow = Math.floor(
    (dayOfWeek / 7) * plannedDaysPerWeek
  );
  const currentWeekOnTrack =
    currentWeek.workoutsDone >= Math.max(1, expectedByNow);

  // Determine trend by comparing last 2 weeks vs prior 2 weeks
  const recent2 = weeklyHistory.slice(1, 3);
  const prior2 = weeklyHistory.slice(3, 5);

  let trend: "improving" | "declining" | "stable" = "stable";
  if (recent2.length >= 2 && prior2.length >= 2) {
    const recentAvg =
      recent2.reduce((s, w) => s + w.adherencePercent, 0) / recent2.length;
    const priorAvg =
      prior2.reduce((s, w) => s + w.adherencePercent, 0) / prior2.length;
    const diff = recentAvg - priorAvg;
    if (diff > 10) trend = "improving";
    else if (diff < -10) trend = "declining";
  }

  // Overall score: weighted combination of rolling average and streak bonus
  const baseScore = rollingAverage;
  const streakBonus = Math.min(10, streakWeeks * 2); // Up to 10 bonus points
  const currentWeekBonus = currentWeekOnTrack ? 5 : 0;
  const score = Math.min(100, Math.round(baseScore + streakBonus + currentWeekBonus));

  return {
    score,
    trend,
    currentWeek: {
      workoutsDone: currentWeek.workoutsDone,
      workoutsPlanned: currentWeek.workoutsPlanned,
      adherencePercent: currentWeek.adherencePercent,
    },
    weeklyHistory: weeklyHistory.slice(0, ROLLING_WEEKS).reverse(), // oldest first for sparkline
    streakWeeks,
    rollingAverage,
  };
}
