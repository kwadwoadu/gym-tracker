"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Clock, Dumbbell, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TrainingDay, WorkoutLog, Exercise } from "@/lib/api-client";
import { estimateWorkoutDuration, countExercises, countSupersets } from "@/lib/workout-duration";
import { getNextTrainingDay } from "@/lib/next-day";
import { vibrateShort } from "@/lib/haptics";
import { HEADING } from "@/lib/typography";
import { ELEVATION } from "@/lib/elevation";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface HeroWorkoutCardProps {
  currentDay: TrainingDay | null;
  sortedDays: TrainingDay[];
  workoutLogs: WorkoutLog[];
  activeWorkout?: { id: string; dayId: string } | null;
  onSelectDay: (dayId: string) => void;
  exercises?: Map<string, Exercise>;
}

export function HeroWorkoutCard({
  currentDay,
  sortedDays,
  workoutLogs,
  activeWorkout,
  onSelectDay,
  exercises,
}: HeroWorkoutCardProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  if (!currentDay) return null;

  const duration = estimateWorkoutDuration(currentDay);
  const exerciseCount = countExercises(currentDay);
  const supersetCount = countSupersets(currentDay);
  const nextDay = getNextTrainingDay(sortedDays, workoutLogs || []);
  const isResume = activeWorkout && activeWorkout.dayId === currentDay.id;
  const showQuickStart = nextDay && nextDay.id !== currentDay.id && sortedDays.length > 1;

  // Find last completed workout date
  const lastCompleted = workoutLogs
    ?.filter((l) => l.isComplete)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  const lastCompletedLabel = lastCompleted
    ? formatRelativeDate(lastCompleted.date)
    : null;

  // Get muscle groups for today's workout
  const supersets = currentDay.supersets as Array<{
    exercises: Array<{ exerciseId: string }>;
  }>;
  const todayMuscles: string[] = [];
  if (exercises) {
    for (const ss of supersets) {
      for (const e of ss.exercises) {
        const ex = exercises.get(e.exerciseId);
        if (ex) ex.muscleGroups.forEach((mg) => {
          if (!todayMuscles.includes(mg)) todayMuscles.push(mg);
        });
      }
    }
  }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 py-4"
    >
      <div className={`${ELEVATION.hero} space-y-4`}>
        {/* Day name + stats */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className={`${HEADING.h2} text-white`}>{currentDay.name}</h2>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-[#A0A0A0]">
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5" />
                {exerciseCount} exercises
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {supersetCount} supersets
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-[#A0A0A0]">
            <Clock className="w-3.5 h-3.5" />
            ~{duration}min
          </div>
        </div>

        {/* Muscle groups */}
        {todayMuscles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {todayMuscles.slice(0, 6).map((mg) => (
              <Badge
                key={mg}
                className="bg-[#CDFF00]/10 text-[#CDFF00] border-[#CDFF00]/20 text-xs capitalize"
              >
                {mg}
              </Badge>
            ))}
          </div>
        )}

        {/* Last completed indicator */}
        {lastCompletedLabel && (
          <p className="text-xs text-[#666666]">
            Last trained: {lastCompletedLabel}
          </p>
        )}

        {/* Primary CTA */}
        <motion.div
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            size="lg"
            className="w-full h-12 text-base font-semibold bg-[#CDFF00] text-[#0A0A0A] hover:bg-[#CDFF00]/90 transition-colors"
            onClick={() => {
              vibrateShort();
              router.push(`/workout/${currentDay.id}`);
            }}
          >
            <Play className="w-5 h-5 mr-2" />
            {isResume ? "Resume Workout" : `Start ${currentDay.name}`}
          </Button>
        </motion.div>

        {/* Quick Start */}
        {showQuickStart && nextDay && (
          <button
            onClick={() => {
              vibrateShort();
              onSelectDay(nextDay.id);
              router.push(`/workout/${nextDay.id}`);
            }}
            className="w-full text-center text-sm text-[#A0A0A0] hover:text-[#CDFF00] transition-colors min-h-[44px] flex items-center justify-center"
          >
            Quick Start: {nextDay.name} (next)
          </button>
        )}
      </div>
    </motion.div>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";

  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
