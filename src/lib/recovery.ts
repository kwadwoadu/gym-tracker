/**
 * Muscle recovery estimation engine
 * Estimates recovery time per muscle group based on volume and time elapsed
 */

import type { WorkoutLog, SetLog, Exercise } from "@/lib/db";

export interface MuscleRecoveryEstimate {
  muscleGroup: string;
  totalVolume: number;
  recoveryHoursTotal: number;
  hoursElapsed: number;
  hoursRemaining: number;
  percentRecovered: number;
  status: "fatigued" | "recovering" | "recovered";
}

const BASE_RECOVERY_HOURS: Record<string, number> = {
  quads: 48,
  hamstrings: 48,
  glutes: 36,
  chest: 48,
  back: 48,
  shoulders: 36,
  biceps: 24,
  triceps: 24,
  calves: 24,
  core: 24,
};

export function estimateMuscleRecovery(
  workoutLog: WorkoutLog,
  exerciseMap: Map<string, Exercise>,
  now: Date = new Date()
): MuscleRecoveryEstimate[] {
  const workoutEnd = workoutLog.endTime
    ? new Date(workoutLog.endTime)
    : new Date(workoutLog.startTime);
  const hoursElapsed =
    (now.getTime() - workoutEnd.getTime()) / (1000 * 60 * 60);

  // Group volume by muscle
  const muscleVolume = new Map<string, number>();

  for (const setLog of workoutLog.sets as SetLog[]) {
    if (!setLog.isComplete) continue;
    const exercise = exerciseMap.get(setLog.exerciseId);
    if (!exercise) continue;

    const volume = setLog.weight * setLog.actualReps;
    for (const muscle of exercise.muscleGroups) {
      muscleVolume.set(muscle, (muscleVolume.get(muscle) || 0) + volume);
    }
  }

  const estimates: MuscleRecoveryEstimate[] = [];

  for (const [muscle, volume] of muscleVolume) {
    const baseHours = BASE_RECOVERY_HOURS[muscle] || 36;

    // Scale recovery time by volume intensity (higher volume = longer, up to 1.5x)
    const volumeMultiplier = Math.min(1.5, 1 + (volume / 10000) * 0.5);
    const totalHours = Math.round(baseHours * volumeMultiplier);

    const hoursRemaining = Math.max(0, totalHours - hoursElapsed);
    const percentRecovered = Math.min(
      100,
      Math.round((hoursElapsed / totalHours) * 100)
    );

    let status: MuscleRecoveryEstimate["status"];
    if (percentRecovered >= 100) status = "recovered";
    else if (percentRecovered >= 50) status = "recovering";
    else status = "fatigued";

    estimates.push({
      muscleGroup: muscle,
      totalVolume: Math.round(volume),
      recoveryHoursTotal: totalHours,
      hoursElapsed: Math.round(hoursElapsed),
      hoursRemaining: Math.round(hoursRemaining),
      percentRecovered,
      status,
    });
  }

  // Sort: least recovered first
  return estimates.sort((a, b) => a.percentRecovered - b.percentRecovered);
}

export interface RecoveryScore {
  overall: number; // 0-100
  label: "Not Ready" | "Partially Recovered" | "Ready to Train" | "Fully Recovered";
  color: string;
  fatigueCount: number;
  recoveringCount: number;
  recoveredCount: number;
}

/**
 * Calculate an overall recovery score from muscle estimates.
 */
export function calculateRecoveryScore(estimates: MuscleRecoveryEstimate[]): RecoveryScore {
  if (estimates.length === 0) {
    return { overall: 100, label: "Fully Recovered", color: "#22C55E", fatigueCount: 0, recoveringCount: 0, recoveredCount: 0 };
  }

  const avgPercent = Math.round(estimates.reduce((s, e) => s + e.percentRecovered, 0) / estimates.length);
  const fatigueCount = estimates.filter((e) => e.status === "fatigued").length;
  const recoveringCount = estimates.filter((e) => e.status === "recovering").length;
  const recoveredCount = estimates.filter((e) => e.status === "recovered").length;

  let label: RecoveryScore["label"];
  let color: string;

  if (avgPercent >= 90) {
    label = "Fully Recovered";
    color = "#22C55E";
  } else if (avgPercent >= 70) {
    label = "Ready to Train";
    color = "#CDFF00";
  } else if (avgPercent >= 40) {
    label = "Partially Recovered";
    color = "#F59E0B";
  } else {
    label = "Not Ready";
    color = "#EF4444";
  }

  return { overall: avgPercent, label, color, fatigueCount, recoveringCount, recoveredCount };
}

// ============================================================
// Smart Rest Day Detection
// ============================================================

/** Minimum hours between workouts for recovery (conservative) */
const MIN_REST_HOURS = 24;

export interface RestDayRecommendation {
  shouldRest: boolean;
  reasons: string[];
  confidence: "high" | "moderate" | "low";
  daysSinceLastWorkout: number;
  weeklyWorkouts: number;
  weeklyTarget: number;
  fatigueLevel: "none" | "light" | "moderate" | "heavy";
}

