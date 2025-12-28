"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dumbbell, Play, Loader2, BarChart3, ClipboardList, Settings, Flame, Calendar } from "lucide-react";
import { SupersetView } from "@/components/workout/superset-view";
import db, { getWorkoutStreak } from "@/lib/db";
import type { TrainingDay, Exercise } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
  const [selectedDay, setSelectedDay] = useState("day-1");
  const [streak, setStreak] = useState<{ currentStreak: number; thisWeekCount: number } | null>(null);

  useEffect(() => {
    async function init() {
      try {
        // Seed database on first load
        await seedDatabase();

        // Load training days
        const days = await db.trainingDays.toArray();
        days.sort((a, b) => a.dayNumber - b.dayNumber);
        setTrainingDays(days);

        // Load all exercises into a map for quick lookup
        const allExercises = await db.exercises.toArray();
        const exerciseMap = new Map<string, Exercise>();
        allExercises.forEach((ex) => exerciseMap.set(ex.id, ex));
        setExercises(exerciseMap);

        // Load streak data
        const streakData = await getWorkoutStreak();
        setStreak(streakData);
      } catch (error) {
        console.error("Failed to initialize:", error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  const currentDay = trainingDays.find((d) => d.id === selectedDay);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading program...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SetFlow</h1>
              <p className="text-sm text-muted-foreground">Your Training Program</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/exercises")}
              className="h-10 w-10"
            >
              <Dumbbell className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/program")}
              className="h-10 w-10"
            >
              <ClipboardList className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/stats")}
              className="h-10 w-10"
            >
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings")}
              className="h-10 w-10"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Streak Tracker */}
      {streak && (streak.currentStreak > 0 || streak.thisWeekCount > 0) && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center justify-center gap-6">
            {streak.currentStreak > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{streak.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{streak.thisWeekCount}/7</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Tabs */}
      <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
        <div className="px-4 py-3 border-b border-border">
          <TabsList className="w-full bg-muted/50">
            {trainingDays.map((day) => (
              <TabsTrigger
                key={day.id}
                value={day.id}
                className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Day {day.dayNumber}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {trainingDays.map((day) => (
          <TabsContent key={day.id} value={day.id} className="mt-0">
            <div className="p-4 space-y-6">
              {/* Day Title */}
              <div>
                <h2 className="text-2xl font-bold text-foreground">{day.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {day.supersets.length} supersets - {day.supersets.reduce((acc, ss) => acc + ss.exercises.length, 0)} exercises
                </p>
              </div>

              {/* Warmup Section */}
              {day.warmup && day.warmup.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Warmup
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Card className="bg-card border-border p-4">
                    <ul className="space-y-2">
                      {day.warmup.map((w, idx) => {
                        const exercise = exercises.get(w.exerciseId);
                        return (
                          <li key={idx} className="flex items-center justify-between">
                            <span className="text-foreground">
                              {exercise?.name || w.exerciseId}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {w.reps} reps
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                </div>
              )}

              {/* Supersets */}
              <div className="space-y-4">
                {day.supersets.map((superset) => (
                  <SupersetView
                    key={superset.id}
                    superset={superset}
                    exercises={exercises}
                  />
                ))}
              </div>

              {/* Finisher Section */}
              {day.finisher && day.finisher.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Finisher
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Card className="bg-card border-border p-4">
                    <ul className="space-y-2">
                      {day.finisher.map((f, idx) => {
                        const exercise = exercises.get(f.exerciseId);
                        return (
                          <li key={idx} className="flex items-center justify-between">
                            <div>
                              <span className="text-foreground">
                                {exercise?.name || f.exerciseId}
                              </span>
                              {f.notes && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {f.notes}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {f.duration}s
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Fixed Start Workout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/80 backdrop-blur-lg border-t border-border">
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => router.push(`/workout/${selectedDay}`)}
        >
          <Play className="w-5 h-5 mr-2" />
          Start {currentDay?.name || "Workout"}
        </Button>
      </div>
    </div>
  );
}
