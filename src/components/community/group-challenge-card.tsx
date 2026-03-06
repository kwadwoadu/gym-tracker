"use client";

import { Users } from "lucide-react";

interface GroupChallengeCardProps {
  title: string;
  description: string;
  progress: number; // 0-100
  memberCount: number;
  gradient?: string;
}

export function GroupChallengeCard({
  title,
  description,
  progress,
  memberCount,
  gradient = "bg-gradient-to-r from-primary/20 to-gym-blue/20",
}: GroupChallengeCardProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`${gradient} rounded-xl p-4 border border-white/5`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
          <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{description}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-white/40">Progress</span>
          <span className="text-[11px] font-medium text-white/60 tabular-nums">
            {clampedProgress}%
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>

      {/* Member count */}
      <div className="flex items-center gap-1.5 text-white/40">
        <Users className="w-3.5 h-3.5" />
        <span className="text-xs">
          {memberCount} member{memberCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
