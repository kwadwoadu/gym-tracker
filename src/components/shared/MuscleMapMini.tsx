"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { MuscleSvgFront, MuscleSvgBack } from "./muscle-svg";
import {
  normalizeMuscle,
  hasMusclesInView,
  MUSCLE_COLORS,
} from "@/data/muscle-map";

interface MuscleMapMiniProps {
  /**
   * Muscles to highlight (primary = bright, secondary = dimmed)
   */
  muscles?: {
    primary: string[];
    secondary: string[];
  };
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Click handler for expanding to full view
   */
  onClick?: () => void;
}

/**
 * Compact muscle visualization (60x80px) for use in workout session headers
 * Shows only the view with most relevant muscles
 */
export function MuscleMapMini({
  muscles,
  className,
  onClick,
}: MuscleMapMiniProps) {
  // Normalize muscle names
  const normalizedMuscles = useMemo(() => {
    if (!muscles) return undefined;
    return {
      primary: muscles.primary.map(normalizeMuscle),
      secondary: muscles.secondary.map(normalizeMuscle),
    };
  }, [muscles]);

  // Determine which view to show (front or back, whichever has more muscles)
  const viewToShow = useMemo(() => {
    if (!normalizedMuscles) return "front";

    const allMuscles = [
      ...normalizedMuscles.primary,
      ...normalizedMuscles.secondary,
    ];
    const hasFront = hasMusclesInView(allMuscles, "front");
    const hasBack = hasMusclesInView(allMuscles, "back");

    // Prefer front view, unless only back muscles are present
    if (hasFront) return "front";
    if (hasBack) return "back";
    return "front";
  }, [normalizedMuscles]);

  return (
    <div
      className={cn(
        "w-[60px] h-[80px] cursor-pointer transition-transform hover:scale-105 active:scale-95",
        onClick && "touch-target",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? "View muscle details" : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {viewToShow === "front" ? (
        <MuscleSvgFront
          highlightedMuscles={normalizedMuscles}
          primaryColor={MUSCLE_COLORS.primary}
          secondaryColor={MUSCLE_COLORS.secondary}
          baseColor={MUSCLE_COLORS.untrained}
          outlineColor={MUSCLE_COLORS.outline}
          className="w-full h-full"
        />
      ) : (
        <MuscleSvgBack
          highlightedMuscles={normalizedMuscles}
          primaryColor={MUSCLE_COLORS.primary}
          secondaryColor={MUSCLE_COLORS.secondary}
          baseColor={MUSCLE_COLORS.untrained}
          outlineColor={MUSCLE_COLORS.outline}
          className="w-full h-full"
        />
      )}
    </div>
  );
}
