/**
 * Elevation system - 3-tier visual hierarchy
 */

export type ElevationTier = "hero" | "standard" | "muted";

/** Tailwind class sets for each elevation tier */
export const ELEVATION: Record<ElevationTier, string> = {
  hero: "bg-gradient-to-br from-[#1A1A1A] to-[#141414] border border-[#CDFF00]/20 rounded-2xl shadow-[var(--shadow-hero)] p-6",
  standard: "bg-card border border-border rounded-xl shadow-[var(--shadow-standard)] p-4",
  muted: "bg-card/50 border border-border/50 rounded-xl shadow-[var(--shadow-muted)] p-3 opacity-70",
};

/** Glassmorphism styles for floating chrome */
export const GLASS = {
  tabBar: "bg-[#0A0A0A]/60 backdrop-blur-xl backdrop-saturate-[1.8] border-t border-white/8 shadow-[var(--shadow-glass)] glass-bg",
  fixedCta: "bg-[#0A0A0A]/70 backdrop-blur-[20px] backdrop-saturate-150 border-t border-white/6 glass-bg",
};

/** Progress bar gradient presets */
export const GRADIENTS = {
  xp: "bg-gradient-to-r from-[#CDFF00] via-[#A3E635] to-[#22C55E]",
  challenge: "bg-gradient-to-r from-[#CDFF00]/60 to-[#CDFF00]",
  streak: "bg-gradient-to-t from-orange-600 to-orange-400",
};
