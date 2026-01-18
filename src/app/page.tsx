"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dumbbell, Play, Loader2, BarChart3, ClipboardList, Settings, Flame, Calendar, UtensilsCrossed, Users } from "lucide-react";
import { useNutritionAccess } from "@/hooks/use-nutrition-access";
import { SupersetView } from "@/components/workout/superset-view";
import { Hero, Features, CTA, Footer } from "@/components/landing";
import {
  usePrograms,
  useTrainingDays,
  useExercises,
  useStats,
  useOnboardingProfile,
} from "@/lib/queries";
import type { Exercise } from "@/lib/api-client";
import { onboardingApi } from "@/lib/api-client";

export default function Home() {
  const { isSignedIn, isLoaded: authLoaded } = useUser();
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const { hasAccess: hasNutritionAccess } = useNutritionAccess();

  // React Query hooks
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: onboarding, isLoading: onboardingLoading } = useOnboardingProfile();
  const { data: stats } = useStats();

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

    const hasProgram = programs && programs.length > 0;
    const onboardingState = onboarding?.onboardingState || "not_started";

    // State machine for navigation
    switch (onboardingState) {
      case "complete":
        // User has completed onboarding and has a program - stay on home
        // But if somehow no program exists, reset state and redirect to plans (recovery)
        if (!hasProgram) {
          // Reset state to profile_complete before redirecting
          onboardingApi.update({ onboardingState: "profile_complete" }).catch((e) => {
            console.error("Failed to reset onboarding state:", e);
          });
          router.replace("/onboarding/plans");
        }
        break;
      case "program_installing":
        // Check if program was actually created successfully
        if (hasProgram) {
          // Program exists - installation succeeded but state update failed
          // Update state to complete and stay on home page
          onboardingApi.update({ onboardingState: "complete" }).catch((e) => {
            console.error("Failed to update onboarding state:", e);
          });
          // Don't redirect - let the page re-render with updated state
        } else {
          // No program exists - installation was interrupted, retry
          router.replace("/onboarding/plans");
        }
        break;
      case "profile_complete":
        // User has completed profile but hasn't picked a program - redirect to plans
        router.replace("/onboarding/plans");
        break;
      case "not_started":
      default:
        // User hasn't started onboarding
        // Check legacy fields for backward compatibility
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
  }, [programs, onboarding, programsLoading, onboardingLoading, router, authLoaded, isSignedIn]);

  const currentDay = sortedDays.find((d) => d.id === selectedDay);

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

  // Show loading only while data is being fetched (for authenticated users)
  // Note: Do NOT include programs.length === 0 here - that case is handled by the redirect useEffect above
  if (programsLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading program...</p>
        </div>
      </div>
    );
  }

  // If no programs after loading complete, redirect logic will handle it - show brief loading state
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

  return (
    <div className="min-h-screen pb-40 lg:pb-24">
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
            {hasNutritionAccess && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/nutrition")}
                className="h-10 w-10"
              >
                <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/community")}
              className="h-10 w-10"
            >
              <Users className="w-5 h-5 text-muted-foreground" />
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
      {stats && (stats.currentStreak > 0 || stats.thisWeekCount > 0) && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center justify-center gap-6">
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{stats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stats.thisWeekCount}/{stats.programDayCount || 3}</p>
                <p className="text-xs text-muted-foreground">Week Progress</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Tabs */}
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

      {/* Fixed Bottom Buttons - positioned above tab bar on mobile, at bottom on desktop */}
      {/* Mobile version - above tab bar */}
      <div
        className="fixed left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border z-30 lg:hidden"
        style={{ bottom: "calc(49px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex gap-3">
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-6 font-semibold border-primary/50 text-primary hover:bg-primary/10"
            onClick={() => router.push("/focus-session")}
          >
            <Dumbbell className="w-5 h-5 mr-2" />
            Focus
          </Button>
          <Button
            size="lg"
            className="flex-1 h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push(`/workout/${selectedDay}`)}
            disabled={!selectedDay}
          >
            <Play className="w-5 h-5 mr-2" />
            Start {currentDay?.name || "Workout"}
          </Button>
        </div>
      </div>
      {/* Desktop version - at bottom */}
      <div className="hidden lg:block fixed left-0 right-0 bottom-0 p-4 pb-safe-bottom bg-background/80 backdrop-blur-lg border-t border-border z-30">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-6 font-semibold border-primary/50 text-primary hover:bg-primary/10"
            onClick={() => router.push("/focus-session")}
          >
            <Dumbbell className="w-5 h-5 mr-2" />
            Focus
          </Button>
          <Button
            size="lg"
            className="flex-1 h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push(`/workout/${selectedDay}`)}
            disabled={!selectedDay}
          >
            <Play className="w-5 h-5 mr-2" />
            Start {currentDay?.name || "Workout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
