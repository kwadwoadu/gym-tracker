"use client";

import { motion } from "framer-motion";
import { Check, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StartScratchCardProps {
  isSelected: boolean;
  onSelect: () => void;
}

export function StartScratchCard({ isSelected, onSelect }: StartScratchCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        "relative w-full p-5 rounded-2xl text-left transition-colors",
        "border-2 border-dashed",
        isSelected
          ? "border-[#CDFF00] bg-[#CDFF00]/10"
          : "border-white/20 bg-[#1A1A1A]/50 hover:border-white/30"
      )}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
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
      <div className="pr-10 flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
          <Plus className="w-6 h-6 text-white/60" />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Start from Scratch
          </h3>
          <p className="text-white/60 text-sm mb-3">
            Build your own custom program. Add exercises, create supersets, and design
            your perfect training split.
          </p>

          {/* Features */}
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Sparkles className="w-4 h-4" />
            <span>Full customization - You control everything</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
