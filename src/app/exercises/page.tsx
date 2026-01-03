"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, Dumbbell, Loader2 } from "lucide-react";
import { useExercises } from "@/lib/queries";
import { cn } from "@/lib/utils";

export default function ExercisesPage() {
  const router = useRouter();
  const { data: exercises = [], isLoading } = useExercises();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Sort exercises alphabetically
  const sortedExercises = useMemo(() => {
    return [...exercises].sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises]);

  // Get all unique muscle groups
  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    sortedExercises.forEach((ex) => {
      ex.muscleGroups.forEach((mg) => groups.add(mg));
    });
    return Array.from(groups).sort();
  }, [sortedExercises]);

  // Filter exercises based on search and muscle group
  const filteredExercises = useMemo(() => {
    return sortedExercises.filter((ex) => {
      const matchesSearch = searchQuery
        ? ex.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesMuscle = selectedMuscle
        ? ex.muscleGroups.includes(selectedMuscle)
        : true;
      return matchesSearch && matchesMuscle;
    });
  }, [sortedExercises, searchQuery, selectedMuscle]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Exercises</h1>
            <p className="text-sm text-muted-foreground">
              {filteredExercises.length} exercises
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11"
          />
        </div>

        {/* Muscle Group Filter */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <Button
            variant={selectedMuscle === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedMuscle(null)}
            className="shrink-0 h-8"
          >
            All
          </Button>
          {muscleGroups.map((muscle) => (
            <Button
              key={muscle}
              variant={selectedMuscle === muscle ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSelectedMuscle(selectedMuscle === muscle ? null : muscle)
              }
              className="shrink-0 h-8 capitalize"
            >
              {muscle.replace("-", " ")}
            </Button>
          ))}
        </div>
      </header>

      {/* Exercise List */}
      <div className="p-4 space-y-3">
        {filteredExercises.map((exercise) => (
          <Card
            key={exercise.id}
            className={cn(
              "bg-card border-border p-4 cursor-pointer transition-all",
              "active:scale-[0.98] touch-target"
            )}
            onClick={() => router.push(`/exercises/${exercise.id}`)}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {exercise.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {exercise.muscleGroups.slice(0, 3).map((muscle) => (
                    <Badge
                      key={muscle}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {muscle.replace("-", " ")}
                    </Badge>
                  ))}
                  {exercise.muscleGroups.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{exercise.muscleGroups.length - 3}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 capitalize">
                  {exercise.equipment.replace("-", " ")}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No exercises found</p>
            {(searchQuery || selectedMuscle) && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMuscle(null);
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Fixed Add Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/80 backdrop-blur-lg border-t border-border">
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => router.push("/exercises/new")}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Exercise
        </Button>
      </div>
    </div>
  );
}
