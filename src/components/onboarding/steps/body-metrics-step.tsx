"use client";

import { motion } from "framer-motion";
import { OnboardingStep } from "../onboarding-step";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface BodyMetricsStepProps {
  heightCm: number | null;
  weightKg: number | null;
  bodyFatPercent: number | null;
  onUpdate: (field: "heightCm" | "weightKg" | "bodyFatPercent", value: number | null) => void;
}

export function BodyMetricsStep({
  heightCm,
  weightKg,
  bodyFatPercent,
  onUpdate,
}: BodyMetricsStepProps) {
  return (
    <OnboardingStep
      title="Body metrics (optional)"
      subtitle="Track your progress over time. You can skip this."
    >
      <div className="space-y-6">
        {/* Height */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm text-white/60">Height (cm)</label>
          <Input
            type="number"
            placeholder="175"
            value={heightCm ?? ""}
            onChange={(e) =>
              onUpdate("heightCm", e.target.value ? parseInt(e.target.value) : null)
            }
            className="h-14 bg-white/5 border-white/10 text-white text-lg placeholder:text-white/30"
          />
        </motion.div>

        {/* Weight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm text-white/60">Weight (kg)</label>
          <Input
            type="number"
            placeholder="75"
            value={weightKg ?? ""}
            onChange={(e) =>
              onUpdate("weightKg", e.target.value ? parseInt(e.target.value) : null)
            }
            className="h-14 bg-white/5 border-white/10 text-white text-lg placeholder:text-white/30"
          />
        </motion.div>

        {/* Body Fat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <label className="text-sm text-white/60">Body fat % (estimate)</label>
            <span className="text-lg text-white font-medium">
              {bodyFatPercent ? `${bodyFatPercent}%` : "-"}
            </span>
          </div>
          <Slider
            value={bodyFatPercent ? [bodyFatPercent] : [15]}
            onValueChange={(value) => onUpdate("bodyFatPercent", value[0])}
            min={5}
            max={40}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/30">
            <span>5%</span>
            <span>15%</span>
            <span>25%</span>
            <span>40%</span>
          </div>
        </motion.div>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-white/40 text-center pt-4"
        >
          Don&apos;t worry about being exact - estimates are fine
        </motion.p>
      </div>
    </OnboardingStep>
  );
}
