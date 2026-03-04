/**
 * Typography and spacing constants for gym-optimized readability.
 * Use these presets to maintain consistent hierarchy across components.
 */

/** Heading presets (mobile-first, add lg: for desktop) */
export const HEADING = {
  h1: "text-4xl lg:text-[40px] font-extrabold tracking-tight leading-tight",
  h2: "text-[28px] lg:text-[32px] font-bold tracking-tight leading-tight",
  h3: "text-xl lg:text-[22px] font-semibold leading-tight",
} as const;

/** Section label presets (uppercase small text) */
export const LABEL = {
  section: "text-sm font-semibold uppercase tracking-[0.08em]",
  caption: "text-xs uppercase tracking-[0.08em]",
} as const;

/** Data display presets (weights, reps, timer values) */
export const DATA = {
  large: "text-4xl font-bold tabular-nums leading-none tracking-tight",
  medium: "text-2xl font-bold tabular-nums leading-none tracking-tight",
  small: "text-lg font-semibold tabular-nums leading-none",
} as const;

/** Spacing constants */
export const SPACING = {
  /** Between major page sections */
  section: "space-y-8",
  /** Between cards within a section */
  cards: "space-y-3",
  /** Hero section vertical padding */
  heroSection: "py-5",
  /** Standard card padding */
  cardPadding: "p-5",
  /** Hero card padding */
  heroCardPadding: "p-6",
  /** Page bottom padding (above tab bar) */
  pageBottom: "pb-44 lg:pb-8",
} as const;
