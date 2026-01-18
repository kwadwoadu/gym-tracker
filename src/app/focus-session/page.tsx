"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Loader2,
  Search,
  Zap,
  Dumbbell,
  Check,
  X,
  Sparkles,
  Target,
  HeartPulse,
  LayoutGrid,
  Footprints,
  Mountain,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { exercisesApi, focusSessionApi, type Exercise, type FocusSessionExercise, type ExerciseRecommendation } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const FOCUS_AREAS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "chest", label: "Chest", icon: HeartPulse },
  { id: "back", label: "Back", icon: LayoutGrid },
  { id: "legs", label: "Legs", icon: Footprints },
  { id: "shoulders", label: "Shoulders", icon: Mountain },
  { id: "arms", label: "Arms", icon: Zap },
  { id: "core", label: "Core", icon: Target },
  { id: "full_body", label: "Full Body", icon: Flame },
];

export default function FocusSessionStartPage() {
  const router = useRouter();
  const [focusArea, setFocusArea] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<FocusSessionExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  // Fetch all exercises
  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => exercisesApi.list(),
  });

  // Fetch recommendations when focus area is selected
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["focus-recommendations", focusArea],
    queryFn: () => focusSessionApi.getRecommendations(focusArea, 6),
    enabled: !!focusArea,
  });

  // Check for active session
  const { data: activeSession, isLoading: activeSessionLoading } = useQuery({
    queryKey: ["focus-session-active"],
    queryFn: () => focusSessionApi.getActive(),
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (data: { focusArea?: string; exercises: FocusSessionExercise[] }) =>
      focusSessionApi.create(data),
    onSuccess: (session) => {
      router.push(`/focus-session/${session.id}`);
    },
  });

  // Redirect to active session if exists
  useEffect(() => {
    if (activeSession) {
      router.replace(`/focus-session/${activeSession.id}`);
    }
  }, [activeSession, router]);

  // Filter exercises by search query
  const filteredExercises = exercises?.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExercise = (exercise: Exercise) => {
    const exists = selectedExercises.find((e) => e.exerciseId === exercise.id);
    if (exists) {
      setSelectedExercises((prev) => prev.filter((e) => e.exerciseId !== exercise.id));
    } else {
      setSelectedExercises((prev) => [
        ...prev,
        { exerciseId: exercise.id, exerciseName: exercise.name },
      ]);
    }
  };

  const addRecommendation = (rec: ExerciseRecommendation) => {
    const exists = selectedExercises.find((e) => e.exerciseId === rec.exerciseId);
    if (!exists) {
      setSelectedExercises((prev) => [
        ...prev,
        { exerciseId: rec.exerciseId, exerciseName: rec.exerciseName },
      ]);
    }
  };

  const addAllRecommendations = () => {
    if (!recommendations) return;
    const newExercises = recommendations
      .filter((rec) => !selectedExercises.find((e) => e.exerciseId === rec.exerciseId))
      .map((rec) => ({ exerciseId: rec.exerciseId, exerciseName: rec.exerciseName }));
    setSelectedExercises((prev) => [...prev, ...newExercises]);
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId));
  };

  const handleStartSession = () => {
    if (selectedExercises.length === 0) return;
    createSessionMutation.mutate({
      focusArea: focusArea || undefined,
      exercises: selectedExercises,
    });
  };

  if (activeSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Focus Session</h1>
            <p className="text-sm text-muted-foreground">One-off workout</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Focus Area Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            What do you want to focus on?
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {FOCUS_AREAS.map((area) => {
              const Icon = area.icon;
              return (
                <button
                  key={area.id}
                  onClick={() => setFocusArea(area.id === focusArea ? "" : area.id)}
                  className={cn(
                    "p-4 rounded-lg border text-center transition-all min-h-[72px] flex flex-col items-center justify-center gap-1.5",
                    focusArea === area.id
                      ? "border-[#CDFF00] bg-[#CDFF00]/10 text-[#CDFF00]"
                      : "border-border bg-card hover:border-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{area.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        {focusArea && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#CDFF00]" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Recommended for you
                </span>
              </div>
              {recommendations && recommendations.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addAllRecommendations}
                  className="text-[#CDFF00] hover:text-[#CDFF00]/80"
                >
                  Add all
                </Button>
              )}
            </div>

            {recommendationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {recommendations.map((rec) => {
                  const isSelected = selectedExercises.some(
                    (e) => e.exerciseId === rec.exerciseId
                  );
                  return (
                    <button
                      key={rec.exerciseId}
                      onClick={() => addRecommendation(rec)}
                      disabled={isSelected}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        isSelected
                          ? "border-success/50 bg-success/10"
                          : "border-border bg-card hover:border-[#CDFF00]/50"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm line-clamp-1">
                            {rec.exerciseName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {rec.equipment}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-success flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : exercises && exercises.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add exercises to get personalized recommendations
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/exercises')}
                  className="text-[#CDFF00] border-[#CDFF00]/50"
                >
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Browse Exercises
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No matching exercises for this focus area. Try browsing all exercises below.
              </p>
            )}
          </div>
        )}

        {/* Selected Exercises */}
        {selectedExercises.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#CDFF00]" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Selected ({selectedExercises.length})
              </span>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {selectedExercises.map((ex, index) => (
                  <motion.div
                    key={ex.exerciseId}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                  >
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span className="flex-1 font-medium text-sm">{ex.exerciseName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeExercise(ex.exerciseId)}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Browse All Exercises */}
        <div className="space-y-3">
          <button
            onClick={() => setShowExercisePicker(!showExercisePicker)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Dumbbell className="w-4 h-4" />
            {showExercisePicker ? "Hide exercise browser" : "Browse all exercises"}
          </button>

          <AnimatePresence>
            {showExercisePicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Exercise list */}
                <div className="max-h-[300px] overflow-y-auto space-y-1 rounded-lg border border-border p-2">
                  {exercisesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredExercises && filteredExercises.length > 0 ? (
                    filteredExercises.map((exercise) => {
                      const isSelected = selectedExercises.some(
                        (e) => e.exerciseId === exercise.id
                      );
                      return (
                        <button
                          key={exercise.id}
                          onClick={() => toggleExercise(exercise)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                            isSelected
                              ? "bg-[#CDFF00]/10 border border-[#CDFF00]/50"
                              : "hover:bg-muted/50"
                          )}
                        >
                          <Checkbox checked={isSelected} className="pointer-events-none" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{exercise.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {exercise.muscleGroups.join(", ")} - {exercise.equipment}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No exercises found
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Start Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/80 backdrop-blur-lg border-t border-border">
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-[#CDFF00] text-[#0A0A0A] hover:bg-[#CDFF00]/90"
          onClick={handleStartSession}
          disabled={selectedExercises.length === 0 || createSessionMutation.isPending}
        >
          {createSessionMutation.isPending ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Zap className="w-5 h-5 mr-2" />
          )}
          Start Focus Session ({selectedExercises.length} exercises)
        </Button>
      </div>
    </div>
  );
}
