"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarUnifiedProps {
  value: number;
  max?: number;
  variant?: "default" | "xp" | "challenge" | "macro";
  glow?: boolean;
  label?: string;
  showValue?: boolean;
  className?: string;
  color?: string;
}

const VARIANT_STYLES = {
  default: "bg-primary",
  xp: "bg-gradient-to-r from-primary via-gym-success to-gym-success",
  challenge: "bg-gradient-to-r from-primary/60 to-primary",
  macro: "bg-primary",
} as const;

export function ProgressBarUnified({
  value,
  max = 100,
  variant = "default",
  glow = false,
  label,
  showValue = false,
  className,
  color,
}: ProgressBarUnifiedProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            color || VARIANT_STYLES[variant],
            glow && "animate-xp-glow"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
