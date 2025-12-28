"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import db from "@/lib/db";
import type { WorkoutLog, PersonalRecord, Exercise } from "@/lib/db";
import { SummaryCards } from "@/components/stats/summary-cards";
import { WeightChart } from "@/components/stats/weight-chart";
import { PRList } from "@/components/stats/pr-list";
import { WorkoutCalendar } from "@/components/stats/workout-calendar";
import { RecentWorkouts } from "@/components/stats/recent-workouts";

export default function StatsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());

  useEffect(() => {
    async function loadData() {
      try {
        // Load all workout logs
        const logs = await db.workoutLogs
          .filter((log) => log.isComplete)
          .toArray();
        logs.sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
        setWorkoutLogs(logs);

        // Load all personal records
        const prs = await db.personalRecords.toArray();
        prs.sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
        setPersonalRecords(prs);

        // Load exercises for reference
        const allExercises = await db.exercises.toArray();
        const exerciseMap = new Map<string, Exercise>();
        allExercises.forEach((ex) => exerciseMap.set(ex.id, ex));
        setExercises(exerciseMap);
      } catch (error) {
        console.error("Failed to load stats data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Stats & Progress</h1>
            <p className="text-sm text-muted-foreground">
              {workoutLogs.length} workouts completed
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <SummaryCards
          workoutLogs={workoutLogs}
          personalRecords={personalRecords}
        />

        {/* Weight Progression Chart */}
        <WeightChart workoutLogs={workoutLogs} exercises={exercises} />

        {/* Personal Records */}
        <PRList personalRecords={personalRecords} />

        {/* Workout Calendar */}
        <WorkoutCalendar workoutLogs={workoutLogs} />

        {/* Recent Workouts */}
        <RecentWorkouts workoutLogs={workoutLogs} />
      </div>
    </div>
  );
}
