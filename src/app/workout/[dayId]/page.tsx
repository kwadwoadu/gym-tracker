"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
  ChevronRight,
  Play,
  Trophy,
  Clock,
  Dumbbell,
  Check,
  TrendingUp,
  Target,
  RotateCcw,
} from "lucide-react";
import { RestTimer } from "@/components/workout/rest-timer";
import { SetLogger } from "@/components/workout/set-logger";
import { EditSetDrawer } from "@/components/workout/edit-set-drawer";
import { ChallengeCard } from "@/components/workout/challenge-card";
import { AchievementToast, useAchievementToasts } from "@/components/gamification";
import { checkAchievements, type AchievementUnlock } from "@/lib/gamification";
import { pushToCloud, isSyncAvailable } from "@/lib/sync";
import { useUser } from "@clerk/nextjs";
import db, { getSuggestedWeight, getGlobalWeightSuggestion, checkAndAddPR, updateWorkoutLog, getLastWeekVolume, getUserSettings } from "@/lib/db";
import type { TrainingDay, Exercise, SetLog, WorkoutLog, UserSettings } from "@/lib/db";

// Animation variants for phase transitions
const phaseVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const phaseTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

// Staggered list animation for PR items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

// Trophy bounce animation
const trophyVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

// Celebration icon pulse
const celebrationPulse = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};

interface NewPR {
  exerciseName: string;
  weight: number;
  reps: number;
}
import { audioManager } from "@/lib/audio";
import { cn } from "@/lib/utils";

type WorkoutPhase = "preview" | "warmup" | "exercise" | "rest" | "finisher" | "complete";

interface WorkoutState {
  supersetIndex: number;  // Which superset (0=A, 1=B, 2=C)
  exerciseIndex: number;  // Which exercise in superset (0 or 1)
  setNumber: number;      // Current set number (1-4)
}

// Session persistence for surviving refresh/back/power loss
interface SavedSession {
  phase: WorkoutPhase;
  workoutState: WorkoutState;
  completedSets: SetLog[];
  startTime: string;
  warmupChecked: boolean[];
  finisherChecked: boolean[];
  currentVolume: number;
  timestamp: number;
}

const SESSION_KEY_PREFIX = "setflow-session-";
const SESSION_EXPIRY_HOURS = 6; // Sessions expire after 6 hours

