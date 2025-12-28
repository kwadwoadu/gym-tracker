"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Minus, Plus, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Animation variants for set completion celebration
const cardCompleteVariants = {
  incomplete: { scale: 1 },
  complete: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
};

// Checkmark animation
const checkmarkVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

// Logged text fade in
const loggedTextVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.3,
    },
  },
};

// Button exit animation
const buttonExitVariants = {
  initial: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

interface SetLoggerProps {
  exerciseName: string;
  supersetLabel: string;
  exerciseLabel: string;
  setNumber: number;
  totalSets: number;
  targetReps: number;
  lastWeekWeight?: number;
  lastWeekReps?: number;
  suggestedWeight?: number;
  onComplete: (weight: number, reps: number) => void;
}

export function SetLogger({
  exerciseName,
  supersetLabel,
  exerciseLabel,
  setNumber,
  totalSets,
  targetReps,
  lastWeekWeight,
  lastWeekReps,
  suggestedWeight,
  onComplete,
}: SetLoggerProps) {
  const [weight, setWeight] = useState(suggestedWeight || lastWeekWeight || 20);
  const [reps, setReps] = useState(targetReps);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState(weight.toString());
  const weightInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingWeight && weightInputRef.current) {
      weightInputRef.current.focus();
      weightInputRef.current.select();
    }
  }, [isEditingWeight]);

  const adjustWeight = (delta: number) => {
    setWeight((prev) => Math.max(0, +(prev + delta).toFixed(1)));
  };

  const adjustReps = (delta: number) => {
    setReps((prev) => Math.max(0, prev + delta));
  };

  const handleWeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeightInputValue(e.target.value);
  };

  const handleWeightInputBlur = () => {
    const parsed = parseFloat(weightInputValue);
    if (!isNaN(parsed) && parsed >= 0) {
      setWeight(parsed);
    } else {
      setWeightInputValue(weight.toString());
    }
    setIsEditingWeight(false);
  };

  const handleWeightInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleWeightInputBlur();
    } else if (e.key === "Escape") {
      setWeightInputValue(weight.toString());
      setIsEditingWeight(false);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete(weight, reps);
  };

  const showProgressIndicator =
    suggestedWeight && lastWeekWeight && suggestedWeight > lastWeekWeight;

  return (
    <motion.div
      variants={cardCompleteVariants}
      animate={isCompleted ? "complete" : "incomplete"}
    >
      <Card
        className={cn(
          "p-6 transition-all",
          isCompleted
            ? "bg-success/10 border-success/50"
            : "bg-card border-border"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Badge
              variant="default"
              className="bg-primary text-primary-foreground font-bold text-lg px-3 py-1"
            >
              {supersetLabel}
              {exerciseLabel}
            </Badge>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {exerciseName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Set {setNumber} of {totalSets}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {isCompleted && (
              <motion.div
                className="w-8 h-8 rounded-full bg-success flex items-center justify-center"
                variants={checkmarkVariants}
                initial="initial"
                animate="animate"
              >
                <Check className="w-5 h-5 text-success-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      {/* Last week reference */}
      {lastWeekWeight && lastWeekReps && (
        <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Last week:</span>
          <span className="text-sm font-medium text-foreground">
            {lastWeekWeight}kg x {lastWeekReps} reps
          </span>
          {showProgressIndicator && (
            <Badge variant="secondary" className="ml-auto text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{(suggestedWeight - lastWeekWeight).toFixed(1)}kg
            </Badge>
          )}
        </div>
      )}

      {/* Weight input */}
      <div className="mb-6">
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          Weight (kg) - tap to edit
        </label>

        {/* Weight display/input */}
        <div className="flex items-center justify-center mb-3">
          {isEditingWeight ? (
            <div className="flex items-center gap-2">
              <Input
                ref={weightInputRef}
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                value={weightInputValue}
                onChange={handleWeightInputChange}
                onBlur={handleWeightInputBlur}
                onKeyDown={handleWeightInputKeyDown}
                className="w-28 h-14 text-3xl font-bold text-center bg-input border-primary"
              />
              <span className="text-xl text-muted-foreground">kg</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!isCompleted) {
                  setWeightInputValue(weight.toString());
                  setIsEditingWeight(true);
                }
              }}
              disabled={isCompleted}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors",
                !isCompleted && "hover:bg-muted/50 active:bg-muted cursor-pointer"
              )}
            >
              <span className="text-4xl font-bold text-foreground tabular-nums">
                {weight}
              </span>
              <span className="text-xl text-muted-foreground ml-1">kg</span>
            </button>
          )}
        </div>

        {/* Quick increment buttons */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 text-sm"
            onClick={() => adjustWeight(-5)}
            disabled={isCompleted}
          >
            -5
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 text-sm"
            onClick={() => adjustWeight(-2.5)}
            disabled={isCompleted}
          >
            -2.5
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 text-sm"
            onClick={() => adjustWeight(-1)}
            disabled={isCompleted}
          >
            -1
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 text-sm"
            onClick={() => adjustWeight(1)}
            disabled={isCompleted}
          >
            +1
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 text-sm"
            onClick={() => adjustWeight(2.5)}
            disabled={isCompleted}
          >
            +2.5
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 text-sm"
            onClick={() => adjustWeight(5)}
            disabled={isCompleted}
          >
            +5
          </Button>
        </div>
      </div>

      {/* Reps input */}
      <div className="mb-8">
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          Reps completed
        </label>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full text-xl touch-target"
            onClick={() => adjustReps(-1)}
            disabled={isCompleted}
          >
            <Minus className="w-5 h-5" />
          </Button>

          <div className="flex-1 text-center">
            <span className="text-4xl font-bold text-foreground tabular-nums">
              {reps}
            </span>
            <span className="text-xl text-muted-foreground ml-1">
              / {targetReps}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full text-xl touch-target"
            onClick={() => adjustReps(1)}
            disabled={isCompleted}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

        {/* Complete button */}
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key="button"
              variants={buttonExitVariants}
              initial="initial"
              exit="exit"
            >
              <Button
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleComplete}
              >
                <Check className="w-5 h-5 mr-2" />
                Complete Set
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="logged"
              className="text-center py-3"
              variants={loggedTextVariants}
              initial="initial"
              animate="animate"
            >
              <p className="text-success font-medium">
                Logged: {weight}kg x {reps} reps
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
