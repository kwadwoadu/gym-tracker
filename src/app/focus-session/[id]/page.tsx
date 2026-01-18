"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Loader2,
  Check,
  Trophy,
  Clock,
  Dumbbell,
  Plus,
  Minus,
  X,
  Target,
  Zap,
} from "lucide-react";
import { focusSessionApi, exercisesApi, type FocusSession, type FocusSessionSetLog, type Exercise } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { audioManager } from "@/lib/audio";

interface SetEntry {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  actualReps: number;
  rpe?: number;
  isComplete: boolean;
}

export default function ActiveFocusSessionPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionId = params.id as string;

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [weight, setWeight] = useState(20);
  const [reps, setReps] = useState(10);
  const [rpe, setRpe] = useState(7);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState("20");

  // Fetch session
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["focus-session", sessionId],
    queryFn: () => focusSessionApi.get(sessionId),
  });

  // Fetch exercise details
  const { data: exerciseDetails } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => exercisesApi.list(),
  });

  // Update session mutation
  const updateMutation = useMutation({
    mutationFn: (data: { sets: FocusSessionSetLog[] }) =>
      focusSessionApi.update(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-session", sessionId] });
    },
  });

  // Complete session mutation
  const completeMutation = useMutation({
    mutationFn: () => focusSessionApi.complete(sessionId, { duration: Math.round(sessionDuration / 60) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["focus-session-active"] });
      setShowCompleteDialog(true);
    },
  });

  // Delete session mutation
  const deleteMutation = useMutation({
    mutationFn: () => focusSessionApi.delete(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-session-active"] });
      router.replace("/");
    },
  });

  // Duration timer
  useEffect(() => {
    if (!session) return;
    const startTime = new Date(session.startTime).getTime();
    const updateDuration = () => {
      setSessionDuration(Math.floor((Date.now() - startTime) / 1000));
    };
    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [session]);

  // Initialize sets from session
  useEffect(() => {
    if (session?.sets) {
      const existingSets = session.sets as FocusSessionSetLog[];
      setSets(existingSets.map((s) => ({ ...s, isComplete: true })));
    }
  }, [session]);

  // Get current exercise
  const exercises = session?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const exerciseInfo = exerciseDetails?.find((e) => e.id === currentExercise?.exerciseId);

  // Get sets for current exercise
  const currentExerciseSets = sets.filter(
    (s) => s.exerciseId === currentExercise?.exerciseId
  );
  const currentSetNumber = currentExerciseSets.length + 1;

  // Calculate progress
  const totalSetsLogged = sets.length;
  const totalVolume = sets.reduce(
    (sum, s) => sum + (s.weight * s.actualReps),
    0
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const adjustWeight = (delta: number) => {
    setWeight((prev) => Math.max(0, +(prev + delta).toFixed(1)));
  };

  const adjustReps = (delta: number) => {
    setReps((prev) => Math.max(0, prev + delta));
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

  const handleLogSet = useCallback(() => {
    if (!currentExercise) return;

    const newSet: SetEntry = {
      exerciseId: currentExercise.exerciseId,
      exerciseName: currentExercise.exerciseName,
      setNumber: currentSetNumber,
      weight,
      actualReps: reps,
      rpe,
      isComplete: true,
    };

    const newSets = [...sets, newSet];
    setSets(newSets);

    // Save to server
    updateMutation.mutate({
      sets: newSets.map(({ isComplete, ...rest }) => rest),
    });

    // Play success sound
    audioManager.playSetStart();
  }, [currentExercise, currentSetNumber, weight, reps, rpe, sets, updateMutation]);

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleFinishSession = () => {
    if (sets.length === 0) {
      setShowQuitDialog(true);
    } else {
      completeMutation.mutate();
    }
  };

  const handleQuitSession = () => {
    deleteMutation.mutate();
  };

  const getRpeLabel = (value: number) => {
    if (value <= 5) return "Easy";
    if (value === 6) return "Moderate";
    if (value === 7) return "Challenging";
    if (value === 8) return "Hard";
    if (value === 9) return "Very Hard";
    return "Max Effort";
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Session not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header with stats */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowQuitDialog(true)}
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="tabular-nums">{formatDuration(sessionDuration)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>{totalSetsLogged} sets</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Dumbbell className="w-4 h-4" />
              <span>{totalVolume.toLocaleString()} kg</span>
            </div>
          </div>
        </div>

        {/* Exercise navigation */}
        <div className="flex items-center gap-2">
          {exercises.map((ex, idx) => {
            const exerciseSets = sets.filter((s) => s.exerciseId === ex.exerciseId);
            const hasCompletedSets = exerciseSets.length > 0;
            return (
              <button
                key={ex.exerciseId}
                onClick={() => setCurrentExerciseIndex(idx)}
                className={cn(
                  "flex-1 p-2 rounded-lg text-center transition-all text-xs font-medium",
                  idx === currentExerciseIndex
                    ? "bg-[#CDFF00] text-[#0A0A0A]"
                    : hasCompletedSets
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </header>

      {/* Current Exercise */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise?.exerciseId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Exercise header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#CDFF00] text-[#0A0A0A]">
                  {currentExerciseIndex + 1}/{exercises.length}
                </Badge>
                {session.focusArea && (
                  <Badge variant="outline" className="capitalize">
                    {session.focusArea.replace("_", " ")}
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold">{currentExercise?.exerciseName}</h2>
              {exerciseInfo && (
                <p className="text-sm text-muted-foreground">
                  {exerciseInfo.muscleGroups.join(", ")} - {exerciseInfo.equipment}
                </p>
              )}
            </div>

            {/* Completed sets for this exercise */}
            {currentExerciseSets.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Logged sets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {currentExerciseSets.map((set, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-success/10 border border-success/30 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Set {set.setNumber}</span>
                        <Check className="w-4 h-4 text-success" />
                      </div>
                      <p className="text-success">
                        {set.weight}kg x {set.actualReps}
                        {set.rpe && <span className="text-success/70"> @ RPE {set.rpe}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Set Logger Card */}
            <Card className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  Set {currentSetNumber}
                </p>
              </div>

              {/* Weight input */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Weight (kg)
                </label>
                <div className="flex items-center justify-center mb-3">
                  {isEditingWeight ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        min="0"
                        value={weightInputValue}
                        onChange={(e) => setWeightInputValue(e.target.value)}
                        onBlur={handleWeightInputBlur}
                        onKeyDown={(e) => e.key === "Enter" && handleWeightInputBlur()}
                        className="w-28 h-14 text-3xl font-bold text-center bg-input border-primary"
                        autoFocus
                      />
                      <span className="text-xl text-muted-foreground">kg</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setWeightInputValue(weight.toString());
                        setIsEditingWeight(true);
                      }}
                      className="px-4 py-2 rounded-lg hover:bg-muted/50 active:bg-muted cursor-pointer"
                    >
                      <span className="text-4xl font-bold tabular-nums">{weight}</span>
                      <span className="text-xl text-muted-foreground ml-1">kg</span>
                    </button>
                  )}
                </div>

                {/* Weight adjustment buttons */}
                <div className="flex items-center justify-center gap-2">
                  {[-5, -2.5, -1, 1, 2.5, 5].map((delta) => (
                    <Button
                      key={delta}
                      variant="outline"
                      size="sm"
                      className="h-10 px-3 text-sm"
                      onClick={() => adjustWeight(delta)}
                    >
                      {delta > 0 ? "+" : ""}{delta}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reps input */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Reps
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full text-xl"
                    onClick={() => adjustReps(-1)}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-4xl font-bold tabular-nums">{reps}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full text-xl"
                    onClick={() => adjustReps(1)}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* RPE slider */}
              <div>
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
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rpe}
                    onChange={(e) => setRpe(parseInt(e.target.value))}
                    className={cn(
                      "w-full h-3 rounded-full appearance-none cursor-pointer bg-muted",
                      "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer",
                      rpe <= 7
                        ? "[&::-webkit-slider-thumb]:bg-green-500"
                        : rpe === 8
                        ? "[&::-webkit-slider-thumb]:bg-yellow-500"
                        : "[&::-webkit-slider-thumb]:bg-red-500"
                    )}
                  />
                </div>
              </div>

              {/* Log Set Button */}
              <Button
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-[#CDFF00] text-[#0A0A0A] hover:bg-[#CDFF00]/90"
                onClick={handleLogSet}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Check className="w-5 h-5 mr-2" />
                )}
                Log Set
              </Button>
            </Card>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePrevExercise}
                disabled={currentExerciseIndex === 0}
              >
                Previous
              </Button>
              {currentExerciseIndex < exercises.length - 1 ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleNextExercise}
                >
                  Next Exercise
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                  onClick={handleFinishSession}
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Trophy className="w-5 h-5 mr-2" />
                  )}
                  Finish Session
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Complete Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-success" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">Session Complete!</AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-4">
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{totalSetsLogged}</p>
                  <p className="text-xs text-muted-foreground">Sets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{formatDuration(sessionDuration)}</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{totalVolume.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Volume (kg)</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="w-full bg-[#CDFF00] text-[#0A0A0A] hover:bg-[#CDFF00]/90"
              onClick={() => router.push("/")}
            >
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quit Dialog */}
      <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>End session?</AlertDialogTitle>
            <AlertDialogDescription>
              {sets.length === 0
                ? "You haven't logged any sets yet. Are you sure you want to quit?"
                : `You've logged ${sets.length} sets. Do you want to save or discard this session?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="sm:flex-1">Continue</AlertDialogCancel>
            {sets.length > 0 ? (
              <>
                <Button
                  variant="destructive"
                  className="sm:flex-1"
                  onClick={handleQuitSession}
                >
                  Discard
                </Button>
                <Button
                  className="sm:flex-1 bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => {
                    setShowQuitDialog(false);
                    completeMutation.mutate();
                  }}
                >
                  Save & Exit
                </Button>
              </>
            ) : (
              <AlertDialogAction
                className="sm:flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleQuitSession}
              >
                Quit
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
