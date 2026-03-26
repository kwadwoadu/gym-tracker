/**
 * Weight recommendation engine for SetFlow
 * Recommends the next weight for an exercise based on recent performance history.
 * Pure logic - no API calls needed.
 */

export interface PerformanceEntry {
  date: string;
  weight: number;
  reps: number;
  rpe?: number;
  targetReps?: number;
}

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface WeightRecommendation {
  /** Recommended weight in kg */
  recommendedWeight: number;
  /** Reason for the recommendation */
  reason: string;
  /** Confidence: how sure we are (0-1) */
  confidence: number;
  /** The progression rule that was applied */
  rule: "progressive_overload" | "maintain" | "deload" | "rpe_adjust" | "first_session";
}

// --- Constants ---

/** Beginner increment per session (kg) */
const BEGINNER_INCREMENT = 2.5;
/** Intermediate increment as percentage of current weight */
const INTERMEDIATE_INCREMENT_PCT = 0.02; // 2%
/** Advanced increment as percentage of current weight */
const ADVANCED_INCREMENT_PCT = 0.01; // 1%
/** Minimum weight increment (kg) - must be achievable with micro-plates */
const MIN_INCREMENT_KG = 1.25;
/** RPE threshold: below this, user has room to increase */
const RPE_LOW_THRESHOLD = 7;
/** RPE threshold: above this, user may need to maintain or reduce */
const RPE_HIGH_THRESHOLD = 9;
/** Target RPE range for productive training */
const RPE_TARGET_MIN = 7;
const RPE_TARGET_MAX = 8.5;

/**
 * Recommend weight for the next set based on recent performance.
 *
 * @param history - Recent performance entries for this exercise (any order, sorted internally)
 * @param level - User's experience level
 * @param isCompound - Whether this is a compound or isolation lift
 * @returns WeightRecommendation or null if no history
 */
export function recommendWeight(
  history: PerformanceEntry[],
  level: ExperienceLevel = "intermediate",
  isCompound: boolean = true
): WeightRecommendation | null {
  if (history.length === 0) {
    return null;
  }

  // Sort by date descending (newest first)
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latest = sorted[0];
  const previous = sorted.length > 1 ? sorted[1] : null;

  // If only one session, suggest maintaining weight
  if (!previous) {
    return {
      recommendedWeight: latest.weight,
      reason: `First tracked session at ${latest.weight}kg. Complete another session to get a progression recommendation.`,
      confidence: 0.5,
      rule: "first_session",
    };
  }

  // Calculate the appropriate increment
  const increment = calculateIncrement(latest.weight, level, isCompound);

  // Check RPE trend if available
  const rpeAnalysis = analyzeRPETrend(sorted);

  // Decision logic
  if (rpeAnalysis) {
    return applyRPEBasedRecommendation(latest, increment, rpeAnalysis);
  }

  // Fallback: rep-based progression
  return applyRepBasedRecommendation(latest, previous, increment);
}

/**
 * Calculate the weight increment based on experience level and current weight.
 */
function calculateIncrement(
  currentWeight: number,
  level: ExperienceLevel,
  isCompound: boolean
): number {
  let rawIncrement: number;

  switch (level) {
    case "beginner":
      rawIncrement = BEGINNER_INCREMENT;
      break;
    case "intermediate":
      rawIncrement = currentWeight * INTERMEDIATE_INCREMENT_PCT;
      break;
    case "advanced":
      rawIncrement = currentWeight * ADVANCED_INCREMENT_PCT;
      break;
  }

  // For isolation exercises, use smaller increments
  if (!isCompound) {
    rawIncrement = rawIncrement * 0.5;
  }

  // Round to nearest 1.25kg (smallest common plate)
  const rounded = Math.round(rawIncrement / MIN_INCREMENT_KG) * MIN_INCREMENT_KG;
  return Math.max(MIN_INCREMENT_KG, rounded);
}

interface RPEAnalysis {
  avgRPE: number;
  trend: "decreasing" | "stable" | "increasing";
  hasData: boolean;
  dataPoints: number;
}

/**
 * Analyze RPE trend across recent sessions.
 */
function analyzeRPETrend(sessions: PerformanceEntry[]): RPEAnalysis | null {
  const withRPE = sessions.filter((s) => s.rpe !== undefined).slice(0, 5);
  if (withRPE.length < 2) return null;

  const avgRPE =
    withRPE.reduce((sum, s) => sum + (s.rpe ?? 0), 0) / withRPE.length;

  // Compare first half vs second half to determine trend
  // Note: sessions are sorted newest first, so first half = recent
  const mid = Math.floor(withRPE.length / 2);
  const recentAvg =
    withRPE.slice(0, mid).reduce((sum, s) => sum + (s.rpe ?? 0), 0) / mid;
  const olderAvg =
    withRPE.slice(mid).reduce((sum, s) => sum + (s.rpe ?? 0), 0) /
    (withRPE.length - mid);

  let trend: "decreasing" | "stable" | "increasing" = "stable";
  if (recentAvg - olderAvg > 0.5) trend = "increasing";
  if (olderAvg - recentAvg > 0.5) trend = "decreasing";

  return {
    avgRPE,
    trend,
    hasData: true,
    dataPoints: withRPE.length,
  };
}

/**
 * Apply RPE-based weight recommendation logic.
 */
