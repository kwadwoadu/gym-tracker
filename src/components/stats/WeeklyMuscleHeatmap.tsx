"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { MuscleSvgFront, MuscleSvgBack } from "@/components/shared/muscle-svg";
import {
  MUSCLE_COLORS,
  getMuscleDisplayName,
  calculateHeatmapIntensity,
} from "@/data/muscle-map";

interface MuscleVolume {
  muscle: string;
  sets: number;
  volume: number;
}

interface WeeklyMuscleHeatmapProps {
  /**
   * Muscle volume data for the week
   */
  muscleVolumes: MuscleVolume[];
  /**
   * Title to display above the heatmap
   */
  title?: string;
  /**
   * Show the legend explaining the colors
   */
  showLegend?: boolean;
}

export function WeeklyMuscleHeatmap({
  muscleVolumes,
  title = "Muscle Coverage This Week",
  showLegend = true,
}: WeeklyMuscleHeatmapProps) {
  // Calculate max sets for normalization
  const maxSets = useMemo(() => {
    if (muscleVolumes.length === 0) return 0;
    return Math.max(...muscleVolumes.map((mv) => mv.sets));
  }, [muscleVolumes]);

  // Convert to heatmap data format (muscle -> intensity 0-1)
  const heatmapData = useMemo(() => {
    const data: Record<string, number> = {};
    for (const mv of muscleVolumes) {
      data[mv.muscle] = calculateHeatmapIntensity(mv.sets, maxSets);
    }
    return data;
  }, [muscleVolumes, maxSets]);

  // Group muscles by training intensity for the list
  const musclesByIntensity = useMemo(() => {
    const heavy: MuscleVolume[] = [];
    const moderate: MuscleVolume[] = [];
    const light: MuscleVolume[] = [];
    const untrained: string[] = [];

    // All possible muscles
    const allMuscles = [
      "chest", "lats", "traps", "rhomboids", "front_delts", "lateral_delts",
      "rear_delts", "biceps", "triceps", "forearms", "core", "obliques",
      "quads", "hamstrings", "glutes", "calves", "erector_spinae"
    ];

    const trainedMuscles = new Set(muscleVolumes.map((mv) => mv.muscle));

    for (const mv of muscleVolumes) {
      const intensity = calculateHeatmapIntensity(mv.sets, maxSets);
      if (intensity >= 0.66) {
        heavy.push(mv);
      } else if (intensity >= 0.33) {
        moderate.push(mv);
      } else if (intensity > 0) {
        light.push(mv);
      }
    }

    for (const muscle of allMuscles) {
      if (!trainedMuscles.has(muscle)) {
        untrained.push(muscle);
      }
    }

    return { heavy, moderate, light, untrained };
  }, [muscleVolumes, maxSets]);

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>

      {/* Body diagrams */}
      <div className="flex justify-center gap-4 mb-6">
        <div className="flex flex-col items-center w-[120px]">
          <MuscleSvgFront
            heatmapData={heatmapData}
            primaryColor={MUSCLE_COLORS.primary}
            baseColor={MUSCLE_COLORS.untrained}
            outlineColor={MUSCLE_COLORS.outline}
          />
          <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
            Front
          </span>
        </div>
        <div className="flex flex-col items-center w-[120px]">
          <MuscleSvgBack
            heatmapData={heatmapData}
            primaryColor={MUSCLE_COLORS.primary}
            baseColor={MUSCLE_COLORS.untrained}
            outlineColor={MUSCLE_COLORS.outline}
          />
          <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
            Back
          </span>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex justify-center gap-4 mb-6">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: MUSCLE_COLORS.heatmap.heavy }}
            />
            <span className="text-xs text-muted-foreground">Heavy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: MUSCLE_COLORS.heatmap.moderate }}
            />
            <span className="text-xs text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: MUSCLE_COLORS.heatmap.light }}
            />
            <span className="text-xs text-muted-foreground">Light</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: MUSCLE_COLORS.heatmap.none }}
            />
            <span className="text-xs text-muted-foreground">None</span>
          </div>
        </div>
      )}

      {/* Muscle breakdown */}
      <div className="space-y-4">
        {/* Heavy */}
        {musclesByIntensity.heavy.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Heavy Training ({musclesByIntensity.heavy.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {musclesByIntensity.heavy.map((mv) => (
                <div
                  key={mv.muscle}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/20 border border-primary/30"
                >
                  <span className="text-sm text-foreground">
                    {getMuscleDisplayName(mv.muscle)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {mv.sets} sets
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Moderate */}
        {musclesByIntensity.moderate.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Moderate Training ({musclesByIntensity.moderate.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {musclesByIntensity.moderate.map((mv) => (
                <div
                  key={mv.muscle}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 border border-border"
                >
                  <span className="text-sm text-foreground">
                    {getMuscleDisplayName(mv.muscle)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {mv.sets} sets
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Light */}
        {musclesByIntensity.light.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Light Training ({musclesByIntensity.light.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {musclesByIntensity.light.map((mv) => (
                <div
                  key={mv.muscle}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/30 border border-border/50"
                >
                  <span className="text-sm text-muted-foreground">
                    {getMuscleDisplayName(mv.muscle)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {mv.sets} sets
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Untrained */}
        {musclesByIntensity.untrained.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Not Trained ({musclesByIntensity.untrained.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {musclesByIntensity.untrained.map((muscle) => (
                <span
                  key={muscle}
                  className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted/20"
                >
                  {getMuscleDisplayName(muscle)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
