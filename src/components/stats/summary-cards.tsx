"use client";

import { Card } from "@/components/ui/card";
import { Dumbbell, Flame, Clock, Trophy } from "lucide-react";
import type { WorkoutLog, PersonalRecord } from "@/lib/api-client";

interface SummaryCardsProps {
  workoutLogs: WorkoutLog[];
  personalRecords: PersonalRecord[];
}

export function SummaryCards({ workoutLogs, personalRecords }: SummaryCardsProps) {
  // Calculate stats
  const totalWorkouts = workoutLogs.length;
  const totalPRs = personalRecords.length;

  // Average duration
  const avgDuration =
    workoutLogs.length > 0
      ? Math.round(
          workoutLogs.reduce((sum, log) => sum + (log.duration || 0), 0) /
            workoutLogs.length
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
      label: "Total Workouts",
      value: totalWorkouts,
      icon: Dumbbell,
      color: "text-primary",
    },
    {
      label: "Current Streak",
      value: `${currentStreak} day${currentStreak !== 1 ? "s" : ""}`,
      icon: Flame,
      color: "text-orange-500",
    },
    {
      label: "Avg Duration",
      value: `${avgDuration} min`,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Personal Records",
      value: totalPRs,
      icon: Trophy,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="bg-card border-border p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <stat.icon className={`w-4 h-4 flex-shrink-0 ${stat.color}`} />
            <span className="text-xs text-muted-foreground uppercase tracking-wider truncate">
              {stat.label}
            </span>
          </div>
          <span className="text-2xl font-bold text-foreground">{stat.value}</span>
        </Card>
      ))}
    </div>
  );
}