function applyRPEBasedRecommendation(
  latest: PerformanceEntry,
  increment: number,
  rpe: RPEAnalysis
): WeightRecommendation {
  // Low RPE + hit target reps = increase weight
  if (rpe.avgRPE < RPE_LOW_THRESHOLD && latest.reps >= (latest.targetReps ?? 0)) {
    const newWeight = roundToPlate(latest.weight + increment);
    return {
      recommendedWeight: newWeight,
      reason: `RPE averaging ${rpe.avgRPE.toFixed(1)} - you have room to grow. Try ${newWeight}kg (+${increment}kg).`,
      confidence: 0.85,
      rule: "progressive_overload",
    };
  }

  // RPE in target range = maintain or small increase
  if (rpe.avgRPE >= RPE_TARGET_MIN && rpe.avgRPE <= RPE_TARGET_MAX) {
    // If RPE is trending down, suggest increase
    if (rpe.trend === "decreasing") {
      const newWeight = roundToPlate(latest.weight + increment);
      return {
        recommendedWeight: newWeight,
        reason: `RPE trending down (avg ${rpe.avgRPE.toFixed(1)}) - adapting well. Step up to ${newWeight}kg.`,
        confidence: 0.75,
        rule: "progressive_overload",
      };
    }

    // Otherwise maintain
    return {
      recommendedWeight: latest.weight,
      reason: `RPE ${rpe.avgRPE.toFixed(1)} is in the productive zone (${RPE_TARGET_MIN}-${RPE_TARGET_MAX}). Maintain ${latest.weight}kg and focus on rep quality.`,
      confidence: 0.8,
      rule: "maintain",
    };
  }

  // High RPE = consider reducing or maintaining
  if (rpe.avgRPE > RPE_HIGH_THRESHOLD) {
    if (rpe.trend === "increasing") {
      // Fatigue accumulating - suggest deload
      const deloadWeight = roundToPlate(latest.weight * 0.9);
      return {
        recommendedWeight: deloadWeight,
        reason: `RPE climbing to ${rpe.avgRPE.toFixed(1)} - fatigue accumulating. Drop to ${deloadWeight}kg (90%) for recovery.`,
        confidence: 0.7,
        rule: "deload",
      };
    }

    return {
      recommendedWeight: latest.weight,
      reason: `RPE ${rpe.avgRPE.toFixed(1)} is high. Stay at ${latest.weight}kg until RPE drops below ${RPE_HIGH_THRESHOLD}.`,
      confidence: 0.75,
      rule: "rpe_adjust",
    };
  }

  // Default: maintain
  return {
    recommendedWeight: latest.weight,
    reason: `Maintain ${latest.weight}kg based on current RPE trends.`,
    confidence: 0.6,
    rule: "maintain",
  };
}

/**
 * Apply rep-based weight recommendation when RPE data is insufficient.
 */
function applyRepBasedRecommendation(
  latest: PerformanceEntry,
  previous: PerformanceEntry,
  increment: number
): WeightRecommendation {
  const targetReps = latest.targetReps ?? latest.reps;
  const hitTarget = latest.reps >= targetReps;
  const progressedFromLast =
    latest.weight > previous.weight || latest.reps > previous.reps;

  // Hit target reps at same weight = time to increase
  if (hitTarget) {
    const newWeight = roundToPlate(latest.weight + increment);
    return {
      recommendedWeight: newWeight,
      reason: `Hit ${latest.reps} reps at ${latest.weight}kg. Progress to ${newWeight}kg.`,
      confidence: 0.7,
      rule: "progressive_overload",
    };
  }

  // Didn't hit target but still progressing
  if (progressedFromLast) {
    return {
      recommendedWeight: latest.weight,
      reason: `Still progressing (${previous.reps} -> ${latest.reps} reps). Stay at ${latest.weight}kg and push for ${targetReps} reps.`,
      confidence: 0.65,
      rule: "maintain",
    };
  }

  // No progress - maintain
  return {
    recommendedWeight: latest.weight,
    reason: `Maintain ${latest.weight}kg. Focus on reaching ${targetReps} reps before adding weight.`,
    confidence: 0.6,
    rule: "maintain",
  };
}

/**
 * Round weight to nearest plate increment (1.25kg).
 */
function roundToPlate(weight: number): number {
  return Math.round(weight / MIN_INCREMENT_KG) * MIN_INCREMENT_KG;
}

/**
 * Convenience: build PerformanceEntry list from workout log data for a specific exercise.
 */
export function buildPerformanceHistory(
  workoutLogs: Array<{
    date: string;
    sets: Array<{
      exerciseId: string;
      weight: number;
      actualReps: number;
      targetReps?: number;
      rpe?: number;
    }>;
  }>,
  exerciseId: string
): PerformanceEntry[] {
  const entries: PerformanceEntry[] = [];

  for (const log of workoutLogs) {
    const exerciseSets = log.sets.filter((s) => s.exerciseId === exerciseId);
    if (exerciseSets.length === 0) continue;

    // Use the heaviest working set as the reference
    const bestSet = exerciseSets.reduce((best, s) =>
      s.weight > best.weight ? s : best
    );

    entries.push({
      date: log.date,
      weight: bestSet.weight,
      reps: bestSet.actualReps,
      rpe: bestSet.rpe,
      targetReps: bestSet.targetReps,
    });
  }

  return entries;
}
