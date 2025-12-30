"use client";

import { motion } from "framer-motion";
import { Dumbbell, Flame, Zap, Heart, Check } from "lucide-react";
import { OnboardingStep } from "../onboarding-step";

const goals = [
  {
    id: "build_muscle",
    label: "Build Muscle",
    description: "Increase muscle mass and size",
    icon: Dumbbell,
  },
  {
    id: "lose_fat",
    label: "Lose Fat",
    description: "Reduce body fat while maintaining muscle",
    icon: Flame,
  },
  {
    id: "get_stronger",
    label: "Get Stronger",
    description: "Increase strength and lift heavier",
    icon: Zap,
  },
  {
    id: "stay_healthy",
    label: "Stay Healthy",
    description: "Maintain fitness and overall health",
    icon: Heart,
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
      <div className="space-y-3">
        {goals.map((goal, index) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleGoal(goal.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                isSelected
                  ? "border-[#CDFF00] bg-[#CDFF00]/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? "bg-[#CDFF00]" : "bg-white/10"
                }`}
              >
                <goal.icon
                  className={`w-6 h-6 ${isSelected ? "text-black" : "text-white"}`}
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{goal.label}</div>
                <div className="text-sm text-white/50">{goal.description}</div>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-[#CDFF00] flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-black" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </OnboardingStep>
  );
}
