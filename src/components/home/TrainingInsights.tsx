"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { detectDeloadNeed } from "@/lib/ai/deload-detector";
import {
  generateVolumeAdjustments,
  getMostImportantAdjustment,
} from "@/lib/ai/volume-adjuster";
import { getTopPRPredictions } from "@/lib/ai/pr-predictor";
import type { WorkoutLog, Exercise } from "@/lib/api-client";

interface TrainingInsightsProps {
  workoutLogs: WorkoutLog[];
  exercises: Map<string, Exercise>;
}

type InsightType = "deload" | "volume" | "pr_prediction";

interface Insight {
  type: InsightType;
  title: string;
  description: string;
  icon: typeof Brain;
  accentColor: string;
  borderColor: string;
}

export function TrainingInsights({
  workoutLogs,
  exercises,
}: TrainingInsightsProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const insight = useMemo((): Insight | null => {
    if (!workoutLogs || workoutLogs.length < 2) return null;

    // Priority 1: Check deload need
    const deload = detectDeloadNeed(workoutLogs as never[]);
    if (deload.needed) {
      return {
        type: "deload",
        title: "Deload Recommended",
        description: deload.reasons[0] || deload.protocol.description,
        icon: AlertTriangle,
        accentColor: "text-yellow-500",
        borderColor: "border-l-yellow-500",
      };
    }

    // Priority 2: Check volume adjustments from most recent workout
    const recentWorkout = [...workoutLogs]
      .filter((l) => l.isComplete)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    if (recentWorkout) {
      const exerciseMeta = new Map<
        string,
        { muscleGroups: string[]; equipment: string }
      >();
      exercises.forEach((ex, id) => {
        exerciseMeta.set(id, {
          muscleGroups: ex.muscleGroups || [],
          equipment: ex.equipment || "barbell",
        });
      });

      const adjustments = generateVolumeAdjustments(
        recentWorkout.sets as never[],
        exerciseMeta
      );
      const topAdjustment = getMostImportantAdjustment(adjustments);

      if (topAdjustment && topAdjustment.type !== "maintain") {
        const isIncrease =
          topAdjustment.type === "increase_weight" ||
          topAdjustment.type === "add_set";
        return {
          type: "volume",
          title: isIncrease ? "Ready to Progress" : "Adjust Volume",
          description: topAdjustment.reason,
          icon: isIncrease ? Zap : TrendingUp,
          accentColor: isIncrease ? "text-primary" : "text-blue-500",
          borderColor: isIncrease
            ? "border-l-primary"
            : "border-l-blue-500",
        };
      }
    }

    // Priority 3: PR prediction
    const exerciseMap = new Map<string, { id: string; name: string }>();
    exercises.forEach((ex, id) => {
      exerciseMap.set(id, { id, name: ex.name });
    });

    const predictions = getTopPRPredictions(
      workoutLogs as never[],
      exerciseMap,
      1
    );

    if (predictions.length > 0) {
      const p = predictions[0];
      const weeksLabel =
        p.estimatedWeeks <= 1
          ? "~1 week"
          : `~${Math.round(p.estimatedWeeks)} weeks`;
      return {
        type: "pr_prediction",
        title: "PR Incoming",
        description: `${p.exerciseName}: ${p.targetWeight}kg in ${weeksLabel} (+${p.weeklyProgressionRate}kg/week)`,
        icon: Target,
        accentColor: "text-primary",
        borderColor: "border-l-primary",
      };
    }

    return null;
  }, [workoutLogs, exercises]);

  if (!insight) return null;

  const Icon = insight.icon;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="px-4"
    >
      <Card
        className={`border-l-4 ${insight.borderColor} cursor-pointer active:scale-[0.98] transition-transform`}
        onClick={() => router.push("/stats")}
      >
        <div className="flex items-start gap-3 p-4">
          <div
            className={`w-10 h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0 ${insight.accentColor}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Brain className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Training Insight
              </span>
            </div>
            <p className="font-semibold text-foreground text-sm">
              {insight.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {insight.description}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-2" />
        </div>
      </Card>
    </motion.div>
  );
}
