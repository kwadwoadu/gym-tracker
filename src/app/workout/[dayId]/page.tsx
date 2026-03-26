"use client";

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
  Cloud,
  SkipForward,
} from "lucide-react";
import { RestTimer } from "@/components/workout/rest-timer";
import { EditSetDrawer } from "@/components/workout/edit-set-drawer";
import { ExerciseCarousel } from "@/components/workout/ExerciseCarousel";
import { ProgressDots } from "@/components/workout/progress-dots";
import { SetLoggerSheet } from "@/components/workout/set-logger-sheet";
import { SupersetContextBar } from "@/components/workout/superset-context-bar";
import { AchievementToast } from "@/components/gamification";
import { cn } from "@/lib/utils";
import { PRCelebration } from "@/components/shared/PRCelebration";
import { HEADING, DATA } from "@/lib/typography";
import { NotificationPrompt } from "@/components/notifications/NotificationPrompt";
import { ShareCardButton } from "@/components/workout/share-card-button";
import { CopilotWidget } from "@/components/workout/CopilotWidget";
import { subscribeToPush } from "@/lib/notifications/push-subscription";
import { useWorkoutSession } from "@/hooks/use-workout-session";
import { useWorkoutLogs } from "@/lib/queries";

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

export default function WorkoutSession() {
  const params = useParams();
  const router = useRouter();
  const dayId = params?.dayId as string;

  const {
    // State values
    isLoading,
    trainingDay,
    exercises,
    phase,
    warmupChecked,
    finisherChecked,
    completedSets,
    startTime,
    nextExercisePreview,
    weightSuggestion,
    newPRs,
    workoutNotes,
    setWorkoutNotes,
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
    globalSuggestion,
    editingSet,
    showEditDrawer,
    setShowEditDrawer,
    setEditingSet,
    autoStartRestTimer,
    showPRCelebration,
    setShowPRCelebration,
    celebrationPR,
    showNotificationPrompt,
    setShowNotificationPrompt,
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
    startWarmup,
    startWorkout,
    toggleWarmup,
    toggleFinisher,
    handleRestComplete,
    handleSaveEditedSet,
    finishWorkout,
    handleFinishWithNotes,
    formatDuration,
    resumeSession,
    discardSession,
    handleOpenSheet,
    handleSheetSetComplete,
    handleSheetSkip,
    handleEditFromCarousel,
    setWarmupChecked,
    setFinisherChecked,
  } = useWorkoutSession(dayId);

  // Fetch recent workout history for copilot widget (plateau detection, weight recommendation)
  const { data: workoutHistory } = useWorkoutLogs({ isComplete: true, limit: 20 });

  // Determine the current exercise for the copilot widget
  const copilotExerciseId = flatExercises[carouselIndex]?.exerciseId ?? null;
  const copilotExerciseName = copilotExerciseId
    ? exercises.get(copilotExerciseId)?.name ?? null
    : null;
  const copilotIsCompound = copilotExerciseId
    ? (exercises.get(copilotExerciseId)?.muscleGroups?.length ?? 0) >= 2
    : true;

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

  const sheetExercise = sheetFlatExercise
    ? exercises.get(sheetFlatExercise.exerciseId) || null
    : null;

  return (
    <div className="min-h-screen pb-safe-bottom">
      {/* Achievement Toast */}
      {currentToast && (
        <AchievementToast
          achievement={currentToast.achievement}
          onClose={() => removeAchievementToast(currentToast.achievement.id)}
        />
      )}

      {/* Milestone Modal for Level Ups */}
      <MilestoneModalComponent />

      {/* Header */}
      <header className="px-4 pt-6 pb-4 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-20">
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
            <Progress value={progress} className="h-2" />
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

            {/* Continue buttons */}
            <div className="flex gap-3">
              {!allWarmupDone && (
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-16 px-6 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    // Mark all warmup as done and skip
                    setWarmupChecked(warmupChecked.map(() => true));
                    startWorkout();
                  }}
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Skip
                </Button>
              )}
              <Button
                size="lg"
                className="flex-1 h-16 text-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
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
          </motion.div>
        )}

        {/* Exercise Phase - Swipe Carousel */}
        {phase === "exercise" && trainingDay && flatExercises.length > 0 && (
          <motion.div
            key="exercise-carousel"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={phaseTransition}
            className="flex flex-col h-[calc(100vh-120px)]"
          >
            {/* Progress dots */}
            <ProgressDots
              flatExercises={flatExercises}
              currentIndex={carouselIndex}
              completedSets={completedSets}
            />

            {/* Superset context bar - only for multi-exercise supersets */}
            {contextBarData && (
              <SupersetContextBar
                supersetLabel={contextBarData.supersetLabel}
                exercises={contextBarData.exercises}
                activeExerciseIndex={contextBarData.activeIndex}
                setNumber={contextBarData.setNumber}
                totalSets={contextBarData.totalSets}
                focusMode={focusMode}
                onToggleFocusMode={() => setFocusMode((prev) => !prev)}
              />
            )}

            {/* Swipeable exercise carousel with gesture feedback */}
            <ExerciseCarousel
              flatExercises={flatExercises}
              exercises={exercises}
              completedSets={completedSets}
              currentIndex={carouselIndex}
              onIndexChange={setCarouselIndex}
              onLogSet={handleOpenSheet}
              onEditSet={handleEditFromCarousel}
              isRestTimerActive={false}
              weightSuggestions={weightSuggestionsMap}
            />

            {/* Set Logger Bottom Sheet */}
            <SetLoggerSheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
              flatExercise={sheetFlatExercise}
              exercise={sheetExercise}
              setNumber={sheetSetNumber}
              totalSets={sheetFlatExercise?.sets || 4}
              suggestedWeight={sessionMemData.sessionMem?.weight ?? globalSuggestion?.nudgeWeight ?? globalSuggestion?.suggestedWeight ?? weightSuggestion?.weight}
              suggestedReps={sessionMemData.sessionMem?.reps ?? globalSuggestion?.suggestedReps}
              suggestedRpe={sessionMemData.sessionMem?.rpe ?? globalSuggestion?.suggestedRpe}
              lastWeekWeight={weightSuggestion?.lastWeekWeight ?? globalSuggestion?.lastWeight}
              lastWeekReps={weightSuggestion?.lastWeekReps ?? globalSuggestion?.lastReps}
              lastWorkoutDate={globalSuggestion?.lastDate}
              hitTargetLastTime={globalSuggestion?.hitTargetLastTime}
              memorySource={sessionMemData.memSource}
              onComplete={handleSheetSetComplete}
              onSkip={handleSheetSkip}
            />
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
              seconds={currentExercise.restSeconds ?? 60}
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

            {/* Complete buttons */}
            <div className="flex gap-3">
              {!allFinisherDone && (
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-16 px-6 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    // Mark all finisher as done and complete workout
                    setFinisherChecked(finisherChecked.map(() => true));
                    finishWorkout();
                  }}
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Skip
                </Button>
              )}
              <Button
                size="lg"
                className="flex-1 h-16 text-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
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
            </div>
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
              <h2 className={`${HEADING.h1} text-foreground mb-2`}>
                Workout Complete!
              </h2>
              <p className="text-muted-foreground">
                Great job crushing {trainingDay.name}
              </p>
            </motion.div>

            {saveError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm"
              >
                <p>{saveError}</p>
                <button
                  onClick={async () => {
                    setSaveError(null);
                    await finishWorkout();
                  }}
                  className="mt-2 underline text-xs"
                >
                  Tap to retry sync
                </button>
              </motion.div>
            )}

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
                <p className={`${DATA.medium} text-foreground`}>
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
                <p className={`${DATA.medium} text-foreground`}>
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
                <p className={`${DATA.medium} text-foreground`}>
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

            {/* Share Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <ShareCardButton
                workoutName={trainingDay?.name || "Workout"}
                date={new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                totalVolume={currentVolume}
                duration={
                  startTime
                    ? Math.floor(
                        (new Date().getTime() - startTime.getTime()) / 60000
                      )
                    : 0
                }
                topSets={completedSets
                  .filter((s) => s.weight > 0)
                  .sort((a, b) => b.weight * b.actualReps - a.weight * a.actualReps)
                  .slice(0, 3)
                  .map((s) => {
                    const ex = exercises.get(s.exerciseId);
                    return {
                      exercise: ex?.name || "Exercise",
                      weight: s.weight,
                      reps: s.actualReps,
                    };
                  })}
                prs={newPRs.map((pr) => ({
                  exercise: pr.exerciseName,
                  weight: pr.weight,
                }))}
                streakDays={0}
              />
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
              {savedSession?.isCloudSession ? (
                <Cloud className="w-5 h-5 text-primary" />
              ) : (
                <RotateCcw className="w-5 h-5 text-primary" />
              )}
              Resume Workout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {savedSession?.isCloudSession ? (
                <>You have an unfinished workout from <span className="text-primary font-medium">another device</span></>
              ) : (
                <>You have an unfinished workout from{" "}
                {savedSession
                  ? new Date(savedSession.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "earlier"}</>
              )}
              . Would you like to continue where you left off?
              <span className="block mt-2 text-foreground font-medium">
                {savedSession?.completedSets.length || 0} sets completed,{" "}
                {savedSession?.currentVolume.toLocaleString() || 0}kg volume
              </span>
              {savedSession?.isCloudSession && (
                <span className="block mt-1 text-xs text-muted-foreground">
                  Your progress is synced across devices
                </span>
              )}
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
              {savedSession?.isCloudSession ? (
                <Cloud className="w-4 h-4 mr-2" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              Resume Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Auto-skip prompt */}
      <AlertDialog open={!!showAutoSkipPrompt} onOpenChange={() => setShowAutoSkipPrompt(null)}>
        <AlertDialogContent className="max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <SkipForward className="w-5 h-5 text-primary" />
              Skip all remaining?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Skip this exercise for all remaining sets in this superset?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Just this once
            </AlertDialogCancel>
            <AlertDialogAction
              className="w-full sm:w-auto bg-primary text-primary-foreground"
              onClick={() => {
                if (showAutoSkipPrompt) {
                  setAutoSkipExercises((prev) => new Set(prev).add(showAutoSkipPrompt));
                }
                setShowAutoSkipPrompt(null);
              }}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip all remaining
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PR Celebration Overlay */}
      <PRCelebration
        show={showPRCelebration}
        exerciseName={celebrationPR?.exerciseName}
        weight={celebrationPR?.weight}
        reps={celebrationPR?.reps}
        onComplete={() => setShowPRCelebration(false)}
      />

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

      {/* Notification Prompt - shown after 3rd completed workout */}
      <NotificationPrompt
        open={showNotificationPrompt}
        onClose={() => setShowNotificationPrompt(false)}
        onEnable={async () => {
          await subscribeToPush();
          setShowNotificationPrompt(false);
        }}
      />

      {/* AI Copilot Widget - floating during exercise and rest phases */}
      {(phase === "exercise" || phase === "rest") && (
        <CopilotWidget
          currentExerciseId={copilotExerciseId}
          currentExerciseName={copilotExerciseName}
          isCompound={copilotIsCompound}
          completedSets={completedSets}
          workoutHistory={workoutHistory ?? []}
          exercises={exercises}
        />
      )}
    </div>
  );
}
