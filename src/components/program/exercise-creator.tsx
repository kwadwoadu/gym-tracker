"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import db from "@/lib/db";

const MUSCLE_GROUPS = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "lats", label: "Lats" },
  { value: "upper-back", label: "Upper Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "rear-delts", label: "Rear Delts" },
  { value: "biceps", label: "Biceps" },
  { value: "triceps", label: "Triceps" },
  { value: "forearms", label: "Forearms" },
  { value: "abs", label: "Abs" },
  { value: "obliques", label: "Obliques" },
  { value: "core", label: "Core" },
  { value: "quads", label: "Quads" },
  { value: "hamstrings", label: "Hamstrings" },
  { value: "glutes", label: "Glutes" },
  { value: "calves", label: "Calves" },
  { value: "hip-flexors", label: "Hip Flexors" },
  { value: "hips", label: "Hips" },
  { value: "tibialis", label: "Tibialis" },
  { value: "grip", label: "Grip" },
  { value: "spine", label: "Spine" },
  { value: "thoracic", label: "Thoracic" },
];

const EQUIPMENT = [
  { value: "barbell", label: "Barbell" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "cable", label: "Cable" },
  { value: "machine", label: "Machine" },
  { value: "bodyweight", label: "Bodyweight" },
  { value: "band", label: "Resistance Band" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "pull-up-bar", label: "Pull-up Bar" },
  { value: "dip-station", label: "Dip Station" },
  { value: "bench", label: "Bench" },
  { value: "plate", label: "Weight Plate" },
  { value: "ab-wheel", label: "Ab Wheel" },
  { value: "leg-press", label: "Leg Press" },
  { value: "other", label: "Other" },
];

interface ExerciseCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (exerciseId: string) => void;
}

export function ExerciseCreator({
  open,
  onOpenChange,
  onCreated,
}: ExerciseCreatorProps) {
  const [name, setName] = useState("");
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipment, setEquipment] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setMuscleGroups([]);
    setEquipment("");
    setVideoUrl("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const toggleMuscleGroup = (group: string) => {
    if (muscleGroups.includes(group)) {
      setMuscleGroups(muscleGroups.filter((g) => g !== group));
    } else {
      setMuscleGroups([...muscleGroups, group]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Exercise name is required");
      return;
    }
    if (muscleGroups.length === 0) {
      setError("Select at least one muscle group");
      return;
    }
    if (!equipment) {
      setError("Select equipment type");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const exerciseId = `ex-custom-${Date.now()}`;
      await db.exercises.add({
        id: exerciseId,
        name: name.trim(),
        muscleGroups,
        equipment,
        videoUrl: videoUrl.trim() || undefined,
        isCustom: true,
        createdAt: new Date().toISOString(),
      });

      onCreated(exerciseId);
      handleClose();
    } catch (err) {
      console.error("Failed to create exercise:", err);
      setError("Failed to create exercise");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Exercise</DialogTitle>
          <DialogDescription>
            Add a new exercise to your library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Exercise Name */}
          <div className="space-y-2">
            <Label htmlFor="exercise-name">Exercise Name *</Label>
            <Input
              id="exercise-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bulgarian Split Squat"
              className="h-12"
            />
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <Label>Equipment *</Label>
            <Select value={equipment} onValueChange={setEquipment}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select equipment type" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT.map((eq) => (
                  <SelectItem key={eq.value} value={eq.value}>
                    {eq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Muscle Groups */}
          <div className="space-y-2">
            <Label>Muscle Groups * (select all that apply)</Label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((muscle) => (
                <Badge
                  key={muscle.value}
                  variant={
                    muscleGroups.includes(muscle.value) ? "default" : "outline"
                  }
                  className="cursor-pointer transition-all px-3 py-1.5"
                  onClick={() => toggleMuscleGroup(muscle.value)}
                >
                  {muscle.label}
                  {muscleGroups.includes(muscle.value) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="video-url">Video URL (optional)</Label>
            <Input
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              Link to a demonstration video
            </p>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Exercise"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
