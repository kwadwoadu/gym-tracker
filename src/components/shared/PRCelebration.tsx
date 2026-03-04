"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { SPRING_BOUNCY } from "@/lib/animations";
import { vibrateCelebration } from "@/lib/haptics";

interface PRCelebrationProps {
  show: boolean;
  exerciseName?: string;
  weight?: number;
  reps?: number;
  onComplete?: () => void;
}

export function PRCelebration({ show, exerciseName, weight, reps, onComplete }: PRCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      vibrateCelebration();
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Gold radial burst */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at center, rgba(255,215,0,0.15), transparent 70%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2, opacity: [0.8, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Content */}
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={SPRING_BOUNCY}
          >
            {/* Trophy icon */}
            <motion.div
              className="w-20 h-20 rounded-full bg-[#FFD700]/20 flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(255,215,0,0.3)",
                  "0 0 40px rgba(255,215,0,0.5)",
                  "0 0 20px rgba(255,215,0,0.3)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Trophy className="w-10 h-10 text-[#FFD700]" />
            </motion.div>

            {/* Text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xl font-bold text-[#FFD700]">NEW PR!</p>
              {exerciseName && (
                <p className="text-sm text-white/80 mt-1">{exerciseName}</p>
              )}
              {weight !== undefined && reps !== undefined && (
                <p className="text-lg font-semibold text-white mt-1">
                  {weight}kg x {reps}
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.1), transparent)",
              backgroundSize: "200% 100%",
            }}
            animate={{ backgroundPosition: ["-200% 0", "200% 0"] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
