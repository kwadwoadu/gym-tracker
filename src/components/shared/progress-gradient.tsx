"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressGradientProps {
  value: number; // 0-100
  gradient?: string;
  trackClassName?: string;
  className?: string;
  glow?: boolean;
  glowColor?: string;
  height?: string;
}

export function ProgressGradient({
  value,
  gradient = "bg-gradient-to-r from-[#CDFF00] via-[#A3E635] to-[#22C55E]",
  trackClassName,
  className,
  glow = false,
  glowColor = "rgba(205, 255, 0, 0.3)",
  height = "h-2",
}: ProgressGradientProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("relative rounded-full overflow-hidden", height, trackClassName || "bg-[#1A1A1A]", className)}>
      <motion.div
        className={cn("absolute inset-y-0 left-0 rounded-full", gradient)}
        style={glow ? { boxShadow: `0 0 12px ${glowColor}` } : undefined}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
