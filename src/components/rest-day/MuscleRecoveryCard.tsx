"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { MuscleRecoveryEstimate } from "@/lib/recovery";

interface MuscleRecoveryCardProps {
  estimates: MuscleRecoveryEstimate[];
  totalVolume: number;
  workoutName?: string;
}

function getStatusColor(status: MuscleRecoveryEstimate["status"]) {
  switch (status) {
    case "fatigued":
      return "#EF4444";
    case "recovering":
      return "#F59E0B";
    case "recovered":
      return "#22C55E";
  }
}

function formatHours(hours: number): string {
  if (hours <= 0) return "Ready";
  if (hours < 1) return "<1h left";
  return `${hours}h left`;
}

export function MuscleRecoveryCard({
  estimates,
  totalVolume,
  workoutName,
}: MuscleRecoveryCardProps) {
  if (estimates.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
        Yesterday&apos;s Impact
      </h4>
      <Card className="bg-card border-border p-5">
        {/* Workout summary */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white">
            {workoutName || "Last Workout"}
          </span>
          <span className="text-xs text-white/40">
            {(totalVolume / 1000).toFixed(1)}k kg volume
          </span>
        </div>

        {/* Muscle recovery bars */}
        <div className="space-y-3">
          {estimates.map((est) => (
            <div key={est.muscleGroup} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80 capitalize">
                  {est.muscleGroup}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: getStatusColor(est.status) }}
                >
                  {formatHours(est.hoursRemaining)}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${est.percentRecovered}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${getStatusColor(
                      "fatigued"
                    )}, ${getStatusColor(est.status)})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
