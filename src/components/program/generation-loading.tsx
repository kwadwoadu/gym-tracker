"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Dumbbell, Calendar, Zap } from "lucide-react";

const STEPS = [
  { icon: Brain, text: "Analyzing your profile..." },
  { icon: Dumbbell, text: "Selecting exercises for your goals..." },
  { icon: Calendar, text: "Building your mesocycle..." },
  { icon: Zap, text: "Optimizing progression strategy..." },
];

export function GenerationLoading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = STEPS[step].icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Pulsing icon */}
      <motion.div
        className="w-20 h-20 rounded-full bg-[#CDFF00]/10 flex items-center justify-center mb-8"
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 0 0 rgba(205,255,0,0.1)",
            "0 0 0 20px rgba(205,255,0,0)",
            "0 0 0 0 rgba(205,255,0,0)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentIcon className="w-10 h-10 text-[#CDFF00]" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Step text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          className="text-lg text-white/80 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {STEPS[step].text}
        </motion.p>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: i <= step ? "#CDFF00" : "rgba(255,255,255,0.2)",
              scale: i === step ? 1.3 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
