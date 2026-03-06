"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Calendar, Flame, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { estimateMuscleRecovery } from "@/lib/recovery";
import { getRoutinesForMuscles } from "@/data/mobility-routines";
import type { MobilityRoutine } from "@/data/mobility-routines";
import { RecoveryAssessment } from "@/components/rest-day/RecoveryAssessment";
import { MuscleRecoveryCard } from "@/components/rest-day/MuscleRecoveryCard";
import { MobilityRoutineCard } from "@/components/rest-day/MobilityRoutineCard";
import { ActiveRecoverySession } from "@/components/rest-day/ActiveRecoverySession";
import { HydrationTracker } from "@/components/rest-day/HydrationTracker";
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
  const [activeRoutine, setActiveRoutine] = useState<MobilityRoutine | null>(
    null
  );

  // Muscle recovery estimates from last workout
  const recoveryEstimates = useMemo(() => {
    if (!lastWorkout) return [];
    return estimateMuscleRecovery(
      lastWorkout as unknown as import("@/lib/db").WorkoutLog,
      exercises as unknown as Map<string, import("@/lib/db").Exercise>
    );
  }, [lastWorkout, exercises]);

  // Total volume from last workout
  const totalVolume = useMemo(() => {
    return recoveryEstimates.reduce((sum, est) => sum + est.totalVolume, 0);
  }, [recoveryEstimates]);

  // Trained muscles from recovery estimates
  const trainedMuscles = useMemo(() => {
    return recoveryEstimates.map((est) => est.muscleGroup);
  }, [recoveryEstimates]);

  // Mobility routines matching trained muscles
  const suggestedRoutines = useMemo(() => {
    return getRoutinesForMuscles(trainedMuscles);
  }, [trainedMuscles]);

  return (
    <>
      <div className="px-4 space-y-5">
        {/* State indicator */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#38BDF8]/20 flex items-center justify-center">
            <Moon className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
          <span className="text-sm font-medium text-[#38BDF8]">
            Recovery Day
          </span>
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
                    Complete a mobility routine to maintain it
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recovery Self-Assessment */}
        <RecoveryAssessment />

        {/* Muscle Recovery Timeline */}
        {recoveryEstimates.length > 0 && (
          <MuscleRecoveryCard
            estimates={recoveryEstimates}
            totalVolume={totalVolume}
            workoutName={lastWorkout?.dayName}
          />
        )}

        {/* Suggested Mobility Routines */}
        {suggestedRoutines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
              Suggested Mobility
            </h4>
            <div className="space-y-3">
              {suggestedRoutines.slice(0, 2).map((routine) => (
                <MobilityRoutineCard
                  key={routine.id}
                  routine={routine}
                  onStart={setActiveRoutine}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Hydration Tracker */}
        <HydrationTracker />

        {/* Next workout */}
        {nextDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
              Next Workout
            </h4>
            <Card className="bg-card border-border p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#38BDF8]" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {nextDay.name}
                    </p>
                    <p className="text-xs text-white/40">
                      {nextDay.supersets.reduce(
                        (a, s) => a + s.exercises.length,
                        0
                      )}{" "}
                      exercises
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
          <Card className="bg-card border-border p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">This Week</span>
              <span className="text-sm font-medium text-white">
                {weeklyWorkouts}/{weeklyTarget} workouts
              </span>
            </div>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-[#38BDF8] rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (weeklyWorkouts / Math.max(weeklyTarget, 1)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Active Recovery Session (full-screen overlay) */}
      <AnimatePresence>
        {activeRoutine && (
          <ActiveRecoverySession
            routine={activeRoutine}
            onComplete={() => setActiveRoutine(null)}
            onClose={() => setActiveRoutine(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
