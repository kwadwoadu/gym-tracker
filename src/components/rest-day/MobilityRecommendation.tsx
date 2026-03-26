"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, Clock, Target } from "lucide-react";
import type { MobilityRoutine } from "@/data/mobility-routines";
import { MOBILITY_ROUTINES } from "@/data/mobility-routines";

// ============================================================
// Static recommendation data
// ============================================================

interface MobilityTip {
  title: string;
  description: string;
  duration: string;
  targetMuscles: string[];
}

/**
 * Quick standalone stretches organized by muscle group.
 * These supplement the full routines when the user wants
 * something shorter or more targeted.
 */
const QUICK_STRETCHES: Record<string, MobilityTip[]> = {
  chest: [
    {
      title: "Doorway Pec Stretch",
      description: "Arm at 90 degrees on door frame, lean through. Hold 30s each side.",
      duration: "2 min",
      targetMuscles: ["chest"],
    },
    {
      title: "Foam Roll Pecs",
      description: "Lie face down on foam roller, slow rolls across chest. Pause on tender spots.",
      duration: "3 min",
      targetMuscles: ["chest"],
    },
  ],
  back: [
    {
      title: "Cat-Cow Stretch",
      description: "On all fours, alternate arching and rounding. 10 slow reps with breath.",
      duration: "2 min",
      targetMuscles: ["back"],
    },
    {
      title: "Child's Pose Hold",
      description: "Knees wide, arms reaching forward. Sink hips to heels and hold 60s.",
      duration: "1 min",
      targetMuscles: ["back", "shoulders"],
    },
  ],
  shoulders: [
    {
      title: "Band Pull-Aparts",
      description: "Light band, 15 reps. Focus on squeezing shoulder blades together.",
      duration: "2 min",
      targetMuscles: ["shoulders", "back"],
    },
    {
      title: "Shoulder CARs",
      description: "Controlled articular rotations. 5 slow circles each direction per arm.",
      duration: "3 min",
      targetMuscles: ["shoulders"],
    },
  ],
  quads: [
    {
      title: "Couch Stretch",
      description: "Back knee against wall, front foot planted. Drive hips forward. 45s each side.",
      duration: "2 min",
      targetMuscles: ["quads", "hip_flexors"],
    },
    {
      title: "Foam Roll Quads",
      description: "Front of thigh on roller. Slow rolls from hip to knee, pause on tender spots.",
      duration: "4 min",
      targetMuscles: ["quads"],
    },
  ],
  hamstrings: [
    {
      title: "Standing Hamstring Fold",
      description: "Feet hip-width, fold forward from hips. Let gravity do the work. 60s hold.",
      duration: "1 min",
      targetMuscles: ["hamstrings"],
    },
    {
      title: "Foam Roll Hamstrings",
      description: "Back of thigh on roller. Cross one leg over for extra pressure.",
      duration: "3 min",
      targetMuscles: ["hamstrings"],
    },
  ],
  glutes: [
    {
      title: "Pigeon Stretch",
      description: "Front knee at 90 degrees, back leg extended. Sink hips toward floor. 45s each.",
      duration: "2 min",
      targetMuscles: ["glutes"],
    },
    {
      title: "Figure-4 Stretch",
      description: "Lying on back, ankle over opposite knee. Pull bottom knee toward chest.",
      duration: "2 min",
      targetMuscles: ["glutes"],
    },
  ],
  biceps: [
    {
      title: "Wall Bicep Stretch",
      description: "Palm flat on wall at shoulder height. Rotate body away until stretch. 30s each.",
      duration: "1 min",
      targetMuscles: ["biceps"],
    },
  ],
  triceps: [
    {
      title: "Overhead Tricep Stretch",
      description: "Elbow behind head, gently press with opposite hand. 30s each arm.",
      duration: "1 min",
      targetMuscles: ["triceps"],
    },
  ],
  calves: [
    {
      title: "Wall Calf Stretch",
      description: "Hands on wall, one foot back with heel grounded. Lean in. 30s each side.",
      duration: "2 min",
      targetMuscles: ["calves"],
    },
    {
      title: "Downward Dog Hold",
      description: "Press heels toward floor, alternate pedaling. Great full-calf stretch.",
      duration: "1 min",
      targetMuscles: ["calves", "hamstrings"],
    },
  ],
  core: [
    {
      title: "Cobra Stretch",
      description: "Lie face down, press up through palms. Gentle back extension. 3x20s holds.",
      duration: "2 min",
      targetMuscles: ["core"],
    },
  ],
};

