"use client";

import { useState, useEffect } from "react";
import { X, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface PostWorkoutSuggestion {
  templateId?: string;
  name: string;
  protein: number;
  carbs: number;
  reason: string;
}

interface PostWorkoutNutritionProps {
  workoutName: string;
  durationMinutes: number;
  proteinTarget: number;
  carbTarget: number;
  suggestions: PostWorkoutSuggestion[];
  tip: string;
  onDismiss: () => void;
  onLogMeal: (suggestion: PostWorkoutSuggestion) => void;
}

export function PostWorkoutNutrition({
  workoutName,
  durationMinutes,
  proteinTarget,
  carbTarget,
  suggestions,
  tip,
  onDismiss,
  onLogMeal,
}: PostWorkoutNutritionProps) {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss after 2 hours
  useEffect(() => {
    const timer = setTimeout(
      () => setVisible(false),
      2 * 60 * 60 * 1000
    );
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-gradient-to-r from-[#CDFF00]/10 to-[#CDFF00]/5 rounded-xl border border-[#CDFF00]/20 p-4 mb-4"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#CDFF00]" />
            <h3 className="text-sm font-semibold text-white">
              Post-Workout Nutrition
            </h3>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              onDismiss();
            }}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5 text-[#A0A0A0]" />
          </button>
        </div>

        <p className="text-xs text-[#A0A0A0] mb-3">
          You just finished: <span className="text-white">{workoutName}</span> (
          {durationMinutes} min)
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-[#CDFF00]" />
          <p className="text-xs text-[#CDFF00]">
            Eat within 30 min: {proteinTarget}g protein + {carbTarget}g carbs
          </p>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2 mb-3">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-[#1A1A1A] rounded-lg p-3"
              >
                <div>
                  <p className="text-sm text-white">
                    {s.templateId && (
                      <span className="text-[#CDFF00] mr-1">{s.templateId}:</span>
                    )}
                    {s.name}
                  </p>
                  <p className="text-xs text-[#666666]">
                    P: {s.protein}g | C: {s.carbs}g
                  </p>
                </div>
                <Button
                  onClick={() => onLogMeal(s)}
                  size="sm"
                  className="h-8 bg-[#CDFF00] text-black hover:bg-[#b8e600] text-xs"
                >
                  Log
                </Button>
              </div>
            ))}
          </div>
        )}

        {tip && (
          <p className="text-[11px] text-[#A0A0A0] italic">{tip}</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
