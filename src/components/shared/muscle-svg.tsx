"use client";

import { cn } from "@/lib/utils";

interface MuscleSvgProps {
  view: "front" | "back";
  highlightedMuscles?: {
    primary: string[];
    secondary: string[];
  };
  heatmapData?: Record<string, number>; // muscle -> intensity (0-1)
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  baseColor?: string;
  outlineColor?: string;
}

// Color utilities
const getPrimaryFill = (color: string) => color;
const getSecondaryFill = (color: string) => color;
const getHeatmapColor = (intensity: number, accentColor: string) => {
  // 0 = gray, 1 = full accent
  if (intensity === 0) return "#333333";
  if (intensity < 0.33) return "#4a6b1a"; // light green
  if (intensity < 0.66) return "#7ba328"; // medium green
  return accentColor; // full accent
};

// Shared muscle path styles for smooth animations
const musclePathClass = "transition-all duration-300 ease-out";

export function MuscleSvgFront({
  highlightedMuscles,
  heatmapData,
  className,
  primaryColor = "#CDFF00",
  secondaryColor = "#CDFF00",
  baseColor = "#333333",
  outlineColor = "#666666",
}: Omit<MuscleSvgProps, "view">) {
  const getMuscleColor = (muscleId: string) => {
    // Heatmap mode
    if (heatmapData) {
      const intensity = heatmapData[muscleId] || 0;
      return getHeatmapColor(intensity, primaryColor);
    }

    // Highlight mode
    if (highlightedMuscles) {
      if (highlightedMuscles.primary.includes(muscleId)) {
        return getPrimaryFill(primaryColor);
      }
      if (highlightedMuscles.secondary.includes(muscleId)) {
        return getSecondaryFill(secondaryColor);
      }
    }

    return baseColor;
  };

  const getMuscleOpacity = (muscleId: string) => {
    if (heatmapData) return 1;
    if (highlightedMuscles?.secondary.includes(muscleId)) {
      return 0.4;
    }
    return 1;
  };

  return (
    <svg
      viewBox="0 0 200 400"
      className={cn("w-full h-auto", className)}
      aria-label="Front body muscle diagram"
    >
      {/* Body outline */}
      <g id="body-outline-front" stroke={outlineColor} strokeWidth="1.5" fill="none">
        {/* Head */}
        <ellipse cx="100" cy="30" rx="25" ry="28" />
        {/* Neck */}
        <path d="M88 55 L88 70 M112 55 L112 70" />
        {/* Torso outline */}
        <path d="M70 70 Q50 90 48 130 L48 200 Q48 220 60 240 L60 250" />
        <path d="M130 70 Q150 90 152 130 L152 200 Q152 220 140 240 L140 250" />
        {/* Arms outline */}
        <path d="M48 85 Q30 90 20 130 L15 180 Q12 200 20 210" />
        <path d="M152 85 Q170 90 180 130 L185 180 Q188 200 180 210" />
        {/* Legs outline */}
        <path d="M60 250 L55 320 Q50 360 55 390" />
        <path d="M85 250 L90 320 Q95 360 90 390" />
        <path d="M115 250 L110 320 Q105 360 110 390" />
        <path d="M140 250 L145 320 Q150 360 145 390" />
      </g>

      {/* Muscle regions - Front View */}

      {/* Chest */}
      <path
        id="chest"
        d="M72 85 Q85 80 100 82 Q115 80 128 85 L130 110 Q115 120 100 118 Q85 120 70 110 Z"
        fill={getMuscleColor("chest")}
        opacity={getMuscleOpacity("chest")}
        className={musclePathClass}
      />

      {/* Front Delts (Shoulders) */}
      <path
        id="front-delt-left"
        d="M55 75 Q48 85 50 100 L65 95 Q68 82 65 75 Z"
        fill={getMuscleColor("front_delts")}
        opacity={getMuscleOpacity("front_delts")}
        className={musclePathClass}
      />
      <path
        id="front-delt-right"
        d="M145 75 Q152 85 150 100 L135 95 Q132 82 135 75 Z"
        fill={getMuscleColor("front_delts")}
        opacity={getMuscleOpacity("front_delts")}
        className={musclePathClass}
      />

      {/* Lateral Delts */}
      <path
        id="lat-delt-left"
        d="M48 85 Q42 95 45 115 L55 110 Q52 95 55 85 Z"
        fill={getMuscleColor("lateral_delts")}
        opacity={getMuscleOpacity("lateral_delts")}
        className={musclePathClass}
      />
      <path
        id="lat-delt-right"
        d="M152 85 Q158 95 155 115 L145 110 Q148 95 145 85 Z"
        fill={getMuscleColor("lateral_delts")}
        opacity={getMuscleOpacity("lateral_delts")}
        className={musclePathClass}
      />

      {/* Biceps */}
      <path
        id="biceps-left"
        d="M42 115 Q35 130 32 155 L28 175 L40 175 L45 155 Q48 130 50 115 Z"
        fill={getMuscleColor("biceps")}
        opacity={getMuscleOpacity("biceps")}
        className={musclePathClass}
      />
      <path
        id="biceps-right"
        d="M158 115 Q165 130 168 155 L172 175 L160 175 L155 155 Q152 130 150 115 Z"
        fill={getMuscleColor("biceps")}
        opacity={getMuscleOpacity("biceps")}
        className={musclePathClass}
      />

      {/* Forearms */}
      <path
        id="forearm-left"
        d="M28 175 Q22 190 20 210 L32 210 L40 175 Z"
        fill={getMuscleColor("forearms")}
        opacity={getMuscleOpacity("forearms")}
        className={musclePathClass}
      />
      <path
        id="forearm-right"
        d="M172 175 Q178 190 180 210 L168 210 L160 175 Z"
        fill={getMuscleColor("forearms")}
        opacity={getMuscleOpacity("forearms")}
        className={musclePathClass}
      />

      {/* Core / Abs */}
      <path
        id="abs"
        d="M80 120 L80 200 Q80 210 85 215 L100 218 L115 215 Q120 210 120 200 L120 120 Q110 125 100 125 Q90 125 80 120 Z"
        fill={getMuscleColor("core")}
        opacity={getMuscleOpacity("core")}
        className={musclePathClass}
      />

      {/* Obliques */}
      <path
        id="oblique-left"
        d="M65 120 L60 200 L80 200 L80 120 Z"
        fill={getMuscleColor("obliques")}
        opacity={getMuscleOpacity("obliques")}
        className={musclePathClass}
      />
      <path
        id="oblique-right"
        d="M135 120 L140 200 L120 200 L120 120 Z"
        fill={getMuscleColor("obliques")}
        opacity={getMuscleOpacity("obliques")}
        className={musclePathClass}
      />

      {/* Hip Flexors */}
      <path
        id="hip-flexor-left"
        d="M65 210 Q60 225 62 250 L82 250 Q80 230 78 215 Z"
        fill={getMuscleColor("hip_flexors")}
        opacity={getMuscleOpacity("hip_flexors")}
        className={musclePathClass}
      />
      <path
        id="hip-flexor-right"
        d="M135 210 Q140 225 138 250 L118 250 Q120 230 122 215 Z"
        fill={getMuscleColor("hip_flexors")}
        opacity={getMuscleOpacity("hip_flexors")}
        className={musclePathClass}
      />

      {/* Quads */}
      <path
        id="quad-left"
        d="M62 250 L55 340 Q52 360 58 380 L88 380 Q92 360 88 340 L82 250 Z"
        fill={getMuscleColor("quads")}
        opacity={getMuscleOpacity("quads")}
        className={musclePathClass}
      />
      <path
        id="quad-right"
        d="M138 250 L145 340 Q148 360 142 380 L112 380 Q108 360 112 340 L118 250 Z"
        fill={getMuscleColor("quads")}
        opacity={getMuscleOpacity("quads")}
        className={musclePathClass}
      />

      {/* Tibialis (front lower leg) */}
      <path
        id="tibialis-left"
        d="M58 382 L62 395 L85 395 L88 382 Z"
        fill={getMuscleColor("tibialis")}
        opacity={getMuscleOpacity("tibialis")}
        className={musclePathClass}
      />
      <path
        id="tibialis-right"
        d="M142 382 L138 395 L115 395 L112 382 Z"
        fill={getMuscleColor("tibialis")}
        opacity={getMuscleOpacity("tibialis")}
        className={musclePathClass}
      />
    </svg>
  );
}

