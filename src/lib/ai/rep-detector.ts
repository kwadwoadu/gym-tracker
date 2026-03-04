/**
 * Rep detection from keypoint trajectories
 * Detects eccentric/concentric phases based on vertical movement of key joints
 */

import type { Keypoint3D } from "./joint-angles";
import { POSE_LANDMARKS, midpoint } from "./joint-angles";

export interface RepPhase {
  phase: "eccentric" | "concentric" | "rest";
  startFrame: number;
  endFrame: number;
}

export interface DetectedRep {
  repNumber: number;
  startFrame: number;
  endFrame: number;
  bottomFrame: number; // Frame at lowest position (transition point)
}

/**
 * Detect reps from a sequence of keypoint frames
 * Uses hip Y-position as primary signal (covers squats, deadlifts, etc.)
 * For bench press, uses wrist Y-position
 */
export function detectReps(
  frames: Keypoint3D[][],
  exerciseType: "squat" | "hinge" | "press" | "pull" = "squat"
): DetectedRep[] {
  if (frames.length < 10) return [];

  // Extract the tracking signal based on exercise type
  const signal = frames.map((kp) => {
    switch (exerciseType) {
      case "squat":
      case "hinge": {
        const hip = midpoint(kp[POSE_LANDMARKS.LEFT_HIP], kp[POSE_LANDMARKS.RIGHT_HIP]);
        return hip.y;
      }
      case "press": {
        const wrist = midpoint(kp[POSE_LANDMARKS.LEFT_WRIST], kp[POSE_LANDMARKS.RIGHT_WRIST]);
        return wrist.y;
      }
      case "pull": {
        const elbow = midpoint(kp[POSE_LANDMARKS.LEFT_ELBOW], kp[POSE_LANDMARKS.RIGHT_ELBOW]);
        return elbow.y;
      }
    }
  });

  // Smooth the signal (simple moving average, window=5)
  const smoothed = smoothSignal(signal, 5);

  // Find local minima and maxima (peaks and valleys)
  const peaks: number[] = [];
  const valleys: number[] = [];

  for (let i = 2; i < smoothed.length - 2; i++) {
    if (
      smoothed[i] > smoothed[i - 1] &&
      smoothed[i] > smoothed[i - 2] &&
      smoothed[i] > smoothed[i + 1] &&
      smoothed[i] > smoothed[i + 2]
    ) {
      peaks.push(i);
    }
    if (
      smoothed[i] < smoothed[i - 1] &&
      smoothed[i] < smoothed[i - 2] &&
      smoothed[i] < smoothed[i + 1] &&
      smoothed[i] < smoothed[i + 2]
    ) {
      valleys.push(i);
    }
  }

  // Build reps from alternating peaks and valleys
  const reps: DetectedRep[] = [];
  let repNumber = 0;

  // For squats/hinges: a rep goes from peak (standing) -> valley (bottom) -> peak (standing)
  // For press: a rep goes from valley (chest) -> peak (lockout) -> valley (chest)
  const isDownFirst = exerciseType === "squat" || exerciseType === "hinge";

  if (isDownFirst) {
    // Use valleys as bottom positions between peaks
    for (let i = 0; i < valleys.length; i++) {
      const prevPeak = peaks.find((p) => p < valleys[i]);
      const nextPeak = peaks.find((p) => p > valleys[i]);
      if (prevPeak !== undefined && nextPeak !== undefined) {
        repNumber++;
        reps.push({
          repNumber,
          startFrame: prevPeak,
          endFrame: nextPeak,
          bottomFrame: valleys[i],
        });
      }
    }
  } else {
    // Press/pull: peaks as top positions between valleys
    for (let i = 0; i < peaks.length; i++) {
      const prevValley = valleys.find((v) => v < peaks[i]);
      const nextValley = valleys.find((v) => v > peaks[i]);
      if (prevValley !== undefined && nextValley !== undefined) {
        repNumber++;
        reps.push({
          repNumber,
          startFrame: prevValley,
          endFrame: nextValley,
          bottomFrame: peaks[i],
        });
      }
    }
  }

  return reps;
}

function smoothSignal(signal: number[], windowSize: number): number[] {
  const half = Math.floor(windowSize / 2);
  return signal.map((_, i) => {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(signal.length - 1, i + half); j++) {
      sum += signal[j];
      count++;
    }
    return sum / count;
  });
}
