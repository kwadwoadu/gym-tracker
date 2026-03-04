/**
 * Exercise-specific form rules for AI form analysis
 * V1: 8 compound movements with validated checkpoints
 */

export interface FormCheckpoint {
  id: string;
  label: string;
  description: string;
  phase: "eccentric" | "concentric" | "isometric" | "any";
  weight: number; // 0-1, how much this checkpoint affects overall score
}

export interface FormRule {
  exerciseId: string;
  exerciseName: string;
  cameraAngle: "side" | "front" | "rear" | "side-or-front";
  checkpoints: FormCheckpoint[];
  commonErrors: string[];
  setupTips: string[];
}

export const FORM_RULES: FormRule[] = [
  {
    exerciseId: "ex-barbell-squat",
    exerciseName: "Barbell Back Squat",
    cameraAngle: "side",
    checkpoints: [
      {
        id: "squat-depth",
        label: "Squat Depth",
        description: "Hip crease at or below knee level",
        phase: "eccentric",
        weight: 0.25,
      },
      {
        id: "squat-knee-tracking",
        label: "Knee Tracking",
        description: "Knees track over toes, not caving inward",
        phase: "any",
        weight: 0.2,
      },
      {
        id: "squat-back-angle",
        label: "Back Angle",
        description: "Torso between 45-75 degrees from horizontal",
        phase: "any",
        weight: 0.2,
      },
      {
        id: "squat-spine-neutral",
        label: "Neutral Spine",
        description: "No excessive rounding or hyperextension",
        phase: "any",
        weight: 0.2,
      },
      {
        id: "squat-lockout",
        label: "Full Lockout",
        description: "Hips and knees fully extended at top",
        phase: "concentric",
        weight: 0.15,
      },
    ],
    commonErrors: [
      "Knees caving inward (valgus)",
      "Butt wink at bottom",
      "Forward lean / good morning squat",
      "Cutting depth short",
    ],
    setupTips: [
      "Prop phone against water bottle at hip height",
      "6-8 feet away, side view",
      "Side angle captures depth best",
    ],
  },
  {
    exerciseId: "ex-barbell-front-squat",
    exerciseName: "Barbell Front Squat",
    cameraAngle: "side",
    checkpoints: [
      {
        id: "fsquat-depth",
        label: "Squat Depth",
        description: "Hip crease at or below knee level",
        phase: "eccentric",
        weight: 0.25,
      },
      {
        id: "fsquat-elbow-position",
        label: "Elbow Position",
        description: "Elbows high, upper arms parallel to floor",
        phase: "any",
        weight: 0.25,
      },
      {
        id: "fsquat-torso-upright",
        label: "Upright Torso",
        description: "More upright than back squat (60-85 deg)",
        phase: "any",
        weight: 0.25,
      },
      {
        id: "fsquat-lockout",
        label: "Full Lockout",
        description: "Hips and knees fully extended at top",
        phase: "concentric",
        weight: 0.25,
      },
    ],
    commonErrors: [
      "Elbows dropping (bar rolls forward)",
      "Excessive forward lean",
      "Wrist strain from improper grip",
    ],
    setupTips: [
      "Side view is essential for elbow position",
      "6-8 feet away",
    ],
  },
  {
    exerciseId: "ex-barbell-bench",
    exerciseName: "Barbell Bench Press",
    cameraAngle: "side",
    checkpoints: [
      {
        id: "bench-bar-path",
        label: "Bar Path",
        description: "Slight arc from chest to over shoulders",
        phase: "concentric",
        weight: 0.25,
      },
      {
        id: "bench-elbow-angle",
        label: "Elbow Angle",
        description: "75-90 degree elbow angle at bottom",
        phase: "eccentric",
        weight: 0.2,
      },
      {
        id: "bench-touch-point",
        label: "Touch Point",
        description: "Bar touches mid to lower chest",
        phase: "eccentric",
        weight: 0.2,
      },
      {
        id: "bench-scapula",
        label: "Scapula Retraction",
        description: "Shoulders pinched back throughout",
        phase: "any",
        weight: 0.2,
      },
      {
        id: "bench-lockout",
        label: "Full Lockout",
        description: "Arms fully extended at top",
        phase: "concentric",
        weight: 0.15,
      },
    ],
    commonErrors: [
      "Elbows flaring to 90 degrees",
      "Bouncing bar off chest",
      "Hips lifting off bench",
      "Uneven lockout",
    ],
    setupTips: [
      "Side view captures bar path and elbow angle",
      "Position camera at bench height",
    ],
  },
  {
    exerciseId: "ex-barbell-deadlift",
    exerciseName: "Barbell Deadlift",
    cameraAngle: "side",
    checkpoints: [
      {
        id: "dl-spine-neutral",
        label: "Neutral Spine",
        description: "Less than 10 degrees of lumbar flexion",
        phase: "any",
        weight: 0.3,
      },
      {
        id: "dl-hip-hinge",
        label: "Hip Hinge Pattern",
        description: "Hips and knees extend together",
        phase: "concentric",
        weight: 0.25,
      },
      {
        id: "dl-bar-path",
        label: "Bar Path",
        description: "Bar stays close to body throughout",
        phase: "any",
        weight: 0.2,
      },
      {
        id: "dl-lockout",
        label: "Full Lockout",
        description: "Hips fully extended, shoulders back",
        phase: "concentric",
        weight: 0.25,
      },
    ],
    commonErrors: [
      "Rounding lower back",
      "Hips shooting up first",
      "Bar drifting away from body",
      "Hyperextending at top",
    ],
    setupTips: [
      "Side view is essential",
      "Camera at hip height, 6-8 feet away",
    ],
  },
  {
    exerciseId: "ex-barbell-overhead-press",
    exerciseName: "Barbell Overhead Press",
    cameraAngle: "side",
    checkpoints: [
      {
        id: "ohp-bar-path",
        label: "Bar Path",
        description: "Vertical path over mid-foot",
        phase: "concentric",
        weight: 0.3,
      },
      {
        id: "ohp-core-bracing",
        label: "Core Bracing",
        description: "No excessive back lean",
        phase: "any",
        weight: 0.25,
      },
      {
        id: "ohp-lockout",
        label: "Full Lockout",
        description: "Arms fully extended overhead",
        phase: "concentric",
        weight: 0.25,
      },
      {
        id: "ohp-head-movement",
        label: "Head Position",
        description: "Head moves forward through the window at top",
        phase: "concentric",
        weight: 0.2,
      },
    ],
    commonErrors: [
      "Excessive back lean (turning into incline press)",
      "Bar path drifting forward",
      "Incomplete lockout",
    ],
    setupTips: ["Side view captures bar path and back lean"],
  },
  {
    exerciseId: "ex-barbell-row",
    exerciseName: "Barbell Bent-Over Row",
    cameraAngle: "side",
    checkpoints: [
      {
        id: "row-back-angle",
        label: "Back Angle",
        description: "30-45 degree torso angle from horizontal",
        phase: "any",
        weight: 0.25,
      },
      {
        id: "row-pull-point",
        label: "Pull Point",
        description: "Bar to lower chest or upper abs",
        phase: "concentric",
        weight: 0.25,
      },
      {
        id: "row-spine-neutral",
        label: "Neutral Spine",
        description: "No rounding during pull",
        phase: "any",
        weight: 0.25,
      },
      {
        id: "row-full-stretch",
        label: "Full Stretch",
        description: "Arms fully extended at bottom",
        phase: "eccentric",
        weight: 0.25,
      },
    ],
    commonErrors: [
      "Using momentum / body english",
      "Torso rising during pull",
      "Pulling to wrong position",
    ],
    setupTips: ["Side view shows back angle and bar path"],
  },
  {
    exerciseId: "ex-romanian-deadlift",
    exerciseName: "Romanian Deadlift",
    cameraAngle: "side",
    checkpoints: [
      {
        id: "rdl-hip-hinge",
        label: "Hip Hinge",
        description: "Hips push back, minimal knee bend",
        phase: "eccentric",
        weight: 0.3,
      },
      {
        id: "rdl-spine-neutral",
        label: "Neutral Spine",
        description: "Flat back throughout movement",
        phase: "any",
        weight: 0.3,
      },
      {
        id: "rdl-stretch",
        label: "Hamstring Stretch",
        description: "Bar reaches shin level with tension",
        phase: "eccentric",
        weight: 0.2,
      },
      {
        id: "rdl-lockout",
        label: "Hip Extension",
        description: "Full hip extension at top, glutes squeezed",
        phase: "concentric",
        weight: 0.2,
      },
    ],
    commonErrors: [
      "Rounding lower back",
      "Too much knee bend (turns into deadlift)",
      "Not pushing hips back enough",
    ],
    setupTips: ["Side view is essential for hip hinge visibility"],
  },
  {
    exerciseId: "ex-bulgarian-split-squat",
    exerciseName: "Bulgarian Split Squat",
    cameraAngle: "side-or-front",
    checkpoints: [
      {
        id: "bss-depth",
        label: "Depth",
        description: "Back knee approaches floor",
        phase: "eccentric",
        weight: 0.25,
      },
      {
        id: "bss-knee-tracking",
        label: "Front Knee Tracking",
        description: "Front knee tracks over toes",
        phase: "any",
        weight: 0.25,
      },
      {
        id: "bss-torso-upright",
        label: "Upright Torso",
        description: "Minimal forward lean",
        phase: "any",
        weight: 0.25,
      },
      {
        id: "bss-balance",
        label: "Balance",
        description: "Minimal lateral sway",
        phase: "any",
        weight: 0.25,
      },
    ],
    commonErrors: [
      "Front knee caving inward",
      "Excessive forward lean",
      "Not going deep enough",
      "Rear foot too high or too low on bench",
    ],
    setupTips: [
      "Side or front view both work",
      "Ensure full body is visible including rear foot",
    ],
  },
];

export function getFormRuleByExerciseId(
  exerciseId: string
): FormRule | undefined {
  return FORM_RULES.find((r) => r.exerciseId === exerciseId);
}

export function getSupportedExerciseIds(): string[] {
  return FORM_RULES.map((r) => r.exerciseId);
}

export function isFormAnalysisSupported(exerciseId: string): boolean {
  return FORM_RULES.some((r) => r.exerciseId === exerciseId);
}
