import db from "./db";
import exercisesData from "@/data/exercises.json";
import programData from "@/data/program.json";

/**
 * Seeds only exercises and user settings (not the program).
 * Used when user selects their own program during onboarding.
 */
export async function seedExercisesOnly(): Promise<void> {
  // Check if exercises already seeded
  const existingExercises = await db.exercises.count();
  if (existingExercises > 0) {
    console.log("Exercises already seeded");
  } else {
    console.log("Seeding exercises...");
    const exercises = exercisesData.exercises.map((ex) => ({
      ...ex,
      videoUrl: undefined,
      createdAt: new Date().toISOString(),
    }));
    await db.exercises.bulkAdd(exercises);
    console.log(`Seeded ${exercises.length} exercises`);
  }

  // Seed default user settings if not exists
  const existingSettings = await db.userSettings.count();
  if (existingSettings === 0) {
    await db.userSettings.add({
      id: "user-settings",
      weightUnit: "kg",
      defaultRestSeconds: 90,
      soundEnabled: true,
      autoProgressWeight: true,
      progressionIncrement: 2.5,
    });
    console.log("Seeded user settings");
  }
}

/**
 * Seeds the full database including the default program.
 * Used for legacy compatibility - new users go through onboarding.
 */
export async function seedDatabase(): Promise<void> {
  // Check if already seeded
  const existingExercises = await db.exercises.count();
  if (existingExercises > 0) {
    console.log("Database already seeded");
    return;
  }

  console.log("Seeding database...");

  // Seed exercises
  const exercises = exercisesData.exercises.map((ex) => ({
    ...ex,
    videoUrl: undefined,
    createdAt: new Date().toISOString(),
  }));
  await db.exercises.bulkAdd(exercises);
  console.log(`Seeded ${exercises.length} exercises`);

  // Seed program
  const program = {
    ...programData.program,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.programs.add(program);
  console.log("Seeded program:", program.name);

  // Seed training days
  await db.trainingDays.bulkAdd(programData.trainingDays);
  console.log(`Seeded ${programData.trainingDays.length} training days`);

  // Seed default user settings
  await db.userSettings.add({
    id: "user-settings",
    weightUnit: "kg",
    defaultRestSeconds: 90,
    soundEnabled: true,
    autoProgressWeight: true,
    progressionIncrement: 2.5,
  });
  console.log("Seeded user settings");

  console.log("Database seeding complete!");
}

export async function clearDatabase(): Promise<void> {
  await db.exercises.clear();
  await db.programs.clear();
  await db.trainingDays.clear();
  await db.workoutLogs.clear();
  await db.personalRecords.clear();
  await db.userSettings.clear();
  console.log("Database cleared");
}
