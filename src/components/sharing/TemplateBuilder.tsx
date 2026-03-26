"use client";

import { useState, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Loader2,
  Upload,
  CheckCircle,
  ChevronDown,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { programsApi, exercisesApi } from "@/lib/api-client";
import type { Program, Exercise } from "@/lib/api-client";
import type { SplitType, Difficulty, SerializedProgram } from "@/types/templates";
import { SPLIT_LABELS, DIFFICULTY_LABELS } from "@/types/templates";
import {
  serializeProgram,
  countExercises,
  estimateDuration,
  detectSplitType,
  publishTemplate,
} from "@/lib/templates";

// ============================================================
// Constants
// ============================================================

const SPLIT_OPTIONS: { value: SplitType; label: string }[] = [
  { value: "ppl", label: SPLIT_LABELS.ppl },
  { value: "upper_lower", label: SPLIT_LABELS.upper_lower },
  { value: "full_body", label: SPLIT_LABELS.full_body },
  { value: "bro_split", label: SPLIT_LABELS.bro_split },
  { value: "other", label: SPLIT_LABELS.other },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "beginner", label: DIFFICULTY_LABELS.beginner },
  { value: "intermediate", label: DIFFICULTY_LABELS.intermediate },
  { value: "advanced", label: DIFFICULTY_LABELS.advanced },
];

// ============================================================
// Types
// ============================================================

interface TemplateBuilderProps {
  open: boolean;
  onClose: () => void;
  /** Optional pre-selected program ID */
  programId?: string;
}

type BuilderStep = "select" | "configure" | "preview" | "success";

// ============================================================
// Component
// ============================================================

