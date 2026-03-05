"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sun, Flame, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  currentStreak,
  weeklyWorkouts,
  weeklyTarget,
  streakAtRisk,
}: MorningDashboardProps) {
  const router = useRouter();
  return (
    <div className="px-4 space-y-5">
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

      {/* Weekly progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-5">
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

      {/* Start Workout CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold bg-[#CDFF00] text-[#0A0A0A] hover:bg-[#CDFF00]/90 transition-colors"
          onClick={() => router.push(`/workout/${todayWorkout.id}`)}
        >
          <Play className="w-5 h-5 mr-2" />
          Start {todayWorkout.name}
        </Button>
      </motion.div>
    </div>
  );
}
