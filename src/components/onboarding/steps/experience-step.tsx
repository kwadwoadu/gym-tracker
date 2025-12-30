"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { OnboardingStep } from "../onboarding-step";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

const levels: {
  id: ExperienceLevel;
  label: string;
  description: string;
  timeframe: string;
}[] = [
  {
    id: "beginner",
    label: "Beginner",
    description: "New to lifting or returning after a long break",
    timeframe: "0-1 years",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Consistent training with good form knowledge",
    timeframe: "1-3 years",
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "Experienced lifter optimizing performance",
    timeframe: "3+ years",
  },
];

interface ExperienceStepProps {
  selected: ExperienceLevel | null;
  onSelect: (level: ExperienceLevel) => void;
}

export function ExperienceStep({ selected, onSelect }: ExperienceStepProps) {
  return (
    <OnboardingStep
      title="What's your experience level?"
      subtitle="This helps us recommend the right program"
    >
      <div className="space-y-3">
        {levels.map((level, index) => {
          const isSelected = selected === level.id;
          return (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(level.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "border-[#CDFF00] bg-[#CDFF00]/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{level.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                      {level.timeframe}
                    </span>
                  </div>
                  <p className="text-sm text-white/50">{level.description}</p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-[#CDFF00] flex items-center justify-center flex-shrink-0 ml-3"
                  >
                    <Check className="w-4 h-4 text-black" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </OnboardingStep>
  );
}
