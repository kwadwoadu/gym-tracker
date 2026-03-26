"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import type { FlatExercise } from "@/lib/flatten-exercises";
import type { Exercise, SetLog } from "@/lib/api-client";
import { Dumbbell, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { vibrateShort } from "@/lib/haptics";

const SWIPE_HINT_STORAGE_KEY = "setflow-swipe-hint-seen";

interface ExerciseCarouselProps {
  flatExercises: FlatExercise[];
  exercises: Map<string, Exercise>;
  completedSets: SetLog[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onLogSet: (exerciseIndex: number) => void;
  onEditSet: (exerciseId: string, setNumber: number) => void;
  isRestTimerActive: boolean;
  weightSuggestions: Map<
    string,
    { weight: number; lastWeekWeight: number; lastWeekReps: number }
  >;
}

export function ExerciseCarousel({
  flatExercises,
  exercises,
  completedSets,
  currentIndex,
  onIndexChange,
  onLogSet,
  onEditSet,
  isRestTimerActive,
  weightSuggestions,
}: ExerciseCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
    watchDrag: () => !isRestTimerActive,
    startIndex: currentIndex,
  });

  // Edge bounce state
  const [edgeBounce, setEdgeBounce] = useState<"left" | "right" | null>(null);
  const edgeBounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Swipe hint state
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const swipeHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if swipe hint should show on first use
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeen = localStorage.getItem(SWIPE_HINT_STORAGE_KEY);
    if (!hasSeen && flatExercises.length > 1) {
      swipeHintTimerRef.current = setTimeout(() => {
        setShowSwipeHint(true);
      }, 1500);
    }
    return () => {
      if (swipeHintTimerRef.current) {
        clearTimeout(swipeHintTimerRef.current);
      }
    };
  }, [flatExercises.length]);

  // Dismiss swipe hint after interaction or timeout
  const dismissSwipeHint = useCallback(() => {
    setShowSwipeHint(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(SWIPE_HINT_STORAGE_KEY, "true");
    }
  }, []);

  // Auto-dismiss hint after 4 seconds
  useEffect(() => {
    if (!showSwipeHint) return;
    const timer = setTimeout(dismissSwipeHint, 4000);
    return () => clearTimeout(timer);
  }, [showSwipeHint, dismissSwipeHint]);

  // Sync carousel to external index changes
  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== currentIndex) {
      emblaApi.scrollTo(currentIndex, false);
    }
  }, [emblaApi, currentIndex]);

  const triggerEdgeBounce = useCallback(
    (direction: "left" | "right") => {
      if (edgeBounce) return; // Prevent stacking
      setEdgeBounce(direction);
      vibrateShort();
      if (edgeBounceTimerRef.current) {
        clearTimeout(edgeBounceTimerRef.current);
      }
      edgeBounceTimerRef.current = setTimeout(() => {
        setEdgeBounce(null);
      }, 400);
    },
    [edgeBounce]
  );

  // Report index changes from swipe + detect edge bounces
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const idx = emblaApi.selectedScrollSnap();
      if (idx !== currentIndex) {
        vibrateShort();
        onIndexChange(idx);
        // Dismiss swipe hint on first swipe
        if (showSwipeHint) dismissSwipeHint();
      }
    };

    // Detect edge scroll attempts for bounce effect
    const onScroll = () => {
      const scrollProgress = emblaApi.scrollProgress();
      // At left edge (scrolling left past first)
      if (scrollProgress < -0.02 && currentIndex === 0) {
        triggerEdgeBounce("left");
      }
      // At right edge (scrolling right past last)
      if (
        scrollProgress > 1.02 &&
        currentIndex === flatExercises.length - 1
      ) {
        triggerEdgeBounce("right");
      }
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("scroll", onScroll);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("scroll", onScroll);
    };
  }, [
    emblaApi,
    currentIndex,
    onIndexChange,
    showSwipeHint,
    dismissSwipeHint,
    flatExercises.length,
    triggerEdgeBounce,
  ]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (edgeBounceTimerRef.current) clearTimeout(edgeBounceTimerRef.current);
    };
  }, []);

  const getCompletedSetCount = useCallback(
    (exerciseId: string): number => {
      return completedSets.filter((s) => s.exerciseId === exerciseId).length;
    },
    [completedSets]
  );

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Edge bounce overlays */}
      <AnimatePresence>
        {edgeBounce === "left" && (
          <motion.div
            key="edge-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-primary/20 to-transparent"
          />
        )}
        {edgeBounce === "right" && (
          <motion.div
            key="edge-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-primary/20 to-transparent"
          />
        )}
      </AnimatePresence>

      {/* Swipe hint overlay */}
      <AnimatePresence>
        {showSwipeHint && (
          <motion.div
            key="swipe-hint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-24 left-0 right-0 z-20 flex justify-center pointer-events-none"
          >
            <motion.div
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-lg"
              animate={{
                x: [0, 12, -12, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "easeInOut",
              }}
            >
              <ChevronLeft className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white/80">
                Swipe to navigate
              </span>
              <ChevronRight className="w-4 h-4 text-primary" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carousel */}
      <div className="h-full" ref={emblaRef}>
        <div className="flex h-full">
          {flatExercises.map((flat, idx) => {
            const exercise = exercises.get(flat.exerciseId);
            const name = exercise?.name || flat.exerciseId;
            const completedCount = getCompletedSetCount(flat.exerciseId);
            const isComplete = completedCount >= flat.sets;
            const currentSet = Math.min(completedCount + 1, flat.sets);
            const suggestion = weightSuggestions.get(flat.exerciseId);

            return (
              <div
                key={idx}
                className="flex-[0_0_100%] min-w-0 flex flex-col items-center justify-center px-6 gap-4"
              >
                {/* Superset label */}
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {flat.supersetLabel}
                    {flat.supersetSize > 1
                      ? `${flat.indexInSuperset + 1}`
                      : ""}
                  </Badge>
                  {isComplete && (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                      Done
                    </Badge>
                  )}
                </div>

                {/* Exercise name */}
                <h2 className="text-[28px] font-extrabold text-white text-center leading-tight">
                  {name}
                </h2>

                {/* Target */}
                <p className="text-base text-white/50">
                  {flat.sets} x {flat.reps}
                </p>

                {/* Tempo badge */}
                {flat.tempo && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    {flat.tempo}
                  </span>
                )}

                {/* Set counter - completed dots are tappable for editing */}
                <div className="flex items-center gap-2 mt-2">
                  {Array.from({ length: flat.sets }).map((_, setIdx) => {
                    const isCompleted = setIdx < completedCount;
                    return (
                      <button
                        key={setIdx}
                        type="button"
                        disabled={!isCompleted}
                        onClick={() => {
                          if (isCompleted) {
                            vibrateShort();
                            onEditSet(flat.exerciseId, setIdx + 1);
                          }
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-transform ${
                          isCompleted
                            ? "bg-primary text-black active:scale-90"
                            : setIdx === completedCount
                              ? "border-2 border-primary text-primary"
                              : "border-2 border-white/15 text-white/30"
                        }`}
                      >
                        {setIdx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Weight suggestion */}
                {suggestion && !isComplete && (
                  <p className="text-sm text-white/40 mt-1">
                    Last: {suggestion.lastWeekWeight}kg x{" "}
                    {suggestion.lastWeekReps}
                    {suggestion.weight > suggestion.lastWeekWeight && (
                      <span className="text-primary">
                        {" "}
                        - Try {suggestion.weight}kg
                      </span>
                    )}
                  </p>
                )}

                {/* Log Set button */}
                {!isComplete && (
                  <Button
                    className="w-full max-w-xs h-14 bg-primary hover:bg-primary/90 text-black font-bold text-lg mt-4"
                    onClick={() => onLogSet(idx)}
                  >
                    <Dumbbell className="w-5 h-5 mr-2" />
                    Log Set {currentSet}
                  </Button>
                )}

                {/* Position indicator */}
                <p className="text-xs text-white/25 mt-2">
                  {idx + 1} of {flatExercises.length}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
