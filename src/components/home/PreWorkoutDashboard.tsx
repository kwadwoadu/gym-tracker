"use client";

import { motion } from "framer-motion";
import { Flame, Clock, Dumbbell, Droplets } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { estimateWorkoutDuration, countExercises } from "@/lib/workout-duration";
import type { TrainingDay, Exercise } from "@/lib/api-client";

interface PreWorkoutDashboardProps {
  todayWorkout: TrainingDay;
  exercises: Map<string, Exercise>;
}

export function PreWorkoutDashboard({
  todayWorkout,
  exercises,
}: PreWorkoutDashboardProps) {
  const duration = estimateWorkoutDuration(todayWorkout);
  const exerciseCount = countExercises(todayWorkout);

  // Get muscle groups for warmup suggestions
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

  const warmupChecklist = getWarmupForMuscles(todayMuscles);

  return (
    <div className="px-4 space-y-4">
      {/* State indicator */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[#FF6B35]/20 flex items-center justify-center">
          <Flame className="w-3.5 h-3.5 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-[#FF6B35]">Ready to train</span>
      </div>

      {/* Hydration reminder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="bg-blue-500/10 border-blue-500/20 p-4">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-300">Stay Hydrated</p>
              <p className="text-xs text-blue-300/60 mt-0.5">
                Drink 500ml water before starting
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Workout summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-5">
          <h3 className="text-lg font-bold text-white mb-1">
            {todayWorkout.name}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-white/50 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>~{duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>{exerciseCount} exercises</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {todayMuscles.slice(0, 6).map((mg) => (
              <Badge
                key={mg}
                className="bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20 text-xs capitalize"
              >
                {mg}
              </Badge>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Warmup checklist */}
      {warmupChecklist.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Warmup Checklist
          </h4>
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] divide-y divide-[#2A2A2A]">
            {warmupChecklist.map((item, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{item.description}</p>
                  </div>
                  <Badge className="bg-white/5 text-white/50 border-white/10 text-xs shrink-0 ml-2">
                    {item.duration}
                  </Badge>
                </div>
              </div>
            ))}
          </Card>
        </motion.div>
      )}
    </div>
  );
}

interface WarmupItem {
  name: string;
  description: string;
  duration: string;
}

function getWarmupForMuscles(muscles: string[]): WarmupItem[] {
  const items: WarmupItem[] = [];
  const seen = new Set<string>();

  const WARMUPS: Record<string, WarmupItem[]> = {
    chest: [{ name: "Arm Circles", description: "20 forward, 20 backward", duration: "1 min" }],
    back: [{ name: "Band Pull-Aparts", description: "15 reps light resistance", duration: "1 min" }],
    shoulders: [{ name: "Shoulder Dislocates", description: "10 reps with band or stick", duration: "1 min" }],
    quads: [{ name: "Bodyweight Squats", description: "15 reps controlled tempo", duration: "1 min" }],
    hamstrings: [{ name: "Leg Swings", description: "10 each leg, front to back", duration: "1 min" }],
    glutes: [{ name: "Glute Bridges", description: "15 reps with 2s hold at top", duration: "1 min" }],
    core: [{ name: "Dead Bugs", description: "10 reps alternating sides", duration: "1 min" }],
  };

  for (const muscle of muscles) {
    const warmups = WARMUPS[muscle] || WARMUPS[muscle.toLowerCase()];
    if (warmups) {
      for (const w of warmups) {
        if (!seen.has(w.name)) {
          seen.add(w.name);
          items.push(w);
        }
      }
    }
  }

  return items.slice(0, 4);
}
