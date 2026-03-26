"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from "recharts";

interface SparklineData {
  weekStart: string;
  adherencePercent: number;
}

interface ConsistencySparklineProps {
  data: SparklineData[];
}

export function ConsistencySparkline({ data }: ConsistencySparklineProps) {
  if (data.length === 0) return null;

  const chartData = data.map((d, i) => ({
    week: i + 1,
    value: d.adherencePercent,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id="consistencyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#CDFF00" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#CDFF00" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={[0, 100]} hide />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#CDFF00"
          strokeWidth={2}
          fill="url(#consistencyGradient)"
          dot={{ fill: "#CDFF00", strokeWidth: 0, r: 3 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
