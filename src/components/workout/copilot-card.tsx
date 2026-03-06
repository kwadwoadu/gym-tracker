"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, ChevronRight, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CopilotSuggestion, CopilotSuggestionType } from "@/lib/ai/copilot-rules";

interface CopilotCardProps {
  suggestion: CopilotSuggestion;
  onApply?: (value: number | string) => void;
  onDismiss: () => void;
}

const TYPE_CONFIG: Record<CopilotSuggestionType, { icon: typeof Brain; color: string; borderColor: string }> = {
  weight: { icon: TrendingUp, color: "text-primary", borderColor: "border-l-primary" },
  rest: { icon: Brain, color: "text-blue-400", borderColor: "border-l-blue-400" },
  fatigue: { icon: AlertTriangle, color: "text-amber-400", borderColor: "border-l-amber-400" },
  quality: { icon: Sparkles, color: "text-[#00D4AA]", borderColor: "border-l-[#00D4AA]" },
  plateau: { icon: AlertTriangle, color: "text-orange-400", borderColor: "border-l-orange-400" },
  substitution: { icon: ChevronRight, color: "text-purple-400", borderColor: "border-l-purple-400" },
};

export function CopilotCard({ suggestion, onApply, onDismiss }: CopilotCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = TYPE_CONFIG[suggestion.type];
  const Icon = config.icon;

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(onDismiss, 200);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Card className={`bg-card border-border border-l-4 ${config.borderColor} p-4`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-white/50 uppercase tracking-[0.08em]">
                    Copilot
                  </p>
                  <button
                    onClick={handleDismiss}
                    className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/60"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm font-medium text-white mt-1">{suggestion.title}</p>
                <p className="text-xs text-white/50 mt-0.5 leading-snug">{suggestion.message}</p>
                {suggestion.action && onApply && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-primary text-black hover:bg-primary/80"
                      onClick={() => onApply(suggestion.action!.value)}
                    >
                      {suggestion.action.label}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-white/40"
                      onClick={handleDismiss}
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
    </AnimatePresence>
  );
}
