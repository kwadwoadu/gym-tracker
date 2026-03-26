/**
 * Deload Detection Engine for SetFlow
 * Detects when a user needs a deload week based on:
 * - Consecutive weeks of training (4+ weeks)
 * - RPE trending above 9 for 2+ sessions
 * - Performance declining (fewer reps at same weight)
 * 100% on-device - no API calls needed.
 */

export interface DeloadRecommendation {
  needed: boolean;
  severity: "none" | "mild" | "moderate" | "severe";
  reasons: string[];
  /** Suggested deload protocol */
  protocol: {
    intensityReduction: number; // percentage to reduce weight (e.g., 40 = drop 40%)
    volumeReduction: number; // percentage to reduce sets (e.g., 40 = drop 40%)
    durationWeeks: number;
    description: string;
  };
  /** Stats that triggered the recommendation */
  signals: {
    consecutiveWeeks: number;
    avgRecentRPE: number | null;
    highRPESessions: number;
    performanceDeclining: boolean;
  };
}

/** Minimum weeks of training before deload is considered */
const MIN_TRAINING_WEEKS = 4;

/** RPE threshold for "high RPE" */
const HIGH_RPE_THRESHOLD = 9;

/** Number of high-RPE sessions to trigger concern */
const HIGH_RPE_SESSION_THRESHOLD = 2;

/** Minimum sessions to analyze for RPE trends */
const MIN_SESSIONS_FOR_RPE = 3;

/**
 * Get the Monday of a date's week
 */
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Detect if the user needs a deload week
 */
