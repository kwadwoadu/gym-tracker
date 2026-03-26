"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIGenerateCardProps {
  isSelected: boolean;
  onSelect: () => void;
}

export function AIGenerateCard({ isSelected, onSelect }: AIGenerateCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        "relative w-full p-5 rounded-2xl text-left transition-colors",
        "border-2",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-primary/30 bg-card/50 hover:border-primary/50"
      )}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          "absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center",
          isSelected ? "bg-primary" : "border-2 border-white/20"
        )}
      >
        {isSelected && <Check className="w-4 h-4 text-black" />}
      </div>

      {/* Content */}
      <div className="pr-10 flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            AI-Generated Program
          </h3>
          <p className="text-white/60 text-sm mb-3">
            Let AI design a personalized program based on your profile, goals,
            equipment, and experience level.
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Personalized
            </span>
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Evidence-based
            </span>
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Periodized
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
