/**
 * Form cues, common mistakes, and muscle activation data for exercises.
 * Static data - no CDN dependency. Videos can be added later.
 */

export interface FormCue {
  text: string;
  phase: "setup" | "eccentric" | "bottom" | "concentric" | "top";
}

export interface FormMistake {
  text: string;
  severity: "common" | "dangerous";
}

export interface MuscleInfo {
  name: string;
  activation: "primary" | "secondary";
}

export interface ExerciseFormData {
  cues: FormCue[];
  mistakes: FormMistake[];
  muscles: MuscleInfo[];
}

// Map exercise names (lowercase) to form data
export const EXERCISE_FORM_DATA: Record<string, ExerciseFormData> = {
  "barbell bench press": {
    cues: [
      { text: "Retract shoulder blades and arch upper back", phase: "setup" },
      { text: "Drive feet into the floor for leg drive", phase: "setup" },
      { text: "Lower bar to nipple line with elbows at 45 degrees", phase: "eccentric" },
      { text: "Pause briefly at chest, maintain tension", phase: "bottom" },
      { text: "Press up and slightly back, lock out arms", phase: "concentric" },
    ],
    mistakes: [
      { text: "Bouncing the bar off your chest", severity: "dangerous" },
      { text: "Flaring elbows past 45 degrees", severity: "common" },
      { text: "Lifting hips off the bench", severity: "common" },
    ],
    muscles: [
      { name: "Chest (Pectoralis Major)", activation: "primary" },
      { name: "Front Delts", activation: "secondary" },
      { name: "Triceps", activation: "secondary" },
    ],
  },
  "barbell squat": {
    cues: [
      { text: "Bar placement on upper traps, grip tight", phase: "setup" },
      { text: "Brace core, big breath before descending", phase: "setup" },
      { text: "Break at hips and knees simultaneously", phase: "eccentric" },
      { text: "Keep knees tracking over toes", phase: "eccentric" },
      { text: "Drive through midfoot, squeeze glutes at top", phase: "concentric" },
    ],
    mistakes: [
      { text: "Knees caving inward (valgus)", severity: "dangerous" },
      { text: "Excessive forward lean/good-morning squat", severity: "common" },
      { text: "Not hitting parallel depth", severity: "common" },
    ],
    muscles: [
      { name: "Quads", activation: "primary" },
      { name: "Glutes", activation: "primary" },
      { name: "Hamstrings", activation: "secondary" },
      { name: "Core", activation: "secondary" },
    ],
  },
  "conventional deadlift": {
    cues: [
      { text: "Feet hip-width, bar over mid-foot", phase: "setup" },
      { text: "Hinge at hips, flat back, chest up", phase: "setup" },
      { text: "Push floor away with legs, then extend hips", phase: "concentric" },
      { text: "Lock out with glutes, don't hyperextend", phase: "top" },
      { text: "Hinge back, bar stays close to body", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Rounding the lower back", severity: "dangerous" },
      { text: "Jerking the bar off the floor", severity: "common" },
      { text: "Bar drifting away from body", severity: "common" },
    ],
    muscles: [
      { name: "Hamstrings", activation: "primary" },
      { name: "Glutes", activation: "primary" },
      { name: "Back (Erector Spinae)", activation: "primary" },
      { name: "Quads", activation: "secondary" },
      { name: "Traps", activation: "secondary" },
    ],
  },
  "barbell row": {
    cues: [
      { text: "Hinge forward, torso at ~45 degrees", phase: "setup" },
      { text: "Pull to belly button, not chest", phase: "concentric" },
      { text: "Squeeze shoulder blades together at top", phase: "top" },
      { text: "Lower with control, full arm extension", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Using excessive body momentum", severity: "common" },
      { text: "Pulling too high (to chest instead of belly)", severity: "common" },
      { text: "Rounding the lower back", severity: "dangerous" },
    ],
    muscles: [
      { name: "Back (Lats)", activation: "primary" },
      { name: "Rhomboids", activation: "primary" },
      { name: "Rear Delts", activation: "secondary" },
      { name: "Biceps", activation: "secondary" },
    ],
  },
  "overhead press": {
    cues: [
      { text: "Bar at collarbone, elbows slightly in front", phase: "setup" },
      { text: "Brace core, squeeze glutes", phase: "setup" },
      { text: "Press bar up and slightly back overhead", phase: "concentric" },
      { text: "Push head through once bar passes forehead", phase: "top" },
      { text: "Lower with control back to collarbone", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Excessive back arch (leaning back)", severity: "dangerous" },
      { text: "Pressing the bar forward instead of overhead", severity: "common" },
      { text: "Not locking out at the top", severity: "common" },
    ],
    muscles: [
      { name: "Shoulders (All Heads)", activation: "primary" },
      { name: "Triceps", activation: "secondary" },
      { name: "Upper Chest", activation: "secondary" },
      { name: "Core", activation: "secondary" },
    ],
  },
  "pull-up": {
    cues: [
      { text: "Hang with arms fully extended, shoulder-width grip", phase: "setup" },
      { text: "Initiate pull by depressing shoulder blades", phase: "concentric" },
      { text: "Pull chest to bar, chin above bar", phase: "top" },
      { text: "Lower with control, full extension at bottom", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Kipping or swinging for momentum", severity: "common" },
      { text: "Half reps (not going to full extension)", severity: "common" },
      { text: "Shrugging shoulders up during pull", severity: "common" },
    ],
    muscles: [
      { name: "Back (Lats)", activation: "primary" },
      { name: "Biceps", activation: "secondary" },
      { name: "Rear Delts", activation: "secondary" },
      { name: "Core", activation: "secondary" },
    ],
  },
  "dumbbell lateral raise": {
    cues: [
      { text: "Slight bend in elbows, palms facing down", phase: "setup" },
      { text: "Raise arms to shoulder height, lead with elbows", phase: "concentric" },
      { text: "Brief hold at top, shoulders depressed", phase: "top" },
      { text: "Lower slowly with control", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Using too much weight and swinging", severity: "common" },
      { text: "Shrugging traps up during the raise", severity: "common" },
      { text: "Raising above shoulder height", severity: "common" },
    ],
    muscles: [
      { name: "Side Delts", activation: "primary" },
      { name: "Front Delts", activation: "secondary" },
      { name: "Traps", activation: "secondary" },
    ],
  },
  "barbell curl": {
    cues: [
      { text: "Shoulder-width grip, elbows pinned to sides", phase: "setup" },
      { text: "Curl up with controlled tempo, squeeze at top", phase: "concentric" },
      { text: "Lower slowly, full extension at bottom", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Swinging body for momentum", severity: "common" },
      { text: "Elbows drifting forward during curl", severity: "common" },
      { text: "Not going to full extension on lowering", severity: "common" },
    ],
    muscles: [
      { name: "Biceps", activation: "primary" },
      { name: "Forearms", activation: "secondary" },
    ],
  },
  "romanian deadlift": {
    cues: [
      { text: "Feet hip-width, slight knee bend", phase: "setup" },
      { text: "Hinge at hips, push butt back", phase: "eccentric" },
      { text: "Bar slides down thighs, stop at mid-shin", phase: "bottom" },
      { text: "Squeeze hamstrings and glutes to return", phase: "concentric" },
    ],
    mistakes: [
      { text: "Rounding the lower back", severity: "dangerous" },
      { text: "Bending knees too much (turning it into a squat)", severity: "common" },
      { text: "Not keeping the bar close to legs", severity: "common" },
    ],
    muscles: [
      { name: "Hamstrings", activation: "primary" },
      { name: "Glutes", activation: "primary" },
      { name: "Lower Back", activation: "secondary" },
    ],
  },
  "hip thrust": {
    cues: [
      { text: "Upper back on bench, feet flat shoulder-width", phase: "setup" },
      { text: "Drive through heels, squeeze glutes at top", phase: "concentric" },
      { text: "Hold 1-2 seconds at top, chin tucked", phase: "top" },
      { text: "Lower hips with control, don't bounce", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Hyperextending the lower back at top", severity: "common" },
      { text: "Pushing through toes instead of heels", severity: "common" },
      { text: "Not reaching full hip extension", severity: "common" },
    ],
    muscles: [
      { name: "Glutes", activation: "primary" },
      { name: "Hamstrings", activation: "secondary" },
      { name: "Core", activation: "secondary" },
    ],
  },
  "cable row": {
    cues: [
      { text: "Sit tall, slight bend in knees, chest up", phase: "setup" },
      { text: "Pull handle to lower chest, squeeze shoulder blades", phase: "concentric" },
      { text: "Hold 1 second at contraction", phase: "top" },
      { text: "Extend arms fully with control, slight stretch", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Rounding back and leaning too far forward", severity: "common" },
      { text: "Using momentum instead of controlled pull", severity: "common" },
      { text: "Shrugging shoulders up during pull", severity: "common" },
    ],
    muscles: [
      { name: "Back (Lats)", activation: "primary" },
      { name: "Rhomboids", activation: "primary" },
      { name: "Biceps", activation: "secondary" },
      { name: "Rear Delts", activation: "secondary" },
    ],
  },
  "dumbbell chest press": {
    cues: [
      { text: "Flat bench, dumbbells at chest level, palms forward", phase: "setup" },
      { text: "Press up in a slight arc, dumbbells meet at top", phase: "concentric" },
      { text: "Squeeze chest at top, arms nearly locked", phase: "top" },
      { text: "Lower slowly, elbows at 45 degrees", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Dropping elbows too low below bench level", severity: "common" },
      { text: "Flaring elbows out past 45 degrees", severity: "common" },
      { text: "Not controlling the negative", severity: "common" },
    ],
    muscles: [
      { name: "Chest (Pectoralis Major)", activation: "primary" },
      { name: "Front Delts", activation: "secondary" },
      { name: "Triceps", activation: "secondary" },
    ],
  },
  "lat pulldown": {
    cues: [
      { text: "Grip slightly wider than shoulders, lean back slightly", phase: "setup" },
      { text: "Pull bar to upper chest, drive elbows down", phase: "concentric" },
      { text: "Squeeze lats at bottom, chest up", phase: "bottom" },
      { text: "Return with control, full arm extension at top", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Pulling behind the neck", severity: "dangerous" },
      { text: "Using too much body momentum", severity: "common" },
      { text: "Not going to full extension at the top", severity: "common" },
    ],
    muscles: [
      { name: "Back (Lats)", activation: "primary" },
      { name: "Biceps", activation: "secondary" },
      { name: "Rear Delts", activation: "secondary" },
    ],
  },
  "tricep pushdown": {
    cues: [
      { text: "Stand close to cable, elbows pinned to sides", phase: "setup" },
      { text: "Push down until arms fully extended", phase: "concentric" },
      { text: "Squeeze triceps at the bottom", phase: "bottom" },
      { text: "Return slowly, elbows stay fixed", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Elbows flaring out or drifting forward", severity: "common" },
      { text: "Leaning over the bar for extra leverage", severity: "common" },
      { text: "Not achieving full lockout", severity: "common" },
    ],
    muscles: [
      { name: "Triceps", activation: "primary" },
    ],
  },
  "face pull": {
    cues: [
      { text: "Rope at face height, overhand grip", phase: "setup" },
      { text: "Pull rope to face, elbows high and wide", phase: "concentric" },
      { text: "Externally rotate at end, hands beside ears", phase: "top" },
      { text: "Return with control, feel stretch in rear delts", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Using too much weight and swinging", severity: "common" },
      { text: "Not pulling far enough back", severity: "common" },
      { text: "Elbows dropping below shoulder height", severity: "common" },
    ],
    muscles: [
      { name: "Rear Delts", activation: "primary" },
      { name: "Traps (Mid/Lower)", activation: "primary" },
      { name: "Rotator Cuff", activation: "secondary" },
    ],
  },
  "walking lunge": {
    cues: [
      { text: "Stand tall, step forward into lunge", phase: "setup" },
      { text: "Lower until both knees at 90 degrees", phase: "eccentric" },
      { text: "Drive through front heel to step forward", phase: "concentric" },
      { text: "Keep torso upright throughout", phase: "top" },
    ],
    mistakes: [
      { text: "Knee pushing past toes excessively", severity: "common" },
      { text: "Leaning forward, losing balance", severity: "common" },
      { text: "Taking too short or too long steps", severity: "common" },
    ],
    muscles: [
      { name: "Quads", activation: "primary" },
      { name: "Glutes", activation: "primary" },
      { name: "Hamstrings", activation: "secondary" },
      { name: "Core", activation: "secondary" },
    ],
  },
  "leg press": {
    cues: [
      { text: "Feet shoulder-width on platform, mid-height", phase: "setup" },
      { text: "Lower weight until knees at 90 degrees", phase: "eccentric" },
      { text: "Press through full foot, don't lock knees", phase: "concentric" },
    ],
    mistakes: [
      { text: "Locking out knees at the top", severity: "dangerous" },
      { text: "Letting lower back round off the pad", severity: "dangerous" },
      { text: "Using too narrow a range of motion", severity: "common" },
    ],
    muscles: [
      { name: "Quads", activation: "primary" },
      { name: "Glutes", activation: "secondary" },
      { name: "Hamstrings", activation: "secondary" },
    ],
  },
};

/**
 * Look up form data by exercise name (case-insensitive, partial match)
 */
export function getFormData(exerciseName: string): ExerciseFormData | null {
  const lower = exerciseName.toLowerCase();

  // Exact match
  if (EXERCISE_FORM_DATA[lower]) return EXERCISE_FORM_DATA[lower];

  // Partial match
  for (const [key, data] of Object.entries(EXERCISE_FORM_DATA)) {
    if (lower.includes(key) || key.includes(lower)) return data;
  }

  return null;
}
