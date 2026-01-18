"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WorkoutLog, Exercise } from "@/lib/api-client";

interface WeightChartProps {
  workoutLogs: WorkoutLog[];
  exercises: Map<string, Exercise>;
}

export function WeightChart({ workoutLogs, exercises }: WeightChartProps) {
  // Get unique exercises that have been logged
  const loggedExercises = useMemo(() => {
    const exerciseIds = new Set<string>();
    workoutLogs.forEach((log) => {
      log.sets.forEach((set) => {
        exerciseIds.add(set.exerciseId);
      });
    });
    return Array.from(exerciseIds)
      .map((id) => exercises.get(id))
      .filter(Boolean) as Exercise[];
  }, [workoutLogs, exercises]);

  const [selectedExercise, setSelectedExercise] = useState<string>(
    loggedExercises[0]?.id || ""
  );

  // Get weight progression data for selected exercise
  const chartData = useMemo(() => {
    if (!selectedExercise) return [];

    const progressionMap = new Map<string, { weight: number; reps: number }>();

    workoutLogs.forEach((log) => {
      const exerciseSets = log.sets.filter(
        (set) => set.exerciseId === selectedExercise
      );
      if (exerciseSets.length > 0) {
        // Get max weight for this session
        const maxWeight = Math.max(...exerciseSets.map((s) => s.weight));
        const maxWeightSet = exerciseSets.find((s) => s.weight === maxWeight);
        progressionMap.set(log.date, {
          weight: maxWeight,
          reps: maxWeightSet?.actualReps || 0,
        });
      }
    });

    return Array.from(progressionMap.entries())
      .map(([date, data]) => ({
        date,
        displayDate: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weight: data.weight,
        reps: data.reps,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [workoutLogs, selectedExercise]);

  if (loggedExercises.length === 0) {
    return (
      <Card className="bg-card border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Weight Progression
          </h2>
        </div>
        <div className="h-56 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Complete workouts to see your progress
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Weight Progression
          </h2>
        </div>
      </div>

      {/* Exercise Selector */}
      <div className="mb-4">
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {loggedExercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="displayDate"
                stroke="#666"
                fontSize={10}
                tickLine={false}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                stroke="#666"
                fontSize={10}
                tickLine={false}
                domain={["auto", "auto"]}
                unit="kg"
                tick={{ fontSize: 10 }}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
                formatter={(value) => [`${value}kg`, "Weight"]}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#CDFF00"
                strokeWidth={2}
                dot={{ fill: "#CDFF00", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#CDFF00" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-56 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            No data for this exercise yet
          </p>
        </div>
      )}
    </Card>
  );
}
