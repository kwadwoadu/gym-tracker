"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { flattenSupersets, type FlatExercise } from "@/lib/flatten-exercises";
import { useAchievementToasts, useMilestoneModal } from "@/components/gamification";
import { checkAchievements, XP_REWARDS } from "@/lib/gamification";
import { useAwardXP, useBulkUpdateChallengeProgress } from "@/lib/queries";
import {
  trainingDaysApi,
  exercisesApi,
  workoutLogsApi,
  type TrainingDay,
  type Exercise,
  type SetLog,
} from "@/lib/api-client";
import {
  getSuggestedWeight,
  getGlobalWeightSuggestion,
  checkAndAddPR,
  updateWorkoutLog,
  getLastWeekVolume,
  getUserSettings,
} from "@/lib/workout-helpers";
import { audioManager } from "@/lib/audio";
import {
  isPushSupported,
  getNotificationPermission,
} from "@/lib/notifications/push-subscription";

// --- Types ---

export type WorkoutPhase =
  | "preview"
  | "warmup"
  | "exercise"
  | "rest"
  | "finisher"
  | "complete";

export interface WorkoutState {
  supersetIndex: number; // Which superset (0=A, 1=B, 2=C)
  exerciseIndex: number; // Which exercise in superset (0 or 1)
  setNumber: number; // Current set number (1-4)
}

export interface NewPR {
  exerciseName: string;
  weight: number;
  reps: number;
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
  isCloudSession?: boolean; // True if loaded from cloud (different device)
  deviceId?: string;
}

// --- Constants ---

const SESSION_KEY_PREFIX = "setflow-session-";
const SESSION_EXPIRY_HOURS = 6; // Sessions expire after 6 hours
const CELEBRATION_VISIBLE_MS = 400;

// Generate a unique device ID for this browser
const getDeviceId = (): string => {
  const key = "setflow-device-id";
  let deviceId = localStorage.getItem(key);
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, deviceId);
  }
  return deviceId;
};

// --- Hook ---

