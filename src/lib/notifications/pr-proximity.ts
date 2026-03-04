import { getPersonalRecords } from "@/lib/db";

export interface PRProximityResult {
  isClose: boolean;
  prWeight: number;
  prReps: number;
  percentAway: number;
}

/**
 * Check if current performance is close to a personal record.
 * "Close" means within 5% of weight PR or 1 rep of rep PR.
 */
export async function checkPRProximity(
  exerciseId: string,
  currentWeight: number,
  currentReps: number
): Promise<PRProximityResult> {
  const records = await getPersonalRecords(exerciseId);

  if (records.length === 0) {
    return {
      isClose: false,
      prWeight: 0,
      prReps: 0,
      percentAway: 100,
    };
  }

  // Find the best weight PR
  const bestWeightPR = records.reduce((best, pr) =>
    pr.weight > best.weight ? pr : best
  );

  // Find the best reps PR (at any weight)
  const bestRepsPR = records.reduce((best, pr) =>
    pr.reps > best.reps ? pr : best
  );

  // Check weight proximity: within 5% of weight PR
  const weightDiff = bestWeightPR.weight - currentWeight;
  const weightPercentAway =
    bestWeightPR.weight > 0
      ? (weightDiff / bestWeightPR.weight) * 100
      : 100;

  const isCloseByWeight = weightPercentAway > 0 && weightPercentAway <= 5;

  // Check rep proximity: within 1 rep of rep PR (at same or higher weight)
  const repDiff = bestRepsPR.reps - currentReps;
  const isCloseByReps = repDiff > 0 && repDiff <= 1;

  // Also close if current weight exceeds PR (about to set a new one)
  const isExceedingWeight = currentWeight > bestWeightPR.weight;
  const isExceedingReps = currentReps > bestRepsPR.reps;

  const isClose =
    isCloseByWeight || isCloseByReps || isExceedingWeight || isExceedingReps;

  return {
    isClose,
    prWeight: bestWeightPR.weight,
    prReps: bestRepsPR.reps,
    percentAway: Math.max(0, weightPercentAway),
  };
}
