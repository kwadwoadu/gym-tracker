/**
 * Tier 1 copilot rules - on-device, no API call needed.
 * Analyzes sets as they're logged and provides instant coaching cues.
 */

export type CopilotSuggestionType = "weight" | "rest" | "fatigue" | "quality" | "plateau" | "substitution";

export interface CopilotSuggestion {
  id: string;
  type: CopilotSuggestionType;
  title: string;
  message: string;
  action?: {
    label: string;
    value: number | string;
  };
  priority: number; // 1 = highest
  timestamp: number;
}

interface SetData {
  weight: number;
  actualReps: number;
  rpe?: number;
  restSeconds?: number;
}

/**
 * Analyze completed sets for an exercise and return suggestions.
 */
export function analyzeSetPerformance(
  exerciseName: string,
  completedSets: SetData[],
  targetReps: number,
  targetSets: number,
  lastSessionWeight?: number
): CopilotSuggestion[] {
  const suggestions: CopilotSuggestion[] = [];
  if (completedSets.length === 0) return suggestions;

  const latest = completedSets[completedSets.length - 1];
  const now = Date.now();

  // 1. RPE trend - suggest weight increase if consistently low
  if (completedSets.length >= 2) {
    const recentRPEs = completedSets.slice(-3).map((s) => s.rpe).filter((r): r is number => r !== undefined);
    if (recentRPEs.length >= 2) {
      const avgRPE = recentRPEs.reduce((a, b) => a + b, 0) / recentRPEs.length;
      if (avgRPE <= 6.5 && latest.actualReps >= targetReps) {
        suggestions.push({
          id: `weight-${now}`,
          type: "weight",
          title: "Weight suggestion",
          message: `RPE averaging ${avgRPE.toFixed(1)} across last ${recentRPEs.length} sets. Consider increasing weight.`,
          action: { label: "Try +2.5kg", value: latest.weight + 2.5 },
          priority: 2,
          timestamp: now,
        });
      }
    }
  }

  // 2. Rep dropoff detection (fatigue)
  if (completedSets.length >= 3) {
    const reps = completedSets.map((s) => s.actualReps);
    const first = reps[0];
    const last = reps[reps.length - 1];
    if (first > 0 && last / first < 0.7) {
      suggestions.push({
        id: `fatigue-${now}`,
        type: "fatigue",
        title: "Fatigue detected",
        message: `Reps dropped from ${first} to ${last} (${Math.round((1 - last / first) * 100)}% decrease). Consider ending after this superset.`,
        priority: 1,
        timestamp: now,
      });
    }
  }

  // 3. Set quality feedback
  if (latest.rpe !== undefined && latest.rpe >= 7.5 && latest.rpe <= 8.5 && latest.actualReps >= targetReps) {
    suggestions.push({
      id: `quality-${now}`,
      type: "quality",
      title: "Great set!",
      message: `RPE ${latest.rpe} at target reps - perfect intensity for hypertrophy.`,
      priority: 4,
      timestamp: now,
    });
  }

  // 4. High RPE warning
  if (latest.rpe !== undefined && latest.rpe >= 9.5 && completedSets.length < targetSets) {
    suggestions.push({
      id: `fatigue-rpe-${now}`,
      type: "fatigue",
      title: "High RPE alert",
      message: `RPE ${latest.rpe} - close to failure. Drop weight by 5-10% for remaining sets to maintain form.`,
      action: { label: `Try ${Math.round(latest.weight * 0.9 * 2) / 2}kg`, value: Math.round(latest.weight * 0.9 * 2) / 2 },
      priority: 1,
      timestamp: now,
    });
  }

  // 5. Weight vs last session
  if (lastSessionWeight && latest.weight > lastSessionWeight && latest.actualReps >= targetReps) {
    suggestions.push({
      id: `progress-${now}`,
      type: "quality",
      title: "Progress!",
      message: `+${(latest.weight - lastSessionWeight).toFixed(1)}kg since last session at full reps. Keep it up!`,
      priority: 3,
      timestamp: now,
    });
  }

  // Return highest priority first, max 1
  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 1);
}

/**
 * Check if an exercise shows plateau signs based on recent history.
 */
export function detectPlateau(
  exerciseId: string,
  sessionHistory: Array<{ date: string; weight: number; reps: number; sets: number }>,
  isCompound: boolean
): { isPlateau: boolean; weeks: number; suggestion: string } | null {
  const minSessions = isCompound ? 2 : 3;
  if (sessionHistory.length < minSessions) return null;

  const recent = sessionHistory.slice(-minSessions);
  const weights = recent.map((s) => s.weight);
  const reps = recent.map((s) => s.reps);

  const sameWeight = weights.every((w) => w === weights[0]);
  const sameReps = reps.every((r) => Math.abs(r - reps[0]) <= 1);

  if (sameWeight && sameReps) {
    const weeks = recent.length;
    return {
      isPlateau: true,
      weeks,
      suggestion: isCompound
        ? "Try paused reps, add a back-off set, or swap to a variation for 2-3 weeks."
        : "Try drop sets, increase time under tension, or swap to a similar exercise.",
    };
  }

  return null;
}
