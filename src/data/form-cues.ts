/**
 * Form cues, common mistakes, and muscle activation data for exercises.
 * Static data - no CDN dependency. Videos can be added later.
 * 30 exercises covering all major compound and isolation movements.
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
  breathingPattern: string;
  videoUrl: string | null;
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
    breathingPattern: "Inhale at the top, hold breath during descent, exhale as you press up",
    videoUrl: null,
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
    breathingPattern: "Big breath in and brace at the top, hold through descent, exhale at the top of the ascent",
    videoUrl: null,
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
    breathingPattern: "Big breath in and brace before the pull, hold through the lift, exhale at lockout",
    videoUrl: null,
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
    breathingPattern: "Exhale as you pull the bar up, inhale as you lower it back down",
    videoUrl: null,
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
    breathingPattern: "Inhale and brace before pressing, exhale as you press overhead",
    videoUrl: null,
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
    breathingPattern: "Exhale as you pull up, inhale as you lower down",
    videoUrl: null,
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
    breathingPattern: "Exhale as you raise the dumbbells, inhale as you lower them",
    videoUrl: null,
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
    breathingPattern: "Exhale as you curl up, inhale as you lower",
    videoUrl: null,
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
    breathingPattern: "Inhale as you hinge down, exhale as you drive hips forward to stand",
    videoUrl: null,
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
    breathingPattern: "Exhale as you thrust up, inhale as you lower hips",
    videoUrl: null,
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
    breathingPattern: "Exhale as you pull toward your body, inhale as you extend arms",
    videoUrl: null,
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
    breathingPattern: "Inhale as you lower dumbbells, exhale as you press up",
    videoUrl: null,
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
    breathingPattern: "Exhale as you pull the bar down, inhale as you release up",
    videoUrl: null,
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
    breathingPattern: "Exhale as you push down, inhale as you return",
    videoUrl: null,
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
    breathingPattern: "Exhale as you pull toward face, inhale as you extend arms forward",
    videoUrl: null,
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
    breathingPattern: "Inhale as you step and lower, exhale as you drive up",
    videoUrl: null,
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
    breathingPattern: "Inhale as you lower the platform, exhale as you press up",
    videoUrl: null,
  },
  // === 13 additional exercises (18-30) ===
  "incline dumbbell press": {
    cues: [
      { text: "Set bench to 30-45 degree incline", phase: "setup" },
      { text: "Dumbbells at shoulder level, palms forward", phase: "setup" },
      { text: "Press up and together in an arc", phase: "concentric" },
      { text: "Lower with control to upper chest level", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Setting incline too steep (becomes shoulder press)", severity: "common" },
      { text: "Letting dumbbells drift too far apart at the bottom", severity: "common" },
      { text: "Not controlling the descent", severity: "common" },
    ],
    muscles: [
      { name: "Upper Chest", activation: "primary" },
      { name: "Front Delts", activation: "secondary" },
      { name: "Triceps", activation: "secondary" },
    ],
    breathingPattern: "Inhale as you lower the dumbbells, exhale as you press up",
    videoUrl: null,
  },
  "cable fly": {
    cues: [
      { text: "Set cables at shoulder height, slight forward lean", phase: "setup" },
      { text: "Slight bend in elbows, maintain throughout", phase: "setup" },
      { text: "Bring hands together in a hugging arc", phase: "concentric" },
      { text: "Open arms wide with control, feel the stretch", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Bending elbows too much (turning it into a press)", severity: "common" },
      { text: "Going too heavy and losing the arc", severity: "common" },
      { text: "Not getting a full stretch at the open position", severity: "common" },
    ],
    muscles: [
      { name: "Chest (Pectoralis Major)", activation: "primary" },
      { name: "Front Delts", activation: "secondary" },
    ],
    breathingPattern: "Exhale as you bring hands together, inhale as you open arms",
    videoUrl: null,
  },
  "dumbbell row": {
    cues: [
      { text: "One knee and hand on bench, flat back", phase: "setup" },
      { text: "Pull dumbbell to hip, drive elbow back", phase: "concentric" },
      { text: "Squeeze shoulder blade at the top", phase: "top" },
      { text: "Lower with control, full arm extension", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Rotating torso to lift heavier weight", severity: "common" },
      { text: "Pulling to the chest instead of the hip", severity: "common" },
      { text: "Using momentum and jerking the weight", severity: "common" },
    ],
    muscles: [
      { name: "Back (Lats)", activation: "primary" },
      { name: "Rhomboids", activation: "secondary" },
      { name: "Biceps", activation: "secondary" },
      { name: "Rear Delts", activation: "secondary" },
    ],
    breathingPattern: "Exhale as you row the dumbbell up, inhale as you lower it",
    videoUrl: null,
  },
  "bulgarian split squat": {
    cues: [
      { text: "Rear foot on bench, front foot 2 feet ahead", phase: "setup" },
      { text: "Lower straight down, front knee tracks over toes", phase: "eccentric" },
      { text: "Rear knee approaches the floor without touching", phase: "bottom" },
      { text: "Drive through front heel to stand, squeeze glute", phase: "concentric" },
    ],
    mistakes: [
      { text: "Front foot too close to the bench", severity: "common" },
      { text: "Leaning forward excessively", severity: "common" },
      { text: "Front knee caving inward", severity: "dangerous" },
    ],
    muscles: [
      { name: "Quads", activation: "primary" },
      { name: "Glutes", activation: "primary" },
      { name: "Hamstrings", activation: "secondary" },
      { name: "Core", activation: "secondary" },
    ],
    breathingPattern: "Inhale as you lower down, exhale as you drive up",
    videoUrl: null,
  },
  "leg curl": {
    cues: [
      { text: "Adjust pad to sit just above ankles", phase: "setup" },
      { text: "Curl heels toward glutes with controlled tempo", phase: "concentric" },
      { text: "Squeeze hamstrings at full contraction", phase: "top" },
      { text: "Lower slowly, don't let the weight slam", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Using momentum to swing the weight", severity: "common" },
      { text: "Lifting hips off the pad", severity: "common" },
      { text: "Not achieving full range of motion", severity: "common" },
    ],
    muscles: [
      { name: "Hamstrings", activation: "primary" },
      { name: "Calves", activation: "secondary" },
    ],
    breathingPattern: "Exhale as you curl, inhale as you lower",
    videoUrl: null,
  },
  "leg extension": {
    cues: [
      { text: "Adjust pad to sit on lower shins, back flat", phase: "setup" },
      { text: "Extend legs fully, squeeze quads at top", phase: "concentric" },
      { text: "Hold briefly at full extension", phase: "top" },
      { text: "Lower with control, don't drop the weight", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Using too much weight and swinging", severity: "common" },
      { text: "Not achieving full extension", severity: "common" },
      { text: "Locking out with excessive force on the joint", severity: "dangerous" },
    ],
    muscles: [
      { name: "Quads", activation: "primary" },
    ],
    breathingPattern: "Exhale as you extend, inhale as you lower",
    videoUrl: null,
  },
  "dumbbell shoulder press": {
    cues: [
      { text: "Dumbbells at shoulder height, palms forward", phase: "setup" },
      { text: "Brace core, keep back flat against seat", phase: "setup" },
      { text: "Press dumbbells up and slightly together", phase: "concentric" },
      { text: "Lower with control to shoulder height", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Arching the back excessively", severity: "dangerous" },
      { text: "Not pressing to full lockout", severity: "common" },
      { text: "Elbows flaring too far forward or back", severity: "common" },
    ],
    muscles: [
      { name: "Shoulders (Front/Side Delts)", activation: "primary" },
      { name: "Triceps", activation: "secondary" },
      { name: "Upper Chest", activation: "secondary" },
    ],
    breathingPattern: "Exhale as you press overhead, inhale as you lower to shoulders",
    videoUrl: null,
  },
  "cable lateral raise": {
    cues: [
      { text: "Stand sideways to cable, handle in far hand", phase: "setup" },
      { text: "Slight lean away from cable for constant tension", phase: "setup" },
      { text: "Raise arm to shoulder height, lead with elbow", phase: "concentric" },
      { text: "Lower slowly, maintaining tension throughout", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Shrugging traps instead of using side delts", severity: "common" },
      { text: "Swinging the body for momentum", severity: "common" },
      { text: "Going above shoulder height", severity: "common" },
    ],
    muscles: [
      { name: "Side Delts", activation: "primary" },
      { name: "Traps", activation: "secondary" },
    ],
    breathingPattern: "Exhale as you raise, inhale as you lower",
    videoUrl: null,
  },
  "hammer curl": {
    cues: [
      { text: "Neutral grip (palms facing each other), elbows at sides", phase: "setup" },
      { text: "Curl dumbbells up without rotating wrists", phase: "concentric" },
      { text: "Squeeze at the top, keep elbows stationary", phase: "top" },
      { text: "Lower with control, full arm extension", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Swinging the body for momentum", severity: "common" },
      { text: "Rotating the wrists during the curl", severity: "common" },
      { text: "Not going to full extension at bottom", severity: "common" },
    ],
    muscles: [
      { name: "Biceps (Brachialis)", activation: "primary" },
      { name: "Forearms (Brachioradialis)", activation: "primary" },
      { name: "Biceps", activation: "secondary" },
    ],
    breathingPattern: "Exhale as you curl up, inhale as you lower",
    videoUrl: null,
  },
  "skull crusher": {
    cues: [
      { text: "Lie flat, arms extended straight up holding barbell/EZ bar", phase: "setup" },
      { text: "Lower bar toward forehead by bending only at elbows", phase: "eccentric" },
      { text: "Stop just above forehead, keep upper arms vertical", phase: "bottom" },
      { text: "Extend arms back to start, squeeze triceps", phase: "concentric" },
    ],
    mistakes: [
      { text: "Elbows flaring outward during the movement", severity: "common" },
      { text: "Upper arms moving (should stay stationary)", severity: "common" },
      { text: "Lowering bar to nose or above (hit forehead zone)", severity: "dangerous" },
    ],
    muscles: [
      { name: "Triceps", activation: "primary" },
    ],
    breathingPattern: "Inhale as you lower toward forehead, exhale as you extend arms",
    videoUrl: null,
  },
  "plank": {
    cues: [
      { text: "Forearms on floor, elbows under shoulders", phase: "setup" },
      { text: "Body forms a straight line from head to heels", phase: "setup" },
      { text: "Squeeze glutes and brace core throughout", phase: "top" },
      { text: "Keep neck neutral, eyes toward the floor", phase: "top" },
    ],
    mistakes: [
      { text: "Hips sagging toward the floor", severity: "dangerous" },
      { text: "Hips piking up too high", severity: "common" },
      { text: "Holding breath instead of breathing steadily", severity: "common" },
    ],
    muscles: [
      { name: "Core (Rectus Abdominis)", activation: "primary" },
      { name: "Core (Transverse Abdominis)", activation: "primary" },
      { name: "Shoulders", activation: "secondary" },
      { name: "Glutes", activation: "secondary" },
    ],
    breathingPattern: "Breathe steadily throughout - do not hold your breath",
    videoUrl: null,
  },
  "cable chest fly": {
    cues: [
      { text: "Set cables at low position, step forward into split stance", phase: "setup" },
      { text: "Slight bend in elbows, palms facing up", phase: "setup" },
      { text: "Bring hands together in an upward arc at chest height", phase: "concentric" },
      { text: "Return arms wide with control, feel the chest stretch", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Bending elbows too much during the movement", severity: "common" },
      { text: "Leaning too far forward and using momentum", severity: "common" },
      { text: "Letting the weight pull arms back too far", severity: "common" },
    ],
    muscles: [
      { name: "Chest (Pectoralis Major)", activation: "primary" },
      { name: "Front Delts", activation: "secondary" },
    ],
    breathingPattern: "Exhale as you bring hands together, inhale as you open arms",
    videoUrl: null,
  },
  "calf raise": {
    cues: [
      { text: "Balls of feet on edge of step, heels hanging off", phase: "setup" },
      { text: "Rise up on toes as high as possible", phase: "concentric" },
      { text: "Hold briefly at the top, squeeze calves", phase: "top" },
      { text: "Lower slowly below the step for full stretch", phase: "eccentric" },
    ],
    mistakes: [
      { text: "Bouncing at the bottom without full stretch", severity: "common" },
      { text: "Not going through full range of motion", severity: "common" },
      { text: "Using momentum instead of controlled reps", severity: "common" },
    ],
    muscles: [
      { name: "Calves (Gastrocnemius)", activation: "primary" },
      { name: "Calves (Soleus)", activation: "secondary" },
    ],
    breathingPattern: "Exhale as you rise up, inhale as you lower down",
    videoUrl: null,
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