/**
 * Determine whether today should be a rest day.
 *
 * Signals considered:
 *   1. Days since last workout (0 = trained today)
 *   2. Muscle recovery status across all recently trained groups
 *   3. Weekly training frequency vs target (e.g. 3 of 4 done)
 */
export function shouldTakeRestDay(
  workoutLogs: WorkoutLog[],
  exerciseMap: Map<string, Exercise>,
  weeklyTarget: number,
  now: Date = new Date()
): RestDayRecommendation {
  const reasons: string[] = [];

  // --- 1. Days since last workout ---
  const completedLogs = workoutLogs
    .filter((l) => l.isComplete && l.endTime)
    .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());

  const lastWorkout = completedLogs[0] ?? null;
  const hoursSinceLast = lastWorkout
    ? (now.getTime() - new Date(lastWorkout.endTime!).getTime()) / (1000 * 60 * 60)
    : Infinity;
  const daysSinceLastWorkout = Math.floor(hoursSinceLast / 24);

  // If no workout history, suggest training
  if (!lastWorkout) {
    return {
      shouldRest: false,
      reasons: ["No recent workout history - time to start training!"],
      confidence: "low",
      daysSinceLastWorkout: Infinity,
      weeklyWorkouts: 0,
      weeklyTarget,
      fatigueLevel: "none",
    };
  }

  // --- 2. Muscle recovery status ---
  // Gather estimates from the most recent workouts within 72h
  const recentCutoff = now.getTime() - 72 * 60 * 60 * 1000;
  const recentWorkouts = completedLogs.filter(
    (l) => new Date(l.endTime!).getTime() > recentCutoff
  );

  // Merge recovery estimates across recent workouts
  const allEstimates = new Map<string, MuscleRecoveryEstimate>();
  for (const log of recentWorkouts) {
    const estimates = estimateMuscleRecovery(log, exerciseMap, now);
    for (const est of estimates) {
      const existing = allEstimates.get(est.muscleGroup);
      // Keep the least-recovered estimate per muscle
      if (!existing || est.percentRecovered < existing.percentRecovered) {
        allEstimates.set(est.muscleGroup, est);
      }
    }
  }

  const fatigueCount = Array.from(allEstimates.values()).filter(
    (e) => e.status === "fatigued"
  ).length;
  const recoveringCount = Array.from(allEstimates.values()).filter(
    (e) => e.status === "recovering"
  ).length;
  const totalMuscles = allEstimates.size;

  let fatigueLevel: RestDayRecommendation["fatigueLevel"] = "none";
  if (totalMuscles > 0) {
    const fatigueRatio = fatigueCount / totalMuscles;
    if (fatigueRatio > 0.5) fatigueLevel = "heavy";
    else if (fatigueRatio > 0.25) fatigueLevel = "moderate";
    else if (fatigueCount > 0 || recoveringCount > 0) fatigueLevel = "light";
  }

  // --- 3. Weekly training frequency ---
  const weekStart = getStartOfWeek(now);
  const weeklyWorkouts = completedLogs.filter((l) => {
    const d = new Date(l.endTime!);
    return d >= weekStart && d <= now;
  }).length;

  // --- Decision logic ---
  let shouldRest = false;

  // Trained today already -> rest
  if (hoursSinceLast < MIN_REST_HOURS) {
    reasons.push("Already trained in the last 24 hours");
    shouldRest = true;
  }

  // Heavy fatigue -> rest
  if (fatigueLevel === "heavy") {
    reasons.push(
      `${fatigueCount} muscle group${fatigueCount > 1 ? "s" : ""} still fatigued`
    );
    shouldRest = true;
  }

  // Weekly target already hit -> rest is fine
  if (weeklyWorkouts >= weeklyTarget) {
    reasons.push(
      `Weekly target reached (${weeklyWorkouts}/${weeklyTarget} workouts)`
    );
    shouldRest = true;
  }

  // Moderate fatigue is a softer signal
  if (fatigueLevel === "moderate" && !shouldRest) {
    reasons.push("Multiple muscle groups still recovering");
    // Only suggest rest if also close to weekly target
    if (weeklyWorkouts >= weeklyTarget - 1) {
      shouldRest = true;
    }
  }

  // If 3+ days since last workout, suggest training
  if (daysSinceLastWorkout >= 3 && reasons.length === 0) {
    reasons.push(`${daysSinceLastWorkout} days since last workout`);
    shouldRest = false;
  }

  // Default reasoning if no signals triggered
  if (reasons.length === 0) {
    if (shouldRest) {
      reasons.push("General recovery recommendation");
    } else {
      reasons.push("Recovery looks good - ready to train");
    }
  }

  // Confidence based on signal strength
  let confidence: RestDayRecommendation["confidence"] = "moderate";
  if (reasons.length >= 2 && shouldRest) confidence = "high";
  if (daysSinceLastWorkout >= 3 && !shouldRest) confidence = "high";
  if (totalMuscles === 0) confidence = "low";

  return {
    shouldRest,
    reasons,
    confidence,
    daysSinceLastWorkout,
    weeklyWorkouts,
    weeklyTarget,
    fatigueLevel,
  };
}

/** Get the Monday 00:00 of the current week */
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Monday = 1, Sunday = 0 -> shift Sunday to 7
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
