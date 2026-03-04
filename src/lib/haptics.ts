/**
 * Haptics/Vibration utility for SetFlow.
 * Wraps the Vibration API with feature detection.
 * iOS Safari does NOT support the Vibration API - falls back to no-op.
 */

const supportsVibration =
  typeof navigator !== "undefined" && "vibrate" in navigator;

/** Single short pulse - for set completion */
export function vibrateShort() {
  if (supportsVibration) navigator.vibrate(80);
}

/** Double pulse - for rest timer completion */
export function vibrateDouble() {
  if (supportsVibration) navigator.vibrate([200, 100, 200]);
}

/** Triple celebratory pulse - for PR achieved */
export function vibrateCelebration() {
  if (supportsVibration) navigator.vibrate([100, 50, 100, 50, 200]);
}

/** Pattern pulse - for streak milestones */
export function vibrateMilestone() {
  if (supportsVibration) navigator.vibrate([100, 50, 100, 50, 100, 50, 300]);
}

/** Cancel any ongoing vibration */
export function vibrateCancel() {
  if (supportsVibration) navigator.vibrate(0);
}
