"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Dumbbell, Calendar, Target, Sparkles } from "lucide-react";
import type { OnboardingProfile } from "@/lib/api-client";

interface CompletionStepProps {
  profile: Partial<OnboardingProfile>;
}

const goalLabels: Record<string, string> = {
  build_muscle: "Build Muscle",
  lose_fat: "Lose Fat",
  get_stronger: "Get Stronger",
  stay_healthy: "Stay Healthy",
};

const experienceLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const equipmentLabels: Record<string, string> = {
  full_gym: "Full Gym",
  home_gym: "Home Gym",
  bodyweight: "Bodyweight",
};

export function CompletionStep({ profile }: CompletionStepProps) {
  const summaryItems = [
    {
      icon: Target,
      label: "Goals",
      value: profile.goals?.map((g) => goalLabels[g]).join(", ") || "Not set",
    },
    {
      icon: Dumbbell,
      label: "Experience",
      value: profile.experienceLevel
        ? experienceLabels[profile.experienceLevel]
        : "Not set",
    },
    {
      icon: Calendar,
      label: "Schedule",
      value: profile.trainingDaysPerWeek
        ? `${profile.trainingDaysPerWeek} days/week`
        : "Not set",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="mb-6"
      >
        <div className="relative">
          <CheckCircle2 className="w-20 h-20 text-[#22C55E]" />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-[#CDFF00]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-white mb-2"
      >
        You&apos;re all set!
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 mb-8 max-w-xs"
      >
        Now let&apos;s pick a training program that matches your profile
      </motion.p>

      {/* Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm space-y-3"
      >
        {summaryItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <item.icon className="w-5 h-5 text-[#CDFF00]" />
            <span className="text-white/50 text-sm">{item.label}</span>
            <span className="flex-1 text-right text-white font-medium text-sm">
              {item.value}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Equipment badge */}
      {profile.equipment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 px-4 py-2 rounded-full bg-white/5 border border-white/10"
        >
          <span className="text-sm text-white/60">
            Training at: {equipmentLabels[profile.equipment]}
          </span>
        </motion.div>
      )}
    </div>
  );
}
