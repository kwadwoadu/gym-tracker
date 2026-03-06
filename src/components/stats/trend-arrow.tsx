"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendArrowProps {
  current: number;
  previous: number;
  suffix?: string;
  className?: string;
}

export function TrendArrow({ current, previous, suffix = "", className }: TrendArrowProps) {
  if (previous === 0) return null;

  const change = ((current - previous) / previous) * 100;
  const isUp = change > 2;
  const isDown = change < -2;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isUp && "text-gym-success",
        isDown && "text-destructive",
        !isUp && !isDown && "text-white/40",
        className
      )}
    >
      {isUp ? (
        <TrendingUp className="w-3 h-3" />
      ) : isDown ? (
        <TrendingDown className="w-3 h-3" />
      ) : (
        <Minus className="w-3 h-3" />
      )}
      {Math.abs(change).toFixed(0)}%{suffix}
    </span>
  );
}
