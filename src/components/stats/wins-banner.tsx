"use client";

import { Trophy, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { PersonalRecord } from "@/lib/api-client";

interface WinsBannerProps {
  personalRecords: PersonalRecord[];
  periodLabel: string;
}

export function WinsBanner({ personalRecords, periodLabel }: WinsBannerProps) {
  if (personalRecords.length === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-[#1A1A1A] to-[#141414] border-[#CDFF00]/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#CDFF00]" />
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-[0.08em]">
          Wins this {periodLabel}
        </h3>
      </div>
      <div className="space-y-2">
        {personalRecords.slice(0, 5).map((pr) => (
          <div
            key={pr.id}
            className="flex items-center gap-3 py-1.5"
          >
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Trophy className="w-3 h-3 text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{pr.exerciseName}</p>
            </div>
            <p className="text-sm font-bold text-[#CDFF00]">
              {pr.weight}kg x {pr.reps}
            </p>
          </div>
        ))}
        {personalRecords.length > 5 && (
          <p className="text-xs text-white/40 text-center pt-1">
            +{personalRecords.length - 5} more
          </p>
        )}
      </div>
    </Card>
  );
}
