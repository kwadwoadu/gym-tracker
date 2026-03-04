"use client";

import { cn } from "@/lib/utils";

export type TimePeriod = "week" | "month" | "3month" | "year" | "all";

interface PeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
  className?: string;
}

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "week", label: "W" },
  { value: "month", label: "M" },
  { value: "3month", label: "3M" },
  { value: "year", label: "Y" },
  { value: "all", label: "All" },
];

export function PeriodSelector({ value, onChange, className }: PeriodSelectorProps) {
  return (
    <div className={cn("flex items-center bg-[#1A1A1A] rounded-lg p-1", className)}>
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-colors touch-target",
            value === p.value
              ? "bg-[#CDFF00] text-black"
              : "text-white/50 hover:text-white/80"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Get the start date for a given time period.
 */
export function getPeriodStart(period: TimePeriod): Date {
  const now = new Date();
  switch (period) {
    case "week":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case "month":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3month":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "year":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "all":
      return new Date(2020, 0, 1);
  }
}

/**
 * Filter items by date within a time period.
 */
export function filterByPeriod<T extends { date: string }>(
  items: T[],
  period: TimePeriod
): T[] {
  const start = getPeriodStart(period);
  return items.filter((item) => new Date(item.date) >= start);
}
