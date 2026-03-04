import { type WeightEntry } from "./types";

export function calculateMovingAverage(
  entries: WeightEntry[],
  windowSize: number = 7
): { date: string; value: number }[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  return sorted.map((entry, index) => {
    const windowStart = Math.max(0, index - windowSize + 1);
    const window = sorted.slice(windowStart, index + 1);
    const avg = window.reduce((sum, e) => sum + e.weight, 0) / window.length;
    return {
      date: entry.date,
      value: Math.round(avg * 10) / 10,
    };
  });
}

export function calculateWeeklyRate(entries: WeightEntry[]): number | null {
  if (entries.length < 7) return null;

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-7);
  const older = sorted.slice(-14, -7);

  if (older.length === 0) return null;

  const recentAvg =
    recent.reduce((s, e) => s + e.weight, 0) / recent.length;
  const olderAvg = older.reduce((s, e) => s + e.weight, 0) / older.length;

  return Math.round((recentAvg - olderAvg) * 10) / 10;
}

export type WeightTrend = "gaining" | "losing" | "maintaining";

export function getWeightTrend(weeklyRate: number | null): WeightTrend {
  if (weeklyRate === null) return "maintaining";
  if (weeklyRate > 0.1) return "gaining";
  if (weeklyRate < -0.1) return "losing";
  return "maintaining";
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462 * 10) / 10;
}
