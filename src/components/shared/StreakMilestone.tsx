"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Crown } from "lucide-react";
import { SPRING_BOUNCY } from "@/lib/animations";
import { vibrateMilestone } from "@/lib/haptics";

interface StreakMilestoneProps {
  streakDays: number;
  show: boolean;
  onComplete?: () => void;
}

const MILESTONES = [
  { days: 7, icon: Flame, color: "#F97316", label: "1 Week Streak!", bg: "rgba(249,115,22,0.15)" },
  { days: 14, icon: Flame, color: "#F97316", label: "2 Week Streak!", bg: "rgba(249,115,22,0.15)" },
  { days: 30, icon: Zap, color: "#3B82F6", label: "30 Day Streak!", bg: "rgba(59,130,246,0.15)" },
  { days: 60, icon: Zap, color: "#8B5CF6", label: "60 Day Streak!", bg: "rgba(139,92,246,0.15)" },
  { days: 100, icon: Crown, color: "#EAB308", label: "100 Day Streak!", bg: "rgba(234,179,8,0.15)" },
];

export function StreakMilestone({ streakDays, show, onComplete }: StreakMilestoneProps) {
  const [visible, setVisible] = useState(false);

  const milestone = MILESTONES.find((m) => m.days === streakDays);

  useEffect(() => {
    if (show && milestone) {
      setVisible(true);
      vibrateMilestone();
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, milestone, onComplete]);

  if (!milestone) return null;
  const Icon = milestone.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${milestone.bg}, transparent 70%)`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 2 }}
            transition={{ duration: 1 }}
          />

          {/* Content */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={SPRING_BOUNCY}
          >
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: milestone.bg }}
              animate={{
                boxShadow: [
                  `0 0 20px ${milestone.color}40`,
                  `0 0 50px ${milestone.color}60`,
                  `0 0 20px ${milestone.color}40`,
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Icon className="w-12 h-12" style={{ color: milestone.color }} />
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-2xl font-bold" style={{ color: milestone.color }}>
                {milestone.label}
              </p>
              <p className="text-sm text-white/70 mt-1">
                {streakDays} consecutive days of training
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
