"use client";

import { motion } from "framer-motion";
import { Building2, Home, User, Check } from "lucide-react";
import { OnboardingStep } from "../onboarding-step";

type EquipmentType = "full_gym" | "home_gym" | "bodyweight";

const options: {
  id: EquipmentType;
  label: string;
  description: string;
  icon: typeof Building2;
}[] = [
  {
    id: "full_gym",
    label: "Full Gym",
    description: "Access to barbells, dumbbells, cables, and machines",
    icon: Building2,
  },
  {
    id: "home_gym",
    label: "Home Gym",
    description: "Dumbbells, resistance bands, and basic equipment",
    icon: Home,
  },
  {
    id: "bodyweight",
    label: "Bodyweight Only",
    description: "No equipment needed, train anywhere",
    icon: User,
  },
];

interface EquipmentStepProps {
  selected: EquipmentType | null;
  onSelect: (equipment: EquipmentType) => void;
}

export function EquipmentStep({ selected, onSelect }: EquipmentStepProps) {
  return (
    <OnboardingStep
      title="What equipment do you have?"
      subtitle="We'll customize exercises based on your setup"
    >
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selected === option.id;
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(option.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                isSelected
                  ? "border-[#CDFF00] bg-[#CDFF00]/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  isSelected ? "bg-[#CDFF00]" : "bg-white/10"
                }`}
              >
                <option.icon
                  className={`w-7 h-7 ${isSelected ? "text-black" : "text-white"}`}
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{option.label}</div>
                <div className="text-sm text-white/50">{option.description}</div>
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
