/**
 * PR Prediction Engine for SetFlow
 * Uses linear regression on recent weight progression per exercise
 * to predict when user will hit the next PR milestone.
 * 100% on-device - no API calls needed.
 */

export interface PRPrediction {
  exerciseId: string;
  exerciseName: string;
  currentBest: { weight: number; reps: number; date: string };
  targetWeight: number;
  estimatedDate: string;
  estimatedWeeks: number;
  confidence: "high" | "medium" | "low";
  weeklyProgressionRate: number; // kg/week average
  dataPoints: number; // weeks of data used
  rSquared: number;
}

interface DataPoint {
  weekIndex: number;
  weight: number;
}

/** Common PR milestones for suggestion (kg) */
const MILESTONE_STEPS = [
  40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220,
  250, 280, 300,
];

/** Maximum weeks to project into the future */
const MAX_PROJECTION_WEEKS = 12;

/** Minimum data points for any prediction */
const MIN_DATA_POINTS = 2;

/**
 * Simple linear regression: y = mx + b
 * Returns slope (m), intercept (b), and R-squared
 */
function linearRegression(points: DataPoint[]): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const p of points) {
    sumX += p.weekIndex;
    sumY += p.weight;
    sumXY += p.weekIndex * p.weight;
    sumX2 += p.weekIndex * p.weekIndex;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n, rSquared: 0 };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // R-squared calculation
  const yMean = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (const p of points) {
    const predicted = slope * p.weekIndex + intercept;
    ssRes += (p.weight - predicted) ** 2;
    ssTot += (p.weight - yMean) ** 2;
  }
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, rSquared };
}

/**
 * Determine confidence level based on data quality
 */
function getConfidence(
  dataPoints: number,
  rSquared: number
): "high" | "medium" | "low" {
  if (dataPoints >= 6 && rSquared > 0.7) return "high";
  if (dataPoints >= 4 && rSquared > 0.4) return "medium";
  return "low";
}

/**
 * Find the next milestone target above current best
 */
function findNextMilestone(currentBest: number): number {
  for (const milestone of MILESTONE_STEPS) {
    if (milestone > currentBest) return milestone;
  }
  // If beyond all milestones, round up to next 25kg
  return Math.ceil(currentBest / 25) * 25 + 25;
}

/**
 * Build weekly max weight data points from workout logs for a specific exercise
 */
export function buildWeeklyProgressionData(
  workoutLogs: Array<{
    date: string;
    sets: Array<{
      exerciseId: string;
      weight: number;
      actualReps: number;
      isComplete: boolean;
    }>;
    isComplete: boolean;
  }>,
  exerciseId: string
): DataPoint[] {
  // Filter to completed workouts with this exercise
  const relevantData: Array<{ date: Date; weight: number }> = [];

  for (const log of workoutLogs) {
    if (!log.isComplete) continue;
    const exerciseSets = log.sets.filter(
      (s) => s.exerciseId === exerciseId && s.isComplete && s.weight > 0
    );
    if (exerciseSets.length === 0) continue;

    const maxWeight = Math.max(...exerciseSets.map((s) => s.weight));
    relevantData.push({ date: new Date(log.date), weight: maxWeight });
  }

  if (relevantData.length === 0) return [];

  // Sort by date ascending
  relevantData.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by week (using the earliest date as week 0)
  const earliest = relevantData[0].date.getTime();
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

  const weeklyMax = new Map<number, number>();
  for (const d of relevantData) {
    const weekIndex = Math.floor((d.date.getTime() - earliest) / MS_PER_WEEK);
    const current = weeklyMax.get(weekIndex) ?? 0;
    weeklyMax.set(weekIndex, Math.max(current, d.weight));
  }

  return Array.from(weeklyMax.entries())
    .map(([weekIndex, weight]) => ({ weekIndex, weight }))
    .sort((a, b) => a.weekIndex - b.weekIndex);
}

/**
 * Generate PR predictions for a specific exercise
 */
