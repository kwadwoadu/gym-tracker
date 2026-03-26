/**
 * Plateau detection engine for SetFlow
 * Analyzes recent workout logs for an exercise and detects performance stalls.
 * Pure logic - no API calls needed.
 */

export interface SessionSummary {
  date: string;
  weight: number;
  reps: number;
  sets: number;
  rpe?: number;
  volume: number; // weight * reps * sets
}

export type PlateauSuggestionType =
  | "increase_weight"
  | "change_rep_range"
  | "swap_exercise"
  | "deload"
  | "tempo_variation"
  | "add_backoff_set";

export interface PlateauSuggestion {
  type: PlateauSuggestionType;
  title: string;
  description: string;
  priority: number; // 1 = highest
}

export interface PlateauResult {
  isPlateau: boolean;
  /** Number of consecutive stalled sessions */
  stalledSessions: number;
  /** The stalled weight (kg) */
  weight: number;
  /** The stalled rep count */
  reps: number;
  /** Evidence-based suggestions ordered by priority */
  suggestions: PlateauSuggestion[];
}

// --- Constants ---

/** Minimum sessions for compound lift plateau detection */
const COMPOUND_MIN_SESSIONS = 3;
/** Minimum sessions for isolation lift plateau detection */
const ISOLATION_MIN_SESSIONS = 3;
/** Rep tolerance: reps within this range count as "same" */
const REP_TOLERANCE = 1;
/** Weight tolerance in kg: weights within this range count as "same" */
const WEIGHT_TOLERANCE_KG = 0;
/** Sessions threshold for a severe stall (triggers deload suggestion) */
const SEVERE_STALL_SESSIONS = 5;

/**
 * Detect if an exercise is in a plateau based on recent session history.
 *
 * A plateau is defined as: same weight AND same/fewer reps
 * for 3+ consecutive sessions (both compound and isolation).
 *
 * @param sessions - Recent session summaries, newest first or oldest first (sorted internally)
 * @param isCompound - Whether this is a compound lift (affects suggestion priority)
 * @returns PlateauResult or null if insufficient data
 */
export function detectPlateau(
  sessions: SessionSummary[],
  isCompound: boolean = true
): PlateauResult | null {
  const minSessions = isCompound ? COMPOUND_MIN_SESSIONS : ISOLATION_MIN_SESSIONS;

  if (sessions.length < minSessions) {
    return null;
  }

  // Sort by date descending (newest first) for analysis
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Take the most recent session as the reference point
  const reference = sorted[0];
  let stalledCount = 1;

  // Count consecutive sessions with same weight and same/fewer reps
  for (let i = 1; i < sorted.length; i++) {
    const session = sorted[i];
    const sameWeight =
      Math.abs(session.weight - reference.weight) <= WEIGHT_TOLERANCE_KG;
    const sameOrFewerReps =
      Math.abs(session.reps - reference.reps) <= REP_TOLERANCE;

    if (sameWeight && sameOrFewerReps) {
      stalledCount++;
    } else {
      break;
    }
  }

  if (stalledCount < minSessions) {
    return null;
  }

  // Build suggestions based on stall severity
  const suggestions = buildSuggestions(
    reference.weight,
    reference.reps,
    stalledCount,
    isCompound
  );

  return {
    isPlateau: true,
    stalledSessions: stalledCount,
    weight: reference.weight,
    reps: reference.reps,
    suggestions,
  };
}

/**
 * Build prioritized suggestions based on plateau characteristics.
 */
