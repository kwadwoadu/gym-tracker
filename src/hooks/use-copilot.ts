"use client";

import { useState, useCallback, useRef } from "react";
import { analyzeSetPerformance, detectPlateau, type CopilotSuggestion } from "@/lib/ai/copilot-rules";

interface UseCopilotOptions {
  enabled?: boolean;
}

interface SetData {
  weight: number;
  actualReps: number;
  rpe?: number;
  restSeconds?: number;
}

export function useCopilot({ enabled = true }: UseCopilotOptions = {}) {
  const [currentSuggestion, setCurrentSuggestion] = useState<CopilotSuggestion | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const tier2FetchedRef = useRef<Set<string>>(new Set());

  const analyzeSet = useCallback(
    (
      exerciseName: string,
      completedSets: SetData[],
      targetReps: number,
      targetSets: number,
      lastSessionWeight?: number
    ) => {
      if (!enabled) return;

      const suggestions = analyzeSetPerformance(
        exerciseName,
        completedSets,
        targetReps,
        targetSets,
        lastSessionWeight
      );

      const filtered = suggestions.filter((s) => !dismissedIds.has(s.type));
      if (filtered.length > 0) {
        setCurrentSuggestion(filtered[0]);
      }
    },
    [enabled, dismissedIds]
  );

  // Tier 2: AI analysis during rest timer (called once per exercise per session)
  const analyzeWithAI = useCallback(
    async (
      exerciseId: string,
      exerciseName: string,
      sessionHistory: Array<{ date: string; weight: number; reps: number; sets: number }>,
      isCompound: boolean
    ) => {
      if (!enabled || dismissedIds.has("plateau")) return;
      if (tier2FetchedRef.current.has(exerciseId)) return;
      tier2FetchedRef.current.add(exerciseId);

      // Check plateau detection locally first
      const plateauResult = detectPlateau(exerciseId, sessionHistory, isCompound);
      if (plateauResult?.isPlateau) {
        const suggestion: CopilotSuggestion = {
          id: `plateau-${exerciseId}-${Date.now()}`,
          type: "plateau",
          title: `Plateau on ${exerciseName}`,
          message: `Same weight/reps for ${plateauResult.weeks} sessions. ${plateauResult.suggestion}`,
          priority: 2,
          timestamp: Date.now(),
        };
        if (!dismissedIds.has("plateau")) {
          setCurrentSuggestion(suggestion);
        }
      }
    },
    [enabled, dismissedIds]
  );

  const dismiss = useCallback(() => {
    if (currentSuggestion) {
      setDismissedIds((prev) => new Set(prev).add(currentSuggestion.type));
      setCurrentSuggestion(null);
    }
  }, [currentSuggestion]);

  const clear = useCallback(() => {
    setCurrentSuggestion(null);
  }, []);

  return {
    suggestion: currentSuggestion,
    analyzeSet,
    analyzeWithAI,
    dismiss,
    clear,
    isEnabled: enabled,
  };
}
