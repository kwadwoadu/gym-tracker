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
  if (intensity === 0) return "#1A1A1A";
  if (intensity < 0.33) return "#3d5a16";
  if (intensity < 0.66) return "#6b8f22";
  return accentColor;
};

// Shared muscle path styles
const musclePathClass = "transition-all duration-300 ease-out";

export function MuscleSvgFront({
  highlightedMuscles,
  heatmapData,
  className,
  primaryColor = "#CDFF00",
  secondaryColor = "#CDFF00",
  baseColor = "#1A1A1A",
  outlineColor = "#333333",
}: Omit<MuscleSvgProps, "view">) {
  const getMuscleColor = (muscleId: string) => {
    if (heatmapData) {
      const intensity = heatmapData[muscleId] || 0;
      return getHeatmapColor(intensity, primaryColor);
    }
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
      return 0.5;
    }
    return 1;
  };

  return (
    <svg
      viewBox="0 0 200 400"
      className={cn("w-full h-auto", className)}
      aria-label="Front body muscle diagram"
    >
      {/* Athletic Body Outline - V-taper silhouette */}
      <g id="body-outline-front" stroke={outlineColor} strokeWidth="1" fill="none">
        {/* Head - smaller, more athletic */}
        <ellipse cx="100" cy="28" rx="20" ry="22" />
        {/* Neck - thicker */}
        <path d="M90 48 L90 62 M110 48 L110 62" />
        {/* Shoulders - wide */}
        <path d="M65 65 Q45 72 38 95" />
        <path d="M135 65 Q155 72 162 95" />
        {/* Torso - V-taper */}
        <path d="M38 95 L42 130 Q50 180 65 220 L70 250" />
        <path d="M162 95 L158 130 Q150 180 135 220 L130 250" />
        {/* Arms */}
        <path d="M38 95 Q25 105 18 140 L12 185 Q8 200 15 215" />
        <path d="M162 95 Q175 105 182 140 L188 185 Q192 200 185 215" />
        {/* Legs */}
        <path d="M70 250 L62 330 Q58 365 62 395" />
        <path d="M90 250 L88 330 Q92 365 88 395" />
        <path d="M110 250 L112 330 Q108 365 112 395" />
        <path d="M130 250 L138 330 Q142 365 138 395" />
      </g>

      {/* FRONT MUSCLES */}

      {/* Chest - clean pectoral shape */}
      <path
        id="chest"
        d="M68 78 L65 72 Q100 68 135 72 L132 78 L130 105 Q115 115 100 113 Q85 115 70 105 Z"
        fill={getMuscleColor("chest")}
        opacity={getMuscleOpacity("chest")}
        className={musclePathClass}
      />

      {/* Front Delts */}
      <path
        id="front-delt-left"
        d="M52 68 Q42 78 42 95 L58 92 Q60 78 58 68 Z"
        fill={getMuscleColor("front_delts")}
        opacity={getMuscleOpacity("front_delts")}
        className={musclePathClass}
      />
      <path
        id="front-delt-right"
        d="M148 68 Q158 78 158 95 L142 92 Q140 78 142 68 Z"
        fill={getMuscleColor("front_delts")}
        opacity={getMuscleOpacity("front_delts")}
        className={musclePathClass}
      />

      {/* Lateral Delts */}
      <path
        id="lat-delt-left"
        d="M40 80 Q32 92 35 115 L48 110 Q45 92 48 80 Z"
        fill={getMuscleColor("lateral_delts")}
        opacity={getMuscleOpacity("lateral_delts")}
        className={musclePathClass}
      />
      <path
        id="lat-delt-right"
        d="M160 80 Q168 92 165 115 L152 110 Q155 92 152 80 Z"
        fill={getMuscleColor("lateral_delts")}
        opacity={getMuscleOpacity("lateral_delts")}
        className={musclePathClass}
      />

      {/* Biceps - athletic contour */}
      <path
        id="biceps-left"
        d="M35 115 Q28 135 24 160 L20 180 L35 178 L42 155 Q45 135 48 115 Z"
        fill={getMuscleColor("biceps")}
        opacity={getMuscleOpacity("biceps")}
        className={musclePathClass}
      />
      <path
        id="biceps-right"
        d="M165 115 Q172 135 176 160 L180 180 L165 178 L158 155 Q155 135 152 115 Z"
        fill={getMuscleColor("biceps")}
        opacity={getMuscleOpacity("biceps")}
        className={musclePathClass}
      />

      {/* Forearms */}
      <path
        id="forearm-left"
        d="M20 180 Q14 198 15 215 L30 213 L35 178 Z"
        fill={getMuscleColor("forearms")}
        opacity={getMuscleOpacity("forearms")}
        className={musclePathClass}
      />
      <path
        id="forearm-right"
        d="M180 180 Q186 198 185 215 L170 213 L165 178 Z"
        fill={getMuscleColor("forearms")}
        opacity={getMuscleOpacity("forearms")}
        className={musclePathClass}
      />

      {/* Core - simplified rectangle */}
      <path
        id="abs"
        d="M82 108 L82 200 Q82 212 88 218 L100 220 L112 218 Q118 212 118 200 L118 108 Q108 115 100 115 Q92 115 82 108 Z"
        fill={getMuscleColor("core")}
        opacity={getMuscleOpacity("core")}
        className={musclePathClass}
      />

      {/* Obliques - tapered */}
      <path
        id="oblique-left"
        d="M68 108 L65 195 L82 200 L82 108 Z"
        fill={getMuscleColor("obliques")}
        opacity={getMuscleOpacity("obliques")}
        className={musclePathClass}
      />
      <path
        id="oblique-right"
        d="M132 108 L135 195 L118 200 L118 108 Z"
        fill={getMuscleColor("obliques")}
        opacity={getMuscleOpacity("obliques")}
        className={musclePathClass}
      />

      {/* Hip Flexors */}
      <path
        id="hip-flexor-left"
        d="M68 205 Q64 225 68 250 L88 248 Q85 228 82 210 Z"
        fill={getMuscleColor("hip_flexors")}
        opacity={getMuscleOpacity("hip_flexors")}
        className={musclePathClass}
      />
      <path
        id="hip-flexor-right"
        d="M132 205 Q136 225 132 250 L112 248 Q115 228 118 210 Z"
        fill={getMuscleColor("hip_flexors")}
        opacity={getMuscleOpacity("hip_flexors")}
        className={musclePathClass}
      />

      {/* Quads - athletic legs */}
      <path
        id="quad-left"
        d="M68 250 L62 340 Q58 365 64 390 L86 390 Q90 365 86 340 L88 250 Z"
        fill={getMuscleColor("quads")}
        opacity={getMuscleOpacity("quads")}
        className={musclePathClass}
      />
      <path
        id="quad-right"
        d="M132 250 L138 340 Q142 365 136 390 L114 390 Q110 365 114 340 L112 250 Z"
        fill={getMuscleColor("quads")}
        opacity={getMuscleOpacity("quads")}
        className={musclePathClass}
      />

      {/* Tibialis */}
      <path
        id="tibialis-left"
        d="M64 392 L66 400 L84 400 L86 392 Z"
        fill={getMuscleColor("tibialis")}
        opacity={getMuscleOpacity("tibialis")}
        className={musclePathClass}
      />
      <path
        id="tibialis-right"
        d="M136 392 L134 400 L116 400 L114 392 Z"
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
  baseColor = "#1A1A1A",
  outlineColor = "#333333",
}: Omit<MuscleSvgProps, "view">) {
  const getMuscleColor = (muscleId: string) => {
    if (heatmapData) {
      const intensity = heatmapData[muscleId] || 0;
      return getHeatmapColor(intensity, primaryColor);
    }
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
      return 0.5;
    }
    return 1;
  };

  return (
    <svg
      viewBox="0 0 200 400"
      className={cn("w-full h-auto", className)}
      aria-label="Back body muscle diagram"
    >
      {/* Athletic Body Outline - V-taper silhouette */}
      <g id="body-outline-back" stroke={outlineColor} strokeWidth="1" fill="none">
        {/* Head */}
        <ellipse cx="100" cy="28" rx="20" ry="22" />
        {/* Neck */}
        <path d="M90 48 L90 62 M110 48 L110 62" />
        {/* Shoulders */}
        <path d="M65 65 Q45 72 38 95" />
        <path d="M135 65 Q155 72 162 95" />
        {/* Torso */}
        <path d="M38 95 L42 130 Q50 180 65 220 L70 250" />
        <path d="M162 95 L158 130 Q150 180 135 220 L130 250" />
        {/* Arms */}
        <path d="M38 95 Q25 105 18 140 L12 185 Q8 200 15 215" />
        <path d="M162 95 Q175 105 182 140 L188 185 Q192 200 185 215" />
        {/* Legs */}
        <path d="M70 250 L62 330 Q58 365 62 395" />
        <path d="M90 250 L88 330 Q92 365 88 395" />
        <path d="M110 250 L112 330 Q108 365 112 395" />
        <path d="M130 250 L138 330 Q142 365 138 395" />
      </g>

      {/* BACK MUSCLES */}

      {/* Traps - clean triangular */}
      <path
        id="traps"
        d="M78 55 Q90 50 100 50 Q110 50 122 55 L130 78 Q115 85 100 82 Q85 85 70 78 Z"
        fill={getMuscleColor("traps")}
        opacity={getMuscleOpacity("traps")}
        className={musclePathClass}
      />

      {/* Rear Delts */}
      <path
        id="rear-delt-left"
        d="M52 68 Q42 78 42 95 L58 92 Q60 78 58 68 Z"
        fill={getMuscleColor("rear_delts")}
        opacity={getMuscleOpacity("rear_delts")}
        className={musclePathClass}
      />
      <path
        id="rear-delt-right"
        d="M148 68 Q158 78 158 95 L142 92 Q140 78 142 68 Z"
        fill={getMuscleColor("rear_delts")}
        opacity={getMuscleOpacity("rear_delts")}
        className={musclePathClass}
      />

      {/* Rhomboids */}
      <path
        id="rhomboids"
        d="M80 82 L80 125 L95 132 L105 132 L120 125 L120 82 Q110 90 100 88 Q90 90 80 82 Z"
        fill={getMuscleColor("rhomboids")}
        opacity={getMuscleOpacity("rhomboids")}
        className={musclePathClass}
      />

      {/* Lats - V-shaped wings */}
      <path
        id="lat-left"
        d="M55 95 L50 175 Q58 195 68 200 L80 130 Q68 112 55 95 Z"
        fill={getMuscleColor("lats")}
        opacity={getMuscleOpacity("lats")}
        className={musclePathClass}
      />
      <path
        id="lat-right"
        d="M145 95 L150 175 Q142 195 132 200 L120 130 Q132 112 145 95 Z"
        fill={getMuscleColor("lats")}
        opacity={getMuscleOpacity("lats")}
        className={musclePathClass}
      />

      {/* Triceps - horseshoe shape */}
      <path
        id="triceps-left"
        d="M35 115 Q28 135 24 160 L20 180 L35 178 L42 155 Q45 135 48 115 Z"
        fill={getMuscleColor("triceps")}
        opacity={getMuscleOpacity("triceps")}
        className={musclePathClass}
      />
      <path
        id="triceps-right"
        d="M165 115 Q172 135 176 160 L180 180 L165 178 L158 155 Q155 135 152 115 Z"
        fill={getMuscleColor("triceps")}
        opacity={getMuscleOpacity("triceps")}
        className={musclePathClass}
      />

      {/* Forearms (back) */}
      <path
        id="forearm-back-left"
        d="M20 180 Q14 198 15 215 L30 213 L35 178 Z"
        fill={getMuscleColor("forearms")}
        opacity={getMuscleOpacity("forearms")}
        className={musclePathClass}
      />
      <path
        id="forearm-back-right"
        d="M180 180 Q186 198 185 215 L170 213 L165 178 Z"
        fill={getMuscleColor("forearms")}
        opacity={getMuscleOpacity("forearms")}
        className={musclePathClass}
      />

      {/* Erector Spinae - lower back */}
      <path
        id="erector-spinae"
        d="M88 132 L85 205 L95 215 L105 215 L115 205 L112 132 Q106 138 100 138 Q94 138 88 132 Z"
        fill={getMuscleColor("erector_spinae")}
        opacity={getMuscleOpacity("erector_spinae")}
        className={musclePathClass}
      />

      {/* Glutes - athletic shape */}
      <path
        id="glutes"
        d="M68 218 Q62 238 68 258 L100 262 L132 258 Q138 238 132 218 Q118 225 100 225 Q82 225 68 218 Z"
        fill={getMuscleColor("glutes")}
        opacity={getMuscleOpacity("glutes")}
        className={musclePathClass}
      />

      {/* Hamstrings */}
      <path
        id="hamstring-left"
        d="M68 260 L62 340 Q58 365 64 390 L86 390 Q90 365 86 340 L88 260 Q78 262 68 260 Z"
        fill={getMuscleColor("hamstrings")}
        opacity={getMuscleOpacity("hamstrings")}
        className={musclePathClass}
      />
      <path
        id="hamstring-right"
        d="M132 260 L138 340 Q142 365 136 390 L114 390 Q110 365 114 340 L112 260 Q122 262 132 260 Z"
        fill={getMuscleColor("hamstrings")}
        opacity={getMuscleOpacity("hamstrings")}
        className={musclePathClass}
      />

      {/* Calves - diamond shape */}
      <path
        id="calf-left"
        d="M64 392 L66 400 L84 400 L86 392 Z"
        fill={getMuscleColor("calves")}
        opacity={getMuscleOpacity("calves")}
        className={musclePathClass}
      />
      <path
        id="calf-right"
        d="M136 392 L134 400 L116 400 L114 392 Z"
        fill={getMuscleColor("calves")}
        opacity={getMuscleOpacity("calves")}
        className={musclePathClass}
      />
    </svg>
  );
}
