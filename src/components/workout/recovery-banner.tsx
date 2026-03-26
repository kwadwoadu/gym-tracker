"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import db, { getToday } from "@/lib/db";
import type { RecoveryAssessment } from "@/lib/db";
import { getRecoveryAdjustment } from "@/lib/ai/recovery-adjuster";

interface RecoveryBannerProps {
  onDismiss?: () => void;
  onAdjust?: () => void;
}

const SCORE_EMOJIS: Record<number, string> = {
  1: "Exhausted",
  2: "Tired",
  3: "Moderate",
  4: "Good",
  5: "Great",
};

/**
 * Pre-session recovery banner shown before starting a workout.
 * Reads today's RecoveryAssessment from IndexedDB and displays
 * color-coded recovery level with adjustment recommendations.
 */
export function RecoveryBanner({ onDismiss, onAdjust }: RecoveryBannerProps) {
  const [score, setScore] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const today = getToday();
    db.recoveryAssessments
      .where("date")
      .equals(today)
      .first()
      .then((assessment: RecoveryAssessment | undefined) => {
        if (assessment) {
          setScore(assessment.score);
        }
      });
  }, []);

  // No assessment for today - don't show banner
  if (score === null || dismissed) return null;

  const adjustment = getRecoveryAdjustment(score);
  const isLowRecovery = score <= 2;
  const isHighRecovery = score >= 4;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const Icon = isLowRecovery ? AlertTriangle : isHighRecovery ? Zap : Shield;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Card className="relative bg-card border-border overflow-hidden">
            {/* Color accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: adjustment.color }}
            />

            <div className="p-4 pt-5">
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Recovery circle */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${adjustment.color}20`,
                      border: `2px solid ${adjustment.color}`,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: adjustment.color }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {adjustment.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Feeling: {SCORE_EMOJIS[score] || "Unknown"} ({score}/5)
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Dismiss recovery banner"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Recommendation text */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {adjustment.recommendation}
              </p>

              {/* Action buttons for low recovery */}
              {isLowRecovery && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={onAdjust}
                    className="flex-1 h-10 bg-primary text-black font-medium hover:bg-primary/90"
                  >
                    Adjust Workout
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="flex-1 h-10 text-muted-foreground hover:text-white"
                  >
                    Train as Planned
                  </Button>
                </div>
              )}

              {/* Encouragement for high recovery */}
              {isHighRecovery && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: `${adjustment.color}10` }}
                >
                  <Zap className="w-4 h-4" style={{ color: adjustment.color }} />
                  <p className="text-xs font-medium" style={{ color: adjustment.color }}>
                    Push for PRs today
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
