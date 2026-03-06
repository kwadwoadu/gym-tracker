/**
 * Form analysis engine
 * Takes pose keypoints and exercise rules -> produces form scores and feedback
 */

import type { Keypoint3D } from "./joint-angles";
import {
  calculateAngle,
  angleFromVertical,
  POSE_LANDMARKS,
  midpoint,
} from "./joint-angles";
import type { FormRule, FormCheckpoint } from "@/data/form-rules";

export interface RepScore {
  repNumber: number;
  score: number; // 0-100
  checkpointScores: Record<string, number>;
  feedback: string[];
}

export interface SetFormReport {
  exerciseId: string;
  exerciseName: string;
  averageScore: number;
  bestRep: { repNumber: number; score: number };
  worstRep: { repNumber: number; score: number };
  repScores: RepScore[];
  strengths: string[];
  improvements: string[];
}

/**
 * Analyze a single frame's form for a given exercise
 * Returns per-checkpoint scores (0-100)
 */
export function analyzeFrame(
  keypoints: Keypoint3D[],
  rule: FormRule
): Record<string, number> {
  const scores: Record<string, number> = {};

  for (const checkpoint of rule.checkpoints) {
    scores[checkpoint.id] = scoreCheckpoint(keypoints, checkpoint, rule);
  }

  return scores;
}

/**
 * Score a specific checkpoint based on keypoint analysis
 */
function scoreCheckpoint(
  kp: Keypoint3D[],
  checkpoint: FormCheckpoint,
  _rule: FormRule // eslint-disable-line @typescript-eslint/no-unused-vars
): number {
  // Exercise-specific scoring logic
  switch (checkpoint.id) {
    // Squat checkpoints
    case "squat-depth":
    case "fsquat-depth":
    case "bss-depth": {
      const hip = midpoint(kp[POSE_LANDMARKS.LEFT_HIP], kp[POSE_LANDMARKS.RIGHT_HIP]);
      const knee = midpoint(kp[POSE_LANDMARKS.LEFT_KNEE], kp[POSE_LANDMARKS.RIGHT_KNEE]);
      // Hip below knee = good depth (y-axis inverted in screen coords)
      if (hip.y >= knee.y) return 100;
      const diff = knee.y - hip.y;
      return Math.max(0, 100 - diff * 5);
    }

    case "squat-knee-tracking":
    case "fsquat-elbow-position":
    case "bss-knee-tracking": {
      // Simplified: check if knees are roughly over ankles
      const lKnee = kp[POSE_LANDMARKS.LEFT_KNEE];
      const lAnkle = kp[POSE_LANDMARKS.LEFT_ANKLE];
      const rKnee = kp[POSE_LANDMARKS.RIGHT_KNEE];
      const rAnkle = kp[POSE_LANDMARKS.RIGHT_ANKLE];
      const leftDiff = Math.abs(lKnee.x - lAnkle.x);
      const rightDiff = Math.abs(rKnee.x - rAnkle.x);
      const avgDiff = (leftDiff + rightDiff) / 2;
      return Math.max(0, 100 - avgDiff * 3);
    }

    case "squat-back-angle":
    case "bss-torso-upright": {
      const shoulder = midpoint(kp[POSE_LANDMARKS.LEFT_SHOULDER], kp[POSE_LANDMARKS.RIGHT_SHOULDER]);
      const hip = midpoint(kp[POSE_LANDMARKS.LEFT_HIP], kp[POSE_LANDMARKS.RIGHT_HIP]);
      const angle = angleFromVertical(shoulder, hip);
      // Ideal: 15-45 degrees from vertical
      if (angle >= 15 && angle <= 45) return 100;
      if (angle < 15) return Math.max(50, 100 - (15 - angle) * 3);
      return Math.max(30, 100 - (angle - 45) * 3);
    }

    case "squat-spine-neutral":
    case "dl-spine-neutral":
    case "rdl-spine-neutral":
    case "row-spine-neutral": {
      // Simplified: check shoulder-hip-knee alignment
      const shoulder = midpoint(kp[POSE_LANDMARKS.LEFT_SHOULDER], kp[POSE_LANDMARKS.RIGHT_SHOULDER]);
      const hip = midpoint(kp[POSE_LANDMARKS.LEFT_HIP], kp[POSE_LANDMARKS.RIGHT_HIP]);
      const knee = midpoint(kp[POSE_LANDMARKS.LEFT_KNEE], kp[POSE_LANDMARKS.RIGHT_KNEE]);
      const spineAngle = calculateAngle(shoulder, hip, knee);
      // Closer to 180 = more neutral
      if (spineAngle >= 160) return 100;
      return Math.max(0, (spineAngle / 180) * 100);
    }

    case "squat-lockout":
    case "fsquat-lockout":
    case "dl-lockout":
    case "rdl-lockout":
    case "ohp-lockout":
    case "bench-lockout": {
      // Check if joints are near full extension
      const hip = midpoint(kp[POSE_LANDMARKS.LEFT_HIP], kp[POSE_LANDMARKS.RIGHT_HIP]);
      const knee = midpoint(kp[POSE_LANDMARKS.LEFT_KNEE], kp[POSE_LANDMARKS.RIGHT_KNEE]);
      const kneeAngle = calculateAngle(hip, knee, midpoint(kp[POSE_LANDMARKS.LEFT_ANKLE], kp[POSE_LANDMARKS.RIGHT_ANKLE]));
      if (kneeAngle >= 170) return 100;
      return Math.max(0, (kneeAngle / 180) * 100);
    }

    default:
      // For any unhandled checkpoint, return a moderate score
      return 75;
  }
}

