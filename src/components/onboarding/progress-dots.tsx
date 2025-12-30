"use client";

import { motion } from "framer-motion";

interface ProgressDotsProps {
  current: number;
  total: number;
}

export function ProgressDots({ current, total }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{
            width: index === current ? 24 : 8,
            backgroundColor: index === current ? "#CDFF00" : "rgba(255,255,255,0.2)",
          }}
          transition={{ duration: 0.2 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}
