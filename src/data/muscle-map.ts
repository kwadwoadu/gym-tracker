/**
 * Muscle mapping configuration for SVG body diagram
 * Maps exercise muscle names to their visual representation
 */

export type MuscleView = "front" | "back" | "both";

export interface MuscleConfig {
  id: string;
  displayName: string;
  view: MuscleView;
  category: "upper" | "core" | "lower";
}

/**
 * All supported muscle groups with their display configuration
 */
export const MUSCLE_CONFIG: Record<string, MuscleConfig> = {
  // Upper Body - Front
  chest: { id: "chest", displayName: "Chest", view: "front", category: "upper" },
  front_delts: { id: "front_delts", displayName: "Front Delts", view: "front", category: "upper" },
  lateral_delts: { id: "lateral_delts", displayName: "Lateral Delts", view: "front", category: "upper" },
  biceps: { id: "biceps", displayName: "Biceps", view: "front", category: "upper" },
  forearms: { id: "forearms", displayName: "Forearms", view: "both", category: "upper" },

  // Upper Body - Back
  traps: { id: "traps", displayName: "Traps", view: "back", category: "upper" },
  rear_delts: { id: "rear_delts", displayName: "Rear Delts", view: "back", category: "upper" },
  rhomboids: { id: "rhomboids", displayName: "Rhomboids", view: "back", category: "upper" },
  lats: { id: "lats", displayName: "Lats", view: "back", category: "upper" },
  triceps: { id: "triceps", displayName: "Triceps", view: "back", category: "upper" },
  erector_spinae: { id: "erector_spinae", displayName: "Lower Back", view: "back", category: "upper" },

  // Legacy/alias mappings for existing data
  back: { id: "lats", displayName: "Back", view: "back", category: "upper" }, // maps to lats
  shoulders: { id: "front_delts", displayName: "Shoulders", view: "front", category: "upper" }, // maps to front_delts

  // Core
  core: { id: "core", displayName: "Core", view: "front", category: "core" },
  obliques: { id: "obliques", displayName: "Obliques", view: "front", category: "core" },
  hip_flexors: { id: "hip_flexors", displayName: "Hip Flexors", view: "front", category: "core" },

  // Lower Body - Front
  quads: { id: "quads", displayName: "Quads", view: "front", category: "lower" },
  tibialis: { id: "tibialis", displayName: "Tibialis", view: "front", category: "lower" },

  // Lower Body - Back
  glutes: { id: "glutes", displayName: "Glutes", view: "back", category: "lower" },
  hamstrings: { id: "hamstrings", displayName: "Hamstrings", view: "back", category: "lower" },
  calves: { id: "calves", displayName: "Calves", view: "back", category: "lower" },
};

/**
 * Normalize legacy muscle names to current format
 */
export function normalizeMuscle(muscle: string): string {
  const normalized = muscle.toLowerCase().replace(/[- ]/g, "_");

  // Handle legacy mappings
  const legacyMappings: Record<string, string> = {
    back: "lats",
    shoulders: "front_delts",
    abs: "core",
    lower_back: "erector_spinae",
  };

  return legacyMappings[normalized] || normalized;
}

/**
 * Get display name for a muscle
 */
export function getMuscleDisplayName(muscle: string): string {
  const config = MUSCLE_CONFIG[normalizeMuscle(muscle)];
  return config?.displayName || muscle.replace(/_/g, " ");
}

/**
 * Determine which view(s) contain a muscle
 */
export function getMuscleView(muscle: string): MuscleView {
  const config = MUSCLE_CONFIG[normalizeMuscle(muscle)];
  return config?.view || "front";
}

/**
 * Get all muscles visible in a specific view
 */
export function getMusclesForView(view: "front" | "back"): string[] {
  return Object.entries(MUSCLE_CONFIG)
    .filter(([, config]) => config.view === view || config.view === "both")
    .map(([key]) => key);
}

/**
 * Group muscles by category
 */
export function getMusclesByCategory(category: "upper" | "core" | "lower"): string[] {
  return Object.entries(MUSCLE_CONFIG)
    .filter(([, config]) => config.category === category)
    .map(([key]) => key);
}

/**
 * Check if any muscles in the list are visible in a view
 */
export function hasMusclesInView(muscles: string[], view: "front" | "back"): boolean {
  return muscles.some((muscle) => {
    const muscleView = getMuscleView(muscle);
    return muscleView === view || muscleView === "both";
  });
}

/**
 * Color configuration for muscle visualization
 */
export const MUSCLE_COLORS = {
  primary: "#CDFF00", // Accent lime
  secondary: "#CDFF00", // Same color, different opacity
  secondaryOpacity: 0.5, // Increased from 0.4 for better visibility
  untrained: "#1A1A1A", // Darker base for better contrast
  outline: "#333333", // Subtler outline
  // Heatmap colors (for weekly volume)
  heatmap: {
    none: "#1A1A1A",
    light: "#3d5a16",
    moderate: "#6b8f22",
    heavy: "#CDFF00",
  },
};

/**
 * Calculate heatmap intensity from volume data
 * @param volume - Sets or volume number
 * @param maxVolume - Maximum expected volume
 * @returns 0-1 intensity value
 */
export function calculateHeatmapIntensity(volume: number, maxVolume: number): number {
  if (volume === 0) return 0;
  if (maxVolume === 0) return 0;
  return Math.min(1, volume / maxVolume);
}
