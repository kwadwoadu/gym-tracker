"use client";

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { COLORS } from "@/lib/design-tokens";

interface BodyFatChartProps {
  data: Array<{ date: string; percentage: number }>;
}

export function BodyFatChart({ data }: BodyFatChartProps) {
  return (
    <div className="h-[160px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="date"
            stroke={COLORS.textMuted}
            tick={{ fontSize: 10, fill: COLORS.textMuted }}
            tickFormatter={(d: string) =>
              new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })
            }
          />
          <YAxis
            stroke={COLORS.textMuted}
            tick={{ fontSize: 10, fill: COLORS.textMuted }}
            domain={["auto", "auto"]}
            width={35}
            unit="%"
          />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke={COLORS.accent}
            strokeWidth={2}
            dot={{ fill: COLORS.accent, r: 3 }}
            activeDot={{ fill: COLORS.accent, r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
