/**
 * Recovery tips engine based on trained muscle groups
 */

export interface RecoveryTip {
  title: string;
  description: string;
  duration: string;
  muscleGroups: string[];
}

const TIPS_BY_MUSCLE: Record<string, RecoveryTip[]> = {
  chest: [
    { title: "Doorway Chest Stretch", description: "Hold for 30s each side, arm at 90 degrees", duration: "2 min", muscleGroups: ["chest"] },
    { title: "Foam Roll Pecs", description: "Slow rolls across chest, pause on tender spots", duration: "3 min", muscleGroups: ["chest"] },
  ],
  back: [
    { title: "Cat-Cow Stretch", description: "10 reps, slow and controlled breathing", duration: "2 min", muscleGroups: ["back"] },
    { title: "Child's Pose", description: "Hold for 60s, reach arms forward", duration: "1 min", muscleGroups: ["back", "shoulders"] },
  ],
  shoulders: [
    { title: "Cross-Body Shoulder Stretch", description: "30s each arm, gentle pull", duration: "2 min", muscleGroups: ["shoulders"] },
    { title: "Band Pull-Aparts", description: "15 reps light resistance for blood flow", duration: "2 min", muscleGroups: ["shoulders", "back"] },
  ],
  quads: [
    { title: "Standing Quad Stretch", description: "30s each leg, keep knees together", duration: "2 min", muscleGroups: ["quads"] },
    { title: "Foam Roll Quads", description: "Front of thigh, pause on tender spots", duration: "4 min", muscleGroups: ["quads"] },
  ],
  hamstrings: [
    { title: "Standing Hamstring Stretch", description: "Foot on elevated surface, hinge forward", duration: "2 min", muscleGroups: ["hamstrings"] },
    { title: "Foam Roll Hamstrings", description: "Slow rolls, back of thigh", duration: "3 min", muscleGroups: ["hamstrings"] },
  ],
  glutes: [
    { title: "Pigeon Pose", description: "30s each side, keep hips square", duration: "2 min", muscleGroups: ["glutes", "hip_flexors"] },
    { title: "Figure-4 Stretch", description: "Lying on back, 30s each side", duration: "2 min", muscleGroups: ["glutes"] },
  ],
  biceps: [
    { title: "Wall Bicep Stretch", description: "Palm flat on wall, rotate body away", duration: "1 min", muscleGroups: ["biceps"] },
  ],
  triceps: [
    { title: "Overhead Tricep Stretch", description: "Elbow behind head, gentle push, 30s each", duration: "2 min", muscleGroups: ["triceps"] },
  ],
  calves: [
    { title: "Wall Calf Stretch", description: "Lean into wall, straight back leg, 30s each", duration: "2 min", muscleGroups: ["calves"] },
  ],
  core: [
    { title: "Cobra Stretch", description: "Gentle back extension, hold 20s x 3", duration: "2 min", muscleGroups: ["core"] },
  ],
};

export function getRecoveryTips(trainedMuscles: string[]): RecoveryTip[] {
  const seen = new Set<string>();
  const tips: RecoveryTip[] = [];

  for (const muscle of trainedMuscles) {
    const muscleTips = TIPS_BY_MUSCLE[muscle] || TIPS_BY_MUSCLE[muscle.toLowerCase()] || [];
    for (const tip of muscleTips) {
      if (!seen.has(tip.title)) {
        seen.add(tip.title);
        tips.push(tip);
      }
    }
  }

  return tips.slice(0, 3);
}

/**
 * Extract muscle groups from a workout log's exercises
 */
export function getMuscleGroupsFromWorkout(
  sets: Array<{ exerciseId: string }>,
  exerciseMap: Map<string, { muscleGroups: string[] }>
): string[] {
  const muscles = new Set<string>();
  for (const set of sets) {
    const exercise = exerciseMap.get(set.exerciseId);
    if (exercise) {
      for (const mg of exercise.muscleGroups) {
        muscles.add(mg);
      }
    }
  }
  return Array.from(muscles);
}
