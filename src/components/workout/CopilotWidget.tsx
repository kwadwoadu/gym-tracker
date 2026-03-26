"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ChevronUp,
  ChevronDown,
  X,
  TrendingUp,
  AlertTriangle,
  Dumbbell,
  MessageCircle,
  Send,
  Loader2,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  detectPlateau,
  buildSessionSummaries,
  type PlateauResult,
} from "@/lib/ai/plateau-detector";
import {
  recommendWeight,
  buildPerformanceHistory,
  type WeightRecommendation,
} from "@/lib/ai/weight-recommender";
import type { SetLog, WorkoutLog, Exercise } from "@/lib/api-client";

// --- Types ---

interface CopilotWidgetProps {
  /** Currently active exercise ID */
  currentExerciseId: string | null;
  /** Currently active exercise name */
  currentExerciseName: string | null;
  /** Is this a compound exercise */
  isCompound?: boolean;
  /** All completed sets in this session */
  completedSets: SetLog[];
  /** Recent workout history (completed logs) */
  workoutHistory: WorkoutLog[];
  /** Callback when user accepts a weight suggestion */
  onApplyWeight?: (weight: number) => void;
  /** All exercises for lookup */
  exercises: Map<string, Exercise>;
}

interface WidgetTip {
  id: string;
  type: "plateau" | "weight" | "context";
  title: string;
  message: string;
  actionLabel?: string;
  actionValue?: number;
  priority: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// --- Component ---

export function CopilotWidget({
  currentExerciseId,
  currentExerciseName,
  isCompound = true,
  completedSets,
  workoutHistory,
  onApplyWeight,
  exercises,
}: CopilotWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatMessagesRef = useRef(chatMessages);
  useEffect(() => { chatMessagesRef.current = chatMessages; }, [chatMessages]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  // Reset dismissed tips when exercise changes
  useEffect(() => {
    setDismissed(new Set());
  }, [currentExerciseId]);

  // --- Shared reshaped history (avoids double-mapping workoutHistory) ---
  const reshapedHistory = useMemo(() => {
    return workoutHistory.map((log) => ({
      date: log.date,
      sets: log.sets.map((s) => ({
        exerciseId: s.exerciseId,
        weight: s.weight,
        actualReps: s.actualReps,
        reps: s.actualReps,
        targetReps: s.targetReps,
        rpe: s.rpe,
      })),
    }));
  }, [workoutHistory]);

  // --- Plateau Detection ---
  const plateauResult = useMemo((): PlateauResult | null => {
    if (!currentExerciseId || reshapedHistory.length < 3) return null;

    const sessions = buildSessionSummaries(
      reshapedHistory,
      currentExerciseId
    );

    return detectPlateau(sessions, isCompound);
  }, [currentExerciseId, reshapedHistory, isCompound]);

  // --- Weight Recommendation ---
  const weightRec = useMemo((): WeightRecommendation | null => {
    if (!currentExerciseId || reshapedHistory.length === 0) return null;

    const history = buildPerformanceHistory(
      reshapedHistory,
      currentExerciseId
    );

    // Determine experience level based on workout count
    const level =
      workoutHistory.length > 50
        ? "advanced"
        : workoutHistory.length > 15
          ? "intermediate"
          : "beginner";

    return recommendWeight(history, level, isCompound);
  }, [currentExerciseId, reshapedHistory, workoutHistory.length, isCompound]);

  // --- Build Tips ---
  const tips = useMemo((): WidgetTip[] => {
    const result: WidgetTip[] = [];

    // Plateau tip
    if (plateauResult && plateauResult.isPlateau) {
      const topSuggestion = plateauResult.suggestions[0];
      result.push({
        id: `plateau-${currentExerciseId}`,
        type: "plateau",
        title: `Plateau: ${plateauResult.stalledSessions} sessions at ${plateauResult.weight}kg`,
        message: topSuggestion
          ? topSuggestion.description
          : `Same weight and reps for ${plateauResult.stalledSessions} sessions. Consider changing approach.`,
        priority: 1,
      });
    }

    // Weight recommendation tip
    if (
      weightRec &&
      weightRec.rule === "progressive_overload" &&
      weightRec.confidence >= 0.7
    ) {
      result.push({
        id: `weight-${currentExerciseId}`,
        type: "weight",
        title: "Suggest weight",
        message: weightRec.reason,
        actionLabel: `Use ${weightRec.recommendedWeight}kg`,
        actionValue: weightRec.recommendedWeight,
        priority: 2,
      });
    }

    // Context tip: if RPE is consistently low in current session
    if (currentExerciseId && completedSets.length >= 2) {
      const currentExSets = completedSets.filter(
        (s) => s.exerciseId === currentExerciseId
      );
      if (currentExSets.length >= 2) {
        const recentRPEs = currentExSets
          .slice(-3)
          .map((s) => s.rpe)
          .filter((r): r is number => r !== undefined);

        if (recentRPEs.length >= 2) {
          const avgRPE =
            recentRPEs.reduce((a, b) => a + b, 0) / recentRPEs.length;
          if (avgRPE <= 6) {
            result.push({
              id: `low-rpe-${currentExerciseId}`,
              type: "context",
              title: "Low effort detected",
              message: `RPE averaging ${avgRPE.toFixed(1)} this session. You could handle more weight.`,
              priority: 3,
            });
          }
        }
      }
    }

    // Filter dismissed
    return result
      .filter((tip) => !dismissed.has(tip.id))
      .sort((a, b) => a.priority - b.priority);
  }, [
    plateauResult,
    weightRec,
    currentExerciseId,
    completedSets,
    dismissed,
  ]);

  const activeTip = tips[0] ?? null;

  const handleDismiss = useCallback(
    (tipId: string) => {
      setDismissed((prev) => new Set(prev).add(tipId));
    },
    []
  );

  const handleApplyWeight = useCallback(
    (weight: number) => {
      onApplyWeight?.(weight);
      // Dismiss the tip after applying
      if (activeTip) {
        handleDismiss(activeTip.id);
      }
    },
    [onApplyWeight, activeTip, handleDismiss]
  );

  // --- Chat (expanded mode) ---
  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || chatSending) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
      };
      setChatMessages((prev) => [...prev, userMsg]);
      setChatInput("");
      setChatSending(true);

