"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { OnboardingStep } from "../onboarding-step";

const injuryAreas = [
  { id: "shoulder", label: "Shoulder", emoji: "💪" },
  { id: "back", label: "Lower Back", emoji: "🔙" },
  { id: "knee", label: "Knee", emoji: "🦵" },
  { id: "hip", label: "Hip", emoji: "🦴" },
  { id: "wrist", label: "Wrist/Elbow", emoji: "✋" },
];

interface InjuriesStepProps {
  selected: string[];
  onSelect: (injuries: string[]) => void;
}

export function InjuriesStep({ selected, onSelect }: InjuriesStepProps) {
  const hasNoInjuries = selected.length === 0;

  const toggleInjury = (injuryId: string) => {
    if (selected.includes(injuryId)) {
      onSelect(selected.filter((i) => i !== injuryId));
    } else {
      onSelect([...selected, injuryId]);
    }
  };

  const setNoInjuries = () => {
    onSelect([]);
  };

  return (
    <OnboardingStep
      title="Any injuries or limitations?"
      subtitle="We'll suggest alternative exercises when needed"
    >
      <div className="space-y-3">
        {/* No injuries option */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={setNoInjuries}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
            hasNoInjuries
              ? "border-[#22C55E] bg-[#22C55E]/10"
              : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              hasNoInjuries ? "bg-[#22C55E]" : "bg-white/10"
            }`}
          >
            <ShieldCheck
              className={`w-6 h-6 ${hasNoInjuries ? "text-black" : "text-white"}`}
            />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white">No injuries</div>
            <div className="text-sm text-white/50">I&apos;m good to go!</div>
          </div>
          {hasNoInjuries && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-black" />
            </motion.div>
          )}
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-sm text-white/30">or select areas</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Injury areas */}
        <div className="grid grid-cols-2 gap-3">
          {injuryAreas.map((injury, index) => {
            const isSelected = selected.includes(injury.id);
            return (
              <motion.button
                key={injury.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleInjury(injury.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? "border-[#F59E0B] bg-[#F59E0B]/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="text-2xl mb-1">{injury.emoji}</div>
                <div
                  className={`text-sm font-medium ${
                    isSelected ? "text-[#F59E0B]" : "text-white/70"
                  }`}
                >
                  {injury.label}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </OnboardingStep>
  );
}
