"use client";

import { useState, useCallback } from "react";
import { analyzeSetPerformance, type CopilotSuggestion } from "@/lib/ai/copilot-rules";

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
    dismiss,
    clear,
    isEnabled: enabled,
  };
}
