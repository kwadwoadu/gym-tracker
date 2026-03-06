/**
 * Elevation system - 3-tier visual hierarchy
 */

export type ElevationTier = "hero" | "standard" | "muted" | "accentLeft" | "glass";

/** Tailwind class sets for each elevation tier */
export const ELEVATION: Record<ElevationTier, string> = {
  hero: "bg-gradient-to-br from-card to-card-alt border border-primary/20 rounded-2xl shadow-[var(--shadow-hero)] p-6",
  standard: "bg-card border border-border rounded-xl shadow-[var(--shadow-standard)] p-4",
  muted: "bg-card/50 border border-border/50 rounded-xl shadow-[var(--shadow-muted)] p-3 opacity-70",
  accentLeft: "bg-card border border-border border-l-2 border-l-primary rounded-xl shadow-[var(--shadow-standard)] p-4",
  glass: "bg-glass-bg backdrop-blur-xl border border-glass-border rounded-xl p-4",
};

/** Glassmorphism styles for floating chrome */
export const GLASS = {
  tabBar: "bg-background/60 backdrop-blur-xl backdrop-saturate-[1.8] border-t border-white/8 shadow-[var(--shadow-glass)] glass-bg",
  fixedCta: "bg-background/70 backdrop-blur-[20px] backdrop-saturate-150 border-t border-white/6 glass-bg",
};

/** Z-index scale for consistent layering */
export const Z_INDEX = {
  content: 0,
  stickyHeader: 20,
  tabBar: 40,
  sidebar: 50,
  modal: 50,
  toast: 50,
} as const;

/** Progress bar gradient presets */
export const GRADIENTS = {
  xp: "bg-gradient-to-r from-primary via-gym-success to-gym-success",
  challenge: "bg-gradient-to-r from-primary/60 to-primary",
  streak: "bg-gradient-to-t from-orange-600 to-orange-400",
};
