"use client";

import { useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { HEADING, LABEL, DATA } from "@/lib/typography";
import { getMuscleDisplayName } from "@/data/muscle-map";
import type { MuscleVolume } from "@/lib/db";

interface ExerciseBreakdown {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  volume: number;
}

interface MuscleDrillDownProps {
  muscleName: string;
  isOpen: boolean;
  onClose: () => void;
  muscleVolumes: MuscleVolume[];
  /** Breakdown of exercises contributing to this muscle */
  exerciseBreakdowns?: ExerciseBreakdown[];
}

export function MuscleDrillDown({
  muscleName,
  isOpen,
  onClose,
  muscleVolumes,
  exerciseBreakdowns,
}: MuscleDrillDownProps) {
  const muscleData = useMemo(() => {
    return muscleVolumes.find((mv) => mv.muscle === muscleName);
  }, [muscleVolumes, muscleName]);

  const displayName = getMuscleDisplayName(muscleName);

  // Sort breakdowns by volume descending
  const sortedBreakdowns = useMemo(() => {
    if (!exerciseBreakdowns) return [];
    return [...exerciseBreakdowns].sort((a, b) => b.volume - a.volume);
  }, [exerciseBreakdowns]);

  const totalVolume = muscleData?.volume ?? 0;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background border-border max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className={`${HEADING.h3} text-white`}>
            {displayName}
          </DrawerTitle>
          <DrawerDescription className="text-white/40">
            Volume breakdown this week
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          {/* Summary stats */}
          {muscleData && (
            <div className="flex gap-3 mb-6">
              <div className="flex-1 bg-card rounded-xl p-4">
                <p className={`${LABEL.caption} text-white/40 mb-1`}>
                  Total Sets
                </p>
                <p className={`${DATA.medium} text-primary`}>
                  {muscleData.sets}
                </p>
              </div>
              <div className="flex-1 bg-card rounded-xl p-4">
                <p className={`${LABEL.caption} text-white/40 mb-1`}>
                  Total Volume
                </p>
                <p className={`${DATA.medium} text-white`}>
                  {totalVolume.toLocaleString()} kg
                </p>
              </div>
            </div>
          )}

          {/* Exercise breakdown */}
          {sortedBreakdowns.length > 0 ? (
            <div>
              <h4
                className={`${LABEL.caption} text-white/40 mb-3`}
              >
                Exercises
              </h4>
              <div className="space-y-2">
                {sortedBreakdowns.map((ex) => {
                  const percentage =
                    totalVolume > 0
                      ? Math.round((ex.volume / totalVolume) * 100)
                      : 0;
                  return (
                    <div
                      key={ex.exerciseId}
                      className="bg-card rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white truncate pr-3">
                          {ex.exerciseName}
                        </p>
                        <p className="text-xs text-white/40 shrink-0">
                          {ex.sets} sets
                        </p>
                      </div>
                      {/* Volume bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-white/60 tabular-nums w-16 text-right">
                          {ex.volume.toLocaleString()} kg
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-white/40">
                {muscleData
                  ? "Exercise breakdown not available"
                  : "No data for this muscle group"}
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
