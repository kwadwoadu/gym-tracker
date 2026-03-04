export interface NavyMethodInput {
  gender: "male" | "female";
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number; // Required for female
}

export function calculateNavyBodyFat(input: NavyMethodInput): number | null {
  const { gender, heightCm, neckCm, waistCm, hipCm } = input;

  if (heightCm <= 0 || neckCm <= 0 || waistCm <= 0) return null;
  if (waistCm <= neckCm) return null;

  if (gender === "male") {
    const bf =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waistCm - neckCm) +
          0.15456 * Math.log10(heightCm)) -
      450;
    const rounded = Math.round(bf * 10) / 10;
    if (rounded < 2 || rounded > 60) return null;
    return rounded;
  }

  if (!hipCm || hipCm <= 0) return null;
  if (waistCm + hipCm <= neckCm) return null;

  const bf =
    495 /
      (1.29579 -
        0.35004 * Math.log10(waistCm + hipCm - neckCm) +
        0.221 * Math.log10(heightCm)) -
    450;
  const rounded = Math.round(bf * 10) / 10;
  if (rounded < 2 || rounded > 60) return null;
  return rounded;
}

export const BODY_FAT_RANGES = {
  male: [
    { min: 2, max: 5, label: "Essential", color: "#EF4444" },
    { min: 6, max: 13, label: "Athletic", color: "#22C55E" },
    { min: 14, max: 17, label: "Fit", color: "#CDFF00" },
    { min: 18, max: 24, label: "Average", color: "#F59E0B" },
    { min: 25, max: 60, label: "Above Average", color: "#EF4444" },
  ],
  female: [
    { min: 10, max: 13, label: "Essential", color: "#EF4444" },
    { min: 14, max: 20, label: "Athletic", color: "#22C55E" },
    { min: 21, max: 24, label: "Fit", color: "#CDFF00" },
    { min: 25, max: 31, label: "Average", color: "#F59E0B" },
    { min: 32, max: 60, label: "Above Average", color: "#EF4444" },
  ],
} as const;

export function getBodyFatCategory(
  percentage: number,
  gender: "male" | "female"
): { label: string; color: string } {
  const ranges = BODY_FAT_RANGES[gender];
  for (const range of ranges) {
    if (percentage >= range.min && percentage <= range.max) {
      return { label: range.label, color: range.color };
    }
  }
  return { label: "Unknown", color: "#666666" };
}
