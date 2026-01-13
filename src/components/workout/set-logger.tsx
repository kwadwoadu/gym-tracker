"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Minus, Plus, TrendingUp, TrendingDown, Play, ChevronDown, ChevronUp, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { MuscleMapMini } from "@/components/shared/MuscleMapMini";

// Extract YouTube video ID from URL
function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/
  );
  return match ? match[1] : null;
}

// Check if URL is a YouTube search query (not a direct video)
function isYouTubeSearchUrl(url: string): boolean {
  return url.includes('youtube.com/results?search_query=');
}

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
  suggestedReps?: number;  // Memory reps (from session or historical)
  suggestedRpe?: number;   // Memory RPE (from session or historical)
  lastWorkoutDate?: string;  // ISO date of last time this exercise was done
  hitTargetLastTime?: boolean;  // Whether target reps were hit last time
  memorySource?: "session" | "historical";  // Where the suggested values come from
  videoUrl?: string;
  muscles?: {
    primary: string[];
    secondary: string[];
  };
  onComplete: (weight: number, reps: number, rpe?: number) => void;
  onSkip?: () => void; // Optional callback when user skips the set
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
  suggestedReps,
  suggestedRpe,
  lastWorkoutDate,
  hitTargetLastTime,
  memorySource,
  videoUrl,
  muscles,
  onComplete,
  onSkip,
}: SetLoggerProps) {
  const [weight, setWeight] = useState(suggestedWeight || lastWeekWeight || 20);
  // Use last workout's actual reps if available, otherwise target reps
  const [reps, setReps] = useState(suggestedReps ?? targetReps);
  // Use last workout's RPE if available, otherwise default to 7
  const [rpe, setRpe] = useState<number>(suggestedRpe ?? 7);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState(weight.toString());
  const [showVideo, setShowVideo] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const weightInputRef = useRef<HTMLInputElement>(null);

  const videoId = videoUrl ? getYouTubeId(videoUrl) : null;
  const isSearchUrl = videoUrl ? isYouTubeSearchUrl(videoUrl) : false;
  const hasVideo = videoId || isSearchUrl;

  // Update weight when suggestion props arrive (async fetch)
  useEffect(() => {
    if (suggestedWeight !== undefined) {
      setWeight(suggestedWeight);
      setWeightInputValue(suggestedWeight.toString());
    } else if (lastWeekWeight !== undefined) {
      setWeight(lastWeekWeight);
      setWeightInputValue(lastWeekWeight.toString());
    }
  }, [suggestedWeight, lastWeekWeight]);

  // Update reps and RPE when suggestion props arrive (smart memory)
  useEffect(() => {
    if (suggestedReps !== undefined) {
      setReps(suggestedReps);
    }
  }, [suggestedReps]);

  useEffect(() => {
    if (suggestedRpe !== undefined) {
      setRpe(suggestedRpe);
    }
  }, [suggestedRpe]);

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
    onComplete(weight, reps, rpe);
  };

  // Get RPE label based on value
  const getRpeLabel = (value: number) => {
    if (value <= 5) return "Easy";
    if (value === 6) return "Moderate";
    if (value === 7) return "Challenging";
    if (value === 8) return "Hard";
    if (value === 9) return "Very Hard";
    return "Max Effort";
  };

  const showProgressIndicator =
    suggestedWeight && lastWeekWeight && suggestedWeight > lastWeekWeight;

  // Format the last workout date for display
  const formatLastDate = (isoDate?: string): string => {
    if (!isoDate) return "Last time";
    const date = new Date(isoDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "Last week";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

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

          <div className="flex items-center gap-2">
            {/* Muscle mini map */}
            {muscles && (
              <MuscleMapMini muscles={muscles} />
            )}

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
        </div>

      {/* Memory source indicator */}
      {memorySource === "session" && suggestedWeight && (
        <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm text-primary font-medium">From previous set:</span>
          <span className="text-sm font-medium text-foreground">
            {suggestedWeight}kg x {suggestedReps} reps @ RPE {suggestedRpe}
          </span>
        </div>
      )}

      {/* Last workout reference (historical) */}
      {memorySource !== "session" && lastWeekWeight && lastWeekReps && (
        <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">{formatLastDate(lastWorkoutDate)}:</span>
          <span className="text-sm font-medium text-foreground">
            {lastWeekWeight}kg x {lastWeekReps} reps
          </span>
          {hitTargetLastTime !== undefined && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                hitTargetLastTime ? "border-success/50 text-success" : "border-warning/50 text-warning"
              )}
            >
              {hitTargetLastTime ? "Hit target" : "Missed target"}
            </Badge>
          )}
          {showProgressIndicator && (
            <Badge variant="secondary" className="ml-auto text-xs bg-success/20 text-success border-success/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{(suggestedWeight - lastWeekWeight).toFixed(1)}kg
            </Badge>
          )}
          {suggestedWeight && lastWeekWeight && suggestedWeight < lastWeekWeight && (
            <Badge variant="secondary" className="ml-auto text-xs bg-warning/20 text-warning border-warning/30">
              <TrendingDown className="w-3 h-3 mr-1" />
              {(suggestedWeight - lastWeekWeight).toFixed(1)}kg
            </Badge>
          )}
        </div>
      )}

      {/* Video tutorial section */}
      {hasVideo && (
        <div className="mb-6">
          {/* If we have a video ID, show expandable section with in-app player */}
          {videoId ? (
            <>
              <button
                type="button"
                onClick={() => setShowVideo(!showVideo)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                {showVideo ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <Play className="w-4 h-4" />
                <span>How to do this exercise</span>
              </button>

              <AnimatePresence>
                {showVideo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setShowVideoDialog(true)}
                      className="relative mt-3 w-full rounded-lg overflow-hidden group"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt={`${exerciseName} tutorial`}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* If it's a search URL (no video ID), show button that opens in new tab */
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50"
            >
              <Play className="w-4 h-4" />
              <span>Watch exercise tutorial on YouTube</span>
              <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Video dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-white">{exerciseName}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            {showVideoDialog && videoId && (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={`${exerciseName} tutorial`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

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
      <div className="mb-6">
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

      {/* RPE slider */}
      <div className="mb-8">
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          RPE (Rate of Perceived Exertion)
        </label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-2xl font-bold tabular-nums",
              rpe <= 7 ? "text-green-500" : rpe === 8 ? "text-yellow-500" : "text-red-500"
            )}>
              {rpe}
            </span>
            <span className={cn(
              "text-sm font-medium",
              rpe <= 7 ? "text-green-500" : rpe === 8 ? "text-yellow-500" : "text-red-500"
            )}>
              {getRpeLabel(rpe)}
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={rpe}
              onChange={(e) => setRpe(parseInt(e.target.value))}
              disabled={isCompleted}
              className={cn(
                "w-full h-3 rounded-full appearance-none cursor-pointer",
                "bg-muted",
                "[&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:w-7",
                "[&::-webkit-slider-thumb]:h-7",
                "[&::-webkit-slider-thumb]:rounded-full",
                "[&::-webkit-slider-thumb]:cursor-pointer",
                "[&::-webkit-slider-thumb]:shadow-md",
                rpe <= 7
                  ? "[&::-webkit-slider-thumb]:bg-green-500"
                  : rpe === 8
                  ? "[&::-webkit-slider-thumb]:bg-yellow-500"
                  : "[&::-webkit-slider-thumb]:bg-red-500",
                "[&::-moz-range-thumb]:w-7",
                "[&::-moz-range-thumb]:h-7",
                "[&::-moz-range-thumb]:rounded-full",
                "[&::-moz-range-thumb]:cursor-pointer",
                "[&::-moz-range-thumb]:border-0",
                rpe <= 7
                  ? "[&::-moz-range-thumb]:bg-green-500"
                  : rpe === 8
                  ? "[&::-moz-range-thumb]:bg-yellow-500"
                  : "[&::-moz-range-thumb]:bg-red-500",
                isCompleted && "opacity-50 cursor-not-allowed"
              )}
            />
            {/* Scale markers */}
            <div className="flex justify-between mt-1 px-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <span
                  key={n}
                  className={cn(
                    "text-[10px] tabular-nums",
                    n === rpe ? "text-foreground font-bold" : "text-muted-foreground"
                  )}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

        {/* Complete and Skip buttons */}
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key="buttons"
              variants={buttonExitVariants}
              initial="initial"
              exit="exit"
              className="flex gap-3"
            >
              {onSkip && (
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-14 px-6 text-muted-foreground hover:text-foreground"
                  onClick={onSkip}
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Skip
                </Button>
              )}
              <Button
                size="lg"
                className="flex-1 h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
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
                Logged: {weight}kg x {reps} reps @ RPE {rpe}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
