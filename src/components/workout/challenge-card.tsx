"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp, X, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  currentWeight: number;
  challengeWeight: number;
  lastReps: number;
  onAccept: () => void;
  onDismiss: () => void;
  isVisible: boolean;
}

export function ChallengeCard({
  currentWeight,
  challengeWeight,
  lastReps,
  onAccept,
  onDismiss,
  isVisible,
}: ChallengeCardProps) {
  const weightIncrease = (challengeWeight - currentWeight).toFixed(1);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-4"
        >
          <div
            className={cn(
              "relative p-4 rounded-xl",
              "bg-gradient-to-br from-[#1a1f0a] to-[#0f1205]",
              "border border-primary/40",
              // Glow effect
              "shadow-[0_0_20px_rgba(205,255,0,0.15),0_0_40px_rgba(205,255,0,0.08)]",
              // Pulse animation via CSS
              "animate-pulse-glow"
            )}
          >
            {/* Dismiss button */}
            <button
              type="button"
              onClick={onDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Dismiss challenge"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-3">
              {/* Icon with glow */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Dumbbell className="w-6 h-6 text-primary" />
                </motion.div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Level Up Challenge
                  </span>
                </div>

                <p className="text-sm text-foreground mb-1">
                  You crushed {currentWeight}kg x {lastReps} reps last time!
                </p>

                <p className="text-base font-medium text-foreground">
                  Ready to try{" "}
                  <span className="text-primary font-bold text-lg">
                    {challengeWeight}kg
                  </span>
                  ?
                  <span className="text-muted-foreground text-sm ml-1">
                    (+{weightIncrease}kg)
                  </span>
                </p>
              </div>
            </div>

            {/* Accept button */}
            <div className="mt-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground hover:text-foreground"
                onClick={onDismiss}
              >
                Not today
              </Button>
              <Button
                size="sm"
                className={cn(
                  "flex-1 bg-primary text-primary-foreground font-semibold",
                  "hover:bg-primary/90",
                  "shadow-[0_0_12px_rgba(205,255,0,0.3)]"
                )}
                onClick={onAccept}
              >
                Accept Challenge
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
