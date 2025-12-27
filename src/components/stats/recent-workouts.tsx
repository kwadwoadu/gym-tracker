"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, ChevronDown, ChevronUp, Clock, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkoutLog, Exercise } from "@/lib/db";

interface RecentWorkoutsProps {
  workoutLogs: WorkoutLog[];
  exercises: Map<string, Exercise>;
}

export function RecentWorkouts({ workoutLogs, exercises }: RecentWorkoutsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (workoutLogs.length === 0) {
    return (
      <Card className="bg-card border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Recent Workouts
          </h2>
        </div>
        <div className="py-8 text-center">
          <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No workouts completed yet
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Recent Workouts
        </h2>
      </div>

      <div className="space-y-3">
        {workoutLogs.slice(0, 10).map((log) => {
          const isExpanded = expandedId === log.id;
          const totalSets = log.sets.length;
          const totalVolume = log.sets.reduce(
            (sum, set) => sum + set.weight * set.actualReps,
            0
          );

          return (
            <div
              key={log.id}
              className="rounded-lg bg-muted/30 overflow-hidden"
            >
              {/* Workout Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{log.dayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{log.duration || 0} min</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalSets} sets
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-border/50">
                  <div className="pt-3 space-y-2">
                    {/* Group sets by exercise */}
                    {(() => {
                      const exerciseGroups = new Map<
                        string,
                        { name: string; sets: typeof log.sets }
                      >();
                      log.sets.forEach((set) => {
                        const existing = exerciseGroups.get(set.exerciseId);
                        if (existing) {
                          existing.sets.push(set);
                        } else {
                          exerciseGroups.set(set.exerciseId, {
                            name: set.exerciseName,
                            sets: [set],
                          });
                        }
                      });

                      return Array.from(exerciseGroups.entries()).map(
                        ([exerciseId, { name, sets }]) => (
                          <div
                            key={exerciseId}
                            className="flex items-center justify-between py-1"
                          >
                            <span className="text-sm text-foreground">
                              {name}
                            </span>
                            <div className="flex items-center gap-2">
                              {sets.map((set, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {set.weight}kg x {set.actualReps}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      );
                    })()}
                  </div>

                  {/* Total Volume */}
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Volume</span>
                    <span className="font-bold text-primary">
                      {totalVolume.toLocaleString()} kg
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
