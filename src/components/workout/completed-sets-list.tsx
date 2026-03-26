"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SetLog } from "@/lib/api-client";

interface CompletedSetsListProps {
  sets: SetLog[];
  onEditSet: (set: SetLog) => void;
}

export function CompletedSetsList({ sets, onEditSet }: CompletedSetsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (sets.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span className="text-sm font-medium text-muted-foreground">
          Completed Sets ({sets.length})
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-1">
              {sets.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => onEditSet(set)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5 rounded-lg",
                    "bg-[#111111] hover:bg-[#1A1A1A] transition-colors",
                    "border-b border-[#2A2A2A] last:border-b-0",
                    "min-h-[48px]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="text-xs font-mono px-1.5 py-0.5 border-muted-foreground/30"
                    >
                      S{set.setNumber}
                    </Badge>
                    <span className="text-sm text-foreground">
                      {set.exerciseName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground tabular-nums">
                      {set.weight}kg x {set.actualReps}
                    </span>
                    {set.rpe && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          set.rpe <= 7
                            ? "bg-green-500/20 text-green-500"
                            : set.rpe === 8
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-red-500/20 text-red-500"
                        )}
                      >
                        RPE {set.rpe}
                      </Badge>
                    )}
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
