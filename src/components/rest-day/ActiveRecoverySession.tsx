"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, SkipForward, Pause, Play } from "lucide-react";
import type { MobilityRoutine, MobilityMovement } from "@/data/mobility-routines";

interface ActiveRecoverySessionProps {
  routine: MobilityRoutine;
  onComplete: () => void;
  onClose: () => void;
}

interface SessionStep {
  movement: MobilityMovement;
  side?: "Left" | "Right";
  index: number;
  totalSteps: number;
}

function buildSteps(routine: MobilityRoutine): SessionStep[] {
  const steps: SessionStep[] = [];
  for (const movement of routine.movements) {
    if (movement.sides === "left_right") {
      steps.push({
        movement,
        side: "Left",
        index: steps.length,
        totalSteps: 0,
      });
      steps.push({
        movement,
        side: "Right",
        index: steps.length,
        totalSteps: 0,
      });
    } else {
      steps.push({ movement, index: steps.length, totalSteps: 0 });
    }
  }
  const total = steps.length;
  return steps.map((s) => ({ ...s, totalSteps: total }));
}

export function ActiveRecoverySession({
  routine,
  onComplete,
  onClose,
}: ActiveRecoverySessionProps) {
  const steps = useMemo(() => buildSteps(routine), [routine]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(steps[0].movement.holdSeconds);
  const [isPaused, setIsPaused] = useState(false);

  const step = steps[currentStep];
  const progress = ((step.movement.holdSeconds - timeLeft) / step.movement.holdSeconds) * 100;

  const nextStep = useCallback(() => {
    if (currentStep + 1 >= steps.length) {
      onComplete();
    } else {
      const next = currentStep + 1;
      setCurrentStep(next);
      setTimeLeft(steps[next].movement.holdSeconds);
    }
  }, [currentStep, steps, onComplete]);

  // Countdown timer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          nextStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, nextStep]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe-top pb-3">
        <button onClick={onClose} className="p-2 -ml-2">
          <X className="w-6 h-6 text-white/60" />
        </button>
        <span className="text-sm font-medium text-white/60">
          {currentStep + 1}/{steps.length}
        </span>
        <div className="w-10" />
      </div>

      {/* Step progress bar */}
      <div className="px-4 flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full overflow-hidden bg-secondary"
          >
            <div
              className="h-full bg-[#38BDF8] transition-all duration-300"
              style={{
                width:
                  i < currentStep ? "100%" : i === currentStep ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-1">
              {step.movement.name}
            </h2>
            {step.side && (
              <p className="text-lg text-[#38BDF8] font-medium mb-4">
                {step.side} Side
              </p>
            )}
            <p className="text-sm text-white/40 max-w-xs mx-auto mb-8">
              {step.movement.description}
            </p>

            {/* Timer circle */}
            <div className="relative w-40 h-40 mx-auto mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#2A2A2A"
                  strokeWidth="6"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 54 * (1 - (step.movement.holdSeconds - timeLeft) / step.movement.holdSeconds)
                  }`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white tabular-nums">
                  {timeLeft}
                </span>
                <span className="text-xs text-white/40">seconds</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="px-4 pb-safe-bottom pb-6 space-y-3">
        {currentStep + 1 < steps.length && (
          <p className="text-center text-xs text-white/30">
            Next: {steps[currentStep + 1].movement.name}
            {steps[currentStep + 1].side
              ? ` - ${steps[currentStep + 1].side}`
              : ""}
          </p>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-14 border-border text-white"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? (
              <Play className="w-5 h-5 mr-2" />
            ) : (
              <Pause className="w-5 h-5 mr-2" />
            )}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-14 border-border text-white"
            onClick={nextStep}
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Skip
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
