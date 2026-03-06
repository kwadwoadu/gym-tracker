"use client";

import { GripVertical } from "lucide-react";
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
    <div className="border-l-2 border-l-primary pl-3 space-y-2">
      {/* Superset header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-[0.08em]">
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
            <div key={ssExercise.exerciseId} className="flex items-start gap-2">
              {/* Drag handle indicator */}
              <div className="pt-5 text-muted-foreground/40">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Exercise card */}
              <div className="flex-1 min-w-0">
                <ExerciseCard
                  exerciseId={ssExercise.exerciseId}
                  name={exercise.name}
                  sets={ssExercise.sets}
                  reps={ssExercise.reps}
                  tempo={ssExercise.tempo}
                  restSeconds={ssExercise.restSeconds}
                  videoUrl={exercise.videoUrl}
                  muscleGroups={exercise.muscleGroups}
                  muscles={exercise.muscles}
                  supersetLabel={superset.label}
                  exerciseLabel={String(index + 1)}
                  lastWeekWeight={lastData?.weight}
                  lastWeekReps={lastData?.reps}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