export default function WorkoutSession() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
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
  const [finisherChecked, setFinisherChecked] = useState<boolean[]>([]);
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
  const [workoutNotes, setWorkoutNotes] = useState<string>("");
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [lastWeekVolumeTotal, setLastWeekVolumeTotal] = useState<number | null>(null);
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const hasCheckedSession = useRef(false);
  const isRestoringSession = useRef(false);

  // Global weight memory + edit sets state
  const [globalSuggestion, setGlobalSuggestion] = useState<{
    suggestedWeight: number;
    lastWeight: number;
    lastReps: number;
    lastDate: string;
    hitTargetLastTime: boolean;
    shouldNudgeIncrease: boolean;
    nudgeWeight: number | null;
  } | null>(null);
  const [editingSet, setEditingSet] = useState<SetLog | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [challengeDismissedExercises, setChallengeDismissedExercises] = useState<Set<string>>(new Set());
  const [autoStartRestTimer, setAutoStartRestTimer] = useState(true);

  // Achievement toasts
  const { toasts: achievementToasts, addToasts: addAchievementToasts, removeToast: removeAchievementToast, currentToast } = useAchievementToasts();

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

        // Initialize finisher checkboxes
        if (day.finisher) {
          setFinisherChecked(new Array(day.finisher.length).fill(false));
        }

        const allExercises = await db.exercises.toArray();
        const exerciseMap = new Map<string, Exercise>();
        allExercises.forEach((ex) => exerciseMap.set(ex.id, ex));
        setExercises(exerciseMap);

        // Load last week's volume for goal comparison
        const lastVolume = await getLastWeekVolume(dayId);
        setLastWeekVolumeTotal(lastVolume);

        // Load user settings for rest timer auto-start preference
        const userSettings = await getUserSettings();
        setAutoStartRestTimer(userSettings.autoStartRestTimer ?? true);
      } catch (error) {
        console.error("Failed to load workout data:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [dayId, router]);

  // Check for saved session on mount
  useEffect(() => {
    if (hasCheckedSession.current || isLoading) return;
    hasCheckedSession.current = true;

    const sessionKey = `${SESSION_KEY_PREFIX}${dayId}`;
    const savedData = localStorage.getItem(sessionKey);

    if (savedData) {
      try {
        const session: SavedSession = JSON.parse(savedData);
        const ageHours = (Date.now() - session.timestamp) / (1000 * 60 * 60);

        // Check if session is not expired and not already complete
        if (ageHours < SESSION_EXPIRY_HOURS && session.phase !== "complete" && session.phase !== "preview") {
          setSavedSession(session);
          setShowResumeDialog(true);
        } else {
          // Expired or complete session, remove it
          localStorage.removeItem(sessionKey);
        }
      } catch (e) {
        console.error("Failed to parse saved session:", e);
        localStorage.removeItem(sessionKey);
      }
    }
  }, [dayId, isLoading]);

  // Save session to localStorage on state changes
  useEffect(() => {
    // Don't save during loading, preview, complete, or when restoring
    if (isLoading || phase === "preview" || phase === "complete" || isRestoringSession.current) return;

    const sessionKey = `${SESSION_KEY_PREFIX}${dayId}`;
    const sessionData: SavedSession = {
      phase,
      workoutState,
      completedSets,
      startTime: startTime?.toISOString() || new Date().toISOString(),
      warmupChecked,
      finisherChecked,
      currentVolume,
      timestamp: Date.now(),
    };

    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
  }, [dayId, phase, workoutState, completedSets, startTime, warmupChecked, finisherChecked, currentVolume, isLoading]);

  // Resume saved session
  const resumeSession = async () => {
    if (!savedSession) return;

    isRestoringSession.current = true;

    setPhase(savedSession.phase);
    setWorkoutState(savedSession.workoutState);
    setCompletedSets(savedSession.completedSets);
    setStartTime(new Date(savedSession.startTime));
    setWarmupChecked(savedSession.warmupChecked);
    setFinisherChecked(savedSession.finisherChecked);
    setCurrentVolume(savedSession.currentVolume);

    // Initialize audio
    await audioManager.init();
    setAudioInitialized(true);

    setShowResumeDialog(false);
    setSavedSession(null);

    // Small delay then allow saving again
    setTimeout(() => {
      isRestoringSession.current = false;
    }, 100);
  };

  // Discard saved session and start fresh
  const discardSession = () => {
    const sessionKey = `${SESSION_KEY_PREFIX}${dayId}`;
    localStorage.removeItem(sessionKey);
    setShowResumeDialog(false);
    setSavedSession(null);
  };

  // Clear session when workout is complete
  const clearSession = () => {
    const sessionKey = `${SESSION_KEY_PREFIX}${dayId}`;
    localStorage.removeItem(sessionKey);
  };

  // Fetch weight suggestion when exercise or set changes
  useEffect(() => {
    async function fetchWeightSuggestion() {
      if (phase !== "exercise" || !trainingDay) {
        setWeightSuggestion(null);
        setGlobalSuggestion(null);
        return;
      }

      const superset = trainingDay.supersets[workoutState.supersetIndex];
      if (!superset) return;

      const exerciseData = superset.exercises[workoutState.exerciseIndex];
      if (!exerciseData) return;

      try {
        // Fetch both day-specific and global suggestions
        const [daySuggestion, globalSug] = await Promise.all([
          getSuggestedWeight(
            exerciseData.exerciseId,
            dayId,
            workoutState.setNumber
          ),
          getGlobalWeightSuggestion(exerciseData.exerciseId),
        ]);

        setWeightSuggestion(daySuggestion);
        setGlobalSuggestion(globalSug);
      } catch (error) {
        console.error("Failed to get weight suggestion:", error);
        setWeightSuggestion(null);
        setGlobalSuggestion(null);
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
      videoUrl: exercise?.videoUrl,
    };
  };

  // Get next exercise preview (for equipment preparation)
  const getNextExercisePreview = () => {
    if (!trainingDay) return null;

    const currentSuperset = trainingDay.supersets[workoutState.supersetIndex];
    if (!currentSuperset) return null;

    const currentExerciseData = currentSuperset.exercises[workoutState.exerciseIndex];
    const totalSets = currentExerciseData?.sets || 4;
    const exercisesInSuperset = currentSuperset.exercises.length;

    // Calculate next position
    let nextSupersetIndex = workoutState.supersetIndex;
    let nextExerciseIndex = workoutState.exerciseIndex + 1;
    let nextSetNumber = workoutState.setNumber;

    if (nextExerciseIndex >= exercisesInSuperset) {
      nextExerciseIndex = 0;
      nextSetNumber++;

      if (nextSetNumber > totalSets) {
        nextSetNumber = 1;
        nextSupersetIndex++;

        if (nextSupersetIndex >= trainingDay.supersets.length) {
          // Next is finisher or complete
          if (trainingDay.finisher && trainingDay.finisher.length > 0) {
            const finisherExercise = exercises.get(trainingDay.finisher[0].exerciseId);
            return {
              name: finisherExercise?.name || "Finisher",
              label: "Finisher",
              equipment: finisherExercise?.equipment,
            };
          }
          return null;
        }
      }
    }

    const nextSuperset = trainingDay.supersets[nextSupersetIndex];
    const nextExerciseData = nextSuperset.exercises[nextExerciseIndex];
    const nextExercise = exercises.get(nextExerciseData.exerciseId);

    // Check if equipment differs from current
    const currentExercise = exercises.get(currentExerciseData.exerciseId);
    const equipmentDiffers = nextExercise?.equipment !== currentExercise?.equipment;

    return {
      name: nextExercise?.name || "Unknown",
      label: `${nextSuperset.label}${nextExerciseIndex + 1}`,
      setNumber: nextSetNumber,
      equipment: equipmentDiffers ? nextExercise?.equipment : undefined,
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

  // Toggle finisher checkbox
  const toggleFinisher = (index: number) => {
    setFinisherChecked((prev) => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };

  // Check if all finisher exercises are done
  const allFinisherDone = finisherChecked.every((checked) => checked);

  // Handle set completion - simplified progression logic
  const handleSetComplete = (weight: number, reps: number, rpe?: number) => {
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
      rpe,
      isComplete: true,
      completedAt: new Date().toISOString(),
    };
    setCompletedSets((prev) => [...prev, setLog]);

    // Update live volume counter
    setCurrentVolume((prev) => prev + weight * reps);

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
          // All supersets done - check if finisher exists
          if (trainingDay.finisher && trainingDay.finisher.length > 0) {
            setPhase("finisher");
            audioManager.playSetStart();
          } else {
            finishWorkout();
          }
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

  // Handle challenge card accept
  const handleChallengeAccept = (exerciseId: string) => {
    // The nudge weight will be used as the starting weight in SetLogger
    // The challenge card is hidden after acceptance
    setChallengeDismissedExercises((prev) => new Set(prev).add(exerciseId));
  };

  // Handle challenge card dismiss
  const handleChallengeDismiss = (exerciseId: string) => {
    setChallengeDismissedExercises((prev) => new Set(prev).add(exerciseId));
  };

  // Handle opening edit drawer for a completed set
  const handleEditSet = (set: SetLog) => {
    setEditingSet(set);
    setShowEditDrawer(true);
  };

  // Handle saving edited set
  const handleSaveEditedSet = (updates: { weight: number; actualReps: number; rpe?: number }) => {
    if (!editingSet) return;

    // Calculate volume difference for live update
    const oldVolume = editingSet.weight * editingSet.actualReps;
    const newVolume = updates.weight * updates.actualReps;
    const volumeDiff = newVolume - oldVolume;

    // Update the set in completedSets state
    setCompletedSets((prev) =>
      prev.map((s) =>
        s.id === editingSet.id
          ? { ...s, weight: updates.weight, actualReps: updates.actualReps, rpe: updates.rpe }
          : s
      )
    );

    // Update live volume counter
    setCurrentVolume((prev) => prev + volumeDiff);

    // Close drawer
    setShowEditDrawer(false);
    setEditingSet(null);
  };

  // Get completed sets for current exercise
  const getCompletedSetsForCurrentExercise = () => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return [];
    return completedSets.filter((s) => s.exerciseId === currentExercise.exerciseId);
  };

  // Finish workout
  const finishWorkout = async () => {
    if (!startTime || !trainingDay) return;

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    // Save workout log
    const logId = `workout-${Date.now()}`;
    const workoutLog: WorkoutLog = {
      id: logId,
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

    await db.workoutLogs.add(workoutLog);
    setWorkoutLogId(logId);

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
        logId
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
    clearSession(); // Clear saved session on completion

    // Play celebration sound based on PRs achieved
    if (achievedPRs.length > 0) {
      audioManager.playPR();
    } else {
      audioManager.playWorkoutComplete();
    }

    // Check for new achievements after workout completion
    const newAchievements = await checkAchievements();
    if (newAchievements.length > 0) {
      addAchievementToasts(newAchievements);
    }

    // Immediately sync to cloud so workout appears on other devices
    if (isSyncAvailable()) {
      pushToCloud(user?.primaryEmailAddress?.emailAddress).catch((err) =>
        console.error("Failed to sync after workout:", err)
      );
    }
  };

  // Handle completing workout with notes
  const handleFinishWithNotes = async () => {
    if (workoutLogId && workoutNotes.trim()) {
      await updateWorkoutLog(workoutLogId, { notes: workoutNotes.trim() });
    }
    router.push("/");
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
      {/* Achievement Toast */}
      {currentToast && (
        <AchievementToast
          achievement={currentToast.achievement}
          onClose={() => removeAchievementToast(currentToast.achievement.id)}
        />
      )}

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
            {phase !== "preview" && phase !== "warmup" && phase !== "finisher" && phase !== "complete" && (
              <p className="text-xs text-muted-foreground">
                {completedSets.length} sets - {currentVolume.toLocaleString()}kg volume
              </p>
            )}
          </div>

          <div className="w-10" />
        </div>

        {/* Progress bar */}
        {phase !== "preview" && phase !== "warmup" && phase !== "finisher" && phase !== "complete" && (
          <div className="mt-3">
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        )}
      </header>

      <main className="p-4 overflow-hidden">
        <AnimatePresence mode="wait">
        {/* Preview Phase */}
        {phase === "preview" && (
          <motion.div
            key="preview"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={phaseTransition}
            className="space-y-6"
          >
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
              >
                <Play className="w-10 h-10 text-primary" />
              </motion.div>
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

            {/* Weekly Goal Banner */}
            {lastWeekVolumeTotal && lastWeekVolumeTotal > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
              >
                <Card className="p-4 bg-primary/10 border-primary/30">
                  <div className="flex items-center justify-center gap-3">
                    <Target className="w-5 h-5 text-primary" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Beat last week</p>
                      <p className="text-xl font-bold text-primary">
                        {lastWeekVolumeTotal.toLocaleString()}kg
                      </p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                </Card>
              </motion.div>
            )}

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
          </motion.div>
        )}

        {/* Warmup Phase */}
        {phase === "warmup" && trainingDay.warmup && (
          <motion.div
            key="warmup"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={phaseTransition}
            className="space-y-6"
          >
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
          </motion.div>
        )}

        {/* Exercise Phase */}
        {phase === "exercise" && currentExercise && (
          <motion.div
            key={`exercise-${workoutState.supersetIndex}-${workoutState.exerciseIndex}-${workoutState.setNumber}`}
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={phaseTransition}
            className="space-y-6"
          >
            {/* Current superset indicator */}
            <div className="flex items-center justify-center gap-2">
              {trainingDay.supersets.map((ss, idx) => (
                <motion.div
                  key={ss.id}
                  animate={{
                    scale: idx === workoutState.supersetIndex ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                    idx === workoutState.supersetIndex
                      ? "bg-primary text-primary-foreground"
                      : idx < workoutState.supersetIndex
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {ss.label}
                </motion.div>
              ))}
            </div>

            {/* Up Next preview - helps user prepare equipment */}
            {(() => {
              const nextExercise = getNextExercisePreview();
              if (!nextExercise) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Up Next
                    </p>
                    <p className="text-sm text-foreground font-medium truncate">
                      {nextExercise.label} {nextExercise.name}
                      {nextExercise.setNumber && ` - Set ${nextExercise.setNumber}`}
                    </p>
                  </div>
                  {nextExercise.equipment && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      <Dumbbell className="w-3 h-3 mr-1" />
                      {nextExercise.equipment}
                    </Badge>
                  )}
                </motion.div>
              );
            })()}

            {/* Challenge Card - Progressive overload nudge */}
            {globalSuggestion?.shouldNudgeIncrease &&
              globalSuggestion.nudgeWeight &&
              !challengeDismissedExercises.has(currentExercise.exerciseId) && (
                <ChallengeCard
                  currentWeight={globalSuggestion.lastWeight}
                  challengeWeight={globalSuggestion.nudgeWeight}
                  lastReps={globalSuggestion.lastReps}
                  isVisible={true}
                  onAccept={() => handleChallengeAccept(currentExercise.exerciseId)}
                  onDismiss={() => handleChallengeDismiss(currentExercise.exerciseId)}
                />
              )}

            {/* Completed sets for this exercise - tap to edit */}
            {(() => {
              const exerciseCompletedSets = getCompletedSetsForCurrentExercise();
              if (exerciseCompletedSets.length === 0) return null;
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4"
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Completed Sets (tap to edit)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exerciseCompletedSets.map((set) => (
                      <button
                        key={set.id}
                        type="button"
                        onClick={() => handleEditSet(set)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium",
                          "bg-success/20 text-success border border-success/30",
                          "hover:bg-success/30 active:scale-95 transition-all",
                          "flex items-center gap-1.5"
                        )}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Set {set.setNumber}</span>
                        <span className="text-success/70">
                          {set.weight}kg x {set.actualReps}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })()}

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
              lastWeekWeight={globalSuggestion?.lastWeight ?? weightSuggestion?.lastWeekWeight}
              lastWeekReps={globalSuggestion?.lastReps ?? weightSuggestion?.lastWeekReps}
              suggestedWeight={
                // Use nudge weight if challenge was accepted, otherwise use global or day-specific
                challengeDismissedExercises.has(currentExercise.exerciseId) &&
                globalSuggestion?.nudgeWeight
                  ? globalSuggestion.nudgeWeight
                  : globalSuggestion?.suggestedWeight ?? weightSuggestion?.weight
              }
              lastWorkoutDate={globalSuggestion?.lastDate}
              hitTargetLastTime={globalSuggestion?.hitTargetLastTime}
              videoUrl={currentExercise.videoUrl}
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
          </motion.div>
        )}

        {/* Rest Phase */}
        {phase === "rest" && currentExercise && (
          <motion.div
            key="rest"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={phaseTransition}
            className="py-8"
          >
            <RestTimer
              seconds={currentExercise.restSeconds}
              onComplete={handleRestComplete}
              autoStart={autoStartRestTimer}
              label="Rest Time"
            />

            {/* Next exercise preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            >
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
            </motion.div>
          </motion.div>
        )}

        {/* Finisher Phase */}
        {phase === "finisher" && trainingDay.finisher && (
          <motion.div
            key="finisher"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={phaseTransition}
            className="space-y-6"
          >
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Finisher
              </h2>
              <p className="text-muted-foreground">
                Complete the finisher exercises to wrap up
              </p>
            </div>

            <Card className="p-4 bg-card border-border">
              <ul className="space-y-4">
                {trainingDay.finisher.map((f, idx) => {
                  const exercise = exercises.get(f.exerciseId);
                  return (
                    <li
                      key={idx}
                      className="flex items-center gap-4 py-2"
                    >
                      <Checkbox
                        id={`finisher-${idx}`}
                        checked={finisherChecked[idx]}
                        onCheckedChange={() => toggleFinisher(idx)}
                        className="h-6 w-6"
                      />
                      <label
                        htmlFor={`finisher-${idx}`}
                        className={cn(
                          "flex-1 flex items-center justify-between cursor-pointer",
                          finisherChecked[idx] && "opacity-50"
                        )}
                      >
                        <div>
                          <span
                            className={cn(
                              "text-foreground block",
                              finisherChecked[idx] && "line-through"
                            )}
                          >
                            {exercise?.name || f.exerciseId}
                          </span>
                          {f.notes && (
                            <span className="text-sm text-muted-foreground">
                              {f.notes}
                            </span>
                          )}
                        </div>
                        {f.duration && (
                          <Badge variant="secondary">{f.duration}s</Badge>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </Card>

            {/* Complete button */}
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={finishWorkout}
              disabled={!allFinisherDone}
            >
              {allFinisherDone ? (
                <>
                  <Check className="w-6 h-6 mr-2" />
                  Complete Workout
                </>
              ) : (
                <>Complete finisher to finish</>
              )}
            </Button>
          </motion.div>
        )}

        {/* Complete Phase */}
        {phase === "complete" && startTime && (
          <motion.div
            key="complete"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={phaseTransition}
            className="py-12 text-center space-y-8"
          >
            <motion.div
              variants={trophyVariants}
              initial="initial"
              animate="animate"
              className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto"
            >
              <motion.div
                variants={celebrationPulse}
                initial="initial"
                animate="animate"
              >
                <Trophy className="w-12 h-12 text-success" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Workout Complete!
              </h2>
              <p className="text-muted-foreground">
                Great job crushing {trainingDay.name}
              </p>
            </motion.div>

            {/* PR Celebration Section */}
            {newPRs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
              >
                <Card className="p-6 bg-primary/10 border-primary/30">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <motion.div
                      variants={celebrationPulse}
                      initial="initial"
                      animate="animate"
                    >
                      <Trophy className="w-6 h-6 text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-primary">
                      {newPRs.length === 1 ? "New PR!" : `${newPRs.length} New PRs!`}
                    </h3>
                    <motion.div
                      variants={celebrationPulse}
                      initial="initial"
                      animate="animate"
                    >
                      <Trophy className="w-6 h-6 text-primary" />
                    </motion.div>
                  </div>
                  <motion.ul
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                  >
                    {newPRs.map((pr, idx) => (
                      <motion.li
                        key={idx}
                        variants={itemVariants}
                        className="flex items-center justify-between px-4 py-2 bg-background/50 rounded-lg"
                      >
                        <span className="text-foreground font-medium">
                          {pr.exerciseName}
                        </span>
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          {pr.weight}kg x {pr.reps}
                        </Badge>
                      </motion.li>
                    ))}
                  </motion.ul>
                </Card>
              </motion.div>
            )}

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
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
            </motion.div>

            {/* Volume Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Card className={`p-4 text-center ${
                lastWeekVolumeTotal && currentVolume > lastWeekVolumeTotal
                  ? "bg-success/10 border-success/30"
                  : "bg-card border-border"
              }`}>
                <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${
                  lastWeekVolumeTotal && currentVolume > lastWeekVolumeTotal
                    ? "text-success"
                    : "text-primary"
                }`} />
                <p className="text-2xl font-bold text-foreground">
                  {currentVolume.toLocaleString()}kg
                </p>
                <p className="text-xs text-muted-foreground">Total Volume</p>
                {lastWeekVolumeTotal && lastWeekVolumeTotal > 0 && (
                  <p className={`text-sm mt-1 font-medium ${
                    currentVolume > lastWeekVolumeTotal
                      ? "text-success"
                      : currentVolume === lastWeekVolumeTotal
                      ? "text-muted-foreground"
                      : "text-orange-500"
                  }`}>
                    {currentVolume > lastWeekVolumeTotal
                      ? `+${(currentVolume - lastWeekVolumeTotal).toLocaleString()}kg vs last week!`
                      : currentVolume === lastWeekVolumeTotal
                      ? "Matched last week"
                      : `${(lastWeekVolumeTotal - currentVolume).toLocaleString()}kg less than last week`}
                  </p>
                )}
              </Card>
            </motion.div>

            {/* Workout Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-4 bg-card border-border">
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Workout Notes (optional)
                </label>
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="How did the workout feel? Any observations..."
                  className="w-full min-h-[100px] p-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                size="lg"
                className="w-full h-14 text-lg font-semibold"
                onClick={handleFinishWithNotes}
              >
                Back to Home
              </Button>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* Resume Session Dialog */}
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent className="max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Resume Workout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have an unfinished workout from{" "}
              {savedSession
                ? new Date(savedSession.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "earlier"}
              . Would you like to continue where you left off?
              <span className="block mt-2 text-foreground font-medium">
                {savedSession?.completedSets.length || 0} sets completed,{" "}
                {savedSession?.currentVolume.toLocaleString() || 0}kg volume
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={discardSession}
              className="w-full sm:w-auto"
            >
              Start Fresh
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={resumeSession}
              className="w-full sm:w-auto bg-primary text-primary-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resume Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Set Drawer */}
      <EditSetDrawer
        isOpen={showEditDrawer}
        onClose={() => {
          setShowEditDrawer(false);
          setEditingSet(null);
        }}
        set={editingSet}
        onSave={handleSaveEditedSet}
      />
    </div>
  );
}
