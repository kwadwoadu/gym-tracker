/**
 * Pre-built mobility routines for rest day active recovery
 */

export interface MobilityMovement {
  name: string;
  holdSeconds: number;
  sides: "both" | "left_right";
  description: string;
  targetMuscle: string;
}

export interface MobilityRoutine {
  id: string;
  name: string;
  targetMuscles: string[];
  durationMinutes: number;
  movements: MobilityMovement[];
}

export const MOBILITY_ROUTINES: MobilityRoutine[] = [
  {
    id: "lower-body-recovery",
    name: "Lower Body Recovery Flow",
    targetMuscles: ["quads", "hamstrings", "glutes", "calves"],
    durationMinutes: 12,
    movements: [
      {
        name: "Pigeon Stretch",
        holdSeconds: 45,
        sides: "left_right",
        description:
          "Front knee at 90 degrees, back leg extended. Sink hips toward floor.",
        targetMuscle: "glutes",
      },
      {
        name: "Couch Stretch",
        holdSeconds: 45,
        sides: "left_right",
        description:
          "Back knee against wall, front foot planted. Drive hips forward.",
        targetMuscle: "quads",
      },
      {
        name: "Standing Hamstring Fold",
        holdSeconds: 60,
        sides: "both",
        description:
          "Feet hip-width, fold forward from hips. Let gravity pull you down.",
        targetMuscle: "hamstrings",
      },
      {
        name: "90/90 Hip Switch",
        holdSeconds: 30,
        sides: "left_right",
        description:
          "Sit with both knees at 90 degrees. Rotate to switch sides.",
        targetMuscle: "glutes",
      },
      {
        name: "Wall Calf Stretch",
        holdSeconds: 30,
        sides: "left_right",
        description:
          "Hands on wall, one foot back with heel down. Lean forward.",
        targetMuscle: "calves",
      },
      {
        name: "Deep Squat Hold",
        holdSeconds: 60,
        sides: "both",
        description:
          "Full depth squat, elbows pressing knees out. Hold and breathe.",
        targetMuscle: "quads",
      },
    ],
  },
  {
    id: "upper-body-recovery",
    name: "Upper Body Recovery Flow",
    targetMuscles: ["chest", "back", "shoulders", "biceps", "triceps"],
    durationMinutes: 10,
    movements: [
      {
        name: "Doorway Chest Stretch",
        holdSeconds: 30,
        sides: "left_right",
        description:
          "Arm at 90 degrees on door frame. Step through until stretch in chest.",
        targetMuscle: "chest",
      },
      {
        name: "Thread the Needle",
        holdSeconds: 30,
        sides: "left_right",
        description:
          "On all fours, reach one arm under body. Follow with gaze.",
        targetMuscle: "back",
      },
      {
        name: "Cross-Body Shoulder Stretch",
        holdSeconds: 30,
        sides: "left_right",
        description:
          "Pull arm across chest with opposite hand. Keep shoulder down.",
        targetMuscle: "shoulders",
      },
      {
        name: "Overhead Tricep Stretch",
        holdSeconds: 30,
        sides: "left_right",
        description:
          "Reach behind head, elbow pointing up. Gently push elbow back.",
        targetMuscle: "triceps",
      },
      {
        name: "Hanging Lat Stretch",
        holdSeconds: 45,
        sides: "both",
        description:
          "Hang from pull-up bar or door frame. Relax shoulders completely.",
        targetMuscle: "back",
      },
    ],
  },
  {
    id: "full-body-mobility",
    name: "Full Body Mobility",
    targetMuscles: [
      "quads",
      "hamstrings",
      "glutes",
      "chest",
      "back",
      "shoulders",
    ],
    durationMinutes: 15,
    movements: [
      {
        name: "Cat-Cow Flow",
        holdSeconds: 30,
        sides: "both",
        description:
          "Alternate arching and rounding your spine. Match breath to movement.",
        targetMuscle: "back",
      },
      {
        name: "World's Greatest Stretch",
        holdSeconds: 30,
        sides: "left_right",
        description:
          "Lunge position, rotate torso and reach arm to sky. Deep hip opener.",
        targetMuscle: "glutes",
      },
      {
        name: "Pigeon Stretch",
        holdSeconds: 45,
        sides: "left_right",
        description:
          "Front knee at 90 degrees, back leg extended. Sink hips toward floor.",
        targetMuscle: "glutes",
      },
      {
        name: "Doorway Chest Stretch",
        holdSeconds: 30,
        sides: "left_right",
        description:
          "Arm at 90 degrees on door frame. Step through until stretch in chest.",
        targetMuscle: "chest",
      },
      {
        name: "Standing Hamstring Fold",
        holdSeconds: 60,
        sides: "both",
        description:
          "Feet hip-width, fold forward from hips. Let gravity pull you down.",
        targetMuscle: "hamstrings",
      },
      {
        name: "Deep Squat Hold",
        holdSeconds: 60,
        sides: "both",
        description:
          "Full depth squat, elbows pressing knees out. Hold and breathe.",
        targetMuscle: "quads",
      },
    ],
  },
];

export function getRoutinesForMuscles(
  trainedMuscles: string[]
): MobilityRoutine[] {
  const matching = MOBILITY_ROUTINES.filter((routine) =>
    routine.targetMuscles.some((m) => trainedMuscles.includes(m))
  );

  // If no match, return full body as fallback
  if (matching.length === 0) {
    return MOBILITY_ROUTINES.filter((r) => r.id === "full-body-mobility");
  }

  return matching;
}
