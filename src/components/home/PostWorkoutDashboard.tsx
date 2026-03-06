"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Dumbbell, TrendingUp, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecoveryTips } from "@/lib/recovery-tips";
import type { WorkoutLog, Exercise, TrainingDay } from "@/lib/api-client";
import { DATA, LABEL } from "@/lib/typography";
import { ELEVATION } from "@/lib/elevation";

interface PostWorkoutDashboardProps {
  workout: WorkoutLog;
  exercises: Map<string, Exercise>;
  nextDay: TrainingDay | null;
}

export function PostWorkoutDashboard({
  workout,
  exercises,
  nextDay,
}: PostWorkoutDashboardProps) {
  const sets = (workout.sets || []) as Array<{
    exerciseId: string;
    weight: number;
    actualReps: number;
  }>;

  const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.actualReps, 0);
  const totalSets = sets.length;
  const duration = workout.duration || 0;

  // Get unique muscle groups trained
  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    for (const s of sets) {
      const ex = exercises.get(s.exerciseId);
      if (ex) ex.muscleGroups.forEach((mg) => groups.add(mg));
    }
    return Array.from(groups);
  }, [sets, exercises]);

  const recoveryTips = getRecoveryTips(muscleGroups);

  return (
    <div className="px-4 space-y-5">
      {/* State indicator */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[#00D4AA]/20 flex items-center justify-center">
          <Trophy className="w-3.5 h-3.5 text-[#00D4AA]" />
        </div>
        <span className="text-sm font-medium text-[#00D4AA]">Session Complete</span>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={ELEVATION.hero}>
          <h3 className="text-lg font-bold text-white mb-4">Great Session!</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-white/40" />
              </div>
              <p className={`${DATA.medium} text-white`}>{duration}m</p>
              <p className="text-xs text-white/40">Duration</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Dumbbell className="w-4 h-4 text-white/40" />
              </div>
              <p className={`${DATA.medium} text-white`}>
                {totalVolume > 1000
                  ? `${(totalVolume / 1000).toFixed(1)}k`
                  : totalVolume}
              </p>
              <p className="text-xs text-white/40">Volume (kg)</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-white/40" />
              </div>
              <p className={`${DATA.medium} text-white`}>{totalSets}</p>
              <p className="text-xs text-white/40">Sets</p>
            </div>
          </div>

          {/* Muscle groups */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {muscleGroups.slice(0, 6).map((mg) => (
              <Badge
                key={mg}
                className="bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20 text-xs capitalize"
              >
                {mg}
              </Badge>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recovery tips */}
      {recoveryTips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className={`${LABEL.caption} text-white/40 mb-2`}>
            Recovery
          </h4>
          <Card className="bg-card border-border divide-y divide-[#2A2A2A]">
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

      {/* Next workout preview */}
      {nextDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className={`${LABEL.caption} text-white/40 mb-2`}>
            Next Workout
          </h4>
          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{nextDay.name}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {nextDay.supersets.length} supersets -{" "}
                  {nextDay.supersets.reduce((a, s) => a + s.exercises.length, 0)} exercises
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
