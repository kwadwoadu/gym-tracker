"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { MuscleRecoveryEstimate } from "@/lib/recovery";

interface RecoveryTimelineProps {
  estimates: MuscleRecoveryEstimate[];
}

/** Recovery threshold labels at 24h/48h/72h */
const TIMELINE_MARKS = [
  { hours: 24, label: "24h", percent: 33 },
  { hours: 48, label: "48h", percent: 66 },
  { hours: 72, label: "72h", percent: 100 },
];

function getBarColor(percent: number): string {
  if (percent >= 100) return "#22C55E";
  if (percent >= 66) return "#CDFF00";
  if (percent >= 33) return "#F59E0B";
  return "#EF4444";
}

function getStatusLabel(percent: number): string {
  if (percent >= 100) return "Recovered";
  if (percent >= 66) return "Almost ready";
  if (percent >= 33) return "Recovering";
  return "Fatigued";
}

function formatTimeRemaining(hours: number): string {
  if (hours <= 0) return "Ready";
  if (hours < 1) return "<1h";
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remaining = hours % 24;
  if (remaining === 0) return `${days}d`;
  return `${days}d ${remaining}h`;
}

export function RecoveryTimeline({ estimates }: RecoveryTimelineProps) {
  if (estimates.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
        Recovery Timeline
      </h4>
      <Card className="bg-card border-border p-5">
        {/* Timeline header with marks */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-sm font-medium text-white">
            Muscle Recovery
          </span>
        </div>

        {/* Timeline scale */}
        <div className="relative mb-5 px-1">
          <div className="flex justify-between text-[10px] text-white/30 mb-1">
            <span>0h</span>
            {TIMELINE_MARKS.map((mark) => (
              <span key={mark.hours}>{mark.label}</span>
            ))}
          </div>
          <div className="h-px bg-white/10 relative">
            {TIMELINE_MARKS.map((mark) => (
              <div
                key={mark.hours}
                className="absolute top-0 w-px h-2 bg-white/20 -translate-y-0.5"
                style={{ left: `${mark.percent}%` }}
              />
            ))}
          </div>
        </div>

        {/* Per-muscle recovery bars */}
        <div className="space-y-4">
          {estimates.map((est, i) => {
            const barColor = getBarColor(est.percentRecovered);
            const statusLabel = getStatusLabel(est.percentRecovered);

            return (
              <motion.div
                key={est.muscleGroup}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * (i + 1) }}
              >
                {/* Label row */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white/80 capitalize">
                    {est.muscleGroup}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider"
                      style={{ color: barColor }}
                    >
                      {statusLabel}
                    </span>
                    <span className="text-xs text-white/40 tabular-nums w-12 text-right">
                      {formatTimeRemaining(est.hoursRemaining)}
                    </span>
                  </div>
                </div>

                {/* Progress bar with timeline markers */}
                <div className="relative">
                  <div className="h-3 bg-[#1A1A1A] rounded-full overflow-hidden relative">
                    {/* Marker lines inside the bar */}
                    {TIMELINE_MARKS.map((mark) => (
                      <div
                        key={mark.hours}
                        className="absolute top-0 bottom-0 w-px bg-white/10 z-10"
                        style={{ left: `${mark.percent}%` }}
                      />
                    ))}

                    {/* Animated fill */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(est.percentRecovered, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.1 * i }}
                      className="h-full rounded-full relative"
                      style={{
                        background: `linear-gradient(90deg, ${barColor}66, ${barColor})`,
                      }}
                    />
                  </div>
                </div>

                {/* Volume badge */}
                <div className="mt-1">
                  <span className="text-[10px] text-white/20">
                    {(est.totalVolume / 1000).toFixed(1)}k kg vol
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/30">
              {estimates.filter((e) => e.status === "recovered").length}/{estimates.length} groups recovered
            </span>
            <span className="text-xs text-white/30">
              {Math.round(
                estimates.reduce((s, e) => s + e.percentRecovered, 0) /
                  estimates.length
              )}% overall
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
