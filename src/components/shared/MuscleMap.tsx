"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MuscleSvgFront, MuscleSvgBack } from "./muscle-svg";
import {
  normalizeMuscle,
  getMuscleDisplayName,
  hasMusclesInView,
  MUSCLE_COLORS,
} from "@/data/muscle-map";

interface MuscleMapProps {
  /**
   * Muscles to highlight (primary = bright, secondary = dimmed)
   */
  muscles?: {
    primary: string[];
    secondary: string[];
  };
  /**
   * Heatmap data for weekly muscle coverage (muscle -> intensity 0-1)
   */
  heatmapData?: Record<string, number>;
  /**
   * Show both views side by side, or auto-select based on muscles
   */
  showBothViews?: boolean;
  /**
   * Show legend below the diagram
   */
  showLegend?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";
}

export function MuscleMap({
  muscles,
  heatmapData,
  showBothViews = true,
  showLegend = true,
  className,
  size = "md",
}: MuscleMapProps) {
  // Normalize muscle names
  const normalizedMuscles = useMemo(() => {
    if (!muscles) return undefined;
    return {
      primary: muscles.primary.map(normalizeMuscle),
      secondary: muscles.secondary.map(normalizeMuscle),
    };
  }, [muscles]);

  // Determine which views to show
  const viewsToShow = useMemo((): ("front" | "back")[] => {
    if (showBothViews) return ["front", "back"];
    if (!normalizedMuscles) return ["front", "back"];

    const allMuscles = [
      ...normalizedMuscles.primary,
      ...normalizedMuscles.secondary,
    ];
    const hasFront = hasMusclesInView(allMuscles, "front");
    const hasBack = hasMusclesInView(allMuscles, "back");

    if (hasFront && hasBack) return ["front", "back"];
    if (hasFront) return ["front"];
    if (hasBack) return ["back"];
    return ["front", "back"];
  }, [normalizedMuscles, showBothViews]);

  // Size classes
  const sizeClasses = {
    sm: "max-w-[80px]",
    md: "max-w-[120px]",
    lg: "max-w-[160px]",
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Body diagrams */}
      <div
        className={cn(
          "flex gap-2 justify-center",
          viewsToShow.length === 1 && "justify-center"
        )}
      >
        <AnimatePresence mode="wait">
          {viewsToShow.includes("front") && (
            <motion.div
              key="front"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn("flex flex-col items-center", sizeClasses[size])}
            >
              <MuscleSvgFront
                highlightedMuscles={normalizedMuscles}
                heatmapData={heatmapData}
                primaryColor={MUSCLE_COLORS.primary}
                secondaryColor={MUSCLE_COLORS.secondary}
                baseColor={MUSCLE_COLORS.untrained}
                outlineColor={MUSCLE_COLORS.outline}
              />
              {showBothViews && (
                <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                  Front
                </span>
              )}
            </motion.div>
          )}
          {viewsToShow.includes("back") && (
            <motion.div
              key="back"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className={cn("flex flex-col items-center", sizeClasses[size])}
            >
              <MuscleSvgBack
                highlightedMuscles={normalizedMuscles}
                heatmapData={heatmapData}
                primaryColor={MUSCLE_COLORS.primary}
                secondaryColor={MUSCLE_COLORS.secondary}
                baseColor={MUSCLE_COLORS.untrained}
                outlineColor={MUSCLE_COLORS.outline}
              />
              {showBothViews && (
                <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                  Back
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      {showLegend && normalizedMuscles && (
        <div className="space-y-1.5">
          {normalizedMuscles.primary.length > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: MUSCLE_COLORS.primary }}
              />
              <span className="text-xs text-foreground">
                Primary:{" "}
                {normalizedMuscles.primary.map(getMuscleDisplayName).join(", ")}
              </span>
            </div>
          )}
          {normalizedMuscles.secondary.length > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: MUSCLE_COLORS.secondary,
                  opacity: MUSCLE_COLORS.secondaryOpacity,
                }}
              />
              <span className="text-xs text-muted-foreground">
                Secondary:{" "}
                {normalizedMuscles.secondary
                  .map(getMuscleDisplayName)
                  .join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
