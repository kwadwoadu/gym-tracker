/**
 * Recovery-aware workout adjustment engine
 * Takes recovery score (1-5 from RecoveryAssessment) and returns
 * intensity/volume adjustment recommendations per exercise.
 */

export interface RecoveryAdjustment {
  weightMultiplier: number; // e.g. 0.85 = reduce 15%, 1.0 = no change, 1.05 = increase 5%
  setMultiplier: number; // e.g. 0.7 = drop 30% of sets, 1.0 = keep all
  recommendation: string;
  severity: "skip" | "light" | "moderate" | "normal" | "push";
  color: string; // UI color for the banner
  label: string; // Short label like "Low Recovery"
}

export interface ExerciseAdjustment {
  exerciseName: string;
  originalWeight: number;
  adjustedWeight: number;
  originalSets: number;
  adjustedSets: number;
  note: string;
}

/**
 * Calculate workout adjustments based on recovery score (1-5).
 *
 * Score mapping:
 * 1 (Exhausted) -> suggest skip or very light session
 * 2 (Tired)     -> reduce weights 10-15%, reduce sets
 * 3 (Moderate)  -> train as planned
 * 4 (Good)      -> normal training, slight push ok
 * 5 (Great)     -> push harder, attempt PRs
 */
export function getRecoveryAdjustment(score: number): RecoveryAdjustment {
  switch (score) {
    case 1:
      return {
        weightMultiplier: 0.7,
        setMultiplier: 0.6,
        recommendation:
          "Recovery is very low. Consider a rest day with light mobility work, or train at significantly reduced intensity.",
        severity: "light",
        color: "#EF4444",
        label: "Very Low Recovery",
      };
    case 2:
      return {
        weightMultiplier: 0.85,
        setMultiplier: 0.8,
        recommendation:
          "Recovery is below average. Reduce working weights by 15% and drop 1-2 sets per exercise. Focus on technique over intensity.",
        severity: "light",
        color: "#F59E0B",
        label: "Low Recovery",
      };
    case 3:
      return {
        weightMultiplier: 1.0,
        setMultiplier: 1.0,
        recommendation:
          "Recovery is moderate. Train as planned. Listen to your body and adjust if needed.",
        severity: "normal",
        color: "#F59E0B",
        label: "Moderate Recovery",
      };
    case 4:
      return {
        weightMultiplier: 1.0,
        setMultiplier: 1.0,
        recommendation:
          "Recovery is good. Solid day to train at full intensity. Push for progressive overload.",
        severity: "normal",
        color: "#22C55E",
        label: "Good Recovery",
      };
    case 5:
      return {
        weightMultiplier: 1.05,
        setMultiplier: 1.0,
        recommendation:
          "Recovery is excellent. Great day to push for PRs or increase volume. Take advantage of this energy.",
        severity: "push",
        color: "#22C55E",
        label: "Peak Recovery",
      };
    default:
      return {
        weightMultiplier: 1.0,
        setMultiplier: 1.0,
        recommendation: "Train as planned.",
        severity: "normal",
        color: "#A0A0A0",
        label: "No Data",
      };
  }
}

/**
 * Apply recovery adjustment to a list of exercises.
 * Returns adjusted weights and sets per exercise.
 */
export function adjustExercises(
  exercises: Array<{
    name: string;
    weight: number;
    sets: number;
  }>,
  score: number,
): ExerciseAdjustment[] {
  const adjustment = getRecoveryAdjustment(score);

  return exercises.map((ex) => {
    const adjustedWeight = roundToNearest(
      ex.weight * adjustment.weightMultiplier,
      2.5,
    );
    const adjustedSets = Math.max(
      1,
      Math.round(ex.sets * adjustment.setMultiplier),
    );

    let note = "";
    if (adjustedWeight < ex.weight) {
      note = `Reduced from ${ex.weight}kg`;
    } else if (adjustedWeight > ex.weight) {
      note = `Increased from ${ex.weight}kg`;
    }
    if (adjustedSets < ex.sets) {
      note += note ? `, ${ex.sets} -> ${adjustedSets} sets` : `${ex.sets} -> ${adjustedSets} sets`;
    }

    return {
      exerciseName: ex.name,
      originalWeight: ex.weight,
      adjustedWeight,
      originalSets: ex.sets,
      adjustedSets,
      note: note || "No change",
    };
  });
}

/** Round to nearest increment (e.g. 2.5kg plates) */
function roundToNearest(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}
