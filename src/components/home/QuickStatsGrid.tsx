"use client";

import { motion } from "framer-motion";
import { Dumbbell, Trophy, TrendingUp } from "lucide-react";
import { DATA } from "@/lib/typography";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface QuickStatsGridProps {
  weeklyWorkouts: number;
  totalPRs: number;
  totalVolume: number;
}

export function QuickStatsGrid({
  weeklyWorkouts,
  totalPRs,
  totalVolume,
}: QuickStatsGridProps) {
  const reducedMotion = useReducedMotion();

  const formatVolume = (vol: number): string => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toString();
  };

  const stats = [
    {
      label: "Workouts",
      value: weeklyWorkouts.toString(),
      sublabel: "this week",
      icon: Dumbbell,
    },
    {
      label: "PRs",
      value: totalPRs.toString(),
      sublabel: "total",
      icon: Trophy,
    },
    {
      label: "Volume",
      value: formatVolume(totalVolume),
      sublabel: "kg total",
      icon: TrendingUp,
    },
  ];

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="px-4"
    >
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.25 + index * 0.05 }}
              className="bg-card rounded-xl p-4 flex flex-col items-center text-center"
            >
              <Icon className="w-4 h-4 text-muted-foreground mb-2" />
              <p className={`${DATA.medium} text-foreground`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sublabel}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
