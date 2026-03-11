"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "@/lib/design-tokens";

export interface WeightTrendChartProps {
  chartData: Array<{ date: string; weight: number; avg: number }>;
  yDomain: [number, number];
}

export function WeightTrendChart({ chartData, yDomain }: WeightTrendChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis
            dataKey="date"
            tick={{ fill: COLORS.textMuted, fontSize: 11 }}
            tickLine={{ stroke: '#2A2A2A' }}
            axisLine={{ stroke: '#2A2A2A' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={yDomain}
            tick={{ fill: COLORS.textMuted, fontSize: 11 }}
            tickLine={{ stroke: '#2A2A2A' }}
            axisLine={{ stroke: '#2A2A2A' }}
            tickFormatter={(v: number) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: COLORS.card,
              border: '1px solid #2A2A2A',
              borderRadius: '8px',
              color: COLORS.textPrimary,
              fontSize: '13px',
            }}
            labelStyle={{ color: COLORS.textSecondary }}
            formatter={(value) => value != null ? `${Number(value).toFixed(1)} kg` : '-'}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={COLORS.accent}
            strokeWidth={2}
            dot={{ fill: COLORS.accent, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: COLORS.accent }}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke={COLORS.textMuted}
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4, fill: COLORS.textMuted }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
