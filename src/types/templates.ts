export interface WorkoutTemplate {
  id: string;
  authorId: string;
  authorName: string;
  programName: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  splitType: "ppl" | "upper_lower" | "full_body" | "bro_split" | "other";
  dayCount: number;
  estimatedDuration: number;
  programData: SerializedProgram;
  upvotes: number;
  imports: number;
  createdAt: string;
  updatedAt: string;
  hasVoted?: boolean;
}

export interface SerializedProgram {
  name: string;
  days: SerializedTrainingDay[];
}

export interface SerializedTrainingDay {
  name: string;
  warmup: SerializedExercise[];
  supersets: SerializedSuperset[];
  finisher: SerializedExercise[];
}

export interface SerializedSuperset {
  label: string;
  exercises: SerializedExercise[];
}

export interface SerializedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  tempo?: string;
  restSeconds?: number;
}

export type SplitType = WorkoutTemplate["splitType"];
export type Difficulty = WorkoutTemplate["difficulty"];

export const SPLIT_LABELS: Record<SplitType, string> = {
  ppl: "PPL",
  upper_lower: "Upper/Lower",
  full_body: "Full Body",
  bro_split: "Bro Split",
  other: "Other",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
