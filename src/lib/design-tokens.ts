/**
 * SetFlow Evolved - Design Token Constants
 * Single source of truth for all design values.
 * CSS custom properties are defined in globals.css; these TS constants
 * provide type-safe access for component logic and conditional styling.
 */

// Color tokens (reference only - use Tailwind classes in JSX)
export const COLORS = {
  page: "#050505",
  background: "#0A0A0A",
  card: "#1A1A1A",
  cardAlt: "#111111",
  accent: "#CDFF00",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#666666",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  blue: "#60A5FA",
} as const;

// Radius tokens
export const RADIUS = {
  card: "rounded-xl",
  cardLg: "rounded-2xl",
  button: "rounded-lg",
  badge: "rounded-full",
  chip: "rounded-full",
} as const;

// Status color mapping for Whoop-style indicators
export const STATUS_COLORS = {
  green: { bg: "bg-gym-success/20", text: "text-gym-success", ring: "#22C55E" },
  yellow: { bg: "bg-gym-warning/20", text: "text-gym-warning", ring: "#F59E0B" },
  red: { bg: "bg-gym-error/20", text: "text-gym-error", ring: "#EF4444" },
} as const;
