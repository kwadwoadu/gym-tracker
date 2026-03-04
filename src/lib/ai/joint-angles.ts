/**
 * Joint angle calculation utilities for form analysis
 * Calculates angles between body segments from 3D keypoints
 */

export interface Keypoint3D {
  x: number;
  y: number;
  z: number;
  visibility: number; // 0-1 confidence
}

/**
 * Calculate the angle between three points (in degrees)
 * Point B is the vertex of the angle
 */
export function calculateAngle(
  a: Keypoint3D,
  b: Keypoint3D,
  c: Keypoint3D
): number {
  const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2 + ab.z ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2 + cb.z ** 2);

  if (magAB === 0 || magCB === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Calculate the angle of a segment relative to vertical (Y-axis)
 */
export function angleFromVertical(top: Keypoint3D, bottom: Keypoint3D): number {
  const dx = top.x - bottom.x;
  const dy = top.y - bottom.y;
  return (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
}

/**
 * Calculate the angle of a segment relative to horizontal (X-axis)
 */
export function angleFromHorizontal(
  left: Keypoint3D,
  right: Keypoint3D
): number {
  const dx = right.x - left.x;
  const dy = right.y - left.y;
  return (Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI;
}

/**
 * Check if left-right keypoints are symmetric (for valgus/varus detection)
 * Returns difference in pixels - larger = more asymmetric
 */
export function lateralAsymmetry(
  leftPoint: Keypoint3D,
  rightPoint: Keypoint3D,
  referenceCenter: Keypoint3D
): number {
  const leftDist = Math.abs(leftPoint.x - referenceCenter.x);
  const rightDist = Math.abs(rightPoint.x - referenceCenter.x);
  return Math.abs(leftDist - rightDist);
}

/**
 * MediaPipe BlazePose landmark indices
 */
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

/**
 * Get midpoint between two keypoints
 */
export function midpoint(a: Keypoint3D, b: Keypoint3D): Keypoint3D {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility, b.visibility),
  };
}
