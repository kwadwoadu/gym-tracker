import { pgTable, text, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";

// Users table - linked to Clerk
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Exercises table
export const exercises = pgTable("exercises", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  videoUrl: text("video_url"),
  muscleGroups: jsonb("muscle_groups").$type<string[]>().notNull().default([]),
  equipment: text("equipment").notNull(),
  isCustom: boolean("is_custom").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // Soft delete for sync
}, (table) => [
  index("exercises_user_idx").on(table.userId),
]);

// Programs table
export const programs = pgTable("programs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("programs_user_idx").on(table.userId),
]);

// Training days table
export const trainingDays = pgTable("training_days", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  programId: text("program_id").notNull().references(() => programs.id),
  name: text("name").notNull(),
  dayNumber: integer("day_number").notNull(),
  warmup: jsonb("warmup").$type<WarmupExercise[]>().notNull().default([]),
  supersets: jsonb("supersets").$type<Superset[]>().notNull().default([]),
  finisher: jsonb("finisher").$type<FinisherExercise[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("training_days_user_idx").on(table.userId),
  index("training_days_program_idx").on(table.programId),
]);

// Workout logs table
export const workoutLogs = pgTable("workout_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  date: text("date").notNull(), // ISO date string
  programId: text("program_id").notNull(),
  dayId: text("day_id").notNull(),
  dayName: text("day_name").notNull(),
  sets: jsonb("sets").$type<SetLog[]>().notNull().default([]),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  duration: integer("duration"), // minutes
  notes: text("notes"),
  isComplete: boolean("is_complete").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("workout_logs_user_idx").on(table.userId),
  index("workout_logs_date_idx").on(table.date),
  index("workout_logs_day_idx").on(table.dayId),
]);

// Personal records table
export const personalRecords = pgTable("personal_records", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  exerciseId: text("exercise_id").notNull(),
  exerciseName: text("exercise_name").notNull(),
  weight: integer("weight").notNull(),
  reps: integer("reps").notNull(),
  unit: text("unit").$type<"kg" | "lbs">().notNull().default("kg"),
  date: text("date").notNull(),
  workoutLogId: text("workout_log_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("personal_records_user_idx").on(table.userId),
  index("personal_records_exercise_idx").on(table.exerciseId),
]);

// User settings table
export const userSettings = pgTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  weightUnit: text("weight_unit").$type<"kg" | "lbs">().notNull().default("kg"),
  defaultRestSeconds: integer("default_rest_seconds").notNull().default(90),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  autoProgressWeight: boolean("auto_progress_weight").notNull().default(true),
  progressionIncrement: integer("progression_increment").notNull().default(2.5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("user_settings_user_idx").on(table.userId),
]);

// Sync metadata table - tracks last sync timestamps
export const syncMetadata = pgTable("sync_metadata", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  lastSyncedAt: timestamp("last_synced_at").notNull(),
  deviceId: text("device_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Achievements table - tracks unlocked achievements
export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  achievementId: text("achievement_id").notNull(), // Maps to ACHIEVEMENTS array
  unlockedAt: timestamp("unlocked_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("achievements_user_idx").on(table.userId),
]);

// Onboarding profiles table - stores user preferences from onboarding flow
export const onboardingProfiles = pgTable("onboarding_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  goals: jsonb("goals").$type<string[]>().notNull().default([]),
  experienceLevel: text("experience_level").$type<"beginner" | "intermediate" | "advanced">(),
  trainingDaysPerWeek: integer("training_days_per_week"),
  equipment: text("equipment").$type<"full_gym" | "home_gym" | "bodyweight">(),
  heightCm: integer("height_cm"),
  weightKg: integer("weight_kg"),
  bodyFatPercent: integer("body_fat_percent"),
  injuries: jsonb("injuries").$type<string[]>().notNull().default([]),
  hasCompletedOnboarding: boolean("has_completed_onboarding").notNull().default(false),
  skippedOnboarding: boolean("skipped_onboarding").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("onboarding_profiles_user_idx").on(table.userId),
]);

// Type definitions for JSONB columns
interface WarmupExercise {
  exerciseId: string;
  duration?: number;
  reps?: number;
}

interface Superset {
  id: string;
  label: string;
  exercises: SupersetExercise[];
}

interface SupersetExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  tempo: string;
  restSeconds: number;
}

interface FinisherExercise {
  exerciseId: string;
  duration?: number;
  notes?: string;
}

interface SetLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  supersetLabel: string;
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weight: number;
  unit: "kg" | "lbs";
  rpe?: number;
  isComplete: boolean;
  completedAt?: string;
}
