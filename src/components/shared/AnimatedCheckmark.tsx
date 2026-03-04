"use client";

import { motion } from "framer-motion";
import { SPRING_BOUNCY } from "@/lib/animations";

interface AnimatedCheckmarkProps {
  size?: number;
  color?: string;
}

export function AnimatedCheckmark({ size = 24, color = "#22C55E" }: AnimatedCheckmarkProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={SPRING_BOUNCY}
    >
      {/* Circle background */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill={`${color}20`}
        stroke={color}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      {/* Checkmark path */}
      <motion.path
        d="M8 12.5L10.5 15L16 9.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
