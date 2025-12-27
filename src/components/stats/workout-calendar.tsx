"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkoutLog } from "@/lib/db";

interface WorkoutCalendarProps {
  workoutLogs: WorkoutLog[];
}

export function WorkoutCalendar({ workoutLogs }: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get workout dates for current month
  const workoutDates = useMemo(() => {
    const dates = new Set<string>();
    workoutLogs.forEach((log) => {
      dates.add(log.date);
    });
    return dates;
  }, [workoutLogs]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{
      date: number | null;
      hasWorkout: boolean;
      isToday: boolean;
    }> = [];

    // Add empty slots for days before first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, hasWorkout: false, isToday: false });
    }

    // Add days of month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day;

      days.push({
        date: day,
        hasWorkout: workoutDates.has(dateStr),
        isToday,
      });
    }

    return days;
  }, [currentMonth, workoutDates]);

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Workout Calendar
          </h2>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-medium text-foreground">{monthName}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground font-medium py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={cn(
              "aspect-square flex items-center justify-center rounded-md text-sm relative",
              day.date === null && "invisible",
              day.isToday && "ring-1 ring-primary",
              day.hasWorkout && "bg-primary/20"
            )}
          >
            {day.date && (
              <>
                <span
                  className={cn(
                    "text-foreground",
                    day.hasWorkout && "font-bold"
                  )}
                >
                  {day.date}
                </span>
                {day.hasWorkout && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/20" />
          <span>Workout day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm ring-1 ring-primary" />
          <span>Today</span>
        </div>
      </div>
    </Card>
  );
}
