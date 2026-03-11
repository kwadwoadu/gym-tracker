"use client";

import { useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { FlatExercise } from "@/lib/flatten-exercises";
import type { Exercise, SetLog } from "@/lib/api-client";
import { Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { vibrateShort } from "@/lib/haptics";

interface WorkoutCarouselProps {
  flatExercises: FlatExercise[];
  exercises: Map<string, Exercise>;
  completedSets: SetLog[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onLogSet: (exerciseIndex: number) => void;
  onEditSet: (exerciseId: string, setNumber: number) => void;
  isRestTimerActive: boolean;
  weightSuggestions: Map<string, { weight: number; lastWeekWeight: number; lastWeekReps: number }>;
}

export function WorkoutCarousel({
  flatExercises,
  exercises,
  completedSets,
  currentIndex,
  onIndexChange,
  onLogSet,
  onEditSet,
  isRestTimerActive,
  weightSuggestions,
}: WorkoutCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
    watchDrag: () => !isRestTimerActive,
    startIndex: currentIndex,
  });

  // Sync carousel to external index changes
  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== currentIndex) {
      emblaApi.scrollTo(currentIndex, false);
    }
  }, [emblaApi, currentIndex]);

  // Report index changes from swipe
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const idx = emblaApi.selectedScrollSnap();
      if (idx !== currentIndex) {
        vibrateShort();
        onIndexChange(idx);
      }
    };
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, currentIndex, onIndexChange]);

  const getCompletedSetCount = useCallback(
    (exerciseId: string): number => {
      return completedSets.filter((s) => s.exerciseId === exerciseId).length;
    },
    [completedSets]
  );

  return (
    <div className="flex-1 overflow-hidden" ref={emblaRef}>
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
                  {flat.supersetSize > 1 ? `${flat.indexInSuperset + 1}` : ""}
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
                  Last: {suggestion.lastWeekWeight}kg x {suggestion.lastWeekReps}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