      try {
        const res = await fetch("/api/ai/trainer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history: chatMessagesRef.current.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) throw new Error("Failed");
        const { data } = await res.json();

        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: data.message,
          },
        ]);
      } catch {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Could not connect to Coach. Check your connection.",
          },
        ]);
      } finally {
        setChatSending(false);
      }
    },
    [chatSending]
  );

  // Nothing to show
  if (!currentExerciseId || (!activeTip && !expanded)) {
    return null;
  }

  const tipIcon = (type: WidgetTip["type"]) => {
    switch (type) {
      case "plateau":
        return <AlertTriangle className="w-4 h-4" />;
      case "weight":
        return <TrendingUp className="w-4 h-4" />;
      case "context":
        return <Brain className="w-4 h-4" />;
    }
  };

  const tipColor = (type: WidgetTip["type"]) => {
    switch (type) {
      case "plateau":
        return {
          border: "border-l-amber-400",
          icon: "text-amber-400",
          bg: "bg-amber-400/5",
        };
      case "weight":
        return {
          border: "border-l-primary",
          icon: "text-primary",
          bg: "bg-primary/5",
        };
      case "context":
        return {
          border: "border-l-blue-400",
          icon: "text-blue-400",
          bg: "bg-blue-400/5",
        };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-20 left-3 right-3 z-30"
      >
        {/* Collapsed: Floating tip card */}
        {!expanded && activeTip && (
          <motion.div
            key={activeTip.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card
              className={`${tipColor(activeTip.type).bg} border-border border-l-4 ${tipColor(activeTip.type).border} p-3 shadow-lg`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 ${tipColor(activeTip.type).icon}`}
                >
                  {tipIcon(activeTip.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.08em]">
                      Copilot
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpanded(true)}
                        className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white/60"
                        aria-label="Expand copilot"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDismiss(activeTip.id)}
                        className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white/60"
                        aria-label="Dismiss tip"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-white mt-0.5">
                    {activeTip.title}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5 leading-snug line-clamp-2">
                    {activeTip.message}
                  </p>

                  {/* Action button */}
                  {activeTip.actionLabel && activeTip.actionValue && (
                    <div className="flex items-center gap-2 mt-2.5">
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-primary text-black hover:bg-primary/80"
                        onClick={() =>
                          handleApplyWeight(activeTip.actionValue!)
                        }
                      >
                        <Dumbbell className="w-3 h-3 mr-1" />
                        {activeTip.actionLabel}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-white/40"
                        onClick={() => handleDismiss(activeTip.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Expanded: Full chat view */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            <Card className="bg-card border-border shadow-2xl max-h-[60vh] flex flex-col overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      AI Coach
                    </p>
                    {currentExerciseName && (
                      <p className="text-[10px] text-white/40">
                        {currentExerciseName}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white/60"
                  aria-label="Collapse copilot"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[120px] max-h-[40vh]">
                {/* Show active tips as system messages */}
                {tips.map((tip) => (
                  <div
                    key={tip.id}
                    className={`rounded-xl px-3 py-2 border-l-2 ${tipColor(tip.type).border} ${tipColor(tip.type).bg}`}
                  >
                    <p className="text-xs font-medium text-white/70">
                      {tip.title}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {tip.message}
                    </p>
                    {tip.actionLabel && tip.actionValue && (
                      <Button
                        size="sm"
                        className="h-7 text-[11px] mt-2 bg-primary text-black hover:bg-primary/80"
                        onClick={() => handleApplyWeight(tip.actionValue!)}
                      >
                        {tip.actionLabel}
                      </Button>
                    )}
                  </div>
                ))}

                {/* Plateau suggestions (expanded view) */}
                {plateauResult &&
                  plateauResult.suggestions.length > 1 && (
                    <div className="rounded-xl bg-amber-400/5 border border-amber-400/20 px-3 py-2">
                      <p className="text-xs font-medium text-amber-400 mb-1.5">
                        Plateau interventions
                      </p>
                      {plateauResult.suggestions.slice(0, 4).map((s, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 py-1.5 border-t border-white/5 first:border-0"
                        >
                          <span className="text-[10px] text-white/30 mt-0.5 shrink-0">
                            {i + 1}.
                          </span>
                          <div>
                            <p className="text-xs text-white/70 font-medium">
                              {s.title}
                            </p>
                            <p className="text-[11px] text-white/40">
                              {s.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Chat conversation */}
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                        msg.role === "user"
                          ? "bg-secondary text-sm text-white"
                          : "bg-card border border-border text-sm text-white/80"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {chatSending && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-2xl px-3 py-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                        <span
                          className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.15s" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.3s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div className="border-t border-border px-3 py-2.5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendChatMessage(chatInput);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this exercise..."
                    disabled={chatSending}
                    className="flex-1 h-9 bg-background border border-border rounded-full px-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-primary/50 disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    disabled={!chatInput.trim() || chatSending}
                    className="w-9 h-9 rounded-full bg-primary text-black hover:bg-primary/90 disabled:opacity-50 p-0"
                    size="sm"
                  >
                    {chatSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
