"use client";

import { motion } from "framer-motion";
import { Moon, Calendar, Flame, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecoveryTips } from "@/lib/recovery-tips";
import type { TrainingDay, WorkoutLog, Exercise } from "@/lib/api-client";

interface RestDayDashboardProps {
  nextDay: TrainingDay | null;
  lastWorkout: WorkoutLog | null;
  exercises: Map<string, Exercise>;
  currentStreak: number;
  weeklyWorkouts: number;
  weeklyTarget: number;
  streakAtRisk: boolean;
}

export function RestDayDashboard({
  nextDay,
  lastWorkout,
  exercises,
  currentStreak,
  weeklyWorkouts,
  weeklyTarget,
  streakAtRisk,
}: RestDayDashboardProps) {
  // Get muscle groups from last workout for recovery tips
  const lastWorkoutMuscles: string[] = [];
  if (lastWorkout) {
    const sets = (lastWorkout.sets || []) as Array<{ exerciseId: string }>;
    for (const s of sets) {
      const ex = exercises.get(s.exerciseId);
      if (ex) ex.muscleGroups.forEach((mg) => {
        if (!lastWorkoutMuscles.includes(mg)) lastWorkoutMuscles.push(mg);
      });
    }
  }

  const recoveryTips = getRecoveryTips(lastWorkoutMuscles);

  return (
    <div className="px-4 space-y-4">
      {/* State indicator */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[#7B8CDE]/20 flex items-center justify-center">
          <Moon className="w-3.5 h-3.5 text-[#7B8CDE]" />
        </div>
        <span className="text-sm font-medium text-[#7B8CDE]">Recovery Day</span>
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
                  Keep your {currentStreak}-day streak!
                </p>
                <p className="text-xs text-amber-300/60 mt-0.5">
                  Log a stretch or walk to maintain it
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recovery card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-5">
          <h3 className="text-lg font-bold text-white mb-2">Your Muscles Are Rebuilding</h3>
          {lastWorkoutMuscles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {lastWorkoutMuscles.slice(0, 6).map((mg) => (
                <Badge
                  key={mg}
                  className="bg-[#7B8CDE]/10 text-[#7B8CDE] border-[#7B8CDE]/20 text-xs capitalize"
                >
                  {mg}
                </Badge>
              ))}
            </div>
          )}
          <p className="text-sm text-white/40 mt-3">
            Rest these groups for 48 hours for optimal recovery.
          </p>
        </Card>
      </motion.div>

      {/* Mobility suggestions */}
      {recoveryTips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Mobility Suggestions
          </h4>
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] divide-y divide-[#2A2A2A]">
            {recoveryTips.map((tip, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{tip.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{tip.description}</p>
                  </div>
                  <Badge className="bg-white/5 text-white/50 border-white/10 text-xs shrink-0 ml-2">
                    {tip.duration}
                  </Badge>
                </div>
              </div>
            ))}
          </Card>
        </motion.div>
      )}

      {/* Next workout */}
      {nextDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Next Workout
          </h4>
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#7B8CDE]" />
                <div>
                  <p className="text-sm font-medium text-white">{nextDay.name}</p>
                  <p className="text-xs text-white/40">
                    {nextDay.supersets.reduce((a, s) => a + s.exercises.length, 0)} exercises
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Weekly progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
              className="h-full bg-[#7B8CDE] rounded-full transition-all"
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
