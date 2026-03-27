"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface DeloadExerciseCardProps {
  name: string;
  normalWeight: number;
  deloadWeight: number;
  reduction: number; // 0.3
}

export function DeloadExerciseCard({
  name,
  normalWeight,
  deloadWeight,
  reduction,
}: DeloadExerciseCardProps) {
  const reductionPct = Math.round(reduction * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between rounded-xl bg-[#1A1A1A] px-4 py-4"
    >
      {/* Left: name + weights */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white truncate">
          {name}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-[13px]">
          <span className="text-[#555555] line-through font-normal">
            {normalWeight}kg
          </span>
          <ArrowRight className="h-3 w-3 text-[#666666] shrink-0" />
          <span className="text-[#EAB308] font-bold">
            {deloadWeight}kg
          </span>
        </div>
      </div>

      {/* Right: reduction badge */}
      <span className="ml-3 shrink-0 rounded-md bg-[#EAB308]/12 px-2 py-1 text-[11px] font-bold text-[#EAB308]">
        -{reductionPct}%
      </span>
    </motion.div>
  );
}
