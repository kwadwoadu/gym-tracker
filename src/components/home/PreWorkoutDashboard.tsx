"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, Droplets, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TrainingDay, Exercise } from "@/lib/api-client";
import { LABEL } from "@/lib/typography";

interface PreWorkoutDashboardProps {
  todayWorkout: TrainingDay;
  exercises: Map<string, Exercise>;
}

export function PreWorkoutDashboard({
  todayWorkout,
  exercises,
}: PreWorkoutDashboardProps) {
  const router = useRouter();

  const warmupExercises = (todayWorkout.warmup as Array<{ exerciseId: string; reps: number }>) || [];

  return (
    <div className="px-4 space-y-5">
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

      {/* Warmup */}
      {warmupExercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className={`${LABEL.caption} text-white/40 mb-2`}>
            Warmup
          </h4>
          <Card className="bg-card border-border divide-y divide-[#2A2A2A]">
            {warmupExercises.map((item, i) => {
              const ex = exercises.get(item.exerciseId);
              const name = ex?.name ?? item.exerciseId;
              return (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center justify-between min-w-0">
                    <p className="text-sm font-medium text-white truncate">{name}</p>
                    <Badge className="bg-white/5 text-white/50 border-white/10 text-xs shrink-0">
                      {item.reps} reps
                    </Badge>
                  </div>
                </div>
              );
            })}
          </Card>
        </motion.div>
      )}

      {/* Start Workout CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={() => router.push(`/workout/${todayWorkout.id}`)}
        >
          <Play className="w-5 h-5 mr-2" />
          Start {todayWorkout.name}
        </Button>
      </motion.div>
    </div>
  );
}
