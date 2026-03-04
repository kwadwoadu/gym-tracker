"use client";

import { motion } from "framer-motion";
import type { FlatExercise } from "@/lib/flatten-exercises";
import type { SetLog } from "@/lib/api-client";

interface ProgressDotsProps {
  flatExercises: FlatExercise[];
  currentIndex: number;
  completedSets: SetLog[];
}

export function ProgressDots({
  flatExercises,
  currentIndex,
  completedSets,
}: ProgressDotsProps) {
  // Group exercises by superset for visual grouping
  const groups: { label: string; exercises: FlatExercise[] }[] = [];
  let currentGroup: { label: string; exercises: FlatExercise[] } | null = null;

  for (const ex of flatExercises) {
    if (!currentGroup || currentGroup.label !== ex.supersetLabel) {
      currentGroup = { label: ex.supersetLabel, exercises: [] };
      groups.push(currentGroup);
    }
    currentGroup.exercises.push(ex);
  }

  // Check if an exercise has all sets completed
  const isExerciseComplete = (ex: FlatExercise): boolean => {
    const setsForExercise = completedSets.filter(
      (s) => s.exerciseId === ex.exerciseId
    );
    return setsForExercise.length >= ex.sets;
  };

  // Adaptive dot size based on total count
  const totalDots = flatExercises.length;
  const dotSize = totalDots > 14 ? 4 : totalDots > 9 ? 6 : 8;

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      {groups.map((group, gIdx) => (
        <div key={gIdx} className="flex items-center gap-1">
          {group.exercises.map((ex) => {
            const isCurrent = ex.globalIndex === currentIndex;
            const isComplete = isExerciseComplete(ex);

            return (
              <motion.div
                key={ex.globalIndex}
                className="rounded-full"
                style={{
                  width: dotSize,
                  height: dotSize,
                }}
                animate={{
                  backgroundColor: isComplete
                    ? "#CDFF00"
                    : isCurrent
                      ? "#CDFF00"
                      : "#333333",
                  scale: isCurrent ? 1.4 : 1,
                  opacity: isComplete ? 1 : isCurrent ? 1 : 0.5,
                }}
                transition={{ duration: 0.2 }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
