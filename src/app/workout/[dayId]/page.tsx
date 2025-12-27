"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ChevronRight,
  Play,
  Trophy,
  Clock,
  Dumbbell,
  Check,
} from "lucide-react";
import { RestTimer } from "@/components/workout/rest-timer";
import { SetLogger } from "@/components/workout/set-logger";
import db, { getSuggestedWeight, checkAndAddPR } from "@/lib/db";
import type { TrainingDay, Exercise, SetLog, WorkoutLog } from "@/lib/db";

interface NewPR {
  exerciseName: string;
  weight: number;
  reps: number;
}
import { audioManager } from "@/lib/audio";
import { cn } from "@/lib/utils";

type WorkoutPhase = "preview" | "warmup" | "exercise" | "rest" | "complete";

interface WorkoutState {
  supersetIndex: number;  // Which superset (0=A, 1=B, 2=C)
  exerciseIndex: number;  // Which exercise in superset (0 or 1)
  setNumber: number;      // Current set number (1-4)
}

export default function WorkoutSession() {
  const params = useParams();
  const router = useRouter();
  const dayId = params.dayId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [trainingDay, setTrainingDay] = useState<TrainingDay | null>(null);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
  const [phase, setPhase] = useState<WorkoutPhase>("preview");
  const [workoutState, setWorkoutState] = useState<WorkoutState>({
    supersetIndex: 0,
    exerciseIndex: 0,
    setNumber: 1,
  });
  const [warmupChecked, setWarmupChecked] = useState<boolean[]>([]);
  const [completedSets, setCompletedSets] = useState<SetLog[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [nextExercisePreview, setNextExercisePreview] = useState<string>("");
  const [weightSuggestion, setWeightSuggestion] = useState<{
    weight: number;
    lastWeekWeight: number;
    lastWeekReps: number;
  } | null>(null);
  const [newPRs, setNewPRs] = useState<NewPR[]>([]);

  // Load training day and exercises
  useEffect(() => {
    async function loadData() {
      try {
        const day = await db.trainingDays.get(dayId);
        if (!day) {
          router.push("/");
          return;
        }
        setTrainingDay(day);

        // Initialize warmup checkboxes
        if (day.warmup) {
          setWarmupChecked(new Array(day.warmup.length).fill(false));
        }

        const allExercises = await db.exercises.toArray();
        const exerciseMap = new Map<string, Exercise>();
        allExercises.forEach((ex) => exerciseMap.set(ex.id, ex));
        setExercises(exerciseMap);
      } catch (error) {
        console.error("Failed to load workout data:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [dayId, router]);

  // Fetch weight suggestion when exercise or set changes
  useEffect(() => {
    async function fetchWeightSuggestion() {
      if (phase !== "exercise" || !trainingDay) {
        setWeightSuggestion(null);
        return;
      }

      const superset = trainingDay.supersets[workoutState.supersetIndex];
      if (!superset) return;

      const exerciseData = superset.exercises[workoutState.exerciseIndex];
      if (!exerciseData) return;

      try {
        const suggestion = await getSuggestedWeight(
          exerciseData.exerciseId,
          dayId,
          workoutState.setNumber
        );
        setWeightSuggestion(suggestion);
      } catch (error) {
        console.error("Failed to get weight suggestion:", error);
        setWeightSuggestion(null);
      }
    }

    fetchWeightSuggestion();
  }, [phase, trainingDay, workoutState.supersetIndex, workoutState.exerciseIndex, workoutState.setNumber, dayId]);

  // Initialize audio on first user interaction
  const initAudio = useCallback(async () => {
    if (!audioInitialized) {
      await audioManager.init();
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  // Get current exercise data
  const getCurrentExercise = () => {
    if (!trainingDay) return null;
    const superset = trainingDay.supersets[workoutState.supersetIndex];
    if (!superset) return null;
    const exerciseData = superset.exercises[workoutState.exerciseIndex];
    if (!exerciseData) return null;
    const exercise = exercises.get(exerciseData.exerciseId);
    return {
      ...exerciseData,
      name: exercise?.name || "Unknown",
      supersetLabel: superset.label,
    };
  };

  // Start warmup phase
  const startWarmup = async () => {
    await initAudio();
    setStartTime(new Date());

    // If no warmup exercises, go straight to workout
    if (!trainingDay?.warmup || trainingDay.warmup.length === 0) {
      setPhase("exercise");
      audioManager.playSetStart();
    } else {
      setPhase("warmup");
    }
  };

  // Complete warmup and start workout
  const startWorkout = () => {
    setPhase("exercise");
    audioManager.playSetStart();
  };

  // Toggle warmup checkbox
  const toggleWarmup = (index: number) => {
    setWarmupChecked((prev) => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };

  // Check if all warmup exercises are done
  const allWarmupDone = warmupChecked.every((checked) => checked);

  // Handle set completion - simplified progression logic
  const handleSetComplete = (weight: number, reps: number) => {
    if (!trainingDay) return;

    const currentExercise = getCurrentExercise();
    if (!currentExercise) return;

    // Log the set
    const exercise = exercises.get(currentExercise.exerciseId);
    const targetRepsStr = currentExercise.reps.split(",")[0] || "10";
    const targetReps = parseInt(targetRepsStr.split("-")[0]) || 10;

    const setLog: SetLog = {
      id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exerciseId: currentExercise.exerciseId,
      exerciseName: exercise?.name || "Unknown",
      supersetLabel: trainingDay.supersets[workoutState.supersetIndex].label,
      setNumber: workoutState.setNumber,
      targetReps,
      actualReps: reps,
      weight,
      unit: "kg",
      isComplete: true,
      completedAt: new Date().toISOString(),
    };
    setCompletedSets((prev) => [...prev, setLog]);

    // Determine next state
    const superset = trainingDay.supersets[workoutState.supersetIndex];
    const totalSets = currentExercise.sets;
    const exercisesInSuperset = superset.exercises.length;

    // Calculate next position
    let nextSupersetIndex = workoutState.supersetIndex;
    let nextExerciseIndex = workoutState.exerciseIndex;
    let nextSetNumber = workoutState.setNumber;

    // Move to next exercise in superset (A1 -> A2)
    nextExerciseIndex++;

    if (nextExerciseIndex >= exercisesInSuperset) {
      // Completed all exercises in superset for this set, move to next set
      nextExerciseIndex = 0;
      nextSetNumber++;

      if (nextSetNumber > totalSets) {
        // Completed all sets in this superset, move to next superset
        nextSetNumber = 1;
        nextSupersetIndex++;

        if (nextSupersetIndex >= trainingDay.supersets.length) {
          // Workout complete!
          finishWorkout();
          return;
        }
      }
    }

    // Update state for next exercise
    setWorkoutState({
      supersetIndex: nextSupersetIndex,
      exerciseIndex: nextExerciseIndex,
      setNumber: nextSetNumber,
    });

    // Set preview text for rest phase
    const nextSuperset = trainingDay.supersets[nextSupersetIndex];
    const nextExerciseData = nextSuperset.exercises[nextExerciseIndex];
    const nextExercise = exercises.get(nextExerciseData.exerciseId);
    setNextExercisePreview(
      `${nextSuperset.label}${nextExerciseIndex + 1} ${nextExercise?.name || "Unknown"} - Set ${nextSetNumber}`
    );

    // Go to rest
    setPhase("rest");
  };

  // Handle rest timer complete
  const handleRestComplete = () => {
    setPhase("exercise");
    audioManager.playSetStart();
  };

  // Finish workout
  const finishWorkout = async () => {
    if (!startTime || !trainingDay) return;

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    // Save workout log
    const workoutLog: Omit<WorkoutLog, "id"> = {
      date: startTime.toISOString().split("T")[0],
      dayId: trainingDay.id,
      dayName: trainingDay.name,
      programId: trainingDay.programId,
      sets: completedSets,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: Math.floor(duration / 60), // Convert to minutes
      isComplete: true,
    };

    const workoutLogId = await db.workoutLogs.add(workoutLog as WorkoutLog);

    // Check for PRs - find best set for each exercise
    const exerciseBestSets = new Map<string, SetLog>();
    for (const set of completedSets) {
      const existing = exerciseBestSets.get(set.exerciseId);
      // Compare by weight first, then by reps
      if (!existing ||
          set.weight > existing.weight ||
          (set.weight === existing.weight && set.actualReps > existing.actualReps)) {
        exerciseBestSets.set(set.exerciseId, set);
      }
    }

    // Check each exercise's best set for PR
    const achievedPRs: NewPR[] = [];
    for (const [exerciseId, bestSet] of exerciseBestSets) {
      const isPR = await checkAndAddPR(
        exerciseId,
        bestSet.exerciseName,
        bestSet.weight,
        bestSet.actualReps,
        bestSet.unit,
        String(workoutLogId)
      );
      if (isPR) {
        achievedPRs.push({
          exerciseName: bestSet.exerciseName,
          weight: bestSet.weight,
          reps: bestSet.actualReps,
        });
      }
    }

    setNewPRs(achievedPRs);
    setPhase("complete");

    // Play celebration sound based on PRs achieved
    if (achievedPRs.length > 0) {
      audioManager.playPR();
    } else {
      audioManager.playWorkoutComplete();
    }
  };

  // Calculate progress
  const calculateProgress = (): number => {
    if (!trainingDay) return 0;

    const totalSets = trainingDay.supersets.reduce(
      (acc, ss) =>
        acc + ss.exercises.reduce((a, e) => a + e.sets, 0),
      0
    );

    return Math.round((completedSets.length / totalSets) * 100);
  };

  // Parse target reps from string like "10,10,8,8"
  const getTargetReps = (repsString: string, setNumber: number): number => {
    const repsArray = repsString.split(",").map((r) => parseInt(r.trim()));
    return repsArray[setNumber - 1] || repsArray[0] || 10;
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading || !trainingDay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Dumbbell className="w-8 h-8 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Loading workout...</p>
        </div>
      </div>
    );
  }

  const currentExercise = getCurrentExercise();

  return (
    <div className="min-h-screen pb-safe-bottom">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">
              {trainingDay.name}
            </h1>
            {phase !== "preview" && phase !== "warmup" && phase !== "complete" && (
              <p className="text-xs text-muted-foreground">
                {completedSets.length} sets completed
              </p>
            )}
          </div>

          <div className="w-10" />
        </div>

        {/* Progress bar */}
        {phase !== "preview" && phase !== "warmup" && phase !== "complete" && (
          <div className="mt-3">
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        )}
      </header>

      <main className="p-4">
        {/* Preview Phase */}
        {phase === "preview" && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Ready to Train?
              </h2>
              <p className="text-muted-foreground">
                {trainingDay.supersets.length} supersets -{" "}
                {trainingDay.supersets.reduce(
                  (acc, ss) => acc + ss.exercises.length,
                  0
                )}{" "}
                exercises
              </p>
            </div>

            {/* Warmup preview */}
            {trainingDay.warmup && trainingDay.warmup.length > 0 && (
              <Card className="p-4 bg-card border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Warmup ({trainingDay.warmup.length} exercises)
                </h3>
                <ul className="space-y-2">
                  {trainingDay.warmup.slice(0, 3).map((w, idx) => {
                    const exercise = exercises.get(w.exerciseId);
                    return (
                      <li
                        key={idx}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-foreground text-sm">
                          {exercise?.name || w.exerciseId}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {w.reps} reps
                        </Badge>
                      </li>
                    );
                  })}
                  {trainingDay.warmup.length > 3 && (
                    <li className="text-sm text-muted-foreground">
                      +{trainingDay.warmup.length - 3} more...
                    </li>
                  )}
                </ul>
              </Card>
            )}

            {/* Start button */}
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={startWarmup}
            >
              <Play className="w-6 h-6 mr-2" />
              {trainingDay.warmup && trainingDay.warmup.length > 0
                ? "Start Warmup"
                : "Start Workout"}
            </Button>
          </div>
        )}

        {/* Warmup Phase */}
        {phase === "warmup" && trainingDay.warmup && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Warmup
              </h2>
              <p className="text-muted-foreground">
                Complete all exercises before starting
              </p>
            </div>

            <Card className="p-4 bg-card border-border">
              <ul className="space-y-4">
                {trainingDay.warmup.map((w, idx) => {
                  const exercise = exercises.get(w.exerciseId);
                  return (
                    <li
                      key={idx}
                      className="flex items-center gap-4 py-2"
                    >
                      <Checkbox
                        id={`warmup-${idx}`}
                        checked={warmupChecked[idx]}
                        onCheckedChange={() => toggleWarmup(idx)}
                        className="h-6 w-6"
                      />
                      <label
                        htmlFor={`warmup-${idx}`}
                        className={cn(
                          "flex-1 flex items-center justify-between cursor-pointer",
                          warmupChecked[idx] && "opacity-50"
                        )}
                      >
                        <span
                          className={cn(
                            "text-foreground",
                            warmupChecked[idx] && "line-through"
                          )}
                        >
                          {exercise?.name || w.exerciseId}
                        </span>
                        <Badge variant="secondary">{w.reps} reps</Badge>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </Card>

            {/* Continue button */}
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={startWorkout}
              disabled={!allWarmupDone}
            >
              {allWarmupDone ? (
                <>
                  <Check className="w-6 h-6 mr-2" />
                  Start Main Workout
                </>
              ) : (
                <>Complete warmup to continue</>
              )}
            </Button>
          </div>
        )}

        {/* Exercise Phase */}
        {phase === "exercise" && currentExercise && (
          <div className="space-y-6">
            {/* Current superset indicator */}
            <div className="flex items-center justify-center gap-2">
              {trainingDay.supersets.map((ss, idx) => (
                <div
                  key={ss.id}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                    idx === workoutState.supersetIndex
                      ? "bg-primary text-primary-foreground scale-110"
                      : idx < workoutState.supersetIndex
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {ss.label}
                </div>
              ))}
            </div>

            {/* Set logger */}
            <SetLogger
              key={`${workoutState.supersetIndex}-${workoutState.exerciseIndex}-${workoutState.setNumber}`}
              exerciseName={currentExercise.name}
              supersetLabel={currentExercise.supersetLabel}
              exerciseLabel={String(workoutState.exerciseIndex + 1)}
              setNumber={workoutState.setNumber}
              totalSets={currentExercise.sets}
              targetReps={getTargetReps(
                currentExercise.reps,
                workoutState.setNumber
              )}
              lastWeekWeight={weightSuggestion?.lastWeekWeight}
              lastWeekReps={weightSuggestion?.lastWeekReps}
              suggestedWeight={weightSuggestion?.weight}
              onComplete={handleSetComplete}
            />

            {/* Tempo reminder */}
            <Card className="p-4 bg-muted/30 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Tempo
                  </p>
                  <p className="text-lg font-mono text-foreground">
                    {currentExercise.tempo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Rest
                  </p>
                  <p className="text-lg font-mono text-foreground">
                    {currentExercise.restSeconds}s
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Rest Phase */}
        {phase === "rest" && currentExercise && (
          <div className="py-8">
            <RestTimer
              seconds={currentExercise.restSeconds}
              onComplete={handleRestComplete}
              label="Rest Time"
            />

            {/* Next exercise preview */}
            <Card className="mt-8 p-4 bg-muted/30 border-border">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Up Next
                  </p>
                  <p className="text-foreground font-medium">
                    {nextExercisePreview}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Complete Phase */}
        {phase === "complete" && startTime && (
          <div className="py-12 text-center space-y-8">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <Trophy className="w-12 h-12 text-success" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Workout Complete!
              </h2>
              <p className="text-muted-foreground">
                Great job crushing {trainingDay.name}
              </p>
            </div>

            {/* PR Celebration Section */}
            {newPRs.length > 0 && (
              <Card className="p-6 bg-primary/10 border-primary/30">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-primary">
                    {newPRs.length === 1 ? "New PR!" : `${newPRs.length} New PRs!`}
                  </h3>
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <ul className="space-y-3">
                  {newPRs.map((pr, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between px-4 py-2 bg-background/50 rounded-lg"
                    >
                      <span className="text-foreground font-medium">
                        {pr.exerciseName}
                      </span>
                      <Badge variant="default" className="bg-primary text-primary-foreground">
                        {pr.weight}kg x {pr.reps}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-card border-border text-center">
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {formatDuration(
                    Math.floor(
                      (new Date().getTime() - startTime.getTime()) / 1000
                    )
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </Card>

              <Card className="p-4 bg-card border-border text-center">
                <Dumbbell className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {completedSets.length}
                </p>
                <p className="text-xs text-muted-foreground">Sets Completed</p>
              </Card>
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold"
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
