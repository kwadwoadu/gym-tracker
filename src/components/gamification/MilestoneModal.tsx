"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEVEL_TIERS } from "@/lib/gamification";

interface MilestoneModalProps {
  open: boolean;
  onClose: () => void;
  milestoneType: "levelUp" | "streak" | "achievement";
  data: {
    level?: number;
    title?: string;
    streakDays?: number;
    achievementName?: string;
    achievementIcon?: string;
  };
}

export function MilestoneModal({
  open,
  onClose,
  milestoneType,
  data,
}: MilestoneModalProps) {
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; color: string; delay: number; rotation: number; size: number; duration: number }>
  >([]);

  // Generate confetti particles when modal opens
  useEffect(() => {
    if (open) {
      const particles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage
        color: ["#CDFF00", "#22C55E", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444"][
          Math.floor(Math.random() * 6)
        ],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        size: 8 + Math.random() * 8,
        duration: 2 + Math.random(), // Pre-compute random duration
      }));
      setConfetti(particles);
    } else {
      setConfetti([]);
    }
  }, [open]);

  // Get tier info for level up
  const getTierInfo = useCallback(() => {
    if (!data.level) return LEVEL_TIERS[0];
    return (
      LEVEL_TIERS.find(
        (t) => data.level! >= t.minLevel && data.level! <= t.maxLevel
      ) || LEVEL_TIERS[0]
    );
  }, [data.level]);

  const tierInfo = getTierInfo();

  const getTierIcon = useCallback(() => {
    switch (tierInfo.title) {
      case "Novice":
        return "🌱";
      case "Regular":
        return "💪";
      case "Dedicated":
        return "🔥";
      case "Committed":
        return "⚡";
      case "Elite":
        return "👑";
      case "Legend":
        return "🌟";
      default:
        return "🎯";
    }
  }, [tierInfo.title]);

  const renderContent = () => {
    switch (milestoneType) {
      case "levelUp":
        return (
          <>
            <motion.span
              className="text-6xl mb-4 block"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              {getTierIcon()}
            </motion.span>
            <motion.p
              className="text-muted-foreground text-lg mb-2 uppercase tracking-wider"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Level Up!
            </motion.p>
            <motion.p
              className="text-5xl font-bold mb-2"
              style={{ color: tierInfo.color }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
            >
              Level {data.level}
            </motion.p>
            <motion.p
              className="text-xl"
              style={{ color: tierInfo.color, opacity: 0.8 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.5 }}
            >
              {data.title}
            </motion.p>
          </>
        );

      case "streak":
        return (
          <>
            <motion.span
              className="text-6xl mb-4 block"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              🔥
            </motion.span>
            <motion.p
              className="text-muted-foreground text-lg mb-2 uppercase tracking-wider"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Streak Milestone!
            </motion.p>
            <motion.p
              className="text-5xl font-bold text-primary mb-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
            >
              {data.streakDays} Days
            </motion.p>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Keep the momentum going!
            </motion.p>
          </>
        );

      case "achievement":
        return (
          <>
            <motion.span
              className="text-6xl mb-4 block"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              {data.achievementIcon || "🏆"}
            </motion.span>
            <motion.p
              className="text-muted-foreground text-lg mb-2 uppercase tracking-wider"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Achievement Unlocked!
            </motion.p>
            <motion.p
              className="text-3xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
            >
              {data.achievementName}
            </motion.p>
          </>
        );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute"
                style={{
                  left: `${particle.x}%`,
                  top: -20,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  borderRadius: particle.size / 4,
                }}
                initial={{ y: -20, rotate: 0, opacity: 1 }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: particle.rotation + 720,
                  opacity: 0,
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            className="relative bg-card border border-border rounded-3xl p-8 mx-4 text-center max-w-sm w-full shadow-2xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sparkle decorations */}
            <motion.div
              className="absolute -top-2 -left-2"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>

            {renderContent()}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onClose}
                size="lg"
                className="mt-8 px-8"
              >
                Awesome!
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to use milestone modal
export function useMilestoneModal() {
  const [modalState, setModalState] = useState<{
    open: boolean;
    type: "levelUp" | "streak" | "achievement";
    data: MilestoneModalProps["data"];
  }>({
    open: false,
    type: "levelUp",
    data: {},
  });

  const showLevelUp = useCallback((level: number, title: string) => {
    setModalState({
      open: true,
      type: "levelUp",
      data: { level, title },
    });
  }, []);

  const showStreakMilestone = useCallback((days: number) => {
    setModalState({
      open: true,
      type: "streak",
      data: { streakDays: days },
    });
  }, []);

  const showAchievement = useCallback((name: string, icon: string) => {
    setModalState({
      open: true,
      type: "achievement",
      data: { achievementName: name, achievementIcon: icon },
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, open: false }));
  }, []);

  const MilestoneModalComponent = useCallback(
    () => (
      <MilestoneModal
        open={modalState.open}
        onClose={hideModal}
        milestoneType={modalState.type}
        data={modalState.data}
      />
    ),
    [modalState, hideModal]
  );

  return {
    modalState,
    showLevelUp,
    showStreakMilestone,
    showAchievement,
    hideModal,
    MilestoneModalComponent,
  };
}