// ============================================================
// Component
// ============================================================

interface MobilityRecommendationProps {
  /** Muscles trained in recent workouts */
  trainedMuscles: string[];
  /** Callback when user starts a full routine */
  onStartRoutine: (routine: MobilityRoutine) => void;
}

/**
 * Auto-suggests mobility work based on recently trained muscles.
 *
 * Shows:
 * 1. A recommended full routine (matched to trained muscles)
 * 2. 2-3 quick targeted stretches for the most fatigued muscles
 */
export function MobilityRecommendation({
  trainedMuscles,
  onStartRoutine,
}: MobilityRecommendationProps) {
  // Best-match full routine
  const recommendedRoutine = useMemo(() => {
    if (trainedMuscles.length === 0) {
      // Fallback to full-body
      return MOBILITY_ROUTINES.find((r) => r.id === "full-body-mobility") ?? MOBILITY_ROUTINES[0];
    }

    // Score each routine by how many target muscles overlap
    let bestScore = 0;
    let best: MobilityRoutine = MOBILITY_ROUTINES[0];

    for (const routine of MOBILITY_ROUTINES) {
      const overlap = routine.targetMuscles.filter((m) =>
        trainedMuscles.includes(m)
      ).length;
      const score = overlap / routine.targetMuscles.length;
      if (score > bestScore) {
        bestScore = score;
        best = routine;
      }
    }

    return best;
  }, [trainedMuscles]);

  // Pick 2-3 quick stretches targeting the trained muscles
  const quickStretches = useMemo(() => {
    const seen = new Set<string>();
    const result: MobilityTip[] = [];

    for (const muscle of trainedMuscles) {
      const tips = QUICK_STRETCHES[muscle] ?? QUICK_STRETCHES[muscle.toLowerCase()] ?? [];
      for (const tip of tips) {
        if (!seen.has(tip.title) && result.length < 3) {
          seen.add(tip.title);
          result.push(tip);
        }
      }
    }

    // If we have fewer than 2, pad with general stretches
    if (result.length < 2) {
      const general = [
        QUICK_STRETCHES["back"]?.[0],
        QUICK_STRETCHES["glutes"]?.[0],
        QUICK_STRETCHES["shoulders"]?.[0],
      ].filter(Boolean) as MobilityTip[];
      for (const tip of general) {
        if (!seen.has(tip.title) && result.length < 3) {
          seen.add(tip.title);
          result.push(tip);
        }
      }
    }

    return result;
  }, [trainedMuscles]);

  // Total duration of quick stretches
  const totalQuickMinutes = useMemo(() => {
    return quickStretches.reduce((sum, s) => {
      const mins = parseInt(s.duration, 10) || 2;
      return sum + mins;
    }, 0);
  }, [quickStretches]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em]">
          Recommended for You
        </h4>
      </div>

      {/* Primary routine recommendation */}
      <Card className="bg-card border-border p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-full">
                Best match
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white">
              {recommendedRoutine.name}
            </h4>
            <p className="text-xs text-white/40 mt-0.5 capitalize">
              Targets: {recommendedRoutine.targetMuscles.join(", ")}
            </p>
          </div>
          <div className="flex items-center gap-1 text-white/40 shrink-0 ml-3">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{recommendedRoutine.durationMinutes} min</span>
          </div>
        </div>

        <div className="text-xs text-white/30 mb-4">
          {recommendedRoutine.movements.length} movements - guided timer
        </div>

        <Button
          className="w-full h-12 bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-black font-semibold"
          onClick={() => onStartRoutine(recommendedRoutine)}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Routine
        </Button>
      </Card>

      {/* Quick targeted stretches */}
      {quickStretches.length > 0 && (
        <Card className="bg-card border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-white/40" />
              <span className="text-sm font-medium text-white">
                Quick Stretches
              </span>
            </div>
            <span className="text-xs text-white/30">
              ~{totalQuickMinutes} min total
            </span>
          </div>

          <div className="space-y-3">
            {quickStretches.map((stretch, i) => (
              <motion.div
                key={stretch.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * (i + 1) }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-[#38BDF8]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-[#38BDF8]">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80 font-medium">
                      {stretch.title}
                    </span>
                    <span className="text-[10px] text-white/30 shrink-0 ml-2">
                      {stretch.duration}
                    </span>
                  </div>
                  <p className="text-xs text-white/30 mt-0.5 leading-relaxed">
                    {stretch.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
