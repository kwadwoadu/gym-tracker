"use client";

import { motion } from "framer-motion";
import { OnboardingStep } from "../onboarding-step";
import { Slider } from "@/components/ui/slider";

interface ScheduleStepProps {
  daysPerWeek: number;
  onSelect: (days: number) => void;
}

const recommendations: Record<number, string> = {
  2: "Great for beginners or busy schedules",
  3: "Perfect balance for most lifters",
  4: "Ideal for intermediate progression",
  5: "High frequency for faster gains",
  6: "Advanced split for maximum volume",
};

export function ScheduleStep({ daysPerWeek, onSelect }: ScheduleStepProps) {
  return (
    <OnboardingStep
      title="How many days can you train?"
      subtitle="We'll recommend a program that fits your schedule"
    >
      <div className="mt-8">
        {/* Large number display */}
        <motion.div
          key={daysPerWeek}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-10"
        >
          <div className="text-7xl font-bold text-[#CDFF00] mb-2">
            {daysPerWeek}
          </div>
          <div className="text-lg text-white/60">days per week</div>
        </motion.div>

        {/* Slider */}
        <div className="px-4 mb-8">
          <Slider
            value={[daysPerWeek]}
            onValueChange={(value) => onSelect(value[0])}
            min={2}
            max={6}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-white/40">
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
          </div>
        </div>

        {/* Recommendation */}
        <motion.div
          key={recommendations[daysPerWeek]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <p className="text-white/70">{recommendations[daysPerWeek]}</p>
        </motion.div>
      </div>
    </OnboardingStep>
  );
}