export function detectDeloadNeed(
  workoutLogs: Array<{
    date: string;
    isComplete: boolean;
    sets: Array<{
      exerciseId: string;
      weight: number;
      actualReps: number;
      targetReps: number;
      rpe?: number;
      isComplete: boolean;
    }>;
  }>
): DeloadRecommendation {
  const completedLogs = workoutLogs
    .filter((l) => l.isComplete)
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first

  const defaultResult: DeloadRecommendation = {
    needed: false,
    severity: "none",
    reasons: [],
    protocol: {
      intensityReduction: 0,
      volumeReduction: 0,
      durationWeeks: 0,
      description: "No deload needed. Keep training!",
    },
    signals: {
      consecutiveWeeks: 0,
      avgRecentRPE: null,
      highRPESessions: 0,
      performanceDeclining: false,
    },
  };

  if (completedLogs.length < MIN_SESSIONS_FOR_RPE) return defaultResult;

  // Signal 1: Count consecutive training weeks
  const trainingWeeks = new Set<string>();
  for (const log of completedLogs) {
    const monday = getMondayOfWeek(new Date(log.date));
    trainingWeeks.add(monday.toISOString().split("T")[0]);
  }

  // Sort weeks and count consecutive from most recent
  const sortedWeeks = Array.from(trainingWeeks).sort((a, b) =>
    b.localeCompare(a)
  );
  let consecutiveWeeks = 0;
  const now = new Date();
  const currentMonday = getMondayOfWeek(now);

  for (let i = 0; i < sortedWeeks.length; i++) {
    const expectedMonday = new Date(currentMonday);
    expectedMonday.setDate(expectedMonday.getDate() - i * 7);
    const expectedStr = expectedMonday.toISOString().split("T")[0];

    if (sortedWeeks[i] === expectedStr) {
      consecutiveWeeks++;
    } else {
      break;
    }
  }

  // Signal 2: RPE trending high
  const recentSessions = completedLogs.slice(0, 6);
  const sessionsWithRPE: Array<{ date: string; avgRPE: number }> = [];

  for (const log of recentSessions) {
    const setsWithRPE = log.sets.filter(
      (s) => s.isComplete && s.rpe !== undefined && s.rpe > 0
    );
    if (setsWithRPE.length > 0) {
      const avgRPE =
        setsWithRPE.reduce((sum, s) => sum + (s.rpe ?? 0), 0) /
        setsWithRPE.length;
      sessionsWithRPE.push({ date: log.date, avgRPE });
    }
  }

  const avgRecentRPE =
    sessionsWithRPE.length > 0
      ? Math.round(
          (sessionsWithRPE.reduce((sum, s) => sum + s.avgRPE, 0) /
            sessionsWithRPE.length) *
            10
        ) / 10
      : null;

  const highRPESessions = sessionsWithRPE.filter(
    (s) => s.avgRPE >= HIGH_RPE_THRESHOLD
  ).length;

  // Signal 3: Performance declining (same weight, fewer reps over recent sessions)
  let performanceDeclining = false;
  if (completedLogs.length >= 3) {
    // Group by exercise and check if reps are declining at same weight
    const exercisePerformance = new Map<
      string,
      Array<{ date: string; weight: number; reps: number }>
    >();

    for (const log of completedLogs.slice(0, 6)) {
      for (const set of log.sets) {
        if (!set.isComplete || set.weight <= 0) continue;
        const entries = exercisePerformance.get(set.exerciseId) ?? [];
        entries.push({
          date: log.date,
          weight: set.weight,
          reps: set.actualReps,
        });
        exercisePerformance.set(set.exerciseId, entries);
      }
    }

    // Check each exercise for declining reps at same weight
    let decliningCount = 0;
    let checkedCount = 0;

    for (const [, entries] of exercisePerformance) {
      if (entries.length < 3) continue;

      // Sort by date ascending
      const sorted = [...entries].sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      // Group by weight and check rep trend
      const byWeight = new Map<number, number[]>();
      for (const e of sorted) {
        const reps = byWeight.get(e.weight) ?? [];
        reps.push(e.reps);
        byWeight.set(e.weight, reps);
      }

      for (const [, reps] of byWeight) {
        if (reps.length >= 2) {
          checkedCount++;
          // If last entry has fewer reps than earlier entries
          if (reps[reps.length - 1] < reps[0]) {
            decliningCount++;
          }
        }
      }
    }

    // If more than half of checked exercises show declining reps
    if (checkedCount > 0 && decliningCount / checkedCount > 0.5) {
      performanceDeclining = true;
    }
  }

  // Build recommendation
  const reasons: string[] = [];
  let severityScore = 0;

  if (consecutiveWeeks >= MIN_TRAINING_WEEKS) {
    reasons.push(
      `${consecutiveWeeks} consecutive weeks of training without a deload`
    );
    severityScore += consecutiveWeeks >= 6 ? 2 : 1;
  }

  if (highRPESessions >= HIGH_RPE_SESSION_THRESHOLD) {
    reasons.push(
      `RPE averaging ${avgRecentRPE} across recent sessions (${highRPESessions} sessions at RPE 9+)`
    );
    severityScore += highRPESessions >= 3 ? 2 : 1;
  }

  if (performanceDeclining) {
    reasons.push(
      "Performance declining - fewer reps at the same weight across multiple exercises"
    );
    severityScore += 2;
  }

  const needed = severityScore >= 2;
  let severity: DeloadRecommendation["severity"] = "none";
  if (severityScore >= 5) severity = "severe";
  else if (severityScore >= 3) severity = "moderate";
  else if (severityScore >= 2) severity = "mild";

  // Build protocol based on severity
  let protocol: DeloadRecommendation["protocol"];
  switch (severity) {
    case "severe":
      protocol = {
        intensityReduction: 40,
        volumeReduction: 50,
        durationWeeks: 1,
        description:
          "Drop all working weights to 60% and reduce total sets by half for 1 week. Focus on movement quality and recovery.",
      };
      break;
    case "moderate":
      protocol = {
        intensityReduction: 30,
        volumeReduction: 40,
        durationWeeks: 1,
        description:
          "Drop working weights to 70% and reduce sets by 40% for 1 week. Maintain training frequency.",
      };
      break;
    case "mild":
      protocol = {
        intensityReduction: 20,
        volumeReduction: 25,
        durationWeeks: 1,
        description:
          "Drop working weights to 80% and reduce sets by 25% for 1 week. Keep intensity moderate.",
      };
      break;
    default:
      protocol = {
        intensityReduction: 0,
        volumeReduction: 0,
        durationWeeks: 0,
        description: "No deload needed. Keep training!",
      };
  }

  return {
    needed,
    severity,
    reasons,
    protocol,
    signals: {
      consecutiveWeeks,
      avgRecentRPE: avgRecentRPE,
      highRPESessions,
      performanceDeclining,
    },
  };
}