export function TemplateBuilder({ open, onClose, programId }: TemplateBuilderProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Step state
  const [step, setStep] = useState<BuilderStep>(programId ? "configure" : "select");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(programId || null);

  // Form state
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [splitType, setSplitType] = useState<SplitType>("other");
  const [customName, setCustomName] = useState("");

  // Fetch programs
  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: () => programsApi.list(),
    enabled: open,
  });

  // Fetch exercises for name resolution
  const { data: exercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: exercisesApi.list,
    enabled: open,
  });

  // Build exercise name map
  const exerciseNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (exercises) {
      exercises.forEach((ex: Exercise) => map.set(ex.id, ex.name));
    }
    return map;
  }, [exercises]);

  // Get selected program
  const selectedProgram = useMemo(() => {
    if (!selectedProgramId || !programs) return null;
    return programs.find((p: Program) => p.id === selectedProgramId) || null;
  }, [selectedProgramId, programs]);

  // Serialize program data
  const serializedData = useMemo((): SerializedProgram | null => {
    if (!selectedProgram) return null;
    return serializeProgram(selectedProgram, exerciseNameMap);
  }, [selectedProgram, exerciseNameMap]);

  // Auto-detect split type when program changes
  const handleProgramSelect = useCallback(
    (program: Program) => {
      setSelectedProgramId(program.id);
      setCustomName(program.name);
      // Auto-detect after a brief delay to allow serialization
      const serialized = serializeProgram(program, exerciseNameMap);
      setSplitType(detectSplitType(serialized));
      setStep("configure");
    },
    [exerciseNameMap]
  );

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!serializedData || !selectedProgram) throw new Error("No program selected");

      const authorName =
        user?.username ||
        user?.firstName ||
        user?.emailAddresses[0]?.emailAddress?.split("@")[0] ||
        "Anonymous";

      return publishTemplate({
        programName: customName || selectedProgram.name,
        authorName,
        description,
        difficulty,
        splitType,
        dayCount: serializedData.days.length,
        estimatedDuration: estimateDuration(serializedData),
        programData: serializedData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setStep("success");
    },
  });

  // Reset when drawer closes
  const handleClose = () => {
    setStep(programId ? "configure" : "select");
    setSelectedProgramId(programId || null);
    setDescription("");
    setDifficulty("intermediate");
    setSplitType("other");
    setCustomName("");
    publishMutation.reset();
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent className="bg-background border-border max-h-[90vh]">
        <div className="overflow-y-auto px-4 pb-8">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-white text-left">
              {step === "select" && "Share as Template"}
              {step === "configure" && "Configure Template"}
              {step === "preview" && "Preview Template"}
              {step === "success" && "Template Published!"}
            </DrawerTitle>
          </DrawerHeader>

          {/* Step 1: Select Program */}
          {step === "select" && (
            <div className="space-y-3">
              <p className="text-sm text-white/50">
                Choose a program to share with the community.
              </p>

              {programsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !programs || programs.length === 0 ? (
                <div className="text-center py-12">
                  <Dumbbell className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">No programs to share</p>
                  <p className="text-xs text-white/30 mt-1">
                    Create a program first, then come back to share it.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {programs
                    .filter((p: Program) => !p.archivedAt)
                    .map((program: Program) => (
                      <button
                        key={program.id}
                        onClick={() => handleProgramSelect(program)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border transition-colors",
                          "active:scale-[0.98]",
                          selectedProgramId === program.id
                            ? "border-primary bg-primary/5"
                            : "border-white/10 bg-card"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">
                              {program.name}
                            </p>
                            <p className="text-xs text-white/40 mt-0.5">
                              {program.trainingDays?.length || 0} days
                              {program.isActive && (
                                <span className="ml-2 text-primary">Active</span>
                              )}
                            </p>
                          </div>
                          <ChevronDown className="w-4 h-4 text-white/30 -rotate-90" />
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configure Template */}
          {step === "configure" && selectedProgram && serializedData && (
            <div className="space-y-5">
              {/* Program name (editable) */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-[0.08em] font-semibold mb-1.5 block">
                  Template Name
                </label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={selectedProgram.name}
                  className="bg-secondary border-border"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-[0.08em] font-semibold mb-1.5 block">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your program - who is it for, what are the goals?"
                  className="bg-secondary border-border min-h-[80px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-white/30 mt-1 text-right">
                  {description.length}/500
                </p>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-[0.08em] font-semibold mb-1.5 block">
                  Difficulty
                </label>
                <div className="flex gap-2">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDifficulty(opt.value)}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        difficulty === opt.value
                          ? "bg-primary text-black"
                          : "bg-card text-white/50 border border-white/10"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Type */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-[0.08em] font-semibold mb-1.5 block">
                  Split Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPLIT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSplitType(opt.value)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        splitType === opt.value
                          ? "bg-primary text-black"
                          : "bg-card text-white/50 border border-white/10"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats summary */}
              <div className="bg-card rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Days per week</span>
                  <span className="text-white font-medium">
                    {serializedData.days.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Total exercises</span>
                  <span className="text-white font-medium">
                    {countExercises(serializedData)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Est. session duration</span>
                  <span className="text-white font-medium">
                    ~{estimateDuration(serializedData)} min
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 border-white/20 text-white"
                  onClick={() => setStep("select")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 h-12 bg-primary text-black font-semibold hover:bg-primary/90"
                  onClick={() => setStep("preview")}
                >
                  Preview
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === "preview" && serializedData && selectedProgram && (
            <div className="space-y-4">
              {/* Template header preview */}
              <div className="bg-card rounded-xl p-4">
                <h3 className="font-semibold text-white">
                  {customName || selectedProgram.name}
                </h3>
                <p className="text-sm text-white/50 mt-0.5">
                  by @
                  {user?.username ||
                    user?.firstName ||
                    user?.emailAddresses[0]?.emailAddress?.split("@")[0] ||
                    "you"}
                </p>
                {description && (
                  <p className="text-sm text-white/60 mt-2">{description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs bg-secondary text-white/60 px-2 py-0.5 rounded-full">
                    {serializedData.days.length} days
                  </span>
                  <span className="text-xs bg-secondary text-white/60 px-2 py-0.5 rounded-full">
                    {DIFFICULTY_LABELS[difficulty]}
                  </span>
                  <span className="text-xs bg-secondary text-white/60 px-2 py-0.5 rounded-full">
                    {SPLIT_LABELS[splitType]}
                  </span>
                </div>
              </div>

              {/* Days preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white/50 uppercase tracking-[0.08em]">
                  Program Days
                </h4>
                {serializedData.days.map((day, i) => (
                  <div key={i} className="bg-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{day.name}</span>
                      <span className="text-xs text-white/40">
                        {day.supersets.reduce(
                          (acc, s) => acc + s.exercises.length,
                          0
                        )}{" "}
                        exercises
                      </span>
                    </div>
                    <div className="space-y-1">
                      {day.supersets.map((ss, si) => (
                        <div key={si}>
                          {ss.exercises.map((ex, ei) => (
                            <div
                              key={ei}
                              className="flex items-center justify-between py-0.5"
                            >
                              <span className="text-sm text-white/70">
                                <span className="text-primary text-xs font-medium mr-1.5">
                                  {ss.label}
                                  {ei + 1}
                                </span>
                                {ex.exerciseName}
                              </span>
                              <span className="text-xs text-white/40">
                                {ex.sets}x{ex.reps}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Publish / Back */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12 border-white/20 text-white"
                  onClick={() => setStep("configure")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 h-14 bg-primary text-black text-base font-semibold hover:bg-primary/90"
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                >
                  {publishMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Publish to Community
                    </>
                  )}
                </Button>
              </div>

              {publishMutation.isError && (
                <p className="text-sm text-red-400 text-center">
                  {publishMutation.error?.message || "Failed to publish. Try again."}
                </p>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Template Published!
                </h3>
                <p className="text-sm text-white/50 mt-2">
                  Your program is now available in the community library for others
                  to discover and import.
                </p>
              </div>
              <Button
                className="w-full h-12 bg-primary text-black font-semibold hover:bg-primary/90"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