function buildSuggestions(
  weight: number,
  reps: number,
  stalledSessions: number,
  isCompound: boolean
): PlateauSuggestion[] {
  const suggestions: PlateauSuggestion[] = [];

  // For severe stalls (5+ sessions), prioritize deload
  if (stalledSessions >= SEVERE_STALL_SESSIONS) {
    suggestions.push({
      type: "deload",
      title: "Take a deload week",
      description: `${stalledSessions} sessions at ${weight}kg. Drop to ${Math.round(weight * 0.6 * 2) / 2}kg (60%) for 1 week, then rebuild.`,
      priority: 1,
    });
  }

  // Micro-progression: try a smaller weight increase
  const microStep = isCompound ? 1.25 : 1.25;
  suggestions.push({
    type: "increase_weight",
    title: `Try +${microStep}kg micro-load`,
    description: `Instead of jumping to the next full plate, try ${weight + microStep}kg. Small jumps break stalls.`,
    priority: stalledSessions >= SEVERE_STALL_SESSIONS ? 2 : 1,
  });

  // Rep range change
  if (reps >= 8) {
    suggestions.push({
      type: "change_rep_range",
      title: "Lower reps, add weight",
      description: `Switch from ${reps} reps to 5-6 reps at ${Math.round(weight * 1.1 * 2) / 2}kg for 2-3 weeks to build strength.`,
      priority: 2,
    });
  } else {
    suggestions.push({
      type: "change_rep_range",
      title: "Higher reps, lighter weight",
      description: `Switch to ${reps + 4}-${reps + 6} reps at ${Math.round(weight * 0.85 * 2) / 2}kg for 2-3 weeks to build volume base.`,
      priority: 2,
    });
  }

  // Tempo variation (more effective for compounds)
  if (isCompound) {
    suggestions.push({
      type: "tempo_variation",
      title: "Add paused reps",
      description: `Try 2-second pauses at the bottom of each rep at ${Math.round(weight * 0.9 * 2) / 2}kg. Builds strength at the sticking point.`,
      priority: 3,
    });
  }

  // Back-off set
  suggestions.push({
    type: "add_backoff_set",
    title: "Add a back-off set",
    description: `After your working sets, do 1 set at ${Math.round(weight * 0.8 * 2) / 2}kg for max reps. Extra volume drives adaptation.`,
    priority: 3,
  });

  // Exercise swap (always an option)
  suggestions.push({
    type: "swap_exercise",
    title: "Swap to a variation",
    description: isCompound
      ? "Switch to a close variation for 3-4 weeks, then return. Fresh stimulus often breaks plateaus."
      : "Try a different isolation angle or machine for the same muscle group for 3 weeks.",
    priority: 4,
  });

  return suggestions.sort((a, b) => a.priority - b.priority);
}

/**
 * Convenience function to build SessionSummary entries from workout log data.
 * Filters sets for a specific exercise and groups by workout date.
 */
export function buildSessionSummaries(
  workoutLogs: Array<{
    date: string;
    sets: Array<{
      exerciseId: string;
      weight: number;
      actualReps: number;
      rpe?: number;
    }>;
  }>,
  exerciseId: string
): SessionSummary[] {
  const summaries: SessionSummary[] = [];

  for (const log of workoutLogs) {
    const exerciseSets = log.sets.filter((s) => s.exerciseId === exerciseId);
    if (exerciseSets.length === 0) continue;

    // Use the heaviest set's weight as the reference weight
    const maxWeight = Math.max(...exerciseSets.map((s) => s.weight));
    const heavySets = exerciseSets.filter((s) => s.weight === maxWeight);
    const avgReps =
      Math.round(
        heavySets.reduce((sum, s) => sum + s.actualReps, 0) / heavySets.length
      );
    const avgRpe =
      heavySets.filter((s) => s.rpe !== undefined).length > 0
        ? heavySets.reduce((sum, s) => sum + (s.rpe ?? 0), 0) /
          heavySets.filter((s) => s.rpe !== undefined).length
        : undefined;
    const totalVolume = exerciseSets.reduce(
      (sum, s) => sum + s.weight * s.actualReps,
      0
    );

    summaries.push({
      date: log.date,
      weight: maxWeight,
      reps: avgReps,
      sets: exerciseSets.length,
      rpe: avgRpe,
      volume: totalVolume,
    });
  }

  return summaries;
}
