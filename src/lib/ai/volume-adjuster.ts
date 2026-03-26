/**
 * Volume Auto-Adjuster for SetFlow
 * After each workout, suggests volume adjustments for the next session.
 * - If all sets completed at target reps with low RPE: suggest weight increase
 * - If failed to complete sets: suggest volume reduction
 * 100% on-device - no API calls needed.
 */

export interface VolumeAdjustment {
  exerciseId: string;
  exerciseName: string;
  currentWeight: number;
  suggestedWeight: number;
  currentSets: number;
  suggestedSets: number;
  reason: string;
  type: "increase_weight" | "decrease_weight" | "add_set" | "reduce_set" | "maintain";
  priority: "high" | "medium" | "low";
}

/** RPE threshold below which we suggest increasing weight */
const LOW_RPE_THRESHOLD = 7.5;

/** RPE threshold above which we suggest decreasing volume */
const HIGH_RPE_THRESHOLD = 9.5;

/** Standard weight increment for compounds (kg) */
const COMPOUND_INCREMENT = 2.5;

/** Standard weight increment for isolations (kg) */
const ISOLATION_INCREMENT = 1.25;

/** Minimum completion rate to suggest progression */
const MIN_COMPLETION_RATE = 0.9; // 90% of target reps

/**
 * Analyze a completed workout and generate volume adjustment suggestions
 * for the next session.
 */
