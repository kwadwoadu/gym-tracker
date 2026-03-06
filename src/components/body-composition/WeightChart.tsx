"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { calculateMovingAverage } from "@/lib/body-composition/weight-analysis";
import { type WeightEntry } from "@/lib/body-composition/types";
import { COLORS } from "@/lib/design-tokens";

export type Period = "1w" | "1m" | "3m" | "6m" | "1y" | "all";

interface WeightChartProps {
  entries: WeightEntry[];
  goalWeight?: number;
  period: Period;
}

export function WeightChart({ entries, goalWeight, period }: WeightChartProps) {
  const filteredEntries = useMemo(() => {
    if (period === "all") return entries;
    const now = new Date();
    const cutoff = new Date();
    switch (period) {
      case "1w":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "1m":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case "1y":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }
    return entries.filter((e) => new Date(e.date) >= cutoff);
  }, [entries, period]);

  const movingAvg = useMemo(
    () => calculateMovingAverage(filteredEntries),
    [filteredEntries]
  );

  const chartData = useMemo(() => {
    const sorted = [...filteredEntries].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    return sorted.map((entry, i) => ({
      date: entry.date,
      weight: entry.weight,
      average: movingAvg[i]?.value,
    }));
  }, [filteredEntries, movingAvg]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <p className="text-sm text-white/30">Log your first weight to see the chart</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="date"
            stroke={COLORS.textMuted}
            tick={{ fontSize: 10, fill: COLORS.textMuted }}
            tickFormatter={(d) =>
              new Date(d).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis
            stroke={COLORS.textMuted}
            tick={{ fontSize: 10, fill: COLORS.textMuted }}
            domain={["auto", "auto"]}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: COLORS.card,
              border: `1px solid ${COLORS.cardAlt}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: COLORS.textSecondary }}
            labelFormatter={(d) =>
              new Date(d).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={COLORS.textMuted}
            strokeWidth={0}
            dot={{ fill: COLORS.textMuted, r: 3 }}
            activeDot={{ fill: COLORS.accent, r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke={COLORS.accent}
            strokeWidth={2}
            dot={false}
          />
          {goalWeight && (
            <ReferenceLine
              y={goalWeight}
              stroke={COLORS.accent}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
