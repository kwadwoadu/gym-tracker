"use client";

import { motion } from "framer-motion";

interface ProgressDotsProps {
  current: number;
  total: number;
}

export function ProgressDots({ current, total }: ProgressDotsProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, index) => {
          const isActive = index === current;
          const isCompleted = index < current;

          return (
            <motion.div
              key={index}
              initial={false}
              animate={{
                width: isActive ? 32 : 8,
                opacity: 1,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={`h-2 rounded-full ${
                isActive
                  ? "bg-primary"
                  : isCompleted
                    ? "bg-primary/50"
                    : "bg-secondary"
              }`}
            />
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground">
        Step {current + 1} of {total}
      </span>
    </div>
  );
}
