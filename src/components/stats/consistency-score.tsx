"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, TrendingDown, Minus, Flame } from "lucide-react";
import { HEADING, DATA } from "@/lib/typography";
import { calculateConsistencyScore } from "@/lib/ai/consistency-scorer";
import dynamic from "next/dynamic";

const ConsistencySparkline = dynamic(
  () =>
    import("./consistency-sparkline").then((mod) => ({
      default: mod.ConsistencySparkline,
    })),
  {
    ssr: false,
    loading: () => <div className="h-12 w-full" />,
  }
);

interface ConsistencyScoreProps {
  workoutLogs: Array<{ date: string; isComplete: boolean }>;
  plannedDaysPerWeek: number;
}

const trendIcons = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
};

const trendColors = {
  improving: "text-green-500",
  declining: "text-red-500",
  stable: "text-muted-foreground",
};

const trendLabels = {
  improving: "Improving",
  declining: "Needs attention",
  stable: "Stable",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#EF4444";
}

export function ConsistencyScoreCard({
  workoutLogs,
  plannedDaysPerWeek,
}: ConsistencyScoreProps) {
  const consistency = useMemo(() => {
    return calculateConsistencyScore(workoutLogs, plannedDaysPerWeek);
  }, [workoutLogs, plannedDaysPerWeek]);

  if (!consistency) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className={`${HEADING.h3} text-foreground`}>Consistency</h2>
        </div>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete a few workouts to see your consistency score
          </p>
        </Card>
      </section>
    );
  }

  const TrendIcon = trendIcons[consistency.trend];
  const ringColor = getScoreRingColor(consistency.score);

  // SVG ring dimensions
  const size = 72;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (consistency.score / 100) * circumference;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className={`${HEADING.h3} text-foreground`}>Consistency</h2>
      </div>
      <Card className="p-5">
        <div className="flex items-center gap-5">
          {/* Score ring */}
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#2A2A2A"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`${DATA.small} ${getScoreColor(consistency.score)}`}>
                {consistency.score}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <TrendIcon
                className={`w-4 h-4 ${trendColors[consistency.trend]}`}
              />
              <span
                className={`text-sm font-medium ${trendColors[consistency.trend]}`}
              >
                {trendLabels[consistency.trend]}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                This week:{" "}
                <span className="text-foreground font-medium">
                  {consistency.currentWeek.workoutsDone}/
                  {consistency.currentWeek.workoutsPlanned}
                </span>
              </span>
              {consistency.streakWeeks > 0 && (
                <span className="flex items-center gap-1 text-orange-500">
                  <Flame className="w-3.5 h-3.5" />
                  {consistency.streakWeeks}w streak
                </span>
              )}
            </div>

            {/* 4-week sparkline */}
            <div className="mt-3 h-12">
              <ConsistencySparkline data={consistency.weeklyHistory} />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