export function useWorkoutSession(dayId: string) {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id ?? "anonymous";

  // Core state
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
  const [lastWeekVolumeTotal, setLastWeekVolumeTotal] = useState<number | null>(
    null
  );
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Refs
  const hasCheckedSession = useRef(false);
  const isRestoringSession = useRef(false);
  const lastSyncTime = useRef<number>(0);
  const currentDeviceId = useRef<string>("");
  const lastAutoSkippedRef = useRef<string | null>(null);

  // Swipe workout flow state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetExerciseIndex, setSheetExerciseIndex] = useState(0);

  // Global weight memory + edit sets state
  const [globalSuggestion, setGlobalSuggestion] = useState<{
    suggestedWeight: number;
    lastWeight: number;
    lastReps: number;
    lastRpe: number;
    suggestedReps: number;
    suggestedRpe: number;
    lastDate: string;
    hitTargetLastTime: boolean;
    shouldNudgeIncrease: boolean;
    nudgeWeight: number | null;
  } | null>(null);
  const [editingSet, setEditingSet] = useState<SetLog | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [challengeDismissedExercises, setChallengeDismissedExercises] =
    useState<Set<string>>(new Set());
  const [autoStartRestTimer, setAutoStartRestTimer] = useState(true);
  const [showPRCelebration, setShowPRCelebration] = useState(false);
  const [celebrationPR, setCelebrationPR] = useState<NewPR | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [autoSkipExercises, setAutoSkipExercises] = useState<Set<string>>(
    new Set()
  );
  const [showAutoSkipPrompt, setShowAutoSkipPrompt] = useState<string | null>(
    null
  ); // exerciseId to prompt for
  const [focusMode, setFocusMode] = useState(false);

  // Achievement toasts
  const {
    addToasts: addAchievementToasts,
    removeToast: removeAchievementToast,
    currentToast,
  } = useAchievementToasts();

  // Milestone modal for level ups
  const { showLevelUp, MilestoneModalComponent } = useMilestoneModal();

  // XP mutations
  const awardXPMutation = useAwardXP();
  const bulkUpdateChallengeMutation = useBulkUpdateChallengeProgress();

  // --- Memoized values ---

  // Flatten supersets for carousel navigation (must be before early return for hooks rule)
  const flatExercises = useMemo<FlatExercise[]>(
    () => (trainingDay ? flattenSupersets(trainingDay.supersets) : []),
    [trainingDay]
  );

  // Calculate progress
  const progress = useMemo(() => {
    if (!trainingDay) return 0;
    const totalSets = trainingDay.supersets.reduce(
      (acc, ss) => acc + ss.exercises.reduce((a, e) => a + e.sets, 0),
      0
    );
    return Math.round((completedSets.length / totalSets) * 100);
  }, [trainingDay, completedSets.length]);

  // Get the flat exercise for the current sheet
  const sheetFlatExercise = flatExercises[sheetExerciseIndex] || null;
  const sheetCompletedCount = sheetFlatExercise
    ? completedSets.filter(
        (s) => s.exerciseId === sheetFlatExercise.exerciseId
      ).length
    : 0;
  const sheetSetNumber = sheetCompletedCount + 1;

  // --- Callbacks ---

  // Get current exercise data
  const getCurrentExercise = useCallback(() => {
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
  }, [trainingDay, workoutState.supersetIndex, workoutState.exerciseIndex, exercises]);

  // Build weight suggestions map for carousel (memoized)
  const weightSuggestionsMap = useMemo(() => {
    const map = new Map<
      string,
      { weight: number; lastWeekWeight: number; lastWeekReps: number }
    >();
    if (weightSuggestion) {
      const currentEx = getCurrentExercise();
      if (currentEx) {
        map.set(currentEx.exerciseId, {
          weight: weightSuggestion.weight,
          lastWeekWeight: weightSuggestion.lastWeekWeight,
          lastWeekReps: weightSuggestion.lastWeekReps,
        });
      }
    }
    return map;
  }, [weightSuggestion, getCurrentExercise]);

  // Get session memory for within-workout set-to-set memory
  const getSessionMemoryForExercise = useCallback(
    (
      exerciseId: string,
      setNumber: number
    ): { weight: number; reps: number; rpe: number } | null => {
      const previousSets = completedSets
        .filter((s) => s.exerciseId === exerciseId && s.setNumber < setNumber)
        .sort((a, b) => b.setNumber - a.setNumber);

      if (previousSets.length > 0) {
        const prev = previousSets[0];
        return {
          weight: prev.weight,
          reps: prev.actualReps,
          rpe: prev.rpe ?? 7,
        };
      }
      return null;
    },
    [completedSets]
  );

  // Session memory for set logger sheet
  const sessionMemData = useMemo(() => {
    const sessionMem = sheetFlatExercise
      ? getSessionMemoryForExercise(
          sheetFlatExercise.exerciseId,
          sheetSetNumber
        )
      : null;
    const memSource: "session" | "historical" | undefined = sessionMem
      ? "session"
      : globalSuggestion
        ? "historical"
        : undefined;
    return { sessionMem, memSource };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sheetFlatExercise?.exerciseId,
    sheetSetNumber,
    completedSets,
    globalSuggestion,
  ]);

  // Superset context bar data - memoized to avoid IIFE in JSX
  const contextBarData = useMemo(() => {
    const currentFlat = flatExercises[carouselIndex];
    if (!currentFlat || currentFlat.supersetSize <= 1) return null;
    const ssExercises = flatExercises
      .filter((f) => f.supersetId === currentFlat.supersetId)
      .map((f) => ({
        id: f.exerciseId,
        name: exercises.get(f.exerciseId)?.name || f.exerciseId,
      }));
    const completedCount = completedSets.filter(
      (s) => s.exerciseId === currentFlat.exerciseId
    ).length;
    return {
      supersetLabel: currentFlat.supersetLabel,
      exercises: ssExercises,
      activeIndex: currentFlat.indexInSuperset,
      setNumber: Math.min(completedCount + 1, currentFlat.sets),
      totalSets: currentFlat.sets,
    };
  }, [carouselIndex, flatExercises, exercises, completedSets]);

  // --- Effects ---

  // Load training day and exercises
  useEffect(() => {
    async function loadData() {
      try {
        const day = await trainingDaysApi.get(dayId);
        if (!day) {
          router.push("/");
          return;
        }
        setTrainingDay(day);

        // Initialize warmup checkboxes
        const warmup = day.warmup as Array<{
          exerciseId: string;
          reps: number;
        }> | null;
        if (warmup) {
          setWarmupChecked(new Array(warmup.length).fill(false));
        }

        // Initialize finisher checkboxes
        const finisher = day.finisher as Array<{
          exerciseId: string;
          reps: number;
        }> | null;
        if (finisher) {
          setFinisherChecked(new Array(finisher.length).fill(false));
        }

        const allExercises = await exercisesApi.list();
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

  // Recover any pending workout data that failed to sync on previous session
  useEffect(() => {
    if (!userId || userId === "anonymous") return;
    const pendingKey = `pending-workout-${userId}`;
    const pendingData = localStorage.getItem(pendingKey);
    if (!pendingData) return;

    async function recoverPendingWorkout() {
      try {
        const workoutLogData = JSON.parse(pendingData!);
        await workoutLogsApi.create(workoutLogData);
        localStorage.removeItem(pendingKey);
      } catch (e) {
        console.error("Failed to recover pending workout:", e);
      }
    }

    recoverPendingWorkout();
  }, [userId]);

  // Check for saved session on mount (local + cloud)
  useEffect(() => {
    if (hasCheckedSession.current || isLoading) return;
    hasCheckedSession.current = true;

    // Initialize device ID
    currentDeviceId.current = getDeviceId();

    async function checkSessions() {
      const sessionKey = `${SESSION_KEY_PREFIX}${dayId}`;
      const localData = localStorage.getItem(sessionKey);
      let localSession: SavedSession | null = null;

      // Check local session first
      if (localData) {
        try {
          const session: SavedSession = JSON.parse(localData);
          const ageHours =
            (Date.now() - session.timestamp) / (1000 * 60 * 60);

          if (
            ageHours < SESSION_EXPIRY_HOURS &&
            session.phase !== "complete" &&
            session.phase !== "preview"
          ) {
            localSession = session;
          } else {
            localStorage.removeItem(sessionKey);
          }
        } catch (e) {
          console.error("Failed to parse local session:", e);
          localStorage.removeItem(sessionKey);
        }
      }

      // Check cloud session for cross-device resume
      try {
        const response = await fetch("/api/session", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.session && data.session.dayId === dayId) {
            const cloudSession: SavedSession = {
              phase: data.session.phase as WorkoutPhase,
              workoutState: data.session.workoutState as WorkoutState,
              completedSets: data.session.completedSets as SetLog[],
              startTime: data.session.startTime,
              warmupChecked: data.session.warmupChecked as boolean[],
              finisherChecked: data.session.finisherChecked as boolean[],
              currentVolume: data.session.currentVolume,
              timestamp: new Date(data.session.lastUpdated).getTime(),
              isCloudSession:
                data.session.deviceId !== currentDeviceId.current,
              deviceId: data.session.deviceId,
            };

            if (cloudSession.isCloudSession) {
              setSavedSession(cloudSession);
              setShowResumeDialog(true);
              return;
            } else if (
              !localSession ||
              cloudSession.timestamp > localSession.timestamp
            ) {
              localSession = cloudSession;
            }
          }
        }
      } catch (e) {
        console.error("Failed to check cloud session:", e);
      }

      if (localSession) {
        setSavedSession(localSession);
        setShowResumeDialog(true);
      }
    }

    checkSessions();
  }, [dayId, isLoading]);

  // Save session to localStorage and sync to cloud on state changes
  useEffect(() => {
    if (
      isLoading ||
      phase === "preview" ||
      phase === "complete" ||
      isRestoringSession.current
    )
      return;

    const sessionKey = `${SESSION_KEY_PREFIX}${dayId}`;
    const now = Date.now();
    const sessionData: SavedSession = {
      phase,
      workoutState,
      completedSets,
      startTime: startTime?.toISOString() || new Date().toISOString(),
      warmupChecked,
      finisherChecked,
      currentVolume,
      timestamp: now,
      deviceId: currentDeviceId.current,
    };

    localStorage.setItem(sessionKey, JSON.stringify(sessionData));

    const shouldSync = now - lastSyncTime.current > 10000;
    if (shouldSync) {
      lastSyncTime.current = now;

      fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dayId,
          phase,
          workoutState,
          completedSets,
          warmupChecked,
          finisherChecked,
          currentVolume,
          startTime: startTime?.toISOString() || new Date().toISOString(),
          deviceId: currentDeviceId.current,
        }),
      }).catch((e) => console.error("Failed to sync session to cloud:", e));
    }
  }, [
    dayId,
    phase,
    workoutState,
    completedSets,
    startTime,
    warmupChecked,
    finisherChecked,
    currentVolume,
    isLoading,
  ]);

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
  }, [
    phase,
    trainingDay,
    workoutState.supersetIndex,
    workoutState.exerciseIndex,
    workoutState.setNumber,
    dayId,
  ]);

  // Auto-skip exercises that the user has opted to skip all remaining sets
  useEffect(() => {
    if (phase !== "exercise" || !trainingDay || autoSkipExercises.size === 0)
      return;

    const superset = trainingDay.supersets[workoutState.supersetIndex];
    if (!superset) return;
    const exerciseData = superset.exercises[workoutState.exerciseIndex];
    if (!exerciseData) return;

    const key = `${exerciseData.exerciseId}-${workoutState.setNumber}`;
    if (
      autoSkipExercises.has(exerciseData.exerciseId) &&
      lastAutoSkippedRef.current !== key
    ) {
      lastAutoSkippedRef.current = key;
      handleSkipSet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    phase,
    trainingDay,
    workoutState.supersetIndex,
    workoutState.exerciseIndex,
    workoutState.setNumber,
    autoSkipExercises,
  ]);

  // --- Handlers ---

  // Initialize audio on first user interaction
  const initAudio = useCallback(async () => {
    if (!audioInitialized) {
      await audioManager.init();
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  // Get next exercise preview (for equipment preparation)
  const getNextExercisePreview = () => {
    if (!trainingDay) return null;

    const currentSuperset = trainingDay.supersets[workoutState.supersetIndex];
    if (!currentSuperset) return null;

    const currentExerciseData =
      currentSuperset.exercises[workoutState.exerciseIndex];
    const totalSets = currentExerciseData?.sets || 4;
    const exercisesInSuperset = currentSuperset.exercises.length;

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
          if (trainingDay.finisher && trainingDay.finisher.length > 0) {
            const finisherExercise = exercises.get(
              trainingDay.finisher[0].exerciseId
            );
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

    const currentExercise = exercises.get(currentExerciseData.exerciseId);
    const equipmentDiffers =
      nextExercise?.equipment !== currentExercise?.equipment;

    return {
      name: nextExercise?.name || "Unknown",
      label: `${nextSuperset.label}${nextExerciseIndex + 1}`,
      setNumber: nextSetNumber,
      equipment: equipmentDiffers ? nextExercise?.equipment : undefined,
    };
  };

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

    await audioManager.init();
    setAudioInitialized(true);

    setShowResumeDialog(false);
    setSavedSession(null);

    setTimeout(() => {
      isRestoringSession.current = false;
    }, 100);
  };

  // Discard saved session and start fresh (clear local + cloud)
  const discardSession = () => {
    const sessionKey = `${SESSION_KEY_PREFIX}${dayId}`;
    localStorage.removeItem(sessionKey);
    setShowResumeDialog(false);
    setSavedSession(null);

    fetch("/api/session", {
      method: "DELETE",
      credentials: "include",
    }).catch((e) => console.error("Failed to clear cloud session:", e));
  };

  // Clear session when workout is complete (local + cloud)
  const clearSession = () => {
    const sessionKey = `${SESSION_KEY_PREFIX}${dayId}`;
    localStorage.removeItem(sessionKey);

    fetch("/api/session", {
      method: "DELETE",
      credentials: "include",
    }).catch((e) => console.error("Failed to clear cloud session:", e));
  };

  // Start warmup phase
  const startWarmup = async () => {
    await initAudio();
    setStartTime(new Date());

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

  // Finish workout
  const finishWorkout = async () => {
    if (!startTime || !trainingDay) return;

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    const workoutLogData = {
      date: startTime.toISOString().split("T")[0],
      dayId: trainingDay.id,
      dayName: trainingDay.name,
      programId: trainingDay.programId,
      sets: completedSets,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: Math.floor(duration / 60),
      isComplete: true,
    };

    // Save to localStorage first - data safety net
    try {
      localStorage.setItem(
        `pending-workout-${userId}`,
        JSON.stringify(workoutLogData)
      );
    } catch {
      // localStorage full or unavailable - continue anyway
    }

    // Show completion screen immediately (optimistic)
    setPhase("complete");
    clearSession();

    // Then try API save in background
    try {
      const savedLog = await workoutLogsApi.create(workoutLogData);
      setWorkoutLogId(savedLog.id);

      localStorage.removeItem(`pending-workout-${userId}`);

      // Secondary operations
      try {
        // Check for PRs
        const exerciseBestSets = new Map<string, SetLog>();
        for (const set of completedSets) {
          const existing = exerciseBestSets.get(set.exerciseId);
          if (
            !existing ||
            set.weight > existing.weight ||
            (set.weight === existing.weight &&
              set.actualReps > existing.actualReps)
          ) {
            exerciseBestSets.set(set.exerciseId, set);
          }
        }

        const achievedPRs: NewPR[] = [];
        for (const [exerciseId, bestSet] of exerciseBestSets) {
          const isPR = await checkAndAddPR(
            exerciseId,
            bestSet.exerciseName,
            bestSet.weight,
            bestSet.actualReps,
            savedLog.id
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

        if (achievedPRs.length > 0) {
          audioManager.playPR();
          setCelebrationPR(achievedPRs[0]);
          setShowPRCelebration(true);
        } else {
          audioManager.playWorkoutComplete();
        }

        // Award XP for workout completion
        try {
          const workoutXPResult = await awardXPMutation.mutateAsync({
            amount: XP_REWARDS.WORKOUT_COMPLETE,
            source: "workout",
          });

          if (workoutXPResult.levelUp?.didLevelUp) {
            showLevelUp(
              workoutXPResult.levelUp.newLevel,
              workoutXPResult.levelUp.title || ""
            );
          }

          for (const pr of achievedPRs) {
            await awardXPMutation.mutateAsync({
              amount: XP_REWARDS.PR_SET,
              source: `pr:${pr.exerciseName}`,
            });
          }

          const allSetsComplete = completedSets.every((set) => !set.skipped);
          if (allSetsComplete && completedSets.length > 0) {
            await awardXPMutation.mutateAsync({
              amount: XP_REWARDS.ALL_SETS_COMPLETE,
              source: "all_sets_complete",
            });
          }

          await bulkUpdateChallengeMutation.mutateAsync({
            requirementType: "workout",
            value: 1,
          });

          if (currentVolume > 0) {
            await bulkUpdateChallengeMutation.mutateAsync({
              requirementType: "volume",
              value: currentVolume,
            });
          }

          const totalReps = completedSets.reduce(
            (sum, set) => sum + set.actualReps,
            0
          );
          if (totalReps > 0) {
            await bulkUpdateChallengeMutation.mutateAsync({
              requirementType: "reps",
              value: totalReps,
            });
          }

          const completedSetCount = completedSets.filter(
            (s) => !s.skipped
          ).length;
          if (completedSetCount > 0) {
            await bulkUpdateChallengeMutation.mutateAsync({
              requirementType: "sets",
              value: completedSetCount,
            });
          }

          if (achievedPRs.length > 0) {
            await bulkUpdateChallengeMutation.mutateAsync({
              requirementType: "prs",
              value: achievedPRs.length,
            });
          }
        } catch (xpError) {
          console.error("Error awarding XP:", xpError);
        }

        // Check for new achievements after workout completion
        const newAchievements = await checkAchievements();
        if (newAchievements.length > 0) {
          addAchievementToasts(newAchievements);
        }

        // Check if we should show the notification prompt (after 3rd workout)
        try {
          const allLogs = await workoutLogsApi.list({ limit: 10 });
          const completedCount = allLogs.filter(
            (l: { isComplete: boolean }) => l.isComplete
          ).length;
          if (
            completedCount >= 3 &&
            isPushSupported() &&
            getNotificationPermission() === "default"
          ) {
            setTimeout(() => setShowNotificationPrompt(true), 2000);
          }
        } catch {
          // Non-critical - skip notification prompt
        }
      } catch (secondaryError) {
        console.error(
          "Error during PR/achievement checks:",
          secondaryError
        );
        audioManager.playWorkoutComplete();
      }
    } catch (error) {
      console.error("Error saving workout to server:", error);
      setSaveError(
        "Workout saved locally. Will sync when connection is restored."
      );
    }
  };

  // Handle skipping a set
  const handleSkipSet = () => {
    if (!trainingDay) return;

    const currentEx = getCurrentExercise();
    if (!currentEx) return;

    const exercise = exercises.get(currentEx.exerciseId);
    const targetRepsStr = currentEx.reps.split(",")[0] || "10";
    const targetReps = parseInt(targetRepsStr.split("-")[0]) || 10;

    const setLog: SetLog = {
      id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exerciseId: currentEx.exerciseId,
      exerciseName: exercise?.name || "Unknown",
      supersetLabel:
        trainingDay.supersets[workoutState.supersetIndex].label,
      setNumber: workoutState.setNumber,
      targetReps,
      actualReps: 0,
      weight: 0,
      unit: "kg",
      isComplete: false,
      skipped: true,
      completedAt: new Date().toISOString(),
    };
    setCompletedSets((prev) => [...prev, setLog]);

    // Offer auto-skip if this exercise is in a superset (>1 exercise)
    const currentSuperset =
      trainingDay.supersets[workoutState.supersetIndex];
    if (
      currentSuperset.exercises.length > 1 &&
      !autoSkipExercises.has(currentEx.exerciseId)
    ) {
      setShowAutoSkipPrompt(currentEx.exerciseId);
    }

    // Progress to next set
    const superset = trainingDay.supersets[workoutState.supersetIndex];
    const totalSets = currentEx.sets;
    const exercisesInSuperset = superset.exercises.length;

    let nextSupersetIndex = workoutState.supersetIndex;
    let nextExerciseIndex = workoutState.exerciseIndex;
    let nextSetNumber = workoutState.setNumber;

    if (focusMode) {
      nextSetNumber++;
      if (nextSetNumber > totalSets) {
        nextExerciseIndex++;
        nextSetNumber = 1;
        if (nextExerciseIndex >= exercisesInSuperset) {
          nextExerciseIndex = 0;
          nextSupersetIndex++;
          if (nextSupersetIndex >= trainingDay.supersets.length) {
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
    } else {
      nextExerciseIndex++;
      if (nextExerciseIndex >= exercisesInSuperset) {
        nextExerciseIndex = 0;
        nextSetNumber++;
        if (nextSetNumber > totalSets) {
          nextSetNumber = 1;
          nextSupersetIndex++;
          if (nextSupersetIndex >= trainingDay.supersets.length) {
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
    }

    setWorkoutState({
      supersetIndex: nextSupersetIndex,
      exerciseIndex: nextExerciseIndex,
      setNumber: nextSetNumber,
    });

    const nextSuperset = trainingDay.supersets[nextSupersetIndex];
    const nextExerciseData = nextSuperset.exercises[nextExerciseIndex];
    const nextExercise = exercises.get(nextExerciseData.exerciseId);
    setNextExercisePreview(
      `${nextSuperset.label}${nextExerciseIndex + 1} ${nextExercise?.name || "Unknown"} - Set ${nextSetNumber}`
    );

    setPhase("rest");
  };

  // Handle set completion
  const handleSetComplete = (weight: number, reps: number, rpe?: number) => {
    if (!trainingDay) return;

    const currentEx = getCurrentExercise();
    if (!currentEx) return;

    const exercise = exercises.get(currentEx.exerciseId);
    const targetRepsStr = currentEx.reps.split(",")[0] || "10";
    const targetReps = parseInt(targetRepsStr.split("-")[0]) || 10;

    const setLog: SetLog = {
      id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exerciseId: currentEx.exerciseId,
      exerciseName: exercise?.name || "Unknown",
      supersetLabel:
        trainingDay.supersets[workoutState.supersetIndex].label,
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

    setCurrentVolume((prev) => prev + weight * reps);

    const superset = trainingDay.supersets[workoutState.supersetIndex];
    const totalSets = currentEx.sets;
    const exercisesInSuperset = superset.exercises.length;

    let nextSupersetIndex = workoutState.supersetIndex;
    let nextExerciseIndex = workoutState.exerciseIndex;
    let nextSetNumber = workoutState.setNumber;

    if (focusMode) {
      nextSetNumber++;
      if (nextSetNumber > totalSets) {
        nextExerciseIndex++;
        nextSetNumber = 1;
        if (nextExerciseIndex >= exercisesInSuperset) {
          nextExerciseIndex = 0;
          nextSupersetIndex++;
          if (nextSupersetIndex >= trainingDay.supersets.length) {
            setTimeout(() => {
              if (trainingDay.finisher && trainingDay.finisher.length > 0) {
                setPhase("finisher");
                audioManager.playSetStart();
              } else {
                finishWorkout();
              }
            }, CELEBRATION_VISIBLE_MS);
            return;
          }
        }
      }
    } else {
      nextExerciseIndex++;

      if (nextExerciseIndex >= exercisesInSuperset) {
        nextExerciseIndex = 0;
        nextSetNumber++;

        if (nextSetNumber > totalSets) {
          nextSetNumber = 1;
          nextSupersetIndex++;

          if (nextSupersetIndex >= trainingDay.supersets.length) {
            setTimeout(() => {
              if (trainingDay.finisher && trainingDay.finisher.length > 0) {
                setPhase("finisher");
                audioManager.playSetStart();
              } else {
                finishWorkout();
              }
            }, CELEBRATION_VISIBLE_MS);
            return;
          }
        }
      }
    }

    setWorkoutState({
      supersetIndex: nextSupersetIndex,
      exerciseIndex: nextExerciseIndex,
      setNumber: nextSetNumber,
    });

    const nextSuperset = trainingDay.supersets[nextSupersetIndex];
    const nextExerciseData = nextSuperset.exercises[nextExerciseIndex];
    const nextExercise = exercises.get(nextExerciseData.exerciseId);
    setNextExercisePreview(
      `${nextSuperset.label}${nextExerciseIndex + 1} ${nextExercise?.name || "Unknown"} - Set ${nextSetNumber}`
    );

    setTimeout(() => {
      setPhase("rest");
    }, CELEBRATION_VISIBLE_MS);
  };

  // Handle rest timer complete - auto-scroll carousel to next exercise
  const handleRestComplete = () => {
    if (trainingDay) {
      const targetSuperset =
        trainingDay.supersets[workoutState.supersetIndex];
      if (targetSuperset) {
        const targetIndex = flatExercises.findIndex(
          (f) =>
            f.supersetId === targetSuperset.id &&
            f.indexInSuperset === workoutState.exerciseIndex
        );
        if (targetIndex >= 0) setCarouselIndex(targetIndex);
      }
    }
    setPhase("exercise");
    audioManager.playSetStart();
  };

  // Handle challenge card accept
  const handleChallengeAccept = (exerciseId: string) => {
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
  const handleSaveEditedSet = (updates: {
    weight: number;
    actualReps: number;
    rpe?: number;
  }) => {
    if (!editingSet) return;

    const oldVolume = editingSet.weight * editingSet.actualReps;
    const newVolume = updates.weight * updates.actualReps;
    const volumeDiff = newVolume - oldVolume;

    setCompletedSets((prev) =>
      prev.map((s) =>
        s.id === editingSet.id
          ? {
              ...s,
              weight: updates.weight,
              actualReps: updates.actualReps,
              rpe: updates.rpe,
            }
          : s
      )
    );

    setCurrentVolume((prev) => prev + volumeDiff);

    setShowEditDrawer(false);
    setEditingSet(null);
  };

  // Get completed sets for current exercise
  const getCompletedSetsForCurrentExercise = () => {
    const currentEx = getCurrentExercise();
    if (!currentEx) return [];
    return completedSets.filter((s) => s.exerciseId === currentEx.exerciseId);
  };

  // Handle completing workout with notes
  const handleFinishWithNotes = async () => {
    if (workoutLogId && workoutNotes.trim()) {
      await updateWorkoutLog(workoutLogId, { notes: workoutNotes.trim() });
    }
    router.push("/");
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

  // Handle opening set logger sheet from carousel
  const handleOpenSheet = (exerciseIndex: number) => {
    setSheetExerciseIndex(exerciseIndex);
    setSheetOpen(true);
    if (!audioInitialized) {
      audioManager.init().then(() => setAudioInitialized(true));
    }
  };

  // Handle set completion from sheet
  const handleSheetSetComplete = (
    weight: number,
    reps: number,
    rpe?: number
  ) => {
    setSheetOpen(false);

    if (sheetFlatExercise && trainingDay) {
      let ssIdx = 0;
      let exIdx = 0;
      for (let s = 0; s < trainingDay.supersets.length; s++) {
        for (let e = 0; e < trainingDay.supersets[s].exercises.length; e++) {
          if (
            trainingDay.supersets[s].id === sheetFlatExercise.supersetId &&
            e === sheetFlatExercise.indexInSuperset
          ) {
            ssIdx = s;
            exIdx = e;
          }
        }
      }

      setWorkoutState({
        supersetIndex: ssIdx,
        exerciseIndex: exIdx,
        setNumber: sheetSetNumber,
      });

      handleSetComplete(weight, reps, rpe);
    }
  };

  // Handle set skip from sheet
  const handleSheetSkip = () => {
    setSheetOpen(false);
    handleSkipSet();
  };

  // Handle editing a completed set from carousel dot tap
  const handleEditFromCarousel = (exerciseId: string, setNumber: number) => {
    const set = completedSets.find(
      (s) => s.exerciseId === exerciseId && s.setNumber === setNumber
    );
    if (set) {
      setEditingSet(set);
      setShowEditDrawer(true);
    }
  };

  // --- Return ---

  return {
    // State values
    isLoading,
    trainingDay,
    exercises,
    phase,
    workoutState,
    warmupChecked,
    finisherChecked,
    completedSets,
    startTime,
    audioInitialized,
    nextExercisePreview,
    weightSuggestion,
    newPRs,
    workoutNotes,
    setWorkoutNotes,
    workoutLogId,
    lastWeekVolumeTotal,
    currentVolume,
    showResumeDialog,
    setShowResumeDialog,
    savedSession,
    saveError,
    setSaveError,
    carouselIndex,
    setCarouselIndex,
    sheetOpen,
    setSheetOpen,
    sheetExerciseIndex,
    globalSuggestion,
    editingSet,
    showEditDrawer,
    setShowEditDrawer,
    setEditingSet,
    challengeDismissedExercises,
    autoStartRestTimer,
    showPRCelebration,
    setShowPRCelebration,
    celebrationPR,
    showNotificationPrompt,
    setShowNotificationPrompt,
    autoSkipExercises,
    setAutoSkipExercises,
    showAutoSkipPrompt,
    setShowAutoSkipPrompt,
    focusMode,
    setFocusMode,

    // Gamification
    currentToast,
    removeAchievementToast,
    MilestoneModalComponent,

    // Computed / memoized values
    flatExercises,
    progress,
    sheetFlatExercise,
    sheetSetNumber,
    sessionMemData,
    contextBarData,
    weightSuggestionsMap,
    allWarmupDone,
    allFinisherDone,

    // Handlers
    getCurrentExercise,
    getNextExercisePreview,
    getSessionMemoryForExercise,
    startWarmup,
    startWorkout,
    toggleWarmup,
    toggleFinisher,
    handleSkipSet,
    handleSetComplete,
    handleRestComplete,
    handleChallengeAccept,
    handleChallengeDismiss,
    handleEditSet,
    handleSaveEditedSet,
    getCompletedSetsForCurrentExercise,
    finishWorkout,
    handleFinishWithNotes,
    getTargetReps,
    formatDuration,
    resumeSession,
    discardSession,
    handleOpenSheet,
    handleSheetSetComplete,
    handleSheetSkip,
    handleEditFromCarousel,
    initAudio,
    setWarmupChecked,
    setFinisherChecked,
  };
}
