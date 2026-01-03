import {
  exercisesApi,
  programsApi,
  workoutLogsApi,
  personalRecordsApi,
  settingsApi,
} from "./api-client";
import exercisesData from "@/data/exercises.json";
import programData from "@/data/program.json";

/**
 * Seeds only exercises and user settings (not the program).
 * Used when user selects their own program during onboarding.
 */
export async function seedExercisesOnly(): Promise<void> {
  // Check if exercises already seeded
  const existingExercises = await exercisesApi.list();
  if (existingExercises.length > 0) {
    console.log("Exercises already seeded");
  } else {
    console.log("Seeding exercises...");
    for (const ex of exercisesData.exercises) {
      await exercisesApi.create({
        name: ex.name,
        muscleGroups: ex.muscleGroups,
        equipment: ex.equipment,
        videoUrl: null,
      });
    }
    console.log(`Seeded ${exercisesData.exercises.length} exercises`);
  }

  // Seed default user settings if not exists
  try {
    await settingsApi.get();
    console.log("User settings already exist");
  } catch {
    // Settings don't exist, they'll be created on first access
    console.log("User settings will be created on first access");
  }
}

/**
 * Seeds the full database including the default program.
 * Used for legacy compatibility - new users go through onboarding.
 */
export async function seedDatabase(): Promise<void> {
  // Check if already seeded
  const existingExercises = await exercisesApi.list();
  if (existingExercises.length > 0) {
    console.log("Database already seeded");
    return;
  }

  console.log("Seeding database...");

  // Seed exercises
  for (const ex of exercisesData.exercises) {
    await exercisesApi.create({
      name: ex.name,
      muscleGroups: ex.muscleGroups,
      equipment: ex.equipment,
      videoUrl: null,
    });
  }
  console.log(`Seeded ${exercisesData.exercises.length} exercises`);

  // Seed program with training days
  const program = programData.program;
  await programsApi.create({
    name: program.name,
    description: program.description,
    isActive: program.isActive,
    trainingDays: programData.trainingDays.map((day) => ({
      name: day.name,
      dayNumber: day.dayNumber,
      warmup: day.warmup || [],
      supersets: day.supersets || [],
      finisher: day.finisher || [],
    })),
  });
  console.log("Seeded program:", program.name);
  console.log(`Seeded ${programData.trainingDays.length} training days`);

  console.log("Database seeding complete!");
}

export async function clearDatabase(): Promise<void> {
  // Delete all exercises
  const exercises = await exercisesApi.list();
  for (const exercise of exercises) {
    await exercisesApi.delete(exercise.id);
  }

  // Delete all programs (cascade deletes training days)
  const programs = await programsApi.list();
  for (const program of programs) {
    await programsApi.delete(program.id);
  }

  // Delete all workouts
  const workouts = await workoutLogsApi.list();
  for (const workout of workouts) {
    await workoutLogsApi.delete(workout.id);
  }

  // Delete all personal records
  const prs = await personalRecordsApi.list();
  for (const pr of prs) {
    await personalRecordsApi.delete(pr.id);
  }

  console.log("Database cleared");
}
