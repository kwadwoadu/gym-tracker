"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Droplets } from "lucide-react";
import db, { generateId, getToday } from "@/lib/db";
import type { HydrationLog } from "@/lib/db";

const DEFAULT_TARGET = 8;

export function HydrationTracker() {
  const [glasses, setGlasses] = useState(0);
  const [target] = useState(DEFAULT_TARGET);

  // Load today's hydration log
  useEffect(() => {
    const today = getToday();
    db.hydrationLogs
      .where("date")
      .equals(today)
      .first()
      .then((existing: HydrationLog | undefined) => {
        if (existing) setGlasses(existing.glasses);
      });
  }, []);

  const handleTap = async (index: number) => {
    const newGlasses = index + 1 === glasses ? index : index + 1;
    setGlasses(newGlasses);

    const today = getToday();
    const existing = await db.hydrationLogs
      .where("date")
      .equals(today)
      .first();

    if (existing) {
      await db.hydrationLogs.update(existing.id, {
        glasses: newGlasses,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await db.hydrationLogs.add({
        id: generateId(),
        date: today,
        glasses: newGlasses,
        target,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const isComplete = glasses >= target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
        Hydration
      </h4>
      <Card
        className={`bg-[#1A1A1A] border-[#2A2A2A] p-5 ${
          isComplete ? "border-[#38BDF8]/30" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets
              className={`w-4 h-4 ${
                isComplete ? "text-[#38BDF8]" : "text-white/40"
              }`}
            />
            <span className="text-sm text-white/60">
              {glasses}/{target} glasses
            </span>
          </div>
          {isComplete && (
            <span className="text-xs text-[#38BDF8] font-medium">
              Goal reached!
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {Array.from({ length: target }).map((_, i) => {
            const filled = i < glasses;
            return (
              <motion.button
                key={i}
                onClick={() => handleTap(i)}
                whileTap={{ scale: 0.85 }}
                className="flex-1 min-h-[44px] flex items-center justify-center"
              >
                <motion.div
                  animate={{
                    scale: filled ? 1 : 0.8,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Droplets
                    className={`w-6 h-6 transition-colors ${
                      filled ? "text-[#38BDF8]" : "text-[#2A2A2A]"
                    }`}
                    fill={filled ? "#38BDF8" : "none"}
                  />
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
