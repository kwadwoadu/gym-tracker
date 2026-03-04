"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dumbbell, Loader2, BarChart3, ClipboardList, Settings, UtensilsCrossed, Users } from "lucide-react";
import { useNutritionAccess } from "@/hooks/use-nutrition-access";
import { determineDashboardState } from "@/lib/dashboard-state";
import { MorningDashboard } from "@/components/home/MorningDashboard";
import { PreWorkoutDashboard } from "@/components/home/PreWorkoutDashboard";
import { PostWorkoutDashboard } from "@/components/home/PostWorkoutDashboard";
import { RestDayDashboard } from "@/components/home/RestDayDashboard";
import { getNextTrainingDay } from "@/lib/next-day";
import { SupersetView } from "@/components/workout/superset-view";
import { Hero, Features, CTA, Footer } from "@/components/landing";
import {
  usePrograms,
  useTrainingDays,
  useExercises,
  useStats,
  useOnboardingProfile,
  useGamification,
  useDailyChallenges,
  useWeeklyChallenges,
  useWorkoutLogs,
  useActiveWorkout,
} from "@/lib/queries";
import type { Exercise } from "@/lib/api-client";
import { onboardingApi } from "@/lib/api-client";
import { HeroWorkoutCard } from "@/components/home/HeroWorkoutCard";
import { GamificationStrip } from "@/components/home/GamificationStrip";

export default function Home() {
  const { isSignedIn, isLoaded: authLoaded } = useUser();
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const { hasAccess: hasNutritionAccess } = useNutritionAccess();

  // React Query hooks - isFetching guards against stale cache decisions
  const { data: programs, isLoading: programsLoading, isFetching: programsFetching } = usePrograms();
  const { data: onboarding, isLoading: onboardingLoading, isFetching: onboardingFetching } = useOnboardingProfile();
  const { data: stats } = useStats();
  const { data: gamification } = useGamification();
  const { data: dailyChallenges } = useDailyChallenges();
  const { data: weeklyChallenges } = useWeeklyChallenges();
  const { data: workoutLogs } = useWorkoutLogs({ isComplete: true });
  const { data: activeWorkout } = useActiveWorkout();

  // Get active program
  const activeProgram = programs?.find((p) => p.isActive);

  // Get training days for active program
  const { data: trainingDays } = useTrainingDays(activeProgram?.id);
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

  // Redirect based on onboarding state machine (only for authenticated users)
  useEffect(() => {
    if (!authLoaded || !isSignedIn) return;
    if (programsLoading || onboardingLoading) return;
    // Guard against stale React Query cache - wait for fresh data after navigation
    if (programsFetching || onboardingFetching) return;

    const hasProgram = programs && programs.length > 0;
    const onboardingState = onboarding?.onboardingState || "not_started";

    // State machine for navigation
    switch (onboardingState) {
      case "complete":
        if (!hasProgram) {
          console.warn("[onboarding] State is complete but no program found - redirecting to plans without state reset");
          router.replace("/onboarding/plans");
        }
        break;
      case "program_installing":
        if (hasProgram) {
          onboardingApi.update({ onboardingState: "complete" }).catch((e) => {
            console.error("Failed to update onboarding state:", e);
          });
        } else {
          router.replace("/onboarding/plans");
        }
        break;
      case "profile_complete":
        router.replace("/onboarding/plans");
        break;
      case "not_started":
      default: {
        const hasCompletedOnboarding = onboarding?.hasCompletedOnboarding || onboarding?.skippedOnboarding;
        if (!hasProgram) {
          if (!hasCompletedOnboarding) {
            router.replace("/onboarding");
          } else {
            router.replace("/onboarding/plans");
          }
        }
        break;
      }
    }
  }, [programs, onboarding, programsLoading, onboardingLoading, programsFetching, onboardingFetching, router, authLoaded, isSignedIn]);

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

  // Show loading while auth is being checked
  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#CDFF00]" />
        </div>
      </div>
    );
  }

  // If not signed in, show landing page
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Hero />
        <Features />
        <CTA />
        <Footer />
      </div>
    );
  }

  // Show loading while data is being fetched or refetched (prevents stale cache decisions)
  if (programsLoading || onboardingLoading || programsFetching || onboardingFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading program...</p>
        </div>
      </div>
    );
  }

  // If no programs after loading complete, redirect logic will handle it
  if (!programs || programs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Gamification data
  const g = gamification?.gamification;
  const level = g?.level ?? 1;

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <button
              onClick={() => router.push("/programs")}
              className="text-left hover:opacity-80 transition-opacity"
            >
              <h1 className="text-xl font-bold text-foreground">SetFlow</h1>
              <p className="text-sm text-muted-foreground">
                {activeProgram?.name || "Your Training Program"}
              </p>
            </button>
          </div>
          {/* Header icons - hidden on mobile (use bottom tab bar instead) */}
          <div className="hidden lg:flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => router.push("/exercises")} className="h-10 w-10">
              <Dumbbell className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push("/program")} className="h-10 w-10">
              <ClipboardList className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push("/stats")} className="h-10 w-10">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </Button>
            {hasNutritionAccess && (
              <Button variant="ghost" size="icon" onClick={() => router.push("/nutrition")} className="h-10 w-10">
                <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => router.push("/community")} className="h-10 w-10">
              <Users className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push("/settings")} className="h-10 w-10">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Workout Card */}
      <HeroWorkoutCard
        currentDay={currentDay || null}
        sortedDays={sortedDays}
        workoutLogs={workoutLogs || []}
        activeWorkout={activeWorkout}
        onSelectDay={setSelectedDay}
      />

      {/* Compact Gamification Strip */}
      {g && (
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
      )}

      {/* Context-Aware Dashboard */}
      <div className="py-4">
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
            const warmup = day.warmup as Array<{ exerciseId: string; reps: number }>;
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
                <div className="p-4 space-y-6">
                  {/* Day Title */}
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{day.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {supersets.length} supersets - {supersets.reduce((acc, ss) => acc + ss.exercises.length, 0)} exercises
                    </p>
                  </div>

                  {/* Warmup Section */}
                  {warmup && warmup.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Warmup
                        </h3>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <Card className="bg-card border-border p-4">
                        <ul className="space-y-2">
                          {warmup.map((w, idx) => {
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
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
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
