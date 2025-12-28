"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { audioManager } from "@/lib/audio";

// Animation variants for timer warning pulse
const timerPulseVariants = {
  normal: { scale: 1 },
  warning: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
  critical: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

// Scale effect when timer reaches zero
const completeScaleVariants = {
  initial: { scale: 1 },
  complete: {
    scale: [1, 1.2, 0.9, 1],
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

interface RestTimerProps {
  seconds: number;
  onComplete: () => void;
  autoStart?: boolean;
  label?: string;
}

export function RestTimer({
  seconds,
  onComplete,
  autoStart = true,
  label = "Rest",
}: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [hasPlayedWarning, setHasPlayedWarning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(seconds);

  const progress = (timeLeft / seconds) * 100;
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    audioManager.playRestComplete();
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;

          // Play tick sound for last 5 seconds
          if (newTime <= 5 && newTime > 0 && newTime !== lastTickRef.current) {
            audioManager.playTick();
            lastTickRef.current = newTime;
          }

          // Play warning at 10 seconds
          if (newTime === 10 && !hasPlayedWarning) {
            audioManager.playWarning();
            setHasPlayedWarning(true);
          }

          if (newTime <= 0) {
            handleComplete();
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, hasPlayedWarning, handleComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const skipTimer = () => {
    setTimeLeft(0);
    handleComplete();
  };

  const resetTimer = () => {
    setTimeLeft(seconds);
    setIsRunning(false);
    setHasPlayedWarning(false);
    lastTickRef.current = seconds;
  };

  // Determine color based on time left
  const getTimerColor = () => {
    if (timeLeft <= 5) return "text-destructive stroke-destructive";
    if (timeLeft <= 10) return "text-warning stroke-warning";
    return "text-primary stroke-primary";
  };

  // Determine animation state based on time left
  const getAnimationState = () => {
    if (timeLeft === 0) return "complete";
    if (timeLeft <= 5) return "critical";
    if (timeLeft <= 10) return "warning";
    return "normal";
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Label */}
      <p className="text-sm text-muted-foreground uppercase tracking-wider">
        {label}
      </p>

      {/* Circular Timer */}
      <motion.div
        className="relative w-52 h-52"
        variants={timerPulseVariants}
        animate={getAnimationState()}
      >
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-all duration-1000 ease-linear",
              getTimerColor()
            )}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn(
              "text-5xl font-bold tabular-nums transition-colors",
              getTimerColor().split(" ")[0]
            )}
            key={timeLeft === 0 ? "complete" : "counting"}
            variants={completeScaleVariants}
            initial="initial"
            animate={timeLeft === 0 ? "complete" : "initial"}
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className="text-sm text-muted-foreground mt-1">
            {isRunning ? "remaining" : "paused"}
          </span>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={resetTimer}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          size="lg"
          className={cn(
            "h-16 w-16 rounded-full",
            isRunning
              ? "bg-muted hover:bg-muted/80"
              : "bg-primary hover:bg-primary/90"
          )}
          onClick={toggleTimer}
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={skipTimer}
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Skip text */}
      <p className="text-xs text-muted-foreground">
        Tap skip to start next set early
      </p>
    </div>
  );
}
