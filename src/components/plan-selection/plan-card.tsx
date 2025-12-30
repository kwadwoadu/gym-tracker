"use client";

import { motion } from "framer-motion";
import { Check, Dumbbell, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PresetProgram } from "@/lib/programs";

interface PlanCardProps {
  program: PresetProgram;
  isSelected: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
}

const difficultyColors = {
  beginner: "text-green-400",
  intermediate: "text-yellow-400",
  advanced: "text-red-400",
};

export function PlanCard({
  program,
  isSelected,
  isRecommended,
  onSelect,
}: PlanCardProps) {
  const { meta } = program;

  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        "relative w-full p-5 rounded-2xl text-left transition-colors",
        "border-2",
        isSelected
          ? "border-[#CDFF00] bg-[#CDFF00]/10"
          : "border-white/10 bg-[#1A1A1A] hover:border-white/20"
      )}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-4 px-3 py-1 bg-[#CDFF00] rounded-full">
          <span className="text-xs font-semibold text-black">Recommended</span>
        </div>
      )}

      {/* Selection indicator */}
      <div
        className={cn(
          "absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center",
          isSelected ? "bg-[#CDFF00]" : "border-2 border-white/20"
        )}
      >
        {isSelected && <Check className="w-4 h-4 text-black" />}
      </div>

      {/* Content */}
      <div className="pr-10">
        <h3 className="text-xl font-semibold text-white mb-2">{meta.name}</h3>
        <p className="text-white/60 text-sm mb-4 line-clamp-2">
          {meta.description}
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-white/70">
            <Calendar className="w-4 h-4" />
            <span>{meta.daysPerWeek} days/week</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Dumbbell className="w-4 h-4" />
            <span className={difficultyColors[meta.difficulty]}>
              {meta.difficulty.charAt(0).toUpperCase() + meta.difficulty.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Users className="w-4 h-4" />
            <span>{meta.targetAudience}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
