/**
 * Template utilities for SetFlow
 *
 * Handles serialization of user programs into shareable templates,
 * import of community templates into user programs, and JSON export/import.
 */

import type {
  WorkoutTemplate,
  SerializedProgram,
  SerializedTrainingDay,
  SerializedSuperset,
  SerializedExercise,
  SplitType,
  Difficulty,
} from "@/types/templates";
import type { Program, TrainingDay, Superset, SupersetExercise } from "@/lib/api-client";

// ============================================================
// Program -> Template Serialization
// ============================================================

interface ProgramWithDays extends Program {
  trainingDays?: TrainingDay[];
}

/**
 * Serialize a user's program into a template-ready format.
 * Resolves exercise IDs to names using the provided exercise map.
 */
export function serializeProgram(
  program: ProgramWithDays,
  exerciseNameMap: Map<string, string>
): SerializedProgram {
  const days: SerializedTrainingDay[] = (program.trainingDays || []).map((day) => ({
    name: day.name,
    warmup: (day.warmup || []).map((w) => ({
      exerciseId: w.exerciseId,
      exerciseName: exerciseNameMap.get(w.exerciseId) || "Unknown Exercise",
      sets: 1,
      reps: w.reps ? String(w.reps) : w.duration ? `${w.duration}s` : "1",
    })),
    supersets: (day.supersets || []).map((ss: Superset): SerializedSuperset => ({
      label: ss.label,
      exercises: ss.exercises.map((ex: SupersetExercise): SerializedExercise => ({
        exerciseId: ex.exerciseId,
        exerciseName: exerciseNameMap.get(ex.exerciseId) || "Unknown Exercise",
        sets: ex.sets,
        reps: ex.reps,
        tempo: ex.tempo,
        restSeconds: ex.restSeconds,
      })),
    })),
    finisher: (day.finisher || []).map((f) => ({
      exerciseId: f.exerciseId,
      exerciseName: exerciseNameMap.get(f.exerciseId) || "Unknown Exercise",
      sets: 1,
      reps: f.reps ? String(f.reps) : f.duration ? `${f.duration}s` : "1",
    })),
  }));

  return {
    name: program.name,
    days,
  };
}

/**
 * Count total exercises across all days of a serialized program.
 */
export function countExercises(programData: SerializedProgram): number {
  let count = 0;
  for (const day of programData.days) {
    count += day.warmup.length;
    for (const ss of day.supersets) {
      count += ss.exercises.length;
    }
    count += day.finisher.length;
  }
  return count;
}

/**
 * Estimate average session duration in minutes based on exercise/set count.
 * Rough heuristic: 3 min per set (including rest).
 */
export function estimateDuration(programData: SerializedProgram): number {
  if (programData.days.length === 0) return 0;

  let totalSets = 0;
  for (const day of programData.days) {
    for (const ss of day.supersets) {
      for (const ex of ss.exercises) {
        totalSets += ex.sets;
      }
    }
    // Warmup and finisher add ~5 minutes each if present
    totalSets += day.warmup.length > 0 ? 2 : 0;
    totalSets += day.finisher.length > 0 ? 2 : 0;
  }

  const avgSetsPerDay = totalSets / programData.days.length;
  return Math.round(avgSetsPerDay * 3);
}

/**
 * Auto-detect split type from training day names.
 */
export function detectSplitType(programData: SerializedProgram): SplitType {
  const names = programData.days.map((d) => d.name.toLowerCase());
  const joined = names.join(" ");

  if (joined.includes("push") && joined.includes("pull") && joined.includes("leg")) {
    return "ppl";
  }
  if (joined.includes("upper") && joined.includes("lower")) {
    return "upper_lower";
  }
  if (names.some((n) => n.includes("full body"))) {
    return "full_body";
  }
  if (
    joined.includes("chest") ||
    joined.includes("back") ||
    joined.includes("shoulder") ||
    joined.includes("arm") ||
    joined.includes("leg")
  ) {
    return "bro_split";
  }
  return "other";
}

// ============================================================
// Template Publishing
// ============================================================

export interface PublishTemplatePayload {
  programName: string;
  authorName: string;
  description: string;
  difficulty: Difficulty;
  splitType: SplitType;
  dayCount: number;
  estimatedDuration: number;
  programData: SerializedProgram;
}

/**
 * Publish a template to the community API.
 */
export async function publishTemplate(payload: PublishTemplatePayload): Promise<WorkoutTemplate> {
  const res = await fetch("/api/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to publish" }));
    throw new Error(err.error || "Failed to publish template");
  }

  return res.json();
}

// ============================================================
// Template Import
// ============================================================

/**
 * Import a community template into the user's programs via the API.
 * 1. Calls /api/templates/:id/import to get programData and increment counter
 * 2. Creates a new program via /api/programs with the template data
 */
export async function importTemplate(
  template: WorkoutTemplate
): Promise<{ programId: string }> {
  // Step 1: Fetch and increment import counter
  const importRes = await fetch(`/api/templates/${template.id}/import`, {
    method: "POST",
  });
  if (!importRes.ok) {
    throw new Error("Failed to import template");
  }
  const { programData } = await importRes.json();

  // Step 2: Create program from template data
  const days = (programData as SerializedProgram).days;
  const trainingDays = days.map((day: SerializedTrainingDay, index: number) => ({
    name: day.name,
    dayNumber: index + 1,
    warmup: day.warmup.map((w: SerializedExercise) => ({
      exerciseId: w.exerciseId,
      reps: parseInt(w.reps) || undefined,
    })),
    supersets: day.supersets.map((ss: SerializedSuperset) => ({
      id: crypto.randomUUID(),
      label: ss.label,
      exercises: ss.exercises.map((ex: SerializedExercise) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        tempo: ex.tempo || "",
        restSeconds: ex.restSeconds || 90,
      })),
    })),
    finisher: day.finisher.map((f: SerializedExercise) => ({
      exerciseId: f.exerciseId,
      reps: parseInt(f.reps) || undefined,
    })),
  }));

  const programRes = await fetch("/api/programs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: template.programName,
      description: `Imported from community - by @${template.authorName}`,
      isActive: false,
      trainingDays,
    }),
  });

  if (!programRes.ok) {
    throw new Error("Failed to create program from template");
  }

  const program = await programRes.json();
  return { programId: program.id };
}

// ============================================================
// JSON Export/Import (offline-friendly)
// ============================================================

/**
 * Export a template to a JSON string for file sharing.
 */
export function exportTemplateToJson(template: WorkoutTemplate): string {
  const exportData = {
    version: 1,
    type: "setflow-template",
    exported: new Date().toISOString(),
    template: {
      programName: template.programName,
      description: template.description,
      difficulty: template.difficulty,
      splitType: template.splitType,
      dayCount: template.dayCount,
      estimatedDuration: template.estimatedDuration,
      programData: template.programData,
    },
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Parse a JSON string into template data for import.
 * Returns null if the JSON is invalid or not a SetFlow template.
 */
export function parseTemplateFromJson(
  json: string
): Omit<PublishTemplatePayload, "authorName"> | null {
  try {
    const data = JSON.parse(json);
    if (data.type !== "setflow-template" || !data.template) {
      return null;
    }

    const t = data.template;
    if (!t.programName || !t.programData || !t.difficulty || !t.splitType) {
      return null;
    }

    return {
      programName: t.programName,
      description: t.description || "",
      difficulty: t.difficulty,
      splitType: t.splitType,
      dayCount: t.dayCount || t.programData.days?.length || 0,
      estimatedDuration: t.estimatedDuration || 0,
      programData: t.programData,
    };
  } catch {
    return null;
  }
}
