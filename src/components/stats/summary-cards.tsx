"use client";

import { Card } from "@/components/ui/card";
import { Dumbbell, Flame, Clock, Trophy } from "lucide-react";
import { TrendArrow } from "@/components/stats/trend-arrow";
import { DATA } from "@/lib/typography";
import type { WorkoutLog, PersonalRecord } from "@/lib/api-client";

interface SummaryCardsProps {
  workoutLogs: WorkoutLog[];
  personalRecords: PersonalRecord[];
  previousWorkoutLogs?: WorkoutLog[];
  previousPersonalRecords?: PersonalRecord[];
}

export function SummaryCards({
  workoutLogs,
  personalRecords,
  previousWorkoutLogs,
  previousPersonalRecords,
}: SummaryCardsProps) {
  // Calculate stats
  const totalWorkouts = workoutLogs.length;
  const totalPRs = personalRecords.length;
  const prevWorkouts = previousWorkoutLogs?.length ?? 0;
  const prevPRs = previousPersonalRecords?.length ?? 0;

  // Average duration
  const avgDuration =
    workoutLogs.length > 0
      ? Math.round(
          workoutLogs.reduce((sum, log) => sum + (log.duration || 0), 0) /
            workoutLogs.length
        )
      : 0;

  const prevAvgDuration =
    previousWorkoutLogs && previousWorkoutLogs.length > 0
      ? Math.round(
          previousWorkoutLogs.reduce((sum, log) => sum + (log.duration || 0), 0) /
            previousWorkoutLogs.length
        )
      : 0;

  // Calculate streak (consecutive days with workouts)
  const calculateStreak = (): number => {
    if (workoutLogs.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique workout dates
    const workoutDates = new Set(workoutLogs.map((log) => log.date));
    const sortedDates = Array.from(workoutDates).sort((a, b) =>
      b.localeCompare(a)
    );

    let streak = 0;
    let currentDate = today;

    for (const dateStr of sortedDates) {
      const workoutDate = new Date(dateStr);
      workoutDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  const stats = [
    {
      label: "Workouts",
      value: totalWorkouts,
      icon: Dumbbell,
      color: "text-primary",
      prev: prevWorkouts,
    },
    {
      label: "Streak",
      value: currentStreak,
      valueSuffix: ` day${currentStreak !== 1 ? "s" : ""}`,
      icon: Flame,
      color: "text-orange-500",
      prev: 0,
    },
    {
      label: "Avg Duration",
      value: avgDuration,
      valueSuffix: " min",
      icon: Clock,
      color: "text-blue-500",
      prev: prevAvgDuration,
    },
    {
      label: "PRs",
      value: totalPRs,
      icon: Trophy,
      color: "text-yellow-500",
      prev: prevPRs,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          elevation="standard"
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <stat.icon className={`w-4 h-4 flex-shrink-0 ${stat.color}`} />
            <span className="text-xs text-muted-foreground uppercase truncate">
              {stat.label}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`${DATA.medium} text-foreground`}>
              {stat.value}{stat.valueSuffix || ""}
            </span>
            {stat.prev > 0 && (
              <TrendArrow current={stat.value} previous={stat.prev} />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
