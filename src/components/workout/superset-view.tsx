"use client";

import { ExerciseCard } from "./exercise-card";
import type { Exercise } from "@/lib/api-client";

interface Superset {
  id: string;
  label: string;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    reps: string;
    tempo?: string;
    restSeconds?: number;
  }>;
}

interface SupersetViewProps {
  superset: Superset;
  exercises: Map<string, Exercise>;
  lastWorkoutData?: Map<string, { weight: number; reps: number }>;
}

export function SupersetView({
  superset,
  exercises,
  lastWorkoutData,
}: SupersetViewProps) {
  return (
    <div className="space-y-2">
      {/* Superset header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider px-2">
          Superset {superset.label}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {superset.exercises.map((ssExercise, index) => {
          const exercise = exercises.get(ssExercise.exerciseId);
          if (!exercise) return null;

          const lastData = lastWorkoutData?.get(
            `${ssExercise.exerciseId}-1`
          );

          return (
            <ExerciseCard
              key={ssExercise.exerciseId}
              name={exercise.name}
              sets={ssExercise.sets}
              reps={ssExercise.reps}
              tempo={ssExercise.tempo}
              restSeconds={ssExercise.restSeconds}
              videoUrl={exercise.videoUrl}
              muscleGroups={exercise.muscleGroups}
              supersetLabel={superset.label}
              exerciseLabel={String(index + 1)}
              lastWeekWeight={lastData?.weight}
              lastWeekReps={lastData?.reps}
            />
          );
        })}
      </div>
    </div>
  );
}
