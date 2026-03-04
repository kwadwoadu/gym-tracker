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
                <Badge className="bg-[#CDFF00]/10 text-[#CDFF00] border-[#CDFF00]/20 text-xs">
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
              <h2 className="text-2xl font-bold text-white text-center leading-tight">
                {name}
              </h2>

              {/* Target */}
              <p className="text-base text-white/50">
                {flat.sets} x {flat.reps}
                {flat.tempo ? ` | ${flat.tempo}` : ""}
              </p>

              {/* Set counter */}
              <div className="flex items-center gap-2 mt-2">
                {Array.from({ length: flat.sets }).map((_, setIdx) => (
                  <div
                    key={setIdx}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      setIdx < completedCount
                        ? "bg-[#CDFF00] text-black"
                        : setIdx === completedCount
                          ? "bg-[#CDFF00]/20 text-[#CDFF00] border border-[#CDFF00]"
                          : "bg-[#2A2A2A] text-white/30"
                    }`}
                  >
                    {setIdx + 1}
                  </div>
                ))}
              </div>

              {/* Weight suggestion */}
              {suggestion && !isComplete && (
                <p className="text-sm text-white/40 mt-1">
                  Last: {suggestion.lastWeekWeight}kg x {suggestion.lastWeekReps}
                  {suggestion.weight > suggestion.lastWeekWeight && (
                    <span className="text-[#CDFF00]">
                      {" "}
                      - Try {suggestion.weight}kg
                    </span>
                  )}
                </p>
              )}

              {/* Log Set button */}
              {!isComplete && (
                <Button
                  className="w-full max-w-xs h-14 bg-[#CDFF00] hover:bg-[#CDFF00]/90 text-black font-bold text-lg mt-4"
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