export function predictPR(
  workoutLogs: Array<{
    date: string;
    sets: Array<{
      exerciseId: string;
      exerciseName: string;
      weight: number;
      actualReps: number;
      isComplete: boolean;
    }>;
    isComplete: boolean;
  }>,
  exerciseId: string,
  exerciseName: string,
  customTarget?: number
): PRPrediction | null {
  const dataPoints = buildWeeklyProgressionData(workoutLogs, exerciseId);

  if (dataPoints.length < MIN_DATA_POINTS) return null;

  const { slope, rSquared } = linearRegression(dataPoints);

  // If progression rate is zero or negative, can't predict upward PR
  if (slope <= 0) return null;

  // Current best from the data
  const lastPoint = dataPoints[dataPoints.length - 1];
  const currentBestWeight = lastPoint.weight;

  // Find current best with reps from logs
  let bestReps = 0;
  let bestDate = "";
  for (const log of workoutLogs) {
    if (!log.isComplete) continue;
    for (const set of log.sets) {
      if (
        set.exerciseId === exerciseId &&
        set.weight === currentBestWeight &&
        set.isComplete
      ) {
        if (set.actualReps > bestReps) {
          bestReps = set.actualReps;
          bestDate = log.date;
        }
      }
    }
  }

  // Determine target
  const targetWeight = customTarget ?? findNextMilestone(currentBestWeight);

  if (targetWeight <= currentBestWeight) return null;

  // Calculate weeks to target
  const weeksToTarget = (targetWeight - currentBestWeight) / slope;

  // Cap at max projection
  if (weeksToTarget > MAX_PROJECTION_WEEKS) return null;

  // Calculate estimated date
  const now = new Date();
  const estimatedDate = new Date(
    now.getTime() + weeksToTarget * 7 * 24 * 60 * 60 * 1000
  );
  const estimatedDateStr = estimatedDate.toISOString().split("T")[0];

  const confidence = getConfidence(dataPoints.length, rSquared);

  return {
    exerciseId,
    exerciseName,
    currentBest: {
      weight: currentBestWeight,
      reps: bestReps || 1,
      date: bestDate || new Date().toISOString().split("T")[0],
    },
    targetWeight,
    estimatedDate: estimatedDateStr,
    estimatedWeeks: Math.round(weeksToTarget * 10) / 10,
    confidence,
    weeklyProgressionRate: Math.round(slope * 100) / 100,
    dataPoints: dataPoints.length,
    rSquared: Math.round(rSquared * 100) / 100,
  };
}

/**
 * Generate top PR predictions across all exercises
 * Returns up to `limit` predictions sorted by confidence then by weeks remaining
 */
export function getTopPRPredictions(
  workoutLogs: Array<{
    date: string;
    sets: Array<{
      exerciseId: string;
      exerciseName: string;
      weight: number;
      actualReps: number;
      isComplete: boolean;
    }>;
    isComplete: boolean;
  }>,
  exerciseMap: Map<string, { id: string; name: string }>,
  limit: number = 3
): PRPrediction[] {
  const predictions: PRPrediction[] = [];

  // Collect unique exercise IDs from logs
  const exerciseIds = new Set<string>();
  for (const log of workoutLogs) {
    if (!log.isComplete) continue;
    for (const set of log.sets) {
      if (set.isComplete && set.weight > 0) {
        exerciseIds.add(set.exerciseId);
      }
    }
  }

  for (const exerciseId of exerciseIds) {
    const exercise = exerciseMap.get(exerciseId);
    if (!exercise) continue;

    const prediction = predictPR(
      workoutLogs,
      exerciseId,
      exercise.name
    );
    if (prediction) {
      predictions.push(prediction);
    }
  }

  // Sort by confidence (high first), then by weeks remaining (soonest first)
  const confidenceOrder = { high: 0, medium: 1, low: 2 };
  predictions.sort((a, b) => {
    const confDiff = confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
    if (confDiff !== 0) return confDiff;
    return a.estimatedWeeks - b.estimatedWeeks;
  });

  return predictions.slice(0, limit);
}
