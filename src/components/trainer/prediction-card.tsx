"use client";

import { TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";

interface PredictionCardProps {
  exerciseName: string;
  targetWeight: number;
  currentWeight: number;
  currentReps: number;
  currentRPE: number;
  estimatedWeeks: number;
  progressRate: string;
}

export function PredictionCard({
  exerciseName,
  targetWeight,
  currentWeight,
  currentReps,
  currentRPE,
  estimatedWeeks,
  progressRate,
}: PredictionCardProps) {
  const progress = Math.min(
    100,
    Math.round((currentWeight / targetWeight) * 100)
  );

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + estimatedWeeks * 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-card to-background rounded-xl border border-border p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          PR Prediction
        </span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-white">{exerciseName}</p>
        <p className="text-lg font-bold text-primary">{targetWeight}kg</p>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          ~{estimatedWeeks} weeks (
          {estimatedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
          )
        </span>
        <div className="flex items-center gap-1 text-green-400">
          <TrendingUp className="w-3 h-3" />
          <span>{progressRate}</span>
        </div>
      </div>

      <p className="text-[11px] text-dim-foreground mt-2">
        Current: {currentWeight}kg x {currentReps} @ RPE {currentRPE}
      </p>
    </motion.div>
  );
}
