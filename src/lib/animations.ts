/**
 * Shared Framer Motion animation presets for SetFlow.
 * Import these instead of defining inline spring configs.
 */

// Spring configs
export const SPRING_BOUNCY = { type: "spring" as const, stiffness: 400, damping: 10 };
export const SPRING_SNAPPY = { type: "spring" as const, stiffness: 300, damping: 20 };
export const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };

// Button press feedback
export const BUTTON_TAP = { scale: 0.95 };
export const BUTTON_TAP_TRANSITION = SPRING_SNAPPY;

// Card interactions
export const CARD_HOVER = { y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" };
export const CARD_TAP = { scale: 0.98 };

// Weight input bounce
export const WEIGHT_BOUNCE_UP = {
  y: [0, -8, 0],
  transition: { duration: 0.3, ease: "easeOut" as const },
};
export const WEIGHT_BOUNCE_DOWN = {
  y: [0, 8, 0],
  transition: { duration: 0.3, ease: "easeOut" as const },
};

// Set completion sequence
export const SET_COMPLETE_PULSE = {
  scale: [1, 1.03, 1],
  transition: { duration: 0.3 },
};

// Page transitions
export const PAGE_ENTER = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: SPRING_GENTLE,
};

export const PAGE_FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// Celebration variants
export const SCALE_IN = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: SPRING_BOUNCY,
};

export const SLIDE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: SPRING_SNAPPY,
};
