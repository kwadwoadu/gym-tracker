"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Droplets, Check, Play } from "lucide-react";
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
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const allChecked = warmupChecklist.length > 0 && checkedItems.size === warmupChecklist.length;

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

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

      {/* Warmup checklist */}
      {warmupChecklist.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className={`${LABEL.caption} text-white/40 mb-2`}>
            Warmup Checklist
          </h4>
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] divide-y divide-[#2A2A2A]">
            {warmupChecklist.map((item, i) => (
              <button
                key={i}
                onClick={() => toggleItem(i)}
                className="w-full px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      checkedItems.has(i)
                        ? "bg-[#CDFF00] border-[#CDFF00]"
                        : "border-[#3A3A3A]"
                    }`}
                  >
                    {checkedItems.has(i) && <Check className="w-3.5 h-3.5 text-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium transition-colors ${checkedItems.has(i) ? "text-white/40 line-through" : "text-white"}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">{item.description}</p>
                  </div>
                  <Badge className="bg-white/5 text-white/50 border-white/10 text-xs shrink-0">
                    {item.duration}
                  </Badge>
                </div>
              </button>
            ))}
          </Card>
          <AnimatePresence>
            {allChecked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-2"
              >
                <p className="text-sm font-medium text-[#CDFF00]">Warmup complete! Time to train</p>
              </motion.div>
            )}
          </AnimatePresence>
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