export function MuscleSvgBack({
  highlightedMuscles,
  heatmapData,
  className,
  primaryColor = "#CDFF00",
  secondaryColor = "#CDFF00",
  baseColor = "#333333",
  outlineColor = "#666666",
}: Omit<MuscleSvgProps, "view">) {
  const getMuscleColor = (muscleId: string) => {
    // Heatmap mode
    if (heatmapData) {
      const intensity = heatmapData[muscleId] || 0;
      return getHeatmapColor(intensity, primaryColor);
    }

    // Highlight mode
    if (highlightedMuscles) {
      if (highlightedMuscles.primary.includes(muscleId)) {
        return getPrimaryFill(primaryColor);
      }
      if (highlightedMuscles.secondary.includes(muscleId)) {
        return getSecondaryFill(secondaryColor);
      }
    }

    return baseColor;
  };

  const getMuscleOpacity = (muscleId: string) => {
    if (heatmapData) return 1;
    if (highlightedMuscles?.secondary.includes(muscleId)) {
      return 0.4;
    }
    return 1;
  };

  return (
    <svg
      viewBox="0 0 200 400"
      className={cn("w-full h-auto", className)}
      aria-label="Back body muscle diagram"
    >
      {/* Body outline */}
      <g id="body-outline-back" stroke={outlineColor} strokeWidth="1.5" fill="none">
        {/* Head */}
        <ellipse cx="100" cy="30" rx="25" ry="28" />
        {/* Neck */}
        <path d="M88 55 L88 70 M112 55 L112 70" />
        {/* Torso outline */}
        <path d="M70 70 Q50 90 48 130 L48 200 Q48 220 60 240 L60 250" />
        <path d="M130 70 Q150 90 152 130 L152 200 Q152 220 140 240 L140 250" />
        {/* Arms outline */}
        <path d="M48 85 Q30 90 20 130 L15 180 Q12 200 20 210" />
        <path d="M152 85 Q170 90 180 130 L185 180 Q188 200 180 210" />
        {/* Legs outline */}
        <path d="M60 250 L55 320 Q50 360 55 390" />
        <path d="M85 250 L90 320 Q95 360 90 390" />
        <path d="M115 250 L110 320 Q105 360 110 390" />
        <path d="M140 250 L145 320 Q150 360 145 390" />
      </g>

      {/* Muscle regions - Back View */}

      {/* Traps */}
      <path
        id="traps"
        d="M75 60 Q80 55 100 55 Q120 55 125 60 L130 85 Q115 90 100 88 Q85 90 70 85 Z"
        fill={getMuscleColor("traps")}
        opacity={getMuscleOpacity("traps")}
        className={musclePathClass}
      />

      {/* Rear Delts */}
      <path
        id="rear-delt-left"
        d="M55 75 Q48 85 50 100 L65 95 Q68 82 65 75 Z"
        fill={getMuscleColor("rear_delts")}
        opacity={getMuscleOpacity("rear_delts")}
        className={musclePathClass}
      />
      <path
        id="rear-delt-right"
        d="M145 75 Q152 85 150 100 L135 95 Q132 82 135 75 Z"
        fill={getMuscleColor("rear_delts")}
        opacity={getMuscleOpacity("rear_delts")}
        className={musclePathClass}
      />

      {/* Rhomboids */}
      <path
        id="rhomboids"
        d="M78 88 L78 125 L95 130 L105 130 L122 125 L122 88 Q110 95 100 95 Q90 95 78 88 Z"
        fill={getMuscleColor("rhomboids")}
        opacity={getMuscleOpacity("rhomboids")}
        className={musclePathClass}
      />

      {/* Lats */}
      <path
        id="lat-left"
        d="M58 100 L55 180 Q60 200 70 205 L78 130 Q68 115 58 100 Z"
        fill={getMuscleColor("lats")}
        opacity={getMuscleOpacity("lats")}
        className={musclePathClass}
      />
      <path
        id="lat-right"
        d="M142 100 L145 180 Q140 200 130 205 L122 130 Q132 115 142 100 Z"
        fill={getMuscleColor("lats")}
        opacity={getMuscleOpacity("lats")}
        className={musclePathClass}
      />

      {/* Triceps */}
      <path
        id="triceps-left"
        d="M42 115 Q35 130 32 155 L28 175 L40 175 L45 155 Q48 130 50 115 Z"
        fill={getMuscleColor("triceps")}
        opacity={getMuscleOpacity("triceps")}
        className={musclePathClass}
      />
      <path
        id="triceps-right"
        d="M158 115 Q165 130 168 155 L172 175 L160 175 L155 155 Q152 130 150 115 Z"
        fill={getMuscleColor("triceps")}
        opacity={getMuscleOpacity("triceps")}
        className={musclePathClass}
      />

      {/* Forearms (back view) */}
      <path
        id="forearm-back-left"
        d="M28 175 Q22 190 20 210 L32 210 L40 175 Z"
        fill={getMuscleColor("forearms")}
        opacity={getMuscleOpacity("forearms")}
        className={musclePathClass}
      />
      <path
        id="forearm-back-right"
        d="M172 175 Q178 190 180 210 L168 210 L160 175 Z"
        fill={getMuscleColor("forearms")}
        opacity={getMuscleOpacity("forearms")}
        className={musclePathClass}
      />

      {/* Erector Spinae (lower back) */}
      <path
        id="erector-spinae"
        d="M85 130 L82 210 L95 218 L105 218 L118 210 L115 130 Q107 135 100 135 Q93 135 85 130 Z"
        fill={getMuscleColor("erector_spinae")}
        opacity={getMuscleOpacity("erector_spinae")}
        className={musclePathClass}
      />

      {/* Glutes */}
      <path
        id="glutes"
        d="M62 220 Q58 240 62 260 L100 265 L138 260 Q142 240 138 220 Q120 225 100 225 Q80 225 62 220 Z"
        fill={getMuscleColor("glutes")}
        opacity={getMuscleOpacity("glutes")}
        className={musclePathClass}
      />

      {/* Hamstrings */}
      <path
        id="hamstring-left"
        d="M62 265 L55 340 Q52 360 58 380 L88 380 Q92 360 88 340 L82 265 Q72 268 62 265 Z"
        fill={getMuscleColor("hamstrings")}
        opacity={getMuscleOpacity("hamstrings")}
        className={musclePathClass}
      />
      <path
        id="hamstring-right"
        d="M138 265 L145 340 Q148 360 142 380 L112 380 Q108 360 112 340 L118 265 Q128 268 138 265 Z"
        fill={getMuscleColor("hamstrings")}
        opacity={getMuscleOpacity("hamstrings")}
        className={musclePathClass}
      />

      {/* Calves */}
      <path
        id="calf-left"
        d="M58 382 L62 395 L85 395 L88 382 Z"
        fill={getMuscleColor("calves")}
        opacity={getMuscleOpacity("calves")}
        className={musclePathClass}
      />
      <path
        id="calf-right"
        d="M142 382 L138 395 L115 395 L112 382 Z"
        fill={getMuscleColor("calves")}
        opacity={getMuscleOpacity("calves")}
        className={musclePathClass}
      />
    </svg>
  );
}