export function generateVolumeAdjustments(
  completedSets: Array<{
    exerciseId: string;
    exerciseName: string;
    setNumber: number;
    weight: number;
    actualReps: number;
    targetReps: number;
    rpe?: number;
    isComplete: boolean;
  }>,
  exerciseMeta?: Map<
    string,
    { muscleGroups: string[]; equipment: string }
  >
): VolumeAdjustment[] {
  const adjustments: VolumeAdjustment[] = [];

  // Group sets by exercise
  const exerciseGroups = new Map<
    string,
    Array<{
      exerciseName: string;
      setNumber: number;
      weight: number;
      actualReps: number;
      targetReps: number;
      rpe?: number;
    }>
  >();

  for (const set of completedSets) {
    if (!set.isComplete || set.weight <= 0) continue;
    const group = exerciseGroups.get(set.exerciseId) ?? [];
    group.push({
      exerciseName: set.exerciseName,
      setNumber: set.setNumber,
      weight: set.weight,
      actualReps: set.actualReps,
      targetReps: set.targetReps,
      rpe: set.rpe,
    });
    exerciseGroups.set(set.exerciseId, group);
  }

  for (const [exerciseId, sets] of exerciseGroups) {
    if (sets.length === 0) continue;

    const exerciseName = sets[0].exerciseName;

    // Determine if compound or isolation based on metadata
    const isCompound = exerciseMeta
      ? isCompoundExercise(exerciseId, exerciseMeta)
      : true; // default to compound if no metadata

    const increment = isCompound ? COMPOUND_INCREMENT : ISOLATION_INCREMENT;

    // Calculate aggregate metrics
    const maxWeight = Math.max(...sets.map((s) => s.weight));
    const workingSets = sets.filter((s) => s.weight === maxWeight);
    const totalSets = workingSets.length;

    const avgReps =
      workingSets.reduce((sum, s) => sum + s.actualReps, 0) / workingSets.length;
    const avgTargetReps =
      workingSets.reduce((sum, s) => sum + s.targetReps, 0) / workingSets.length;

    const rpeValues = workingSets.filter((s) => s.rpe !== undefined);
    const avgRPE =
      rpeValues.length > 0
        ? rpeValues.reduce((sum, s) => sum + (s.rpe ?? 0), 0) / rpeValues.length
        : null;

    const completionRate = avgTargetReps > 0 ? avgReps / avgTargetReps : 1;

    // Determine number of sets where target reps were hit
    const setsHitTarget = workingSets.filter(
      (s) => s.actualReps >= s.targetReps
    ).length;
    const allSetsHitTarget = setsHitTarget === workingSets.length;

    // Decision logic
    const adjustment = decideAdjustment({
      exerciseId,
      exerciseName,
      maxWeight,
      totalSets,
      avgRPE,
      completionRate,
      allSetsHitTarget,
      increment,
    });

    if (adjustment) {
      adjustments.push(adjustment);
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return adjustments.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

function decideAdjustment(params: {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  totalSets: number;
  avgRPE: number | null;
  completionRate: number;
  allSetsHitTarget: boolean;
  increment: number;
}): VolumeAdjustment | null {
  const {
    exerciseId,
    exerciseName,
    maxWeight,
    totalSets,
    avgRPE,
    completionRate,
    allSetsHitTarget,
    increment,
  } = params;

  // Case 1: All sets hit target AND low RPE -> increase weight
  if (allSetsHitTarget && avgRPE !== null && avgRPE < LOW_RPE_THRESHOLD) {
    return {
      exerciseId,
      exerciseName,
      currentWeight: maxWeight,
      suggestedWeight: roundToPlate(maxWeight + increment),
      currentSets: totalSets,
      suggestedSets: totalSets,
      reason: `All sets completed at target reps with RPE ${avgRPE.toFixed(1)}. Ready for a weight increase.`,
      type: "increase_weight",
      priority: "high",
    };
  }

  // Case 2: All sets hit target, no RPE data or moderate RPE -> increase weight (lower confidence)
  if (allSetsHitTarget && (avgRPE === null || avgRPE <= 8.5)) {
    return {
      exerciseId,
      exerciseName,
      currentWeight: maxWeight,
      suggestedWeight: roundToPlate(maxWeight + increment),
      currentSets: totalSets,
      suggestedSets: totalSets,
      reason: `All sets at target reps. Consider increasing to ${roundToPlate(maxWeight + increment)}kg.`,
      type: "increase_weight",
      priority: "medium",
    };
  }

  // Case 3: Very high RPE across sets -> reduce volume or weight
  if (avgRPE !== null && avgRPE >= HIGH_RPE_THRESHOLD) {
    if (completionRate < MIN_COMPLETION_RATE) {
      // Failed sets + high RPE -> reduce weight
      return {
        exerciseId,
        exerciseName,
        currentWeight: maxWeight,
        suggestedWeight: roundToPlate(maxWeight - increment),
        currentSets: totalSets,
        suggestedSets: totalSets,
        reason: `RPE ${avgRPE.toFixed(1)} with incomplete sets. Drop weight to maintain quality.`,
        type: "decrease_weight",
        priority: "high",
      };
    } else {
      // Completed but at extreme effort -> reduce a set
      if (totalSets > 2) {
        return {
          exerciseId,
          exerciseName,
          currentWeight: maxWeight,
          suggestedWeight: maxWeight,
          currentSets: totalSets,
          suggestedSets: totalSets - 1,
          reason: `RPE ${avgRPE.toFixed(1)} across all sets. Reduce volume by 1 set to manage fatigue.`,
          type: "reduce_set",
          priority: "medium",
        };
      }
    }
  }

  // Case 4: Failed to complete sets (low completion) but RPE not extreme -> maintain
  if (completionRate < MIN_COMPLETION_RATE) {
    return {
      exerciseId,
      exerciseName,
      currentWeight: maxWeight,
      suggestedWeight: maxWeight,
      currentSets: totalSets,
      suggestedSets: totalSets,
      reason: `Didn't hit target reps at ${maxWeight}kg. Stay at this weight and focus on completing all reps.`,
      type: "maintain",
      priority: "low",
    };
  }

  // Case 5: Everything looks good, maintain
  return null; // No adjustment needed
}

/**
 * Check if an exercise is compound based on the number of muscle groups it targets
 */
function isCompoundExercise(
  exerciseId: string,
  exerciseMeta: Map<string, { muscleGroups: string[]; equipment: string }>
): boolean {
  const meta = exerciseMeta.get(exerciseId);
  if (!meta) return true; // assume compound if unknown
  return meta.muscleGroups.length >= 2;
}

/**
 * Round to nearest plate increment (1.25kg)
 */
function roundToPlate(weight: number): number {
  return Math.round(weight / 1.25) * 1.25;
}

/**
 * Get the most impactful single adjustment from a set of adjustments.
 * Useful for the home dashboard "Training Insights" card.
 */
export function getMostImportantAdjustment(
  adjustments: VolumeAdjustment[]
): VolumeAdjustment | null {
  if (adjustments.length === 0) return null;
  // Already sorted by priority from generateVolumeAdjustments
  return adjustments[0];
}
