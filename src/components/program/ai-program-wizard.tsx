"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, RefreshCw, Check, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GenerationLoading } from "./generation-loading";
import { ProgramPreviewCard } from "./program-preview-card";
import { useExercises, useOnboardingProfile } from "@/lib/queries";
import { programsApi } from "@/lib/api-client";
import type { GeneratedProgram } from "@/lib/ai/validators/program-validator";

type WizardStep = "profile" | "generating" | "preview" | "error";

interface AIProgramWizardProps {
  onClose: () => void;
  onProgramCreated: () => void;
}

const FOCUS_OPTIONS = ["Balanced", "Upper body", "Lower body", "Push/Pull", "Strength", "Hypertrophy"];
const DURATION_OPTIONS = [4, 6, 8, 12];
const SESSION_OPTIONS = [45, 60, 75, 90];

export function AIProgramWizard({ onClose, onProgramCreated }: AIProgramWizardProps) {
  const [step, setStep] = useState<WizardStep>("profile");
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedProgram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Preferences
  const [focusArea, setFocusArea] = useState("Balanced");
  const [mesocycleWeeks, setMesocycleWeeks] = useState(8);
  const [sessionMinutes, setSessionMinutes] = useState(60);

  const { data: exercises = [] } = useExercises();
  const { data: profile } = useOnboardingProfile();

  const handleGenerate = useCallback(async () => {
    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            sessionMinutes,
            focusArea: focusArea === "Balanced" ? undefined : focusArea,
            mesocycleWeeks,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      setGeneratedProgram(data.program);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  }, [sessionMinutes, focusArea, mesocycleWeeks]);

  const handleSaveProgram = useCallback(async () => {
    if (!generatedProgram) return;
    setIsSaving(true);

    try {
      // Create the program via API
      await programsApi.create({
        name: generatedProgram.name,
        description: generatedProgram.description,
        isActive: true,
        trainingDays: generatedProgram.days.map((day, idx) => ({
          name: day.name,
          dayNumber: idx + 1,
          warmup: (day.warmup || []).map((e) => ({
            exerciseId: e.exerciseId,
            reps: parseInt(e.reps) || 10,
            notes: e.notes,
          })),
          supersets: day.supersets.map((s, sIdx) => ({
            id: `ai-ss-${idx}-${sIdx}`,
            label: s.label,
            exercises: s.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              sets: e.sets,
              reps: e.reps,
              tempo: e.tempo,
              restSeconds: e.restSeconds,
            })),
          })),
          finisher: (day.finisher || []).map((e) => ({
            exerciseId: e.exerciseId,
            reps: parseInt(e.reps) || 10,
            notes: e.notes,
          })),
        })),
      } as Parameters<typeof programsApi.create>[0]);

      onProgramCreated();
    } catch (err) {
      console.error("Failed to save program:", err);
      setError("Failed to save program. Please try again.");
      setStep("error");
    } finally {
      setIsSaving(false);
    }
  }, [generatedProgram, onProgramCreated]);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">AI Program Generator</h1>
          </div>
        </div>
      </header>

      <div className="p-4 pb-safe-bottom">
        <AnimatePresence mode="wait">
          {/* Step 1: Profile Review */}
          {step === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Profile summary */}
              <Card className="bg-card border-border p-4 space-y-3">
                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
                  Your Profile
                </h2>
                {profile ? (
                  <div className="space-y-2">
                    <ProfileRow label="Goals" value={profile.goals?.join(", ") || "Not set"} />
                    <ProfileRow label="Level" value={profile.experienceLevel || "Not set"} />
                    <ProfileRow label="Equipment" value={profile.equipment || "Not set"} />
                    <ProfileRow
                      label="Schedule"
                      value={
                        profile.trainingDaysPerWeek
                          ? `${profile.trainingDaysPerWeek} days/week`
                          : "Not set"
                      }
                    />
                    <ProfileRow
                      label="Injuries"
                      value={profile.injuries?.length ? profile.injuries.join(", ") : "None"}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-white/50">
                    Complete onboarding to personalize your program.
                  </p>
                )}
              </Card>

              {/* Preferences */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
                  Preferences
                </h2>

                {/* Focus area */}
                <div>
                  <label className="text-sm text-white/70 mb-2 block">Focus Area</label>
                  <div className="flex flex-wrap gap-2">
                    {FOCUS_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setFocusArea(opt)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          focusArea === opt
                            ? "bg-primary text-black"
                            : "bg-card text-white/60 border border-border"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mesocycle length */}
                <div>
                  <label className="text-sm text-white/70 mb-2 block">Mesocycle Length</label>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((weeks) => (
                      <button
                        key={weeks}
                        onClick={() => setMesocycleWeeks(weeks)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          mesocycleWeeks === weeks
                            ? "bg-primary text-black"
                            : "bg-card text-white/60 border border-border"
                        }`}
                      >
                        {weeks}w
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session length */}
                <div>
                  <label className="text-sm text-white/70 mb-2 block">Session Length</label>
                  <div className="flex gap-2">
                    {SESSION_OPTIONS.map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setSessionMinutes(mins)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          sessionMinutes === mins
                            ? "bg-primary text-black"
                            : "bg-card text-white/60 border border-border"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate button */}
              <Button
                className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-bold text-lg"
                onClick={handleGenerate}
                disabled={!navigator.onLine}
              >
                {!navigator.onLine ? (
                  <>
                    <WifiOff className="w-5 h-5 mr-2" />
                    Requires Internet
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate My Program
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Generating */}
          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GenerationLoading />
            </motion.div>
          )}

          {/* Step 3: Preview */}
          {step === "preview" && generatedProgram && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <ProgramPreviewCard program={generatedProgram} exercises={exercises} />

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 border-border"
                  onClick={handleGenerate}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 text-black font-bold"
                  onClick={handleSaveProgram}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Start This Program
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <span className="text-3xl">!</span>
              </div>
              <p className="text-lg text-white mb-2">Generation Failed</p>
              <p className="text-sm text-white/50 mb-6 max-w-xs">{error}</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("profile")}
                  className="border-border"
                >
                  Back to Settings
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-black"
                  onClick={handleGenerate}
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-white/40">{label}</span>
      <span className="text-sm text-white/80">{value}</span>
    </div>
  );
}