/**
 * Generate a set form report from all rep scores
 */
export function generateSetReport(
  exerciseId: string,
  exerciseName: string,
  repScores: RepScore[]
): SetFormReport {
  if (repScores.length === 0) {
    return {
      exerciseId,
      exerciseName,
      averageScore: 0,
      bestRep: { repNumber: 0, score: 0 },
      worstRep: { repNumber: 0, score: 0 },
      repScores: [],
      strengths: [],
      improvements: [],
    };
  }

  const avgScore =
    repScores.reduce((sum, r) => sum + r.score, 0) / repScores.length;

  const sorted = [...repScores].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // Identify strengths (checkpoints scoring consistently >85)
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Aggregate checkpoint scores across all reps
  const checkpointAverages: Record<string, number> = {};
  const checkpointCounts: Record<string, number> = {};

  for (const rep of repScores) {
    for (const [id, score] of Object.entries(rep.checkpointScores)) {
      checkpointAverages[id] = (checkpointAverages[id] || 0) + score;
      checkpointCounts[id] = (checkpointCounts[id] || 0) + 1;
    }
  }

  for (const [id, total] of Object.entries(checkpointAverages)) {
    const avg = total / (checkpointCounts[id] || 1);
    if (avg >= 85) {
      strengths.push(id.replace(/^[a-z]+-/, "").replace(/-/g, " "));
    } else if (avg < 70) {
      improvements.push(id.replace(/^[a-z]+-/, "").replace(/-/g, " "));
    }
  }

  // Check for fatigue pattern (score dropping in later reps)
  if (repScores.length >= 4) {
    const firstHalf = repScores.slice(0, Math.floor(repScores.length / 2));
    const secondHalf = repScores.slice(Math.floor(repScores.length / 2));
    const firstAvg =
      firstHalf.reduce((s, r) => s + r.score, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((s, r) => s + r.score, 0) / secondHalf.length;
    if (firstAvg - secondAvg > 8) {
      improvements.push(
        `Form degrades in later reps (fatigue pattern: reps ${Math.floor(repScores.length / 2) + 1}-${repScores.length})`
      );
    }
  }

  return {
    exerciseId,
    exerciseName,
    averageScore: Math.round(avgScore),
    bestRep: { repNumber: best.repNumber, score: best.score },
    worstRep: { repNumber: worst.repNumber, score: worst.score },
    repScores,
    strengths: strengths.length > 0 ? strengths : ["Consistent form throughout set"],
    improvements:
      improvements.length > 0
        ? improvements
        : ["Form looks good! Focus on maintaining as weight increases"],
  };
}
