"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Plus,
  X,
  Search,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableExerciseItem } from "@/components/program/sortable-exercise-item";
import db from "@/lib/db";
import type {
  Exercise,
  Superset,
  SupersetExercise,
  WarmupExercise,
  FinisherExercise,
} from "@/lib/db";
import { cn } from "@/lib/utils";

interface ExerciseSelectorProps {
  exercises: Exercise[];
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
  excludeIds?: string[];
}

function ExerciseSelector({
  exercises,
  onSelect,
  onClose,
  excludeIds = [],
}: ExerciseSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredExercises = useMemo(() => {
    return exercises
      .filter((ex) => !excludeIds.includes(ex.id))
      .filter((ex) =>
        search ? ex.name.toLowerCase().includes(search.toLowerCase()) : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, search, excludeIds]);

  return (
    <DialogContent className="max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>Add Exercise</DialogTitle>
        <DialogDescription>
          Select an exercise to add to this section
        </DialogDescription>
      </DialogHeader>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[50vh]">
        {filteredExercises.map((ex) => (
          <Card
            key={ex.id}
            className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => {
              onSelect(ex.id);
              onClose();
            }}
          >
            <div className="font-medium text-foreground">{ex.name}</div>
            <div className="flex gap-1 mt-1 flex-wrap">
              {ex.muscleGroups.slice(0, 2).map((m) => (
                <Badge key={m} variant="secondary" className="text-xs capitalize">
                  {m.replace("-", " ")}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
        {filteredExercises.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No exercises found
          </p>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function DayEditorPage() {
  const router = useRouter();
  const params = useParams();
  const dayId = params.dayId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());

  // Form state
  const [dayName, setDayName] = useState("");
  const [warmup, setWarmup] = useState<WarmupExercise[]>([]);
  const [supersets, setSupersets] = useState<Superset[]>([]);
  const [finisher, setFinisher] = useState<FinisherExercise[]>([]);
  const [dayNumber, setDayNumber] = useState(1);

  // Dialog state
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [exerciseSelectorTarget, setExerciseSelectorTarget] = useState<{
    type: "warmup" | "superset" | "finisher";
    supersetIndex?: number;
  } | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag handlers
  const handleWarmupDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWarmup((items) => {
        const oldIndex = items.findIndex((_, i) => `warmup-${i}` === active.id);
        const newIndex = items.findIndex((_, i) => `warmup-${i}` === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handleFinisherDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFinisher((items) => {
        const oldIndex = items.findIndex((_, i) => `finisher-${i}` === active.id);
        const newIndex = items.findIndex((_, i) => `finisher-${i}` === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handleSupersetDragEnd = useCallback((supersetIndex: number) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSupersets((ss) => {
        const newSupersets = [...ss];
        const exercises = newSupersets[supersetIndex].exercises;
        const prefix = `superset-${supersetIndex}-`;
        const oldIndex = exercises.findIndex((_, i) => `${prefix}${i}` === active.id);
        const newIndex = exercises.findIndex((_, i) => `${prefix}${i}` === over.id);
        newSupersets[supersetIndex] = {
          ...newSupersets[supersetIndex],
          exercises: arrayMove(exercises, oldIndex, newIndex),
        };
        return newSupersets;
      });
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        // Load all exercises
        const allExercises = await db.exercises.toArray();
        const exerciseMap = new Map<string, Exercise>();
        allExercises.forEach((ex) => exerciseMap.set(ex.id, ex));
        setExercises(exerciseMap);

        // Load training day
        const day = await db.trainingDays.get(dayId);
        if (day) {
          setDayName(day.name);
          setWarmup(day.warmup || []);
          setSupersets(day.supersets);
          setFinisher(day.finisher || []);
          setDayNumber(day.dayNumber);
        } else {
          router.push("/program");
        }
      } catch (error) {
        console.error("Failed to load:", error);
        router.push("/program");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [dayId, router]);

  const handleSave = async () => {
    if (!dayName.trim()) return;

    setIsSaving(true);
    try {
      await db.trainingDays.update(dayId, {
        name: dayName.trim(),
        warmup,
        supersets,
        finisher,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/program");
      }, 500);
    } catch (error) {
      console.error("Failed to save:", error);
      setIsSaving(false);
    }
  };

  const handleAddExercise = (exerciseId: string) => {
    if (!exerciseSelectorTarget) return;

    if (exerciseSelectorTarget.type === "warmup") {
      setWarmup([...warmup, { exerciseId, reps: 10 }]);
    } else if (exerciseSelectorTarget.type === "finisher") {
      setFinisher([...finisher, { exerciseId, duration: 30 }]);
    } else if (
      exerciseSelectorTarget.type === "superset" &&
      exerciseSelectorTarget.supersetIndex !== undefined
    ) {
      const newSupersets = [...supersets];
      newSupersets[exerciseSelectorTarget.supersetIndex].exercises.push({
        exerciseId,
        sets: 4,
        reps: "10,10,8,8",
        tempo: "T:3010",
        restSeconds: 60,
      });
      setSupersets(newSupersets);
    }
  };

  const removeWarmupExercise = (index: number) => {
    setWarmup(warmup.filter((_, i) => i !== index));
  };

  const removeFinisherExercise = (index: number) => {
    setFinisher(finisher.filter((_, i) => i !== index));
  };

  const removeSupersetExercise = (
    supersetIndex: number,
    exerciseIndex: number
  ) => {
    const newSupersets = [...supersets];
    newSupersets[supersetIndex].exercises = newSupersets[
      supersetIndex
    ].exercises.filter((_, i) => i !== exerciseIndex);
    setSupersets(newSupersets);
  };

  const updateSupersetExercise = (
    supersetIndex: number,
    exerciseIndex: number,
    updates: Partial<SupersetExercise>
  ) => {
    const newSupersets = [...supersets];
    newSupersets[supersetIndex].exercises[exerciseIndex] = {
      ...newSupersets[supersetIndex].exercises[exerciseIndex],
      ...updates,
    };
    setSupersets(newSupersets);
  };

  const addSuperset = () => {
    // Generate next label (A, B, C, ... Z, AA, AB, ...)
    const labels = supersets.map((s) => s.label);
    let nextLabel = "A";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Find the next available label
    for (let i = 0; i < 26; i++) {
      const label = alphabet[i];
      if (!labels.includes(label)) {
        nextLabel = label;
        break;
      }
      if (i === 25) {
        // All single letters used, try double letters
        for (let j = 0; j < 26; j++) {
          const doubleLabel = "A" + alphabet[j];
          if (!labels.includes(doubleLabel)) {
            nextLabel = doubleLabel;
            break;
          }
        }
      }
    }

    const newSuperset: Superset = {
      id: crypto.randomUUID(),
      label: nextLabel,
      exercises: [],
    };

    setSupersets([...supersets, newSuperset]);
  };

  const removeSuperset = (index: number) => {
    setSupersets(supersets.filter((_, i) => i !== index));
  };

  const openExerciseSelector = (
    type: "warmup" | "superset" | "finisher",
    supersetIndex?: number
  ) => {
    setExerciseSelectorTarget({ type, supersetIndex });
    setShowExerciseSelector(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/program")}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Edit Day</h1>
            <p className="text-sm text-muted-foreground">Day {dayNumber}</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="p-4 space-y-6">
        {/* Day Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Day Name
          </label>
          <Input
            placeholder="e.g., Full Body A"
            value={dayName}
            onChange={(e) => setDayName(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Warmup Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Warmup
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openExerciseSelector("warmup")}
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {warmup.length === 0 ? (
            <Card className="bg-card/50 border-dashed border-border p-4 text-center">
              <p className="text-muted-foreground text-sm">No warmup exercises</p>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleWarmupDragEnd}
            >
              <SortableContext
                items={warmup.map((_, i) => `warmup-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {warmup.map((w, index) => {
                    const exercise = exercises.get(w.exerciseId);
                    return (
                      <Card
                        key={`warmup-${index}`}
                        className="bg-card border-border p-3"
                      >
                        <SortableExerciseItem id={`warmup-${index}`}>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {exercise?.name || w.exerciseId}
                              </p>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {w.reps} reps
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeWarmupExercise(index)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </SortableExerciseItem>
                      </Card>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Supersets */}
        {supersets.map((superset, ssIndex) => (
          <div key={superset.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Superset {superset.label}
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openExerciseSelector("superset", ssIndex)}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSuperset(ssIndex)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {superset.exercises.length === 0 ? (
              <Card className="bg-card/50 border-dashed border-border p-4 text-center">
                <p className="text-muted-foreground text-sm">No exercises</p>
              </Card>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSupersetDragEnd(ssIndex)}
              >
                <SortableContext
                  items={superset.exercises.map((_, i) => `superset-${ssIndex}-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {superset.exercises.map((ssEx, exIndex) => {
                      const exercise = exercises.get(ssEx.exerciseId);
                      return (
                        <Card
                          key={`${superset.id}-${exIndex}`}
                          className="bg-card border-border p-4"
                        >
                          <SortableExerciseItem id={`superset-${ssIndex}-${exIndex}`}>
                            <div className="flex items-start gap-3">
                              <Badge
                                variant="default"
                                className="bg-primary text-primary-foreground font-bold shrink-0"
                              >
                                {superset.label}
                                {exIndex + 1}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {exercise?.name || ssEx.exerciseId}
                                </p>

                                {/* Editable fields */}
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                  <div>
                                    <label className="text-xs text-muted-foreground">
                                      Sets
                                    </label>
                                    <Input
                                      type="number"
                                      value={ssEx.sets}
                                      onChange={(e) =>
                                        updateSupersetExercise(ssIndex, exIndex, {
                                          sets: parseInt(e.target.value) || 0,
                                        })
                                      }
                                      className="h-9 mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">
                                      Reps
                                    </label>
                                    <Input
                                      value={ssEx.reps}
                                      onChange={(e) =>
                                        updateSupersetExercise(ssIndex, exIndex, {
                                          reps: e.target.value,
                                        })
                                      }
                                      placeholder="10,10,8,8"
                                      className="h-9 mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">
                                      Tempo
                                    </label>
                                    <Input
                                      value={ssEx.tempo}
                                      onChange={(e) =>
                                        updateSupersetExercise(ssIndex, exIndex, {
                                          tempo: e.target.value,
                                        })
                                      }
                                      placeholder="T:3010"
                                      className="h-9 mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">
                                      Rest (s)
                                    </label>
                                    <Input
                                      type="number"
                                      value={ssEx.restSeconds}
                                      onChange={(e) =>
                                        updateSupersetExercise(ssIndex, exIndex, {
                                          restSeconds: parseInt(e.target.value) || 0,
                                        })
                                      }
                                      className="h-9 mt-1"
                                    />
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeSupersetExercise(ssIndex, exIndex)
                                }
                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </SortableExerciseItem>
                        </Card>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        ))}

        {/* Add Superset Button */}
        <Button
          variant="outline"
          className="w-full h-12 border-dashed border-2 text-muted-foreground hover:text-foreground hover:border-primary"
          onClick={addSuperset}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Superset
        </Button>

        {/* Finisher Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Finisher
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openExerciseSelector("finisher")}
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {finisher.length === 0 ? (
            <Card className="bg-card/50 border-dashed border-border p-4 text-center">
              <p className="text-muted-foreground text-sm">No finisher exercises</p>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleFinisherDragEnd}
            >
              <SortableContext
                items={finisher.map((_, i) => `finisher-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {finisher.map((f, index) => {
                    const exercise = exercises.get(f.exerciseId);
                    return (
                      <Card
                        key={`finisher-${index}`}
                        className="bg-card border-border p-3"
                      >
                        <SortableExerciseItem id={`finisher-${index}`}>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {exercise?.name || f.exerciseId}
                              </p>
                              {f.notes && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {f.notes}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {f.duration}s
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFinisherExercise(index)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </SortableExerciseItem>
                      </Card>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/80 backdrop-blur-lg border-t border-border">
        <Button
          size="lg"
          className={cn(
            "w-full h-14 text-lg font-semibold transition-all",
            saveSuccess
              ? "bg-green-600 hover:bg-green-600"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={handleSave}
          disabled={!dayName.trim() || isSaving || saveSuccess}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : saveSuccess ? (
            "Saved!"
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Exercise Selector Dialog */}
      <Dialog
        open={showExerciseSelector}
        onOpenChange={setShowExerciseSelector}
      >
        <ExerciseSelector
          exercises={Array.from(exercises.values())}
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      </Dialog>
    </div>
  );
}
