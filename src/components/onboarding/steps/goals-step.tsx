"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { OnboardingStep } from "../onboarding-step";

const goals = [
  {
    id: "build_muscle",
    emoji: "\uD83D\uDCAA",
    label: "Build Muscle",
    description: "Increase muscle mass and size",
  },
  {
    id: "lose_fat",
    emoji: "\uD83D\uDD25",
    label: "Lose Fat",
    description: "Reduce body fat while maintaining muscle",
  },
  {
    id: "get_stronger",
    emoji: "\u26A1",
    label: "Get Stronger",
    description: "Increase strength and lift heavier",
  },
  {
    id: "stay_healthy",
    emoji: "\u2764\uFE0F",
    label: "Stay Healthy",
    description: "Maintain fitness and overall health",
  },
];

interface GoalsStepProps {
  selectedGoals: string[];
  onSelect: (goals: string[]) => void;
}

export function GoalsStep({ selectedGoals, onSelect }: GoalsStepProps) {
  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      onSelect(selectedGoals.filter((g) => g !== goalId));
    } else if (selectedGoals.length < 2) {
      onSelect([...selectedGoals, goalId]);
    }
  };

  return (
    <OnboardingStep
      title="What are your goals?"
      subtitle="Select up to 2 primary goals"
    >
      <div className="grid grid-cols-2 gap-3">
        {goals.map((goal, index) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => toggleGoal(goal.id)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {/* Selected check */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}

              {/* Emoji icon */}
              <span className="text-3xl mb-3 block">{goal.emoji}</span>

              {/* Title */}
              <div className="font-semibold text-sm text-foreground">
                {goal.label}
              </div>

              {/* Description */}
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {goal.description}
              </div>
            </motion.button>
          );
        })}
      </div>
    </OnboardingStep>
  );
}
