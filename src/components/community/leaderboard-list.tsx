"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { LeaderboardRow } from "./leaderboard-row";

export interface LeaderboardEntryData {
  userId: string;
  name: string;
  xp: number;
  avatarUrl: string;
}

interface LeaderboardListProps {
  entries: LeaderboardEntryData[];
  currentUserId: string;
}

export function LeaderboardList({ entries, currentUserId }: LeaderboardListProps) {
  return (
    <div className="space-y-3">
      <div className="px-1">
        <h3 className="text-xs uppercase tracking-[0.08em] text-white/40 font-semibold">
          Rankings
        </h3>
      </div>

      {/* List */}
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40">No leaderboard data yet</p>
          <p className="text-xs text-white/30 mt-1">
            Complete workouts to climb the ranks
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl overflow-hidden divide-y divide-white/5">
          <AnimatePresence initial={false}>
            {entries.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <LeaderboardRow
                  rank={index + 1}
                  name={entry.name}
                  xp={entry.xp}
                  avatarUrl={entry.avatarUrl}
                  isCurrentUser={entry.userId === currentUserId}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
