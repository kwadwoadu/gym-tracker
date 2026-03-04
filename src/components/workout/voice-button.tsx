"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  isAvailable: boolean;
  onPress: () => void;
  onRelease: () => void;
  className?: string;
}

export function VoiceButton({
  isListening,
  isProcessing,
  isAvailable,
  onPress,
  onRelease,
  className,
}: VoiceButtonProps) {
  if (!isAvailable) return null;

  return (
    <motion.button
      className={cn(
        "relative w-12 h-12 rounded-full flex items-center justify-center touch-target transition-colors",
        isListening
          ? "bg-red-500 text-white"
          : isProcessing
            ? "bg-[#2A2A2A] text-white/50"
            : "bg-[#CDFF00] text-black",
        className
      )}
      onTouchStart={onPress}
      onTouchEnd={onRelease}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      whileTap={{ scale: 0.9 }}
      disabled={isProcessing}
    >
      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="listening"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <MicOff className="w-5 h-5" />
          </motion.div>
        ) : isProcessing ? (
          <motion.div
            key="processing"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Loader2 className="w-5 h-5 animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Mic className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing ring when listening */}
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
