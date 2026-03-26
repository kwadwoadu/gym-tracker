"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Loader2 } from "lucide-react";
import { PlanCard, StartScratchCard, AIGenerateCard } from "@/components/plan-selection";
import { Button } from "@/components/ui/button";
import { AIProgramWizard } from "@/components/program/ai-program-wizard";
import {
  getPresetPrograms,
  getRecommendedProgram,
  installPresetProgram,
  createEmptyProgram,
  type PresetProgram,
} from "@/lib/programs";
import { onboardingApi } from "@/lib/api-client";
import { queryKeys, usePrograms, useOnboardingProfile } from "@/lib/queries";

type Selection = { type: "preset"; id: string } | { type: "scratch" } | { type: "ai" };

export default function PlansPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [recommendedId, setRecommendedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programs] = useState<PresetProgram[]>(getPresetPrograms());
  const [showAIWizard, setShowAIWizard] = useState(false);

  // Route guard: if user already has programs and is "complete", redirect home
  const { data: userPrograms } = usePrograms();
  const { data: onboarding } = useOnboardingProfile();

  useEffect(() => {
    if (onboarding?.onboardingState === "complete" && userPrograms && userPrograms.length > 0) {
      router.replace("/");
    }
  }, [onboarding, userPrograms, router]);

  // Load onboarding profile to determine recommendation
  useEffect(() => {
    async function loadRecommendation() {
      const profile = await onboardingApi.get();
      if (profile) {
        const recommended = getRecommendedProgram(
          profile.experienceLevel as "beginner" | "intermediate" | "advanced" | null,
          profile.trainingDaysPerWeek
        );
        setRecommendedId(recommended.id);
        // Pre-select the recommended program
        setSelection({ type: "preset", id: recommended.id });
      } else {
        // Default to full body for new users without profile
        setRecommendedId("preset-full-body-3day");
        setSelection({ type: "preset", id: "preset-full-body-3day" });
      }
    }
    loadRecommendation();
  }, []);

  const handleSelectPreset = (id: string) => {
    setSelection({ type: "preset", id });
  };

  const handleSelectScratch = () => {
    setSelection({ type: "scratch" });
  };

  const handleAIProgramCreated = async () => {
    setShowAIWizard(false);
    // Invalidate caches so home page gets fresh data
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.programs }),
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding }),
    ]);
    router.replace("/");
  };

  const handleContinue = async () => {
    if (!selection) return;

    // AI selection opens the wizard overlay
    if (selection.type === "ai") {
      setShowAIWizard(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (selection.type === "preset") {
        await installPresetProgram(selection.id);
      } else {
        await createEmptyProgram();
      }
      // Invalidate caches so home page gets fresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.programs }),
        queryClient.invalidateQueries({ queryKey: queryKeys.onboarding }),
      ]);
    } catch (err) {
      console.error("Failed to install program:", err);
      setIsLoading(false);
      setError("Program install failed. Taking you home.");
    }
    // ALWAYS redirect home - empty state is better than being stuck
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <motion.h1
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Choose Your Plan
        </motion.h1>
        <motion.p
          className="text-white/60"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Select a training program to get started. You can change this anytime.
        </motion.p>
      </div>

      {/* Plan Cards */}
      <div className="flex-1 px-6 pb-32 overflow-y-auto">
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PlanCard
                  program={program}
                  isSelected={
                    selection?.type === "preset" && selection.id === program.id
                  }
                  isRecommended={program.id === recommendedId}
                  onSelect={() => handleSelectPreset(program.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-white/40">
                or
              </span>
            </div>
          </div>

          {/* AI Generate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AIGenerateCard
              isSelected={selection?.type === "ai"}
              onSelect={() => setSelection({ type: "ai" })}
            />
          </motion.div>

          {/* Start from Scratch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StartScratchCard
              isSelected={selection?.type === "scratch"}
              onSelect={handleSelectScratch}
            />
          </motion.div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-900/90 border border-red-700 text-white px-4 py-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          onClick={handleContinue}
          disabled={!selection || isLoading}
          className="w-full h-14 bg-primary text-black font-semibold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : selection?.type === "ai" ? (
            <>
              Generate with AI
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            <>
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* AI Program Wizard Overlay */}
      {showAIWizard && (
        <AIProgramWizard
          onClose={() => setShowAIWizard(false)}
          onProgramCreated={handleAIProgramCreated}
        />
      )}
    </div>
  );
}
