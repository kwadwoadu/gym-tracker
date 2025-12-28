"use client";

import { useEffect, useState } from "react";
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
import { ArrowLeft, Trash2, Save, Loader2, X, Plus } from "lucide-react";
import db from "@/lib/db";
import type { Exercise } from "@/lib/db";
import { generateId } from "@/lib/db";
import { cn } from "@/lib/utils";

const EQUIPMENT_OPTIONS = [
  "barbell",
  "dumbbells",
  "cable",
  "machine",
  "bodyweight",
  "bench",
  "band",
  "plate",
  "leg-press",
  "dip-station",
  "pull-up-bar",
  "kettlebell",
];

const COMMON_MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "abs",
  "core",
  "lats",
  "rear-delts",
  "upper-back",
  "tibialis",
  "grip",
  "hips",
  "spine",
];

export default function ExerciseEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipment, setEquipment] = useState("dumbbells");
  const [customMuscle, setCustomMuscle] = useState("");

  useEffect(() => {
    async function loadExercise() {
      if (isNew) return;

      try {
        const exercise = await db.exercises.get(id);
        if (exercise) {
          setName(exercise.name);
          setVideoUrl(exercise.videoUrl || "");
          setMuscleGroups(exercise.muscleGroups);
          setEquipment(exercise.equipment);
        } else {
          // Exercise not found, redirect to list
          router.push("/exercises");
        }
      } catch (error) {
        console.error("Failed to load exercise:", error);
        router.push("/exercises");
      } finally {
        setIsLoading(false);
      }
    }

    loadExercise();
  }, [id, isNew, router]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const exerciseData = {
        name: name.trim(),
        videoUrl: videoUrl.trim() || undefined,
        muscleGroups,
        equipment,
        isCustom: true,
      };

      if (isNew) {
        const newId = generateId();
        await db.exercises.add({
          ...exerciseData,
          id: newId,
          createdAt: new Date().toISOString(),
        });
      } else {
        await db.exercises.update(id, exerciseData);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/exercises");
      }, 500);
    } catch (error) {
      console.error("Failed to save exercise:", error);
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await db.exercises.delete(id);
      router.push("/exercises");
    } catch (error) {
      console.error("Failed to delete exercise:", error);
    }
  };

  const toggleMuscleGroup = (muscle: string) => {
    setMuscleGroups((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const addCustomMuscle = () => {
    const muscle = customMuscle.trim().toLowerCase().replace(/\s+/g, "-");
    if (muscle && !muscleGroups.includes(muscle)) {
      setMuscleGroups((prev) => [...prev, muscle]);
      setCustomMuscle("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading exercise...</p>
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
            onClick={() => router.push("/exercises")}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {isNew ? "New Exercise" : "Edit Exercise"}
            </h1>
          </div>
          {!isNew && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="h-10 w-10 text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Form */}
      <div className="p-4 space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Exercise Name *
          </label>
          <Input
            placeholder="e.g., Bench Press"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Video URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Video URL (optional)
          </label>
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="h-12"
            type="url"
          />
          <p className="text-xs text-muted-foreground">
            YouTube links will show thumbnails in the app
          </p>
        </div>

        {/* Muscle Groups */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Muscle Groups
          </label>

          {/* Selected muscles */}
          {muscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map((muscle) => (
                <Badge
                  key={muscle}
                  variant="default"
                  className="capitalize cursor-pointer pr-1 h-8"
                  onClick={() => toggleMuscleGroup(muscle)}
                >
                  {muscle.replace("-", " ")}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          {/* Common muscle groups */}
          <div className="flex flex-wrap gap-2">
            {COMMON_MUSCLE_GROUPS.filter((m) => !muscleGroups.includes(m)).map(
              (muscle) => (
                <Badge
                  key={muscle}
                  variant="outline"
                  className="capitalize cursor-pointer h-8"
                  onClick={() => toggleMuscleGroup(muscle)}
                >
                  {muscle.replace("-", " ")}
                </Badge>
              )
            )}
          </div>

          {/* Custom muscle input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom muscle group"
              value={customMuscle}
              onChange={(e) => setCustomMuscle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomMuscle()}
              className="h-10 flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={addCustomMuscle}
              className="h-10 w-10 shrink-0"
              disabled={!customMuscle.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Equipment */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Equipment
          </label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <Badge
                key={eq}
                variant={equipment === eq ? "default" : "outline"}
                className="capitalize cursor-pointer h-8"
                onClick={() => setEquipment(eq)}
              >
                {eq.replace("-", " ")}
              </Badge>
            ))}
          </div>
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
          disabled={!name.trim() || isSaving || saveSuccess}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : saveSuccess ? (
            "Saved!"
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Exercise
            </>
          )}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
