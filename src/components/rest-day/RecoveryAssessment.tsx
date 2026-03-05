"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import db, { generateId, getToday } from "@/lib/db";
import type { RecoveryAssessment as RecoveryAssessmentType } from "@/lib/db";

const EMOJIS = [
  { score: 1, emoji: "😵", label: "Exhausted" },
  { score: 2, emoji: "😩", label: "Tired" },
  { score: 3, emoji: "😐", label: "Moderate" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😁", label: "Great" },
];

interface RecoveryAssessmentProps {
  onAssess?: (score: number) => void;
}

export function RecoveryAssessment({ onAssess }: RecoveryAssessmentProps) {
  const [selected, setSelected] = useState<number | null>(null);

  // Load today's assessment if exists
  useEffect(() => {
    const today = getToday();
    db.recoveryAssessments
      .where("date")
      .equals(today)
      .first()
      .then((existing: RecoveryAssessmentType | undefined) => {
        if (existing) setSelected(existing.score);
      });
  }, []);

  const handleSelect = async (score: number) => {
    setSelected(score);
    onAssess?.(score);

    const today = getToday();
    const existing = await db.recoveryAssessments
      .where("date")
      .equals(today)
      .first();

    if (existing) {
      await db.recoveryAssessments.update(existing.id, { score });
    } else {
      await db.recoveryAssessments.add({
        id: generateId(),
        date: today,
        score,
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-5">
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-[0.08em] mb-4">
        How are you feeling?
      </h3>
      <div className="flex items-center justify-between gap-1">
        {EMOJIS.map(({ score, emoji, label }) => (
          <motion.button
            key={score}
            onClick={() => handleSelect(score)}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1.5 flex-1 min-h-[52px]"
          >
            <motion.div
              animate={{
                scale: selected === score ? 1.2 : 1,
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                selected === score
                  ? "bg-[#38BDF8]/20 ring-2 ring-[#38BDF8]"
                  : "bg-[#2A2A2A]"
              }`}
            >
              {emoji}
            </motion.div>
            <span
              className={`text-[10px] ${
                selected === score ? "text-[#38BDF8]" : "text-white/30"
              }`}
            >
              {label}
            </span>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}
