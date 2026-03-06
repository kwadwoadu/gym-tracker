"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Award, Users, Zap, UserPlus } from "lucide-react";

export interface ActivityItemData {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  action: string;
  type?: "workout_completed" | "pr_achieved" | "challenge_joined" | "badge_earned" | "group_joined";
  timestamp: string;
  data?: Record<string, unknown>;
}

interface ActivityFeedProps {
  activities: ActivityItemData[];
}

function ActivityIcon({ type }: { type?: string }) {
  switch (type) {
    case "workout_completed":
      return <Dumbbell className="w-4 h-4 text-primary" />;
    case "pr_achieved":
      return <Award className="w-4 h-4 text-gym-warning" />;
    case "challenge_joined":
      return <Zap className="w-4 h-4 text-gym-blue" />;
    case "group_joined":
      return <UserPlus className="w-4 h-4 text-gym-success" />;
    default:
      return <Users className="w-4 h-4 text-white/40" />;
  }
}

function RelativeTime({ timestamp }: { timestamp: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const label = useMemo(() => {
    if (!now) return "";
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  }, [now, timestamp]);

  return <span className="text-[11px] text-white/30 shrink-0">{label}</span>;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-8 h-8 text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/40">No activity yet</p>
        <p className="text-xs text-white/30 mt-1">
          Follow friends to see their workout activity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {activities.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="bg-card rounded-xl p-3"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                {item.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.avatarUrl}
                    alt={item.userName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <ActivityIcon type={item.type} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">
                  <span className="font-semibold text-white">{item.userName}</span>{" "}
                  <span className="text-white/60">{item.action}</span>
                </p>
                <RelativeTime timestamp={item.timestamp} />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
