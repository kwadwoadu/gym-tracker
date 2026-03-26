"use client";

import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { SetLogger } from "@/components/workout/set-logger";
import type { Exercise } from "@/lib/api-client";
import type { FlatExercise } from "@/lib/flatten-exercises";

interface SetLoggerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flatExercise: FlatExercise | null;
  exercise: Exercise | null;
  setNumber: number;
  totalSets: number;
  suggestedWeight?: number;
  suggestedReps?: number;
  suggestedRpe?: number;
  lastWeekWeight?: number;
  lastWeekReps?: number;
  lastWorkoutDate?: string;
  hitTargetLastTime?: boolean;
  memorySource?: "session" | "historical";
  onComplete: (weight: number, reps: number, rpe?: number) => void;
  onSkip: () => void;
}

export function SetLoggerSheet({
  open,
  onOpenChange,
  flatExercise,
  exercise,
  setNumber,
  totalSets,
  suggestedWeight,
  suggestedReps,
  suggestedRpe,
  lastWeekWeight,
  lastWeekReps,
  lastWorkoutDate,
  hitTargetLastTime,
  memorySource,
  onComplete,
  onSkip,
}: SetLoggerSheetProps) {
  if (!flatExercise || !exercise) return null;

  // Parse target reps for current set
  const repsParts = flatExercise.reps.split(",").map((r) => r.trim());
  const targetRepsStr = repsParts[Math.min(setNumber - 1, repsParts.length - 1)] || flatExercise.reps;
  // Extract the first number from rep ranges like "8-10"
  const targetReps = parseInt(targetRepsStr.split("-")[0]) || 10;

  // Build exercise label (e.g. "A1")
  const exerciseLabel = flatExercise.supersetSize > 1
    ? `${flatExercise.supersetLabel}${flatExercise.indexInSuperset + 1}`
    : flatExercise.supersetLabel;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card border-t border-border max-h-[70vh]">
        {/* Visible header with exercise context */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-black text-xs font-bold px-2 py-0.5">
              {exerciseLabel}
            </Badge>
            <DrawerTitle className="text-sm font-semibold text-foreground truncate max-w-[200px]">
              {exercise.name}
            </DrawerTitle>
          </div>
          <span className="text-xs text-muted-foreground">
            {flatExercise.sets} x {flatExercise.reps}
          </span>
        </div>
        <div className="px-4 py-2 overflow-y-auto">
          <SetLogger
            exerciseId={flatExercise.exerciseId}
            exerciseName={exercise.name}
            supersetLabel={flatExercise.supersetLabel}
            exerciseLabel={exerciseLabel}
            setNumber={setNumber}
            totalSets={totalSets}
            targetReps={targetReps}
            suggestedWeight={suggestedWeight}
            suggestedReps={suggestedReps}
            suggestedRpe={suggestedRpe}
            lastWeekWeight={lastWeekWeight}
            lastWeekReps={lastWeekReps}
            lastWorkoutDate={lastWorkoutDate}
            hitTargetLastTime={hitTargetLastTime}
            memorySource={memorySource}
            videoUrl={exercise.videoUrl || undefined}
            muscles={exercise.muscles}
            onComplete={onComplete}
            onSkip={onSkip}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
