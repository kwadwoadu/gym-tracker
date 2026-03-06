"use client";

import { motion } from "framer-motion";
import { ELEVATION } from "@/lib/elevation";
import { STATUS_COLORS } from "@/lib/design-tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface WhoopRecoveryCardProps {
  score?: number;
  status?: string;
}

function getRecoveryColor(score: number) {
  if (score >= 67) return STATUS_COLORS.green;
  if (score >= 34) return STATUS_COLORS.yellow;
  return STATUS_COLORS.red;
}

const CIRCLE_SIZE = 72;
const STROKE_WIDTH = 5;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function WhoopRecoveryCard({
  score = 72,
  status = "Ready to Train",
}: WhoopRecoveryCardProps) {
  const reducedMotion = useReducedMotion();
  const colors = getRecoveryColor(score);
  const dashOffset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="px-4"
    >
      <div className={`${ELEVATION.standard} flex items-center gap-4`}>
        {/* Recovery score circle */}
        <div className="relative flex-shrink-0">
          <svg
            width={CIRCLE_SIZE}
            height={CIRCLE_SIZE}
            viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
            className="-rotate-90"
          >
            {/* Background track */}
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE_WIDTH}
              className="text-border"
            />
            {/* Progress arc */}
            <motion.circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={colors.ring}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={reducedMotion ? { strokeDashoffset: dashOffset } : { strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          {/* Score number in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground tabular-nums">
              {score}%
            </span>
          </div>
        </div>

        {/* Status text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">Recovery</p>
          <p className={`text-base font-semibold ${colors.text}`}>
            {status}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
