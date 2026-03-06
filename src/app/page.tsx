"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dumbbell, Loader2 } from "lucide-react";
import { HEADING, LABEL, SPACING } from "@/lib/typography";
import { determineDashboardState } from "@/lib/dashboard-state";
import { MorningDashboard } from "@/components/home/MorningDashboard";
import { PreWorkoutDashboard } from "@/components/home/PreWorkoutDashboard";
import { PostWorkoutDashboard } from "@/components/home/PostWorkoutDashboard";
import { RestDayDashboard } from "@/components/home/RestDayDashboard";
import { WhoopRecoveryCard } from "@/components/home/WhoopRecoveryCard";
import { QuickStatsGrid } from "@/components/home/QuickStatsGrid";
import { AppHeader } from "@/components/layout/app-header";
import { getNextTrainingDay } from "@/lib/next-day";
import { SupersetView } from "@/components/workout/superset-view";
import {
  usePrograms,
  useTrainingDays,
  useExercises,
  useStats,
  useGamification,
  useDailyChallenges,
  useWeeklyChallenges,
  useWorkoutLogs,
  useActiveWorkout,
} from "@/lib/queries";
import type { Exercise } from "@/lib/api-client";
import { GamificationStrip } from "@/components/home/GamificationStrip";

export default function Home() {
  const { isSignedIn, isLoaded: authLoaded, user } = useUser();
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // React Query hooks
  const { data: programs, isLoading: programsLoading, isFetching: programsFetching } = usePrograms();
  const { data: allPrograms, isLoading: allProgramsLoading } = usePrograms({ includeArchived: true });
  const { data: stats } = useStats();
  const { data: gamification } = useGamification();
  const { data: dailyChallenges } = useDailyChallenges();
  const { data: weeklyChallenges } = useWeeklyChallenges();
  const { data: workoutLogs } = useWorkoutLogs({ isComplete: true });
  const { data: activeWorkout } = useActiveWorkout();

  // Get active program
  const activeProgram = programs?.find((p) => p.isActive);

  // Get training days for active program
  const { data: trainingDays, isLoading: trainingDaysLoading } = useTrainingDays(activeProgram?.id);
  const { data: exercisesList } = useExercises();

  // Create exercise map for quick lookup
  const exercises = useMemo(() => {
    const map = new Map<string, Exercise>();
    exercisesList?.forEach((ex) => map.set(ex.id, ex));
    return map;
  }, [exercisesList]);

  // Sort training days by day number
  const sortedDays = useMemo(() => {
    if (!trainingDays) return [];
    return [...trainingDays].sort((a, b) => a.dayNumber - b.dayNumber);
  }, [trainingDays]);

  // Set initial selected day when training days load
  useEffect(() => {
    if (sortedDays.length > 0 && !selectedDay) {
      setSelectedDay(sortedDays[0].id);
    }
  }, [sortedDays, selectedDay]);

  const currentDay = sortedDays.find((d) => d.id === selectedDay);

  // Dashboard state machine
  const dashboardCtx = useMemo(() => {
    const hour = new Date().getHours();
    const todayWorkout = currentDay || null;
    return determineDashboardState(
      hour,
      todayWorkout,
      workoutLogs || [],
      stats?.currentStreak || 0
    );
  }, [currentDay, workoutLogs, stats?.currentStreak]);

  // Next training day for rest/post-workout dashboards
  const nextDay = useMemo(() => {
    return getNextTrainingDay(sortedDays, workoutLogs || []);
  }, [sortedDays, workoutLogs]);

  // Weekly workout count
  const weeklyWorkouts = useMemo(() => {
    if (!workoutLogs) return 0;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return workoutLogs.filter((l) => {
      if (!l.isComplete) return false;
      return new Date(l.date) >= startOfWeek;
    }).length;
  }, [workoutLogs]);

  const weeklyTarget = sortedDays.length;

  // Last workout for the same day (for morning dashboard comparison)
  const lastSameDayWorkout = useMemo(() => {
    if (!currentDay || !workoutLogs) return null;
    return workoutLogs
      .filter((l) => l.isComplete && l.dayId === currentDay.id)
      .sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  }, [currentDay, workoutLogs]);

  // Personalized greeting with first name + date
  const personalizedGreeting = useMemo(() => {
    const firstName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "";
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const hour = today.getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 17) greeting = "Good afternoon";
    return firstName ? `${greeting}, ${firstName} - ${dateStr}` : `${greeting} - ${dateStr}`;
  }, [user]);

  // Redirect unauthenticated users to /landing (animations work correctly there)
  useEffect(() => {
    if (authLoaded && !isSignedIn) {
      router.replace("/landing");
    }
  }, [authLoaded, isSignedIn, router]);

  // Show loading while auth is being checked
  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  // Show spinner while redirecting to /landing
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  // Show loading while data is being fetched
  if (programsLoading || programsFetching || allProgramsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading program...</p>
        </div>
      </div>
    );
  }

  // No active programs - check if there are archived ones
  if (!programs || programs.length === 0) {
    const hasArchivedPrograms = allPrograms && allPrograms.length > 0;

    if (hasArchivedPrograms) {
      // User has archived programs but no active ones - point them to /programs to unarchive
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Dumbbell className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className={`${HEADING.h3} text-foreground mb-2`}>No Active Program</h2>
              <p className="text-muted-foreground text-sm">
                You have {allPrograms.length} archived program{allPrograms.length > 1 ? "s" : ""}. Head to Programs to reactivate one.
              </p>
            </div>
            <Button
              onClick={() => router.push("/programs")}
              className="w-full h-14 bg-primary text-black font-semibold text-lg hover:bg-primary/90"
            >
              View Programs
            </Button>
          </div>
        </div>
      );
    }

    // Truly no programs at all - show onboarding
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className={`${HEADING.h3} text-foreground mb-2`}>No Program Yet</h2>
            <p className="text-muted-foreground text-sm">
              Pick a training plan to get started with your workouts.
            </p>
          </div>
          <Button
            onClick={() => router.push("/onboarding/plans")}
            className="w-full h-14 bg-primary text-black font-semibold text-lg hover:bg-primary/90"
          >
            Choose a Plan
          </Button>
        </div>
      </div>
    );
  }

  // Gamification data
  const g = gamification?.gamification;
  const level = g?.level ?? 1;

  return (
    <div className="min-h-screen pb-44 lg:pb-8">
      {/* Header */}
      <AppHeader title="SetFlow" subtitle={personalizedGreeting} />
      <div className="gradient-divider" />

      {/* Compact Gamification Strip */}
      {g && (
        <div className="mb-2">
        <GamificationStrip
          streakDays={stats?.currentStreak || 0}
          level={level}
          totalXP={g.totalXP}
          xpInLevel={g.xpInLevel ?? 0}
          xpToNext={g.xpToNext ?? 100}
          progress={g.progress ?? 0}
          dailyChallenges={dailyChallenges || []}
          weeklyChallenges={weeklyChallenges || []}
        />
        </div>
      )}

      {/* Whoop Recovery Card */}
      <div className="mt-3">
        <WhoopRecoveryCard />
      </div>

      {/* Context-Aware Dashboard */}
      {trainingDaysLoading ? null : (
      <div className="py-4 space-y-8">
        {dashboardCtx.state === "morning" && currentDay && (
          <MorningDashboard
            todayWorkout={currentDay}
            lastWorkout={lastSameDayWorkout}
            exercises={exercises}
            currentStreak={stats?.currentStreak || 0}
            weeklyWorkouts={weeklyWorkouts}
            weeklyTarget={weeklyTarget}
            streakAtRisk={dashboardCtx.streakAtRisk}
          />
        )}
        {dashboardCtx.state === "pre-workout" && currentDay && (
          <PreWorkoutDashboard
            todayWorkout={currentDay}
            exercises={exercises}
          />
        )}
        {dashboardCtx.state === "post-workout" && dashboardCtx.lastCompletedWorkout && (
          <PostWorkoutDashboard
            workout={dashboardCtx.lastCompletedWorkout}
            exercises={exercises}
            nextDay={nextDay}
          />
        )}
        {dashboardCtx.state === "rest-day" && (
          <RestDayDashboard
            nextDay={nextDay}
            lastWorkout={workoutLogs?.filter((l) => l.isComplete).sort((a, b) => b.date.localeCompare(a.date))[0] || null}
            exercises={exercises}
            currentStreak={stats?.currentStreak || 0}
            weeklyWorkouts={weeklyWorkouts}
            weeklyTarget={weeklyTarget}
            streakAtRisk={dashboardCtx.streakAtRisk}
          />
        )}
      </div>
      )}

      {/* Quick Stats Grid */}
      <div className="mt-4">
        <QuickStatsGrid
          weeklyWorkouts={weeklyWorkouts}
          totalPRs={stats?.personalRecordsCount || 0}
          totalVolume={stats?.totalVolume || 0}
        />
      </div>

      {/* Day Tabs + Workout Content */}
      {sortedDays.length > 0 && selectedDay && (
        <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
          <div className="px-4 py-3 border-b border-border">
            <TabsList className="w-full bg-muted/50">
              {sortedDays.map((day) => (
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

          {sortedDays.map((day) => {
            const supersets = day.supersets as Array<{
              id: string;
              label: string;
              exercises: Array<{
                exerciseId: string;
                sets: number;
                reps: string;
                tempo?: string;
                restSeconds?: number;
              }>;
            }>;
            const finisher = day.finisher as Array<{
              exerciseId: string;
              duration: number;
              notes?: string;
            }>;

            return (
              <TabsContent key={day.id} value={day.id} className="mt-0">
                <div className={`p-4 ${SPACING.section}`}>
                  {/* Day Title */}
                  <div>
                    <h2 className="text-[28px] lg:text-[32px] font-bold tracking-tight leading-tight text-foreground">{day.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1.5">
                      {supersets.length} supersets - {supersets.reduce((acc, ss) => acc + ss.exercises.length, 0)} exercises
                    </p>
                  </div>

                  {/* Supersets */}
                  <div className="space-y-4">
                    {supersets.map((superset) => (
                      <SupersetView
                        key={superset.id}
                        superset={superset}
                        exercises={exercises}
                      />
                    ))}
                  </div>

                  {/* Finisher Section */}
                  {finisher && finisher.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className={`${LABEL.section} text-muted-foreground`}>
                          Finisher
                        </h3>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <Card className="bg-card border-border p-4">
                        <ul className="space-y-2">
                          {finisher.map((f, idx) => {
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
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
