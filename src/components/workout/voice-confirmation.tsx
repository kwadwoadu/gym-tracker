"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParsedSetData } from "@/lib/ai/voice-parser";

interface VoiceConfirmationProps {
  data: ParsedSetData;
  onConfirm: () => void;
  onEdit: () => void;
  autoSaveSeconds?: number;
}

export function VoiceConfirmation({
  data,
  onConfirm,
  onEdit,
  autoSaveSeconds = 3,
}: VoiceConfirmationProps) {
  const [countdown, setCountdown] = useState(autoSaveSeconds);

  useEffect(() => {
    if (countdown <= 0) {
      onConfirm();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onConfirm]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-card border border-primary/20 rounded-xl p-4 shadow-[var(--shadow-hero)]"
      >
        <p className="text-xs text-primary font-medium uppercase tracking-[0.08em] mb-2">
          Voice Logged
        </p>
        <div className="flex items-center gap-3 text-white">
          {data.weight !== null && (
            <span className="text-lg font-bold tabular-nums">{data.weight}kg</span>
          )}
          {data.reps !== null && (
            <>
              <span className="text-white/30">x</span>
              <span className="text-lg font-bold tabular-nums">{data.reps} reps</span>
            </>
          )}
          {data.rpe !== null && (
            <>
              <span className="text-white/30">@</span>
              <span className="text-sm text-white/60">RPE {data.rpe}</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 text-xs bg-primary text-black hover:bg-primary/80"
              onClick={onConfirm}
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-white/50"
              onClick={onEdit}
            >
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
          </div>
          <span className="text-xs text-white/30">{countdown}s</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
