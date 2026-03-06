"use client";

import { cn } from "@/lib/utils";

interface LeaderboardRowProps {
  rank: number;
  name: string;
  xp: number;
  avatarUrl: string;
  isCurrentUser: boolean;
}

const RANK_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "bg-yellow-500/20", text: "text-yellow-500", label: "1st" },
  2: { bg: "bg-gray-400/20", text: "text-gray-400", label: "2nd" },
  3: { bg: "bg-orange-600/20", text: "text-orange-600", label: "3rd" },
};

export function LeaderboardRow({
  rank,
  name,
  xp,
  avatarUrl,
  isCurrentUser,
}: LeaderboardRowProps) {
  const rankStyle = RANK_STYLES[rank];

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors",
        isCurrentUser && "bg-primary/5 border border-primary/20 rounded-xl"
      )}
    >
      {/* Rank badge */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          rankStyle
            ? `${rankStyle.bg} ${rankStyle.text}`
            : "bg-white/10 text-white/60"
        )}
      >
        {rank}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white/40">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name */}
      <span
        className={cn(
          "flex-1 min-w-0 text-sm font-medium truncate",
          isCurrentUser ? "text-white" : "text-white/80"
        )}
      >
        {name}
        {isCurrentUser && (
          <span className="text-primary ml-1.5 text-xs font-normal">You</span>
        )}
      </span>

      {/* XP */}
      <span className="text-sm font-bold text-primary tabular-nums shrink-0">
        {xp.toLocaleString()} XP
      </span>
    </div>
  );
}
