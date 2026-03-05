"use client";

import { motion } from "framer-motion";
import { Sun, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TrainingDay, WorkoutLog, Exercise } from "@/lib/api-client";

interface MorningDashboardProps {
  todayWorkout: TrainingDay;
  lastWorkout: WorkoutLog | null;
  exercises: Map<string, Exercise>;
  currentStreak: number;
  weeklyWorkouts: number;
  weeklyTarget: number;
  streakAtRisk: boolean;
}

export function MorningDashboard({
  todayWorkout,
  lastWorkout,
  exercises,
  currentStreak,
  weeklyWorkouts,
  weeklyTarget,
  streakAtRisk,
}: MorningDashboardProps) {
  // Get muscle groups for today's workout
  const supersets = todayWorkout.supersets as Array<{
    exercises: Array<{ exerciseId: string }>;
  }>;
  const todayMuscles: string[] = [];
  for (const ss of supersets) {
    for (const e of ss.exercises) {
      const ex = exercises.get(e.exerciseId);
      if (ex) ex.muscleGroups.forEach((mg) => {
        if (!todayMuscles.includes(mg)) todayMuscles.push(mg);
      });
    }
  }

  // Last workout volume for same day
  const lastVolume = lastWorkout
    ? ((lastWorkout.sets || []) as Array<{ weight: number; actualReps: number }>).reduce(
        (acc, s) => acc + s.weight * s.actualReps,
        0
      )
    : 0;

  return (
    <div className="px-4 space-y-4">
      {/* State indicator */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[#CDFF00]/20 flex items-center justify-center">
          <Sun className="w-3.5 h-3.5 text-[#CDFF00]" />
        </div>
        <span className="text-sm font-medium text-[#CDFF00]">Good morning</span>
      </div>

      {/* Streak risk banner */}
      {streakAtRisk && currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-amber-500/10 border-amber-500/20 p-4">
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-300">
                  Train today to keep your {currentStreak}-day streak!
                </p>
                <p className="text-xs text-amber-300/60 mt-0.5">
                  {weeklyWorkouts}/{weeklyTarget} workouts this week
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Muscle groups + last volume */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-4">
          {/* Muscle groups */}
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

          {/* Last time comparison */}
          {lastWorkout && lastVolume > 0 && (
            <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
              <p className="text-xs text-white/40">
                Last time: {lastVolume > 1000 ? `${(lastVolume / 1000).toFixed(1)}k` : lastVolume}kg total volume
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Weekly progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">This Week</span>
            <span className="text-sm font-medium text-white">
              {weeklyWorkouts}/{weeklyTarget} workouts
            </span>
          </div>
          <div className="mt-2 h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#CDFF00] rounded-full transition-all"
              style={{
                width: `${Math.min((weeklyWorkouts / Math.max(weeklyTarget, 1)) * 100, 100)}%`,
              }}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
